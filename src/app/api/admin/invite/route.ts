import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // Verify the caller is an authenticated owner
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner") return NextResponse.json({ error: "Solo el owner puede invitar admins" }, { status: 403 });

  const { email, full_name, role } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

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
