import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const workbook=resolve(root,process.argv[2]??'data/sources/protein-drinks-v08.xlsx');
const sheets=JSON.parse(execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',resolve(root,'scripts/read-workbook.ps1'),'-Workbook',workbook],{encoding:'utf8',maxBuffer:16*1024*1024,windowsHide:true}).replace(/^﻿/,''));
const table=sheets['30개_4티어'], rules=sheets['점수_감점기준'], log=sheets['원재료_확인로그'];
if(!table||!rules||!log)throw new Error('Missing v0.8 sheets');
const value=(sheet,address)=>sheet[address]?.value??null;
const source={file:'protein-drinks-v08.xlsx',sha256:createHash('sha256').update(readFileSync(workbook)).digest('hex'),version:'v0.8'};
const tiers=['overall','protein','additives','diet'];
const columns=['I','J','K','L','M','N','O','P','Q','R','S','T'];
const flagKeys=['sucralose','acesulfameK','maltitol','maltodextrin','carrageenan','emulsifier','syntheticColor','sorbitol','mannitol','aspartame','saccharin','gums'];
const deductions=flagKeys.map((key,i)=>({key,label:value(rules,'A'+(5+i)),handling:value(rules,'B'+(5+i)),points:value(rules,'C'+(5+i)),cell:'C'+(5+i)}));
const curve=(x,y,last)=>Array.from({length:last-4},(_,i)=>[value(rules,x+(i+5)),value(rules,y+(i+5))]);
const weights=Object.fromEntries(tiers.map((t,i)=>[t,Array.from({length:5},(_,j)=>value(rules,String.fromCharCode(66+i)+(19+j)))]));
const sRule=String(value(rules,'B27'));
const sMinimum=sRule.match(/(\d+)점/)?.[1], sPercentage=sRule.match(/(\d+)%/)?.[1];
if(!sMinimum||!sPercentage)throw new Error('Missing S grade rule');
const config={version:'v0.8',source,weights,deductions,curves:{protein:curve('G','H',11),sugar:curve('I','J',11),efficiency:curve('K','L',10)},normalizers:[100,20,20,30,25],additiveBase:30,precision:1,grades:{sMin:Number(sMinimum),sFraction:Number(sPercentage)/100,a:value(rules,'B28'),b:value(rules,'B29'),c:value(rules,'B30'),capTiers:tiers.filter((_,i)=>String(table[['AI','AJ','AK','AL'][i]+'5']?.formula??'').includes('AM5'))}};
// Validate the supplied v0.8 contract; never silently substitute another formula version.
if(JSON.stringify(weights)!==JSON.stringify({overall:[30,20,20,30,0],protein:[50,30,10,10,0],additives:[25,15,20,40,0],diet:[20,10,30,15,25]}))throw new Error('Workbook weights differ from approved v0.8');
if(!String(table.AE5?.formula).startsWith('COUNTIF(')||!String(table.AA5?.formula).startsWith('ROUND('))throw new Error('Unsupported ranking/rounding formula');
const logs=new Map();for(let row=5;row<=13;row++)logs.set(value(log,'A'+row),{type:value(log,'C'+row),added:value(log,'D'+row),url:value(log,'I'+row),note:value(log,'J'+row)});
const brands=['더단백','테이크핏','셀렉스','하이뮨','랩노쉬','뉴케어','닥터유','칼로바이','오트몬드','얼티브','서울우유','연세두유','미니언즈 프로틴액트','매일두유','허쉬'];
const products=[],expected=[];
const rows=Object.keys(table).filter(k=>/^A\d+$/.test(k)&&typeof value(table,k)==='number').map(k=>Number(k.slice(1))).sort((a,b)=>a-b);
for(const row of rows){
  const cell=c=>value(table,c+row), id=cell('A'), name=cell('B'), entry=logs.get(id);
  const sourceId='v08-'+String(id).padStart(2,'0');
  const primary=cell('AN'); const secondary=cell('AR');
  const sources=[];
  if(primary)sources.push({id:'primary',url:primary,label:entry?.type??'엑셀 기재 공식·판매 자료',kind:entry?.type?.includes('제조사 공식')?'manufacturer':entry?'disclosure':'reference',note:entry?.note??cell('AO'),checkedAt:null});
  if(secondary)sources.push({id:'secondary',url:secondary,label:'기존 2차 시험자료',kind:'secondary',note:'공식 확인값으로 간주하지 않음',checkedAt:null});
  const unknown={status:'unknown',sourceIds:[],note:'제공 자료에서 확인되지 않음'};
  const trial={status:'trial',sourceIds:['secondary'],note:'엑셀에 기록된 시험값 · 공식 검증 전'};
  const official={status:'document-official',sourceIds:['primary'],note:'제공 엑셀의 공식 영양 확인 기록 · 이번 반입에서 외부 재검증하지 않음'};
  const disclosed={status:'document-disclosure',sourceIds:['primary'],note:'제공 엑셀의 원재료 고시 대조 기록 · 최신 실물 포장 미대조'};
  const fields={protein:trial,sugar:trial,calories:trial,volume:unknown,proteinSources:unknown,ingredients:unknown,sweeteners:unknown,additives:unknown,leucine:unknown,quality:{status:'trial',sourceIds:['secondary'],note:'원료품질 가정 점수이며 실제 단백질 원료명이 아님'}};
  if([7,13,19].includes(id)){fields.protein=official;fields.sugar=official;fields.calories=official;}
  if([3,27].includes(id))fields.protein=disclosed;
  const volume=id===3||id===12?250:id===27?190:id===28?450:null;
  if(volume!==null)fields.volume=id===28?{...trial,note:'구버전 시험자료 450ml · 500ml 리뉴얼과 구별'}:disclosed;
  const added=entry?.added??'';
  const additives=entry?['셀룰로스검','구아검','젤란검','카라기난','레시틴'].filter(term=>added.includes(term)):null;
  if(entry&&added.includes('CMC'))additives.push(added.includes('카복시메틸셀룰로스나트륨')?'카복시메틸셀룰로스나트륨(CMC)':'CMC');
  const confirmedAdditives=additives?.length?additives:null;
  if(confirmedAdditives)fields.additives={...disclosed,note:'추가 확인 로그에 명시된 성분만 표시 · 전체 목록 아님'};
  const sweeteners=id===27?['알룰로스']:null;
  if(sweeteners)fields.sweeteners=disclosed;
  const flags=Object.fromEntries(flagKeys.map((key,i)=>[key,cell(columns[i])]));
  const confirmedFlags=entry?flagKeys.slice(7):[];
  if(id===25)confirmedFlags.push('emulsifier');if([13,20].includes(id))confirmedFlags.push('carrageenan');
  const product={id:sourceId,slug:sourceId,type:'RTD',name,brand:brands.find(b=>name.includes(b))??null,flavor:name.split(' ').at(-1),volumeMl:volume,image:null,
    nutrition:{basis:null,protein:cell('D'),sugar:cell('F'),calories:cell('E'),fat:null,sodium:null},proteinSources:null,sweeteners,additives:confirmedAdditives,ingredients:null,leucineMg:null,
    source:{label:entry?.type??(primary?'공식·판매 참고 자료 (세부 성분 미확인)':'기존 2차 시험자료'),url:primary??secondary,checkedAt:null,verified:false},sources,
    verification:{ingredientStatus:cell('C'),fields,note:cell('AO'),legacy:id===28,legacyNote:id===28?'구버전 450ml 시험 평가 · 500ml 리뉴얼 제품의 평가가 아닙니다.':null,ingredientListComplete:false},
    workbook:{...source,sheet:'30개_4티어',row,productId:id},
    scoringInput:{quality:cell('G'),flags,confirmedFlags,gradeCap:cell('AM'),status:'trial'},evaluations:{}};
  products.push(product);
  expected.push({id:sourceId,additiveScore:cell('U'),components:{protein:cell('X'),sugar:cell('Y'),efficiency:cell('Z')},evaluations:Object.fromEntries(tiers.map((t,i)=>[t,{score:cell(['AA','AB','AC','AD'][i]),rank:cell(['AE','AF','AG','AH'][i]),grade:cell(['AI','AJ','AK','AL'][i])}]))});
}
if(products.length!==30)throw new Error('Expected the original 30-product v0.8 workbook');
function save(file,data){const target=resolve(root,file);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,JSON.stringify(data,null,2)+'\n');}
save('data/sources/v08-extracted.json',{source,sheets});
save('src/data/products.json',products);
save('src/data/scoring-v08.json',config);
save('tests/fixtures/v08-expected.json',{source,products:expected});
console.log('Imported '+products.length+' products; 120 independent workbook score/grade/rank references. Source SHA-256: '+source.sha256);
