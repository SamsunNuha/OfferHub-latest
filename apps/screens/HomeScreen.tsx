import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, 
  TouchableOpacity, Dimensions, ActivityIndicator,
  RefreshControl, TextInput
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { Heart, Search, Smartphone, ShoppingCart, Sparkles, User, MapPin, Home, Store, Map, Award, Bell } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const IMAGE_ASSETS: Record<string, any> = {
  "Keells": require('../assets/img_groceries_bundle.jpg'),
  "Cargills": require('../assets/img_shopping_banner.jpg'),
  "Singer": require('../assets/img_electronics_promo.jpg'),
  "Softlogic": require('../assets/img_electronics_promo.jpg'),
  "Daraz": require('../assets/img_shopping_banner.jpg'),
  "Fashion Bug": require('../assets/img_beauty_pack.jpg'),
  "Odel": require('../assets/img_shoes_nike.jpg'),
  "Burger King": require('../assets/img_shopping_banner.jpg'),
  "default": require('../assets/img_shopping_banner.jpg')
};

function getProductImage(productOrStore: any): any {
  if (productOrStore && typeof productOrStore === 'object' && productOrStore.images) {
    return { uri: productOrStore.images };
  }
  const storeName = typeof productOrStore === 'string' ? productOrStore : (productOrStore?.storeName || '');
  for (const key of Object.keys(IMAGE_ASSETS)) {
    if (storeName.toLowerCase().includes(key.toLowerCase())) {
      return IMAGE_ASSETS[key];
    }
  }
  return IMAGE_ASSETS.default;
}

export const HomeScreen: React.FC = () => {
  const { 
    isDarkMode, currentUser, offers, brands, products, cart, 
    flashSaleSeconds, flashSaleStock, claimFlashSaleItem, 
    liveAuctions, placeAuctionBid, 
    addToCart, navigateTo, setSelectedProduct, setSelectedOffer, 
    chatLogs, sendChatMessage, aiSearching, bannerNotification, pushLogs 
  } = useAppContext();
  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const { isMobile, gridColumns, contentWidth } = useDimensions();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate network refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Banner image slider auto slide
  const [activeBanner, setActiveBanner] = useState(0);
  const banners = [
    { text: "Lanka Super Savers", desc: "Save up to 40% on groceries!", store: "Keells" },
    { text: "Grand Electronic Fair", desc: "Singer & Abans Special deals", store: "Singer" },
    { text: "Fashion Week Carnivals", desc: "Odel VIP brand selections", store: "Odel" }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Color tokens
  const colors = isDarkMode ? {
    background: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    secondary: '#8E24AA',
    text: '#FFFFFF',
    subText: '#B0A2C9',
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    secondary: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
  };

  const featuredOffers = offers.filter(o => o.isFeatured);
  const promoDeals = offers.filter(o => !o.isFeatured);
  
  // Filter products for AI picks (e.g. premium items)
  const aiPicks = products.slice(0, 10);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
      }
    >
      {/* HOME HEADER */}
      <View style={styles.homeHeader}>
  <TouchableOpacity onPress={() => navigateTo('HOME')}>
    <Image source={require('../assets/logo.png')} style={styles.logoHeader} resizeMode="contain" />
  </TouchableOpacity>
  <View style={styles.homeNav}>
    <TouchableOpacity onPress={() => navigateTo('HOME')} style={styles.navIconBtn}>
      <Home size={20} color={colors.text} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigateTo('MARKETPLACE')} style={styles.navIconBtn}>
      <Store size={20} color={colors.text} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigateTo('MAP')} style={styles.navIconBtn}>
      <Map size={20} color={colors.text} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigateTo('LOYALTY')} style={styles.navIconBtn}>
      <Award size={20} color={colors.text} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigateTo('PROFILE')} style={styles.navIconBtn}>
      <User size={20} color={colors.text} />
    </TouchableOpacity>
  </View>
  {/* Search Bar */}
  <View style={styles.searchContainerHeader}>
    <Search color={colors.subText} size={18} style={{ marginLeft: 8 }} />
    <TextInput
      placeholder="Search offers..."
      placeholderTextColor={colors.subText}
      style={styles.searchInputHeader}
      onChangeText={(text) => {}}
    />
  </View>
  {/* Notification Icon */}
  <TouchableOpacity style={styles.navIconBtn} onPress={() => {}}
    >
    <Bell size={20} color={colors.text} />
  </TouchableOpacity>
  {/* Cart Icon with badge */}
  <TouchableOpacity style={styles.navIconBtn} onPress={() => navigateTo('CART')}>
    <ShoppingCart size={20} color={colors.text} />
    {cartCount > 0 && (
      <View style={styles.cartBadgeHeader}>
        <Text style={styles.cartBadgeTextHeader}>{cartCount}</Text>
      </View>
    )}
  </TouchableOpacity>
