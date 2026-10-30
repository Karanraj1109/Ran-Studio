/* ==========================================================================
   SIGNATURE — hero "kode → tampilan" + rel blueprint
   Berdiri sendiri; tidak menyentuh script.js.
   ========================================================================== */
(() => {
    'use strict';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const safe = (name, fn) => { try { fn(); } catch (err) { console.warn('[signature]', name, err); } };

    /* ------------------------------------------------------------------
       1. HERO — editor mengetik kode, garis scan meng-compile halaman
       ------------------------------------------------------------------ */
    safe('heroBuild', () => {
        const browser = document.querySelector('.hero-browser');
        const content = browser && browser.querySelector('.browser-content');
        if (!content || reduce) return; // reduce-motion: langsung tampilkan halaman

        // [kelas, teks] per segmen
        const LINES = [
            [['t', '<section '], ['a', 'class'], ['p', '='], ['s', '"hero"'], ['t', '>']],
            [['p', '  '], ['t', '<h1>'], ['x', 'Make your brand']],
            [['p', '    '], ['t', '<em>'], ['x', 'impossible to ignore.'], ['t', '</em></h1>']],
            [['p', '  '], ['t', '<a '], ['a', 'class'], ['p', '='], ['s', '"cta"'], ['t', '>'], ['x', 'Explore work'], ['t', '</a>']],
            [['t', '</section>']],
            [],
            [['t', '.hero '], ['p', '{ '], ['a', 'display'], ['p', ': '], ['s', 'grid'], ['p', '; '], ['a', 'gap'], ['p', ': '], ['s', '28px'], ['p', '; }']],
            [['t', '.cta  '], ['p', '{ '], ['a', 'background'], ['p', ': '], ['s', 'var(--gradient)'], ['p', '; }']],
            [],
            [['m', '$ '], ['x', 'build --prod']],
            [['k', '✓ 3 file · 0,8 detik · siap online']]
        ];

        const layer = document.createElement('div');
        layer.className = 'hx-code';
        layer.setAttribute('aria-hidden', 'true');
        const scan = document.createElement('div');
        scan.className = 'hx-scan';
        scan.setAttribute('aria-hidden', 'true');

        const chars = [];
        LINES.forEach((segs) => {
            const ln = document.createElement('span');
            ln.className = 'hx-ln';
            segs.forEach(([cls, text]) => {
                const seg = document.createElement('span');
                seg.className = 'hx-' + cls;
                for (const ch of text) {
                    const c = document.createElement('span');
                    c.className = 'hx-c';
                    c.textContent = ch;
                    seg.appendChild(c);
                    chars.push(c);
                }
                ln.appendChild(seg);
            });
            layer.appendChild(ln);
        });
        content.appendChild(layer);
        content.appendChild(scan);

        // tombol ulangi di bar browser
        const actions = browser.querySelector('.browser-top-actions');
        const replay = document.createElement('button');
        replay.type = 'button';
        replay.className = 'hx-replay';
        replay.textContent = 'Ulangi';
        replay.setAttribute('aria-label', 'Putar ulang animasi build');
        if (actions) { actions.textContent = ''; actions.appendChild(replay); }

        let timer = 0, running = false, played = false;

        const reveal = () => {
            const h = content.clientHeight;
            const dur = 950, ease = 'cubic-bezier(.65,0,.35,1)';
            const a = layer.animate(
                [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }],
                { duration: dur, easing: ease, fill: 'forwards' }
            );
            scan.animate(
                [{ transform: 'translateY(0)', opacity: 1 }, { transform: `translateY(${h}px)`, opacity: 1, offset: .92 }, { transform: `translateY(${h}px)`, opacity: 0 }],
                { duration: dur, easing: ease, fill: 'forwards' }
            );
            a.onfinish = () => { layer.classList.add('is-off'); running = false; };
        };

        const type = () => {
            if (running) return;
            running = true;
            played = true;
            clearTimeout(timer);
            layer.getAnimations().forEach((x) => x.cancel());
            scan.getAnimations().forEach((x) => x.cancel());
            layer.classList.remove('is-off');
            chars.forEach((c) => c.classList.remove('on', 'cur'));

            let i = 0;
            const step = () => {
                const n = Math.min(chars.length, i + 2);
                for (; i < n; i++) {
                    chars[i].classList.add('on');
                    if (i > 0) chars[i - 1].classList.remove('cur');
                    chars[i].classList.add('cur');
                }
                if (i < chars.length) timer = setTimeout(step, 17);
                else timer = setTimeout(() => { chars[chars.length - 1].classList.remove('cur'); reveal(); }, 650);
            };
            step();
        };

        replay.addEventListener('click', type);

        const start = () => { if (!played) setTimeout(type, 350); };
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
            }, { threshold: 0.5 });
            io.observe(browser);
        } else {
            start();
        }
    });

    /* ------------------------------------------------------------------
       2. REL BLUEPRINT — progres scroll, satu titik per bagian
       ------------------------------------------------------------------ */
    safe('rail', () => {
        const defs = [['home', 'Awal'], ['builder', 'Rakit'], ['portfolio', 'Karya'], ['services', 'Layanan'], ['pricing', 'Harga'], ['faq', 'FAQ'], ['contact', 'Kontak']];
        const items = defs.map(([id, label]) => ({ id, label, el: document.getElementById(id) })).filter((d) => d.el);
        if (items.length < 4) return;

        const nav = document.createElement('nav');
        nav.className = 'rail';
        nav.setAttribute('aria-label', 'Navigasi bagian halaman');
        nav.innerHTML = '<div class="rail-track"><div class="rail-fill"></div></div><ul></ul>';
        const ul = nav.querySelector('ul');
        const fill = nav.querySelector('.rail-fill');
        const lis = items.map((it) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + it.id;
            a.setAttribute('aria-label', it.label);
            a.innerHTML = '<span class="rail-dot"></span><span class="rail-label"></span>';
            a.querySelector('.rail-label').textContent = it.label;
            li.appendChild(a);
            ul.appendChild(li);
            return li;
        });
        document.body.appendChild(nav);

        const panel = document.getElementById('panel-agency');
        let raf = 0;
        const update = () => {
            raf = 0;
            const y = window.scrollY || 0;
            const vh = window.innerHeight;
            const hidden = panel && panel.classList.contains('hidden-panel');
            nav.classList.toggle('is-on', !hidden && y > 240);
            if (hidden) return;

            const tops = items.map((it) => it.el.getBoundingClientRect().top + y);
            const probe = y + vh * 0.35;
            let idx = 0;
            for (let i = 0; i < tops.length; i++) if (tops[i] <= probe) idx = i;
            const next = tops[idx + 1];
            const frac = next ? Math.min(1, Math.max(0, (probe - tops[idx]) / (next - tops[idx]))) : 1;
            const progress = tops.length > 1 ? (idx + frac) / (tops.length - 1) : 0;
            fill.style.transform = `scaleY(${Math.min(1, progress).toFixed(4)})`;
            lis.forEach((li, i) => {
                li.classList.toggle('is-done', i < idx);
                li.classList.toggle('is-active', i === idx);
            });
        };
        const req = () => { if (!raf) raf = requestAnimationFrame(update); };
        window.addEventListener('scroll', req, { passive: true });
        window.addEventListener('resize', req, { passive: true });
        document.querySelectorAll('.segment-btn').forEach((b) => b.addEventListener('click', () => setTimeout(req, 0)));
        update();
    });
})();
