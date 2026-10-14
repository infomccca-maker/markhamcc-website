import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');let errors=[],links=0;
const files=fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'));
for(const f of files){
 const html=fs.readFileSync(path.join(root,f),'utf8');
 for(const requirement of ['<html lang="en">','name="viewport"','name="description"','<h1>','id="main"','<footer>'])if(!html.includes(requirement))errors.push(`${f}: missing ${requirement}`);
 if((html.match(/<h1>/g)||[]).length!==1)errors.push(`${f}: expected one h1`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)errors.push(`${f}: duplicate IDs`);
 const urls=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]);
 for(const m of html.matchAll(/srcset="([^"]+)"/g))urls.push(...m[1].split(',').map(v=>v.trim().split(' ')[0]));
 for(const raw of urls){
  if(/^(https?:|mailto:|tel:)/.test(raw))continue;
  links++;const url=new URL(raw,'http://local/'+f.replaceAll('\\','/'));
  let target=path.join(root,decodeURIComponent(url.pathname));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){errors.push(`${f}: missing ${raw}`);continue}
  if(url.hash&&!fs.readFileSync(target,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))errors.push(`${f}: missing anchor ${raw}`);
 }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`PASS: ${files.length} pages; ${links} local links/assets checked; metadata, headings and IDs checked.`);
