'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const clamp = value => Math.max(0, Math.min(1, value));
const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
const touchLayout = () => matchMedia('(max-width:760px), (max-width:1100px) and (pointer:coarse)').matches;
const reduced = () => motionMedia.matches || $('#reduce').checked;

// Reading preferences are initialised before the effects start.

// A single continuous backdrop prevents seams between scenes.
const vocabulary = ['Assessment brief','Learning outcomes','What is expected?','Research','Prototype','Submission deadline','Feedback','Assessment criteria','Reflection','Accessibility','Academic integrity','Learning together','Module requirements','Concept and research','Make a plan','Evidence of process','Design for inclusion','Weighting 30%','Task navigation','What do I submit?','11 December','17:00','Review and refine','Student success'];
const background = $('.word-columns');
for (let column = 0; column < 6; column++) {
  const wrapper = document.createElement('div'); wrapper.className = 'consistent-column';
  const loop = document.createElement('div'); loop.className = 'background-loop';
  loop.style.animationDuration = `${1800 + column * 240}s`; loop.style.animationDelay = `${-column * 9}s`;
  const cycle = document.createElement('div'); cycle.className = 'background-cycle';
  for (let line = 0; line < 240; line++) { const word = document.createElement('span'); word.textContent = vocabulary[(line + column * 5) % vocabulary.length]; cycle.append(word); }
  loop.append(cycle, cycle.cloneNode(true)); wrapper.append(loop); background.append(wrapper);
}

// The idle drift is very slow; scroll velocity adds a temporary, smoothly decaying boost.
let driftFrame = 0, driftBoost = 0, driftRate = 1, previousScroll = scrollY, previousScrollTime = performance.now(), driftTime = 0;
function easeDrift(time) {
  const dt = driftTime ? Math.min(64, time - driftTime) : 16; driftTime = time;
  if (reduced()) { driftBoost = 0; driftRate = 1; driftFrame = 0; return; }
  driftBoost *= Math.exp(-dt / 230);
  driftRate += (1 + driftBoost - driftRate) * (1 - Math.exp(-dt / 200));
  $$('.background-loop').forEach(loop => loop.getAnimations().forEach(animation => animation.updatePlaybackRate(driftRate)));
  if (driftBoost > .005 || Math.abs(driftRate - 1) > .005) driftFrame = requestAnimationFrame(easeDrift);
  else { $$('.background-loop').forEach(loop => loop.getAnimations().forEach(animation => animation.updatePlaybackRate(1))); driftFrame = 0; driftTime = 0; }
}
addEventListener('scroll', () => {
  const now = performance.now(), elapsed = Math.max(16, Math.min(80, now - previousScrollTime));
  const velocity = Math.abs(scrollY - previousScroll) / elapsed;
  previousScroll = scrollY; previousScrollTime = now;
  if (reduced()) return;
  driftBoost = Math.min(19, velocity * 4);
  if (!driftFrame) { driftTime = 0; driftFrame = requestAnimationFrame(easeDrift); }
}, { passive: true });

const revealGroups = [$('#ambiguity-title'), $('.note-one'), $('.note-two')];
revealGroups.forEach(group => {
  const walker = document.createTreeWalker(group, NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(text => { if (!text.trim()) fragment.append(document.createTextNode(text)); else { const word = document.createElement('span'); word.className = 'ambiguity-scroll-word'; word.textContent = text; fragment.append(word); } });
    node.replaceWith(fragment);
  });
});

