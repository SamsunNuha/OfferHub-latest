export interface User {
  email: string;
  name: string;
  role: 'NORMAL' | 'MERCHANT' | 'ADMIN';
  rewardPoints: number;
  savedOfferIds: string; // Comma-separated IDs
  password?: string;
  district: string;
  phoneNumber?: string;
  walletBalance: number;
  subscriptionState: 'FREE' | 'SILVER' | 'GOLD';
  referralCode: string;
  hasClaimedReferral: boolean;
}

export interface Brand {
  name: string;
  category: string;
  rating: number;
  followerCount: number;
  isFollowed: boolean;
  logo?: string;
  businessRegistrationNumber: string;
  address: string;
  email: string;
  contactNo: string;
  website: string;
  subscriptionPlan: string;
  isSuspended: boolean;
  district: string;
  verified: boolean;
}

export interface Offer {
  id: number;
  storeName: string;
  title: string;
  discountPercent: number;
  category: string;
  originalPrice: number;
  offerPrice: number;
  validUntil: string;
  location: string;
  rating: number;
  termsAndConditions: string;
  isFeatured: boolean;
  isFlashSale: boolean;
  isApproved: boolean;
}

export interface Product {
  id: number;
  name: string;
  storeName: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  description: string;
  stockCount: number;
  isApproved: boolean;
  subcategory: string;
  features: string;
  specifications: string;
  discountPrice: number;
  sku: string;
  images: string;
  keywords: string;
  barcode: string;
}

export interface Order {
  id: number;
  userEmail: string;
  productNames: string; // Comma-separated names with quantities
  totalPrice: number;
  paymentMethod: string;
  date: string;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'NEW_OFFER' | 'FLASH_SALE' | 'PRICE_DROP' | 'PROMO';
  timestamp: number;
  isRead: boolean;
}

export interface Coupon {
  code: string;
  description: string;
  discountAmount: number;
  costPoints: number;
  isRedeemed: boolean;
}

export interface VisaPaymentRecord {
  paymentId: string;
  userId: string;
  amount: number;
  cardLast4Digits: string;
  status: string;
  paymentDate: string;
  transactionReference: string;
}

export interface AuctionItem {
  id: number;
  title: string;
  description: string;
  storeName: string;
  currentBid: number;
  highestBidder: string;
  timeRemainingSecs: number;
  iconEmoji: string;
  isClosed?: boolean;
  userBidCount?: number;
}

export interface Ticket {
  id: number;
  user: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  date: string;
  reply?: string;
}

export interface Category {
  id: string;
  name: string;
  iconEmoji: string;
}

export interface District {
  id: string;
  name: string;
}

export interface Favorite {
  email: string;
  productId: number;
}

export interface ScannerHistory {
  id: number;
  email: string;
  productName: string;
  brand: string;
  category: string;
  confidenceScore: number;
  description: string;
  date: string;
}

export interface Review {
  id: number;
  userEmail: string;
  userName: string;
  productId: number;
  rating: number;
  comment: string;
  date: string;
}

// 1. Categories Preload
export const initialCategories: Category[] = [
  { id: "electronics", name: "Electronics", iconEmoji: "📺" },
  { id: "mobiles", name: "Mobile Phones", iconEmoji: "📱" },
  { id: "computers", name: "Computers & Laptops", iconEmoji: "💻" },
  { id: "appliances", name: "Home Appliances", iconEmoji: "🔌" },
  { id: "furniture", name: "Furniture", iconEmoji: "🛋️" },
  { id: "fashion", name: "Fashion & Clothing", iconEmoji: "👕" },
  { id: "beauty", name: "Beauty & Cosmetics", iconEmoji: "💄" },
  { id: "jewelry", name: "Jewelry & Watches", iconEmoji: "⌚" },
  { id: "supermarkets", name: "Supermarkets & Grocery", iconEmoji: "🛒" },
  { id: "restaurants", name: "Restaurants & Food", iconEmoji: "🍔" },
  { id: "hotels", name: "Hotels & Resorts", iconEmoji: "🏨" },
  { id: "healthcare", name: "Healthcare & Pharmacy", iconEmoji: "💊" },
  { id: "education", name: "Education & Training", iconEmoji: "🎓" },
  { id: "sports", name: "Sports & Fitness", iconEmoji: "⚽" },
  { id: "vehicles", name: "Vehicles & Auto Parts", iconEmoji: "🚗" },
  { id: "construction", name: "Construction & Hardware", iconEmoji: "🔨" },
  { id: "timber", name: "Wooden Furniture & Timber", iconEmoji: "🪵" },
  { id: "realestate", name: "Real Estate", iconEmoji: "🏠" },
  { id: "travel", name: "Travel & Tourism", iconEmoji: "✈️" },
  { id: "services", name: "Services & Repairs", iconEmoji: "🛠️" }
];

// 2. Districts Preload
export const initialDistricts: District[] = [
  { id: "colombo", name: "Colombo" },
  { id: "gampaha", name: "Gampaha" },
  { id: "kalutara", name: "Kalutara" },
  { id: "kandy", name: "Kandy" },
  { id: "matale", name: "Matale" },
  { id: "nuwaraeliya", name: "Nuwara Eliya" },
  { id: "galle", name: "Galle" },
  { id: "matara", name: "Matara" },
  { id: "hambantota", name: "Hambantota" },
  { id: "jaffna", name: "Jaffna" },
  { id: "kilinochchi", name: "Kilinochchi" },
  { id: "mannar", name: "Mannar" },
  { id: "vavuniya", name: "Vavuniya" },
  { id: "mullaitivu", name: "Mullaitivu" },
  { id: "batticaloa", name: "Batticaloa" },
  { id: "ampara", name: "Ampara" },
  { id: "trincomalee", name: "Trincomalee" },
  { id: "kurunegala", name: "Kurunegala" },
  { id: "puttalam", name: "Puttalam" },
  { id: "anuradhapura", name: "Anuradhapura" },
  { id: "polonnaruwa", name: "Polonnaruwa" },
  { id: "badulla", name: "Badulla" },
  { id: "moneragala", name: "Moneragala" },
  { id: "ratnapura", name: "Ratnapura" },
  { id: "kegalle", name: "Kegalle" }
];

// 3. Prepopulated Users (22 Users)
export const initialUsers: User[] = [
  { email: "admin@offerlanka.com", name: "Mohamed Ruskan", role: "ADMIN", rewardPoints: 99999, savedOfferIds: "", password: "password123", district: "Colombo", walletBalance: 100000, subscriptionState: "GOLD", referralCode: "REF-ADMIN-99", hasClaimedReferral: false },

  { email: "merchant@keells.lk", name: "Keells Supermarkets", role: "MERCHANT", rewardPoints: 250, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 12000, subscriptionState: "SILVER", referralCode: "REF-KEELLS-101", hasClaimedReferral: false },
  { email: "merchant@cargills.lk", name: "Cargills FoodCity", role: "MERCHANT", rewardPoints: 300, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 15000, subscriptionState: "SILVER", referralCode: "REF-CARGILLS-102", hasClaimedReferral: false },
  { email: "nuhman@gmail.com", name: "Nuhman Samsudeen", role: "NORMAL", rewardPoints: 580, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 1500.0, subscriptionState: "FREE", referralCode: "REF-LANKA-771", hasClaimedReferral: false },
  { email: "merchant@singer.lk", name: "Singer Sri Lanka PLC", role: "MERCHANT", rewardPoints: 1200, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 45000, subscriptionState: "GOLD", referralCode: "REF-SINGER-103", hasClaimedReferral: false },
  { email: "merchant@abans.com", name: "Abans Retail", role: "MERCHANT", rewardPoints: 850, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 32000, subscriptionState: "SILVER", referralCode: "REF-ABANS-104", hasClaimedReferral: false },
  { email: "merchant@spaceylon.lk", name: "Spa Ceylon Wellness", role: "MERCHANT", rewardPoints: 1400, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 28000, subscriptionState: "GOLD", referralCode: "REF-SPA-105", hasClaimedReferral: false },
  { email: "merchant@odel.lk", name: "Odel Fashion", role: "MERCHANT", rewardPoints: 980, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 50000, subscriptionState: "GOLD", referralCode: "REF-ODEL-106", hasClaimedReferral: false },
  { email: "kamal@gmail.com", name: "Kamal Perera", role: "NORMAL", rewardPoints: 320, savedOfferIds: "", password: "demo123", district: "Gampaha", walletBalance: 2500.0, subscriptionState: "FREE", referralCode: "REF-KAMAL-201", hasClaimedReferral: false },
  { email: "nimal@gmail.com", name: "Nimal Silva", role: "NORMAL", rewardPoints: 440, savedOfferIds: "", password: "demo123", district: "Kandy", walletBalance: 1800.0, subscriptionState: "FREE", referralCode: "REF-NIMAL-202", hasClaimedReferral: false },
  { email: "sunil@gmail.com", name: "Sunil Fernando", role: "NORMAL", rewardPoints: 150, savedOfferIds: "", password: "demo123", district: "Kalutara", walletBalance: 500.0, subscriptionState: "FREE", referralCode: "REF-SUNIL-203", hasClaimedReferral: false },
  { email: "priyantha@gmail.com", name: "Priyantha Kumara", role: "NORMAL", rewardPoints: 210, savedOfferIds: "", password: "demo123", district: "Galle", walletBalance: 1200.0, subscriptionState: "FREE", referralCode: "REF-PRIYA-204", hasClaimedReferral: false },
  { email: "ruwan@yahoo.com", name: "Ruwan Jayasinghe", role: "NORMAL", rewardPoints: 890, savedOfferIds: "", password: "demo123", district: "Kurunegala", walletBalance: 4200.0, subscriptionState: "SILVER", referralCode: "REF-RUWAN-205", hasClaimedReferral: true },
  { email: "aruni@outlook.com", name: "Aruni Rajapaksha", role: "NORMAL", rewardPoints: 1250, savedOfferIds: "", password: "demo123", district: "Matara", walletBalance: 8500.0, subscriptionState: "GOLD", referralCode: "REF-ARUNI-206", hasClaimedReferral: false },
  { email: "chathura@gmail.com", name: "Chathura Bandara", role: "NORMAL", rewardPoints: 50, savedOfferIds: "", password: "demo123", district: "Anuradhapura", walletBalance: 300.0, subscriptionState: "FREE", referralCode: "REF-CHATH-207", hasClaimedReferral: false },
  { email: "dilhara@yahoo.com", name: "Dilhara Senanayake", role: "NORMAL", rewardPoints: 620, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 3500.0, subscriptionState: "FREE", referralCode: "REF-DILHA-208", hasClaimedReferral: false },
  { email: "menaka@gmail.com", name: "Menaka Wettasinghe", role: "NORMAL", rewardPoints: 1100, savedOfferIds: "", password: "demo123", district: "Gampaha", walletBalance: 980.0, subscriptionState: "SILVER", referralCode: "REF-MENAK-209", hasClaimedReferral: false },
  { email: "samantha@gmail.com", name: "Samantha Gunawardena", role: "NORMAL", rewardPoints: 310, savedOfferIds: "", password: "demo123", district: "Ratnapura", walletBalance: 1400.0, subscriptionState: "FREE", referralCode: "REF-SAMAN-210", hasClaimedReferral: false },
  { email: "nilanthi@gmail.com", name: "Nilanthi Cooray", role: "NORMAL", rewardPoints: 750, savedOfferIds: "", password: "demo123", district: "Negombo", walletBalance: 2900.0, subscriptionState: "SILVER", referralCode: "REF-NILAN-211", hasClaimedReferral: false },
  { email: "tharindu@gmail.com", name: "Tharindu Wijesinghe", role: "NORMAL", rewardPoints: 180, savedOfferIds: "", password: "demo123", district: "Colombo", walletBalance: 700.0, subscriptionState: "FREE", referralCode: "REF-THARI-212", hasClaimedReferral: false },
  { email: "sanduni@gmail.com", name: "Sanduni Perera", role: "NORMAL", rewardPoints: 950, savedOfferIds: "", password: "demo123", district: "Kandy", walletBalance: 6100.0, subscriptionState: "GOLD", referralCode: "REF-SANDU-213", hasClaimedReferral: false }
];

