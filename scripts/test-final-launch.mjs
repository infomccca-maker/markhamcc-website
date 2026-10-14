import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadRecords,registrationState,GENERAL_DONATION_URL} from './program-management.mjs';
import {onRequest} from '../functions/api/contact.js';
const files=fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'));
const credit='Website developed by Lemonzest Services with support from MCC Volunteers';
let contacts=0,donations=0,canonicals=0;
for(const file of files){
 const html=fs.readFileSync('dist/'+file,'utf8');
 assert.equal(html.split(`<p class="footer-credit">${credit}</p>`).length-1,1,file);
 assert.ok(html.indexOf('class="footer-credit"')>html.indexOf('class="footer-bottom"'),file);
 assert.ok(!/Website by Lemonzest Services/.test(html),file);
 for(const href of ['privacy.html','terms.html','accessibility.html','mailto:info@markhamcc.ca','tel:+14379071700'])assert.ok(html.includes(href),file);
 const canonical=[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
 assert.equal(canonical.length,file==='404.html'?0:1,file);
 if(canonical.length){assert.ok(canonical[0][1].startsWith('https://markhamcc.ca/'),file);canonicals++;}
 assert.ok(!/class="button register"/.test(html),file+' unexpected active registration');
 contacts+=(html.match(/class="button registration-contact"/g)||[]).length;
 for(const a of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g))if(a[1]===GENERAL_DONATION_URL){donations++;assert.match(a[0],/target="_blank"/);assert.match(a[0],/rel="noopener noreferrer"/);}
}
assert.equal(files.length,29);assert.equal(contacts,24);assert.equal(donations,62);assert.equal(canonicals,28);
const records=loadRecords(),rc=records.find(r=>r.id==='ramadan-2027');assert.equal(rc.status,'Coming Soon');assert.equal(registrationState(rc).active,false);assert.equal(rc.registrationUrl,'');
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8'),urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,27);assert.equal(new Set(urls).size,27);assert.ok(!sitemap.includes('/404.html'));assert.ok(!sitemap.includes('/ramadan-2027.html'));
assert.deepEqual(JSON.parse(fs.readFileSync('dist/_routes.json')),{version:1,include:['/api/contact'],exclude:[]});
const headers=fs.readFileSync('dist/_headers','utf8'),robots=fs.readFileSync('dist/robots.txt','utf8');
for(const name of ['Content-Security-Policy','X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy'])assert.ok(headers.includes(name));
const publicMode=process.env.SITE_MODE==='public';assert.equal(headers.includes('X-Robots-Tag: noindex'),!publicMode);assert.equal(robots.includes('Disallow: /'),!publicMode);if(publicMode)assert.ok(robots.includes('Allow: /')&&robots.includes('Sitemap: https://markhamcc.ca/sitemap.xml'));
const response=await onRequest({request:new Request('https://preview.invalid/api/contact'),env:{}});assert.equal(response.status,200);assert.deepEqual(await response.json(),{enabled:false,siteKey:null});
for(const f of ['functions','lib','data','.env','.dev.vars'])assert.equal(fs.existsSync('dist/'+f),false);
console.log(`PASS final launch: ${files.length} footer credits, ${canonicals} canonical tags, ${urls.length} sitemap URLs, ${contacts} enquiries, ${donations} donation links, RC2027 inactive, ${publicMode?'public':'preview'} indexing/security and disabled Function entry.`);
