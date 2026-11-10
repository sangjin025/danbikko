import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import raw from "../src/data/products.json";
import expected from "./fixtures/v08-expected.json";
import { evaluateProducts, excelRound, gradeFor, interpolate, scoringRules } from "../src/lib/scoring-v08";
import { TIERS, searchProducts, type Product } from "../src/lib/catalog";
import { validateCatalog } from "../src/lib/product-repository";
const products=raw as Product[];

test("original workbook: 120 scores, 120 ranks and 120 grades match",()=>{
  const source=resolve("data/sources/protein-drinks-v08.xlsx");
  expect(createHash("sha256").update(readFileSync(source)).digest("hex")).toBe(expected.source.sha256);
  const workbook=JSON.parse(execFileSync("powershell.exe",["-NoProfile","-ExecutionPolicy","Bypass","-File",resolve("scripts/read-workbook.ps1"),"-Workbook",source],{encoding:"utf8",maxBuffer:16*1024*1024,windowsHide:true}));
  const sheet=workbook["30개_4티어"];
  const computed=evaluateProducts(validateCatalog(products));
  expect(computed).toHaveLength(30);
  const results=[];
  for(const product of computed){
    const row=product.workbook!.row;
    for(const [i,tier] of TIERS.entries()){
      const evaluation=product.evaluations[tier.id]!;
      const original={score:sheet[["AA","AB","AC","AD"][i]+row].value,rank:sheet[["AE","AF","AG","AH"][i]+row].value,grade:sheet[["AI","AJ","AK","AL"][i]+row].value};
      expect.soft(evaluation.score,product.id+" "+tier.id+" score").toBe(original.score);
      expect.soft(evaluation.rank,product.id+" "+tier.id+" rank").toBe(original.rank);
      expect.soft(evaluation.grade,product.id+" "+tier.id+" grade").toBe(original.grade);
      expect(evaluation.status).toBe("trial");
      expect(expected.products.find(p=>p.id===product.id)!.evaluations[tier.id]).toEqual(original);
      results.push({id:product.id,tier:tier.id,excel:original,web:{score:evaluation.score,rank:evaluation.rank,grade:evaluation.grade},matched:evaluation.score===original.score&&evaluation.rank===original.rank&&evaluation.grade===original.grade});
    }
  }
  mkdirSync("artifacts",{recursive:true});writeFileSync("artifacts/stage5-score-verification.json",JSON.stringify({sourceSha256:expected.source.sha256,count:results.length,matched:results.filter(r=>r.matched).length,results},null,2));
  expect(results.filter(r=>r.matched)).toHaveLength(120);
});

test("v0.8 boundaries, continuous interpolation and Excel rounding",()=>{
  for(const knots of Object.values(scoringRules.curves)){
    for(const [x,y] of knots)expect(interpolate(x,knots)).toBe(y);
    for(let i=1;i<knots.length;i++)expect(interpolate((knots[i-1][0]+knots[i][0])/2,knots)).toBeCloseTo((knots[i-1][1]+knots[i][1])/2,10);
    expect(interpolate(999,knots)).toBe(knots.at(-1)![1]);
  }
  expect(excelRound(83.45)).toBe(83.5);expect(excelRound(-83.45)).toBe(-83.5);
  expect(scoringRules.weights).toEqual({overall:[30,20,20,30,0],protein:[50,30,10,10,0],additives:[25,15,20,40,0],diet:[20,10,30,15,25]});
});
test("grade caps apply only to overall and diet; S includes shared ranks",()=>{
  expect(gradeFor(90,1,30,"overall","B")).toBe("B");expect(gradeFor(90,1,30,"diet","C")).toBe("C");
  expect(gradeFor(90,1,30,"protein","B")).toBe("S");expect(gradeFor(90,3,30,"additives",null)).toBe("S");
  expect(gradeFor(90,4,30,"overall",null)).toBe("A");expect(gradeFor(84.9,1,30,"overall",null)).toBe("A");
});
test("changing input or adding products recomputes scores and the entire ranking",()=>{
  const original=evaluateProducts(products);
  const changed=structuredClone(products);changed[0].nutrition.sugar=27;
  const updated=evaluateProducts(changed);
  expect(updated[0].evaluations.overall!.score).toBeLessThan(original[0].evaluations.overall!.score!);
  expect(updated[0].evaluations.overall!.rank).toBeGreaterThan(original[0].evaluations.overall!.rank!);
  const duplicate=structuredClone(products[0]);duplicate.id="added-test";duplicate.slug="added-test";
  const expanded=evaluateProducts([...products,duplicate]);expect(expanded).toHaveLength(31);
  expect(expanded[0].evaluations.overall!.rank).toBe(expanded[30].evaluations.overall!.rank);
  expect(expanded[0].evaluations.overall!.population).toBe(31);
  expect(searchProducts(original,"더블초코","overall","score")[0].evaluations.overall!.rank).toBe(original[0].evaluations.overall!.rank);
});
test("missing values, ingredient uncertainty, provenance and leucine stay separate from scoring",()=>{
  expect(products.filter(p=>Object.values(p.scoringInput!.flags).some(v=>v===null))).toHaveLength(21);
  expect(products.filter(p=>p.verification!.ingredientStatus.includes("고시 대조"))).toHaveLength(9);
  expect(products[0].volumeMl).toBeNull();expect(products[0].proteinSources).toBeNull();
  expect(products.every(p=>p.source.checkedAt===null&&p.image===null&&p.leucineMg===null)).toBe(true);
  expect(products[27].volumeMl).toBe(450);expect(products[27].verification!.legacy).toBe(true);
  expect(products[6].verification!.fields.protein.status).toBe("document-official");
  const changed=structuredClone(products);changed[0].leucineMg=9999;
  expect(evaluateProducts(changed)[0].evaluations).toEqual(evaluateProducts(products)[0].evaluations);
  changed[0].nutrition.protein=null;expect(evaluateProducts(changed)[0].evaluations).toEqual({});
  const flags=structuredClone(products[0]);for(const key of Object.keys(flags.scoringInput!.flags))flags.scoringInput!.flags[key]=1;
  const e=evaluateProducts([flags])[0].evaluations.overall!;expect(e.components![3].value).toBe(0);expect(e.score).toBeGreaterThanOrEqual(0);
  expect(()=>validateCatalog([...products,products[0]])).toThrow(/duplicate/);
});
