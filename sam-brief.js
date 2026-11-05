(()=>{
 'use strict';
 const query=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
 // Parent scroll position is used only to keep the real toolbar in view and update visual focus.
 let outerTop=0,outerHeight=900;
 const toolbar=query('.demo-toolbar'),naturalToolbarTop=()=>toolbar.offsetTop;
 function moveToolbar(){const shift=Math.max(0,Math.min(document.body.offsetHeight-toolbar.offsetHeight-30,outerTop-naturalToolbarTop()));toolbar.style.setProperty('--sam-toolbar-shift',shift+'px');toolbar.classList.toggle('is-following',shift>0);all('.toolbar-panel').forEach(p=>p.style.top=(naturalToolbarTop()+shift+toolbar.offsetHeight+3)+'px');if(document.body.classList.contains('focus-on')){let active=all('.focus-unit')[0];all('.focus-unit').forEach(row=>{if(row.offsetTop<=outerTop+outerHeight*.3)active=row});all('.focus-current').forEach(row=>row.classList.remove('focus-current'));active?.classList.add('focus-current')}}
 all('#contents-panel [data-jump]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.jump;closePanels();if(parent!==window)post('jump',{id});else query('#'+id)?.scrollIntoView({behavior:'auto'})}));
 query('#contents-search').addEventListener('input',e=>all('#contents-panel [data-jump]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase())));
 all('[data-open-self]').forEach(b=>b.addEventListener('click',()=>window.open('brief-demo.html?view=assessment','_blank','noopener')));
 all('[data-control=focus]').forEach(b=>b.addEventListener('click',moveToolbar));
 addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.source!=='sam-story')return;const msg=event.data;if(msg.type==='scroll'){outerTop=msg.top;outerHeight=msg.height;moveToolbar()}if(msg.type==='contents'){const button=query('[data-control=contents]');if(query('#contents-panel').hidden)button.click()} });
 // Source-sized focus units. Avoid nesting dimmed parents around the active content.
 ['brief-metadata','one-page-summary','rubric','submission-checklist','how-work-is-marked'].forEach(id=>query('#'+id)?.classList.add('focus-unit'));
 configure({continuous:true,view:'begin',role:'student',dark:false});resize();
})();
