document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       0. DARK / LIGHT THEME TOGGLE
       ========================================================================== */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const root = document.documentElement;

    const getPreferredTheme = () => {
        try {
            const storedTheme = localStorage.getItem('ran-studio-theme');
            if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
        } catch (_) {}
        return 'dark';
    };

    const applyTheme = (theme, persist = false) => {
        const safeTheme = theme === 'light' ? 'light' : 'dark';
        root.dataset.theme = safeTheme;

        if (themeIcon) {
            themeIcon.className = safeTheme === 'light'
                ? 'fa-solid fa-sun'
                : 'fa-solid fa-moon';
        }

        if (themeToggle) {
            const isLight = safeTheme === 'light';
            themeToggle.setAttribute('aria-pressed', String(isLight));
            themeToggle.setAttribute('aria-label', isLight ? 'Aktifkan mode gelap' : 'Aktifkan mode terang');
            themeToggle.setAttribute('title', isLight ? 'Aktifkan mode gelap' : 'Aktifkan mode terang');
        }

        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', safeTheme === 'light' ? '#f7f9fc' : '#050505');
        }

        if (persist) {
            try {
                localStorage.setItem('ran-studio-theme', safeTheme);
            } catch (_) {}
        }
    };

    applyTheme(root.dataset.theme || getPreferredTheme());

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
        });
    }


    /* ==========================================================================
       1. LOADING SCREEN DISMISS
       ========================================================================== */
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
            }, 800); 
        });
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 2000);
    }

    /* ==========================================================================
       2. SEGMENTED SWITCH & SWIPE LOGIC (STABLE LAYOUT METHOD)
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
        activeBtn.classList.add('active');

        const isMobileLayout = window.matchMedia?.('(max-width: 900px)').matches;

        // Mobile/tablet: keep a single panel in normal document flow.
        // This avoids horizontal slider transforms creating clipped/blank regions.
        if (isMobileLayout) {
            panelAgency.classList.toggle('hidden-panel', mode !== 'agency');
            panelTemplates.classList.toggle('hidden-panel', mode !== 'templates');
            panelAgency.style.opacity = mode === 'agency' ? '1' : '0';
            panelTemplates.style.opacity = mode === 'templates' ? '1' : '0';
            slider.style.transform = 'none';
            segmentBg.style.transform = mode === 'templates' ? 'translateX(100%)' : 'translateX(0)';
            navLinksContainer.style.opacity = mode === 'templates' ? '0' : '1';
            navLinksContainer.style.pointerEvents = mode === 'templates' ? 'none' : 'auto';
            return;
        }

        // Desktop: preserve the premium horizontal slider behavior.
        panelAgency.classList.remove('hidden-panel');
        panelTemplates.classList.remove('hidden-panel');
        panelAgency.style.opacity = '1';
        panelTemplates.style.opacity = '1';

        if(mode === 'templates') {
            segmentBg.style.transform = 'translateX(100%)';
            slider.style.transform = 'translateX(-50%)'; 
            navLinksContainer.style.opacity = '0';
            navLinksContainer.style.pointerEvents = 'none';

            // Hide inactive panel after animation
            setTimeout(() => {
                panelAgency.classList.add('hidden-panel');
            }, 500);

        } else {
            segmentBg.style.transform = 'translateX(0)';
            slider.style.transform = 'translateX(0)';
            navLinksContainer.style.opacity = '1';
            navLinksContainer.style.pointerEvents = 'auto';

            // Hide inactive panel after animation
            setTimeout(() => {
                panelTemplates.classList.add('hidden-panel');
            }, 500);
        }
    }

    segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.getAttribute('data-target'));
        });
    });

    window.addEventListener('resize', () => {
        const isMobileLayout = window.matchMedia?.('(max-width: 900px)').matches;
        if (isMobileLayout) {
            panelAgency.classList.toggle('hidden-panel', currentMode !== 'agency');
            panelTemplates.classList.toggle('hidden-panel', currentMode !== 'templates');
            slider.style.transform = 'none';
        } else {
            panelAgency.classList.remove('hidden-panel');
            panelTemplates.classList.remove('hidden-panel');
            slider.style.transform = currentMode === 'templates' ? 'translateX(-50%)' : 'translateX(0)';
        }
    }, { passive: true });

    // Swipe Logic
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const threshold = 120;
        if (touchStartX - touchEndX > threshold) {
            // Swiped left
            if (currentMode === 'agency') {
                setMode('templates');
            }
        }
        if (touchEndX - touchStartX > threshold) {
            // Swiped right
            if (currentMode === 'templates') {
                setMode('agency');
            }
        }
    }

    /* ==========================================================================
       3. HIGH-PERFORMANCE NAV / SCROLL / CURSOR MOTION
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    const heroSection = document.getElementById('home');
    const floatingCta = document.getElementById('floating-cta');
    const progressBar = document.getElementById('scroll-progress-bar');
    const agencySections = panelAgency
        ? Array.from(panelAgency.querySelectorAll('section[id]'))
        : Array.from(document.querySelectorAll('#home, #portfolio, #why-us, #workflow, #services, #pricing, #faq, #contact'));
    const navLinks = document.querySelectorAll('.nav-link');

    let rafScheduled = false;
    let heroTrigger = 0;

    const cacheLayout = () => {
        heroTrigger = heroSection ? heroSection.offsetTop + heroSection.offsetHeight - 200 : 0;
    };

    const updateScrollUI = () => {
        rafScheduled = false;
        const y = window.scrollY || window.pageYOffset || 0;
        const doc = document.documentElement;
        const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);

        navbar?.classList.toggle('sticky', y > 50);
        floatingCta?.classList.toggle('visible', Boolean(heroSection && y > heroTrigger));
        if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, y / scrollable))})`;
    };

    const requestScrollUpdate = () => {
        if (rafScheduled) return;
        rafScheduled = true;
        requestAnimationFrame(updateScrollUI);
    };

    cacheLayout();
    window.addEventListener('resize', () => {
        cacheLayout();
        requestScrollUpdate();
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
        cacheLayout();
        requestScrollUpdate();
    }, { passive: true });
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    requestScrollUpdate();

    if (window.IntersectionObserver && navLinks.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            if (currentMode !== 'agency') return;
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const id = entry.target.id;
                navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
            }
        }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });
        agencySections.forEach(section => sectionObserver.observe(section));
    }

    /* Pointer glow: desktop only, one DOM write per animation frame. */
    const cursorGlow = document.querySelector('.cursor-glow');
    const canUsePointerFX = Boolean(cursorGlow && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches);
    if (canUsePointerFX) {
        let pointerRaf = 0;
        let px = 0, py = 0;
        const paintPointer = () => {
            pointerRaf = 0;
            cursorGlow.style.transform = `translate3d(${px}px, ${py}px, 0) translate3d(-50%, -50%, 0)`;
        };
        window.addEventListener('pointermove', (event) => {
            px = event.clientX;
            py = event.clientY;
            if (!pointerRaf) pointerRaf = requestAnimationFrame(paintPointer);
            cursorGlow.classList.remove('is-idle');
        }, { passive: true });
        window.addEventListener('pointerleave', () => cursorGlow.classList.add('is-idle'), { passive: true });
    } else if (cursorGlow) {
        cursorGlow.style.display = 'none';
    }

    /* ==========================================================================
       4. MOBILE HAMBURGER MENU ACTIONS
       ========================================================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinksMobileContainer = document.querySelector('.nav-links');

    if (hamburger && navLinksMobileContainer) {
        const toggleMenu = () => {
            if (currentMode === 'templates') return;
            hamburger.classList.toggle('active');
            navLinksMobileContainer.classList.toggle('active');
        };
        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleMenu();
            }
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksMobileContainer.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       5. INTERSECTION REVEAL + RAF STAT COUNTERS
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');

    // Mobile safety: Services should never depend on deferred reveal painting.
    // This prevents a reserved blank area on small screens while preserving
    // the premium reveal animation everywhere else.
    if (window.matchMedia?.('(max-width: 1024px)').matches) {
        const servicesSection = document.getElementById('services');
        if (servicesSection) servicesSection.classList.add('active');
    }

    if (window.IntersectionObserver) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }

    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const startCounters = () => {
        const counters = Array.from(statNumbers).map(counter => ({
            node: counter,
            target: Number.parseInt(counter.getAttribute('data-target'), 10) || 0,
            start: performance.now()
        }));
        const duration = 950;
        const tick = (now) => {
            let active = false;
            counters.forEach(item => {
                const progress = Math.min(1, (now - item.start) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.round(item.target * eased);
                item.node.textContent = String(value);
                if (progress < 1) active = true;
            });
            if (active) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        if (window.IntersectionObserver) {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !countersStarted) {
                        countersStarted = true;
                        startCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -10% 0px', threshold: 0.25 });
            statsObserver.observe(statsSection);
        } else {
            startCounters();
        }
    }

    /* ===========================================================================
       6. PACKAGE CART + CHECKOUT FLOW
       =========================================================================== */
    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    const cartContent = document.getElementById('cart-content');
    const cartContainer = document.getElementById('cart-container');
    const checkoutPackageName = document.getElementById('checkout-package-name');
    const checkoutPackagePrice = document.getElementById('checkout-package-price');
    const checkoutDomainLabel = document.getElementById('checkout-domain-label');
    const cartTotalValDisplay = document.getElementById('cart-total-val');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutDomainRadios = document.querySelectorAll('.checkout-domain-radio');
    const checkoutSection = document.getElementById('checkout');
    const WA_TARGET_NUMBER = '62895614003884';

    let cartState = null;

    const formatRupiah = (value) => `Rp${Number(value || 0).toLocaleString('id-ID')}`;

    const getSelectedDomain = () => {
        const selected = document.querySelector('.checkout-domain-radio:checked');
        if (!selected) return { price: 0, label: 'Tanpa domain' };
        return {
            price: Number.parseInt(selected.value, 10) || 0,
            label: selected.dataset.label || 'Tanpa domain'
        };
    };

    const persistCart = () => {
        try {
            if (!cartState) {
                localStorage.removeItem('ran-studio-cart');
                return;
            }
            localStorage.setItem('ran-studio-cart', JSON.stringify(cartState));
        } catch (_) {}
    };

    const restoreCart = () => {
        try {
            const raw = localStorage.getItem('ran-studio-cart');
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved && typeof saved.id === 'string' && typeof saved.name === 'string' && Number.isFinite(Number(saved.basePrice))) {
                cartState = {
                    id: saved.id,
                    name: saved.name,
                    basePrice: Number(saved.basePrice)
                };
            }
        } catch (_) {
            cartState = null;
        }
    };

    const calculateCartTotal = () => {
        if (!cartState || !cartTotalValDisplay) return 0;
        const domain = getSelectedDomain();
        const total = cartState.basePrice + domain.price;
        if (checkoutPackagePrice) checkoutPackagePrice.textContent = formatRupiah(cartState.basePrice);
        if (checkoutDomainLabel) {
            checkoutDomainLabel.textContent = domain.price > 0
                ? `${domain.label} (+${formatRupiah(domain.price)})`
                : domain.label;
        }
        cartTotalValDisplay.textContent = formatRupiah(total);
        return total;
    };

    const updateCartDOM = () => {
        if (!cartEmptyMsg || !cartContent) return;

        if (!cartState) {
            cartEmptyMsg.classList.remove('hidden');
            cartContent.classList.add('hidden');
            if (checkoutPackageName) checkoutPackageName.textContent = '-';
            if (checkoutPackagePrice) checkoutPackagePrice.textContent = 'Rp0';
            if (checkoutDomainLabel) checkoutDomainLabel.textContent = 'Tanpa domain';
            if (cartTotalValDisplay) cartTotalValDisplay.textContent = 'Rp0';
            return;
        }

        cartEmptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');
        if (checkoutPackageName) checkoutPackageName.textContent = cartState.name;
        calculateCartTotal();
    };

    const clearCart = (scrollBack = true) => {
        cartState = null;
        persistCart();
        const noDomain = document.querySelector('.checkout-domain-radio[value="0"]');
        if (noDomain) noDomain.checked = true;
        updateCartDOM();
        if (scrollBack) {
            const pricingTarget = document.getElementById('pricing');
            if (pricingTarget) pricingTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id') || '';
            const name = button.getAttribute('data-name') || '';
            const price = Number.parseInt(button.getAttribute('data-price') || '0', 10);
            if (!id || !name || !Number.isFinite(price) || price < 0) return;

            cartState = { id, name, basePrice: price };
            persistCart();
            updateCartDOM();

            if (checkoutSection) {
                checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    checkoutDomainRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            calculateCartTotal();
            if (cartState) persistCart();
        });
    });

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => clearCart(true));
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!cartState) {
                alert('Pilih paket terlebih dahulu.');
                const pricingTarget = document.getElementById('pricing');
                if (pricingTarget) pricingTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            const clientName = document.getElementById('checkout-name')?.value.trim() || '';
            const clientPhone = document.getElementById('checkout-phone')?.value.trim() || '';
            const clientBusiness = document.getElementById('checkout-business')?.value.trim() || '';
            const clientType = document.getElementById('checkout-type')?.value.trim() || '';
            const clientPages = document.getElementById('checkout-pages')?.value.trim() || '';
            const clientReference = document.getElementById('checkout-reference')?.value.trim() || '';
            const clientDesc = document.getElementById('checkout-desc')?.value.trim() || '';

            if (!clientName || !clientPhone || !clientBusiness || !clientType || !clientDesc) {
                alert('Lengkapi Nama, WhatsApp, Nama Usaha/Brand, Jenis Website, dan kebutuhan website terlebih dahulu.');
                return;
            }

            const normalizedPhone = clientPhone.replace(/[^0-9+]/g, '');
            if (normalizedPhone.length < 9) {
                alert('Nomor WhatsApp belum terlihat valid. Cek lagi nomor yang kamu masukkan.');
                return;
            }

            if (clientReference) {
                try {
                    const referenceUrl = new URL(clientReference);
                    if (!['http:', 'https:'].includes(referenceUrl.protocol)) throw new Error('invalid protocol');
                } catch (_) {
                    alert('Link referensi harus berupa URL lengkap, misalnya https://contoh.com');
                    return;
                }
            }

            const domain = getSelectedDomain();
            const total = calculateCartTotal();
            const baseTextPrompt = [
                'Halo Ran Studio, saya mau pesan website.',
                '',
                `Paket: ${cartState.name}`,
                `Harga paket mulai dari: ${formatRupiah(cartState.basePrice)}`,
                `Domain: ${domain.label}${domain.price > 0 ? ` (+${formatRupiah(domain.price)})` : ''}`,
                `Estimasi total awal: ${formatRupiah(total)}`,
                '',
                `Nama: ${clientName}`,
                `WhatsApp: ${clientPhone}`,
                `Nama Usaha / Brand: ${clientBusiness}`,
                `Jenis Website: ${clientType}`,
                `Perkiraan Halaman: ${clientPages}`,
                `Referensi: ${clientReference || '-'}`,
                '',
                'Gambaran website / kebutuhan:',
                clientDesc,
                '',
                'Mohon dibantu cek kebutuhan dan konfirmasi harga final sebelum pembayaran.'
            ].join('\n');

            const whatsappUrl = `https://wa.me/${WA_TARGET_NUMBER}?text=${encodeURIComponent(baseTextPrompt)}`;
            window.location.href = whatsappUrl;
        });
    }

    restoreCart();
    updateCartDOM();

    /* ==========================================================================
       7. REAL-TIME ESTIMATION COST CALCULATOR MATRIX
       ========================================================================== */
    const calcTypeSelect = document.getElementById('calc-type');
    const calcPagesRange = document.getElementById('calc-pages');
    const pagesValLabel = document.getElementById('pages-val');
    const calcDomainCB = document.getElementById('calc-domain');
    const calcTotalResultDisplay = document.getElementById('calc-total-result');

    const recalculateCalculatorEstimate = () => {
        if(!calcTypeSelect || !calcPagesRange) return;
        const baseTypeCost = parseInt(calcTypeSelect.value, 10);
        const selectedTypeText = calcTypeSelect.options[calcTypeSelect.selectedIndex]?.textContent || '';
        const isLandingPage = selectedTypeText.toLowerCase().includes('landing page');
        const inputPagesCount = isLandingPage ? 1 : parseInt(calcPagesRange.value, 10);

        if (isLandingPage) {
            calcPagesRange.value = '1';
            calcPagesRange.disabled = true;
        } else {
            calcPagesRange.disabled = false;
        }

        pagesValLabel.innerText = inputPagesCount;

        const additionalPagesCost = isLandingPage || inputPagesCount <= 1
            ? 0
            : (inputPagesCount - 1) * 30000;
        const domainCost = calcDomainCB.checked ? parseInt(calcDomainCB.value, 10) : 0;

        const calculatedFinalSum = baseTypeCost + additionalPagesCost + domainCost;
        calcTotalResultDisplay.innerText = `Rp${calculatedFinalSum.toLocaleString('id-ID')}`;
    };

    if (calcTypeSelect && calcPagesRange) {
        calcTypeSelect.addEventListener('change', recalculateCalculatorEstimate);
        calcPagesRange.addEventListener('input', recalculateCalculatorEstimate);
        calcDomainCB.addEventListener('change', recalculateCalculatorEstimate);
        
        // Memastikan update saat halaman di load
        recalculateCalculatorEstimate();
    }

    /* ==========================================================================
       9. INTERACTIVE ACCORDION FAQ LOGIC COMPONENT
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(questionNode => {
        questionNode.addEventListener('click', () => {
            const parentItemNode = questionNode.parentElement;
            const answerNode = questionNode.nextElementSibling;

            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== parentItemNode && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            parentItemNode.classList.toggle('active');

            if (parentItemNode.classList.contains('active')) {
                answerNode.style.maxHeight = answerNode.scrollHeight + "px";
            } else {
                answerNode.style.maxHeight = null;
            }
        });
    });

    /* ==========================================================================
       10. GENERAL CONTACT FORM SUBMISSION HOOK (WHATSAPP REDIRECT)
       ========================================================================== */
    const directContactForm = document.getElementById('direct-contact-form');
    if (directContactForm) {
        directContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const contactName = document.getElementById('form-name').value.trim();
            const contactEmail = document.getElementById('form-email').value.trim();
            const contactMessage = document.getElementById('form-message').value.trim();

            if (!contactName || !contactEmail || !contactMessage) {
                alert('Mohon lengkapi Nama, Email, dan Pesan terlebih dahulu.');
                return;
            }

            const waTargetNumber = "62895614003884"; 
            const baseTextPrompt = `Halo Ran Studio, saya ingin berkonsultasi mengenai pembuatan website.\n\nNama: ${contactName}\nEmail: ${contactEmail}\nPesan: ${contactMessage}\n\nTerima kasih.`;

            const processedEncodedUriString = encodeURIComponent(baseTextPrompt);
            const destinationEndpointUrl = `https://wa.me/${waTargetNumber}?text=${processedEncodedUriString}`;

            window.open(destinationEndpointUrl, '_blank', 'noopener,noreferrer');
            directContactForm.reset();
        });
    }

    /* ==========================================================================
       11. PREVENT DEFAULT ON PLACEHOLDER LINKS
       ========================================================================== */
    const preventLinks = document.querySelectorAll('.prevent-default');
    preventLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    /* ==========================================================================
       12. CASE STUDY MODAL LOGIC
       ========================================================================== */
    const modalOverlay = document.getElementById('case-study-modal');
    const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const openCaseBtns = document.querySelectorAll('.open-case-study');
    
    const csTitle = document.getElementById('cs-title');
    const csType = document.getElementById('cs-type');
    const csTech = document.getElementById('cs-tech');
    const csDemoLink = document.getElementById('cs-demo-link');

    if(modalOverlay) {
        openCaseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                csTitle.innerText = btn.getAttribute('data-title') || 'Project Title';
                csType.innerText = btn.getAttribute('data-type') || 'Website';
                csTech.innerText = btn.getAttribute('data-tech') || 'HTML, CSS, JS';
                
                const demoLinkBtn = btn.parentElement.querySelector('a.btn-secondary');
                if(demoLinkBtn && demoLinkBtn.getAttribute('href') !== '#') {
                    csDemoLink.href = demoLinkBtn.getAttribute('href');
                    csDemoLink.style.display = 'inline-block';
                } else {
                    csDemoLink.style.display = 'none';
                }

                modalOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; 
            });
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modalOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            });
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }
});