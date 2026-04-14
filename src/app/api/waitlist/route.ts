import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email inválido").max(254),
  name: z.string().max(100).optional(),
});

// Simple IP-based rate limit: max 3 submissions per IP per 10 minutes
// Relies on Supabase — no external service needed
async function isRateLimited(ip: string): Promise<boolean> {
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);
  return (count ?? 0) >= 3;
}

export async function POST(req: Request) {
  // Get IP from Vercel/proxy headers
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // Rate limit
  if (ip !== "unknown") {
    const limited = await isRateLimited(ip);
    if (limited) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intentá en unos minutos." },
        { status: 429 }
      );
    }
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { email, name } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("waitlist")
    .insert({ email, name: name ?? null, source: "storefront", ip });

  if (!error) {
    return NextResponse.json({ ok: true });
  }
  if (error.code === "23505") {
    return NextResponse.json({ error: "duplicate" }, { status: 409 });
  }
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