// Short placement gestures are triggered by scroll landmarks, not dragged along an eased slide.
const paperStates = new Map($$('.ephemera-piece').map(layer => {
  const shadow = layer.cloneNode(false); shadow.classList.remove('ephemera-piece'); shadow.classList.add('paper-ground-shadow'); shadow.setAttribute('aria-hidden','true'); shadow.alt = ''; layer.before(shadow);
  return [layer, { target: null, animation: null, shadow, shadowAnimation: null, generation: 0 }];
}));
let paperLayoutChanged = false;
function updatePaperChoreography(travel, stage, still) {
  const exitStarts = [1.43, 1.77, 1.66, 1.54];
  $$('.ephemera-piece').forEach((layer, index) => {
    const state = paperStates.get(layer), start = Number(layer.dataset.start);
    const target = still || travel < start ? 'hidden' : travel >= exitStarts[index] ? 'removed' : 'placed';
    if (state.target === target && !paperLayoutChanged) return;
    const first = state.target === null || paperLayoutChanged;
    const previous = state.target;
    const current = first ? null : { transform: getComputedStyle(layer).transform, filter: getComputedStyle(layer).filter };
    const currentShadow = first ? null : { transform: getComputedStyle(state.shadow).transform, filter: getComputedStyle(state.shadow).filter, opacity: getComputedStyle(state.shadow).opacity };
    state.generation++; const generation = state.generation;
    if (state.animation) state.animation.cancel();
    if (state.shadowAnimation) state.shadowAnimation.cancel();
    const left = layer.offsetLeft, top = layer.offsetTop, width = layer.offsetWidth, height = layer.offsetHeight;
    const rotation = Number(layer.dataset.rotation);
    const transform = (x,y,z,rx,ry,rz) => `perspective(1400px) translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    const entry = [
      transform(80,-top-height-300,45,-9,-5,rotation-14),
      transform(stage.clientWidth-left+300,-45,30,11,-12,rotation+12),
      transform(-90,stage.clientHeight-top+380,45,-16,7,rotation-13),
      transform(100,stage.clientHeight-top+380,55,-14,-8,rotation+15)
    ][index];
    const exit = [
      transform(120,-top-height-300,90,-18,-8,rotation+16),
      transform(stage.clientWidth-left+340,-110,65,14,-15,rotation+19),
      transform(-left-width-340,120,55,-12,9,rotation-18),
      transform(140,stage.clientHeight-top+380,70,-18,-10,rotation+17)
    ][index];
    const flat = transform(0,0,0,0,0,rotation);
    const contactShadow = 'drop-shadow(0px .6px .8px rgba(37,29,20,.16))';
    const raisedShadow = 'drop-shadow(1px 3px 3px rgba(37,29,20,.07))';
    const finalTransform = target === 'placed' ? flat : target === 'hidden' ? entry : exit;
    state.target = target; layer.style.transition = 'none'; layer.style.opacity = still ? 0 : 1;
    layer.style.transform = finalTransform; layer.style.filter = contactShadow;
    function project(pose) {
      return pose.replace(/translate3d\(([-.\d]+)px,([-\.\d]+)px,([-\.\d]+)px\)/, (_,x,y,z) => `translate3d(${Number(x) + 1 + Number(z) * .16}px,${Number(y) + 1.5 + Number(z) * .24}px,0px)`).replace(/rotateX\([^)]*\)/,'rotateX(0deg)').replace(/rotateY\([^)]*\)/,'rotateY(0deg)');
    }
    state.shadow.style.transformOrigin = getComputedStyle(layer).transformOrigin;
    state.shadow.style.transform = project(finalTransform);
    state.shadow.style.filter = 'brightness(0) blur(2px)';
    state.shadow.style.opacity = still ? 0 : .07;
    if (first || still || (previous !== 'placed' && target !== 'placed')) {
      layer.dataset.phase = target; state.animation = null; return;
    }
    const duration = target === 'placed' ? [570,460,530,490][index] : [470,520,450,490][index];
    const frames = target === 'placed' ? [
      { ...current, offset:0, easing:'cubic-bezier(.35,.05,.7,1)' },
      { transform:transform(index%2?17:-14,-22,45,-7,index%2?-5:5,rotation+(index%2?3:-3)), filter:raisedShadow, offset:.54, easing:'cubic-bezier(.4,0,.85,.55)' },
      { transform:transform(0,2,0,.7,0,rotation+.45), filter:contactShadow, offset:.82, easing:'ease-out' },
      { transform:flat, filter:contactShadow, offset:1 }
    ] : [
      { ...current, offset:0, easing:'cubic-bezier(.2,.1,.6,1)' },
      { transform:transform(index%2?12:-9,-18,65,-13,index%2?-8:7,rotation+(index%2?4:-4)), filter:raisedShadow, offset:.31, easing:'cubic-bezier(.6,0,.9,.5)' },
      { transform:finalTransform, filter:raisedShadow, offset:1 }
    ];
    layer.dataset.phase = target === 'placed' ? 'arriving' : 'clearing';
    const shadowFrames = frames.map((frame, frameIndex) => {
      if (frameIndex === 0) return { ...currentShadow, offset: 0, easing: frame.easing };
      const raised = frame.filter === raisedShadow;
      return { transform: project(frame.transform), filter: `brightness(0) blur(${raised ? 12 : 2}px)`, opacity: raised ? .09 : .07, offset: frame.offset, easing: frame.easing };
    });
    state.shadowAnimation = state.shadow.animate(shadowFrames,{ duration, fill:'none' });
    const animation = layer.animate(frames,{ duration, fill:'none' }); state.animation = animation;
    animation.finished.then(() => { if (generation === state.generation) { state.animation = null; layer.dataset.phase = target; } }).catch(() => {});
  });
  paperLayoutChanged = false;
}
addEventListener('resize', () => { paperLayoutChanged = true; });
let scheduled = false;
function paintScroll() {
  scheduled = false;
  const still = reduced(); document.body.classList.toggle('story-still', still);
  const story = $('.scroll-story'), stage = $('.story-stage');
  const travel = Math.max(0, -story.getBoundingClientRect().top) / innerHeight;
  const titleFade = still ? 1 : clamp((travel - .1) / .14);
  const inclusion = still ? 1 : clamp((travel - .2) / .16);
  stage.style.setProperty('--title-opacity', 1 - titleFade);
  stage.style.setProperty('--title-y', `${-titleFade * 30}px`);
  stage.style.setProperty('--brief-opacity', inclusion);

  stage.style.setProperty('--clarity', clamp(travel / .75));
  updatePaperChoreography(travel, stage, still);

  const takeaway = $('.inclusion-takeaway'), clearing = still ? 1 : clamp((travel - 1.92) / .26);
  takeaway.style.opacity = clearing; takeaway.style.transform = `translateY(${(1 - clearing) * 15}px)`;

  $$('.story-brief h2 span').forEach((line, index) => { const amount = still ? 1 : clamp((travel - .2 - index * .025) / .16); line.style.opacity = amount; line.style.transform = `translateY(${(1 - amount) * 28}px)`; line.style.clipPath = 'none'; });
  const columnOpacity = .36 - .285 * clamp((travel - .18) / .22);
  background.style.setProperty('opacity', document.body.classList.contains('contrast') ? .035 : columnOpacity);
  $$('.consistent-column').forEach((column, index) => { column.style.transform = still ? 'none' : `translateY(${Math.max(-240, Math.min(240, scrollY * (index % 2 ? .018 + index * .004 : -.015 - index * .003)))}px)`; });
  const rect = $('.ambiguity-flow').getBoundingClientRect();
  const reveal = still || touchLayout() ? 1 : clamp((innerHeight * .55 - rect.top) / (innerHeight * .75));
  revealGroups.forEach((group, groupIndex) => {
    const words = [...group.querySelectorAll('.ambiguity-scroll-word')];
    words.forEach((word, index) => {
      const amount = still || touchLayout() ? 1 : clamp((reveal - groupIndex * .16 - index / words.length * .21) / .18);
      const eased = amount * amount * (3 - 2 * amount);
      word.style.opacity = eased;
      const particleWord = word.closest('.particle-word'); if (particleWord) particleWord.style.setProperty('--particle-reveal', eased);
      word.style.transform = `translateY(${(1 - eased) * .55}em)`; word.style.filter = `blur(${(1 - eased) * 2}px)`;
    });
  });
}
function scheduleScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(paintScroll); } }
addEventListener('scroll', scheduleScroll, { passive: true }); addEventListener('resize', scheduleScroll);
$('#reduce').addEventListener('change', scheduleScroll); $('#contrast').addEventListener('change', scheduleScroll); motionMedia.addEventListener('change', scheduleScroll);
paintScroll();

// Start readable, then allow a broad area around the pointer to come into focus.
const message = $('.reveal-message');
const sentence = message.textContent.trim(); message.replaceChildren();
const focusWords = sentence.split(/\s+/).map((text, index, all) => {
  const word = document.createElement('button'); word.type = 'button'; word.className = 'focus-word'; word.textContent = text; word.setAttribute('aria-pressed', 'false'); message.append(word); if (index < all.length - 1) message.append(document.createTextNode(' ')); return word;
});
// Crossfade between identical blurred and clear text with one feathered spatial mask.
const torchBase = document.createElement('span'); torchBase.className = 'torch-base';
while (message.firstChild) torchBase.append(message.firstChild);
const torchClear = document.createElement('span'); torchClear.className = 'torch-clear';torchClear.setAttribute('aria-hidden','true');
focusWords.forEach((word,index) => { if(index)torchClear.append(' ');const span=document.createElement('span');span.textContent=word.textContent;torchClear.append(span); });
message.append(torchBase,torchClear);
let pointer = null, focused = null, focusFrame = 0, lens = null, lensStrength = 0, lensTime = 0;
function paintFocus(time=performance.now()) {
  focusFrame = 0;
  const dt=Math.min(50,lensTime ? time-lensTime : 16.7);lensTime=time;
  const bounds = message.getBoundingClientRect();
  const distanceFromCenter = Math.abs(bounds.top + bounds.height / 2 - innerHeight * .5);
  const proximity = clamp(1 - distanceFromCenter / (innerHeight * .44));
  const emphasis = proximity * proximity * (3 - 2 * proximity);
  const baseBlur = reduced() || touchLayout() ? 0 : (innerWidth < 760 ? 4.8 : 6.2) * emphasis;
  const target = pointer || (focused ? (() => { const r = focused.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })() : null);
  if(target && !lens)lens={...target};
  const follow=1-Math.exp(-dt/75);
  if(target){lens.x+=(target.x-lens.x)*follow;lens.y+=(target.y-lens.y)*follow;}
  const wanted=target && !reduced() && !touchLayout()?1:0;
  lensStrength+=(wanted-lensStrength)*(1-Math.exp(-dt/(wanted?100:230)));
  const x=lens?lens.x-bounds.left:0,y=lens?lens.y-bounds.top:0;
  const width=innerWidth<760?145:220,height=innerWidth<760?70:100;
  const core=1-lensStrength;
  const gradient=`ellipse ${width}px ${height}px at ${x}px ${y}px`;
  torchClear.style.maskImage=`radial-gradient(${gradient},rgba(0,0,0,${lensStrength}) 0%,rgba(0,0,0,${lensStrength}) 20%,rgba(0,0,0,${lensStrength*.85}) 45%,rgba(0,0,0,${lensStrength*.4}) 72%,transparent 100%)`;
  torchBase.style.maskImage=`radial-gradient(${gradient},rgba(0,0,0,${core}) 0%,rgba(0,0,0,${core}) 20%,rgba(0,0,0,${1-lensStrength*.85}) 45%,rgba(0,0,0,${1-lensStrength*.4}) 72%,black 100%)`;
  focusWords.forEach(word=>{word.style.setProperty('--word-blur',`${baseBlur}px`);word.setAttribute('aria-pressed',String(word===focused));});
  const travelling=target && lens && Math.hypot(target.x-lens.x,target.y-lens.y)>.2;
  if(travelling || Math.abs(wanted-lensStrength)>.002)focusFrame=requestAnimationFrame(paintFocus);
  else lensTime=0;
}
function scheduleFocus(){if(!focusFrame)focusFrame=requestAnimationFrame(paintFocus);}
message.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){pointer={x:event.clientX,y:event.clientY};scheduleFocus();}});
message.addEventListener('pointerleave',()=>{pointer=null;scheduleFocus();});
focusWords.forEach(word=>{
 word.addEventListener('focus',()=>{focused=word;scheduleFocus();});
 word.addEventListener('click',()=>{focused=word;pointer=null;scheduleFocus();});
});
message.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!message.contains(document.activeElement)){focused=null;scheduleFocus();}}));
addEventListener('scroll',scheduleFocus,{passive:true});addEventListener('resize',scheduleFocus);
$('#reduce').addEventListener('change',scheduleFocus);motionMedia.addEventListener('change',scheduleFocus);
scheduleFocus();

// Matter.js bodies fall, collide, settle and can be dragged. Restore returns them to their measured text positions.
(() => {
  const trigger = $('.complexity-trigger'), toggle = $('.clarity-toggle'), conclusion = $('.complexity-conclusion');
  if(touchLayout()){trigger.disabled=true;trigger.classList.add('touch-static');trigger.setAttribute('role','paragraph');toggle.hidden=true;conclusion.hidden=false;$('#complexity-help').textContent='The statement and its conclusion remain readable on touch screens.';return}
  const text = trigger.textContent; trigger.setAttribute('aria-label', text); trigger.replaceChildren();
  text.split(/(\s+)/).forEach(part => { if (!part.trim()) trigger.append(document.createTextNode(part)); else { const word = document.createElement('span'); word.className = 'complexity-word' + (part.toLowerCase() === 'complexity' ? ' complexity-signal' : ''); word.textContent = part; word.setAttribute('aria-hidden', 'true'); trigger.append(word); } });
  const words = [...trigger.querySelectorAll('.complexity-word')];
  const breathingWord=trigger.querySelector('.complexity-signal');
  function measureBreathingWord(){
   const sample=breathingWord.cloneNode(true);sample.style.cssText='position:absolute;visibility:hidden;animation:none;font-weight:650;font-variation-settings:"wght" 650;white-space:nowrap;width:auto;';
   trigger.append(sample);const width=sample.getBoundingClientRect().width;sample.remove();if(width)breathingWord.style.width=`${Math.ceil(width)}px`;
  }
  document.fonts.ready.then(measureBreathingWord);addEventListener('resize',measureBreathingWord);

  const { Engine, Bodies, Body, Composite, Constraint, Query, Sleeping } = Matter;
  let engine = null, pieces = [], state = 'idle', frame = 0, lastTime = 0, drag = null, animations = [], generation = 0;
  function label() { trigger.dataset.state = state; toggle.textContent = state === 'fallen' || state === 'restoring' ? 'Restore clarity ↗' : 'Lose the thread ↘'; toggle.setAttribute('aria-expanded', String(state === 'clear')); toggle.disabled = state === 'restoring'; }
  function dispose() { cancelAnimationFrame(frame); frame = 0; if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); engine = null; } drag = null; pieces = []; }
  function draw() { pieces.forEach(({ word, body, x, y }) => { word.style.transform = `translate(${body.position.x - x}px,${body.position.y - y}px) rotate(${body.angle}rad)`; }); }
  function tick(time) {
    if (!engine) return;
    const elapsed = lastTime ? Math.min(32, time - lastTime) : 16.67; lastTime = time;
    Engine.update(engine, elapsed); draw();
    if (drag || pieces.some(piece => !piece.body.isSleeping)) frame = requestAnimationFrame(tick); else frame = 0;
  }
  function wake() { if (!frame && engine) { lastTime = 0; frame = requestAnimationFrame(tick); } }
  function fall() {
    if(touchLayout())return;
    if (state === 'fallen' || state === 'restoring') return;
    generation++; animations.forEach(animation => animation.cancel()); animations = [];
    conclusion.hidden = true; state = 'fallen'; label();
    if (reduced()) return;
    const box = trigger.getBoundingClientRect(), width = box.width, height = box.height;
    engine = Engine.create({ enableSleeping: true }); engine.gravity.y = 1;
    const walls = [Bodies.rectangle(width / 2, height + 25, width + 100, 50, { isStatic: true }), Bodies.rectangle(-25, height / 2, 50, height * 3, { isStatic: true }), Bodies.rectangle(width + 25, height / 2, 50, height * 3, { isStatic: true })];
    pieces = words.map((word, index) => {
      const r = word.getBoundingClientRect(), x = r.left - box.left + r.width / 2, y = r.top - box.top + r.height / 2;
      const body = Bodies.rectangle(x, y, r.width + 2, r.height * .78, { restitution: .42, friction: .35, frictionAir: .012, sleepThreshold: 65 });
      Body.setVelocity(body, { x: ((index * 19) % 17 - 8) * .3, y: -.5 }); Body.setAngularVelocity(body, ((index * 13) % 15 - 7) * .007);
      return { word, body, x, y };
    });
    Composite.add(engine.world, [...walls, ...pieces.map(piece => piece.body)]); wake();
  }
  async function restore() {
    if (state !== 'fallen') return;
    const run = ++generation, transforms = words.map(word => getComputedStyle(word).transform);
    dispose(); state = 'restoring'; label();
    animations = words.map((word, index) => {
      word.style.transform = '';
      return reduced() ? null : word.animate([{ transform: transforms[index] }, { transform: 'translate(0,0) rotate(0rad)' }], { duration: 950, delay: index * 7, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    }).filter(Boolean);
    await Promise.allSettled(animations.map(animation => animation.finished));
    if (generation !== run) return;
    words.forEach(word => { word.style.transform = ''; });
    animations.forEach(animation => animation.cancel()); animations = []; state = 'clear'; conclusion.hidden = false; label();
    if (!reduced()) conclusion.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'ease-out' });
  }
  trigger.addEventListener('click', () => { if (state === 'idle' || state === 'clear') fall(); });
  toggle.addEventListener('click', () => state === 'fallen' ? restore() : fall());
  trigger.addEventListener('pointerdown', event => {
    if (!engine || event.pointerType === 'touch') return;
    const rect = trigger.getBoundingClientRect(), point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const body = Query.point(pieces.map(piece => piece.body), point)[0]; if (!body) return;
    Sleeping.set(body, false); drag = Constraint.create({ pointA: point, bodyB: body, pointB: { x: point.x - body.position.x, y: point.y - body.position.y }, stiffness: .12, damping: .1 });
    Composite.add(engine.world, drag); trigger.setPointerCapture(event.pointerId); wake();
  });
  trigger.addEventListener('pointermove', event => { if (!drag) return; const rect = trigger.getBoundingClientRect(); drag.pointA = { x: event.clientX - rect.left, y: event.clientY - rect.top }; wake(); });
  function release() { if (drag && engine) { Composite.remove(engine.world, drag); drag = null; wake(); } }
  trigger.addEventListener('pointerup', release); trigger.addEventListener('pointercancel', release);
  function stable() {
    generation++; dispose(); animations.forEach(animation => animation.cancel()); animations = []; words.forEach(word => word.style.transform = '');
    state = 'clear'; conclusion.hidden = false; label();
  }
  addEventListener('resize', () => { if (state === 'fallen' || state === 'restoring') stable(); });
  $('#reduce').addEventListener('change', () => { if (reduced()) stable(); }); motionMedia.addEventListener('change', () => { if (reduced()) stable(); });
  if (reduced()) stable(); else label();
})();

// A local particle interaction gives "ambiguity" a tactile, reversible loss of structure.
(() => {
  const host = $('.particle-word'), label = host.querySelector('.particle-label');
  const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true'); host.append(canvas);
  const context = canvas.getContext('2d');
  if (!context) return;
  let points = [], frame = 0, pointer = null, last = 0, visible = true, width = 0, height = 0, queuedBuild = 0;
  const pad = 70;
  function drawAtRest() {
    context.clearRect(0, 0, width, height); context.fillStyle = '#151515';
    const size = innerWidth < 760 ? 1.75 : 2.2;
    points.forEach(point => { point.x = point.homeX; point.y = point.homeY; point.vx = point.vy = 0; context.fillRect(point.x, point.y, size, size); });
  }
  function build() {
    host.classList.remove('particles-active');
    const box = label.getBoundingClientRect(), style = getComputedStyle(host), fontSize = parseFloat(style.fontSize);
    if (!box.width || !box.height) return;
    width = Math.ceil(box.width) + pad * 2; height = Math.ceil(box.height) + pad * 2;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; canvas.style.left = `${-pad}px`; canvas.style.top = `${-pad}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sample = document.createElement('canvas'); sample.width = width; sample.height = height;
    const ink = sample.getContext('2d', { willReadFrequently: true });
    ink.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    if ('letterSpacing' in ink) ink.letterSpacing = style.letterSpacing;
    const metrics = ink.measureText('ambiguity.');
    const baseline = pad + (box.height - metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2 + metrics.actualBoundingBoxAscent;
    ink.fillText('ambiguity.', pad, baseline);
    const pixels = ink.getImageData(0, 0, width, height).data;
    const spacing = fontSize < 55 ? 2 : 3;
    points = [];
    for (let y = pad - 3; y < height - pad + 3; y += spacing) for (let x = pad - 3; x < width - pad + 3; x += spacing) {
      if (pixels[(y * width + x) * 4 + 3] > 100) points.push({ x, y, homeX: x, homeY: y, vx: 0, vy: 0 });
    }
    canvas.dataset.particleCount = points.length;
    cancelAnimationFrame(frame); frame = 0; last = 0;
    drawAtRest(); host.classList.add('particles-ready');
  }
  function tick(time) {
    frame = 0;
    if (reduced() || !visible) { host.classList.remove('particles-active'); drawAtRest(); return; }
    const dt = last ? Math.min(2, (time - last) / 16.67) : 1; last = time;
    context.clearRect(0, 0, width, height); context.fillStyle = '#151515';
    let energy = 0;
    for (const point of points) {
      point.vx += (point.homeX - point.x) * .025 * dt; point.vy += (point.homeY - point.y) * .025 * dt;
      if (pointer) {
        const dx = point.x - pointer.x, dy = point.y - pointer.y, distance = Math.hypot(dx, dy), radius = innerWidth < 760 ? 48 : 75;
        if (distance < radius) { const force = (1 - distance / radius) * 1.8 * dt; point.vx += dx / Math.max(distance, .1) * force; point.vy += dy / Math.max(distance, .1) * force; }
      }
      point.vx *= Math.pow(.85, dt); point.vy *= Math.pow(.85, dt); point.x += point.vx * dt; point.y += point.vy * dt;
      energy += Math.abs(point.x - point.homeX) + Math.abs(point.y - point.homeY) + Math.abs(point.vx) + Math.abs(point.vy);
      context.fillRect(point.x, point.y, innerWidth < 760 ? 1.75 : 2.2, innerWidth < 760 ? 1.75 : 2.2);
    }
    if (pointer || energy > points.length * .08) frame = requestAnimationFrame(tick);
    else { host.classList.remove('particles-active'); drawAtRest(); last = 0; }
  }
  function wake() { if (touchLayout() || reduced() || !visible || !points.length) return; host.classList.add('particles-active'); if (!frame) { last = 0; frame = requestAnimationFrame(tick); } }
  function position(event) { const box = host.getBoundingClientRect(); pointer = { x: event.clientX - box.left + pad, y: event.clientY - box.top + pad }; wake(); }
  host.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') position(event); });
  host.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') position(event); });
  host.addEventListener('pointerleave', () => { pointer = null; wake(); });
  host.addEventListener('click', () => {
    pointer = null;
    points.forEach((point, index) => { const angle = index * 2.39996, impulse = 3 + (index % 9) * .6; point.vx += Math.cos(angle) * impulse; point.vy += Math.sin(angle) * impulse; });
    wake();
  });
  function rebuild() { cancelAnimationFrame(queuedBuild); queuedBuild = requestAnimationFrame(build); }
  new ResizeObserver(rebuild).observe(host);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) { pointer = null; cancelAnimationFrame(frame); frame = 0; host.classList.remove('particles-active'); drawAtRest(); } }, { threshold: 0 }).observe(host);
  function stop() { if (reduced()) { pointer = null; cancelAnimationFrame(frame); frame = 0; host.classList.remove('particles-active'); drawAtRest(); } }
  $('#reduce').addEventListener('change', stop); motionMedia.addEventListener('change', stop);
  document.fonts.ready.then(rebuild); build();
})();


