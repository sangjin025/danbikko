import Image from "next/image";
import Link from "next/link";
import { LandingProducts } from "@/components/catalog/landing-products";
import { TIERS } from "@/lib/catalog";
import { ArrowDown, ArrowUpRight, ArrowRight, FlaskConical, Search } from "lucide-react";
import symbol from "../../assets/symbol-only-brand-navy.png";
import { ProductSearch } from "@/components/product-search";

const tiers = [
  { number: "01", title: "종합", english: "THE WHOLE PICTURE", text: "여러 성분을 함께 살펴보는, 균형 잡힌 선택의 기준." },
  { number: "02", title: "단백질 중심", english: "PROTEIN FIRST", text: "단백질을 우선으로 생각할 때 살펴볼 기준." },
  { number: "03", title: "감미료·첨가물 중심", english: "A CLOSER LOOK", text: "원재료명 속 감미료와 첨가물까지 자세히 살펴볼 기준." },
  { number: "04", title: "다이어트", english: "MINDFUL CHOICES", text: "식단을 고려해 단백질 음료를 고를 때 살펴볼 기준." },
];

export default function Home() {
  return <>
    <a className="skip-link" href="#main">본문 바로가기</a>
    <header className="site-header container">
      <a href="#" aria-label="단비꼬 홈" className="brand"><Image src={symbol} alt="" width={38} height={38} priority /><span>단비꼬</span></a>
      <nav aria-label="주요 메뉴"><Link href="/products">제품 둘러보기</Link><a href="#tiers">티어 알아보기 <ArrowUpRight size={15} aria-hidden="true" /></a></nav>
    </header>
    <main id="main">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-main">
          <p className="eyebrow"><span className="small-rule" /> KNOW WHAT YOU DRINK</p>
          <h1 id="hero-title">매일 마시는 단백질,<br /><span>성분부터 비교하세요.</span></h1>
          <p className="hero-description">앞면의 숫자 너머, 뒷면의 성분까지.<br />나에게 맞는 단백질 음료를 찾는 기준, 단비꼬.</p>
          <ProductSearch />
          <a className="text-link hero-link" href="#tiers">네 가지 티어로 살펴보기 <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
        <aside className="ingredient-note" aria-labelledby="note-title">
          <div className="note-top"><span>THE INGREDIENT NOTE</span><FlaskConical size={20} strokeWidth={1.5} aria-hidden="true" /></div>
          <h2 id="note-title">한 병을 고르기 전,<br />살펴볼 것들.</h2>
          <dl><div><dt>단백질</dt><dd>얼마나, 어떤 원료로</dd></div><div><dt>당류와 칼로리</dt><dd>내 식단에 맞는지</dd></div><div><dt>감미료·첨가물</dt><dd>무엇이 들어 있는지</dd></div></dl>
          <p>작은 글씨에 담긴 정보도<br />선택의 기준이 될 수 있도록.</p>
        </aside>
      </section>
      <section id="products" className="products-section" aria-labelledby="products-title">
        <div className="container">
          <div className="section-heading"><div><p className="eyebrow">EXPLORE</p><h2 id="products-title">마시는 단백질, 차근차근.</h2></div><span className="category-label">단백질 음료 <span>RTD</span></span></div>
          <LandingProducts fallback={<div className="product-empty"><span className="empty-mark" aria-hidden="true"><Search size={25} strokeWidth={1.4} /></span><div><h3>비교의 시작은 정확한 제품 정보부터.</h3><p>제품별 성분 정보를 준비하고 있어요.<br className="mobile-break" /> 준비가 끝나면 여기에서 만나보세요.</p></div><a className="text-link" href="#approach">정보를 살펴보는 방법 <ArrowRight size={17} aria-hidden="true" /></a></div>} />
        </div>
      </section>
      <section id="tiers" className="tiers-section container" aria-labelledby="tiers-title">
        <div className="tier-intro"><p className="eyebrow">FOUR PERSPECTIVES</p><h2 id="tiers-title">좋은 선택의 기준은<br />하나가 아니니까.</h2><p>단비꼬는 네 가지 티어로 평가합니다.<br />내가 중요하게 생각하는 기준부터<br className="desktop-break" /> 살펴보세요.</p><span className="tier-footnote">제품별 티어 결과는 제품 정보와 함께 제공됩니다.</span></div>
        <div className="tier-list">{tiers.map((tier,index) => <article className="tier-row" key={tier.number}><span className="tier-number">{tier.number}</span><div><span className="tier-english">{tier.english}</span><h3><Link href={"/products?tier="+TIERS[index].id}>{tier.title}</Link></h3><p>{tier.text}</p></div></article>)}</div>
      </section>
      <section id="approach" className="approach-section container" aria-labelledby="approach-title"><p className="eyebrow">OUR APPROACH</p><div className="approach-content"><h2 id="approach-title">선택은 가볍게.<br />그 근거는 꼼꼼하게.</h2><div><p>단백질 함량뿐 아니라 원재료와 영양 정보까지.<br />단비꼬는 성분을 읽고 비교하는 데 집중합니다.</p><p className="approach-detail">제품 정보와 평가 결과는 구분해서 보여주고,<br />수치의 기준과 출처를 함께 확인할 수 있도록 준비합니다.</p></div></div></section>
    </main>
    <footer className="site-footer container"><div className="footer-brand"><Image src={symbol} alt="" width={25} height={25} /><span>단비꼬</span><span className="footer-description">더 알고, 나에게 맞게.</span></div><p>단백질 음료를 고르는 새로운 기준.</p></footer>
  </>;
}
