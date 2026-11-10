import symbol from "../../assets/symbol-only-brand-navy.png";
import type { Metadata } from "next";
import "@fontsource/pretendard/400.css";
import "@fontsource/pretendard/500.css";
import "@fontsource/pretendard/600.css";
import "@fontsource/pretendard/700.css";
import "./globals.css";
import "./catalog.css";
import { CatalogProvider } from "@/components/catalog/selection";
import { getProducts } from "@/lib/product-repository";

export const metadata: Metadata = {
  icons: { icon: symbol.src },
  title: "단비꼬 — 단백질 음료, 성분부터 비교하세요",
  description: "마시는 단백질 음료의 성분을 비교하는 단비꼬. 종합, 단백질 중심, 감미료·첨가물 중심, 다이어트의 네 가지 티어로 나에게 맞는 선택의 기준을 살펴보세요.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" data-scroll-behavior="smooth"><body><CatalogProvider products={await getProducts()}>{children}</CatalogProvider></body></html>;
}
