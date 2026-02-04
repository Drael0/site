// ============================================
// Firebase Configuration
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyDrf6Z579YtdasOZbj3ILfa7r3yLNWGsWg",
    authDomain: "drael-44ea9.firebaseapp.com",
    databaseURL: "https://drael-44ea9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "drael-44ea9",
    storageBucket: "drael-44ea9.firebasestorage.app",
    messagingSenderId: "309387990667",
    appId: "1:309387990667:web:c5afcb99d349a194c0668e",
    measurementId: "G-PBSB7X2MLT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// Firestore Database Service
// ============================================
const FirestoreService = {
    // ============================================
    // Products
    // ============================================
    async getProducts() {
        try {
            const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    },

    async addProduct(product) {
        try {
            const docRef = await db.collection('products').add({
                ...product,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...product };
        } catch (error) {
            console.error('Error adding product:', error);
            return null;
        }
    },

    async updateProduct(productId, product) {
        try {
            await db.collection('products').doc(productId).update(product);
            return true;
        } catch (error) {
            console.error('Error updating product:', error);
            return false;
        }
    },

    async deleteProduct(productId) {
        try {
            await db.collection('products').doc(productId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    },

    // ============================================
    // Users
    // ============================================
    async getUser(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    async createUser(userId, userData) {
        try {
            await db.collection('users').doc(userId).set({
                ...userData,
                favorites: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error creating user:', error);
            return false;
        }
    },

    async updateUser(userId, userData) {
        try {
            await db.collection('users').doc(userId).update(userData);
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    },

    async checkUsernameExists(username) {
        try {
            const snapshot = await db.collection('users').where('username', '==', username).get();
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking username:', error);
            return true; // Assume exists on error for safety
        }
    },

    // ============================================
    // Favorites
    // ============================================
    async getFavorites(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                return doc.data().favorites || [];
            }
            return [];
        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    },

    async updateFavorites(userId, favorites) {
        try {
            await db.collection('users').doc(userId).update({ favorites });
            return true;
        } catch (error) {
            console.error('Error updating favorites:', error);
            return false;
        }
    },

    // ============================================
    // Cart
    // ============================================
    async getCart(userId) {
        try {
            const doc = await db.collection('carts').doc(userId).get();
            if (doc.exists) {
                return doc.data().items || [];
            }
            return [];
        } catch (error) {
            console.error('Error getting cart:', error);
            return [];
        }
    },

    async updateCart(userId, items) {
        try {
            await db.collection('carts').doc(userId).set({ items, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            return true;
        } catch (error) {
            console.error('Error updating cart:', error);
            return false;
        }
    },

    // ============================================
    // Orders
    // ============================================
    async getOrders(userId) {
        try {
            const snapshot = await db.collection('orders')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    },

    async addOrder(order) {
        try {
            const docRef = await db.collection('orders').add({
                ...order,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...order };
        } catch (error) {
            console.error('Error adding order:', error);
            return null;
        }
    },

    // ============================================
    // Reviews
    // ============================================
    async getReviews(productId) {
        try {
            const snapshot = await db.collection('reviews')
                .where('productId', '==', productId)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting reviews:', error);
            return [];
        }
    },

    async addReview(review) {
        try {
            const docRef = await db.collection('reviews').add({
                ...review,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...review };
        } catch (error) {
            console.error('Error adding review:', error);
            return null;
        }
    },

    async deleteReview(reviewId) {
        try {
            await db.collection('reviews').doc(reviewId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting review:', error);
            return false;
        }
    },

    // ============================================
    // Initialize Default Data
    // ============================================
    async initializeDefaultProducts() {
        try {
            const snapshot = await db.collection('products').get();
            if (snapshot.empty) {
                const defaultProducts = [
                    {
                        name: 'Premium JavaScript Kursu',
                        description: 'Sıfırdan ileri seviye JavaScript öğrenin. 50+ saat video içerik, pratik projeler ve sertifika.',
                        price: 299.99,
                        category: 'course',
                        image: ''
                    },
                    {
                        name: 'Modern Web Tasarım Şablonları',
                        description: '20 adet profesyonel web sitesi şablonu. HTML, CSS ve JavaScript ile hazırlanmış.',
                        price: 149.99,
                        category: 'template',
                        image: ''
                    },
                    {
                        name: 'Python Programlama E-Kitabı',
                        description: '500+ sayfa kapsamlı Python rehberi. Temel kavramlardan ileri düzey konulara kadar.',
                        price: 79.99,
                        category: 'ebook',
                        image: ''
                    }
                ];

                for (const product of defaultProducts) {
                    await this.addProduct(product);
                }
                console.log('Default products initialized');
            }
        } catch (error) {
            console.error('Error initializing default products:', error);
        }
    },

    async initializeDefaultAdmin() {
        try {
            // Check if admin exists
            const snapshot = await db.collection('users').where('role', '==', 'admin').get();
            if (snapshot.empty) {
                // Create admin user in Firebase Auth and Firestore
                // Note: The first user to register with admin code will be admin
                console.log('No admin found. First user with admin code will become admin.');
            }
        } catch (error) {
            console.error('Error checking admin:', error);
        }
    }
};

// ============================================
// Firebase Auth Service
// ============================================
const FirebaseAuthService = {
    async register(email, password, userData) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update display name
            await user.updateProfile({ displayName: userData.name });

            // Create user document in Firestore
            await FirestoreService.createUser(user.uid, {
                username: userData.username,
                name: userData.name,
                email: email,
                role: userData.role || 'user'
            });

            return { success: true, user: { id: user.uid, ...userData, email } };
        } catch (error) {
            console.error('Registration error:', error);
            let message = 'Kayıt sırasında bir hata oluştu.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Bu e-posta adresi zaten kayıtlı.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Şifre en az 6 karakter olmalıdır.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Geçersiz e-posta adresi.';
            }
            return { success: false, message };
        }
    },

    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get user data from Firestore
            const userData = await FirestoreService.getUser(user.uid);

            if (userData) {
                return { success: true, user: userData };
            } else {
                return { success: false, message: 'Kullanıcı bilgileri bulunamadı.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            let message = 'Giriş sırasında bir hata oluştu.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'Hatalı e-posta veya şifre.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Geçersiz e-posta adresi.';
            }
            return { success: false, message };
        }
    },

    async logout() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: 'Çıkış sırasında bir hata oluştu.' };
        }
    },

    getCurrentUser() {
        return auth.currentUser;
    },

    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
    }
};

console.log('Firebase initialized successfully!');
