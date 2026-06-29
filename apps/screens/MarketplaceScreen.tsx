import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, 
  TouchableOpacity, Image, FlatList, Modal, Alert
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { BRAND_LOGOS } from '../shared/brandLogos';
import { getProductNameKey } from '../shared/localization';
import { Star, ShoppingCart, Search, Check, Plus, MapPin, Globe, Mail, Phone, Award } from 'lucide-react-native';

const IMAGE_ASSETS: Record<string, any> = {
  "Keells": require('../assets/img_groceries_bundle.jpg'),
  "Cargills": require('../assets/img_shopping_banner.jpg'),
  "Singer": require('../assets/img_electronics_promo.jpg'),
  "Softlogic": require('../assets/img_electronics_promo.jpg'),
  "Daraz": require('../assets/img_shopping_banner.jpg'),
  "Fashion Bug": require('../assets/img_beauty_pack.jpg'),
  "Odel": require('../assets/img_shoes_nike.jpg'),
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

const BrandLogoImage: React.FC<{ logoUrl?: string; brandName: string; primaryColor: string }> = ({ logoUrl, brandName, primaryColor }) => {
  const [hasError, setHasError] = useState(false);

  // 1. Check local assets first
  const localLogo = BRAND_LOGOS[brandName];
  if (localLogo) {
    return (
      <Image 
        source={localLogo} 
        style={styles.brandLogoImage} 
        resizeMode="cover" 
      />
    );
  }

  // 2. Fall back to network logo
  if (logoUrl && !hasError) {
    return (
      <Image 
        source={{ uri: logoUrl }} 
        style={styles.brandLogoImage} 
        resizeMode="cover" 
        onError={() => setHasError(true)} 
      />
    );
  }

  // 3. Fall back to initials
  return (
    <View style={[styles.brandInitials, { backgroundColor: primaryColor }]}>
      <Text style={styles.brandInitialsText}>{brandName[0].toUpperCase()}</Text>
    </View>
  );
};

export const MarketplaceScreen: React.FC = () => {
  const { 
    isDarkMode, products, addToCart, navigateTo, 
    setSelectedProduct, currentUser, brands, addBrand, 
    toggleFollowBrand, currentScreen, setRegisterRole, t
  } = useAppContext();

  const { gridColumns, contentWidth, padding } = useDimensions();
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleAddToCart = (item: any) => {
    // Must be signed in — if not, redirect to auth
    if (!currentUser) {
      navigateTo('AUTH');
      return;
    }
    addToCart(item);
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };

  const categories = [
    "ALL", "Supermarkets", "Electronics", "Fashion", "Restaurants", "Hotels",
    "Banks", "Pharmacy", "Automobile", "Entertainment", "Education"
  ];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCat === 'ALL' || p.subcategory === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.keywords.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && p.isApproved;
  });

  // ─── BRAND STATES & HANDLERS ───────────────────────────────────────────
  const [brandSearch, setBrandSearch] = useState('');
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  
  // Brand form states
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCat, setNewBrandCat] = useState('Supermarkets & Grocery');
  const [newBrandAddress, setNewBrandAddress] = useState('');
  const [newBrandPhone, setNewBrandPhone] = useState('');
  const [newBrandEmail, setNewBrandEmail] = useState('');
  const [newBrandWeb, setNewBrandWeb] = useState('');
  const [newBrandBrn, setNewBrandBrn] = useState('');
  const [newBrandDistrict, setNewBrandDistrict] = useState('Colombo');

  const filteredBrands = (brands || []).filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(brandSearch.toLowerCase()) || 
                          b.category.toLowerCase().includes(brandSearch.toLowerCase()) ||
                          b.district.toLowerCase().includes(brandSearch.toLowerCase());
    const matchesCategory = selectedCat === 'ALL' || b.category.toLowerCase().includes(selectedCat.toLowerCase()) || selectedCat.toLowerCase().includes(b.category.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleAddBrandPress = () => {
    if (!currentUser) {
      setRegisterRole('MERCHANT');
      navigateTo('REGISTER');
      return;
    }
    if (currentUser.role !== 'MERCHANT' && currentUser.role !== 'ADMIN') {
      Alert.alert(
        "Become a Seller",
        "Only verified merchants can add new brands. Would you like to create a Merchant account?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Register as Merchant", onPress: () => {
              setRegisterRole('MERCHANT');
              navigateTo('REGISTER');
            }
          }
        ]
      );
      return;
    }
    setShowAddBrandModal(true);
  };

  const handleSaveBrand = async () => {
    if (!newBrandName || !newBrandBrn || !newBrandEmail) {
      Alert.alert("Required Fields", "Please fill in Brand Name, Business Registration Number, and Email.");
      return;
    }

    const newBrand = {
      name: newBrandName,
      category: newBrandCat,
      rating: 5.0,
      followerCount: 1,
      isFollowed: true,
      businessRegistrationNumber: newBrandBrn,
      address: newBrandAddress || "Sri Lanka",
      email: newBrandEmail,
      contactNo: newBrandPhone || "+94 11 123 4567",
      website: newBrandWeb || "www.offerhub.lk",
      subscriptionPlan: "Basic",
      isSuspended: false,
      district: newBrandDistrict,
      verified: true,
      logo: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&q=80"
    };

    await addBrand(newBrand);
    setShowAddBrandModal(false);
    // Clear form
    setNewBrandName('');
    setNewBrandAddress('');
    setNewBrandPhone('');
    setNewBrandEmail('');
    setNewBrandWeb('');
    setNewBrandBrn('');
  };

  // Color mappings
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.mainLayout, { maxWidth: contentWidth, paddingHorizontal: padding }]}>
        
        {currentScreen === 'BRANDS' ? (
          <>
            {/* SEARCH BAR & ADD BRAND ROW */}
            <View style={styles.topActionRow}>
              <View style={[styles.searchWrapper, { flex: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 0 }]}>
                <Search size={18} color={colors.subText} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search brands, categories, districts..."
                  placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                  value={brandSearch}
                  onChangeText={setBrandSearch}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.addBrandBtn, { backgroundColor: colors.primary }]} 
                onPress={handleAddBrandPress}
              >
                <Plus size={16} color={isDarkMode ? '#000' : '#FFF'} />
                <Text style={[styles.addBrandBtnText, { color: isDarkMode ? '#000' : '#FFF' }]}>Add Brand</Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORY CHIPS */}
            <View style={{ height: 40, marginVertical: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      { backgroundColor: selectedCat === cat ? colors.primary : colors.surface, borderColor: colors.border }
                    ]}
                    onPress={() => setSelectedCat(cat)}
                  >
                    <Text style={[
                      styles.catChipText,
                      { color: selectedCat === cat ? colors.background : colors.text, fontWeight: selectedCat === cat ? 'bold' : 'normal' }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* BRANDS GRID */}
            {filteredBrands.length === 0 ? (
              <View style={styles.center}>
                <Text style={{ color: colors.subText, fontSize: 13 }}>No brands found matching your filters.</Text>
              </View>
            ) : (
              <FlatList
                data={filteredBrands}
                key={gridColumns} // force rebuild when columns count changes
                numColumns={gridColumns}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                contentContainerStyle={{ paddingBottom: 60 }}
                columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.brandCard,
                      { 
                        backgroundColor: colors.surface, 
                        borderColor: colors.border, 
                        width: gridColumns === 1 ? '100%' : `${100 / gridColumns - 2}%`,
                        marginHorizontal: gridColumns > 1 ? '1%' : 0
                      }
                    ]}
                  >
                    {/* Brand Banner / Accent Header */}
                    <View style={[styles.brandBanner, { backgroundColor: colors.surfaceVariant }]} />
                    
                    <View style={styles.brandCardBody}>
                      {/* Logo or initials */}
                      <View style={[styles.logoContainer, { borderColor: colors.border }]}>
                        <BrandLogoImage logoUrl={item.logo} brandName={item.name} primaryColor={colors.primary} />
                      </View>

                      {/* Brand Info */}
                      <View style={styles.brandMeta}>
                        <View style={styles.row}>
                          <Text style={[styles.brandNameText, { color: colors.text }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {item.verified && (
                            <View style={styles.verifiedBadge}>
                              <Award size={10} color="#FFD700" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.brandCatText, { color: colors.subText }]} numberOfLines={1}>
                          {item.category} • {item.district}
                        </Text>
                        
                        {/* Rating */}
                        <View style={[styles.row, { marginVertical: 4 }]}>
                          <Star size={10} color="#FFD700" fill="#FFD700" />
                          <Text style={{ color: colors.subText, fontSize: 10, marginLeft: 4 }}>{item.rating}</Text>
                          <Text style={{ color: colors.subText, fontSize: 10, marginLeft: 8 }}>({item.followerCount.toLocaleString()} followers)</Text>
                        </View>

                        {/* Detailed location & website info */}
                        <View style={styles.brandDetailsBlock}>
                          <View style={styles.rowDetail}>
                            <MapPin size={10} color={colors.primary} />
                            <Text style={[styles.detailText, { color: colors.subText }]} numberOfLines={1}>{item.address}</Text>
                          </View>
                          {item.website && (
                            <View style={styles.rowDetail}>
                              <Globe size={10} color={colors.primary} />
                              <Text style={[styles.detailText, { color: colors.subText }]} numberOfLines={1}>{item.website}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Follow Button */}
                      <TouchableOpacity 
                        style={[
                          styles.followBtn, 
                          item.isFollowed 
                            ? { backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 } 
                            : { backgroundColor: colors.primary }
                        ]}
                        onPress={() => toggleFollowBrand(item.name)}
                      >
                        <Text 
                          style={[
                            styles.followBtnText, 
                            item.isFollowed 
                              ? { color: colors.text } 
                              : { color: colors.background, fontWeight: 'bold' }
                          ]}
                        >
                          {item.isFollowed ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </>
        ) : (
          <>
            {/* SEARCH BAR */}
            <View style={[styles.searchWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Search size={18} color={colors.subText} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search products, stores, keywords..."
                placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* CATEGORY CHIPS */}
            <View style={{ height: 40, marginBottom: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      { backgroundColor: selectedCat === cat ? colors.primary : colors.surface, borderColor: colors.border }
                    ]}
                    onPress={() => setSelectedCat(cat)}
                  >
                    <Text style={[
                      styles.catChipText,
                      { color: selectedCat === cat ? colors.background : colors.text, fontWeight: selectedCat === cat ? 'bold' : 'normal' }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* PRODUCTS GRID */}
            {filteredProducts.length === 0 ? (
              <View style={styles.center}>
                <Text style={{ color: colors.subText, fontSize: 13 }}>No items found matching your filters.</Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                key={gridColumns} // force layout rebuild when columns count changes
                numColumns={gridColumns}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ paddingBottom: 60 }}
                columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.productCard,
                      { 
                        backgroundColor: colors.surface, 
                        borderColor: colors.border, 
                        width: gridColumns === 1 ? '100%' : `${100 / gridColumns - 2}%`,
                        marginHorizontal: gridColumns > 1 ? '1%' : 0
                      }
                    ]}
                    onPress={() => {
                      setSelectedProduct(item);
                      navigateTo('DETAIL');
                    }}
                  >
                    <Image source={getProductImage(item)} style={styles.productImage} resizeMode="cover" />
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={[styles.storeLabel, { color: colors.primary }]} numberOfLines={1}>{item.storeName}</Text>
                                             <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{t(getProductNameKey(item.id)) || item.name}</Text>
                      
                      {/* Rating */}
                      <View style={[styles.row, { marginVertical: 4 }]}>
                        <Star size={10} color="#FFD700" fill="#FFD700" />
                        <Text style={{ color: colors.subText, fontSize: 9, marginLeft: 4 }}>{item.rating}</Text>
                      </View>

                      <View style={[styles.rowBetween, { marginTop: 6 }]}>
                        <View>
                          <Text style={[styles.priceText, { color: colors.text }]}>LKR {item.price.toLocaleString()}</Text>
                          <Text style={styles.origPriceText}>LKR {item.originalPrice.toLocaleString()}</Text>
                        </View>
                        
                        <TouchableOpacity 
                          style={[
                            styles.cartAddBtn,
                            { backgroundColor: addedIds.has(item.id) ? '#00C853' : colors.primary }
                          ]}
                          onPress={() => handleAddToCart(item)}
                        >
                          {addedIds.has(item.id)
                            ? <Check size={14} color="#FFF" strokeWidth={3} />
                            : <ShoppingCart size={14} color={colors.background} />
                          }
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}

      </View>

      {/* ─── ADD BRAND MODAL ─── */}
      <Modal visible={showAddBrandModal} transparent animationType="slide" onRequestClose={() => setShowAddBrandModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Register Your Brand</Text>
              <TouchableOpacity onPress={() => setShowAddBrandModal(false)}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Brand Name *</Text>
              <TextInput 
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
                placeholder="Enter Brand name (e.g. ODEL)" 
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={newBrandName} 
                onChangeText={setNewBrandName} 
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Business Registration Number (BRN) *</Text>
              <TextInput 
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
                placeholder="Enter BRN (e.g. BRN-ODEL-1)" 
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={newBrandBrn} 
                onChangeText={setNewBrandBrn} 
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Category *</Text>
              <View style={[styles.dropdownWrapper, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 4 }}>
                  {categories.filter(c => c !== 'ALL').map(cat => (
                    <TouchableOpacity 
                      key={cat}
                      style={[styles.catSelectionChip, newBrandCat === cat && { backgroundColor: colors.primary }]}
                      onPress={() => setNewBrandCat(cat)}
                    >
                      <Text style={[styles.catSelectionChipText, { color: newBrandCat === cat ? colors.background : colors.text }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>District *</Text>
              <View style={[styles.dropdownWrapper, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 4 }}>
                  {["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Galle", "Matara", "Kurunegala", "Jaffna"].map(dist => (
                    <TouchableOpacity 
                      key={dist}
                      style={[styles.catSelectionChip, newBrandDistrict === dist && { backgroundColor: colors.primary }]}
                      onPress={() => setNewBrandDistrict(dist)}
                    >
                      <Text style={[styles.catSelectionChipText, { color: newBrandDistrict === dist ? colors.background : colors.text }]}>
                        {dist}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Corporate Address</Text>
              <TextInput 
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
                placeholder="Enter corporate head office address" 
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={newBrandAddress} 
                onChangeText={setNewBrandAddress} 
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Phone</Text>
              <TextInput 
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
                placeholder="Enter contact number (e.g. +94 11 234 5678)" 
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={newBrandPhone} 
                onChangeText={setNewBrandPhone} 
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address *</Text>
              <TextInput 
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
                placeholder="Enter contact email address" 
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={newBrandEmail} 
                onChangeText={setNewBrandEmail} 
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Website URL</Text>
              <TextInput 
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
                placeholder="Enter official website (e.g. www.brand.lk)" 
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={newBrandWeb} 
                onChangeText={setNewBrandWeb} 
                autoCapitalize="none"
              />

              <TouchableOpacity style={[styles.submitBrandBtn, { backgroundColor: colors.primary }]} onPress={handleSaveBrand}>
                <Text style={[styles.submitBrandBtnText, { color: colors.background }]}>Register Brand</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 16,
  },
  catChip: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catChipText: {
    fontSize: 11,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  productCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 110,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#D50000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 10,
  },
  storeLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
    height: 32,
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
  priceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  origPriceText: {
    fontSize: 9,
    color: '#888',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  cartAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  addBrandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  addBrandBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  brandCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  brandBanner: {
    height: 60,
    width: '100%',
  },
  brandCardBody: {
    padding: 12,
    paddingTop: 0,
    alignItems: 'center',
    marginTop: -30,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogoImage: {
    width: '100%',
    height: '100%',
  },
  brandInitials: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInitialsText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandMeta: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  brandNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 4,
  },
  verifiedBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandCatText: {
    fontSize: 11,
    marginTop: 2,
  },
  brandDetailsBlock: {
    width: '100%',
    marginTop: 8,
    gap: 4,
    paddingHorizontal: 10,
  },
  rowDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 10,
    flex: 1,
  },
  followBtn: {
    width: '90%',
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followBtnText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formScroll: {
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 8,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
  },
  catSelectionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
  },
  catSelectionChipText: {
    fontSize: 11,
  },
  submitBrandBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitBrandBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});
export default MarketplaceScreen;
