function pushMotion(token){
 if(!p)return;
 const now=performance.now();
 p.commandBuffer=p.commandBuffer.filter(v=>now-v.t<1100);
 const last=p.commandBuffer[p.commandBuffer.length-1];
 if(last&&last.v===token&&now-last.t<180)return;
 p.commandBuffer.push({v:token,t:now});
 if(p.commandBuffer.length>8)p.commandBuffer.shift();
}
function recordCombo(f,token){
 const now=performance.now();
 f.comboBuffer=(f.comboBuffer||[]).filter(v=>now-v.t<1000);
 f.comboBuffer.push({code:token,t:now});
 if(f.comboBuffer.length>4)f.comboBuffer.shift();
 const route=f.d.comboRoute||[];
 const recent=f.comboBuffer.slice(-route.length).map(v=>v.code);
 const hit=route.length>0&&recent.length===route.length&&recent.every((v,i)=>v===route[i]);
 if(hit){
  f.comboBuffer=[];
  f.super=Math.min(100,f.super+12);
  say(f.d.name+" 固有コンボ！");
 }
 return hit;
}
function tryCommand(f,t,code){
 const chained=f.comboWindow>0&&f.attackTime<120&&!f.pendingHit;
 if(f.stun>0||f.attackTime>0&&!chained||f.cool>0&&!chained)return false;
 const now=performance.now();
 f.commandBuffer=(f.commandBuffer||[]).filter(v=>now-v.t<950);
 const seq=f.commandBuffer.map(v=>v.v).join("");
 if(code==="P"&&seq.endsWith("DF")){
  f.commandBuffer=[];f.attackKind="special";f.motionDuration=260;f.attackTime=260;f.cool=850;f.comboWindow=0;f.pendingHit=null;
  const q=f.d.shot,boost=1.45;f.shotCool=Math.max(f.shotCool,q.cool);
  const spawn=(vy=0,off=0)=>shots.push({x:f.x+f.dir*25,y:f.y-65+off,vx:f.dir*q.speed*1.2,vy,damage:Math.round(q.damage*boost),size:q.size*1.25,color:q.color,owner:f,life:160,type:q.type||"normal",hitCount:0,turn:false});
  if(q.type==="triple"){spawn(-1,-8);spawn();spawn(1,8)}else spawn();
  say(f.d.name+"："+f.d.special+"・連環弾 ↓→+P");
  return true;
 }
 if(code==="K"&&seq.endsWith("FDF")){
  f.commandBuffer=[];f.attackKind="special";f.motionDuration=320;f.attackTime=320;f.cool=900;f.comboWindow=0;f.pendingHit=null;
  meleeEffect(f,t,Math.round(f.d.strong*1.35),f.d.reach+30,"突進奥義");
  return true;
 }
 if(code==="P"&&seq.endsWith("BB")){
  f.commandBuffer=[];f.x=clamp(f.x-f.dir*45,45,915);f.focus=420;f.attackKind="counter";f.motionDuration=220;f.attackTime=220;f.cool=900;f.comboWindow=0;f.pendingHit=null;
  say(f.d.name+"：後退反撃 ←←+P");
  return true;
 }
 return false;
}
function attackButton(f,t,code){
 if(!running||(code!=="P"&&code!=="K")||f.stun>0||(!f.ground&&f.airAttackUsed))return;
 const chained=f.comboWindow>0&&f.attackTime<120&&!f.pendingHit;
 if((f.attackTime>0||f.cool>0)&&!chained)return;
 f.dir=t.x>=f.x?1:-1;
 if(tryCommand(f,t,code))return;
 const crouch=f.ground&&(f.crouch||f===p&&axisY>.35||f===p&&keys.arrowdown);
 const airborne=!f.ground;
 const toward=f===p?((axis>0&&f.dir>0)||(axis<0&&f.dir<0)||((keys.d||keys.right||keys.arrowright)&&f.dir>0)||((keys.a||keys.left||keys.arrowleft)&&f.dir<0)):Math.abs(t.x-f.x)>f.d.reach+10;
 const strong=toward&&!crouch&&!airborne;
 const rank=airborne?"air":crouch?"low":strong?"strong":code==="K"?"medium":"weak";
 const stage=chained?f.comboStage+1:1;
 const routeHit=recordCombo(f,code);
 const base=strong?f.d.strong:code==="K"?Math.round(f.d.weak*1.25):f.d.weak;
 const comboScale=chained?Math.max(.68,1-(stage-1)*.12):1;
 const damage=Math.max(1,Math.round(base*(airborne?.82:crouch?.9:1)*comboScale*(routeHit?1.15:1)));
 const reach=f.d.reach*(strong?1.18:code==="K"?1:.86)*(crouch?.92:airborne?.95:1);
 const recovery=f.d.motion?.recovery||1;
 const attackTime=Math.round((strong?280:airborne?190:code==="K"?195:155)*recovery);
 const cooldown=Math.round((strong?620:airborne?390:code==="K"?360:260)*recovery);
 f.attackKind=airborne?"air-"+(code==="K"?"medium":"weak"):rank;
 f.attackTime=attackTime;f.motionDuration=attackTime;f.cool=cooldown;
 f.comboWindow=strong?0:620;f.comboStage=stage;f.moveState="attack";f.moveTimer=attackTime;
 if(!f.ground)f.airAttackUsed=true;
 f.pendingHit={delay:Math.max(32,attackTime*.28),damage,range:reach,rank,strong,airborne,chained,routeHit};
}
function resolveAttack(f,t,hit){
 if(!running||Math.abs(t.x-f.x)>hit.range||Math.abs(t.y-f.y)>125||f.dir!==(t.x>=f.x?1:-1)||(hit.rank==="air"&&t.crouch))return;
 let damage=hit.damage;
 let blocked=t.guard&&t.guardBreak<=0&&((hit.rank==="air"||hit.rank==="weak"||hit.rank==="medium"||hit.rank==="strong")?!t.crouch:hit.rank==="low"?t.crouch:true);
 const armored=t.focus>0;
 if(armored){t.focus=0;damage=Math.max(1,Math.ceil(damage*.4));blocked=true;say("FOCUS ARMOR!")}
 let broken=false;
 if(blocked&&t.guard&&!armored){
  const guardDamage=hit.strong?42:hit.rank==="medium"?26:hit.rank==="low"?24:hit.rank==="air"?20:16;
  t.guardMeter=Math.max(0,t.guardMeter-guardDamage);
  damage=Math.max(1,Math.ceil(damage*(t.d.name==="住吉"?.2:.38)));
  if(t.guardMeter<=0){
   t.guard=false;t.guardBreak=1050;broken=true;damage=Math.ceil(hit.damage*1.25);
   say("GUARD CRUSH!");
  }
 }
 t.hp=Math.max(0,t.hp-damage);
 t.stun=armored?0:broken?820:blocked?95:hit.strong?285:hit.rank==="air"?210:hit.rank==="low"?190:hit.rank==="medium"?175:145;
 t.flash=130;t.x=clamp(t.x+f.dir*(blocked?5:18),45,915);
 f.super=Math.min(100,f.super+damage*.65);t.super=Math.min(100,t.super+damage*.25);
 f.comboCount=hit.chained?f.comboCount+1:1;f.comboTimer=950;
 if(f.comboCount>1)say(f.comboCount+" HIT COMBO");
 if(hit.routeHit)say(f.d.name+" 固有ルート成立！");
 hitEffects.push({x:t.x,y:t.y-60,life:190,color:"#ffe6a0"});
 checkWin();
}
function melee(f,t,kind){
 const chained=f.comboWindow>0&&f.attackTime<95;
 if(!running||f.stun>0||f.attackTime>0&&!chained||f.cool>0&&!chained||(!f.ground&&f.airAttackUsed))return;
 const d=kind==="weak"?f.d.weak:f.d.strong,range=(kind==="weak"?f.d.reach:f.d.reach+14);
 const airborne=!f.ground,damageScale=airborne?.82:1;
 f.attackKind=airborne?"air-"+kind:kind;f.attackTime=kind==="weak"?190:270;
 f.cool=(kind==="weak"?430:690)*(f.d.name==="漆原"?.78:1);
 f.comboWindow=620;f.comboStage=chained?f.comboStage+1:1;if(f.comboStage>=3)f.comboWindow=0;
 if(airborne)f.airAttackUsed=true;
 if(Math.abs(t.x-f.x)<=range&&Math.abs(t.y-f.y)<(airborne?125:90)&&f.dir===(t.x>f.x?1:-1)){
  let damage=Math.max(1,Math.round(d*damageScale)),broken=false;
  if(t.guard&&((airborne||!f.crouch)?!t.crouch:t.crouch)){t.guardMeter=Math.max(0,t.guardMeter-(kind==="strong"?34:20));damage=Math.max(1,Math.ceil(d*(t.d.name==="住吉"?.22:.42)));if(t.guardMeter<=0){t.guard=false;t.guardBreak=950;t.stun=720;damage=Math.ceil(d*1.25);broken=true}}
  t.hp=Math.max(0,t.hp-damage);if(!broken)t.stun=t.guard?85:kind==="weak"?145:230;
  t.flash=110;t.x=clamp(t.x+f.dir*(t.guard?5:17),45,915);
  say(broken?t.d.name+"のガードブレイク！":f.d.name+"："+(airborne?"空中":"")+(kind==="weak"?"弱攻撃":"強攻撃")+"！");
  checkWin();
 }
}
function shoot(f,forced=false){
 if(!running||f.shotCool>0||f.stun>0||(f.attackTime>0&&!forced)){if(f.shotCool>0)f.comboBoost=1;return;}
 const q=f.d.shot,type=q.type||"normal",superBoost=(f.attackKind==="super"?1.8:1)*(f.comboBoost||1);
 const spawn=(vy=0,offset=0)=>shots.push({x:f.x+f.dir*25,y:f.y-65+offset,vx:f.dir*q.speed,vy,damage:Math.round(q.damage*superBoost),size:q.size*(superBoost>1?1.5:1),color:q.color,owner:f,life:type==="trap"?240:150,type,hitCount:0,turn:false});
 if(type==="triple"){spawn(-1.05,-9);spawn(0,0);spawn(1.05,9)}else spawn();
 f.shotCool=q.cool;f.attackTime=155;f.motionDuration=155;f.attackKind="shot";f.comboWindow=0;f.comboBoost=1;say(f.d.name+"："+q.name+"！");
}
function special(f,t){
 const chained=f.comboWindow>0&&f.attackTime<120&&!f.pendingHit;
 if(!running||f.stun>0||f.attackTime>0&&!chained||f.cool>0&&!chained)return;
 const name=f.d.name;
 if((name==="大塚蒼生"||name==="漆原")&&f.shotCool>0){say(name+"：技再使用待機");return}
 const routeHit=recordCombo(f,"S");
 const powered=f.super>=100;
 if(powered)f.super=0;
 f.comboBoost=routeHit?1.2:1;
 f.cool=name==="私和"?560:760;f.attackTime=powered?420:190;f.motionDuration=f.attackTime;
 f.attackKind=powered?"super":"special";f.comboWindow=0;f.pendingHit=null;
 if(name==="定峰"){f.x=clamp(t.x-f.dir*70,45,915);f.dir=t.x>f.x?1:-1;meleeEffect(f,t,13,100,"幻歩");return}
 if(name==="羽神ミナ"){meleeEffect(f,t,17,150,"死奥の鎖");return}
 if(name==="住吉"){f.guard=true;f.attackTime=520;f.motionDuration=520;f.guardMeter=Math.min(100,f.guardMeter+25+(routeHit?20:0));f.comboBoost=1;say("住吉：合理的迎撃！");return}
 if(name==="山中和也"){meleeEffect(f,t,21,105,"破鏡");if(Math.abs(t.x-f.x)<110)t.bleed=2400;return}
 if(name==="漆原"){f.guard=true;f.attackTime=0;shoot(f,true);return}
 if(name==="私和"){f.x=clamp(f.x+f.dir*95,45,915);meleeEffect(f,t,15,85,"瞬動");return}
 shoot(f,true);
}
function meleeEffect(f,t,dmg,range,label){if(Math.abs(t.x-f.x)<=range&&f.dir===(t.x>f.x?1:-1)){dmg=Math.round(dmg*(f.attackKind==="super"?1.8:1)*(f.comboBoost||1));f.comboBoost=1;const armored=t.focus>0;if(armored){t.focus=0;dmg=Math.max(1,Math.ceil(dmg*.4))}t.hp=Math.max(0,t.hp-dmg);t.stun=armored?0:230;t.flash=140;t.x=clamp(t.x+f.dir*20,45,915);say(f.d.name+"："+label+"！");checkWin()}else say(f.d.name+"："+label+"！")}
function checkWin(){if(p.hp<=0||e.hp<=0){running=false;const winner=p.hp>0?p.d.name:e.d.name;sessionStorage.setItem("battleWinner",winner);sessionStorage.setItem("battlePlayer",p.d.name);sessionStorage.setItem("battleResult",p.hp>0?"WIN":"LOSE");location.href="result.html"}}
function updateF(f,t,dt){let k=dt/16.67;f.anim+=dt;f.crouch=!!(f.ground&&f===p&&(axisY>.35||keys.arrowdown));f.moveTimer=Math.max(0,f.moveTimer-dt);f.focus=Math.max(0,f.focus-dt);f.comboTimer=Math.max(0,f.comboTimer-dt);if(f.comboTimer===0)f.comboCount=0;if(f.moveTimer===0&&f.attackTime===0)f.moveState=f.ground?"idle":"jump";f.cool=Math.max(0,f.cool-dt);f.shotCool=Math.max(0,f.shotCool-dt);f.stun=Math.max(0,f.stun-dt);f.attackTime=Math.max(0,f.attackTime-dt);f.flash=Math.max(0,f.flash-dt);f.comboWindow=Math.max(0,f.comboWindow-dt);f.guardBreak=Math.max(0,f.guardBreak-dt);if(!f.guard&&f.guardBreak<=0)f.guardMeter=Math.min(100,f.guardMeter+dt*.018);if(f.guardBreak>0)f.guard=false;if(f.bleed>0){let old=Math.ceil(f.bleed/800);f.bleed=Math.max(0,f.bleed-dt);if(Math.ceil(f.bleed/800)<old){f.hp=Math.max(0,f.hp-1);checkWin()}}if(f.attackTime===0&&f.isCPU&&f.guardBreak>0)f.guard=false;
if(f.isCPU){f.ai+=dt;f.dir=t.x>f.x?1:-1;f.crouch=!!(t.crouch&&Math.abs(t.x-f.x)<150&&f.ai%1200>800);if(f.stun<=0&&f.attackTime<=0){let dist=Math.abs(t.x-f.x);if(dist>270){f.x+=f.dir*f.d.speed*.8*k}else if(dist>f.d.reach+25){f.x+=f.dir*f.d.speed*.65*k;if(f.ai>850){f.ai=0;shoot(f)}}else if(f.ai>650){f.ai=0;let r=Math.random();if(r<.38)attackButton(f,t,"P");else if(r<.76)attackButton(f,t,"K");else special(f,t)}else if(f.ai>450&&f.d.name==="住吉"){f.ai=0;f.guard=true;f.attackTime=420}}}
else if(f.stun<=0&&f.attackTime<=0){let move=axis;if(keys.left||keys.a)move=-1;if(keys.right||keys.d)move=1;if(move){f.x+=move*f.d.speed*k;f.dir=t.x>f.x?1:-1}if(keys.jump&&f.ground){f.vy=-9.5;f.ground=false;f.airAttackUsed=false}f.crouch=f.ground&&((f===p&&(axisY>.35||keys.arrowdown))||(f===e&&Math.abs(t.x-f.x)<125&&Math.random()<.002));const backGuard=f===p&&((f.dir>0&&(axis<-.4||keys.a||keys.left||keys.arrowleft))||(f.dir<0&&(axis>.4||keys.d||keys.right||keys.arrowright)));const autoGuard=f===p&&f.ground&&Math.abs(move)<.1;f.guard=f.guardBreak<=0&&(backGuard||autoGuard||(f===e&&Math.abs(t.x-f.x)<f.d.reach+25&&f.ai%900>680))}
if(!f.ground){f.y+=f.vy*k;f.vy+=.48*k;if(f.y>=425){f.y=425;f.vy=0;f.ground=true;f.airAttackUsed=false}}if(f.pendingHit){f.pendingHit.delay-=dt;if(f.pendingHit.delay<=0){const hit=f.pendingHit;f.pendingHit=null;resolveAttack(f,t,hit)}}f.x=clamp(f.x,45,915)}
function updateShots(dt){
 for(let i=shots.length-1;i>=0;i--){
  const s=shots[i],target=s.owner===p?e:p,step=dt/16.67;
  if(s.type==="homing"){const dy=(target.y-48)-s.y;s.vy=clamp(s.vy+dy*.006,-1.8,1.8)}
  if(s.type==="return"&&s.life<78&&!s.turn){s.vx=-s.vx;s.turn=true}
  if(s.type==="trap")s.vx*=.965;
  s.x+=s.vx*step;s.y+=s.vy*step;s.life-=dt;
  if(s.type==="return"&&s.turn&&Math.abs(s.x-s.owner.x)<22){shots.splice(i,1);continue}
  if(Math.abs(s.x-target.x)<s.size+18&&Math.abs(s.y-(target.y-48))<44&&(s.type!=="return"||s.hitCount===0)){
   let dmg=s.damage,armored=target.focus>0,blocked=target.guard&&target.guardBreak<=0&&!armored,broken=false;
   if(armored){target.focus=0;dmg=Math.max(1,Math.ceil(dmg*.4))}
   else if(blocked){target.guardMeter=Math.max(0,target.guardMeter-(s.type==="heavy"?42:24));dmg=Math.max(1,Math.ceil(dmg*(target.d.name==="住吉"?.2:.42)));if(target.guardMeter<=0){target.guard=false;target.guardBreak=1050;broken=true;dmg=Math.ceil(s.damage*1.2)}}
   target.stun=armored?0:broken?820:blocked?75:s.type==="heavy"?260:145;if(broken)say("GUARD CRUSH!");
   target.hp=Math.max(0,target.hp-dmg);target.flash=110;s.owner.super=Math.min(100,s.owner.super+dmg*.55);
   if(s.type==="heavy"||s.owner.d.name==="山中和也")target.bleed=Math.max(target.bleed,1600);
   target.x=clamp(target.x+(s.vx>0?1:-1)*(s.type==="heavy"?26:10),45,915);
   if(s.type==="pierce"&&s.hitCount<1){s.hitCount++;s.vx*=.82}
   else if(s.type==="return"&&!s.turn){s.hitCount=1;s.turn=true;s.vx=-s.vx}
   else if(s.type!=="return"){shots.splice(i,1)}
   checkWin();continue;
  }
  if(s.life<=0||s.x<0||s.x>960||s.y<250||s.y>450)shots.splice(i,1);
 }
}
