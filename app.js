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

    console.log('🚀 Design Suvidha Fast Mobile Engine Initialized');
});

