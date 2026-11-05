(()=>{
 'use strict';
 const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],frame=q('#sam-frame'),maya=document.body.dataset.person==='maya',person=maya?'Maya':'Sam';
 let loaded=false,phone=!maya,index=0;
 const steps=[
 {key:'schedule',name:'Schedule',question:'What should I focus on this week?',match:'Schedule',story:'On the train, the final deadline feels overwhelming. Sam opens {match} to find one manageable next step.',research:'Visible stages support planning. They are an aid to choosing a next action, rather than a prescribed pace for every learner.',source:'https://udlguidelines.cast.org/action-expression/strategy-development/'},
 {key:'task',name:'The task',question:'What am I building?',match:'Project Overview',story:'{match} gives Sam the essential task: build a responsive website with Tailwind CSS. Supporting detail stays closed until he needs it.',research:'A clear structure gives essential information a predictable place and makes supporting detail easier to locate.',source:'https://www.w3.org/WAI/WCAG2/supplemental/patterns/o2p03-page-structure/'},
 {key:'detail',name:'AI use',question:'How do I explain my AI use?',match:'Student Actions',story:'Sam opens {match} → AI Usage Log. He records the tool, its purpose, what he changed, and his critical evaluation of the output.',research:'The AI Assessment Scale informs the lecturer’s task design and expectations for AI use. The log makes Sam’s process available for review; recording use is not a judgement of its quality.',source:'https://aiassessmentscale.com/'},
 {key:'assessment',name:'Assessment',question:'What am I being marked for?',match:'Rubric',story:'The {match} makes the evidence and standards explicit. Sam can open a criterion and compare its descriptions with his own work.',research:'Andrade’s review supports formative self-assessment with guidance and opportunities to improve. This provides a rationale, not evidence of this tool’s effectiveness.',source:'https://doi.org/10.3389/feduc.2019.00087'},
 {key:'check',name:'Submission',question:'Have I included everything?',match:'Submission Checklist',story:'Sam uses the {match} to check the required links and records. This checks completeness; the rubric judges the quality of his evidence.',research:'Monitoring progress and reviewing quality serve different purposes. Checkmarks record preparation, not achievement.',source:'https://udlguidelines.cast.org/action-expression/strategy-development/monitor-progress/'}
 ];
 if(maya){const teacher=[
 {question:'Is the next step clear?',story:'Maya reviews the {match} before sharing her computing brief. She checks that each phase names an action and a checkpoint, rather than leaving students with only a final deadline.'},
 {question:'Can students find the essential task?',story:'Maya checks the {match} in the student preview: build a responsive website with Tailwind CSS. Supporting guidance stays available without overwhelming the starting point.'},
 {question:'Are the AI expectations explicit?',story:'Maya checks that the AI policy explains how AI may be used and evaluated. Through {match} → AI Usage Log, she reviews the record students will complete.'},
 {question:'Does the evidence match the criteria?',story:'Maya reviews the {match}: implementation, testing and reflection. She checks that the evidence and grade descriptions make her expectations visible to students.'},
 {question:'Will students know what to hand in?',story:'Maya reviews the {match} against the brief’s submission procedure. Figma, GitHub and deployment links must be named consistently; completion remains separate from quality.'}
 ];steps.forEach((step,i)=>Object.assign(step,teacher[i]));}
 function send(type,data={}){if(loaded)frame.contentWindow.postMessage({source:'sam-story',type,...data},location.origin)}
 const main=q('#sam-start'),nav=q('.chapter-index');
 q('.story-navigation').remove();const other=document.createElement('a');other.className='next-person';other.href=maya?'sam.html':'maya.html';other.textContent=maya?'Sam · student →':'Maya · lecturer →';q('.sam-identity').after(other);
 const trail=document.createElement('div');trail.className='chapter-landmarks';main.append(trail);
 steps.forEach((step,i)=>{const a=document.createElement('a');a.href='#chapter-'+step.key;a.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span><span>'+step.name+'</span>';a.addEventListener('click',e=>{e.preventDefault();go(i)});nav.append(a);const landmark=document.createElement('section');landmark.id='chapter-'+step.key;landmark.setAttribute('aria-label',step.name);landmark.style.top=(i*100)+'vh';trail.append(landmark)});
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('story-still');
 function go(i){const top=main.offsetTop+i*innerHeight;window.scrollTo({top,behavior:reduced()?'instant':'smooth'})}
 let fadeTimer;
 function paint(sync=true,fade=false){
  const step=steps[index];all('.chapter-index a').forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});
  clearTimeout(fadeTimer);
  const update=()=>{q('#context-question').textContent=step.question;const text=q('#context-story');text.replaceChildren();const parts=step.story.split('{match}');text.append(parts[0]);const mark=document.createElement('mark');mark.className='context-match';mark.textContent=step.match;text.append(mark,parts[1]);q('#context-evidence-text').textContent=step.research;q('#context-source').href=step.source;if(sync)send('stage',{stage:step.key});requestAnimationFrame(()=>requestAnimationFrame(()=>q('.sam-layout').classList.remove('chapter-changing')))};
  if(fade&&!reduced()){q('.sam-layout').classList.add('chapter-changing');fadeTimer=setTimeout(update,180)}else update();
 }
 let queued=false;
 function followScroll(){queued=false;const next=Math.max(0,Math.min(steps.length-1,Math.floor((scrollY-main.offsetTop+innerHeight*.32)/innerHeight)));if(next!==index){index=next;paint(true,true)}}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(followScroll)}},{passive:true});
 addEventListener('resize',followScroll);
 function setDevice(next){phone=next;document.body.classList.toggle('phone-view',phone);document.body.classList.toggle('laptop-view',!phone);all('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.device==='phone')===phone)));requestAnimationFrame(()=>send('device',{phone}))}
 all('[data-device]').forEach(b=>b.addEventListener('click',()=>setDevice(b.dataset.device==='phone')));
 frame.addEventListener('load',()=>{loaded=true;frame.contentWindow.postMessage({source:'clarity-story',config:{continuous:true,role:'student',dark:false,viewportHeight:innerHeight}},location.origin);send('device',{phone});paint()});
 addEventListener('message',event=>{if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.source!=='clarity-brief-demo')return;if(event.data.type==='stage'){const next=steps.findIndex(s=>s.key===event.data.stage);if(next>=0&&next!==index){index=next;paint(false,true);window.scrollTo({top:main.offsetTop+next*innerHeight,behavior:'instant'})}}});
 setDevice(phone);paint(false);requestAnimationFrame(followScroll);
})();
