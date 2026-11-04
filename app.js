'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const clamp = value => Math.max(0, Math.min(1, value));
const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => motionMedia.matches || $('#reduce').checked;

// Preferences remain available for every scene.
const prefs = $('#prefs');
$('#reduce').checked = motionMedia.matches;
$('#prefs-open').onclick = () => { prefs.hidden = !prefs.hidden; $('#prefs-open').setAttribute('aria-expanded', String(!prefs.hidden)); };
$('#prefs-close').onclick = () => { prefs.hidden = true; $('#prefs-open').setAttribute('aria-expanded', 'false'); $('#prefs-open').focus(); };
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !prefs.hidden) $('#prefs-close').click(); });
$('#contrast').onchange = event => document.body.classList.toggle('contrast', event.target.checked);
$('#large').onchange = event => { document.body.classList.toggle('large', event.target.checked); dispatchEvent(new Event('resize')); };

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
    const contactShadow = 'drop-shadow(0px 1px 0.65px rgba(37,29,20,.32)) drop-shadow(2px 5px 3.5px rgba(37,29,20,.20))';
    const raisedShadow = 'drop-shadow(5px 19px 13px rgba(37,29,20,.23)) drop-shadow(1px 2px 1px rgba(37,29,20,.10))';
    const finalTransform = target === 'placed' ? flat : target === 'hidden' ? entry : exit;
    state.target = target; layer.style.transition = 'none'; layer.style.opacity = still ? 0 : 1;
    layer.style.transform = finalTransform; layer.style.filter = contactShadow;
    function project(pose) {
      return pose.replace(/translate3d\(([-.\d]+)px,([-\.\d]+)px,([-\.\d]+)px\)/, (_,x,y,z) => `translate3d(${Number(x) + 5 + Number(z) * .4}px,${Number(y) + 7 + Number(z) * .62}px,0px)`).replace(/rotateX\([^)]*\)/,'rotateX(0deg)').replace(/rotateY\([^)]*\)/,'rotateY(0deg)');
    }
    state.shadow.style.transformOrigin = getComputedStyle(layer).transformOrigin;
    state.shadow.style.transform = project(finalTransform);
    state.shadow.style.filter = 'brightness(0) blur(3px)';
    state.shadow.style.opacity = still ? 0 : .20;
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
      return { transform: project(frame.transform), filter: `brightness(0) blur(${raised ? 17 : 3}px)`, opacity: raised ? .19 : .20, offset: frame.offset, easing: frame.easing };
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
  const reveal = still ? 1 : clamp((innerHeight * .8 - rect.top) / (innerHeight * .42));
  revealGroups.forEach((group, groupIndex) => {
    const words = [...group.querySelectorAll('.ambiguity-scroll-word')];
    words.forEach((word, index) => {
      const amount = still ? 1 : clamp((reveal - groupIndex * .16 - index / words.length * .21) / .18);
      const eased = 1 - Math.pow(1 - amount, 3);
      word.style.opacity = eased;
      const particleWord = word.closest('.particle-word'); if (particleWord) particleWord.style.setProperty('--particle-reveal', eased);
      word.style.transform = `translateY(${(1 - eased) * .45}em)`; word.style.filter = `blur(${(1 - eased) * 2}px)`;
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
let pointer = null, focused = null, focusFrame = 0;
function paintFocus() {
  focusFrame = 0;
  const bounds = message.getBoundingClientRect();
  const distanceFromCenter = Math.abs(bounds.top + bounds.height / 2 - innerHeight * .5);
  const proximity = clamp(1 - distanceFromCenter / (innerHeight * .44));
  const emphasis = proximity * proximity * (3 - 2 * proximity);
  const baseBlur = reduced() ? 0 : (innerWidth < 760 ? 3.5 : 4.5) * emphasis;
  const center = pointer || (focused ? (() => { const r = focused.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })() : null);
  focusWords.forEach(word => {
    let blur = baseBlur;
    if (blur && center) {
      const box = word.getBoundingClientRect();
      const dx = Math.max(0, Math.abs(center.x - (box.left + box.width / 2)) - box.width / 2);
      const dy = Math.max(0, Math.abs(center.y - (box.top + box.height / 2)) - box.height / 2);
      const distance = Math.hypot(dx / (innerWidth < 760 ? 70 : 95), dy / 28);
      blur *= clamp((distance - .55) / .7);
    }
    word.style.setProperty('--word-blur', `${blur}px`);
    word.setAttribute('aria-pressed', String(word === focused));
  });
}
message.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') { pointer = { x: event.clientX, y: event.clientY }; paintFocus(); } });
message.addEventListener('pointerleave', () => { pointer = null; paintFocus(); });
focusWords.forEach(word => {
  word.addEventListener('focus', () => { focused = word; paintFocus(); });
  word.addEventListener('click', () => { focused = word; pointer = null; paintFocus(); });
});
message.addEventListener('focusout', () => requestAnimationFrame(() => { if (!message.contains(document.activeElement)) { focused = null; paintFocus(); } }));
function scheduleFocus() { if (!focusFrame) focusFrame = requestAnimationFrame(paintFocus); }
addEventListener('scroll', scheduleFocus, { passive: true }); addEventListener('resize', scheduleFocus);
paintFocus();
$('#reduce').addEventListener('change', paintFocus); motionMedia.addEventListener('change', paintFocus);

// Matter.js bodies fall, collide, settle and can be dragged. Restore returns them to their measured text positions.
(() => {
  const trigger = $('.complexity-trigger'), toggle = $('.clarity-toggle'), conclusion = $('.complexity-conclusion');
  const text = trigger.textContent; trigger.setAttribute('aria-label', text); trigger.replaceChildren();
  text.split(/(\s+)/).forEach(part => { if (!part.trim()) trigger.append(document.createTextNode(part)); else { const word = document.createElement('span'); word.className = 'complexity-word'; word.textContent = part; word.setAttribute('aria-hidden', 'true'); trigger.append(word); } });
  const words = [...trigger.querySelectorAll('.complexity-word')];
  const { Engine, Bodies, Body, Composite, Constraint, Query, Sleeping } = Matter;
  let engine = null, pieces = [], state = 'idle', frame = 0, lastTime = 0, drag = null, animations = [], generation = 0;
  function label() { trigger.dataset.state = state; toggle.textContent = state === 'fallen' ? 'Restore clarity ↗' : state === 'clear' ? 'Let it fall again ↓' : 'Let words fall ↓'; toggle.setAttribute('aria-expanded', String(state === 'clear')); toggle.disabled = state === 'restoring'; }
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
      return reduced() ? null : word.animate([{ transform: transforms[index] }, { transform: 'translate(0,0) rotate(0rad)' }], { duration: 950, delay: index * 7, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'none' });
    }).filter(Boolean);
    await Promise.allSettled(animations.map(animation => animation.finished));
    if (generation !== run) return;
    animations = []; state = 'clear'; conclusion.hidden = false; label();
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
  function wake() { if (reduced() || !visible || !points.length) return; host.classList.add('particles-active'); if (!frame) { last = 0; frame = requestAnimationFrame(tick); } }
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
      scene.classList.remove('scene-unpinned');
      scene.classList.toggle('scene-unpinned', reduced() || panel.scrollHeight > innerHeight + 2);
    });
  }
  function scheduleMeasure() { if (!queued) { queued = true; requestAnimationFrame(measure); } }
  const observer = new ResizeObserver(scheduleMeasure); scenes.forEach(scene => observer.observe(scene.firstElementChild));
  addEventListener('resize', scheduleMeasure); $('#reduce').addEventListener('change', scheduleMeasure); motionMedia.addEventListener('change', scheduleMeasure);
  document.fonts.ready.then(scheduleMeasure); measure();
})();

