/* RSM Scouting pro — langues, explorateur, suivi, comparaison. Aucune dépendance. */
(function(){
'use strict';
var LANGS=['fr','en','de','es','it','ru','ja','hr','ko','zh','ms','ta','el','tr'];
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
var lang=store('rsm_lang');if(LANGS.indexOf(lang)<0){lang=(navigator.language||'fr').slice(0,2);if(LANGS.indexOf(lang)<0)lang='fr'}
function L(){return LANGS.indexOf(lang)}
function tr(k,v){var e=(window.I18N||{})[k];var s=e?(e[L()]||e[1]||e[0]):k;if(v)s=s.replace(/\{(\w+)\}/g,function(_,n){return v[n]!==undefined?v[n]:''});return s}
window.tr=tr;
function applyLang(){
  document.documentElement.lang=lang;
  for(var pass=0;pass<2;pass++)$$('[data-i18n]').forEach(function(el){var v=null;if(el.dataset.v){try{v=JSON.parse(el.dataset.v)}catch(e){}}el.innerHTML=tr(el.dataset.i18n,v)});
  $$('[data-i18n-ph]').forEach(function(el){el.placeholder=tr(el.dataset.i18nPh)});
  $$('[data-i18n-t]').forEach(function(el){el.title=tr(el.dataset.i18nT)});
  var loc={fr:'fr-FR',en:'en-GB',de:'de-DE',es:'es-ES',it:'it-IT',ru:'ru-RU',ja:'ja-JP',hr:'hr-HR',ko:'ko-KR',zh:'zh-SG',ms:'ms-SG',ta:'ta-SG',el:'el-GR',tr:'tr-TR'}[lang];
  $$('time[data-d]').forEach(function(el){var d=new Date(el.dataset.d+'T12:00:00');if(!isNaN(d))el.textContent=d.toLocaleDateString(loc,{day:'numeric',month:el.dataset.f==='s'?'short':'long',year:el.dataset.f==='s'?undefined:'numeric'})});
  var sel=$('#lang');if(sel)sel.value=lang;
  if(window.__rerender)window.__rerender();
}
document.addEventListener('DOMContentLoaded',function(){
  var sel=$('#lang');if(sel)sel.addEventListener('change',function(){lang=sel.value;store('rsm_lang',lang);applyLang()});
  var b=$('#burger');if(b)b.addEventListener('click',function(){$('#menu').classList.toggle('open')});
  var pr=$('#print');if(pr)pr.addEventListener('click',function(){window.print()});
  /* onglets journées */
  var pills=$$('[data-md-btn]');pills.forEach(function(p){p.addEventListener('click',function(){pills.forEach(function(x){x.classList.remove('on')});p.classList.add('on');$$('.md-panel').forEach(function(m){m.hidden=m.dataset.md!==p.dataset.mdBtn});if(history.replaceState)history.replaceState(null,'','#j'+p.dataset.mdBtn)})});
  if(pills.length){var h=(location.hash.match(/^#j(\d+)/)||[])[1];var t=h&&$('[data-md-btn="'+h+'"]')||pills[pills.length-1];t.click()}
  /* suivi (étoiles) */
  wireStars();
  initExplorer();initWatch();
  applyLang();
});
/* ---------------- suivi + comparaison ---------------- */
function watch(){try{return JSON.parse(store('rsm_watch')||'[]')}catch(e){return[]}}
function setWatch(a){store('rsm_watch',JSON.stringify(a))}
function wireStars(root){
  $$('.star',root).forEach(function(s){if(s.__w)return;s.__w=1;var slug=s.dataset.slug;s.classList.toggle('on',watch().indexOf(slug)>=0);
    s.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var w=watch(),i=w.indexOf(slug);if(i>=0)w.splice(i,1);else w.push(slug);setWatch(w);s.classList.toggle('on',i<0);var c=$('#wcount');if(c)c.textContent=w.length})});
  var c=$('#wcount');if(c)c.textContent=watch().length;
}
var cmp=[];
function wireCmp(root){
  $$('.chk input',root).forEach(function(c){if(c.__w)return;c.__w=1;c.addEventListener('click',function(e){e.stopPropagation()});c.addEventListener('change',function(){var s=c.dataset.slug,i=cmp.indexOf(s);if(c.checked){if(cmp.length>=3){c.checked=false;return}cmp.push(s)}else if(i>=0)cmp.splice(i,1);updCmp()})});
  $$('.chk',root).forEach(function(l){l.addEventListener('click',function(e){e.stopPropagation()})});
}
function updCmp(){var bar=$('#cmpbar');if(!bar)return;bar.classList.toggle('on',cmp.length>=2);$('#cmpn').textContent=cmp.length}
function openCmp(){
  var P=window.PLAYERS||[],rows=cmp.map(function(s){return P.filter(function(p){return p[0]===s})[0]}).filter(Boolean);
  if(rows.length<2)return;
  var M=[['f_matches',6],['f_minutes',7],['f_goals',8],['f_assists',9],['f_yellow',10],['f_red',11],['f_ga90',16]];
  var h='<table><thead><tr><th></th>'+rows.map(function(r){return'<th class="c">'+r[1]+'<br><small>'+clubName(r[2])+'</small></th>'}).join('')+'</tr></thead><tbody>';
  M.forEach(function(m){var vals=rows.map(function(r){return r[m[1]]==null?-1:r[m[1]]}),mx=Math.max.apply(null,vals);h+='<tr><td>'+tr(m[0])+'</td>'+rows.map(function(r,i){var v=r[m[1]];return'<td class="c'+(vals[i]===mx&&mx>0&&m[0]!=='f_yellow'&&m[0]!=='f_red'?' me':'')+'"><b>'+(v==null?'—':(m[1]===16?v.toFixed(2):v))+'</b></td>'}).join('')+'</tr>'});
  h+='<tr><td>'+tr('f_position')+'</td>'+rows.map(function(r){return'<td class="c">'+(r[3]?tr('pos_'+r[3]):'—')+'</td>'}).join('')+'</tr>';
  h+='<tr><td>'+tr('f_age')+'</td>'+rows.map(function(r){return'<td class="c">'+(r[4]==null?'—':r[4])+'</td>'}).join('')+'</tr>';
  h+='<tr><td></td>'+rows.map(function(r){return'<td class="c"><a class="btn sm" href="joueur/'+r[0]+'.html">'+tr('f_open')+'</a></td>'}).join('')+'</tr></tbody></table>'+(rows.length>=2?'<p style="text-align:center;margin-top:14px"><a class="btn" href="versus.html?a='+rows[0][0]+'&b='+rows[1][0]+'">'+tr('vs_open')+'</a></p>':'');
  $('#cmpbody').innerHTML=h;var d=$('#cmpdlg');if(d.showModal)d.showModal();else d.setAttribute('open','')
}
function clubName(s){return(window.CLUBS||{})[s]?window.CLUBS[s][0]:s}
function crest(s){return'assets/crests/'+s+'.png'}
/* ---------------- carte joueur ---------------- */
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
function initials(n){var p=n.split(/\s+/);return((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||'')}
function cardHTML(p,base){
  var h=hue(p[2]);var ph=p[15]?'<img src="'+base+'assets/photos/'+p[0]+'.jpg" alt="" loading="lazy">':initials(p[1]).toUpperCase();
  var pos=p[3]?'<span class="badge pos">'+tr('pos_'+p[3]+'_s')+'</span>':'';
  var lv=p[14]?'<span class="badge rsm">RSM</span>':(p[13]?'<span class="badge n2">'+tr('f_video')+'</span>':'');
  var w=watch().indexOf(p[0])>=0;
  return'<a class="pcard" href="'+base+'joueur/'+p[0]+'.html"><div class="ph" style="--h1:hsl('+h+',45%,32%);--h2:hsl('+(h+40)+',50%,18%)">'+ph+'</div><div class="info"><div class="nm">'+p[1]+'</div>'+
  '<div class="sub"><img class="crest" src="'+base+crest(p[2])+'" alt="">'+clubName(p[2])+' '+pos+' '+lv+'</div>'+
  '<div class="nums"><span><b>'+(p[6]==null?'—':p[6])+'</b> '+tr('f_m_s')+'</span><span><b>'+(p[8]==null?'—':p[8])+'</b> '+tr('f_g_s')+'</span><span><b>'+(p[9]==null?'—':p[9])+'</b> '+tr('f_a_s')+'</span><span><b>'+(p[7]==null?'—':p[7])+'</b>′</span></div></div>'+
  '<button class="star'+(w?' on':'')+'" data-slug="'+p[0]+'" aria-label="★">★</button><label class="chk"><input type="checkbox" data-slug="'+p[0]+'"'+(cmp.indexOf(p[0])>=0?' checked':'')+'> '+tr('f_compare')+'</label></a>'
}
/* ---------------- explorateur ---------------- */
var shown=0,res=[],PAGE=24;
function initExplorer(){
  var box=$('#results');if(!box||!window.PLAYERS)return;
  var q=new URLSearchParams(location.search);
  var clubSel=$('#f_club');Object.keys(window.CLUBS).sort(function(a,b){return window.CLUBS[a][0].localeCompare(window.CLUBS[b][0])}).forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=window.CLUBS[c][0];clubSel.appendChild(o)});
  var map={q:'#f_q',club:'#f_club',pos:'#f_pos',age:'#f_age',min:'#f_min',niv:'#f_niv',sort:'#f_sort'};
  Object.keys(map).forEach(function(k){var el=$(map[k]);if(q.get(k)!==null)el.value=q.get(k);el.addEventListener('input',run)});
  if(q.get('agence')==='1')$('#f_niv').value='agence';
  $('#more').addEventListener('click',function(){draw(false)});
  $('#cmpgo').addEventListener('click',openCmp);$('#cmpclose').addEventListener('click',function(){$('#cmpdlg').close()});
  $('#cmpreset').addEventListener('click',function(){cmp=[];$$('.chk input').forEach(function(c){c.checked=false});updCmp()});
  function run(){
    var f={q:$('#f_q').value.trim().toLowerCase(),club:$('#f_club').value,pos:$('#f_pos').value,age:parseInt($('#f_age').value,10)||0,min:parseInt($('#f_min').value,10)||0,niv:$('#f_niv').value};
    var s=$('#f_sort').value;
    res=window.PLAYERS.filter(function(p){
      if(f.q&&(p[1].toLowerCase().indexOf(f.q)<0&&clubName(p[2]).toLowerCase().indexOf(f.q)<0&&String(p[5])!==f.q))return false;
      if(f.club&&p[2]!==f.club)return false;if(f.pos&&p[3]!==f.pos)return false;if(f.age&&(p[4]==null||p[4]>f.age))return false;if(f.min&&(p[7]||0)<f.min)return false;
      if(f.niv==='video'&&!p[13])return false;if(f.niv==='agence'&&!p[14])return false;if(f.niv==='ech'&&!p[18])return false;return true});
    var key={m:6,min:7,g:8,a:9,ga:16,age:4}[s]||7;
    res.sort(function(a,b){if(s==='name')return a[1].localeCompare(b[1]);if(s==='age'){return(a[4]==null?99:a[4])-(b[4]==null?99:b[4])}
      var va=a[key]==null||(s==='ga'&&!a[18])?-1:a[key],vb=b[key]==null||(s==='ga'&&!b[18])?-1:b[key];var d=vb-va;if(d)return d;if(a[14]!==b[14])return b[14]-a[14];return(b[7]||0)-(a[7]||0)});
    draw(true)
  }
  function draw(reset){
    if(reset){shown=0;box.innerHTML=''}
    var part=res.slice(shown,shown+PAGE);box.insertAdjacentHTML('beforeend',part.map(function(p){return cardHTML(p,'')}).join(''));shown+=part.length;
    $('#count').innerHTML=tr('f_results',{n:res.length});$('#more').style.display=shown<res.length?'block':'none';wireStars(box);wireCmp(box)
  }
  window.__rerender=function(){draw2()};
  function draw2(){var n=shown;box.innerHTML='';shown=0;var part=res.slice(0,Math.max(n,PAGE));box.insertAdjacentHTML('beforeend',part.map(function(p){return cardHTML(p,'')}).join(''));shown=part.length;$('#count').innerHTML=tr('f_results',{n:res.length});wireStars(box);wireCmp(box)}
  run()
}
/* ---------------- liste de suivi ---------------- */
function initWatch(){
  var box=$('#watchlist');if(!box||!window.PLAYERS)return;
  function paint(){var w=watch(),P=window.PLAYERS.filter(function(p){return w.indexOf(p[0])>=0});
    $('#wempty').hidden=P.length>0;box.innerHTML=P.map(function(p){return cardHTML(p,'')}).join('');wireStars(box);wireCmp(box);
    $$('.star',box).forEach(function(s){s.addEventListener('click',function(){setTimeout(paint,50)})})}
  $('#cmpgo').addEventListener('click',openCmp);$('#cmpclose').addEventListener('click',function(){$('#cmpdlg').close()});
  $('#cmpreset').addEventListener('click',function(){cmp=[];$$('.chk input').forEach(function(c){c.checked=false});updCmp()});
  var ex=$('#export');if(ex)ex.addEventListener('click',function(){var w=watch(),P=window.PLAYERS.filter(function(p){return w.indexOf(p[0])>=0});
    var csv='nom;club;poste;age;numero;matchs;minutes;buts;passes_decisives\n'+P.map(function(p){return[p[1],clubName(p[2]),p[3]||'',p[4]==null?'':p[4],p[5]==null?'':p[5],p[6]==null?'':p[6],p[7]==null?'':p[7],p[8]==null?'':p[8],p[9]==null?'':p[9]].join(';')}).join('\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv'}));a.download='rsm-scouting-suivi.csv';a.click()});
  window.__rerender=paint;paint()
}
window.RSMUI={card:cardHTML,stars:wireStars};
})();