// Keep centred scenes readable when content is taller than the viewport.
(() => {
  const scenes = [$('.ambiguity-flow'), $('.barrier-flow'), $('.complexity-flow')];
  let queued = false;
  function measure() {
    queued = false;
    scenes.forEach(scene => {
      const panel = scene.firstElementChild;
      if(touchLayout()){scene.classList.add('scene-unpinned');return}
      scene.classList.remove('scene-unpinned');
      scene.classList.toggle('scene-unpinned', reduced() || panel.scrollHeight > innerHeight + 2);
    });
  }
  function scheduleMeasure() { if (!queued) { queued = true; requestAnimationFrame(measure); } }
  const observer = new ResizeObserver(scheduleMeasure); scenes.forEach(scene => observer.observe(scene.firstElementChild));
  addEventListener('resize', scheduleMeasure); $('#reduce').addEventListener('change', scheduleMeasure); motionMedia.addEventListener('change', scheduleMeasure);
  document.fonts.ready.then(scheduleMeasure); measure();
})();

// Scroll supplies the playhead: no timer, blur, or automatic progression.
(() => {
  const section = $('.brief-bridge');
  const groups = [...section.querySelectorAll('h2, p')].map(element => {
    const text = element.textContent;
    element.setAttribute('aria-label', text);
    element.textContent = '';
    return text.split(/\s+/).map((text, index) => {
      if (index) element.append(' ');
      const word = document.createElement('span');
      word.className = 'bridge-word'; word.textContent = text; word.setAttribute('aria-hidden', 'true');
      if (['grouped,', 'connected', 'revealed'].includes(text)) word.dataset.action = text.replace(',', '');
      element.append(word); return word;
    });
  });
  let queued = false;
  function paint() {
    queued = false;
    const box = section.getBoundingClientRect();
    const progress = clamp((innerHeight * .65 - box.top) / (innerHeight * 1.5));
    groups.forEach((words, group) => words.forEach((word, index) => {
      const start = group ? .5 + index / words.length * .1 : .08 + index / words.length * .12;
      const amount = reduced() ? 1 : clamp((progress - start) / (group ? .35 : .5));
      const ease = amount * amount * (3 - 2 * amount);
      word.style.opacity = ease;
      word.style.filter = `blur(${(1 - ease) * 5}px)`;
      word.style.transform = `translateY(${(1 - ease) * 24}px)`;
    }));
    const anatomyTop = $('#anatomy').getClientRects().length ? $('#anatomy').getBoundingClientRect().top : Infinity;
    background.style.setProperty('--bridge-columns', 1 - clamp((innerHeight - anatomyTop) / (innerHeight * .7)));
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule);
  $('#reduce').addEventListener('change', schedule); motionMedia.addEventListener('change', schedule);
  paint();
})();

