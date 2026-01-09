/**
 * ========================================
 * 🌿 ครัวตายาย - Reusable Components
 * Utility functions and shared components
 * ========================================
 */

// API Base URL
const API_BASE = '/api';

/**
 * Toast Notification System
 */
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon fas ${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    info(message) { this.show(message, 'info'); },
    warning(message) { this.show(message, 'warning'); }
};

/**
 * API Helper Functions
 */
const API = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
};

/**
 * Date Formatting Utilities
 */
const DateUtils = {
    formatThai(dateString) {
        const date = new Date(dateString);
        const months = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
    },

    formatISO(date) {
        return new Date(date).toISOString().split('T')[0];
    },

    isToday(dateString) {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    },

    getMinDate() {
        const today = new Date();
        return this.formatISO(today);
    }
};

/**
 * Form Validation
 */
const Validator = {
    isValidPhone(phone) {
        const cleaned = phone.replace(/[^\d]/g, '');
        return cleaned.length >= 9 && cleaned.length <= 10;
    },

    isValidEmail(email) {
        if (!email) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

/**
 * Scroll Reveal Animation
 */
const ScrollReveal = {
    init() {
        this.elements = document.querySelectorAll('.reveal');
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        this.elements.forEach(el => this.observer.observe(el));
    }
};

/**
 * Realistic Floating Leaves Animation with SVG
 * Features: Realistic SVG leaves, natural colors, wind effects, 3D motion
 */
const FloatingLeaves = {
    container: null,
    activeLeaves: [],
    windFactor: 0,

    // SVG leaf shapes with natural variations
    leafSVGs: [
        // Leaf type 1: Simple oval leaf
        `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 5 Q35 20 35 35 Q35 50 20 55 Q5 50 5 35 Q5 20 20 5 Z" fill="currentColor"/>
            <path d="M20 10 L20 50" stroke="rgba(0,0,0,0.2)" stroke-width="1" fill="none"/>
            <path d="M20 20 Q12 25 8 30" stroke="rgba(0,0,0,0.15)" stroke-width="0.5" fill="none"/>
            <path d="M20 20 Q28 25 32 30" stroke="rgba(0,0,0,0.15)" stroke-width="0.5" fill="none"/>
            <path d="M20 30 Q14 33 10 38" stroke="rgba(0,0,0,0.15)" stroke-width="0.5" fill="none"/>
            <path d="M20 30 Q26 33 30 38" stroke="rgba(0,0,0,0.15)" stroke-width="0.5" fill="none"/>
        </svg>`,

        // Leaf type 2: Maple-style leaf
        `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 5 L30 15 L40 12 L35 22 L45 25 L35 28 L40 38 L30 35 L25 45 L20 35 L10 38 L15 28 L5 25 L15 22 L10 12 L20 15 Z" fill="currentColor"/>
            <path d="M25 15 L25 42" stroke="rgba(0,0,0,0.2)" stroke-width="1" fill="none"/>
        </svg>`,

        // Leaf type 3: Oak-style leaf
        `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 5 Q25 10 28 15 Q32 12 35 15 Q32 20 30 25 Q35 28 35 32 Q30 30 28 35 Q32 40 30 45 Q25 42 20 55 Q15 42 10 45 Q8 40 12 35 Q10 30 5 32 Q5 28 10 25 Q8 20 5 15 Q8 12 12 15 Q15 10 20 5 Z" fill="currentColor"/>
            <path d="M20 10 L20 50" stroke="rgba(0,0,0,0.2)" stroke-width="1" fill="none"/>
        </svg>`,

        // Leaf type 4: Simple pointed leaf
        `<svg viewBox="0 0 30 55" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3 Q28 18 26 35 Q24 48 15 52 Q6 48 4 35 Q2 18 15 3 Z" fill="currentColor"/>
            <path d="M15 8 L15 48" stroke="rgba(0,0,0,0.2)" stroke-width="0.8" fill="none"/>
            <path d="M15 18 Q10 22 6 28" stroke="rgba(0,0,0,0.12)" stroke-width="0.5" fill="none"/>
            <path d="M15 18 Q20 22 24 28" stroke="rgba(0,0,0,0.12)" stroke-width="0.5" fill="none"/>
        </svg>`,

        // Leaf type 5: Round tropical leaf
        `<svg viewBox="0 0 45 55" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="22" cy="28" rx="18" ry="24" fill="currentColor"/>
            <path d="M22 6 L22 52" stroke="rgba(0,0,0,0.2)" stroke-width="1.2" fill="none"/>
            <path d="M22 15 Q12 20 8 28" stroke="rgba(0,0,0,0.1)" stroke-width="0.6" fill="none"/>
            <path d="M22 15 Q32 20 36 28" stroke="rgba(0,0,0,0.1)" stroke-width="0.6" fill="none"/>
            <path d="M22 28 Q14 32 10 40" stroke="rgba(0,0,0,0.1)" stroke-width="0.6" fill="none"/>
            <path d="M22 28 Q30 32 34 40" stroke="rgba(0,0,0,0.1)" stroke-width="0.6" fill="none"/>
        </svg>`
    ],

    // Natural leaf colors - greens, yellows, oranges, reds, browns
    leafColors: [
        '#4a7c59', '#6b8e4e', '#8fbc8f', '#9acd32', '#bdb76b',
        '#d4a574', '#cd853f', '#b8860b', '#daa520', '#d2691e',
        '#a0522d', '#8b4513', '#c04000', '#993300', '#7c4b3a'
    ],

    init() {
        this.container = document.getElementById('floatingLeaves');
        if (!this.container) return;

        this.injectStyles();

        // Check for mobile device
        const isMobile = window.innerWidth < 768;

        // Reduce particles on mobile (5 vs 15)
        const initialCount = isMobile ? 5 : 15;
        const spawnInterval = isMobile ? 1500 : 600;

        // Create initial leaves
        for (let i = 0; i < initialCount; i++) {
            setTimeout(() => this.createLeaf(), i * spawnInterval);
        }

        this.scheduleNextLeaf();
        this.startWindSimulation();
    },

    injectStyles() {
        if (document.getElementById('realistic-leaves-css')) return;

        const style = document.createElement('style');
        style.id = 'realistic-leaves-css';
        style.textContent = `
            .leaf-realistic {
                position: absolute;
                pointer-events: none;
                z-index: 1;
                will-change: transform, opacity;
                filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.15));
            }
            .leaf-realistic svg {
                width: 100%;
                height: 100%;
            }
            @keyframes leafFall {
                0% { opacity: 0; transform: translateY(-5vh) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                5% { opacity: var(--leaf-opacity); }
                25% { transform: translateY(25vh) translateX(calc(var(--sway-amount) * 1)) rotateX(90deg) rotateY(45deg) rotateZ(90deg); }
                50% { transform: translateY(50vh) translateX(calc(var(--sway-amount) * -0.7)) rotateX(180deg) rotateY(90deg) rotateZ(180deg); }
                75% { transform: translateY(75vh) translateX(calc(var(--sway-amount) * 0.5)) rotateX(270deg) rotateY(135deg) rotateZ(270deg); }
                95% { opacity: var(--leaf-opacity); }
                100% { opacity: 0; transform: translateY(105vh) translateX(calc(var(--sway-amount) * -0.3)) rotateX(360deg) rotateY(180deg) rotateZ(360deg); }
            }
            @keyframes leafFallSway {
                0% { opacity: 0; transform: translateY(-5vh) translateX(0) rotateZ(0deg) scale(1); }
                5% { opacity: var(--leaf-opacity); }
                15% { transform: translateY(15vh) translateX(calc(var(--sway-amount) * 0.8)) rotateZ(25deg) scale(0.98); }
                30% { transform: translateY(30vh) translateX(calc(var(--sway-amount) * -0.6)) rotateZ(-20deg) scale(1.02); }
                45% { transform: translateY(45vh) translateX(calc(var(--sway-amount) * 0.7)) rotateZ(30deg) scale(0.96); }
                60% { transform: translateY(60vh) translateX(calc(var(--sway-amount) * -0.5)) rotateZ(-25deg) scale(1); }
                75% { transform: translateY(75vh) translateX(calc(var(--sway-amount) * 0.4)) rotateZ(20deg) scale(0.98); }
                90% { transform: translateY(90vh) translateX(calc(var(--sway-amount) * -0.2)) rotateZ(-15deg) scale(1); }
                95% { opacity: var(--leaf-opacity); }
                100% { opacity: 0; transform: translateY(105vh) translateX(calc(var(--sway-amount) * 0.1)) rotateZ(10deg) scale(0.95); }
            }
            @keyframes leafFallTumble {
                0% { opacity: 0; transform: translateY(-5vh) translateX(0) rotate3d(1, 1, 0, 0deg); }
                5% { opacity: var(--leaf-opacity); }
                20% { transform: translateY(20vh) translateX(calc(var(--sway-amount) * -0.9)) rotate3d(1, 0.5, 0.3, 120deg); }
                40% { transform: translateY(40vh) translateX(calc(var(--sway-amount) * 0.7)) rotate3d(0.5, 1, 0.2, 240deg); }
                60% { transform: translateY(60vh) translateX(calc(var(--sway-amount) * -0.5)) rotate3d(0.3, 0.7, 1, 360deg); }
                80% { transform: translateY(80vh) translateX(calc(var(--sway-amount) * 0.3)) rotate3d(1, 0.3, 0.5, 480deg); }
                95% { opacity: var(--leaf-opacity); }
                100% { opacity: 0; transform: translateY(105vh) translateX(calc(var(--sway-amount) * -0.1)) rotate3d(0.5, 1, 0.3, 540deg); }
            }
            @keyframes leafFallFloat {
                0% { opacity: 0; transform: translateY(-5vh) translateX(0) rotateZ(0deg); }
                5% { opacity: var(--leaf-opacity); }
                12% { transform: translateY(12vh) translateX(calc(var(--sway-amount) * 0.5)) rotateZ(15deg); }
                24% { transform: translateY(24vh) translateX(calc(var(--sway-amount) * -0.3)) rotateZ(-10deg); }
                36% { transform: translateY(36vh) translateX(calc(var(--sway-amount) * 0.6)) rotateZ(20deg); }
                48% { transform: translateY(48vh) translateX(calc(var(--sway-amount) * -0.4)) rotateZ(-15deg); }
                60% { transform: translateY(60vh) translateX(calc(var(--sway-amount) * 0.4)) rotateZ(12deg); }
                72% { transform: translateY(72vh) translateX(calc(var(--sway-amount) * -0.2)) rotateZ(-8deg); }
                84% { transform: translateY(84vh) translateX(calc(var(--sway-amount) * 0.3)) rotateZ(10deg); }
                95% { opacity: var(--leaf-opacity); }
                100% { opacity: 0; transform: translateY(105vh) translateX(calc(var(--sway-amount) * -0.1)) rotateZ(-5deg); }
            }
        `;
        document.head.appendChild(style);
    },

    scheduleNextLeaf() {
        // More frequent: 1-2.5 seconds
        const delay = 1000 + Math.random() * 1500;
        setTimeout(() => {
            this.createLeaf();
            this.scheduleNextLeaf();
        }, delay);
    },

    startWindSimulation() {
        setInterval(() => {
            if (Math.random() < 0.4) {
                this.windFactor = (Math.random() - 0.5) * 120;
                setTimeout(() => { this.windFactor = 0; }, 1500 + Math.random() * 2500);
            }
        }, 4000);
    },

    createLeaf() {
        if (!this.container) return;

        const leaf = document.createElement('div');
        leaf.className = 'leaf-realistic';

        // Random SVG leaf shape
        leaf.innerHTML = this.leafSVGs[Math.floor(Math.random() * this.leafSVGs.length)];

        // Random natural color
        leaf.style.color = this.leafColors[Math.floor(Math.random() * this.leafColors.length)];

        // Random starting position
        const startX = Math.random() * 100 + this.windFactor * 0.1;
        leaf.style.left = `${Math.max(-5, Math.min(105, startX))}vw`;

        // Random size (18px to 38px)
        const size = 18 + Math.random() * 20;
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size * 1.3}px`;

        // Random opacity
        const opacity = 0.55 + Math.random() * 0.35;
        leaf.style.setProperty('--leaf-opacity', opacity);

        // Random sway amount
        const swayWithWind = 45 + Math.random() * 55 + this.windFactor * 0.6;
        leaf.style.setProperty('--sway-amount', `${swayWithWind}px`);

        // Random animation (7-15 seconds)
        const duration = 7 + Math.random() * 8;
        const animations = ['leafFall', 'leafFallSway', 'leafFallTumble', 'leafFallFloat'];
        const selectedAnimation = animations[Math.floor(Math.random() * animations.length)];
        const delay = Math.random() * 1.5;

        leaf.style.animation = `${selectedAnimation} ${duration}s ease-in-out ${delay}s forwards`;

        this.container.appendChild(leaf);
        this.activeLeaves.push(leaf);

        setTimeout(() => {
            leaf.remove();
            const index = this.activeLeaves.indexOf(leaf);
            if (index > -1) this.activeLeaves.splice(index, 1);
        }, (duration + delay) * 1000 + 500);
    }
};

/**
 * Image Slider Component
 */
class ImageSlider {
    constructor(trackId, options = {}) {
        this.track = document.getElementById(trackId);
        this.slides = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.options = {
            autoPlay: true,
            interval: 5000,
            dotsId: 'galleryDots',
            prevId: 'galleryPrev',
            nextId: 'galleryNext',
            ...options
        };

        this.init();
    }

    init() {
        // Navigation buttons
        const prevBtn = document.getElementById(this.options.prevId);
        const nextBtn = document.getElementById(this.options.nextId);

        if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
        if (nextBtn) nextBtn.addEventListener('click', () => this.next());

        // Touch/Swipe support
        if (this.track) {
            let startX = 0;
            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });
            this.track.addEventListener('touchend', (e) => {
                const diffX = startX - e.changedTouches[0].clientX;
                if (Math.abs(diffX) > 50) {
                    diffX > 0 ? this.next() : this.prev();
                }
            });
        }

        // Auto play
        if (this.options.autoPlay) {
            this.startAutoPlay();

            // Pause on hover
            if (this.track) {
                this.track.parentElement.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.track.parentElement.addEventListener('mouseleave', () => this.startAutoPlay());
            }
        }
    }

    loadSlides(images) {
        if (!this.track) return;

        this.slides = images;
        this.track.innerHTML = images.map(img => `
            <div class="gallery-slide" onclick="openLightbox('${img.url}')">
                <img src="${img.url}" alt="${img.title}" loading="lazy">
                <div class="gallery-slide-caption">
                    <h4>${img.title}</h4>
                    <p>${img.description}</p>
                </div>
            </div>
        `).join('');

        this.createDots();
        this.goTo(0);
    }

    createDots() {
        const dotsContainer = document.getElementById(this.options.dotsId);
        if (!dotsContainer) return;

        dotsContainer.innerHTML = this.slides.map((_, i) =>
            `<span class="gallery-dot ${i === 0 ? 'active' : ''}" onclick="gallerySlider.goTo(${i})"></span>`
        ).join('');
    }

    updateDots() {
        const dots = document.querySelectorAll('.gallery-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }

    goTo(index) {
        if (!this.track || this.slides.length === 0) return;

        this.currentIndex = (index + this.slides.length) % this.slides.length;
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        this.updateDots();
    }

    next() {
        this.goTo(this.currentIndex + 1);
    }

    prev() {
        this.goTo(this.currentIndex - 1);
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return;
        this.autoPlayInterval = setInterval(() => this.next(), this.options.interval);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

/**
 * Lightbox Component
 */
const Lightbox = {
    element: null,
    image: null,

    init() {
        this.element = document.getElementById('lightbox');
        this.image = document.getElementById('lightboxImage');

        if (!this.element) return;

        // Close on overlay click
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });

        // Close button
        const closeBtn = document.getElementById('lightboxClose');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.element.classList.contains('active')) {
                this.close();
            }
        });
    },

    open(imageUrl) {
        if (!this.element || !this.image) return;
        this.image.src = imageUrl;
        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        if (!this.element) return;
        this.element.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Global function for lightbox
function openLightbox(url) {
    Lightbox.open(url);
}

/**
 * Smooth Scroll
 */
function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = target.offsetTop - headerHeight;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Category Labels
 */
const CategoryLabels = {
    main: '🍜 อาหารจานเดียว',
    side: '🍲 กับข้าว',
    drink: '🥤 เครื่องดื่ม',
    dessert: '🍰 ของหวาน'
};

/**
 * Status Labels
 */
const StatusLabels = {
    pending: { text: 'รอยืนยัน', class: 'pending' },
    confirmed: { text: 'ยืนยันแล้ว', class: 'active' },
    cancelled: { text: 'ยกเลิก', class: 'inactive' }
};

// Export for use
window.Toast = Toast;
window.API = API;
window.DateUtils = DateUtils;
window.Validator = Validator;
window.ScrollReveal = ScrollReveal;
window.FloatingLeaves = FloatingLeaves;
window.ImageSlider = ImageSlider;
window.Lightbox = Lightbox;
window.CategoryLabels = CategoryLabels;
window.StatusLabels = StatusLabels;
window.smoothScrollTo = smoothScrollTo;
window.openLightbox = openLightbox;
