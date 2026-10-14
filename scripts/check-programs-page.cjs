const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const records=JSON.parse(fs.readFileSync('data/programs.json','utf8')).records.filter(r=>r.kind==='program');
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173/programs.html');
   assert.equal(await page.title(),'Community Programs in Markham | Markham Community Connect');
   assert.equal(await page.locator('h1').innerText(),'Find Your Place at MCC.');
   assert.equal(await page.locator('.program-card').count(),records.length);
   assert.equal(await page.locator('.program-categories').isVisible(),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   for(const r of records){const card=page.locator('.program-card').filter({has:page.locator(`[data-program-id="${r.id}"]`)});assert.equal(await card.locator('h3').innerText(),r.name);assert.equal(await card.locator('.program-description').innerText(),r.description);assert.equal(await card.locator('.program-detail').getAttribute('href'),r.detailPageUrl);}
   const links=page.locator('.program-categories a');
   for(let i=0;i<4;i++){await links.nth(i).focus();assert.ok(await links.nth(i).evaluate(e=>e===document.activeElement));assert.ok(await links.nth(i).evaluate(e=>e.getBoundingClientRect().height>=44));assert.notEqual(await links.nth(i).evaluate(e=>getComputedStyle(e).outlineStyle),'none');}
   await page.evaluate(()=>scrollTo(0,0));if(width===1440)assert.ok((await page.locator('#P3-1').boundingBox()).y<750);
   await page.getByRole('link',{name:'Browse Programs',exact:true}).click();assert.ok(page.url().endsWith('#P3-1'));
   await page.evaluate(()=>scrollTo(0,0));if(width===1440||width===390)await page.screenshot({path:`review/programs-${width}.png`,fullPage:true});
   console.log(`PASS Programs ${width}px: records, navigation, keyboard focus, layout and metadata.`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.program-card').first().evaluate(e=>getComputedStyle(e).animationName),'none');assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
