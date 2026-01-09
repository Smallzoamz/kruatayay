/**
 * ========================================
 * 🌿 ครัวตายาย - Main Application
 * Landing Page JavaScript
 * ========================================
 */

// Global Variables
let gallerySlider = null;
let menuData = null;
let settingsData = null;

/**
 * Show Toast Notification (Helper)
 */
function showToast(message, type = 'info') {
    if (window.Toast) {
        Toast.show(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize components
    Toast.init();
    Lightbox.init();
    ScrollReveal.init();
    FloatingLeaves.init();

    // Initialize Parallax Scrolling Effect
    initParallax();

    // Initialize header scroll effect
    initHeader();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize smooth scroll for nav links
    initSmoothScroll();

    // Load dynamic content
    await loadSettings();
    await loadMenu();
    await loadGallery();
    await loadReviews();
    await loadNews();

    // Initialize forms
    initReservationForm();
    initReviewForm();

    // Set minimum date for reservation
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
        dateInput.min = DateUtils.getMinDate();
    }
});

/**
 * Parallax Scrolling Effect for Hero Background
 * Creates smooth depth effect on scroll
 */
function initParallax() {
    const heroBg = document.querySelector('.hero-bg');
    const heroSection = document.querySelector('.hero');

    if (!heroBg || !heroSection) return;

    // Optimize: Disable parallax on mobile/tablet to prevent jitter
    if (window.innerWidth < 1024) return;

    // Parallax speed factor (0.5 = half speed of scroll)
    const parallaxSpeed = 0.5;
    let ticking = false;

    const updateParallax = () => {
        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;

        // Only apply parallax when hero is in view
        if (scrollY <= heroHeight) {
            const yPos = scrollY * parallaxSpeed;
            heroBg.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }

        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial call
    updateParallax();
}

/**
 * Header Scroll Effect
 */
function initHeader() {
    const header = document.getElementById('header');

    const handleScroll = () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

/**
 * Smooth Scroll for Navigation Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Allow external links to work normally (e.g. social links updated dynamically)
            if (!targetId.startsWith('#') || targetId === '#') return;

            e.preventDefault();
            smoothScrollTo(targetId);

            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Update active link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Load Settings Data
 */
async function loadSettings() {
    try {
        settingsData = await API.get('/settings');
        updateSettingsDisplay(settingsData);
    } catch (error) {
        console.error('Error loading settings:', error);
        // Use default data from HTML
    }
}

/**
 * Update Settings Display
 */
function updateSettingsDisplay(data) {
    if (!data) return;

    const { restaurant, about } = data;

    // Update restaurant name in multiple places
    const logoText = document.getElementById('logoText');
    if (logoText && restaurant.name) {
        logoText.textContent = restaurant.name;
    }

    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle && restaurant.name) {
        heroTitle.textContent = restaurant.name;
    }

    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle && restaurant.tagline) {
        heroSubtitle.innerHTML = `${restaurant.tagline} ที่สืบทอดมาจากรุ่นตายาย<br>มาสัมผัสอาหารไทยโบราณในบรรยากาศสวนร่มรื่น`;
    }

    // Update document title
    if (restaurant.name && restaurant.tagline) {
        document.title = `${restaurant.name} - ${restaurant.tagline}`;
    }

    // Update footer brand
    const footerLogoText = document.getElementById('footerLogoText');
    if (footerLogoText && restaurant.name) {
        footerLogoText.textContent = restaurant.name;
    }

    const footerDescription = document.getElementById('footerDescription');
    if (footerDescription && restaurant.description) {
        footerDescription.textContent = restaurant.description;
    }

    // Update footer copyright
    const footerCopyright = document.getElementById('footerCopyright');
    if (footerCopyright && restaurant.name) {
        const year = new Date().getFullYear();
        footerCopyright.textContent = `© ${year} ${restaurant.name}. All rights reserved.`;
    }

    // Update footer social links
    const footerFacebook = document.getElementById('footerFacebook');
    if (footerFacebook && restaurant.facebook) {
        footerFacebook.href = restaurant.facebook;
    }

    const footerInstagram = document.getElementById('footerInstagram');
    if (footerInstagram && restaurant.instagram) {
        footerInstagram.href = restaurant.instagram;
    }

    const footerLine = document.getElementById('footerLine');
    if (footerLine && restaurant.lineUrl) {
        footerLine.href = restaurant.lineUrl;
    }

    // Update years of trust badge (calculated from foundedYear)
    const yearsOfTrustBadge = document.getElementById('yearsOfTrustBadge');
    if (yearsOfTrustBadge && restaurant.foundedYear) {
        const currentYear = new Date().getFullYear();
        const yearsInBusiness = currentYear - restaurant.foundedYear;
        yearsOfTrustBadge.textContent = `🏆 ${yearsInBusiness}+ ปีแห่งความไว้วางใจ`;
    }

    // Update contact info
    const contactPhone = document.getElementById('contactPhone');
    if (contactPhone && restaurant.phone) {
        contactPhone.textContent = restaurant.phone;
    }

    const contactAddress = document.getElementById('contactAddress');
    if (contactAddress && restaurant.address) {
        contactAddress.textContent = restaurant.address;
    }

    const weekdaysHours = document.getElementById('weekdaysHours');
    if (weekdaysHours && restaurant.openingHours) {
        weekdaysHours.textContent = `จันทร์-ศุกร์: ${restaurant.openingHours.weekdays}`;
    }

    const weekendHours = document.getElementById('weekendHours');
    if (weekendHours && restaurant.openingHours) {
        weekendHours.textContent = `เสาร์-อาทิตย์: ${restaurant.openingHours.weekend}`;
    }

    // Update footer info
    const footerAddress = document.getElementById('footerAddress');
    if (footerAddress && restaurant.address) {
        footerAddress.innerHTML = restaurant.address.replace(/,/g, '<br>');
    }

    const footerPhone = document.getElementById('footerPhone');
    if (footerPhone) {
        footerPhone.innerHTML = `${restaurant.phone}<br>${restaurant.mobile}`;
    }

    const footerEmail = document.getElementById('footerEmail');
    if (footerEmail && restaurant.email) {
        footerEmail.textContent = restaurant.email;
    }

    // Update social links
    const lineAddFriend = document.getElementById('lineAddFriend');
    if (lineAddFriend && restaurant.lineUrl) {
        lineAddFriend.href = restaurant.lineUrl;
    }

    const facebookLink = document.getElementById('facebookLink');
    if (facebookLink && restaurant.facebook) {
        facebookLink.href = restaurant.facebook;
    }

    const instagramLink = document.getElementById('instagramLink');
    if (instagramLink && restaurant.instagram) {
        instagramLink.href = restaurant.instagram;
    }

    const lineLink = document.getElementById('lineLink');
    if (lineLink && restaurant.lineUrl) {
        lineLink.href = restaurant.lineUrl;
    }

    // Update map
    const googleMap = document.getElementById('googleMap');
    if (googleMap && restaurant.mapEmbed) {
        googleMap.src = restaurant.mapEmbed;
    }

    // Update footer hours
    const footerHours = document.getElementById('footerHours');
    if (footerHours && restaurant.openingHours) {
        footerHours.innerHTML = `จันทร์-ศุกร์: ${restaurant.openingHours.weekdays}<br>เสาร์-อาทิตย์: ${restaurant.openingHours.weekend}`;
    }

    // Update LINE ID badge in button
    const lineAddFriendSmall = document.querySelector('#lineAddFriend small');
    if (lineAddFriendSmall && restaurant.lineId) {
        lineAddFriendSmall.textContent = restaurant.lineId;
    }

    // Update footer contact links (bottom footer section)
    const footerPhoneNum = document.getElementById('footerPhoneNum');
    const footerPhoneLink = document.getElementById('footerPhoneLink');
    if (footerPhoneNum && restaurant.phone) {
        footerPhoneNum.textContent = restaurant.phone;
        if (footerPhoneLink) {
            footerPhoneLink.href = `tel:${restaurant.phone.replace(/[^0-9]/g, '')}`;
        }
    }

    const footerEmailText = document.getElementById('footerEmailText');
    const footerEmailLink = document.getElementById('footerEmailLink');
    if (footerEmailText && restaurant.email) {
        footerEmailText.textContent = restaurant.email;
        if (footerEmailLink) {
            footerEmailLink.href = `mailto:${restaurant.email}`;
        }
    }

    const footerLineId = document.getElementById('footerLineId');
    const footerLineLink = document.getElementById('footerLineLink');
    if (footerLineId && restaurant.lineId) {
        footerLineId.textContent = restaurant.lineId;
        if (footerLineLink && restaurant.lineUrl) {
            footerLineLink.href = restaurant.lineUrl;
        }
    }

    // Update about section
    if (about) {
        const aboutStory = document.getElementById('aboutStory');
        if (aboutStory && about.story) {
            aboutStory.textContent = about.story;
        }
    }

    // Update founder section
    const { founder } = data;
    if (founder) {
        const founderImage = document.getElementById('founderImage');
        if (founderImage && founder.image) {
            founderImage.src = founder.image;
        }

        const founderName = document.getElementById('founderName');
        if (founderName && founder.name) {
            founderName.textContent = founder.name;
        }

        const founderTitle = document.getElementById('founderTitle');
        if (founderTitle && founder.title) {
            founderTitle.textContent = founder.title;
        }

        const founderBio = document.getElementById('founderBio');
        if (founderBio && founder.bio) {
            founderBio.textContent = founder.bio;
        }

        const founderQuote = document.getElementById('founderQuote');
        if (founderQuote && founder.quote) {
            founderQuote.textContent = `"${founder.quote}"`;
        }

        // Calculate years of experience from foundedYear
        const founderYearsExp = document.getElementById('founderYearsExp');
        if (founderYearsExp && restaurant.foundedYear) {
            const years = new Date().getFullYear() - restaurant.foundedYear;
            founderYearsExp.textContent = `${years}+`;
        }
    }

    // Update timeline section
    const { timeline } = data;
    if (timeline && timeline.length > 0) {
        const timelineWrapper = document.getElementById('timelineWrapper');
        if (timelineWrapper) {
            const currentYear = new Date().getFullYear();

            timelineWrapper.innerHTML = `
                <div class="timeline-line"></div>
                ${timeline.map((item, index) => {
                const isLeft = index % 2 === 0;
                const isHighlight = item.year === currentYear;
                return `
                        <div class="timeline-item ${isLeft ? 'left' : 'right'} ${isHighlight ? 'highlight' : ''}">
                            <div class="timeline-content">
                                <span class="timeline-year">${item.year}</span>
                                <h4>${item.title}</h4>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    `;
            }).join('')}
            `;
        }
    }
}

