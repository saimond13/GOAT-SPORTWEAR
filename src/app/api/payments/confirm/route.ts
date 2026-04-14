import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ orderId: z.string().uuid() });

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("id", parsed.data.orderId);

  if (error) {
    console.error("[payments/confirm]", error);
    return NextResponse.json({ error: "Error al confirmar pago" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
