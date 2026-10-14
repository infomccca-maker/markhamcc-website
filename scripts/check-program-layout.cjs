const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage();const records=JSON.parse(fs.readFileSync('data/programs.json')).records;const {contactRegistration,registrationState}=await import('./program-management.mjs');const summary=[];const seen=new Set();try{
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  for(const file of fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'))){
   await page.goto('http://127.0.0.1:4173/'+file.replaceAll('\\','/'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${file} at ${width}`);
   const states=await page.locator('[data-program-id]').evaluateAll(elements=>elements.map(e=>({id:e.dataset.programId,status:e.dataset.status,text:e.querySelector('.status-message').textContent,active:!!e.querySelector('a.register'),contact:e.querySelector('.registration-contact')?.getAttribute('href')||null})));
   for(const state of states){const record=records.find(r=>r.id===state.id);assert.ok(record);assert.equal(state.status,record.status||'Unverified');assert.equal(state.active,registrationState(record).active);assert.equal(state.contact,contactRegistration(record)?'/contact.html?subject=registration&program='+record.id:null);seen.add(state.id)}
   summary.push({file,width,statuses:states.length,overflow:false});
   if(width!==320&&['programs.html','soccer.html','events.html','ramadan.html','aaniin.html','index.html'].includes(file)){
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=800){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(30)}
    await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>[...document.images].some(i=>!i.complete||!i.naturalWidth)),false);
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`review/managed-${file.replace('.html','')}-${width}.png`,fullPage:true});
   }
  }
 }
 for(const r of records)assert.ok(seen.has(r.id),`Missing record ${r.id}`);
 fs.writeFileSync('review/program-layout-results.json',JSON.stringify({records:seen.size,viewports:[1440,390,320],summary},null,2));
 console.log(`PASS: ${seen.size} managed records rendered; all 29 pages at three widths; no overflow or unverified Register Now links; representative images loaded.`);
}finally{await browser.close()}})();