</View>
      <View style={[styles.mainContainer, { maxWidth: contentWidth }]}>
        
        {/* WELCOME BLOCK */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={[styles.welcomeSub, { color: colors.subText }]}>Ayubowan! 👋</Text>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              {currentUser ? currentUser.name : "Welcome Guest"}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.districtBadge, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            onPress={() => {}}
          >
            <MapPin size={14} color={colors.primary} />
            <Text style={[styles.districtText, { color: colors.text }]}>
              {currentUser?.district || "Colombo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* HERO BANNER SLIDER */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image 
            source={getProductImage(banners[activeBanner].store)} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={[styles.indicatorPill, { backgroundColor: colors.secondary }]}>
              <Text style={styles.indicatorText}>FEATURED</Text>
            </View>
            <Text style={styles.heroTitle}>{banners[activeBanner].text}</Text>
            <Text style={styles.heroDesc}>{banners[activeBanner].desc}</Text>
            
            <View style={styles.slideIndicators}>
              {banners.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { backgroundColor: i === activeBanner ? colors.primary : 'rgba(255,255,255,0.4)' }
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* REAL-TIME FLASH DEALS */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.row}>
              <Text style={[styles.sectionLabelTitle, { color: colors.primary }]}>⚡ Real-time Flash Deals</Text>
              <View style={[styles.limitBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.limitBadgeText}>LIMITED</Text>
              </View>
            </View>
            <View style={[styles.timerContainer, { borderColor: colors.primary }]}>
              <Text style={[styles.timerText, { color: colors.primary }]}>⏱️ {formatTimer(flashSaleSeconds)}</Text>
            </View>
          </View>
          <Text style={[styles.flashDescText, { color: colors.subText }]}>Claim limited flyer deals using wallet cashback. Express courier dispatched!</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashRow}>
            {[
              { id: 1, name: "Keells Samba Rice 5kg Basket", price: 450.0, emoji: "🌾", maxStock: 3 },
              { id: 2, name: "Singer Heavy Kettle 1.8L", price: 1850.0, emoji: "⚡🔌", maxStock: 5 },
              { id: 3, name: "Cargills Ceylon Tea 400g", price: 620.0, emoji: "🍃🍵", maxStock: 2 }
            ].map(item => {
              const stock = flashSaleStock[item.id] || 0;
              const progress = stock / item.maxStock;
              return (
                <View key={item.id} style={[styles.flashItemBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                  <View style={styles.flashEmojiBox}>
                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                  </View>
                  <Text style={[styles.flashItemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.flashItemPrice, { color: colors.primary }]}>LKR {item.price.toFixed(0)}</Text>
                  
                  {/* Stock Bar */}
                  <View style={styles.stockBarBg}>
                    <View style={[styles.stockBarFill, { width: `${progress * 100}%`, backgroundColor: stock <= 1 ? '#D50000' : colors.primary }]} />
                  </View>
                  <Text style={[styles.stockText, { color: stock <= 1 ? '#D50000' : colors.subText }]}>
                    {stock > 0 ? `Only ${stock} left!` : "SOLD OUT!"}
                  </Text>

                  <TouchableOpacity 
                    style={[styles.flashBuyBtn, { backgroundColor: stock > 0 ? colors.primary : '#444' }]}
                    disabled={stock <= 0}
                    onPress={() => claimFlashSaleItem(item.id, item.name, item.price)}
                  >
                    <Text style={{ color: colors.background, fontSize: 10, fontWeight: 'bold' }}>
                      {stock > 0 ? "Claim Now" : "Sold Out"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* CROWDSOURCED LIVE AUCTIONS */}
        <View style={[styles.sectionCard, { backgroundColor: 'rgba(142,36,170,0.06)', borderColor: '#8E24AA', borderWidth: 1 }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.row}>
              <Text style={styles.auctionHeaderTitle}>🔥 Crowdsourced Live Auctions</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE BID</Text>
              </View>
            </View>
            <Text style={{ fontSize: 10, color: '#C78DFF', fontWeight: 'bold' }}>Sri Lanka VIP</Text>
          </View>
          <Text style={{ fontSize: 10, color: colors.subText, marginBottom: 12 }}>Compete in real-time. LKR -500 deposit per bid. Extend time +20s.</Text>

          <View style={{ gap: 8 }}>
            {liveAuctions.map(item => (
              <View key={item.id} style={[styles.auctionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.auctionIconBox}>
                  <Text style={{ fontSize: 20 }}>{item.iconEmoji}</Text>
                </View>
                
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.auctionItemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={{ color: colors.subText, fontSize: 8 }}>{item.storeName}</Text>
                  
                  <View style={[styles.row, { marginTop: 4 }]}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>Bid: LKR {item.currentBid.toLocaleString()}</Text>
                    <Text style={{ color: colors.subText, fontSize: 9, marginLeft: 8 }}>by {item.highestBidder}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: item.isClosed ? '#D50000' : '#00C853', fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>
                    {item.isClosed ? "CLOSED" : `⏱️ ${item.timeRemainingSecs}s`}
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.bidBtn, { backgroundColor: item.isClosed ? '#444' : colors.secondary }]}
                    disabled={item.isClosed}
                    onPress={() => placeAuctionBid(item.id)}
                  >
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>
                      {item.highestBidder === (currentUser?.name || "username") ? "Holding" : "Bid +1K"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FOLLOWED BRANDS FEED */}
        <View style={styles.feedSection}>
          <Text style={[styles.feedHeaderTitle, { color: colors.text }]}>🏢 Premium Sri Lankan Brands</Text>
          
          {/* Brand Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginVertical: 12, marginHorizontal: 16 }]}>
            <Search color={colors.primary} size={18} style={{ marginLeft: 12 }} />
            <TextInput 
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search brands..."
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
            {brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 15).map(brand => (
              <View key={brand.name} style={[styles.brandItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.brandAvatar, { backgroundColor: colors.surfaceVariant, overflow: 'hidden' }]}>
                  {brand.logo ? (
                    <Image source={{ uri: Array.isArray(brand.logo) ? brand.logo[0] : brand.logo }} style={{ width: '100%', height: '100%' } as any} resizeMode="cover" />
                  ) : (
                    <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>
                      {brand.name.charAt(0)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.brandNameText, { color: colors.text }]} numberOfLines={1}>{brand.name}</Text>
                <Text style={{ color: colors.subText, fontSize: 8, marginBottom: 6 }}>{brand.category}</Text>
                
                <TouchableOpacity 
                  style={[
                    styles.followBtn, 
                    { backgroundColor: brand.isFollowed ? 'transparent' : colors.primary, borderColor: colors.primary, borderWidth: 1 }
                  ]}
                  onPress={() => {}}
                >
                  <Text style={{ color: brand.isFollowed ? colors.primary : colors.background, fontSize: 8, fontWeight: 'bold' }}>
                    {brand.isFollowed ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* AI PICKS FEED */}
        <View style={styles.feedSection}>
          <View style={styles.row}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.feedHeaderTitle, { color: colors.text, marginLeft: 6 }]}>AI Lanka Smart Recommendations</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiRow}>
            {aiPicks.map(p => (
              <TouchableOpacity 
                key={p.id} 
                style={[styles.aiPickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setSelectedProduct(p);
                  navigateTo('DETAIL');
                }}
              >
                <Image source={p.images ? { uri: Array.isArray(p.images) ? p.images[0] : p.images } : getProductImage(p)} style={styles.aiProductImage} />
                <View style={styles.aiPriceBadge}>
                  <Text style={styles.aiPriceBadgeText}>LKR {p.price.toLocaleString()}</Text>
                </View>
                
                <View style={{ padding: 8 }}>
                  <Text style={[styles.aiTitle, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ color: colors.subText, fontSize: 8 }}>{p.storeName}</Text>
                  <View style={[styles.rowBetween, { marginTop: 6 }]}>
                    <Text style={{ color: '#00C853', fontSize: 9, fontWeight: 'bold' }}>{p.discountPercent}% OFF</Text>
                    <TouchableOpacity style={[styles.aiBuyBtn, { backgroundColor: colors.primary }]} onPress={() => addToCart(p)}>
                      <ShoppingCart size={10} color={colors.background} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BEST DEALS GRID */}
        <View style={styles.feedSection}>
          <Text style={[styles.feedHeaderTitle, { color: colors.text }]}>🏷️ Best Local Platform Deals</Text>
          
          <View style={styles.dealsGrid}>
            {promoDeals.slice(0, 6).map(offer => (
              <TouchableOpacity 
                key={offer.id} 
                style={[styles.dealGridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setSelectedOffer(offer);
                  navigateTo('DETAIL');
                }}
              >
                <View style={styles.dealDiscountCircle}>
                  <Text style={styles.dealDiscountText}>{offer.discountPercent}%</Text>
                  <Text style={{ fontSize: 6, color: '#FFF' }}>OFF</Text>
                </View>
                
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={[styles.dealStore, { color: colors.primary }]}>{offer.storeName}</Text>
                  <Text style={[styles.dealTitle, { color: colors.text }]} numberOfLines={2}>{offer.title}</Text>
                  <Text style={{ color: colors.subText, fontSize: 8, marginTop: 4 }}>📅 {offer.validUntil}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ---- Header ----
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  logoHeader: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  homeNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  searchContainerHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.25)',
    height: 36,
    paddingHorizontal: 8,
    gap: 6,
  },
  searchInputHeader: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    outlineStyle: 'none',
  } as any,
  cartBadgeHeader: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#C77DFF',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeTextHeader: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  mainContainer: {
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 16,
  },
  welcomeSub: {
    fontSize: 12,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  districtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  districtText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  heroCard: {
    height: 180,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 14,
  },
  indicatorPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  indicatorText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroDesc: {
    color: '#DDD',
    fontSize: 11,
    marginTop: 2,
  },
  slideIndicators: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabelTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  limitBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  limitBadgeText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: 'bold',
  },
  timerContainer: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
  timerText: {
    fontSize: 10,
    fontWeight: '900',
  },
  flashDescText: {
    fontSize: 9,
    marginBottom: 10,
  },
  flashRow: {
    gap: 8,
    paddingVertical: 4,
  },
  flashItemBox: {
    width: 110,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  flashEmojiBox: {
    width: '100%',
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 6,
  },
  flashItemName: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },
  flashItemPrice: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  stockBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: '#EEE',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
  },
  stockText: {
    fontSize: 7,
    fontWeight: 'bold',
    marginTop: 2,
  },
  flashBuyBtn: {
    width: '100%',
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  auctionHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  liveBadge: {
    backgroundColor: '#4A148C',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  liveBadgeText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: 'bold',
  },
  auctionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  auctionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auctionItemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bidBtn: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  feedHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  brandRow: {
    gap: 8,
    paddingVertical: 4,
  },
  brandItem: {
    width: 90,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  brandAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandNameText: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  followBtn: {
    height: 20,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiRow: {
    gap: 8,
    paddingVertical: 4,
  },
  aiPickCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  aiProductImage: {
    width: '100%',
    height: 70,
  },
  aiPriceBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiPriceBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  aiTitle: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  aiBuyBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBuyBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dealGridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  dealDiscountCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8E24AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealDiscountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  dealStore: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  dealTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 14,
  }
});
export default HomeScreen;
