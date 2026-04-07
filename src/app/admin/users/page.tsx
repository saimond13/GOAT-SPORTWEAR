import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  const { data: admins } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black text-2xl">Administradores</h1>
        <p className="text-gray-500 text-sm mt-1">Gestioná los accesos al panel</p>
      </div>
      <UsersClient admins={admins ?? []} currentRole={profile?.role ?? "editor"} currentUserId={user?.id ?? ""} />
    </div>
  );
}
