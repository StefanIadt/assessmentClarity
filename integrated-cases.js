(()=>{
 'use strict';
 const header=document.querySelector('body>.top'),section=document.querySelector('#tool'),rail=section.querySelector('#case-studies');
 let queued=false;
 const reduced=()=>document.body.classList.contains('story-still')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const bounds=()=>{const start=scrollY+section.getBoundingClientRect().top-header.getBoundingClientRect().height;return {start,travel:Math.max(1,section.offsetHeight-section.querySelector('.persona-stage').offsetHeight)}};
 function paint(){queued=false;const {start,travel}=bounds(),position=Math.max(0,Math.min(1,(scrollY-start)/travel));section.classList.toggle('is-pinned',scrollY>=start&&scrollY<=start+travel);if(!reduced())rail.scrollLeft=position*(rail.scrollWidth-rail.clientWidth)}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
 function size(){document.documentElement.style.setProperty('--main-header-height',header.getBoundingClientRect().height+'px');schedule()}
 window.clarityCaseScroll={select(person){const {start,travel}=bounds();if(reduced()){rail.scrollLeft=person==='maya'?rail.scrollWidth-rail.clientWidth:0;window.scrollTo({top:start,behavior:'instant'})}else window.scrollTo({top:start+(person==='maya'?travel:0),behavior:'smooth'})},pan(delta){const {travel}=bounds(),width=Math.max(1,rail.scrollWidth-rail.clientWidth);window.scrollBy({top:delta*travel/width,behavior:'instant'})}};
 // Sideways gestures advance the same page timeline, rather than creating a second scroll position.
 rail.addEventListener('wheel',event=>{if(event.ctrlKey||Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;event.preventDefault();window.clarityCaseScroll.pan(event.deltaX)},{passive:false});
 function route(){if(location.hash==='#sam'||location.hash==='#maya')window.clarityCaseScroll.select(location.hash.slice(1))}
 new ResizeObserver(size).observe(header);new ResizeObserver(schedule).observe(rail);addEventListener('scroll',schedule,{passive:true});addEventListener('resize',size);addEventListener('hashchange',route);new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});size();route();
})();
