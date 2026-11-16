$("back").onclick=()=>{running=false;location.href="select.html"};
$("fullscreen").onclick=()=>{let el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen().catch(()=>{});if(screen.orientation&&screen.orientation.lock)screen.orientation.lock("landscape").catch(()=>{})};
begin();