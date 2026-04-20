import { NextResponse } from "next/server";
import { z } from "zod";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

// ── Rate limiting (simple in-memory, 5 requests / 60s per IP) ──────────────
const RL_WINDOW = 60_000;
const RL_MAX = 5;
const rlMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW });
    return false;
  }
  if (entry.count >= RL_MAX) return true;
  entry.count++;
  return false;
}

// ── Schemas ────────────────────────────────────────────────────────────────
const itemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(200),
  price: z.number().positive(),
  quantity: z.number().int().min(1).max(99),
  size: z.string().max(20),
});

const shippingSchema = z.object({
  type: z.enum(["domicilio", "sucursal", ""]),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(8).optional(),
  recipientName: z.string().max(150).optional(),
  recipientPhone: z.string().max(30).optional(),
  agencyId: z.string().max(50).optional(),
}).optional();

const schema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  total: z.number().positive(),
  shipping: shippingSchema,
});

function getMPClient() {
  // Use server-only MP_ENV (not exposed to client) — falls back to NEXT_PUBLIC_MP_ENV for compat
  const env = process.env.MP_ENV ?? process.env.NEXT_PUBLIC_MP_ENV;
  const isTest = env === "test";
  const token = isTest
    ? process.env.MERCADOPAGO_ACCESS_TOKEN_TEST
    : process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return { client: new MercadoPagoConfig({ accessToken: token }), isTest };
}

export async function POST(req: Request) {
  // Rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0]?.trim()) ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { items, shipping } = parsed.data;

  // Validate site URL — must be set or payment redirects will fail
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    console.error("[create-preference] NEXT_PUBLIC_SITE_URL no configurado");
    return NextResponse.json({ error: "Configuración del servidor incompleta" }, { status: 500 });
  }

  const supabase = await createClient();

  // ── Verify prices from database (prevents client-side price manipulation) ──
  const productIds = [...new Set(items.map((i) => i.id))];
  const { data: dbProducts, error: dbErr } = await supabase
    .from("products")
    .select("id, price, is_active")
    .in("id", productIds);

  if (dbErr || !dbProducts) {
    return NextResponse.json({ error: "Error al verificar productos" }, { status: 500 });
  }

  // Build verified items using DB prices (not client-provided prices)
  const verifiedItems: Array<{ id: string; name: string; price: number; quantity: number; size: string }> = [];
  for (const item of items) {
    const dbProduct = dbProducts.find((p) => p.id === item.id);
    if (!dbProduct) {
      return NextResponse.json({ error: `Producto no encontrado: ${item.id}` }, { status: 400 });
    }
    if (!dbProduct.is_active) {
      return NextResponse.json({ error: `Producto no disponible: ${item.name}` }, { status: 400 });
    }
    verifiedItems.push({ ...item, price: dbProduct.price });
  }

  const verifiedTotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Build order metadata ────────────────────────────────────────────────
  const customerName = shipping?.recipientName?.trim() || "Cliente web";
  const customerPhone = shipping?.recipientPhone?.trim() || null;
  const addressParts = [
    shipping?.address,
    shipping?.city,
    shipping?.postalCode ? `CP ${shipping.postalCode}` : null,
  ].filter(Boolean);
  const customerAddress = addressParts.length ? addressParts.join(", ") : null;

  const shippingType = shipping?.type === "domicilio"
    ? "Envío a domicilio"
    : shipping?.type === "sucursal"
    ? "Retiro en sucursal"
    : null;

  const itemsSummary = verifiedItems
    .map((i) => `${i.name} T.${i.size} x${i.quantity}`)
    .join(" | ");

  const notes = [
    shippingType,
    itemsSummary,
    shipping?.agencyId ? `Sucursal ID: ${shipping.agencyId}` : null,
  ].filter(Boolean).join("\n");

  // ── 1. Save order to Supabase ────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      payment_method: "Mercado Pago",
      payment_status: "unpaid",
      status: "pending",
      total: verifiedTotal,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("[create-preference] Error guardando orden:", orderError?.message);
    return NextResponse.json({ error: "Error al registrar el pedido" }, { status: 500 });
  }

  // ── 2. Save order items ──────────────────────────────────────────────────
  await supabase.from("order_items").insert(
    verifiedItems.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      size: i.size,
      quantity: i.quantity,
      unit_price: i.price,
      subtotal: i.price * i.quantity,
    }))
  );

  // ── 3. Create Mercado Pago preference ────────────────────────────────────
  try {
    const { client, isTest } = getMPClient();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: verifiedItems.map((item) => ({
          id: item.id,
          title: `${item.name} — Talle ${item.size}`,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "ARS",
        })),
        external_reference: order.id,
        back_urls: {
          success: `${origin}/pago/exitoso`,
          failure: `${origin}/pago/fallido`,
          pending: `${origin}/pago/pendiente`,
        },
        auto_return: "approved",
        statement_descriptor: "GOAT SPORTWEAR",
        expires: false,
      },
    });

    // init_point is for production, sandbox_init_point for test
    const checkoutUrl = (isTest ? result.sandbox_init_point : result.init_point)
      ?? result.init_point  // fallback to init_point in any case
      ?? result.sandbox_init_point; // last resort

    if (!checkoutUrl) {
      console.error("[create-preference] MP devolvió preferencia sin URL:", JSON.stringify({ id: result.id, init_point: result.init_point, sandbox: result.sandbox_init_point }));
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Mercado Pago no devolvió un enlace de pago. Intentá de nuevo." }, { status: 502 });
    }

    return NextResponse.json({
      preferenceId: result.id,
      checkoutUrl,
      orderId: order.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear preferencia";
    console.error("[create-preference] MP error:", message);
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
