import Link from "next/link";
export default function NotFound() { return <div className="catalog-empty"><h1>제품을 찾을 수 없습니다.</h1><p>제품 주소를 확인하거나 목록에서 다시 찾아주세요.</p><Link href="/products" className="solid-link">제품 둘러보기</Link></div>; }
