import fs from 'node:fs';
// Match Cloudflare Pages' existing HTML-to-extensionless URL behavior.
export const publicPageUrl = file => 'https://markhamcc.ca/' + file.replaceAll('\\','/').replace(/index\.html$/,'').replace(/\.html$/,'');
export function writeLaunchFiles(out,mode=process.env.SITE_MODE||'preview'){
 if(!['preview','public'].includes(mode))throw Error('SITE_MODE must be preview or public');
 const files=fs.readdirSync(out,{recursive:true}).filter(f=>f.endsWith('.html'));
 const urls=files.filter(f=>!['404.html','ramadan-2027.html'].includes(f)).map(publicPageUrl);
 fs.writeFileSync(out+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')+'\n</urlset>\n');
 fs.writeFileSync(out+'/_routes.json',JSON.stringify({version:1,include:['/api/contact'],exclude:[]},null,2)+'\n');
 const publicRobots='User-agent: *\nAllow: /\nSitemap: https://markhamcc.ca/sitemap.xml\n';
 fs.writeFileSync(out+'/robots.txt',mode==='public'?publicRobots:'User-agent: *\nDisallow: /\n');
 fs.writeFileSync(out+'/_headers',`/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self' https://forms.office.com https://forms.cloud.microsoft https://www.zeffy.com https://zeffy.com
${mode==='preview'?'  X-Robots-Tag: noindex, nofollow\n':''}`);
 return {mode,urls};
}
