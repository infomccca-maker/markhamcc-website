// One-time asset preparation. Uses sharp from the local dependency runtime.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
(async () => {
  const source = 'approved-assets';
  const dest = 'src/images';
  fs.mkdirSync(dest, { recursive: true });
  const manifest = {};
  for (const file of fs.readdirSync(source).filter(f => /\.(jpg|png)$/i.test(f))) {
    const input = path.join(source, file);
    const metadata = await sharp(input).rotate().toBuffer({ resolveWithObject: true });
    const { width, height } = metadata.info;
    const base = path.parse(file).name;
    if (file === 'mcc-official-logo.png') {
      fs.copyFileSync(input, path.join(dest, file));
      manifest[base] = { width, height, original: file };
      continue;
    }
    const widths = [...new Set([480, 800, 1200, 1600].map(w => Math.min(w, width)))];
    for (const size of widths) await sharp(input).rotate().resize({width:size, withoutEnlargement:true}).webp({quality:82}).toFile(path.join(dest, `${base}-${size}.webp`));
    manifest[base] = { width, height, widths };
  }
  fs.writeFileSync('src/images.json', JSON.stringify(manifest, null, 2));
  // Contact sheet for visual inspection of all supplied source photographs.
  const tiles=[];
  for(const [i,file] of fs.readdirSync(source).filter(f=>/\.(jpg|png)$/i.test(f)).entries()) {
    const image=await sharp(path.join(source,file)).rotate().resize(320,220,{fit:'contain',background:'#ffffff'}).png().toBuffer();
    const label=Buffer.from(`<svg width="320" height="30"><rect width="320" height="30" fill="white"/><text x="5" y="20" font-size="12">${file}</text></svg>`);
    tiles.push({input:image,left:(i%4)*320,top:Math.floor(i/4)*250},{input:label,left:(i%4)*320,top:Math.floor(i/4)*250+220});
  }
  fs.mkdirSync('review',{recursive:true});
  await sharp({create:{width:1280,height:Math.ceil(Object.keys(manifest).length/4)*250,channels:3,background:'#fff'}}).composite(tiles).png().toFile('review/asset-contact-sheet.png');
  console.log('Prepared responsive WebP copies without cropping; original logo preserved.');
})();
