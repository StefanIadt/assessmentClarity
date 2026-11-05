(()=>{
 const header=document.querySelector('body>.top'),section=document.querySelector('#tool');
 const size=()=>document.documentElement.style.setProperty('--main-header-height',header.getBoundingClientRect().height+'px');new ResizeObserver(size).observe(header);size();
 // Hash routes into the gallery remain on this document.
 function route(){if(location.hash==='#sam'||location.hash==='#maya')section.scrollIntoView({behavior:'instant'})}
 addEventListener('hashchange',route);route();
})();
