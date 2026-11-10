import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
for (const viewport of [{width:390,height:844},{width:1440,height:900}]) {
  test("isolated empty catalog at "+viewport.width, async ({page})=>{
    await page.setViewportSize(viewport);
    const errors:string[]=[]; page.on("pageerror",e=>errors.push(e.message)); page.on("console",m=>{if(m.type()==="error")errors.push(m.text()+" "+m.location().url);});
    await page.goto("http://127.0.0.1:3102/"); await page.evaluate(()=>document.fonts.ready);
    await page.keyboard.press("Tab"); await expect(page.getByRole("link",{name:"본문 바로가기"})).toBeFocused();
    await page.keyboard.press("Enter");
    await mkdir("artifacts",{recursive:true});
    await page.evaluate(()=>{ if(document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo({top:0,behavior:"instant"}); });
    await page.screenshot({path:"artifacts/empty-regression-landing-"+viewport.width+".png",fullPage:true});
    await page.getByRole("textbox").fill("없는 제품"); await page.getByRole("textbox").press("Enter");
    await expect(page).toHaveURL(/products\?q=/); await expect(page.getByRole("textbox")).toHaveValue("없는 제품");
    await expect(page.getByText("제품 정보를 준비하고 있어요.",{exact:true})).toBeVisible();
    await page.getByRole("tab",{name:"다이어트",exact:true}).click();
    await expect(page.getByRole("tab",{name:"다이어트",exact:true})).toHaveAttribute("aria-selected","true");
    await expect(page).toHaveURL(/tier=diet/);
    await page.getByRole("button",{name:"검색 초기화"}).click();
    await page.evaluate(()=>{ if(document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo({top:0,behavior:"instant"}); });
    await page.screenshot({path:"artifacts/empty-regression-products-"+viewport.width+".png",fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole("link",{name:"제품 비교",exact:true}).click();
    await expect(page.getByText("아직 선택한 제품이 없습니다.")).toBeVisible();
    await page.evaluate(()=>{ if(document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo({top:0,behavior:"instant"}); });
    await page.screenshot({path:"artifacts/empty-regression-compare-"+viewport.width+".png",fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.goto("/"); await page.getByRole("link",{name:"단백질 중심",exact:true}).click();
    await expect(page).toHaveURL(/tier=protein/); expect(errors).toEqual([]);
  });
}
test("unknown product has a useful not-found state",async({page})=>{await page.goto("/products/not-a-real-product");await expect(page.getByRole("heading",{name:"제품을 찾을 수 없습니다."})).toBeVisible();});
