(()=>{
 'use strict';
 const header=document.querySelector('body>.top'),section=document.querySelector('#tool'),rail=section.querySelector('#case-studies'),stage=section.querySelector('.persona-stage'),frames=[...rail.querySelectorAll('iframe')];
 const people=['sam','maya'],counts=[5,6],positions=[0,0];let active=0,queued=false,switching=null,switchTimer;
 const reduced=()=>document.body.classList.contains('story-still')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const bounds=()=>({start:scrollY+section.getBoundingClientRect().top-header.offsetHeight,travel:Math.max(1,section.offsetHeight-stage.offsetHeight)});
 function send(position){frames[active].contentWindow?.postMessage({source:'clarity-case-gallery',type:'story-position',position},location.origin)}
 function paint(){queued=false;const {start,travel}=bounds(),position=Math.max(0,Math.min(1,(scrollY-start)/travel));positions[active]=position;section.classList.toggle('is-pinned',scrollY>=start&&scrollY<=start+travel);send(position);prompt.textContent=position>.98?'Story complete · scroll down to continue, or choose '+(active?'Sam':'Maya')+'.':'Scroll down through '+(active?'Maya’s':'Sam’s')+' story. Use the arrows to switch people.'}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
 function size(){document.documentElement.style.setProperty('--main-header-height',header.offsetHeight+'px');section.style.setProperty('--persona-travel',((counts[active]-1)*innerHeight*.8)+'px');schedule()}
 function select(person){clearTimeout(switchTimer);const next=person==='maya'?1:0,{start}=bounds();if(next!==active){active=next;size();const travel=section.offsetHeight-stage.offsetHeight;window.scrollTo({top:start+positions[active]*travel,behavior:'instant'})}else if(scrollY<start||scrollY>start+bounds().travel)window.scrollTo({top:start+positions[active]*bounds().travel,behavior:reduced()?'instant':'smooth'});switching=active;switchTimer=setTimeout(()=>switching=null,700);rail.scrollTo({left:active?rail.scrollWidth-rail.clientWidth:0,behavior:reduced()?'instant':'smooth'});schedule()}
 const prompt=document.createElement('p');prompt.className='persona-prompt';prompt.setAttribute('aria-live','off');section.querySelector('.persona-navigation').append(prompt);
 const nav=section.querySelector('.persona-navigation');nav.querySelectorAll('a').forEach(a=>{a.firstChild.textContent=a.hash==='#sam'?'← Sam':'Maya →'});
 window.clarityCaseScroll={select,pan(delta){rail.scrollBy({left:delta,behavior:'instant'})}};
 rail.addEventListener('scroll',()=>{if(switching!==null)return;const next=rail.scrollLeft>(rail.scrollWidth-rail.clientWidth)/2?1:0;if(next!==active){const {start}=bounds();active=next;size();window.scrollTo({top:start+positions[active]*bounds().travel,behavior:'instant'});schedule()}},{passive:true});
 addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.source!=='clarity-case-study')return;const index=frames.findIndex(f=>f.contentWindow===e.source);if(index<0)return;if(e.data.type==='chapter'&&index===active&&Number.isFinite(e.data.index)){const {start,travel}=bounds();window.scrollTo({top:start+Math.max(0,Math.min(counts[active]-1,e.data.index))/(counts[active]-1)*travel,behavior:reduced()?'instant':'smooth'})}if(e.data.type==='ready'&&index===active)schedule()});
 function route(){if(location.hash==='#sam'||location.hash==='#maya')select(location.hash.slice(1))}
 new ResizeObserver(size).observe(header);addEventListener('scroll',schedule,{passive:true});addEventListener('resize',size);addEventListener('hashchange',route);size();route();
})();
