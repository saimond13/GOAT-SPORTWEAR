import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Email inválido").max(254),
  full_name: z.string().max(100).optional(),
  role: z.enum(["owner", "editor"]).default("editor"),
});

export async function POST(req: Request) {
  // Verify the caller is an authenticated owner
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single();
  if (profileError || !profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Solo el owner puede invitar admins" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { email, full_name, role } = parsed.data;

  // Use service role for admin operations (never exposed client-side)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role: role ?? "editor" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pre-create admin profile (will be activated when user sets password)
  await adminClient.from("admin_profiles").upsert({
    id: data.user.id,
    email,
    full_name: full_name ?? null,
    role: role ?? "editor",
    is_active: false,
  });

  return NextResponse.json({ ok: true });
}
