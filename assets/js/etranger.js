/* RSM Scouting — besoins des clubs étrangers + joueurs burkinabè proposés. Données : PLAYERS, CLUBS, BESOINS.roles, ETRANGER.clubs */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)};
var tr=function(k,v){return window.tr?window.tr(k,v):k};
var P=window.PLAYERS||[],B=window.BESOINS||{roles:{}},E=window.ETRANGER||{clubs:[]};
var by={};P.forEach(function(p){by[p[0]]=p});
var CONT=[['cont_eu',['France','Belgique','Suisse','Espagne','Italie','Portugal','Croatie','Allemagne','Autriche','Hongrie','Slovaquie','Serbie','Turquie','Suède','Norvège','Finlande','Danemark','Pays-Bas','Pologne','Tchéquie','Grèce','Roumanie','Angleterre','Écosse','Irlande','Irlande du Nord','Pays de Galles','Ukraine','Russie','Israël','Bulgarie','Slovénie','Chypre','Bosnie-Herzégovine','Islande']],
 ['cont_as',['Japon','Corée du Sud','Chine','Arabie saoudite','Qatar','Émirats arabes unis','Inde','Thaïlande','Australie']],
 ['cont_sa',['Brésil','Argentine','Colombie','Chili','Uruguay','Équateur','Bolivie','Paraguay','Pérou']],
 ['cont_na',['USA','Mexique','Canada','Costa Rica']]];
var PAYS=[];CONT.forEach(function(c){PAYS=PAYS.concat(c[1])});
function optionsPays(have){return CONT.map(function(c){var l=c[1].filter(function(p){return have[p]});return l.length?'<optgroup label="'+tr(c[0])+'">'+l.map(function(p){return'<option value="'+p+'">'+tr('pays_'+p)+'</option>'}).join('')+'</optgroup>':''}).join('')}
var st={pays:'France',pos:'',acc:false,young:false};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
function ini(n){var p=n.split(/\s+/);return((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||'')}
function cands(b){   /* candidats propres à ce club et à ce poste : gabarit, âge, style de jeu et niveau les plus proches du profil type du club */
  var out=[];(b.c||[]).forEach(function(x){var p=by[x[0]];if(!p)return;if(st.young&&!(p[4]!=null&&p[4]<=23))return;out.push([p,x[1]])});
  return out.slice(0,5)}
function card(p,sc){var h=hue(p[2]);var ph=p[15]?'<img src="assets/photos/'+p[0]+'.jpg" alt="">':esc(ini(p[1]).toUpperCase());
  return'<a class="candrow" href="joueur/'+p[0]+'.html"><div class="ph" style="--h1:hsl('+h+',45%,32%);--h2:hsl('+(h+40)+',50%,18%)">'+ph+'</div><div class="cn"><b>'+esc(p[1])+'</b><span>'+tr('pos_'+p[3]+'_s')+(p[4]!=null?' · '+tr('f_age_n',{n:p[4]}):'')+(p[7]?' · '+p[7]+'′':'')+'</span></div><div class="cf"><div class="fitbar"><i style="width:'+Math.max(4,sc)+'%"></i></div><b>'+sc+'</b></div></a>'}
function render(){
  var out=$('#abOut');if(!E.clubs.length){out.innerHTML='<div class="note info">'+tr('ab_loading')+'</div>';return}
  var cl=E.clubs.filter(function(c){return c.pays===st.pays&&(!st.acc||c.acc)});
  cl.forEach(function(c){c._b=c.b.filter(function(b){return!st.pos||b.g===st.pos})[0]||c.b[0]});
  cl.sort(function(a,b){return b._b.s-a._b.s});
  var uk=['Angleterre','Écosse','Irlande du Nord','Pays de Galles'].indexOf(st.pays)>=0?'<div class="note info">'+tr('et_gbe_adulte')+'<br>'+tr('et_gbe_jeune')+(st.pays!=='Angleterre'?'<br>'+tr('et_gbe_loc'):'')+'</div>':'';
  out.innerHTML=uk+cl.map(function(c){var b=c._b,cs=cands(b);
    return'<article class="need"><header><span class="needn">'+tr('ab_rank',{k:c.rang,n:c.nb})+'</span><h3>'+esc(c.n)+'</h3><span class="badge pos">'+tr('pos_'+b.g+'_s')+'</span>'+
    '<div class="needbar"><span>'+tr('ab_need')+'</span><div class="fitbar red"><i style="width:'+b.s+'%"></i></div><b>'+b.s+'</b></div></header>'+
    '<div class="small muted" style="margin:6px 0">'+tr('et_style_'+c.style)+' · '+c.gf+' / '+c.ga+' · '+tr('et_val',{v:c.val})+(b.t?' · '+tr('et_gab',{t:b.t,tj:'…'}).split(' (')[0]:'')+'</div>'+
    '<ul class="why">'+b.why.map(function(w){return'<li>'+tr(w[0],w[1])+'</li>'}).join('')+'</ul>'+
    '<div class="candh">'+tr('ab_cands')+'</div>'+(cs.length?'<div class="cands">'+cs.map(function(x){return card(x[0],x[1])}).join('')+'</div>':'<div class="muted small">'+tr('ab_none')+'</div>')+'</article>'}).join('')||'<div class="note info">'+tr('ab_none')+'</div>'}
document.addEventListener('DOMContentLoaded',function(){
  var sel=$('#abPays');if(!sel)return;
  var have={};E.clubs.forEach(function(c){have[c.pays]=1});
  sel.innerHTML=optionsPays(have);
  if(have[st.pays])sel.value=st.pays;else st.pays=sel.value;
  sel.addEventListener('change',function(){st.pays=sel.value;render()});
  Array.prototype.forEach.call(document.querySelectorAll('#abPos button'),function(b){b.addEventListener('click',function(){st.pos=b.dataset.g;Array.prototype.forEach.call(document.querySelectorAll('#abPos button'),function(x){x.classList.toggle('on',x===b)});render()})});
  $('#abAcc').addEventListener('change',function(){st.acc=this.checked;render()});
  $('#abYoung').addEventListener('change',function(){st.young=this.checked;render()});
  render();window.__rerender=function(){var v=sel.value;sel.innerHTML=optionsPays(have);sel.value=v;render()}
});
})();
