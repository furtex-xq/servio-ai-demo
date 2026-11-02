// Shared by privacy.html and terms.html: language, table of contents, reading progress, reveals.
(function(){
  const q=new URLSearchParams(location.search).get("lang");
  let lang=q||(()=>{try{return localStorage.getItem("servio_lang")}catch(e){return null}})()||((navigator.language||"").match(/^(ru|uk)/)?"ru":"en");
  const toc=document.getElementById("toc");
  let spy;
  function build(){
    const block=document.querySelector('.doc[lang-block].on'); if(!block||!toc) return;
    const hs=[...block.querySelectorAll(".doc section h2")];
    toc.innerHTML=`<b>${lang==="ru"?"Содержание":"Contents"}</b>`+hs.map((h,i)=>{const id=lang+"-s"+(i+1);h.parentElement.id=id;
      return `<a href="#${id}"><span>${String(i+1).padStart(2,"0")}</span>${h.querySelector(".t").textContent}</a>`}).join("");
    if(spy) spy.disconnect();
    spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){toc.querySelectorAll("a").forEach(a=>a.classList.toggle("on",a.getAttribute("href")==="#"+e.target.id))}}),{rootMargin:"-30% 0px -60% 0px"});
    block.querySelectorAll(".doc section").forEach(s=>spy.observe(s));
  }
  function set(l){
    lang=l==="ru"?"ru":"en"; document.documentElement.lang=lang;
    document.querySelectorAll("[lang-block]").forEach(b=>b.classList.toggle("on",b.getAttribute("lang-block")===lang));
    document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.l===lang)));
    document.querySelectorAll("[data-ru]").forEach(el=>el.textContent=lang==="ru"?el.dataset.ru:el.dataset.en);
    try{localStorage.setItem("servio_lang",lang)}catch(e){}
    build(); reveal();
  }
  const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");rv.unobserve(e.target)}}),{rootMargin:"0px 0px -6% 0px"});
  function reveal(){document.querySelectorAll('[lang-block].on .reveal:not(.in)').forEach(el=>rv.observe(el))}
  document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>set(b.dataset.l));
  const bar=document.querySelector(".bar");
  addEventListener("scroll",()=>{const h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+"%"},{passive:true});
  const tb=document.getElementById("themeBtn");
  if(tb) tb.onclick=()=>{const r=document.documentElement,t=r.dataset.theme==="light"?"dark":"light";r.dataset.theme=t;try{localStorage.setItem("servio_theme",t)}catch(e){}};
  set(lang);
})();
