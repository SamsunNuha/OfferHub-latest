import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, 
  TouchableOpacity, Dimensions 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { ArrowLeft, Star, ShoppingCart, Heart, ShieldCheck, Check } from 'lucide-react-native';

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

export const DetailScreen: React.FC = () => {
  const { 
    isDarkMode, selectedProduct, selectedOffer, 
    addToCart, navigateTo, toggleFavorite, isFavorite, products, setSelectedProduct, currentUser
  } = useAppContext();

  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    // Must be signed in — if not, redirect to auth
    if (!currentUser) {
      navigateTo('AUTH');
      return;
    }
    addToCart(selectedProduct);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Color mapping
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

  const isOffer = !!selectedOffer && !selectedProduct;
  const title = isOffer ? selectedOffer?.title : selectedProduct?.name;
  const storeName = isOffer ? selectedOffer?.storeName : selectedProduct?.storeName;
  const originalPrice = isOffer ? selectedOffer?.originalPrice : selectedProduct?.originalPrice;
  const price = isOffer ? selectedOffer?.offerPrice : selectedProduct?.price;
  const discountPercent = isOffer ? selectedOffer?.discountPercent : selectedProduct?.discountPercent;
  const rating = isOffer ? selectedOffer?.rating : selectedProduct?.rating;
  const description = isOffer 
    ? (selectedOffer?.termsAndConditions || "Exclusive flyer campaign deal.") 
    : (selectedProduct?.description || "Premium selected brand with high user satisfaction ratings.");

  const similarItems = products.filter(p => 
    p.subcategory === (selectedProduct?.subcategory || "Supermarkets") && 
    p.id !== selectedProduct?.id
  ).slice(0, 5);

  const favId = isOffer ? (selectedOffer?.id || 0) : (selectedProduct?.id || 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER HERO */}
      <View style={styles.heroWrapper}>
        <Image source={isOffer ? getProductImage(storeName || '') : getProductImage(selectedProduct)} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigateTo('HOME')}>
            <ArrowLeft size={20} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => toggleFavorite(favId)}>
            <Heart size={20} color={isFavorite(favId) ? "#FF5252" : "#FFF"} fill={isFavorite(favId) ? "#FF5252" : "transparent"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bodyWrapper}>
        
        {/* STORE & DISCOUNT ROW */}
        <View style={styles.rowBetween}>
          <Text style={[styles.storeLabel, { color: colors.primary }]}>{storeName}</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={[styles.mainTitle, { color: colors.text }]}>{title}</Text>

        {/* RATINGS & PRICE ROW */}
        <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
          <View>
            <View style={styles.row}>
              <Text style={[styles.priceText, { color: colors.text }]}>LKR {price?.toLocaleString()}</Text>
              <Text style={styles.origPriceText}>LKR {originalPrice?.toLocaleString()}</Text>
            </View>
            <View style={[styles.row, { marginTop: 4 }]}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={{ color: colors.subText, fontSize: 11, marginLeft: 4 }}>
                {rating} Star Rating verified by users
              </Text>
            </View>
          </View>
        </View>

        {/* DETAILED INSIGHTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isOffer ? "📜 Terms and Conditions" : "📖 Product Details"}
          </Text>
          <Text style={[styles.descriptionText, { color: colors.subText }]}>{description}</Text>
        </View>

        {!isOffer && selectedProduct && (
          <View style={[styles.specsBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <View style={styles.row}>
              <ShieldCheck size={16} color={colors.primary} />
              <Text style={[styles.specsHeading, { color: colors.text }]}>Islandwide Quality Specs</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: colors.subText }]}>SKU Code:</Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>{selectedProduct.sku}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: colors.subText }]}>Features:</Text>
              <Text style={{ color: colors.text, fontSize: 11 }}>{selectedProduct.features}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: colors.subText }]}>Specifications:</Text>
              <Text style={{ color: colors.text, fontSize: 11 }}>{selectedProduct.specifications}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: colors.subText }]}>Stock Status:</Text>
              <Text style={{ color: selectedProduct.stockCount > 0 ? '#00C853' : '#D50000', fontSize: 11, fontWeight: 'bold' }}>
                {selectedProduct.stockCount > 0 ? `In Stock (${selectedProduct.stockCount} units)` : "Sold Out"}
              </Text>
            </View>
          </View>
        )}

        {/* RELATED PRODUCTS */}
        {!isOffer && similarItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🛍️ Similar Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarRow}>
              {similarItems.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.similarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setSelectedProduct(item)}
                >
                  <Image source={getProductImage(item)} style={styles.similarImg} />
                  <Text style={[styles.similarTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ color: colors.primary, fontSize: 9, fontWeight: 'bold' }}>LKR {item.price.toFixed(0)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* BUY BUTTON */}
        {!isOffer && selectedProduct && (
          <TouchableOpacity 
            style={[
              styles.buyBtn,
              { 
                backgroundColor: !currentUser 
                  ? '#5E35B1'
                  : isAdded ? '#00C853' : colors.primary 
              }
            ]}
            onPress={handleAddToCart}
          >
            {!currentUser ? (
              <>
                <ShoppingCart size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={[styles.buyBtnText, { color: '#FFF' }]}>
                  🔒 Sign In to Add to Cart
                </Text>
              </>
            ) : isAdded ? (
              <>
                <Check size={18} color="#FFF" strokeWidth={3} style={{ marginRight: 8 }} />
                <Text style={[styles.buyBtnText, { color: '#FFF' }]}>✓ Added to Cart!</Text>
              </>
            ) : (
              <>
                <ShoppingCart size={18} color={colors.background} style={{ marginRight: 8 }} />
                <Text style={[styles.buyBtnText, { color: colors.background }]}>Add to Shopping Cart</Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heroWrapper: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerBar: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyWrapper: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    backgroundColor: '#0C0717', // default base background
  },
  storeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  discountBadge: {
    backgroundColor: '#D50000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    lineHeight: 26,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  origPriceText: {
    fontSize: 12,
    color: '#777',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  specsBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  specsHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
    marginBottom: 10,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 11,
  },
  similarRow: {
    gap: 8,
    paddingVertical: 4,
  },
  similarCard: {
    width: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  similarImg: {
    width: '100%',
    height: 50,
    borderRadius: 6,
    marginBottom: 6,
  },
  similarTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },
  buyBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});
export default DetailScreen;
