import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, Brand, Offer, Product, Order, Notification, Coupon, VisaPaymentRecord, AuctionItem,
  initialUsers, initialBrands, initialOffers, initialCoupons, initialProducts, initialNotifications
} from './mockDb';
import FirebaseService from '../services/firebaseService';
import { getAiRecommendations } from '../services/geminiService';
import { AppLanguage, translate } from './i18n';

export interface AppContextType {
  // Themes and Translations
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  appLanguage: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;

  // Screen Router
  currentScreen: string;
  navigateTo: (screen: string) => void;
  goBack: () => void;
  canGoBack: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;

  // Selected details
  selectedOffer: Offer | null;
  setSelectedOffer: (offer: Offer | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Auth User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  authReason: string;
  showAuthDialog: boolean;
  setShowAuthDialog: (show: boolean, reason?: string) => void;
  registerRole: 'NORMAL' | 'MERCHANT' | 'ADMIN';
  setRegisterRole: (role: 'NORMAL' | 'MERCHANT' | 'ADMIN') => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, role: 'NORMAL' | 'MERCHANT' | 'ADMIN', password?: string, district?: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateUserRoleSimulated: (role: 'NORMAL' | 'MERCHANT' | 'ADMIN') => Promise<void>;
  updateProfileDetails: (name: string, phone: string, city: string) => Promise<void>;

  // Core Data
  products: Product[];
  offers: Offer[];
  brands: Brand[];
  coupons: Coupon[];
  notifications: Notification[];
  orders: Order[];
  allOrders: Order[];
  allUsers: User[];
  refreshData: () => Promise<void>;
  
  // Admin triggers
  approveOffer: (id: number) => Promise<void>;
  addOffer: (offer: Offer) => Promise<void>;
  deleteOffer: (id: number) => Promise<void>;
  approveProduct: (id: number) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addBrand: (brand: Brand) => Promise<void>;
  toggleFollowBrand: (brandName: string) => Promise<void>;

  // Shopping Cart & Favorites
  cart: Record<number, number>; // productId -> quantity
  addToCart: (product: Product) => void;
  decreaseCart: (product: Product) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
  
  favorites: number[]; // array of product ids
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;

  // Checkout inputs
  billingAddress: string;
  setBillingAddress: (addr: string) => void;
  billingCity: string;
  setBillingCity: (city: string) => void;
  billingPhone: string;
  setBillingPhone: (phone: string) => void;
  paymentCardNo: string;
  setPaymentCardNo: (card: string) => void;
  paymentCardExpiry: string;
  setPaymentCardExpiry: (exp: string) => void;
  paymentCardCvv: string;
  setPaymentCardCvv: (cvv: string) => void;
  selectedCourier: string; // 'std' | 'exp' | 'sday'
  setSelectedCourier: (courier: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accept: boolean) => void;
  enteredPromoCode: string;
  setEnteredPromoCode: (code: string) => void;
  activePromoDiscount: number;
  promoMessage: string;
  validationError: string | null;
  clearValidationError: () => void;
  validateAndProcessCheckout: (paymentMethod: string) => Promise<Order | null>;

  // Live Simulations (Timer & Bidding)
  flashSaleSeconds: number;
  flashSaleStock: Record<number, number>; // itemId -> stock
  claimFlashSaleItem: (itemId: number, itemName: string, price: number) => void;

  liveAuctions: AuctionItem[];
  placeAuctionBid: (id: number) => void;

  // Delivery Courier Tracker
  deliveryActive: boolean;
  deliveryStep: number;
  deliveryDistanceKm: number;
  deliveryEtaMinutes: number;
  deliveryCourierName: string;
  triggerLiveCourierTracking: () => void;

  // Notification Banners
  bannerNotification: string | null;
  pushLogs: string[];
  triggerMockNotification: (title: string, body: string) => void;

  // AI Chat Bot
  chatLogs: Array<{ author: 'AI' | 'USER'; message: string }>;
  aiSearching: boolean;
  sendChatMessage: (msg: string) => Promise<void>;
  
  // Referral
  // Referral & Loyalty
  applyReferralCode: (code: string) => string;
  depositCashbackWallet: (amount: number) => void;
  purchaseVipSubscription: (tier: 'SILVER' | 'GOLD') => string;
  redeemCoupon: (code: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // System states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('EN');
  
  // Screen Router
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [screenHistory, setScreenHistory] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Details Selected
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // User auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReason, setAuthReason] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [registerRole, setRegisterRole] = useState<'NORMAL' | 'MERCHANT' | 'ADMIN'>('NORMAL');

  // Core Data Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Shopping Cart & Favorites
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);

  // Checkout inputs
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [paymentCardNo, setPaymentCardNo] = useState('');
  const [paymentCardExpiry, setPaymentCardExpiry] = useState('');
  const [paymentCardCvv, setPaymentCardCvv] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('std');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [enteredPromoCode, setEnteredPromoCode] = useState('');
  const [activePromoDiscount, setActivePromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Flash sales & Auctions Simulation
  const [flashSaleSeconds, setFlashSaleSeconds] = useState(600);
  const [flashSaleStock, setFlashSaleStock] = useState<Record<number, number>>({ 1: 3, 2: 5, 3: 2 });
  const [liveAuctions, setLiveAuctions] = useState<AuctionItem[]>([]);

  // Delivery Courier Tracker
  const [deliveryActive, setDeliveryActive] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState(0);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState(4.5);
  const [deliveryEtaMinutes, setDeliveryEtaMinutes] = useState(14);
  const [deliveryCourierName, setDeliveryCourierName] = useState('Suresh Perera');

  // Push notifications
  const [bannerNotification, setBannerNotification] = useState<string | null>(null);
  const [pushLogs, setPushLogs] = useState<string[]>([
    "Welcome to OfferHub! Simulated background services active.",
    "Keells Weekly Super Savers promo has been unlocked!",
    "Exclusive Odel card discount detected at Colombo 03 outlet."
  ]);

  // AI Chat Bot
  const [chatLogs, setChatLogs] = useState<Array<{ author: 'AI' | 'USER'; message: string }>>([
    { author: 'AI', message: "Ayu-bowan! I am 'Offer Lanka AI'. Ask me about the best supermarket deals, fashion coupons, or electronic credit card offers in Sri Lanka today!" }
  ]);
  const [aiSearching, setAiSearching] = useState(false);

  // Initial Load
  useEffect(() => {
    refreshData();
    seedAndSyncFirebase();
    initializeAuctions();
  }, []);

  // Background tick timer (1s loop)
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Flash sale seconds ticker
      setFlashSaleSeconds(prev => {
        if (prev > 0) return prev - 1;
        // Loop back
        setFlashSaleStock({
          1: Math.floor(2 + Math.random() * 4), // 2..5
          2: Math.floor(3 + Math.random() * 5), // 3..7
          3: Math.floor(1 + Math.random() * 3)  // 1..3
        });
        return 600;
      });

      // 2. Auctions countdown ticker
      setLiveAuctions(prev => 
        prev.map(item => {
          if (item.isClosed) return item;
          if (item.timeRemainingSecs > 1) {
            return { ...item, timeRemainingSecs: item.timeRemainingSecs - 1 };
          } else {
            // Closed!
            const wasUserWinner = item.highestBidder === (currentUser?.name || "username");
            if (wasUserWinner) {
              triggerMockNotification("🏆 Auction Won!", `Congratulations! You won the ${item.title} at LKR ${Math.floor(item.currentBid)}!`);
              // Add points
              if (currentUser) {
                const updatedUser = { ...currentUser, rewardPoints: currentUser.rewardPoints + 1000 };
                FirebaseService.updateUser(updatedUser).then(() => setCurrentUser(updatedUser));
              }
            } else {
              triggerMockNotification("⏱️ Auction Closed", `${item.title} closed. Won by ${item.highestBidder} at LKR ${Math.floor(item.currentBid)}.`);
            }
            return { ...item, timeRemainingSecs: 0, isClosed: true };
          }
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser]);

  // Opponent bidding increments timer (14s loop)
  useEffect(() => {
    const timer = setInterval(() => {
      const opponentNames = [
        "Roshan B. (Negombo)", "Amara D. (Kandy)", "Pradeep S. (Colombo 07)", 
        "Ruwan F. (Galle)", "Sajith M. (Battaramulla)", "Pavithra T. (Kurunegala)"
      ];

      setLiveAuctions(prev => {
        const activeList = prev.filter(a => !a.isClosed);
        if (activeList.length === 0) return prev;

        const target = activeList[Math.floor(Math.random() * activeList.length)];
        const increment = [250, 500, 1000][Math.floor(Math.random() * 3)];
        const nextBid = target.currentBid + increment;
        const nextBidder = opponentNames[Math.floor(Math.random() * opponentNames.length)];

        triggerMockNotification("🔨 New Bid Placed", `${nextBidder} bid LKR ${Math.floor(nextBid)} on ${target.title}!`);

        return prev.map(item => {
          if (item.id === target.id) {
            return { ...item, currentBid: nextBid, highestBidder: nextBidder };
          }
          return item;
        });
      });
    }, 14000);

    return () => clearInterval(timer);
  }, []);

  const triggerMockNotification = (title: string, body: string) => {
    setPushLogs(prev => [`[${title}] ${body}`, ...prev]);
    setBannerNotification(`${title}: ${body}`);
    setTimeout(() => {
      setBannerNotification(prev => prev === `${title}: ${body}` ? null : prev);
    }, 4500);
  };

  const seedAndSyncFirebase = async () => {
    if (FirebaseService.isFirebaseAvailable()) {
      await FirebaseService.seedFirebaseIfNeeded();
      await refreshData();
    }
  };

  const refreshData = async () => {
    const prods = await FirebaseService.getProducts();
    const offs = await FirebaseService.getOffers();
    const brs = await FirebaseService.getBrands();
    const cops = await FirebaseService.getCoupons();
    const nots = await FirebaseService.getNotifications();
    const usrs = await FirebaseService.getAllUsers();
    
    setProducts(prods);
    setOffers(offs);
    setBrands(brs);
    setCoupons(cops);
    setNotifications(nots);
    setAllUsers(usrs);

    if (currentUser) {
      const ords = await FirebaseService.getOrders(currentUser.email);
      setOrders(ords);
      
      // Update local profile
      const matchedUser = usrs.find(u => u.email === currentUser.email);
      if (matchedUser) {
        setCurrentUser(matchedUser);
      }
    }
    const allOrds = await FirebaseService.getAllOrders();
    setAllOrders(allOrds);
  };

  const initializeAuctions = () => {
    setLiveAuctions([
      {
        id: 1,
        title: "Singer 55\" 4K HDR Smart TV",
        description: "Original local warranty. High demand smart electronics auction.",
        storeName: "Singer Sri Lanka",
        currentBid: 74000.0,
        highestBidder: "Aruni K.",
        timeRemainingSecs: 180,
        iconEmoji: "📺",
        userBidCount: 0
      },
      {
        id: 2,
        title: "Keells Super Premium Grocery Basket",
        description: "Packed with whole turkey, basmati, and premium ingredients.",
        storeName: "Keells Super",
        currentBid: 8200.0,
        highestBidder: "Nihal Perera",
        timeRemainingSecs: 90,
        iconEmoji: "🥩",
        userBidCount: 0
      },
      {
        id: 3,
        title: "Odel Elite Designer Wardrobe Voucher",
        description: "Redeemable at Odel flagship stores across Colombo.",
        storeName: "Odel",
        currentBid: 5600.0,
        highestBidder: "Dilshara F.",
        timeRemainingSecs: 240,
        iconEmoji: "👗",
        userBidCount: 0
      }
    ]);
  };

  const navigateTo = (screen: string) => {
    // Handle Merchant / Become Seller redirect to Register page if not signed in or not merchant
    if (screen === 'MERCHANT' || screen === 'BUSINESS_DASHBOARD') {
      if (!currentUser) {
        setRegisterRole('MERCHANT');
        setScreenHistory(prev => [...prev, currentScreen]);
        setCurrentScreen('REGISTER');
        return;
      }
      if (currentUser.role !== 'MERCHANT' && currentUser.role !== 'ADMIN') {
        // If logged in as normal user, auto upgrade to merchant role so they can add products/offers
        currentUser.role = 'MERCHANT';
        FirebaseService.updateUser(currentUser);
      }
      setScreenHistory(prev => [...prev, currentScreen]);
      setCurrentScreen('BUSINESS_DASHBOARD');
      return;
    }

    // Auth guards
    const restricted = ['CART', 'CHECKOUT', 'LOYALTY', 'PROFILE', 'ADMIN_PANEL', 'VISA_PAYMENT'];
    if (!currentUser && restricted.includes(screen)) {
      setAuthReason(screen.toLowerCase());
      setShowAuthDialog(true);
      return;
    }
    // Push current screen to history before navigating
    setScreenHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setScreenHistory(prev => {
      if (prev.length === 0) {
        setCurrentScreen('HOME');
        return prev;
      }
      const history = [...prev];
      const previousScreen = history.pop()!;
      setCurrentScreen(previousScreen);
      return history;
    });
  };

  const canGoBack = screenHistory.length > 0;

  const handleSetShowAuthDialog = (show: boolean, reason = '') => {
    setShowAuthDialog(show);
    setAuthReason(reason);
  };

  // Auth Operations
  const login = async (email: string, password: string) => {
    const res = await FirebaseService.login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      // Sync user orders
      const ords = await FirebaseService.getOrders(res.user.email);
      setOrders(ords);
      
      // Auto routing based on role
      if (res.user.role === 'ADMIN') {
        setCurrentScreen('ADMIN_PANEL');
      } else if (res.user.role === 'MERCHANT') {
        setCurrentScreen('BUSINESS_DASHBOARD');
      } else {
        setCurrentScreen('HOME');
      }
      refreshData();
    }
    return { success: res.success, message: res.message };
  };

  const register = async (
    name: string,
    email: string,
    role: 'NORMAL' | 'MERCHANT' | 'ADMIN',
    password = 'demo123',
    district = 'Colombo',
    phone?: string
  ) => {
    const res = await FirebaseService.register(name, email, role, password, district, phone);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      if (role === 'ADMIN') {
        setCurrentScreen('ADMIN_PANEL');
      } else if (role === 'MERCHANT') {
        setCurrentScreen('BUSINESS_DASHBOARD');
      } else {
        setCurrentScreen('HOME');
      }
      refreshData();
    }
    return { success: res.success, message: res.message };
  };

  const signOut = async () => {
    await FirebaseService.signOut();
    setCurrentUser(null);
    setCart({});
    setFavorites([]);
    setCurrentScreen('HOME');
  };

  const updateUserRoleSimulated = async (role: 'NORMAL' | 'MERCHANT' | 'ADMIN') => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    await FirebaseService.updateUser(updated);
    setCurrentUser(updated);
    refreshData();
  };

