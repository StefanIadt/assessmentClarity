(()=>{
 'use strict';
 const rail=document.querySelector('#case-studies'),slides=[...rail.querySelectorAll('.case-study-slide')],frames=slides.map(s=>s.querySelector('iframe'));
 const integrated=!!rail.closest('.integrated-cases');
 let active=-1,moving=false,idleTimer,resizeTimer,focusTimer,queued=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('story-still');
 function send(index,message){frames[index].contentWindow?.postMessage({source:'clarity-case-gallery',...message},location.origin)}
 function preferences(){const settings={dark:document.body.classList.contains('dark'),contrast:document.body.classList.contains('contrast'),large:document.body.classList.contains('large'),reduced:reduced()};frames.forEach((frame,index)=>send(index,{type:'preferences',preferences:settings,pageScroll:integrated}))}
 function slideLeft(index){return Math.min(slides[index].offsetLeft,rail.scrollWidth-rail.clientWidth)}
 function nearest(){return Math.abs(rail.scrollLeft-slideLeft(0))<=Math.abs(rail.scrollLeft-slideLeft(1))?0:1}
 function update(){
  queued=false;const next=nearest(),changed=next!==active;active=next;
  slides.forEach((slide,index)=>{slide.inert=false;slide.setAttribute('aria-hidden',String(index!==active));slide.classList.toggle('inactive-case',index!==active);frames[index].inert=!moving&&index!==active;frames[index].tabIndex=index===active?0:-1;if(changed)send(index,{type:'visibility',visible:index===active})});
  if(!integrated)history.replaceState(null,'','#'+slides[active].id);
  document.querySelectorAll('.chapter-menu a[href^="#"],.persona-navigation a[href^="#"]').forEach(a=>{if(a.hash==='#'+slides[active].id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 }
 function settle(){clearTimeout(idleTimer);moving=false;rail.classList.remove('is-moving');update()}
 function beginMoving(){clearTimeout(idleTimer);moving=true;rail.classList.add('is-moving');frames.forEach(frame=>frame.inert=false);idleTimer=setTimeout(settle,350)}
 function select(person,focus=false,instant=false){if(integrated&&window.clarityCaseScroll&&!instant){window.clarityCaseScroll.select(person);return}const index=person==='maya'?1:0;clearTimeout(focusTimer);beginMoving();rail.scrollTo({left:slideLeft(index),behavior:instant||reduced()?'instant':'smooth'});if(focus)focusTimer=setTimeout(()=>{update();if(Math.abs(rail.scrollLeft-slideLeft(index))<2)send(index,{type:'focus'})},instant||reduced()?0:550)}
 rail.addEventListener('scroll',()=>{beginMoving();if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});
 rail.addEventListener('scrollend',settle);
 rail.addEventListener('keydown',event=>{if(event.target!==rail)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(event.key==='ArrowRight'?'maya':'sam',true)}});
 document.querySelectorAll('.chapter-menu a[href="#sam"],.chapter-menu a[href="#maya"],.persona-navigation a[href="#sam"],.persona-navigation a[href="#maya"]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();select(a.hash.slice(1),true)}));
 slides.forEach((slide,index)=>slide.addEventListener('click',()=>{if(index!==active)select(slide.id,true)}));
 addEventListener('message',event=>{
  if(event.origin!==location.origin||event.data?.source!=='clarity-case-study')return;
  const index=frames.findIndex(f=>f.contentWindow===event.source);if(index<0)return;
  if(event.data.type==='person')select(event.data.person,true);
  if(integrated&&event.data.type==='page-scroll'&&Number.isFinite(event.data.delta))window.scrollBy({top:event.data.delta,behavior:'instant'});
  if(event.data.type==='pan'&&Number.isFinite(event.data.delta)){if(integrated&&window.clarityCaseScroll){window.clarityCaseScroll.pan(event.data.delta);return}clearTimeout(focusTimer);beginMoving();rail.scrollBy({left:event.data.delta,behavior:'instant'})}
  if(event.data.type==='ready'){preferences();send(index,{type:'visibility',visible:index===active})}
 });
 frames.forEach((frame,index)=>frame.addEventListener('load',()=>{preferences();send(index,{type:'visibility',visible:index===active})}));
 new MutationObserver(preferences).observe(document.body,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',()=>{const person=slides[Math.max(0,active)].id;clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{select(person,false,true);update()},80)});
 addEventListener('hashchange',()=>{if(location.hash==='#sam'||location.hash==='#maya')select(location.hash.slice(1),false)});
 select(location.hash==='#maya'?'maya':location.hash==='#sam'?'sam':document.body.dataset.startPerson,false,true);update();preferences();
})();