/**
 * Load Menu Data
 */
async function loadMenu() {
    try {
        menuData = await API.get('/menu');

        // Render Dynamic Category Tabs
        const menuTabsContainer = document.getElementById('menuTabs');
        if (menuTabsContainer && menuData.categories) {
            const allBtn = '<button class="menu-tab active" data-category="all">ทั้งหมด</button>';
            const catBtns = menuData.categories.map(cat =>
                `<button class="menu-tab" data-category="${cat.id}">${cat.icon ? cat.icon + ' ' : ''}${cat.name}</button>`
            ).join('');
            menuTabsContainer.innerHTML = allBtn + catBtns;
        }

        renderMenu('all');
        initMenuTabs();
    } catch (error) {
        console.error('Error loading menu:', error);
        Toast.error('ไม่สามารถโหลดข้อมูลเมนูได้');
    }
}

/**
 * Initialize Menu Tabs
 */
function initMenuTabs() {
    const tabs = document.querySelectorAll('.menu-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter menu
            const category = tab.dataset.category;
            renderMenu(category);
        });
    });
}

/**
 * Render Menu Items
 */
function renderMenu(category = 'all') {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid || !menuData) return;

    // Show all items, including Sold Out (to display badge)
    let items = menuData.items;

    if (category !== 'all') {
        // Loose comparison for ID (string vs int)
        items = items.filter(item => item.category == category || item.category_id == category);
    }

    if (items.length === 0) {
        menuGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-utensils" style="font-size: 3rem; color: #ccc;"></i>
                <p style="margin-top: 1rem; color: #888;">ไม่พบเมนูในหมวดหมู่นี้</p>
            </div>
        `;
        return;
    }

    menuGrid.innerHTML = items.map(item => `
        <div class="menu-card reveal active ${!item.isAvailable ? 'sold-out' : ''}">
            <div class="menu-card-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy" 
                     onerror="this.src='https://placehold.co/400x300/5D4037/FFF8E1?text=No+Image'">
                ${item.isPopular ? '<span class="menu-card-badge">🔥 ยอดนิยม</span>' : ''}
                ${!item.isAvailable ? '<span class="menu-card-badge sold-out-badge">🔴 หมด</span>' : ''}
            </div>
            <div class="menu-card-content">
                <h3 class="menu-card-title">${Validator.sanitize(item.name)}</h3>
                <p class="menu-card-desc">${Validator.sanitize(item.description)}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">เริ่มต้น ฿${item.price}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Load Gallery Data
 */
async function loadGallery() {
    try {
        const data = await API.get('/gallery');

        // Sort by order
        const images = data.images.sort((a, b) => a.order - b.order);

        // Initialize slider
        gallerySlider = new ImageSlider('galleryTrack');
        gallerySlider.loadSlides(images);

        // Make slider globally accessible
        window.gallerySlider = gallerySlider;

    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

// ==========================================
// REVIEWS SECTION
// ==========================================

/**
 * Load Reviews Data
 */
async function loadReviews() {
    try {
        const reviews = await API.get('/reviews');
        renderReviews(reviews);
        updateReviewStats(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

/**
 * Render Reviews
 */
function renderReviews(reviews) {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    if (!reviews || reviews.length === 0) {
        reviewsGrid.innerHTML = '<p class="no-reviews">ยังไม่มีรีวิว เป็นคนแรกที่เขียนรีวิวให้เราสิคะ!</p>';
        return;
    }

    // Sort by date (newest first) and limit to 6
    const sortedReviews = reviews
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    reviewsGrid.innerHTML = sortedReviews.map(review => {
        const initial = review.name ? review.name.charAt(0).toUpperCase() : 'ล';
        const stars = generateStars(review.rating);
        const dateFormatted = formatReviewDate(review.date);

        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-author">
                        <div class="review-avatar">${initial}</div>
                        <div>
                            <div class="review-name">${escapeHtml(review.name)}</div>
                            <div class="review-date">${dateFormatted}</div>
                        </div>
                    </div>
                    <div class="review-rating">${stars}</div>
                </div>
                <p class="review-comment">${escapeHtml(review.comment)}</p>
            </div>
        `;
    }).join('');
}

/**
 * Generate Star Rating HTML
 */
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="fas fa-star empty"></i>';
        }
    }
    return stars;
}

/**
 * Update Review Stats (average rating)
 */
function updateReviewStats(reviews) {
    if (!reviews || reviews.length === 0) return;

    const averageRating = document.getElementById('averageRating');
    const averageStars = document.getElementById('averageStars');
    const reviewCount = document.getElementById('reviewCount');

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = (total / reviews.length).toFixed(1);

    if (averageRating) {
        averageRating.textContent = avg;
    }

    if (averageStars) {
        const fullStars = Math.floor(avg);
        const hasHalf = (avg - fullStars) >= 0.5;
        let starsHtml = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalf) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        averageStars.innerHTML = starsHtml;
    }

    if (reviewCount) {
        reviewCount.textContent = `จาก ${reviews.length} รีวิว`;
    }
}

/**
 * Format Review Date
 */
function formatReviewDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return 'เมื่อวาน';
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;

    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize Review Form
 */
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('reviewName').value.trim();
        const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
        const comment = document.getElementById('reviewComment').value.trim();

        if (!name || !comment) {
            showToast('กรุณากรอกชื่อและรีวิวของคุณ', 'warning');
            return;
        }

        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, rating: parseInt(rating), comment })
            });

            const result = await response.json();

            if (response.ok) {
                showToast('🎉 ขอบคุณสำหรับรีวิว! รีวิวของคุณจะแสดงหลังจากได้รับการอนุมัติค่ะ', 'success');
                reviewForm.reset();
                // Reset star rating to 5
                document.getElementById('star5').checked = true;
            } else {
                showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ==========================================
// NEWS SECTION
// ==========================================

/**
 * Load News Data
 */
async function loadNews() {
    try {
        const data = await API.get('/news');
        renderNews(data.articles);
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

/**
 * Render News Items
 */
function renderNews(articles) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    const publishedArticles = articles
        .filter(article => article.isPublished)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    if (publishedArticles.length === 0) {
        newsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-newspaper" style="font-size: 3rem; color: #ccc;"></i>
                <p style="margin-top: 1rem; color: #888;">ยังไม่มีข่าวสาร</p>
            </div>
        `;
        return;
    }

    newsGrid.innerHTML = publishedArticles.map(article => `
        <div class="news-card reveal active">
            <div class="news-card-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy"
                     onerror="this.src='https://placehold.co/600x400/5D4037/FFF8E1?text=No+Image'">
            </div>
            <div class="news-card-content">
                <span class="news-card-date">${DateUtils.formatThai(article.date)}</span>
                <h3 class="news-card-title">${Validator.sanitize(article.title)}</h3>
                <p class="news-card-excerpt">${Validator.sanitize(article.excerpt)}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Initialize Reservation Form
 */
function initReservationForm() {
    const form = document.getElementById('reservationForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email') || '',
            date: formData.get('date'),
            time: formData.get('time'),
            guests: parseInt(formData.get('guests')),
            notes: formData.get('notes') || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Validate
        if (!data.name || !data.phone || !data.date || !data.time || !data.guests) {
            Toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (!Validator.isValidPhone(data.phone)) {
            Toast.error('เบอร์โทรศัพท์ไม่ถูกต้อง');
            return;
        }

        if (!Validator.isValidEmail(data.email)) {
            Toast.error('รูปแบบอีเมลไม่ถูกต้อง');
            return;
        }

        // Submit reservation
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';

            await API.post('/reservations', data);

            Toast.success('จองโต๊ะสำเร็จ! เราจะติดต่อกลับเพื่อยืนยันค่ะ 🎉');
            form.reset();

            // Reset date min
            const dateInput = document.getElementById('resDate');
            if (dateInput) {
                dateInput.min = DateUtils.getMinDate();
            }

        } catch (error) {
            Toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> ยืนยันจองโต๊ะ';
        }
    });
}

/**
 * Parallax Effect (optional enhancement)
 */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBg = document.querySelector('.hero-bg');

    if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});
