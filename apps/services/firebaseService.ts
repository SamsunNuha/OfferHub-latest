import { auth as fbAuth, db as fbDb } from '../firebase/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { 
  User, Brand, Offer, Product, Order, Notification, Coupon, VisaPaymentRecord, AuctionItem,
  Category, District, Favorite, ScannerHistory, Review, Ticket,
  initialUsers, initialBrands, initialOffers, initialCoupons, initialProducts, initialNotifications, initialOrders, initialPayments,
  initialCategories, initialDistricts, initialFavorites, initialScannerHistory, initialReviews, initialTickets
} from '../shared/mockDb';

// Local Memory State (Fallback Database)
const localDb = {
  users: [...initialUsers],
  brands: [...initialBrands],
  offers: [...initialOffers],
  products: [...initialProducts],
  coupons: [...initialCoupons],
  notifications: [...initialNotifications],
  orders: [...initialOrders],
  payments: [...initialPayments],
  categories: [...initialCategories],
  districts: [...initialDistricts],
  favorites: [...initialFavorites],
  scannerHistory: [...initialScannerHistory],
  reviews: [...initialReviews],
  tickets: [...initialTickets]
};

// Tracks active firebase online/offline state
let isFirebaseOnline = false;

// Attempt a quick connection verification or config presence check
function checkFirebaseConfigured(): boolean {
  try {
    if (!fbAuth || !fbDb) return false;
    // Check if configuration looks like the default placeholder
    const app = fbAuth.app;
    if (app.options.apiKey?.includes('DummyKey')) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

const fbConfigured = checkFirebaseConfigured();

export const FirebaseService = {
  isFirebaseAvailable(): boolean {
    return fbConfigured;
  },

  // ----------------------------------------------------
  // AUTHENTICATION SERVICES
  // ----------------------------------------------------

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    const cleanedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (fbConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(fbAuth, cleanedEmail, trimmedPassword);
        const fbUser = userCredential.user;
        
        // Fetch profile details from Firestore
        const userDocRef = doc(fbDb, 'users', cleanedEmail);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const profile = userDoc.data() as User;
          isFirebaseOnline = true;
          // Save login event log to Firestore logins collection
          try {
            await addDoc(collection(fbDb, 'logins'), {
              email: cleanedEmail,
              name: profile.name,
              timestamp: Date.now(),
              date: new Date().toLocaleString()
            });
          } catch (logErr) {
            console.warn("Could not save login log to Firestore:", logErr);
          }
          return { success: true, user: profile, message: "Logged in successfully!" };
        } else {
          // If Firestore record doesn't exist yet, create a default normal profile
          const newProfile: User = {
            email: cleanedEmail,
            name: fbUser.displayName || email.split('@')[0],
            role: cleanedEmail === 'admin@offerlanka.com' ? 'ADMIN' : 'NORMAL',
            rewardPoints: 150,
            savedOfferIds: "",
            district: "Colombo",
            walletBalance: 1500.0,
            subscriptionState: "FREE",
            referralCode: `REF-${(fbUser.displayName || 'LANKA').slice(0, 5).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            hasClaimedReferral: false
          };
          await setDoc(userDocRef, newProfile);
          isFirebaseOnline = true;
          // Save login event log to Firestore logins collection
          try {
            await addDoc(collection(fbDb, 'logins'), {
              email: cleanedEmail,
              name: newProfile.name,
              timestamp: Date.now(),
              date: new Date().toLocaleString()
            });
          } catch (logErr) {
            console.warn("Could not save login log to Firestore:", logErr);
          }
          return { success: true, user: newProfile, message: "Logged in and profile synced!" };
        }
      } catch (err: any) {
        console.error("Firebase Auth failed, trying local fallback:", err.message);
        // Fall through to local fallback
      }
    }

    // Local Fallback Login
    const match = localDb.users.find(u => u.email === cleanedEmail);
    if (!match) {
      return { success: false, message: "No account found with this email. Please register." };
    }
    if (match.password !== trimmedPassword) {
      return { success: false, message: "Incorrect password. Please try again." };
    }
    // Save login event to local database
    if (!(localDb as any).logins) {
      (localDb as any).logins = [];
    }
    (localDb as any).logins.push({
      email: cleanedEmail,
      name: match.name,
      timestamp: Date.now(),
      date: new Date().toLocaleString()
    });
    return { success: true, user: match, message: "Logged in successfully (Offline Mode)!" };
  },

  async register(
    name: string,
    email: string,
    role: 'NORMAL' | 'MERCHANT' | 'ADMIN',
    password: string = 'demo123',
    district: string = 'Colombo',
    phoneNumber?: string
  ): Promise<{ success: boolean; user?: User; message: string }> {
    const cleanedEmail = email.trim().toLowerCase();
    
    // Generate referral code
    const customNamePart = name.trim().replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'LANKA';
    const refCode = `REF-${customNamePart}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProfile: User = {
      email: cleanedEmail,
      name: name.trim(),
      role: role,
      rewardPoints: 150, // Welcome points
      savedOfferIds: "",
      password: password, // kept for local fallback validation
      district: district,
      phoneNumber: phoneNumber?.trim() || undefined,
      walletBalance: 1500.0, // Rs. 1500 cashback
      subscriptionState: "FREE",
      referralCode: refCode,
      hasClaimedReferral: false
    };

    if (fbConfigured) {
      try {
        // Enforce unique registration checks in Firestore before auth creation
        const userDocRef = doc(fbDb, 'users', cleanedEmail);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return { success: false, message: "An account with this email already exists." };
        }

        // Check phone uniqueness if provided
        if (phoneNumber) {
          const phoneQuery = query(collection(fbDb, 'users'), where('phoneNumber', '==', phoneNumber));
          const phoneSnap = await getDocs(phoneQuery);
          if (!phoneSnap.empty) {
            return { success: false, message: "An account with this phone number already exists." };
          }
        }

        await createUserWithEmailAndPassword(fbAuth, cleanedEmail, password);
        if (fbAuth.currentUser) {
          await updateProfile(fbAuth.currentUser, { displayName: name.trim() });
        }
        
        // Save to Firestore
        await setDoc(userDocRef, newProfile);
        isFirebaseOnline = true;
        return { success: true, user: newProfile, message: "Account created successfully! Welcome to OfferHub." };
      } catch (err: any) {
        console.error("Firebase register failed, using local storage:", err.message);
        if (err.code === 'auth/email-already-in-use') {
          return { success: false, message: "An account with this email already exists." };
        }
        // Fall through to local fallback
      }
    }

    // Local Fallback Register
    const existing = localDb.users.find(u => u.email === cleanedEmail);
    if (existing) {
      return { success: false, message: "An account with this email already exists." };
    }

    localDb.users.push(newProfile);
    return { success: true, user: newProfile, message: "Account created successfully (Offline Mode)!" };
  },

  async signOut(): Promise<void> {
    if (fbConfigured) {
      try {
        await fbSignOut(fbAuth);
      } catch (e) {
        console.log("Firebase signout failed", e);
      }
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (fbConfigured) {
      try {
        await sendPasswordResetEmail(fbAuth, email.trim().toLowerCase());
        return { success: true, message: "Password reset link sent to your email." };
      } catch (err: any) {
        return { success: false, message: err.message || "Failed to send reset link." };
      }
    }
    return { success: true, message: "Password reset link sent successfully (Simulated offline)." };
  },

  // ----------------------------------------------------
  // DATA SERVICES: PRODUCTS & OFFERS
  // ----------------------------------------------------

  async getProducts(): Promise<Product[]> {
    if (fbConfigured) {
      try {
        const snap = await getDocs(collection(fbDb, 'products'));
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: Number(d.id) || 0, ...d.data() } as Product));
          // If we retrieved products from firestore, return them
          return list;
        }
      } catch (e) {
        console.warn("Could not load products from Firestore, using local:", e);
      }
    }
    return localDb.products;
  },

  async getOffers(): Promise<Offer[]> {
    if (fbConfigured) {
      try {
        const snap = await getDocs(collection(fbDb, 'offers'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: Number(d.id) || 0, ...d.data() } as Offer));
        }
      } catch (e) {
        console.warn("Could not load offers from Firestore, using local:", e);
      }
    }
    return localDb.offers;
  },

  async getBrands(): Promise<Brand[]> {
    if (fbConfigured) {
      try {
        const snap = await getDocs(collection(fbDb, 'brands'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as Brand);
        }
      } catch (e) {
        console.warn("Could not load brands from Firestore, using local:", e);
      }
    }
    return localDb.brands;
  },

  async getCoupons(): Promise<Coupon[]> {
    if (fbConfigured) {
      try {
        const snap = await getDocs(collection(fbDb, 'coupons'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as Coupon);
        }
      } catch (e) {
        console.warn("Could not load coupons from Firestore, using local:", e);
      }
    }
    return localDb.coupons;
  },

  async getNotifications(): Promise<Notification[]> {
    if (fbConfigured) {
      try {
        const snap = await getDocs(query(collection(fbDb, 'notifications'), orderBy('timestamp', 'desc')));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: Number(d.id) || 0, ...d.data() } as Notification));
        }
      } catch (e) {
        console.warn("Could not load notifications from Firestore:", e);
      }
    }
    return localDb.notifications;
  },

  async getOrders(userEmail: string): Promise<Order[]> {
    const cleanedEmail = userEmail.toLowerCase();
    if (fbConfigured) {
      try {
        const q = query(collection(fbDb, 'orders'), where('userEmail', '==', cleanedEmail), orderBy('id', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: Number(d.id) || 0, ...d.data() } as Order));
        }
      } catch (e) {
        console.warn("Could not load orders from Firestore:", e);
      }
    }
    return localDb.orders.filter(o => o.userEmail === cleanedEmail).sort((a, b) => b.id - a.id);
  },

  async getAllOrders(): Promise<Order[]> {
    if (fbConfigured) {
      try {
        const snap = await getDocs(collection(fbDb, 'orders'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: Number(d.id) || 0, ...d.data() } as Order));
        }
      } catch (e) {
        console.warn("Could not load all orders from Firestore:", e);
      }
    }
    return localDb.orders.sort((a, b) => b.id - a.id);
  },

  async getAllUsers(): Promise<User[]> {
    if (fbConfigured) {
      try {
        const snap = await getDocs(collection(fbDb, 'users'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as User);
        }
      } catch (e) {
        console.warn("Could not load all users from Firestore:", e);
      }
    }
    return localDb.users;
  },

  // ----------------------------------------------------
  // WRITING OPERATIONS & ACTIONS
  // ----------------------------------------------------

  async updateUser(user: User): Promise<void> {
    const cleanedEmail = user.email.toLowerCase();
    
    // Update local variable first
    const idx = localDb.users.findIndex(u => u.email === cleanedEmail);
    if (idx !== -1) {
      localDb.users[idx] = user;
    } else {
      localDb.users.push(user);
    }

    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'users', cleanedEmail), user, { merge: true });
      } catch (e) {
        console.error("Firestore user update failed:", e);
      }
    }
  },

  async addOffer(offer: Offer): Promise<void> {
    localDb.offers.unshift(offer);
    
    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'offers', String(offer.id)), offer);
      } catch (e) {
        console.error("Firestore add offer failed:", e);
      }
    }

    // Auto announce
    await this.addNotification(
      `New Offer from ${offer.storeName}!`,
      `${offer.title}. Valid until ${offer.validUntil}.`,
      "NEW_OFFER"
    );
  },

  async approveOffer(offerId: number): Promise<void> {
    const match = localDb.offers.find(o => o.id === offerId);
    if (match) {
      match.isApproved = true;
      
      if (fbConfigured) {
        try {
          await updateDoc(doc(fbDb, 'offers', String(offerId)), { isApproved: true });
        } catch (e) {
          console.error("Firestore approve offer failed:", e);
        }
      }

      await this.addNotification(
        `Verified Deal: ${match.storeName}!`,
        `${match.title} is now active and verified.`,
        "NEW_OFFER"
      );
    }
  },

  async deleteOffer(offerId: number): Promise<void> {
    const idx = localDb.offers.findIndex(o => o.id === offerId);
    if (idx !== -1) {
      localDb.offers.splice(idx, 1);
    }

    if (fbConfigured) {
      try {
        await deleteDoc(doc(fbDb, 'offers', String(offerId)));
      } catch (e) {
        console.error("Firestore delete offer failed:", e);
      }
    }
  },

  async addProduct(product: Product): Promise<void> {
    localDb.products.unshift(product);
    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'products', String(product.id)), product);
      } catch (e) {
        console.error("Firestore add product failed:", e);
      }
    }
  },

  async approveProduct(productId: number): Promise<void> {
    const match = localDb.products.find(p => p.id === productId);
    if (match) {
      match.isApproved = true;
      if (fbConfigured) {
        try {
          await updateDoc(doc(fbDb, 'products', String(productId)), { isApproved: true });
        } catch (e) {
          console.error("Firestore approve product failed:", e);
        }
      }
    }
  },

  async deleteProduct(productId: number): Promise<void> {
    const idx = localDb.products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      localDb.products.splice(idx, 1);
    }
    if (fbConfigured) {
      try {
        await deleteDoc(doc(fbDb, 'products', String(productId)));
      } catch (e) {
        console.error("Firestore delete product failed:", e);
      }
    }
  },

  async addBrand(brand: Brand): Promise<void> {
    localDb.brands.unshift(brand);
    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'brands', brand.name), brand);
      } catch (e) {
        console.error("Firestore add brand failed:", e);
      }
    }
  },

  async placeOrder(
    userEmail: string,
    productNames: string,
    totalPrice: number,
    paymentMethod: string
  ): Promise<Order> {
    const cleanedEmail = userEmail.toLowerCase();
    const dateStr = new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const orderId = Date.now();
    
    const newOrder: Order = {
      id: orderId,
      userEmail: cleanedEmail,
      productNames,
      totalPrice,
      paymentMethod,
      date: dateStr,
      status: "CONFIRMED"
    };

    localDb.orders.unshift(newOrder);

    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'orders', String(orderId)), newOrder);
      } catch (e) {
        console.error("Firestore save order failed:", e);
      }
    }

    // Award loyalty points
    const pointsAwarded = Math.max(5, Math.floor(totalPrice / 100));
    const userMatch = localDb.users.find(u => u.email === cleanedEmail);
    if (userMatch) {
      userMatch.rewardPoints += pointsAwarded;
      await this.updateUser(userMatch);
    }

    await this.addNotification(
      "Order Placed Successfully!",
      `Your purchase of '${productNames}' totaling LKR ${totalPrice.toLocaleString()} is confirmed. Earned ${pointsAwarded} loyalty points!`,
      "PROMO"
    );

    return newOrder;
  },

  async addNotification(title: string, message: string, type: 'NEW_OFFER' | 'FLASH_SALE' | 'PRICE_DROP' | 'PROMO' = "NEW_OFFER"): Promise<void> {
    const id = Date.now();
    const notification: Notification = {
      id,
      title,
      message,
      type,
      timestamp: Date.now(),
      isRead: false
    };

    localDb.notifications.unshift(notification);

    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'notifications', String(id)), notification);
      } catch (e) {
        console.error("Firestore notify failed:", e);
      }
    }
  },

  // Follow a brand: writes to follows/{userId}/brands/{brandId}
  // and increments followerCount on the brand doc.
  async followBrand(userEmail: string, brandName: string): Promise<void> {
    const userId = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const brandId = brandName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Update local state
    const match = localDb.brands.find(b => b.name === brandName);
    if (match) {
      match.isFollowed = true;
      match.followerCount = (match.followerCount || 0) + 1;
    }

    if (fbConfigured) {
      try {
        // Write follow relationship
        await setDoc(
          doc(fbDb, 'follows', userId, 'brands', brandId),
          { brandName, followedAt: Date.now() }
        );
        // Increment follower count on brand doc
        const brandRef = doc(fbDb, 'brands', brandName);
        const brandSnap = await getDoc(brandRef);
        const current = brandSnap.exists() ? (brandSnap.data()?.followerCount || 0) : 0;
        await updateDoc(brandRef, { followerCount: current + 1, isFollowed: true });
      } catch (e) {
        console.error('Firestore followBrand failed:', e);
      }
    }

    // Notify user
    await this.addNotification(
      `❤️ Following ${brandName}`,
      `You'll get notified when ${brandName} posts new offers or deals!`,
      'PROMO'
    );
  },

  // Unfollow a brand
  async unfollowBrand(userEmail: string, brandName: string): Promise<void> {
    const userId = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const brandId = brandName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Update local state
    const match = localDb.brands.find(b => b.name === brandName);
    if (match) {
      match.isFollowed = false;
      match.followerCount = Math.max(0, (match.followerCount || 1) - 1);
    }

    if (fbConfigured) {
      try {
        await deleteDoc(doc(fbDb, 'follows', userId, 'brands', brandId));
        const brandRef = doc(fbDb, 'brands', brandName);
        const brandSnap = await getDoc(brandRef);
        const current = brandSnap.exists() ? (brandSnap.data()?.followerCount || 1) : 1;
        await updateDoc(brandRef, { followerCount: Math.max(0, current - 1), isFollowed: false });
      } catch (e) {
        console.error('Firestore unfollowBrand failed:', e);
      }
    }
  },

  // Get all brands the user follows (returns set of brand names)
  async getFollowedBrands(userEmail: string): Promise<Set<string>> {
    const userId = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (fbConfigured) {
      try {
        const snap = await getDocs(collection(fbDb, 'follows', userId, 'brands'));
        const names = new Set<string>();
        snap.forEach(d => names.add(d.data().brandName));
        return names;
      } catch (e) {
        console.warn('Could not load followed brands:', e);
      }
    }
    // Local fallback
    const followed = new Set<string>();
    localDb.brands.filter(b => b.isFollowed).forEach(b => followed.add(b.name));
    return followed;
  },

  async redeemCoupon(userEmail: string, code: string): Promise<boolean> {
    const cleanedEmail = userEmail.toLowerCase();
    const user = localDb.users.find(u => u.email === cleanedEmail);
    const coupon = localDb.coupons.find(c => c.code === code);

    if (!user || !coupon || coupon.isRedeemed) return false;
    if (user.rewardPoints < coupon.costPoints) return false;

    // Deduct points
    user.rewardPoints -= coupon.costPoints;
    coupon.isRedeemed = true;

    await this.updateUser(user);

    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'coupons', code), { isRedeemed: true }, { merge: true });
      } catch (e) {
        console.error("Firestore redeem coupon failed:", e);
      }
    }

    await this.addNotification(
      "Coupon Redeemed!",
      `Successfully redeemed code '${code}' for ${coupon.costPoints} points. discount LKR ${coupon.discountAmount} active.`,
      "PROMO"
    );

    return true;
  },

  async saveVisaPayment(record: VisaPaymentRecord): Promise<void> {
    localDb.payments.push(record);
    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'payments', record.paymentId), record);
      } catch (e) {
        console.error("Firestore payment log failed:", e);
      }
    }
  },

  async addScanHistory(userEmail: string, scanData: any): Promise<void> {
    const scanId = `scan_${Date.now()}`;
    const payload = {
      id: scanId,
      userEmail: userEmail.toLowerCase(),
      productName: scanData.productName,
      brand: scanData.brand,
      price: scanData.price,
      confidenceScore: scanData.confidenceScore,
      timestamp: new Date().toLocaleString(),
    };

    (localDb.scannerHistory as any[]).unshift(payload);

    if (fbConfigured) {
      try {
        await setDoc(doc(fbDb, 'scan_history', scanId), payload);
      } catch (e) {
        console.error("Firestore save scan history failed:", e);
      }
    }
  },

  async getScanHistory(userEmail: string): Promise<any[]> {
    const cleaned = userEmail.toLowerCase();
    if (fbConfigured) {
      try {
        const q = query(collection(fbDb, 'scan_history'), where('userEmail', '==', cleaned));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data());
        }
      } catch (e) {
        console.warn("Could not load scan history from Firestore:", e);
      }
    }
    return (localDb.scannerHistory as any[]).filter(s => !s.userEmail || s.userEmail === cleaned);
  },

  // ----------------------------------------------------
  // AUTOMATIC SEEDING ON REAL FIREBASE
  // ----------------------------------------------------

  async seedFirebaseIfNeeded(): Promise<void> {
    if (!fbConfigured) return;
    try {
      // Check if products collection is populated
      const snap = await getDocs(query(collection(fbDb, 'products')));
      if (snap.empty) {
        console.log("Seeding real Firebase Firestore database collections with initial mock data...");
        // 1. Seed Products
        for (const p of initialProducts) {
          await setDoc(doc(fbDb, 'products', String(p.id)), p);
        }
        // 2. Seed Offers
        for (const o of initialOffers) {
          await setDoc(doc(fbDb, 'offers', String(o.id)), o);
        }
        // 3. Seed Brands
        for (const b of initialBrands) {
          await setDoc(doc(fbDb, 'brands', b.name), b);
        }
        // 4. Seed Coupons
        for (const c of initialCoupons) {
          await setDoc(doc(fbDb, 'coupons', c.code), c);
        }
        // 5. Seed System Notifications
        for (const n of initialNotifications) {
          await setDoc(doc(fbDb, 'notifications', String(n.id)), n);
        }
        // 6. Seed Users
        for (const u of initialUsers) {
          await setDoc(doc(fbDb, 'users', u.email), u);
        }
        // 7. Seed Orders
        for (const ord of initialOrders) {
          await setDoc(doc(fbDb, 'orders', String(ord.id)), ord);
        }
        // 8. Seed Payments
        for (const pay of initialPayments) {
          await setDoc(doc(fbDb, 'payments', pay.paymentId), pay);
        }
        // 9. Seed Categories
        for (const cat of initialCategories) {
          await setDoc(doc(fbDb, 'categories', cat.id), cat);
        }
        // 10. Seed Districts
        for (const dist of initialDistricts) {
          await setDoc(doc(fbDb, 'districts', dist.id), dist);
        }
        // 11. Seed Companies (Duplicate of Brands to satisfy both references)
        for (const b of initialBrands) {
          await setDoc(doc(fbDb, 'companies', b.name), b);
        }
        // 12. Seed Favorites
        for (const fav of initialFavorites) {
          await setDoc(doc(fbDb, 'favorites', `${fav.email}_${fav.productId}`), fav);
        }
        // 13. Seed Scanner History
        for (const scan of initialScannerHistory) {
          await setDoc(doc(fbDb, 'scanner_history', String(scan.id)), scan);
        }
        // 14. Seed Reviews
        for (const rev of initialReviews) {
          await setDoc(doc(fbDb, 'reviews', String(rev.id)), rev);
        }
        console.log("Firebase Firestore seeding completed successfully!");
      } else {
        // Sync new brands or brand logo changes to Firestore if it's already seeded
        const brandsSnap = await getDocs(collection(fbDb, 'brands'));
        const dbBrands = new Map<string, any>();
        brandsSnap.forEach(d => {
          dbBrands.set(d.id, d.data());
        });

        let updatedCount = 0;
        for (const b of initialBrands) {
          const existing = dbBrands.get(b.name);
          if (!existing || existing.logo !== b.logo) {
            console.log(`Syncing/Updating brand to Firestore: ${b.name}`);
            await setDoc(doc(fbDb, 'brands', b.name), b);
            updatedCount++;
          }
        }
        if (updatedCount > 0) {
          console.log(`Synced ${updatedCount} brands to Firestore.`);
        }
      }
    } catch (err) {
      console.error("Failed to check or seed Firebase:", err);
    }
  }
};
export default FirebaseService;
