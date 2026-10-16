"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const config=JSON.parse(fs.readFileSync(path.join(root,"wrangler.jsonc"),"utf8"));
assert.equal(config.name,"oneonlinechurch");
assert.equal(config.assets.directory,"./public","Never publish repository root");
const publicDir=path.resolve(root,config.assets.directory);
assert.equal(publicDir,path.join(root,"public"));
const expectedRoot=["index.html","styles.css","app.js","privacy.html","accessibility.html","safeguarding.html","assets"];
const rootItems=fs.readdirSync(publicDir,{withFileTypes:true});
assert.deepEqual(rootItems.map(x=>x.name).sort(),expectedRoot.sort(),"Only approved public files and assets may be deployed");
const expectedImages=["brand-globe.webp","earth-sunrise.webp"];
const imageDir=path.join(publicDir,"assets");
const images=fs.readdirSync(imageDir,{withFileTypes:true});
assert.deepEqual(images.map(x=>x.name).sort(),expectedImages.sort(),"Only approved brand artwork may be deployed");
for(const item of rootItems){
 const file=path.join(publicDir,item.name);
 const stat=fs.lstatSync(file);
 assert.ok(!stat.isSymbolicLink(),"Symlinks are not public assets");
 if(item.name==="assets"){
   assert.ok(item.isDirectory(),"Expected assets directory");
   continue;
 }
 assert.ok(item.isFile(),"Unexpected public directory: "+item.name);
 assert.ok(stat.size<25*1024*1024,"Cloudflare static file limit exceeded");
}
for(const img of images){
 const p=path.join(imageDir,img.name);
 const stat=fs.lstatSync(p);
 assert.ok(img.isFile()&&!stat.isSymbolicLink(),"Unexpected image type");
 assert.ok(stat.size>200 && stat.size<25*1024*1024,"Incorrect or oversized image");
 if(img.name.endsWith(".svg")){
   const svg=fs.readFileSync(p,"utf8");
   assert.ok(svg.includes("<svg")&&!/<script|<foreignObject|onload\s*=/i.test(svg),"Unexpected unsafe SVG content");
 } else {
   assert.ok(stat.size>10000,"Image is unexpectedly small");
   const header=fs.readFileSync(p).subarray(0,12);
   assert.ok(header.toString("ascii",0,4)==="RIFF"&&header.toString("ascii",8,12)==="WEBP","Image is not WebP");
 }
}
const html=fs.readFileSync(path.join(publicDir,"index.html"),"utf8");
const css=fs.readFileSync(path.join(publicDir,"styles.css"),"utf8");
for(const needed of ["./styles.css","./app.js","./privacy.html","./accessibility.html","./safeguarding.html","./assets/brand-globe.webp","./assets/earth-sunrise.webp"]){
 assert.ok(html.includes(needed),"Missing public link: "+needed);
}
assert.ok(css.includes("./assets/earth-sunrise.webp"),"Hero must use actual Earth artwork");
assert.ok(html.includes('<img class="ooc-promo-image" src="https://res.cloudinary.com/u7dpgaxh/image/upload/v1792151689/mountains_OOC.png"'),"Promo must visibly render the approved Cloudinary photograph");
assert.ok(html.includes('<div class="ooc-discovery-card">\n    <img class="ooc-promo-image"'),"Mountain panorama must be a direct full-width discovery-card layer");
assert.ok(css.includes(".ooc-discovery-card > .ooc-promo-image"),"Mountain panorama must cover the entire discovery card, not just the narrow promo section");
assert.ok(css.includes("object-fit:cover;object-position:50% 52%"),"Wide panorama must fill the whole discovery card");
assert.ok(css.includes(".ooc-discovery-card::before"),"Text gradient over the wide photo is required");
assert.ok(css.includes(".ooc-promo-image"),"Promo photo must have its own visible image layer");
assert.ok(!css.includes("./assets/discover-mountains.svg"),"Legacy mountain drawing must not be referenced");
assert.ok(!html.includes("brand-icon.svg"),"Retired temporary SVG logo is referenced");
assert.ok(html.includes("id=\"directory-search\"")&&html.includes("id=\"signin-dialog\""),"First screen controls required");
assert.ok(html.includes('class="ooc-portal-grid"')&&html.includes('class="ooc-family-features"'),"Five-card gateway and family overview must remain present");
assert.equal((html.match(/class="ooc-portal-card ooc-portal-card--/g)||[]).length,5,"Exactly five navigation cards required");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172561/mountains2_OOC.png"),"Missing approved Cloudinary art: explore");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172509/praise_OOC.png"),"Missing approved Cloudinary art: live");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172496/bible_OOC.png"),"Missing approved Cloudinary art: sermons");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172495/friend_group_OOC.png"),"Missing approved Cloudinary art: community");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172505/church_OOC.png"),"Missing approved Cloudinary art: churches");
assert.ok(css.includes(".ooc-portal-grid")&&css.includes(".ooc-family-inner"),"New page sections must have responsive styling");
console.log("PASS: Workers publishes "+(rootItems.length-1)+" website files plus "+images.length+" approved image assets");
