/* RSM Scouting — LA LAMPE DU GÉNIE : on écrit un vœu, le Génie trouve le joueur. Compréhension du vœu en 12 langues, notation transparente, animation complète. */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)};
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var tr=function(k,v){return window.tr?window.tr(k,v):k};
var P=window.PLAYERS||[],C=window.CLUBS||{};
/* index : 0 slug 1 nom 2 club 3 poste 4 age 5 num 6 m 7 min 8 g 9 a 10 ja 11 ro 12 niveau 13 vidéo 14 agence 15 photo 16 ga90 17 nat 18 ech 19 vitesse 20 passes% 21 cartons/90 22 taille 23 pied 24 intl 25 badges */
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
var K={
 gk:/gardien|goalkeeper|keeper|torwart|torhuter|portero|portiere|вратар|ゴールキーパー|キーパー|golman|골키퍼|守门员|门将|penjaga gol|kiper|கோல்கீப்பர்|காவலர்/,
 df:/defenseur|defender|verteidiger|defensa|difensore|защитник|ディフェンダー|守備|branic|obrambeni|수비|后卫|防守|pertahanan|pemain pertahanan|பின்கள/,
 mf:/milieu|midfield|mittelfeld|centrocampista|mediocampista|полузащитник|ミッドフィルダー|中盘|vezni|미드필더|중앙|中场|pemain tengah|நடுகள/,
 fw:/attaquant|avant-centre|avant\b|striker|forward|sturmer|angreifer|delantero|attaccante|нападающ|フォワード|ストライカー|攻撃|napadac|공격수|前锋|penyerang|முன்கள/,
 young:/jeune|young|\bjung|joven|giovane|молод|若い|若手|mlad|젊|어린|年轻|青年|\bmuda|இளம்/,
 exp:/experiment|experience|erfahren|experiencia|esperto|опытн|経験|iskusn|경험|베테랑|经验|资深|berpengalaman|அனுபவ/,
 scorer:/marqu|buteur|\bbuts?\b|goal|scor|\btore?\b|torjag|\bgoles?\b|goleador|\bgol\b|segn|bomber|забива|бомбард|得点|ゴール|ストライカー|zabija|golov|골|득점|进球|得分|jaring|gol |கோல்/,
 passer:/passe decisive|passeur|assist|vorlage|asistencia|rifinitor|передач|アシスト|asistencij|어시스트|助攻|bantu|உதவி|fait marquer|creat|create/,
 fast:/rapide|vite|fast|quick|speed|schnell|rapido|veloce|быстр|速い|俊足|brz|빠른|빠르|快|迅速|laju|cepat|வேக/,
 tall:/grand\b|taille|\btall|\bgros\b|gross|\bgroß|\balto\b|высок|背が高|visok|키가 큰|키 큰|高个|高大|tinggi|உயர/,
 reliable:/fiable|regulier|toujours|beaucoup de minutes|joue beaucoup|joue tout|titulaire|reliable|always plays|plays a lot|regular|zuverl|spielt viel|siempre|juega mucho|affidab|gioca molto|надёжн|надежн|много играет|信頼|レギュラー|pouzdan|puno igra|믿음|많이 뛰|可靠|主力|andal|rutin|நம்பக/,
 clean:/discipline|sage\b|propre|sans carton|clean|disciplined|fair|diszipl|disciplinado|disciplinato|дисципл|規律|フェア|discipliniran|규율|깨끗|纪律|disiplin|ஒழுக்க/,
 video:/video|vidéo|видео|ビデオ|映像|비디오|영상|视频|影像|வீடியோ/,
 agency:/rsm|agence|agency|agentur|agencia|agenzia|агентств|エージェンシー|agencij|에이전시|经纪|agensi|நிறுவன/,
 left:/gaucher|left|links|zurdo|mancino|левш|左利き|ljevor|왼발|左脚|左撇|kidal|இடது/,
 right:/droitier|right-foot|rechtsfu|diestro|destro|правш|右利き|desnonog|오른발|右脚|右撇|kanan|வலது/,
 intl:/international|selection|sélection|nationalspieler|nacional|nazionale|сборн|代表|reprezentativ|국가대표|国脚|国家队|antarabangsa|சர்வதேச/
};
var PER={young:[/under|moins de|unter|menos de|meno di|до |未満|ispod|미만|以下|bawah|கீழ்/],old:[/over|plus de|uber|más de|mas de|oltre|от |以上|iznad|이상|atas|மேல்/]};
function parse(text){
  var t=norm(text),raw=String(text||'').toLowerCase(),c={},tags=[];
  function has(k){return K[k].test(t)||K[k].test(raw)}
  ['gk','df','mf','fw'].forEach(function(p){if(has(p)){c.pos=p;tags.push(['pos',p])}});
  /* si « attaquant » et « gardien » ensemble : on garde le premier mentionné */
  if(has('young'))c.young=1;if(has('exp'))c.exp=1;if(has('scorer')&&c.pos!=='gk')c.scorer=1;if(has('passer')&&c.pos!=='gk')c.passer=1;if(has('fast'))c.fast=1;if(has('tall'))c.tall=1;
  if(has('reliable'))c.reliable=1;if(has('clean'))c.clean=1;if(has('video'))c.video=1;if(has('agency'))c.agency=1;
  if(has('left')){c.foot='left'}else if(has('right')){c.foot='right'}
  if(has('intl'))c.intl=1;
  var m=raw.match(/(\d{2})\s*(ans|years?|jahre|a[nñ]os|anni|лет|歳|godin|살|岁|tahun|வயது)?/);
  if(m&&+m[1]>=15&&+m[1]<=45){var n=+m[1];var u=PER.young.some(function(r){return r.test(t)||r.test(raw)}),o=PER.old.some(function(r){return r.test(t)||r.test(raw)});if(u)c.maxAge=n;else if(o)c.minAge=n;else{c.minAge=n-1;c.maxAge=n+1}}
  /* club : nom complet ou court */
  Object.keys(C).forEach(function(s){var a=norm(C[s][0]),b=norm(C[s][1]);if(t.indexOf(a)>=0||(b.length>3&&new RegExp('\\b'+b.replace(/[^a-z0-9 ]/g,'')+'\\b').test(t))){c.club=s}});
  if(c.club){/* éviter « real » qui apparaîtrait dans un autre mot */}
  return c}
