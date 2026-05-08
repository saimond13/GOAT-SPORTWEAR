import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["deposit_paid", "cancelled", "pending"]),
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

  const { id, status } = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("preventa_registrations")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[admin/preventa/update-status]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
