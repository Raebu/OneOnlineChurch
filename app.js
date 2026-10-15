"use strict";
const listings=[]; // No fictitious churches or streams are published.
// Use the same locale-independent, accent-tolerant search key for input and listings.
function searchKey(value){
  return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\u0131/g,"i");
}
function filterListings(items,criteria){
  const query=searchKey(criteria.query).trim();
  return items.filter(item=>{
    const languages=Array.isArray(item.languages)?item.languages:[];
    const searchable=[item.name,item.city,item.country,item.description,item.tradition,...languages];
    const formatMatches=!criteria.format||item.format===criteria.format||(
      item.format==="hybrid"&&(criteria.format==="online"||criteria.format==="in-person")
    );
    return (!query||searchable.some(value=>searchKey(value).includes(query)))&&
      (!criteria.language||languages.includes(criteria.language))&&
      (!criteria.tradition||item.tradition===criteria.tradition)&&
      formatMatches;
  });
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
  // Reset an open mobile menu when the desktop breakpoint becomes active.
  window.addEventListener("resize",()=>{
    if(window.innerWidth>1050){
      mobile.hidden=true;
      toggle.setAttribute("aria-expanded","false");
    }
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!mobile.hidden){
      mobile.hidden=true;
      toggle.setAttribute("aria-expanded","false");
      toggle.focus();
    }
  });
  document.getElementById("year").textContent=new Date().getFullYear();
  render();
}
if(typeof module!=="undefined")module.exports={filterListings};
