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
  const theme=get('theme-toggle');if(theme){theme.setAttribute('aria-label',controls.dark.checked?'Switch to light mode':'Switch to dark mode');theme.setAttribute('title',controls.dark.checked?'Switch to light mode':'Switch to dark mode');theme.setAttribute('aria-pressed',String(controls.dark.checked));}
  const paused=controls.reduce.checked||motion.matches,button=get('motion-toggle');
  if(button){button.textContent=paused?'Motion paused':'Pause motion';button.setAttribute('aria-pressed',String(paused));}
 }
 for(const[name,input]of Object.entries(controls))input.addEventListener('change',()=>{
  saved[name]=input.checked;try{localStorage.setItem('clarity-preferences',JSON.stringify(saved));}catch{}paint();if(name==='reduce'&&input.checked){stopAnimations();}if(name==='large')dispatchEvent(new Event('resize'));
 });
 let closing=false,menuAnimations=[];
 function positionClose(){
  const rect=get('prefs-open').getBoundingClientRect();
  dialog.style.setProperty('--menu-close-x',`${rect.left}px`);dialog.style.setProperty('--menu-close-y',`${rect.top}px`);
  dialog.style.setProperty('--menu-close-width',`${rect.width}px`);dialog.style.setProperty('--menu-close-height',`${rect.height}px`);
 }
 addEventListener('resize',()=>{if(dialog.open)positionClose();});
 function stopAnimations(){menuAnimations.forEach(animation=>animation.cancel());menuAnimations=[];}
 function animate(element,keyframes,options){if(!element)return;const animation=element.animate(keyframes,options);menuAnimations.push(animation);return animation;}
 function closeMenu(){
  if(closing||!dialog.open)return;
  if(motion.matches||controls.reduce.checked){stopAnimations();dialog.close();return;}
  closing=true;stopAnimations();dialog.classList.add('is-closing');
  const animation=animate(dialog.querySelector('.menu-sheet'),[{transform:'translateX(0)'},{transform:'translateX(105%)'}],{duration:380,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  if(animation)animation.finished.then(()=>{dialog.close();closing=false;stopAnimations();}).catch(()=>{});else{dialog.close();closing=false;}
 }
 get('prefs-open').setAttribute('aria-expanded','false');
 get('prefs-open').addEventListener('click',()=>{
  closing=false;stopAnimations();positionClose();dialog.classList.remove('is-closing');dialog.showModal();get('prefs-open').setAttribute('aria-expanded','true');
  if(motion.matches||controls.reduce.checked)return;
  animate(dialog.querySelector('.menu-sheet'),[{transform:'translateX(100%)'},{transform:'translateX(0)'}],{duration:380,easing:'cubic-bezier(.4,0,.2,1)',fill:'backwards'});
  dialog.querySelectorAll('.stagger-item').forEach((element,index)=>animate(element,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:70+index*25,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
 });
 get('prefs-close').addEventListener('click',closeMenu);
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
 dialog.addEventListener('close',()=>{get('prefs-open').setAttribute('aria-expanded','false');closing=false;dialog.classList.remove('is-closing');stopAnimations();});
 dialog.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{stopAnimations();dialog.close();}));
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeMenu();}});
 get('theme-toggle')?.addEventListener('click',()=>{controls.dark.checked=!controls.dark.checked;controls.dark.dispatchEvent(new Event('change'));});
 get('motion-toggle')?.addEventListener('click',()=>{controls.reduce.checked=!controls.reduce.checked;controls.reduce.dispatchEvent(new Event('change'));});
 motion.addEventListener('change',()=>{controls.reduce.checked=motion.matches||saved.reduce===true;controls.reduce.dispatchEvent(new Event('change'));});
 colour.addEventListener('change',()=>{if(typeof saved.dark!=='boolean'){controls.dark.checked=colour.matches;paint();}});
 paint();
})();
