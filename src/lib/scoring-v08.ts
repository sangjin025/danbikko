import rules from "@/data/scoring-v08.json";
import { TIERS, type Product, type Tier, type Evaluation, type ScoreComponent, type Deduction } from "./catalog";

/** Excel's piecewise interpolation: boundaries clamp; values between knots interpolate. */
export function interpolate(value: number, knots: number[][]): number {
  if (value <= knots[0][0]) return knots[0][1];
  for (let i = 1; i < knots.length; i++) {
    const [x1,y1] = knots[i-1]; const [x2,y2] = knots[i];
    if (value <= x2) return y1 + (value-x1)*(y2-y1)/(x2-x1);
  }
  return knots[knots.length-1][1];
}
export function excelRound(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON * Math.max(1,Math.abs(value))) * factor) / factor;
}
export function gradeFor(score: number, rank: number, population: number, tier: Tier, cap: "B" | "C" | null) {
  if ((rules.grades.capTiers as string[]).includes(tier)) {
    if (cap === "B" && score >= rules.grades.a) return "B";
    if (cap === "C" && score >= rules.grades.b) return "C";
  }
  if (score >= rules.grades.sMin && rank <= Math.ceil(population * rules.grades.sFraction)) return "S";
  return score >= rules.grades.a ? "A" : score >= rules.grades.b ? "B" : score >= rules.grades.c ? "C" : "D";
}
function scoreProduct(product: Product): Product {
  const input = product.scoringInput;
  const { protein, sugar, calories } = product.nutrition;
  if (!input || input.quality == null || protein == null || sugar == null || calories == null) return { ...product, evaluations: {} };
  const deductions: Deduction[] = rules.deductions.flatMap(rule => (input.flags[rule.key] ?? 0) === 1 ? [{ key: rule.key, label: rule.label, points: rule.points, status: input.confirmedFlags.includes(rule.key) ? "document-checked" as const : "trial" as const }] : []);
  const additive = Math.max(0,rules.additiveBase-deductions.reduce((sum,item)=>sum+item.points,0));
  const efficiency = calories === 0 ? 0 : protein*100/calories;
  const values = [input.quality,interpolate(protein,rules.curves.protein),interpolate(sugar,rules.curves.sugar),additive,interpolate(efficiency,rules.curves.efficiency)];
  const labels = ["단백질 원료 품질 가정","단백질 함량","당류","감미료·첨가물","단백질/열량 효율"];
  const evaluations: Partial<Record<Tier,Evaluation>> = {};
  for (const {id:tier} of TIERS) {
    const weights = rules.weights[tier];
    const components: ScoreComponent[] = values.map((value,i)=>({label:labels[i],value,maximum:rules.normalizers[i],weight:weights[i],contribution:value*weights[i]/rules.normalizers[i]}));
    const score = excelRound(components.reduce((sum,c)=>sum+c.contribution,0),rules.precision);
    const reasons = components.map(c=>c.label+" "+excelRound(c.value,3)+"/"+c.maximum+" × 배점 "+c.weight+" → "+excelRound(c.contribution,3)+"점");
    reasons.push("반올림 전 항목 점수를 합산한 뒤 소수점 한 자리로 반올림합니다.");
    if (Object.values(input.flags).some(v=>v===null)) reasons.push("미확인 성분 공란은 원본 엑셀 수식에서 감점 0으로 처리됩니다. 성분이 없다는 뜻이 아닙니다.");
    evaluations[tier] = { score, grade:null, rank:null, reasons, ruleVersion:rules.version, status:input.status, components, deductions };
  }
  return {...product,evaluations};
}
/** Always rank the complete dataset, before search/filter. Equal rounded scores share rank. */
export function evaluateProducts(products: Product[]): Product[] {
  const evaluated = products.map(scoreProduct);
  return evaluated.map(product=>{
    const evaluations: Partial<Record<Tier,Evaluation>> = {};
    for (const {id:tier} of TIERS) {
      const evaluation = product.evaluations[tier];
      if (evaluation?.score == null) continue;
      const score = evaluation.score;
      const scores = evaluated.map(p=>p.evaluations[tier]?.score).filter((s):s is number=>s!=null);
      const rank = 1 + scores.filter(s=>s>score).length;
      const cap = product.scoringInput?.gradeCap??null;
      const reasons = [...(evaluation.reasons??[])];
      if (cap && (rules.grades.capTiers as string[]).includes(tier)) reasons.push("원본에 지정된 "+cap+" 등급 상한을 유지합니다.");
      evaluations[tier] = {...evaluation,rank,population:scores.length,grade:gradeFor(score,rank,scores.length,tier,cap),reasons};
    }
    return {...product,evaluations};
  });
}
export { rules as scoringRules };
