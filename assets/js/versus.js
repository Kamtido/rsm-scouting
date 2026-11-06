/* RSM Scouting — mode VERSUS (comparaison animée façon jeu de combat). Données : window.PLAYERS / window.CLUBS. */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)};
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var tr=function(k,v){return window.tr?window.tr(k,v):k};
var P=window.PLAYERS||[],C=window.CLUBS||{};
var bySlug={};P.forEach(function(p){bySlug[p[0]]=p});
/* index : 0 slug 1 nom 2 club 3 poste 4 age 5 num 6 m 7 min 8 g 9 a 10 ja 11 ro 12 niveau 13 vidéo 14 agence 15 photo 16 ga90 17 nat 18 ech 19 vitesse 20 passes% 21 cartons/90 */
var METRICS=[
 {k:'f_matches',i:6,fmt:0},{k:'f_minutes',i:7,fmt:0},{k:'f_goals',i:8,fmt:0},{k:'f_assists',i:9,fmt:0},{k:'f_ga90',i:16,fmt:2},
 {k:'vs_discipline',i:21,fmt:2,low:true},{k:'vd_top',i:19,fmt:1,unit:' km/h'},{k:'vs_pass',i:20,fmt:0,unit:' %'}
];
var audio=null,sound=false;
function beep(f,d,type,vol){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();var o=audio.createOscillator(),g=audio.createGain();o.type=type||'square';o.frequency.value=f;g.gain.value=vol||0.05;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(0.0001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}}
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
function ini(n){var p=n.split(/\s+/);return((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||'')}
function fighter(p,side){
  var h=hue(p[2]),ph=p[15]?'<img src="assets/photos/'+p[0]+'.jpg" alt="">':ini(p[1]).toUpperCase();
  return'<div class="vs-f '+side+'"><div class="vs-ph" style="--h1:hsl('+h+',45%,34%);--h2:hsl('+(h+40)+',50%,16%)">'+ph+'</div><div class="vs-nm">'+p[1]+'</div><div class="vs-cl"><img class="crest" src="assets/crests/'+p[2]+'.png" alt=""> '+(C[p[2]]?C[p[2]][0]:p[2])+(p[3]?' · '+tr('pos_'+p[3]+'_s'):'')+'</div></div>'}
function val(p,m){var v=p[m.i];return v==null?null:Number(v)}
function fmt(v,m){return v==null?'—':(m.fmt?v.toFixed(m.fmt):Math.round(v))+(m.unit||'')}
function countUp(el,to,m,ms){if(RM||!ms){el.textContent=fmt(to,m);return}var t0=performance.now();(function f(t){var u=Math.min(1,(t-t0)/ms);el.textContent=fmt(to*u,m);if(u<1)requestAnimationFrame(f)})(t0)}
var timers=[];function later(fn,ms){var t=setTimeout(fn,RM?0:ms);timers.push(t);return t}
function clear(){timers.forEach(clearTimeout);timers=[]}
function fight(a,b){
  clear();var arena=$('#arena'),intro=$('#intro'),rows=$('#rows'),banner=$('#banner'),score=$('#score');
  arena.hidden=false;banner.className='vs-banner';banner.innerHTML='';rows.innerHTML='';
  $('#vsheads').innerHTML=fighter(a,'l')+'<div class="vs-vs"><span>VS</span></div>'+fighter(b,'r');
  var ra=0,rb=0;score.innerHTML='<b id="sa">0</b><span>'+tr('vs_rounds_won')+'</span><b id="sb">0</b>';
  var list=METRICS.filter(function(m){return val(a,m)!=null&&val(b,m)!=null});
  intro.innerHTML='';intro.className='vs-intro';
  var t=0;
  list.forEach(function(m,i){
    later(function(){
      var va=val(a,m),vb=val(b,m);var sa=m.low?-va:va,sb=m.low?-vb:vb;var top=Math.max(Math.abs(va),Math.abs(vb))||1;
      var fa=m.low?(top-va)/top:va/top,fb=m.low?(top-vb)/top:vb/top;fa=Math.max(.06,Math.min(1,fa));fb=Math.max(.06,Math.min(1,fb));
      var row=document.createElement('div');row.className='vs-row';
      row.innerHTML='<div class="vs-val l"><span class="va">0</span></div><div class="vs-bars"><div class="vs-lab">'+tr(m.k)+'</div><div class="vs-hp"><div class="hb l"><i></i></div><div class="hb r"><i></i></div></div></div><div class="vs-val r"><span class="vb">0</span></div>';
      rows.appendChild(row);
      requestAnimationFrame(function(){row.classList.add('in');$('.hb.l i',row).style.width=(fa*100)+'%';$('.hb.r i',row).style.width=(fb*100)+'%'});
      countUp($('.va',row),va,m,600);countUp($('.vb',row),vb,m,600);
      later(function(){
        var w=sa>sb?'l':(sb>sa?'r':'');
        if(w){row.classList.add('win-'+w);
          if(w==='l')ra++;else rb++;$('#sa').textContent=ra;$('#sb').textContent=rb}
      },RM?0:450)
    },t);t+=RM?0:450});
  later(function(){
    var skipped=METRICS.length-list.length;
    if(!list.length){banner.innerHTML='<span>'+tr('vs_nodata')+'</span>';banner.className='vs-banner on';return}
    if(ra===rb){banner.innerHTML='<span class="big">'+tr('vs_draw')+'</span><small>'+ra+' – '+rb+'</small>'}
    else{var w=ra>rb?a:b;banner.innerHTML='<span class="big">'+tr('vs_winner')+'</span><strong>'+w[1]+'</strong><small>'+ra+' – '+rb+(skipped?' · '+tr('vs_skipped',{n:skipped}):'')+'</small>'}
    banner.className='vs-banner on'},t+(RM?0:200));
}
function setURL(a,b){if(history.replaceState)history.replaceState(null,'','versus.html?a='+a+'&b='+b)}
/* sélection guidée : poste -> club -> (recherche) -> liste de joueurs ; le joueur 2 est forcément du même poste que le joueur 1 */
var POSTES=['gk','df','mf','fw'];
document.addEventListener('DOMContentLoaded',function(){
  if(!$('#vsA'))return;
  var q=new URLSearchParams(location.search);
  var st={A:bySlug[q.get('a')]||null,B:bySlug[q.get('b')]||null};
  function opt(v,t,sel){return'<option value="'+v+'"'+(sel?' selected':'')+'>'+t+'</option>'}
  function pool(side){
    var pos=$('#vsPos'+side).value,club=$('#vsClub'+side).value,qq=($('#vsQ'+side).value||'').trim().toLowerCase(),other=side==='A'?st.B:st.A;
    return P.filter(function(p){
      if(!p[3])return false;
      if(side==='B'&&st.A&&p[3]!==st.A[3])return false;
      if(pos&&p[3]!==pos)return false;
      if(club&&p[2]!==club)return false;
      if(qq&&p[1].toLowerCase().indexOf(qq)<0)return false;
      if(other&&p===other)return false;
      return true})}
  function fillClubs(side){
    var pos=$('#vsPos'+side).value,cur=$('#vsClub'+side).value,cl={};
    P.forEach(function(p){if(p[3]&&(!pos||p[3]===pos))cl[p[2]]=1});
    var ks=Object.keys(cl).sort(function(a,b){return(C[a]?C[a][0]:a).localeCompare(C[b]?C[b][0]:b)});
    $('#vsClub'+side).innerHTML=opt('',tr('vs_all_clubs'))+ks.map(function(k){return opt(k,C[k]?C[k][0]:k,k===cur)}).join('')}
  function fillPlayers(side){
    var sel=$('#vsSel'+side)||$('#vs'+side),cur=st[side]?st[side][0]:'',byClub={};
    pool(side).forEach(function(p){(byClub[p[2]]=byClub[p[2]]||[]).push(p)});
    var ks=Object.keys(byClub).sort(function(a,b){return(C[a]?C[a][0]:a).localeCompare(C[b]?C[b][0]:b)});
    var html=opt('',side==='B'&&!st.A?tr('vs_first'):tr('vs_pick_ph'));
    ks.forEach(function(k){html+='<optgroup label="'+(C[k]?C[k][0]:k)+'">'+byClub[k].sort(function(a,b){return a[1].localeCompare(b[1])}).map(function(p){return opt(p[0],p[1]+(p[4]!=null?' · '+tr('f_age_n',{n:p[4]}):'')+(p[7]?' · '+p[7]+'′':''),p[0]===cur)}).join('')+'</optgroup>'});
    sel.innerHTML=html;sel.disabled=side==='B'&&!st.A}
  function fillPos(side){
    var cur=side==='A'?($('#vsPosA').value||''):(st.A?st.A[3]:'');
    $('#vsPos'+side).innerHTML=(side==='A'?opt('',tr('vs_all_pos')):'')+POSTES.map(function(g){return opt(g,tr('pos_'+g),g===cur)}).join('');
    if(side==='B'){$('#vsPosB').value=st.A?st.A[3]:'';if(!st.A)$('#vsPosB').innerHTML=opt('',tr('vs_samepos',{pos:'…'}))}}
  function refresh(){['A','B'].forEach(function(s){fillPos(s)});['A','B'].forEach(function(s){fillClubs(s);fillPlayers(s)});
    var m=$('#vsmsg');m.textContent=st.A?tr('vs_samepos',{pos:tr('pos_'+st.A[3])}):''}
  function choose(side){var v=$('#vs'+side).value;st[side]=v?bySlug[v]:null;
    if(side==='A'&&st.A&&st.B&&st.B[3]!==st.A[3])st.B=null;
    if(side==='A'&&st.A)$('#vsPosA').value=st.A[3];
    refresh();$('#vs'+side).value=st[side]?st[side][0]:''}
  ['A','B'].forEach(function(s){
    $('#vsPos'+s).addEventListener('change',function(){st[s]=null;fillClubs(s);fillPlayers(s);if(s==='A'){st.B=null;refresh()}});
    $('#vsClub'+s).addEventListener('change',function(){fillPlayers(s)});
    $('#vsQ'+s).addEventListener('input',function(){fillPlayers(s)});
    $('#vs'+s).addEventListener('change',function(){choose(s)});
    $('#vsQ'+s).placeholder=tr('vs_search')});
  if(st.A&&st.B&&st.A[3]!==st.B[3])st.B=null;
  refresh();
  if(st.A)$('#vsA').value=st.A[0];if(st.B)$('#vsB').value=st.B[0];
  function go(){var a=st.A,b=st.B,msg=$('#vsmsg');
    if(!a){msg.textContent=tr('vs_first');return}if(!b){msg.textContent=tr('vs_missing');return}if(a===b){msg.textContent=tr('vs_same');return}msg.textContent='';
    setURL(a[0],b[0]);fight(a,b)}
  $('#vsGo').addEventListener('click',go);
  $('#vsSwap').addEventListener('click',function(){if(!st.A||!st.B){$('#vsmsg').textContent=tr('vs_first');return}var x=st.A;st.A=st.B;st.B=x;refresh();$('#vsA').value=st.A[0];$('#vsB').value=st.B[0];go()});
  $('#vsShare').addEventListener('click',function(){var u=location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){$('#vsmsg').textContent=tr('vs_copied')},function(){$('#vsmsg').textContent=u})});
  if(st.A&&st.B&&st.A!==st.B)setTimeout(go,300);
  window.__rerender=function(){var a=st.A,b=st.B;refresh();if(a)$('#vsA').value=a[0];if(b)$('#vsB').value=b[0];['A','B'].forEach(function(s){$('#vsQ'+s).placeholder=tr('vs_search')})};
});
})();
