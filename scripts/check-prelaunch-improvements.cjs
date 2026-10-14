const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();const base='http://127.0.0.1:4173/';
 try{
  for(const [subject,expected] of Object.entries({volunteering:'Volunteering',partnership:'Partnerships',sponsorship:'Sponsorship & Donations',events:'Events & Activities'})){
   await page.goto(base+'contact.html?subject='+subject);
   assert.equal(await page.locator('#contact-subject').inputValue(),expected);
   assert.equal(await page.locator('#contact-program-field').isVisible(),false);
   assert.equal(await page.locator('button[type="submit"]').isDisabled(),true);
   if(subject==='partnership')assert.match(await page.locator('#contact-message').inputValue(),/partnership/);
  }
  const results=[];
  const files=fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'));
  for(const file of files){
   await page.setViewportSize({width:768,height:900});await page.goto(base+file.replaceAll('\\','/'));
   await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}))});
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].some(i=>!i.naturalWidth),h1:document.querySelectorAll('h1').length,unnamed:[...document.querySelectorAll('a,button,input:not([type=hidden]),select,textarea')].filter(e=>!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.querySelector('img[alt]')&&!(e.labels?.length)).map(e=>e.outerHTML),canonical:document.querySelector('link[rel=canonical]')?.href}));
   assert.equal(state.overflow,false,file);assert.equal(state.broken,false,file);assert.equal(state.h1,1,file);assert.deepEqual(state.unnamed,[],file);results.push({file,tablet:true});
  }
  for(const width of [1440,390])for(const file of ['index','about','soccer','nextgen','contact','get-involved','aaniin','ramadan','events']){
   await page.setViewportSize({width,height:900});await page.goto(base+file+'.html');
   await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}))});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,file);
   await page.screenshot({path:`review/prelaunch-${file}-${width}.png`,fullPage:true});
  }
  await page.goto(base+'soccer.html');assert.match(await page.locator('main').innerText(),/Ages 5–7[\s\S]*10:00–11:00 AM[\s\S]*Ages 8–10[\s\S]*11:00 AM–12:00 PM[\s\S]*Ages 11–13[\s\S]*12:00–1:00 PM/);
  await page.goto(base+'nextgen.html');assert.match(await page.locator('main').innerText(),/2026-10-17[\s\S]*2026-12-05/);
  await page.goto(base+'aaniin.html');assert.equal(await page.getByRole('link',{name:/^Ask About Joining/}).count(),1);await page.getByRole('link',{name:/^Ask About Joining/}).click();assert.equal(await page.locator('#contact-program').inputValue(),'aaniin');
  await page.goto(base+'events.html');for(const a of await page.getByRole('link',{name:/Program Information/}).all()){const href=await a.getAttribute('href');assert.ok(['soccer.html','nextgen.html','aaniin.html'].includes(href));}
  fs.writeFileSync('review/prelaunch-improvements-results.json',JSON.stringify(results,null,2));
  console.log('PASS: 29 tablet layouts, image loading, accessible control names, headings, enquiry subject prefills, verified schedules, Aaniin join flow, event destinations; 18 desktop/mobile screenshots.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
