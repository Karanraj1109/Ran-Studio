/* ==========================================================================
   RAKIT WEBSITEMU
   Tidak mengubah script.js. Tombol "Pesan konsep ini" memanggil tombol
   .add-to-cart-btn yang sudah ada, jadi alur keranjang → checkout → WhatsApp
   tetap satu jalur yang sama.
   ========================================================================== */
(() => {
    'use strict';

    const section = document.getElementById('builder');
    const pv = document.getElementById('bd-preview');
    if (!section || !pv) return;

    const $ = (s, c = section) => c.querySelector(s);
    const $$ = (s, c = section) => Array.from(c.querySelectorAll(s));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const COPY = {
        kuliner: {
            brand: 'Dapur Nusa', url: 'dapurnusa.com', cta: 'Pesan sekarang',
            title: 'Rasa rumahan, diantar ke pintumu',
            sub: 'Masakan segar setiap hari, dibuat dari bahan pilihan.',
            cat: 'Menu favorit', book: 'Pesan untuk acara', gal: 'Dari dapur kami',
            map: 'Jl. Merdeka No. 12, Medan',
            items: [['Nasi Box Komplit', 'Rp35.000'], ['Kue Lapis Legit', 'Rp85.000'], ['Sambal Botol', 'Rp25.000']]
        },
        fashion: {
            brand: 'Rona Atelier', url: 'ronaatelier.com', cta: 'Belanja sekarang',
            title: 'Potongan yang pas, tampil lebih percaya diri',
            sub: 'Koleksi terbatas dengan bahan nyaman untuk keseharian.',
            cat: 'Koleksi terbaru', book: 'Jadwalkan fitting', gal: 'Lookbook',
            map: 'Butik kami di Medan Petisah',
            items: [['Kemeja Linen', 'Rp249.000'], ['Rok Plisket', 'Rp189.000'], ['Tote Canvas', 'Rp129.000']]
        },
        jasa: {
            brand: 'Cahaya Studio', url: 'cahayastudio.id', cta: 'Booking sesi',
            title: 'Foto yang bercerita untuk brand dan keluargamu',
            sub: 'Sesi foto santai dengan hasil yang siap pakai.',
            cat: 'Paket foto', book: 'Booking jadwal', gal: 'Hasil karya',
            map: 'Studio di Jl. Gatot Subroto',
            items: [['Paket Produk', 'Rp450.000'], ['Paket Keluarga', 'Rp750.000'], ['Paket Wedding', 'Rp3.500.000']]
        }
    };

    const FEAT_LABEL = { wa: 'tombol WhatsApp', katalog: 'katalog produk', booking: 'form pemesanan', galeri: 'galeri foto', peta: 'peta lokasi' };
    const PACKAGES = [
        { id: 'landing-basic', max: 1 },
        { id: 'landing-pro', max: 3 },
        { id: 'landing-premium', max: 5 }
    ];

    const state = {
        niche: 'kuliner',
        style: 'bersih',
        color: '#1EA4FF',
        colorName: 'Biru',
        feats: new Set(['wa', 'katalog'])
    };

    const site = $('#bd-site');
    const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

    /* ---------- teks per jenis usaha ---------- */
    const applyCopy = (animate) => {
        const c = COPY[state.niche];
        const map = {
            brand: c.brand, cta: c.cta, title: c.title, sub: c.sub, cat: c.cat, book: c.book, gal: c.gal, map: c.map,
            item1: c.items[0][0], price1: c.items[0][1],
            item2: c.items[1][0], price2: c.items[1][1],
            item3: c.items[2][0], price3: c.items[2][1]
        };
        $$('[data-t]', pv).forEach((el, i) => {
            const next = map[el.dataset.t];
            if (next === undefined || el.textContent === next) return;
            el.textContent = next;
            if (animate && !reduce && el.animate) {
                el.animate(
                    [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
                    { duration: 450, delay: Math.min(i * 18, 260), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
                );
            }
        });
        const url = $('#bd-url');
        if (url) url.textContent = c.url;
        pv.dataset.niche = state.niche;
    };

    /* ---------- gelombang warna ---------- */
    const wave = document.createElement('div');
    wave.className = 'bd-wave';
    wave.setAttribute('aria-hidden', 'true');
    pv.appendChild(wave);
    const pulse = (x = 0.5, y = 0.2) => {
        if (reduce || !wave.animate) return;
        wave.animate(
            [
                { clipPath: `circle(0% at ${x * 100}% ${y * 100}%)`, opacity: 0.28 },
                { clipPath: `circle(150% at ${x * 100}% ${y * 100}%)`, opacity: 0 }
            ],
            { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)' }
        );
    };

    /* ---------- fitur ---------- */
    const showFeat = (key, on, isUser) => {
        const el = key === 'wa' ? $('.bd-wa', pv) : $(`[data-block="${key}"]`, pv);
        if (!el) return;
        el.classList.toggle('is-on', on);
        if (on && key !== 'wa') {
            el.classList.add('is-new');
            setTimeout(() => el.classList.remove('is-new'), 1000);
            if (isUser && site) {
                // scroll di dalam kontainer pratinjau saja (bukan halaman)
                setTimeout(() => site.scrollTo({ top: Math.max(0, el.offsetTop - 70), behavior: reduce ? 'auto' : 'smooth' }), 120);
            }
        }
    };

    /* ---------- ringkasan & paket ---------- */
    const packageButton = (id) => document.querySelector(`.add-to-cart-btn[data-id="${id}"]`);
    const currentPackage = () => {
        const n = state.feats.size;
        const pick = PACKAGES.find((p) => n <= p.max) || PACKAGES[PACKAGES.length - 1];
        const btn = packageButton(pick.id);
        return {
            id: pick.id,
            name: btn ? btn.dataset.name : pick.id,
            price: btn ? Number(btn.dataset.price) : 0,
            btn
        };
    };
    const renderSummary = (bump) => {
        const p = currentPackage();
        const n = state.feats.size;
        $('#bd-count').textContent = n === 0 ? 'Belum ada fitur dipilih' : `${n} fitur dipilih`;
        $('#bd-pkg').textContent = p.name;
        $('#bd-price').textContent = p.price ? `mulai ${rupiah(p.price)}` : 'hubungi kami';
        if (bump && !reduce) {
            const box = $('.bd-sum-text');
            box.classList.remove('is-bump');
            void box.offsetWidth;
            box.classList.add('is-bump');
        }
    };

    /* ---------- pilihan tunggal (radiogroup) ---------- */
    const setChecked = (group, btn) => {
        $$('[role="radio"]', group).forEach((b) => {
            const on = b === btn;
            b.setAttribute('aria-checked', String(on));
            b.tabIndex = on ? 0 : -1;
        });
    };

    $$('[role="radiogroup"]').forEach((group) => {
        const name = group.dataset.group;
        const choose = (btn, focus) => {
            setChecked(group, btn);
            if (focus) btn.focus();
            if (name === 'niche') { state.niche = btn.dataset.value; applyCopy(true); }
            if (name === 'style') { state.style = btn.dataset.value; pv.dataset.style = state.style; pulse(0.5, 0.25); }
            if (name === 'color') {
                state.color = btn.dataset.value;
                state.colorName = btn.dataset.name || '';
                pv.style.setProperty('--a', state.color);
                pulse(0.5, 0.25);
            }
        };
        group.addEventListener('click', (e) => {
            const btn = e.target.closest('[role="radio"]');
            if (btn) choose(btn, false);
        });
        group.addEventListener('keydown', (e) => {
            const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
            if (!(e.key in keys)) return;
            e.preventDefault();
            const all = $$('[role="radio"]', group);
            const i = all.findIndex((b) => b.getAttribute('aria-checked') === 'true');
            choose(all[(i + keys[e.key] + all.length) % all.length], true);
        });
    });

    /* ---------- fitur (toggle) ---------- */
    $$('.bd-feat').forEach((btn) => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.feat;
            const on = !state.feats.has(key);
            if (on) state.feats.add(key); else state.feats.delete(key);
            btn.setAttribute('aria-pressed', String(on));
            showFeat(key, on, true);
            renderSummary(true);
        });
    });

    /* ---------- pesan konsep ini → keranjang ---------- */
    $('#bd-order').addEventListener('click', () => {
        const p = currentPackage();
        const feats = [...state.feats].map((k) => FEAT_LABEL[k]).join(', ') || 'belum ada fitur tambahan';
        const text = `Konsep dari "Rakit Websitemu": usaha ${state.niche === 'jasa' ? 'jasa foto' : state.niche}, gaya ${state.style}, warna ${state.colorName.toLowerCase()}, fitur: ${feats}.`;

        if (p.btn) p.btn.click(); // memakai handler keranjang yang sudah ada
        else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            const desc = document.getElementById('checkout-desc');
            if (desc && (!desc.value.trim() || desc.dataset.bdAuto === '1')) {
                desc.value = text;
                desc.dataset.bdAuto = '1';
                desc.addEventListener('input', () => { desc.dataset.bdAuto = '0'; }, { once: true });
            }
            const type = document.getElementById('checkout-type');
            if (type && !type.value) {
                const opt = Array.from(type.options).find((o) => /landing/i.test(o.textContent));
                if (opt) type.value = opt.value || opt.textContent;
            }
        }, 60);
    });

    /* ---------- init ---------- */
    applyCopy(false);
    renderSummary(false);

    const defaults = [...state.feats];
    if (reduce) {
        defaults.forEach((k) => showFeat(k, true, false));
        return;
    }

    pv.classList.add('is-pre');
    const play = () => {
        pv.classList.remove('is-pre');
        defaults.forEach((k, i) => setTimeout(() => { if (state.feats.has(k)) showFeat(k, true, false); }, 1100 + i * 650));
    };
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
        }, { threshold: 0.35 });
        io.observe(pv);
    } else {
        play();
    }
})();
