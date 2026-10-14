import {SUBJECTS} from '../lib/contact-service.mjs';
import {escapeHtml,contactRegistration} from './program-management.mjs';
export function contactForm(records){
 return `<form id="contact-form" class="contact-form" action="/api/contact" method="post">
 <p>Required fields are marked with an asterisk. Contacting MCC does not guarantee program registration.</p>
 <div class="contact-fields"><div><label for="contact-name">Full Name *</label><input id="contact-name" name="name" autocomplete="name" maxlength="100" required></div>
 <div><label for="contact-email">Email Address *</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required></div>
 <div><label for="contact-phone">Phone Number (optional)</label><input id="contact-phone" name="phone" type="tel" autocomplete="tel" maxlength="40"></div>
 <div><label for="contact-subject">Subject *</label><select id="contact-subject" name="subject" required><option value="">Select a subject</option>${SUBJECTS.map(s=>`<option>${escapeHtml(s)}</option>`).join('')}</select></div></div>
 <div id="contact-program-field" hidden><label for="contact-program">Related program (optional)</label><select id="contact-program" name="programId"><option value="">Select a program</option>${records.filter(contactRegistration).map(r=>`<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`).join('')}</select></div>
 <label for="contact-message">Message *</label><textarea id="contact-message" name="message" rows="7" maxlength="5000" required></textarea>
 <div class="contact-honeypot" aria-hidden="true"><label for="contact-website">Leave this field empty</label><input id="contact-website" name="website" autocomplete="off" tabindex="-1"></div>
 <p>Please avoid sending sensitive health, financial or participant information. Read our <a href="privacy.html">Privacy Policy</a>.</p>
 <div id="contact-challenge" aria-label="Security check"></div><p id="contact-service-status" role="status">Checking online messaging availability…</p>
 <button class="button" type="submit" disabled>Send Message</button><p id="contact-result" role="status" aria-live="polite" tabindex="-1"></p>
 <noscript><p>Online messaging requires JavaScript. You can still call 437-907-1700 or email info@markhamcc.ca.</p></noscript>
 </form>`;
}
