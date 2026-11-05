(()=>{
 'use strict';
 const rail=document.querySelector('#case-studies'),slides=[...rail.querySelectorAll('.case-study-slide')],frames=slides.map(s=>s.querySelector('iframe'));
 let active=-1,resizeTimer,focusTimer,panTimer;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('story-still');
 function send(index,message){frames[index].contentWindow?.postMessage({source:'clarity-case-gallery',...message},location.origin)}
 function preferences(){const settings={dark:document.body.classList.contains('dark'),contrast:document.body.classList.contains('contrast'),large:document.body.classList.contains('large'),reduced:reduced()};frames.forEach((frame,index)=>send(index,{type:'preferences',preferences:settings}))}
 function update(){const next=Math.max(0,Math.min(1,Math.round(rail.scrollLeft/rail.clientWidth)));if(next===active)return;active=next;slides.forEach((slide,index)=>{slide.inert=index!==active;slide.setAttribute('aria-hidden',String(index!==active));send(index,{type:'visibility',visible:index===active})});history.replaceState(null,'','#'+slides[active].id);document.querySelectorAll('.chapter-menu a[href^="#"]').forEach(a=>{if(a.hash==='#'+slides[active].id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
 function select(person,focus=false,instant=false){const index=person==='maya'?1:0;rail.scrollTo({left:index*rail.clientWidth,behavior:instant||reduced()?'instant':'smooth'});clearTimeout(focusTimer);if(focus)focusTimer=setTimeout(()=>{update();send(index,{type:'focus'})},instant||reduced()?0:500)}
 rail.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
 rail.addEventListener('keydown',event=>{if(event.target!==rail)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(event.key==='ArrowRight'?'maya':'sam',true)}});
 document.querySelectorAll('.chapter-menu a[href="#sam"],.chapter-menu a[href="#maya"]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();select(a.hash.slice(1),true)}));
 addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.source!=='clarity-case-study')return;const index=frames.findIndex(f=>f.contentWindow===event.source);if(index<0)return;if(event.data.type==='person')select(event.data.person,true);if(event.data.type==='pan'&&Number.isFinite(event.data.delta)){rail.classList.add('is-panning');rail.scrollBy({left:event.data.delta,behavior:'instant'});clearTimeout(panTimer);panTimer=setTimeout(()=>{rail.classList.remove('is-panning');select(slides[Math.round(rail.scrollLeft/rail.clientWidth)].id,false)},150);}if(event.data.type==='ready'){preferences();send(index,{type:'visibility',visible:index===active})}});
 frames.forEach((frame,index)=>frame.addEventListener('load',()=>{preferences();send(index,{type:'visibility',visible:index===active})}));
 new MutationObserver(preferences).observe(document.body,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{select(slides[Math.max(0,active)].id,false,true);update()},80)});
 addEventListener('hashchange',()=>{if(location.hash==='#sam'||location.hash==='#maya')select(location.hash.slice(1),false)});
 select(location.hash==='#maya'?'maya':location.hash==='#sam'?'sam':document.body.dataset.startPerson,false,true);update();preferences();
})();
