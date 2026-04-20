import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import MercadoPagoConfig, { Payment } from "mercadopago";

const schema = z.object({
  orderId: z.string().uuid(),
  paymentId: z.string().min(1),
});

function getMPClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
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
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { orderId, paymentId } = parsed.data;

  // Verify the payment with Mercado Pago API — prevents spoofed confirmations
  try {
    const mp = getMPClient();
    const paymentApi = new Payment(mp);
    const mpPayment = await Promise.race([
      paymentApi.get({ id: paymentId }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MP timeout")), 7000)),
    ]);

    if (mpPayment.status !== "approved") {
      return NextResponse.json({ error: "Pago no aprobado" }, { status: 402 });
    }

    if (mpPayment.external_reference !== orderId) {
      return NextResponse.json({ error: "Referencia de pago inválida" }, { status: 403 });
    }
  } catch (err) {
    console.error("[payments/confirm] Error verificando pago con MP:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "No se pudo verificar el pago" }, { status: 502 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("id", orderId)
    .eq("payment_status", "unpaid"); // Only update if not already confirmed

  if (error) {
    console.error("[payments/confirm] DB error:", error.message);
    return NextResponse.json({ error: "Error al confirmar pago" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
