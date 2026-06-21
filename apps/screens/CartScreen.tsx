import React from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Sparkles } from 'lucide-react-native';

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

export const CartScreen: React.FC = () => {
  const { 
    isDarkMode, cart, products, addToCart, decreaseCart, clearCart, 
    getCartTotal, getTaxAmount, getGrandTotal, selectedCourier, activePromoDiscount, navigateTo 
  } = useAppContext();

  const { contentWidth, isMobile } = useDimensions();

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

  const cartItems = Object.entries(cart).map(([idStr, qty]) => {
    const product = products.find(p => p.id === Number(idStr));
    return { product, qty };
  }).filter(item => item.product !== undefined);

  const subtotal = getCartTotal();
  const tax = getTaxAmount();
  const deliveryFee = selectedCourier === 'std' ? 250 : selectedCourier === 'exp' ? 500 : 950;
  const grandTotal = getGrandTotal();
  const pointsEarned = Math.max(5, Math.floor(subtotal / 100));

  if (cartItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <ShoppingBag size={64} color={colors.subText} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Basket is Empty</Text>
        <Text style={[styles.emptyText, { color: colors.subText }]}>
          Looks like you haven't added any products to your cart yet. Explore our marketplace for active Sri Lankan weekly savers!
        </Text>
        <TouchableOpacity 
          style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigateTo('MARKETPLACE')}
        >
          <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 13 }}>Browse Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { maxWidth: contentWidth }]}>
        
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigateTo('MARKETPLACE')} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Marketplace</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Basket</Text>
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Trash2 size={16} color="#FF1744" />
            <Text style={{ color: '#FF1744', fontSize: 11, fontWeight: 'bold' }}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* ITEMS LIST */}
        <View style={styles.itemsList}>
          {cartItems.map(({ product, qty }) => {
            if (!product) return null;
            return (
              <View key={product.id} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image source={getProductImage(product)} style={styles.productThumb} />
                
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.storeLabel, { color: colors.primary }]}>{product.storeName}</Text>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{product.name}</Text>
                  <Text style={[styles.productPrice, { color: colors.text }]}>
                    LKR {product.price.toLocaleString()} <Text style={{ fontSize: 9, color: colors.subText }}>each</Text>
                  </Text>
                  <Text style={{ color: colors.subText, fontSize: 8 }}>Available Stock: {product.stockCount} units</Text>
                </View>

                {/* QUANTITY PICKER */}
                <View style={styles.quantityPicker}>
                  <TouchableOpacity 
                    style={[styles.qtyBtn, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => decreaseCart(product)}
                  >
                    <Minus size={12} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyVal, { color: colors.text }]}>{qty}</Text>
                  <TouchableOpacity 
                    style={[styles.qtyBtn, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => addToCart(product)}
                  >
                    <Plus size={12} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* LOYALTY POINTS ALERT */}
        <View style={[styles.pointsAlert, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={[styles.pointsAlertText, { color: colors.text }]}>
            Earn <Text style={{ fontWeight: 'bold', color: colors.primary }}>{pointsEarned} Reward Points</Text> on this order to redeem premium merchant coupons later!
          </Text>
        </View>

        {/* PRICE SUMMARY BREAKDOWN */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Basket Total Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.subText, fontSize: 12 }}>Subtotal</Text>
            <Text style={{ color: colors.text, fontSize: 12 }}>LKR {subtotal.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.subText, fontSize: 12 }}>VAT (8% Local Taxes)</Text>
            <Text style={{ color: colors.text, fontSize: 12 }}>LKR {tax.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={{ color: colors.subText, fontSize: 12 }}>Delivery Courier Fee</Text>
            <Text style={{ color: colors.text, fontSize: 12 }}>LKR {deliveryFee.toLocaleString()}</Text>
          </View>

          {activePromoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: '#00C853', fontSize: 12, fontWeight: 'bold' }}>Coupon Discount Applied</Text>
              <Text style={{ color: '#00C853', fontSize: 12, fontWeight: 'bold' }}>- LKR {activePromoDiscount.toLocaleString()}</Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Grand Total Amount</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>LKR {grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* PROCEED BUTTON */}
        <TouchableOpacity 
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigateTo('CHECKOUT')}
        >
          <CreditCard size={18} color={colors.background} />
          <Text style={[styles.checkoutBtnText, { color: colors.background }]}>Proceed to Checkout</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  storeLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: 'bold',
    minWidth: 16,
    textAlign: 'center',
  },
  pointsAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  pointsAlertText: {
    fontSize: 10,
    flex: 1,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'black',
  },
  checkoutBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: '900',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    height: Dimensions.get('window').height * 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  shopBtn: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
