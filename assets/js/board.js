/* RSM Scouting — Plateau tactique 3D.
   1) fiche joueur : le joueur est placé à son poste idéal dans ses systèmes les plus adaptés ;
   2) « Mon club » : le système du club avec, par poste, la force du besoin (colonne haute et rouge = poste à renforcer) ; un clic liste les candidats. */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)};
var tr=function(k,v){return window.tr?window.tr(k,v):k};
/* x : -52.5 (but) -> +52.5 ; z : -34 (gauche) -> +34 (droite) */
var FORM={
 '4-3-3':[['GK',-47,0],['LB',-30,-25],['LCB',-33,-9],['RCB',-33,9],['RB',-30,25],['CM1',-10,-17],['DM',-16,0],['CM2',-10,17],['LW',17,-26],['ST',26,0],['RW',17,26]],
 '4-4-2':[['GK',-47,0],['LB',-30,-25],['LCB',-33,-9],['RCB',-33,9],['RB',-30,25],['LM',-5,-26],['CM1',-9,-8],['CM2',-9,8],['RM',-5,26],['ST',22,-8],['SS',22,8]],
 '4-2-3-1':[['GK',-47,0],['LB',-30,-25],['LCB',-33,-9],['RCB',-33,9],['RB',-30,25],['DM1',-15,-8],['DM2',-15,8],['LW',9,-24],['AM',8,0],['RW',9,24],['ST',26,0]],
 '3-5-2':[['GK',-47,0],['LCB',-33,-14],['CB',-35,0],['RCB',-33,14],['LWB',-6,-29],['CM1',-8,-12],['DM',-14,0],['CM2',-8,12],['RWB',-6,29],['ST',22,-8],['SS',22,8]],
 '4-1-4-1':[['GK',-47,0],['LB',-30,-25],['LCB',-33,-9],['RCB',-33,9],['RB',-30,25],['DM',-17,0],['LM',-2,-26],['CM1',-4,-9],['CM2',-4,9],['RM',-2,26],['ST',25,0]],
 '3-4-3':[['GK',-47,0],['LCB',-33,-14],['CB',-35,0],['RCB',-33,14],['LWB',-8,-29],['CM1',-12,-8],['CM2',-12,8],['RWB',-8,29],['LW',18,-22],['ST',26,0],['RW',18,22]]
};
var GROUP=function(k){return k==='GK'?'gk':/^(LB|RB|LCB|RCB|CB|LWB|RWB)$/.test(k)?'df':/^(DM|DM1|DM2|CM|CM1|CM2|AM|LM|RM)$/.test(k)?'mf':'fw'};
var ROLES_SLOT={GK:['gk_line','gk_sweeper'],LB:['df_fb_off','df_fb_def'],RB:['df_fb_off','df_fb_def'],LWB:['df_fb_off','df_fb_def'],RWB:['df_fb_off','df_fb_def'],LCB:['df_stopper','df_ballplay'],RCB:['df_stopper','df_ballplay'],CB:['df_stopper','df_ballplay'],
 DM:['mf_anchor'],DM1:['mf_anchor'],DM2:['mf_anchor'],CM1:['mf_b2b','mf_playmaker'],CM2:['mf_b2b','mf_playmaker'],CM:['mf_b2b','mf_playmaker'],AM:['mf_playmaker'],LM:['mf_wide'],RM:['mf_wide'],
 LW:['fw_winger'],RW:['fw_winger'],ST:['fw_poacher','fw_target','fw_mobile','fw_false9'],SS:['fw_false9','fw_mobile','fw_poacher']};
var SLOT_ROLE={fw_poacher:['ST','SS'],fw_target:['ST'],fw_mobile:['ST','SS'],fw_false9:['SS','ST'],fw_winger:['LW','RW','LM','RM'],mf_anchor:['DM','DM1','DM2','CM1'],mf_b2b:['CM1','CM2','CM'],mf_playmaker:['AM','CM1','CM2'],mf_wide:['LM','RM','LW','RW'],
 df_stopper:['LCB','RCB','CB'],df_ballplay:['LCB','RCB','CB'],df_fb_off:['LB','RB','LWB','RWB'],df_fb_def:['LB','RB','LWB','RWB'],gk_line:['GK'],gk_sweeper:['GK']};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function mix(a,b,t){return[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)]}
var GRIS=[132,142,138],VERT=[0,158,73],OR=[252,209,22],ROUGE=[239,43,45];
function needColor(n){return n<50?mix(VERT,OR,n/50):mix(OR,ROUGE,(n-50)/50)}

