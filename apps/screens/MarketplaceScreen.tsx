import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, 
  TouchableOpacity, Image, FlatList 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { Star, ShoppingCart, Search } from 'lucide-react-native';

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

export const MarketplaceScreen: React.FC = () => {
  const { 
    isDarkMode, products, addToCart, navigateTo, 
    setSelectedProduct 
  } = useAppContext();

  const { gridColumns, contentWidth, padding } = useDimensions();
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
        
        {/* SEARCH BAR */}
        <View style={[styles.searchWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Search size={18} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products, stores, keywords..."
            placeholderTextColor="rgba(255,255,255,0.4)"
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
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                  
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
                      style={[styles.cartAddBtn, { backgroundColor: colors.primary }]}
                      onPress={() => addToCart(item)}
                    >
                      <ShoppingCart size={14} color={colors.background} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

      </View>
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
  }
});
export default MarketplaceScreen;
