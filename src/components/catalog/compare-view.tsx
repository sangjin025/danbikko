"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { X, ArrowLeftRight } from "lucide-react";
import { useCatalog } from "./selection";
import { TIERS, evidenceLabel, evaluationLabel, amount, listValue, pending, type Product } from "@/lib/catalog";
function withEvidence(p: Product, field: string, value: string) { return value + (p.verification && value !== pending && evidenceLabel(p,field) !== pending ? " · "+evidenceLabel(p,field) : ""); }
const rows: {label:string; value:(p:Product)=>string}[] = [
  {label:"맛",value:p=>p.flavor??pending},{label:"용량",value:p=>withEvidence(p,"volume",amount(p.volumeMl,"ml"))},
  {label:"영양 기준",value:p=>p.nutrition.basis??pending},
  {label:"단백질",value:p=>withEvidence(p,"protein",amount(p.nutrition.protein,"g"))},{label:"당류",value:p=>withEvidence(p,"sugar",amount(p.nutrition.sugar,"g"))},{label:"칼로리",value:p=>withEvidence(p,"calories",amount(p.nutrition.calories,"kcal"))},{label:"지방",value:p=>amount(p.nutrition.fat,"g")},{label:"나트륨",value:p=>amount(p.nutrition.sodium,"mg")},
  {label:"단백질 원료",value:p=>listValue(p.proteinSources)},{label:"감미료",value:p=>withEvidence(p,"sweeteners",listValue(p.sweeteners))},{label:"첨가물",value:p=>withEvidence(p,"additives",listValue(p.additives))},{label:"원재료 정보",value:p=>p.ingredients??pending},
  ...TIERS.map(t=>({label:t.label,value:(p:Product)=>evaluationLabel(p.evaluations[t.id])+" 등급 "+(p.evaluations[t.id]?.grade??pending)+" · 공동순위 "+amount(p.evaluations[t.id]?.rank,"위")+" · "+amount(p.evaluations[t.id]?.score,"점")})),
  {label:"출처",value:p=>p.source.label??pending},{label:"확인 상태",value:p=>p.verification?.ingredientStatus??(p.source.verified?"확인 완료":pending)},
];
export function CompareView() {
  const {products,ids,toggle,replace,clear} = useCatalog();
  const selected = ids.map(id=>products.find(p=>p.id===id)!);
  const [editing,setEditing]=useState<string|null>(null); const [query,setQuery]=useState(""); const [notice,setNotice]=useState("");
  const titleRef=useRef<HTMLHeadingElement>(null);
  const candidates=products.filter(p=>!ids.includes(p.id) && [p.name,p.brand,p.flavor].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <><div className="catalog-heading"><p className="eyebrow">SIDE BY SIDE</p><h1 ref={titleRef} tabIndex={-1}>성분을 나란히,<br/>선택은 더 선명하게.</h1><p>제품 2~4개를 선택해 비교하세요.</p></div><div className="compare-actions"><span role="status">{selected.length}개 선택 · {notice}</span><Link className="text-link" href="/products">제품 추가하기 →</Link>{ids.length>0&&<button type="button" className="text-link" onClick={()=>{clear();setNotice("선택을 모두 해제했습니다.");}}>모두 지우기</button>}</div>
    {selected.length<2&&<div className="compare-notice"><ArrowLeftRight size={23} aria-hidden="true"/><p>{selected.length===0?"아직 선택한 제품이 없습니다.":"한 제품을 더 선택하면 비교할 수 있어요."}</p><Link href="/products" className="solid-link">제품 둘러보기</Link></div>}
    {selected.length>0&&<><p className="data-note">제품별 영양 기준이 다를 수 있습니다. 수치를 같은 기준으로 임의 환산하지 않습니다. 원재료는 확인된 일부 항목이며 전체 목록은 확인 중일 수 있습니다. 시험 평가는 확정 결과가 아닙니다. 표를 좌우로 스크롤해 주세요.</p><div className="comparison-scroll" tabIndex={0} role="region" aria-label="제품 성분 비교표, 가로 스크롤 가능"><table className="comparison-table"><caption className="sr-only">선택한 제품의 영양성분, 원재료와 네 티어 점수 및 등급 비교</caption><thead><tr><th scope="col">비교 항목</th>{selected.map(p=><th key={p.id} scope="col"><Link href={"/products/"+p.slug}>{p.name}</Link><p className="comparison-identity">{p.flavor??pending} · {amount(p.volumeMl,"ml")}</p>{p.verification?.legacyNote&&<p className="data-note">{p.verification.legacyNote}</p>}<div className="table-actions"><button type="button" onClick={()=>{setEditing(p.id);setQuery("");}} aria-label={p.name+" 교체"}>교체</button><button type="button" onClick={()=>{toggle(p.id);setNotice(p.name+" 삭제됨");titleRef.current?.focus();}} aria-label={p.name+" 삭제"}>삭제</button></div></th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{selected.map(p=><td key={p.id}>{row.value(p)}</td>)}</tr>)}</tbody></table></div></>}
    <Dialog.Root open={editing!==null} onOpenChange={open=>{if(!open)setEditing(null);}}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="replace-dialog" onCloseAutoFocus={e=>{e.preventDefault();titleRef.current?.focus();}}><Dialog.Title>비교 제품 교체</Dialog.Title><Dialog.Description>이미 선택한 제품을 제외한 RTD 목록입니다.</Dialog.Description><label htmlFor="replace-search">제품 검색</label><input id="replace-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="제품명, 브랜드 또는 맛"/><div className="replacement-list">{candidates.length?candidates.map(p=><button key={p.id} type="button" onClick={()=>{if(editing)replace(editing,p.id);setEditing(null);setNotice(p.name+"으로 교체됨");}}><span>{p.name}</span><small>{p.flavor??pending} · {amount(p.volumeMl,"ml")}</small></button>):<p>교체할 수 있는 제품이 없습니다.</p>}</div><Dialog.Close className="dialog-close" aria-label="닫기"><X size={20}/></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
  </>;
}
