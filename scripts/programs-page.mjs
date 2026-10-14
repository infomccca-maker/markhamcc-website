import {escapeHtml,registrationMarkup,sessionFacts} from './program-management.mjs';
const categories=['Youth & Sports','Seniors & Wellness','Skills & Discovery'];
const shapes=[
 '<circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6 5-4ZM12 7V3m5 8 4-2m-6 8 2 3M9 17l-2 3m0-9L3 9"/>',
 '<path d="M12 21V11m0 5C4 16 3 11 3 5c6 0 9 3 9 8m0-2c0-6 4-8 9-8 0 6-2 10-9 10"/>',
 '<path d="M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>'
];
const icon=i=>`<span class="program-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">${shapes[i]}</svg></span>`;
export function programsPage({records,section,link}){
 const review={status:'Local review',decision:'Catalogue design updated; centralized program data and registration logic unchanged. See PROGRAMS_PAGE_REVIEW.md.'};
 let body=`<div class="programs-page"><section class="page-intro"><p class="eyebrow">PROGRAMS</p><h1>Find Your Place at MCC.</h1><p class="lead">Explore sports, youth development, creative learning, seniors activities and community programs in Markham and across the Greater Toronto Area. There's something for every generation.</p><p class="program-tagline">Discover. Participate. Grow Together.</p>${link('Browse Programs','#P3-1')}<nav class="program-categories" aria-label="Program categories">${categories.map((cat,i)=>`<a href="#P3-${i+1}">${escapeHtml(cat)}</a>`).join('')}<a href="#P3-25">Community Celebrations</a></nav></section>`;
 for(const [i,category] of categories.entries()){
  const cards=records.filter(r=>r.kind==='program'&&r.category===category).map(r=>`<article class="card program-card">${icon(i)}<h3>${escapeHtml(r.name)}</h3><p class="program-description">${escapeHtml(r.description)}</p>${sessionFacts(r)}<div class="program-card-actions"><a class="program-detail" href="${escapeHtml(r.detailPageUrl)}">Explore program<span class="sr-only"> — ${escapeHtml(r.name)}</span><span aria-hidden="true"> ↗</span></a>${registrationMarkup(r)}</div></article>`).join('');
  body+=section('P3.'+(i+1),category,`<div class="cards program-grid">${cards}</div>`+(category==='Seniors & Wellness'?'<p class="program-context">Healthy aging is part of MCC’s seniors and wellness focus.</p>':''),review);
 }
 body+=section('P3.25','Community Celebrations',`<p>Explore MCC’s community gatherings, cultural celebrations and Ramadan Connect.</p><div class="celebration-links">${link('Explore Community Events','events.html')}${link('Explore Ramadan Connect','ramadan.html')}</div>`,review);
 body+=section('P3.4','Session information',records.some(r=>r.kind==='program'&&r.status)?'<p>See each program for its registration status and verified session details.</p>':'<p>Contact MCC about program availability and registration.</p>',review);
 return body+'</div>';
}
