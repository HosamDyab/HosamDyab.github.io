const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Count-up animation for flagship stats
  const statEls = document.querySelectorAll('.stat .num');
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
  if('IntersectionObserver' in window){
    const statIO = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ animateCount(e.target); statIO.unobserve(e.target); } });
    }, { threshold: 0.6 });
    statEls.forEach(el=>statIO.observe(el));
  } else {
    statEls.forEach(el=>{ el.textContent = el.dataset.value + (el.dataset.suffix||''); });
  }

  // Typing effect for the role line
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

  // Terminal panel typing sequence
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

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
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

  // Progress bar + back-to-top + nav active state
  const fill = document.getElementById('progressFill');
  const toTop = document.getElementById('toTop');
  const navAnchors = document.querySelectorAll('[data-nav]');
  const sections = Array.from(document.querySelectorAll('section, header.hero')).filter(s=>s.id);

  function onScroll(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    fill.style.width = (height > 0 ? (scrolled/height)*100 : 0) + '%';
    toTop.classList.toggle('show', scrolled > 600);

    let current = sections[0] && sections[0].id;
    for(const s of sections){
      if(scrolled >= s.offsetTop - 140) current = s.id;
    }
    navAnchors.forEach(a=>{
      a.classList.toggle('active', a.getAttribute('href') === '#'+current);
    });
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  toTop.addEventListener('click', ()=>{
    window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // Robust in-page navigation: intercept every internal "#..." link and scroll
  // to it directly instead of relying on default browser hash-jump behaviour,
  // which some embedded/preview contexts mishandle as a full navigation.
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

  // Mobile menu
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
