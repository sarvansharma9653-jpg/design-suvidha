/* ========================================================================
   DESIGN SUVIDHA — 3D SCROLL-TRIGGERED ANIMATION ENGINE
   Handles: frame video player, 3D scroll animations, particles, nav, chatbot
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Background frame video player removed for clean Amazon-style mobile performance

    // ============================================================
    // 2. 3D SCROLL ANIMATION OBSERVER
    //    Uses IntersectionObserver to trigger data-anim classes
    // ============================================================
    const animElements = document.querySelectorAll('[data-anim]');
    
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-visible');
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '0px 0px 150px 0px'
    });

    animElements.forEach(el => animObserver.observe(el));

    // ============================================================
    // 3. 3D CARD TILT ON MOUSE MOVE
    // ============================================================
    const cards3d = document.querySelectorAll('.card-3d');
    
    cards3d.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Particle canvas removed for fast Amazon mobile browsing

    // ============================================================
    // 5. HEADER SCROLL EFFECTS
    // ============================================================
    const header = document.getElementById('main-header');
    const scrollProgress = document.getElementById('scroll-progress');
    
    function updateHeader() {
        const scrollY = window.scrollY;
        if (header) {
            header.classList.toggle('scrolled', scrollY > 60);
        }
        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollY / docHeight) * 100;
            scrollProgress.style.width = `${progress}%`;
        }
    }

    // ============================================================
    // 6. ACTIVE NAV LINK (Scroll Spy)
    // ============================================================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(l => l.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }

    // ============================================================
    // 7. CLEAN URL NAVIGATION (no # in URL)
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const targetId = href.substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const headerOffset = 80;
                const targetPosition = targetEl.offsetTop - headerOffset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                history.pushState(null, '', '#' + targetId);
                
                // Close mobile drawer if open
                const drawer = document.getElementById('mobile-drawer');
                if (drawer) drawer.classList.remove('active');
            }
        });
    });

    // ============================================================
    // 8. MOBILE NAV TOGGLE
    // ============================================================
    const menuToggle = document.getElementById('menu-toggle-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            mobileDrawer.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // ============================================================
    // 9. BACK TO TOP
    // ============================================================
    const backToTop = document.getElementById('scroll-to-top-btn');
    function toggleBackToTop() {
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
    }
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState(null, '', '#');
        });
    }

    // ============================================================
    // 10. WHATSAPP CHATBOT
    // ============================================================
    const waChatToggle = document.getElementById('wa-chat-toggle');
    const waChatWindow = document.getElementById('wa-chat-window');
    const waChatClose = document.getElementById('wa-chat-close');
    const waSendBtn = document.getElementById('wa-send-btn');
    const waInput = document.getElementById('wa-custom-input');
    const waPhone = '919509022983';

    if (waChatToggle && waChatWindow) {
        waChatToggle.addEventListener('click', () => waChatWindow.classList.toggle('open'));
        if (waChatClose) waChatClose.addEventListener('click', () => waChatWindow.classList.remove('open'));
    }

    document.querySelectorAll('.chat-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const msg = encodeURIComponent(btn.dataset.msg);
            window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank');
        });
    });

    if (waSendBtn && waInput) {
        const sendCustomMsg = () => {
            const msg = waInput.value.trim();
            if (msg) {
                window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                waInput.value = '';
            }
        };
        waSendBtn.addEventListener('click', sendCustomMsg);
        waInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendCustomMsg(); });
    }

    // ============================================================
    // 11. CONTACT FORM
    // ============================================================
    const form = document.getElementById('growth-audit-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('form-name');
            const phone = document.getElementById('form-phone');
            const business = document.getElementById('form-business');
            const message = document.getElementById('form-message');
            let valid = true;

            [['form-name', 'name-error'], ['form-phone', 'phone-error'], ['form-business', 'business-error']].forEach(([fId, eId]) => {
                const field = document.getElementById(fId);
                const error = document.getElementById(eId);
                if (field && !field.value.trim()) {
                    if (error) error.classList.add('visible');
                    field.style.borderColor = 'hsl(330, 85%, 60%)';
                    valid = false;
                } else {
                    if (error) error.classList.remove('visible');
                    if (field) field.style.borderColor = '';
                }
            });

            if (!valid) {
                const errEl = document.getElementById('form-error-container');
                if (errEl) { errEl.style.display = 'block'; setTimeout(() => errEl.style.display = 'none', 3000); }
                return;
            }

            const btnText = document.getElementById('btn-submit-text');
            const btnLoader = document.getElementById('btn-submit-loader');
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'block';

            const waMsg = `New Growth Audit Request!\n\nName: ${name?.value}\nPhone: ${phone?.value}\nBusiness: ${business?.value}\nMessage: ${message?.value || 'N/A'}`;

            // Hybrid Serverless Backend Submission (saves lead automatically in email/dashboard, then redirects to WhatsApp)
            const web3FormsKey = 'YOUR_WEB3FORMS_ACCESS_KEY'; // Replace with Web3Forms access key
            
            const submitWhatsApp = () => {
                window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
                const successEl = document.getElementById('form-success-container');
                if (successEl) { successEl.style.display = 'block'; setTimeout(() => successEl.style.display = 'none', 5000); }
                form.reset();
            };

            if (web3FormsKey && web3FormsKey !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
                const formData = {
                    access_key: web3FormsKey,
                    subject: `New Lead from Design Suvidha: ${name?.value}`,
                    from_name: 'Design Suvidha Website',
                    name: name?.value,
                    phone: phone?.value,
                    business: business?.value,
                    message: message?.value || 'N/A'
                };

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(async (response) => {
                    if (response.ok) {
                        console.log('Lead submitted to Web3Forms successfully');
                    } else {
                        console.error('Web3Forms submission failed');
                    }
                })
                .catch(error => {
                    console.error('Error submitting lead to Web3Forms:', error);
                })
                .finally(() => {
                    submitWhatsApp();
                });
            } else {
                console.warn('Web3Forms access key is missing. Skipping backend lead saving. Redirecting to WhatsApp directly.');
                submitWhatsApp();
            }
        });
    }

    // ============================================================
    // 12. CINEMATIC BREAK PARALLAX
    //     The giant text in break sections moves with scroll
    // ============================================================
    const breakSections = document.querySelectorAll('.scene-break');
    function updateBreakParallax() {
        breakSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const progress = 1 - (rect.top / window.innerHeight);
            if (progress > -0.5 && progress < 1.5) {
                const translateX = (progress - 0.5) * 60;
                const scale = 0.9 + progress * 0.15;
                section.style.setProperty('--break-tx', `${translateX}px`);
                section.style.setProperty('--break-scale', scale);
            }
        });
    }

    // ============================================================
    // MASTER SCROLL LISTENER (single RAF-optimized handler)
    // ============================================================
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateHeader();
                updateActiveNav();
                toggleBackToTop();
                updateBreakParallax();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial calls
    updateHeader();
    toggleBackToTop();



    // Scroll to hash on page load with header offset
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetEl = document.getElementById(hash);
        if (targetEl) {
            setTimeout(() => {
                const headerOffset = 80;
                const targetPosition = targetEl.offsetTop - headerOffset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }, 300);
        }
    }

    // ============================================================
    // HOMEPAGE STORE CATEGORY FILTER (Stories & Pills Sync)
    // ============================================================
    const homeStoreFilters = document.querySelectorAll('#home-store-filters .store-filter-btn');
    const homeStoryCategories = document.querySelectorAll('#home-story-categories .app-cat-item');
    // Dynamic query of product cards inside filterHomeProducts

    function filterHomeProducts(selectedCat) {
        // Sync story items
        homeStoryCategories.forEach(item => {
            if (item.getAttribute('data-story-cat') === selectedCat) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Sync pill buttons
        homeStoreFilters.forEach(pill => {
            if (pill.getAttribute('data-home-cat') === selectedCat) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        // Filter cards
        document.querySelectorAll('#home-product-grid .product-card').forEach(card => {
            const cardCat = card.getAttribute('data-cat');
            if (selectedCat === 'all' || cardCat === selectedCat) {
                card.style.display = 'flex';
                card.style.animation = 'fadeInUp 0.35s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (homeStoreFilters.length > 0) {
        homeStoreFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedCat = btn.getAttribute('data-home-cat');
                filterHomeProducts(selectedCat);
            });
        });
    }

    if (homeStoryCategories.length > 0) {
        homeStoryCategories.forEach(item => {
            item.addEventListener('click', () => {
                const selectedCat = item.getAttribute('data-story-cat');
                filterHomeProducts(selectedCat);
            });
        });
    }

    // ============================================================
    // HOMEPAGE AMAZON SEARCH BAR LOGIC
    // ============================================================
    const homeSearchInput = document.getElementById('home-amazon-search');
    const homeSearchBtn = document.getElementById('home-amazon-search-btn');

    function executeHomeSearch() {
        if (!homeSearchInput) return;
        const query = homeSearchInput.value.toLowerCase().trim();
        const storeShowcase = document.getElementById('store-showcase');
        if (storeShowcase && query) {
            const headerOffset = 130;
            const targetPos = storeShowcase.offsetTop - headerOffset;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
        if (!query) {
            filterHomeProducts('all');
            return;
        }

        // Deactivate category active states when searching
        homeStoryCategories.forEach(b => b.classList.remove('active'));
        homeStoreFilters.forEach(b => b.classList.remove('active'));

        homeProductCards.forEach(card => {
            const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
            const cat = card.getAttribute('data-cat')?.toLowerCase() || '';
            if (title.includes(query) || desc.includes(query) || cat.includes(query)) {
                card.style.display = 'flex';
                card.style.animation = 'fadeInUp 0.35s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (homeSearchInput) {
        homeSearchInput.addEventListener('input', executeHomeSearch);
        homeSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeHomeSearch();
            }
        });
    }

    if (homeSearchBtn) {
        homeSearchBtn.addEventListener('click', executeHomeSearch);
    }

    // ============================================================
    // HOMEPAGE QUICK BUY BOTTOM SHEET MODAL
    // ============================================================
    const quickModal = document.getElementById('quick-buy-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalImg = document.getElementById('modal-product-img');
    const modalTitle = document.getElementById('modal-product-title');
    const modalPrice = document.getElementById('modal-product-price');
    const modalStrike = document.getElementById('modal-product-strike');
    const modalEngraveInput = document.getElementById('modal-engrave-input');
    const modalWaSubmitBtn = document.getElementById('modal-wa-submit-btn');
    const qtyButtons = document.querySelectorAll('.qty-btn');

    let currentModalProduct = {
        title: '',
        price: '',
        qty: '1 Pc (Sample)'
    };

    function updateModalWaLink() {
        if (!modalWaSubmitBtn) return;
        const engraveText = modalEngraveInput ? modalEngraveInput.value.trim() : '';
        const customPart = engraveText ? `\nCustomisation/Logo: ${engraveText}` : '';
        const message = `Hello Design Suvidha! I want to order from your Store:\n\n*Product:* ${currentModalProduct.title}\n*Price:* ${currentModalProduct.price}\n*Quantity:* ${currentModalProduct.qty}${customPart}\n\nPlease confirm availability and share payment/dispatch details.`;
        modalWaSubmitBtn.href = `https://wa.me/918739904737?text=${encodeURIComponent(message)}`;
    }

    if (quickModal) {
        // Wire up all "Order" buttons on homepage
        document.querySelectorAll('#home-product-grid .product-card').forEach(card => {
            const orderBtn = card.querySelector('.btn-order-wa');
            if (!orderBtn) return;

            orderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const title = card.querySelector('.product-title')?.textContent.trim() || 'Product';
                const price = card.querySelector('.price-main')?.textContent.trim() || '';
                const strike = card.querySelector('.price-strike')?.textContent.trim() || '';
                const img = card.querySelector('.product-thumb-img')?.getAttribute('src') || '';

                currentModalProduct.title = title;
                currentModalProduct.price = price;
                currentModalProduct.qty = '1 Pc (Sample)';

                if (modalTitle) modalTitle.textContent = title;
                if (modalPrice) modalPrice.textContent = price;
                if (modalStrike) modalStrike.textContent = strike;
                if (modalImg) modalImg.src = img;
                if (modalEngraveInput) modalEngraveInput.value = '';

                // Reset qty buttons
                qtyButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-qty') === '1'));

                updateModalWaLink();
                quickModal.classList.add('active');
            });
        });

        // Close modal
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => quickModal.classList.remove('active'));
        }
        quickModal.addEventListener('click', (e) => {
            if (e.target === quickModal) quickModal.classList.remove('active');
        });

        // Qty pills
        qtyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                qtyButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentModalProduct.qty = `${btn.textContent.trim()}`;
                updateModalWaLink();
            });
        });

        // Custom details input
        if (modalEngraveInput) {
            modalEngraveInput.addEventListener('input', updateModalWaLink);
        }
    }


    // ============================================================
    
    // ================================================// ============================================================
    // DYNAMIC PRODUCTS LOADER (Google Drive Catalog + Admin Sync)
    // ============================================================
    const CURRENT_CATALOG_VERSION = 'ds_v3_accurate_drive_catalog';

    const DEFAULT_STORE_PRODUCTS = [
    {
        "id": "prod-mug-morning",
        "title": "Morning Ceramic Mug – 330 ml",
        "category": "mugs",
        "catLabel": "Personalised Mug",
        "price": 199,
        "strike": 299,
        "badge": "Best Seller 🔥",
        "img": "assets/products/product_1.jpg",
        "desc": "Your Day, Your Mug, Your Way. Glossy ceramic with smooth premium finish. Vibrant HD sublimation print that stays bright sip after sip.",
        "features": [
            "Personalize It: Photo • Name • Logo",
            "Glossy Ceramic Smooth Premium Finish",
            "330 ML Perfect Everyday Size"
        ]
    },
    {
        "id": "prod-mug-inner-color",
        "title": "Choose Your Color Inner Mug – 330 ml",
        "category": "mugs",
        "catLabel": "Personalised Mug",
        "price": 230,
        "strike": 340,
        "badge": "Trending ✨",
        "img": "assets/products/product_3.jpg",
        "desc": "White body with colorful inside & handle. Vibrant inner colors: Red, Blue, Yellow, Green, Pink, and Black with high contrast exterior print.",
        "features": [
            "6 Vibrant Inner Color Options",
            "White Body with Color Inside & Handle",
            "High Contrast Sublimation Photo Print"
        ]
    },
    {
        "id": "prod-mug-heartbeat",
        "title": "Heartbeat Mug – 330 ml (Heart-Shaped Handle)",
        "category": "mugs",
        "catLabel": "Personalised Mug",
        "price": 249,
        "strike": 380,
        "badge": "Special Gift ❤️",
        "img": "assets/products/product_7.jpg",
        "desc": "Heartbeat Mug with unique heart-shaped handle. Perfect for anniversary gifts, couple photos, birthdays, and special expressions.",
        "features": [
            "Heart-Shaped Handle: Unique & Eye-Catching",
            "Personalize: Photo • Name • Message",
            "330 ML Perfect Everyday Size"
        ]
    },
    {
        "id": "prod-mug-mini-chai",
        "title": "Mini Ceramic Chai Mug – 190 ml",
        "category": "mugs",
        "catLabel": "Personalised Mug",
        "price": 199,
        "strike": 280,
        "badge": "Chai Lovers ☕",
        "img": "assets/products/product_9.jpg",
        "desc": "Authentic 190 ml portion—the exact gold-standard volume for Indian chai, filter coffee, or espresso. Available in Standard & Fine Ceramic.",
        "features": [
            "190 ml Ideal Chai/Espresso Size",
            "Standard & Fine Ceramic Quality Options",
            "Custom Photo • Text • Logo Branding"
        ]
    },
    {
        "id": "prod-cardholder-solid",
        "title": "Solid Series Card Holder",
        "category": "cardholders",
        "catLabel": "Card Holder",
        "price": 149,
        "strike": 249,
        "badge": "Solid Series",
        "img": "assets/products/product_11.jpg",
        "desc": "Carry with Strength. Lead with Style. Vibrant solid colors add a positive touch. Slim and pocket-friendly compact design with steel clip.",
        "features": [
            "Solid Colors: Mint Green, Yellow, Red",
            "Slim & Pocket-Friendly Compact Design",
            "Steel Clip & Secure Card Protection"
        ]
    },
    {
        "id": "prod-cardholder-signature",
        "title": "Signature Pattern Card Holder",
        "category": "cardholders",
        "catLabel": "Card Holder",
        "price": 179,
        "strike": 299,
        "badge": "Luxury Textured",
        "img": "assets/products/product_13.jpg",
        "desc": "Carry with Strength. Lead with Style. Luxury textured finish with refined pattern for a stylish look. Keeps your cards safe and organized.",
        "features": [
            "Refined Luxury Textured Finish",
            "Colors: Black, Maroon, Pink",
            "Durable Stainless Steel Accent & Clasp"
        ]
    },
    {
        "id": "prod-cardholder-commander",
        "title": "Commander Edition Card Holder",
        "category": "cardholders",
        "catLabel": "Card Holder",
        "price": 189,
        "strike": 299,
        "badge": "Commander Edition 🎖️",
        "img": "assets/products/product_15.jpg",
        "desc": "Bold design, everyday utility. Military-inspired bold camouflage finish with a distinctive executive look. Compact and lightweight.",
        "features": [
            "Military-Inspired Camouflage Design",
            "Slim & Pocket-Friendly Build",
            "Stainless Steel Safe Engraving Plate"
        ]
    },
    {
        "id": "prod-cardholder-goldaccent",
        "title": "Gold Accent Card Holder",
        "category": "cardholders",
        "catLabel": "Card Holder",
        "price": 199,
        "strike": 320,
        "badge": "Gold Accent 🌟",
        "img": "assets/products/product_17.jpg",
        "desc": "Professional look, everyday convenience. Premium gold accent for a refined look. Slim & compact, easily fits in pocket or bag.",
        "features": [
            "Premium Gold Curved Accent",
            "Available in 3 Colors: Black, Brown, Navy",
            "Laser Engraved Personal Name/Brand"
        ]
    },
    {
        "id": "prod-cardholder-magnetic",
        "title": "NextGen Magnetic Visiting Card Case",
        "category": "cardholders",
        "catLabel": "Card Holder",
        "price": 229,
        "strike": 350,
        "badge": "Magnetic Cap 🧲",
        "img": "assets/products/product_19.jpg",
        "desc": "Executive magnetic cap snap closure. Polished stainless steel base with textured leatherette lid. Holds 15-20 business cards securely.",
        "features": [
            "Precision Magnetic Snap-Close Action",
            "Polished Stainless Steel Trim Frame",
            "Stores 15–20 Standard Visiting Cards"
        ]
    },
    {
        "id": "prod-pen-click",
        "title": "Classic Metal Click Pen",
        "category": "pens",
        "catLabel": "Branded Metal Pen",
        "price": 90,
        "strike": 150,
        "badge": "Classic Design",
        "img": "assets/products/product_20.jpg",
        "desc": "Classic design, everyday performance. Premium metal body with smooth click action. Permanent & elegant laser engraved brand or name.",
        "features": [
            "Smooth Click Action: Press, Write, Repeat",
            "Colors: Black, White, Blue, Grey, Maroon",
            "Permanent Precision Laser Engraving"
        ]
    },
    {
        "id": "prod-pen-box",
        "title": "Plastic Pen Presentation Box",
        "category": "pens",
        "catLabel": "Pen Gift Box",
        "price": 45,
        "strike": 80,
        "badge": "Gift Box 🎁",
        "img": "assets/products/product_21.jpg",
        "desc": "Simple, practical, perfect for gifting. Durable plastic body with moulded interior for secure pen fit. Available in Silver & Gold.",
        "features": [
            "Available in 2 Finishes: Silver & Gold",
            "Moulded Interior Secures Pen Firmly",
            "Ideal for Corporate Gifting & Bundles"
        ]
    },
    {
        "id": "prod-pen-magnetic-gel",
        "title": "Premium Magnetic Gel Metal Pen",
        "category": "pens",
        "catLabel": "Branded Metal Pen",
        "price": 199,
        "strike": 299,
        "badge": "Magnetic Cap 🧲",
        "img": "assets/products/product_24.jpg",
        "desc": "Smart magnetic cap with snap-close convenience. Ultra-smooth gel writing mechanism designed for a smarter writing experience.",
        "features": [
            "Pull Up to Write, Snap Close Automatically",
            "Smooth, Precise, Effortless Gel Refill",
            "Cap / Barrel Laser Engraved Branding"
        ]
    },
    {
        "id": "prod-pen-black-twist",
        "title": "Premium Black Metal Pen (Twist Action)",
        "category": "pens",
        "catLabel": "Branded Metal Pen",
        "price": 229,
        "strike": 350,
        "badge": "Black is Class",
        "img": "assets/products/product_27.jpg",
        "desc": "Black Is Class. Premium metal finish with elegant rose gold clip design and smooth twist action. Built to impress in boardrooms.",
        "features": [
            "Smooth Twist to Write / Twist Back to Close",
            "Elegant Rose Gold Clip & Dual Ring Accents",
            "Matte Black Body with Permanent Engraving"
        ]
    },
    {
        "id": "prod-pen-textured-grip",
        "title": "Premium Textured Grip Metal Pen",
        "category": "pens",
        "catLabel": "Branded Metal Pen",
        "price": 199,
        "strike": 300,
        "badge": "Textured Grip",
        "img": "assets/products/product_29.jpg",
        "desc": "Comfortable grip, professional impression. Micro-textured knurled grip zone provides non-slip control during long writing sessions.",
        "features": [
            "Anti-Slip Micro-Textured Grip Zone",
            "Smooth Twist Action Mechanism",
            "Durable Metal Build with Laser Engraving"
        ]
    },
    {
        "id": "prod-pen-gold-accent",
        "title": "Premium Gold Accent Metal Pen",
        "category": "pens",
        "catLabel": "Branded Metal Pen",
        "price": 249,
        "strike": 399,
        "badge": "Gold Accent 👑",
        "img": "assets/products/product_32.jpg",
        "desc": "Simple. Stylish. Signature. Flagship metallic pen accented with radiant gold rings and clip. Smooth twist mechanism and weighted balance.",
        "features": [
            "Polished Gold Clip & Accent Trim Rings",
            "Smooth Effortless Twist Writing Action",
            "Precision Laser Engraving on Cap or Body"
        ]
    },
    {
        "id": "prod-keychain-oval",
        "title": "Silver Oval Metal Keychain",
        "category": "keychains",
        "catLabel": "Custom Keychain",
        "price": 89,
        "strike": 149,
        "badge": "Carry Style",
        "img": "assets/products/product_34.jpg",
        "desc": "Carry Style. Leave a Mark. Compact and easy to carry with durable metal build and premium matte black inlay for laser engraving.",
        "features": [
            "Compact & Easy to Carry Oval Profile",
            "Durable Heavy Metal Construction",
            "Permanent Custom Laser Engraving"
        ]
    },
    {
        "id": "prod-keychain-house",
        "title": "House Shape Metal Keychain",
        "category": "keychains",
        "catLabel": "Custom Keychain",
        "price": 99,
        "strike": 160,
        "badge": "Real Estate Special 🏠",
        "img": "assets/products/product_36.jpg",
        "desc": "Carry A Little Home With You. Distinctive house-shaped profile with premium polished finish. Perfect for Real Estate, Builders & Griha Pravesh.",
        "features": [
            "Iconic House Silhouette Shape",
            "Durable & Polished Chrome Build",
            "Ideal for Branding, Real Estate & Home Gifts"
        ]
    },
    {
        "id": "prod-keychain-round",
        "title": "Round Metal Keychain",
        "category": "keychains",
        "catLabel": "Custom Keychain",
        "price": 89,
        "strike": 149,
        "badge": "Round Metal",
        "img": "assets/products/product_38.jpg",
        "desc": "Simple. Strong. Made for Every Day. Classic circular medal medallion design crafted from durable metal for corporate & personal gifting.",
        "features": [
            "Durable Solid Metal Construction",
            "High-Contrast Laser Logo Engraving",
            "Heavy-Duty 30mm Split Key Ring"
        ]
    },
    {
        "id": "prod-keychain-capsule",
        "title": "Capsule Metal Keychain",
        "category": "keychains",
        "catLabel": "Custom Keychain",
        "price": 99,
        "strike": 169,
        "badge": "Capsule Design",
        "img": "assets/products/product_40.jpg",
        "desc": "Small in Size. Big on Style. Sleek capsule geometry available in Silver, Gold, and Rose Gold border options with matte black face.",
        "features": [
            "Available in Silver, Gold & Rose Gold",
            "Sleek Rounded Capsule Design",
            "Laser Engraved City, Brand or Personal Name"
        ]
    },
    {
        "id": "prod-keychain-carabiner",
        "title": "Carabiner Dual Ring Keychain",
        "category": "keychains",
        "catLabel": "Custom Keychain",
        "price": 129,
        "strike": 210,
        "badge": "Double Function",
        "img": "assets/products/product_42.jpg",
        "desc": "One Keychain. Double Function. Features carabiner lock design, dual ring setup, and 360° rotatable swivel hook for ultimate utility.",
        "features": [
            "Spring Carabiner Lock & Belt Clip",
            "Dual Ring Setup for Keys & Remotes",
            "360° Rotatable Heavy Duty Swivel Hook"
        ]
    },
    {
        "id": "prod-keychain-leather",
        "title": "Premium PU Leather Keychain",
        "category": "keychains",
        "catLabel": "Custom Keychain",
        "price": 119,
        "strike": 199,
        "badge": "PU Leather",
        "img": "assets/products/product_44.jpg",
        "desc": "Crafted for a Lasting Impression. Supple premium PU leather loop combined with precision laser engraved metal plate.",
        "features": [
            "Premium PU Leather in Black & Brown",
            "Precision Laser Engraving on Steel Plate",
            "Durable Heavy-Duty Key Ring"
        ]
    },
    {
        "id": "prod-keychain-opener",
        "title": "Carabiner Bottle Opener Keychain",
        "category": "keychains",
        "catLabel": "Custom Keychain",
        "price": 139,
        "strike": 220,
        "badge": "2-in-1 Opener 🍾",
        "img": "assets/products/product_46.jpg",
        "desc": "Smart Design. Strong Utility. Combines a sturdy keychain carabiner and functional bottle opener. Practical everyday accessory.",
        "features": [
            "2-in-1 Carabiner Clip & Bottle Opener",
            "Available in 5 Colors: Black, Blue, White, Brown, Tan",
            "Sturdy Metal Build with Secure Key Ring"
        ]
    },
    {
        "id": "prod-diary-magnetic",
        "title": "Magnetic Lock Executive Diary",
        "category": "diaries",
        "catLabel": "Executive Diary",
        "price": 299,
        "strike": 450,
        "badge": "Magnetic Lock 🔒",
        "img": "assets/products/product_48.jpg",
        "desc": "Premium magnetic lock with silver or gold metal plate. 192 ruled pages (80 GSM paper) for smooth writing. Laser engraved name or logo.",
        "features": [
            "Concealed Magnetic Lock Flap with Engraved Plate",
            "192 Ruled Pages (80 GSM Paper)",
            "Available in Black & Rich Brown Leatherette"
        ]
    },
    {
        "id": "prod-diary-color-reveal",
        "title": "Color Reveal Executive Diary (A5)",
        "category": "diaries",
        "catLabel": "Executive Diary",
        "price": 279,
        "strike": 399,
        "badge": "Color Reveal 🎨",
        "img": "assets/products/product_49.jpg",
        "desc": "Laser printing that reveals vibrant color! Premium PU cover with integrated elastic closure and pen loop. Available in Blue, Orange & Green.",
        "features": [
            "Laser Engraving Reveals Vibrant Accent Color",
            "A5 Size (15 x 21 cm) / 192 Pages 80 GSM Paper",
            "Elastic Closure & Matching Pen Loop"
        ]
    },
    {
        "id": "prod-diary-roundlock",
        "title": "Royal Round Lock Executive Diary",
        "category": "diaries",
        "catLabel": "Executive Diary",
        "price": 329,
        "strike": 499,
        "badge": "Royal Round Lock 👑",
        "img": "assets/products/product_50.jpg",
        "desc": "Distinctive round lock with elegant and unique gold design. Superior quality PU cover with regal patterned border and personalized engraving.",
        "features": [
            "Distinctive Gold Round Lock Clasp",
            "Superior Quality Textured Navy PU Cover",
            "Personalised Laser Engraved Brand / Name"
        ]
    },
    {
        "id": "prod-diary-gold-border",
        "title": "Gold Double-Border Executive Diary",
        "category": "diaries",
        "catLabel": "Executive Diary",
        "price": 349,
        "strike": 520,
        "badge": "Gold Gilded 🌟",
        "img": "assets/products/product_51.jpg",
        "desc": "A Diary for Brighter Days. Elegant double-line gold border design with stylish lined texture on premium PU cover and engraved metal clasp.",
        "features": [
            "Classic Double-Line Gold Foil Border",
            "Stylish Lined Texture Premium PU Cover",
            "Personalised Laser Engraving on Magnetic Lock"
        ]
    },
    {
        "id": "prod-mousepad-desk",
        "title": "Non-Slip Custom Mouse Pad (7x9.5\")",
        "category": "mousepads",
        "catLabel": "Office Accessory",
        "price": 99,
        "strike": 199,
        "badge": "Best Value 🖱️",
        "img": "assets/products/product_52.jpg",
        "desc": "Smooth fabric surface for precise & comfortable mouse movement. 3 mm thickness balanced everyday comfort with anti-slip rubber base.",
        "features": [
            "Smooth Micro-Weave Fabric Surface",
            "3 MM Thickness for Balanced Comfort",
            "Non-Slip Natural Rubber Base (7 x 9.5 Inch)"
        ]
    },
    {
        "id": "prod-bottle-temperature",
        "title": "Smart LED Temperature Bottle – 500 ml",
        "category": "drinkware",
        "catLabel": "Smart Drinkware",
        "price": 299,
        "strike": 499,
        "badge": "Smart LED 🌡️",
        "img": "assets/products/product_53.jpg",
        "desc": "Touch-activated LED temperature display lid. 304 food-grade stainless steel with 6-12 hours hot/cold vacuum insulation and 500-day battery.",
        "features": [
            "Touch-Activated Real-Time Temperature Display",
            "Double Wall SUS 304 Stainless Steel",
            "Leak-Proof Screw Lid & Stable Anti-Slip Base"
        ]
    },
    {
        "id": "prod-bottle-rope",
        "title": "Vacuum Bottle with Carry Rope – 500 ml",
        "category": "drinkware",
        "catLabel": "Smart Drinkware",
        "price": 349,
        "strike": 550,
        "badge": "Sport Lifestyle 🏃",
        "img": "assets/products/product_54.jpg",
        "desc": "Features an easy-carry rope convenient for work & travel. 10 hours hot and 30 hours cold double-wall insulation with leak-proof screw cap.",
        "features": [
            "Easy-Carry Rope Lanyard Handle",
            "10 Hrs Hot • 30 Hrs Cold Retention",
            "304 Stainless Steel with Leak-Proof Screw Cap"
        ]
    },
    {
        "id": "prod-bottle-matte-black",
        "title": "Matte Black Vacuum Bottle – 500 ml",
        "category": "drinkware",
        "catLabel": "Smart Drinkware",
        "price": 449,
        "strike": 680,
        "badge": "Stealth Matte 🖤",
        "img": "assets/products/product_55.jpg",
        "desc": "Matte black vacuum bottle in sleek corporate finish. Double-wall stainless steel vacuum insulation with leak-proof lid for hot & cold protection.",
        "features": [
            "Tactile Non-Slip Matte Stealth Finish",
            "Double-Wall Stainless Steel Vacuum Insulation",
            "Leak-Proof Secure Closure for Carrying"
        ]
    },
    {
        "id": "prod-tumbler-straw",
        "title": "Vacuum Tumbler with Straw – 900 ml",
        "category": "drinkware",
        "catLabel": "Smart Drinkware",
        "price": 549,
        "strike": 850,
        "badge": "Mega 900ml 🥤",
        "img": "assets/products/product_56.jpg",
        "desc": "Massive 900 ml capacity for all-day hydration. 18/8 stainless steel double-wall vacuum insulation with reusable straw and folding carry handle.",
        "features": [
            "Massive 900 ml Hydration Capacity",
            "18/8 Stainless Steel Double-Wall Vacuum",
            "Reusable Straw & Ergonomic Carry Handle"
        ]
    }
];

    function getLiveStoreProducts() {
        try {
            const version = localStorage.getItem('ds_catalog_version');
            if (version !== CURRENT_CATALOG_VERSION) {
                localStorage.setItem('ds_products', JSON.stringify(DEFAULT_STORE_PRODUCTS));
                localStorage.setItem('ds_catalog_version', CURRENT_CATALOG_VERSION);
                return DEFAULT_STORE_PRODUCTS;
            }
            const stored = localStorage.getItem('ds_products');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { console.error(e); }
        // Initialize localStorage with defaults
        localStorage.setItem('ds_products', JSON.stringify(DEFAULT_STORE_PRODUCTS));
        localStorage.setItem('ds_catalog_version', CURRENT_CATALOG_VERSION);
        return DEFAULT_STORE_PRODUCTS;
    }

    function renderLiveHomeProductsGrid() {
        const grid = document.getElementById('home-product-grid');
        if (!grid) return;

        const products = getLiveStoreProducts();
        let html = '';

        let waOrderPhone = '918739904737';
        try {
            const s = JSON.parse(localStorage.getItem('ds_website_settings') || 'null');
            if (s && s.whatsapp) waOrderPhone = s.whatsapp;
        } catch(e) {}

        const wishlist = (typeof getWishlist === 'function') ? getWishlist() : [];

        products.forEach(p => {
            const stock = p.stock !== undefined ? p.stock : 50;
            const isOutOfStock = stock === 0;
            const discPercent = p.strike ? Math.round(((p.strike - p.price) / p.strike) * 100) : 35;
            const featuresHtml = (p.features || []).map(f => `<div class="product-feat-bullet"><span class="feat-dot"></span><span>${f}</span></div>`).join('');
            const badgeText = isOutOfStock ? 'Sold Out 🔴' : (p.badge || 'Best Seller 🔥');
            const lowStockHtml = (!isOutOfStock && stock <= 15) ? `<span style="font-size: 11px; color: #b45309; font-weight: 700; display: block; margin-top: 2px;">⚠️ Only ${stock} left in stock!</span>` : '';
            const isWishlisted = wishlist.some(item => item.id === p.id);

            const actionButtons = isOutOfStock
                ? `
                    <button type="button" class="btn-add-cart disabled" style="opacity: 0.6; cursor: not-allowed; background: #e2e8f0; color: #64748b;" disabled>Sold Out</button>
                    <a href="https://wa.me/${waOrderPhone}?text=${encodeURIComponent('Hello Design Suvidha, when will ' + p.title + ' be back in stock?')}" target="_blank" class="btn-buy-instant btn-order-wa" style="background: #475569;">Notify Me</a>
                `
                : `
                    <button type="button" class="btn-add-cart" data-id="${p.id}" data-title="${p.title}" data-price="${p.price}" data-img="${p.img}">🛒 Add</button>
                    <button type="button" class="btn-buy-instant btn-open-pdp" data-id="${p.id}" style="background: #ffa41c; color: #0f1111; border: none; font-weight: 800; cursor: pointer; padding: 7px 12px; border-radius: 6px;">Buy Now</button>
                `;

            html += `
                <div class="product-card" data-cat="${p.category || 'mugs'}" data-id="${p.id}">
                    <div class="product-thumb-container" style="position: relative;">
                        <button type="button" class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${p.id}" title="Save to Wishlist">♥</button>
                        <img src="${p.img || 'assets/products/product_1.jpg'}" alt="${p.title}" class="product-thumb-img card-pdp-trigger" data-id="${p.id}" loading="lazy" style="cursor: pointer;">
                        <span class="product-badge-float" ${isOutOfStock ? 'style="background: #dc2626; color: #fff;"' : ''}>${badgeText}</span>
                        <span class="product-discount-float">${discPercent}% OFF</span>
                        <span class="assured-badge">🛡️ DS Assured</span>
                    </div>
                    <div class="product-body">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                            <span class="product-cat-tag">${(p.catLabel || p.category || 'Gift Item').toUpperCase()}</span>
                            <div class="card-pdp-trigger" data-id="${p.id}" style="cursor: pointer;">
                                <span class="star-rating-pill">4.9 ★</span>
                                <span class="rating-count-text">(Reviews)</span>
                            </div>
                        </div>
                        <h3 class="product-title card-pdp-trigger" data-id="${p.id}" style="cursor: pointer;" title="Click to view details & customize">${p.title}</h3>
                        <p class="product-desc">${p.desc || ''}</p>
                        <div class="product-features-list">
                            ${featuresHtml}
                        </div>
                        ${lowStockHtml}
                        <span class="free-delivery-badge">🚚 Fast Dispatch · 100% Quality Assurance</span>
                        <div class="product-footer-row">
                            <div class="product-price-block card-pdp-trigger" data-id="${p.id}" style="cursor: pointer;">
                                <span class="price-main">₹${p.price}/-</span>
                                <div><span class="price-strike">${p.strike ? '₹' + p.strike : ''}</span><span class="price-unit"> Wholesale</span></div>
                            </div>
                            <div class="product-card-actions">
                                ${actionButtons}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

        // Wire Add to Cart buttons
        grid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const title = btn.getAttribute('data-title');
                const price = btn.getAttribute('data-price');
                const img = btn.getAttribute('data-img');
                if (typeof addToCart === 'function') {
                    addToCart(title, price, img);
                }
            });
        });

        // Wire card PDP trigger clicks
        grid.querySelectorAll('.card-pdp-trigger, .btn-open-pdp').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const prodId = el.getAttribute('data-id');
                if (typeof window.openProductDetailModal === 'function') {
                    window.openProductDetailModal(prodId);
                }
            });
        });

        // Wire card wishlist buttons
        grid.querySelectorAll('.card-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const prodId = btn.getAttribute('data-id');
                const prod = products.find(item => item.id === prodId);
                if (prod && typeof toggleWishlist === 'function') {
                    toggleWishlist(prod);
                }
            });
        });

        // Re-wire Quick Buy buttons if defined
        if (typeof wireQuickBuyModal === 'function') {
            wireQuickBuyModal();
        }
    }

    // Call live render on DOM load
    renderLiveHomeProductsGrid();

    // 14. E-COMMERCE CART ENGINE & LOCALSTORAGE PERSISTENCE
    // ============================================================
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('cart-drawer-close');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartDrawerItemCount = document.getElementById('cart-drawer-item-count');
    const headerCartCount = document.getElementById('header-cart-count');
    const cartSubtotalText = document.getElementById('cart-subtotal-text');
    const cartTotalText = document.getElementById('cart-total-text');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    let cart = [];
    try {
        const savedCart = localStorage.getItem('ds_cart');
        if (savedCart) cart = JSON.parse(savedCart);
    } catch (e) {
        cart = [];
    }

    function saveCart() {
        try {
            localStorage.setItem('ds_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }

    function openCart() {
        if (cartDrawerOverlay) cartDrawerOverlay.classList.add('active');
        renderCart();
    }

    function closeCart() {
        if (cartDrawerOverlay) cartDrawerOverlay.classList.remove('active');
    }

    function getCartTotalCount() {
        return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    }

    function getCartSubtotal() {
        return cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    }

    function updateCartBadge() {
        const totalCount = getCartTotalCount();
        if (headerCartCount) {
            headerCartCount.textContent = totalCount;
            headerCartCount.style.display = totalCount > 0 ? 'inline-flex' : 'none';
        }
        if (cartDrawerItemCount) {
            cartDrawerItemCount.textContent = totalCount;
        }
    }

    function renderCart() {
        updateCartBadge();
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-message" id="cart-empty-message">
                    <div class="cart-empty-icon">🛍️</div>
                    <p style="margin: 8px 0 16px; font-weight: 600; color: #0f1111;">Your shopping cart is empty.</p>
                    <a href="#featured-products" class="btn btn-sm btn-primary" id="cart-empty-browse-btn" style="display: inline-block;">Browse Products</a>
                </div>
            `;
            const browseBtn = document.getElementById('cart-empty-browse-btn');
            if (browseBtn) {
                browseBtn.addEventListener('click', () => closeCart());
            }
            if (cartSubtotalText) cartSubtotalText.textContent = '₹0';
            if (cartTotalText) cartTotalText.textContent = '₹0';
            return;
        }

        const subtotal = getCartSubtotal();
        if (cartSubtotalText) cartSubtotalText.textContent = '₹' + subtotal.toLocaleString('en-IN');
        if (cartTotalText) cartTotalText.textContent = '₹' + subtotal.toLocaleString('en-IN');

        let html = '<div class="cart-items-list" style="display: flex; flex-direction: column; gap: 12px;">';
        cart.forEach((item, index) => {
            html += `
                <div class="cart-item-row" style="display: flex; gap: 12px; padding: 12px; background: #fff; border: 1px solid #e7e7e7; border-radius: 8px; align-items: center;">
                    <img src="${item.img || 'design suvidha logo.png'}" alt="${item.title}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;">
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="margin: 0 0 4px; font-size: 13.5px; font-weight: 700; color: #0f1111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</h4>
                        <div style="font-size: 13px; font-weight: 800; color: #007185;">₹${item.price} <span style="font-size: 11px; font-weight: 400; color: #666;">each</span></div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                            <button type="button" class="btn-qty-mod" data-action="decrease" data-index="${index}" style="width: 24px; height: 24px; border: 1px solid #ccc; background: #f0f2f2; border-radius: 4px; cursor: pointer; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center;">-</button>
                            <span style="font-size: 13px; font-weight: 700; min-width: 18px; text-align: center;">${item.qty}</span>
                            <button type="button" class="btn-qty-mod" data-action="increase" data-index="${index}" style="width: 24px; height: 24px; border: 1px solid #ccc; background: #f0f2f2; border-radius: 4px; cursor: pointer; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center;">+</button>
                            <button type="button" class="btn-item-remove" data-index="${index}" style="margin-left: auto; background: none; border: none; color: #c40000; font-size: 11.5px; cursor: pointer; font-weight: 600;">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        cartItemsContainer.innerHTML = html;

        // Wire quantity modifiers and remove buttons
        cartItemsContainer.querySelectorAll('.btn-qty-mod').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                if (action === 'increase') {
                    cart[idx].qty += 1;
                } else if (action === 'decrease') {
                    cart[idx].qty -= 1;
                    if (cart[idx].qty <= 0) {
                        cart.splice(idx, 1);
                    }
                }
                saveCart();
                renderCart();
            });
        });

        cartItemsContainer.querySelectorAll('.btn-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                cart.splice(idx, 1);
                saveCart();
                renderCart();
            });
        });
    }

    function addToCart(title, price, img) {
        const cleanPrice = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;
        const cleanTitle = title || 'Custom Gift Product';
        const cleanImg = img || 'design suvidha logo.png';

        const existingItem = cart.find(item => item.title === cleanTitle);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                title: cleanTitle,
                price: cleanPrice,
                img: cleanImg,
                qty: 1
            });
        }
        saveCart();
        renderCart();
        openCart();
    }

    // Bind Add-to-Cart buttons across all cards
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            const title = btn.getAttribute('data-title') || card?.querySelector('.product-title')?.textContent.trim() || 'Product';
            const price = btn.getAttribute('data-price') || card?.querySelector('.price-main')?.textContent.trim() || '100';
            const img = btn.getAttribute('data-img') || card?.querySelector('.product-thumb-img')?.getAttribute('src') || '';
            addToCart(title, price, img);
        });
    });

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartDrawerOverlay) {
        cartDrawerOverlay.addEventListener('click', (e) => {
            if (e.target === cartDrawerOverlay) closeCart();
        });
    }

    // Initialize cart badge on load
    updateCartBadge();

    // ============================================================
    // 15. CHECKOUT MODAL & ORDER WORKFLOW
    // ============================================================
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutCloseBtn = document.getElementById('checkout-close-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const coSummarySubtotal = document.getElementById('co-summary-subtotal');
    const coSummaryTotal = document.getElementById('co-summary-total');

    function openCheckoutModal() {
        if (cart.length === 0) {
            alert('Your cart is empty! Please add products before checking out.');
            return;
        }
        closeCart();
        const subtotal = getCartSubtotal();
        if (coSummarySubtotal) coSummarySubtotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
        if (coSummaryTotal) coSummaryTotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
        if (checkoutModal) checkoutModal.classList.add('active');
    }

    function closeCheckoutModal() {
        if (checkoutModal) checkoutModal.classList.remove('active');
    }

    if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', openCheckoutModal);
    if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckoutModal);
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeCheckoutModal();
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('co-name')?.value.trim();
            const phone = document.getElementById('co-phone')?.value.trim();
            const email = document.getElementById('co-email')?.value.trim();
            const address = document.getElementById('co-address')?.value.trim();
            const city = document.getElementById('co-city')?.value.trim();
            const pincode = document.getElementById('co-pincode')?.value.trim();
            const notes = document.getElementById('co-custom-notes')?.value.trim();

            if (!name || !phone || !address || !city || !pincode) {
                alert('Please fill all required delivery details.');
                return;
            }

            const orderId = 'DS-ORD-' + Math.floor(100000 + Math.random() * 900000);
            const total = getCartSubtotal();
            const orderDate = new Date().toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const newOrder = {
                orderId: orderId,
                date: orderDate,
                items: [...cart],
                subtotal: total,
                total: total,
                customer: { name, phone, email, address, city, pincode, notes },
                status: 'Placed · Awaiting Dispatch'
            };

            // Save to ds_orders
            try {
                const pastOrders = JSON.parse(localStorage.getItem('ds_orders') || '[]');
                pastOrders.unshift(newOrder);
                localStorage.setItem('ds_orders', JSON.stringify(pastOrders));
            } catch (err) {
                console.error('Failed to save order to localStorage', err);
            }

            // Construct WhatsApp Order Message
            let itemsText = cart.map(it => '• ' + it.title + ' (Qty: ' + it.qty + ') - ₹' + (it.price * it.qty)).join('\n');
            let waMsg = '*NEW ORDER PLACED ON DESIGNSUVIDHA.COM* 🛍️\n' +
                        '*Order ID:* ' + orderId + '\n' +
                        '*Customer Name:* ' + name + '\n' +
                        '*Phone:* ' + phone + '\n' +
                        (email ? '*Email:* ' + email + '\n' : '') +
                        '*Delivery Address:* ' + address + ', ' + city + ' - ' + pincode + '\n\n' +
                        '*ORDER ITEMS:*\n' + itemsText + '\n\n' +
                        '*Total Payable:* ₹' + total + ' (Pan-India Free Shipping)\n' +
                        (notes ? '*Customization/Notes:* ' + notes + '\n\n' : '\n') +
                        'Please share UPI QR / Bank details for payment confirmation and tracking slip. Thank you!';

            // Reset cart
            cart = [];
            saveCart();
            renderCart();
            closeCheckoutModal();
            checkoutForm.reset();

            // Redirect to WhatsApp
            const waUrl = 'https://wa.me/918739904737?text=' + encodeURIComponent(waMsg);
            window.open(waUrl, '_blank');
        });
    }

    // ============================================================
    // 16. CUSTOMER ACCOUNT & ORDER HISTORY MODAL
    // ============================================================
    const accountModal = document.getElementById('account-modal');
    const openAccountBtn = document.getElementById('open-account-btn');
    const accountCloseBtn = document.getElementById('account-close-btn');
    const accountOrdersList = document.getElementById('account-orders-list');

    function renderAccountOrders() {
        if (!accountOrdersList) return;
        let orders = [];
        try {
            orders = JSON.parse(localStorage.getItem('ds_orders') || '[]');
        } catch (e) {
            orders = [];
        }

        if (orders.length === 0) {
            accountOrdersList.innerHTML = `
                <div style="text-align: center; padding: 25px 10px; color: #565959;" id="account-no-orders">
                    <div style="font-size: 35px; margin-bottom: 8px;">📦</div>
                    <p style="font-size: 13.5px; margin: 0; font-weight: 600; color: #0f1111;">No past orders found in this session.</p>
                    <p style="font-size: 12px; color: #888; margin-top: 4px;">Orders placed on this device will be tracked here automatically.</p>
                </div>
            `;
            return;
        }

        let ordersHtml = '<div style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto; padding-right: 4px;">';
        orders.forEach(ord => {
            const itemsSummary = (ord.items || []).map(i => i.title + ' (' + i.qty + ')').join(', ');
            ordersHtml += `
                <div style="background: #fdfdfd; border: 1px solid #e7e7e7; border-radius: 8px; padding: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 12px; font-weight: 800; color: #007185; background: #e7f4f5; padding: 2px 8px; border-radius: 4px;">${ord.orderId}</span>
                        <span style="font-size: 11px; color: #666;">${ord.date}</span>
                    </div>
                    <p style="margin: 4px 0 6px; font-size: 12.5px; color: #0f1111; line-height: 1.4;"><strong>Items:</strong> ${itemsSummary}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #eee; padding-top: 8px; margin-top: 6px;">
                        <div>
                            <span style="font-size: 11px; color: #666;">Status: </span>
                            <span style="font-size: 11.5px; font-weight: 700; color: #137333;">${ord.status || 'Active'}</span>
                        </div>
                        <div style="font-size: 14px; font-weight: 800; color: #0f1111;">₹${ord.total}</div>
                    </div>
                    <div style="margin-top: 8px; text-align: right;">
                        <a href="https://wa.me/918739904737?text=${encodeURIComponent('Hello Design Suvidha, I want to track my Order: ' + ord.orderId)}" target="_blank" style="font-size: 11.5px; color: #007185; text-decoration: underline; font-weight: 700;">Track on WhatsApp ➔</a>
                    </div>
                </div>
            `;
        });
        ordersHtml += '</div>';
        accountOrdersList.innerHTML = ordersHtml;
    }

    function openAccountModal() {
        renderAccountOrders();
        if (accountModal) accountModal.classList.add('active');
    }

    function closeAccountModal() {
        if (accountModal) accountModal.classList.remove('active');
    }

    if (openAccountBtn) openAccountBtn.addEventListener('click', openAccountModal);
    if (accountCloseBtn) accountCloseBtn.addEventListener('click', closeAccountModal);
    if (accountModal) {
        accountModal.addEventListener('click', (e) => {
            if (e.target === accountModal) closeAccountModal();
        });
    }

    // ============================================================
    // 17. SECTION 5: MERCHANDISING TABS FILTER
    // ============================================================
    const merchTabButtons = document.querySelectorAll('#merch-tabs .merch-tab-btn');
    const merchProductCards = document.querySelectorAll('#merch-product-grid .product-card');

    merchTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-merch-tab');
            merchTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            merchProductCards.forEach(card => {
                const cardType = card.getAttribute('data-merch-type');
                if (tab === 'bestsellers' && cardType === 'bestsellers') {
                    card.style.display = 'flex';
                } else if (tab === 'new-arrivals' && cardType === 'new-arrivals') {
                    card.style.display = 'flex';
                } else if (tab === 'corporate-kits' && cardType === 'corporate-kits') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ============================================================
    // 18. SECTION 7: CORPORATE BULK INQUIRY FORM
    // ============================================================
    const corpBulkForm = document.getElementById('corporate-bulk-form');
    const corpSuccess = document.getElementById('corp-form-success');

    if (corpBulkForm) {
        corpBulkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const company = document.getElementById('corp-company')?.value.trim();
            const person = document.getElementById('corp-person')?.value.trim();
            const phone = document.getElementById('corp-phone')?.value.trim();
            const email = document.getElementById('corp-email')?.value.trim();
            const category = document.getElementById('corp-category')?.value;
            const qty = document.getElementById('corp-qty')?.value;
            const budget = document.getElementById('corp-budget')?.value;
            const timeline = document.getElementById('corp-timeline')?.value.trim();
            const notes = document.getElementById('corp-notes')?.value.trim();

            if (!company || !person || !phone || !category || !qty || !timeline) {
                alert('Please fill all mandatory corporate gifting inquiry fields (*)');
                return;
            }

            const inquiryId = 'DS-B2B-' + Math.floor(10000 + Math.random() * 90000);
            const inquiryData = {
                inquiryId,
                date: new Date().toISOString(),
                company, person, phone, email, category, qty, budget, timeline, notes
            };

            try {
                const pastInquiries = JSON.parse(localStorage.getItem('ds_corporate_inquiries') || '[]');
                pastInquiries.unshift(inquiryData);
                localStorage.setItem('ds_corporate_inquiries', JSON.stringify(pastInquiries));
            } catch (err) {
                console.error('Failed to save inquiry to localStorage', err);
            }

            if (corpSuccess) corpSuccess.style.display = 'block';

            const corpWaMsg = '*CORPORATE & BULK GIFTING INQUIRY* 🏢\n' +
                              '*Inquiry ID:* ' + inquiryId + '\n' +
                              '*Company:* ' + company + '\n' +
                              '*Contact Person:* ' + person + '\n' +
                              '*Phone:* ' + phone + '\n' +
                              (email ? '*Official Email:* ' + email + '\n' : '') +
                              '*Product Category:* ' + category + '\n' +
                              '*Required Quantity:* ' + qty + '\n' +
                              '*Estimated Budget:* ' + budget + '\n' +
                              '*Target Delivery Deadline:* ' + timeline + '\n' +
                              (notes ? '*Customization/Branding Notes:* ' + notes + '\n\n' : '\n') +
                              'Please share official PDF quotation, bulk pricing tiers, and digital logo proof.';

            setTimeout(() => {
                corpBulkForm.reset();
                window.open('https://wa.me/918739904737?text=' + encodeURIComponent(corpWaMsg), '_blank');
            }, 800);
        });
    }

    // ============================================================
    // 18. SYNC ADMIN WEBSITE SETTINGS (Announcement, WhatsApp, etc.)
    // ============================================================
    try {
        const customSettings = JSON.parse(localStorage.getItem('ds_website_settings') || 'null');
        if (customSettings) {
            if (customSettings.announcement) {
                const annText = document.getElementById('announcement-text');
                if (annText) annText.textContent = customSettings.announcement;
            }
            if (customSettings.whatsapp) {
                document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
                    a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + customSettings.whatsapp);
                });
            }
        }
    } catch (e) { console.error('Failed to apply custom website settings', e); }

    // ============================================================
    // 19. WISHLIST ENGINE & PERSISTENCE
    // ============================================================
    const wishlistModal = document.getElementById('wishlist-modal');
    const openWishlistBtn = document.getElementById('open-wishlist-btn');
    const closeWishlistBtn = document.getElementById('wishlist-close-btn');
    const wishlistItemsContainer = document.getElementById('wishlist-items-container');
    const headerWishlistCount = document.getElementById('header-wishlist-count');
    const wishlistModalCount = document.getElementById('wishlist-modal-count');

    function getWishlist() {
        try {
            const saved = localStorage.getItem('ds_wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    function saveWishlist(list) {
        try {
            localStorage.setItem('ds_wishlist', JSON.stringify(list));
        } catch (e) {
            console.error(e);
        }
        updateWishlistUI();
    }

    function toggleWishlist(prod) {
        if (!prod || !prod.id) return;
        let list = getWishlist();
        const idx = list.findIndex(item => item.id === prod.id);
        if (idx >= 0) {
            list.splice(idx, 1);
        } else {
            list.push({
                id: prod.id,
                title: prod.title,
                price: prod.price,
                strike: prod.strike,
                img: prod.img,
                category: prod.category || 'mugs'
            });
        }
        saveWishlist(list);
    }

    function updateWishlistUI() {
        const list = getWishlist();
        const count = list.length;
        if (headerWishlistCount) headerWishlistCount.textContent = count;
        if (wishlistModalCount) wishlistModalCount.textContent = count + (count === 1 ? ' Item' : ' Items');

        // Update card buttons
        document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');
            if (list.some(item => item.id === id)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update PDP Wishlist button if open
        const pdpWishlistBtn = document.getElementById('pdp-wishlist-toggle-btn');
        if (pdpWishlistBtn && currentPdpProduct) {
            if (list.some(item => item.id === currentPdpProduct.id)) {
                pdpWishlistBtn.classList.add('active');
            } else {
                pdpWishlistBtn.classList.remove('active');
            }
        }

        renderWishlistModal();
    }

    function renderWishlistModal() {
        if (!wishlistItemsContainer) return;
        const list = getWishlist();

        if (list.length === 0) {
            wishlistItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 15px; color: #565959;">
                    <div style="font-size: 40px; margin-bottom: 10px; color: #cc0c39;">♡</div>
                    <h4 style="margin: 0 0 6px; font-size: 16px; color: #0f1111;">Your Wishlist is Empty</h4>
                    <p style="font-size: 13px; color: #565959; margin: 0 0 16px;">Save your favorite custom gifts, laser pens, and mugs here to buy later.</p>
                    <a href="#featured-products" onclick="if(wishlistModal) wishlistModal.classList.remove('active')" class="btn btn-sm" style="background: #ffd814; color: #0f1111; font-weight: 800; padding: 8px 18px; border-radius: 6px; text-decoration: none;">Browse Store ➔</a>
                </div>
            `;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 10px; max-height: 480px; overflow-y: auto;">';
        list.forEach((item, index) => {
            html += `
                <div style="display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #eaeded; border-radius: 8px; padding: 10px;">
                    <img src="${item.img || 'design suvidha logo.png'}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #eee; cursor: pointer;" onclick="openProductDetailModal('${item.id}'); if(wishlistModal) wishlistModal.classList.remove('active');">
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="font-size: 13px; font-weight: 700; color: #0f1111; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" onclick="openProductDetailModal('${item.id}'); if(wishlistModal) wishlistModal.classList.remove('active');">${item.title}</h4>
                        <div style="display: flex; align-items: baseline; gap: 6px;">
                            <span style="font-size: 14px; font-weight: 800; color: #b12704;">₹${item.price}</span>
                            ${item.strike ? `<span style="font-size: 11px; color: #888; text-decoration: line-through;">₹${item.strike}</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <button type="button" class="btn-move-to-cart" data-id="${item.id}" data-title="${item.title}" data-price="${item.price}" data-img="${item.img}" style="background: #ffd814; border: 1px solid #fcd200; font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 6px; cursor: pointer;">Move to Cart</button>
                        <button type="button" class="btn-remove-wishlist" data-index="${index}" style="background: none; border: none; color: #cc0c39; font-size: 16px; cursor: pointer; padding: 4px;" title="Remove">✕</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        wishlistItemsContainer.innerHTML = html;

        wishlistItemsContainer.querySelectorAll('.btn-move-to-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const title = btn.getAttribute('data-title');
                const price = btn.getAttribute('data-price');
                const img = btn.getAttribute('data-img');
                const id = btn.getAttribute('data-id');
                addToCart(title, price, img);
                let cur = getWishlist().filter(it => it.id !== id);
                saveWishlist(cur);
                if (wishlistModal) wishlistModal.classList.remove('active');
            });
        });

        wishlistItemsContainer.querySelectorAll('.btn-remove-wishlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                let cur = getWishlist();
                cur.splice(idx, 1);
                saveWishlist(cur);
            });
        });
    }

    if (openWishlistBtn) {
        openWishlistBtn.addEventListener('click', () => {
            updateWishlistUI();
            if (wishlistModal) wishlistModal.classList.add('active');
        });
    }

    if (closeWishlistBtn) {
        closeWishlistBtn.addEventListener('click', () => {
            if (wishlistModal) wishlistModal.classList.remove('active');
        });
    }

    if (wishlistModal) {
        wishlistModal.addEventListener('click', (e) => {
            if (e.target === wishlistModal) wishlistModal.classList.remove('active');
        });
    }

    // ============================================================
    // 20. PRINTVENUE / AMAZON STYLE PRODUCT DETAIL MODAL (PDP)
    // ============================================================
    const pdpModal = document.getElementById('pdp-modal');
    const pdpCloseBtn = document.getElementById('pdp-close-btn');
    const pdpMainImg = document.getElementById('pdp-main-img');
    const pdpStage = document.getElementById('pdp-stage');
    const pdpBreadcrumbCat = document.getElementById('pdp-breadcrumb-cat');
    const pdpBreadcrumbTitle = document.getElementById('pdp-breadcrumb-title');
    const pdpCatLabel = document.getElementById('pdp-cat-label');
    const pdpTitle = document.getElementById('pdp-title');
    const pdpPrice = document.getElementById('pdp-price');
    const pdpStrike = document.getElementById('pdp-strike');
    const pdpDiscountTag = document.getElementById('pdp-discount-tag');
    const pdpBadgeTag = document.getElementById('pdp-badge-tag');
    const pdpDescription = document.getElementById('pdp-description');
    const pdpFeaturesList = document.getElementById('pdp-features-list');
    const pdpEngraveText = document.getElementById('pdp-engrave-text');
    const pdpPreviewPill = document.getElementById('pdp-preview-pill');
    const pdpQtyMinus = document.getElementById('pdp-qty-minus');
    const pdpQtyPlus = document.getElementById('pdp-qty-plus');
    const pdpQtyDisplay = document.getElementById('pdp-qty-display');
    const pdpAddCartBtn = document.getElementById('pdp-add-cart-btn');
    const pdpBuyNowBtn = document.getElementById('pdp-buynow-btn');
    const pdpWishlistToggleBtn = document.getElementById('pdp-wishlist-toggle-btn');
    const pdpBtnPrev = document.getElementById('pdp-btn-prev');
    const pdpBtnNext = document.getElementById('pdp-btn-next');
    const pdpReviewTrigger = document.getElementById('pdp-review-trigger');

    let currentPdpProduct = null;
    let currentPdpIndex = 0;
    let currentPdpQty = 1;

    window.openProductDetailModal = function(productId) {
        const products = getLiveStoreProducts();
        if (!products || products.length === 0) return;

        let idx = products.findIndex(p => p.id === productId);
        if (idx === -1) idx = 0;
        currentPdpIndex = idx;
        const p = products[idx];
        currentPdpProduct = p;
        currentPdpQty = 1;

        // Populate elements
        if (pdpBreadcrumbCat) pdpBreadcrumbCat.textContent = (p.catLabel || p.category || 'GIFTING').toUpperCase();
        if (pdpBreadcrumbTitle) pdpBreadcrumbTitle.textContent = p.title;
        if (pdpCatLabel) pdpCatLabel.textContent = (p.catLabel || p.category || 'CUSTOM ITEM').toUpperCase();
        if (pdpTitle) pdpTitle.textContent = p.title;
        if (pdpPrice) pdpPrice.textContent = '₹' + p.price;
        if (pdpStrike) pdpStrike.textContent = p.strike ? '₹' + p.strike : '';
        
        const discPercent = p.strike ? Math.round(((p.strike - p.price) / p.strike) * 100) : 35;
        if (pdpDiscountTag) pdpDiscountTag.textContent = discPercent + '% OFF';
        if (pdpBadgeTag) pdpBadgeTag.textContent = p.badge || 'Best Seller 🔥';

        if (pdpDescription) pdpDescription.textContent = p.desc || 'Premium quality customized gift with high-precision printing or laser engraving.';

        // Image
        if (pdpMainImg) {
            pdpMainImg.src = p.img || 'assets/products/product_1.jpg';
            pdpMainImg.alt = p.title;
        }

        // Features list
        if (pdpFeaturesList) {
            const feats = p.features && p.features.length ? p.features : [
                'Permanent Precision Laser Engraving / High-Definition Print',
                'Durable Premium Grade Materials (Factory Direct)',
                'Includes Protective Gift Packaging with Free Delivery'
            ];
            pdpFeaturesList.innerHTML = feats.map(f => `<li>${f}</li>`).join('');
        }

        // Reset Qty & Personalization
        if (pdpQtyDisplay) pdpQtyDisplay.textContent = '1';
        if (pdpEngraveText) pdpEngraveText.value = '';
        if (pdpPreviewPill) pdpPreviewPill.textContent = 'YOUR NAME HERE';

        // Update Buy Now link
        updatePdpBuyNowLink();

        // Update Wishlist toggle state
        if (pdpWishlistToggleBtn) {
            const inWish = getWishlist().some(item => item.id === p.id);
            if (inWish) {
                pdpWishlistToggleBtn.classList.add('active');
            } else {
                pdpWishlistToggleBtn.classList.remove('active');
            }
        }

        // Render reviews for this product
        renderProductReviews(p.id);

        // Open modal
        if (pdpModal) pdpModal.classList.add('active');
    };

    function closeProductDetailModal() {
        if (pdpModal) pdpModal.classList.remove('active');
    }

    if (pdpCloseBtn) pdpCloseBtn.addEventListener('click', closeProductDetailModal);
    if (pdpModal) {
        pdpModal.addEventListener('click', (e) => {
            if (e.target === pdpModal) closeProductDetailModal();
        });
    }

    // Prev / Next Product Navigation
    if (pdpBtnPrev) {
        pdpBtnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            const products = getLiveStoreProducts();
            currentPdpIndex = (currentPdpIndex - 1 + products.length) % products.length;
            window.openProductDetailModal(products[currentPdpIndex].id);
        });
    }

    if (pdpBtnNext) {
        pdpBtnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            const products = getLiveStoreProducts();
            currentPdpIndex = (currentPdpIndex + 1) % products.length;
            window.openProductDetailModal(products[currentPdpIndex].id);
        });
    }

    // Personalization Live Preview & URL updater
    if (pdpEngraveText) {
        pdpEngraveText.addEventListener('input', () => {
            const val = pdpEngraveText.value.trim();
            if (pdpPreviewPill) {
                pdpPreviewPill.textContent = val ? val.toUpperCase() : 'YOUR NAME HERE';
            }
            updatePdpBuyNowLink();
        });
    }

    // Quantity modifiers in PDP
    if (pdpQtyMinus) {
        pdpQtyMinus.addEventListener('click', () => {
            if (currentPdpQty > 1) {
                currentPdpQty -= 1;
                if (pdpQtyDisplay) pdpQtyDisplay.textContent = currentPdpQty;
                updatePdpBuyNowLink();
            }
        });
    }

    if (pdpQtyPlus) {
        pdpQtyPlus.addEventListener('click', () => {
            currentPdpQty += 1;
            if (pdpQtyDisplay) pdpQtyDisplay.textContent = currentPdpQty;
            updatePdpBuyNowLink();
        });
    }

    function updatePdpBuyNowLink() {
        if (!pdpBuyNowBtn || !currentPdpProduct) return;
        let waPhone = '918739904737';
        try {
            const s = JSON.parse(localStorage.getItem('ds_website_settings') || 'null');
            if (s && s.whatsapp) waPhone = s.whatsapp;
        } catch(e) {}

        const engrave = (pdpEngraveText && pdpEngraveText.value.trim()) ? pdpEngraveText.value.trim() : 'Standard / No Engraving';
        const totalPrice = currentPdpProduct.price * currentPdpQty;

        const msg = `*INSTANT ORDER: ${currentPdpProduct.title}* 🛍️\n` +
                    `• Quantity: ${currentPdpQty} Pc(s)\n` +
                    `• Unit Price: ₹${currentPdpProduct.price}\n` +
                    `• Total Payable: ₹${totalPrice}\n` +
                    `• Customization / Engraving: "${engrave}"\n\n` +
                    `Please share payment details (UPI QR / Bank) and mockup preview. Thank you!`;

        pdpBuyNowBtn.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    }

    // Add to Cart from PDP
    if (pdpAddCartBtn) {
        pdpAddCartBtn.addEventListener('click', () => {
            if (!currentPdpProduct) return;
            const customNote = (pdpEngraveText && pdpEngraveText.value.trim()) ? ` [Engrave: ${pdpEngraveText.value.trim()}]` : '';
            const fullTitle = currentPdpProduct.title + customNote;
            
            for (let i = 0; i < currentPdpQty; i++) {
                addToCart(fullTitle, currentPdpProduct.price, currentPdpProduct.img);
            }
            closeProductDetailModal();
        });
    }

    // Wishlist Toggle in PDP
    if (pdpWishlistToggleBtn) {
        pdpWishlistToggleBtn.addEventListener('click', () => {
            if (currentPdpProduct) {
                toggleWishlist(currentPdpProduct);
            }
        });
    }

    // Review trigger smooth scroll
    if (pdpReviewTrigger) {
        pdpReviewTrigger.addEventListener('click', () => {
            const revSec = document.getElementById('pdp-reviews-section');
            if (revSec) revSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Countdown Timer (Printvenue Style: "Order within 07h : 36m : 45s for same-day dispatch")
    function initCountdownTimer() {
        const timerEl = document.getElementById('pdp-timer');
        if (!timerEl) return;
        let totalSeconds = 7 * 3600 + 36 * 60 + 45;

        setInterval(() => {
            totalSeconds--;
            if (totalSeconds <= 0) totalSeconds = 8 * 3600; // Reset next cycle
            const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(totalSeconds % 60).padStart(2, '0');
            timerEl.textContent = `${h}h : ${m}m : ${s}s`;
        }, 1000);
    }
    initCountdownTimer();

    // ============================================================
    // 21. CUSTOMER REVIEWS & 5-STAR RATING SYSTEM
    // ============================================================
    const DEFAULT_REVIEWS = {
        "prod-pen-click": [
            { name: "Vikram Rathore", rating: 5, date: "18 Oct 2026", comment: "Superb laser engraving on the metal body. Looks highly executive in meetings! Fast delivery to Delhi." },
            { name: "Pooja Mehta", rating: 5, date: "12 Oct 2026", comment: "Ordered 50 pieces for our company anniversary. Clean finish and writes very smooth. Highly recommended!" }
        ],
        "prod-pen-magnetic-gel": [
            { name: "Sunil Verma", rating: 5, date: "16 Oct 2026", comment: "The magnetic cap action is so satisfying and premium. Laser name engraving came out crisp." },
            { name: "Dr. Ananya Sen", rating: 5, date: "09 Oct 2026", comment: "Very smooth gel flow, does not smudge. Classy matte finish." }
        ],
        "prod-pen-black-twist": [
            { name: "Aditya Roy", rating: 5, date: "14 Oct 2026", comment: "Black & rose gold combination looks like a 1000 rupee luxury pen. Unbelievable wholesale rate." }
        ],
        "prod-mug-magic": [
            { name: "Neha Sharma", rating: 5, date: "19 Oct 2026", comment: "The magic photo reveal when pouring hot coffee is wonderful! My husband loved the birthday surprise." },
            { name: "Kunal Jain", rating: 5, date: "15 Oct 2026", comment: "Crisp HD photo print. Packed with double bubble wrap, arrived safely in Jaipur." }
        ],
        "prod-bottle-led-smart": [
            { name: "Manish Agarwal", rating: 5, date: "17 Oct 2026", comment: "Touch LED display works accurately. Keeps water ice-cold for 18+ hours. Name engraving looks top notch." }
        ],
        "prod-diary-magnetic": [
            { name: "Deepak Mittal", rating: 5, date: "11 Oct 2026", comment: "Magnetic lock clasp is sturdy. 80 GSM paper has zero bleed-through with fountain and roller pens." }
        ],
        "prod-card-magnetic": [
            { name: "Rohan Kapoor", rating: 5, date: "13 Oct 2026", comment: "High quality stainless steel and leatherette. Fits 18 cards without bulging." }
        ],
        "prod-keychain-house": [
            { name: "Shree Real Estate", rating: 5, date: "15 Oct 2026", comment: "Ordered 200 pcs for our apartment handover kits. Our clients loved the house shape with our brand logo!" }
        ]
    };

    function getProductReviews(prodId) {
        try {
            const all = JSON.parse(localStorage.getItem('ds_product_reviews') || '{}');
            if (all[prodId] && Array.isArray(all[prodId])) {
                return all[prodId];
            }
            if (DEFAULT_REVIEWS[prodId]) {
                return DEFAULT_REVIEWS[prodId];
            }
        } catch (e) {
            console.error(e);
        }
        return [
            { name: "Amit K.", rating: 5, date: "Yesterday", comment: "Exceptional quality and genuine laser engraving. Design Suvidha delivered on time!" },
            { name: "Suresh P.", rating: 5, date: "3 days ago", comment: "100% satisfied with the product finish. Customer support on WhatsApp is very responsive." }
        ];
    }

    function saveProductReview(prodId, newReview) {
        try {
            const all = JSON.parse(localStorage.getItem('ds_product_reviews') || '{}');
            if (!all[prodId]) {
                all[prodId] = getProductReviews(prodId);
            }
            all[prodId].unshift(newReview);
            localStorage.setItem('ds_product_reviews', JSON.stringify(all));
        } catch (e) {
            console.error(e);
        }
    }

    function renderProductReviews(prodId) {
        const reviewsListEl = document.getElementById('pdp-reviews-list');
        const countEl = document.getElementById('pdp-review-trigger');
        const summaryText = document.getElementById('pdp-reviews-summary-text');
        if (!reviewsListEl) return;

        const reviews = getProductReviews(prodId);
        const count = reviews.length;

        if (countEl) countEl.textContent = `(${count} Customer Reviews)`;
        if (summaryText) summaryText.textContent = `(4.9 out of 5 based on ${count} verified orders)`;

        let html = '';
        reviews.forEach(r => {
            const stars = '★'.repeat(r.rating || 5);
            html += `
                <div class="review-item-card">
                    <div class="review-item-top">
                        <div class="review-author">
                            <span>${r.name}</span>
                            <span class="verified-badge">✓ Verified Buyer</span>
                        </div>
                        <span class="review-date">${r.date}</span>
                    </div>
                    <div style="color: #ffa41c; font-size: 13px; font-weight: 800; margin-bottom: 2px;">${stars}</div>
                    <p class="review-comment">${r.comment}</p>
                </div>
            `;
        });

        reviewsListEl.innerHTML = html;
    }

    // Star Picker Logic
    let currentRatingSelected = 5;
    const starPicker = document.getElementById('review-star-picker');
    const pickedRatingLabel = document.getElementById('picked-rating-label');

    if (starPicker) {
        const stars = starPicker.querySelectorAll('.star-pick-btn');
        stars.forEach(btn => {
            btn.addEventListener('click', () => {
                const r = parseInt(btn.getAttribute('data-rating'), 10);
                currentRatingSelected = r;
                stars.forEach(s => {
                    const sr = parseInt(s.getAttribute('data-rating'), 10);
                    if (sr <= r) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                if (pickedRatingLabel) pickedRatingLabel.textContent = `${r} Star${r > 1 ? 's' : ''}`;
            });
        });
    }

    // Review Submit Handler
    const reviewSubmitBtn = document.getElementById('review-submit-btn');
    if (reviewSubmitBtn) {
        reviewSubmitBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('review-user-name');
            const commentInput = document.getElementById('review-user-comment');

            const name = nameInput?.value.trim();
            const comment = commentInput?.value.trim();

            if (!name || !comment) {
                alert('Please enter your name and a short review comment.');
                return;
            }

            if (!currentPdpProduct) return;

            const today = new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });

            const newRev = {
                name: name,
                rating: currentRatingSelected,
                date: today,
                comment: comment
            };

            saveProductReview(currentPdpProduct.id, newRev);
            renderProductReviews(currentPdpProduct.id);

            if (commentInput) commentInput.value = '';
            alert('🎉 Thank you! Your 5-star review has been published.');
        });
    }

    // Global category filter helper (used by Printvenue mega menu)
    window.filterLiveCategory = function(catName) {
        const filterBtns = document.querySelectorAll('#home-store-filters .filter-btn');
        const cards = document.querySelectorAll('#home-product-grid .product-card');

        filterBtns.forEach(b => {
            if (b.getAttribute('data-cat') === catName) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        cards.forEach(c => {
            const cardCat = c.getAttribute('data-cat');
            if (catName === 'all' || cardCat === catName) {
                c.style.display = 'flex';
            } else {
                c.style.display = 'none';
            }
        });

        const storeSection = document.getElementById('featured-products');
        if (storeSection) {
            storeSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Initialize wishlist count
    updateWishlistUI();

    console.log('🚀 Design Suvidha Fast Mobile Engine Initialized');
});

