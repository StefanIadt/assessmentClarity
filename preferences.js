(() => {
 'use strict';
 document.documentElement.classList.add('has-preferences');
 const get=id=>document.getElementById(id), dialog=get('prefs');
 const motion=matchMedia('(prefers-reduced-motion: reduce)'), colour=matchMedia('(prefers-color-scheme: dark)');
 let saved={};try{saved=JSON.parse(localStorage.getItem('clarity-preferences')||'{}');}catch{}
 const controls={reduce:get('reduce'),dark:get('dark'),contrast:get('contrast'),large:get('large')};
 controls.reduce.checked=motion.matches||saved.reduce===true;
 controls.dark.checked=typeof saved.dark==='boolean'?saved.dark:colour.matches;
 controls.contrast.checked=saved.contrast===true;controls.large.checked=saved.large===true;
 function paint(){
  document.body.classList.toggle('light',!controls.dark.checked);
  for(const name of ['dark','contrast','large'])document.body.classList.toggle(name,controls[name].checked);
  document.body.classList.toggle('story-still',controls.reduce.checked||motion.matches);
  const paused=controls.reduce.checked||motion.matches,button=get('motion-toggle');
  if(button){button.textContent=paused?'Motion paused':'Pause motion';button.setAttribute('aria-pressed',String(paused));}
 }
 for(const[name,input]of Object.entries(controls))input.addEventListener('change',()=>{
  saved[name]=input.checked;try{localStorage.setItem('clarity-preferences',JSON.stringify(saved));}catch{}paint();if(name==='large')dispatchEvent(new Event('resize'));
 });
 get('prefs-open').addEventListener('click',()=>dialog.showModal());get('prefs-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 get('motion-toggle')?.addEventListener('click',()=>{controls.reduce.checked=!controls.reduce.checked;controls.reduce.dispatchEvent(new Event('change'));});
 motion.addEventListener('change',()=>{controls.reduce.checked=motion.matches||saved.reduce===true;controls.reduce.dispatchEvent(new Event('change'));});
 colour.addEventListener('change',()=>{if(typeof saved.dark!=='boolean'){controls.dark.checked=colour.matches;paint();}});
 paint();
})();
