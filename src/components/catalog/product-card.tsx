"use client";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { evaluationLabel, amount, pending, type Product, type Tier } from "@/lib/catalog";
import { FieldEvidence } from "./product-evidence";
import { CompareToggle } from "./selection";
export function ProductImage({ product }: { product: Product }) {
  return <div className="product-image">{product.image ? <Image src={product.image} alt={product.name} width={240} height={240} unoptimized /> : <div className="image-pending"><ImageOff size={25} strokeWidth={1.25} aria-hidden="true" /><span>이미지 확인 중</span></div>}</div>;
}
export function ProductCard({ product, tier = "overall" }: { product: Product; tier?: Tier }) {
  const evaluation = product.evaluations[tier];
  return <article className="product-card" data-product-id={product.id}>
    <Link href={"/products/" + product.slug} className="product-card-link"><ProductImage product={product} /><p className="product-brand">{product.brand ?? pending}</p><h3>{product.name}</h3><p className="product-meta">{product.flavor ?? pending} · {amount(product.volumeMl,"ml")}</p></Link>
    <dl className="card-nutrition"><div><dt>단백질</dt><dd>{amount(product.nutrition.protein,"g")}<FieldEvidence product={product} field="protein"/></dd></div><div><dt>당류</dt><dd>{amount(product.nutrition.sugar,"g")}<FieldEvidence product={product} field="sugar"/></dd></div></dl>
    <p className="card-basis">{product.nutrition.basis ?? "영양 기준 확인 중"}</p>
    {product.verification?.legacyNote && <p className="data-note">{product.verification.legacyNote}</p>}
    <div className="card-evaluation"><div className="card-grade"><span>{evaluationLabel(evaluation)} 등급 <strong>{evaluation?.grade ?? pending}</strong></span></div>
    <p className="card-rank">{evaluationLabel(evaluation)} · 공동순위 {amount(evaluation?.rank,"위")}</p><p className="card-score">{evaluationLabel(evaluation)} {amount(evaluation?.score,"점")}</p></div><CompareToggle product={product} />
  </article>;
}
