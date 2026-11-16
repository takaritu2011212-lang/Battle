(() => {
const canvas=document.getElementById('motionView');
const ctx=canvas.getContext('2d');
const W=960,H=540,FLOOR=432;
const $=id=>document.getElementById(id);
const motions={
 idle:{label:'待機',en:'IDLE',duration:1.8},walk:{label:'歩行',en:'WALK',duration:1.05},
 run:{label:'走行',en:'RUN',duration:.72},jump:{label:'ジャンプ',en:'JUMP',duration:1.05},
 crouch:{label:'しゃがみ',en:'CROUCH',duration:1.25},punch:{label:'パンチ',en:'PUNCH',duration:.72},
 kick:{label:'キック',en:'KICK',duration:.9},special:{label:'必殺技',en:'SPECIAL',duration:1.35},
 guard:{label:'ガード',en:'GUARD',duration:1.2},hit:{label:'被弾',en:'DAMAGE',duration:.65}
};
const order=Object.keys(motions);
let current='idle',time=0,last=0,playing=true,auto=false,autoIndex=0,speed=1,fx=true;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{v=clamp((v-a)/(b-a),0,1);return v*v*(3-2*v)};
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill()}
function rr(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function ell(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function stroke(points,c,w=3){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke()}
function glow(x,y,r,color,alpha=1){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color.replace('A',String(.32*alpha)));g.addColorStop(1,color.replace('A','0'));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function drawBackdrop(t){
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#101f38');bg.addColorStop(.6,'#1a2c43');bg.addColorStop(1,'#080f1b');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 // distant dojo windows and pillars
 for(let i=0;i<12;i++){const x=i*88-20,h=105+(i*43%100);rr(x,FLOOR-180-h,58,h,'#15263d');rr(x+6,FLOOR-173-h,3,h-12,'#2b4665');for(let y=FLOOR-160-h;y<FLOOR-18;y+=25)rr(x+17,y,24,2,'#3e668055')}
 rr(0,FLOOR,W,2,'#6ddfff55');rr(0,FLOOR+2,W,H-FLOOR,'#0c1727');
 ctx.strokeStyle='#2c4562';ctx.lineWidth=1;
 for(let i=-8;i<=8;i++){ctx.beginPath();ctx.moveTo(W/2+i*16,FLOOR);ctx.lineTo(W/2+i*90,H);ctx.stroke()}
 for(let y=FLOOR+22;y<H;y+=28+(y-FLOOR)*.12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 glow(480,FLOOR+4,270,'rgba(55,165,235,A)',.8);
 for(let i=0;i<22;i++){const x=(i*179+Math.sin(t*.5+i)*22)%W,y=(i*71+t*13)%390+18;rr(x,y,2,2,'#83dfff66')}
 if(fx){for(let i=0;i<4;i++){const x=120+i*240;rr(x,FLOOR-170,1,130,'#5eb5e51c')}}
 ctx.fillStyle='#b8d2ec33';ctx.font='700 10px Rajdhani, sans-serif';ctx.fillText('O T S U K A   O F F I C E   /   TRAINING FLOOR',28,FLOOR+35);
}
function character(t){
 const dur=motions[current].duration,p=(t%dur)/dur,ph=p*Math.PI*2;
 let lift=0,bob=0,lean=0,arm=0,leg=0,crouch=0,reach=0,kick=0;
 if(current==='idle')bob=Math.sin(ph*2)*2;
 if(current==='walk'){bob=Math.abs(Math.sin(ph*2))*-5;arm=Math.sin(ph)*.43;leg=Math.sin(ph)*.62}
 if(current==='run'){bob=-8-Math.abs(Math.sin(ph*2))*8;lean=.16;arm=Math.sin(ph)*.85;leg=Math.sin(ph)*1.02}
 if(current==='jump'){lift=Math.sin(p*Math.PI)*115;arm=-.72+Math.sin(ph)*.12;leg=.35*Math.sin(ph)}
 if(current==='crouch')crouch=1;
 if(current==='punch'){reach=smooth(.12,.34,p)*(1-smooth(.58,.82,p));arm=-.95*reach;lean=.15*reach}
 if(current==='kick'){kick=smooth(.12,.38,p)*(1-smooth(.62,.86,p));leg=-1.18*kick;lean=-.08*kick}
 if(current==='special'){const a=smooth(.05,.26,p);reach=smooth(.28,.49,p)*(1-smooth(.7,.9,p));lift=a*12;arm=-1.15*reach;lean=.16*reach}
 if(current==='guard'){arm=-.6+Math.sin(ph)*.035;lean=-.08}
 if(current==='hit'){const a=Math.sin(p*Math.PI);lean=-.3*a;bob=7*a}
 const x=480+(current==='walk'?Math.sin(ph)*12:current==='run'?Math.sin(ph)*17:0);
 const y=FLOOR-lift;
 ell(x,FLOOR+5,current==='jump'?38:52,current==='jump'?7:10,'#02071199');
 if(current==='special'){glow(x+85,y-140,155,'rgba(63,191,255,A)',1);glow(x+100,y-150,75,'rgba(135,230,255,A)',.8)}
 ctx.save();ctx.translate(x,y+bob);ctx.transform(1,0,lean,1,0,0);ctx.scale(1,1-crouch*.25);
 const skin='#f2c6ad',skinShadow='#d79a88',hair='#101827',hairLight='#2b405b',coat='#172f4e',coatLight='#31577b',pants='#202c40',boot='#0b1422',cyan='#69e5ff';
 // back leg
 ctx.save();ctx.translate(-10,-50);ctx.rotate(leg*.7);poly([[-8,-3],[7,-3],[10,34],[7,49],[-9,49],[-12,33]],pants);rr(-12,39,23,11,boot);rr(-15,47,31,7,'#070d17');ctx.restore();
 // back arm
 ctx.save();ctx.translate(-18,-157);ctx.rotate(arm*.3+.12);poly([[-7,0],[7,-2],[11,35],[4,49],[-7,45]],coat);rr(-8,12,17,7,coatLight);ell(0,49,8,8,skin);ctx.restore();
 // torso silhouette
 poly([[-22,-165],[18,-165],[25,-112],[18,-94],[-20,-94],[-27,-111]],coat);
 poly([[-21,-160],[-3,-150],[-8,-98],[-23,-107]],'#294a6b');
 poly([[21,-160],[4,-150],[9,-98],[24,-107]],'#203e60');
 poly([[-5,-151],[5,-151],[3,-105],[-3,-105]],'#e0ebf5');
 rr(-22,-105,44,8,'#0b1728');rr(-5,-106,10,9,'#82c8df');
 // front leg
 ctx.save();ctx.translate(10,-50);ctx.rotate(-leg*.7-kick*.12);poly([[-8,-3],[8,-3],[11,34],[8,48],[-9,48],[-12,32]],pants);rr(-10,39,22,10,boot);rr(-14,47,31,7,'#070d17');rr(-7,8,14,4,'#405b79');ctx.restore();
 // neck, face, hair
 rr(-7,-181,14,20,skinShadow);rr(-8,-187,16,12,skin);
 rr(-17,-222,34,39,skin);rr(-20,-214,4,21,skinShadow);rr(16,-214,4,21,skinShadow);
 rr(-19,-231,38,16,hair);rr(-22,-222,10,20,hair);rr(-15,-237,30,9,hairLight);rr(-7,-241,19,7,hair);
 poly([[-18,-218],[-7,-222],[1,-215],[8,-219],[17,-211],[12,-205],[3,-210],[-6,-207],[-15,-211]],hair);
 rr(5,-204,5,2,'#263447');rr(12,-204,3,2,'#263447');rr(7,-197,7,1,'#b87570');rr(-15,-225,25,2,cyan);
 // front arm and fist
 ctx.save();ctx.translate(18,-157);ctx.rotate(arm);poly([[-6,0],[7,-2],[12,35],[5,47],[-7,42]],coat);rr(-7,12,17,7,coatLight);
 if(reach>.02){ctx.translate(0,39);ctx.rotate(-.15*reach);poly([[-6,0],[7,-1],[8,Math.max(5,reach*48)],[ -6,Math.max(5,reach*48)]],coat);ell(1,Math.max(7,reach*49),10,8,skin);rr(-7,Math.max(3,reach*49-5),17,6,'#dceeff')}
 else ell(1,47,8,8,skin);
 ctx.restore();
 rr(17,-151,7,10,cyan);rr(18,-149,5,2,'#e2fbff');
 if(kick>.02){stroke([[9,-54],[27+kick*78,-76]],'#75e7ffbb',7);stroke([[9,-54],[27+kick*78,-76]],'#e0fbff99',2)}
 if(current==='special'&&reach>.03){const ox=reach*112;glow(ox,-100,55,'rgba(70,218,255,A)',1);ell(ox,-100,14,14,'#b9f7ff');ell(ox,-100,8,8,'#42cfff');}
 if(current==='guard'){ctx.strokeStyle='#75e7ffbb';ctx.lineWidth=4;ctx.beginPath();ctx.arc(35,-135,48,-1.25,.95);ctx.stroke()}
 ctx.restore();
 if(fx&&(current==='punch'||current==='kick')&&reach+kick>.2){const px=x+(current==='kick'?80*kick:70*reach),py=y-110;for(let i=0;i<8;i++){const a=i*Math.PI/4+ph;stroke([[px+Math.cos(a)*9,py+Math.sin(a)*9],[px+Math.cos(a)*27,py+Math.sin(a)*27]],'#8ceeffaa',2)}}
 if(current==='special'&&fx){for(let i=0;i<5;i++){const a=ph+i*Math.PI*2/5;ell(x+Math.cos(a)*78,y-140+Math.sin(a)*52,3,3,'#a7f2ff')}}
}
function setMotion(name,stopAuto=true){current=name;time=0;if(stopAuto)auto=false;document.querySelectorAll('.motionButton').forEach(b=>b.classList.toggle('active',b.dataset.motion===name));$('auto').textContent=auto?'自動デモ中':'自動デモ';}
document.querySelectorAll('.motionButton').forEach(b=>b.addEventListener('click',()=>setMotion(b.dataset.motion)));
$('play').addEventListener('click',()=>{playing=!playing;$('play').textContent=playing?'Ⅱ 停止':'▶ 再生'});
$('auto').addEventListener('click',()=>{auto=!auto;autoIndex=Math.max(0,order.indexOf(current));$('auto').textContent=auto?'自動デモ中':'自動デモ';if(auto){playing=true;$('play').textContent='Ⅱ 停止'}});
$('speed').addEventListener('input',e=>{speed=Number(e.target.value);$('speedValue').textContent=speed.toFixed(1)+'×'});
$('effects').addEventListener('change',e=>fx=e.target.checked);
function loop(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(playing)time+=dt*speed;if(auto&&time>=motions[current].duration){time=0;autoIndex=(autoIndex+1)%order.length;setMotion(order[autoIndex],false)}
ctx.clearRect(0,0,W,H);drawBackdrop(time);character(time);
const p=(time%motions[current].duration)/motions[current].duration;$('progressFill').style.width=(p*100)+'%';$('frameReadout').textContent='FRAME '+String(Math.floor(p*24)).padStart(2,'0')+' / LOOP';$('motionName').textContent=motions[current].label+' / '+motions[current].en;
requestAnimationFrame(loop)}
requestAnimationFrame(loop);
})();