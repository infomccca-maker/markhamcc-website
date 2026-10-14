const assert=require('node:assert/strict');
const fs=require('node:fs');
async function assertApprovedHome(page){
 const preserved=await page.evaluate(before=>{
  const old=new DOMParser().parseFromString(before,'text/html');
  const normalize=main=>{const copy=main.cloneNode(true);copy.querySelectorAll('#P1-4a, #P1-10').forEach(n=>n.remove());copy.querySelectorAll('.registration-status').forEach(n=>n.remove());const volunteer=copy.querySelector('#P1-8 .card');volunteer?.querySelectorAll('.pending,a').forEach(n=>n.remove());return copy.innerHTML};
  return normalize(old.querySelector('main'))===normalize(document.querySelector('main'));
 },fs.readFileSync('scripts/fixtures/homepage-before-prelaunch.html','utf8'));
 assert.equal(preserved,true,'Approved homepage content/order/images/layout changed outside requested registration updates');
 assert.equal(await page.locator('.hero + #P1-1a + #P1-2').count(),1);
 assert.equal(await page.locator('#P1-1a a').getAttribute('href'),'/ramadan-connect/2027/');
 assert.equal(await page.locator('#P1-1a .home-rc-status').textContent(),'Registration Opening Soon');
 assert.equal(await page.locator('#P1-4').count(),1);
 assert.equal(await page.locator('.dark-section + #P1-4a + #P1-5').count(),1);
 assert.equal(await page.locator('#P1-4a a').getAttribute('href'),'/pet-plant.html');
 assert.equal(await page.locator('#P1-4a img').count(),2);
 assert.deepEqual(await page.locator('#P1-3 .card>.button').evaluateAll(bs=>bs.map(b=>({text:b.childNodes[0].textContent.trim(),href:b.getAttribute('href')}))),[
  {text:'Explore Youth Programs',href:'soccer.html'},{text:'Explore Seniors Programs',href:'seniors-in-bloom.html'},{text:'Explore Learning Programs',href:'nextgen.html'}]);
 const contacts=page.locator('#P1-3 .registration-contact');assert.equal(await contacts.count(),3);
 for(const a of await contacts.all()){const u=new URL(await a.getAttribute('href'),'http://local');assert.equal(u.pathname,'/contact.html');assert.equal(u.searchParams.get('subject'),'registration');assert.equal(u.searchParams.get('program'),await a.locator('..').getAttribute('data-program-id'));assert.match(await a.textContent(),/^Contact Us to Register/)}
 assert.equal(await page.locator('#P1-8 a').first().getAttribute('href'),'contact.html');
 assert.equal(await page.locator('#P1-8 a').first().textContent(),'Contact Us to Volunteer ↗');
 return {approvedContent:true,registrationContact:true,rcComingSoon:true};
}
module.exports={assertApprovedHome};
