/* RSM Scouting — animations d'ambiance : révélation au défilement, compteurs, inclinaison 3D des cartes, barre de lecture, bascule 2D/3D. */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var tr=function(k,v){return window.tr?window.tr(k,v):k};
function count(el){var to=parseFloat(el.dataset.count),dec=(el.dataset.dec|0),t0=performance.now(),d=1100;if(RM){el.textContent=to.toFixed(dec);return}(function f(t){var u=Math.min(1,(t-t0)/d);u=1-Math.pow(1-u,3);el.textContent=(to*u).toFixed(dec);if(u<1)requestAnimationFrame(f)})(t0)}
document.addEventListener('DOMContentLoaded',function(){
  /* révélation */
  var sel='.sec .card,.sec .pcard,.sec .tile,.sec .mcard,.sec .tw,.qrow';
  if(!RM&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});
    $$(sel).forEach(function(el,i){if(el.closest('dialog'))return;el.classList.add('rv');el.style.transitionDelay=(i%6)*55+'ms';io.observe(el)})}
  /* compteurs */
  var cio='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){count(e.target);cio.unobserve(e.target)}})}):null;
  $$('[data-count]').forEach(function(el){if(cio)cio.observe(el);else count(el)});
  /* inclinaison 3D des cartes joueur */
  if(!RM&&matchMedia('(hover:hover)').matches){
    document.addEventListener('pointermove',function(e){var c=e.target.closest&&e.target.closest('.pcard,.wcard');$$('.pcard.tilt,.wcard.tilt').forEach(function(x){if(x!==c){x.style.transform='';x.classList.remove('tilt')}});
      if(!c)return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.classList.add('tilt');c.style.transform='perspective(700px) rotateY('+(x*9).toFixed(2)+'deg) rotateX('+(-y*9).toFixed(2)+'deg) translateY(-3px)'},{passive:true})}
  /* barre de lecture (fiches) */
  if(location.pathname.indexOf('/joueur/')>=0&&!RM){var b=document.createElement('div');b.className='progress';document.body.appendChild(b);
    window.addEventListener('scroll',function(){var h=document.documentElement;b.style.width=(100*h.scrollTop/(h.scrollHeight-h.clientHeight||1))+'%'},{passive:true})}
  /* bascule 2D/3D du terrain */
  $$('[data-d3]').forEach(function(btn){
    var box=btn.closest('.gxcard'),svg=$('svg.pitchsvg',box),cv=$('canvas',box),sc=null,on=false;
    btn.addEventListener('click',function(){on=!on;
      if(on){var g=JSON.parse($('script[type="application/json"]',box).textContent);svg.style.display='none';cv.style.display='block';cv.parentNode.querySelector('.d3hint').style.display='block';if(!sc&&window.RSM3D)sc=window.RSM3D.heat(cv,g);else if(sc){sc.size();sc.start()}btn.innerHTML=tr('d3_btn_2d')}
      else{svg.style.display='';cv.style.display='none';cv.parentNode.querySelector('.d3hint').style.display='none';if(sc)sc.stop();btn.innerHTML=tr('d3_btn')}})});
  /* ligue 3D */
  var lc=$('#league3d');if(lc&&window.RSM3D&&window.LEAGUE3D){var started=false;var go=function(){if(started)return;started=true;window.RSM3D.league(lc,window.LEAGUE3D.map(function(c){return{n:c.n,v:c.v,c:c.a?[200,16,46]:var1(c.h)}}))};
    function var1(h){return[40+h%60,80+h%100,140+h%80]}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){go();o.disconnect()}}).observe(lc);else go()}
});
})();
