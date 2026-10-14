const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();const results=[];
 try {
  for(const file of fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'))){
   await page.goto('http://127.0.0.1:4173/'+file.replaceAll('\\','/'));
   const check=await page.locator('footer').evaluate(footer=>({
    phone:footer.querySelector('a[href^="tel:"]')?.getAttribute('href'),email:footer.querySelector('a[href^="mailto:"]')?.getAttribute('href'),
    socials:[...footer.querySelectorAll('.social-links a')].map(a=>({url:a.href,target:a.target,rel:a.rel,label:a.getAttribute('aria-label'),height:a.getBoundingClientRect().height})),
    youtube:footer.querySelector('a[href*="youtube.com"]')?.getAttribute('aria-label'),
    stale:document.body.textContent.includes('markhamcc.org'),youtubeLinked:!!document.querySelector('a[href*="youtube.com"]')
   }));
   assert.equal(check.phone,'tel:+14379071700');assert.equal(check.email,'mailto:info@markhamcc.ca');assert.equal(check.stale,false);assert.equal(check.youtubeLinked,true);
   assert.deepEqual(check.socials.map(a=>a.url),['https://www.facebook.com/MarkhamCC','https://www.instagram.com/markhamcc/','https://www.youtube.com/@markham_CC']);
   for(const social of check.socials){assert.equal(social.target,'_blank');assert.ok(social.rel.includes('noopener')&&social.rel.includes('noreferrer'));assert.ok(social.label.startsWith('MCC on '));assert.ok(social.height>=44);}
   assert.equal(check.youtube,'MCC on YouTube');results.push({file,passed:true});
  }
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173/contact.html');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.locator('main a[href="tel:+14379071700"]').textContent(),'437-907-1700');
   await page.getByRole('link',{name:'MCC on Facebook (opens in a new tab)'}).first().focus();
   assert.ok(await page.evaluate(()=>document.activeElement.getAttribute('href').includes('facebook.com')));
   const focus=await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle);assert.notEqual(focus,'none');
   await page.locator('footer').scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>[...document.images].some(i=>!i.complete||!i.naturalWidth)),false);
   if(width!==320)await page.locator('footer').screenshot({path:`review/contact-footer-${width}.png`});
   await page.evaluate(()=>scrollTo(0,0));if(width!==320)await page.screenshot({path:`review/contact-${width}.png`,fullPage:true});
  }
  const youtube='https://www.youtube.com/@markham_CC';
  await page.context().route(youtube,route=>route.fulfill({status:200,contentType:'text/html',body:'<title>Local link destination test</title>'}));
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});const opened=page.waitForEvent('popup');await page.getByRole('link',{name:'MCC on YouTube',exact:true}).first().click();const tab=await opened;await tab.waitForLoadState();assert.equal(tab.url(),youtube);assert.equal(await tab.evaluate(()=>window.opener),null);await tab.close();}
  fs.writeFileSync('review/contact-check-results.json',JSON.stringify({pages:results.length,footerLinksAndAccessibleLabelsPassed:true,mobileWidths:[390,320],keyboardFocusPassed:true,youTubeActive:true,desktopMobileNewTabPassed:true,remoteSocialAvailabilityTested:false,results},null,2));
  console.log('PASS: all 29 footers; contact links; secure social attributes; accessible names/focus; desktop and mobile overflow/image checks; YouTube new-tab navigation.');
 }finally{await browser.close()}
})();
