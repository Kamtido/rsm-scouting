/* RSM Scouting — expérience personnalisée : profil de visite, accueil adapté, « Pour toi », « Repris où tu étais », « Mon club ». Tout reste dans localStorage. */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)};
var tr=function(k,v){return window.tr?window.tr(k,v):k};
function get(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var ROLES=['recruiter','agent','fan','press','player'];
function profile(){return get('rsm_profile',null)}
/* ---- historique de visite : sur une fiche joueur ---- */
function track(){var m=document.querySelector('meta[name="rsm-player"]');if(!m)return;var s=m.content,r=get('rsm_recent',[]).filter(function(x){return x!==s});r.unshift(s);set('rsm_recent',r.slice(0,8))}
/* ---- boîte de dialogue de personnalisation ---- */
function dialog(force){
  var p=profile()||{};var C=window.CLUBS||{};
  var d=document.createElement('dialog');d.className='pz';
  d.innerHTML='<div class="dh"><b>'+tr('pz_title')+'</b><button type="button" id="pzx">✕</button></div><div class="db"><div><b>'+tr('pz_role_q')+'</b></div><div class="roles">'+ROLES.map(function(r){return'<button type="button" data-r="'+r+'" class="'+(p.role===r?'on':'')+'">'+tr('pz_r_'+(r==='recruiter'?'recruiter':r))+'</button>'}).join('')+'</div>'+
   '<div><b>'+tr('pz_club_q')+'</b></div><select id="pzclub"><option value="">'+tr('pz_none')+'</option>'+Object.keys(C).sort(function(a,b){return C[a][0].localeCompare(C[b][0])}).map(function(s){return'<option value="'+s+'"'+(p.club===s?' selected':'')+'>'+C[s][0]+'</option>'}).join('')+'</select>'+
   '<button type="button" class="btn" id="pzok">'+tr('pz_save')+'</button><p class="small muted" style="margin:0">'+tr('pz_private')+' <a href="#" id="pzclear">'+tr('pz_clear')+'</a></p></div>';
  document.body.appendChild(d);var role=p.role||'';
  d.querySelectorAll('.roles button').forEach(function(b){b.addEventListener('click',function(){role=b.dataset.r;d.querySelectorAll('.roles button').forEach(function(x){x.classList.toggle('on',x===b)})})});
  $('#pzx',d).addEventListener('click',function(){set('rsm_pz_seen',1);d.close();d.remove()});
  $('#pzok',d).addEventListener('click',function(){set('rsm_profile',{role:role,club:$('#pzclub',d).value});set('rsm_pz_seen',1);d.close();d.remove();location.reload()});
  $('#pzclear',d).addEventListener('click',function(e){e.preventDefault();['rsm_profile','rsm_recent','rsm_watch','rsm_pz_seen'].forEach(function(k){try{localStorage.removeItem(k)}catch(x){}});location.reload()});
  if(d.showModal)d.showModal();else d.setAttribute('open','')}
/* ---- accueil adaptatif ---- */
var ORDER={recruiter:['pz-foryou','sec-young','sec-stars','sec-wish','sec-video','sec-table','sec-latest'],agent:['sec-agency','sec-young','pz-foryou','sec-stars','sec-video','sec-table','sec-latest'],
 fan:['pz-myclub','sec-latest','sec-table','sec-next','pz-foryou','sec-stars','sec-young'],press:['sec-latest','sec-table','sec-stars','sec-young','sec-next','sec-video'],player:['sec-wish','sec-stars','sec-young','sec-latest','sec-table']};
function adapt(p){
  var box=$('#homesecs');if(!box)return;var bar=$('#pzbar');
  if(bar){bar.innerHTML=(p?'<span>'+tr('pz_greet_'+p.role)+'</span>':'<span>'+tr('pz_title')+'</span>')+'<button class="btn sm gold" id="pzedit" type="button">'+tr('pz_edit')+'</button>';bar.hidden=false;$('#pzedit').addEventListener('click',function(){dialog(true)})}
  if(!p||!p.role)return;
  (ORDER[p.role]||[]).slice().reverse().forEach(function(id){var el=document.getElementById(id);if(el&&el.parentNode===box)box.insertBefore(el,box.firstChild)})}
function similar(){
  var P=window.PLAYERS||[],w=get('rsm_watch',[]),r=get('rsm_recent',[]),pr=profile()||{};
  var base=w.concat(r).map(function(s){return P.filter(function(p){return p[0]===s})[0]}).filter(Boolean);
  var seen={};w.concat(r).forEach(function(s){seen[s]=1});var out=[];
  if(base.length){var pos={},ages=[];base.forEach(function(p){if(p[3])pos[p[3]]=(pos[p[3]]||0)+1;if(p[4]!=null)ages.push(p[4])});var avg=ages.length?ages.reduce(function(a,b){return a+b})/ages.length:null;
    out=P.filter(function(p){return!seen[p[0]]&&(p[7]||0)>=180&&(!Object.keys(pos).length||pos[p[3]])&&(avg==null||p[4]==null||Math.abs(p[4]-avg)<=3.5)}).sort(function(a,b){return(b[16]||0)-(a[16]||0)||(b[7]||0)-(a[7]||0)})}
  if(out.length<6&&pr.club){var cl=P.filter(function(p){return p[2]===pr.club&&!seen[p[0]]&&(p[7]||0)>0}).sort(function(a,b){return((b[8]||0)+(b[9]||0))-((a[8]||0)+(a[9]||0))||(b[7]||0)-(a[7]||0)});out=out.concat(cl)}
  if(out.length<6){var young=P.filter(function(p){return!seen[p[0]]&&p[4]!=null&&p[4]<=21&&(p[7]||0)>=270}).sort(function(a,b){return(b[16]||0)-(a[16]||0)});out=out.concat(young)}
  var u={};return out.filter(function(p){if(u[p[0]])return false;u[p[0]]=1;return true}).slice(0,6)}
function fill(){
  var P=window.PLAYERS||[],pr=profile();
  var fy=$('#pz-foryou');if(fy&&window.RSMUI){var s=similar();if(s.length){$('#pz-foryou-grid').innerHTML=s.map(function(p){return window.RSMUI.card(p,'')}).join('');fy.hidden=false;window.RSMUI.stars($('#pz-foryou-grid'))}}
  var rs=$('#pz-resume');if(rs&&window.RSMUI){var r=get('rsm_recent',[]).map(function(s){return P.filter(function(p){return p[0]===s})[0]}).filter(Boolean).slice(0,4);if(r.length){$('#pz-resume-grid').innerHTML=r.map(function(p){return window.RSMUI.card(p,'')}).join('');rs.hidden=false;window.RSMUI.stars($('#pz-resume-grid'))}}
  var mc=$('#pz-myclub');if(mc&&pr&&pr.club&&window.CLUBINFO&&window.CLUBINFO[pr.club]){var i=window.CLUBINFO[pr.club],C=window.CLUBS[pr.club];
    var form=(i.forme||'').split('').map(function(x){return'<i class="'+x+'">'+{g:'V',n:'N',p:'D'}[x]+'</i>'}).join('');
    $('#pz-myclub-body').innerHTML='<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><img class="crest lg" src="assets/crests/'+pr.club+'.png" alt=""><div><b style="font-size:20px">'+C[0]+'</b><div class="small muted">'+tr('cl_rankn',{n:i.rang,p:i.pts})+'</div><span class="form" style="margin-top:6px">'+form+'</span></div>'+
      (i.last?'<a class="btn line sm" href="match/'+i.last+'.html">'+tr('lk_match')+'</a>':'')+'<a class="btn sm" href="club/'+pr.club+'.html">'+C[0]+' →</a></div>';mc.hidden=false}}
document.addEventListener('DOMContentLoaded',function(){
  track();var p=profile();adapt(p);fill();
  var e=$('#pzopen');if(e)e.addEventListener('click',function(){dialog(true)});
  if($('#homesecs')&&!p&&!get('rsm_pz_seen',0))setTimeout(function(){if(!document.querySelector('dialog[open]'))dialog(false)},1800);
  var prev=window.__rerender;window.__rerender=function(){if(prev)prev();adapt(profile());fill()}
});
})();