function score(p,c,ref){
  var s=0,why=[],m=p[6]||0,mn=p[7]||0,g90=(p[8]||0)*90/Math.max(mn,1),a90=(p[9]||0)*90/Math.max(mn,1),pos=p[3],age=p[4];
  if(c.pos&&pos!==c.pos)return null;if(c.club&&p[2]!==c.club)return null;if(c.agency&&!p[14])return null;if(c.video&&!p[13])return null;if(c.intl&&!p[24])return null;
  if(c.maxAge&&(age==null||age>c.maxAge))return null;if(c.minAge&&(age==null||age<c.minAge))return null;
  if(c.foot&&p[23]&&p[23]!==c.foot&&p[23]!=='both')return null;if(c.foot&&!p[23])s-=.8;
  s+=Math.min(2,Math.log(1+mn)/3.2);if(!mn)s-=2;
  var ech=p[18]?1:.35;
  if(c.scorer){s+=3.2*ech*Math.min(1,g90/Math.max(ref.g90,.01));if(p[8])why.push(['wr_scorer',{g:p[8],m:m}])}
  if(c.passer){s+=3.2*ech*Math.min(1,a90/Math.max(ref.a90,.01));if(p[9])why.push(['wr_passer',{a:p[9]}])}
  if(c.fast){if(p[19]){s+=3*Math.max(0,Math.min(1,(p[19]-17)/14));if(p[19]>=25)why.push(['wr_fast',{top:Math.round(p[19])}])}else if(pos==='fw'||pos==='mf'){s+=.6}}
  if(c.young){if(age!=null){var y=age<=19?3:(age<=21?2.4:(age<=23?1.3:0));s+=y;if(y)why.push(['wr_young',{age:age}])}}
  if(c.exp){if(age!=null&&age>=27){s+=2.2;why.push(['wr_exp',{age:age}])}}
  if(c.tall){if(p[22]&&p[22]>=184){s+=2+(p[22]-184)/15;why.push(['wr_tall',{t:p[22]}])}}
  if(c.reliable){s+=2.6*Math.min(1,mn/Math.max(ref.min,1));if(mn>=270)why.push(['wr_reliable',{min:mn}])}
  if(c.clean){if(mn>=180&&!(p[10]||p[11])){s+=2.4;why.push(['wr_clean',{}])}else s-=1.2*(p[21]||0)}
  if(c.video&&p[13])why.push(['wr_video',{}]);if(c.agency&&p[14])why.push(['wr_agency',{}]);
  if(c.intl&&p[24])why.push(['wr_intl',{}]);
  if(c.pos)why.unshift(['wr_pos',{pos:'<span data-i18n="pos_'+pos+'">'+tr('pos_'+pos)+'</span>'}]);
  if(c.club)why.push(['wr_club',{club:C[p[2]]?C[p[2]][0]:p[2]}]);
  if(c.foot&&p[23])why.push(['wr_foot',{foot:'<span data-i18n="foot_'+p[23]+'">'+tr('foot_'+p[23])+'</span>'}]);
  if(p[14])s+=.3;
  return{p:p,s:s,why:why}}
