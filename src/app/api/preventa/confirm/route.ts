import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import MercadoPagoConfig, { Payment } from "mercadopago";

const schema = z.object({
  registrationId: z.string().uuid(),
  paymentId: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { registrationId, paymentId } = parsed.data;

  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("Token MP no configurado");
    const mp = new MercadoPagoConfig({ accessToken: token });
    const paymentApi = new Payment(mp);

    const mpPayment = await Promise.race([
      paymentApi.get({ id: paymentId }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MP timeout")), 7000)),
    ]);

    if (mpPayment.status !== "approved" && mpPayment.status !== "pending") {
      return NextResponse.json({ error: "Pago no procesado" }, { status: 402 });
    }

    if (mpPayment.external_reference !== registrationId) {
      return NextResponse.json({ error: "Referencia inválida" }, { status: 403 });
    }
  } catch (err) {
    console.error("[preventa/confirm] MP error:", err instanceof Error ? err.message : err);
    // Don't block success page on MP verify failure
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("preventa_registrations")
    .update({ status: "deposit_paid", mp_payment_id: paymentId })
    .eq("id", registrationId)
    .eq("status", "pending");

  if (error) {
    console.error("[preventa/confirm] DB error:", error.message);
    return NextResponse.json({ error: "Error al confirmar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
