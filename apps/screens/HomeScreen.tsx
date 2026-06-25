import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Image,
  TouchableOpacity, Dimensions, TextInput, Modal,
  Platform, useWindowDimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../shared/AppContext';
import {
  Home, Tag, Zap, Star, User, Package, Heart, MapPin,
  ShoppingCart, Bell, Search, ChevronRight, Store,
  Settings, Moon, Sun, HelpCircle, MessageSquare,
  Award, Truck, LogIn, X, TrendingUp, Clock,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');

const IMAGE_ASSETS: Record<string, any> = {
  "Keells":       require('../assets/img_groceries_bundle.jpg'),
  "Cargills":     require('../assets/img_shopping_banner.jpg'),
  "Singer":       require('../assets/img_electronics_promo.jpg'),
  "Softlogic":    require('../assets/img_electronics_promo.jpg'),
  "Daraz":        require('../assets/img_shopping_banner.jpg'),
  "Fashion Bug":  require('../assets/img_beauty_pack.jpg'),
  "Odel":         require('../assets/img_shoes_nike.jpg'),
  "Burger King":  require('../assets/img_shopping_banner.jpg'),
  "default":      require('../assets/img_shopping_banner.jpg'),
};

function getImg(key: any): any {
  if (key && key.images) return { uri: key.images };
  const name = typeof key === 'string' ? key : (key?.storeName || '');
  for (const k of Object.keys(IMAGE_ASSETS)) {
    if (name.toLowerCase().includes(k.toLowerCase())) return IMAGE_ASSETS[k];
  }
  return IMAGE_ASSETS.default;
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { id: 'HOME',       label: 'Home',        Icon: Home    },
      { id: 'CATEGORIES', label: 'Categories',  Icon: Tag     },
      { id: 'OFFERS',     label: 'All Offers',  Icon: Award   },
      { id: 'FLASH',      label: 'Flash Deals', Icon: Zap,    badge: 'LIVE' },
      { id: 'NEW',        label: 'New Arrivals',Icon: TrendingUp },
      { id: 'TOPRATED',   label: 'Top Rated',   Icon: Star    },
    ],
  },
  {
    label: 'MY ACCOUNT',
    items: [
      { id: 'PROFILE',    label: 'Profile',     Icon: User    },
      { id: 'ORDERS',     label: 'My Orders',   Icon: Package },
      { id: 'WISHLIST',   label: 'Wishlist',    Icon: Heart   },
      { id: 'REVIEWS',    label: 'My Reviews',  Icon: MessageSquare },
      { id: 'ADDRESSES',  label: 'Addresses',   Icon: MapPin  },
    ],
  },
  {
    label: 'SHOPPING',
    items: [
      { id: 'CART',       label: 'Cart',        Icon: ShoppingCart },
      { id: 'MAP',        label: 'Track Order', Icon: Truck   },
      { id: 'COUPONS',    label: 'Coupons',     Icon: Tag     },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { id: 'HELP',       label: 'Help Center', Icon: HelpCircle   },
      { id: 'CONTACT',    label: 'Contact Us',  Icon: MessageSquare},
      { id: 'FAQ',        label: 'FAQ',         Icon: HelpCircle   },
    ],
  },
];

// ─── Timer helper ─────────────────────────────────────────────────────────────
function fmtTimer(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { h: h.toString().padStart(2, '0'), m: m.toString().padStart(2, '0'), s: sec.toString().padStart(2, '0') };
}

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#FFFFFF', // white background
  sidebar:  '#F6F2FF', // light purple sidebar
  surface:  '#F0E6FF', // light surface for cards
  card:     '#FFFFFF', // white cards
  border:   '#E0D7FF', // subtle border
  accent:   '#A865C9', // primary light purple
  accentSoft:'rgba(168,95,255,0.15)', // soft accent
  live:     '#FF3D57', // keep existing live colour
  warn:     '#FF9800',
  success:  '#00E676',
  text:     '#120024', // dark text for readability
  sub:      '#5A4A7A', // secondary text
  gradient: ['#A865C9', '#BF77F6'] as [string, string],
  gradientHero: ['#A865C9', '#F6F2FF'] as [string, string],
};

