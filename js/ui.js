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
          if(otherAnswer) otherAnswer.setAttribute('aria-hidden', 'true');
        });

        if(!isOpen){
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          answer.setAttribute('aria-hidden', 'false');
        }
      });
    });
  })();

})();
