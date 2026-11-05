(()=>{
 'use strict';
 const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],header=q('#sam-fixed-header');
 let guided=false,currentStage='schedule';const visited=new Set();const projectRows=[...q('#project-details').lastElementChild.children].filter(e=>e.classList.contains('grid'));
 const selectors={schedule:'#schedule',task:'#project-overview',detail:'#ai-policy',assessment:'#rubric',check:'#submission-checklist'};
 const roots={schedule:'#schedule',task:'#project-details',detail:'#ai-policy',assessment:'#rubric',check:'#submission-checklist'};
 function fixedHeader(){const height=Math.ceil(header.getBoundingClientRect().height);document.documentElement.style.setProperty('--fixed-brief-header',height+'px')}
 all('[data-control]').forEach(b=>b.title=b.getAttribute('aria-label')||b.textContent.trim());
 new ResizeObserver(fixedHeader).observe(header);fixedHeader();
 function cleanHighlight(){all('.story-target').forEach(e=>e.classList.remove('story-target'));all('.story-key').forEach(e=>e.classList.remove('story-key'))}
 function highlight(stage){cleanHighlight();let target;if(stage==='task')target=q('#project-overview').closest('.focus-unit').firstElementChild.querySelector('p');else if(stage==='detail')target=q('[data-control=actions]');else target=q(roots[stage])?.querySelector('h2');if(target){if(target.matches('button')){target.classList.add('story-key');return}if(!target.querySelector('.annotation-word')&&!target.matches('span')){const span=document.createElement('span');span.className='annotation-word';span.textContent=target.textContent;target.replaceChildren(span);target=span}else target=target.querySelector('.annotation-word')||target;target.classList.add('story-key')}}
 function showStage(stage,announce=true){
  if(!selectors[stage])return;document.documentElement.classList.remove('log-open');guided=true;currentStage=stage;document.documentElement.classList.add('guided-reading');
  all('.guided-focus-child').forEach(e=>e.classList.remove('focus-unit','guided-focus-child','focus-current'));projectRows.forEach(e=>{e.hidden=false;e.classList.add('focus-unit');e.classList.remove('guided-row')});
  all('#document > *').forEach(e=>e.hidden=true);const root=q(roots[stage]);root.hidden=false;
  if(stage==='task'){const row=q(selectors[stage]).closest('.focus-unit');projectRows.forEach(e=>{e.hidden=e!==row;e.classList.add('guided-row')})}
  if(stage==='assessment'&&!visited.has(stage)){q('#rubric details').open=false}
  if(stage==='detail'&&!visited.has(stage))all('#project-details details').forEach(e=>e.open=false);
  if(stage==='schedule'&&!visited.has(stage)){q('[data-phase="1"]')?.click();const tip=q('.schedule-tooltip');if(tip)tip.hidden=true;}
  q('#ai-log').hidden=true;header.classList.toggle('ai-chapter',stage==='detail');
  visited.add(stage);highlight(stage);closePanels();scrollTo(0,0);requestReadingFocus();if(announce)post('stage',{stage});resize();
 }
 function restoreComplete(){projectRows.forEach(e=>{e.hidden=false;e.classList.add('focus-unit')});guided=false;document.documentElement.classList.remove('guided-reading');all('#document > *').forEach(e=>e.hidden=false);all('.guided-row').forEach(e=>{e.hidden=false;e.classList.remove('guided-row')});q('#ai-log').hidden=true;cleanHighlight();requestReadingFocus()}
 function jump(id){closePanels();const stage=id==='schedule'?'schedule':id==='rubric'?'assessment':id==='submission-checklist'||id==='submission-form'?'check':id==='key-expectations'||id==='ai-requirement'||id==='ai-policy'?'detail':'task';if(guided){showStage(stage);return}const e=q('#'+id);if(e)scrollTo({top:scrollY+e.getBoundingClientRect().top-header.offsetHeight-15,behavior:'auto'})}
 const nav=q('#contents-panel nav');nav.replaceChildren();[['schedule','Schedule'],['project-details','Project Details'],['ai-policy','AI Policy and Usage Log'],['rubric','Rubric'],['submission-checklist','Submission Checklist']].forEach(([id,text])=>{const b=document.createElement('button');b.type='button';b.dataset.jump=id;b.textContent=text;b.addEventListener('click',()=>jump(id));nav.append(b)});
 q('#contents-search').addEventListener('input',e=>all('#contents-panel [data-jump]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase())));
 all('[data-local-jump]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();jump(a.dataset.localJump)}));all('[data-open-self]').forEach(b=>b.addEventListener('click',openAssessment));
 // Relevant assessment evidence opens inside the same scenario, not a new tab.
 const selfDialog=document.createElement('dialog');selfDialog.id='scenario-assessment';selfDialog.setAttribute('aria-label','Example Student Self-Assessment Form');selfDialog.innerHTML='<div class="scenario-assessment-top"><strong>Student Self-Assessment Form</strong><button type="button">← Back to the brief</button></div><iframe title="Example self-assessment" data-src="sam-self.html?view=assessment"></iframe>';document.body.append(selfDialog);
 function openAssessment(){closePanels();const frame=selfDialog.querySelector('iframe');if(!frame.src)frame.src=frame.dataset.src;selfDialog.showModal()}
 selfDialog.querySelector('button').addEventListener('click',()=>selfDialog.close());selfDialog.querySelector('iframe').addEventListener('load',()=>{const doc=selfDialog.querySelector('iframe').contentDocument;doc.querySelectorAll('a[href*=\"sam-brief\"],a[href*=\"brief-demo\"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();selfDialog.close()}));doc.querySelectorAll('[data-print]').forEach(b=>{b.disabled=true;b.title='Printing is outside this scenario demo.'})});
 all('a[href^="sam-self.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openAssessment()}));
 all('[data-print]').forEach(b=>{b.disabled=true;b.title='Printing is outside this scenario demo. See the Building Better Briefs OER.'});
 // Student Actions stays the original control, routing to the same guided section.
 all('#actions-panel [data-view]').forEach(b=>b.addEventListener('click',()=>{if(guided)jump(b.dataset.view==='assessment'?'rubric':'submission-checklist')}));
 addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.source!=='sam-story')return;const msg=event.data;if(msg.type==='motion')document.documentElement.classList.toggle('demo-still',msg.reduced);if(msg.type==='case-visibility'&&!msg.visible){if('speechSynthesis'in window)speechSynthesis.cancel()}if(msg.type==='stage')showStage(msg.stage,false);if(msg.type==='device'){document.documentElement.classList.toggle('in-phone',msg.phone);fixedHeader()}if(msg.type==='contents'&&q('#contents-panel').hidden)q('[data-control=contents]').click()});
 // Focus follows the reading position, independently of the pointer.
 document.body.dataset.focusTracking='viewport';
 let readingFrame=0;
 const readingUnits=[];
 all('#document > section, #document > .demo-pane').forEach(node=>node.classList.add('reading-focus-section'));
 function addReadingUnit(node){if(node&&!readingUnits.includes(node)){node.classList.add('reading-focus-unit');readingUnits.push(node)}}
 ['#brief-metadata','#one-page-summary','#resources','#ai-policy .ai-guidance','#faq','#how-work-is-marked'].forEach(selector=>addReadingUnit(q(selector)));
 projectRows.forEach(addReadingUnit);
 all('#rubric details[data-criterion], #schedule .schedule-phase, #schedule .schedule-selected, #submission-form .grid, #submission-checklist .demo-checks > label, #ai-log-form > label, #ai-log-form .log-dates').forEach(addReadingUnit);
 // Form layouts can contain nested grid rows; fade only the outer reading block.
 readingUnits.forEach(node=>{if(node.parentElement.closest('.reading-focus-unit'))node.classList.remove('reading-focus-unit')});
 const focusBlocks=readingUnits.filter(node=>node.classList.contains('reading-focus-unit'));
 function updateReadingFocus(){
  readingFrame=0;
  if(!document.body.classList.contains('focus-on')){all('.reading-focus-current').forEach(node=>node.classList.remove('reading-focus-current'));return}
  const top=header.getBoundingClientRect().bottom+8,bottom=innerHeight-12,maxScroll=document.documentElement.scrollHeight-innerHeight;
  const atEnd=maxScroll>2&&scrollY>=maxScroll-2,line=atEnd?bottom-12:top+Math.max(0,bottom-top)*.32;
  let best=null,distance=Infinity;
  focusBlocks.forEach(node=>{
   if(!node.getClientRects().length)return;const rect=node.getBoundingClientRect();
   if(rect.height<=0||rect.width<=0||rect.bottom<=top||rect.top>=bottom)return;
   const nextDistance=rect.top>line?rect.top-line:rect.bottom<line?line-rect.bottom:0;
   if(nextDistance<distance){best=node;distance=nextDistance}
  });
  all('.reading-focus-current').forEach(node=>{if(node!==best)node.classList.remove('reading-focus-current')});
  best?.classList.add('reading-focus-current');
 }
 function requestReadingFocus(){if(!readingFrame)readingFrame=requestAnimationFrame(updateReadingFocus)}
 addEventListener('scroll',requestReadingFocus,{passive:true});addEventListener('resize',requestReadingFocus);
 document.addEventListener('toggle',requestReadingFocus,true);
 // Keyboard users also keep the field or requirement they enter fully readable.
 document.addEventListener('focusin',event=>{if(!document.body.classList.contains('focus-on'))return;const block=event.target.closest('.reading-focus-unit');if(block){all('.reading-focus-current').forEach(node=>node.classList.remove('reading-focus-current'));block.classList.add('reading-focus-current')}});
 all('[data-control=focus]').forEach(button=>button.addEventListener('click',requestReadingFocus));
 new ResizeObserver(requestReadingFocus).observe(q('#document'));
 new ResizeObserver(requestReadingFocus).observe(header);
 all('[data-control=dark]').forEach(b=>b.addEventListener('click',()=>{if(logOpen)openLog();else if(guided)showStage(currentStage,false)}));q('#read-aloud').addEventListener('click',event=>{if(!guided)return;event.stopImmediatePropagation();speak(q(roots[currentStage]).innerText)},true);
 // The same Student Actions route as the source brief, with a tab-local working log.
 const form=q('#ai-log-form'),entries=[{entryName:'Entry 1'}];let entryIndex=0,logOpen=false;
 function saveEntry(){entries[entryIndex]=Object.fromEntries(new FormData(form));entries[entryIndex].confirmation=form.elements.confirmation.checked}
 function fillEntry(){form.reset();Object.entries(entries[entryIndex]).forEach(([key,value])=>{if(form.elements[key]){if(key==='confirmation')form.elements[key].checked=!!value;else form.elements[key].value=value}});q('#log-entry').value=String(entryIndex)}
 function openLog(){closePanels();logOpen=true;all('#document > *').forEach(e=>e.hidden=true);q('#ai-log').hidden=false;document.documentElement.classList.add('log-open');scrollTo(0,0);q('#back-from-log').focus();requestReadingFocus()}
 function closeLog(){saveEntry();logOpen=false;document.documentElement.classList.remove('log-open');if(guided)showStage(currentStage,false);else restoreComplete();q('#ai-log').hidden=true;scrollTo(0,0)}
 q('#open-ai-log').addEventListener('click',openLog);q('#back-from-log').addEventListener('click',closeLog);
 q('#show-student-actions').addEventListener('click',()=>{if(q('#actions-panel').hidden)q('[data-control=actions]').click();q('#open-ai-log').focus()});
 q('#add-log-entry').addEventListener('click',()=>{saveEntry();entryIndex=entries.length;entries.push({entryName:'Entry '+(entryIndex+1)});const option=new Option('Entry '+(entryIndex+1),String(entryIndex));q('#log-entry').add(option);fillEntry();form.elements.entryName.focus()});
 q('#log-entry').addEventListener('change',e=>{saveEntry();entryIndex=Number(e.target.value);fillEntry()});form.addEventListener('submit',e=>e.preventDefault());
 q('#export-log').addEventListener('click',()=>{saveEntry();const blob=new Blob([JSON.stringify({module:'Web Design Frameworks',example:true,entries},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='sam-example-ai-usage-log.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);q('#log-status').textContent='Log exported as JSON. This preview does not submit it to a lecturer.'});
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
