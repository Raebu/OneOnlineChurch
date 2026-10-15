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
 assert.ok(stat.size>10000 && stat.size<25*1024*1024,"Incorrect or oversized image");
 const header=fs.readFileSync(p).subarray(0,12);
 assert.ok(header.toString("ascii",0,4)==="RIFF"&&header.toString("ascii",8,12)==="WEBP","Image is not WebP");
}
const html=fs.readFileSync(path.join(publicDir,"index.html"),"utf8");
const css=fs.readFileSync(path.join(publicDir,"styles.css"),"utf8");
for(const needed of ["./styles.css","./app.js","./privacy.html","./accessibility.html","./safeguarding.html","./assets/brand-globe.webp","./assets/earth-sunrise.webp"]){
 assert.ok(html.includes(needed),"Missing public link: "+needed);
}
assert.ok(css.includes("./assets/earth-sunrise.webp"),"Hero must use actual Earth artwork");
assert.ok(!html.includes("brand-icon.svg"),"Retired temporary SVG logo is referenced");
console.log("PASS: Workers publishes "+(rootItems.length-1)+" website files plus "+images.length+" approved image assets");
