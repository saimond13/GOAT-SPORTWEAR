import { NextResponse } from "next/server";
import { z } from "zod";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: z.string(),
});

const shippingSchema = z.object({
  type: z.enum(["domicilio", "sucursal", ""]),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  agencyId: z.string().optional(),
}).optional();

const schema = z.object({
  items: z.array(itemSchema).min(1),
  total: z.number().positive(),
  shipping: shippingSchema,
});

function getClient() {
  const isTest = process.env.NEXT_PUBLIC_MP_ENV === "test";
  const token = isTest
    ? process.env.MERCADOPAGO_ACCESS_TOKEN_TEST
    : process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return new MercadoPagoConfig({ accessToken: token });
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { items, total, shipping } = parsed.data;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goat.mileadflow.com";

  // 1. Guardar orden en Supabase
  const supabase = await createClient();

  const customerName = shipping?.recipientName || "Cliente web";
  const customerPhone = shipping?.recipientPhone || null;
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

  const itemsSummary = items
    .map((i) => `${i.name} T.${i.size} x${i.quantity}`)
    .join(" | ");

  const notes = [
    shippingType,
    itemsSummary,
    shipping?.agencyId ? `Sucursal ID: ${shipping.agencyId}` : null,
  ].filter(Boolean).join("\n");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      payment_method: "Mercado Pago",
      payment_status: "unpaid",
      status: "pending",
      total,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("[create-preference] Error guardando orden:", orderError);
    return NextResponse.json({ error: "Error al registrar el pedido" }, { status: 500 });
  }

  // 2. Guardar items de la orden
  if (items.length) {
    await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        size: i.size,
        quantity: i.quantity,
        unit_price: i.price,
        subtotal: i.price * i.quantity,
      }))
    );
  }

  // 3. Crear preferencia en Mercado Pago
  try {
    const client = getClient();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
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

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      orderId: order.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear preferencia";
    console.error("[create-preference] MP error:", message);
    // Borramos la orden si MP falló
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
