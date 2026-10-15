"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {filterListings}=require("../public/app.js");

const listings=[
  {name:"Istanbul Church",city:"İstanbul",country:"Türkiye",description:"Welcome",
   languages:["English","Turkish"],tradition:"Anglican",format:"online"},
  {name:"Grace",city:"Kathmandu",country:"Nepal",description:"",
   languages:["Nepali"],tradition:"Baptist",format:"hybrid"}
];
const criteria=(overrides={})=>({query:"",language:"",tradition:"",format:"",...overrides});

test("filters by location, tradition, language and format",()=>{
  assert.equal(filterListings(listings,criteria({query:"istanbul",tradition:"Anglican",language:"English",format:"online"})).length,1);
  assert.equal(filterListings(listings,criteria({query:"missing"})).length,0);
  assert.equal(filterListings(listings,criteria({language:"Nepali"})).length,1);
});

test("free-text language search finds language-only matches",()=>{
  assert.equal(filterListings(listings,criteria({query:"Nepali"}))[0].name,"Grace");
});

test("worldwide search is consistent across case, accents and browser locales",()=>{
  assert.equal(filterListings(listings,criteria({query:"ISTANBUL"})).length,1);
  assert.equal(filterListings(listings,criteria({query:"İstanbul"})).length,1);
  assert.equal(filterListings(listings,criteria({query:"Türkiye"})).length,1);
});

test("online or in-person filters also match hybrid events",()=>{
  assert.equal(filterListings(listings,criteria({format:"in-person"}))[0].name,"Grace");
  assert.equal(filterListings(listings,criteria({format:"online"})).length,2);
  assert.equal(filterListings(listings,criteria({format:"hybrid"})).length,1);
});

test("empty catalogue never invents matches",()=>{
  assert.deepEqual(filterListings([],criteria()),[]);
});
