import { NextResponse } from "next/server";
import { z } from "zod";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  campaignId: z.string().uuid(),
  customerName: z.string().min(1).max(150),
  customerPhone: z.string().min(1).max(30),
  customerEmail: z.string().email().optional(),
  size: z.string().max(20).default("Único"),
  quantity: z.number().int().min(1).max(10),
  notes: z.string().max(500).optional(),
});

function getMPClient() {
  const env = process.env.MP_ENV ?? process.env.NEXT_PUBLIC_MP_ENV;
  const isTest = env === "test";
  const token = isTest
    ? process.env.MERCADOPAGO_ACCESS_TOKEN_TEST
    : process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return { client: new MercadoPagoConfig({ accessToken: token }), isTest };
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

  const { campaignId, customerName, customerPhone, customerEmail, size, quantity, notes } = parsed.data;

  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });

  const supabase = createAdminClient();

  // Fetch campaign to get pricing
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
  const totalAmount = unitPrice * quantity;
  const totalDeposit = depositAmount * quantity;

  if (unitPrice <= 0 || depositAmount <= 0) {
    return NextResponse.json({ error: "Precio del producto no configurado" }, { status: 400 });
  }

  // Save registration as pending
  const { data: registration, error: regErr } = await supabase
    .from("preventa_registrations")
    .insert({
      campaign_id: campaignId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail ?? null,
      size,
      quantity,
      deposit_amount: totalDeposit,
      total_amount: totalAmount,
      status: "pending",
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (regErr || !registration) {
    console.error("[preventa/reserve] DB error:", regErr?.message);
    return NextResponse.json({ error: "Error al registrar la reserva" }, { status: 500 });
  }

  // Create MP preference for the deposit amount
  try {
    const { client, isTest } = getMPClient();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [{
          id: campaignId,
          title: `Reserva — ${campaign.title} T.${size} x${quantity}`,
          quantity: 1,
          unit_price: totalDeposit,
          currency_id: "ARS",
        }],
        external_reference: registration.id,
        back_urls: {
          success: `${origin}/pago/preventa-exitoso`,
          failure: `${origin}/drop/${campaignId}`,
          pending: `${origin}/pago/preventa-exitoso`,
        },
        auto_return: "approved",
        statement_descriptor: "GOAT SPORTWEAR",
        expires: false,
      },
    });

    const checkoutUrl = (isTest ? result.sandbox_init_point : result.init_point)
      ?? result.init_point
      ?? result.sandbox_init_point;

    if (!checkoutUrl) {
      await supabase.from("preventa_registrations").delete().eq("id", registration.id);
      return NextResponse.json({ error: "Mercado Pago no devolvió un enlace de pago" }, { status: 502 });
    }

    // Store MP preference ID
    await supabase
      .from("preventa_registrations")
      .update({ mp_preference_id: result.id })
      .eq("id", registration.id);

    return NextResponse.json({ checkoutUrl, registrationId: registration.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear preferencia";
    console.error("[preventa/reserve] MP error:", message);
    await supabase.from("preventa_registrations").delete().eq("id", registration.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
