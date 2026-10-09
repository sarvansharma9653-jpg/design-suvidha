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
    const homeProductCards = document.querySelectorAll('#home-product-grid .product-card');

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
        homeProductCards.forEach(card => {
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

    console.log('🚀 Design Suvidha Fast Mobile Engine Initialized');
});
