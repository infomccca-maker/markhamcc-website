const {assertApprovedHome}=require('./home-assertions.cjs');
const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage();const results=[];try{
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});const response=await page.goto('http://127.0.0.1:4173/ramadan-connect/2027/');assert.equal(response.status(),200);
  assert.equal(await page.locator('h1').textContent(),'Ramadan Connect 2027');
  for(let i=1;i<=9;i++)assert.equal(await page.locator('#RC27-'+i).count(),1);
  assert.equal(await page.locator('main .register').count(),0);
  assert.equal(await page.locator('main a[href*="zeffy.com"]').count(),0);
  assert.equal(await page.locator('.rc-nav').isVisible(),true);
  assert.ok((await page.locator('#RC27-9').textContent()).includes("Registration Opening Soon. We're preparing Ramadan Connect 2027 and will share registration details as activities are finalized. Stay connected for updates."));
  for(const a of await page.locator('.rc-nav a').all()){await a.click();const href=await a.getAttribute('href');assert.equal(await page.locator(href).count(),1);}
  const faq=page.locator('.rc-faq summary').first();await faq.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.rc-faq details').first().getAttribute('open'),'');await page.keyboard.press('Enter');
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(50)}await page.waitForTimeout(200);
  const state=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));assert.equal(state.overflow,false);assert.deepEqual(state.broken,[]);results.push(state);
  await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});
  if(width===1440||width===390){await page.screenshot({path:`review/rc2027-${width===1440?'desktop':'mobile'}.png`,fullPage:true});await page.screenshot({path:`review/rc2027-${width===1440?'desktop':'mobile'}-top.png`});}
 }
 await page.goto('http://127.0.0.1:4173/ramadan-2027.html');assert.equal(await page.locator('#RC27-9').count(),1);
 await page.goto('http://127.0.0.1:4173/');
 const preserved=await assertApprovedHome(page);
 await page.locator('#P1-1a a').click();await page.waitForURL('**/ramadan-connect/2027/');
 const social=await page.locator('footer .social-links a').count();assert.equal(social,3);
 fs.writeFileSync('review/rc2027-test-results.json',JSON.stringify({viewports:results,homepagePreserved:preserved,legacyAliasPassed:true,permanentNavigationPassed:true,registrationInactive:true,keyboardFaqPassed:true},null,2));console.log('PASS: RC27.1–RC27.9; four widths; image loading; anchors/FAQ keyboard; permanent and legacy paths; unchanged homepage text/photos; inactive registration.');
}finally{await browser.close()}})();
