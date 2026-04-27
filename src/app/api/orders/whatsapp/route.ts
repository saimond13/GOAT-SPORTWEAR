import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const itemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(200),
  price: z.number().positive(),
  quantity: z.number().int().min(1).max(99),
  size: z.string().max(20),
});

const schema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  shippingCost: z.number().min(0).default(0),
  transferDiscount: z.number().min(0).default(0),
  shipping: z.object({
    type: z.enum(["domicilio", "sucursal", ""]),
    recipientName: z.string().max(150).optional(),
    recipientPhone: z.string().max(30).optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    postalCode: z.string().max(8).optional(),
    province: z.string().max(50).optional(),
  }).optional(),
  paymentMode: z.enum(["mp", "transferencia"]).default("mp"),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { items, shippingCost, transferDiscount, shipping, paymentMode } = parsed.data;
  const supabase = createAdminClient();

  // Verify prices from DB
  const productIds = [...new Set(items.map((i) => i.id))];
  const { data: dbProducts, error: dbErr } = await supabase
    .from("products")
    .select("id, price, is_active")
    .in("id", productIds);

  if (dbErr || !dbProducts) {
    return NextResponse.json({ error: "Error al verificar productos" }, { status: 500 });
  }

  const verifiedItems: typeof items = [];
  for (const item of items) {
    const db = dbProducts.find((p) => p.id === item.id);
    if (!db || !db.is_active) {
      return NextResponse.json({ error: `Producto no disponible: ${item.name}` }, { status: 400 });
    }
    verifiedItems.push({ ...item, price: db.price });
  }

  const productsTotal = verifiedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = paymentMode === "transferencia" ? transferDiscount : 0;
  const total = productsTotal - discount + shippingCost;

  const customerName = shipping?.recipientName?.trim() || "Cliente web";
  const customerPhone = shipping?.recipientPhone?.trim() || null;
  const addressParts = [
    shipping?.address,
    shipping?.city,
    shipping?.province,
    shipping?.postalCode ? `CP ${shipping.postalCode}` : null,
  ].filter(Boolean);
  const customerAddress = addressParts.length ? addressParts.join(", ") : null;

  const shippingType = shipping?.type === "domicilio" ? "Envío a domicilio"
    : shipping?.type === "sucursal" ? "Retiro en sucursal" : null;

  const itemsSummary = verifiedItems.map((i) => `${i.name} T.${i.size} x${i.quantity}`).join(" | ");
  const notes = [
    shippingType,
    itemsSummary,
    discount > 0 ? `Descuento transferencia: -$${discount.toLocaleString("es-AR")}` : null,
    shippingCost > 0 ? `Envío: $${shippingCost.toLocaleString("es-AR")}` : null,
  ].filter(Boolean).join("\n");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      payment_method: paymentMode === "transferencia" ? "Transferencia" : "WhatsApp",
      payment_status: "unpaid",
      status: "pending_whatsapp",
      total,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("[whatsapp-order] Error guardando orden:", orderError?.message);
    return NextResponse.json({ error: "Error al registrar el pedido" }, { status: 500 });
  }

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

  return NextResponse.json({ orderId: order.id });
}
