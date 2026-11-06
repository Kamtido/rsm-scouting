/* RSM Scouting — « Mon club » : besoins classés + panel de joueurs cliquables. Données : window.PLAYERS, window.CLUBS, window.BESOINS. */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)};
var tr=function(k,v){return window.tr?window.tr(k,v):k};
var P=window.PLAYERS||[],C=window.CLUBS||{},B=window.BESOINS||{panel:{},roles:{}};
var by={};P.forEach(function(p){by[p[0]]=p});
var maxAge=99,club='';
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
function ini(n){var p=n.split(/\s+/);return((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||'')}
function cand(c){var p=by[c[0]];if(!p)return'';var h=hue(p[2]);
  var ph=p[15]?'<img src="assets/photos/'+p[0]+'.jpg" alt="">':esc(ini(p[1]).toUpperCase());
  return'<a class="candrow" href="joueur/'+p[0]+'.html"><div class="ph" style="--h1:hsl('+h+',45%,32%);--h2:hsl('+(h+40)+',50%,18%)">'+ph+'</div>'+
  '<div class="cn"><b>'+esc(p[1])+'</b><span><img class="crest" src="assets/crests/'+p[2]+'.png" alt=""> '+esc(C[p[2]]?C[p[2]][1]:p[2])+(p[4]!=null?' · '+tr('f_age_n',{n:p[4]}):'')+(p[7]?' · '+p[7]+'′':'')+(p[14]?' · <em>RSM</em>':'')+'</span></div>'+
  '<div class="cf"><div class="fitbar"><i style="width:'+Math.max(4,c[1])+'%"></i></div><b>'+c[1]+'</b></div></a>'}
function render(){
  var out=$('#bpOut');if(!club||!B.panel[club]){out.innerHTML='<div class="note info">'+tr('bp_empty')+'</div>';return}
  var pos=new URLSearchParams(location.search).get('pos')||'';
  var needs=B.panel[club].filter(function(n){return!pos||n.pos===pos}).slice(0,6);
  if(!needs.length)needs=B.panel[club].slice(0,6);
  var head='<div class="bp-club"><img class="crest lg" src="assets/crests/'+club+'.png" alt=""><div><h2 style="margin:0">'+esc(C[club]?C[club][0]:club)+'</h2><span class="muted small">'+tr('bp_method').split(';')[0]+'</span></div></div>';
  out.innerHTML=head+needs.map(function(n,i){
    var list=n.cands.filter(function(c){var p=by[c[0]];return p&&(p[4]==null?maxAge>=99:p[4]<=maxAge)}).slice(0,6);
    return'<article class="need"><header><span class="needn">'+tr('bp_n',{n:i+1})+'</span><h3>'+tr('ro_'+n.role)+'</h3><span class="badge pos">'+tr('pos_'+n.pos+'_s')+'</span>'+
    '<div class="needbar"><span>'+tr('bp_need')+'</span><div class="fitbar red"><i style="width:'+n.need+'%"></i></div><b>'+n.need+'</b></div></header>'+
    '<ul class="why">'+n.why.map(function(w){return'<li>'+tr(w[0],w[1])+'</li>'}).join('')+'</ul>'+
    '<div class="candh">'+tr('bp_cands')+'</div>'+(list.length?'<div class="cands">'+list.map(cand).join('')+'</div>':'<div class="muted small">'+tr('bp_none')+'</div>')+'</article>'}).join('');
}
document.addEventListener('DOMContentLoaded',function(){
  var sel=$('#bpClub');if(!sel)return;
  var q=new URLSearchParams(location.search).get('club');
  var prof={};try{prof=JSON.parse(localStorage.getItem('rsm_profile')||'{}')}catch(e){}
  club=(q&&C[q])?q:(prof.club&&C[prof.club]?prof.club:'');sel.value=club;
  sel.addEventListener('change',function(){club=sel.value;render()});
  Array.prototype.forEach.call(document.querySelectorAll('#bpAge button'),function(b){b.addEventListener('click',function(){maxAge=+b.dataset.a;Array.prototype.forEach.call(document.querySelectorAll('#bpAge button'),function(x){x.classList.toggle('on',x===b)});render()})});
  render();
  window.__rerender=render;
});
})();
