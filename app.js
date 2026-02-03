// ============================================
// State Management
// ============================================
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = [];
let favorites = [];
let orders = [];
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;


// Load cart based on current user
function loadCart() {
    if (currentUser) {
        cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`)) || [];
    } else {
        cart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
    }
}

// Load favorites based on current user
function loadFavorites() {
    if (currentUser) {
        favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.id}`)) || [];
    } else {
        favorites = [];
    }
}

// Save favorites
function saveFavorites() {
    if (currentUser) {
        localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(favorites));
    }
}

// Load orders based on current user
function loadOrders() {
    if (currentUser) {
        orders = JSON.parse(localStorage.getItem(`orders_${currentUser.id}`)) || [];
    } else {
        orders = [];
    }
}

// Save orders
function saveOrders() {
    if (currentUser) {
        localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(orders));
    }
}

// ============================================
// Theme Management
// ============================================
function initTheme() {
    // Check for saved theme preference, default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ============================================
// Constants
// ============================================
const ADMIN_CODE_SECRET = 'admin_secret_123';

// ============================================
// Mock API Service
// ============================================
const AuthService = {
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    },

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    },

    checkUsernameUnique(username) {
        const users = this.getUsers();
        return !users.some(u => u.username === username);
    },

    checkEmailUnique(email) {
        const users = this.getUsers();
        return !users.some(u => u.email === email);
    },

    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            return { success: true, user: user };
        }
        return { success: false, message: 'Hatalı e-posta veya şifre.' };
    },

    register(userData) {
        const { username, email, password, name, adminCode } = userData;

        if (!this.checkUsernameUnique(username)) {
            return { success: false, message: 'Bu kullanıcı adı zaten alınmış.' };
        }

        if (!this.checkEmailUnique(email)) {
            return { success: false, message: 'Bu e-posta adresi zaten kayıtlı.' };
        }

        let role = 'user';
        if (adminCode === ADMIN_CODE_SECRET) {
            role = 'admin';
        }

        const newUser = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            username,
            name,
            email,
            password,
            role
        };

        this.saveUser(newUser);
        return { success: true, user: newUser };
    }
};

// ============================================
// Category Icons
// ============================================
const categoryIcons = {
    ebook: '📚',
    course: '🎓',
    software: '💻',
    template: '🎨',
    other: '📦'
};

const categoryNames = {
    ebook: 'E-Kitap',
    course: 'Kurs',
    software: 'Yazılım',
    template: 'Şablon',
    other: 'Diğer'
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initializeApp();
    initializeAuth();
    loadCart();
    loadFavorites();
    loadOrders();

    setupEventListeners();
    initThemeToggle();
    detectAndRenderProducts();
    updateCartBadge();
    setupNavbarScroll();
});

function initializeApp() {
    // Add default products if none exist
    if (products.length === 0) {
        products = [
            {
                id: generateId(),
                name: 'Premium JavaScript Kursu',
                description: 'Sıfırdan ileri seviye JavaScript öğrenin. 50+ saat video içerik, pratik projeler ve sertifika.',
                price: 299.99,
                category: 'course',
                image: ''
            },
            {
                id: generateId(),
                name: 'Modern Web Tasarım Şablonları',
                description: '20 adet profesyonel web sitesi şablonu. HTML, CSS ve JavaScript ile hazırlanmış.',
                price: 149.99,
                category: 'template',
                image: ''
            },
            {
                id: generateId(),
                name: 'Python Programlama E-Kitabı',
                description: '500+ sayfa kapsamlı Python rehberi. Temel kavramlardan ileri düzey konulara kadar.',
                price: 79.99,
                category: 'ebook',
                image: ''
            }
        ];
        saveProducts();
    }

    // Default Admin User (seed if empty)
    const users = AuthService.getUsers();
    if (users.length === 0) {
        const adminUser = {
            id: generateId(),
            username: 'admin',
            name: 'System Admin',
            email: 'admin@digimarket.com',
            password: 'admin',
            role: 'admin'
        };
        AuthService.saveUser(adminUser);
        console.log('Default admin created: admin@digimarket.com / admin');
    }
}

function initializeAuth() {
    updateAuthUI();
}

