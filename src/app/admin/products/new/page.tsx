import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#111111] font-black text-2xl">Nuevo producto</h1>
        <p className="text-[#B8B8B8] text-sm mt-1">Completá los datos del nuevo producto</p>
      </div>
      <ProductForm />
    </div>
  );
}
