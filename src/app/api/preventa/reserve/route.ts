import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  campaignId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(150),
  customerPhone: z.string().min(1).max(30),
  customerEmail: z.string().email().optional(),
  size: z.string().max(20).default("Único"),
  quantity: z.number().int().min(1).max(10),
  notes: z.string().max(500).optional(),
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

  const { campaignId, productId, customerName, customerPhone, customerEmail, size, quantity, notes } = parsed.data;

  const supabase = createAdminClient();

  const { data: campaign, error: campErr } = await supabase
    .from("campaigns")
    .select("id, title, unit_price, deposit_percentage, is_preventa, preventa_closes_at, is_active")
    .eq("id", campaignId)
    .single();

  if (campErr || !campaign) {
    return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
  }
  if (!campaign.is_active) {
    return NextResponse.json({ error: "La campaña no está activa" }, { status: 400 });
  }
  if (!campaign.is_preventa) {
    return NextResponse.json({ error: "Esta campaña no tiene preventa activa" }, { status: 400 });
  }
  if (campaign.preventa_closes_at && new Date(campaign.preventa_closes_at) < new Date()) {
    return NextResponse.json({ error: "Las reservas para este drop ya cerraron" }, { status: 400 });
  }

  const unitPrice = campaign.unit_price ?? 0;
  const depositPct = campaign.deposit_percentage ?? 30;
  const depositAmount = Math.round(unitPrice * depositPct / 100);
  const totalDeposit = depositAmount * quantity;

  if (unitPrice <= 0 || depositAmount <= 0) {
    return NextResponse.json({ error: "Precio del producto no configurado" }, { status: 400 });
  }

  const { data: registration, error: regErr } = await supabase
    .from("preventa_registrations")
    .insert({
      campaign_id: campaignId,
      product_id: productId ?? null,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail ?? null,
      product_name: campaign.title,
      size,
      quantity,
      deposit_amount: totalDeposit,
      status: "pending",
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (regErr || !registration) {
    console.error("[preventa/reserve] DB error:", regErr?.message);
    return NextResponse.json({ error: "Error al registrar la reserva" }, { status: 500 });
  }

  return NextResponse.json({
    registrationId: registration.id,
    depositAmount: totalDeposit,
    campaignTitle: campaign.title,
  });
}
