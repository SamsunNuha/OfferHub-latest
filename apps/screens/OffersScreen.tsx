import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { Tag, Zap, Search, Clock, Award, ChevronRight, ShoppingCart, Check } from 'lucide-react-native';

export const OffersScreen: React.FC = () => {
  const { isDarkMode, offers, navigateTo, setSelectedOffer, addToCart, currentUser } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'FLASH' | 'FEATURED'>('ALL');
  const [searchQ, setSearchQ] = useState('');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const colors = isDarkMode ? {
    bg: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    text: '#FFFFFF',
    subText: '#B0A2C9',
    live: '#FF3D57',
  } : {
    bg: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    text: '#120024',
    subText: '#6D5C80',
    live: '#FF3D57',
  };

  const filteredOffers = offers.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchQ.toLowerCase()) || o.storeName.toLowerCase().includes(searchQ.toLowerCase());
    if (selectedTab === 'FLASH') return matchesSearch && o.discountPercent && o.discountPercent >= 20;
    if (selectedTab === 'FEATURED') return matchesSearch && o.isFeatured;
    return matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Award size={22} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>All Exclusive Sri Lankan Offers</Text>
          </View>
          <Text style={{ color: colors.subText, fontSize: 11, marginTop: 2 }}>Discover verified discounts from Singer, Keells, Odel & more</Text>
        </View>

        {/* Search & Tabs */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={16} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search offers by store or item..."
            placeholderTextColor={colors.subText}
            value={searchQ}
            onChangeText={setSearchQ}
          />
        </View>

        <View style={styles.tabRow}>
          {(['ALL', 'FEATURED', 'FLASH'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, selectedTab === tab && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, { color: selectedTab === tab ? '#FFF' : colors.subText }]}>
                {tab === 'ALL' ? '🏷️ All Offers' : tab === 'FEATURED' ? '⭐ Featured Deals' : '⚡ Flash Sales'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List of Offers */}
        <View style={{ gap: 12, marginTop: 10 }}>
          {filteredOffers.map(offer => (
            <TouchableOpacity
              key={offer.id}
              style={[styles.offerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                setSelectedOffer(offer);
                navigateTo('DETAIL');
              }}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.storeName, { color: colors.primary }]}>{offer.storeName}</Text>
                  <Text style={[styles.offerTitle, { color: colors.text }]}>{offer.title}</Text>
                </View>
                {offer.discountPercent && (
                  <View style={styles.discBadge}>
                    <Text style={styles.discText}>{offer.discountPercent}% OFF</Text>
                  </View>
                )}
              </View>

              <Text style={{ color: colors.subText, fontSize: 11, marginTop: 6 }} numberOfLines={2}>
                {(offer as any).description || 'Verified Sri Lankan promo deal. Claim now before expiration date!'}
              </Text>

              <View style={styles.cardFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color={colors.subText} />
                  <Text style={{ color: colors.subText, fontSize: 10 }}>Valid till {offer.validUntil || '2026-12-31'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>View Deal</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

export default OffersScreen;

const styles = StyleSheet.create({
  header: { marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '900' },
  searchBox: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 13 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabText: { fontSize: 11, fontWeight: '700' },
  offerCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  storeName: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  offerTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  discBadge: { backgroundColor: '#FF3D57', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
});
