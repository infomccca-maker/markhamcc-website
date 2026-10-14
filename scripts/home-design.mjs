// Decorative icons only: approved page wording and content remain in build.mjs.
const paths = {
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v2"/>',
 community:'<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
 heart:'<path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 7l-1.1-1.2a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 5h3m4 0h3"/>',
 spark:'<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"/>',
 photo:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
 leaf:'<path d="M20 3C9 2 3 7 5 15s16 5 15-12ZM4 22 16 8"/>',
 hands:'<path d="m2 10 4-4 5 1 3-2 8 5-4 9-4 2-9-7m3-6 4 4 4-3m-9 4 7 7m-4-10 8 8"/>',
};
const icon=(name,color)=>`<span class="card-icon ${color}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg></span>`;
export function refineHome(html){
 const icons={
  'All Ages':['people','blue'], 'Community':['community','mint'], 'Together':['heart','orange'],
  'Upcoming Events':['calendar','orange'], 'Community Celebrations':['spark','blue'], 'Event Highlights':['photo','mint'],
  'Youth & Families':['people','blue'], 'Seniors & Connection':['leaf','mint'], 'Volunteers & Partnerships':['hands','orange'],
  'Volunteer':['heart','mint'], 'Partner & Sponsor':['hands','blue'], 'Support MCC':['community','orange'],
 };
 for(const [heading,[name,color]] of Object.entries(icons))html=html.replaceAll(`<h3>${heading}</h3>`,`${icon(name,color)}<h3>${heading}</h3>`);
 return html;
}
