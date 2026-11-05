(()=>{
 const card=document.querySelector('.sam-persona-card');if(!card)return;
 const front=card.querySelector('.persona-front'),back=card.querySelector('.persona-back');
 card.addEventListener('click',()=>{const flipped=card.getAttribute('aria-pressed')!=='true';card.setAttribute('aria-pressed',String(flipped));card.setAttribute('aria-label',flipped?'Turn back to Sam’s portrait':'Turn Sam’s portrait over to read his mini persona');front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped))});
})();
