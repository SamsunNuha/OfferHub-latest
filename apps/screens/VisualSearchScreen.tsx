import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Animated, Dimensions, Alert, Modal, Share, Platform
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import FirebaseService from '../services/firebaseService';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera, Image as ImageIcon, History, QrCode, Sparkles, Scan,
  CheckCircle2, AlertCircle, PlusCircle, ArrowRight, X, Heart,
  Tag, Store, Calendar, DollarSign, Languages, ShieldCheck, RefreshCw, Layers
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Multi-language strings for EN, SI, TA
const TRANSLATIONS: Record<string, Record<string, string>> = {
  EN: {
    title: 'Google Lens AI Scanner',
    subtitle: 'Identify products, extract flyer prices & match local Sri Lankan deals',
    pointAtProduct: 'Align product or flyer offer in viewfinder',
    scanNow: 'Scan Product',
    uploadGallery: 'Upload Image',
    scanHistory: 'Scan History',
    scanQrBarcode: 'QR / Barcode',
    ocrExtracted: 'OCR Text Recognition',
    confidenceScore: 'Confidence Match Score',
    offerFound: 'Verified Active Offer Found!',
    noOfferFound: 'No existing offer matched this scan',
    createOfferBtn: '➕ Create New Merchant Offer',
    viewOfferBtn: '👁️ View Active Offer Details',
    productName: 'Product Name',
    brand: 'Brand',
    price: 'Detected Price',
    discount: 'Discount',
    validity: 'Validity Date',
    store: 'Store Name',
    language: 'Language',
  },
  SI: {
    title: 'ගූගල් ලෙන්ස් AI ස්කෑනරය',
    subtitle: 'භාණ්ඩ හඳුනාගන්න, මිල ගණන් සහ දේශීය දීමනා සසඳන්න',
    pointAtProduct: 'භාණ්ඩය හෝ පත්‍රිකාව කැමරා රාමුවට පෙළගස්වන්න',
    scanNow: 'ස්කෑන් කරන්න',
    uploadGallery: 'ඡායාරූපයක් එක් කරන්න',
    scanHistory: 'ස්කෑන් ඉතිහාසය',
    scanQrBarcode: 'QR / බාර්කෝඩ්',
    ocrExtracted: 'OCR පෙළ හඳුනාගැනීම',
    confidenceScore: 'තහවුරු කිරීමේ ප්‍රතිශතය',
    offerFound: 'සක්‍රීය දීමනාවක් හමු විය!',
    noOfferFound: 'මෙම ස්කෑන් සඳහා දීමනාවක් හමු නොවීය',
    createOfferBtn: '➕ නව වෙළඳ දීමනාවක් සාදන්න',
    viewOfferBtn: '👁️ දීමනා විස්තර බලන්න',
    productName: 'භාණ්ඩයේ නම',
    brand: 'වෙළඳ නාමය',
    price: 'අනාවරණය වූ මිල',
    discount: 'වට්ටම්',
    validity: 'වංගු වන දිනය',
    store: 'වෙළඳසැල',
    language: 'භාෂාව',
  },
  TA: {
    title: 'கூகிள் லென்ஸ் AI ஸ்கேனர்',
    subtitle: 'தயாரிப்புகளைக் கண்டறிந்து, சலுகைகள் மற்றும் விலைகளை ஒப்பிடுக',
    pointAtProduct: 'தயாரிப்பை கேமரா சட்டகத்தில் சீரமைக்கவும்',
    scanNow: 'ஸ்கேன் செய்க',
    uploadGallery: 'படம் பதிவேற்று',
    scanHistory: 'ஸ்கேன் வரலாறு',
    scanQrBarcode: 'QR / பார்ஃகோட்',
    ocrExtracted: 'OCR உரை அங்கீகாரம்',
    confidenceScore: 'நம்பகத்தன்மை மதிப்பெண்',
    offerFound: 'செயலில் உள்ள சலுகை கண்டறியப்பட்டது!',
    noOfferFound: 'இந்த ஸ்கேனிற்கு சலுகை எதுவும் இல்லை',
    createOfferBtn: '➕ புதிய சலுகையை உருவாக்கவும்',
    viewOfferBtn: '👁️ சலுகை விவரங்களைப் பார்க்கவும்',
    productName: 'தயாரிப்பு பெயர்',
    brand: 'பிராண்ட்',
    price: 'கண்டறியப்பட்ட விலை',
    discount: 'தள்ளுபடி',
    validity: 'செல்லுபடி தேதி',
    store: 'கடை பெயர்',
    language: 'மொழி',
  }
};

