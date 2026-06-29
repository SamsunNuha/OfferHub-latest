import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, ScrollView, 
  TouchableOpacity, Image 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { BRAND_LOGOS } from '../shared/brandLogos';
import { Search, ArrowLeft, Tag, ArrowRight } from 'lucide-react-native';

export const SearchScreen: React.FC = () => {
  const { 
    isDarkMode, products, offers, brands, navigateTo, 
    setSelectedProduct, setSelectedOffer 
  } = useAppContext();

  const { contentWidth, padding } = useDimensions();
  const [query, setQuery] = useState('');

  // Search filter
  const clean = query.trim().toLowerCase();
  const matchedOffers = clean ? offers.filter(o => 
    o.title.toLowerCase().includes(clean) || 
    o.storeName.toLowerCase().includes(clean)
  ) : [];

  const matchedProducts = clean ? products.filter(p => 
    p.name.toLowerCase().includes(clean) || 
    p.storeName.toLowerCase().includes(clean) ||
    p.keywords.toLowerCase().includes(clean)
  ) : [];

  const matchedBrands = clean ? brands.filter(b => 
    b.name.toLowerCase().includes(clean) || 
    b.category.toLowerCase().includes(clean)
  ) : [];

  // Color theme
  const colors = isDarkMode ? {
    background: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    text: '#FFFFFF',
    subText: '#B0A2C9',
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    text: '#120024',
    subText: '#6D5C80',
  };

  const hasResults = matchedOffers.length > 0 || matchedProducts.length > 0 || matchedBrands.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.mainLayout, { maxWidth: contentWidth, paddingHorizontal: padding }]}>
        
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={() => navigateTo('HOME')}>
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Unified Offers Finder</Text>
        </View>

        {/* SEARCH INPUT */}
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Search size={18} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Type deals, groceries, electronics, vouchers..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {/* SEARCH RESULTS */}
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {!clean ? (
            <View style={{ gap: 16 }}>
              {/* RECOMMENDED FOR YOU PANEL */}
              <View style={[styles.trendingPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 0 }]}>🔥 Trending / Recommended Deals</Text>
                <Text style={{ color: colors.subText, fontSize: 10, marginBottom: 12 }}>Handpicked Sri Lankan weekly savers</Text>
                <View style={{ gap: 8 }}>
                  {offers.slice(0, 5).map(o => (
                    <TouchableOpacity 
                      key={o.id} 
                      style={[styles.resultRow, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => {
                        setSelectedOffer(o);
                        navigateTo('DETAIL');
                      }}
                    >
                      <View style={[styles.badgeCircle, { backgroundColor: 'rgba(142,36,170,0.1)' }]}>
                        <Tag size={14} color="#8E24AA" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>{o.title}</Text>
                        <Text style={{ color: colors.subText, fontSize: 9 }}>{o.storeName} | discount {o.discountPercent}%</Text>
                      </View>
                      <ArrowRight size={12} color={colors.subText} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.trendingPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 0 }]}>📦 Recommended Marketplace Products</Text>
                <Text style={{ color: colors.subText, fontSize: 10, marginBottom: 12 }}>Top rated products in Colombo</Text>
                <View style={{ gap: 8 }}>
                  {products.slice(0, 6).map(p => (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[styles.resultRow, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => {
                        setSelectedProduct(p);
                        navigateTo('DETAIL');
                      }}
                    >
                      <View style={[styles.badgeCircle, { backgroundColor: 'rgba(0,200,83,0.1)', overflow: 'hidden' }]}>
                        {p.images ? (
                          <Image source={{ uri: p.images }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <Text style={{ color: '#00C853', fontSize: 12 }}>📦</Text>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }} numberOfLines={1}>{p.name}</Text>
                        <Text style={{ color: colors.subText, fontSize: 9 }}>{p.storeName} | LKR {p.price.toLocaleString()} ({p.discountPercent}% OFF)</Text>
                      </View>
                      <ArrowRight size={12} color={colors.subText} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : !hasResults ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyLabel, { color: colors.subText }]}>No results found matching "{query}". Try checking Singer, Odel, Keells or groceries.</Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {/* BRANDS MATCH */}
              {matchedBrands.length > 0 && (
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Brands & Partners</Text>
                  <View style={{ gap: 8 }}>
                    {matchedBrands.map(b => (
                      <TouchableOpacity 
                        key={b.name} 
                        style={[styles.resultRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigateTo('MARKETPLACE')}
                      >
                        <View style={[styles.badgeCircle, { backgroundColor: colors.surfaceVariant, overflow: 'hidden' }]}>
                          {BRAND_LOGOS[b.name] ? (
                            <Image source={BRAND_LOGOS[b.name]} style={{ width: '100%', height: '100%' }} />
                          ) : b.logo ? (
                            <Image source={{ uri: b.logo }} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>🏢</Text>
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>{b.name}</Text>
                          <Text style={{ color: colors.subText, fontSize: 10 }}>{b.category} | {b.followerCount.toLocaleString()} followers</Text>
                        </View>
                        <ArrowRight size={14} color={colors.subText} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* OFFERS MATCH */}
              {matchedOffers.length > 0 && (
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Campaign Deals & Flyers</Text>
                  <View style={{ gap: 8 }}>
                    {matchedOffers.map(o => (
                      <TouchableOpacity 
                        key={o.id} 
                        style={[styles.resultRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => {
                          setSelectedOffer(o);
                          navigateTo('DETAIL');
                        }}
                      >
                        <View style={[styles.badgeCircle, { backgroundColor: 'rgba(142,36,170,0.1)' }]}>
                          <Tag size={14} color="#8E24AA" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>{o.title}</Text>
                          <Text style={{ color: colors.subText, fontSize: 10 }}>{o.storeName} | discount {o.discountPercent}%</Text>
                        </View>
                        <ArrowRight size={14} color={colors.subText} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* PRODUCTS MATCH */}
              {matchedProducts.length > 0 && (
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Marketplace Products</Text>
                  <View style={{ gap: 8 }}>
                    {matchedProducts.map(p => (
                      <TouchableOpacity 
                        key={p.id} 
                        style={[styles.resultRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => {
                          setSelectedProduct(p);
                          navigateTo('DETAIL');
                        }}
                      >
                        <View style={[styles.badgeCircle, { backgroundColor: 'rgba(0,200,83,0.1)', overflow: 'hidden' }]}>
                          {p.images ? (
                            <Image source={{ uri: p.images }} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <Text style={{ color: '#00C853', fontSize: 12 }}>📦</Text>
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }} numberOfLines={1}>{p.name}</Text>
                          <Text style={{ color: colors.subText, fontSize: 10 }}>{p.storeName} | LKR {p.price.toLocaleString()} ({p.discountPercent}% OFF)</Text>
                        </View>
                        <ArrowRight size={14} color={colors.subText} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 10,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  badgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingPanel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  }
});
export default SearchScreen;
