import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, 
  TouchableOpacity, Alert, FlatList 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { Plus, Trash2, LayoutDashboard, Briefcase, FileText } from 'lucide-react-native';
import { Product, Offer } from '../shared/mockDb';

export const BusinessDashboardScreen: React.FC = () => {
  const { 
    isDarkMode, products, offers, currentUser, 
    addProduct, addOffer, deleteProduct, deleteOffer 
  } = useAppContext();

  const { contentWidth, padding } = useDimensions();
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PRODUCTS' | 'CAMPAIGNS'>('ANALYTICS');

  // Input states for new product
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDisc, setPDisc] = useState('');
  const [pStock, setPStock] = useState('');

  // Input states for new offer
  const [oTitle, setOTitle] = useState('');
  const [oDisc, setODisc] = useState('');
  const [oPrice, setOPrice] = useState('');
  const [oDate, setODate] = useState('Valid till 30 Jun 2026');

  // Theme colors
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

  const merchantStore = currentUser?.name || "Keells Supermarkets";

  // Filter products/offers managed by this merchant
  const myProducts = products.filter(p => p.storeName.toLowerCase().includes(merchantStore.toLowerCase().split(' ')[0]));
  const myOffers = offers.filter(o => o.storeName.toLowerCase().includes(merchantStore.toLowerCase().split(' ')[0]));

  const handleAddProduct = () => {
    if (!pName.trim() || !pPrice || !pStock) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    const priceNum = parseFloat(pPrice);
    const discNum = parseInt(pDisc) || 0;
    const stockNum = parseInt(pStock);

    const origPrice = Math.floor(priceNum / (1 - discNum / 100));

    const newProd: Product = {
      id: Date.now(),
      name: pName.trim(),
      storeName: merchantStore,
      price: priceNum,
      originalPrice: origPrice,
      discountPercent: discNum,
      rating: 5.0,
      description: "Custom merchant added product.",
      stockCount: stockNum,
      isApproved: false, // requires super admin approval!
      subcategory: "Supermarkets",
      features: "Premium local islandwide product",
      specifications: "Standard pack",
      discountPrice: origPrice - priceNum,
      sku: `SKU-MER-${Math.floor(1000 + Math.random() * 9000)}`,
      images: "",
      keywords: "merchant, product",
      barcode: `8412${Math.floor(100000 + Math.random() * 900000)}`
    };

    addProduct(newProd);
    Alert.alert("Submitted", "Product submitted successfully. Pending Admin approval!");
    setPName('');
    setPPrice('');
    setPDisc('');
    setPStock('');
  };

  const handleAddOffer = () => {
    if (!oTitle.trim() || !oDisc || !oPrice) {
      Alert.alert("Error", "Please fill in all campaign fields.");
      return;
    }
    
    const discNum = parseInt(oDisc);
    const priceNum = parseFloat(oPrice);
    const origPrice = Math.floor(priceNum / (1 - discNum / 100));

    const newOffer: Offer = {
      id: Date.now(),
      storeName: merchantStore,
      title: oTitle.trim(),
      discountPercent: discNum,
      category: "Supermarkets",
      originalPrice: origPrice,
      offerPrice: priceNum,
      validUntil: oDate,
      location: "Colombo, Sri Lanka",
      rating: 5.0,
      termsAndConditions: "Standard discount rules apply.",
      isFeatured: false,
      isFlashSale: false,
      isApproved: false // requires admin approval
    };

    addOffer(newOffer);
    Alert.alert("Submitted", "Offer submitted successfully. Pending Admin verification!");
    setOTitle('');
    setODisc('');
    setOPrice('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.mainLayout, { maxWidth: contentWidth, paddingHorizontal: padding }]}>
        
        {/* MERCHANT HEADER */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>🏢 {merchantStore} Portal</Text>
          <Text style={{ color: colors.subText, fontSize: 11 }}>Active subscription: Partner Plan</Text>
        </View>

        {/* TABS SELECTOR */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {(['ANALYTICS', 'PRODUCTS', 'CAMPAIGNS'] as const).map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={{ 
                color: activeTab === tab ? colors.primary : colors.subText, 
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                fontSize: 12
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'ANALYTICS' && (
            <View style={{ gap: 16, marginTop: 12 }}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Weekly Sales Insights</Text>
              
              <View style={styles.gridRow}>
                <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <LayoutDashboard size={20} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.subText }]}>Active Listings</Text>
                  <Text style={[styles.statVal, { color: colors.text }]}>{myProducts.length + myOffers.length}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Briefcase size={20} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.subText }]}>Pending Approvals</Text>
                  <Text style={[styles.statVal, { color: colors.text }]}>
                    {myProducts.filter(p => !p.isApproved).length + myOffers.filter(o => !o.isApproved).length}
                  </Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <FileText size={20} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.subText }]}>Completed Orders</Text>
                  <Text style={[styles.statVal, { color: '#00C853' }]}>128 Bills</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={{ fontSize: 20 }}>💰</Text>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>Revenue (LKR)</Text>
                  <Text style={[styles.statVal, { color: '#FFD700' }]}>Rs. 892K</Text>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'PRODUCTS' && (
            <View style={{ marginTop: 12, gap: 16 }}>
              {/* Creator Form */}
              <View style={[styles.creatorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.creatorTitle, { color: colors.text }]}>＋ Add New Product listing</Text>
                
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
                  placeholder="Product name *"
                  placeholderTextColor={colors.subText}
                  value={pName}
                  onChangeText={setPName}
                />

                <View style={styles.row}>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant, flex: 1 }]}
                    placeholder="Discounted Price (LKR) *"
                    placeholderTextColor={colors.subText}
                    value={pPrice}
                    onChangeText={setPPrice}
                    keyboardType="numeric"
                  />
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant, flex: 1, marginLeft: 8 }]}
                    placeholder="Discount % *"
                    placeholderTextColor={colors.subText}
                    value={pDisc}
                    onChangeText={setPDisc}
                    keyboardType="numeric"
                  />
                </View>

                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
                  placeholder="Available Stock Count *"
                  placeholderTextColor={colors.subText}
                  value={pStock}
                  onChangeText={setPStock}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleAddProduct}>
                  <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 13 }}>Submit Listing</Text>
                </TouchableOpacity>
              </View>

              {/* Product list */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>My Catalog Items ({myProducts.length})</Text>
              <View style={{ gap: 8 }}>
                {myProducts.map(prod => (
                  <View key={prod.id} style={[styles.listRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>{prod.name}</Text>
                      <Text style={{ color: colors.subText, fontSize: 10 }}>Price: LKR {prod.price.toLocaleString()} | stock: {prod.stockCount}</Text>
                      <Text style={{ color: prod.isApproved ? '#00C853' : '#FFC107', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>
                        {prod.isApproved ? "Approved" : "Pending Admin Review"}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteProduct(prod.id)}>
                      <Trash2 size={16} color="#D50000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: CAMPAIGNS */}
          {activeTab === 'CAMPAIGNS' && (
            <View style={{ marginTop: 12, gap: 16 }}>
              {/* Creator Form */}
              <View style={[styles.creatorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.creatorTitle, { color: colors.text }]}>＋ Add Campaign Deal / Flyer</Text>
                
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
                  placeholder="Deal title (e.g. 20% OFF Samba rice) *"
                  placeholderTextColor={colors.subText}
                  value={oTitle}
                  onChangeText={setOTitle}
                />

                <View style={styles.row}>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant, flex: 1 }]}
                    placeholder="Offer price (LKR) *"
                    placeholderTextColor={colors.subText}
                    value={oPrice}
                    onChangeText={setOPrice}
                    keyboardType="numeric"
                  />
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant, flex: 1, marginLeft: 8 }]}
                    placeholder="Discount % *"
                    placeholderTextColor={colors.subText}
                    value={oDisc}
                    onChangeText={setODisc}
                    keyboardType="numeric"
                  />
                </View>

                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
                  placeholder="Valid date (e.g. Valid till 25 Jun) *"
                  placeholderTextColor={colors.subText}
                  value={oDate}
                  onChangeText={setODate}
                />

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleAddOffer}>
                  <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 13 }}>Post Campaign</Text>
                </TouchableOpacity>
              </View>

              {/* Campaigns list */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>My active Flyer Vouchers ({myOffers.length})</Text>
              <View style={{ gap: 8 }}>
                {myOffers.map(offer => (
                  <View key={offer.id} style={[styles.listRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>{offer.title}</Text>
                      <Text style={{ color: colors.subText, fontSize: 10 }}>Offer Price: LKR {offer.offerPrice.toLocaleString()} | {offer.validUntil}</Text>
                      <Text style={{ color: offer.isApproved ? '#00C853' : '#FFC107', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>
                        {offer.isApproved ? "Approved & Live" : "Pending Verification"}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteOffer(offer.id)}>
                      <Trash2 size={16} color="#D50000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
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
    paddingTop: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  creatorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  creatorTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  }
});
export default BusinessDashboardScreen;
