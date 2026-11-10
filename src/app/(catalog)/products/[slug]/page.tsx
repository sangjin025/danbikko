import { notFound } from "next/navigation";
import Link from "next/link";
import { getProducts } from "@/lib/product-repository";
import { TIERS, amount, listValue, pending, safeUrl, evaluationLabel } from "@/lib/catalog";
import { ProductImage } from "@/components/catalog/product-card";
import { CompareToggle } from "@/components/catalog/selection";
import { FieldEvidence, ProductSources } from "@/components/catalog/product-evidence";

export default async function Page({ params }: { params: Promise<{slug:string}> }) {
  const {slug}=await params;
  const product=(await getProducts()).find(p=>p.slug===slug);
  if(!product)notFound();
  const sourceUrl=safeUrl(product.source.url);
  const nutrition=[
    {key:"protein",label:"단백질",value:amount(product.nutrition.protein,"g")},
    {key:"sugar",label:"당류",value:amount(product.nutrition.sugar,"g")},
    {key:"calories",label:"칼로리",value:amount(product.nutrition.calories,"kcal")},
    {key:"fat",label:"지방",value:amount(product.nutrition.fat,"g")},
    {key:"sodium",label:"나트륨",value:amount(product.nutrition.sodium,"mg")},
  ];
  const showLeucine=product.leucineMg!=null&&product.verification?.fields.leucine?.status==="document-official";
  const deductions=product.evaluations.overall?.deductions;
  return <>
    <Link href="/products" className="text-link">← 제품 목록</Link>
    <div className="product-detail-top"><ProductImage product={product}/><div>
      <p className="eyebrow">PRODUCT NOTE · RTD</p><p className="product-brand">{product.brand??pending}</p><h1>{product.name}</h1>
      <p className="detail-meta">맛 {product.flavor??pending} · 용량 {amount(product.volumeMl,"ml")}<FieldEvidence product={product} field="volume"/></p>
      {product.verification?.legacyNote&&<p className="data-note">{product.verification.legacyNote}</p>}
      <CompareToggle product={product}/>
    </div></div>
    <div className="detail-columns"><section className="detail-section"><h2>영양성분</h2><p className="data-note">기준: {product.nutrition.basis??pending}</p>
      <dl className="info-list">{nutrition.map(item=><div key={item.key}><dt>{item.label}</dt><dd>{item.value}<FieldEvidence product={product} field={item.key}/></dd></div>)}
      {showLeucine&&<div><dt>류신</dt><dd>{amount(product.leucineMg,"mg")}<FieldEvidence product={product} field="leucine"/><small className="verification-text">정보 제공용 · 점수 제외</small></dd></div>}</dl>
    </section><section className="detail-section"><h2>원재료 살펴보기</h2><dl className="info-list">
      <div><dt>단백질 원료</dt><dd>{listValue(product.proteinSources)}<FieldEvidence product={product} field="proteinSources"/></dd></div>
      <div><dt>감미료</dt><dd>{listValue(product.sweeteners)}<FieldEvidence product={product} field="sweeteners"/></dd></div>
      <div><dt>첨가물</dt><dd>{listValue(product.additives)}<FieldEvidence product={product} field="additives"/></dd></div>
      </dl>{product.verification&&!product.verification.ingredientListComplete&&<p className="data-note">위 성분은 확인 로그에 명시된 일부 항목입니다. 미확인 항목은 성분이 없다는 뜻이 아닙니다.</p>}
      <h3>원재료 정보</h3><p className="ingredient-text">{product.ingredients??pending}</p>
    </section></div>
    <section className="detail-section"><h2>네 가지 티어</h2>
      <p className="data-note">공통 평가 항목에 서로 다른 가중치를 적용합니다. 시험 평가 점수·등급·순위는 원료 품질 가정과 미검증 입력을 포함하며 확정 결과가 아닙니다.</p>
      <div className="evaluation-list">{TIERS.map(t=>{const e=product.evaluations[t.id];return <article key={t.id}>
        <h3>{t.label}</h3><div className="evaluation-grade">{evaluationLabel(e)} 등급 <strong>{e?.grade??pending}</strong></div>
        {e?.rank!=null&&<p>{evaluationLabel(e)} · 공동순위 {e.rank}위 / {e.population}개</p>}
        <p className="evaluation-score">{evaluationLabel(e)} 점수 <strong>{amount(e?.score,"점")}</strong></p><details className="evaluation-reasons"><summary>점수 산정 이유</summary>{e?.reasons?.length?<ul>{e.reasons.map((reason,i)=><li key={i}>{reason}</li>)}</ul>:<p>{pending}</p>}
        <p className="data-note">평가 기준 버전: {e?.ruleVersion??pending}</p></details>
      </article>})}</div>
      {deductions&&<><h3>감미료·첨가물 감점 내역</h3><p className="data-note">첨가물 기준점 30점에서 차감한 후 티어별 배점으로 환산합니다. 소비자 선호도 기준이며 안전성 판정이 아닙니다.</p>
      <dl className="info-list">{deductions.map(d=><div key={d.key}><dt>{d.label}</dt><dd>시험 평가 · 기준점 −{d.points}점<small className="verification-text">{d.status==="document-checked"?"자료상 고시 대조":"시험 입력 · 확인 중"}</small></dd></div>)}</dl>
      {!deductions.length&&<p className="data-note">원본 시험 입력에서 감점이 적용된 항목이 없습니다. 전체 성분 부재를 뜻하지 않습니다.</p>}</>}
    </section>
    <section className="detail-section"><h2>출처 및 확인 상태</h2><dl className="info-list">
      <div><dt>원재료 정보 출처</dt><dd>{sourceUrl?<a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link">{product.source.label??"출처 보기"} ↗</a>:product.source.label??pending}</dd></div>
      <div><dt>확인 상태</dt><dd>{product.verification?.ingredientStatus??(product.source.verified?"확인 완료":pending)}</dd></div>
      <div><dt>확인일</dt><dd>{product.source.checkedAt??pending}</dd></div>
      </dl>{product.verification?.note&&<p className="data-note">{product.verification.note}</p>}<ProductSources product={product}/>
    </section>
    <section className="purchase-area"><div><h2>구매 정보</h2><p>쿠팡 파트너스 구매 링크 · 확인 중</p></div><button className="outline-button" disabled>구매 링크 준비 중</button></section>
  </>;
}
