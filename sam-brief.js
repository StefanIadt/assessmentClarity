(()=>{
 'use strict';
 const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
 let outerTop=0,outerHeight=900,phone=false,targetSelector='',header=q('#sam-fixed-header');
 function notifyScroll(){if(phone)post('reader-scroll',{top:scrollY,height:innerHeight});moveHeader()}
 function moveHeader(){const top=phone?scrollY:outerTop;const shift=phone?0:Math.max(0,Math.min(document.body.offsetHeight-header.offsetHeight-30,top-header.offsetTop));header.style.setProperty('--sam-header-shift',shift+'px');header.classList.toggle('is-following',top>header.offsetTop);all('.toolbar-panel').forEach(p=>p.style.top=(phone?scrollY+header.offsetHeight:header.offsetTop+shift+header.offsetHeight)+'px');if(document.body.classList.contains('focus-on')){let active=all('.focus-unit')[0];all('.focus-unit').forEach(row=>{if(row.getBoundingClientRect().top+(phone?scrollY:0)<=top+(phone?innerHeight:outerHeight)*.3)active=row});all('.focus-current').forEach(row=>row.classList.remove('focus-current'));active?.classList.add('focus-current')}}
 function jump(id){closePanels();if(phone){const e=q('#'+id);if(e)scrollTo({top:scrollY+e.getBoundingClientRect().top-header.offsetHeight-18,behavior:'auto'})}else if(parent!==window)post('jump',{id});else q('#'+id)?.scrollIntoView({behavior:'auto'})}
 all('#contents-panel [data-jump]').forEach(b=>b.addEventListener('click',()=>jump(b.dataset.jump)));all('[data-local-jump]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();jump(a.dataset.localJump)}));
 q('#contents-search').addEventListener('input',event=>all('#contents-panel [data-jump]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(event.target.value.toLowerCase())));
 all('[data-open-self]').forEach(b=>b.addEventListener('click',()=>window.open('brief-demo.html?view=assessment','_blank','noopener')));
 all('[data-control=focus]').forEach(b=>b.addEventListener('click',moveHeader));
 addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.source!=='sam-story')return;const msg=event.data;
  if(msg.type==='scroll'){outerTop=msg.top;outerHeight=msg.height;moveHeader()}
  if(msg.type==='device'){phone=msg.phone;document.documentElement.classList.toggle('in-phone',phone);requestAnimationFrame(()=>{scrollTo(0,msg.top||0);notifyScroll()})}
  if(msg.type==='contents'){if(q('#contents-panel').hidden)q('[data-control=contents]').click();moveHeader()}
  if(msg.type==='jump')jump(msg.id);
  if(msg.type==='highlight'){all('.story-target').forEach(e=>e.classList.remove('story-target'));targetSelector=msg.selector;let e=q(targetSelector);if(e?.id==='project-overview')e=e.closest('.focus-unit');if(e)e.classList.add('story-target')}
  if(msg.type==='open-requirement'){const e=q('#'+msg.id);if(e?.tagName==='DETAILS')e.open=true;jump(msg.id)}
 });
 addEventListener('scroll',notifyScroll,{passive:true});addEventListener('resize',notifyScroll);
 ['brief-metadata','one-page-summary','rubric','submission-checklist','how-work-is-marked','submission-form'].forEach(id=>q('#'+id)?.classList.add('focus-unit'));
 const phases=window.samSchedulePhases||[];
 const phaseTip=document.createElement('div');phaseTip.className='schedule-tooltip';phaseTip.id='schedule-tooltip';phaseTip.setAttribute('role','tooltip');phaseTip.hidden=true;document.body.append(phaseTip);let tipButton=null;
 function positionTip(){if(!tipButton||phaseTip.hidden)return;const r=tipButton.getBoundingClientRect();phaseTip.style.left=Math.max(8,Math.min(innerWidth-phaseTip.offsetWidth-8,r.left))+'px';phaseTip.style.top=Math.max(header.offsetHeight+5,r.top-phaseTip.offsetHeight-8)+'px'}
 function showTip(button){const p=phases[Number(button.dataset.phase)];tipButton=button;phaseTip.replaceChildren();const strong=document.createElement('strong');strong.textContent=p[0];const span=document.createElement('span');span.textContent=p[1]===p[2]?'Week '+p[1]:'Weeks '+p[1]+'–'+p[2];phaseTip.append(strong,span);phaseTip.hidden=false;button.setAttribute('aria-describedby','schedule-tooltip');positionTip()}
 all('[data-phase]').forEach(button=>{button.addEventListener('pointerenter',()=>showTip(button));button.addEventListener('focus',()=>showTip(button));button.addEventListener('click',()=>showTip(button));button.addEventListener('pointerleave',()=>{phaseTip.hidden=true;button.removeAttribute('aria-describedby')});button.addEventListener('blur',()=>{phaseTip.hidden=true;button.removeAttribute('aria-describedby')})});addEventListener('scroll',positionTip,{passive:true});

 all('[data-phase]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.phase),p=phases[i];all('[data-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));q('#schedule-phase-title').textContent=`${p[0]} · ${p[1]===p[2]?'week '+p[1]:'weeks '+p[1]+'–'+p[2]}`;q('#schedule-phase-detail').textContent=p[3];post('phase',{phase:p[0],detail:p[3]});resize()}));
 configure({continuous:true,view:'begin',role:'student',dark:false});resize();
})();