function setupEventListeners() {
    // Navigation
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', openCart);

    // Auth Buttons
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);

    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) registerBtn.addEventListener('click', openRegisterModal);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Switch between modals
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            closeLoginModal();
            openRegisterModal();
        });
    }

    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeRegisterModal();
            openLoginModal();
        });
    }

    // Admin Button (Navbar)
    const navAdminBtn = document.getElementById('navAdminBtn');
    if (navAdminBtn) navAdminBtn.addEventListener('click', openAdminPanel);

    // Hero Admin Button (only on home page)
    const heroAdminBtn = document.getElementById('heroAdminBtn');
    if (heroAdminBtn) {
        heroAdminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser && currentUser.role === 'admin') {
                openAdminPanel();
            } else {
                showNotification('Admin yetkiniz yok veya giriş yapmadınız.');
            }
        });
    }

    // Cart Modal
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);

    // Admin Modal
    const adminClose = document.getElementById('adminClose');
    const adminOverlay = document.getElementById('adminOverlay');
    const productForm = document.getElementById('productForm');
    if (adminClose) adminClose.addEventListener('click', closeAdmin);
    if (adminOverlay) adminOverlay.addEventListener('click', closeAdmin);
    if (productForm) productForm.addEventListener('submit', handleProductSubmit);

    // Checkout Modal
    const checkoutClose = document.getElementById('checkoutClose');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckout);
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);


    // Success Modal
    const successClose = document.getElementById('successClose');
    const successOverlay = document.getElementById('successOverlay');
    if (successClose) successClose.addEventListener('click', closeSuccess);
    if (successOverlay) successOverlay.addEventListener('click', closeSuccess);

    // Login Modal
    const loginClose = document.getElementById('loginClose');
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginClose) loginClose.addEventListener('click', closeLoginModal);
    if (loginOverlay) loginOverlay.addEventListener('click', closeLoginModal);

    // Register Modal
    const registerClose = document.getElementById('registerClose');
    const registerOverlay = document.getElementById('registerOverlay');
    if (registerClose) registerClose.addEventListener('click', closeRegisterModal);
    if (registerOverlay) registerOverlay.addEventListener('click', closeRegisterModal);

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // Card formatting
    const cardInput = document.getElementById('cardNumber');
    if (cardInput) cardInput.addEventListener('input', formatCardNumber);
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) expiryInput.addEventListener('input', formatExpiryDate);
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) cvvInput.addEventListener('input', formatCVV);

    // FAQ Accordion
    setupFAQ();

    // Animate stats on page load
    animateStats();
}

// ============================================
// Auth Logic
// ============================================
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userBtn = document.getElementById('userBtn');
    const userBtnName = document.getElementById('userBtnName');
    const heroAdminBtn = document.getElementById('heroAdminBtn');
    const emptyStateAdminBtn = document.getElementById('emptyStateAdminBtn');
    const adminHint = document.getElementById('adminHint');

    if (currentUser) {
        // Logged In - Hide auth buttons, show user button
        if (authButtons) authButtons.classList.add('hidden');
        if (userBtn) {
            userBtn.classList.remove('hidden');
            if (userBtnName) userBtnName.textContent = currentUser.name;
        }

        // Admin Visibility
        if (currentUser.role === 'admin') {
            if (heroAdminBtn) heroAdminBtn.classList.remove('hidden');
            if (emptyStateAdminBtn) emptyStateAdminBtn.classList.remove('hidden');
            if (adminHint) adminHint.classList.remove('hidden');
        } else {
            if (heroAdminBtn) heroAdminBtn.classList.add('hidden');
            if (emptyStateAdminBtn) emptyStateAdminBtn.classList.add('hidden');
            if (adminHint) adminHint.classList.add('hidden');
        }
    } else {
        // Logged Out - Show auth buttons, hide user button
        if (authButtons) authButtons.classList.remove('hidden');
        if (userBtn) userBtn.classList.add('hidden');
        if (heroAdminBtn) heroAdminBtn.classList.add('hidden');
        if (emptyStateAdminBtn) emptyStateAdminBtn.classList.add('hidden');
        if (adminHint) adminHint.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = AuthService.login(email, password);

    if (result.success) {
        currentUser = result.user;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Load user's data
        loadCart();
        loadFavorites();
        loadOrders();
        updateCartBadge();
        renderProducts(); // Re-render to show favorite states

        updateAuthUI();
        closeLoginModal();
        showNotification(`Hoşgeldin, ${currentUser.name}!`);
        e.target.reset();
    } else {
        showNotification(result.message);
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const adminCode = document.getElementById('adminCode').value;

    const result = AuthService.register({
        username,
        name,
        email,
        password,
        adminCode
    });

    if (result.success) {
        // Auto login
        currentUser = result.user;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        updateAuthUI();
        closeRegisterModal();
        showNotification('Hesap oluşturuldu!');
        e.target.reset();
    } else {
        showNotification(result.message);
    }
}

function handleLogout(e) {
    e.preventDefault();

    // Save current cart before logout
    saveCart();

    // Clear user data for next user
    cart = [];
    favorites = [];
    orders = [];

    currentUser = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('guestCart');

    updateCartBadge();
    updateAuthUI();
    renderProducts(); // Re-render to clear favorite states
    showNotification('Çıkış yapıldı.');
}



// ============================================
// Favorites Functions
// ============================================
function toggleFavorite(productId) {
    if (!currentUser) {
        showNotification('Favorilere eklemek için giriş yapın.');
        return;
    }

    const index = favorites.indexOf(productId);
    if (index === -1) {
        favorites.push(productId);
        showNotification('Favorilere eklendi! ❤️');
    } else {
        favorites.splice(index, 1);
        showNotification('Favorilerden çıkarıldı.');
    }
    saveFavorites();
    renderProducts();
}

function isFavorite(productId) {
    return favorites.includes(productId);
}

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

function openRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
}

