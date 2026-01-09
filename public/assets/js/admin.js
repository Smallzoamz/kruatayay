/**
 * ========================================
 * 👩🏻‍💼 ครัวตายาย - Admin Panel JavaScript
 * Dashboard & Management System
 * ========================================
 */

// Global State
const AdminState = {
    isLoggedIn: false,
    currentSection: 'dashboard',
    data: {
        menu: null,
        gallery: null,
        reservations: null,
        news: null,
        settings: null,
        reviews: null
    },
    deleteContext: null
};

// Admin Access Code (should match settings.json)
const ADMIN_CODE = 'krua2026';

/**
 * Initialize Admin Panel
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminDashboard();
    }

    // Initialize login form
    initLoginForm();

    // Initialize navigation
    initNavigation();

    // Initialize sidebar toggle
    initSidebarToggle();

    // Initialize logout
    initLogout();

    // Initialize refresh button
    initRefresh();

    // Initialize reservation filter
    initReservationFilter();

    // Initialize reviews filter
    initReviewsFilter();

    // Initialize forms
    initSettingsForms();
});

/**
 * Login Form Handler
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const accessCode = document.getElementById('accessCode').value;

        if (accessCode === ADMIN_CODE) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminDashboard();
            showToast('เข้าสู่ระบบสำเร็จ', 'success');
        } else {
            showToast('รหัสไม่ถูกต้อง กรุณาลองใหม่', 'error');
            document.getElementById('accessCode').value = '';
        }
    });
}

/**
 * Show Admin Dashboard
 */
async function showAdminDashboard() {
    AdminState.isLoggedIn = true;

    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminWrapper').style.display = 'flex';

    // Load all data
    await loadAllData();
}

/**
 * Load All Data
 */
async function loadAllData() {
    try {
        // Load in parallel
        const [menuRes, galleryRes, reservationsRes, newsRes, settingsRes, reviewsRes] = await Promise.all([
            fetch('/api/menu').then(r => r.json()),
            fetch('/api/gallery').then(r => r.json()),
            fetch('/api/reservations').then(r => r.json()),
            fetch('/api/news').then(r => r.json()),
            fetch('/api/settings').then(r => r.json()),
            fetch('/api/reviews/all').then(r => r.json())
        ]);

        AdminState.data.menu = menuRes;
        AdminState.data.gallery = galleryRes;
        AdminState.data.reservations = reservationsRes;
        AdminState.data.news = newsRes;
        AdminState.data.settings = settingsRes;
        AdminState.data.reviews = reviewsRes;

        // Update UI
        updateDashboardStats();
        renderMenuTable();
        renderGalleryTable();
        renderReservationsTable();
        renderNewsTable();
        renderReviewsList();
        loadSettingsForm();

    } catch (error) {
        console.error('Error loading data:', error);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

/**
 * Update Dashboard Stats
 */
function updateDashboardStats() {
    const { menu, gallery, reservations, news, reviews } = AdminState.data;

    document.getElementById('statMenuCount').textContent = menu?.items?.length || 0;
    document.getElementById('statGalleryCount').textContent = gallery?.images?.length || 0;
    document.getElementById('statNewsCount').textContent = news?.articles?.length || 0;

    // Count pending reservations
    const pendingReservations = reservations?.reservations?.filter(r => r.status === 'pending').length || 0;
    document.getElementById('statReservationCount').textContent = pendingReservations;
    document.getElementById('pendingBadge').textContent = pendingReservations;
    document.getElementById('pendingBadge').style.display = pendingReservations > 0 ? 'inline-block' : 'none';

    // Count pending reviews
    const pendingReviews = reviews?.filter(r => !r.approved).length || 0;
    const pendingReviewsBadge = document.getElementById('pendingReviewsBadge');
    if (pendingReviewsBadge) {
        pendingReviewsBadge.textContent = pendingReviews;
        pendingReviewsBadge.style.display = pendingReviews > 0 ? 'inline-block' : 'none';
    }

    // Recent reservations
    renderRecentReservations();
}

/**
 * Render Recent Reservations (Dashboard)
 */
function renderRecentReservations() {
    const tbody = document.getElementById('recentReservations');
    if (!tbody || !AdminState.data.reservations) return;

    const reservations = AdminState.data.reservations.reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    if (reservations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    ยังไม่มีการจอง
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = reservations.map(res => `
        <tr>
            <td class="item-name">${sanitize(res.name)}</td>
            <td>${formatDateThai(res.date)}</td>
            <td>${res.time}</td>
            <td>${res.guests} คน</td>
            <td><span class="status-badge ${getStatusClass(res.status)}">${getStatusText(res.status)}</span></td>
        </tr>
    `).join('');
}

/**
 * Navigation
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);

            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Close sidebar on mobile
            document.getElementById('adminSidebar').classList.remove('active');
        });
    });
}

/**
 * Show Section
 */
function showSection(sectionId) {
    AdminState.currentSection = sectionId;

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update page title
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'ภาพรวมของร้านครัวตายาย' },
        menu: { title: 'เมนูอาหาร', subtitle: 'จัดการเมนูอาหารทั้งหมด' },
        gallery: { title: 'แกลเลอรี่', subtitle: 'จัดการรูปภาพบรรยากาศร้าน' },
        reservations: { title: 'การจอง', subtitle: 'จัดการการจองโต๊ะ' },
        news: { title: 'ข่าวสาร', subtitle: 'จัดการข่าวสารและโปรโมชั่น' },
        settings: { title: 'ตั้งค่า', subtitle: 'ข้อมูลร้านและการตั้งค่าต่างๆ' }
    };

    const titleInfo = titles[sectionId] || titles.dashboard;
    document.getElementById('pageTitle').textContent = titleInfo.title;
    document.getElementById('pageSubtitle').textContent = titleInfo.subtitle;
}

// Global function
window.showSection = showSection;

/**
 * Sidebar Toggle (Mobile)
 */
function initSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');

    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

/**
 * Logout Handler
 */
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        AdminState.isLoggedIn = false;

        document.getElementById('adminWrapper').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('accessCode').value = '';

        showToast('ออกจากระบบสำเร็จ', 'info');
    });
}

