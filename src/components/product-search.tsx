import { ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function ProductSearch() { return <div className="search-block"><form className="search-form" action="/products"><label htmlFor="product-query" className="sr-only">단백질 음료 제품명 또는 브랜드</label><Search size={21} aria-hidden="true" className="search-icon"/><Input id="product-query" name="q" placeholder="제품명이나 브랜드를 입력하세요" autoComplete="off"/><Button type="submit" className="search-submit" aria-label="제품 검색"><ArrowUpRight size={22} aria-hidden="true"/></Button></form><p className="search-note">지금은 마시는 단백질 음료(RTD)를 먼저 살펴봅니다.</p></div>; }
