/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal, .stagger');
if('IntersectionObserver' in window && !reduceMotion){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el=>io.observe(el));
} else {
  revealEls.forEach(el=>el.classList.add('in'));
}

/* ── Progress bar + back-to-top + nav active state ── */
const fill = document.getElementById('progressFill');
const toTop = document.getElementById('toTop');
const mainNav = document.getElementById('mainNav');
const navAnchors = document.querySelectorAll('[data-nav]');
const sideAnchors = document.querySelectorAll('[data-side]');
const sections = Array.from(document.querySelectorAll('section, header.hero, footer')).filter(s=>s.id);

function onScroll(){
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const height = h.scrollHeight - h.clientHeight;
  if(fill) fill.style.width = (height > 0 ? (scrolled/height)*100 : 0) + '%';
  if(toTop) toTop.classList.toggle('show', scrolled > 600);
  if(mainNav) mainNav.classList.toggle('scrolled', scrolled > 40);

  let current = sections[0] && sections[0].id;
  for(const s of sections){
    if(scrolled >= s.offsetTop - 140) current = s.id;
  }
  navAnchors.forEach(a=>{
    a.classList.toggle('active', a.getAttribute('href') === '#'+current);
  });
  sideAnchors.forEach(a=>{
    a.classList.toggle('active', a.getAttribute('href') === '#'+current);
  });
}
document.addEventListener('scroll', onScroll, { passive:true });
onScroll();

if(toTop){
  toTop.addEventListener('click', ()=>{
    window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* ── In-page navigation ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if(history.pushState){ history.pushState(null, '', '#'+id); }
  });
});

/* ── Mobile menu ── */
const hamburger = document.getElementById('hamburger');
const hamburgerIcon = document.getElementById('hamburgerIcon');
const mobilePanel = document.getElementById('mobilePanel');
if(hamburger && hamburgerIcon && mobilePanel){
  function setMenuIcon(name){
    hamburgerIcon.replaceChildren();
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `assets/icons.svg#i-${name}`);
    hamburgerIcon.appendChild(use);
  }
  function closeMenu(){
    mobilePanel.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    setMenuIcon('menu');
  }
  function openMenu(){
    mobilePanel.classList.add('open');
    hamburger.setAttribute('aria-expanded','true');
    setMenuIcon('close');
  }
  hamburger.addEventListener('click', ()=>{
    mobilePanel.classList.contains('open') ? closeMenu() : openMenu();
  });
  mobilePanel.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMenu));
}
