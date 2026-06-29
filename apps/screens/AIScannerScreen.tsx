import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
  Modal, ActivityIndicator, Animated, ScrollView, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { Product } from '../shared/mockDb';
import {
  Camera as CameraIcon, Image as ImageIcon, Sparkles,
  ShoppingBag, X, RefreshCw, AlertCircle, CheckCircle, ArrowLeft, History, Scan
} from 'lucide-react-native';
import { FirebaseService } from '../services/firebaseService';

interface ScanResult {
  product: string;
  brand: string;
  price: string;
  store: string;
  discount: string;
  confidence: number;
}

export const AIScannerScreen: React.FC = () => {
  const { isDarkMode, addToCart, navigateTo, triggerMockNotification, currentUser } = useAppContext();
  const { contentWidth, isMobile } = useDimensions();

  // Scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scannerAnimation] = useState(new Animated.Value(0));
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const userEmail = currentUser?.email || 'MOCK_USER';

  useEffect(() => {
    loadHistory();
  }, [userEmail]);

  const loadHistory = async () => {
    try {
      const hist = await FirebaseService.getScanHistory(userEmail);
      setScanHistory(hist || []);
    } catch (e) {
      console.warn("Load scan history failed:", e);
    }
  };

  // Colors based on theme
  const colors = isDarkMode ? {
    background: '#0C0717',
    surface: '#160F2B',
    border: '#3F2D6B',
    primary: '#A865C9',
    primarySoft: 'rgba(168, 101, 201, 0.15)',
    text: '#FFFFFF',
    subText: '#B0A2C9',
    accent: '#FF7315',
    accentSoft: 'rgba(255, 115, 21, 0.15)',
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    border: '#E0D7FF',
    primary: '#7C4DFF',
    primarySoft: 'rgba(124, 77, 255, 0.15)',
    text: '#120024',
    subText: '#6D5C80',
    accent: '#F97316',
    accentSoft: 'rgba(249, 115, 22, 0.15)',
  };

  // Scanning laser animation loop
  useEffect(() => {
    if (isScanning || analyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scannerAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scannerAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scannerAnimation.setValue(0);
    }
  }, [isScanning, analyzing]);

  // Handle image selection from gallery
  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Denied", "Gallery access is required to scan images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setImageUri(selectedUri);
        triggerAnalysis(selectedUri, "Custom Uploaded Image");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load image from gallery.");
    }
  };

  // Simulate scanning/AI analysis
  const triggerAnalysis = (uri: string, name: string) => {
    setIsScanning(false);
    setAnalyzing(true);
    setScanResult(null);

    // Simulate standard Google Lens style API match response
    setTimeout(() => {
      setAnalyzing(false);
      
      let matchedResult: ScanResult = {
        product: "Premium Basmati Rice 5kg",
        brand: "Keells",
        price: "LKR 1,450.00",
        store: "Keells Super Store",
        discount: "15% OFF",
        confidence: 97,
      };

      if (name.toLowerCase().includes("phone")) {
        matchedResult = {
          product: "Samsung Galaxy S24 Ultra",
          brand: "Samsung",
          price: "LKR 385,000.00",
          store: "Singer Mega",
          discount: "5% OFF + Free Buds",
          confidence: 99,
        };
      } else if (name.toLowerCase().includes("headphone") || name.toLowerCase().includes("sound")) {
        matchedResult = {
          product: "Sony WH-1000XM5 Wireless Headphones",
          brand: "Sony",
          price: "LKR 98,000.00",
          store: "Abans Electronics",
          discount: "10% OFF with Visa Card",
          confidence: 95,
        };
      } else if (name.toLowerCase().includes("rice") || name.toLowerCase().includes("keells")) {
        matchedResult = {
          product: "Keells Ponni Samba Rice 5kg",
          brand: "Keells",
          price: "LKR 1,120.00",
          store: "Keells Super Store",
          discount: "20% OFF Weekly Special",
          confidence: 98,
        };
      }

      setScanResult(matchedResult);
      triggerMockNotification("📷 AI Lens Match Found", `Identified ${matchedResult.product} at ${matchedResult.store}.`);

      // Save scan to database/local history
      FirebaseService.addScanHistory(userEmail, {
        productName: matchedResult.product,
        brand: matchedResult.brand,
        price: matchedResult.price,
        confidenceScore: matchedResult.confidence / 100
      }).then(() => {
        loadHistory();
      }).catch(err => console.warn(err));
    }, 2500);
  };

  // Quick tests
  const quickTest = (type: string) => {
    let dummyUri = '';
    if (type === 'phone') {
      dummyUri = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400';
    } else if (type === 'headphones') {
      dummyUri = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
    } else {
      dummyUri = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
    }
    setImageUri(dummyUri);
    triggerAnalysis(dummyUri, type);
  };

  const handleAddToCart = () => {
    if (!scanResult) return;
    // Map mock scanned item to product list format to append to AppContext cart
    // Since addToCart in Context accepts a product object
    const priceNum = parseFloat(scanResult.price.replace(/[^\d]/g, '')) || 1200;
    const dummyProduct: Product = {
      id: Math.floor(Math.random() * 100000) + 9000,
      name: scanResult.product,
      storeName: scanResult.store,
      price: priceNum,
      originalPrice: priceNum * 1.25,
      discountPercent: parseInt(scanResult.discount.replace(/[^\d]/g, '')) || 15,
      rating: 4.8,
      description: `Scanned via AI Lens Scanner. Identified in ${scanResult.store}.`,
      stockCount: 10,
      isApproved: true,
      subcategory: 'Scanned',
      features: '',
      specifications: '',
      discountPrice: priceNum,
      sku: `SCN-${Date.now()}`,
      images: imageUri || 'https://via.placeholder.com/150',
      keywords: 'scanned, ai, lens',
      barcode: '',
    };
    addToCart(dummyProduct);
    setScanResult(null);
    Alert.alert("Added to Cart", `${scanResult.product} was successfully added to your shopping cart.`);
  };

  // Laser scanner vertical line translation animation style
  const scanLineTranslate = scannerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 240]
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.mainLayout, { maxWidth: contentWidth }]}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigateTo('HOME')} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Google Lens AI Scanner</Text>
            <Text style={{ color: colors.subText, fontSize: 11 }}>Scan product flyers or store items for instant Sri Lankan deals</Text>
          </View>
        </View>

        {/* SCANNING WINDOW CONTROLLER */}
        <View style={[styles.scannerFrame, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {isScanning ? (
            <View style={styles.scanningBox}>
              <View style={styles.cameraPlaceholder}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.cameraText, { color: colors.subText }]}>Initializing Live Camera Feed...</Text>
              </View>
              <Animated.View style={[styles.scannerLine, { backgroundColor: colors.primary, transform: [{ translateY: scanLineTranslate }] }]} />
            </View>
          ) : analyzing ? (
            <View style={styles.scanningBox}>
              {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.analyzingText}>Extracting text & matching prices...</Text>
              </View>
              <Animated.View style={[styles.scannerLine, { backgroundColor: colors.accent, transform: [{ translateY: scanLineTranslate }] }]} />
            </View>
          ) : imageUri ? (
            <View style={styles.scanningBox}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => { setImageUri(null); setScanResult(null); }} style={styles.clearBtn}>
                <X size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Sparkles size={48} color={colors.primary} style={{ opacity: 0.8, marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Image Selected</Text>
              <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
                Tap camera scan, select from your gallery, or run a quick target demo below.
              </Text>
            </View>
          )}
        </View>

        {/* ACTION CONTROLS BAR */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={pickFromGallery}
          >
            <ImageIcon size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            onPress={isScanning ? () => setIsScanning(false) : () => { setImageUri(null); setIsScanning(true); setTimeout(() => quickTest('rice'), 3000); }}
          >
            <CameraIcon size={24} color="#FFF" />
            <Text style={styles.primaryActionText}>{isScanning ? "Stop Scanner" : "Live Camera Scan"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={pickFromGallery}
          >
            <Sparkles size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK TEST DEMOS */}
        <View style={styles.testSection}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>QUICK TEST DEMOS</Text>
          <View style={styles.testRow}>
            <TouchableOpacity onPress={() => quickTest('phone')} style={[styles.testTag, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>📱 Samsung Galaxy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => quickTest('headphones')} style={[styles.testTag, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>🎧 Sony Headphones</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => quickTest('rice')} style={[styles.testTag, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>🍚 Keells Rice Flyer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SCAN HISTORY */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: colors.subText }]}>RECENT SCANS</Text>
            <TouchableOpacity onPress={loadHistory} style={styles.refreshHistoryBtn}>
              <RefreshCw size={12} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {scanHistory.length === 0 ? (
            <Text style={[styles.emptyHistoryText, { color: colors.subText }]}>No recent scans found.</Text>
          ) : (
            <View style={styles.historyList}>
              {scanHistory.slice(0, 5).map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    setScanResult({
                      product: item.productName,
                      brand: item.brand,
                      price: item.price,
                      store: "Keells Super Store",
                      discount: "Matched Offer",
                      confidence: Math.round((item.confidenceScore || 0.95) * 100),
                    });
                  }}
                >
                  <View style={[styles.historyIconBox, { backgroundColor: colors.primarySoft }]}>
                    <Scan size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyItemName, { color: colors.text }]} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={{ color: colors.subText, fontSize: 10 }}>
                      {item.brand} • {item.price} • {item.timestamp || 'Just now'}
                    </Text>
                  </View>
                  <View style={styles.historyConfidence}>
                    <Text style={{ color: '#00E676', fontSize: 10, fontWeight: 'bold' }}>
                      {Math.round((item.confidenceScore || 0.95) * 100)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* RESULT MODAL PANEL */}
        {scanResult && (
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <View style={styles.matchBadge}>
                <CheckCircle size={14} color="#00E676" />
                <Text style={styles.matchText}>{scanResult.confidence}% AI Match</Text>
              </View>
              <TouchableOpacity onPress={() => setScanResult(null)} style={styles.closeBtn}>
                <X size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.resultBody}>
              <Text style={[styles.productName, { color: colors.text }]}>{scanResult.product}</Text>
              <Text style={[styles.brandName, { color: colors.subText }]}>Brand: {scanResult.brand}</Text>

              <View style={styles.infoRow}>
                <View>
                  <Text style={[styles.label, { color: colors.subText }]}>DETECTED PRICE</Text>
                  <Text style={[styles.priceText, { color: colors.text }]}>{scanResult.price}</Text>
                </View>
                <View style={[styles.discountBadge, { backgroundColor: colors.accentSoft }]}>
                  <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 11 }}>{scanResult.discount}</Text>
                </View>
              </View>

              <View style={[styles.storeBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ShoppingBag size={14} color={colors.primary} />
                <Text style={[styles.storeText, { color: colors.text }]}>{scanResult.store}</Text>
              </View>

              <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: colors.primary }]} onPress={handleAddToCart}>
                <ShoppingBag size={18} color="#FFF" />
                <Text style={styles.addToCartText}>Add Scanned Deal to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  scannerFrame: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  scanningBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#05020A',
  },
  cameraText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clearBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 14,
  },
  analyzingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  analyzingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  primaryActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  testSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'black',
    letterSpacing: 1,
    marginBottom: 10,
  },
  testRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testTag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  resultBody: {
    gap: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 12,
    marginTop: -4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  discountBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  storeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  storeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  addToCartBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historySection: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshHistoryBtn: {
    padding: 4,
  },
  emptyHistoryText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  historyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyConfidence: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
});
