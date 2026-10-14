import catalogue from './program-catalogue.cjs';

export const SUBJECTS=['Program Registration','Volunteering','Sponsorship & Donations','Events & Activities','Seniors Programs','General Inquiry'];
export const RECIPIENT='info@markhamcc.ca';
export const emailPattern=/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const limits=new Map();
const unavailable='Online messaging is not available yet. Please call 437-907-1700 or email info@markhamcc.ca. Your message has not been sent.';
const reply=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex'}});
const knownProgram=id=>catalogue.records.find(r=>r.id===id&&r.category!=='Ramadan Connect'&&!['Closed','Completed'].includes(r.status)&&(r.kind==='program'||r.kind==='hub'||['Open','Coming Soon'].includes(r.status)));
function configured(env){return env.CONTACT_ENABLED==='true'&&env.CONTACT_PROVIDER==='resend'&&env.RESEND_API_KEY&&emailPattern.test(env.CONTACT_FROM_EMAIL||'')&&!/[\s\u0000-\u001f\u007f]/.test(env.CONTACT_FROM_EMAIL||'')&&env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET_KEY&&env.CONTACT_ALLOWED_HOSTNAMES;}
export function validateSubmission(data,now=Date.now()){
 if(!data||typeof data!=='object'||Array.isArray(data))return null;
 const max={name:100,email:254,phone:40,subject:40,message:5000,programId:80,website:200,token:2048,requestId:36,submittedAt:30};
 const value={};for(const [key,limit] of Object.entries(max)){if(typeof data[key]!=='string'||data[key].length>limit)return null;value[key]=data[key].trim();}
 if(!value.name||!emailPattern.test(value.email)||!SUBJECTS.includes(value.subject)||!value.message||value.website||!value.token)return null;
 if([value.name,value.email,value.phone,value.subject,value.programId].some(v=>/[\u0000-\u001f\u007f]/.test(v)))return null;
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value.message))return null;
 if(value.phone&&!/^[0-9+().\- xextEXT#]+$/.test(value.phone))return null;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId))return null;
 const date=Date.parse(value.submittedAt);if(!Number.isFinite(date)||date>now+60000||date<now-23*60*60*1000)return null;
 value.program=value.programId?knownProgram(value.programId):null;
 if(value.programId&&(!value.program||value.subject!=='Program Registration'))return null;
 return value;
}
async function rateAllowed(request,env,now){
 // Best-effort per-isolate limit; Turnstile is mandatory. Add an edge rule for distributed limits.
 const ip=request.headers.get('CF-Connecting-IP');if(!ip)return true;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.TURNSTILE_SECRET_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(ip));
 const id=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
 for(const [k,v] of limits)if(v.until<=now)limits.delete(k);
 if(limits.size>2000)limits.delete(limits.keys().next().value);
 const state=limits.get(id)||{count:0,until:now+600000};state.count++;limits.set(id,state);return state.count<=5;
}
async function readLimited(request){
 if(Number(request.headers.get('Content-Length'))>18000)throw Error('size');
 const reader=request.body?.getReader();if(!reader)throw Error('body');let size=0;const chunks=[];
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>18000){await reader.cancel();throw Error('size')}chunks.push(value)}
 const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length}return JSON.parse(new TextDecoder().decode(bytes));
}
export async function handleContact(request,env={},deps={}){
 const http=deps.fetch||fetch,now=deps.now||Date.now,sleep=deps.sleep||(ms=>new Promise(r=>setTimeout(r,ms)));
 const hostname=new URL(request.url).hostname;
 const ready=!!configured(env)&&env.CONTACT_ALLOWED_HOSTNAMES.split(',').map(h=>h.trim()).includes(hostname);
 if(request.method==='GET')return reply(200,{enabled:ready,siteKey:ready?env.TURNSTILE_SITE_KEY:null});
 if(request.method!=='POST')return reply(405,{ok:false,error:'Use the contact form to send a message.'});
 if(!ready)return reply(503,{ok:false,error:unavailable});
 if(request.headers.get('Origin')!==new URL(request.url).origin)return reply(403,{ok:false,error:'Please submit from the MCC Contact page.'});
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415,{ok:false,error:'Please submit using the contact form.'});
 let data;try{data=validateSubmission(await readLimited(request),now())}catch{return reply(400,{ok:false,error:'Please check your message and field lengths.'})}
 if(!data)return reply(400,{ok:false,error:'Please check the required fields, email address and security check.'});
 if(!await (deps.rateAllowed||rateAllowed)(request,env,now()))return reply(429,{ok:false,error:'Too many attempts. Please wait 10 minutes before trying again. Your message is still here.'});
 const call=(url,options)=>http(url,{...options,signal:AbortSignal.timeout(6000)});
 try{
  const verify=await call('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.token})});
  const challenge=await verify.json();
  if(!verify.ok||challenge.success!==true||challenge.hostname!==hostname||challenge.action!=='mcc-contact')return reply(400,{ok:false,error:'Please complete the security check again. Your message has been kept.'});
  // Plain text mail: no visitor-controlled HTML or headers. Recipient is fixed server-side.
  const payload={from:`MCC Website <${env.CONTACT_FROM_EMAIL}>`,to:[RECIPIENT],reply_to:data.email,subject:`MCC website — ${data.subject}`,text:[`Full name: ${data.name}`,`Email: ${data.email}`,`Phone: ${data.phone||'Not provided'}`,`Subject: ${data.subject}`,`Related program: ${data.program?.name||'Not specified'}`,`Submission date/time (UTC): ${new Date(data.submittedAt).toISOString()}`,'','Message:',data.message].join('\n')};
  const sent=await call('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`mcc-contact-${data.requestId}`},body:JSON.stringify(payload)});
  const result=await sent.json();
  if(!sent.ok||typeof result.id!=='string'||!result.id)return reply(502,{ok:false,error:'The email service could not process your message. Please retry shortly. Your message has been kept.'});
  // Acceptance alone is not delivery. Confirm the recipient mail server accepted it.
  for(let attempt=0;attempt<3;attempt++){
   await sleep(1200);
   const delivery=await call('https://api.resend.com/emails/'+encodeURIComponent(result.id),{headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`}});
   const status=await delivery.json();
   if(delivery.ok&&status.last_event==='delivered')return reply(200,{ok:true,delivery:'delivered'});
   if(!delivery.ok||['bounced','failed','suppressed','canceled'].includes(status.last_event))break;
  }
  return reply(502,{ok:false,error:'Delivery has not been confirmed yet. Please wait a moment and retry without changing the message. Your message has been kept.'});
 }catch{return reply(502,{ok:false,error:'We could not confirm delivery. Please try again shortly. Your message has been kept.'})}
}
