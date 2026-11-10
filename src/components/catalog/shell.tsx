import Image from "next/image";
import Link from "next/link";
import symbol from "../../../assets/symbol-only-brand-navy.png";
export function CatalogShell({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#catalog-main">본문 바로가기</a><header className="site-header container"><Link className="brand" href="/" aria-label="단비꼬 홈"><Image src={symbol} alt="" width={38} height={38} priority /><span>단비꼬</span></Link><nav aria-label="주요 메뉴"><Link href="/products">제품 둘러보기</Link><Link href="/compare">제품 비교</Link></nav></header><main id="catalog-main" className="catalog-main container">{children}</main><footer className="site-footer container"><div className="footer-brand"><Image src={symbol} alt="" width={25} height={25} /><span>단비꼬</span><span className="footer-description">더 알고, 나에게 맞게.</span></div><p>단백질 음료를 고르는 새로운 기준.</p></footer></>;
}
