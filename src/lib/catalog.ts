export const TIERS = [
  { id: "overall", label: "종합" },
  { id: "protein", label: "단백질 중심" },
  { id: "additives", label: "감미료·첨가물 중심" },
  { id: "diet", label: "다이어트" },
] as const;
export type Tier = typeof TIERS[number]["id"];
export type Evaluation = { score: number | null; grade: string | null; rank: number | null; reasons: string[] | null; ruleVersion: string | null; status?: "trial" | "confirmed"; components?: ScoreComponent[]; deductions?: Deduction[]; population?: number };
export type Evidence = { status: "trial" | "document-official" | "document-disclosure" | "unknown"; sourceIds: string[]; note: string };
export type ProductSource = { id: string; url: string; label: string; kind: string; note: string | null; checkedAt: string | null };
export type ScoreComponent = { label: string; value: number; maximum: number; weight: number; contribution: number };
export type Deduction = { key: string; label: string; points: number; status: "trial" | "document-checked" };
export type ScoringInput = { quality: number | null; flags: Record<string, number | null>; confirmedFlags: string[]; gradeCap: "B" | "C" | null; status: "trial" | "confirmed" };
export type Product = {
  id: string; slug: string; type: "RTD"; name: string; brand: string | null;
  flavor: string | null; volumeMl: number | null; image: string | null;
  nutrition: { basis: string | null; protein: number | null; sugar: number | null; calories: number | null; fat: number | null; sodium: number | null };
  proteinSources: string[] | null; sweeteners: string[] | null; additives: string[] | null; ingredients: string | null;
  source: { label: string | null; url: string | null; checkedAt: string | null; verified: boolean };
  evaluations: Partial<Record<Tier, Evaluation>>;
  scoringInput?: ScoringInput;
  leucineMg?: number | null;
  sources?: ProductSource[];
  verification?: { ingredientStatus: string; fields: Record<string, Evidence>; note: string | null; legacy: boolean; legacyNote: string | null; ingredientListComplete: boolean };
  workbook?: { file: string; sha256: string; version: string; sheet: string; row: number; productId: number };
};
export function tierOf(value?: string): Tier { return TIERS.find(t => t.id === value)?.id ?? "overall"; }
export const pending = "확인 중";
export function amount(value: number | null | undefined, unit = "") { return value == null ? pending : value.toLocaleString("ko-KR") + unit; }
export function listValue(value: string[] | null) { return value === null ? pending : value.length ? value.join(", ") : "없음 (확인됨)"; }
export function safeUrl(value: string | null) { if (!value) return null; try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : null; } catch { return null; } }
export function searchProducts(products: Product[], query: string, tier: Tier, sort: string) {
  const q = query.trim().normalize("NFKC").toLocaleLowerCase("ko-KR");
  const filtered = products.filter(p => [p.name, p.brand, p.flavor].filter(Boolean).join(" ").normalize("NFKC").toLocaleLowerCase("ko-KR").includes(q));
  return filtered.sort((a,b) => {
    const name = a.name.localeCompare(b.name,"ko") || a.id.localeCompare(b.id);
    if (sort === "name") return name;
    const av = sort === "protein" ? a.nutrition.protein : sort === "sugar" ? a.nutrition.sugar : a.evaluations[tier]?.score;
    const bv = sort === "protein" ? b.nutrition.protein : sort === "sugar" ? b.nutrition.sugar : b.evaluations[tier]?.score;
    if (av == null) return bv == null ? name : 1;
    if (bv == null) return -1;
    return (sort === "sugar" ? av-bv : bv-av) || name;
  });
}

export function evidenceLabel(product: Product, field: string) {
  const status = product.verification?.fields[field]?.status;
  return status === "document-official" ? "자료상 공식 확인" : status === "document-disclosure" ? "자료상 고시 대조" : status === "trial" ? "시험자료·미검증" : "확인 중";
}
export function evaluationLabel(evaluation?: Evaluation) { return evaluation?.status === "trial" ? "시험 평가" : evaluation?.status === "confirmed" ? "확정 평가" : ""; }
