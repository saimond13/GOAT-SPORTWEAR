"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "@/types/product";

interface ProductsCtx {
  products: Product[];
}

const Ctx = createContext<ProductsCtx>({ products: [] });

export function ProductsProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  return <Ctx.Provider value={{ products }}>{children}</Ctx.Provider>;
}

export const useProducts = () => useContext(Ctx);
