document.addEventListener("keydown",ev=>{
 const k=ev.key.toLowerCase();
 if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))ev.preventDefault();
 keys[k]=true;
 if(k==="arrowleft")keys.left=true;
 if(k==="arrowright")keys.right=true;
 if(k==="arrowup"||k==="w"){keys.jump=true;if(p)pushMotion("U")}
 if(k==="arrowdown")pushMotion("D");
 if(p&&(k==="arrowright"||k==="d"))pushMotion(p.dir>0?"F":"B");
 if(p&&(k==="arrowleft"||k==="a"))pushMotion(p.dir>0?"B":"F");
 if(ev.repeat)return;
 if(k==="j"&&p)attackButton(p,e,"P");
 if(k==="k"&&p)attackButton(p,e,"K");
 if(k==="p"&&p)special(p,e);
 if(k==="l"&&p)focusAttack();
});
document.addEventListener("keyup",ev=>{
 const k=ev.key.toLowerCase();keys[k]=false;
 if(k==="arrowleft")keys.left=false;
 if(k==="arrowright")keys.right=false;
 if(k==="arrowup"||k==="w")keys.jump=false;
});
const zone=$("stickZone"),knob=$("stickKnob");
let stickPointer=null;
function stickMove(ev){
 const r=zone.getBoundingClientRect();
 let dx=ev.clientX-(r.left+r.width/2),dy=ev.clientY-(r.top+r.height/2);
 const max=r.width*.31,len=Math.hypot(dx,dy);
 if(len>max){dx=dx/len*max;dy=dy/len*max}
 knob.style.transform="translate("+dx+"px,"+dy+"px)";
 axis=Math.abs(dx)>max*.2?Math.sign(dx):0;
 axisY=Math.abs(dy)>max*.2?Math.sign(dy):0;
 keys.jump=dy< -max*.3;
 if(axisY>.45)pushMotion("D");
 if(axisY<-.45)pushMotion("U");
 if(axis>.45)pushMotion(p&&axis*p.dir>0?"F":"B");
 if(axis<-.45)pushMotion(p&&axis*p.dir<0?"B":"F");
}
zone.addEventListener("pointerdown",ev=>{
 ev.preventDefault();stickPointer=ev.pointerId;
 try{zone.setPointerCapture(ev.pointerId)}catch(e){}
 stickMove(ev);
});
zone.addEventListener("pointermove",ev=>{if(ev.pointerId===stickPointer)stickMove(ev)});
function stickEnd(ev){
 if(ev.pointerId!==stickPointer)return;
 stickPointer=null;axis=0;axisY=0;keys.jump=false;keys.arrowdown=false;
 knob.style.transform="translate(0,0)";
}
zone.addEventListener("pointerup",stickEnd);
zone.addEventListener("pointercancel",stickEnd);
zone.addEventListener("lostpointercapture",stickEnd);
function bindPress(id,fn){
 const b=$(id);if(!b)return;
 b.addEventListener("pointerdown",ev=>{
  ev.preventDefault();b.classList.add("pressed");
  try{b.setPointerCapture(ev.pointerId)}catch(e){}
  fn();
 });
 const release=()=>b.classList.remove("pressed");
 ["pointerup","pointercancel","lostpointercapture"].forEach(type=>b.addEventListener(type,release));
}
bindPress("btnPunch",()=>{if(p)attackButton(p,e,"P")});
bindPress("btnKick",()=>{if(p)attackButton(p,e,"K")});
bindPress("btnSpecial",()=>{if(p)special(p,e)});
function focusAttack(){
 if(p&&p.super>=25&&p.stun<=0&&p.attackTime<=0){
  p.super-=25;p.focus=650;p.attackTime=280;p.motionDuration=280;
  p.guardMeter=Math.min(100,p.guardMeter+20);say("FOCUS ARMOR");
 }
}
bindPress("btnFocus",focusAttack);
