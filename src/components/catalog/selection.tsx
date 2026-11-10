"use client";
import { createContext, useEffect, useRef, useContext, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Product } from "@/lib/catalog";

const KEY = "danbikko.compare.v1";
let memory = "[]";
function snapshot() { try { return localStorage.getItem(KEY) ?? memory; } catch { return memory; } }
function subscribe(callback: () => void) { window.addEventListener("storage", callback); window.addEventListener(KEY, callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener(KEY, callback); }; }
function write(ids: string[]) { memory = JSON.stringify(ids); try { localStorage.setItem(KEY, memory); } catch {} window.dispatchEvent(new Event(KEY)); }
function parse(raw: string): string[] { try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []; } catch { return []; } }
const Context = createContext<{ products: Product[]; ids: string[]; toggle: (id: string) => void; replace: (from: string, to: string) => void; clear: () => void } | null>(null);
export function CatalogProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const ids = useMemo(() => [...new Set(parse(raw))].filter(id => products.some(p => p.id === id)).slice(0,4), [raw,products]);
  const toggle = (id: string) => { if (!products.some(p => p.id === id)) return; const current = [...new Set(parse(snapshot()))].filter(id => products.some(p => p.id === id)).slice(0,4); write(current.includes(id) ? current.filter(x => x !== id) : current.length < 4 ? [...current,id] : current); };
  const replace = (from: string, to: string) => { if (ids.includes(from) && !ids.includes(to) && products.some(p => p.id === to)) write(ids.map(id => id === from ? to : id)); };
  return <Context.Provider value={{ products, ids, toggle, replace, clear: () => write([]) }}>{children}<CompareTray /></Context.Provider>;
}
export function useCatalog() { const value = useContext(Context); if (!value) throw new Error("CatalogProvider missing"); return value; }
export function CompareToggle({ product }: { product: Product }) {
  const { ids, toggle } = useCatalog();
  const checked = ids.includes(product.id);
  return <label className="compare-toggle"><input type="checkbox" checked={checked} disabled={!checked && ids.length >= 4} onChange={() => toggle(product.id)} aria-label={product.name + " 비교 선택"} /><span>{checked ? "비교 선택됨" : "비교 선택"}</span></label>;
}
function CompareTray() {
  const { ids, clear } = useCatalog(); const pathname = usePathname();
  const trayRef = useRef<HTMLElement>(null);
  const visible = ids.length > 0 && pathname !== "/compare";
  useEffect(() => {
    if (!visible || !trayRef.current) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty("--compare-tray-height", trayRef.current!.getBoundingClientRect().height + "px");
    update();
    const observer = new ResizeObserver(update); observer.observe(trayRef.current);
    return () => { observer.disconnect(); root.style.removeProperty("--compare-tray-height"); };
  }, [visible]);
  if (!visible) return null;
  return <aside ref={trayRef} className="compare-tray" aria-label="선택한 제품"><div className="container tray-inner"><p role="status">비교할 제품 <strong>{ids.length}/4</strong><span>2~4개를 선택해 주세요.</span></p><button type="button" onClick={clear} className="text-link">선택 해제</button>{ids.length >= 2 ? <Link className="solid-link" href="/compare">비교하기</Link> : <button className="solid-link" disabled>비교하기</button>}</div></aside>;
}
