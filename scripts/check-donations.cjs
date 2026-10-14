const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const url='https://www.zeffy.com/en-CA/donation-form/support-mcc-empowering-youth-and-building-community';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext();
 const page=await context.newPage();
 const results=[];
 try {
  for(const file of fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'))){
   await page.goto('http://127.0.0.1:4173/'+file.replaceAll('\\','/'));
   const links=await page.locator('a').evaluateAll(elements=>elements.filter(a=>/^Donate/.test(a.textContent.trim())).map(a=>({text:a.textContent.trim(),url:a.href,target:a.target,rel:a.rel,background:getComputedStyle(a).backgroundColor,color:getComputedStyle(a).color})));
   assert.ok(links.length>=2,file);
   for(const link of links){assert.equal(link.url,url,file);assert.equal(link.target,'_blank',file);assert.ok(link.rel.includes('noopener')&&link.rel.includes('noreferrer'),file);assert.equal(link.background,'rgb(61, 219, 184)',file);assert.equal(link.color,'rgb(28, 28, 28)',file);}
   results.push({file,buttons:links.length});
  }
  await page.goto('http://127.0.0.1:4173/donate.html');
  const note="Good to know: Zeffy may suggest an optional contribution to support its free platform. You can select 'Other' and enter $0 if you prefer. Your donation to MCC will not be reduced.";
  assert.ok((await page.locator('main').textContent()).includes(note));
  // Verify real new-tab behaviour without sending any request or payment to Zeffy.
  await context.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:'<title>Donation navigation test</title>'}));
  const popupPromise=page.waitForEvent('popup');
  await page.getByRole('link',{name:'Donate through Zeffy'}).click();
  const popup=await popupPromise;await popup.waitForLoadState();
  assert.equal(popup.url(),url);assert.equal(await popup.evaluate(()=>window.opener),null);
  const report={pages:results.length,buttons:results.reduce((n,r)=>n+r.buttons,0),url,allAttributesAndColoursPassed:true,approvedNotePassed:true,newTabAndNoOpenerPassed:true,externalServiceAvailabilityTested:false,results};
  fs.writeFileSync('review/donation-check-results.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
 } finally {await browser.close();}
})();
