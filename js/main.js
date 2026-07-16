const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* ── Boot screen ── */
(function initBoot(){
  const boot = document.getElementById('boot');
  const bootFill = document.getElementById('bootFill');
  const bootBar = document.getElementById('bootBar');
  const bootStatus = document.getElementById('bootStatus');
  const bootLog = document.getElementById('bootLog');

  let seen = false;
  try { seen = sessionStorage.getItem('hd_booted') === '1'; } catch(e) {}

  if(!boot || reduceMotion || seen){
    if(boot) boot.classList.add('done');
    document.body.classList.remove('booting');
    return;
  }

  try { sessionStorage.setItem('hd_booted', '1'); } catch(e) {}
  document.body.classList.add('booting');
  const lines = [
    '[OK] Loading assets…',
    '[OK] Verifying eJPT credentials…',
    '[OK] Mounting security modules…',
    '[OK] Session ready.',
  ];
  let progress = 0;
  let lineIdx = 0;

  function setProgress(val){
    progress = val;
    if(bootFill) bootFill.style.width = val + '%';
    if(bootBar) bootBar.setAttribute('aria-valuenow', String(Math.round(val)));
  }

  function addLine(text){
    if(!bootLog) return;
    const li = document.createElement('li');
    li.textContent = text;
    bootLog.appendChild(li);
    while(bootLog.children.length > 4) bootLog.removeChild(bootLog.firstChild);
  }

  const steps = [
    { at: 12, status: 'LOADING ASSETS…', line: lines[0] },
    { at: 38, status: 'VERIFYING CREDENTIALS…', line: lines[1] },
    { at: 64, status: 'MOUNTING MODULES…', line: lines[2] },
    { at: 88, status: 'SESSION READY', line: lines[3] },
  ];

  const start = performance.now();
  const duration = 2200;

  function tick(now){
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 2.2);
    setProgress(eased * 100);

    while(lineIdx < steps.length && eased * 100 >= steps[lineIdx].at){
      if(bootStatus) bootStatus.textContent = steps[lineIdx].status;
      addLine(steps[lineIdx].line);
      lineIdx++;
    }

    if(t < 1){
      requestAnimationFrame(tick);
    } else {
      setTimeout(()=>{
        boot.classList.add('done');
        document.body.classList.remove('booting');
        boot.setAttribute('aria-hidden', 'true');
      }, 280);
    }
  }
  requestAnimationFrame(tick);
})();