  const updateProfileDetails = async (name: string, phone: string, city: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name, phoneNumber: phone, district: city };
    await FirebaseService.updateUser(updated);
    setCurrentUser(updated);
    refreshData();
  };

  // Admin CRUD Functions
  const approveOffer = async (id: number) => {
    await FirebaseService.approveOffer(id);
    refreshData();
  };

  const addOffer = async (offer: Offer) => {
    await FirebaseService.addOffer(offer);
    refreshData();
  };

  const deleteOffer = async (id: number) => {
    await FirebaseService.deleteOffer(id);
    refreshData();
  };

  const approveProduct = async (id: number) => {
    await FirebaseService.approveProduct(id);
    refreshData();
  };

  const addProduct = async (product: Product) => {
    await FirebaseService.addProduct(product);
    refreshData();
  };

  const deleteProduct = async (id: number) => {
    await FirebaseService.deleteProduct(id);
    refreshData();
  };

  const addBrand = async (brand: Brand) => {
    await FirebaseService.addBrand(brand);
    refreshData();
  };

  const toggleFollowBrand = async (brandName: string) => {
    if (!currentUser) {
      setAuthReason('follow');
      setShowAuthDialog(true);
      return;
    }
    const updatedBrands = brands.map(b => {
      if (b.name === brandName) {
        const nextFollowed = !b.isFollowed;
        const updated = {
          ...b,
          isFollowed: nextFollowed,
          followerCount: b.followerCount + (nextFollowed ? 1 : -1)
        };
        FirebaseService.addBrand(updated);
        return updated;
      }
      return b;
    });
    setBrands(updatedBrands);
  };

  // Cart & Favorites
  const addToCart = (product: Product) => {
    if (!currentUser) {
      setAuthReason('cart');
      setShowAuthDialog(true);
      return;
    }
    
    const qty = cart[product.id] || 0;
    if (qty + 1 > product.stockCount) {
      setValidationError(`Cannot exceed available stock (only ${product.stockCount} units left for ${product.name})!`);
      return;
    }
    
    setValidationError(null);
    setCart(prev => ({ ...prev, [product.id]: qty + 1 }));
  };

  const decreaseCart = (product: Product) => {
    if (!currentUser) return;
    
    const qty = cart[product.id] || 0;
    if (qty > 1) {
      setCart(prev => ({ ...prev, [product.id]: qty - 1 }));
    } else {
      const updated = { ...cart };
      delete updated[product.id];
      setCart(updated);
    }
    setValidationError(null);
  };

  const clearCart = () => setCart({});

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [idStr, qty]) => {
      const p = products.find(prod => prod.id === Number(idStr));
      return sum + (p ? p.price : 0) * qty;
    }, 0);
  };

  const getTaxAmount = () => getCartTotal() * 0.08; // 8% local VAT

  const getGrandTotal = () => {
    const total = getCartTotal();
    const tax = getTaxAmount();
    const fee = selectedCourier === 'std' ? 250 : selectedCourier === 'exp' ? 500 : 950;
    
    let promo = activePromoDiscount;
    if (enteredPromoCode.toUpperCase().trim() === 'FREESHIP') {
      promo = fee;
    }
    
    return Math.max(0, total + tax + fee - promo);
  };

  const toggleFavorite = (productId: number) => {
    if (!currentUser) {
      setAuthReason('favorites');
      setShowAuthDialog(true);
      return;
    }
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  // Apply promo check
  const handleSetEnteredPromoCode = (code: string) => {
    setEnteredPromoCode(code);
    const clean = code.toUpperCase().trim();
    if (!clean) {
      setActivePromoDiscount(0);
      setPromoMessage('');
      setValidationError(null);
      return;
    }

    const subtotal = getCartTotal();

    if (clean === 'OFFERLANKA') {
      setActivePromoDiscount(subtotal * 0.15);
      setPromoMessage("Promo OFFERLANKA applied: 15% discount on products!");
      setValidationError(null);
    } else if (clean === 'FREESHIP') {
      const fee = selectedCourier === 'std' ? 250 : selectedCourier === 'exp' ? 500 : 950;
      setActivePromoDiscount(fee);
      setPromoMessage("Promo FREESHIP applied: Free delivery!");
      setValidationError(null);
    } else if (clean === 'SAVE500') {
      if (subtotal >= 2000) {
        setActivePromoDiscount(500);
        setPromoMessage("Promo SAVE500 applied: LKR 500 off!");
        setValidationError(null);
      } else {
        setValidationError("SAVE500 requires minimum order of Rs. 2000");
        setActivePromoDiscount(0);
        setPromoMessage('');
      }
    } else {
      setValidationError("Invalid Promo Code.");
      setActivePromoDiscount(0);
      setPromoMessage('');
    }
  };

  const clearValidationError = () => setValidationError(null);

  // Order Placement logic
  const validateAndProcessCheckout = async (paymentMethod: string): Promise<Order | null> => {
    if (!currentUser) {
      setValidationError("Authentication required. Please sign in before checkout.");
      return null;
    }

    if (Object.keys(cart).length === 0) {
      setValidationError("Cannot checkout: your basket is empty. Please add items.");
      return null;
    }

    if (!billingAddress.trim() || billingAddress.trim().length < 8) {
      setValidationError("Please enter your Street Delivery Address (min 8 chars).");
      return null;
    }

    if (!billingCity.trim()) {
      setValidationError("Please enter your Province/City.");
      return null;
    }

    if (paymentMethod === 'Visa/Mastercard') {
      if (paymentCardNo.replace(/\s/g, '').length !== 16) {
        setValidationError("Credit Card must be 16 digits.");
        return null;
      }
      if (paymentCardCvv.length !== 3) {
        setValidationError("CVV must be 3 digits.");
        return null;
      }
    }

    setValidationError(null);

    // Construct product list string
    const details = Object.entries(cart).map(([idStr, qty]) => {
      const p = products.find(prod => prod.id === Number(idStr));
      return `${p ? p.name : 'Unknown'} (x${qty})`;
    }).join(', ');

    const grandTotal = getGrandTotal();

    const orderObj = await FirebaseService.placeOrder(
      currentUser.email,
      details,
      grandTotal,
      paymentMethod
    );

    // Success: Clear Cart & Checkout inputs
    setCart({});
    setBillingAddress('');
    setBillingCity('');
    setBillingPhone('');
    setPaymentCardNo('');
    setPaymentCardExpiry('');
    setPaymentCardCvv('');
    setEnteredPromoCode('');
    setActivePromoDiscount(0);
    setPromoMessage('');

    refreshData();

    return orderObj;
  };

  // Flash Deal Claim
  const claimFlashSaleItem = (itemId: number, itemName: string, price: number) => {
    if (!currentUser) {
      setAuthReason('Sign in to claim real-time limited flash deals.');
      setShowAuthDialog(true);
      return;
    }

    const currentStock = flashSaleStock[itemId] || 0;
    if (currentStock <= 0) {
      triggerMockNotification("Sold Out", "This item has already run out of flash inventory!");
      return;
    }

    if (currentUser.walletBalance < price) {
      triggerMockNotification("Wallet Alert", `Insufficient Wallet cash! Require LKR ${Math.floor(price)} to purchase.`);
      return;
    }

    // Decrement stock
    setFlashSaleStock(prev => ({ ...prev, [itemId]: currentStock - 1 }));

    // Update wallet balance & points
    const updated = {
      ...currentUser,
      walletBalance: currentUser.walletBalance - price,
      rewardPoints: currentUser.rewardPoints + 50
    };
    
    FirebaseService.updateUser(updated).then(() => {
      setCurrentUser(updated);
      triggerMockNotification("⚡ Flash Claimed!", `Success! Rs. ${Math.floor(price)} paid via Cashback Wallet. Dispatched courier partner.`);
      triggerLiveCourierTracking();
      refreshData();
    });
  };

  // Bidding on Auctions
  const placeAuctionBid = (id: number) => {
    if (!currentUser) {
      setAuthReason("Sign in to bid live on crowdsourced auctions.");
      setShowAuthDialog(true);
      return;
    }

    if (currentUser.walletBalance < 500) {
      triggerMockNotification("Wallet Alert", "Insufficient Wallet! You need at least LKR 500 in Cashback to place this auction bid.");
      return;
    }

    setLiveAuctions(prev => {
      const match = prev.find(item => item.id === id);
      if (!match || match.isClosed) return prev;

      const newUserBid = match.currentBid + 1000;
      
      // Update wallet balance
      const updatedUser = {
        ...currentUser,
        walletBalance: currentUser.walletBalance - 500
      };
      FirebaseService.updateUser(updatedUser).then(() => {
        setCurrentUser(updatedUser);
        triggerMockNotification("🔨 Bid Placed (LKR -500)", `Placed bid on ${match.title}! High Bidder is now you: LKR ${Math.floor(newUserBid)}`);
        refreshData();
      });

      return prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            currentBid: newUserBid,
            highestBidder: currentUser.name,
            userBidCount: (item.userBidCount || 0) + 1,
            timeRemainingSecs: Math.min(300, item.timeRemainingSecs + 20)
          };
        }
        return item;
      });
    });
  };

  // Live Map Delivery simulation
  const triggerLiveCourierTracking = () => {
    if (deliveryActive) {
      setDeliveryDistanceKm(prev => prev + 3.5);
      setDeliveryEtaMinutes(prev => prev + 10);
      return;
    }

    setDeliveryActive(true);
    setDeliveryStep(1);
    setDeliveryDistanceKm(4.2);
    setDeliveryEtaMinutes(14);
    
    const riders = ["Sumith Ali (Super Rider)", "Arshad Perera", "Malinda Bandara", "Nilantha Kumara"];
    const chosenRider = riders[Math.floor(Math.random() * riders.length)];
    setDeliveryCourierName(chosenRider);

    // Step 1 -> 2
    setTimeout(() => {
      setDeliveryStep(2);
      setDeliveryDistanceKm(3.2);
      setDeliveryEtaMinutes(11);
      triggerMockNotification("📦 Courier Dispatched", `${chosenRider} is heading towards outlet with flyer bag.`);
      
      // Step 2 -> 3
      setTimeout(() => {
        setDeliveryStep(3);
        setDeliveryDistanceKm(1.8);
        setDeliveryEtaMinutes(6);
        triggerMockNotification("🛵 Delivery In Transit", "Courier is riding fast on Galle Road, Colombo.");
        
        // Step 3 -> 4
        setTimeout(() => {
          setDeliveryStep(4);
          setDeliveryDistanceKm(0.4);
          setDeliveryEtaMinutes(2);
          triggerMockNotification("🔔 Courier At Entry", "Rider of Star Delivery is arriving at your dropoff location.");
          
          // Step 4 -> 5
          setTimeout(() => {
            setDeliveryStep(5);
            setDeliveryDistanceKm(0);
            setDeliveryEtaMinutes(0);
            triggerMockNotification("✅ Package Handover", "Order containing flyer deal items successfully handed over.");
            
            // Cleanup
            setTimeout(() => {
              setDeliveryActive(false);
              setDeliveryStep(0);
            }, 8000);

          }, 10000);
        }, 12000);
      }, 12000);
    }, 10000);
  };

  // AI Chat message sender
  const sendChatMessage = async (msg: string) => {
    if (!msg.trim()) return;
    
    const userMsg = { author: 'USER' as const, message: msg.trim() };
    setChatLogs(prev => [...prev, userMsg]);
    setAiSearching(true);

    try {
      const response = await getAiRecommendations(msg.trim());
      setChatLogs(prev => [...prev, { author: 'AI', message: response }]);
    } catch (e) {
      setChatLogs(prev => [...prev, { author: 'AI', message: "Offline Mode: AI recommendation failed." }]);
    } finally {
      setAiSearching(false);
    }
  };

  const redeemCoupon = async (code: string): Promise<boolean> => {
    if (!currentUser) {
      setAuthReason("Sign in to redeem coupons.");
      setShowAuthDialog(true);
      return false;
    }
    const success = await FirebaseService.redeemCoupon(currentUser.email, code);
    if (success) {
      triggerMockNotification("🎉 Coupon Redeemed", `Successfully redeemed code: ${code}`);
      refreshData();
    }
    return success;
  };

  // Referral Rewards
  const applyReferralCode = (code: string): string => {
    if (!currentUser) return "Please register or sign in first.";
    if (currentUser.hasClaimedReferral) {
      return "You have already claimed a referral bonus.";
    }

    const clean = code.trim().toUpperCase();
    if (!clean || clean === currentUser.referralCode) {
      return "Invalid code. You cannot claim your own code!";
    }

    const updated = {
      ...currentUser,
      walletBalance: currentUser.walletBalance + 500, // Rs. 500 cashback
      rewardPoints: currentUser.rewardPoints + 200,   // 200 pts
      hasClaimedReferral: true
    };

    FirebaseService.updateUser(updated).then(() => {
      setCurrentUser(updated);
      triggerMockNotification("🎁 Referral Claimed", "Referred successfully! LKR 500 cash back & 200 points credited.");
      refreshData();
    });

    return "SUCCESS";
  };

  const depositCashbackWallet = (amount: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, walletBalance: currentUser.walletBalance + amount };
    FirebaseService.updateUser(updated).then(() => {
      setCurrentUser(updated);
      triggerMockNotification("💳 Cash Loaded", `Credited LKR ${Math.floor(amount)} into your Offline Wallet.`);
      refreshData();
    });
  };

  const purchaseVipSubscription = (tier: 'SILVER' | 'GOLD'): string => {
    if (!currentUser) return "Please sign in.";
    const price = tier === 'SILVER' ? 290.0 : 590.0;
    if (currentUser.walletBalance < price) {
      return `Required: LKR ${Math.floor(price)}. Please deposit cash first.`;
    }

    const rewardBoost = tier === 'SILVER' ? 400 : 1000;
    const welcomeGift = tier === 'SILVER' ? 300.0 : 800.0;

    const updated = {
      ...currentUser,
      walletBalance: currentUser.walletBalance - price + welcomeGift,
      subscriptionState: tier,
      rewardPoints: currentUser.rewardPoints + rewardBoost
    };

    FirebaseService.updateUser(updated).then(() => {
      setCurrentUser(updated);
      triggerMockNotification("⭐ Welcome to OfferLanka VIP!", `Activated ${tier} Membership! Added VIP Badge & custom reward multiplier!`);
      refreshData();
    });

    return "SUCCESS";
  };

  const t = (key: string) => translate(key, appLanguage);

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode: () => setIsDarkMode(!isDarkMode),
      appLanguage,
      setLanguage: setAppLanguage,
      t,
      currentScreen,
      navigateTo,
      goBack,
      canGoBack,
      isDrawerOpen,
      setIsDrawerOpen,
      selectedOffer,
      setSelectedOffer,
      selectedProduct,
      setSelectedProduct,
      currentUser,
      setCurrentUser,
      authReason,
      showAuthDialog,
      setShowAuthDialog: handleSetShowAuthDialog,
      registerRole,
      setRegisterRole,
      login,
      register,
      signOut,
      updateUserRoleSimulated,
      updateProfileDetails,
      products,
      offers,
      brands,
      coupons,
      notifications,
      orders,
      allOrders,
      allUsers,
      refreshData,
      approveOffer,
      addOffer,
      deleteOffer,
      approveProduct,
      addProduct,
      deleteProduct,
      addBrand,
      toggleFollowBrand,
      cart,
      addToCart,
      decreaseCart,
      clearCart,
      getCartTotal,
      getTaxAmount,
      getGrandTotal,
      favorites,
      toggleFavorite,
      isFavorite,
      billingAddress,
      setBillingAddress,
      billingCity,
      setBillingCity,
      billingPhone,
      setBillingPhone,
      paymentCardNo,
      setPaymentCardNo,
      paymentCardExpiry,
      setPaymentCardExpiry,
      paymentCardCvv,
      setPaymentCardCvv,
      selectedCourier,
      setSelectedCourier,
      termsAccepted,
      setTermsAccepted,
      enteredPromoCode,
      setEnteredPromoCode: handleSetEnteredPromoCode,
      activePromoDiscount,
      promoMessage,
      validationError,
      clearValidationError,
      validateAndProcessCheckout,
      flashSaleSeconds,
      flashSaleStock,
      claimFlashSaleItem,
      liveAuctions,
      placeAuctionBid,
      deliveryActive,
      deliveryStep,
      deliveryDistanceKm,
      deliveryEtaMinutes,
      deliveryCourierName,
      triggerLiveCourierTracking,
      bannerNotification,
      pushLogs,
      triggerMockNotification,
      chatLogs,
      aiSearching,
      sendChatMessage,
      applyReferralCode,
      depositCashbackWallet,
      purchaseVipSubscription,
      redeemCoupon
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
export default AppContext;
