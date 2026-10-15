"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const config=JSON.parse(fs.readFileSync(path.join(root,"wrangler.jsonc"),"utf8"));
assert.equal(config.name,"oneonlinechurch");
assert.equal(config.assets.directory,"./public","Never point Workers assets at repository root");
const publicDir=path.resolve(root,config.assets.directory);
assert.equal(publicDir,path.join(root,"public"));
const expected=["index.html","styles.css","app.js","privacy.html","accessibility.html","safeguarding.html","brand-icon.svg"];
const assets=fs.readdirSync(publicDir,{withFileTypes:true});
assert.deepEqual(assets.map(a=>a.name).sort(),expected.slice().sort(),"Only reviewed public assets may be deployed");
for(const entry of assets){
  assert.ok(entry.isFile(),"No directories or symlink assets permitted");
  const filename=path.join(publicDir,entry.name);
  const stat=fs.lstatSync(filename);
  assert.ok(stat.isFile()&&!stat.isSymbolicLink(),"Disallowed asset type");
  assert.ok(stat.size<25*1024*1024,"Cloudflare static asset limit exceeded");
}
const html=fs.readFileSync(path.join(publicDir,"index.html"),"utf8");
for(const needed of ["./styles.css","./app.js","./privacy.html","./accessibility.html","./safeguarding.html","./brand-icon.svg"]){
  assert.ok(html.includes(needed),"Missing public link: "+needed);
}
console.log("PASS: Workers uploads exactly "+assets.length+" reviewed website assets from public/");
