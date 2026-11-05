(()=>{
 const card=document.querySelector('.sam-persona-card');if(!card)return;
 const front=card.querySelector('.persona-front'),back=card.querySelector('.persona-back');
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('story-still');
 function reset(){card.classList.remove('is-tilting');card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y')}
 card.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced())return;const r=card.getBoundingClientRect();card.classList.add('is-tilting');card.style.setProperty('--tilt-x',((.5-(e.clientY-r.top)/r.height)*12).toFixed(2)+'deg');card.style.setProperty('--tilt-y',(((e.clientX-r.left)/r.width-.5)*14).toFixed(2)+'deg')});
 card.addEventListener('pointerleave',reset);card.addEventListener('blur',reset);
 card.addEventListener('click',()=>{reset();const flipped=card.getAttribute('aria-pressed')!=='true';card.setAttribute('aria-pressed',String(flipped));card.setAttribute('aria-label',flipped?'Turn back to Sam’s portrait':'Turn Sam’s portrait over to read his mini persona');front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped))});
})();
