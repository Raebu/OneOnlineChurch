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
const js=fs.readFileSync(path.join(publicDir,"app.js"),"utf8");

assert.ok(html.includes('id="ooc-regions-track"')&&html.includes('id="ooc-movement-title"'),"World faith gallery and movement banner must exist");
assert.equal((html.match(/class="ooc-region-card ooc-region-card--/g)||[]).length,7,"Gallery must contain five initial cards and two additional browsable cards");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792173898/global_network_banner_OOC.webp"),"Movement banner must use approved Cloudinary globe artwork");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172495/cathedral_OOC.png"),"Missing approved regional Cloudinary art: europe");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172495/arms_up_OOC.png"),"Missing approved regional Cloudinary art: africa");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172505/mountain_lake_OOC.png"),"Missing approved regional Cloudinary art: americas");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172504/china_lanterns_OOC.png"),"Missing approved regional Cloudinary art: asia");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172496/friendship_group_OOC.png"),"Missing approved regional Cloudinary art: family");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172495/friend_group_OOC.png"),"Missing approved regional Cloudinary art: cultures");
assert.ok(html.includes("https://res.cloudinary.com/u7dpgaxh/image/upload/v1792172509/praise_OOC.png"),"Missing approved regional Cloudinary art: worship");
assert.ok(css.includes("grid-auto-columns:calc((100% - 4 * var(--ooc-region-gap))/5)"),"Desktop carousel must show five cards");
assert.ok(css.includes(".ooc-movement-banner")&&css.includes(".ooc-region-card"),"New world sections need responsive styling");
assert.ok(js.includes('regionNext.addEventListener("click"'),"Carousel arrows must have actual handlers");
// The approved page ends immediately after the global movement banner.
// Do not reintroduce the older long-form placeholder sections.
assert.ok(html.includes("</section>\n</main><footer>"),"Footer must follow immediately after the movement banner");
for(const old of ["class=\"section live-section\"","class=\"section sermons-section\"","class=\"section community-section\"","class=\"section church-section\""]){
 assert.ok(!html.includes(old),"Old below-banner section must stay removed: "+old);
}
for(const id of ["live","sermons","community","churches"]){
 assert.ok(html.includes('id="'+id+'" class="ooc-portal-card'),"Current navigation must target an existing gateway card: "+id);
}
assert.ok(html.includes('id="feature-dialog"')&&js.includes('featureDialog.showModal()'),"Planned feature cards must give honest interactive feedback");
assert.equal((html.match(/<footer>/g)||[]).length,1,"Keep exactly one footer");
console.log("PASS: Workers publishes "+(rootItems.length-1)+" website files plus "+images.length+" approved image assets");