document.addEventListener('DOMContentLoaded',function(){
  /* ------- fiche joueur */
  var tb=$('#tb3d');
  if(tb&&window.RSM3D){
    var d=JSON.parse($('#tb3dData').textContent),cv=$('canvas',tb),sc=window.RSM3D.board(cv),cur=d.systems[0];
    function slotFor(sys){var f=FORM[sys],cands=SLOT_ROLE[d.role]||[],pick=null;
      cands.forEach(function(k){if(!pick&&f.some(function(s){return s[0]===k}))pick=k});
      if(d.foot==='left'){var L=cands.filter(function(k){return/^L/.test(k)&&f.some(function(s){return s[0]===k})})[0];if(L)pick=L}
      else if(d.foot==='right'){var R=cands.filter(function(k){return/^R/.test(k)&&f.some(function(s){return s[0]===k})})[0];if(R&&/^(LB|LW|LM|LWB)$/.test(pick||''))pick=R}
      return pick||f[f.length-1][0]}
    function draw(sys){cur=sys;var me=slotFor(sys);
      sc.set(FORM[sys].map(function(s){var on=s[0]===me;return{x:s[1],z:s[2],h:on?30:7,big:on,c:on?[252,209,22]:GRIS,label:on?d.name:'',lc:'#8f0c22',tag:on?'':''}}));
      Array.prototype.forEach.call(tb.querySelectorAll('[data-sys]'),function(b){b.classList.toggle('on',b.dataset.sys===sys)});
      $('#tb3dSlot',tb).textContent=tr('tb_slot',{slot:me})}
    Array.prototype.forEach.call(tb.querySelectorAll('[data-sys]'),function(b){b.addEventListener('click',function(){draw(b.dataset.sys)})});
    draw(cur);
  }
  /* ------- mon club */
  var cb=$('#clubBoard');
  if(cb&&window.RSM3D){
    var P=window.PLAYERS||[],B=window.BESOINS||{roles:{},allneed:{}},by={};P.forEach(function(p){by[p[0]]=p});
    var cv2=$('canvas',cb),sc2=window.RSM3D.board(cv2,pick),sys='4-3-3',club='',maxAge=99;
    function needOf(k){var an=(B.allneed||{})[club]||{},m=0;(ROLES_SLOT[k]||[]).forEach(function(r){m=Math.max(m,an[r]||0)});return m}
    function drawClub(){
      if(!club){sc2.set([]);$('#cbList').innerHTML='';return}
      sc2.set(FORM[sys].map(function(s){var n=needOf(s[0]);return{x:s[1],z:s[2],k:s[0],h:6+n*.28,big:n>=60,c:needColor(n),label:n?String(n):'',lc:n>=60?'#8f0c22':'#14171C',n:n}}));
      Array.prototype.forEach.call(cb.querySelectorAll('[data-sys]'),function(b){b.classList.toggle('on',b.dataset.sys===sys)})}
    function pick(s){var g=GROUP(s.k),roles=ROLES_SLOT[s.k]||[],out=[];
      P.forEach(function(p){var r=B.roles[p[0]];if(!r||p[2]===club||p[3]!==g||(p[7]||0)<90)return;if(roles.indexOf(r[0])<0)return;if(p[4]!=null&&p[4]>maxAge)return;out.push([p,r[1]])});
      out.sort(function(a,b){return b[1]-a[1]});
      $('#cbList').innerHTML='<h3 style="margin:14px 0 8px">'+tr('ro_'+roles[0])+(roles[1]?' / '+tr('ro_'+roles[1]):'')+' · '+tr('bp_need')+' '+s.n+'</h3>'+(out.length?'<div class="cands">'+out.slice(0,8).map(function(x){var p=x[0];
        return'<a class="candrow" href="joueur/'+p[0]+'.html"><div class="ph" style="--h1:hsl(150,40%,30%);--h2:hsl(170,50%,16%)">'+esc((p[1].split(' ')[0]||'')[0]+(p[1].split(' ').pop()||'')[0])+'</div><div class="cn"><b>'+esc(p[1])+'</b><span>'+(p[4]!=null?tr('f_age_n',{n:p[4]}):'')+(p[7]?' · '+p[7]+'′':'')+'</span></div><div class="cf"><div class="fitbar"><i style="width:'+Math.max(4,x[1])+'%"></i></div><b>'+x[1]+'</b></div></a>'}).join('')+'</div>':'<div class="muted small">'+tr('bp_none')+'</div>')}
    Array.prototype.forEach.call(cb.querySelectorAll('[data-sys]'),function(b){b.addEventListener('click',function(){sys=b.dataset.sys;drawClub()})});
    var sel=document.getElementById('bpClub');
    function sync(){club=sel?sel.value:'';drawClub();$('#cbList').innerHTML=''}
    if(sel)sel.addEventListener('change',sync);
    Array.prototype.forEach.call(document.querySelectorAll('#bpAge button'),function(b){b.addEventListener('click',function(){maxAge=+b.dataset.a})});
    setTimeout(sync,50);
  }
});
})();