// ============================================
// FAQ Accordion
// ============================================
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ============================================
// Animated Statistics Counter
// ============================================
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');

    statValues.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target.toLocaleString();
            }
        };

        // Start animation when section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(stat);
    });
}

// ============================================
// Search Functions
// ============================================
let searchQuery = '';

function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchQuery = searchInput.value.toLowerCase().trim();

    if (searchQuery === '') {
        // If on products page, reset.
        if (document.getElementById('productsGrid')) {
            renderProducts();
        }
        return;
    }

    // Redirect if not on a page that can show results (products.html or index.html with grid)
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        window.location.href = `products.html?search=${encodeURIComponent(searchQuery)}`;
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        categoryNames[product.category].toLowerCase().includes(searchQuery)
    );

    renderSearchResults(filteredProducts);
}

function renderSearchResults(filteredProducts) {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    if (!productsGrid || !emptyState) return;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="search-no-results">
                <div class="empty-icon">🔍</div>
                <h3>"${searchQuery}" için sonuç bulunamadı</h3>
                <p>Farklı bir arama terimi deneyin.</p>
                <button class="btn-primary" onclick="clearSearch()">Aramayı Temizle</button>
            </div>
        `;
        emptyState.classList.remove('show');
    } else {
        emptyState.classList.remove('show');
        productsGrid.innerHTML = `
            <div class="search-results-header">
                <p>"<strong>${searchQuery}</strong>" için ${filteredProducts.length} sonuç bulundu</p>
                <button class="btn-secondary" onclick="clearSearch()">Aramayı Temizle</button>
            </div>
        ` + filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <button class="favorite-btn ${isFavorite(product.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${product.id}')" title="Favorilere Ekle">
                    ${isFavorite(product.id) ? '❤️' : '🤍'}
                </button>
                <a href="product-detail.html?id=${product.id}" class="product-image-link">
                    <div class="product-image">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}">` : categoryIcons[product.category]}
                    </div>
                </a>
                <div class="product-info">
                    <span class="product-category">${categoryNames[product.category]}</span>
                    <a href="product-detail.html?id=${product.id}" class="product-name-link">
                        <h3 class="product-name">${product.name}</h3>
                    </a>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">₺${product.price.toFixed(2)}</span>
                        <button class="btn-primary add-to-cart">Sepete Ekle</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add event listener for add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = e.target.closest('.product-card').dataset.id;
            addToCart(productId);
        });
    });
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    renderProducts();
}

// ============================================
// Product Management
// ============================================
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    // Only render if we're on a page with products grid
    if (!productsGrid || !emptyState) return;

    if (products.length === 0) {
        productsGrid.innerHTML = '';
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <button class="favorite-btn ${isFavorite(product.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${product.id}')" title="Favorilere Ekle">
                    ${isFavorite(product.id) ? '❤️' : '🤍'}
                </button>
                <a href="product-detail.html?id=${product.id}" class="product-image-link">
                    <div class="product-image">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}">` : categoryIcons[product.category]}
                    </div>
                </a>
                <div class="product-info">
                    <span class="product-category">${categoryNames[product.category]}</span>
                    <a href="product-detail.html?id=${product.id}" class="product-name-link">
                        <h3 class="product-name">${product.name}</h3>
                    </a>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">₺${product.price.toFixed(2)}</span>
                        <button class="btn-primary add-to-cart">Sepete Ekle</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add event listener for add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = e.target.closest('.product-card').dataset.id;
            addToCart(productId);
        });
    });
}


