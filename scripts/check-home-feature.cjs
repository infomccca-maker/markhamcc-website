const {assertApprovedHome}=require('./home-assertions.cjs');
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();const results=[];
 try{
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});
   assert.equal((await page.goto('http://127.0.0.1:4173/')).status(),200);
   await assertApprovedHome(page);
   assert.equal(await page.locator('.hero + #P1-1a + #P1-2').count(),1);
   assert.equal(await page.locator('#P1-1a a').count(),1);
   assert.equal(await page.locator('#P1-1a a').getAttribute('href'),'/ramadan-connect/2027/');
   assert.equal(await page.locator('#P1-1a .home-rc-status').textContent(),'Registration Opening Soon');
   assert.match(await page.locator('#P1-1a img').getAttribute('src'),/ramadan-rc2026-bazaar/);
   assert.deepEqual(await page.locator('#P1-3 .card>.button').evaluateAll(bs=>bs.map(b=>b.childNodes[0].textContent.trim())),['Explore Youth Programs','Explore Seniors Programs','Explore Learning Programs']);
   for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(40)}
   await page.waitForTimeout(200);
   const state=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),buttonOverflow:[...document.querySelectorAll('#P1-3 .card>.button')].some(b=>b.scrollWidth>b.clientWidth||b.getBoundingClientRect().right>b.parentElement.getBoundingClientRect().right),columns:getComputedStyle(document.querySelector('#P1-1a')).gridTemplateColumns.split(' ').length,photoFit:getComputedStyle(document.querySelector('#P1-1a img')).objectFit}));
   assert.equal(state.overflow,false);assert.deepEqual(state.broken,[]);assert.equal(state.buttonOverflow,false);assert.equal(state.columns,width>700?2:1);assert.equal(state.photoFit,'contain');results.push(state);
   if(width===1440||width===390){
    const device=width===1440?'desktop':'mobile';await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:`review/homepage-${device}.png`,fullPage:true});
    await page.locator('#P1-1a').screenshot({path:`review/homepage-rc-feature-${device}.png`});
    await page.locator('#P1-3').screenshot({path:`review/homepage-programs-${device}.png`});
   }
   if(width<700){await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');}
   await page.getByRole('link',{name:'Explore Ramadan Connect 2027'}).click();await page.waitForURL('**/ramadan-connect/2027/');assert.equal(await page.locator('h1').textContent(),'Ramadan Connect 2027');
  }
  fs.writeFileSync('review/homepage-feature-test-results.json',JSON.stringify({results,otherHomepageContentPreserved:true,navigationPassed:true},null,2));
  console.log('PASS: homepage preserved except requested changes; four responsive widths; images; buttons; mobile menu; RC navigation.');
 }finally{await browser.close()}
})();