/**
 * Refresh Button
 */
function initRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', async () => {
        refreshBtn.querySelector('i').classList.add('fa-spin');
        await loadAllData();
        refreshBtn.querySelector('i').classList.remove('fa-spin');
        showToast('รีเฟรชข้อมูลเรียบร้อย', 'success');
    });
}

// ==========================================
// MENU MANAGEMENT
// ==========================================

function renderMenuTable() {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody || !AdminState.data.menu) return;

    const items = AdminState.data.menu.items;

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    ยังไม่มีเมนูอาหาร
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td><img src="${item.image}" alt="${item.name}" class="item-image" 
                     onerror="this.src='https://placehold.co/60x60/5D4037/FFF8E1?text=🍜'"></td>
            <td>
                <span class="item-name">${sanitize(item.name)}</span>
                ${item.isPopular ? '<span class="status-badge active" style="margin-left: 0.5rem;">🔥</span>' : ''}
            </td>
            <td><span class="item-category">${getCategoryLabel(item.category)}</span></td>
            <td class="item-price">฿${item.price}</td>
            <td>
                <span class="status-badge ${item.isAvailable ? 'active' : 'inactive'}">
                    ${item.isAvailable ? 'พร้อมขาย' : 'หมด'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="editMenu(${item.id})" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDelete('menu', ${item.id})" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openMenuModal(item = null) {
    document.getElementById('menuModalTitle').textContent = item ? 'แก้ไขเมนู' : 'เพิ่มเมนูอาหาร';
    document.getElementById('menuForm').reset();

    if (item) {
        document.getElementById('menuId').value = item.id;
        document.getElementById('menuName').value = item.name;
        document.getElementById('menuCategory').value = item.category;
        document.getElementById('menuPrice').value = item.price;
        document.getElementById('menuDesc').value = item.description || '';
        document.getElementById('menuImage').value = item.image || '';
        document.getElementById('menuPopular').checked = item.isPopular;
        document.getElementById('menuAvailable').checked = item.isAvailable;
    } else {
        document.getElementById('menuId').value = '';
        document.getElementById('menuAvailable').checked = true;
    }

    openModal('menuModal');
}

