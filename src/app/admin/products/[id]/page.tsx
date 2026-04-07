import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";
import type { Product } from "@/types/product";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black text-2xl">Editar producto</h1>
        <p className="text-gray-500 text-sm mt-1">{data.name}</p>
      </div>
      <ProductForm product={data as Product} />
    </div>
  );
}
