document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. PRELOADER (OPTIMIZED TIMING)
       ========================================================================== */
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => { loader.classList.add('fade-out'); }, 700); 
        });
        // Fallback
        setTimeout(() => { loader.classList.add('fade-out'); }, 2000);
    }

    /* ==========================================================================
       2. SEGMENTED SWITCH & SWIPE (SMOOTH 60FPS)
       ========================================================================== */
    const slider = document.getElementById('app-slider');
    const segmentBtns = document.querySelectorAll('.segment-btn');
    const segmentBg = document.getElementById('segment-bg');
    const panelAgency = document.getElementById('panel-agency');
    const panelTemplates = document.getElementById('panel-templates');
    const navLinksContainer = document.getElementById('main-nav-links');
    
    let currentMode = 'agency';

    function setMode(mode) {
        if(currentMode === mode) return;
        currentMode = mode;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        segmentBtns.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.segment-btn[data-target="${mode}"]`);
        if(activeBtn) activeBtn.classList.add('active');

        // Reveal both panels for the sliding transition
        panelAgency.classList.remove('hidden-panel');
        panelTemplates.classList.remove('hidden-panel');
        panelAgency.style.opacity = '1';
        panelTemplates.style.opacity = '1';

        if(mode === 'templates') {
            if(segmentBg) segmentBg.style.transform = 'translateX(100%)';
            if(slider) slider.style.transform = 'translateX(-50%)'; 
            if(navLinksContainer) {
                navLinksContainer.style.opacity = '0';
                navLinksContainer.style.pointerEvents = 'none';
            }
            setTimeout(() => { panelAgency.classList.add('hidden-panel'); }, 600);
        } else {
            if(segmentBg) segmentBg.style.transform = 'translateX(0)';
            if(slider) slider.style.transform = 'translateX(0)';
            if(navLinksContainer) {
                navLinksContainer.style.opacity = '1';
                navLinksContainer.style.pointerEvents = 'auto';
            }
            setTimeout(() => { panelTemplates.classList.add('hidden-panel'); }, 600);
        }
    }

    segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => { setMode(btn.getAttribute('data-target')); });
    });

    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 100;
        if (touchStartX - touchEndX > threshold && currentMode === 'agency') setMode('templates');
        if (touchEndX - touchStartX > threshold && currentMode === 'templates') setMode('agency');
    }, {passive: true});

    /* ==========================================================================
       3. NAVIGATION & SCROLL LOGIC
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const floatingCta = document.getElementById('floating-cta');
    const heroSection = document.getElementById('home');

    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) navbar.classList.add('sticky');
            else navbar.classList.remove('sticky');
        }

        if (heroSection && floatingCta) {
            const heroBottom = heroSection.offsetTop + heroSection.clientHeight;
            if (window.scrollY > heroBottom - 100) floatingCta.classList.add('visible');
            else floatingCta.classList.remove('visible');
        }

        if(currentMode === 'agency') {
            let currentId = '';
            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - 150) currentId = section.getAttribute('id');
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentId}`) link.classList.add('active');
            });
        }
    }, {passive: true});

    /* ==========================================================================
       4. MOBILE MENU
       ========================================================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinksMobile = document.querySelector('.nav-links');

    if (hamburger && navLinksMobile) {
        hamburger.addEventListener('click', () => {
            if(currentMode === 'templates') return; 
            hamburger.classList.toggle('active');
            navLinksMobile.classList.toggle('active');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksMobile.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       5. SCROLL REVEAL & COUNTERS
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    const revealFunc = () => {
        const wh = window.innerHeight;
        revealElements.forEach(el => {
            if (el.getBoundingClientRect().top < wh - 50) el.classList.add('active');
        });
    };
    window.addEventListener('scroll', revealFunc, {passive: true});
    revealFunc();

    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;
    const startCounters = () => {
        statNumbers.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const current = +counter.innerText;
                const inc = Math.ceil(target / 40);
                if (current < target) {
                    counter.innerText = current + inc > target ? target : current + inc;
                    setTimeout(updateCount, 30);
                } else { counter.innerText = target; }
            };
            updateCount();
        });
    };

    const statsSection = document.querySelector('.stats-section');
    if (statsSection && window.IntersectionObserver) {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !countersStarted) {
                countersStarted = true;
                startCounters();
                obs.disconnect();
            }
        }, { threshold: 0.3 });
        obs.observe(statsSection);
    } else if(statsSection) {
        startCounters();
    }

    /* ==========================================================================
       6. PREMIUM CART SYSTEM
       ========================================================================== */
    let cartState = null;
    const formatRp = num => 'Rp' + num.toLocaleString('id-ID');

    const cartEmpty = document.getElementById('cart-empty-msg');
    const cartContent = document.getElementById('cart-content');
    const cartItemsBody = document.getElementById('cart-items');
    const cartTotalVal = document.getElementById('cart-total-val');
    const addonCBs = document.querySelectorAll('.addon-checkbox');

    const updateCartDOM = () => {
        if (!cartState) {
            if(cartEmpty) cartEmpty.classList.remove('hidden');
            if(cartContent) cartContent.classList.add('hidden');
            return;
        }
        if(cartEmpty) cartEmpty.classList.add('hidden');
        if(cartContent) cartContent.classList.remove('hidden');

        if(cartItemsBody) {
            cartItemsBody.innerHTML = `
                <tr>
                    <td><strong>${cartState.name}</strong></td>
                    <td>${formatRp(cartState.basePrice)}</td>
                    <td><button class="delete-btn" aria-label="Hapus">Hapus</button></td>
                </tr>`;
            cartItemsBody.querySelector('.delete-btn').addEventListener('click', () => {
                cartState = null;
                addonCBs.forEach(cb => cb.checked = false);
                updateCartDOM();
            });
        }
        calcTotal();
    };

    const calcTotal = () => {
        if (!cartState) return;
        let total = cartState.basePrice;
        addonCBs.forEach(cb => { if (cb.checked) total += +cb.getAttribute('data-price'); });
        if(cartTotalVal) cartTotalVal.innerText = formatRp(total);
    };

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            cartState = {
                name: e.target.getAttribute('data-name'),
                basePrice: +e.target.getAttribute('data-price')
            };
            updateCartDOM();
            const cSec = document.getElementById('cart');
            if(cSec) cSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    addonCBs.forEach(cb => cb.addEventListener('change', calcTotal));

    /* ==========================================================================
       7. CALCULATOR
       ========================================================================== */
    const calcType = document.getElementById('calc-type');
    const calcPages = document.getElementById('calc-pages');
    const pValLabel = document.getElementById('pages-val');
    const calcDomain = document.getElementById('calc-domain');
    const calcResult = document.getElementById('calc-total-result');

    const runCalc = () => {
        if(!calcType || !calcPages) return;
        const base = +calcType.value;
        const p = +calcPages.value;
        if(pValLabel) pValLabel.innerText = p;
        const ext = p > 1 ? (p - 1) * 30000 : 0;
        const dom = (calcDomain && calcDomain.checked) ? +calcDomain.value : 0;
        if(calcResult) calcResult.innerText = formatRp(base + ext + dom);
    };

    if (calcType && calcPages) {
        calcType.addEventListener('change', runCalc);
        calcPages.addEventListener('input', runCalc);
        if(calcDomain) calcDomain.addEventListener('change', runCalc);
    }

    /* ==========================================================================
       8. WHATSAPP DISPATCHER (CART & CONTACT)
       ========================================================================== */
    const waNum = "62895614003884"; 

    const waBtn = document.getElementById('whatsapp-checkout-btn');
    if (waBtn) {
        waBtn.addEventListener('click', () => {
            if (!cartState) return alert('Keranjang kosong!');
            const name = document.getElementById('checkout-name').value.trim();
            const biz = document.getElementById('checkout-business').value.trim();
            const desc = document.getElementById('checkout-desc').value.trim();

            if (!name || !biz || !desc) return alert('Lengkapi form pemesanan.');

            let addons = Array.from(addonCBs).filter(c=>c.checked).map(c=>c.getAttribute('data-name')).join(', ') || '-';
            const msg = `Halo, saya ingin memesan website dari Ran Studio.\n\nPaket: ${cartState.name}\nTambahan: ${addons}\nTotal: ${cartTotalVal.innerText}\n\nNama: ${name}\nUsaha: ${biz}\nDeskripsi: ${desc}`;
            window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
        });
    }

    const contactForm = document.getElementById('direct-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nm = document.getElementById('form-name').value.trim();
            const em = document.getElementById('form-email').value.trim();
            const ps = document.getElementById('form-message').value.trim();

            if (!nm || !em || !ps) return alert('Lengkapi form kontak.');
            const msg = `Halo Ran Studio, saya ingin berkonsultasi mengenai pembuatan website.\n\nNama: ${nm}\nEmail: ${em}\nPesan: ${ps}\n\nTerima kasih.`;
            window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
            contactForm.reset();
        });
    }

    /* ==========================================================================
       9. FAQ & MODAL
       ========================================================================== */
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const p = q.parentElement;
            document.querySelectorAll('.faq-item').forEach(i => {
                if (i !== p && i.classList.contains('active')) {
                    i.classList.remove('active');
                    i.querySelector('.faq-answer').style.maxHeight = null;
                }
            });
            p.classList.toggle('active');
            const ans = p.querySelector('.faq-answer');
            ans.style.maxHeight = p.classList.contains('active') ? ans.scrollHeight + "px" : null;
        });
    });

    document.querySelectorAll('.prevent-default').forEach(l => l.addEventListener('click', e => e.preventDefault()));

    const modal = document.getElementById('case-study-modal');
    if(modal) {
        document.querySelectorAll('.open-case-study').forEach(b => {
            b.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('cs-title').innerText = b.getAttribute('data-title');
                document.getElementById('cs-type').innerText = b.getAttribute('data-type');
                document.getElementById('cs-tech').innerText = b.getAttribute('data-tech');
                
                const demoLink = b.parentElement.querySelector('a.btn-secondary');
                const mdLink = document.getElementById('cs-demo-link');
                if(demoLink && demoLink.getAttribute('href') !== '#') {
                    mdLink.href = demoLink.getAttribute('href');
                    mdLink.style.display = 'inline-flex';
                } else {
                    mdLink.style.display = 'none';
                }
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; 
            });
        });

        const closeModal = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; };
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(b => b.addEventListener('click', closeModal));
        modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
    }
});
