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
    const strength = 0.18;
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
    const max = 5.5;
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.classList.add('tilt-active');
      card.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) scale3d(1.012,1.012,1.012)`;
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
  const termInputLine = document.getElementById('termInputLine');
  const termInput = document.getElementById('termInput');
  function showTermInput(){
    if(!termInputLine || !termInput) return;
    termInputLine.style.display = 'flex';
    setTimeout(()=>{ try{ termInput.focus(); } catch(e){} }, 60);
  }
  termBody.replaceChildren();
  if(reduceMotion){
    termLines.forEach(l => appendTermLine(termBody, l.t, l.cls));
    showTermInput();
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
      showTermInput();
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

/* ── Full UI/UX enhancements (themes, palette, terminal, filters, toasts, contact, particles) ── */
(function enhanceUI(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Theme system ---------- */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIconSvg = document.getElementById('themeIcon');
  const STORAGE_KEY = 'hd_theme';

  const themes = ['dark', 'light', 'matrix'];
  function themeIconFor(t){
    if(t === 'light') return 'sun';
    if(t === 'matrix') return 'matrix';
    return 'moon';
  }

  function setTheme(nextTheme, {persist=true}={}){
    if(!themes.includes(nextTheme)) return;
    html.setAttribute('data-theme', nextTheme);
    if(persist){
      try{ localStorage.setItem(STORAGE_KEY, nextTheme); } catch(e){}
    }
    if(themeIconSvg){
      const use = themeIconSvg.querySelector('use');
      if(use) use.setAttribute('href', `assets/icons.svg#i-${themeIconFor(nextTheme)}`);
    }
    // Repaint particles when needed
    if(typeof window.__hdParticlesRepaint === 'function'){ window.__hdParticlesRepaint(); }
  }

  function initTheme(){
    let saved = null;
    try{ saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
    const initial = saved && themes.includes(saved) ? saved : 'dark';
    setTheme(initial, {persist:false});
  }

  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const cur = html.getAttribute('data-theme') || 'dark';
      const idx = Math.max(0, themes.indexOf(cur));
      const next = themes[(idx + 1) % themes.length];
      setTheme(next);
      if(window.innerWidth < 520){ /* keep menu behavior simple */ }
    });
  }

  initTheme();

  /* ---------- Toast system ---------- */
  const toastContainer = document.getElementById('toastContainer');
  function toast(message){
    if(!toastContainer) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    toastContainer.appendChild(el);
    window.setTimeout(()=>{ el.remove(); }, 2800);
  }

  /* ---------- Copy-to-clipboard ---------- */
  function copyText(text){
    const trimmed = String(text ?? '');
    if(!trimmed) return Promise.resolve(false);
    if(navigator.clipboard && window.isSecureContext){
      return navigator.clipboard.writeText(trimmed).then(()=>true).catch(()=>false);
    }
    return new Promise((resolve)=>{
      const ta = document.createElement('textarea');
      ta.value = trimmed;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try{
        const ok = document.execCommand('copy');
        resolve(Boolean(ok));
      } catch(e){
        resolve(false);
      } finally {
        ta.remove();
      }
    });
  }

  $$('.copy-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const val = btn.getAttribute('data-copy');
      const ok = await copyText(val);
      toast(ok ? 'Copied to clipboard.' : 'Copy failed. Please try manually.');
    });
  });

  /* ---------- Dynamic year ---------- */
  const yearEl = document.getElementById('year');
  if(yearEl){
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Smooth scroll helper ---------- */
  function scrollToId(id){
    const target = document.getElementById(id);
    if(!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- Project filters ---------- */
  const projectFilters = document.getElementById('projectFilters');
  const filterBtns = projectFilters ? $$('.filter-btn', projectFilters) : [];
  const projectsGrid = document.getElementById('projectsGrid');
  const projectCards = projectsGrid ? $$('.proj-card', projectsGrid) : [];

  function applyProjectFilter(filter){
    projectCards.forEach(card=>{
      const cat = card.getAttribute('data-category') || 'all';
      const show = filter === 'all' || cat === filter;
      card.classList.toggle('hide', !show);
    });
  }

  if(projectFilters && filterBtns.length){
    filterBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const filter = btn.getAttribute('data-filter') || 'all';
        filterBtns.forEach(b=>{
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });
        applyProjectFilter(filter);
      });
    });
    applyProjectFilter('all');
  }

  /* ---------- Terminal commands ---------- */
  (function terminalCommands(){
    const terminalBox = document.getElementById('terminalBox');
    const termInputLine = document.getElementById('termInputLine');
    const termInput = document.getElementById('termInput');
    const termBodyLocal = document.getElementById('termBody');
    if(!terminalBox || !termInput || !termBodyLocal) return;

    function outputLine(text, cls){
      appendTermLine(termBodyLocal, text, cls || '');
    }

    function listProjects(){
      if(!projectsGrid) return [];
      const items = $$('.proj-card', projectsGrid);
      return items.map(card=>{
        const name = card.querySelector('.proj-name')?.textContent?.trim() || 'Project';
        const cat = card.getAttribute('data-category') || 'desktop';
        return {name, cat};
      });
    }

    function runCommand(raw){
      const cmd = String(raw || '').trim();
      if(!cmd) return;
      outputLine('$ ' + cmd, 'c');

      const lower = cmd.toLowerCase();
      if(lower === 'help' || lower === '?'){
        outputLine('Commands: help, whoami, certs, projects, contact, theme, clear', 'p');
        outputLine('Usage: theme [dark|light|matrix]', 'p');
        return;
      }
      if(lower === 'whoami'){
        outputLine('hosam dyab, junior penetration tester', 'p');
        outputLine('pentesting -> appsec / security engineering', 'p');
        return;
      }
      if(lower === 'certs'){
        outputLine('[OK] eJPT: INE (valid 2025-2028)', 'ok');
        outputLine('[OK] Ethical Hacking: ITI', 'ok');
        outputLine('[OK] Azure DP-900 / Dataverse (Microsoft)', 'ok');
        return;
      }
      if(lower === 'projects'){
        const items = listProjects();
        items.slice(0, 10).forEach(it=>{
          outputLine(`- ${it.name} [${it.cat}]`, 'p');
        });
        return;
      }
      if(lower === 'contact'){
        outputLine('email: dyabhosamm@gmail.com', 'p');
        outputLine('phone: +20 109 360 1340', 'p');
        outputLine('tip: use the contact form in the footer for fast replies.', 'p');
        return;
      }
      if(lower === 'clear'){
        termBodyLocal.replaceChildren();
        outputLine('Cleared.', 'p');
        return;
      }
      if(lower.startsWith('theme')){
        const parts = lower.split(/\s+/);
        const desired = parts[1];
        if(desired && themes.includes(desired)){
          setTheme(desired);
          outputLine(`[OK] theme set to ${desired}`, 'ok');
        } else {
          outputLine('Theme options: dark, light, matrix', 'p');
        }
        return;
      }

      // Friendly fallback
      outputLine(`Unknown command: ${cmd}`, 'c');
      outputLine('Try: help', 'p');
    }

    function focusInput(){
      if(termInputLine) termInputLine.style.display = 'flex';
      termInput.focus();
    }

    terminalBox.addEventListener('click', focusInput);

    termInput.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        const val = termInput.value;
        termInput.value = '';
        runCommand(val);
      }
      if(e.key === 'Escape'){
        e.preventDefault();
        termInput.blur();
      }
    });
  })();

  /* ---------- Contact form (client-side mailto) ---------- */
  (function contactForm(){
    const form = document.getElementById('contactForm');
    if(!form) return;

    const errName = document.getElementById('err-name');
    const errEmail = document.getElementById('err-email');
    const errMsg = document.getElementById('err-message');
    const name = document.getElementById('cf-name');
    const email = document.getElementById('cf-email');
    const msg = document.getElementById('cf-message');

    function setErr(el, show){
      if(!el) return;
      el.classList.toggle('show', Boolean(show));
    }

    function validateEmail(v){
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
    }

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const n = name?.value?.trim() || '';
      const em = email?.value?.trim() || '';
      const m = msg?.value?.trim() || '';

      let ok = true;
      const nameOk = n.length >= 2;
      const emailOk = validateEmail(em);
      const msgOk = m.length >= 8;

      ok = nameOk && emailOk && msgOk;

      if(name){ name.classList.toggle('invalid', !nameOk); }
      if(email){ email.classList.toggle('invalid', !emailOk); }
      if(msg){ msg.classList.toggle('invalid', !msgOk); }

      setErr(errName, !nameOk);
      setErr(errEmail, !emailOk);
      setErr(errMsg, !msgOk);

      if(!ok){
        toast('Please fix the highlighted fields.');
        return;
      }

      const to = 'dyabhosamm@gmail.com';
      const subject = encodeURIComponent('Security opportunity for Hosam Dyab');
      const body = encodeURIComponent(
        `Name: ${n}\nEmail: ${em}\n\nMessage:\n${m}\n\n— Sent from portfolio contact form`
      );
      toast('Opening your email client…');
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      form.reset();
      [errName, errEmail, errMsg].forEach(el=>setErr(el,false));
      if(name) name.classList.remove('invalid');
      if(email) email.classList.remove('invalid');
      if(msg) msg.classList.remove('invalid');
    });
  })();

  /* ---------- Command palette ---------- */
  (function commandPalette(){
    const cmdPalette = document.getElementById('cmdPalette');
    const cmdInput = document.getElementById('cmdInput');
    const cmdResults = document.getElementById('cmdResults');
    const kbdModal = document.getElementById('kbdModal');

    if(!cmdPalette || !cmdInput || !cmdResults) return;

    const openActions = [
      { label:'Go to Summary', meta:'Section', keywords:'summary about', run: ()=>scrollToId('summary') },
      { label:'Go to Services', meta:'Section', keywords:'services help offer work style', run: ()=>scrollToId('services') },
      { label:'Go to Recruiter Proof', meta:'Section', keywords:'proof recruiter shortlist credibility', run: ()=>scrollToId('proof') },
      { label:'Go to Experience', meta:'Section', keywords:'experience engagement log', run: ()=>scrollToId('experience') },
      { label:'Go to Flagship', meta:'Section', keywords:'flagship work classtrack', run: ()=>scrollToId('flagship') },
      { label:'Go to Projects', meta:'Section', keywords:'projects work', run: ()=>scrollToId('projects') },
      { label:'Go to Toolkit', meta:'Section', keywords:'toolkit skills', run: ()=>scrollToId('toolkit') },
      { label:'Go to Education', meta:'Section', keywords:'education credentials', run: ()=>scrollToId('education') },
      { label:'Go to FAQ', meta:'Section', keywords:'faq questions hiring recruiter', run: ()=>scrollToId('faq') },
      { label:'Go to Contact', meta:'Section', keywords:'contact hire', run: ()=>scrollToId('contact') },
      { label:'Theme: Dark', meta:'Theme', keywords:'theme dark', run: ()=>setTheme('dark') },
      { label:'Theme: Light', meta:'Theme', keywords:'theme light', run: ()=>setTheme('light') },
      { label:'Theme: Matrix', meta:'Theme', keywords:'theme matrix', run: ()=>setTheme('matrix') },
      { label:'Keyboard Shortcuts', meta:'Help', keywords:'help shortcuts ?', run: ()=>{ if(kbdModal){ kbdModal.hidden = false; } } },
    ];

    let activeIndex = -1;
    let activeItems = [];
    let restoreFocus = null;

    function normalize(s){ return String(s || '').toLowerCase().trim(); }

    function scoreQuery(query, text){
      const q = normalize(query);
      const t = normalize(text);
      if(!q) return 1;
      if(t.includes(q)) return 1000 + q.length;
      // Simple ordered-character fuzzy matching
      let ti = 0;
      let score = 0;
      for(let qi=0; qi<q.length; qi++){
        const ch = q[qi];
        const found = t.indexOf(ch, ti);
        if(found === -1) return 0;
        score += (found === ti) ? 3 : 1;
        ti = found + 1;
      }
      return score;
    }

    function openPalette(){
      restoreFocus = document.activeElement;
      cmdPalette.hidden = false;
      cmdInput.value = '';
      cmdInput.focus();
      renderResults('');
    }

    function closePalette(){
      cmdPalette.hidden = true;
      activeIndex = -1;
      activeItems = [];
      cmdResults.innerHTML = '';
      if(restoreFocus && typeof restoreFocus.focus === 'function'){
        try{ restoreFocus.focus(); } catch(e){}
      }
    }

    function renderResults(query){
      const q = normalize(query);
      const scored = openActions
        .map(a=>{
          const text = `${a.label} ${a.meta} ${a.keywords}`;
          return { a, s: scoreQuery(q, text) };
        })
        .filter(x=>x.s > 0)
        .sort((x,y)=>y.s - x.s)
        .slice(0, 10);

      activeItems = scored.map(x=>x.a);
      cmdResults.innerHTML = '';
      activeItems.forEach((item, idx)=>{
        const row = document.createElement('div');
        row.className = 'cmd-item' + (idx === 0 ? ' active' : '');
        row.setAttribute('role','option');
        row.setAttribute('aria-selected', String(idx === 0));
        row.dataset.index = String(idx);

        const left = document.createElement('div');
        left.className = 'cmd-left';
        left.textContent = item.label;

        const meta = document.createElement('div');
        meta.className = 'cmd-meta';
        meta.textContent = item.meta || '';

        row.appendChild(left);
        row.appendChild(meta);

        row.addEventListener('click', ()=>{
          activeIndex = idx;
          item.run();
          closePalette();
        });
        cmdResults.appendChild(row);
      });

      activeIndex = activeItems.length ? 0 : -1;
    }

    function setActive(idx){
      if(!activeItems.length) return;
      activeIndex = Math.max(0, Math.min(activeItems.length - 1, idx));
      $$('.cmd-item', cmdResults).forEach((el, i)=>{
        el.classList.toggle('active', i === activeIndex);
        el.setAttribute('aria-selected', String(i === activeIndex));
      });
    }

    cmdInput.addEventListener('input', ()=>{
      renderResults(cmdInput.value);
    });

    cmdInput.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        e.preventDefault();
        closePalette();
        return;
      }
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        setActive(activeIndex + 1);
        return;
      }
      if(e.key === 'ArrowUp'){
        e.preventDefault();
        setActive(activeIndex - 1);
        return;
      }
      if(e.key === 'Enter' && activeIndex >= 0){
        e.preventDefault();
        const item = activeItems[activeIndex];
        if(item){
          item.run();
          closePalette();
        }
      }
    });

    // Close helpers (backdrops/buttons)
    document.addEventListener('click', (e)=>{
      const closeTarget = e.target && e.target.closest ? e.target.closest('[data-close-modal]') : null;
      if(!closeTarget) return;
      if(!cmdPalette.hidden) closePalette();
      if(kbdModal && !kbdModal.hidden) kbdModal.hidden = true;
    });

    // Global shortcuts
    document.addEventListener('keydown', (e)=>{
      // Don't steal keys while typing in form inputs (except for Cmd palette shortcuts)
      const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';

      if(e.ctrlKey && (e.key === 'k' || e.key === 'K')){
        e.preventDefault();
        openPalette();
        return;
      }
      if(e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey){
        if(kbdModal){ e.preventDefault(); kbdModal.hidden = false; cmdPalette.hidden = true; }
        return;
      }
      if(e.key === 'Escape'){
        if(!cmdPalette.hidden) closePalette();
        if(kbdModal && !kbdModal.hidden) kbdModal.hidden = true;
        return;
      }

      if(!isTyping && e.key === '/'){
        e.preventDefault();
        openPalette();
        return;
      }

      if(!isTyping && (e.key === 't' || e.key === 'T')){
        e.preventDefault();
        const cur = html.getAttribute('data-theme') || 'dark';
        const idx = Math.max(0, themes.indexOf(cur));
        setTheme(themes[(idx + 1) % themes.length]);
        return;
      }

      // Scrolling shortcuts (keep simple)
      if(!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey){
        if(e.key === 'j' || e.key === 'J'){
          e.preventDefault();
          window.scrollBy({ top: Math.round(window.innerHeight * 0.8), behavior: reduceMotion ? 'auto' : 'smooth' });
          return;
        }
        if(e.key === 'k' || e.key === 'K'){
          e.preventDefault();
          window.scrollBy({ top: -Math.round(window.innerHeight * 0.8), behavior: reduceMotion ? 'auto' : 'smooth' });
          return;
        }
        if(e.key === 'g' || e.key === 'G'){
          if(e.shiftKey){
            window.scrollTo({ top: document.body.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
          return;
        }
      }
    });
  })();

  /* ---------- FAQ accordion ---------- */
  (function faqAccordion(){
    const faqList = document.getElementById('faqList');
    if(!faqList) return;

    const items = $$('.faq-item', faqList);
    items.forEach(item=>{
      const btn = $('.faq-question', item);
      const answer = $('.faq-answer', item);
      if(!btn || !answer) return;

      btn.addEventListener('click', ()=>{
        const isOpen = item.classList.contains('open');
        items.forEach(other=>{
          other.classList.remove('open');
          const otherBtn = $('.faq-question', other);
          const otherAnswer = $('.faq-answer', other);
          if(otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if(otherAnswer) otherAnswer.hidden = true;
        });

        if(!isOpen){
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          answer.hidden = false;
        }
      });
    });
  })();

  /* ---------- Particle canvas ---------- */
  (function particles(){
    const canvas = document.getElementById('particleCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if(!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let nodes = [];
    let raf = 0;

    const cfg = {
      count: 46,
      linkDist: 135,
      speed: 0.35,
    };

    function hexToRgb(hex){
      const m = String(hex || '').trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if(!m) return null;
      return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) };
    }

    function themeColors(){
      const cs = getComputedStyle(document.documentElement);
      const signal = (cs.getPropertyValue('--signal') || '').trim();
      const verified = (cs.getPropertyValue('--verified') || '').trim();
      const rgbS = hexToRgb(signal);
      const rgbV = hexToRgb(verified);
      return { signal, verified, rgbS, rgbV };
    }

    function resize(){
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.max(1, window.innerWidth);
      h = Math.max(1, window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    function initNodes(){
      const { rgbS, rgbV } = themeColors();
      const seedSignal = rgbS ? `rgba(${rgbS.r},${rgbS.g},${rgbS.b},1)` : null;
      const seedVerified = rgbV ? `rgba(${rgbV.r},${rgbV.g},${rgbV.b},1)` : null;

      nodes = new Array(cfg.count).fill(0).map((_, i)=>{
        const isAccent = i % 3 === 0;
        const x = Math.random() * w;
        const y = Math.random() * h;
        const vx = (Math.random() - 0.5) * cfg.speed;
        const vy = (Math.random() - 0.5) * cfg.speed;
        return { x, y, vx, vy, t: isAccent ? 'v' : 's', r: 1.3 + Math.random() * 1.6, col: isAccent ? seedVerified : seedSignal };
      });
    }

    function draw(){
      const { signal, verified, rgbS, rgbV } = themeColors();
      const colSBase = rgbS ? `rgba(${rgbS.r},${rgbS.g},${rgbS.b},1)` : signal;
      const colVBase = rgbV ? `rgba(${rgbV.r},${rgbV.g},${rgbV.b},1)` : verified;

      ctx.clearRect(0,0,w,h);
      ctx.globalCompositeOperation = 'lighter';

      // Draw links
      for(let i=0; i<nodes.length; i++){
        for(let j=i+1; j<nodes.length; j++){
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < cfg.linkDist){
            const t = 1 - dist / cfg.linkDist;
            const alpha = t * 0.22;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = a.t === 'v' ? colVBase : colSBase;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Draw nodes
      nodes.forEach(n=>{
        const fill = n.t === 'v' ? colVBase : colSBase;
        ctx.fillStyle = fill;
        ctx.globalAlpha = 0.86;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function tick(){
      if(reduceMotion){ draw(); return; }
      for(const n of nodes){
        n.x += n.vx;
        n.y += n.vy;
        if(n.x < 0 || n.x > w) n.vx *= -1;
        if(n.y < 0 || n.y > h) n.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    function start(){
      resize();
      initNodes();
      tick();
    }

    window.__hdParticlesRepaint = ()=>{ if(!canvas) return; draw(); };

    // Resize observer
    window.addEventListener('resize', ()=>{
      resize();
      initNodes();
      draw();
    }, { passive: true });

    start();
  })();
})();