// ─── BRAND COLOUR PALETTE ─────────────────────────────────────────────────────
const BRAND_COLORS = [
  '#E53935','#43A047','#1E88E5','#FB8C00','#8E24AA',
  '#00ACC1','#F4511E','#D81B60','#00897B','#3949AB',
];

export const HomeScreen: React.FC = () => {
  const {
    isDarkMode, toggleDarkMode, currentUser, offers, brands, products,
    cart, flashSaleSeconds, flashSaleStock, claimFlashSaleItem,
    liveAuctions, placeAuctionBid, addToCart, navigateTo,
    setSelectedProduct, setSelectedOffer,
    pushLogs, bannerNotification,
  } = useAppContext();

  const { width: WIN_W } = useWindowDimensions();
  const IS_DESKTOP = Platform.OS === 'web' && WIN_W > 900;
  const SIDEBAR_W = 200;

  const [activeScreen, setActiveScreen] = useState('HOME');
  const [activeBanner, setActiveBanner] = useState(0);
  const [searchQ, setSearchQ] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const notifCount = pushLogs?.length ?? 0;

  const banners = [
    { title: 'Fashion Week Carnivals', sub: 'Odel VIP brand selections\nUp to 50% OFF on top brands', store: 'Odel', tag: 'FEATURED' },
    { title: 'Grand Electronic Fair', sub: 'Singer & Abans Special deals\nLKR 5,000 off on TVs & Fridges', store: 'Singer', tag: 'HOT DEAL' },
    { title: 'Lanka Super Savers', sub: 'Save up to 40% on groceries!\nFresh produce every day', store: 'Keells', tag: 'MEGA SALE' },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveBanner(p => (p + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, []);

  const tm = fmtTimer(flashSaleSeconds);
  const featuredOffers = offers.filter(o => o.isFeatured).slice(0, 5);
  const allDeals = offers.slice(0, 6);
  const aiPicks = products.slice(0, 8);
  const brandList = brands.slice(0, 11);

  const handleNav = (id: string) => {
    setActiveScreen(id);
    navigateTo(id);
  };

  const handleAddToCart = (product: any) => {
    if (!currentUser) { navigateTo('AUTH'); return; }
    addToCart(product);
    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 1500);
  };

  // ── SIDEBAR ────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <View style={styles.sidebar}>
      {/* Logo */}
      <TouchableOpacity style={styles.sidebarLogo} onPress={() => handleNav('HOME')}>
        <LinearGradient colors={C.gradient} style={styles.logoIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <ShoppingCart size={16} color="#fff" />
        </LinearGradient>
        <View>
          <Text style={styles.logoTitle}>OfferHub</Text>
          <Text style={styles.logoSub}>Sri Lanka</Text>
        </View>
      </TouchableOpacity>

      {/* Nav */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {NAV_SECTIONS.map((sec, si) => (
          <View key={si} style={{ marginBottom: 8 }}>
            {sec.label && <Text style={styles.navSectionLabel}>{sec.label}</Text>}
            {sec.items.map(item => {
              const active = activeScreen === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => handleNav(item.id)}
                >
                  <item.Icon size={16} color={active ? C.accent : C.sub} />
                  <Text style={[styles.navItemText, { color: active ? C.accent : C.sub }]}>{item.label}</Text>
                  {(item as any).badge && (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>{(item as any).badge}</Text>
                    </View>
                  )}
                  {item.id === 'WISHLIST' && (
                    <View style={styles.countBadge}><Text style={styles.countBadgeText}>12</Text></View>
                  )}
                  {item.id === 'CART' && cartCount > 0 && (
                    <View style={styles.countBadge}><Text style={styles.countBadgeText}>{cartCount}</Text></View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Become Seller CTA */}
        <LinearGradient colors={['#3E1D7A', '#6C3DBE']} style={styles.sellerCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Store size={18} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={styles.sellerCtaTitle}>Become a Seller</Text>
          <Text style={styles.sellerCtaSub}>Grow your business with OfferHub</Text>
          <TouchableOpacity style={styles.sellerCtaBtn} onPress={() => handleNav('MERCHANT')}>
            <Text style={styles.sellerCtaBtnText}>Join Now</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Dark mode toggle */}
        <TouchableOpacity style={styles.darkToggle} onPress={toggleDarkMode}>
          {isDarkMode
            ? <Sun size={15} color={C.accent} />
            : <Moon size={15} color={C.accent} />}
          <Text style={styles.darkToggleText}>Dark Mode</Text>
          <View style={[styles.toggleTrack, isDarkMode && { backgroundColor: C.accent }]}>
            <View style={[styles.toggleThumb, isDarkMode && { alignSelf: 'flex-end' }]} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ── MAIN CONTENT ───────────────────────────────────────────────────────────
  const Content = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero Banner ── */}
      <View style={styles.heroBanner}>
        <Image source={getImg(banners[activeBanner].store)} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(9,5,15,0.9)']} style={StyleSheet.absoluteFill as any} />
        <View style={styles.heroContent}>
          <View style={styles.heroTag}><Text style={styles.heroTagText}>{banners[activeBanner].tag}</Text></View>
          <Text style={styles.heroTitle}>{banners[activeBanner].title}</Text>
          <Text style={styles.heroSub}>{banners[activeBanner].sub}</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => navigateTo('OFFERS')}>
            <Text style={styles.heroBtnText}>Shop Now</Text>
            <ChevronRight size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Slide arrows */}
        <TouchableOpacity style={[styles.slideArrow, { left: 10 }]} onPress={() => setActiveBanner(p => (p - 1 + banners.length) % banners.length)}>
          <Text style={styles.slideArrowText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.slideArrow, { right: 10 }]} onPress={() => setActiveBanner(p => (p + 1) % banners.length)}>
          <Text style={styles.slideArrowText}>›</Text>
        </TouchableOpacity>
        {/* Dots */}
        <View style={styles.dotRow}>
          {banners.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setActiveBanner(i)}>
              <View style={[styles.dot, i === activeBanner && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Flash Deals + Live Auctions Row ── */}
      <View style={[styles.twoCol, IS_DESKTOP && { flexDirection: 'row', gap: 12 }]}>

        {/* Flash Deals */}
        <View style={[styles.sectionCard, IS_DESKTOP && { flex: 1 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.sectionEmoji}>⚡</Text>
              <Text style={styles.sectionTitle}>Real-time Flash Deals</Text>
              <View style={styles.livePill}><Text style={styles.livePillText}>LIVE</Text></View>
            </View>
            <TouchableOpacity onPress={() => navigateTo('FLASH')}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSub}>Claim limited flyer deals using wallet cashback. Express courier dispatched!</Text>

          {/* Countdown */}
          <View style={styles.timerRow}>
            {[{ val: tm.h, label: 'HRS' }, { val: tm.m, label: 'MIN' }, { val: tm.s, label: 'SEC' }].map((t, i) => (
              <React.Fragment key={i}>
                <View style={styles.timerBox}>
                  <Text style={styles.timerNum}>{t.val}</Text>
                  <Text style={styles.timerLabel}>{t.label}</Text>
                </View>
                {i < 2 && <Text style={styles.timerColon}>:</Text>}
              </React.Fragment>
            ))}
          </View>

          {/* Flash items */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {(featuredOffers.length ? featuredOffers : allDeals).map((item: any, idx) => {
              const stock = flashSaleStock[idx + 1] ?? 0;
              return (
                <View key={item.id || idx} style={styles.flashCard}>
                  <Image source={getImg(item)} style={styles.flashImg} resizeMode="cover" />
                  {item.discountPercent && (
                    <View style={styles.discBadge}><Text style={styles.discBadgeText}>{item.discountPercent}%</Text></View>
                  )}
                  <Text style={styles.flashName} numberOfLines={2}>{item.title || item.name}</Text>
                  <Text style={styles.flashStore}>{item.storeName}</Text>
                  <Text style={styles.flashPrice}>LKR {Math.floor(item.originalPrice || item.discountedPrice || 0).toLocaleString()}</Text>
                  <Text style={styles.flashStock}>Only {stock} left!</Text>
                  <TouchableOpacity style={styles.claimBtn} onPress={() => claimFlashSaleItem(idx + 1, item.title || item.name, item.discountedPrice || 0)}>
                    <Text style={styles.claimBtnText}>Claim Now</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Live Auctions */}
        <View style={[styles.sectionCard, IS_DESKTOP && { width: 320 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.sectionEmoji}>🔥</Text>
              <Text style={styles.sectionTitle}>Live Auctions</Text>
              <View style={[styles.livePill, { backgroundColor: '#FF3D57' }]}><Text style={styles.livePillText}>LIVE</Text></View>
            </View>
            <TouchableOpacity onPress={() => navigateTo('AUCTIONS')}>
              <Text style={styles.viewAll}>View All Auctions →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSub}>Compete in real-time. LKR -500 deposit per bid. Extend time +20s.</Text>

          {liveAuctions.map(a => (
            <View key={a.id} style={styles.auctionRow}>
              <Image source={getImg(a.storeName)} style={styles.auctionImg} resizeMode="cover" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.auctionTitle} numberOfLines={1}>{a.title}</Text>
                <Text style={styles.auctionBidder} numberOfLines={1}>by {a.highestBidder}</Text>
                <Text style={styles.auctionLabel}>Current Bid</Text>
                <Text style={styles.auctionBid}>LKR {Math.floor(a.currentBid).toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={[styles.bidBtn, a.isClosed && { backgroundColor: '#444' }]}
                onPress={() => !a.isClosed && placeAuctionBid(a.id)}
              >
                <Text style={styles.bidBtnText}>{a.isClosed ? 'CLOSED' : 'Bid +1K'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* ── Premium Brands ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.sectionEmoji}>🏆</Text>
            <Text style={styles.sectionTitle}>Premium Sri Lankan Brands</Text>
          </View>
          <TouchableOpacity onPress={() => navigateTo('BRANDS')}>
            <Text style={styles.viewAll}>View All Brands →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {(brandList.length > 0 ? brandList : [
            { id: 1, name: 'Abans', category: 'Electronics' },
            { id: 2, name: 'Keells', category: 'Supermarkets' },
            { id: 3, name: 'Cargills', category: 'Supermarkets' },
            { id: 4, name: 'Odel', category: 'Fashion' },
            { id: 5, name: 'Singer', category: 'Electronics' },
            { id: 6, name: 'Daraz', category: 'Online Store' },
            { id: 7, name: 'Bata', category: 'Footwear' },
          ]).map((brand: any, idx) => (
            <TouchableOpacity key={brand.id} style={styles.brandPill} onPress={() => navigateTo('BRANDS')}>
              <View style={[styles.brandIcon, { backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }]}>
                <Text style={styles.brandInitial}>{(brand.name || 'B')[0]}</Text>
              </View>
              <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
              <Text style={styles.brandCat} numberOfLines={1}>{brand.category}</Text>
              <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.followBtnText}>Follow</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── AI Smart Recommendations ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.sectionEmoji}>🤖</Text>
            <Text style={styles.sectionTitle}>AI Lanka Smart Recommendations</Text>
          </View>
          <TouchableOpacity onPress={() => navigateTo('PRODUCTS')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {aiPicks.map((p: any) => {
            const added = addedIds.has(p.id);
            return (
              <TouchableOpacity key={p.id} style={styles.productCard} onPress={() => { setSelectedProduct(p); navigateTo('PRODUCT_DETAIL'); }}>
                <Image source={getImg(p)} style={styles.productImg} resizeMode="cover" />
                {p.discountPercent && (
                  <View style={[styles.discBadge, { top: 6, left: 6 }]}><Text style={styles.discBadgeText}>{p.discountPercent}%</Text></View>
                )}
                <TouchableOpacity style={styles.wishBtn}><Heart size={13} color={C.sub} /></TouchableOpacity>
                <View style={{ padding: 8 }}>
                  <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                  <Text style={styles.productStore}>{p.storeName}</Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>LKR {Math.floor(p.price || 0).toLocaleString()}</Text>
                    {p.originalPrice && <Text style={styles.productOld}>LKR {Math.floor(p.originalPrice).toLocaleString()}</Text>}
                  </View>
                  <TouchableOpacity style={[styles.cartBtn, added && { backgroundColor: C.success }]} onPress={() => handleAddToCart(p)}>
                    <ShoppingCart size={12} color="#fff" />
                    <Text style={styles.cartBtnText}>{added ? 'Added!' : 'Add'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Best Platform Deals ── */}
      <View style={[styles.sectionCard, { marginBottom: 30 }]}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.sectionEmoji}>🎯</Text>
            <Text style={styles.sectionTitle}>Best Local Platform Deals</Text>
          </View>
          <TouchableOpacity onPress={() => navigateTo('OFFERS')}>
            <Text style={styles.viewAll}>View All Deals →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {allDeals.map((deal: any, idx) => (
            <TouchableOpacity
              key={deal.id || idx}
              style={styles.dealCard}
              onPress={() => { setSelectedOffer(deal); navigateTo('OFFER_DETAIL'); }}
            >
              <LinearGradient colors={[BRAND_COLORS[idx % BRAND_COLORS.length] + 'AA', C.card]} style={styles.dealHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {deal.discountPercent && (
                  <Text style={styles.dealDiscount}>{deal.discountPercent}% OFF</Text>
                )}
              </LinearGradient>
              <View style={{ padding: 10 }}>
                <Text style={styles.dealStore} numberOfLines={1}>{deal.storeName}</Text>
                <Text style={styles.dealTitle} numberOfLines={3}>{deal.title || deal.name}</Text>
                {deal.expiryDate && (
                  <Text style={styles.dealExpiry}>Valid till {deal.expiryDate}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

    </ScrollView>
  );

  return (
    <View style={styles.root}>
      {/* ── TOP NAVBAR ── */}
      <View style={styles.navbar}>
        {/* Left: location */}
        <TouchableOpacity style={styles.locationPill}>
          <MapPin size={12} color={C.accent} />
          <Text style={styles.locationText}>{currentUser?.district || 'Colombo, Sri Lanka'}</Text>
          <Text style={{ color: C.sub, fontSize: 10 }}>▾</Text>
        </TouchableOpacity>

        {/* Centre: search */}
        <View style={styles.searchBar}>
          <Search size={14} color={C.sub} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, offers..."
            placeholderTextColor={C.sub}
            value={searchQ}
            onChangeText={setSearchQ}
          />
        </View>

        {/* Right: icons */}
        <View style={styles.navRight}>
          {/* Cart */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => currentUser ? navigateTo('CART') : navigateTo('AUTH')}>
            <ShoppingCart size={18} color={C.text} />
            {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text></View>}
          </TouchableOpacity>

          {/* Bell */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => setNotifOpen(true)}>
            <Bell size={18} color={C.text} />
            {notifCount > 0 && <View style={[styles.badge, { backgroundColor: C.live }]}><Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text></View>}
          </TouchableOpacity>

          {/* Avatar */}
          {currentUser ? (
            <TouchableOpacity style={styles.avatar} onPress={() => navigateTo('PROFILE')}>
              <Text style={styles.avatarText}>{currentUser.name?.[0]?.toUpperCase() || 'U'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.signInBtn} onPress={() => navigateTo('AUTH')}>
              <LogIn size={13} color={C.accent} />
              <Text style={styles.signInText}>Sign In / Register</Text>
            </TouchableOpacity>
          )}
          {currentUser && (
            <View>
              <Text style={styles.hiText}>Hi, {currentUser.name?.split(' ')[0] || 'Guest'}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── BODY (sidebar + content) ── */}
      <View style={styles.body}>
        <Sidebar />
        <Content />
      </View>

      {/* ── Notification Modal ── */}
      <Modal visible={notifOpen} transparent animationType="fade" onRequestClose={() => setNotifOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setNotifOpen(false)}>
          <View style={styles.notifModal}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifOpen(false)}><X size={18} color={C.sub} /></TouchableOpacity>
            </View>
            <ScrollView>
              {(pushLogs || []).map((log, i) => (
                <View key={i} style={styles.notifItem}>
                  <Bell size={13} color={C.accent} style={{ marginRight: 8 }} />
                  <Text style={styles.notifText}>{log}</Text>
                </View>
              ))}
              {(!pushLogs || pushLogs.length === 0) && (
                <Text style={styles.notifEmpty}>No notifications yet</Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeScreen;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },

  // Navbar
  navbar:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.sidebar, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10, zIndex: 10 },
  locationPill:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  locationText:     { color: C.text, fontSize: 11, fontWeight: '600' },
  searchBar:        { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 8, paddingHorizontal: 12, height: 36, borderWidth: 1, borderColor: C.border, gap: 8 },
  searchInput:      { flex: 1, color: C.text, fontSize: 13 },
  navRight:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:          { position: 'relative', width: 34, height: 34, borderRadius: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  badge:            { position: 'absolute', top: -4, right: -4, backgroundColor: C.accent, borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  badgeText:        { color: '#fff', fontSize: 9, fontWeight: '800' },
  avatar:           { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText:       { color: '#fff', fontWeight: '800', fontSize: 14 },
  signInBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  signInText:       { color: C.accent, fontSize: 11, fontWeight: '700' },
  hiText:           { color: C.sub, fontSize: 11 },

  // Body
  body:             { flex: 1, flexDirection: 'row' },

  // Sidebar
  sidebar:          { width: 200, backgroundColor: C.sidebar, borderRightWidth: 1, borderRightColor: C.border, paddingTop: 10 },
  sidebarLogo:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6 },
  logoIcon:         { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoTitle:        { color: C.text, fontWeight: '900', fontSize: 15 },
  logoSub:          { color: C.accent, fontSize: 10, fontWeight: '700' },
  navSectionLabel:  { color: C.sub, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 14, marginBottom: 4, paddingHorizontal: 14 },
  navItem:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9 },
  navItemActive:    { backgroundColor: C.accentSoft, borderRightWidth: 2, borderRightColor: C.accent },
  navItemText:      { fontSize: 13, fontWeight: '600' },
  liveBadge:        { marginLeft: 'auto' as any, backgroundColor: C.live, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  liveBadgeText:    { color: '#fff', fontSize: 9, fontWeight: '800' },
  countBadge:       { marginLeft: 'auto' as any, backgroundColor: C.accent, borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  countBadgeText:   { color: '#fff', fontSize: 10, fontWeight: '800' },
  sellerCta:        { margin: 10, borderRadius: 12, padding: 14, marginTop: 16 },
  sellerCtaTitle:   { color: '#fff', fontWeight: '800', fontSize: 13 },
  sellerCtaSub:     { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2, marginBottom: 10 },
  sellerCtaBtn:     { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  sellerCtaBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  darkToggle:       { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 },
  darkToggleText:   { color: C.sub, fontSize: 12, flex: 1 },
  toggleTrack:      { width: 32, height: 18, borderRadius: 9, backgroundColor: C.card, padding: 2 },
  toggleThumb:      { width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff' },

  // Content area
  content:          { flex: 1, backgroundColor: C.bg },

  // Hero Banner
  heroBanner:       { height: 240, margin: 12, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  heroContent:      { position: 'absolute', bottom: 24, left: 24, right: 80 },
  heroTag:          { backgroundColor: 'rgba(168,95,255,0.9)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  heroTagText:      { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle:        { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 26 },
  heroSub:          { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4, lineHeight: 16 },
  heroBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 12 },
  heroBtnText:      { color: '#fff', fontWeight: '700', fontSize: 12 },
  slideArrow:       { position: 'absolute', top: '50%' as any, marginTop: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  slideArrowText:   { color: '#fff', fontSize: 22, lineHeight: 26 },
  dotRow:           { position: 'absolute', bottom: 10, right: 16, flexDirection: 'row', gap: 5 },
  dot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive:        { backgroundColor: C.accent, width: 18 },

  // Section cards
  twoCol:           { marginHorizontal: 12, gap: 12 },
  sectionCard:      { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginHorizontal: 12, marginTop: 12 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionEmoji:     { fontSize: 16 },
  sectionTitle:     { color: C.text, fontWeight: '800', fontSize: 14 },
  sectionSub:       { color: C.sub, fontSize: 11, marginTop: 4 },
  viewAll:          { color: C.accent, fontSize: 11, fontWeight: '700' },
  livePill:         { backgroundColor: C.live, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  livePillText:     { color: '#fff', fontSize: 9, fontWeight: '800' },

  // Timer
  timerRow:         { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  timerBox:         { backgroundColor: C.card, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  timerNum:         { color: C.accent, fontSize: 20, fontWeight: '900', lineHeight: 24 },
  timerLabel:       { color: C.sub, fontSize: 9, letterSpacing: 1 },
  timerColon:       { color: C.accent, fontSize: 22, fontWeight: '900' },

  // Flash cards
  flashCard:        { width: 130, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, marginRight: 10, overflow: 'hidden' },
  flashImg:         { width: '100%' as any, height: 80 },
  flashName:        { color: C.text, fontSize: 11, fontWeight: '700', marginTop: 6, marginHorizontal: 8, lineHeight: 14 },
  flashStore:       { color: C.sub, fontSize: 9, marginHorizontal: 8, marginTop: 2 },
  flashPrice:       { color: C.accent, fontSize: 13, fontWeight: '800', marginHorizontal: 8, marginTop: 4 },
  flashStock:       { color: C.warn, fontSize: 10, marginHorizontal: 8, marginTop: 2 },
  claimBtn:         { backgroundColor: C.accent, margin: 8, borderRadius: 6, paddingVertical: 6, alignItems: 'center' },
  claimBtnText:     { color: '#fff', fontSize: 11, fontWeight: '700' },
  discBadge:        { position: 'absolute', top: 4, right: 4, backgroundColor: C.live, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  discBadgeText:    { color: '#fff', fontSize: 9, fontWeight: '800' },

  // Auctions
  auctionRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 10, marginTop: 10 },
  auctionImg:       { width: 54, height: 54, borderRadius: 8 },
  auctionTitle:     { color: C.text, fontWeight: '700', fontSize: 12 },
  auctionBidder:    { color: C.sub, fontSize: 10, marginTop: 2 },
  auctionLabel:     { color: C.sub, fontSize: 9, marginTop: 4 },
  auctionBid:       { color: C.accent, fontWeight: '800', fontSize: 14 },
  bidBtn:           { backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  bidBtnText:       { color: '#fff', fontSize: 11, fontWeight: '800' },

  // Brands
  brandPill:        { width: 90, alignItems: 'center', marginRight: 12, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 12 },
  brandIcon:        { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  brandInitial:     { color: '#fff', fontWeight: '900', fontSize: 16 },
  brandName:        { color: C.text, fontSize: 11, fontWeight: '700', marginBottom: 2 },
  brandCat:         { color: C.sub, fontSize: 9, marginBottom: 8 },
  followBtn:        { backgroundColor: C.accentSoft, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  followBtnText:    { color: C.accent, fontSize: 10, fontWeight: '700' },

  // AI Products
  productCard:      { width: 150, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, marginRight: 10, overflow: 'hidden' },
  productImg:       { width: '100%' as any, height: 110 },
  productName:      { color: C.text, fontSize: 11, fontWeight: '700', lineHeight: 14 },
  productStore:     { color: C.sub, fontSize: 9, marginTop: 2 },
  productPriceRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  productPrice:     { color: C.accent, fontWeight: '800', fontSize: 13 },
  productOld:       { color: C.sub, fontSize: 10, textDecorationLine: 'line-through' },
  cartBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accent, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 8, marginTop: 6, alignSelf: 'flex-start' as any },
  cartBtnText:      { color: '#fff', fontSize: 10, fontWeight: '700' },
  wishBtn:          { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },

  // Deals
  dealCard:         { width: 160, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, marginRight: 10, overflow: 'hidden' },
  dealHeader:       { height: 60, justifyContent: 'flex-end', padding: 8 },
  dealDiscount:     { color: '#fff', fontWeight: '900', fontSize: 18 },
  dealStore:        { color: C.accent, fontSize: 10, fontWeight: '700' },
  dealTitle:        { color: C.text, fontSize: 11, fontWeight: '600', marginTop: 4, lineHeight: 15 },
  dealExpiry:       { color: C.sub, fontSize: 9, marginTop: 6 },

  // Notif modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', alignItems: 'flex-end', paddingTop: 50, paddingRight: 10 },
  notifModal:       { width: 300, maxHeight: 400, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  notifHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  notifTitle:       { color: C.text, fontWeight: '800', fontSize: 14 },
  notifItem:        { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  notifText:        { color: C.sub, fontSize: 12, flex: 1, lineHeight: 16 },
  notifEmpty:       { color: C.sub, fontSize: 12, textAlign: 'center', padding: 20 },
});