function editMenu(id) {
    const item = AdminState.data.menu.items.find(i => i.id === id);
    if (item) openMenuModal(item);
}

async function saveMenu() {
    const form = document.getElementById('menuForm');
    const id = document.getElementById('menuId').value;

    const data = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('menuName').value,
        category: document.getElementById('menuCategory').value,
        price: parseInt(document.getElementById('menuPrice').value),
        description: document.getElementById('menuDesc').value,
        image: document.getElementById('menuImage').value || 'https://placehold.co/400x300/5D4037/FFF8E1?text=Menu',
        isPopular: document.getElementById('menuPopular').checked,
        isAvailable: document.getElementById('menuAvailable').checked
    };

    if (!data.name || !data.price) {
        showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    try {
        if (id) {
            await fetch(`/api/menu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('แก้ไขเมนูสำเร็จ', 'success');
        } else {
            await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('เพิ่มเมนูสำเร็จ', 'success');
        }

        closeModal('menuModal');
        await loadAllData();

    } catch (error) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

window.openMenuModal = openMenuModal;
window.editMenu = editMenu;
window.saveMenu = saveMenu;

// ==========================================
// GALLERY MANAGEMENT
// ==========================================

function renderGalleryTable() {
    const tbody = document.getElementById('galleryTableBody');
    if (!tbody || !AdminState.data.gallery) return;

    const images = AdminState.data.gallery.images.sort((a, b) => a.order - b.order);

    if (images.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    ยังไม่มีรูปภาพ
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = images.map(img => `
        <tr>
            <td><img src="${img.url}" alt="${img.title}" class="item-image" 
                     onerror="this.src='https://placehold.co/60x60/5D4037/FFF8E1?text=IMG'"></td>
            <td class="item-name">${sanitize(img.title)}</td>
            <td class="item-category">${sanitize(img.description || '-')}</td>
            <td>${img.order}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="editGallery(${img.id})" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDelete('gallery', ${img.id})" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openGalleryModal(image = null) {
    document.getElementById('galleryModalTitle').textContent = image ? 'แก้ไขรูปภาพ' : 'เพิ่มรูปภาพ';
    document.getElementById('galleryForm').reset();

    if (image) {
        document.getElementById('galleryId').value = image.id;
        document.getElementById('galleryTitle').value = image.title;
        document.getElementById('galleryDesc').value = image.description || '';
        document.getElementById('galleryUrl').value = image.url;
        document.getElementById('galleryOrder').value = image.order;
    } else {
        document.getElementById('galleryId').value = '';
        document.getElementById('galleryOrder').value = (AdminState.data.gallery?.images?.length || 0) + 1;
    }

    openModal('galleryModal');
}

function editGallery(id) {
    const item = AdminState.data.gallery.images.find(i => i.id === id);
    if (item) openGalleryModal(item);
}

async function saveGallery() {
    const id = document.getElementById('galleryId').value;

    const data = {
        id: id ? parseInt(id) : Date.now(),
        title: document.getElementById('galleryTitle').value,
        description: document.getElementById('galleryDesc').value,
        url: document.getElementById('galleryUrl').value,
        order: parseInt(document.getElementById('galleryOrder').value) || 1
    };

    if (!data.title || !data.url) {
        showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    try {
        if (id) {
            await fetch(`/api/gallery/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('แก้ไขรูปภาพสำเร็จ', 'success');
        } else {
            await fetch('/api/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('เพิ่มรูปภาพสำเร็จ', 'success');
        }

        closeModal('galleryModal');
        await loadAllData();

    } catch (error) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

window.openGalleryModal = openGalleryModal;
window.editGallery = editGallery;
window.saveGallery = saveGallery;

// ==========================================
// RESERVATIONS MANAGEMENT
// ==========================================

function initReservationFilter() {
    const filter = document.getElementById('reservationFilter');
    if (!filter) return;

    filter.addEventListener('change', () => {
        renderReservationsTable(filter.value);
    });
}

function renderReservationsTable(filter = 'all') {
    const tbody = document.getElementById('reservationsTableBody');
    if (!tbody || !AdminState.data.reservations) return;

    let reservations = AdminState.data.reservations.reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filter !== 'all') {
        reservations = reservations.filter(r => r.status === filter);
    }

    if (reservations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    ไม่มีรายการจอง
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = reservations.map(res => `
        <tr>
            <td class="item-name">${sanitize(res.name)}</td>
            <td>${sanitize(res.phone)}</td>
            <td>${formatDateThai(res.date)}</td>
            <td>${res.time}</td>
            <td>${res.guests} คน</td>
            <td>
                <span class="status-badge ${getStatusClass(res.status)}">
                    ${getStatusText(res.status)}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewReservation(${res.id})" title="ดูรายละเอียด">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${res.status === 'pending' ? `
                        <button class="action-btn edit" onclick="updateReservationStatus(${res.id}, 'confirmed')" title="ยืนยัน">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn delete" onclick="updateReservationStatus(${res.id}, 'cancelled')" title="ยกเลิก">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewReservation(id) {
    const res = AdminState.data.reservations.reservations.find(r => r.id === id);
    if (!res) return;

    document.getElementById('reservationDetail').innerHTML = `
        <div style="display: grid; gap: 1rem;">
            <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                    <label style="color: var(--text-muted); font-size: 0.875rem;">ชื่อผู้จอง</label>
                    <p style="font-weight: 600;">${sanitize(res.name)}</p>
                </div>
                <div style="flex: 1;">
                    <label style="color: var(--text-muted); font-size: 0.875rem;">โทรศัพท์</label>
                    <p style="font-weight: 600;">${sanitize(res.phone)}</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                    <label style="color: var(--text-muted); font-size: 0.875rem;">วันที่</label>
                    <p style="font-weight: 600;">${formatDateThai(res.date)}</p>
                </div>
                <div style="flex: 1;">
                    <label style="color: var(--text-muted); font-size: 0.875rem;">เวลา</label>
                    <p style="font-weight: 600;">${res.time} น.</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                    <label style="color: var(--text-muted); font-size: 0.875rem;">จำนวน</label>
                    <p style="font-weight: 600;">${res.guests} คน</p>
                </div>
                <div style="flex: 1;">
                    <label style="color: var(--text-muted); font-size: 0.875rem;">สถานะ</label>
                    <p><span class="status-badge ${getStatusClass(res.status)}">${getStatusText(res.status)}</span></p>
                </div>
            </div>
            ${res.email ? `
                <div>
                    <label style="color: var(--text-muted); font-size: 0.875rem;">อีเมล</label>
                    <p>${sanitize(res.email)}</p>
                </div>
            ` : ''}
            ${res.notes ? `
                <div>
                    <label style="color: var(--text-muted); font-size: 0.875rem;">หมายเหตุ</label>
                    <p style="background: var(--bg-secondary); padding: 0.75rem; border-radius: 0.5rem;">${sanitize(res.notes)}</p>
                </div>
            ` : ''}
            <div>
                <label style="color: var(--text-muted); font-size: 0.875rem;">จองเมื่อ</label>
                <p style="font-size: 0.875rem; color: var(--text-muted);">${new Date(res.createdAt).toLocaleString('th-TH')}</p>
            </div>
        </div>
    `;

    // Setup buttons
    document.getElementById('confirmReservationBtn').onclick = () => {
        updateReservationStatus(id, 'confirmed');
        closeModal('reservationModal');
    };

    document.getElementById('cancelReservationBtn').onclick = () => {
        updateReservationStatus(id, 'cancelled');
        closeModal('reservationModal');
    };

    openModal('reservationModal');
}

async function updateReservationStatus(id, status) {
    try {
        await fetch(`/api/reservations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        const statusText = status === 'confirmed' ? 'ยืนยัน' : 'ยกเลิก';
        showToast(`${statusText}การจองสำเร็จ`, 'success');
        await loadAllData();

    } catch (error) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

window.viewReservation = viewReservation;
window.updateReservationStatus = updateReservationStatus;

// ==========================================
// NEWS MANAGEMENT
// ==========================================

function renderNewsTable() {
    const tbody = document.getElementById('newsTableBody');
    if (!tbody || !AdminState.data.news) return;

    const articles = AdminState.data.news.articles
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (articles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    ยังไม่มีข่าวสาร
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = articles.map(article => `
        <tr>
            <td><img src="${article.image}" alt="${article.title}" class="item-image" 
                     onerror="this.src='https://placehold.co/60x60/5D4037/FFF8E1?text=NEWS'"></td>
            <td class="item-name">${sanitize(article.title)}</td>
            <td>${formatDateThai(article.date)}</td>
            <td>
                <span class="status-badge ${article.isPublished ? 'active' : 'inactive'}">
                    ${article.isPublished ? 'เผยแพร่' : 'ซ่อน'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="editNews(${article.id})" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDelete('news', ${article.id})" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openNewsModal(article = null) {
    document.getElementById('newsModalTitle').textContent = article ? 'แก้ไขข่าว' : 'เพิ่มข่าวสาร';
    document.getElementById('newsForm').reset();

    if (article) {
        document.getElementById('newsId').value = article.id;
        document.getElementById('newsTitle').value = article.title;
        document.getElementById('newsExcerpt').value = article.excerpt;
        document.getElementById('newsContent').value = article.content || '';
        document.getElementById('newsImage').value = article.image || '';
        document.getElementById('newsDate').value = article.date;
        document.getElementById('newsPublished').checked = article.isPublished;
    } else {
        document.getElementById('newsId').value = '';
        document.getElementById('newsDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('newsPublished').checked = true;
    }

    openModal('newsModal');
}

function editNews(id) {
    const article = AdminState.data.news.articles.find(a => a.id === id);
    if (article) openNewsModal(article);
}

async function saveNews() {
    const id = document.getElementById('newsId').value;

    const data = {
        id: id ? parseInt(id) : Date.now(),
        title: document.getElementById('newsTitle').value,
        excerpt: document.getElementById('newsExcerpt').value,
        content: document.getElementById('newsContent').value,
        image: document.getElementById('newsImage').value || 'https://placehold.co/600x400/5D4037/FFF8E1?text=News',
        date: document.getElementById('newsDate').value,
        isPublished: document.getElementById('newsPublished').checked
    };

    if (!data.title || !data.excerpt) {
        showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    try {
        if (id) {
            await fetch(`/api/news/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('แก้ไขข่าวสำเร็จ', 'success');
        } else {
            await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('เพิ่มข่าวสำเร็จ', 'success');
        }

        closeModal('newsModal');
        await loadAllData();

    } catch (error) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

window.openNewsModal = openNewsModal;
window.editNews = editNews;
window.saveNews = saveNews;

// ==========================================
// SETTINGS MANAGEMENT
// ==========================================

function loadSettingsForm() {
    const { settings } = AdminState.data;
    if (!settings) return;

    const { restaurant, about } = settings;

    // Restaurant settings
    if (restaurant) {
        document.getElementById('setName').value = restaurant.name || '';
        document.getElementById('setTagline').value = restaurant.tagline || '';
        document.getElementById('setFoundedYear').value = restaurant.foundedYear || '';
        document.getElementById('setDescription').value = restaurant.description || '';
        document.getElementById('setPhone').value = restaurant.phone || '';
        document.getElementById('setMobile').value = restaurant.mobile || '';
        document.getElementById('setEmail').value = restaurant.email || '';
        document.getElementById('setAddress').value = restaurant.address || '';
        document.getElementById('setWeekdays').value = restaurant.openingHours?.weekdays || '';
        document.getElementById('setWeekend').value = restaurant.openingHours?.weekend || '';
        document.getElementById('setLineId').value = restaurant.lineId || '';
        document.getElementById('setLineUrl').value = restaurant.lineUrl || '';
        document.getElementById('setFacebook').value = restaurant.facebook || '';
        document.getElementById('setInstagram').value = restaurant.instagram || '';
        document.getElementById('setMapEmbed').value = restaurant.mapEmbed || '';
    }

    // About settings
    if (about) {
        document.getElementById('setAboutTitle').value = about.title || '';
        document.getElementById('setAboutStory').value = about.story || '';
    }

    // Founder settings
    const { founder } = settings;
    if (founder) {
        document.getElementById('setFounderName').value = founder.name || '';
        document.getElementById('setFounderTitle').value = founder.title || '';
        document.getElementById('setFounderImage').value = founder.image || '';
        document.getElementById('setFounderBio').value = founder.bio || '';
        document.getElementById('setFounderQuote').value = founder.quote || '';
    }
}

function initSettingsForms() {
    // Restaurant settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                restaurant: {
                    name: document.getElementById('setName').value,
                    tagline: document.getElementById('setTagline').value,
                    foundedYear: parseInt(document.getElementById('setFoundedYear').value) || null,
                    description: document.getElementById('setDescription').value,
                    phone: document.getElementById('setPhone').value,
                    mobile: document.getElementById('setMobile').value,
                    email: document.getElementById('setEmail').value,
                    address: document.getElementById('setAddress').value,
                    openingHours: {
                        weekdays: document.getElementById('setWeekdays').value,
                        weekend: document.getElementById('setWeekend').value
                    },
                    lineId: document.getElementById('setLineId').value,
                    lineUrl: document.getElementById('setLineUrl').value,
                    facebook: document.getElementById('setFacebook').value,
                    instagram: document.getElementById('setInstagram').value,
                    mapEmbed: document.getElementById('setMapEmbed').value
                }
            };

            try {
                await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                showToast('บันทึกข้อมูลร้านสำเร็จ', 'success');
                await loadAllData();
            } catch (error) {
                showToast('เกิดข้อผิดพลาด', 'error');
            }
        });
    }

    // About settings form
    const aboutForm = document.getElementById('aboutForm');
    if (aboutForm) {
        aboutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                about: {
                    title: document.getElementById('setAboutTitle').value,
                    story: document.getElementById('setAboutStory').value,
                    features: AdminState.data.settings?.about?.features || []
                }
            };

            try {
                await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                showToast('บันทึกข้อมูลเกี่ยวกับร้านสำเร็จ', 'success');
                await loadAllData();
            } catch (error) {
                showToast('เกิดข้อผิดพลาด', 'error');
            }
        });
    }

    // Founder settings form
    const founderForm = document.getElementById('founderForm');
    if (founderForm) {
        founderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                founder: {
                    name: document.getElementById('setFounderName').value,
                    title: document.getElementById('setFounderTitle').value,
                    image: document.getElementById('setFounderImage').value,
                    bio: document.getElementById('setFounderBio').value,
                    quote: document.getElementById('setFounderQuote').value
                }
            };

            try {
                await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                showToast('บันทึกข้อมูลผู้ก่อตั้งสำเร็จ', 'success');
                await loadAllData();
            } catch (error) {
                showToast('เกิดข้อผิดพลาด', 'error');
            }
        });
    }
}

// ==========================================
// DELETE CONFIRMATION
// ==========================================

function confirmDelete(type, id) {
    AdminState.deleteContext = { type, id };

    const messages = {
        menu: 'คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?',
        gallery: 'คุณแน่ใจหรือไม่ที่จะลบรูปภาพนี้?',
        news: 'คุณแน่ใจหรือไม่ที่จะลบข่าวนี้?'
    };

    document.getElementById('deleteMessage').textContent = messages[type] || 'ยืนยันการลบ?';

    document.getElementById('confirmDeleteBtn').onclick = executeDelete;

    openModal('deleteModal');
}

async function executeDelete() {
    const { type, id } = AdminState.deleteContext;

    try {
        await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
        showToast('ลบสำเร็จ', 'success');
        closeModal('deleteModal');
        await loadAllData();
    } catch (error) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }

    AdminState.deleteContext = null;
}

window.confirmDelete = confirmDelete;

// ==========================================
// MODAL UTILITIES
// ==========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

window.openModal = openModal;
window.closeModal = closeModal;

// Close modal on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
});

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

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
        <div class="toast-content">
            <span class="toast-message">${message}</span>
        </div>
        <i class="toast-close fas fa-times" onclick="this.parentElement.remove()"></i>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDateThai(dateString) {
    const date = new Date(dateString);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function getCategoryLabel(category) {
    const labels = {
        main: '🍜 อาหารจานเดียว',
        side: '🍲 กับข้าว',
        drink: '🥤 เครื่องดื่ม',
        dessert: '🍰 ของหวาน'
    };
    return labels[category] || category;
}

function getStatusClass(status) {
    const classes = {
        pending: 'pending',
        confirmed: 'active',
        cancelled: 'inactive'
    };
    return classes[status] || 'pending';
}

function getStatusText(status) {
    const texts = {
        pending: 'รอยืนยัน',
        confirmed: 'ยืนยันแล้ว',
        cancelled: 'ยกเลิก'
    };
    return texts[status] || status;
}

// ==========================================
// REVIEWS MANAGEMENT
// ==========================================

/**
 * Initialize Reviews Filter
 */
function initReviewsFilter() {
    const tabs = document.querySelectorAll('.review-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Render list with filter
            renderReviewsList(tab.dataset.filter);
        });
    });
}

/**
 * Render Reviews List
 */
function renderReviewsList(filter = 'pending') {
    const container = document.getElementById('adminReviewsList');
    if (!container) return;

    const reviews = AdminState.data.reviews || [];
    const pendingCount = reviews.filter(r => !r.approved).length;
    const approvedCount = reviews.filter(r => r.approved).length;

    // Update tab counts
    const pendingCountEl = document.getElementById('pendingCount');
    const approvedCountEl = document.getElementById('approvedCount');
    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
    if (approvedCountEl) approvedCountEl.textContent = approvedCount;

    // Filter reviews
    let filteredReviews = reviews;
    if (filter === 'pending') {
        filteredReviews = reviews.filter(r => !r.approved);
    } else if (filter === 'approved') {
        filteredReviews = reviews.filter(r => r.approved);
    }

    // Sort by date (newest first)
    filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredReviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star-half-alt"></i>
                <p>ไม่มีรีวิวในหมวดหมู่นี้</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredReviews.map(review => {
        const initial = review.name ? review.name.charAt(0).toUpperCase() : '?';
        const stars = generateStars(review.rating);
        const date = new Date(review.date).toLocaleString('th-TH');
        const statusBadge = review.approved
            ? '<span class="review-status-badge approved"><i class="fas fa-check-circle"></i> อนุมัติแล้ว</span>'
            : '<span class="review-status-badge pending"><i class="fas fa-clock"></i> รออนุมัติ</span>';

        return `
            <div class="admin-review-card ${review.approved ? 'approved' : 'pending'}">
                <div class="review-card-header">
                    <div class="review-card-info">
                        <div class="review-card-avatar">${initial}</div>
                        <div class="review-card-meta">
                            <h4>${sanitize(review.name)}</h4>
                            <span>${date}</span>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                
                <div class="review-card-rating">${stars}</div>
                <div class="review-card-content">"${sanitize(review.comment)}"</div>
                
                <div class="review-card-actions">
                    ${!review.approved ? `
                        <button class="btn btn-sm btn-success" onclick="approveReview(${review.id})">
                            <i class="fas fa-check"></i> อนุมัติ
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteReview(${review.id})">
                        <i class="fas fa-trash"></i> ลบ
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate Stars HTML (Helper)
 */
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating
            ? '<i class="fas fa-star"></i>'
            : '<i class="fas fa-star" style="color:#ddd"></i>';
    }
    return stars;
}

/**
 * Approve Review
 */
async function approveReview(id) {
    try {
        const review = AdminState.data.reviews.find(r => r.id === id);
        if (!review) return;

        const updatedReview = { ...review, approved: true };

        const res = await fetch(`/api/reviews/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReview)
        });

        if (res.ok) {
            showToast('อนุมัติรีวิวเรียบร้อยแล้ว', 'success');
            await loadAllData(); // Reload data
        } else {
            showToast('เกิดข้อผิดพลาดในการอนุมัติ', 'error');
        }
    } catch (error) {
        console.error('Error approving review:', error);
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
}

/**
 * Confirm Delete Review
 */
function confirmDeleteReview(id) {
    AdminState.deleteContext = { type: 'reviews', id: id };

    document.getElementById('deleteMessage').textContent = 'คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?';
    document.getElementById('confirmDeleteBtn').onclick = executeDelete;

    openModal('deleteModal');
}

// Make functions queryable by HTML onclick attributes
window.approveReview = approveReview;
window.confirmDeleteReview = confirmDeleteReview;
