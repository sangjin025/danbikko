import { readFile } from "node:fs/promises";
import catalog from "@/data/products.json";
import type { Product } from "./catalog";
import { evaluateProducts } from "./scoring-v08";

export function validateCatalog(data: Product[]): Product[] {
  const ids = new Set<string>(); const slugs = new Set<string>();
  for (const product of data) {
    if (!product.id || !product.name || !product.slug || ids.has(product.id) || slugs.has(product.slug)) throw new Error("Invalid or duplicate product identity");
    ids.add(product.id); slugs.add(product.slug);
    for (const value of Object.values(product.nutrition)) if (typeof value === "number" && (!Number.isFinite(value) || value<0)) throw new Error("Invalid nutrition value: "+product.id);
    if (product.scoringInput) {
      const {quality,flags,gradeCap,status} = product.scoringInput;
      if (quality!==null && (!Number.isFinite(quality)||quality<0||quality>100)) throw new Error("Invalid quality input");
      if (Object.values(flags).some(v=>v!==null&&v!==0&&v!==1)) throw new Error("Ingredient flags must be 0, 1 or null");
      if (![null,"B","C"].includes(gradeCap) || !["trial","confirmed"].includes(status)) throw new Error("Invalid evaluation metadata");
    }
  }
  return data.filter(product=>product.type==="RTD");
}
export async function getProducts(): Promise<Product[]> {
  // Fixtures cannot enter production. Their supplied scores support UI regression tests only.
  if (process.env.NODE_ENV === "development" && process.env.DANBIKKO_TEST_CATALOG) {
    return validateCatalog(JSON.parse(await readFile(process.env.DANBIKKO_TEST_CATALOG,"utf8")));
  }
  return evaluateProducts(validateCatalog(catalog as Product[]));
}
