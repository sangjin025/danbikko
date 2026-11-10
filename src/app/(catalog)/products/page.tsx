import { ProductsView } from "@/components/catalog/products-view";
export const metadata = { title: "제품 탐색 · 네 가지 티어 | 단비꼬" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string,string | string[] | undefined>> }) {
  const params = await searchParams;
  const scalar = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  return <ProductsView query={scalar("q")} tier={scalar("tier")} sort={scalar("sort")} />;
}
