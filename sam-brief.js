(()=>{
 'use strict';
 const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],header=q('#sam-fixed-header');
 let guided=false,currentStage='schedule';const visited=new Set();const projectRows=[...q('#project-details').lastElementChild.children].filter(e=>e.classList.contains('grid'));
 const selectors={schedule:'#schedule',task:'#project-overview',detail:'#ai-requirement',assessment:'#rubric',check:'#submission-checklist'};
 const roots={schedule:'#schedule',task:'#project-details',detail:'#project-details',assessment:'#rubric',check:'#submission-checklist'};
 function fixedHeader(){const height=Math.ceil(header.getBoundingClientRect().height);document.documentElement.style.setProperty('--fixed-brief-header',height+'px')}
 new ResizeObserver(fixedHeader).observe(header);fixedHeader();
 function cleanHighlight(){all('.story-target').forEach(e=>e.classList.remove('story-target'));all('.story-key').forEach(e=>e.classList.remove('story-key'))}
 function highlight(stage){cleanHighlight();let target;if(stage==='task')target=q('#project-overview').closest('.focus-unit').firstElementChild.querySelector('p');else if(stage==='detail')target=q('#ai-requirement summary span');else target=q(roots[stage])?.querySelector('h2');if(target){if(!target.querySelector('.annotation-word')&&!target.matches('span')){const span=document.createElement('span');span.className='annotation-word';span.textContent=target.textContent;target.replaceChildren(span);target=span}else target=target.querySelector('.annotation-word')||target;target.classList.add('story-key')}}
 function showStage(stage,announce=true){
  if(!selectors[stage])return;guided=true;currentStage=stage;document.documentElement.classList.add('guided-reading');
  all('.guided-focus-child').forEach(e=>e.classList.remove('focus-unit','guided-focus-child','focus-current'));projectRows.forEach(e=>{e.hidden=false;e.classList.add('focus-unit');e.classList.remove('guided-row')});
  all('#document > *').forEach(e=>e.hidden=true);const root=q(roots[stage]);root.hidden=false;
  if(stage==='task'||stage==='detail'){const row=q(selectors[stage]).closest('.focus-unit');projectRows.forEach(e=>{e.hidden=e!==row;e.classList.add('guided-row')})}
  if(stage==='assessment'&&!visited.has(stage)){q('#rubric details').open=false}
  if(stage==='detail'&&!visited.has(stage))all('#project-details details').forEach(e=>e.open=false);
  if(stage==='schedule'&&!visited.has(stage)){q('[data-phase="1"]')?.click();const tip=q('.schedule-tooltip');if(tip)tip.hidden=true;}
  visited.add(stage);highlight(stage);closePanels();scrollTo(0,0);if(announce)post('stage',{stage});resize();
 }
 function restoreComplete(){projectRows.forEach(e=>{e.hidden=false;e.classList.add('focus-unit')});guided=false;document.documentElement.classList.remove('guided-reading');all('#document > *').forEach(e=>e.hidden=false);all('.guided-row').forEach(e=>{e.hidden=false;e.classList.remove('guided-row')});cleanHighlight()}
 function jump(id){closePanels();const stage=id==='schedule'?'schedule':id==='rubric'?'assessment':id==='submission-checklist'||id==='submission-form'?'check':id==='key-expectations'||id==='ai-requirement'?'detail':'task';if(guided){showStage(stage);return}const e=q('#'+id);if(e)scrollTo({top:scrollY+e.getBoundingClientRect().top-header.offsetHeight-15,behavior:'auto'})}
 const nav=q('#contents-panel nav');nav.replaceChildren();[['schedule','Schedule'],['project-details','Project Details'],['key-expectations','Key Expectations'],['rubric','Rubric'],['submission-checklist','Submission Checklist']].forEach(([id,text])=>{const b=document.createElement('button');b.type='button';b.dataset.jump=id;b.textContent=text;b.addEventListener('click',()=>jump(id));nav.append(b)});const full=document.createElement('a');full.href='sam-brief.html?full=1';full.target='_blank';full.rel='noopener';full.className='complete-brief-link';full.textContent='Read the complete brief ↗';nav.append(full);
 q('#contents-search').addEventListener('input',e=>all('#contents-panel [data-jump]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase())));
 all('[data-local-jump]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();jump(a.dataset.localJump)}));all('[data-open-self]').forEach(b=>b.addEventListener('click',()=>window.open('sam-self.html','_blank','noopener')));
 // Student Actions stays the original control, routing to the same guided section.
 all('#actions-panel [data-view]').forEach(b=>b.addEventListener('click',()=>{if(guided)jump(b.dataset.view==='assessment'?'rubric':'submission-checklist')}));
 addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.source!=='sam-story')return;const msg=event.data;if(msg.type==='stage')showStage(msg.stage,false);if(msg.type==='device'){document.documentElement.classList.toggle('in-phone',msg.phone);fixedHeader()}if(msg.type==='contents'&&q('#contents-panel').hidden)q('[data-control=contents]').click()});
 function focusRequirement(detail){if(!guided||currentStage!=='detail'||!document.body.classList.contains('focus-on'))return;const row=detail.closest('.guided-row');row?.classList.remove('focus-unit');all('#key-expectations details').forEach(e=>e.classList.add('focus-unit','guided-focus-child'));all('.focus-current').forEach(e=>e.classList.remove('focus-current'));detail.classList.add('focus-current')}all('#key-expectations details').forEach(detail=>{detail.addEventListener('focusin',()=>focusRequirement(detail));detail.addEventListener('pointerenter',()=>focusRequirement(detail))});all('[data-control=focus]').forEach(b=>b.addEventListener('click',()=>focusRequirement(q('#ai-requirement'))));
 all('[data-control=dark]').forEach(b=>b.addEventListener('click',()=>{if(guided)showStage(currentStage,false)}));q('#read-aloud').addEventListener('click',event=>{if(!guided)return;event.stopImmediatePropagation();speak(q(roots[currentStage]).innerText)},true);
 const phases=window.samSchedulePhases||[];
 const phaseTip=document.createElement('div');phaseTip.className='schedule-tooltip';phaseTip.id='schedule-tooltip';phaseTip.setAttribute('role','tooltip');phaseTip.hidden=true;document.body.append(phaseTip);let tipButton=null;
 function positionTip(){if(!tipButton||phaseTip.hidden)return;const r=tipButton.getBoundingClientRect();phaseTip.style.left=Math.max(8,Math.min(innerWidth-phaseTip.offsetWidth-8,r.left))+'px';phaseTip.style.top=Math.max(header.offsetHeight+5,r.top-phaseTip.offsetHeight-8)+'px'}
 function showTip(button){const p=phases[Number(button.dataset.phase)];tipButton=button;phaseTip.replaceChildren();const strong=document.createElement('strong');strong.textContent=p[0];const span=document.createElement('span');span.textContent=p[1]===p[2]?'Week '+p[1]:'Weeks '+p[1]+'–'+p[2];phaseTip.append(strong,span);phaseTip.hidden=false;button.setAttribute('aria-describedby','schedule-tooltip');positionTip()}
 all('[data-phase]').forEach(button=>{button.addEventListener('pointerenter',()=>showTip(button));button.addEventListener('focus',()=>showTip(button));button.addEventListener('click',()=>showTip(button));button.addEventListener('pointerleave',()=>{phaseTip.hidden=true;button.removeAttribute('aria-describedby')});button.addEventListener('blur',()=>{phaseTip.hidden=true;button.removeAttribute('aria-describedby')})});addEventListener('scroll',positionTip,{passive:true});

 all('[data-phase]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.phase),p=phases[i];all('[data-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));q('#schedule-phase-title').textContent=`${p[0]} · ${p[1]===p[2]?'week '+p[1]:'weeks '+p[1]+'–'+p[2]}`;q('#schedule-phase-detail').textContent=p[3];post('phase',{phase:p[0],detail:p[3]});resize()}));

 configure({continuous:true,view:'begin',role:'student',dark:false});
 if(parent===window)restoreComplete();
 resize();
})();
