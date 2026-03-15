
    const canvas = document.getElementById('space');
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, cx = 0, cy = 0, stars = [], dust = [];
    const STAR_COUNT = 900;
    const DUST_COUNT = 90;
    let mouse = { x: 0, y: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildField();
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function buildField() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: rand(-w, w),
        y: rand(-h, h),
        z: rand(0.2, 1),
        r: rand(0.35, 1.85),
        glow: rand(0.2, 0.95),
        hue: Math.random() < 0.12 ? 'pink' : Math.random() < 0.45 ? 'cyan' : 'white'
      }));
      dust = Array.from({ length: DUST_COUNT }, () => ({
        x: rand(0, w), y: rand(0, h), r: rand(120, 320),
        color: Math.random() < 0.5 ? '99,231,255' : Math.random() < 0.6 ? '255,96,191' : '143,124,255',
        alpha: rand(0.035, 0.09)
      }));
    }

    function drawBackground(t) {
      ctx.clearRect(0, 0, w, h);

      for (const cloud of dust) {
        const driftX = Math.sin(t * 0.00008 + cloud.x * 0.002) * 18;
        const driftY = Math.cos(t * 0.00007 + cloud.y * 0.002) * 12;
        const g = ctx.createRadialGradient(cloud.x + driftX, cloud.y + driftY, 0, cloud.x + driftX, cloud.y + driftY, cloud.r);
        g.addColorStop(0, `rgba(${cloud.color},${cloud.alpha})`);
        g.addColorStop(1, `rgba(${cloud.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cloud.x + driftX, cloud.y + driftY, cloud.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const offsetX = (mouse.x - 0.5) * 48;
      const offsetY = (mouse.y - 0.5) * 32;

      for (const s of stars) {
        const px = cx + s.x * s.z + offsetX * s.z;
        const py = cy + s.y * s.z + offsetY * s.z;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
        const alpha = 0.25 + s.glow * 0.7;
        const color = s.hue === 'cyan' ? `rgba(99,231,255,${alpha})`
                     : s.hue === 'pink' ? `rgba(255,96,191,${alpha})`
                     : `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(px, py, s.r * s.z * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      const vignette = ctx.createRadialGradient(cx, cy, Math.min(w,h)*0.15, cx, cy, Math.max(w,h)*0.7);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    }

    function animate(t) {
      drawBackground(t);
      requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
      const c = document.querySelector('.cursor');
      c.style.left = e.clientX + 'px';
      c.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button, .panel, .gallery-card, .scale-body').forEach(el => {
      el.addEventListener('mouseenter', () => document.querySelector('.cursor')?.classList.add('active'));
      el.addEventListener('mouseleave', () => document.querySelector('.cursor')?.classList.remove('active'));
    });

    const progress = document.getElementById('scroll-progress');
    const hudVelocity = document.getElementById('hudVelocity');
    const hudDistance = document.getElementById('hudDistance');
    let lastY = window.scrollY;
    let lastTime = performance.now();

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progress.style.width = pct + '%';

      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY);
      const dt = Math.max(now - lastTime, 16);
      const velocity = Math.min((dy / dt) * 8.6, 9.99);
      hudVelocity.textContent = velocity.toFixed(2) + 'c';
      hudDistance.textContent = Math.round((pct / 100) * 46000).toLocaleString() + ' M LY';
      lastY = window.scrollY;
      lastTime = now;
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.14 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const counters = document.querySelectorAll('[data-count]');
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const target = parseFloat(el.dataset.count);
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = target >= 0 ? target * eased : target * eased;
          const needsDecimal = String(target).includes('.');
          el.textContent = needsDecimal ? value.toFixed(1) : Math.round(value);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = String(target);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.45 });
    counters.forEach(c => counterObs.observe(c));

    const scaleBodies = document.querySelectorAll('.scale-body');
    const scaleName = document.getElementById('scaleName');
    const scaleText = document.getElementById('scaleText');
    const scaleRatio = document.getElementById('scaleRatio');
    const scaleType = document.getElementById('scaleType');
    const scaleTakeaway = document.getElementById('scaleTakeaway');

    scaleBodies.forEach(body => {
      const update = () => {
        scaleName.textContent = body.dataset.name;
        scaleText.textContent = body.dataset.text;
        scaleRatio.textContent = body.dataset.ratio;
        scaleType.textContent = body.dataset.type;
        scaleTakeaway.textContent = body.dataset.takeaway;
      };
      body.addEventListener('mouseenter', update);
      body.addEventListener('focus', update);
      body.addEventListener('click', update);
    });

    function updateClock() {
      const now = new Date();
      document.getElementById('clock').textContent = 'UTC Sync // ' + now.toUTCString().slice(17, 25);
    }
    updateClock();
    setInterval(updateClock, 1000);
  