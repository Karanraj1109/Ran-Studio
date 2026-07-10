document.addEventListener('DOMContentLoaded', () => {

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

        // Remove hidden classes to render full height for sliding
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
       3. STICKY NAVBAR, ACTIVE LINK & FLOATING CTA LOGIC
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const floatingCta = document.getElementById('floating-cta');
    const heroSection = document.getElementById('home');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }

        if (heroSection && floatingCta) {
            const heroBottom = heroSection.offsetTop + heroSection.clientHeight;
            if (window.scrollY > heroBottom - 200) {
                floatingCta.classList.add('visible');
            } else {
                floatingCta.classList.remove('visible');
            }
        }

        if(currentMode === 'agency') {
            let currentSectionId = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    /* ==========================================================================
       4. MOBILE HAMBURGER MENU ACTIONS
       ========================================================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinksMobileContainer = document.querySelector('.nav-links');

    if (hamburger && navLinksMobileContainer) {
        hamburger.addEventListener('click', () => {
            if(currentMode === 'templates') return; 
            hamburger.classList.toggle('active');
            navLinksMobileContainer.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksMobileContainer.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       5. ANIMATED STATISTICS SCROLL COUNTER & SCROLL REVEAL
       ========================================================================== */
    
    const revealElements = document.querySelectorAll('.reveal');
    const revealFunc = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 50) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealFunc);
    revealFunc();

    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const startCounters = () => {
        statNumbers.forEach(counter => {
            const updateCount = () => {
                const target = parseInt(counter.getAttribute('data-target'), 10);
                const current = parseInt(counter.innerText, 10);
                const increment = Math.ceil(target / 40);

                if (current < target) {
                    counter.innerText = current + increment > target ? target : current + increment;
                    setTimeout(updateCount, 30);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observerOptions = { root: null, threshold: 0.3 };
        if (window.IntersectionObserver) {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !countersStarted) {
                        countersStarted = true;
                        startCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            statsObserver.observe(statsSection);
        } else {
            startCounters();
        }
    }

    /* ==========================================================================
       6. INTERACTIVE SHOPPING CART MECHANICS
       ========================================================================== */
    let cartState = null;

    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    const cartContent = document.getElementById('cart-content');
    const cartItemsTableBody = document.getElementById('cart-items');
    const cartTotalValDisplay = document.getElementById('cart-total-val');
    
    const allAddonCheckboxes = document.querySelectorAll('.addon-checkbox');

    const updateCartDOM = () => {
        if (!cartState) {
            cartEmptyMsg.classList.remove('hidden');
            cartContent.classList.add('hidden');
            return;
        }

        cartEmptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');

        cartItemsTableBody.innerHTML = `
            <tr>
                <td><strong>${cartState.name}</strong></td>
                <td>Rp${cartState.basePrice.toLocaleString('id-ID')}</td>
                <td><button class="delete-btn" data-action="clear-cart" aria-label="Hapus paket dari keranjang">Hapus</button></td>
            </tr>
        `;

        calculateCartTotal();

        const deleteBtn = cartItemsTableBody.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            clearCart();
        });
    };

    const calculateCartTotal = () => {
        if (!cartState) return;

        let totalAccumulator = cartState.basePrice;
        allAddonCheckboxes.forEach(cb => {
            if (cb.checked) {
                totalAccumulator += parseInt(cb.getAttribute('data-price'), 10);
            }
        });

        cartTotalValDisplay.innerText = `Rp${totalAccumulator.toLocaleString('id-ID')}`;
    };

    const clearCart = () => {
        cartState = null;
        allAddonCheckboxes.forEach(cb => cb.checked = false);
        updateCartDOM();
    };

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const btnNode = e.target;
            const id = btnNode.getAttribute('data-id');
            const name = btnNode.getAttribute('data-name');
            const price = parseInt(btnNode.getAttribute('data-price'), 10);

            cartState = { id: id, name: name, basePrice: price };
            updateCartDOM();

            document.getElementById('cart').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    allAddonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            calculateCartTotal();
        });
    });

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
        const inputPagesCount = parseInt(calcPagesRange.value, 10);
        
        pagesValLabel.innerText = inputPagesCount;

        const additionalPagesCost = inputPagesCount > 1 ? (inputPagesCount - 1) * 30000 : 0;
        const domainCost = calcDomainCB.checked ? parseInt(calcDomainCB.value, 10) : 0;

        const calculatedFinalSum = baseTypeCost + additionalPagesCost + domainCost;
        calcTotalResultDisplay.innerText = `Rp${calculatedFinalSum.toLocaleString('id-ID')}`;
    };

    if (calcTypeSelect && calcPagesRange) {
        calcTypeSelect.addEventListener('change', recalculateCalculatorEstimate);
        calcPagesRange.addEventListener('input', recalculateCalculatorEstimate);
        calcDomainCB.addEventListener('change', recalculateCalculatorEstimate);
    }

    /* ==========================================================================
       8. AUTOMATED INTEGRATED WHATSAPP PACKAGES CHECKOUT DISPATCHER
       ========================================================================== */
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
    
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener('click', () => {
            if (!cartState) {
                alert('Keranjang belanja Anda kosong!');
                return;
            }

            const clientNameInput = document.getElementById('checkout-name').value.trim();
            const clientBusinessInput = document.getElementById('checkout-business').value.trim();
            const clientDescInput = document.getElementById('checkout-desc').value.trim();

            if (!clientNameInput || !clientBusinessInput || !clientDescInput) {
                alert('Mohon lengkapi semua baris detail informasi pemesanan terlebih dahulu.');
                return;
            }

            let selectedAddonsList = [];
            allAddonCheckboxes.forEach(cb => {
                if (cb.checked) {
                    selectedAddonsList.push(cb.getAttribute('data-name'));
                }
            });
            const addonsTextRepresentation = selectedAddonsList.length > 0 ? selectedAddonsList.join(', ') : 'Tidak ada tambahan';
            const grandTotalText = document.getElementById('cart-total-val').innerText;

            const waTargetNumber = "62895614003884"; 
            const baseTextPrompt = `Halo, saya ingin memesan website dari Ran Studio.

Paket: ${cartState.name}
Tambahan: ${addonsTextRepresentation}
Total: ${grandTotalText}

Nama: ${clientNameInput}
Nama Usaha: ${clientBusinessInput}
Deskripsi Website: ${clientDescInput}`;

            const processedEncodedUriString = encodeURIComponent(baseTextPrompt);
            const destinationEndpointUrl = `https://wa.me/${waTargetNumber}?text=${processedEncodedUriString}`;

            window.open(destinationEndpointUrl, '_blank', 'noopener,noreferrer');
        });
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
