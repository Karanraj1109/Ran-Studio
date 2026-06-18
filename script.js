document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. LOADING SCREEN DISMISS
       ========================================================================== */
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
            }, 400); // Elegant delay
        });
        // Fallback safety trigger
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 2500);
    }

    /* ==========================================================================
       2. STICKY NAVBAR & ACTIVE NAVIGATION LINK TRACKING
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Sticky logic
        if (window.scrollY > 50) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }

        // Active Link Highlighting logic
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
    });

    /* ==========================================================================
       3. MOBILE HAMBURGER MENU ACTIONS
       ========================================================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close navbar layout when specific navigation node link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       4. ANIMATED STATISTICS SCROLL COUNTER
       ========================================================================== */
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const startCounters = () => {
        statNumbers.forEach(counter => {
            const updateCount = () => {
                const target = parseInt(counter.getAttribute('data-target'), 10);
                const current = parseInt(counter.innerText, 10);
                const increment = Math.ceil(target / 40); // Synchronization step speed

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

    // Intersection Observer API configuration for scroll metrics
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observerOptions = {
            root: null,
            threshold: 0.3
        };

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
    }

    /* ==========================================================================
       5. INTERACTIVE SHOPPING CART MECHANICS
       ========================================================================== */
    let cartState = null; // Single product design limit context rule constraint

    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    const cartContent = document.getElementById('cart-content');
    const cartItemsTableBody = document.getElementById('cart-items');
    const cartTotalValDisplay = document.getElementById('cart-total-val');
    
    // Addon Checkbox Elements
    const allAddonCheckboxes = document.querySelectorAll('.addon-checkbox');

    const updateCartDOM = () => {
        if (!cartState) {
            cartEmptyMsg.classList.remove('hidden');
            cartContent.classList.add('hidden');
            return;
        }

        cartEmptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');

        // Render package element row inside table body structure
        cartItemsTableBody.innerHTML = `
            <tr>
                <td><strong>${cartState.name}</strong></td>
                <td>Rp${cartState.basePrice.toLocaleString('id-ID')}</td>
                <td><button class="delete-btn" data-action="clear-cart">Hapus</button></td>
            </tr>
        `;

        // Calculate continuous global total calculation matrix
        calculateCartTotal();

        // Bind internal item removal callback action node
        const deleteBtn = cartItemsTableBody.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            clearCart();
        });
    };

    const calculateCartTotal = () => {
        if (!cartState) return;

        let totalAccumulator = cartState.basePrice;

        // Verify active additional addon options
        allAddonCheckboxes.forEach(cb => {
            if (cb.checked) {
                totalAccumulator += parseInt(cb.getAttribute('data-price'), 10);
            }
        });

        cartTotalValDisplay.innerText = `Rp${totalAccumulator.toLocaleString('id-ID')}`;
    };

    const clearCart = () => {
        cartState = null;
        // Uncheck configurations systematically
        allAddonCheckboxes.forEach(cb => cb.checked = false);
        updateCartDOM();
    };

    // Bind event delegation mapping onto pricing trigger selection layouts
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const btnNode = e.target;
            const id = btnNode.getAttribute('data-id');
            const name = btnNode.getAttribute('data-name');
            const price = parseInt(btnNode.getAttribute('data-price'), 10);

            // Populate system active state context model configuration
            cartState = {
                id: id,
                name: name,
                basePrice: price
            };

            updateCartDOM();

            // Smooth contextual navigation snap-to effect targeting shopping cart container frame
            document.getElementById('cart').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // Append instant state modification hooks to supplementary components
    allAddonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            calculateCartTotal();
        });
    });

    /* ==========================================================================
       6. REAL-TIME ESTIMATION COST CALCULATOR MATRIX
       ========================================================================== */
    const calcTypeSelect = document.getElementById('calc-type');
    const calcPagesRange = document.getElementById('calc-pages');
    const pagesValLabel = document.getElementById('pages-val');
    const calcDomainCB = document.getElementById('calc-domain');
    const calcTotalResultDisplay = document.getElementById('calc-total-result');

    const recalculateCalculatorEstimate = () => {
        const baseTypeCost = parseInt(calcTypeSelect.value, 10);
        const inputPagesCount = parseInt(calcPagesRange.value, 10);
        
        // Update range interface numerical element text tracking label
        pagesValLabel.innerText = inputPagesCount;

        // Calculate dynamic pages factor: first index included in base price pricing, subsequent index weights extra
        const additionalPagesCost = inputPagesCount > 1 ? (inputPagesCount - 1) * 30000 : 0;
        
        // Infrastructure nodes verification evaluation
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
       7. AUTOMATED INTEGRATED WHATSAPP PACKAGES CHECKOUT DISPATCHER
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

            // Consolidate string content formatting components
            let selectedAddonsList = [];
            allAddonCheckboxes.forEach(cb => {
                if (cb.checked) {
                    selectedAddonsList.push(cb.getAttribute('data-name'));
                }
            });
            const addonsTextRepresentation = selectedAddonsList.length > 0 ? selectedAddonsList.join(', ') : 'Tidak ada tambahan';
            const grandTotalText = document.getElementById('cart-total-val').innerText;

            // Formulate WhatsApp URI compliant parameters template string representation array
            const waTargetNumber = "62895614003884"; // Updated contact number 
            const baseTextPrompt = `Halo, saya ingin memesan website dari Ran Studio.

Paket: ${cartState.name}
Tambahan: ${addonsTextRepresentation}
Total: ${grandTotalText}

Nama: ${clientNameInput}
Nama Usaha: ${clientBusinessInput}
Deskripsi Website: ${clientDescInput}`;

            const processedEncodedUriString = encodeURIComponent(baseTextPrompt);
            const destinationEndpointUrl = `https://wa.me/${waTargetNumber}?text=${processedEncodedUriString}`;

            // Trigger structural window redirection layer to open target WhatsApp instance
            window.open(destinationEndpointUrl, '_blank', 'noopener,noreferrer');
        });
    }

    /* ==========================================================================
       8. INTERACTIVE ACCORDION FAQ LOGIC COMPONENT
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(questionNode => {
        questionNode.addEventListener('click', () => {
            const parentItemNode = questionNode.parentElement;
            const answerNode = questionNode.nextElementSibling;

            // Handle switching sequence for elements that do not match currently active identifier
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== parentItemNode && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle active tracking properties state classes onto components
            parentItemNode.classList.toggle('active');

            if (parentItemNode.classList.contains('active')) {
                answerNode.style.maxHeight = answerNode.scrollHeight + "px";
            } else {
                answerNode.style.maxHeight = null;
            }
        });
    });

    /* ==========================================================================
       9. GENERAL CONTACT FORM SUBMISSION HOOK (WHATSAPP REDIRECT)
       ========================================================================== */
    const directContactForm = document.getElementById('direct-contact-form');
    if (directContactForm) {
        directContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Ambil value dan hapus spasi berlebih
            const contactName = document.getElementById('form-name').value.trim();
            const contactEmail = document.getElementById('form-email').value.trim();
            const contactMessage = document.getElementById('form-message').value.trim();

            // Validasi field kosong
            if (!contactName || !contactEmail || !contactMessage) {
                alert('Mohon lengkapi Nama, Email, dan Pesan terlebih dahulu.');
                return;
            }

            // Nomor tujuan WhatsApp (Ganti awalan 0 menjadi 62)
            const waTargetNumber = "62895614003884"; 
            
            // Template pesan
            const baseTextPrompt = `Halo Ran Studio, saya ingin berkonsultasi mengenai pembuatan website.\n\nNama: ${contactName}\nEmail: ${contactEmail}\nPesan: ${contactMessage}\n\nTerima kasih.`;

            // Encode pesan menjadi format URL yang aman
            const processedEncodedUriString = encodeURIComponent(baseTextPrompt);
            const destinationEndpointUrl = `https://wa.me/${waTargetNumber}?text=${processedEncodedUriString}`;

            // Buka WhatsApp di tab baru
            window.open(destinationEndpointUrl, '_blank', 'noopener,noreferrer');
            
            // Reset form setelah mengirim
            directContactForm.reset();
        });
    }
});