function makeSprite(d){
 const s=document.createElement("canvas");s.width=256;s.height=256;const g=s.getContext("2d");g.imageSmoothingEnabled=false;
 const px=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 const skin="#e8bd9e",dark="#20232d",cloth=d.color;
 // Pixel-art silhouette: layered clothing, seams, gloves, face and hair.
 px(82,20,92,16,d.hair);px(70,32,116,22,d.hair);px(66,48,18,42,d.hair);px(166,48,20,38,d.hair);
 px(86,54,84,72,skin);px(79,45,98,24,d.hair);px(90,76,10,7,"#26232a");px(155,76,10,7,"#26232a");px(118,101,24,5,"#9a625b");
 px(76,120,104,86,cloth);px(62,132,18,66,cloth);px(176,132,18,66,cloth);
 px(86,200,34,44,"#29364c");px(138,200,34,44,"#29364c");px(78,238,52,12,"#151c28");px(132,238,52,12,"#151c28");
 // jacket panels and pixel highlights
 px(122,126,12,78,"#e8dfcc");px(88,135,28,8,"#ffffff44");px(144,135,24,8,"#ffffff44");
 px(72,150,10,32,skin);px(174,150,10,32,skin);px(72,178,18,18,"#30394c");px(168,178,18,18,"#30394c");
 // Fine pixel accents: eyes, brows, collar, seams, belt, gloves and shoe highlights.
 px(91,70,22,5,d.hair);px(145,70,22,5,d.hair);px(96,82,12,7,"#f7eee0");px(151,82,12,7,"#f7eee0");px(100,83,5,6,"#33485d");px(155,83,5,6,"#33485d");px(120,109,18,3,"#a66d68");
 px(82,124,96,5,"#ffffff55");px(82,194,96,5,"#1b2737");px(112,132,4,58,"#b8c4c9");px(138,132,4,58,"#b8c4c9");px(98,210,14,6,"#526174");px(146,210,14,6,"#526174");px(82,244,40,4,"#718094");px(134,244,40,4,"#718094");
 // Individual signature details and silhouettes
 if(d.name==="大塚蒼生"){px(176,128,26,8,"#8bd8ff");px(190,116,8,30,"#d5f6ff");px(90,26,74,8,"#111722");px(74,55,20,16,"#20232d");px(160,55,18,14,"#20232d")}
 if(d.name==="羽神ミナ"){px(42,138,28,6,"#d9b5ff");px(36,144,8,72,"#b995df");px(28,208,50,6,"#e8d5ff");px(172,132,22,10,"#d9b5ff");px(70,24,20,54,"#292333");px(166,24,18,54,"#292333");px(38,150,8,8,"#f1d9ff");px(34,168,8,8,"#f1d9ff")}
 if(d.name==="住吉"){px(68,126,18,82,"#b5cbd2");px(176,126,18,82,"#b5cbd2");px(88,120,80,8,"#d7e5e8");px(72,58,20,10,"#151a22");px(164,58,20,10,"#151a22");px(82,142,8,48,"#d7e5e8");px(166,142,8,48,"#d7e5e8")}
 if(d.name==="山中和也"){px(64,116,128,96,"#713f45");px(82,126,92,12,"#c26a68");px(88,204,36,42,"#24232a");px(136,204,36,42,"#24232a");px(70,32,116,24,"#28252a");px(78,64,98,8,"#28252a");px(64,134,12,58,"#b96868");px(180,134,12,58,"#b96868")}
 if(d.name==="私和"){px(92,116,72,10,"#9dffe1");px(64,142,18,48,"#b8f5dc");px(174,142,18,48,"#b8f5dc");px(68,38,18,52,"#222b2b");px(168,38,18,52,"#222b2b");px(84,204,38,8,"#9dffe1");px(136,204,38,8,"#9dffe1")}
 if(d.name==="定峰"){px(78,38,100,18,"#aebaff");px(66,134,16,72,"#8799d5");px(174,134,16,72,"#8799d5");px(68,20,118,14,"#282b39");px(78,56,18,28,"#282b39");px(160,56,18,28,"#282b39");px(88,190,80,8,"#b7baff")}
 if(d.name==="漆原"){px(78,44,100,14,"#c2a96b");px(86,128,84,10,"#d9c48d");px(178,145,22,46,"#bca36b");px(82,32,92,8,"#28251e");px(84,140,12,52,"#d9c48d");px(160,140,12,52,"#d9c48d")}
 return s;
}
function drawFighter(c,f,mini=false){
 const x=f.x,y=f.y,phase=f.anim/95;
 if(!spriteCache[f.d.name])spriteCache[f.d.name]=makeSprite(f.d);
 const moving=f.isCPU?Math.abs(f.x-(f._lastX??f.x))>.15:Math.abs(axis)>.1||keys.a||keys.d;
 const jumping=!f.ground,attack=f.attackTime>0&&!f.guard;
 const w=mini?64:112,h=mini?60:148,bob=moving?Math.sin(phase*2)*3:Math.sin(phase)*1.2;
 c.save();c.translate(x+(attack?7:0),y+bob);c.scale(f.dir,1);c.imageSmoothingEnabled=false;
 if(attack&&f.d.name==="山中和也")c.rotate(-.075);
 else if(attack&&f.d.name==="私和")c.rotate(-.11);
 else if(attack&&f.d.name==="羽神ミナ")c.rotate(-.045);
 c.drawImage(spriteCache[f.d.name],-w/2,-h,w,h);
 if(jumping){c.fillStyle="#dff5ff88";c.fillRect(-w*.48,-h-8,w*.96,4)}
 if(f.guard){c.strokeStyle="#9fe5ff";c.lineWidth=3;c.strokeRect(-w*.42,-h-3,w*.84,h+4)}
 if(attack){
  c.fillStyle=f.attackKind==="special"||f.attackKind==="super"?"#ffe08a":"#fff4d0";
  c.fillRect(24,-h*.55,38,6);
  if(f.d.name==="大塚蒼生"){c.strokeStyle="#8bd8ff";c.lineWidth=3;c.beginPath();c.arc(28,-h*.56,26,-1.3,1.1);c.stroke()}
  if(f.d.name==="羽神ミナ"){c.strokeStyle="#d9b5ff";c.lineWidth=4;c.beginPath();c.moveTo(18,-h*.52);c.quadraticCurveTo(62,-h*.8,82,-h*.6);c.stroke()}
  if(f.d.name==="山中和也"){c.fillStyle="#e75d62";c.fillRect(35,-h*.46,34,7)}
 }
 if(f.flash>0){c.globalAlpha=.3;c.fillStyle="#fff";c.fillRect(-w/2,-h,w,h);c.globalAlpha=1}
 c.restore();f._lastX=f.x;
}
function render(){ctx.clearRect(0,0,960,540);let g=ctx.createLinearGradient(0,0,0,540);g.addColorStop(0,"#aebdca");g.addColorStop(.65,"#d8d1bd");g.addColorStop(1,"#7d897f");ctx.fillStyle=g;ctx.fillRect(0,0,960,540);ctx.fillStyle="#8995a0";for(let i=0;i<12;i++){let x=i*86;ctx.fillRect(x,185+(i%4)*15,62,220)}ctx.fillStyle="#e5d8b8";ctx.fillRect(0,430,960,110);ctx.fillStyle="#58635f";ctx.fillRect(0,430,960,5);ctx.fillStyle="#3d4a52";ctx.fillRect(370,60,220,42);ctx.fillStyle="#f7e9c8";ctx.font="bold 18px monospace";ctx.textAlign="center";ctx.fillText("OTSUKA OFFICE",480,87);[p,e].forEach(f=>drawFighter(ctx,f));shots.forEach(s=>{ctx.fillStyle=s.color;ctx.strokeStyle=s.color;ctx.shadowColor=s.color;ctx.shadowBlur=12;ctx.lineWidth=3;ctx.beginPath();if(s.type==="heavy"){ctx.moveTo(s.x-s.size,s.y);ctx.lineTo(s.x,s.y-s.size*1.5);ctx.lineTo(s.x+s.size,s.y);ctx.lineTo(s.x,s.y+s.size*1.5);ctx.closePath();ctx.fill()}else if(s.type==="return"){ctx.arc(s.x,s.y,s.size,0,Math.PI*1.6);ctx.stroke()}else if(s.type==="trap"){ctx.arc(s.x,s.y,s.size+4,0,Math.PI*2);ctx.stroke();ctx.fill()}else if(s.type==="fast"){ctx.moveTo(s.x-s.size*2,s.y);ctx.lineTo(s.x+s.size,s.y);ctx.stroke()}else if(s.type==="homing"){ctx.moveTo(s.x,s.y-s.size);ctx.lineTo(s.x+s.size,s.y);ctx.lineTo(s.x,s.y+s.size);ctx.lineTo(s.x-s.size,s.y);ctx.closePath();ctx.fill()}else{ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill()}ctx.shadowBlur=0});$("pBar").style.width=(p.hp/p.max*100)+"%";$("eBar").style.width=(e.hp/e.max*100)+"%";$("superFill").style.width=p.super+"%";$("comboHud").textContent=p.comboCount>1?p.comboCount+" HIT":""}
function loop(t){if(!running){render();return}let dt=Math.min(34,t-(last||t));last=t;updateF(p,e,dt);updateF(e,p,dt);updateShots(dt);render();if(running)requestAnimationFrame(loop)}
