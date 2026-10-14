"use strict";
const listings=[]; // No fictitious churches or streams are published.
function filterListings(items,criteria){
  const query=criteria.query.trim().toLocaleLowerCase();
  return items.filter(item=>
    (!query||[item.name,item.city,item.country,item.description].some(v=>String(v||"").toLocaleLowerCase().includes(query)))&&
    (!criteria.language||item.languages.includes(criteria.language))&&
    (!criteria.tradition||item.tradition===criteria.tradition)&&
    (!criteria.format||item.format===criteria.format)
  );
}
if(typeof document!=="undefined"){
  const search=document.getElementById("search");
  const language=document.getElementById("language");
  const tradition=document.getElementById("tradition");
  const format=document.getElementById("format");
  const results=document.getElementById("results");
  function render(){
    const found=filterListings(listings,{query:search.value,language:language.value,tradition:tradition.value,format:format.value});
    results.textContent=found.length?found.length+" verified participating churches found.":"No verified church listings are published yet. We are preparing our first participating churches.";
  }
  [search,language,tradition,format].forEach(el=>el.addEventListener(el===search?"input":"change",render));
  document.getElementById("search-button").addEventListener("click",render);
  document.getElementById("clear").addEventListener("click",()=>{search.value="";language.value="";tradition.value="";format.value="";render();search.focus()});
  const toggle=document.querySelector(".menu-toggle");
  const mobile=document.getElementById("mobile-nav");
  toggle.addEventListener("click",()=>{const isOpen=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!isOpen));mobile.hidden=isOpen});
  mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobile.hidden=true;toggle.setAttribute("aria-expanded","false")}));
  document.getElementById("year").textContent=new Date().getFullYear();
  render();
}
if(typeof module!=="undefined")module.exports={filterListings};
