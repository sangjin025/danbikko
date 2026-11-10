"use client";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { TIERS, tierOf, searchProducts } from "@/lib/catalog";
import { useCatalog } from "./selection";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function ProductsView({ query, tier: rawTier, sort: rawSort }: { query: string; tier: string; sort: string }) {
  const { products, ids } = useCatalog(); const router = useRouter();
  const [isPending,startTransition] = useTransition();
  const navigate = (target: string) => startTransition(() => router.push(target,{scroll:false}));
  const tier = tierOf(rawTier); const sort = ["score","name","protein","sugar"].includes(rawSort) ? rawSort : "score";
  const results = searchProducts(products, query, tier, sort);
  const url = (changes: Record<string,string>) => "/products?" + new URLSearchParams({ q:query, tier, sort, ...changes });
  return <><div className="catalog-heading products-heading"><p className="eyebrow">EXPLORE · RTD</p><h1>나에게 맞는 기준으로,<br />단백질 음료 둘러보기.</h1><p>같은 성분도, 중요하게 보는 기준에 따라.</p></div>
    <div className="tier-tabs" role="tablist" aria-label="평가 티어">{TIERS.map((item,index) => <button type="button" role="tab" disabled={isPending} key={item.id} id={"tab-"+item.id} aria-controls="tier-results" aria-selected={tier===item.id} tabIndex={tier===item.id?0:-1} onClick={() => navigate(url({ tier:item.id }))} onKeyDown={e => { const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : (e.key === "ArrowDown" || e.key === "ArrowUp") && window.matchMedia("(max-width:767px)").matches ? 2 : 0; const next = e.key === "Home" ? 0 : e.key === "End" ? 3 : delta ? (index+delta+4)%4 : -1; if(next>=0) { e.preventDefault(); document.getElementById("tab-"+TIERS[next].id)?.focus(); navigate(url({tier:TIERS[next].id})); } }}>{item.label}</button>)}</div>
    <p className="criteria-note">네 티어 모두 단백질 품질·함량, 당류, 첨가물을 종합 평가하며 항목별 가중치가 다릅니다.</p>
    <div className="catalog-toolbar"><form action="/products" className="catalog-search" key={query}><input type="hidden" name="tier" value={tier}/><input type="hidden" name="sort" value={sort}/><label htmlFor="catalog-query" className="sr-only">제품명, 브랜드 또는 맛 검색</label><Search size={19} aria-hidden="true"/><Input id="catalog-query" name="q" defaultValue={query} placeholder="제품명, 브랜드 또는 맛 검색"/><Button type="submit">검색</Button></form><label className="sort-control">정렬<select disabled={isPending} value={sort} onChange={e=>navigate(url({sort:e.target.value}))}><option value="score">티어 점수 높은 순</option><option value="name">제품명 순</option><option value="protein">단백질 높은 순</option><option value="sugar">당류 낮은 순</option></select></label></div>
    <section id="tier-results" role="tabpanel" aria-busy={isPending} aria-labelledby={"tab-"+tier} tabIndex={0}><div className="results-summary"><p role="status">{query && <span>‘{query}’ · </span>}제품 {results.length}개</p><span>비교 선택 {ids.length}/4</span></div><p className="data-note">영양 수치의 기준을 함께 확인해 주세요. 시험 평가 점수·등급·공동순위는 확정 결과가 아닙니다. 미확인 값은 정렬 시 뒤에 배치합니다.</p>
    {results.length ? <div className="product-grid">{results.map(p=><ProductCard key={p.id} product={p} tier={tier}/>)}</div> : <div className="catalog-empty"><Search size={28} strokeWidth={1.3} aria-hidden="true"/><h2>{products.length ? "검색 결과가 없습니다." : "제품 정보를 준비하고 있어요."}</h2><p>{products.length ? "다른 제품명, 브랜드 또는 맛으로 검색해 주세요." : "확인된 RTD 제품이 등록되면 성분과 티어를 살펴볼 수 있습니다."}</p>{query && <button type="button" disabled={isPending} onClick={()=>navigate(url({q:""}))} className="text-link">검색 초기화</button>}</div>}</section></>;
}
