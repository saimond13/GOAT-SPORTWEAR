import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DropPage } from "./DropPage";

export default async function DropRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  return <DropPage campaign={campaign} />;
}
