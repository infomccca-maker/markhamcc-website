import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contactRegistration,loadRecords,validateRecords,registrationState,registrationMarkup,sessionFacts,validRegistrationUrl,GENERAL_DONATION_URL} from './program-management.mjs';
const records=loadRecords();
const original=fs.readFileSync('data/programs.json','utf8');
const sample=structuredClone(records.find(r=>r.id==='soccer'));
// Hypothetical transitions in memory only; no program availability is changed.
const output=[];
for(const status of ['Coming Soon','Open','Closed','Completed',null]){
 const record={...sample,status};const state=registrationState(record);
 assert.equal(state.active,false);assert.ok(!registrationMarkup(record).includes('class="button register"'));
 assert.equal(contactRegistration(record),!["Closed","Completed"].includes(status));
 assert.equal(registrationMarkup(record).includes('href="/contact.html?subject=registration&amp;program='+record.id+'"'),contactRegistration(record));
 output.push({contactButton:contactRegistration(record),status:status||'Unverified',registrationUrl:'',message:state.message,registerButton:false});
}
for(const url of [GENERAL_DONATION_URL,GENERAL_DONATION_URL+'?source=program',GENERAL_DONATION_URL+'#register','javascript:alert(1)','https://www.zeffy.com.evil.invalid/en-CA/ticketing/test']){
 const record={...sample,status:'Open',registrationProvider:'Zeffy',registrationUrl:url};
 assert.equal(validRegistrationUrl(record),false);assert.equal(registrationState(record).active,false);assert.throws(()=>validateRecords([record]));
}
// Real campaign URL seen in the earlier audit research; syntax fixture only.
// This does not verify campaign availability, assign it to a program or emit it into dist.
const syntaxFixture='https://www.zeffy.com/en-CA/ticketing/mcc-family-and-community-picnic-registration-and-payment';
const fixture={...sample,status:'Open',registrationProvider:'Zeffy',registrationUrl:syntaxFixture};
assert.equal(registrationState(fixture).active,true);
assert.match(registrationMarkup(fixture),/target="_blank" rel="noopener noreferrer"/);
for(const status of ['Coming Soon','Closed','Completed',null])assert.equal(registrationState({...fixture,status}).active,false);
assert.equal(validRegistrationUrl({...fixture,registrationProvider:'Microsoft Forms'}),false);
assert.throws(()=>validateRecords([{...sample,status:'Available'}]));
assert.throws(()=>validateRecords([{...sample,startDate:'2026-02-30'}]));
assert.throws(()=>validateRecords([{...sample,startDate:'2026-12-31',endDate:'2026-01-01'}]));
assert.throws(()=>validateRecords([sample,sample]));
assert.equal(sessionFacts(sample),'');
assert.equal(fs.readFileSync('data/programs.json','utf8'),original);
fs.writeFileSync('review/registration-status-demo.json',JSON.stringify({note:'Hypothetical in-memory Soccer Academy status changes; no data file changes and no registration URL supplied.',transitions:output},null,2));
console.log('PASS: status matrix, URL/provider validation, donation rejection, date validation, duplicate IDs and empty-field suppression.');
console.log('Local example: Coming Soon → Open with an empty URL still shows no Register Now button. Central data is unchanged.');

for(const record of records.filter(r=>r.category==='Ramadan Connect'))assert.equal(contactRegistration(record),false);
assert.equal(contactRegistration(fixture),false);
