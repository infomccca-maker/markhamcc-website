const {assertApprovedHome}=require('./home-assertions.cjs');
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();
 const results=[];
 for(const width of [1440,1024,768,700,390,320]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  const preserved=await assertApprovedHome(page);
  // Trigger below-the-fold image loading before captures and image checks.
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(60)}
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForTimeout(300);
  const check=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,menu:getComputedStyle(document.querySelector('.menu-toggle')).display,nav:getComputedStyle(document.querySelector('nav')).display,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),labels:getComputedStyle(document.querySelector('.section-label')).display}));
  if(check.overflow||check.broken.length||check.labels!=='none'||(width>700?check.menu!=='none':check.menu==='none'))throw Error(JSON.stringify(check));
  if(width<=700){await page.getByRole('button',{name:'Menu',exact:true}).click();if(await page.locator('.menu-toggle').getAttribute('aria-expanded')!=='true')throw Error('Menu did not open');await page.keyboard.press('Escape');if(await page.locator('.menu-toggle').getAttribute('aria-expanded')!=='false')throw Error('Escape did not close menu');}
  if(width===1440||width===390){await page.locator('.menu-toggle').evaluate(el=>el.blur());await page.screenshot({path:`review/homepage-${width===1440?'desktop':'mobile'}.png`,fullPage:true});await page.screenshot({path:`review/homepage-${width===1440?'desktop':'mobile'}-top.png`});for(const id of ['P1-3','P1-4','P1-5'])await page.locator('#'+id).screenshot({path:`review/${id}-${width}.png`});}
  check.preserved=preserved;
  check.pageHeight=await page.evaluate(()=>document.body.scrollHeight);
  results.push(check);
 }
 for(const file of ['aaniin.html','events.html','ramadan.html']){await page.goto('http://127.0.0.1:4173/'+file);const expected=await page.locator('.mcc-photo img').count();if(!expected)throw Error(file+' missing photos');results.push({file,photos:expected});}
 // About intentionally uses approved text until photo publication permission is confirmed.
 await page.goto('http://127.0.0.1:4173/about.html');
 if(await page.locator('main img').count()!==0||await page.locator('h1').innerText()!=='Our Story. Our Community.'||await page.locator('.about-page .section').count()!==7||!(await page.locator('#P2-1').innerText()).includes('established in 2024'))throw Error('Approved text-based About presentation changed');
 results.push({file:'about.html',photos:0,approvedTextPresentation:true});
 fs.writeFileSync('review/layout-check-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));await browser.close();
})();
