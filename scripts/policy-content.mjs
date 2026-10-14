import fs from 'node:fs';
import {escapeHtml} from './program-management.mjs';
export const policies=JSON.parse(fs.readFileSync('src/policies.json','utf8'));
export function policyBody(policy){
 const inline=text=>escapeHtml(text).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/Contact page/g,'<a href="contact.html">Contact page</a>').replace(/MCC&#39;s Privacy Policy/g,'<a href="privacy.html">MCC&#39;s Privacy Policy</a>');
 return policy.blocks.map(block=>block.startsWith('### ')?`<h3>${inline(block.slice(4))}</h3>`:block.startsWith('- ')?`<ul>${block.split('\n').map(line=>`<li>${inline(line.slice(2))}</li>`).join('')}</ul>`:`<p>${inline(block).replaceAll('\n','<br>')}</p>`).join('');
}