function search(c){
  var pool=P.filter(function(p){return(p[7]||0)>0||c.agency});
  var ref={g90:.1,a90:.05,min:1};pool.forEach(function(p){var mn=Math.max(p[7]||0,1);if(p[18]){ref.g90=Math.max(ref.g90,(p[8]||0)*90/mn);ref.a90=Math.max(ref.a90,(p[9]||0)*90/mn)}ref.min=Math.max(ref.min,p[7]||0)});
  var out=[];pool.forEach(function(p){var r=score(p,c,ref);if(r)out.push(r)});out.sort(function(a,b){return b.s-a.s||(b.p[7]||0)-(a.p[7]||0)});return out}
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
function ini(n){var p=n.split(/\s+/);return((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||'')}
function card(r,rank){
  var p=r.p,h=hue(p[2]),ph=p[15]?'<img src="assets/photos/'+p[0]+'.jpg" alt="">':ini(p[1]).toUpperCase();
  var why=(r.why.length?r.why:[['wr_default',{}]]).slice(0,5).map(function(w){return'<li>'+tr(w[0],w[1])+'</li>'}).join('');
  var b=(p[25]||'').split(',').filter(Boolean).slice(0,3).map(function(x){return'<span class="badge dk">'+tr(x)+'</span>'}).join(' ');
  return'<article class="wcard" style="--i:'+rank+'"><div class="wrank">'+(rank+1)+'</div><div class="wtop"><div class="ph" style="--h1:hsl('+h+',45%,34%);--h2:hsl('+(h+40)+',50%,16%)">'+ph+'</div><div><div class="nm">'+p[1]+'</div><div class="small muted"><img class="crest" src="assets/crests/'+p[2]+'.png" alt=""> '+(C[p[2]]?C[p[2]][0]:'')+(p[3]?' · '+tr('pos_'+p[3]):'')+(p[4]!=null?' · '+tr('f_age_n',{n:p[4]}):'')+'</div><div style="margin-top:4px">'+b+'</div></div></div>'+
   '<div class="wwhy"><b>'+tr('wish_why')+'</b><ul>'+why+'</ul></div><div class="wbtn"><a class="btn sm" href="joueur/'+p[0]+'.html">'+tr('wish_open')+'</a> <a class="btn gold sm" href="versus.html?a='+p[0]+'">'+tr('vs_open')+'</a></div></article>'}
var timers=[];function later(fn,ms){var t=setTimeout(fn,RM?0:ms);timers.push(t);return t}
function clear(){timers.forEach(clearTimeout);timers=[]}
/* ---- fumée / étincelles ---- */
var cv,cx,parts=[],raf=0;
function spawn(n,kind){var r=cv.getBoundingClientRect();for(var i=0;i<n;i++)parts.push({x:r.width*.5+(Math.random()-.5)*30,y:r.height*.7,vx:(Math.random()-.5)*1.4,vy:-(1+Math.random()*2.4),s:kind==='spark'?2+Math.random()*3:12+Math.random()*22,a:1,k:kind,h:40+Math.random()*30})}
function loop(){cx.clearRect(0,0,cv.width,cv.height);parts=parts.filter(function(p){return p.a>0.02});parts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy*=.995;p.a-=p.k==='spark'?.012:.007;p.s+=p.k==='spark'?-.02:.35;
  if(p.k==='spark'){cx.fillStyle='hsla('+p.h+',100%,65%,'+p.a+')';cx.beginPath();cx.arc(p.x,p.y,Math.max(.4,p.s),0,6.3);cx.fill()}else{var g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s);g.addColorStop(0,'rgba(120,200,255,'+p.a*.55+')');g.addColorStop(1,'rgba(120,200,255,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p.x,p.y,p.s,0,6.3);cx.fill()}});
  if(parts.length||raf)raf=requestAnimationFrame(loop)}
function fx(n,k){if(RM||!cv)return;spawn(n,k);if(!raf)raf=requestAnimationFrame(loop)}
function sizeCanvas(){var r=cv.parentNode.getBoundingClientRect();cv.width=r.width;cv.height=r.height}
function say(k,v){var b=$('#gbub');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');b.innerHTML=tr(k,v)}
var busy=false;
function wish(){
  if(busy)return;var txt=$('#wtxt').value.trim(),res=$('#wres'),stage=$('#stage');
  if(!txt){say('wish_empty');$('#wtxt').focus();return}
  busy=true;clear();res.innerHTML='';res.className='wres';$('#wunder').innerHTML='';
  var c=parse(txt),r=search(c),n=P.length;
  stage.className='stage rub';say('genie_rub');fx(14,'smoke');
  later(function(){fx(26,'smoke');say('wish_think',{n:n});stage.className='stage out'},1500);
  /* effet « machine à sous » de noms pendant la recherche */
  var ticker=$('#gtick');var tk=setInterval(function(){var p=P[Math.floor(Math.random()*P.length)];ticker.textContent=p[1]},70);
  later(function(){clearInterval(tk);ticker.textContent='';fx(60,'spark');stage.className='stage granted';say('wish_granted')},3300);
  if(RM){clearInterval(tk);ticker.textContent=''}
  later(function(){
    var tags=[];Object.keys(c).forEach(function(k){var v=c[k];if(k==='pos')tags.push(tr('pos_'+v));else if(k==='young')tags.push(tr('wc_young'));else if(k==='exp')tags.push(tr('wc_exp'));else if(k==='scorer')tags.push(tr('wc_scorer'));else if(k==='passer')tags.push(tr('wc_passer'));else if(k==='fast')tags.push(tr('wc_fast'));else if(k==='tall')tags.push(tr('wc_tall'));else if(k==='reliable')tags.push(tr('wc_reliable'));else if(k==='clean')tags.push(tr('wc_clean'));else if(k==='video')tags.push(tr('wc_video'));else if(k==='agency')tags.push(tr('wc_agency'));else if(k==='foot')tags.push(tr(v==='left'?'wc_left':'wc_right'));else if(k==='intl')tags.push(tr('wc_intl'));else if(k==='club')tags.push(tr('wc_club',{c:C[v]?C[v][0]:v}));else if(k==='maxAge')tags.push('≤ '+v);else if(k==='minAge')tags.push('≥ '+v)});
    $('#wunder').innerHTML=tags.length?'<span class="muted small">'+tr('wish_understood')+'</span> '+tags.map(function(x){return'<span class="badge">'+x+'</span>'}).join(' '):'';
    if(!r.length){res.innerHTML='<div class="note">'+tr('wish_none')+'</div>';busy=false;return}
    res.innerHTML='<p class="wcount">'+tr('wish_count',{n:r.length})+'</p><div class="wgrid">'+r.slice(0,3).map(function(x,i){return card(x,i)}).join('')+'</div>'+
      (r.length>3?'<h3 style="margin:22px 0 8px">'+tr('wish_more')+'</h3><div class="grid g3">'+r.slice(3,12).map(function(x){return'<a class="pcard" href="joueur/'+x.p[0]+'.html"><div class="info"><div class="nm">'+x.p[1]+'</div><div class="sub">'+(C[x.p[2]]?C[x.p[2]][1]:'')+(x.p[3]?' · '+tr('pos_'+x.p[3]+'_s'):'')+'</div></div></a>'}).join('')+'</div>':'');
    res.className='wres in';busy=false;if(window.__rerender)window.__rerender()
  },RM?0:4300)
}
document.addEventListener('DOMContentLoaded',function(){
  if(!$('#wtxt'))return;
  cv=$('#fxc');cx=cv.getContext('2d');sizeCanvas();window.addEventListener('resize',sizeCanvas);
  $('#wgo').addEventListener('click',wish);$('#wtxt').addEventListener('keydown',function(e){if(e.key==='Enter')wish()});
  $('#lamp').addEventListener('click',wish);
  document.querySelectorAll('.wchip').forEach(function(b){b.addEventListener('click',function(){$('#wtxt').value=tr(b.dataset.k);wish()})});
  $('#wagain').addEventListener('click',function(){clear();$('#wres').innerHTML='';$('#wunder').innerHTML='';$('#stage').className='stage';say('wish_hello');$('#wtxt').value='';$('#wtxt').focus();busy=false});
  var q=new URLSearchParams(location.search).get('q');if(q){$('#wtxt').value=q;setTimeout(wish,500)}
  $('#wtxt').addEventListener('input',function(){$('#stage').classList.add('listen')});
  say('wish_hello');
  var prev=window.__rerender;window.__rerender=function(){var b=$('#gbub');if(!busy&&!$('#wres').innerHTML)say('wish_hello')};
});
})();
