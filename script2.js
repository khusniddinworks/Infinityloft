/* ============================================
   INFINITY LOFT — Premium Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== LANGUAGE SWITCHER ==========
    let currentLang = localStorage.getItem('infinityloft-lang') || 'uz';
    
    const setLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('infinityloft-lang', lang);
        
        // Update buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Update all data-i18n elements
        if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) {
            const t = TRANSLATIONS[lang];
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (t[key]) {
                    el.innerHTML = t[key];
                }
            });
            document.querySelectorAll('[data-i18n-ph]').forEach(el => {
                const key = el.getAttribute('data-i18n-ph');
                if (t[key]) {
                    el.placeholder = t[key];
                }
            });
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = lang === 'uz' ? 'uz' : lang === 'ru' ? 'ru' : 'en';
    };
    
    // Init language
    setLanguage(currentLang);
    
    // Language button clicks
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // ========== PRELOADER ==========
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 1800);
    });
    // Fallback
    setTimeout(() => { preloader.classList.add('loaded'); }, 4000);

    // ========== NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    const handleScroll = () => {
        const scrollY = window.scrollY;
        
        // Navbar bg on scroll
        if (scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link based on scroll
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ========== MOBILE MENU ==========
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ========== HERO SLIDER ==========
    const heroSlides = document.querySelectorAll('.hero-slide');
    const sliderDots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    let slideInterval;

    const goToSlide = (index) => {
        heroSlides.forEach(s => s.classList.remove('active'));
        sliderDots.forEach(d => d.classList.remove('active'));
        currentSlide = index;
        heroSlides[currentSlide].classList.add('active');
        sliderDots[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
        goToSlide((currentSlide + 1) % heroSlides.length);
    };

    sliderDots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(parseInt(dot.dataset.slide));
            slideInterval = setInterval(nextSlide, 6000);
        });
    });

    slideInterval = setInterval(nextSlide, 6000);

    // ========== HERO PARTICLES ==========
    const particlesContainer = document.getElementById('hero-particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.width = (Math.random() * 3 + 1) + 'px';
            particle.style.height = particle.style.width;
            particlesContainer.appendChild(particle);
        }
    }

    // ========== SCROLL ANIMATIONS (custom AOS) ==========
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

    // ========== PORTFOLIO FILTER ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            portfolioItems.forEach(item => {
                const category = item.dataset.category;
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // ========== LIGHTBOX ==========
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxInfo = document.getElementById('lightbox-info');
    let lightboxItems = [];
    let lightboxIndex = 0;

    const openLightbox = (index) => {
        // Get visible items only
        lightboxItems = Array.from(document.querySelectorAll('.portfolio-item:not(.hidden)'));
        lightboxIndex = index;
        const item = lightboxItems[lightboxIndex];
        const img = item.querySelector('img');
        const category = item.querySelector('.portfolio-category');
        const title = item.querySelector('.portfolio-overlay h4');
        
        lightboxImg.src = img.src;
        lightboxInfo.querySelector('.lightbox-category').textContent = category ? category.textContent : '';
        lightboxInfo.querySelector('.lightbox-title').textContent = title ? title.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    const navigateLightbox = (dir) => {
        lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
        const item = lightboxItems[lightboxIndex];
        const img = item.querySelector('img');
        const category = item.querySelector('.portfolio-category');
        const title = item.querySelector('.portfolio-overlay h4');
        
        lightboxImg.style.opacity = 0;
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxInfo.querySelector('.lightbox-category').textContent = category ? category.textContent : '';
            lightboxInfo.querySelector('.lightbox-title').textContent = title ? title.textContent : '';
            lightboxImg.style.opacity = 1;
        }, 200);
    };

    portfolioItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Click outside
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // ========== STATS COUNTER ==========
    const countStats = () => {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const countAttr = stat.getAttribute('data-count');
            if (!countAttr) return;
            
            const target = parseInt(countAttr);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const counter = setInterval(() => {
                current += step;
                if (current >= target) {
                    stat.textContent = target.toLocaleString() + (stat.textContent.includes('+') ? '+' : '');
                    clearInterval(counter);
                } else {
                    stat.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        });
    };

    const statsSection = document.getElementById('stats');
    let statsCounted = false;
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsCounted) {
                countStats();
                statsCounted = true;
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) statsObserver.observe(statsSection);

    // ========== TESTIMONIALS SLIDER ==========
    const testimonialTrack = document.getElementById('testimonial-track');
    const testPrev = document.getElementById('test-prev');
    const testNext = document.getElementById('test-next');
    let testimonialIndex = 0;
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    const goToTestimonial = (index) => {
        testimonialIndex = index;
        if (testimonialIndex < 0) testimonialIndex = testimonialCards.length - 1;
        if (testimonialIndex >= testimonialCards.length) testimonialIndex = 0;
        testimonialTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;
    };

    if (testPrev) testPrev.addEventListener('click', () => goToTestimonial(testimonialIndex - 1));
    if (testNext) testNext.addEventListener('click', () => goToTestimonial(testimonialIndex + 1));

    // Auto-rotate testimonials
    setInterval(() => goToTestimonial(testimonialIndex + 1), 7000);

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contact-form');
    // GitHub Pages (sayt) -> Render (Python bot backend)
    const SERVER_URL = 'https://infinityloft.onrender.com/api/contact';

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalContent = btn.innerHTML;
            
            // Show loading state
            btn.innerHTML = '<span>⌛ Yuborilmoqda...</span>';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                service: formData.get('service'),
                message: formData.get('message')
            };

            try {
                const response = await fetch(SERVER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const successText = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang]) ? TRANSLATIONS[currentLang]['form.success'] : '✅ Yuborildi!';
                    btn.innerHTML = `<span data-i18n="form.success">${successText}</span>`;
                    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
                    contactForm.reset();
                } else {
                    const errorDetail = await response.text();
                    console.error('Server responded with error:', errorDetail);
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error('SUBMISSION FAILED:', error);
                btn.innerHTML = '<span>❌ Xatolik yuz berdi</span>';
                btn.style.background = '#ef4444';
            } finally {
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = navbar.offsetHeight + 20;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== PARALLAX EFFECTS ==========
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    }, { passive: true });

    // ========== PHONE INPUT MASK ==========
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('998')) {
                value = value.substring(3);
            }
            if (value.length > 9) value = value.substring(0, 9);
            
            let formatted = '+998';
            if (value.length > 0) formatted += ' (' + value.substring(0, 2);
            if (value.length >= 2) formatted += ') ';
            if (value.length > 2) formatted += value.substring(2, 5);
            if (value.length > 5) formatted += '-' + value.substring(5, 7);
            if (value.length > 7) formatted += '-' + value.substring(7, 9);
            
            e.target.value = formatted;
        });
    }

    // ========== CALCULATOR LOGIC ==========
    const calcType = document.getElementById('calc-type');
    const calcDimensions = document.getElementById('calc-dimensions');
    const priceValue = document.getElementById('price-value');
    const materialGroup = document.getElementById('material-group');
    const sendCalcBtn = document.getElementById('send-calc');

    // Rates adjusted to $140 - $160 per sqm range as requested
    const RATES = {
        'sliding': { base: 150, type: 'sqm' },
        'opening': { base: 140, type: 'sqm' },
        'accordion': { base: 160, type: 'sqm' },
        'cascade': { base: 155, type: 'sqm' },
        'custom': { base: 145, type: 'sqm' }
    };

    const MULTIPLIERS = {
        'normal': 1,
        'bronze': 1.25,
        'frosted': 1.15
    };

    function updateCalcUI() {
        if (!calcType) return;
        const type = calcType.value;
        let html = '';

        // All new types use width/height for now, but we can customize
        // Stacked vertically for better structure as requested
        html = `
            <div class="form-group">
                <label data-i18n="calc.width">Kenglik (m)</label>
                <input type="number" id="calc-w" value="1.0" step="0.1" min="0.1" class="calc-input">
            </div>
            <div class="form-group">
                <label data-i18n="calc.height">Balandlik (m)</label>
                <input type="number" id="calc-h" value="2.0" step="0.1" min="0.1" class="calc-input">
            </div>
        `;
        materialGroup.style.display = 'block';

        calcDimensions.innerHTML = html;
        if (typeof i18n !== 'undefined' && i18n.update) i18n.update(); 
        calculatePrice();

        const inputs = calcDimensions.querySelectorAll('.calc-input');
        inputs.forEach(input => input.addEventListener('input', calculatePrice));
    }

    function calculatePrice() {
        if (!calcType || !priceValue) return;
        const type = calcType.value;
        const rate = RATES[type];
        const materialEl = document.querySelector('input[name="material"]:checked');
        const material = materialEl ? materialEl.value : 'normal';
        const mult = MULTIPLIERS[material];
        
        let total = 0;
        let quantityLabel = '';

        const wInput = document.getElementById('calc-w');
        const hInput = document.getElementById('calc-h');
        const w = wInput ? (parseFloat(wInput.value) || 0) : 0;
        const h = hInput ? (parseFloat(hInput.value) || 0) : 0;
        total = (w * h) * rate.base * mult;
        quantityLabel = `${w}m x ${h}m (${(w*h).toFixed(1)} kv/m)`;

        priceValue.innerText = Math.round(total).toLocaleString();
        return { total, type, quantityLabel, material };
    }

    if (calcType) {
        calcType.addEventListener('change', updateCalcUI);
        const materials = document.querySelectorAll('input[name="material"]');
        materials.forEach(m => m.addEventListener('change', calculatePrice));
        updateCalcUI();
    }

    // ========== CALCULATOR PHONE MODAL ==========
    const calcPhoneModal = document.getElementById('calc-phone-modal');
    const calcPhoneClose = document.getElementById('calc-phone-close');
    const calcPhoneForm = document.getElementById('calc-phone-form');
    const calcPhoneInput = document.getElementById('calc-phone-input');
    let pendingCalcData = null;

    // Phone mask for calc modal
    if (calcPhoneInput) {
        calcPhoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('998')) value = value.substring(3);
            if (value.length > 9) value = value.substring(0, 9);
            let formatted = '+998';
            if (value.length > 0) formatted += ' (' + value.substring(0, 2);
            if (value.length >= 2) formatted += ') ';
            if (value.length > 2) formatted += value.substring(2, 5);
            if (value.length > 5) formatted += '-' + value.substring(5, 7);
            if (value.length > 7) formatted += '-' + value.substring(7, 9);
            e.target.value = formatted;
        });
    }

    if (calcPhoneClose) {
        calcPhoneClose.addEventListener('click', () => {
            calcPhoneModal.classList.remove('active');
        });
    }

    if (sendCalcBtn) {
        sendCalcBtn.addEventListener('click', () => {
            const calc = calculatePrice();
            if (!calc || !calc.total) return;
            pendingCalcData = calc;
            if (calcPhoneInput) calcPhoneInput.value = '';
            if (calcPhoneModal) calcPhoneModal.classList.add('active');
        });
    }

    if (calcPhoneForm) {
        calcPhoneForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!pendingCalcData) return;
            const calc = pendingCalcData;
            const phone = calcPhoneInput ? calcPhoneInput.value : '';
            const btn = calcPhoneForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = '<span>⌛ Yuborilmoqda...</span>';

            const w = document.getElementById('calc-w') ? parseFloat(document.getElementById('calc-w').value) : 0;
            const h = document.getElementById('calc-h') ? parseFloat(document.getElementById('calc-h').value) : 0;

            const payload = {
                name: "KALKULYATOR BUYURTMA",
                phone: phone,
                service: `Hisob-kitob: ${calc.type}`,
                message: `🧮 KALKULYATOR ORQALI SO'ROV\n` +
                         `--------------------------\n` +
                         `📌 Turi: ${calc.type}\n` +
                         `📏 O'lchami: ${w}m x ${h}m (${(w*h).toFixed(1)} kv/m)\n` +
                         `💰 TAXMINIY NARX: $${Math.round(calc.total)}`
            };

            try {
                const response = await fetch(SERVER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    calcPhoneForm.innerHTML = `<p style="color: #c9a96e; font-weight: 600; padding: 20px; text-align:center;">✅ Yuborildi! Tez orada bog'lanamiz.</p>`;
                    setTimeout(() => {
                        calcPhoneModal.classList.remove('active');
                    }, 3000);
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                console.error('CALC SEND ERROR:', err);
                btn.innerHTML = '<span>❌ Xatolik</span>';
                btn.style.background = '#ef4444';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 3000);
            }
        });
    }
    // ========== PROMO MODAL LOGIC (AKSIYA) ==========
    const promoModal = document.getElementById('promo-modal');
    const promoClose = document.getElementById('promo-close');
    const promoForm = document.getElementById('promo-form');
    const promoPhone = document.getElementById('promo-phone');

    // Show immediately if not closed in this session
    if (promoModal && !sessionStorage.getItem('promo_closed')) {
        setTimeout(() => {
            promoModal.classList.add('active');
        }, 1500);
    }

    if (promoClose) {
        promoClose.addEventListener('click', () => {
            promoModal.classList.remove('active');
            sessionStorage.setItem('promo_closed', 'true');
        });
    }

    // Phone mask for promo
    if (promoPhone) {
        promoPhone.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('998')) value = value.substring(3);
            if (value.length > 9) value = value.substring(0, 9);
            let formatted = '+998';
            if (value.length > 0) formatted += ' (' + value.substring(0, 2);
            if (value.length >= 2) formatted += ') ';
            if (value.length > 2) formatted += value.substring(2, 5);
            if (value.length > 5) formatted += '-' + value.substring(5, 7);
            if (value.length > 7) formatted += '-' + value.substring(7, 9);
            e.target.value = formatted;
        });
    }

    if (promoForm) {
        promoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang]) ? TRANSLATIONS[currentLang] : {};
            const btn = promoForm.querySelector('button[type="submit"]') || promoForm.querySelector('button');
            const originalText = btn ? btn.innerHTML : '';

            const digits = (promoPhone ? promoPhone.value : '').replace(/\D/g, '');
            const localDigits = digits.startsWith('998') ? digits.substring(3) : digits;
            if (localDigits.length !== 9) {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<span>${t['promo.phone_incomplete'] || "❌ Telefon raqamini to'liq kiriting"}</span>`;
                    btn.style.background = '#ef4444';
                    setTimeout(() => {
                        if (!btn.isConnected) return;
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                    }, 2500);
                }
                return;
            }

            const phone = `+998 (${localDigits.substring(0, 2)}) ${localDigits.substring(2, 5)}-${localDigits.substring(5, 7)}-${localDigits.substring(7, 9)}`;

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<span>${t['promo.sending'] || '⌛ Yuborilmoqda...'}</span>`;
            }

            const payload = {
                name: "AKSIYA MIJOZI",
                phone: phone,
                service: "10% CHEGIRMA",
                message: "🎁 MIJOZ 10% CHEGIRMANI QO'LGA KIRITMOQCHI!"
            };

            try {
                const response = await fetch(SERVER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorDetail = await response.text();
                    console.error('PROMO FORM SERVER ERROR:', errorDetail);
                    throw new Error('Server error');
                }

                const successMsg = t['promo.success'] || "Tabriklaymiz! Mutaxassisimiz tez orada bog'lanadi.";
                promoForm.innerHTML = `<p style="color: #c9a96e; font-weight: 600; padding: 20px;">${successMsg}</p>`;
                setTimeout(() => {
                    promoModal.classList.remove('active');
                    sessionStorage.setItem('promo_closed', 'true');
                }, 4000);

            } catch (err) {
                console.error('PROMO SUBMISSION FAILED:', err);
                if (btn) {
                    btn.innerHTML = `<span>${t['promo.error'] || '❌ Xatolik yuz berdi'}</span>`;
                    btn.style.background = '#ef4444';
                    // Show actual error in console for debugging
                    console.log('Error detail:', err.message);
                }
            } finally {
                setTimeout(() => {
                    if (!btn || !btn.isConnected) return;
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 3000);
            }
        });
    }
});

// ========== FADE IN UP ANIMATION ==========
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);
