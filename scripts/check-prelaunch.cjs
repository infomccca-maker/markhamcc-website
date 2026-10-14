const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage();const files=fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'));const errors=[];const results=[];let contacts=0;
 const headers=Object.fromEntries(fs.readFileSync('dist/_headers','utf8').split('\n').filter(s=>s.startsWith('  ')).map(s=>{const i=s.indexOf(':');return [s.slice(0,i).trim().toLowerCase(),s.slice(i+1).trim()]}));
 // Model Pages static headers locally without changing or configuring Cloudflare.
 await page.route('http://127.0.0.1:4173/**',async route=>{const r=await route.fetch();await route.fulfill({response:r,headers:{...r.headers(),...headers}})});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
  for(const width of [1440,390,320])for(const file of files){
   await page.setViewportSize({width,height:900});assert.equal((await page.goto('http://127.0.0.1:4173/'+file.replaceAll('\\','/'))).status(),200);
   await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}))});
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,missingAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,placeholders:document.querySelectorAll('.photo-placeholder,.review-banner,.pending').length,contactLinks:[...document.querySelectorAll('.registration-contact')].map(a=>a.getAttribute('href')),footerLinks:[...document.querySelectorAll('.footer-bottom a')].map(a=>new URL(a.href).pathname)}));
   assert.equal(state.overflow,false,`${file} ${width}`);assert.equal(state.broken,0);assert.equal(state.missingAlt,0);assert.equal(state.placeholders,0);
   state.contactLinks.forEach(href=>{const u=new URL(href,'http://local');assert.equal(u.pathname,'/contact.html');assert.equal(u.searchParams.get('subject'),'registration');assert.ok(u.searchParams.get('program'))});assert.deepEqual(state.footerLinks,['/privacy.html','/terms.html','/accessibility.html']);
   if(width===1440)contacts+=state.contactLinks.length;
   if(width===390){await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');}
   results.push({file,width,passed:true});
  }
  for(const policy of JSON.parse(fs.readFileSync('src/policies.json'))){
   await page.goto('http://127.0.0.1:4173/'+policy.slug+'.html');assert.equal(await page.locator('h1').textContent(),policy.title);
   const text=await page.locator('main').innerText();assert.ok(text.includes('October 12, 2026'));assert.ok(!/unapproved draft|Do not claim|Describe only/.test(text));
   for(const block of policy.blocks){const clean=block.replace(/^### /,'').replaceAll('**','').replace(/^- /gm,'').replace(/\s+/g,' ').trim();assert.ok(text.replace(/\s+/g,' ').includes(clean),`${policy.slug}: ${clean}`)}
   for(const a of await page.locator('main a').all())assert.ok(['contact.html','privacy.html'].includes(await a.getAttribute('href')));
   await page.screenshot({path:`review/${policy.slug}-prelaunch-mobile.png`,fullPage:true});
  }
  await page.goto('http://127.0.0.1:4173/soccer.html');await page.locator('.registration-contact').click();await page.waitForURL('**/contact.html?subject=registration&program=soccer');
  await page.goto('http://127.0.0.1:4173/ramadan-connect/2027/');assert.equal(await page.locator('.registration-contact,.register').count(),0);
  await page.locator('summary').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('details').first().getAttribute('open'),'');
  assert.deepEqual(errors,[],'Browser or CSP errors');
  for(const file of fs.readdirSync('dist',{recursive:true}).filter(f=>/\.(html|js|css|txt|xml)$/.test(f))){const s=fs.readFileSync('dist/'+file,'utf8');assert.ok(!/BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30}/.test(s),`Credential pattern: ${file}`)}
  fs.writeFileSync('review/prelaunch-results.json',JSON.stringify({pages:files.length,viewports:[1440,390,320],contacts,errors,securityHeadersEmulated:true,results},null,2));
  console.log(`PASS: ${files.length} pages at three widths, ${contacts} Contact Us to Register buttons, policy text, footer links, images, keyboard, CSP and basic generated-secret scan.`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
