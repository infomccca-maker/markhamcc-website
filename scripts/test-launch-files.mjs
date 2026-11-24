import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {writeLaunchFiles} from './launch-files.mjs';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mcc-launch-test-'));
for(const name of ['index.html','privacy.html','404.html','ramadan-2027.html','ramadan-connect/2027/index.html']){fs.mkdirSync(path.dirname(path.join(tmp,name)),{recursive:true});fs.writeFileSync(path.join(tmp,name),'test')}
for(const mode of ['preview','public']){
 const result=writeLaunchFiles(tmp,mode);
 assert.equal(result.urls.length,3);assert.ok(result.urls.includes('https://markhamcc.ca/ramadan-connect/2027/'));
 assert.deepEqual(new Set(result.urls),new Set(['https://markhamcc.ca/','https://markhamcc.ca/privacy','https://markhamcc.ca/ramadan-connect/2027/']));
 const robots=fs.readFileSync(tmp+'/robots.txt','utf8'),headers=fs.readFileSync(tmp+'/_headers','utf8');
 assert.equal(robots.includes('Disallow: /'),mode==='preview');assert.equal(headers.includes('X-Robots-Tag: noindex'),mode==='preview');
 if(mode==='public')assert.match(robots,/Sitemap: https:\/\/markhamcc.ca\/sitemap.xml/);
 for(const name of ['Content-Security-Policy','X-Content-Type-Options','Referrer-Policy','Permissions-Policy'])assert.ok(headers.includes(name));
 assert.ok(!headers.includes('sandbox'));assert.ok(!headers.includes('navigate-to'));assert.ok(!headers.includes('unsafe-inline'));
}
assert.throws(()=>writeLaunchFiles(tmp,'invalid'));
// Studio review branches: forced preview (even if SITE_MODE=public is inherited) and no contact Function route.
writeLaunchFiles(tmp,'public',{CF_PAGES_BRANCH:'studio-content-renderer'});
assert.ok(fs.readFileSync(tmp+'/robots.txt','utf8').includes('Disallow: /'));assert.ok(fs.readFileSync(tmp+'/_headers','utf8').includes('X-Robots-Tag: noindex'));
assert.ok(!fs.readFileSync(tmp+'/_routes.json','utf8').includes('"/api/contact"'));
// The REAL branch names written by MCC Marketing Studio: studio/<kind>-<first 8 hex of the change id>.
for(const kind of ['news','event','gallery','funder','seo','page','program'])for(const mode of ['public','preview']){
 writeLaunchFiles(tmp,mode,{CF_PAGES_BRANCH:`studio/${kind}-0123abcd`,SITE_MODE:'public'});
 assert.ok(fs.readFileSync(tmp+'/robots.txt','utf8').includes('Disallow: /'),`${kind}/${mode}: noindex robots`);
 assert.ok(fs.readFileSync(tmp+'/_headers','utf8').includes('X-Robots-Tag: noindex'),`${kind}/${mode}: noindex header`);
 assert.ok(!fs.readFileSync(tmp+'/_routes.json','utf8').includes('"/api/contact"'),`${kind}/${mode}: contact not routed`);
}
writeLaunchFiles(tmp,'preview',{CF_PAGES_BRANCH:'mcc-website-v3'});
assert.ok(fs.readFileSync(tmp+'/_routes.json','utf8').includes('"/api/contact"'),'other branches keep the contact route');
writeLaunchFiles(tmp,'public',{CF_PAGES_BRANCH:'main'});
assert.ok(fs.readFileSync(tmp+'/_routes.json','utf8').includes('"/api/contact"'));
console.log('PASS: public/preview robots, sitemap, security headers and invalid-mode rejection.');
