"use client";
import { useCatalog } from "./selection";
import { ProductCard } from "./product-card";
export function LandingProducts({ fallback }: { fallback: React.ReactNode }) { const {products}=useCatalog(); return products.length?<div className="product-grid landing-product-grid">{products.slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div>:fallback; }