function handleProductSubmit(e) {
    e.preventDefault();

    const product = {
        id: generateId(),
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value
    };

    products.push(product);
    saveProducts();
    renderProducts();
    renderAdminProducts();

    // Reset form
    e.target.reset();

    // Show success feedback
    showNotification('Ürün başarıyla eklendi!');
}

function deleteProduct(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProducts();
        renderAdminProducts();

        // Remove from cart if exists
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCart();
        updateCartBadge();

        showNotification('Ürün silindi');
    }
}

function renderAdminProducts() {
    const adminProductList = document.getElementById('adminProductList');

    // Safety check if element doesn't exist
    if (!adminProductList) return;

    if (products.length === 0) {
        adminProductList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Henüz ürün eklenmedi</p>';
    } else {
        adminProductList.innerHTML = products.map(product => `
            <div class="admin-product-item">
                <div class="admin-product-info">
                    <div class="admin-product-name">${product.name}</div>
                    <div class="admin-product-details">
                        ${categoryNames[product.category]} • ₺${product.price.toFixed(2)}
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="openEditProduct('${product.id}')">
                        Düzenle
                    </button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">
                        Sil
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Edit Product Functions
let editingProductId = null;

function openEditProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;

    // Check if edit modal exists, if not create it
    let editModal = document.getElementById('editProductModal');
    if (!editModal) {
        createEditProductModal();
        editModal = document.getElementById('editProductModal');
    }

    // Populate form
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductImage').value = product.image || '';

    editModal.classList.add('active');
}

function closeEditProduct() {
    const editModal = document.getElementById('editProductModal');
    if (editModal) {
        editModal.classList.remove('active');
    }
    editingProductId = null;
}

function createEditProductModal() {
    const modalHTML = `
        <div class="modal" id="editProductModal">
            <div class="modal-overlay" onclick="closeEditProduct()"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h2>Ürün Düzenle</h2>
                    <button class="modal-close" onclick="closeEditProduct()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editProductForm" onsubmit="handleEditProductSubmit(event)">
                        <div class="form-group">
                            <label for="editProductName">Ürün Adı</label>
                            <input type="text" id="editProductName" required placeholder="Ürün adını girin">
                        </div>
                        <div class="form-group">
                            <label for="editProductDescription">Açıklama</label>
                            <textarea id="editProductDescription" required rows="3" placeholder="Ürün açıklaması"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="editProductPrice">Fiyat (₺)</label>
                            <input type="number" id="editProductPrice" required min="0" step="0.01" placeholder="99.99">
                        </div>
                        <div class="form-group">
                            <label for="editProductCategory">Kategori</label>
                            <select id="editProductCategory" required>
                                <option value="ebook">E-Kitap</option>
                                <option value="course">Kurs</option>
                                <option value="software">Yazılım</option>
                                <option value="template">Şablon</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editProductImage">Görsel URL (Opsiyonel)</label>
                            <input type="url" id="editProductImage" placeholder="https://example.com/image.jpg">
                        </div>
                        <button type="submit" class="btn-primary btn-block">Değişiklikleri Kaydet</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function handleEditProductSubmit(e) {
    e.preventDefault();

    if (!editingProductId) return;

    const productIndex = products.findIndex(p => p.id === editingProductId);
    if (productIndex === -1) return;

    // Update product
    products[productIndex] = {
        ...products[productIndex],
        name: document.getElementById('editProductName').value,
        description: document.getElementById('editProductDescription').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        category: document.getElementById('editProductCategory').value,
        image: document.getElementById('editProductImage').value
    };

    saveProducts();
    renderProducts();
    renderAdminProducts();
    closeEditProduct();

    showNotification('Ürün güncellendi!');
}


// ============================================
// Cart Management
// ============================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        showNotification('Bu ürün zaten sepetinizde!');
        return;
    }

    cart.push({ ...product });
    saveCart();
    updateCartBadge();
    showNotification('Ürün sepete eklendi!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartBadge();
    showNotification('Ürün sepetten çıkarıldı');
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const totalAmount = document.getElementById('totalAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        checkoutBtn.disabled = true;
        totalAmount.textContent = '₺0.00';
    } else {
        cartItems.style.display = 'flex';
        cartEmpty.style.display = 'none';
        checkoutBtn.disabled = false;

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        totalAmount.textContent = `₺${total.toFixed(2)}`;

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : categoryIcons[item.category]}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-category">${categoryNames[item.category]}</div>
                    <div class="cart-item-price">₺${item.price.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    Çıkar
                </button>
            </div>
        `).join('');
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    badge.textContent = cart.length;
}

// ============================================
// Checkout Management
// ============================================
function openCheckout() {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.2; // 20% KDV
    const total = subtotal + tax;

    document.getElementById('checkoutSubtotal').textContent = `₺${subtotal.toFixed(2)}`;
    document.getElementById('checkoutTax').textContent = `₺${tax.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `₺${total.toFixed(2)}`;

    closeCart();
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('checkoutForm').reset();
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    // Create order record
    if (currentUser && cart.length > 0) {
        const order = {
            id: generateId(),
            date: new Date().toISOString(),
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        orders.push(order);
        saveOrders();
    }

    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();

    // Close checkout and show success
    closeCheckout();
    document.getElementById('successModal').classList.add('active');

    // Reset form
    e.target.reset();
}

// ============================================
// Modal Controls
// ============================================
function openCart() {
    renderCart();
    document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

function openAdminPanel() {
    // Security Check
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Yetkisiz erişim!');
        return;
    }

    document.getElementById('adminModal').classList.add('active');
    renderAdminProducts();
}

function closeAdmin() {
    document.getElementById('adminModal').classList.remove('active');
}

function closeSuccess() {
    document.getElementById('successModal').classList.remove('active');
}

// ============================================
// Utility Functions
// ============================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function saveCart() {
    if (currentUser) {
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    } else {
        sessionStorage.setItem('guestCart', JSON.stringify(cart));
    }
}

function showNotification(message) {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ============================================
// Input Formatting
// ============================================
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
}

// ============================================
// Animations
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Navbar Hide on Scroll
// ============================================
function setupNavbarScroll() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 100; // Minimum scroll before hiding

    if (!navbar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Only apply hide/show after scrolling past threshold
        if (scrollTop > scrollThreshold) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down - hide navbar
                navbar.classList.add('hidden');
            } else {
                // Scrolling up - show navbar
                navbar.classList.remove('hidden');
            }
        } else {
            // At top of page - always show
            navbar.classList.remove('hidden');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
}

// ============================================
// Category Detection and Filtering
// ============================================
function detectAndRenderProducts() {
    // Check for search parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');

    if (searchParam) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchParam;
            // Decode needed for display? performSearch handles it from input value
            // But we need to set the global searchQuery
            searchQuery = searchInput.value.toLowerCase().trim();

            // Perform the search directly
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery) ||
                categoryNames[product.category].toLowerCase().includes(searchQuery)
            );
            renderSearchResults(filteredProducts);
            return; // Stop further rendering
        }
    }

    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Category page mapping
    const categoryMap = {
        'ebooks.html': 'ebook',
        'courses.html': 'course',
        'software.html': 'software',
        'templates.html': 'template'
    };

    // Check if we're on a category page
    const category = categoryMap[currentPage];

    if (category) {
        // Render filtered products for this category
        renderProductsByCategory(category);
    } else {
        // Render all products (for products.html or index.html)
        renderProducts();
    }
}

function renderProductsByCategory(category) {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    // Only render if we're on a page with products grid
    if (!productsGrid || !emptyState) return;

    // Filter products by category
    const filteredProducts = products.filter(p => p.category === category);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '';
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <button class="favorite-btn ${isFavorite(product.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${product.id}')" title="Favorilere Ekle">
                    ${isFavorite(product.id) ? '❤️' : '🤍'}
                </button>
                <a href="product-detail.html?id=${product.id}" class="product-image-link">
                    <div class="product-image">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}">` : categoryIcons[product.category]}
                    </div>
                </a>
                <div class="product-info">
                    <span class="product-category">${categoryNames[product.category]}</span>
                    <a href="product-detail.html?id=${product.id}" class="product-name-link">
                        <h3 class="product-name">${product.name}</h3>
                    </a>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">₺${product.price.toFixed(2)}</span>
                        <button class="btn-primary add-to-cart">Sepete Ekle</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add event listener for add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = e.target.closest('.product-card').dataset.id;
            addToCart(productId);
        });
    });
}