// 4. Prepopulated Brands & Companies (100+ Sri Lankan Retail and Corporate Entities)
export const initialBrands: Brand[] = [
  // Retail & Supermarkets (6)
  { name: "Cargills Food City", category: "Supermarkets & Grocery", rating: 4.7, followerCount: 38200, isFollowed: false, businessRegistrationNumber: "BRN-CARGILLS", address: "York Street, Colombo 01", email: "info@cargills.lk", contactNo: "+94 11 242 9200", website: "www.cargills.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=150&q=80" },
  { name: "Keells", category: "Supermarkets & Grocery", rating: 4.8, followerCount: 42000, isFollowed: false, businessRegistrationNumber: "BRN-KEELLS", address: "Galle Road, Colombo 03", email: "nexus@keells.lk", contactNo: "+94 11 230 3500", website: "www.keells.lk", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80" },
  { name: "Arpico Super Centre", category: "Supermarkets & Grocery", rating: 4.6, followerCount: 31500, isFollowed: false, businessRegistrationNumber: "BRN-ARPICO", address: "Hyde Park Corner, Colombo 02", email: "info@arpico.com", contactNo: "+94 11 470 6000", website: "www.arpico.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1506617498300-cb8029799896?auto=format&fit=crop&w=150&q=80" },
  { name: "Glomark", category: "Supermarkets & Grocery", rating: 4.7, followerCount: 18500, isFollowed: false, businessRegistrationNumber: "BRN-GLOMARK", address: "Nawala Road, Kotte", email: "info@glomark.lk", contactNo: "+94 11 512 8500", website: "www.glomark.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80" },
  { name: "Sathosa", category: "Supermarkets & Grocery", rating: 4.2, followerCount: 29000, isFollowed: false, businessRegistrationNumber: "BRN-SATHOSA", address: "Colombo 10", email: "info@sathosa.lk", contactNo: "+94 11 277 8888", website: "www.lankasathosa.org", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&q=80" },
  { name: "Laugfs Super", category: "Supermarkets & Grocery", rating: 4.4, followerCount: 15400, isFollowed: false, businessRegistrationNumber: "BRN-LAUGFS", address: "Colombo Road, Kalutara", email: "info@laugfssuper.lk", contactNo: "+94 11 556 6000", website: "www.laugfssuper.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Kalutara", verified: true, logo: "https://images.unsplash.com/photo-1506617498300-cb8029799896?auto=format&fit=crop&w=150&q=80" },

  // Electronics & Mobile Brands (8)
  { name: "Singer Sri Lanka", category: "Electronics", rating: 4.7, followerCount: 52000, isFollowed: false, businessRegistrationNumber: "BRN-SINGER", address: "Union Place, Colombo 02", email: "singer@singer.lk", contactNo: "+94 11 230 0111", website: "www.singersl.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&q=80" },
  { name: "Softlogic", category: "Electronics", rating: 4.5, followerCount: 38400, isFollowed: false, businessRegistrationNumber: "BRN-SOFTLOGIC", address: "Galle Road, Colombo 03", email: "info@softlogic.lk", contactNo: "+94 11 255 5666", website: "www.softlogic.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=150&q=80" },
  { name: "Abans", category: "Electronics", rating: 4.6, followerCount: 46200, isFollowed: false, businessRegistrationNumber: "BRN-ABANS", address: "Galle Road, Colombo 03", email: "info@buyabans.com", contactNo: "+94 11 257 5231", website: "www.buyabans.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=150&q=80" },
  { name: "Singhagiri", category: "Electronics", rating: 4.3, followerCount: 12500, isFollowed: false, businessRegistrationNumber: "BRN-SINGHAGIRI", address: "Colombo 10", email: "info@singhagiri.lk", contactNo: "+94 11 540 0500", website: "www.singhagiri.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=150&q=80" },
  { name: "Damro Electronics", category: "Electronics", rating: 4.6, followerCount: 29000, isFollowed: false, businessRegistrationNumber: "BRN-DAMRO-E", address: "Kandy Road, Kadawatha", email: "electro@damro.lk", contactNo: "+94 11 292 2777", website: "www.damro.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1582730147233-ac8112440fd5?auto=format&fit=crop&w=150&q=80" },
  { name: "Metropolitan", category: "Computers & Laptops", rating: 4.4, followerCount: 14200, isFollowed: false, businessRegistrationNumber: "BRN-METRO", address: "Vauxhall Street, Colombo 02", email: "info@metropolitan.lk", contactNo: "+94 11 243 7797", website: "www.metropolitan.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?auto=format&fit=crop&w=150&q=80" },
  { name: "GenX Mobile", category: "Mobile Phones", rating: 4.3, followerCount: 9800, isFollowed: false, businessRegistrationNumber: "BRN-GENX", address: "Colombo 04", email: "info@genx.lk", contactNo: "+94 11 205 8899", website: "www.genx.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80" },
  { name: "CameraLK", category: "Electronics", rating: 4.8, followerCount: 22100, isFollowed: false, businessRegistrationNumber: "BRN-CAMERALK", address: "Colombo 05", email: "info@cameralk.com", contactNo: "+94 11 781 7817", website: "www.cameralk.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&q=80" },

  // Furniture & Wood Works (7)
  { name: "Damro", category: "Furniture", rating: 4.7, followerCount: 51000, isFollowed: false, businessRegistrationNumber: "BRN-DAMRO", address: "Nittambuwa, Gampaha", email: "info@damro.lk", contactNo: "+94 33 228 1111", website: "www.damro.lk", subscriptionPlan: "Platinum", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80" },
  { name: "Nilkamal Lanka", category: "Furniture", rating: 4.5, followerCount: 23200, isFollowed: false, businessRegistrationNumber: "BRN-NILKAMAL", address: "Galle Road, Colombo 04", email: "info@nilkamal.lk", contactNo: "+94 11 258 7777", website: "www.nilkamal.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80" },
  { name: "Samson Rajarata Tiles & Furniture", category: "Furniture", rating: 4.4, followerCount: 8900, isFollowed: false, businessRegistrationNumber: "BRN-SAMSON-R", address: "Anuradhapura", email: "sales@samsonrajarata.lk", contactNo: "+94 25 222 5555", website: "www.samsonrajarata.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Anuradhapura", verified: true, logo: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=150&q=80" },
  { name: "Araliya Furniture", category: "Furniture", rating: 4.5, followerCount: 14300, isFollowed: false, businessRegistrationNumber: "BRN-ARALIYA-F", address: "Polonnaruwa", email: "furniture@araliya.lk", contactNo: "+94 27 222 3456", website: "www.araliyafurniture.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Polonnaruwa", verified: true, logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80" },
  { name: "Royal Furniture", category: "Furniture", rating: 4.6, followerCount: 19800, isFollowed: false, businessRegistrationNumber: "BRN-ROYAL-F", address: "Kotte Road, Colombo", email: "info@royalfurniture.lk", contactNo: "+94 11 282 3333", website: "www.royalfurniture.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80" },
  { name: "Siyana Wood Works", category: "Wooden Furniture & Timber", rating: 4.3, followerCount: 6500, isFollowed: false, businessRegistrationNumber: "BRN-SIYANA", address: "Gampaha", email: "siyana@wood.lk", contactNo: "+94 33 223 8888", website: "www.siyanawood.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80" },
  { name: "Wickramarachchi Furniture", category: "Furniture", rating: 4.4, followerCount: 11200, isFollowed: false, businessRegistrationNumber: "BRN-WICK-F", address: "Yakkala, Gampaha", email: "info@wickfurniture.lk", contactNo: "+94 33 222 4567", website: "www.wickramarachchifurniture.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80" },

  // Hotels & Resorts (6)
  { name: "Cinnamon Grand Colombo", category: "Hotels & Resorts", rating: 4.8, followerCount: 31000, isFollowed: false, businessRegistrationNumber: "BRN-CG", address: "Galle Road, Colombo 03", email: "grand@cinnamonhotels.com", contactNo: "+94 11 249 7200", website: "www.cinnamonhotels.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80" },
  { name: "Cinnamon Lakeside Colombo", category: "Hotels & Resorts", rating: 4.7, followerCount: 26500, isFollowed: false, businessRegistrationNumber: "BRN-CL", address: "Sir Chittampalam A Gardiner Mawatha, Colombo 02", email: "lakeside@cinnamonhotels.com", contactNo: "+94 11 249 1000", website: "www.cinnamonhotels.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=150&q=80" },
  { name: "Shangri-La Colombo", category: "Hotels & Resorts", rating: 4.9, followerCount: 41200, isFollowed: false, businessRegistrationNumber: "BRN-SHANGRI-LA", address: "One Galle Face, Colombo 02", email: "colombo@shangri-la.com", contactNo: "+94 11 788 8288", website: "www.shangri-la.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80" },
  { name: "Jetwing Blue", category: "Hotels & Resorts", rating: 4.6, followerCount: 18400, isFollowed: false, businessRegistrationNumber: "BRN-JETBLUE", address: "Ethukala, Negombo", email: "blue@jetwinghotels.com", contactNo: "+94 31 227 3500", website: "www.jetwinghotels.com", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=150&q=80" },
  { name: "Heritance Kandalama", category: "Hotels & Resorts", rating: 4.8, followerCount: 22400, isFollowed: false, businessRegistrationNumber: "BRN-KANDALAMA", address: "Dambulla, Matale", email: "kandalama@heritancehotels.com", contactNo: "+94 66 555 5000", website: "www.heritancehotels.com", subscriptionPlan: "Premium", isSuspended: false, district: "Matale", verified: true, logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80" },
  { name: "Araliya Green City", category: "Hotels & Resorts", rating: 4.7, followerCount: 15100, isFollowed: false, businessRegistrationNumber: "BRN-AGC", address: "Nuwara Eliya", email: "greencity@araliyahotels.com", contactNo: "+94 52 222 8888", website: "www.araliyaresorts.com", subscriptionPlan: "Premium", isSuspended: false, district: "Nuwara Eliya", verified: true, logo: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=150&q=80" },

  // Fashion & Clothing (8)
  { name: "ODEL", category: "Fashion & Clothing", rating: 4.8, followerCount: 39000, isFollowed: false, businessRegistrationNumber: "BRN-ODEL-F", address: "Alexandra Place, Colombo 07", email: "info@odel.lk", contactNo: "+94 11 462 5700", website: "www.odel.lk", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&q=80" },
  { name: "Nolimit", category: "Fashion & Clothing", rating: 4.7, followerCount: 45000, isFollowed: false, businessRegistrationNumber: "BRN-NOLIMIT-F", address: "Kawdana Road, Dehiwala", email: "info@nolimit.lk", contactNo: "+94 11 273 7373", website: "www.nolimit.lk", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=150&q=80" },
  { name: "Fashion Bug", category: "Fashion & Clothing", rating: 4.4, followerCount: 28200, isFollowed: false, businessRegistrationNumber: "BRN-FASHIONBUG", address: "Kandy Road, Kadawatha", email: "info@fashionbug.lk", contactNo: "+94 11 292 2888", website: "www.fashionbug.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&q=80" },
  { name: "Cool Planet", category: "Fashion & Clothing", rating: 4.5, followerCount: 24200, isFollowed: false, businessRegistrationNumber: "BRN-COOLPLANET", address: "Colombo 05", email: "info@coolplanet.lk", contactNo: "+94 11 250 8888", website: "www.coolplanet.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&q=80" },
  { name: "Kelly Felder", category: "Fashion & Clothing", rating: 4.6, followerCount: 19500, isFollowed: false, businessRegistrationNumber: "BRN-KF", address: "Dharmapala Mawatha, Colombo 07", email: "info@kellyfelder.com", contactNo: "+94 11 268 8999", website: "www.kellyfelder.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=150&q=80" },
  { name: "Hameedia", category: "Fashion & Clothing", rating: 4.7, followerCount: 28400, isFollowed: false, businessRegistrationNumber: "BRN-HAMEEDIA", address: "Galle Road, Colombo 03", email: "info@hameedia.lk", contactNo: "+94 11 258 7777", website: "www.hameedia.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80" },
  { name: "Signature", category: "Fashion & Clothing", rating: 4.3, followerCount: 10400, isFollowed: false, businessRegistrationNumber: "BRN-SIGNATURE", address: "Colombo 03", email: "info@signature.lk", contactNo: "+94 11 256 7890", website: "www.signature.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80" },
  { name: "House of Fashions", category: "Fashion & Clothing", rating: 4.5, followerCount: 36000, isFollowed: false, businessRegistrationNumber: "BRN-HOF", address: "D.S. Senanayake Mawatha, Colombo 08", email: "info@houseoffashions.lk", contactNo: "+94 11 268 7777", website: "www.houseoffashions.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&q=80" },

  // Healthcare & Pharmacy (6)
  { name: "Healthguard", category: "Healthcare & Pharmacy", rating: 4.7, followerCount: 16500, isFollowed: false, businessRegistrationNumber: "BRN-HEALTHGUARD", address: "Colombo 03", email: "info@healthguard.lk", contactNo: "+94 11 475 7575", website: "www.healthguard.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80" },
  { name: "Union Chemists", category: "Healthcare & Pharmacy", rating: 4.5, followerCount: 9200, isFollowed: false, businessRegistrationNumber: "BRN-UNION", address: "Union Place, Colombo 02", email: "info@unionchemists.lk", contactNo: "+94 11 242 1111", website: "www.unionchemists.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=150&q=80" },
  { name: "Osusala", category: "Healthcare & Pharmacy", rating: 4.4, followerCount: 28500, isFollowed: false, businessRegistrationNumber: "BRN-OSUSALA", address: "Colombo 07", email: "info@osusala.lk", contactNo: "+94 11 269 4444", website: "www.spc.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1607619056574-7b8d304f3c6f?auto=format&fit=crop&w=150&q=80" },
  { name: "Hemas Hospitals", category: "Healthcare & Pharmacy", rating: 4.6, followerCount: 19800, isFollowed: false, businessRegistrationNumber: "BRN-HEMAS", address: "Wattala, Gampaha", email: "info@hemashospitals.com", contactNo: "+94 11 788 8888", website: "www.hemashospitals.com", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=150&q=80" },
  { name: "Nawaloka Hospitals", category: "Healthcare & Pharmacy", rating: 4.5, followerCount: 22300, isFollowed: false, businessRegistrationNumber: "BRN-NAWALOKA", address: "Deshamanya H.K. Dharmadasa Mawatha, Colombo 02", email: "info@nawaloka.com", contactNo: "+94 11 230 4444", website: "www.nawaloka.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1631549916768-4119b295f846?auto=format&fit=crop&w=150&q=80" },
  { name: "Asiri Hospitals", category: "Healthcare & Pharmacy", rating: 4.7, followerCount: 25400, isFollowed: false, businessRegistrationNumber: "BRN-ASIRI", address: "Kirula Road, Colombo 05", email: "info@asiri.lk", contactNo: "+94 11 452 4400", website: "www.asirihealth.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=150&q=80" },

  // Vehicle & Auto Parts (6)
  { name: "Toyota Lanka", category: "Vehicles & Auto Parts", rating: 4.8, followerCount: 34200, isFollowed: false, businessRegistrationNumber: "BRN-TOYOTA", address: "Wattala, Gampaha", email: "info@toyota.lk", contactNo: "+94 11 293 9000", website: "www.toyota.lk", subscriptionPlan: "Platinum", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80" },
  { name: "DIMO", category: "Vehicles & Auto Parts", rating: 4.7, followerCount: 28500, isFollowed: false, businessRegistrationNumber: "BRN-DIMO", address: "Jetawana Road, Colombo 14", email: "dimo@dimolanka.com", contactNo: "+94 11 244 9797", website: "www.dimolanka.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=150&q=80" },
  { name: "Stafford Motors", category: "Vehicles & Auto Parts", rating: 4.5, followerCount: 14200, isFollowed: false, businessRegistrationNumber: "BRN-STAFFORD", address: "Maradana Road, Colombo 10", email: "info@honda.lk", contactNo: "+94 11 268 1444", website: "www.honda.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=150&q=80" },
  { name: "United Motors", category: "Vehicles & Auto Parts", rating: 4.6, followerCount: 18400, isFollowed: false, businessRegistrationNumber: "BRN-UNITED", address: "Union Place, Colombo 02", email: "info@unitedmotors.lk", contactNo: "+94 11 244 8112", website: "www.unitedmotors.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=150&q=80" },
  { name: "David Pieris Motor Company", category: "Vehicles & Auto Parts", rating: 4.5, followerCount: 31200, isFollowed: false, businessRegistrationNumber: "BRN-DPMC", address: "Colombo Road, Kalutara", email: "info@dpmco.com", contactNo: "+94 11 470 0600", website: "www.dpmco.com", subscriptionPlan: "Premium", isSuspended: false, district: "Kalutara", verified: true, logo: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=150&q=80" },
  { name: "Micro Cars", category: "Vehicles & Auto Parts", rating: 4.2, followerCount: 16500, isFollowed: false, businessRegistrationNumber: "BRN-MICRO", address: "Galle Road, Colombo 03", email: "info@microcars.lk", contactNo: "+94 11 257 6251", website: "www.micro.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=150&q=80" },

  // Restaurants & Food (7)
  { name: "Pizza Hut Sri Lanka", category: "Restaurants & Food", rating: 4.6, followerCount: 42100, isFollowed: false, businessRegistrationNumber: "BRN-PIZZAHUT", address: "Galle Road, Colombo 03", email: "info@pizzahut.lk", contactNo: "+94 11 272 9729", website: "www.pizzahut.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80" },
  { name: "Domino's Sri Lanka", category: "Restaurants & Food", rating: 4.4, followerCount: 23200, isFollowed: false, businessRegistrationNumber: "BRN-DOMINOS", address: "Galle Road, Colombo 04", email: "dominos@dominos.lk", contactNo: "+94 11 777 7888", website: "www.dominos.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=150&q=80" },
  { name: "KFC Sri Lanka", category: "Restaurants & Food", rating: 4.5, followerCount: 39500, isFollowed: false, businessRegistrationNumber: "BRN-KFC", address: "Jawatta Road, Colombo 05", email: "kfc@cargills.lk", contactNo: "+94 11 234 5000", website: "www.kfc.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1513639776629-7b61b0ac59b4?auto=format&fit=crop&w=150&q=80" },
  { name: "Burger King Sri Lanka", category: "Restaurants & Food", rating: 4.4, followerCount: 18500, isFollowed: false, businessRegistrationNumber: "BRN-BK", address: "Colombo 03", email: "bk@softlogic.lk", contactNo: "+94 11 200 1234", website: "www.burgerking.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1534790566985-aae57c6f598b?auto=format&fit=crop&w=150&q=80" },
  { name: "Barista", category: "Restaurants & Food", rating: 4.6, followerCount: 14200, isFollowed: false, businessRegistrationNumber: "BRN-BARISTA", address: "Colombo 07", email: "info@barista.lk", contactNo: "+94 11 269 9000", website: "www.barista.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80" },
  { name: "Java Lounge", category: "Restaurants & Food", rating: 4.5, followerCount: 12100, isFollowed: false, businessRegistrationNumber: "BRN-JAVA", address: "Colombo 04", email: "info@javalounge.lk", contactNo: "+94 11 259 8888", website: "www.javalounge.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80" },
  { name: "Coffee Bean", category: "Restaurants & Food", rating: 4.6, followerCount: 15400, isFollowed: false, businessRegistrationNumber: "BRN-CBTL", address: "Maitland Crescent, Colombo 07", email: "info@coffeebean.lk", contactNo: "+94 11 268 7777", website: "www.coffeebean.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80" },

  // E-Commerce, Classifieds & Tech (5)
  { name: "Daraz.lk", category: "Travel & Tourism", rating: 4.7, followerCount: 54000, isFollowed: false, businessRegistrationNumber: "SL-BRN-daraz", address: "Galle Road, Colombo", email: "info@daraz.lk", contactNo: "+94 11 234 5678", website: "www.daraz.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=150&q=80" },
  { name: "Kapruka.com", category: "Travel & Tourism", rating: 4.5, followerCount: 21000, isFollowed: false, businessRegistrationNumber: "SL-BRN-kapruka", address: "Colombo", email: "info@kapruka.com", contactNo: "+94 11 250 5050", website: "www.kapruka.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&q=80" },
  { name: "ikman.lk", category: "Real Estate", rating: 4.6, followerCount: 45000, isFollowed: false, businessRegistrationNumber: "SL-BRN-ikman", address: "Colombo", email: "support@ikman.lk", contactNo: "+94 11 235 0350", website: "www.ikman.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=150&q=80" },
  { name: "Takas.lk", category: "Travel & Tourism", rating: 4.3, followerCount: 12500, isFollowed: false, businessRegistrationNumber: "SL-BRN-takas", address: "Colombo", email: "info@takas.lk", contactNo: "+94 11 234 5000", website: "www.takas.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=150&q=80" },
  { name: "MyDeal.lk", category: "Travel & Tourism", rating: 4.4, followerCount: 20500, isFollowed: false, businessRegistrationNumber: "SL-BRN-mydeal", address: "Colombo", email: "info@mydeal.lk", contactNo: "+94 11 411 1111", website: "www.mydeal.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=150&q=80" },

  // Sri Lankan Banks (11)
  { name: "Bank of Ceylon (BOC)", category: "Real Estate", rating: 4.6, followerCount: 49000, isFollowed: false, businessRegistrationNumber: "BRN-BOC", address: "BOC Tower, Colombo 01", email: "info@boc.lk", contactNo: "+94 11 220 4444", website: "www.boc.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=150&q=80" },
  { name: "People's Bank", category: "Real Estate", rating: 4.5, followerCount: 35000, isFollowed: false, businessRegistrationNumber: "BRN-PEOPLES", address: "Sir Chittampalam A. Gardiner Mawatha, Colombo 02", email: "info@peoplesbank.lk", contactNo: "+94 11 248 1111", website: "www.peoplesbank.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=150&q=80" },
  { name: "Commercial Bank", category: "Real Estate", rating: 4.8, followerCount: 52000, isFollowed: false, businessRegistrationNumber: "BRN-COMBANK", address: "Commercial House, Colombo 01", email: "info@combank.net", contactNo: "+94 11 248 6000", website: "www.combank.lk", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=150&q=80" },
  { name: "Hatton National Bank (HNB)", category: "Real Estate", rating: 4.7, followerCount: 48000, isFollowed: false, businessRegistrationNumber: "BRN-HNB", address: "HNB Towers, Colombo 10", email: "info@hnb.lk", contactNo: "+94 11 266 4664", website: "www.hnb.net", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=150&q=80" },
  { name: "Sampath Bank", category: "Real Estate", rating: 4.8, followerCount: 51200, isFollowed: false, businessRegistrationNumber: "BRN-SAMPATH", address: "Sir James Peiris Mawatha, Colombo 02", email: "info@sampath.lk", contactNo: "+94 11 230 3050", website: "www.sampath.lk", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1504151932400-72d425550d2d?auto=format&fit=crop&w=150&q=80" },
  { name: "Seylan Bank", category: "Real Estate", rating: 4.5, followerCount: 29500, isFollowed: false, businessRegistrationNumber: "BRN-SEYLAN", address: "Galle Road, Colombo 03", email: "info@seylan.lk", contactNo: "+94 11 200 4224", website: "www.seylan.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1534951009808-766178b47a4f?auto=format&fit=crop&w=150&q=80" },
  { name: "National Savings Bank (NSB)", category: "Real Estate", rating: 4.4, followerCount: 22100, isFollowed: false, businessRegistrationNumber: "BRN-NSB", address: "Galle Road, Colombo 03", email: "info@nsb.lk", contactNo: "+94 11 257 3008", website: "www.nsb.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" },
  { name: "DFCC Bank", category: "Real Estate", rating: 4.5, followerCount: 18400, isFollowed: false, businessRegistrationNumber: "BRN-DFCC", address: "Galle Road, Colombo 03", email: "info@dfccbank.com", contactNo: "+94 11 235 0000", website: "www.dfcc.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&q=80" },
  { name: "NDB Bank", category: "Real Estate", rating: 4.4, followerCount: 16500, isFollowed: false, businessRegistrationNumber: "BRN-NDB", address: "Dharmapala Mawatha, Colombo 07", email: "info@ndbbank.com", contactNo: "+94 11 244 8448", website: "www.ndbbank.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=150&q=80" },
  { name: "Union Bank", category: "Real Estate", rating: 4.3, followerCount: 11200, isFollowed: false, businessRegistrationNumber: "BRN-UNIONBANK", address: "Galle Road, Colombo 03", email: "info@unionb.com", contactNo: "+94 11 237 4100", website: "www.unionb.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=150&q=80" },
  { name: "Pan Asia Bank", category: "Real Estate", rating: 4.4, followerCount: 13500, isFollowed: false, businessRegistrationNumber: "BRN-PABC", address: "Galle Road, Colombo 03", email: "info@pabcbank.com", contactNo: "+94 11 466 7777", website: "www.pabcbank.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=150&q=80" },

  // Jewelry & Watches (5)
  { name: "Vogue Jewellers", category: "Jewelry & Watches", rating: 4.8, followerCount: 22500, isFollowed: false, businessRegistrationNumber: "BRN-VOGUE", address: "Galle Road, Colombo 03", email: "info@voguejewellers.com", contactNo: "+94 11 242 2222", website: "www.voguejewellers.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80" },
  { name: "Raja Jewellers", category: "Jewelry & Watches", rating: 4.7, followerCount: 19800, isFollowed: false, businessRegistrationNumber: "BRN-RAJA", address: "Galle Road, Colombo 04", email: "info@rajajewellers.com", contactNo: "+94 11 258 3555", website: "www.rajajewellers.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80" },
  { name: "Mallika Hemachandra Jewellers", category: "Jewelry & Watches", rating: 4.6, followerCount: 15400, isFollowed: false, businessRegistrationNumber: "BRN-MHJ", address: "Horton Place, Colombo 07", email: "info@mallikahemachandra.com", contactNo: "+94 11 268 8531", website: "www.mallikahemachandra.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80" },
  { name: "Colombo Jewellery Stores", category: "Jewelry & Watches", rating: 4.8, followerCount: 14200, isFollowed: false, businessRegistrationNumber: "BRN-CJS", address: "Galle Road, Colombo 03", email: "info@cjs.lk", contactNo: "+94 11 257 3612", website: "www.cjs.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80" },
  { name: "Devi Jewellers", category: "Jewelry & Watches", rating: 4.5, followerCount: 11200, isFollowed: false, businessRegistrationNumber: "BRN-DEVI", address: "Sea Street, Colombo 11", email: "info@devijewellers.com", contactNo: "+94 11 242 4111", website: "www.devijewellers.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80" },

  // Travel & Tourism (5)
  { name: "SriLankan Airlines", category: "Travel & Tourism", rating: 4.6, followerCount: 85000, isFollowed: false, businessRegistrationNumber: "BRN-UL", address: "East Tower, WTC, Colombo 01", email: "ulinfo@srilankan.com", contactNo: "+94 11 737 4747", website: "www.srilankan.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=150&q=80" },
  { name: "Cinnamon Air", category: "Travel & Tourism", rating: 4.5, followerCount: 11200, isFollowed: false, businessRegistrationNumber: "BRN-CINNAIR", address: "Colombo", email: "reservations@cinnamonair.com", contactNo: "+94 11 247 5475", website: "www.cinnamonair.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=150&q=80" },
  { name: "FitsAir", category: "Travel & Tourism", rating: 4.3, followerCount: 18400, isFollowed: false, businessRegistrationNumber: "BRN-FITSAIR", address: "Colombo 03", email: "cargo@fitsair.com", contactNo: "+94 11 255 5888", website: "www.fitsair.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=150&q=80" },
  { name: "Aitken Spence Travels", category: "Travel & Tourism", rating: 4.7, followerCount: 22400, isFollowed: false, businessRegistrationNumber: "BRN-AST", address: "Vauxhall Street, Colombo 02", email: "info@aitkenspencetravels.lk", contactNo: "+94 11 230 8308", website: "www.aitkenspencetravels.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=150&q=80" },
  { name: "Jetwing Travels", category: "Travel & Tourism", rating: 4.6, followerCount: 21500, isFollowed: false, businessRegistrationNumber: "BRN-JETTRAVELS", address: "Jetwing House, Colombo 10", email: "travels@jetwing.lk", contactNo: "+94 11 234 5700", website: "www.jetwingtravels.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=150&q=80" },

  // Real Estate (5)
  { name: "Prime Lands", category: "Real Estate", rating: 4.6, followerCount: 31200, isFollowed: false, businessRegistrationNumber: "BRN-PRIME", address: "Colombo Road, Gampaha", email: "info@primelands.lk", contactNo: "+94 11 269 9888", website: "www.primelands.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" },
  { name: "Home Lands", category: "Real Estate", rating: 4.5, followerCount: 24200, isFollowed: false, businessRegistrationNumber: "BRN-HOMELANDS", address: "Kotte Road, Colombo", email: "info@homelands.lk", contactNo: "+94 11 288 8777", website: "www.homelands.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" },
  { name: "Blue Mountain Properties", category: "Real Estate", rating: 4.2, followerCount: 15400, isFollowed: false, businessRegistrationNumber: "BRN-BLUEMNT", address: "Colombo 07", email: "info@bluemountain.lk", contactNo: "+94 11 255 5888", website: "www.bluemountain.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" },
  { name: "Kelsey Homes", category: "Real Estate", rating: 4.4, followerCount: 9800, isFollowed: false, businessRegistrationNumber: "BRN-KELSEY", address: "Colombo 03", email: "info@kelsey.lk", contactNo: "+94 11 230 4567", website: "www.kelsey.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" },
  { name: "JKH Property", category: "Real Estate", rating: 4.8, followerCount: 28400, isFollowed: false, businessRegistrationNumber: "BRN-JKHP", address: "Justice Akbar Mawatha, Colombo 02", email: "properties@keells.com", contactNo: "+94 11 215 2152", website: "www.johnkeellsproperties.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" },

  // Education & Training (5)
  { name: "SLIIT", category: "Education & Training", rating: 4.7, followerCount: 42300, isFollowed: false, businessRegistrationNumber: "BRN-SLIIT", address: "New Kandy Road, Malabe", email: "info@sliit.lk", contactNo: "+94 11 754 4801", website: "www.sliit.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=150&q=80" },
  { name: "IIT Campus", category: "Education & Training", rating: 4.8, followerCount: 19800, isFollowed: false, businessRegistrationNumber: "BRN-IIT", address: "Ramakrishna Road, Colombo 06", email: "info@iit.ac.lk", contactNo: "+94 11 236 0303", website: "www.iit.ac.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=150&q=80" },
  { name: "APIIT Sri Lanka", category: "Education & Training", rating: 4.6, followerCount: 14200, isFollowed: false, businessRegistrationNumber: "BRN-APIIT", address: "Union Place, Colombo 02", email: "info@apiit.lk", contactNo: "+94 11 767 5100", website: "www.apiit.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=150&q=80" },
  { name: "NIBM", category: "Education & Training", rating: 4.4, followerCount: 22100, isFollowed: false, businessRegistrationNumber: "BRN-NIBM", address: "Baudhaloka Mawatha, Colombo 07", email: "info@nibm.lk", contactNo: "+94 11 268 5806", website: "www.nibm.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=150&q=80" },
  { name: "ESOFT Metro Campus", category: "Education & Training", rating: 4.5, followerCount: 31200, isFollowed: false, businessRegistrationNumber: "BRN-ESOFT", address: "Galle Road, Colombo 03", email: "info@esoft.lk", contactNo: "+94 11 757 2572", website: "www.esoft.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=150&q=80" },

  // Healthcare / Pharmacy Hospitals (4)
  { name: "Durdans Hospital", category: "Healthcare & Pharmacy", rating: 4.6, followerCount: 15400, isFollowed: false, businessRegistrationNumber: "BRN-DURDANS", address: "Alfred Place, Colombo 03", email: "contact@durdans.com", contactNo: "+94 11 214 0000", website: "www.durdans.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80" },
  { name: "Lanka Hospitals", category: "Healthcare & Pharmacy", rating: 4.8, followerCount: 31200, isFollowed: false, businessRegistrationNumber: "BRN-LANKAHOSP", address: "Elvitigala Mawatha, Colombo 05", email: "info@lankahospitals.com", contactNo: "+94 11 543 0000", website: "www.lankahospitals.com", subscriptionPlan: "Platinum", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=150&q=80" },
  { name: "Kings Hospital", category: "Healthcare & Pharmacy", rating: 4.5, followerCount: 9800, isFollowed: false, businessRegistrationNumber: "BRN-KINGS", address: "Evergreen Road, Colombo 05", email: "info@kingshospital.lk", contactNo: "+94 11 774 4500", website: "www.kingshospital.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=150&q=80" },
  { name: "Central Hospital Colombo", category: "Healthcare & Pharmacy", rating: 4.6, followerCount: 14500, isFollowed: false, businessRegistrationNumber: "BRN-CENTRAL", address: "Norris Canal Road, Colombo 10", email: "info@asiri.lk", contactNo: "+94 11 466 5500", website: "www.asirihealth.com", subscriptionPlan: "Premium", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=150&q=80" },

  // Services & Repairs (5)
  { name: "Laugfs Car Care", category: "Services & Repairs", rating: 4.4, followerCount: 11200, isFollowed: false, businessRegistrationNumber: "BRN-LCC", address: "Colombo Road, Kalutara", email: "carcare@laugfs.lk", contactNo: "+94 11 556 6222", website: "www.laugfscarcare.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Kalutara", verified: true, logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80" },
  { name: "Toyota Plaza Service", category: "Services & Repairs", rating: 4.7, followerCount: 22100, isFollowed: false, businessRegistrationNumber: "BRN-TOYOTAP", address: "Wattala, Gampaha", email: "service@toyota.lk", contactNo: "+94 11 293 9005", website: "www.toyota.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80" },
  { name: "Auto Miraj", category: "Services & Repairs", rating: 4.5, followerCount: 28500, isFollowed: false, businessRegistrationNumber: "BRN-AUTOMIRAJ", address: "Colombo Road, Gampaha", email: "info@automiraj.lk", contactNo: "+94 11 230 4444", website: "www.automiraj.lk", subscriptionPlan: "Premium", isSuspended: false, district: "Gampaha", verified: true, logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80" },
  { name: "KleenPark", category: "Services & Repairs", rating: 4.6, followerCount: 14200, isFollowed: false, businessRegistrationNumber: "BRN-KLEEN", address: "Nawala Road, Kotte", email: "info@kleenpark.com", contactNo: "+94 11 282 8999", website: "www.kleenpark.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80" },
  { name: "DIMO Certified Repair", category: "Services & Repairs", rating: 4.7, followerCount: 18900, isFollowed: false, businessRegistrationNumber: "BRN-DIMOCR", address: "Wackwella Road, Galle", email: "certified@dimolanka.com", contactNo: "+94 91 224 4555", website: "www.dimolanka.com", subscriptionPlan: "Premium", isSuspended: false, district: "Galle", verified: true, logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80" },

  // Construction & Hardware (5)
  { name: "Tokyo Cement", category: "Construction & Hardware", rating: 4.6, followerCount: 22400, isFollowed: false, businessRegistrationNumber: "BRN-TOKYO", address: "Trincomalee", email: "info@tokyocement.com", contactNo: "+94 26 222 2222", website: "www.tokyocement.com", subscriptionPlan: "Premium", isSuspended: false, district: "Trincomalee", verified: true, logo: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=150&q=80" },
  { name: "Lanwa Steel", category: "Construction & Hardware", rating: 4.5, followerCount: 15400, isFollowed: false, businessRegistrationNumber: "BRN-LANWA", address: "Oruwala, Athurugiriya", email: "info@lanwa.lk", contactNo: "+94 11 224 4567", website: "www.lanwa.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=150&q=80" },
  { name: "Samson Rajarata Tiles", category: "Construction & Hardware", rating: 4.4, followerCount: 8900, isFollowed: false, businessRegistrationNumber: "BRN-SRT", address: "Anuradhapura", email: "info@rajaratatiles.lk", contactNo: "+94 25 222 3434", website: "www.samsonrajaratatiles.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Anuradhapura", verified: true, logo: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=150&q=80" },
  { name: "Mascons Hardware", category: "Construction & Hardware", rating: 4.3, followerCount: 6100, isFollowed: false, businessRegistrationNumber: "BRN-MASCONS", address: "Armour Street, Colombo 12", email: "info@mascons.com", contactNo: "+94 11 232 5555", website: "www.mascons.com", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=150&q=80" },
  { name: "Hunter & Company", category: "Construction & Hardware", rating: 4.5, followerCount: 11200, isFollowed: false, businessRegistrationNumber: "BRN-HUNTERS", address: "Front Street, Colombo 11", email: "info@hunters.lk", contactNo: "+94 11 232 8171", website: "www.hunters.lk", subscriptionPlan: "Basic", isSuspended: false, district: "Colombo", verified: true, logo: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=150&q=80" }
];

// 5. Initial Offers (20 Offers for Category and Stores)
export const initialOffers: Offer[] = [
  { id: 1, storeName: "Keells", title: "20% OFF on All Fruits & Vegetables", discountPercent: 20, category: "Supermarkets & Grocery", originalPrice: 1000.0, offerPrice: 800.0, validUntil: "Valid till 30 Jun 2026", location: "Colombo, Kandy, Gampaha", rating: 4.8, termsAndConditions: "Applicable for Nexus Members. Max purchase 5kg.", isFeatured: true, isFlashSale: false, isApproved: true },
  { id: 2, storeName: "Softlogic", title: "Up to 30% OFF On Selected Electronics", discountPercent: 30, category: "Electronics", originalPrice: 120000.0, offerPrice: 84000.0, validUntil: "Valid till 28 Jun 2026", location: "All Softlogic Max Showrooms", rating: 4.6, termsAndConditions: "Available on selected credit card easy payments.", isFeatured: true, isFlashSale: false, isApproved: true },
  { id: 3, storeName: "Cargills Online", title: "15% OFF On Grocery & Essentials", discountPercent: 15, category: "Supermarkets & Grocery", originalPrice: 3000.0, offerPrice: 2550.0, validUntil: "Valid till 29 Jun 2026", location: "Islandwide Outlets", rating: 4.5, termsAndConditions: "Discount applies above LKR 5,000 bill values.", isFeatured: true, isFlashSale: false, isApproved: true },
  { id: 4, storeName: "Daraz.lk", title: "Up to 40% OFF On Top Brands", discountPercent: 40, category: "Travel & Tourism", originalPrice: 15000.0, offerPrice: 9000.0, validUntil: "Valid till 30 Jun 2026", location: "Online Only / Islandwide Delivery", rating: 4.6, termsAndConditions: "Applicable using Partner Credit Cards at checkout.", isFeatured: false, isFlashSale: true, isApproved: true },
  { id: 5, storeName: "Fashion Bug", title: "25% OFF On Selected Summer Outfits", discountPercent: 25, category: "Fashion & Clothing", originalPrice: 4500.0, offerPrice: 3375.0, validUntil: "Valid till 30 Jun 2026", location: "Colombo, Galle, Kurunegala", rating: 4.3, termsAndConditions: "Discount valid only for cash & card retail payments.", isFeatured: false, isFlashSale: true, isApproved: true },
  { id: 6, storeName: "ODEL", title: "20% OFF On Luxury Fashion & Accessories", discountPercent: 20, category: "Fashion & Clothing", originalPrice: 8000.0, offerPrice: 6400.0, validUntil: "Valid till 28 Jun 2026", location: "Odel Ward Place & OGF", rating: 4.7, termsAndConditions: "Excludes jewelry and luxury perfume ranges.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 7, storeName: "Burger King Sri Lanka", title: "Buy 1 Get 1 Free - Premium Burger range", discountPercent: 50, category: "Restaurants & Food", originalPrice: 2200.0, offerPrice: 1100.0, validUntil: "Valid till 30 Jun 2026", location: "All Colombo Outlets", rating: 4.4, termsAndConditions: "Valid for dine-in & takeaway only on Wednesdays.", isFeatured: false, isFlashSale: true, isApproved: true },
  { id: 8, storeName: "Singer Sri Lanka", title: "15% discount on Double Door Refrigerators", discountPercent: 15, category: "Electronics", originalPrice: 185000.0, offerPrice: 157250.0, validUntil: "Valid till 05 Jul 2026", location: "Singer Plus outlets", rating: 4.7, termsAndConditions: "Includes 2-year warranty and free doorstep delivery.", isFeatured: true, isFlashSale: false, isApproved: true },
  { id: 9, storeName: "Abans", title: "25% off Split Air Conditioners", discountPercent: 25, category: "Electronics", originalPrice: 140000.0, offerPrice: 105000.0, validUntil: "Valid till 30 Jun 2026", location: "Islandwide Showrooms", rating: 4.5, termsAndConditions: "Installation included for gold members.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 10, storeName: "Pizza Hut Sri Lanka", title: "Buy 1 Get 1 Free Large Pan Pizzas", discountPercent: 50, category: "Restaurants & Food", originalPrice: 3800.0, offerPrice: 1900.0, validUntil: "Valid till 27 Jun 2026", location: "Delivery & Takeaway only", rating: 4.6, termsAndConditions: "Applies on classic crust selection.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 11, storeName: "KFC Sri Lanka", title: "LKR 500 OFF on 8pc Hot & Crispy Bucket", discountPercent: 15, category: "Restaurants & Food", originalPrice: 3500.0, offerPrice: 3000.0, validUntil: "Valid till 30 Jun 2026", location: "All KFC Outlets", rating: 4.4, termsAndConditions: "Not combinable with other deals.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 12, storeName: "Spa Ceylon Wellness", title: "Buy 2 Get 1 Free Royal Spa Wellness Care", discountPercent: 33, category: "Beauty & Cosmetics", originalPrice: 6000.0, offerPrice: 4000.0, validUntil: "Valid till 31 Jul 2026", location: "All Spa Ceylon Boutiques", rating: 4.9, termsAndConditions: "Valid on herbal balm and body scrub packs.", isFeatured: true, isFlashSale: false, isApproved: true },
  { id: 13, storeName: "Keells", title: "10% off Premium Ceylon Green Tea pack", discountPercent: 10, category: "Supermarkets & Grocery", originalPrice: 950.0, offerPrice: 855.0, validUntil: "Valid till 30 Jun 2026", location: "Keells & Cargills retail", rating: 4.7, termsAndConditions: "Valid on Green Tea Jasmine 50 Bag box.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 14, storeName: "Kapruka.com", title: "Flat LKR 1000 off on Birthday cakes & Flowers", discountPercent: 20, category: "Travel & Tourism", originalPrice: 5000.0, offerPrice: 4000.0, validUntil: "Valid till 10 Jul 2026", location: "Online deliveries in Colombo", rating: 4.5, termsAndConditions: "Coupon code KAPRUKA-BDAY must be applied.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 15, storeName: "SimplyTek Store", title: "15% off Noise-Cancelling Smart Earbuds", discountPercent: 15, category: "Electronics", originalPrice: 8500.0, offerPrice: 7225.0, validUntil: "Valid till 30 Jun 2026", location: "Online & Colombo 04 outlet", rating: 4.6, termsAndConditions: "Includes 6 months store replacement warranty.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 16, storeName: "ZigZag.lk", title: "Buy 2 Get 1 Free Women's Dresses", discountPercent: 33, category: "Fashion & Clothing", originalPrice: 7500.0, offerPrice: 5000.0, validUntil: "Valid till 15 Jul 2026", location: "Online & Colombo retail outlet", rating: 4.6, termsAndConditions: "Discount applied to lower value item.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 17, storeName: "Nolimit", title: "20% OFF on Men's Formal wear range", discountPercent: 20, category: "Fashion & Clothing", originalPrice: 6500.0, offerPrice: 5200.0, validUntil: "Valid till 30 Jun 2026", location: "All Nolimit showrooms", rating: 4.7, termsAndConditions: "Excludes promotional products.", isFeatured: false, isFlashSale: false, isApproved: true },
  { id: 18, storeName: "Bank of Ceylon (BOC)", title: "10% Cashback on BOC credit cards at Keells", discountPercent: 10, category: "Real Estate", originalPrice: 10000.0, offerPrice: 9000.0, validUntil: "Valid till 31 Aug 2026", location: "All Keells Supermarkets", rating: 4.5, termsAndConditions: "Min bill value LKR 6000. Max cashback LKR 1000.", isFeatured: true, isFlashSale: false, isApproved: true },
  { id: 19, storeName: "Commercial Bank", title: "Up to 20% off at Aitken Spence Hotels", discountPercent: 20, category: "Real Estate", originalPrice: 35000.0, offerPrice: 28000.0, validUntil: "Valid till 31 Aug 2026", location: "Online hotel booking portals", rating: 4.8, termsAndConditions: "Applicable using ComBank credit cards.", isFeatured: true, isFlashSale: false, isApproved: true },
  { id: 20, storeName: "Sampath Bank", title: "15% off at all Pizza Hut Dine-in outlets", discountPercent: 15, category: "Real Estate", originalPrice: 5000.0, offerPrice: 4250.0, validUntil: "Valid till 15 Jul 2026", location: "Dine-in only", rating: 4.6, termsAndConditions: "On Sampath MasterCard & Visa Cards.", isFeatured: false, isFlashSale: false, isApproved: true }
];

// 6. Initial Coupons (20 Coupons)
export const initialCoupons: Coupon[] = [
  { code: "KEELLS-PROMO-20", description: "LKR 200 off weekly savers bundle", discountAmount: 200.0, costPoints: 100, isRedeemed: false },
  { code: "ODEL-SUMMER-50", description: "LKR 500 off wardrobe upgrades", discountAmount: 500.0, costPoints: 200, isRedeemed: false },
  { code: "SINGER-MEGA-1K", description: "LKR 1,000 off high-end smart electronics", discountAmount: 1000.0, costPoints: 400, isRedeemed: false },
  { code: "CARGILLS-SAVE-15", description: "15% off total fresh grocery bills", discountAmount: 350.0, costPoints: 150, isRedeemed: false },
  { code: "SPA-CEYLON-HERB", description: "LKR 400 off luxury wellness skincare packs", discountAmount: 400.0, costPoints: 120, isRedeemed: false },
  { code: "ABANS-SAVE-800", description: "LKR 800 off premium kitchen mixer/grinders", discountAmount: 800.0, costPoints: 300, isRedeemed: false },
  { code: "DARAZ-FLYER-50", description: "LKR 500 off first order above LKR 2000", discountAmount: 500.0, costPoints: 180, isRedeemed: false },
  { code: "KFC-BUCKET-200", description: "LKR 200 off 8pc Hot & Crispy bucket deal", discountAmount: 200.0, costPoints: 80, isRedeemed: false },
  { code: "PIZZAHUT-PAN-3", description: "LKR 300 off any double classic large pan pizza", discountAmount: 300.0, costPoints: 130, isRedeemed: false },
  { code: "ZIGZAG-DRESS-4", description: "LKR 400 off any designer partywear dress", discountAmount: 400.0, costPoints: 150, isRedeemed: false },
  { code: "NOLIMIT-LACE-6", description: "LKR 600 off cotton sarees & ethnic tunics", discountAmount: 600.0, costPoints: 250, isRedeemed: false },
  { code: "GLOMARK-BAG-15", description: "15% off organic grains and imported grocery bundles", discountAmount: 300.0, costPoints: 110, isRedeemed: false },
  { code: "ARPICO-SOFA-2K", description: "LKR 2,000 off wooden sofa/bedroom sets", discountAmount: 2000.0, costPoints: 600, isRedeemed: false },
  { code: "SPAR-SAVINGS-5", description: "LKR 250 off homecare cleaner bundles", discountAmount: 250.0, costPoints: 90, isRedeemed: false },
  { code: "DILMAH-PURE-10", description: "LKR 100 off Dilmah green tea premium box", discountAmount: 100.0, costPoints: 50, isRedeemed: false },
  { code: "KAPRUKA-CADE-5", description: "LKR 500 off flower bouquets online delivery", discountAmount: 500.0, costPoints: 200, isRedeemed: false },
  { code: "SIMPLY-GADG-7", description: "LKR 700 off premium digital smartwatches", discountAmount: 700.0, costPoints: 280, isRedeemed: false },
  { code: "BURGER-KING-15", description: "LKR 150 off any whopper combo meal box", discountAmount: 150.0, costPoints: 70, isRedeemed: false },
  { code: "COOL-PLAN-300", description: "LKR 300 off footwear and children items", discountAmount: 300.0, costPoints: 140, isRedeemed: false },
  { code: "WASI-PROMO-12", description: "LKR 600 off computer peripherals and storage", discountAmount: 600.0, costPoints: 240, isRedeemed: false }
];

// 5. Initial Notifications (20 Notifications)
export const initialNotifications: Notification[] = [
  { id: 1, title: "Welcome to OfferHub!", message: "Simulated background services active. Start browsing deals!", type: "PROMO", timestamp: Date.now() - 600000, isRead: false },
  { id: 2, title: "Keells Weekly Super Savers", message: "Keells Weekly Super Savers promo has been unlocked! 20% off all fruits.", type: "NEW_OFFER", timestamp: Date.now() - 1200000, isRead: false },
  { id: 3, title: "Exclusive Odel card discount", message: "Exclusive Odel card discount detected at Colombo 03 outlet. Save 20%.", type: "PROMO", timestamp: Date.now() - 1800000, isRead: true },
  { id: 4, title: "Flash Sale Alert: TV Deals", message: "Singer Smart TVs discounted by 30% for the next 2 hours only!", type: "FLASH_SALE", timestamp: Date.now() - 3600000, isRead: false },
  { id: 5, title: "Price Drop on iPhone 15 Pro", message: "iPhone 15 Pro Max dropped by LKR 15,000 at Abans store.", type: "PRICE_DROP", timestamp: Date.now() - 7200000, isRead: false },
  { id: 6, title: "Pizza Hut BOGO unlocked!", message: "Buy 1 Get 1 Free active today on large pan pizzas.", type: "NEW_OFFER", timestamp: Date.now() - 10800000, isRead: true },
  { id: 7, title: "Commercial Bank Promo Card", message: "Save 20% on Aitken Spence Hotel stays using bank card.", type: "PROMO", timestamp: Date.now() - 14400000, isRead: false },
  { id: 8, title: "Welcome cashback received", message: "LKR 1,500 welcome cashback was added to your wallet balance.", type: "PROMO", timestamp: Date.now() - 18000000, isRead: true },
  { id: 9, title: "Cargills Online Groceries Deal", message: "15% discount coupon is active on grocery bills above LKR 5000.", type: "NEW_OFFER", timestamp: Date.now() - 21600000, isRead: false },
  { id: 10, title: "Spa Ceylon Royal Care Pack", message: "Buy 2 Get 1 Free on luxury spa wellness cosmetics.", type: "NEW_OFFER", timestamp: Date.now() - 25200000, isRead: true },
  { id: 11, title: "NOLIMIT Ethnic Saree Promo", message: "Save 20% on premium handspun sarees at all NOLIMIT outlets.", type: "NEW_OFFER", timestamp: Date.now() - 28800000, isRead: false },
  { id: 12, title: "KFC Zinger Combo Price Drop", message: "LKR 500 reduction on KFC Family Chicken Buckets.", type: "PRICE_DROP", timestamp: Date.now() - 32400000, isRead: false },
  { id: 13, title: "Double points on green tea", message: "Purchase Dilmah Green Tea boxes to earn double reward points.", type: "PROMO", timestamp: Date.now() - 36000000, isRead: true },
  { id: 14, title: "Coupon redemption success", message: "Coupon code KEELLS-PROMO-20 was successfully redeemed.", type: "PROMO", timestamp: Date.now() - 39600000, isRead: true },
  { id: 15, title: "Abans AC Installation Offer", message: "Free home delivery & installation on Split Air Conditioners.", type: "NEW_OFFER", timestamp: Date.now() - 43200000, isRead: false },
  { id: 16, title: "ZigZag.lk Party Wear launch", message: "Explore the new partywear range online. 10% coupon active.", type: "NEW_OFFER", timestamp: Date.now() - 46800000, isRead: true },
  { id: 17, title: "SimplyTek smartwatch discount", message: "15% OFF Noise-Cancelling Smart Earbuds code active today.", type: "NEW_OFFER", timestamp: Date.now() - 50400000, isRead: false },
  { id: 18, title: "BOC Card Keells Cashback", message: "10% cashback on BOC credit cards verified at checkout.", type: "PROMO", timestamp: Date.now() - 54000000, isRead: false },
  { id: 19, title: "Support Ticket Resolved", message: "Ticket #3 regarding loyalty points was marked resolved.", type: "PROMO", timestamp: Date.now() - 57600000, isRead: true },
  { id: 20, title: "Kampruka Colombo Delivery", message: "Flat LKR 1000 off on birthday cake orders today.", type: "NEW_OFFER", timestamp: Date.now() - 61200000, isRead: false }
];

// 6. Initial Orders (20 Orders)
export const initialOrders: Order[] = [
  { id: 1001, userEmail: "nuhman@gmail.com", productNames: "Premium Sri Lankan Keeri Samba Rice 5kg x2, Nescafe Classic Coffee Jar 200g x1", totalPrice: 4800, paymentMethod: "Wallet Balance", date: "21 Jun 2026, 14:10 PM", status: "DELIVERED" },
  { id: 1002, userEmail: "nuhman@gmail.com", productNames: "Nike Air Max Breathable Sports Sneakers x1", totalPrice: 12500, paymentMethod: "Visa Card", date: "21 Jun 2026, 11:32 AM", status: "SHIPPED" },
  { id: 1003, userEmail: "kamal@gmail.com", productNames: "Samsung Crystal 4K UHD Smart TV 43\" x1", totalPrice: 114000, paymentMethod: "Visa Card", date: "20 Jun 2026, 17:45 PM", status: "PROCESSING" },
  { id: 1004, userEmail: "nimal@gmail.com", productNames: "Dilmah Premium Ceylon Black Tea 100 Bag Box x3, ASTRA Margarine Pack 250g x2", totalPrice: 3200, paymentMethod: "Cash On Delivery", date: "20 Jun 2026, 15:20 PM", status: "CONFIRMED" },
  { id: 1005, userEmail: "sunil@gmail.com", productNames: "Philips Dry Iron Non-Stick Soleplate 1000W x1", totalPrice: 4500, paymentMethod: "Wallet Balance", date: "19 Jun 2026, 09:15 AM", status: "DELIVERED" },
  { id: 1006, userEmail: "priyantha@gmail.com", productNames: "Pizza Hut Double Chicken Classic Large Pizza x2", totalPrice: 4400, paymentMethod: "Cash On Delivery", date: "18 Jun 2026, 20:30 PM", status: "DELIVERED" },
  { id: 1007, userEmail: "ruwan@yahoo.com", productNames: "KFC 8-Piece Hot & Crispy Chicken Family Bucket x1", totalPrice: 3500, paymentMethod: "Visa Card", date: "18 Jun 2026, 19:10 PM", status: "DELIVERED" },
  { id: 1008, userEmail: "aruni@outlook.com", productNames: "Women's Printed Cotton Kurti Tunic x2, Linen Slim-Fit Casual Trousers x1", totalPrice: 8800, paymentMethod: "Visa Card", date: "17 Jun 2026, 14:25 PM", status: "DELIVERED" },
  { id: 1009, userEmail: "chathura@gmail.com", productNames: "White Sugar Local Crystal Pack 1kg x5", totalPrice: 1150, paymentMethod: "Cash On Delivery", date: "16 Jun 2026, 10:05 AM", status: "DELIVERED" },
  { id: 1010, userEmail: "dilhara@yahoo.com", productNames: "Sony Stereo Super-Bass Wireless Headphones x1", totalPrice: 18000, paymentMethod: "Visa Card", date: "15 Jun 2026, 16:40 PM", status: "DELIVERED" },
  { id: 1011, userEmail: "menaka@gmail.com", productNames: "Dilmah Premium Ceylon Black Tea 100 Bag Box x2, Nescafe Classic Coffee Jar 200g x2", totalPrice: 5600, paymentMethod: "Wallet Balance", date: "14 Jun 2026, 13:12 PM", status: "DELIVERED" },
  { id: 1012, userEmail: "samantha@gmail.com", productNames: "Abans Double Door No-Frost Refrigerator 260L x1", totalPrice: 135000, paymentMethod: "Visa Card", date: "13 Jun 2026, 11:15 AM", status: "DELIVERED" },
  { id: 1013, userEmail: "nilanthi@gmail.com", productNames: "Prestige Induction Cooktop with Touch Panel x1", totalPrice: 15500, paymentMethod: "Visa Card", date: "12 Jun 2026, 15:45 PM", status: "DELIVERED" },
  { id: 1014, userEmail: "tharindu@gmail.com", productNames: "Dilmah Green Tea Premium Box x2", totalPrice: 1900, paymentMethod: "Cash On Delivery", date: "11 Jun 2026, 18:22 PM", status: "DELIVERED" },
  { id: 1015, userEmail: "sanduni@gmail.com", productNames: "Levi's Original Denim Jeans Comfort Fit x1", totalPrice: 9500, paymentMethod: "Wallet Balance", date: "10 Jun 2026, 14:50 PM", status: "DELIVERED" },
  { id: 1016, userEmail: "nuhman@gmail.com", productNames: "ASUS Vivobook Ryzen 5 Thin Laptop x1", totalPrice: 168000, paymentMethod: "Visa Card", date: "09 Jun 2026, 09:30 AM", status: "DELIVERED" },
  { id: 1017, userEmail: "kamal@gmail.com", productNames: "Dilmah Ceylon Tea Box x5, White Sugar Local Pack x5", totalPrice: 3200, paymentMethod: "Cash On Delivery", date: "08 Jun 2026, 11:20 AM", status: "DELIVERED" },
  { id: 1018, userEmail: "nimal@gmail.com", productNames: "Nike Air Max Sports Sneakers x1, Ray-Ban Polarized Wayfarer Sunglasses x1", totalPrice: 22000, paymentMethod: "Visa Card", date: "07 Jun 2026, 16:15 PM", status: "DELIVERED" },
  { id: 1019, userEmail: "sunil@gmail.com", productNames: "Maliban Gold Marie Biscuits Trio Pack x4", totalPrice: 1200, paymentMethod: "Wallet Balance", date: "06 Jun 2026, 10:45 AM", status: "DELIVERED" },
  { id: 1020, userEmail: "priyantha@gmail.com", productNames: "Munchee Super Cream Cracker Pack 250g x10", totalPrice: 2800, paymentMethod: "Cash On Delivery", date: "05 Jun 2026, 12:10 PM", status: "DELIVERED" }
];

// 7. Initial Payments (20 Payments)
export const initialPayments: VisaPaymentRecord[] = [
  { paymentId: "PAY-172901", userId: "nuhman@gmail.com", amount: 12500, cardLast4Digits: "4321", status: "SUCCESS", paymentDate: "21 Jun 2026, 11:32 AM", transactionReference: "TXN-9988112" },
  { paymentId: "PAY-172902", userId: "kamal@gmail.com", amount: 114000, cardLast4Digits: "9876", status: "SUCCESS", paymentDate: "20 Jun 2026, 17:45 PM", transactionReference: "TXN-9988113" },
  { paymentId: "PAY-172903", userId: "ruwan@yahoo.com", amount: 3500, cardLast4Digits: "5544", status: "SUCCESS", paymentDate: "18 Jun 2026, 19:10 PM", transactionReference: "TXN-9988114" },
  { paymentId: "PAY-172904", userId: "aruni@outlook.com", amount: 8800, cardLast4Digits: "6677", status: "SUCCESS", paymentDate: "17 Jun 2026, 14:25 PM", transactionReference: "TXN-9988115" },
  { paymentId: "PAY-172905", userId: "dilhara@yahoo.com", amount: 18000, cardLast4Digits: "1122", status: "SUCCESS", paymentDate: "15 Jun 2026, 16:40 PM", transactionReference: "TXN-9988116" },
  { paymentId: "PAY-172906", userId: "samantha@gmail.com", amount: 135000, cardLast4Digits: "3344", status: "SUCCESS", paymentDate: "13 Jun 2026, 11:15 AM", transactionReference: "TXN-9988117" },
  { paymentId: "PAY-172907", userId: "nilanthi@gmail.com", amount: 15500, cardLast4Digits: "8899", status: "SUCCESS", paymentDate: "12 Jun 2026, 15:45 PM", transactionReference: "TXN-9988118" },
  { paymentId: "PAY-172908", userId: "nuhman@gmail.com", amount: 168000, cardLast4Digits: "4321", status: "SUCCESS", paymentDate: "09 Jun 2026, 09:30 AM", transactionReference: "TXN-9988119" },
  { paymentId: "PAY-172909", userId: "nimal@gmail.com", amount: 22000, cardLast4Digits: "7766", status: "SUCCESS", paymentDate: "07 Jun 2026, 16:15 PM", transactionReference: "TXN-9988120" },
  { paymentId: "PAY-172910", userId: "kamal@gmail.com", amount: 12000, cardLast4Digits: "9876", status: "FAILED", paymentDate: "21 Jun 2026, 10:15 AM", transactionReference: "TXN-9988121" },
  { paymentId: "PAY-172911", userId: "tharindu@gmail.com", amount: 4800, cardLast4Digits: "5555", status: "SUCCESS", paymentDate: "04 Jun 2026, 15:22 PM", transactionReference: "TXN-9988122" },
  { paymentId: "PAY-172912", userId: "sanduni@gmail.com", amount: 9500, cardLast4Digits: "1212", status: "SUCCESS", paymentDate: "03 Jun 2026, 11:10 AM", transactionReference: "TXN-9988123" },
  { paymentId: "PAY-172913", userId: "sunil@gmail.com", amount: 3000, cardLast4Digits: "2323", status: "SUCCESS", paymentDate: "02 Jun 2026, 09:40 AM", transactionReference: "TXN-9988124" },
  { paymentId: "PAY-172914", userId: "menaka@gmail.com", amount: 15000, cardLast4Digits: "3434", status: "SUCCESS", paymentDate: "01 Jun 2026, 16:20 PM", transactionReference: "TXN-9988125" },
  { paymentId: "PAY-172915", userId: "dilhara@yahoo.com", amount: 6200, cardLast4Digits: "4545", status: "SUCCESS", paymentDate: "30 May 2026, 14:15 PM", transactionReference: "TXN-9988126" },
  { paymentId: "PAY-172916", userId: "chathura@gmail.com", amount: 2500, cardLast4Digits: "5656", status: "SUCCESS", paymentDate: "29 May 2026, 10:05 AM", transactionReference: "TXN-9988127" },
  { paymentId: "PAY-172917", userId: "aruni@outlook.com", amount: 45000, cardLast4Digits: "6767", status: "SUCCESS", paymentDate: "28 May 2026, 11:50 AM", transactionReference: "TXN-9988128" },
  { paymentId: "PAY-172918", userId: "ruwan@yahoo.com", amount: 7200, cardLast4Digits: "7878", status: "SUCCESS", paymentDate: "27 May 2026, 13:30 PM", transactionReference: "TXN-9988129" },
  { paymentId: "PAY-172919", userId: "priyantha@gmail.com", amount: 1900, cardLast4Digits: "8989", status: "SUCCESS", paymentDate: "26 May 2026, 18:10 PM", transactionReference: "TXN-9988130" },
  { paymentId: "PAY-172920", userId: "nimal@gmail.com", amount: 35000, cardLast4Digits: "9090", status: "SUCCESS", paymentDate: "25 May 2026, 15:40 PM", transactionReference: "TXN-9988131" }
];

// 8. Initial Support Desk Tickets (20 Tickets)
export const initialTickets: Ticket[] = [
  { id: 1, user: "Kamal Perera", email: "kamal@gmail.com", subject: "Visa Payment failed", message: "My LKR 12,000 transaction for the Keells deal failed but the amount was deducted.", status: "PENDING", date: "Today, 10:15 AM" },
  { id: 2, user: "Priyantha Silva", email: "priyantha@merchant.lk", subject: "Logo Update Request", message: "Can you please update our Keells store logo to the high resolution version?", status: "PENDING", date: "Yesterday" },
  { id: 3, user: "Nisansala Jayawardene", email: "nisansala@yahoo.com", subject: "Loyalty point redemption", message: "How do I redeem my loyalty points for the LKR 500 coupon?", status: "RESOLVED", reply: "You can click on the Rewards tab and select the coupon. The points will be auto-deducted.", date: "2 days ago" },
  { id: 4, user: "Nimal Silva", email: "nimal@gmail.com", subject: "Refund Status", message: "Still haven't received my refund of LKR 4,500 from the cancelled Singer order.", status: "PENDING", date: "2 days ago" },
  { id: 5, user: "Sunil Fernando", email: "sunil@gmail.com", subject: "Account Suspension inquiry", message: "Why is my merchant account suspended? I uploaded legitimate business registration files.", status: "PENDING", date: "3 days ago" },
  { id: 6, user: "Aruni Rajapaksha", email: "aruni@outlook.com", subject: "Referral code not working", message: "I shared my referral code with my friend but I didn't get the welcome bonus.", status: "RESOLVED", reply: "Hello, your friend needs to place at least one order above LKR 1,500 to trigger the bonus.", date: "4 days ago" },
  { id: 7, user: "Chathura Bandara", email: "chathura@gmail.com", subject: "Wrong item delivered", message: "I ordered Keeri Samba rice but received local red rice instead from Cargills Online.", status: "PENDING", date: "4 days ago" },
  { id: 8, user: "Dilhara Senanayake", email: "dilhara@yahoo.com", subject: "Partner card discounts", message: "Is the BOC credit card 10% discount applicable for electronic appliances as well?", status: "RESOLVED", reply: "No, the card discount is only valid on fresh produce and groceries at Keells Nexus.", date: "5 days ago" },
  { id: 9, user: "Menaka Wettasinghe", email: "menaka@gmail.com", subject: "Washing machine warranty card", message: "I bought a Damro washer but the warranty card inside was not stamped by the merchant.", status: "PENDING", date: "5 days ago" },
  { id: 10, user: "Samantha Gunawardena", email: "samantha@gmail.com", subject: "Promo code validation error", message: "Whenever I type ODEL-SUMMER-50 at checkout, it says promo code invalid.", status: "PENDING", date: "6 days ago" },
  { id: 11, user: "Nilanthi Cooray", email: "nilanthi@gmail.com", subject: "Store location mapping", message: "The app map shows SPAR SL in Kandy but SPAR is only available in Colombo area.", status: "PENDING", date: "6 days ago" },
  { id: 12, user: "Tharindu Wijesinghe", email: "tharindu@gmail.com", subject: "Verification email delay", message: "I didn't receive any registration email link. Please activate my account.", status: "RESOLVED", reply: "Account verified. Verification checks are now bypassed for streamlined signups.", date: "1 week ago" },
  { id: 13, user: "Sanduni Perera", email: "sanduni@gmail.com", subject: "Delivery Courier timing", message: "My standard courier order took 3 days instead of the promised 24 hours.", status: "PENDING", date: "1 week ago" },
  { id: 14, user: "Ruwan Jayasinghe", email: "ruwan@yahoo.com", subject: "Cashback wallet balance query", message: "My LKR 1500 cashback is not showing in my wallet. Please check my status.", status: "RESOLVED", reply: "Cashback wallet balance has been credited and verified for your account.", date: "1 week ago" },
  { id: 15, user: "Amara Devasinghe", email: "amara@gmail.com", subject: "Seller subscription plans", message: "Can you give us a comparison of the premium and gold merchant subscription plans?", status: "PENDING", date: "1 week ago" },
  { id: 16, user: "Roshan Perera", email: "roshan@yahoo.com", subject: "Dilmah Green Tea Green box", message: "Is the Green tea discount offer applicable on green tea jasmine box?", status: "RESOLVED", reply: "Yes, it is valid on both Dilmah Green Tea Jasmine and Dilmah Green Tea Mint boxes.", date: "2 weeks ago" },
  { id: 17, user: "Suresh Rajapakse", email: "suresh@gmail.com", subject: "Visa Checkout secure gateway", message: "Is the Visa payment gateway PCI-DSS compliant? Can we save cards securely?", status: "RESOLVED", reply: "Yes, all credit card transactions go through our secure, simulated Visa Sandbox gateway.", date: "2 weeks ago" },
  { id: 18, user: "Keshani Fernando", email: "keshani@gmail.com", subject: "Abans AC warranty claim", message: "How do I claim my warranty for the Split AC unit? It started leaking.", status: "PENDING", date: "2 weeks ago" },
  { id: 19, user: "Pradeep Silva", email: "pradeep@gmail.com", subject: "App lag on Android", message: "The app scrolling lags when loading the 200 products marketplace grid on Android.", status: "RESOLVED", reply: "We optimized grid rendering using FlatList and cached images for smooth scrolling.", date: "2 weeks ago" },
  { id: 20, user: "Udaya Kumara", email: "udaya@gmail.com", subject: "Spa Ceylon outlet Colombo 07", message: "Is the Spa Ceylon voucher valid at the Ward Place boutique?", status: "PENDING", date: "3 weeks ago" }
];

export const initialFavorites: Favorite[] = [
  { email: "nuhman@gmail.com", productId: 1 },
  { email: "nuhman@gmail.com", productId: 5 },
  { email: "nuhman@gmail.com", productId: 10 }
];

export const initialScannerHistory: ScannerHistory[] = [
  { id: 1, email: "nuhman@gmail.com", productName: "Premium Sri Lankan Keeri Samba Rice 5kg", brand: "Keells", category: "Supermarkets & Grocery", confidenceScore: 0.95, description: "Scanned at Keells Supermarket entrance.", date: "21 Jun 2026, 10:15 AM" },
  { id: 2, email: "nuhman@gmail.com", productName: "Samsung Crystal 4K UHD Smart TV 43\"", brand: "Samsung", category: "Electronics", confidenceScore: 0.88, description: "Scanned demo unit at Abans Colombo.", date: "20 Jun 2026, 15:40 PM" }
];

export const initialReviews: Review[] = [
  { id: 1, userEmail: "kamal@gmail.com", userName: "Kamal Perera", productId: 1, rating: 5, comment: "High quality samba rice, delicious and fresh!", date: "Yesterday" },
  { id: 2, userEmail: "priyantha@gmail.com", userName: "Priyantha Kumara", productId: 1, rating: 4, comment: "Good rice, reasonable price with the 20% discount.", date: "2 days ago" },
  { id: 3, userEmail: "nimal@gmail.com", userName: "Nimal Silva", productId: 6, rating: 5, comment: "Iron is very light and heats up quickly. Highly recommended.", date: "3 days ago" }
];

// 9. Generate 20 Categories x 10 Products = 200 Products with Unsplash Images
const CATEGORIES = [
  "Supermarkets & Grocery", "Electronics", "Fashion & Clothing", "Restaurants & Food", "Hotels & Resorts",
  "Real Estate", "Healthcare & Pharmacy", "Vehicles & Auto Parts", "Entertainment", "Education & Training",
  "Kitchen", "Sports & Fitness", "Toys", "Jewelry & Watches", "Construction & Hardware",
  "Office", "Travel & Tourism", "Beauty & Cosmetics", "Telecom", "Insurance"
];

// 50+ Accurate High-Quality Product Images mapped by Category and Index
const UNSPLASH_IMAGES: Record<string, string[]> = {
  "Supermarkets & Grocery": [
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", // Rice
    "https://images.unsplash.com/photo-1581781870027-04212e231e96?auto=format&fit=crop&w=400&q=80", // Sugar
    "https://images.unsplash.com/photo-1547058886-f136c3ec9103?auto=format&fit=crop&w=400&q=80", // Dhal
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80", // Tea bag
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80", // Coffee Jar
    "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=400&q=80", // Chocolate Cocoa Milk
    "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80", // Crackers
    "https://images.unsplash.com/photo-1558961309-dbdf0797375d?auto=format&fit=crop&w=400&q=80", // Marie Biscuits
    "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80", // Leaf Tea pack
    "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=400&q=80"  // Margarine
  ],
  "Electronics": [
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&q=80", // TV
    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80", // Cooker
    "https://images.unsplash.com/photo-1571175432247-fe3709b1f9b3?auto=format&fit=crop&w=400&q=80", // Fridge
    "https://images.unsplash.com/photo-1582730147233-ac8112440fd5?auto=format&fit=crop&w=400&q=80", // Washer
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80", // iPhone 15
    "https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=400&q=80", // Iron
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80", // Cooktop
    "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=400&q=80", // Grinder
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80", // Headphones
    "https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?auto=format&fit=crop&w=400&q=80"  // Laptop
  ],
  "Fashion & Clothing": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80", // Sneakers
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80", // Saree
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80", // Shirt
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80", // Trousers
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80", // Kurti
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80", // Sunglasses
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80", // Jeans
    "https://images.unsplash.com/photo-1627124718515-55220aa473e0?auto=format&fit=crop&w=400&q=80", // Wallet
    "https://images.unsplash.com/photo-1624222247344-550fb805296f?auto=format&fit=crop&w=400&q=80", // Belt
    "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80"  // Socks
  ],
  "Restaurants & Food": [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80", // Pizza
    "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=400&q=80", // Fried Chicken
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80", // Burger
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80", // Devilled Pizza
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80", // Pastries
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80", // Zinger combo
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80", // Kottu
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80", // Rice Bowl
    "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400&q=80", // Garlic Bread
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80"  // Birthday Cake
  ],
  "Hotels & Resorts": [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1529290130-4ca3753253ae?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1560200353-ce0a76b1d438?auto=format&fit=crop&w=400&q=80"
  ],
  "Real Estate": [
    "https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1504151932400-72d425550d2d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1534951009808-766178b47a4f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80"
  ],
  "Healthcare & Pharmacy": [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1607619056574-7b8d304f3c6f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1631549916768-4119b295f846?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1587854692152-cbe660dbbc88?auto=format&fit=crop&w=400&q=80"
  ],
  "Vehicles & Auto Parts": [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80"
  ]
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  "Entertainment": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80",
  "Education & Training": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80",
  "Kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
  "Sports & Fitness": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80",
  "Toys": "https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&w=400&q=80",
  "Jewelry & Watches": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80",
  "Construction & Hardware": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80",
  "Office": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80",
  "Travel & Tourism": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80",
  "Beauty & Cosmetics": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
  "Telecom": "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=400&q=80",
  "Insurance": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80"
};

function generateProducts(): Product[] {
  const list: Product[] = [];
  let idCounter = 1;

  for (const cat of CATEGORIES) {
    for (let i = 1; i <= 10; i++) {
      let name = "";
      let storeName = "";
      let price = 0;
      let originalPrice = 0;
      let discountPercent = Math.floor(10 + Math.random() * 31); // 10..40
      let description = "Premium islandwide quality selected brand in high demand.";
      let specs = "Standard Pack";
      let keywords = cat.toLowerCase();
      let barcode = `841299${idCounter}`;

      switch (cat) {
        case "Supermarkets & Grocery": {
          const stores = ["Keells", "Cargills Food City", "Arpico Super Centre", "Glomark", "Sathosa"];
          storeName = stores[(i - 1) % stores.length];
          const items = [
            "Premium Sri Lankan Keeri Samba Rice 5kg",
            "White Sugar Local Crystal Pack 1kg",
            "Red Mysoor Dhal Grade-A 1kg",
            "Dilmah Premium Ceylon Black Tea 100 Bag Box",
            "Nescafe Classic Coffee Jar 200g",
            "Milo Chocolate Cocoa Drink Carton 400g",
            "Munchee Super Cream Cracker Pack 250g",
            "Maliban Gold Marie Biscuits Trio Pack",
            "Watawala Premium Blend Leaf Tea 400g",
            "Astra Vegetable Table Margarine Pack 250g"
          ];
          name = items[i - 1];
          price = Math.floor(200 + Math.random() * 3301);
          specs = "1 unit pack / weight varies";
          keywords = "rice, sugar, dhal, tea, milo, biscuit, coffee, keells, cargills, groceries, foods";
          break;
        }
        case "Electronics": {
          const stores = ["Singer Sri Lanka", "Abans", "Softlogic", "Damro Electronics", "Metropolitan"];
          storeName = stores[(i - 1) % stores.length];
          const items = [
            "Samsung Crystal 4K UHD Smart TV 43\"",
            "Singer Premium Multi-Cooker 1.8L",
            "Abans Double Door No-Frost Refrigerator 260L",
            "Damro Turbo-Wash Fully Automatic Washing Machine",
            "Apple iPhone 15 Pro Max Local Warranty",
            "Philips Dry Iron Non-Stick Soleplate 1000W",
            "Prestige Induction Cooktop with Touch Panel",
            "Panasonic Heavy Duty Wet & Dry Grinder",
            "Sony Stereo Super-Bass Wireless Headphones",
            "ASUS Vivobook Ryzen 5 Thin Laptop"
          ];
          name = items[i - 1];
          price = Math.floor(1500 + Math.random() * 183501);
          specs = "Includes 1-Year Local Warranty";
          keywords = "tv, cooker, fridge, washing machine, iphone, iron, headphones, laptop, electronics, softlogic, singer";
          break;
        }
        case "Fashion & Clothing": {
          const stores = ["ODEL", "Nolimit", "Fashion Bug", "Cool Planet", "House of Fashions"];
          storeName = stores[(i - 1) % stores.length];
          const items = [
            "Nike Air Max Breathable Sports Sneakers",
            "Pure Ceylon Handspun Silk Georgette Saree",
            "Men's Premium Cotton Formal Button-Down Shirt",
            "Linen Slim-Fit Casual Trousers",
            "Women's Printed Cotton Kurti Tunic",
            "Ray-Ban Polarized Wayfarer Sunglasses",
            "Levi's Original Denim Jeans Comfort Fit",
            "Leather Bi-Fold Wallet with RFID Protection",
            "Genuine Leather Adjustible Dress Belt",
            "Adidas Unisex Cushioned Athletic Socks 3-Pack"
          ];
          name = items[i - 1];
          price = Math.floor(850 + Math.random() * 21151);
          specs = "Pure Cotton / Genuine Materials";
          keywords = "shoes, sneakers, saree, shirt, trousers, sunglasses, wallet, belt, socks, odel, nolimit, fashion, clothing";
          break;
        }
        case "Restaurants & Food": {
          const stores = ["Pizza Hut Sri Lanka", "KFC Sri Lanka", "Burger King Sri Lanka", "Domino's Sri Lanka", "Barista"];
          storeName = stores[(i - 1) % stores.length];
          const items = [
            "Pizza Hut Double Chicken Classic Large Pizza",
            "KFC 8-Piece Hot & Crispy Chicken Family Bucket",
            "Burger King Premium Double Beef Whopper Meal",
            "Spicy Sri Lankan Devilled Pizza Large",
            "P&S Fresh Baked Chicken Pastry Box 6-S",
            "KFC Zinger Burger Combo Meal with Fries & Drink",
            "Traditional Spicy Cheese Kottu Feast Size",
            "KFC Basmati Rice Fiery Chicken Bowl Combo",
            "Pizza Hut Garlic Bread Supreme Platter",
            "Rich Chocolate Ganache Birthday Cake 1kg"
          ];
          name = items[i - 1];
          price = Math.floor(250 + Math.random() * 6251);
          specs = "Freshly Cooked Hot Food";
          keywords = "pizza, chicken, burger, kottu, pastry, cake, kfc, burger king, food, restaurants, dinners";
          break;
        }
        default: {
          storeName = `${cat} Partners`;
          name = `${cat} Grade-A Premium Product ${i}`;
          price = Math.floor(100 + Math.random() * 19901);
          specs = "Premium Quality Standard";
          keywords = `${cat.toLowerCase()}, deal, voucher, item`;
        }
      }

      originalPrice = Math.floor(price / (1 - discountPercent / 100));

      // Get category-specific image or fallback
      let imgUrl = "";
      if (UNSPLASH_IMAGES[cat]) {
        imgUrl = UNSPLASH_IMAGES[cat][(i - 1) % UNSPLASH_IMAGES[cat].length];
      } else {
        const keys = Object.keys(UNSPLASH_IMAGES);
        const randomCategoryKey = keys[idCounter % keys.length];
        const listImages = UNSPLASH_IMAGES[randomCategoryKey];
        imgUrl = listImages[(i - 1) % listImages.length];
        if (CATEGORY_FALLBACKS[cat]) {
          imgUrl = CATEGORY_FALLBACKS[cat];
        }
      }

      list.push({
        id: idCounter++,
        name,
        storeName,
        price,
        originalPrice,
        discountPercent,
        rating: +(4.0 + Math.random() * 1.0).toFixed(1),
        description,
        stockCount: Math.floor(5 + Math.random() * 26), // 5..30
        isApproved: true,
        subcategory: cat,
        features: "Premium islandwide quality guaranteed",
        specifications: specs,
        discountPrice: originalPrice - price,
        sku: `SKU-${cat.substring(0, 3).toUpperCase()}-${1000 + i}`,
        images: imgUrl,
        keywords,
        barcode
      });
    }
  }

  return list;
}

export const initialProducts: Product[] = generateProducts();

