/* The case studies are guided simulations, not open-ended authoring sandboxes. */
(()=>{
 'use strict';
 const all=s=>[...document.querySelectorAll(s)],q=s=>document.querySelector(s);
 for(const button of all('[data-control=audio],[data-listen],[data-print],#read-aloud,#stop-audio,#add-log-entry,#export-log,#journal-add')){button.disabled=true;button.setAttribute('aria-disabled','true');button.title='This action is inactive in the scenario simulation.'}
 for(const link of all('a')){if(link.dataset.libraryUrl||link.href.startsWith('https://building-better-briefs.pages.dev'))continue;link.dataset.demoDisabled='true';link.setAttribute('aria-disabled','true');link.tabIndex=-1;link.removeAttribute('target');link.href='#';link.title='This supporting link is inactive in the scenario simulation.'}
 document.addEventListener('click',event=>{const link=event.target.closest('a[data-demo-disabled]');if(link){event.preventDefault();event.stopImmediatePropagation()}},true);
 // Completed AI record and checklist in Sam's example.
 all('#ai-log-form input:not([type=checkbox]),#ai-log-form textarea,.reflection-label textarea').forEach(input=>input.readOnly=true);
 all('#ai-log-form input[type=checkbox],.demo-checks input').forEach(input=>{input.checked=true;input.disabled=true});if(q('#checks-status'))q('#checks-status').textContent='4 of 4 checks complete. This is preparation, not a grade.';
 // Sam's self-review remains inspectable through criterion and explanation controls.
 const matrix=all('.self-matrix input[type=radio]');if(matrix.length){for(let criterion=0;criterion<3;criterion++){const chosen=q(`input[name="self-${criterion}"][value="2"]`);if(chosen)chosen.checked=true;const help=q(`[data-help="${criterion}-2"]`);if(help)help.hidden=false}matrix.forEach(input=>input.disabled=true);for(const area of all('.reflection-label textarea'))area.value=area.getAttribute('aria-label')==='Strengths'?'My responsive layout follows the Figma reference, and the navigation works with a keyboard. The testing record explains the problems I found and the changes I made.':'I need to justify the limits of my testing more clearly and explain which decisions were informed by AI. I have identified these points in my reflection rather than treating a complete checklist as proof of quality.'}
 // Student Actions is aligned with its trigger, not the left edge of the reader.
 const trigger=q('[data-control=actions]'),panel=q('#actions-panel');
 function alignActions(){if(!trigger||!panel||panel.hidden)return;const r=trigger.getBoundingClientRect(),width=panel.getBoundingClientRect().width,left=Math.max(8,Math.min(innerWidth-width-8,r.right-width));panel.style.setProperty('left',left+'px','important');panel.style.setProperty('right','auto','important');const toolbar=trigger.closest('.demo-toolbar'),docked=getComputedStyle(toolbar).position==='fixed';if(docked){panel.style.setProperty('top','auto','important');panel.style.setProperty('bottom',(innerHeight-r.top+6)+'px','important')}else{panel.style.setProperty('top',(r.bottom+6)+'px','important');panel.style.setProperty('bottom','auto','important')}}
 if(trigger&&panel){trigger.addEventListener('click',alignActions);new MutationObserver(alignActions).observe(panel,{attributes:true,attributeFilter:['hidden']});addEventListener('resize',alignActions);addEventListener('scroll',alignActions,{passive:true})}
})();
