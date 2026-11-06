/* RSM Scouting — mini moteur 3D (canvas 2D, sans bibliothèque) : colonnes extrudées rotatives. ~6 Ko. */
(function(){
'use strict';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function Scene(canvas,opts){
  var ctx=canvas.getContext('2d'),S=this;S.yaw=opts.yaw==null?-0.6:opts.yaw;S.pitch=opts.pitch==null?0.95:opts.pitch;S.dist=opts.dist||150;S.auto=!RM&&opts.auto!==false;S.items=[];S.lines=[];S.labels=[];S.drag=null;S.W=0;S.H=0;S.raf=0;
  function size(){var r=canvas.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);S.W=r.width;S.H=r.height||r.width*0.62;canvas.width=S.W*d;canvas.height=S.H*d;ctx.setTransform(d,0,0,d,0,0)}
  S.size=size;
  S.proj=function(x,y,z){ /* monde : x droite, y haut, z profondeur ; centre = (0,0,0) */
    var cy=Math.cos(S.yaw),sy=Math.sin(S.yaw),cp=Math.cos(S.pitch),sp=Math.sin(S.pitch);
    var x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cp-z1*sp,z2=y*sp+z1*cp;
    var k=S.dist/(S.dist+z2+opts.far),sc=Math.min(S.W,S.H*1.6)/ (opts.span||120);
    return[S.W/2+x1*k*sc,S.H*0.58-y1*k*sc,z2]};
  function poly(pts,fill,stroke,alpha){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();if(alpha!=null)ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.6;ctx.stroke()}ctx.globalAlpha=1}
  function shade(c,f){return'rgb('+Math.round(c[0]*f)+','+Math.round(c[1]*f)+','+Math.round(c[2]*f)+')'}
  S.draw=function(){
    ctx.clearRect(0,0,S.W,S.H);
    /* sol */
    if(opts.floor){var f=opts.floor,c=[[-f.w/2,0,-f.d/2],[f.w/2,0,-f.d/2],[f.w/2,0,f.d/2],[-f.w/2,0,f.d/2]].map(function(p){return S.proj(p[0],p[1],p[2])});poly(c,f.color||'#1d6b3c',null);
      if(opts.stripes){var nb=14,bw=f.w/nb;for(var bi=0;bi<nb;bi++){var x0=-f.w/2+bi*bw,x1=x0+bw;poly([S.proj(x0,0,-f.d/2),S.proj(x1,0,-f.d/2),S.proj(x1,0,f.d/2),S.proj(x0,0,f.d/2)],bi%2?'#1f7a43':'#26894c',null)}
        /* bordure du terrain (cadre) pour détacher le gazon du fond */
        ctx.lineWidth=3;ctx.strokeStyle='#0d5c33';ctx.beginPath();c.forEach(function(q,i){i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();ctx.stroke()}}
    ctx.lineWidth=opts.stripes?1.8:1;ctx.strokeStyle=opts.stripes?'rgba(255,255,255,.9)':'rgba(255,255,255,.55)';
    S.lines.forEach(function(l){ctx.beginPath();l.forEach(function(p,i){var q=S.proj(p[0],0,p[1]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.stroke()});
    /* joueurs-pions : ombre, corps arrondi, tête sphérique, halo ; du plus loin au plus proche */
    (S.pawns||[]).map(function(p){return{p:p,d:S.proj(p.x,0,p.z)[2]}}).sort(function(a,b){return b.d-a.d}).forEach(function(o){var p=o.p,g=(S.grow==null?1:S.grow),h=p.h*g,
      b0=S.proj(p.x,0,p.z),t0=S.proj(p.x,h,p.z),q1=S.proj(p.x+p.r,0,p.z),r=Math.max(3,Math.hypot(q1[0]-b0[0],q1[1]-b0[1])),col=p.c,bx=b0[0],by=b0[1],tx=t0[0],ty=t0[1];
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(bx+r*.25,by+r*.25,r*1.35,r*.62,0,0,7);ctx.fill();
      if(p.halo){var pulse=RM?1:1+.08*Math.sin(Date.now()/280);ctx.strokeStyle='rgba(252,209,22,.95)';ctx.lineWidth=3;ctx.shadowColor='rgba(252,209,22,.9)';ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(bx,by,r*2.1*pulse,r*.95*pulse,0,0,7);ctx.stroke();ctx.shadowBlur=0}
      /* corps */
      var gr=ctx.createLinearGradient(bx-r,0,bx+r,0);gr.addColorStop(0,shade(col,.62));gr.addColorStop(.45,shade(col,1.12));gr.addColorStop(1,shade(col,.7));
      ctx.lineCap='round';ctx.strokeStyle=gr;ctx.lineWidth=r*1.9;ctx.beginPath();ctx.moveTo(bx,by-r*.2);ctx.lineTo(tx,ty+r*.9);ctx.stroke();
      /* base */
      ctx.fillStyle=shade(col,.55);ctx.beginPath();ctx.ellipse(bx,by-r*.1,r*1.15,r*.5,0,0,7);ctx.fill();
      /* tête */
      var hr=r*.95,hx=tx,hy=ty-hr*.35,rg=ctx.createRadialGradient(hx-hr*.35,hy-hr*.4,hr*.15,hx,hy,hr*1.05);rg.addColorStop(0,'rgba(255,255,255,.95)');rg.addColorStop(.35,shade(col,1.25));rg.addColorStop(1,shade(col,.7));
      ctx.fillStyle=rg;ctx.beginPath();ctx.arc(hx,hy,hr,0,7);ctx.fill();ctx.lineWidth=1.2;ctx.strokeStyle='rgba(0,0,0,.35)';ctx.stroke();
      if(p.t){ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=3;ctx.font='800 '+Math.round(Math.max(10,hr*1.05))+'px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeText(p.t,hx,hy+1);ctx.fillText(p.t,hx,hy+1)}
      ctx.restore();ctx.textBaseline='alphabetic'});
    /* colonnes triées du plus loin au plus proche */
    var arr=S.items.map(function(b){var c=S.proj(b.x,0,b.z);return{b:b,d:c[2]}}).sort(function(a,b){return b.d-a.d});
    arr.forEach(function(o){var b=o.b,hw=b.w/2,hd=b.d/2,h=b.h*(S.grow==null?1:S.grow);if(h<.15)return;
      var P=function(x,y,z){return S.proj(b.x+x,y,b.z+z)};
      var t=[P(-hw,h,-hd),P(hw,h,-hd),P(hw,h,hd),P(-hw,h,hd)],bt=[P(-hw,0,-hd),P(hw,0,-hd),P(hw,0,hd),P(-hw,0,hd)];
      var faces=[[bt[0],bt[1],t[1],t[0],.62],[bt[1],bt[2],t[2],t[1],.78],[bt[2],bt[3],t[3],t[2],.62],[bt[3],bt[0],t[0],t[3],.78]];
      faces.sort(function(a,b){return(b[0][2]+b[1][2])-(a[0][2]+a[1][2])});
      var fcs=faces.slice(2); /* les deux faces les plus proches */
      fcs.forEach(function(f){poly([f[0],f[1],f[2],f[3]],shade(b.c,f[4]),'rgba(0,0,0,.18)')});
      poly(t,shade(b.c,1),'rgba(0,0,0,.2)')});
    /* étiquettes */
    ctx.font='700 11px system-ui,sans-serif';ctx.textAlign='center';
    S.labels.forEach(function(l){var q=S.proj(l.x,l.y||0,l.z);ctx.fillStyle=l.color||'#14171C';ctx.fillText(l.t,q[0],q[1]+(l.dy||0))});
  };
  function loop(t){if(S.auto&&!S.drag)S.yaw+=0.0035;if(S.grow!=null&&S.grow<1){S.grow=Math.min(1,S.grow+0.045)}S.draw();S.raf=requestAnimationFrame(loop)}
  S.start=function(){size();if(RM){S.grow=1;S.draw();return}S.grow=opts.animate===false?1:0;S.raf=requestAnimationFrame(loop)};
  S.stop=function(){cancelAnimationFrame(S.raf)};
  canvas.style.touchAction='none';canvas.style.cursor='grab';
  canvas.addEventListener('pointerdown',function(e){S.drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'});
  canvas.addEventListener('pointermove',function(e){if(!S.drag)return;S.yaw+=(e.clientX-S.drag.x)*0.008;S.pitch=Math.max(.25,Math.min(1.45,S.pitch+(e.clientY-S.drag.y)*0.005));S.drag={x:e.clientX,y:e.clientY};if(RM)S.draw()});
  canvas.addEventListener('pointerup',function(){S.drag=null;canvas.style.cursor='grab'});
  canvas.addEventListener('wheel',function(e){e.preventDefault();S.dist=Math.max(70,Math.min(320,S.dist+e.deltaY*0.1));if(RM)S.draw()},{passive:false});
  window.addEventListener('resize',function(){size();if(RM)S.draw()});
  /* ne tourne que visible */
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){if(!S.raf&&!RM)S.raf=requestAnimationFrame(loop)}else{cancelAnimationFrame(S.raf);S.raf=0}})}).observe(canvas)}
}
function colorScale(t){ /* 0..1 : vert -> or -> rouge */
  var a=[29,107,60],b=[252,209,22],c=[200,16,46];if(t<.5){var u=t/.5;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u]}var v=(t-.5)/.5;return[b[0]+(c[0]-b[0])*v,b[1]+(c[1]-b[1])*v,b[2]+(c[2]-b[2])*v]}
/* terrain 3D : grille ny x nx de valeurs */
window.RSM3D={
  heat:function(canvas,grid){
    var ny=grid.length,nx=grid[0].length,mx=0;grid.forEach(function(r){r.forEach(function(v){if(v>mx)mx=v})});if(!mx)return null;
    var sc=new Scene(canvas,{far:60,dist:170,span:128,floor:{w:105,d:68,color:'#1d6b3c'}}),cw=105/nx,ch=68/ny;
    for(var y=0;y<ny;y++)for(var x=0;x<nx;x++){var v=grid[y][x];if(v>0){var t=Math.pow(v/mx,.6);sc.items.push({x:-52.5+cw*(x+.5),z:-34+ch*(y+.5),w:cw*.9,d:ch*.9,h:2+t*26,c:colorScale(t)})}}
    var L=function(a){sc.lines.push(a.map(function(p){return[p[0]-52.5,p[1]-34]}))};
    L([[0,0],[105,0],[105,68],[0,68],[0,0]]);L([[52.5,0],[52.5,68]]);L([[0,13.8],[16.5,13.8],[16.5,54.2],[0,54.2]]);L([[105,13.8],[88.5,13.8],[88.5,54.2],[105,54.2]]);
    var c=[];for(var i=0;i<=40;i++){var a=i/40*Math.PI*2;c.push([52.5+9.15*Math.cos(a),34+9.15*Math.sin(a)])}L(c);
    sc.start();return sc},
  league:function(canvas,clubs){ /* clubs : [{n,v,c:[r,g,b]}] */
    var sc=new Scene(canvas,{far:60,dist:210,span:190,pitch:.72,yaw:-.7,floor:{w:96,d:96,color:'#e9e4d6'}}),mx=Math.max.apply(null,clubs.map(function(c){return c.v}))||1,n=4;
    clubs.forEach(function(c,i){var gx=i%n,gz=Math.floor(i/n),x=-33+gx*22,z=-33+gz*22;sc.items.push({x:x,z:z,w:15,d:15,h:4+c.v/mx*34,c:c.c});sc.labels.push({x:x,z:z+12,y:0,t:c.n,color:'#14171C',dy:12});sc.labels.push({x:x,z:z,y:6+c.v/mx*34,t:String(c.v),color:'#8f0c22',dy:-6})});
    sc.start();return sc},
  /* plateau tactique 3D : un système (4-3-3…) en colonnes sur le terrain ; chaque poste peut être surligné, cliqué. */
  board:function(canvas,onPick){
    var sc=new Scene(canvas,{far:60,dist:175,span:122,pitch:.92,yaw:-.28,auto:false,stripes:true,floor:{w:105,d:68,color:'#1d6b3c'}});
    sc.pawns=[];
    var L=function(a){sc.lines.push(a.map(function(p){return[p[0]-52.5,p[1]-34]}))};
    L([[0,0],[105,0],[105,68],[0,68],[0,0]]);L([[52.5,0],[52.5,68]]);L([[0,13.8],[16.5,13.8],[16.5,54.2],[0,54.2]]);L([[105,13.8],[88.5,13.8],[88.5,54.2],[105,54.2]]);
    var c=[];for(var i=0;i<=40;i++){var a=i/40*Math.PI*2;c.push([52.5+9.15*Math.cos(a),34+9.15*Math.sin(a)])}L(c);
    sc.slots=[];
    sc.set=function(slots){sc.slots=slots;sc.items=[];sc.labels=[];sc.pawns=[];
      slots.forEach(function(s){var big=!!s.big;sc.pawns.push({x:s.x,z:s.z,h:s.h||8,r:big?3.6:2.9,c:s.c||[120,130,128],halo:s.halo||big,t:s.num||''});
        if(s.label)sc.labels.push({x:s.x,z:s.z,y:(s.h||8)+9,t:s.label,color:s.lc||'#14171C',dy:-6})});
      sc.grow=RM?1:0;if(RM)sc.draw()};
    canvas.addEventListener('click',function(e){if(!sc.slots.length)return;var r=canvas.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,best=null,bd=1e9;
      sc.slots.forEach(function(s){var q=sc.proj(s.x,(s.h||8)*.6,s.z),d=Math.hypot(q[0]-mx,q[1]-my);if(d<bd){bd=d;best=s}});
      if(best&&bd<34&&onPick)onPick(best)});
    sc.start();return sc},
  colorScale:colorScale
};
})();
