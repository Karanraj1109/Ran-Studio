/* ==========================================================================
   RAN STUDIO — FX LAYER
   Dimuat setelah script.js. Tidak mengubah logika cart/checkout/WhatsApp;
   hanya menambah animasi di atasnya. Setiap modul dibungkus guard supaya
   satu error tidak menjatuhkan yang lain.
   ========================================================================== */
(() => {
    'use strict';

    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
    const safe = (name, fn) => { try { fn(); } catch (err) { console.warn('[fx]', name, err); } };

    root.classList.add('fx');

    /* ------------------------------------------------------------------
       1. LOADER — wireframe dibangun, persen naik, tirai membelah
       ------------------------------------------------------------------ */
    let readyFired = false;
    const fireReady = () => {
        if (readyFired) return;
        readyFired = true;
        root.classList.add('is-ready');
        window.dispatchEvent(new CustomEvent('rs:ready'));
    };
    // Failsafe: apa pun yang terjadi, hero tidak boleh tertahan
    setTimeout(fireReady, 6500);

    safe('loader', () => {
        const loader = $('#loader');
        if (!loader) { fireReady(); return; }

        let seen = false;
        try { seen = sessionStorage.getItem('rs-loaded') === '1'; } catch (_) {}
        const duration = (reduce || seen) ? 250 : 1900;

        const pct = $('#ld-pct');
        const start = performance.now();
        let pageLoaded = document.readyState === 'complete';
        window.addEventListener('load', () => { pageLoaded = true; }, { once: true });

        loader.classList.add('is-building');

        const finish = () => {
            loader.classList.add('is-done');
            try { sessionStorage.setItem('rs-loaded', '1'); } catch (_) {}
            setTimeout(fireReady, reduce ? 0 : 520);
            setTimeout(() => loader.classList.add('is-gone'), 1300);
        };

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = t * t * (3 - 2 * t); // smoothstep, selaras dengan animasi gambar
            const shown = pageLoaded ? eased : Math.min(eased, 0.92);
            if (pct) pct.textContent = String(Math.round(shown * 100));
            if ((t >= 1 && pageLoaded) || now - start > 5000) {
                if (pct) pct.textContent = '100';
                return finish();
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

    /* ------------------------------------------------------------------
       2. HEADLINE — masuk per kata (span gradient diperlakukan satu unit)
       ------------------------------------------------------------------ */
    safe('headline', () => {
        const h1 = $('.hero-section h1');
        if (!h1 || reduce) return;
        let i = 0;
        const label = h1.textContent.replace(/\s+/g, ' ').trim();
        h1.setAttribute('aria-label', label);

        const mk = (child) => {
            const outer = document.createElement('span');
            outer.className = 'w';
            outer.setAttribute('aria-hidden', 'true');
            const inner = document.createElement('span');
            inner.className = 'w-i';
            inner.style.setProperty('--i', String(i++));
            inner.appendChild(child);
            outer.appendChild(inner);
            return outer;
        };

        Array.from(h1.childNodes).forEach((node) => {
            if (node.nodeType === 3) {
                const frag = document.createDocumentFragment();
                node.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
                    else frag.appendChild(mk(document.createTextNode(part)));
                });
                node.replaceWith(frag);
            } else if (node.nodeType === 1) {
                const marker = document.createComment('');
                node.replaceWith(marker);
                marker.replaceWith(mk(node));
            }
        });
    });

    /* ------------------------------------------------------------------
       3. HERO CANVAS — grid blueprint: titik menyingkir dari kursor,
          sapuan diagonal sekali saat halaman siap, riak saat klik
       ------------------------------------------------------------------ */
    safe('heroGrid', () => {
        const hero = $('#home');
        const cv = $('#hero-canvas');
        if (!hero || !cv) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;

        const GAP = window.innerWidth < 700 ? 30 : 36;
        const RADIUS = 170;
        const BLUE = [30, 164, 255];
        const PINK = [242, 63, 168];
        let w = 0, h = 0, dpr = 1, ox = 0, oy = 0, cols = 0, rows = 0;
        let visible = true, raf = 0;
        let sweepStart = -1;
        const pointer = { x: -999, y: -999, active: false };
        const ripples = [];

        const resize = () => {
            const r = hero.getBoundingClientRect();
            dpr = Math.min(2, window.devicePixelRatio || 1);
            w = r.width; h = r.height;
            cv.width = Math.round(w * dpr);
            cv.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cols = Math.ceil(w / GAP) + 1;
            rows = Math.ceil(h / GAP) + 1;
            ox = (w - (cols - 1) * GAP) / 2;
            oy = 8;
            kick();
        };

        const baseDots = [];
        const draw = (now) => {
            raf = 0;
            ctx.clearRect(0, 0, w, h);
            const light = root.dataset.theme === 'light';
            const base = light ? '15,23,42' : '255,255,255';
            const baseAlpha = light ? 0.16 : 0.12;
            const sweepT = sweepStart < 0 ? 9 : (now - sweepStart) / 2400;
            const glowing = [];

            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const bx = ox + c * GAP;
                    const by = oy + r * GAP;
                    let dx = 0, dy = 0, glow = 0;

                    if (pointer.active) {
                        const ddx = bx - pointer.x, ddy = by - pointer.y;
                        const dist = Math.hypot(ddx, ddy) || 1;
                        if (dist < RADIUS) {
                            const f = 1 - dist / RADIUS;
                            const push = f * f * 22;
                            dx = (ddx / dist) * push;
                            dy = (ddy / dist) * push;
                            glow = f;
                        }
                    }

                    for (let k = 0; k < ripples.length; k++) {
                        const rp = ripples[k];
                        const age = (now - rp.t0) / 1000;
                        if (age > 1.6) continue;
                        const ddx = bx - rp.x, ddy = by - rp.y;
                        const dist = Math.hypot(ddx, ddy) || 1;
                        const delta = Math.abs(dist - age * 460);
                        if (delta < 60) {
                            const f = (1 - delta / 60) * (1 - age / 1.6);
                            dx += (ddx / dist) * f * 14;
                            dy += (ddy / dist) * f * 14;
                            glow = Math.max(glow, f);
                        }
                    }

                    if (sweepT < 1.3) {
                        const diag = (bx / w) * 0.6 + (by / h) * 0.4;
                        const sd = Math.abs(diag - sweepT);
                        if (sd < 0.12) glow = Math.max(glow, (1 - sd / 0.12) * 0.85);
                    }

                    if (glow > 0.03) glowing.push([bx + dx, by + dy, glow, bx / w]);
                    else baseDots.push(bx, by);
                }
            }

            // titik dasar: satu path, satu fill
            ctx.fillStyle = `rgba(${base},${baseAlpha})`;
            ctx.beginPath();
            for (let i = 0; i < baseDots.length; i += 2) ctx.rect(baseDots[i] - 1, baseDots[i + 1] - 1, 2, 2);
            ctx.fill();
            baseDots.length = 0;

            for (const [x, y, g, tx] of glowing) {
                const rr = Math.round(BLUE[0] + (PINK[0] - BLUE[0]) * tx);
                const gg = Math.round(BLUE[1] + (PINK[1] - BLUE[1]) * tx);
                const bb = Math.round(BLUE[2] + (PINK[2] - BLUE[2]) * tx);
                ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.3 + g * 0.7})`;
                ctx.beginPath();
                ctx.arc(x, y, 1 + g * 2.2, 0, Math.PI * 2);
                ctx.fill();
            }

            while (ripples.length && now - ripples[0].t0 > 1700) ripples.shift();
            if (visible && (pointer.active || ripples.length || sweepT < 1.3)) raf = requestAnimationFrame(draw);
        };

        function kick() {
            if (!raf && visible) raf = requestAnimationFrame(draw);
        }

        resize();
        if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
        else window.addEventListener('resize', resize, { passive: true });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting;
                if (visible) kick();
            }).observe(hero);
        }

        if (reduce) return; // grid statis saja

        window.addEventListener('rs:ready', () => { sweepStart = performance.now(); kick(); }, { once: true });

        const local = (e) => {
            const r = hero.getBoundingClientRect();
            return [e.clientX - r.left, e.clientY - r.top];
        };
        hero.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            [pointer.x, pointer.y] = local(e);
            pointer.active = true;
            kick();
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { pointer.active = false; kick(); }, { passive: true });
        hero.addEventListener('pointerdown', (e) => {
            const [x, y] = local(e);
            ripples.push({ x, y, t0: performance.now() });
            kick();
        }, { passive: true });
    });

    /* ------------------------------------------------------------------
       4. PARALLAX STAGE HERO
       ------------------------------------------------------------------ */
    safe('stageParallax', () => {
        const stage = $('.hero-stage');
        if (!stage || reduce || !finePointer) return;
        let raf = 0, nx = 0, ny = 0;
        const paint = () => { raf = 0; stage.style.setProperty('--px', nx.toFixed(3)); stage.style.setProperty('--py', ny.toFixed(3)); };
        stage.addEventListener('pointermove', (e) => {
            const r = stage.getBoundingClientRect();
            nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
            if (!raf) raf = requestAnimationFrame(paint);
        }, { passive: true });
        stage.addEventListener('pointerleave', () => { nx = 0; ny = 0; if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    });

    /* ------------------------------------------------------------------
       5. KARTU — spotlight (semua kartu) + tilt 3D (kartu portofolio)
       ------------------------------------------------------------------ */
    safe('cards', () => {
        if (!finePointer) return;
        const spotSel = '.portfolio-card, .pricing-card, .why-card, .service-card';
        $$(spotSel).forEach((el) => el.classList.add('fx-spot'));
        if (!reduce) $$('.portfolio-card').forEach((el) => el.classList.add('fx-tilt'));

        let active = null, raf = 0, ev = null;
        const paint = () => {
            raf = 0;
            if (!active || !ev) return;
            const r = active.getBoundingClientRect();
            const x = ev.clientX - r.left, y = ev.clientY - r.top;
            active.style.setProperty('--mx', `${x}px`);
            active.style.setProperty('--my', `${y}px`);
            if (active.classList.contains('fx-tilt')) {
                active.style.setProperty('--ry', `${((x / r.width) - 0.5) * 9}deg`);
                active.style.setProperty('--rx', `${((y / r.height) - 0.5) * -9}deg`);
            }
        };
        const reset = (el) => {
            el.classList.remove('is-tilting');
            el.style.removeProperty('--rx');
            el.style.removeProperty('--ry');
        };
        document.addEventListener('pointermove', (e) => {
            const el = e.target.closest ? e.target.closest(spotSel) : null;
            if (el !== active) {
                if (active) reset(active);
                active = el;
                if (active && active.classList.contains('fx-tilt')) active.classList.add('is-tilting');
            }
            if (!active) return;
            ev = e;
            if (!raf) raf = requestAnimationFrame(paint);
        }, { passive: true });
        document.addEventListener('pointerleave', () => { if (active) { reset(active); active = null; } }, { passive: true });
    });

    /* ------------------------------------------------------------------
       6. TOMBOL MAGNETIK (pakai properti `translate`, tidak bentrok
          dengan transform hover bawaan)
       ------------------------------------------------------------------ */
    safe('magnetic', () => {
        if (!finePointer || reduce) return;
        $$('.hero-buttons .btn, .pricing-card .btn, .bottom-cta-section .btn, .cta-btn').forEach((btn) => {
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
                const y = (e.clientY - (r.top + r.height / 2)) * 0.32;
                btn.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
            }, { passive: true });
            btn.addEventListener('pointerleave', () => { btn.style.translate = ''; }, { passive: true });
        });
    });

    /* ------------------------------------------------------------------
       7. KURSOR — cincin lembut yang tertinggal di belakang
       ------------------------------------------------------------------ */
    safe('cursor', () => {
        if (!finePointer || reduce) return;
        const ring = document.createElement('div');
        ring.className = 'fx-cursor';
        ring.setAttribute('aria-hidden', 'true');
        document.body.appendChild(ring);

        let tx = -100, ty = -100, x = -100, y = -100, raf = 0;
        const loop = () => {
            x += (tx - x) * 0.2;
            y += (ty - y) * 0.2;
            ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            raf = (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) ? requestAnimationFrame(loop) : 0;
        };
        window.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            tx = e.clientX; ty = e.clientY;
            ring.classList.add('is-visible');
            const t = e.target.closest ? e.target : null;
            const isLink = t && t.closest('a, button, [role="button"], input, select, textarea, label, summary');
            const isCard = !isLink && t && t.closest('.portfolio-card');
            ring.classList.toggle('is-link', Boolean(isLink));
            ring.classList.toggle('is-card', Boolean(isCard));
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });
        document.addEventListener('pointerleave', () => ring.classList.remove('is-visible'), { passive: true });
    });

    /* ------------------------------------------------------------------
       8. TECH STACK — marquee dua arah (dilewati jika reduce-motion)
       ------------------------------------------------------------------ */
    safe('marquee', () => {
        const box = $('.tech-badges');
        if (!box || reduce) return;
        const badges = $$('.tech-badge', box);
        if (badges.length < 4) return;
        const mid = Math.ceil(badges.length / 2);
        const groups = [badges.slice(0, mid), badges.slice(mid)];
        box.textContent = '';
        box.classList.add('fx-marquee');
        groups.forEach((group, gi) => {
            const row = document.createElement('div');
            row.className = 'fx-row' + (gi ? ' is-rev' : '');
            // dua salinan; salinan kedua disembunyikan dari screen reader
            [0, 1].forEach((copy) => {
                for (let n = 0; n < 4; n++) { // diulang agar cukup panjang di layar lebar (4K sekalipun)
                    group.forEach((b) => {
                        const c = b.cloneNode(true);
                        if (copy || n) c.setAttribute('aria-hidden', 'true');
                        row.appendChild(c);
                    });
                }
            });
            box.appendChild(row);
        });
    });

    /* ------------------------------------------------------------------
       9. KERANJANG — burst konfirmasi, panel pop, pill "paket dipilih"
       ------------------------------------------------------------------ */
    safe('cart', () => {
        const checkout = $('#checkout');
        const cartTotal = $('#cart-total-val');
        const palette = ['#1EA4FF', '#3A5BFF', '#6F3DFF', '#F23FA8', '#44d8ff'];

        let layer = null;
        const getLayer = () => layer || (layer = Object.assign(document.createElement('div'), { className: 'fx-layer' }), layer.setAttribute('aria-hidden', 'true'), document.body.appendChild(layer), layer);

        const burst = (btn) => {
            if (reduce) return;
            const r = btn.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const L = getLayer();
            for (let i = 0; i < 16; i++) {
                const bit = document.createElement('i');
                bit.className = 'fx-bit';
                bit.style.background = palette[i % palette.length];
                L.appendChild(bit);
                const ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
                const dist = 46 + Math.random() * 56;
                const rot = (Math.random() - 0.5) * 300;
                const anim = bit.animate([
                    { transform: `translate(${cx}px, ${cy}px) rotate(0deg) scale(1)`, opacity: 1 },
                    { transform: `translate(${cx + Math.cos(ang) * dist}px, ${cy + Math.sin(ang) * dist}px) rotate(${rot}deg) scale(.3)`, opacity: 0 }
                ], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
                anim.onfinish = () => bit.remove();
            }
        };

        // pill keranjang
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'fx-cart';
        pill.setAttribute('aria-label', 'Lanjut ke checkout');
        pill.innerHTML = '<span class="fx-cart-name"></span><span class="fx-cart-price"></span><span class="fx-cart-go">Checkout</span>';
        document.body.appendChild(pill);
        const pillName = $('.fx-cart-name', pill);
        const pillPrice = $('.fx-cart-price', pill);

        let checkoutInView = false;
        let hasCart = false;

        const readCart = () => {
            try {
                const raw = localStorage.getItem('ran-studio-cart');
                return raw ? JSON.parse(raw) : null;
            } catch (_) { return null; }
        };
        const renderPill = () => {
            const agencyVisible = !$('#panel-agency')?.classList.contains('hidden-panel');
            pill.classList.toggle('is-on', hasCart && !checkoutInView && agencyVisible);
        };
        const sync = (bump) => {
            const c = readCart();
            hasCart = Boolean(c && c.name);
            if (hasCart) {
                pillName.textContent = c.name;
                pillPrice.textContent = cartTotal ? cartTotal.textContent : '';
                if (bump && !reduce) { pill.classList.remove('is-bump'); void pill.offsetWidth; pill.classList.add('is-bump'); }
            }
            renderPill();
        };

        pill.addEventListener('click', () => checkout?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

        if (checkout && 'IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => { checkoutInView = entry.isIntersecting; renderPill(); }, { threshold: 0.15 }).observe(checkout);
        }

        $$('.add-to-cart-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                // listener ini berjalan setelah handler script.js, jadi cart sudah tersimpan
                const label = btn.textContent;
                burst(btn);
                btn.classList.add('is-picked');
                btn.textContent = 'Dipilih';
                setTimeout(() => { btn.textContent = label; btn.classList.remove('is-picked'); }, 1500);

                const content = $('#cart-content');
                if (content) {
                    content.classList.remove('fx-pop');
                    void content.offsetWidth;
                    content.classList.add('fx-pop');
                    content.addEventListener('animationend', () => content.classList.remove('fx-pop'), { once: true });
                }
                setTimeout(() => sync(true), 0);
            });
        });

        $('#clear-cart-btn')?.addEventListener('click', () => setTimeout(() => sync(false), 0));
        $$('.checkout-domain-radio').forEach((r) => r.addEventListener('change', () => setTimeout(() => sync(false), 0)));
        $$('.segment-btn').forEach((b) => b.addEventListener('click', () => setTimeout(renderPill, 0)));
        sync(false);
    });

    /* ------------------------------------------------------------------
       10. GANTI MODE — tirai melingkar dari tombol yang ditekan.
           Memakai View Transitions API; browser lama jatuh ke perilaku asli.
           Tidak pernah memanggil scrollTo.
       ------------------------------------------------------------------ */
    safe('modeWipe', () => {
        const control = $('#segmented-mode');
        if (!control || reduce || typeof document.startViewTransition !== 'function') return;
        let passing = false;
        control.addEventListener('click', (e) => {
            if (passing) return;
            const btn = e.target.closest('.segment-btn');
            if (!btn || btn.classList.contains('active')) return;
            e.stopImmediatePropagation();
            e.preventDefault();

            const r = btn.getBoundingClientRect();
            const x = r.left + r.width / 2, y = r.top + r.height / 2;
            const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

            const vt = document.startViewTransition(() => {
                passing = true;
                btn.click();
                passing = false;
            });
            vt.ready.then(() => {
                root.animate(
                    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
                    { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
                );
            }).catch(() => {});
        }, true);
    });
})();
