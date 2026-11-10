import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import expected from "./fixtures/v08-expected.json";
import { TIERS } from "../src/lib/catalog";
async function capture(page:Page,name:string,width:number){
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();window.scrollTo({top:0,behavior:"instant"});});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await mkdir("artifacts",{recursive:true});
  await page.screenshot({path:"artifacts/stage6-"+name+"-"+width+".png",fullPage:true});
  await page.screenshot({path:"artifacts/stage6-"+name+"-"+width+"-viewport.png"});
}
for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
  test("actual 30-product data, four tiers and comparison at "+viewport.width,async({page})=>{
    await page.setViewportSize(viewport);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
    await page.goto("/");await expect(page.locator(".product-card")).toHaveCount(4);await capture(page,"landing",viewport.width);
    await page.getByRole("textbox").fill("더단백");await page.getByRole("textbox").press("Enter");
    await expect(page.locator(".product-card")).toHaveCount(4);
    await page.getByRole("textbox").fill("");await page.getByRole("textbox").press("Enter");await expect(page.locator(".product-card")).toHaveCount(30);
    for(const tier of TIERS){
      await page.getByRole("tab",{name:tier.label,exact:true}).click();await expect(page.getByRole("tab",{name:tier.label,exact:true})).toHaveAttribute("aria-selected","true");
      for(const product of expected.products){const card=page.locator('[data-product-id="'+product.id+'"]');await expect(card.locator(".card-score")).toContainText("시험 평가 "+product.evaluations[tier.id].score+"점");await expect(card.locator(".card-rank")).toContainText("시험 평가 · 공동순위 "+product.evaluations[tier.id].rank+"위");}
    }
    await page.getByRole("tab",{name:"종합",exact:true}).click();await expect(page.getByRole("tab",{name:"종합",exact:true})).toHaveAttribute("aria-selected","true");
    await capture(page,"products",viewport.width);
    await page.locator('[data-product-id="v08-01"]').getByRole("checkbox").check();await page.locator('[data-product-id="v08-07"]').getByRole("checkbox").check();
    await page.getByRole("link",{name:"비교하기",exact:true}).click();await expect(page.locator("thead th")).toHaveCount(3);
    await expect(page.getByRole("cell",{name:"시험 평가 등급 S · 공동순위 2위 · 88점",exact:true})).toBeVisible();
    await page.getByRole("button",{name:"빙그레 더단백 고함량 드링크 더블초코 교체",exact:true}).click();
    await page.getByRole("dialog").getByRole("textbox").fill("테이크핏 맥스");await page.getByRole("dialog").getByRole("button",{name:/남양유업 테이크핏 맥스 초코/}).click();
    await expect(page.locator("thead")).toContainText("테이크핏 맥스 초코");await page.reload();await expect(page.locator("thead th")).toHaveCount(3);
    await capture(page,"compare",viewport.width);
    if(viewport.width===390)expect(await page.locator(".comparison-scroll").evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
    await page.getByRole("button",{name:"모두 지우기"}).click();await page.goto("/products/v08-07");
    await expect(page.getByText("자료상 공식 확인",{exact:true}).first()).toBeVisible();
    await expect(page.getByRole("heading",{name:"감미료·첨가물 감점 내역"})).toBeVisible();
    await expect(page.locator('.evaluation-list')).toContainText("시험 평가 점수 88.5점");
    await capture(page,"detail",viewport.width);
    await page.goto("/products/v08-28");await expect(page.getByText("구버전 450ml 시험 평가 · 500ml 리뉴얼 제품의 평가가 아닙니다.",{exact:true})).toBeVisible();
    await expect(page.getByRole("heading",{name:"류신",exact:true})).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
