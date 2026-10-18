const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const {handleContact}=await import('../lib/contact-service.mjs');const b=await chromium.launch({headless:true,channel:'msedge'});const page=await b.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4173/contact.html');await page.getByText('Online messaging is not available yet.',{exact:false}).waitFor();assert.equal(await page.getByRole('button',{name:'Send Message'}).isDisabled(),true);
  let state='accepted',posts=0;const sent=[],providerMethods=[];
  const env={CONTACT_ENABLED:'true',CONTACT_PROVIDER:'resend',RESEND_API_KEY:'simulated-only',CONTACT_FROM_EMAIL:'sender@example.org',TURNSTILE_SITE_KEY:'simulated-site-key',TURNSTILE_SECRET_KEY:'simulated-secret',CONTACT_ALLOWED_HOSTNAMES:'127.0.0.1'};
  await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({contentType:'application/javascript',body:`window.turnstile={render:(selector,options)=>{window.challengeOptions=options;options.callback('simulated-token');return 1},reset:()=>window.challengeOptions.callback('simulated-token')};`}));
  const securityHeaders=Object.fromEntries(fs.readFileSync('dist/_headers','utf8').split('\n').filter(l=>l.startsWith('  ')).map(l=>{const i=l.indexOf(':');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}));
  await page.route('http://127.0.0.1:4173/**',async route=>{
   const request=route.request();if(new URL(request.url()).pathname!=='/api/contact'){const r=await route.fetch();return route.fulfill({response:r,headers:{...r.headers(),...securityHeaders}})}
   if(request.method()==='POST')posts++;
   if(state==='network'&&request.method()==='POST')return route.abort();
   if(state==='invalid-response'&&request.method()==='POST')return route.fulfill({status:502,contentType:'text/html',body:'Service unavailable'});
   const response=await handleContact(new Request(request.url(),{method:request.method(),headers:request.headers(),...(request.method()==='POST'?{body:request.postData()}: {})}),env,{sleep:async()=>{},rateAllowed:async()=>state!=='limited',fetch:async(url,options)=>{
    if(url.includes('siteverify'))return Response.json({success:state!=='spam',hostname:'127.0.0.1',action:'mcc-contact'});
    providerMethods.push(options.method||'GET');
    if(url==='https://api.resend.com/emails'&&options.method==='POST'){sent.push(JSON.parse(options.body));return Response.json(state==='provider-error'?{error:'error'}:state==='missing-id'?{}:{id:'local-simulated-id'},{status:state==='provider-error'?500:200})}
    throw Error('Sending-only test: provider status retrieval is forbidden');
   }});return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
  });
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173/contact.html?subject=registration&program=soccer');await page.getByText('Security check complete.').waitFor();
   assert.equal(await page.locator('#contact-subject').inputValue(),'Program Registration');assert.equal(await page.locator('#contact-program').inputValue(),'soccer');assert.match(await page.locator('#contact-message').inputValue(),/register for Soccer Academy/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('#contact-name').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'contact-email');
   if(width===1440||width===390)await page.screenshot({path:`review/contact-form-${width}.png`,fullPage:true});
  }
  assert.deepEqual(await page.locator('#contact-subject option').allTextContents(),['Select a subject','Program Registration','Volunteering','Partnerships','Sponsorship & Donations','Events & Activities','Seniors Programs','General Inquiry']);
  for(const id of ['contact-name','contact-email','contact-subject','contact-message'])assert.equal(await page.locator('#'+id).getAttribute('required'),'');
  const before=posts;await page.getByRole('button',{name:'Send Message'}).click();assert.equal(posts,before);assert.equal(await page.locator('#contact-name').evaluate(e=>e.validity.valueMissing),true);
  await page.locator('#contact-name').fill('Local Browser Test');await page.locator('#contact-email').fill('invalid');await page.getByRole('button',{name:'Send Message'}).click();assert.equal(posts,before);assert.equal(await page.locator('#contact-email').evaluate(e=>e.validity.typeMismatch),true);
  await page.locator('#contact-email').fill('visitor@example.org');
  const originalMessage=await page.locator('#contact-message').inputValue();
  for(const fail of ['provider-error','missing-id','spam','limited','network','invalid-response']){
   state=fail;await page.getByRole('button',{name:'Send Message'}).click();await page.locator('#contact-result.form-error').waitFor();await page.getByRole('button',{name:'Send Message',exact:true}).waitFor();
   assert.equal(await page.locator('#contact-message').inputValue(),originalMessage);assert.equal(await page.locator('#contact-email').inputValue(),'visitor@example.org');assert.ok(!(await page.locator('#contact-result').textContent()).includes('Thank you'));
  }
  state='accepted';await page.getByRole('button',{name:'Send Message'}).click();await page.getByText('Thank you for contacting Markham Community Connect!',{exact:false}).waitFor();assert.equal(await page.locator('#contact-message').inputValue(),'');assert.equal(sent.at(-1).reply_to,'visitor@example.org');assert.deepEqual(sent.at(-1).to,['info@markhamcc.ca']);assert.match(await page.locator('#contact-result').textContent(),/submitted for delivery/);assert.doesNotMatch(await page.locator('#contact-result').textContent(),/message has been received|confirmed delivery|delivered/i);assert.ok(providerMethods.length>0&&providerMethods.every(method=>method==='POST'));
  const names=JSON.parse(fs.readFileSync('data/programs.json')).records.filter(r=>r.kind==='program'||r.kind==='hub');
  for(const r of names){await page.goto('http://127.0.0.1:4173/contact.html?subject=registration&program='+r.id);assert.equal(await page.locator('#contact-program').inputValue(),r.id);assert.ok((await page.locator('#contact-message').inputValue()).includes(r.name))}
  await page.goto('http://127.0.0.1:4173/contact.html?subject=registration&program='+encodeURIComponent('<script>alert(1)</script>'));assert.equal(await page.locator('#contact-message').inputValue(),'');
  assert.deepEqual(errors,[]);fs.writeFileSync('review/contact-form-results.json',JSON.stringify({simulatedOnly:true,actualEmailSent:false,viewports:[1440,768,390,320],programsPrefilled:names.length,requiredEmailValidation:true,errorMessagePreservation:true,providerAcceptanceRequired:true,providerRetrievalCalls:0,noInboxDeliveryClaim:true,keyboard:true,errors},null,2));
  console.log('PASS: contact form at four widths; keyboard; all 11 program prefills; required/invalid email; provider/spam/rate/network failures; preserved input; sending-only acceptance without inbox-delivery claims. Provider and Turnstile responses simulated; no email sent.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
