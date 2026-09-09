import { chromium, devices } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createHash } from 'node:crypto';

const baseCommit = 'ecd82e63eb51b5ad8ec34eb3548a7c2b0c3d41bb';
const output = path.resolve('artifacts/visual');
const baselineRoot = path.resolve('artifacts/baseline-source');
await mkdir(output,{recursive:true});
await mkdir(baselineRoot,{recursive:true});
const archive = execFileSync('git',['archive',baseCommit],{maxBuffer:64*1024*1024});
execFileSync('tar',['-x','-C',baselineRoot],{input:archive});
process.env.BASELINE_ROOT = baselineRoot;
const {startServer} = await import('./server.mjs');
const server = await startServer(0);
const origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch();
const cache = path.resolve('artifacts/public-asset-cache');
await mkdir(cache,{recursive:true});
const cases = [
  {name:'desktop',viewport:{width:1440,height:900}},
  {name:'tablet',viewport:{width:768,height:1024}},
  {name:'narrow-desktop',viewport:{width:390,height:844}},
  {name:'mobile',...devices['iPhone 13'],viewport:{width:390,height:844},defaultBrowserType:undefined}
];
const results=[];
const errors=[];
async function open(options, baseline) {
  const context=await browser.newContext({...options,deviceScaleFactor:1,reducedMotion:'no-preference'});
  await context.addInitScript(()=>{Math.random=()=>0.271828;});
  await context.route('https://**/*',async route=>{
    const url=route.request().url();
    if(url.includes('/three@')) { await route.abort(); return; }
    const key=createHash('sha256').update(url).digest('hex');
    const file=path.join(cache,key+'.json');
    try {
      let asset;
      if(existsSync(file)) asset=JSON.parse(await readFile(file,'utf8'));
      else {
        const response=await route.fetch({timeout:20000});
        asset={status:response.status(),headers:response.headers(),body:(await response.body()).toString('base64')};
        await writeFile(file,JSON.stringify(asset));
      }
      await route.fulfill({status:asset.status,headers:asset.headers,body:Buffer.from(asset.body,'base64')});
    } catch { await route.abort(); }
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push({case:options.name,baseline,message:error.message}));
  await page.goto(origin+'/'+(baseline?'__baseline__/':'')+'MY-ColorVision/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.appLoaded === true);
  await page.waitForTimeout(3900); // Original home entrance + scroll lock finish.
  await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'*,*::before,*::after{animation-duration:1ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition:none!important;caret-color:transparent!important;} #cursor-canvas{visibility:hidden!important;}'});
  return {page,context};
}
async function scene(page,name){
  if(['home','education','cards'].includes(name)){
    await page.evaluate(name=>{
      const app=document.getElementById('app');
      app.style.scrollBehavior='auto';app.scrollTop=app.clientHeight*({home:0,education:1,cards:2}[name]);
    },name);
  } else {
    await page.evaluate(mode=>window.setMode(mode),name==='lab'?'lab':'test');
    await page.waitForTimeout(950);
    if(name!=='lab') await page.evaluate(async name=>{
      const base=new URL('.',location.href);
      const {state}=await import(new URL('js/state.js',base).href);
      state.mode='test';state.weakness='default';Math.random=()=>0.271828;
      if(name==='ishihara'){state.stageNumber=1;(await import(new URL('js/stages/ishihara.js',base).href)).renderIshiharaStage(1);}
      if(name==='sort'){state.stageNumber=4;(await import(new URL('js/stages/colorSort.js',base).href)).renderColorSortStage();}
      if(name==='rgb'){state.stageNumber=9;(await import(new URL('js/stages/rgbMatch.js',base).href)).renderRgbMatchStage();}
    },name);
  }
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForTimeout(150);
  const visibleHeading = await page.evaluate(() => [...document.querySelectorAll('h1,h2,.stage-badge')].some(el => {
    const r=el.getBoundingClientRect();
    if (!el.textContent.trim() || r.bottom<=0 || r.top>=innerHeight || r.width===0) return false;
    for(let node=el;node;node=node.parentElement) {
      const style=getComputedStyle(node);
      if(Number(style.opacity)<0.95 || style.visibility==='hidden' || style.display==='none') return false;
    }
    return true;
  }));
  if (!visibleHeading) throw new Error('Visual scene has no painted heading: '+name);
}
try {
  for(const options of cases){
    const before=await open(options,true);
    const after=await open(options,false);
    const scenes=options.name==='mobile'?['home','ishihara','sort','rgb','lab']:['home','education','cards','ishihara','sort','rgb','lab'];
    for(const name of scenes){
      await scene(before.page,name);await scene(after.page,name);
      const prefix=options.name+'-'+name;
      const a=await before.page.screenshot({path:path.join(output,prefix+'-before.png')});
      const b=await after.page.screenshot({path:path.join(output,prefix+'-after.png')});
      const aa=PNG.sync.read(a),bb=PNG.sync.read(b),diff=new PNG({width:aa.width,height:aa.height});
      const count=pixelmatch(aa.data,bb.data,diff.data,aa.width,aa.height,{threshold:0.1});
      if(count) await writeFile(path.join(output,prefix+'-diff.png'),PNG.sync.write(diff));
      const row={scene:prefix,diffPixels:count,totalPixels:aa.width*aa.height};
      results.push(row);console.log(JSON.stringify(row));
    }
    await before.context.close();await after.context.close();
  }
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(path.join(output,'report.json'),JSON.stringify({baseCommit,results,errors},null,2));
if(errors.length || results.some(row=>row.diffPixels>0)) process.exitCode=1;
