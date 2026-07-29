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
