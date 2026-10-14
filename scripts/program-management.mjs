import fs from 'node:fs';

export const GENERAL_DONATION_URL='https://www.zeffy.com/en-CA/donation-form/support-mcc-empowering-youth-and-building-community';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validRegistrationUrl(record){
 try {
  const url=new URL(record.registrationUrl);
  if(url.protocol!=='https:'||url.username||url.password||url.port)return false;
  // All Zeffy donation campaigns are excluded, including query/fragment variants.
  if(record.registrationProvider==='Zeffy')return ['zeffy.com','www.zeffy.com'].includes(url.hostname)&&/^\/(?:en-CA|fr-CA|en-US)\/ticketing\/[^/]+\/?$/.test(url.pathname);
  if(record.registrationProvider==='Microsoft Forms'){
   if(url.hostname==='forms.office.com'||url.hostname==='forms.cloud.microsoft')return /^\/r\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)||(/^\/Pages\/ResponsePage\.aspx$/i.test(url.pathname)&&!!url.searchParams.get('id'));
  }
  return false;
 }catch{return false;}
}
export function validateRecords(records){
 if(!Array.isArray(records))throw Error('programs.json must contain a records array.');
 const ids=new Set(),sections=new Set();
 for(const r of records){
  const fail=message=>{throw Error(`${r.id||'Record'}: ${message}`)};
  if(!/^[a-z0-9-]+$/.test(r.id)||ids.has(r.id))fail('id must be unique lowercase letters/numbers/hyphens');ids.add(r.id);
  for(const key of ['name','category','description','detailPageUrl'])if(typeof r[key]!=='string'||!r[key].trim())fail(`${key} is required`);
  if(!['program','event','hub'].includes(r.kind))fail('kind must be program, event or hub');
  if(!['Youth & Sports','Seniors & Wellness','Skills & Discovery','Ramadan Connect','Aaniin Community Hub','Community Events'].includes(r.category))fail('category must match an existing MCC category');
  if(![null,'Open','Coming Soon','Closed','Completed'].includes(r.status))fail('status must be Open, Coming Soon, Closed, Completed or null (unverified)');
  if(![null,'Microsoft Forms','Zeffy'].includes(r.registrationProvider))fail('registrationProvider must be Microsoft Forms, Zeffy or null');
  if(typeof r.registrationUrl!=='string')fail('registrationUrl must be a string (empty when unknown)');
  if(r.registrationUrl&&!validRegistrationUrl(r))fail('registration URL must be an HTTPS Forms response link or Zeffy ticketing link matching its provider; donation URLs are forbidden');
  if(!/^(?:[a-z0-9-]+\.html|\/(?:[a-z0-9-]+\/)+)(?:#[A-Za-z0-9-]+)?$/.test(r.detailPageUrl))fail('detailPageUrl must be a local HTML page or permanent directory URL, optionally with an anchor');
  if(r.kind==='program'){for(const key of ['detailSection','registrationSection']){if(!/^P3\.\d+$/.test(r[key])||sections.has(r[key]))fail(`${key} must be a unique stable P3 section reference`);sections.add(r[key]);}if(r.detailPageUrl.includes('#'))fail('program detailPageUrl must be a page without an anchor');}
  if(r.category==='Community Events'&&!['P4.2','P4.3'].includes(r.listingSection))fail('community events need listingSection P4.2 or P4.3');
  for(const key of ['startDate','endDate'])if(r[key]!==null){const date=r[key];if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)fail(`${key} must be a real YYYY-MM-DD date or null`)}
  if(r.startDate&&r.endDate&&r.endDate<r.startDate)fail('endDate cannot precede startDate');
  for(const key of ['ageEligibility','registrationFee'])if(r[key]!==null&&(typeof r[key]!=='string'||!r[key].trim()))fail(`${key} must be verified text or null`);
  if(r.approvedPhotograph!==null){if(typeof r.approvedPhotograph!=='object'||!/^[a-z0-9-]+$/.test(r.approvedPhotograph.asset)||typeof r.approvedPhotograph.alt!=='string'||!r.approvedPhotograph.alt)fail('approvedPhotograph requires a prepared asset name and meaningful alt text');if(!fs.existsSync('src/images.json')||!JSON.parse(fs.readFileSync('src/images.json','utf8'))[r.approvedPhotograph.asset])fail('approvedPhotograph asset is not prepared')}
 }
 return records;
}
export function loadRecords(file='data/programs.json'){return validateRecords(JSON.parse(fs.readFileSync(file,'utf8')).records)}
export function registrationState(record){
 if(record.status==='Open'&&record.registrationApproved!==false&&validRegistrationUrl(record))return {active:true,message:'Registration open'};
 return {active:false,message:record.status==='Coming Soon'?'Coming soon — registration is not open.':record.status==='Closed'?'Registration closed.':record.status==='Completed'?'Completed — registration has ended.':record.status==='Open'?'Registration information will be available once confirmed.':'Registration availability is awaiting confirmation.'};
}
export function registrationMarkup(record){
 const state=registrationState(record);
 const contact=contactRegistration(record);
 return `<div class="registration-status" data-program-id="${escapeHtml(record.id)}" data-status="${escapeHtml(record.status||'Unverified')}"><p class="status-message">${escapeHtml(state.message)}</p>${state.active?`<a class="button register" href="${escapeHtml(record.registrationUrl)}" target="_blank" rel="noopener noreferrer">Register Now<span class="sr-only"> for ${escapeHtml(record.name)} (opens in a new tab)</span></a>`:contact?`<a class="button registration-contact" href="/contact.html?subject=registration&amp;program=${encodeURIComponent(record.id)}">Contact Us to Register<span class="sr-only"> — ${escapeHtml(record.name)}</span></a><p class="registration-note">Contacting MCC does not guarantee registration. Availability and participation must be confirmed by MCC.</p>`:''}</div>`;
}
export function contactRegistration(record){
 // Archive/general event themes are not evidence of a current offering.
 return !registrationState(record).active && !['Closed','Completed'].includes(record.status)
  && record.category!=='Ramadan Connect'
  && (['program','hub'].includes(record.kind)||['Open','Coming Soon'].includes(record.status));
}
export function sessionFacts(record){
 const facts=[['Start date',record.startDate],['End date',record.endDate],['Age eligibility',record.ageEligibility],['Registration fee',record.registrationFee]].filter(([,value])=>value!==null);
 return facts.length?`<dl class="session-facts">${facts.map(([label,value])=>`<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`:'';
}
export function managementReview(records){return '\n## Central program and event registration\n\nEdit data/programs.json; null means unverified, not Coming Soon. Open requires a valid provider response/ticketing URL. Project dates do not determine enrollment.\n\n| Record | Status | Registration |\n|---|---|---|\n'+records.map(r=>`| ${r.name} | ${r.status||'Needs verification'} | ${registrationState(r).active?'Active Register Now':contactRegistration(r)?'Contact Us to Register — MCC must confirm availability':registrationState(r).message} |`).join('\n')+'\n';}
