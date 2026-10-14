import fs from 'node:fs';
const assets=JSON.parse(fs.readFileSync('data/pet-plant-images.json','utf8'));
const allowed=id=>assets[id].publicationApproved||process.env.SITE_MODE!=='public';
function image(id,alt,{logo=false,hero=false}={}){
 if(!allowed(id))return '';
 const a=assets[id];
 return `<img class="${logo?'ppp-logo':'ppp-photo'}" src="/assets/images/${id}-${logo?400:800}.webp" srcset="${a.widths.map(w=>`/assets/images/${id}-${w}.webp ${w}w`).join(', ')}" sizes="${logo?'(max-width: 700px) 180px, 260px':'(max-width: 700px) 88vw, 540px'}" width="${a.width}" height="${a.height}" alt="${alt}" loading="${hero?'eager':'lazy'}" decoding="async">`;
}
export const petLogo=(hero=false)=>image('ppp-logo','Official Pet Plant Program logo — PPP with bird and leaf motifs',{logo:true,hero});
export function petGallery(){
 const photos=[
 ['pet-plant-gathering','People gathered around tables of potted plants','Pet Plant in Action'],
 ['pet-plant-display','Potted seedlings and flowering plants arranged on tables','Gardening & Plant Care'],
 ['pet-plant-sharing','People sharing potted plants beside a plant display','Sharing Plants and Knowledge'],
 ['pet-plant-connections','People holding potted plants beside a display table','Community Connections'],
 ['pet-plant-rb','A man holding a microphone against a background of potted plants','A moment from Pet Plant']
 ];
 return `<div class="ppp-gallery">${photos.filter(([id])=>allowed(id)).map(([id,alt,caption])=>`<figure>${image(id,alt)}<figcaption>${caption}</figcaption></figure>`).join('')}</div>`;
}
export function homePetFeature(link){return `<section class="section home-pet-feature" id="P1-4a" aria-labelledby="home-pet-title"><div class="home-pet-copy"><p class="eyebrow">Featured Community Initiative</p>${petLogo()}<h2 id="home-pet-title">Pet Plant Program</h2><p class="lead">Growing Plants. Nurturing Connections.</p><p>Founded and actively led by Khurshid Chishti, with MCC supporting the initiative through volunteers, outreach and community assistance.</p>${link('Explore Pet Plant Program','/pet-plant.html')}</div><figure>${image('pet-plant-rb','Khurshid Chishti holding a microphone against a background of potted plants')}</figure></section>`;}