// Readable alternatives remain available while the next story scenes are being developed.
$$('[data-readable]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); $('#reduce').checked = true; $('#reduce').dispatchEvent(new Event('change'));
  requestAnimationFrame(() => requestAnimationFrame(() => $('#reading-passage').scrollIntoView({ behavior: 'instant', block: 'start' })));
}));

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
    const anatomyTop = $('#anatomy').getBoundingClientRect().top;
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
 ['Manageable detail.', 'Explore one group at a time. Its detail opens without losing its place in the whole.', 'CAST UDL', 'https://udlguidelines.cast.org/action-expression/strategy-development/organize-information/'],
 ['Alignment.', 'Learning outcomes, the task and assessment criteria connect to form a coherent whole.', 'Project design principles', '#anatomy'],
 ['Planning.', 'Visible stages and milestones help turn a final deadline into a process students can plan.', 'CAST UDL', 'https://udlguidelines.cast.org/action-expression/strategy-development/'],
 ['Checking and reflection.', 'Return to the requirements, check progress and identify what needs attention.', 'CAST UDL', 'https://udlguidelines.cast.org/action-expression/strategy-development/monitor-progress/']
 ];
 let current = -1, queued = false, selected = 0, open = false;
 const chapterText = document.createElement('div'); chapterText.className = 'anatomy-chapter-text';
 title.before(chapterText); chapterText.append(title, description, evidence);
 let outgoing = null, entrance = null;
 function transitionChapter(change) {
  if (outgoing) { outgoing.remove(); outgoing = null; }
  if (entrance) { entrance.cancel(); entrance = null; }
  if (current < 0 || reduced()) { change(); return; }
  outgoing = chapterText.cloneNode(true);
  outgoing.classList.add('anatomy-chapter-outgoing'); outgoing.setAttribute('aria-hidden', 'true'); outgoing.inert = true;
  outgoing.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  chapterText.before(outgoing);
  const previous = outgoing;
  previous.animate([{ opacity:1, transform:'translateY(0)' }, { opacity:0, transform:'translateY(-9px)' }], { duration:440, easing:'ease-in-out', fill:'forwards' }).finished.then(() => { previous.remove(); if (outgoing === previous) outgoing = null; }).catch(() => {});
  change();
  entrance = chapterText.animate([{ opacity:0, transform:'translateY(9px)' }, { opacity:1, transform:'translateY(0)' }], { duration:520, easing:'cubic-bezier(.22,1,.36,1)' });
 }
 const drawer = $('.anatomy-compartment');
 function toggleDetail() {
  open = !open; drawer.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-label', open ? 'Close grouped information' : 'Open grouped information');
  $('.compartment-detail').setAttribute('visibility', open ? 'visible' : 'hidden');
  // Detail opens inside the fixed compartment; the fitted dividers stay seated.
 }
 drawer.addEventListener('click', toggleDetail);
 drawer.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleDetail(); } });
 function paint() {
  queued = false;
  const rect = section.getBoundingClientRect();
  const progress = reduced() ? selected / 4 : clamp(-rect.top / Math.max(1, section.offsetHeight - innerHeight));
  const step = Math.min(4, Math.floor(progress * 5));
  if (step !== current) {
   const data = chapters[step];
   transitionChapter(() => {
    title.textContent = data[0]; description.textContent = data[1];
    evidence.textContent = `Design rationale: ${data[2]} ↗`; evidence.href = data[3]; evidence.hidden = step === 2;
   });
   current = step;
   buttons.forEach((button, index) => { if (index === step) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
   hint.textContent = step === 1 ? 'Select the compartment to open or close its detail.' : 'Scroll to assemble the parts.';
  }
  parts.forEach((part, index) => {
   const amount = reduced() ? 1 : index === 0 ? clamp((progress - .1) / .085) : clamp((progress - index * .2) / .13);
   const ease = 1 - Math.pow(1 - amount, 3);
   part.style.opacity = ease;
   const close = clamp((progress - .8) / .2);
   const separation = [0, 0, 50, 190, 250][index] * (1 - close);
   const arrival = index === 1 ? 42 : (index === 0 ? 0 : 80 + index * 24);
   part.style.transform = `translateY(${-separation - (1 - ease) * arrival}px)`;
   part.classList.toggle('is-active', index === step);
  });
  $('.assembly-object').style.transform = `translateY(${-180 * (1 - clamp(progress / .4))}px)`;
  const repeatAmount = reduced() ? 1 : clamp((progress - .025) / .075);
  const repeatEase = repeatAmount * repeatAmount * (3 - 2 * repeatAmount);
  $('.structure-repeat').style.opacity = repeatEase;
  $('.structure-repeat').style.transform = `translateY(${32 - (1 - repeatEase) * 50}px)`;
  $('.tray-front').style.opacity = parts[0].style.opacity;
  $('.anatomy-drawing .assembly-guide').style.opacity = clamp((progress - .2) / .15);
  $$('[data-joint]').forEach((joint, index) => { joint.style.transform = `translateY(${-(index ? 140 : 55) * (1 - clamp((progress - .8) / .2))}px)`; });
  // The illustration occupies the cleared half of the same continuous background.
  background.style.setProperty('--bridge-columns', reduced() ? 1 : 1 - clamp((innerHeight - rect.top) / (innerHeight * .7)));
 }
 function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
 buttons.forEach((button, index) => button.addEventListener('click', () => {
  selected = index;
  if (reduced()) { paint(); return; }
  const top = scrollY + section.getBoundingClientRect().top;
  scrollTo({ top: top + (section.offsetHeight - innerHeight) * ((index + .45) / 5), behavior: 'smooth' });
 }));
 addEventListener('scroll', schedule, { passive:true }); addEventListener('resize', schedule);
 $('#reduce').addEventListener('change', schedule); motionMedia.addEventListener('change', schedule); paint();
})();
