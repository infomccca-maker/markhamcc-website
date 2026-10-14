const form=document.querySelector('#contact-form');
if(form){
 const fields=form.elements,button=form.querySelector('button[type="submit"]'),result=document.querySelector('#contact-result'),service=document.querySelector('#contact-service-status');
 const programField=document.querySelector('#contact-program-field');let token='',widget=null,ready=false,busy=false,attempt=null,lastPayload='';
 const syncProgram=()=>{programField.hidden=fields.subject.value!=='Program Registration';if(programField.hidden)fields.programId.value=''};
 fields.subject.addEventListener('change',syncProgram);
 const params=new URLSearchParams(location.search),program=params.get('program');
 if(params.get('subject')==='registration'&&program&&[...fields.programId.options].some(o=>o.value===program)){
  fields.subject.value='Program Registration';fields.programId.value=program;
  fields.message.value=`Hello MCC, I would like to register for ${fields.programId.selectedOptions[0].textContent}. Please share registration details.`;
 }
 syncProgram();
 const show=(message,error=false)=>{result.textContent=message;result.classList.toggle('form-error',error);result.focus()};
 const unavailable=()=>{ready=false;button.disabled=true;service.textContent='Online messaging is not available yet. Please call 437-907-1700 or email info@markhamcc.ca. No message has been sent.'};
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  for(const field of [fields.name,fields.message])field.setCustomValidity(field.value.trim()?'':'Please complete this field.');
  if(!form.reportValidity())return;
  if(!ready||!token){show('Please complete the security check before sending.',true);return}
  const values=Object.fromEntries(['name','email','phone','subject','programId','message','website'].map(k=>[k,fields[k].value.trim()]));
  const fingerprint=JSON.stringify(values);if(fingerprint!==lastPayload||!attempt||Date.now()-Date.parse(attempt.submittedAt)>23*60*60*1000){attempt={requestId:crypto.randomUUID(),submittedAt:new Date().toISOString()};lastPayload=fingerprint}
  busy=true;button.disabled=true;button.textContent='Sending…';result.textContent='';
  try{
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,...attempt,token}),signal:AbortSignal.timeout(40000)});
   const data=await response.json();
   if(!response.ok||data.ok!==true||data.delivery!=='delivered')throw Error(data.error||'We could not confirm delivery. Please retry. Your message has been kept.');
   form.reset();syncProgram();attempt=null;lastPayload='';show('Thank you for contacting Markham Community Connect!\nYour message has been received. Our team will respond as soon as possible.');
  }catch(error){show(error.name==='TimeoutError'?'Delivery has not been confirmed. Please retry shortly. Your message has been kept.':error instanceof TypeError||error instanceof SyntaxError?'We could not confirm a response from the message service. Please retry shortly. Your message has been kept.':error.message||'We could not confirm delivery. Please retry.',true)}
  finally{busy=false;button.textContent='Send Message';token='';if(widget!==null)window.turnstile.reset(widget);button.disabled=false}
 });
 for(const field of [fields.name,fields.message])field.addEventListener('input',()=>field.setCustomValidity(''));
 fetch('/api/contact').then(r=>{if(!r.ok)throw Error();return r.json()}).then(config=>{
  if(!config.enabled||!config.siteKey){unavailable();return}
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
  script.onerror=unavailable;script.onload=()=>{try{widget=window.turnstile.render('#contact-challenge',{sitekey:config.siteKey,action:'mcc-contact',size:'flexible',callback:value=>{token=value;ready=true;button.disabled=busy;service.textContent='Security check complete.'},'expired-callback':()=>{token='';service.textContent='Please complete the security check again.'},'error-callback':()=>{token='';service.textContent='The security check could not load. Please retry or contact MCC by phone.'}})}catch{unavailable()}};
  service.textContent='Please complete the security check.';document.head.append(script);
 }).catch(unavailable);
}