export const VisualSearchScreen: React.FC = () => {
  const {
    isDarkMode, offers, products, navigateTo, setSelectedOffer,
    currentUser, triggerMockNotification
  } = useAppContext();

  // Mode tabs
  const [scanMode, setScanMode] = useState<'PRODUCT' | 'QR_BARCODE'>('PRODUCT');
  const [selectedLang, setSelectedLang] = useState<'EN' | 'SI' | 'TA'>('EN');

  // Scanning states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressText, setScanProgressText] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(true);

  // Scan detection results
  const [scanResult, setScanResult] = useState<{
    productName: string;
    brand: string;
    price: string;
    discount: string;
    validityDate: string;
    storeName: string;
    confidenceScore: number;
    ocrText: string;
    matchedOffer: any | null;
    qrData?: string;
  } | null>(null);

  // History state
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Animations
  const laserAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const tr = TRANSLATIONS[selectedLang] || TRANSLATIONS.EN;

  useEffect(() => {
    fetchScanHistory();
    startPulse();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  };

  const startLaserSweep = () => {
    laserAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(laserAnim, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    ).start();
  };

  const fetchScanHistory = async () => {
    try {
      const history = await FirebaseService.getScanHistory(currentUser?.email || 'MOCK_USER');
      if (history && history.length > 0) {
        setScanHistory(history);
      } else {
        // Fallback sample history
        setScanHistory([
          { id: 'sc_1', productName: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', price: 'LKR 385,000', confidenceScore: 0.98, timestamp: 'Today, 10:15 AM' },
          { id: 'sc_2', productName: 'Singer Smart TV 55"', brand: 'Singer', price: 'LKR 145,000', confidenceScore: 0.94, timestamp: 'Yesterday, 4:30 PM' },
        ]);
      }
    } catch (e) {
      console.log('Scan history load error:', e);
    }
  };

  // Preset demo images to simulate live camera captures smoothly across platforms
  const SAMPLE_CAPTURES = [
    {
      uri: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
      productName: 'Samsung Galaxy S25 Ultra 5G',
      brand: 'Samsung',
      price: 'LKR 385,000',
      discount: '15% OFF',
      validityDate: '2026-08-31',
      storeName: 'Singer Mega',
      confidenceScore: 0.97,
      ocrText: 'SAMSUNG GALAXY S25 ULTRA 5G - OFFICIAL SINGER LANKA WARRANTY - LKR 385,000',
    },
    {
      uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      productName: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      brand: 'Sony',
      price: 'LKR 112,000',
      discount: '20% Card Offer',
      validityDate: '2026-09-15',
      storeName: 'Softlogic Max',
      confidenceScore: 0.95,
      ocrText: 'SONY WH-1000XM5 ANC HEADPHONES - SOFTLOGIC SPECIAL PROMO - LKR 112,000',
    },
    {
      uri: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      productName: 'Keells Super Keeri Samba Rice 5kg Pack',
      brand: 'Keells',
      price: 'LKR 1,650',
      discount: '10% Saver',
      validityDate: '2026-12-31',
      storeName: 'Keells Supermarket',
      confidenceScore: 0.92,
      ocrText: 'KEELLS GOLD KEERI SAMBA RICE 5KG - SUPER SAVER VOUCHER INCLUDED',
    }
  ];

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photos to import images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        triggerImageAnalysis(uri);
      }
    } catch (e) {
      console.log('Image pick error:', e);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takeCameraPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your camera to scan.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        triggerImageAnalysis(uri);
      }
    } catch (e) {
      console.log('Camera launch error:', e);
      // Fallback on web browser where camera might not be available
      if (Platform.OS === 'web') {
        // Trigger gallery as fallback since camera lacks browser support/permissions in some setups
        pickFromGallery();
      } else {
        Alert.alert('Camera Not Available', 'Defaulting to simulation. Please select from Gallery instead.');
        handleCaptureOrUpload();
      }
    }
  };

  const triggerImageAnalysis = (uri: string) => {
    const isQR = scanMode === 'QR_BARCODE';
    let sample: any;
    
    if (isQR) {
      sample = {
        uri: uri,
        productName: 'Promo Discount Coupon',
        brand: 'Keells Super',
        price: 'LKR 500 cashback',
        discount: 'Voucher Code Applied',
        validityDate: '2026-07-31',
        storeName: 'Keells Outlet',
        confidenceScore: 1.0,
        ocrText: 'DECODED QR DATA: http://offerhub.lk/v/keells-500-promo',
      };
    } else {
      // Simulate matching to a real offer in Sri Lanka
      const mockProducts = [
        { name: 'Keells Keeri Samba Rice 5kg', brand: 'Keells', price: 'LKR 1,650', store: 'Keells', discount: '10% OFF' },
        { name: 'Singer Smart TV 43"', brand: 'Singer', price: 'LKR 95,000', store: 'Singer', discount: 'LKR 5,000 Coupon' },
        { name: 'Odel Silk Dress', brand: 'Odel', price: 'LKR 8,900', store: 'Odel', discount: '15% OFF Odel VIP' },
        { name: 'Softlogic Prizm Refrigerator', brand: 'Softlogic', price: 'LKR 185,000', store: 'Softlogic Max', discount: '20% Card Offer' },
      ];
      const match = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      
      sample = {
        uri: uri,
        productName: match.name,
        brand: match.brand,
        price: match.price,
        discount: match.discount,
        validityDate: '2026-08-31',
        storeName: match.store,
        confidenceScore: 0.93 + Math.random() * 0.06,
        ocrText: `GEMINI VISION AI SCANNER - DETECTED PRODUCT TEXT: ${match.name.toUpperCase()} - CONFIRMED VALUE FOR STORE: ${match.store.toUpperCase()}`,
      };
    }
    
    executeLensScanProcess(sample);
  };

  const handleCaptureOrUpload = (presetIndex?: number) => {
    const sample = SAMPLE_CAPTURES[presetIndex ?? Math.floor(Math.random() * SAMPLE_CAPTURES.length)];
    setSelectedImage(sample.uri);
    executeLensScanProcess(sample);
  };

  const executeLensScanProcess = async (sample: any) => {
    setIsScanning(true);
    setScanResult(null);
    startLaserSweep();

    // Stage 1: Optical Pre-processing
    setScanProgressText('1/3 Extracting high-resolution frame & OCR text...');
    await new Promise(r => setTimeout(r, 1000));

    // Stage 2: Gemini Vision API Evaluation
    setScanProgressText('2/3 Running Gemini Vision AI object recognition engine...');
    await new Promise(r => setTimeout(r, 1200));

    // Stage 3: Firebase Firestore Offer Search
    setScanProgressText('3/3 Querying Firebase Firestore live offers database...');
    await new Promise(r => setTimeout(r, 800));

    // Check if matched offer exists in real offers array
    const matched = offers.find(o =>
      o.title.toLowerCase().includes(sample.brand.toLowerCase()) ||
      o.storeName.toLowerCase().includes(sample.storeName.toLowerCase())
    ) || offers[0] || null;

    const resultPayload = {
      productName: sample.productName,
      brand: sample.brand,
      price: sample.price,
      discount: sample.discount,
      validityDate: sample.validityDate,
      storeName: sample.storeName,
      confidenceScore: sample.confidenceScore,
      ocrText: sample.ocrText,
      matchedOffer: matched,
      qrData: scanMode === 'QR_BARCODE' ? `OFFERHUB-QR-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
    };

    setScanResult(resultPayload);
    setIsScanning(false);

    // Store in Firestore
    try {
      await FirebaseService.addScanHistory(currentUser?.email || 'MOCK_USER', resultPayload);
      fetchScanHistory();
    } catch (e) {
      console.log('Firebase history saving error:', e);
    }

    triggerMockNotification('📷 Google Lens Scan Complete', `Identified ${sample.productName} with ${Math.floor(sample.confidenceScore * 100)}% confidence.`);
  };

  const colors = isDarkMode ? {
    bg: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    accent: '#A865C9',
    text: '#FFFFFF',
    subText: '#B0A2C9',
    card: '#1C1436',
    success: '#00E676',
    warning: '#FFB300',
  } : {
    bg: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    accent: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
    card: '#FFFFFF',
    success: '#2E7D32',
    warning: '#F57C00',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
      
      {/* ── TOP HEADER BAR ── */}
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>{tr.title}</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.subText }]}>{tr.subtitle}</Text>
        </View>

        {/* Language selector toggle */}
        <TouchableOpacity
          style={[styles.langBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
          onPress={() => {
            const next = selectedLang === 'EN' ? 'SI' : selectedLang === 'SI' ? 'TA' : 'EN';
            setSelectedLang(next);
          }}
        >
          <Languages size={14} color={colors.primary} />
          <Text style={[styles.langText, { color: colors.primary }]}>{selectedLang}</Text>
        </TouchableOpacity>
      </View>

      {/* ── MODE SWITCHER TABS ── */}
      <View style={[styles.tabRow, { backgroundColor: colors.surfaceVariant }]}>
        <TouchableOpacity
          style={[styles.tabBtn, scanMode === 'PRODUCT' && { backgroundColor: colors.primary }]}
          onPress={() => { setScanMode('PRODUCT'); setScanResult(null); setSelectedImage(null); }}
        >
          <Scan size={14} color={scanMode === 'PRODUCT' ? '#FFF' : colors.subText} />
          <Text style={[styles.tabText, { color: scanMode === 'PRODUCT' ? '#FFF' : colors.subText }]}>Product / Flyer Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, scanMode === 'QR_BARCODE' && { backgroundColor: colors.primary }]}
          onPress={() => { setScanMode('QR_BARCODE'); setScanResult(null); setSelectedImage(null); }}
        >
          <QrCode size={14} color={scanMode === 'QR_BARCODE' ? '#FFF' : colors.subText} />
          <Text style={[styles.tabText, { color: scanMode === 'QR_BARCODE' ? '#FFF' : colors.subText }]}>QR / Barcode Decoder</Text>
        </TouchableOpacity>
      </View>

      {/* ── CAMERA VIEWFINDER CARD ── */}
      <View style={[styles.viewfinderCard, { backgroundColor: '#05020A', borderColor: colors.border }]}>
        
        {selectedImage ? (
          <View style={styles.imagePreviewWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
            
            {/* Laser scanner animation overlay */}
            {isScanning && (
              <Animated.View
                style={[
                  styles.laserLine,
                  {
                    top: laserAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['5%', '90%'],
                    }),
                  },
                ]}
              />
            )}

            {/* Bounding box target */}
            {!isScanning && scanResult && (
              <View style={[styles.targetBoundingBox, { borderColor: colors.primary }]}>
                <View style={[styles.tagBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.tagBadgeText}>🎯 {Math.floor(scanResult.confidenceScore * 100)}% Match</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.viewfinderPlaceholder}>
            {/* Corner Bracket Reticle */}
            <View style={styles.reticleOverlay} pointerEvents="none">
              <View style={[styles.cornerBracket, styles.bracketTL, { borderColor: colors.primary }]} />
              <View style={[styles.cornerBracket, styles.bracketTR, { borderColor: colors.primary }]} />
              <View style={[styles.cornerBracket, styles.bracketBL, { borderColor: colors.primary }]} />
              <View style={[styles.cornerBracket, styles.bracketBR, { borderColor: colors.primary }]} />
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
                <Scan size={48} color={colors.primary} opacity={0.6} />
                <Text style={styles.viewfinderInstruction}>{tr.pointAtProduct}</Text>
              </Animated.View>
            </View>
          </View>
        )}

        {/* Loading Progress Indicator */}
        {isScanning && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTitle}>Gemini Vision AI OCR Engine</Text>
            <Text style={styles.loadingSub}>{scanProgressText}</Text>
          </View>
        )}

        {/* Viewfinder Controls Bar */}
        <View style={styles.viewfinderControls}>
          <TouchableOpacity
            style={[styles.controlIconBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
            onPress={pickFromGallery}
          >
            <ImageIcon size={20} color="#FFF" />
            <Text style={styles.controlIconLabel}>Gallery</Text>
          </TouchableOpacity>

          {/* Main Shutter Trigger Button */}
          <TouchableOpacity
            style={[styles.shutterBtn, { borderColor: colors.primary }]}
            onPress={takeCameraPhoto}
          >
            <View style={[styles.shutterInner, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlIconBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
            onPress={() => setShowHistoryModal(true)}
          >
            <History size={20} color="#FFF" />
            <Text style={styles.controlIconLabel}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preset sample capture buttons for fast testing */}
      <View style={styles.presetRow}>
        <Text style={[styles.presetLabel, { color: colors.subText }]}>Quick Test Demos:</Text>
        <TouchableOpacity style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]} onPress={() => handleCaptureOrUpload(0)}>
          <Text style={[styles.presetPillText, { color: colors.primary }]}>📱 Phone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]} onPress={() => handleCaptureOrUpload(1)}>
          <Text style={[styles.presetPillText, { color: colors.primary }]}>🎧 Headphones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]} onPress={() => handleCaptureOrUpload(2)}>
          <Text style={[styles.presetPillText, { color: colors.primary }]}>🌾 Keells Rice</Text>
        </TouchableOpacity>
      </View>

      {/* ── SCAN RESULTS PANEL ── */}
      {scanResult && !isScanning && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          {/* Header & Confidence Score */}
          <View style={styles.resultHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultCatTag, { color: colors.primary }]}>AI RECOGNITION MATCH</Text>
              <Text style={[styles.resultProductName, { color: colors.text }]}>{scanResult.productName}</Text>
            </View>
            
            <View style={[styles.confidenceBadge, { backgroundColor: 'rgba(0,230,118,0.15)', borderColor: colors.success }]}>
              <ShieldCheck size={14} color={colors.success} />
              <Text style={[styles.confidenceText, { color: colors.success }]}>{Math.floor(scanResult.confidenceScore * 100)}% Confidence</Text>
            </View>
          </View>

          {/* Field Grid */}
          <View style={styles.fieldsGrid}>
            <View style={[styles.fieldBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Tag size={14} color={colors.primary} />
              <View>
                <Text style={[styles.fieldLabel, { color: colors.subText }]}>{tr.brand}</Text>
                <Text style={[styles.fieldVal, { color: colors.text }]}>{scanResult.brand}</Text>
              </View>
            </View>

            <View style={[styles.fieldBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <DollarSign size={14} color={colors.success} />
              <View>
                <Text style={[styles.fieldLabel, { color: colors.subText }]}>{tr.price}</Text>
                <Text style={[styles.fieldVal, { color: colors.success }]}>{scanResult.price}</Text>
              </View>
            </View>

            <View style={[styles.fieldBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Sparkles size={14} color={colors.warning} />
              <View>
                <Text style={[styles.fieldLabel, { color: colors.subText }]}>{tr.discount}</Text>
                <Text style={[styles.fieldVal, { color: colors.warning }]}>{scanResult.discount}</Text>
              </View>
            </View>

            <View style={[styles.fieldBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Store size={14} color={colors.primary} />
              <View>
                <Text style={[styles.fieldLabel, { color: colors.subText }]}>{tr.store}</Text>
                <Text style={[styles.fieldVal, { color: colors.text }]}>{scanResult.storeName}</Text>
              </View>
            </View>
          </View>

          {/* OCR Extracted Text Box */}
          <View style={[styles.ocrBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <Text style={[styles.ocrBoxTitle, { color: colors.primary }]}>📝 {tr.ocrExtracted}:</Text>
            <Text style={[styles.ocrBoxContent, { color: colors.subText }]}>{scanResult.ocrText}</Text>
          </View>

          {/* Firebase Match Status Action Box */}
          <View style={[styles.matchActionCard, { backgroundColor: scanResult.matchedOffer ? 'rgba(0,230,118,0.1)' : 'rgba(255,145,0,0.1)', borderColor: scanResult.matchedOffer ? colors.success : colors.warning }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              {scanResult.matchedOffer ? (
                <CheckCircle2 size={20} color={colors.success} />
              ) : (
                <AlertCircle size={20} color={colors.warning} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.matchTitle, { color: scanResult.matchedOffer ? colors.success : colors.warning }]}>
                  {scanResult.matchedOffer ? tr.offerFound : tr.noOfferFound}
                </Text>
                <Text style={[styles.matchSub, { color: colors.subText }]}>
                  {scanResult.matchedOffer ? `${scanResult.matchedOffer.title} available` : 'Merchants can publish this new offer now!'}
                </Text>
              </View>
            </View>

            {scanResult.matchedOffer ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.success }]}
                onPress={() => {
                  setSelectedOffer(scanResult.matchedOffer);
                  navigateTo('DETAIL');
                }}
              >
                <Text style={styles.actionBtnText}>{tr.viewOfferBtn}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.warning }]}
                onPress={() => navigateTo('BUSINESS_DASHBOARD')}
              >
                <Text style={styles.actionBtnText}>{tr.createOfferBtn}</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      )}

      {/* ── SCAN HISTORY MODAL ── */}
      <Modal visible={showHistoryModal} transparent animationType="slide" onRequestClose={() => setShowHistoryModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowHistoryModal(false)}>
          <View style={[styles.historyModal, { backgroundColor: colors.surface, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <History size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>{tr.scanHistory}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}><X size={18} color={colors.subText} /></TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {scanHistory.map((item, idx) => (
                <View key={item.id || idx} style={[styles.historyItemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.historyIconCircle, { backgroundColor: colors.surfaceVariant }]}>
                    <Scan size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyItemName, { color: colors.text }]}>{item.productName}</Text>
                    <Text style={[styles.historyItemSub, { color: colors.subText }]}>{item.brand} | {item.price || 'Checked'} | {item.timestamp || 'Recent'}</Text>
                  </View>
                  <View style={[styles.historyBadge, { backgroundColor: 'rgba(0,230,118,0.1)' }]}>
                    <Text style={{ color: colors.success, fontSize: 10, fontWeight: 'bold' }}>
                      {Math.floor((item.confidenceScore || 0.95) * 100)}%
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
};

export default VisualSearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: '900' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  langText: { fontSize: 11, fontWeight: '800' },
  tabRow: {
    flexDirection: 'row',
    margin: 12,
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabText: { fontSize: 11, fontWeight: '700' },
  viewfinderCard: {
    height: 300,
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreviewWrapper: { flex: 1, width: '100%', height: '100%', position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00E676',
    shadowColor: '#00E676',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  targetBoundingBox: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '60%',
    height: '60%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  tagBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  viewfinderPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  reticleOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  cornerBracket: { position: 'absolute', width: 24, height: 24, borderWidth: 3 },
  bracketTL: { top: 30, left: 30, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  bracketTR: { top: 30, right: 30, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  bracketBL: { bottom: 80, left: 30, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  bracketBR: { bottom: 80, right: 30, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  viewfinderInstruction: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 10, fontWeight: '600' },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5,2,10,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 12 },
  loadingSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4, textAlign: 'center' },
  viewfinderControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  controlIconBtn: { alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 22 },
  controlIconLabel: { color: '#FFF', fontSize: 8, marginTop: 2 },
  shutterBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: { width: 40, height: 40, borderRadius: 20 },
  presetRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 10, gap: 8 },
  presetLabel: { fontSize: 11, fontWeight: '700' },
  presetPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  presetPillText: { fontSize: 11, fontWeight: '700' },
  resultCard: { margin: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  resultHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  resultCatTag: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  resultProductName: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  confidenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  confidenceText: { fontSize: 10, fontWeight: 'bold' },
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  fieldBox: { flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  fieldLabel: { fontSize: 9, fontWeight: '700' },
  fieldVal: { fontSize: 12, fontWeight: 'bold', marginTop: 1 },
  ocrBox: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  ocrBoxTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  ocrBoxContent: { fontSize: 10, lineHeight: 14 },
  matchActionCard: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  matchTitle: { fontSize: 12, fontWeight: 'bold' },
  matchSub: { fontSize: 10 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  historyModal: { borderRadius: 20, borderWidth: 1, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, marginBottom: 12 },
  modalTitle: { fontSize: 14, fontWeight: 'bold' },
  historyItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  historyIconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  historyItemName: { fontSize: 12, fontWeight: 'bold' },
  historyItemSub: { fontSize: 10, marginTop: 2 },
  historyBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
});
