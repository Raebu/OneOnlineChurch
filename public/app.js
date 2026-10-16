"use strict";
const listings=[]; // No invented churches, audience statistics, or live broadcasts.
function searchKey(value){return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\u0131/g,"i")}
function filterListings(items,criteria){
 const query=searchKey(criteria.query).trim();
 return items.filter(item=>{
  const languages=Array.isArray(item.languages)?item.languages:[];
  const searchable=[item.name,item.city,item.country,item.description,item.tradition,...languages];
  const formatMatches=!criteria.format||item.format===criteria.format||(item.format==="hybrid"&&(criteria.format==="online"||criteria.format==="in-person"));
  return (!query||searchable.some(v=>searchKey(v).includes(query)))&&
   (!criteria.language||languages.includes(criteria.language))&&
   (!criteria.tradition||item.tradition===criteria.tradition)&&
   (!criteria.region||item.country===criteria.region)&&formatMatches;
 });
}
if(typeof document!=="undefined"){
 const search=document.getElementById("search"), headerSearch=document.getElementById("header-search");
 const language=document.getElementById("language"),region=document.getElementById("region"),tradition=document.getElementById("tradition"),format=document.getElementById("format");
 const results=document.getElementById("results"),filters=document.getElementById("filter-panel");
 const langChip=document.getElementById("languages-chip"),regionChip=document.getElementById("regions-chip");
 const chips=[...document.querySelectorAll("[data-category]")];
 let category="all";
 function render(){
  const found=filterListings(listings,{query:search.value,language:language.value,region:region.value,tradition:tradition.value,format:format.value});
  const suffix={sermons:"The sermon library is being prepared.",topics:"Topic-based discovery is being prepared."};
  results.textContent=found.length?(found.length+" verified participating churches found."):(suffix[category]||"No verified church listings are published yet. Our first participating churches are being prepared.");
  results.hidden=false;
 }
 document.getElementById("directory-search").addEventListener("submit",event=>{event.preventDefault();render()});
 search.addEventListener("input",()=>{if(search.value.trim()||!results.hidden)render()});
 for(const select of [language,region,tradition,format])select.addEventListener("change",render);
 if(headerSearch)headerSearch.addEventListener("keydown",event=>{
  if(event.key==="Enter"){event.preventDefault();search.value=headerSearch.value;document.getElementById("discover").scrollIntoView({behavior:"auto",block:"start"});render();search.focus()}
 });
 function openFilters(focus){
  filters.hidden=false;langChip.setAttribute("aria-expanded","true");regionChip.setAttribute("aria-expanded","true");
  if(focus)focus.focus();
 }
 langChip.addEventListener("click",()=>openFilters(language));
 regionChip.addEventListener("click",()=>openFilters(region));
 chips.forEach(chip=>chip.addEventListener("click",()=>{
  for(const c of chips){const active=c===chip;c.classList.toggle("active",active);c.setAttribute("aria-pressed",String(active))}
  category=chip.dataset.category;render();
 }));
 document.getElementById("clear").addEventListener("click",()=>{
  search.value="";if(headerSearch)headerSearch.value="";
  for(const input of [language,region,tradition,format])input.value="";
  category="all";
  for(const chip of chips){const active=chip.dataset.category==="all";chip.classList.toggle("active",active);chip.setAttribute("aria-pressed",String(active))}
  filters.hidden=true;langChip.setAttribute("aria-expanded","false");regionChip.setAttribute("aria-expanded","false");
  results.hidden=true;search.focus();
 });
 const toggle=document.querySelector(".menu-toggle"),mobile=document.getElementById("mobile-nav");
 toggle.addEventListener("click",()=>{
  const expanded=toggle.getAttribute("aria-expanded")==="true";
  toggle.setAttribute("aria-expanded",String(!expanded));mobile.hidden=expanded;
 });
 mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobile.hidden=true;toggle.setAttribute("aria-expanded","false")}));
 window.addEventListener("resize",()=>{if(window.innerWidth>940){mobile.hidden=true;toggle.setAttribute("aria-expanded","false")}});
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!mobile.hidden){mobile.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus()}
 });
 // Browsable regional inspiration: arrows move through real additional cards,
 // while the directory itself remains empty until churches are verified.
 const regionsTrack=document.getElementById("ooc-regions-track");
 const regionPrev=document.getElementById("ooc-regions-prev");
 const regionNext=document.getElementById("ooc-regions-next");
 if(regionsTrack && regionPrev && regionNext){
   const syncRegions=()=>{
     const max=Math.max(0,regionsTrack.scrollWidth-regionsTrack.clientWidth);
     regionPrev.disabled=regionsTrack.scrollLeft<=2;
     regionNext.disabled=regionsTrack.scrollLeft>=max-2;
   };
   const moveRegion=(direction)=>{
     const first=regionsTrack.querySelector(".ooc-region-card");
     if(!first)return;
     const gap=parseFloat(getComputedStyle(regionsTrack).columnGap)||0;
     const amount=(first.getBoundingClientRect().width+gap)*direction;
     const reduced=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
     regionsTrack.scrollBy({left:amount,behavior:reduced?"auto":"smooth"});
   };
   regionPrev.addEventListener("click",()=>moveRegion(-1));
   regionNext.addEventListener("click",()=>moveRegion(1));
   regionsTrack.addEventListener("scroll",syncRegions,{passive:true});
   window.addEventListener("resize",syncRegions);
   syncRegions();
   regionsTrack.querySelectorAll("[data-region-search]").forEach(card=>{
     card.addEventListener("click",()=>{
       search.value=card.dataset.regionSearch;
       render();
     });
   });
 }
 const signin=document.getElementById("signin-dialog");
 document.getElementById("signin-trigger").addEventListener("click",()=>signin.showModal());
 document.getElementById("signin-close").addEventListener("click",()=>signin.close());
 document.getElementById("signin-explore").addEventListener("click",()=>signin.close());
 document.getElementById("year").textContent=new Date().getFullYear();
}
if(typeof module!=="undefined")module.exports={filterListings};
