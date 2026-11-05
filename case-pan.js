/* Keep horizontal gestures moving between the case studies across iframe boundaries.
   Vertical scrolling and horizontal tables retain their normal behaviour. */
(()=>{
 'use strict';
 const isCase=document.body.classList.contains('embedded-case');let enabled=isCase,touch=null;
 addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.source==='sam-story'&&e.data.type==='case-visibility')enabled=true});
 function localScroll(target,delta){for(let e=target instanceof Element?target:null;e&&e!==document.body;e=e.parentElement){const style=getComputedStyle(e);if(!/auto|scroll/.test(style.overflowX)||e.scrollWidth<=e.clientWidth+1)continue;if(delta>0&&e.scrollLeft<e.scrollWidth-e.clientWidth-1||delta<0&&e.scrollLeft>1)return true}return false}
 function pan(delta){parent.postMessage(isCase?{source:'clarity-case-study',type:'pan',delta}:{source:'clarity-brief-demo',type:'pan-person',delta},location.origin)}
 addEventListener('wheel',e=>{if(!enabled||parent===window||e.ctrlKey||Math.abs(e.deltaX)<=Math.abs(e.deltaY)||!e.deltaX||localScroll(e.target,e.deltaX))return;if(e.cancelable)e.preventDefault();pan(e.deltaX*(e.deltaMode===1?16:1))},{passive:false});
 addEventListener('touchstart',e=>{if(!enabled||e.touches.length!==1||e.target.closest('input,textarea,select,button,a,summary,video')){touch=null;return}const t=e.touches[0];touch={x:t.clientX,y:t.clientY,last:t.clientX,horizontal:false}},{passive:true});
 addEventListener('touchmove',e=>{if(!touch||e.touches.length!==1)return;const t=e.touches[0],dx=touch.x-t.clientX,dy=touch.y-t.clientY;if(!touch.horizontal){if(Math.abs(dx)<12||Math.abs(dx)<=Math.abs(dy)*1.2)return;if(localScroll(e.target,dx)){touch=null;return}touch.horizontal=true}if(e.cancelable)e.preventDefault();pan(touch.last-t.clientX);touch.last=t.clientX},{passive:false});
 addEventListener('touchend',()=>touch=null,{passive:true});addEventListener('touchcancel',()=>touch=null,{passive:true});
})();
