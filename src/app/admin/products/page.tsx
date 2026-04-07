import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { ProductsTable } from "./ProductsTable";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-2xl">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{products?.length ?? 0} productos en total</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      <ProductsTable products={products ?? []} />
    </div>
  );
}
