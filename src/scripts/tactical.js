
(() => {
  'use strict';
  const canvas=document.querySelector('#network'),ctx=canvas.getContext('2d',{alpha:true});
  const layer=document.createElement('canvas'),lc=layer.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let offscreen=false;
  let width=0,height=0,dpr=1,elapsed=0,previous=0,raf=0,paused=reduced.matches,speed=.65,quiet=false,pointer={x:0,y:0};
  try { paused = reduced.matches || localStorage.getItem('blue-steel-motion') === 'paused'; } catch {}
  const TAU=Math.PI*2;
  // Stable procedural data: no random flicker, external libraries, or network calls.
  const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
  const packets=Array.from({length:96},(_,i)=>({phase:i/96*TAU,bits:Array.from({length:24},(_,j)=>hash(i*31+j)),word:['I-401','NETWORK','SYNC','IONA','BLUE STEEL','LINK','401:0'+i%9,'01001101'][i%8]}));
  const rings=[{radius:320,y:-212,tilt:.19,dir:1,rate:1,h:30},{radius:375,y:60,tilt:.22,dir:-1,rate:.72,h:22},{radius:330,y:260,tilt:.23,dir:1,rate:.5,h:35}];
  function resize(){width=canvas.clientWidth;height=canvas.clientHeight;dpr=Math.min(devicePixelRatio||1,1.6);for(const c of [canvas,layer]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);lc.setTransform(dpr,0,0,dpr,0,0);render(elapsed);}
  function layout(){const mobile=width<650;const scale=Math.min(width/(mobile?700:1450),height/880);return {scale,cx:width*(mobile?.51:.755)+pointer.x*8,cy:height*(mobile?.66:.47)+pointer.y*5};}
  function project(a,r,baseY,tilt,L){const z=Math.sin(a),perspective=1+z*.075;return{x:L.cx+Math.cos(a)*r*L.scale*perspective,y:L.cy+(baseY+z*r*tilt)*L.scale,z,perspective};}
  function pathEllipse(r,y,tilt,L){lc.beginPath();for(let j=0;j<=100;j++){const p=project(j/100*TAU,r,y,tilt,L);j?lc.lineTo(p.x,p.y):lc.moveTo(p.x,p.y);}lc.stroke();}
  function orbit(ring,index,t,L){
    const phase=t*.27*ring.dir*ring.rate;
    lc.strokeStyle='rgba(106,248,238,.18)';lc.lineWidth=.7;
    pathEllipse(ring.radius,ring.y-ring.h*.55,ring.tilt,L);pathEllipse(ring.radius,ring.y+ring.h*.55,ring.tilt,L);
    // Draw rear data first, then the foreground; each packet follows a cylindrical tangent.
    const sorted=packets.map((p,i)=>({p,i,a:p.phase+phase,z:Math.sin(p.phase+phase)})).sort((a,b)=>a.z-b.z);
    for(const {p,i,a,z} of sorted){
      const v=project(a,ring.radius,ring.y,ring.tilt,L),v2=project(a+.007,ring.radius,ring.y,ring.tilt,L);
      const tangent=Math.atan2(v2.y-v.y,v2.x-v.x);const alpha=(.2+(z+1)*.31)*(quiet?.45:1);
      lc.save();lc.translate(v.x,v.y);lc.rotate(tangent);lc.scale(L.scale*v.perspective,L.scale*v.perspective);
      lc.fillStyle=`rgba(114,255,241,${alpha})`;lc.strokeStyle=`rgba(114,255,241,${alpha*.4})`;
      const packetW=TAU*ring.radius/96*.68;
      for(let j=0;j<8;j++){const h=3+p.bits[j]*ring.h*.65;lc.fillRect(j*packetW/8, -h/2,1.2,h);if(p.bits[j+8]>.3)lc.fillRect(j*packetW/8,ring.h*.32,1.3,2);if(p.bits[j+16]>.4)lc.fillRect(j*packetW/8,-ring.h*.5,1,1.8);}
      if(i%5===0){lc.font='7px monospace';lc.fillText(p.word,0,-ring.h*.7);lc.fillRect(0,ring.h*.66,packetW*.7,.6);}
      if(i%12===0){lc.strokeRect(-3,-ring.h*.8,packetW+4,ring.h*1.6);}
      lc.restore();
    }
    // Narrow luminous packet moving independently around the channel.
    const p=project(phase*1.7+index*2.1,ring.radius,ring.y,ring.tilt,L);
    lc.fillStyle='rgba(220,255,250,.85)';lc.fillRect(p.x,p.y,18*L.scale,2*L.scale);
  }
  function network(t,L){
    const y=L.cy+3*L.scale;
    lc.lineWidth=.65;lc.strokeStyle='rgba(99,221,228,.25)';
    for(let i=0;i<27;i++){const a=i/27*TAU-t*.1,p=project(a,385,0,.19,L);const sz=9*L.scale*(1+.1*Math.sin(a));lc.beginPath();for(let k=0;k<=6;k++){const q=k/6*TAU;const xx=p.x+Math.cos(q)*sz,yy=p.y+Math.sin(q)*sz;k?lc.lineTo(xx,yy):lc.moveTo(xx,yy);}lc.stroke();if(i%3===0){const q=project(a+.17,385,0,.19,L);lc.beginPath();lc.moveTo(p.x+sz,p.y);lc.lineTo(q.x-sz,q.y);lc.stroke();}}
    // Subtle vertical channels connect the three information levels.
    for(let i=0;i<8;i++){const x=L.cx+(i-3.5)*72*L.scale;lc.strokeStyle='rgba(77,155,177,.09)';lc.beginPath();lc.moveTo(x,L.cy-230*L.scale);lc.lineTo(x,L.cy+275*L.scale);lc.stroke();}
  }
  function chart(t,L){
    ctx.save();const unit=Math.max(32,width/30);ctx.lineWidth=.6;
    for(let i=0;i<Math.ceil(width/unit)+1;i++){const x=i*unit;ctx.strokeStyle=i%5===0?'rgba(66,155,192,.21)':'rgba(66,155,192,.075)';ctx.beginPath();ctx.moveTo(x,80);ctx.lineTo(x,height-80);ctx.stroke();if(i%5===0){ctx.fillStyle='#476c80';ctx.font='9px monospace';ctx.fillText(String(120+i/10).padEnd(6,'0')+' E',x+5,100);}}
    for(let j=0;j<height/unit;j++){const y=j*unit;ctx.strokeStyle=j%5===0?'rgba(66,155,192,.21)':'rgba(66,155,192,.075)';ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(width-24,y);ctx.stroke();}
    // Fictional coastal contours, nested to suggest underwater relief.
    for(let island=0;island<6;island++){const cx=width*(.48+hash(island+70)*.52),cy=height*(.12+hash(island+80)*.65);for(let depth=0;depth<5;depth++){ctx.beginPath();for(let i=0;i<=90;i++){const a=i/90*TAU;const radius=(45+depth*12)*(1+.23*Math.sin(a*3+island)+.14*Math.cos(a*7));const x=cx+Math.cos(a)*radius*1.45,y=cy+Math.sin(a)*radius*.62;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=`rgba(66,139,172,${.2-depth*.032})`;ctx.stroke();if(depth===0){ctx.fillStyle='rgba(24,64,82,.18)';ctx.fill();}}}
    const cx=width*.73,cy=height*.49,r=Math.min(width*.35,height*.46),angle=t*.22;
    for(let k=0;k<45;k++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle-k*.009,angle-(k-1)*.009);ctx.closePath();ctx.fillStyle=`rgba(85,245,218,${.035*(1-k/45)})`;ctx.fill();}
    ctx.strokeStyle='rgba(114,247,239,.35)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r);ctx.stroke();
    for(let i=0;i<12;i++){const a=hash(i+3)*TAU,rr=r*(.2+.72*hash(i+120));const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;const age=((angle-a)%TAU+TAU)%TAU;const glow=Math.exp(-age*1.4);const col=i%4===0?'255,191,103':'114,247,239';ctx.strokeStyle=`rgba(${col},${.25+.75*glow})`;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1;ctx.beginPath();if(i%3===0){ctx.moveTo(x,y-5);ctx.lineTo(x+4,y+4);ctx.lineTo(x,y+2);ctx.lineTo(x-4,y+4);ctx.closePath();ctx.stroke();}else{ctx.arc(x,y,2+glow*2,0,TAU);ctx.fill();}if(glow>.18){ctx.beginPath();ctx.arc(x,y,7+(1-glow)*22,0,TAU);ctx.strokeStyle=`rgba(${col},${glow*.5})`;ctx.stroke();}ctx.font='9px monospace';ctx.fillStyle=`rgba(${col},${.35+glow*.6})`;ctx.fillText('CT '+String(i+1).padStart(2,'0'),x+10,y-8);ctx.setLineDash([2,6]);ctx.beginPath();ctx.moveTo(x,y+8);ctx.lineTo(x-24,y+38);ctx.stroke();ctx.setLineDash([]);}
    ctx.restore();
  }
  function render(t){
    const L=layout();ctx.clearRect(0,0,width,height);lc.clearRect(0,0,width,height);
    const atmosphere=ctx.createRadialGradient(L.cx,L.cy,0,L.cx,L.cy,500*L.scale);atmosphere.addColorStop(0,'rgba(20,94,107,.20)');atmosphere.addColorStop(1,'rgba(5,14,24,0)');ctx.fillStyle=atmosphere;ctx.fillRect(0,0,width,height);
    chart(t,L);network(t,L);rings.forEach((r,i)=>orbit({...r,tilt:r.tilt+Math.sin(t*.12+i)*.012},i,t,L));
    // Cyan bloom is a blurred second pass, leaving the underlying glyphs crisp.
    ctx.save();ctx.globalCompositeOperation='screen';ctx.filter='blur(7px)';ctx.globalAlpha=.65;ctx.drawImage(layer,0,0,width,height);ctx.filter='none';ctx.globalAlpha=1;ctx.drawImage(layer,0,0,width,height);ctx.restore();
    const waterline=height*.84;ctx.save();ctx.beginPath();ctx.rect(0,waterline,width,height-waterline);ctx.clip();ctx.translate(0,waterline*2);ctx.scale(1,-.7);ctx.globalAlpha=.12;ctx.filter='blur(2px)';ctx.drawImage(layer,0,0,width,height);ctx.restore();
    // Fine scanlines are confined to the holographic field.
    ctx.fillStyle='rgba(5,14,24,.12)';for(let y=0;y<height;y+=4)ctx.fillRect(width<650?0:width*.47,y,width,1);
    // Falloff protects the text column; no live data is implied by the visual glyphs.
    const shade=ctx.createLinearGradient(0,0,width,0);shade.addColorStop(0,'rgba(5,14,24,.7)');shade.addColorStop(width<650?.2:.42,'rgba(5,14,24,.85)');shade.addColorStop(width<650?.65:.62,'rgba(5,14,24,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
  }
  function tick(now){raf=0;if(paused||document.hidden||offscreen){previous=0;return;}if(previous)elapsed+=Math.min((now-previous)/1000,.05)*speed;previous=now;render(elapsed);raf=requestAnimationFrame(tick);}
  function start(){if(!paused&&!document.hidden&&!offscreen&&!raf)raf=requestAnimationFrame(tick);}
  function setPaused(value){paused=value;previous=0;const b=document.querySelector('#pause');b.textContent=value?'Resume motion':'Pause motion';b.setAttribute('aria-pressed',String(value));if(value){cancelAnimationFrame(raf);raf=0;}else start();}
  document.querySelector('#pause').addEventListener('click',()=>{setPaused(!paused);try{localStorage.setItem('blue-steel-motion',paused?'paused':'playing');}catch{}});
  document.querySelector('#clean')?.addEventListener('click',e=>{const clean=document.body.classList.toggle('clean');e.currentTarget.setAttribute('aria-pressed',String(clean));e.currentTarget.textContent=clean?'Show composition':'Background only';});
  document.querySelector('#mode')?.addEventListener('click',e=>{quiet=!quiet;e.currentTarget.setAttribute('aria-pressed',String(quiet));e.currentTarget.textContent=quiet?'Full intensity':'Atmosphere mode';render(elapsed);});
  document.querySelector('#speed')?.addEventListener('input',e=>speed=Number(e.target.value));
  addEventListener('pointermove',e=>{if(reduced.matches||paused)return;pointer={x:(e.clientX/width-.5),y:(e.clientY/height-.5)};});
  document.addEventListener('visibilitychange',()=>{previous=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
  reduced.addEventListener('change',e=>{pointer={x:0,y:0};setPaused(e.matches);render(elapsed);});
  new IntersectionObserver(([entry])=>{offscreen=!entry.isIntersecting;previous=0;if(offscreen){cancelAnimationFrame(raf);raf=0;}else start();}).observe(canvas);
  addEventListener('resize',resize);resize();setPaused(paused);
  // Integration: use this canvas behind page content; control it without changing its DOM.
  window.tacticalNetwork={pause:()=>setPaused(true),play:()=>setPaused(false),setSpeed:v=>{if(Number.isFinite(v))speed=Math.max(.25,Math.min(1.5,v));},renderAt:seconds=>{setPaused(true);elapsed=Math.max(0,seconds);render(elapsed);},getState:()=>({paused,elapsed,speed,quiet,width,height,reducedMotion:reduced.matches})};
})();