// One continuous assembly, with chapter navigation and reader-controlled detail.
(() => {
 const section = $('#anatomy'), parts = $$('.anatomy-part'), buttons = $$('[data-chapter]');
 const title = $('#anatomy-title'), description = $('.anatomy-description'), evidence = $('.anatomy-evidence'), hint = $('.anatomy-hint');
 const chapters = [
 ['Structure.', 'The assessment brief uses consistent headings and a clear order, so students know where to find the task, submission requirements and assessment criteria.', 'W3C', 'https://www.w3.org/WAI/WCAG2/supplemental/patterns/o2p03-page-structure/'],
 ['Manageable detail.', 'Related information is grouped into sections. Smaller details are revealed within each group, while the whole stays visible.', 'CAST UDL', 'https://udlguidelines.cast.org/action-expression/strategy-development/organize-information/'],
 ['Alignment.', 'Learning outcomes, the task and assessment criteria connect to form a coherent whole.', 'Project design principles', '#anatomy'],
 ['Planning.', 'Visible stages and milestones help turn a final deadline into a process students can plan.', 'CAST UDL', 'https://udlguidelines.cast.org/action-expression/strategy-development/'],
 ['Checking and reflection.', 'Review the work against the assessment requirements. Identify what is complete and what needs another look.', 'CAST UDL', 'https://udlguidelines.cast.org/action-expression/strategy-development/monitor-progress/']
 ];
 let current = -1, queued = false, selected = 0;
 const chapterText = document.createElement('div'); chapterText.className = 'anatomy-chapter-text';
 title.before(chapterText); chapterText.append(title, description, evidence);
 let outgoing = null, entrance = null;
 function transitionChapter(change) {
  if (outgoing) { outgoing.remove(); outgoing = null; }
  if (entrance) { entrance.cancel(); entrance = null; }
  if (current < 0 || reduced() || touchLayout()) { change(); return; }
  outgoing = chapterText.cloneNode(true);
  outgoing.classList.add('anatomy-chapter-outgoing'); outgoing.setAttribute('aria-hidden', 'true'); outgoing.inert = true;
  outgoing.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  chapterText.before(outgoing);
  const previous = outgoing;
  previous.animate([{ opacity:1, transform:'translateY(0)' }, { opacity:0, transform:'translateY(-9px)' }], { duration:440, easing:'ease-in-out', fill:'forwards' }).finished.then(() => { previous.remove(); if (outgoing === previous) outgoing = null; }).catch(() => {});
  change();
  entrance = chapterText.animate([{ opacity:0, transform:'translateY(9px)' }, { opacity:1, transform:'translateY(0)' }], { duration:520, easing:'cubic-bezier(.22,1,.36,1)' });
 }
 function paint() {
  queued = false;
  const rect = section.getBoundingClientRect();
  const progress = touchLayout() ? (selected + .5) / 5 : reduced() ? selected / 4 : clamp(-rect.top / Math.max(1, section.offsetHeight - innerHeight));
  const step = Math.min(4, Math.floor(progress * 5));
  if (step !== current) {
   const data = chapters[step];
   transitionChapter(() => {
    title.textContent = data[0]; description.textContent = data[1];
    if(step===2){
     description.replaceChildren();
     ['Learning outcomes', 'the task', 'assessment criteria'].forEach((text,index)=>{
      if(index)description.append(index===1?', ':' and ');
      const term=document.createElement('span');term.className='alignment-term';term.dataset.term=index;term.textContent=text;description.append(term);
     });
     description.append(' connect to form a coherent whole.');
    }
    evidence.textContent = `Design rationale: ${data[2]} ↗`; evidence.href = data[3]; evidence.hidden = step === 1 || step === 2;
   });
   current = step;
   buttons.forEach((button, index) => { if (index === step) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
   hint.textContent = touchLayout() ? 'Choose a chapter above to explore the parts.' : step === 1 ? 'Scroll to reveal the detail within each group.' : step === 4 ? 'Scroll to look again, then bring the whole together.' : 'Scroll to assemble the parts.';
  }
  parts.forEach((part, index) => {
   const amount = reduced() ? 1 : index === 0 ? clamp((progress - .1) / .085) : clamp((progress - index * .2) / .13);
   const ease = 1 - Math.pow(1 - amount, 3);
   part.style.opacity = index === 2 ? 1 : ease;
   const close = clamp((progress - .8) / .2);
   const separation = 0;
   const arrival = index === 1 ? 42 : (index === 0 || index === 2 || index === 3 ? 0 : 80 + index * 24);
   part.style.transform = `translateY(${-separation - (1 - ease) * arrival}px)`;
   part.classList.toggle('is-active', index === step);
  });
  $('.assembly-object').style.transform = 'none';
  const repeatAmount = reduced() ? 1 : clamp((progress - .025) / .075);
  const repeatEase = repeatAmount * repeatAmount * (3 - 2 * repeatAmount);
  $('.structure-repeat').style.opacity = repeatEase;
  $('.structure-repeat').style.transform = `translateY(${32 - (1 - repeatEase) * 50}px)`;
  $('.tray-front').style.opacity = parts[0].style.opacity;
  $('.anatomy-drawing .assembly-guide').style.opacity = reduced() ? (selected === 4 ? 0 : 1) : 1 - smooth((progress - .8) / .025);
  drawJoinery(progress);
  drawPlanning(progress);
  const review = !reduced() && progress >= .8;
  $('.assembly-object').style.visibility = review ? 'hidden' : 'visible';
  $('.review-object').setAttribute('visibility', review ? 'visible' : 'hidden');
  if (review) drawReview(progress);
  if (reduced() && selected === 4) {
   $('.assembly-object').style.visibility = 'hidden';
   $('.review-object').setAttribute('visibility', 'visible');drawReview(1);
  }
  const detailAmount=reduced()?1:smooth((progress-.27)/.11);
  const detail=$('.compartment-detail');detail.setAttribute('visibility','visible');detail.style.opacity=detailAmount;detail.style.transform=`translateY(${-(1-detailAmount)*18}px)`;
  description.querySelectorAll('.alignment-term').forEach((term,index)=>{
   const amount=reduced()?1:smooth((progress-(.4+index*.065))/.06);
   term.style.fontWeight=String(400+250*amount);
  });
  // The illustration occupies the cleared half of the same continuous background.
  background.style.setProperty('--bridge-columns', reduced() || !section.getClientRects().length ? 1 : 1 - clamp((innerHeight - rect.top) / (innerHeight * .7)));
 }
 // Draw all three solids together, with exposed faces determined from shared cell geometry.
 const cells = [
  ...[[0,0],[0,1],[1,1],[0,2]].map(([x,y]) => ({x,y,part:0})),
  ...[[1,0],[2,0],[2,1]].map(([x,y]) => ({x,y,part:1})),
  ...[[1,2],[2,2]].map(([x,y]) => ({x,y,part:2}))
 ];
 const byPosition = new Map(cells.map(cell => [`${cell.x},${cell.y}`,cell]));
 let lastMesh = '';
 function drawJoinery(progress) {
  const amounts = [0,1,2].map(index => reduced() ? 1 : clamp((progress - (.4 + index * .065)) / .06));
  const heights = amounts.map(amount => 34 + 125 * (1 - amount * amount * (3 - 2 * amount)));
  const visible = amounts.map(amount => amount > 0);
  const faces = [];
  const project = ([x,y,z]) => `${(325+(x-y)*1.12).toFixed(2)},${(490+(x+y)*.54-z).toFixed(2)}`;
  function addFace(vertices,kind,edges,opacity) {
   const depth = vertices.reduce((sum,[x,y,z]) => sum+x+y+z*1.08,0)/vertices.length;
   const fill = `<polygon class="mesh-${kind}" points="${vertices.map(project).join(' ')}"/>`;
   const lines = edges.map(([a,b]) => `M${project(a)}L${project(b)}`).join('');
   faces.push({depth,html:`<g opacity="${opacity.toFixed(4)}">`+fill+(lines ? `<path class="mesh-edge" d="${lines}"/>` : '')+'</g>'});
  }
  cells.forEach(cell => {
   if (!visible[cell.part]) return;
   const opacity=amounts[cell.part]*amounts[cell.part]*(3-2*amounts[cell.part]);
   const x=cell.x*60,y=cell.y*60,z=heights[cell.part],top=z+44;
   const corners=[[x,y,top],[x+60,y,top],[x+60,y+60,top],[x,y+60,top]];
   const neighbours=[[0,-1],[1,0],[0,1],[-1,0]].map(([dx,dy])=>byPosition.get(`${cell.x+dx},${cell.y+dy}`));
   const edges=[];
   neighbours.forEach((neighbour,index)=>{
    if (!neighbour || !visible[neighbour.part] || neighbour.part !== cell.part) edges.push([corners[index],corners[(index+1)%4]]);
   });
   addFace(corners,'top',edges,opacity);
   // Only camera-facing sides exist in the drawing. Subtract any occupied neighbour volume.
   for (const [dx,dy,kind] of [[1,0,'side-x'],[0,1,'side-y']]) {
    const neighbour=byPosition.get(`${cell.x+dx},${cell.y+dy}`);
    let intervals=[[z,top]];
    if (neighbour && visible[neighbour.part]) {
     const bottom=heights[neighbour.part],upper=bottom+44;
     intervals=intervals.flatMap(([lo,hi])=> upper<=lo || bottom>=hi ? [[lo,hi]] : [[lo,Math.min(hi,bottom)],[Math.max(lo,upper),hi]].filter(([a,b])=>b-a>.01));
    }
    intervals.forEach(([lo,hi])=>{
     const a=dx ? [x+60,y,lo] : [x,y+60,lo];
     const b=dx ? [x+60,y+60,lo] : [x+60,y+60,lo];
     const c=[b[0],b[1],hi],d=[a[0],a[1],hi];
     const edges=[[a,b]];
     // Merge coplanar side cells: no false vertical seams inside a single piece.
     const before=byPosition.get(`${cell.x+(dx?0:-1)},${cell.y+(dx?-1:0)}`);
     const after=byPosition.get(`${cell.x+(dx?0:1)},${cell.y+(dx?1:0)}`);
     if (!before || before.part!==cell.part) edges.push([a,d]);
     if (!after || after.part!==cell.part) edges.push([b,c]);
     addFace([a,b,c,d],kind,edges,opacity);
    });
   }
  });
  const html=faces.sort((a,b)=>a.depth-b.depth).map(face=>face.html).join('');
  if (html!==lastMesh) { $('.joinery-mesh').innerHTML=html;lastMesh=html; }
 }
 // Review uses the same world dimensions, reprojected as a real turn rather than a flat SVG spin.
 const smooth = value => { const t=clamp(value);return t*t*(3-2*t); };
 function projectScene(boxes,angle=0,seams=[]) {
  const cos=Math.cos(angle),sin=Math.sin(angle);
  const world=([x,y,z])=>[90+(x-90)*cos-(y-90)*sin,90+(x-90)*sin+(y-90)*cos,z];
  // The projection stays fixed through the entire turn; only the object angle changes.
  const verticalPlan=.54,verticalHeight=1;
  const point=v=>{const[x,y,z]=world(v);return `${(325+(x-y)*1.12).toFixed(2)},${(490+(x+y)*verticalPlan-z*verticalHeight).toFixed(2)}`;};
  const faces=[];
  function face(v,kind){const depth=v.reduce((sum,p)=>{const[x,y,z]=world(p);return sum+x+y+z*1000;},0)/v.length;faces.push({depth,html:`<polygon class="review-${kind}" points="${v.map(point).join(' ')}"/>`});}
  boxes.forEach(([x,y,z,w,d,h])=>{
   const X=x+w,Y=y+d,Z=z+h;
   face([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],'top');
   const sides=[
    [1,0,[[X,y,z],[X,Y,z],[X,Y,Z],[X,y,Z]]],
    [0,1,[[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]]],
    [-1,0,[[x,y,z],[x,Y,z],[x,Y,Z],[x,y,Z]]],
    [0,-1,[[x,y,z],[X,y,z],[X,y,Z],[x,y,Z]]]
   ];
   sides.forEach(([nx,ny,v])=>{const facing=(nx*cos-ny*sin)+(nx*sin+ny*cos);if(facing>.001)face(v,nx?'side-x':'side-y');});
  });
  seams.forEach(vertices=>vertices.slice(1).forEach((b,index)=>{
   const a=vertices[index];const depth=[a,b].reduce((sum,p)=>{const[x,y,z]=world(p);return sum+x+y+z*1000;},0)/2+.01;
   faces.push({depth,html:`<path class="review-seam" d="M${point(a)}L${point(b)}"/>`});
  }));
  return faces.sort((a,b)=>a.depth-b.depth).map(f=>f.html).join('');
 }
 function trackBoxes(){return [0,1,2,3].map(index=>[index*45,0,86,45,180,5]);}
 function drawPlanning(progress){
  $('.planning-track').innerHTML=trackBoxes().map((box,index)=>{
   const start=.6+index*.032;
   const amount=reduced()?1:smooth((progress-start)/.018);
   const settle=reduced()?1:smooth((progress-start-.014)/.052);
   const placed=[...box];placed[2]+=24*(1-settle);
   return `<g opacity="${amount}">${projectScene([placed])}</g>`;
  }).join('');
 }
 function drawReview(progress){
  const turn=smooth((progress-.8)/.135);
  const compact=smooth((progress-.94)/.055);
  const angle=turn * (180 * Math.PI / 180);

  const boxes=[];
  // Identical frames and their fitted divisions remain visible during the inspection.
  for(const offset of [-48,-24,0]){
   const base=7+offset*(1-compact);
   boxes.push([0,0,base,180,180,5]);
   boxes.push([0,0,base+5,4,180,14],[4,0,base+5,176,4,14],[176,4,base+5,4,176,14],[4,176,base+5,172,4,14]);
  }
  boxes.push([88,4,12,4,172,14],[92,88,12,84,4,14]);
  boxes.push([0,0,34-compact*10,180,180,44]);
  boxes.push(...trackBoxes().map(([x,y,z,w,d,h])=>[x,y,z-compact*12,w,d,h]));
  const jointSeams=[[[60,0,78],[60,60,78],[120,60,78],[120,120,78],[60,120,78],[60,180,78]],[[120,120,78],[180,120,78]]];
  const inspection=projectScene(boxes,angle,jointSeams);
  // The outer form closes after the turn; internal seams quietly disappear.
  const solid=projectScene([[0,0,7,180,180,84]],angle);

  $('.review-object').innerHTML=`<g opacity="${1-compact}">${inspection}</g><g opacity="${compact}">${solid}</g>`;
 }
 function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
 buttons.forEach((button, index) => button.addEventListener('click', () => {
  selected = index;
  if (reduced() || touchLayout()) { paint(); return; }
  const top = scrollY + section.getBoundingClientRect().top;
  scrollTo({ top: top + (section.offsetHeight - innerHeight) * ((index + .45) / 5), behavior: 'smooth' });
 }));
 addEventListener('scroll', schedule, { passive:true }); addEventListener('resize', schedule);
 $('#reduce').addEventListener('change', schedule); motionMedia.addEventListener('change', schedule); paint();
 // Touch readers get five real sections in document flow, not a frozen animation frame.
 let mobileBuilt=false;
 function buildMobileChapters(){
  if(mobileBuilt||!touchLayout())return;mobileBuilt=true;
  const flow=document.createElement('div');flow.className='mobile-anatomy-flow';
  const navigation=document.createElement('nav');navigation.className='mobile-anatomy-navigation';navigation.setAttribute('aria-label','Assessment design chapters');
  const select=document.createElement('select');select.setAttribute('aria-label','Go to an assessment design chapter');navigation.append(select);flow.append(navigation);
  const articles=[];const saved=selected;
  chapters.forEach((chapter,i)=>{
   selected=i;paint();
   const article=document.createElement('article');article.id='assessment-design-'+i;article.className='mobile-anatomy-chapter';
   const number=document.createElement('p');number.className='mobile-anatomy-number';number.textContent=String(i+1).padStart(2,'0')+' / 05';
   const heading=document.createElement('h2');heading.textContent=chapter[0];
   const copy=document.createElement('p');copy.textContent=chapter[1];
   const image=document.querySelector('.anatomy-drawing').cloneNode(true);image.removeAttribute('class');image.classList.add('mobile-anatomy-diagram');image.removeAttribute('aria-labelledby');image.setAttribute('aria-label',chapter[0]+' Assessment parts illustration');image.setAttribute('viewBox','20 270 680 510');image.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
   article.append(number,heading,copy,image);
   if(i!==1&&i!==2){const link=document.createElement('a');link.className='anatomy-evidence';link.textContent='Design rationale: '+chapter[2]+' ↗';link.href=chapter[3];link.target='_blank';link.rel='noopener noreferrer';article.append(link)}
   flow.append(article);articles.push(article);select.add(new Option(String(i+1).padStart(2,'0')+' · '+chapter[0].replace(/\.$/,''),i));
  });
  selected=saved;paint();section.append(flow);section.classList.add('has-mobile-chapters');
  select.addEventListener('change',()=>{const article=articles[+select.value];const top=scrollY+article.getBoundingClientRect().top-140;scrollTo({top,behavior:'instant'})});
  let pending=false;function follow(){pending=false;if(!touchLayout())return;let active=0;articles.forEach((a,i)=>{if(a.getBoundingClientRect().top<=180)active=i});select.value=active}
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(follow)}},{passive:true});
 }
 buildMobileChapters();addEventListener('resize',buildMobileChapters);
})();

// Overall reading position; informational only, never alters the scroll position.
(() => {
 const progress=document.getElementById('site-progress');if(!progress)return;
 const bar=progress.querySelector('span');let queued=false,last=-1;
 function paint(){queued=false;const range=document.documentElement.scrollHeight-innerHeight;const fraction=range>0?clamp(scrollY/range):0;bar.style.transform=`scaleX(${fraction})`;const percent=Math.round(fraction*100);if(percent!==last){progress.setAttribute('aria-valuenow',String(percent));last=percent;}}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 document.getElementById('reduce').addEventListener('change',schedule);
 new ResizeObserver(schedule).observe(document.querySelector('main'));paint();
})();
