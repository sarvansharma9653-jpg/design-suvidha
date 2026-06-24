/* ========================================================================
   DESIGN SUVIDHA — 3D SCROLL-TRIGGERED ANIMATION ENGINE
   Handles: frame video player, 3D scroll animations, particles, nav, chatbot
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ============================================================
    // 1. GLOBAL SCROLL-DRIVEN FRAME VIDEO PLAYER
    //    Frames play throughout the ENTIRE page scroll
    // ============================================================
    const globalFrameImg = document.getElementById('global-frame-img');
    const totalFrames = 40;
    const frameDir = 'frame 2';
    const frames = [];
    let currentFrame = -1;

    // Preload all frames
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        img.src = `${frameDir}/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
        frames.push(img);
    }

    function updateGlobalFrame() {
        if (!globalFrameImg) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, scrollTop / docHeight));
        const frameIndex = Math.min(totalFrames - 1, Math.floor(progress * totalFrames));
        
        if (frameIndex !== currentFrame && frames[frameIndex] && frames[frameIndex].complete) {
            globalFrameImg.src = frames[frameIndex].src;
            currentFrame = frameIndex;
        }
    }

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

    // ============================================================
    // 4. PARTICLE BACKGROUND (Ambient Gaming Aesthetic)
    // ============================================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 60;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.radius = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.3 + 0.1;
                this.hue = Math.random() > 0.5 ? 263 : 188;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `hsla(263, 70%, 60%, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

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
                history.pushState(null, '', '/' + targetId);
                
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
            history.pushState(null, '', '/');
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

            setTimeout(() => {
                window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
                const successEl = document.getElementById('form-success-container');
                if (successEl) { successEl.style.display = 'block'; setTimeout(() => successEl.style.display = 'none', 5000); }
                form.reset();
            }, 1200);
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
                updateGlobalFrame();
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
    updateGlobalFrame();
    toggleBackToTop();

    // ============================================================
    // 13. LEAD GENERATION MODAL POPUP (Get Free Video)
    // ============================================================
    const modal = document.getElementById('free-video-modal');
    const modalCloseTrigger = document.getElementById('modal-close-trigger');
    const freeVideoNavBtn = document.getElementById('free-video-nav-btn');
    const freeVideoMobileBtn = document.getElementById('free-video-mobile-btn');
    const modalForm = document.getElementById('free-video-lead-form');

    function openModal() {
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent page scroll when modal is open
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = ''; // Restore page scroll
        }
    }

    // Trigger opening of modal
    if (freeVideoNavBtn) freeVideoNavBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (freeVideoMobileBtn) freeVideoMobileBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (modalCloseTrigger) modalCloseTrigger.addEventListener('click', closeModal);

    // Close modal when clicking on overlay background (outside the modal card)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // Auto-pop modal logic: Trigger popup after 6 seconds
    const POPUP_STORAGE_KEY = 'design_suvidha_free_video_popup_shown';
    const hasShownPopup = sessionStorage.getItem(POPUP_STORAGE_KEY); // Using sessionStorage to reset per browser session

    if (!hasShownPopup) {
        setTimeout(() => {
            // Check if another popup or form isn't actively focused/open
            if (modal && !modal.classList.contains('open')) {
                openModal();
                sessionStorage.setItem(POPUP_STORAGE_KEY, 'true');
            }
        }, 6000); // 6 seconds delay
    }

    // Form submission via AJAX to Netlify Forms backend
    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('modal-name');
            const phoneInput = document.getElementById('modal-phone');
            const emailInput = document.getElementById('modal-email');

            let valid = true;

            // Simple validation check
            const validateField = (field, errorId) => {
                const errorSpan = document.getElementById(errorId);
                if (!field.value.trim() || (field.type === 'email' && !field.value.includes('@'))) {
                    if (errorSpan) errorSpan.classList.add('visible');
                    field.style.borderColor = 'hsl(330, 85%, 60%)';
                    valid = false;
                } else {
                    if (errorSpan) errorSpan.classList.remove('visible');
                    field.style.borderColor = '';
                }
            };

            validateField(nameInput, 'modal-name-error');
            validateField(phoneInput, 'modal-phone-error');
            validateField(emailInput, 'modal-email-error');

            if (!valid) {
                return;
            }

            // Show submit loading state
            const btnText = document.getElementById('modal-btn-text');
            const btnLoader = document.getElementById('modal-btn-loader');
            const submitBtn = document.getElementById('modal-submit-button');

            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'block';
            if (submitBtn) submitBtn.disabled = true;

            // Prepare Netlify Form submission data
            const formData = new FormData(modalForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (response.ok) {
                    const successEl = document.getElementById('modal-success-container');
                    if (successEl) successEl.style.display = 'block';
                    modalForm.reset();
                    // Close the modal automatically after 3 seconds on success
                    setTimeout(() => {
                        closeModal();
                        if (successEl) successEl.style.display = 'none';
                    }, 3000);
                } else {
                    throw new Error('Network response not ok');
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                const errorEl = document.getElementById('modal-error-container');
                if (errorEl) {
                    errorEl.style.display = 'block';
                    setTimeout(() => errorEl.style.display = 'none', 5000);
                }
            })
            .finally(() => {
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
                if (submitBtn) submitBtn.disabled = false;
            });
        });
    }

    console.log('🚀 Design Suvidha 3D Scroll Engine Initialized');
});
