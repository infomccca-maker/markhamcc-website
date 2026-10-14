const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173/pet-plant.html');
  assert.equal(await page.title(),'Pet Plant Program | Seniors Gardening & Wellness in Markham');assert.equal(await page.locator('h1').count(),1);
  const text=await page.locator('main').innerText();assert.match(text,/founded and actively led by Khurshid Chishti/);assert.match(text,/Founder & Current Program Lead — Khurshid Chishti/);assert.match(text,/MCC works alongside him/);assert.ok(!/100|NHSP|\$24,600|MCC-founded|treats|clinically|proven health/.test(text));
  assert.equal(await page.locator('main img').count(),6);assert.equal(await page.locator('main img[src*="pet-plant-rb-"]').count(),1);assert.equal(await page.locator('main .register').count(),0);assert.equal(await page.locator('[data-program-id="pet-plant"]').count(),1);
  for(const id of ['P3-10','P3-20','PP-1','PP-2','PP-3','PP-4','PP-5','PP-6'])assert.equal(await page.locator('#'+id).count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const link=page.getByRole('link',{name:'Ask About Pet Plant',exact:false});assert.equal(await link.getAttribute('href'),'/contact.html?subject=registration&program=pet-plant');await link.focus();assert.ok(await link.evaluate(e=>e===document.activeElement));assert.notEqual(await link.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  await page.locator('main img').evaluateAll(async imgs=>{for(const i of imgs){i.loading='eager';await i.decode();if(!i.alt||getComputedStyle(i).objectFit!=='contain')throw Error('Image alt/framing invalid');}});
  await page.evaluate(()=>scrollTo(0,0));if(width===1440||width===390)await page.screenshot({path:`review/pet-plant-${width}.png`,fullPage:true});
  await link.click();await page.locator('#contact-program').waitFor();assert.equal(await page.locator('#contact-program').inputValue(),'pet-plant');assert.equal(await page.locator('#contact-subject').inputValue(),'Program Registration');assert.match(await page.locator('#contact-message').inputValue(),/Pet Plant Program/);assert.equal(await page.locator('#contact-message').isEditable(),true);
  console.log(`PASS Pet Plant ${width}px: content, layout, focus and enquiry prefill.`);
 }
 await page.goto('http://127.0.0.1:4173/programs.html');assert.equal(await page.locator('#P3-2 a[href="pet-plant.html"]').count(),1);assert.ok(fs.readFileSync('dist/sitemap.xml','utf8').includes('https://markhamcc.ca/pet-plant.html'));assert.match(fs.readFileSync('dist/robots.txt','utf8'),/Disallow: \//);assert.deepEqual(errors,[]);
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