/* ── Custom cursor ── */
(function initCursor(){
  if(!finePointer || reduceMotion) return;
  const cursor = document.getElementById('cursor');
  if(!cursor) return;

  document.body.classList.add('has-cursor');
  let mx = -100, my = -100, rx = -100, ry = -100;
  let hovering = false;

  document.addEventListener('mousemove', (e)=>{
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  document.addEventListener('mousedown', ()=> cursor.classList.add('click'));
  document.addEventListener('mouseup', ()=> cursor.classList.remove('click'));

  const hoverTargets = 'a, button, [data-tilt], .btn, input, textarea, select, label';
  document.addEventListener('mouseover', (e)=>{
    if(e.target.closest(hoverTargets)){
      cursor.classList.add('hover');
      hovering = true;
    }
  });
  document.addEventListener('mouseout', (e)=>{
    if(e.target.closest(hoverTargets)){
      cursor.classList.remove('hover');
      hovering = false;
    }
  });

  function frame(){
    rx += (mx - rx) * (hovering ? 0.22 : 0.18);
    ry += (my - ry) * (hovering ? 0.22 : 0.18);
    cursor.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ── Magnetic buttons ── */
(function initMagnetic(){
  if(!finePointer || reduceMotion) return;
  document.querySelectorAll('[data-magnetic]').forEach(el=>{
    const strength = 0.32;
    el.addEventListener('mousemove', (e)=>{
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('mouseleave', ()=>{
      el.style.transform = '';
    });
  });
})();

/* ── 3D tilt cards ── */
(function initTilt(){
  if(reduceMotion) return;
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    const max = 8;
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.classList.add('tilt-active');
      card.style.transform = `perspective(800px) rotateX(${-y * max}deg) rotateY(${x * max}deg) scale3d(1.02,1.02,1.02)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.classList.remove('tilt-active');
      card.style.transform = '';
    });
  });
})();

/* ── Card spotlight glow ── */
(function initSpotlight(){
  if(reduceMotion) return;
  document.querySelectorAll('[data-spotlight]').forEach(el=>{
    el.addEventListener('mousemove', (e)=>{
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--spot-x', x + '%');
      el.style.setProperty('--spot-y', y + '%');
    });
    el.addEventListener('mouseleave', ()=>{
      el.style.removeProperty('--spot-x');
      el.style.removeProperty('--spot-y');
    });
  });
})();

/* ── Timeline entry reveals + progress line ── */
(function initTimeline(){
  const timeline = document.getElementById('timeline');
  const logProgress = document.getElementById('logProgress');
  const entries = document.querySelectorAll('.entry-reveal');
  if(!entries.length) return;

  function updateProgress(){
    if(!timeline || !logProgress) return;
    const visible = Array.from(entries).filter(e=>e.classList.contains('in'));
    if(!visible.length){ logProgress.style.height = '0%'; return; }
    const last = visible[visible.length - 1];
    const logRect = timeline.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const h = lastRect.top - logRect.top + 12;
    logProgress.style.height = Math.min(h, timeline.offsetHeight) + 'px';
  }

  if('IntersectionObserver' in window && !reduceMotion){
    const io = new IntersectionObserver((obsEntries)=>{
      obsEntries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
          updateProgress();
        }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
    entries.forEach(el=>io.observe(el));
  } else {
    entries.forEach(el=>el.classList.add('in'));
    updateProgress();
  }
})();

/* ── Count-up animation ── */
function animateCount(el){
  const raw = el.dataset.value;
  const suffix = el.dataset.suffix || '';
  const end = parseFloat(raw);
  const decimals = (raw.split('.')[1] || '').length;
  if(reduceMotion){ el.textContent = raw + suffix; return; }
  const dur = 1100;
  const start = performance.now();
  function frame(now){
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = end * eased;
    el.textContent = val.toFixed(decimals) + suffix;
    if(t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ── Hero metrics count-up ── */
const metricEls = document.querySelectorAll('.metric-num');
if('IntersectionObserver' in window){
  const metricIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ animateCount(e.target); metricIO.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  metricEls.forEach(el=>metricIO.observe(el));
} else {
  metricEls.forEach(el=>{ el.textContent = el.dataset.value + (el.dataset.suffix||''); });
}

/* ── Scroll cue hide ── */
(function initScrollCue(){
  const cue = document.querySelector('.scroll-cue');
  if(!cue) return;
  function hideCue(){
    if(window.scrollY > 80) cue.classList.add('hidden');
    else cue.classList.remove('hidden');
  }
  document.addEventListener('scroll', hideCue, { passive: true });
  hideCue();
})();

/* ── Button ripple effect ── */
(function initRipple(){
  if(reduceMotion) return;
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', function(e){
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', ()=> ripple.remove());
    });
  });
})();

/* ── Parallax hero ── */
(function initParallax(){
  if(reduceMotion) return;
  const watermark = document.querySelector('.hero-watermark');
  const glow = document.querySelector('header.hero .glow');
  if(!watermark && !glow) return;

  document.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    if(watermark) watermark.style.transform = `translateY(${y * 0.12}px)`;
    if(glow) glow.style.transform = `translateX(-50%) translateY(${y * 0.08}px)`;
  }, { passive: true });
})();

/* ── Count-up animation for flagship stats ── */
const statEls = document.querySelectorAll('.stat .num');
if('IntersectionObserver' in window){
  const statIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ animateCount(e.target); statIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  statEls.forEach(el=>statIO.observe(el));
} else {
  statEls.forEach(el=>{ el.textContent = el.dataset.value + (el.dataset.suffix||''); });
}

/* ── Typing effect for the role line ── */
const roleText = "Junior Penetration Tester // Aspiring Security Engineer";
const roleEl = document.getElementById('roleLine');
if(roleEl){
  if(reduceMotion){
    roleEl.textContent = roleText;
  } else {
    let i = 0;
    (function typeChar(){
      if(i <= roleText.length){
        roleEl.textContent = roleText.slice(0, i);
        if(i < roleText.length){
          const caret = document.createElement('span');
          caret.className = 'caret';
          caret.textContent = '\u00a0';
          roleEl.appendChild(caret);
        }
        i++;
        setTimeout(typeChar, 24);
      }
    })();
  }
}

/* ── Terminal panel typing sequence ── */
const termBody = document.getElementById('termBody');
const termLines = [
  { t:'$ whoami', cls:'c' },
  { t:'> hosam dyab, junior penetration tester', cls:'p' },
  { t:'', cls:'' },
  { t:'$ cat certifications.txt', cls:'c' },
  { t:'> [OK] eJPT: INE (valid 2025-2028)', cls:'ok' },
  { t:'> [OK] Ethical Hacking: ITI', cls:'ok' },
  { t:'> [OK] Azure DP-900: Microsoft', cls:'ok' },
  { t:'', cls:'' },
  { t:'$ cat status.txt', cls:'c' },
  { t:'> OPEN TO ENGAGEMENTS', cls:'p' },
  { t:'> Cairo, Egypt · Remote · Freelance', cls:'p' },
];
const allowedTermClasses = new Set(['c', 'p', 'ok', '']);
function appendTermLine(container, text, cls){
  const safeCls = allowedTermClasses.has(cls) ? cls : '';
  const span = document.createElement('span');
  if(safeCls) span.className = safeCls;
  span.textContent = text;
  container.appendChild(span);
  container.appendChild(document.createTextNode('\n'));
}
function renderTerminal(){
  if(!termBody) return;
  termBody.replaceChildren();
  if(reduceMotion){
    termLines.forEach(l => appendTermLine(termBody, l.t, l.cls));
    return;
  }
  let li = 0, ci = 0;
  const built = document.createDocumentFragment();
  function step(){
    if(li >= termLines.length){
      termBody.replaceChildren(...built.childNodes);
      const cursor = document.createElement('span');
      cursor.className = 'term-cursor';
      termBody.appendChild(cursor);
      return;
    }
    const line = termLines[li];
    if(ci === 0 && line.t === ''){
      built.appendChild(document.createTextNode('\n'));
      li++; ci = 0; setTimeout(step, 120); return;
    }
    termBody.replaceChildren(...built.cloneNode(true).childNodes);
    const partial = document.createElement('span');
    if(line.cls) partial.className = line.cls;
    partial.textContent = line.t.slice(0, ci);
    termBody.appendChild(partial);
    const cursor = document.createElement('span');
    cursor.className = 'term-cursor';
    termBody.appendChild(cursor);
    if(ci <= line.t.length){
      ci++;
      setTimeout(step, line.t.startsWith('$') ? 34 : 10);
    } else {
      appendTermLine(built, line.t, line.cls);
      li++; ci = 0;
      setTimeout(step, line.t.startsWith('$') ? 260 : 60);
    }
  }
  step();
}
if('IntersectionObserver' in window){
  const termIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ renderTerminal(); termIO.disconnect(); } });
  }, { threshold: 0.3 });
  const tBox = document.getElementById('terminalBox');
  if(tBox) termIO.observe(tBox);
} else {
  renderTerminal();
}

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
