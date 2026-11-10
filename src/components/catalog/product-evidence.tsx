import { evidenceLabel, safeUrl, type Product } from "@/lib/catalog";
export function FieldEvidence({ product, field }: { product: Product; field: string }) {
  if (!product.verification || evidenceLabel(product,field) === "확인 중") return null;
  return <small className="verification-text" title={product.verification.fields[field]?.note}>{evidenceLabel(product,field)}</small>;
}
export function ProductSources({ product }: { product: Product }) {
  if (!product.sources) return null;
  return <><p className="data-note">제공 자료에 기록된 확인 상태입니다. 이번 데이터 반입에서 외부 페이지나 최신 실물 포장을 새로 대조하지 않았습니다.</p><dl className="info-list">{product.sources.map(source=><div key={source.id}><dt>{source.label}</dt><dd>{safeUrl(source.url)?<a className="source-link" href={safeUrl(source.url)!} target="_blank" rel="noopener noreferrer">출처 보기 ↗</a>:"URL 확인 중"}<p className="data-note">{source.note}</p><small className="verification-text">확인일: {source.checkedAt??"확인 중"}</small></dd></div>)}</dl></>;
}
