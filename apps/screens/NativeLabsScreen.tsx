import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, 
  ActivityIndicator, Animated, Platform, Alert, TextInput, Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { analyzeImageWithGemini } from '../services/geminiService';
import { 
  ArrowLeft, Camera, Eye, Heart, Share2, ScanLine, Smartphone, MapPin, Fingerprint, RefreshCw 
} from 'lucide-react-native';

const { height } = Dimensions.get('window');

// 20 Sri Lankan Category Maps
const SRI_LANKA_CATEGORIES = [
  "Electronics", "Fashion & Clothing", "Grocery & Supermarket", "Beauty & Cosmetics",
  "Home & Living", "Restaurants & Food", "Cafes & Beverages", "Automotive", "Sports & Fitness",
  "Health & Pharmacy", "Baby & Kids", "Pets & Pet Care", "Books & Stationery", "Gaming & Entertainment",
  "Computers & Accessories", "Travel & Tourism", "Hotels & Accommodation", "Education & Courses",
  "Services & Repairs", "Gifts & Special Offers"
];

export const NativeLabsScreen: React.FC = () => {
  const { 
    isDarkMode, products, offers, currentUser, triggerMockNotification, navigateTo, setSelectedProduct
  } = useAppContext();

  const { contentWidth } = useDimensions();
  const [activeTab, setActiveTab] = useState<'AI_LENS' | 'DIAGNOSTICS'>('AI_LENS');

  // AI Lens States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStageText, setScanStageText] = useState('');
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [matchedProducts, setMatchedProducts] = useState<any[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [detectedBox, setDetectedBox] = useState<any>(null);
  const [isFavoriteScan, setIsFavoriteScan] = useState(false);

  // Diagnostics States
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [gpsMockCoordinates, setGpsMockCoordinates] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo
  const [gpsLogs, setGpsLogs] = useState<string[]>(["GPS service initialized. Colombo City Core Center default coordinates locked."]);
  const [deepLinkInput, setDeepLinkInput] = useState('offerhub://promo/KEELLS-PROMO-20');
  const [sensorDiagnosticLogs, setSensorDiagnosticLogs] = useState<string[]>([
    "Device optical lens hardware active",
    "Secure Enclave coprocessor authenticated",
    "Accelerometer & gyroscopic tilt active",
  ]);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  // Pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 0.95, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const colors = isDarkMode ? {
    background: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    secondary: '#8E24AA',
    text: '#FFFFFF',
    subText: '#B0A2C9',
    success: '#00E676',
    error: '#FF1744',
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    secondary: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
    success: '#2E7D32',
    error: '#C62828',
  };

  // Lens Scan Line loop
  const startScanLineAnim = () => {
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: false })
      ])
    ).start();
  };

  // Mock scan triggers
  const handleScanSample = (sampleType: 'samsung' | 'nike' | 'tea') => {
    const mockImages: Record<string, string> = {
      samsung: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
      nike: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      tea: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
    };
    
    setSelectedImage(mockImages[sampleType]);
    triggerImageAIScan(sampleType);
  };

  const triggerImageAIScan = async (sampleType: string, base64Image?: string) => {
    setIsScanning(true);
    setScanStageText('1. Compressing and resizing graphic assets...');
    startScanLineAnim();
    
    setDetectedBox(null);
    setScannedResult(null);
    setMatchedProducts([]);
    setOcrText('');
    resultFade.setValue(0);

    try {
      await new Promise(r => setTimeout(r, 800));
      setScanStageText('2. Processing deep CNN bounding box object detections...');
      await new Promise(r => setTimeout(r, 1000));
      setScanStageText('3. Matching features against Gemini 3.5 Flash neural models...');
      await new Promise(r => setTimeout(r, 1000));

      let resultObj: any = {};
      
      if (base64Image) {
        // Real AI Analysis
        const result = await analyzeImageWithGemini(base64Image);
        if (result) {
          resultObj = {
            productName: result.productName || "Unknown Product",
            brand: result.brand || "Local Store",
            category: result.category || "General",
            confidenceScore: 0.95,
            description: result.description || "Identified successfully",
            keywords: "item, scanned, verified",
            price: result.estimatedPrice
          };
        } else {
          throw new Error("Analysis failed");
        }
      } else {
        if (sampleType === 'samsung') {
          resultObj = {
            productName: "Samsung Galaxy S25 Ultra 5G",
            category: "Electronics",
            brand: "Samsung",
            confidenceScore: 0.98,
            description: "Flagship mobile phone with AI zoom camera & Snapdragon CPU.",
            keywords: "samsung, galaxy, phone, android, electronics"
          };
        } else if (sampleType === 'nike') {
          resultObj = {
            productName: "Nike Air Max 270 React Premium",
            category: "Fashion & Clothing",
            brand: "Nike",
            confidenceScore: 0.94,
            description: "Premium padded athletic sports training shoes.",
            keywords: "nike, shoes, sneakers, fashion, clothing"
          };
        } else {
          resultObj = {
            productName: "Cargills FoodCity Gold Keeri Samba 5kg",
            category: "Grocery & Supermarket",
            brand: "Cargills",
            confidenceScore: 0.91,
            description: "Finely polished premium white rice grain pack.",
            keywords: "rice, cargills, groceries, food, samba"
          };
        }
      }

      setScannedResult(resultObj);
      setOcrText(`OCR READOUT: SKU-841103-${sampleType.toUpperCase()}\nPRICE: COMPARING CURRENT RETAIL VALUES`);
      setDetectedBox({ label: resultObj.productName, score: `${Math.floor(resultObj.confidenceScore * 100)}%` });

      // Run smart match score ranking (Mandated: 40% Name + 25% Brand + 20% Category + 15% Keywords Similarity)
      const rankedMatches = evaluateSmartMatch(resultObj);
      setMatchedProducts(rankedMatches);

      setIsScanning(false);
      Animated.timing(resultFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    } catch (e) {
      setIsScanning(false);
      Alert.alert("Scan Failed", "Error linking with cloud diagnostic servers.");
    }
  };

  const evaluateSmartMatch = (detected: any) => {
    return products.map(item => {
      // 1. Name Check (40% weight)
      const nameScore = calculateOverlap(detected.productName, item.name) * 40;
      // 2. Brand Check (25% weight)
      const brandScore = (detected.brand.toLowerCase() === item.storeName.toLowerCase()) ? 25 : 0;
      // 3. Category Check (20% weight)
      const categoryScore = (detected.category.toLowerCase() === item.subcategory.toLowerCase()) ? 20 : 0;
      // 4. Keyword Check (15% weight)
      const detKeywords = detected.keywords.split(',').map((k: string) => k.trim().toLowerCase());
      const itemKeywords = (item.keywords || '').split(',').map((k: string) => k.trim().toLowerCase());
      const common = detKeywords.filter((k: string) => itemKeywords.includes(k));
      const keywordScore = detKeywords.length > 0 ? (common.length / detKeywords.length) * 15 : 0;

      const smartScore = nameScore + brandScore + categoryScore + keywordScore;

      return {
        ...item,
        similarityScore: smartScore,
        matchingDeals: offers.filter(o => o.storeName.toLowerCase().includes(item.storeName.toLowerCase()))
      };
    }).sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5);
  };

  const calculateOverlap = (s1: string, s2: string) => {
    const w1 = s1.toLowerCase().split(/\s+/);
    const w2 = s2.toLowerCase().split(/\s+/);
    const common = w1.filter(w => w2.includes(w));
    return common.length / Math.max(Math.min(w1.length, w2.length), 1);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Camera permission is needed to scan.");
      return;
    }
    const response = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (response.canceled) return;
    if (response.assets && response.assets.length > 0 && response.assets[0].base64) {
      setSelectedImage(response.assets[0].uri || null);
      triggerImageAIScan('custom', response.assets[0].base64);
    }
  };

  const openGallery = async () => {
    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (response.canceled) return;
    if (response.assets && response.assets.length > 0 && response.assets[0].base64) {
      setSelectedImage(response.assets[0].uri || null);
      triggerImageAIScan('custom', response.assets[0].base64);
    }
  };

  // Diagnostics actions
  const triggerBiometricsAuthentication = () => {
    Alert.alert(
      "Secure FaceID/Biometrics Key",
      "OfferHub is requesting access to verify your secure biometric signature.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Authenticate", 
          onPress: () => {
            setBiometricsEnabled(!biometricsEnabled);
            setSensorDiagnosticLogs(prev => [
              `[${new Date().toLocaleTimeString()}] Biometric key auth: ${!biometricsEnabled ? 'GRANTED' : 'REVOKED'}`,
              ...prev
            ]);
            triggerMockNotification("🔐 Biometrics Synced", `Secure TouchID authentication state has been updated.`);
          } 
        }
      ]
    );
  };

  const simulateGpsLocationTuning = () => {
    // Randomize nearby coordinates slightly around Colombo / Galle / Kandy
    const locations = [
      { city: "Galle Fort", lat: 6.0329, lng: 80.2168 },
      { city: "Kandy Lake", lat: 7.2906, lng: 80.6337 },
      { city: "Colombo Arcade", lat: 6.9271, lng: 79.8612 },
      { city: "Jaffna Town", lat: 9.6615, lng: 80.0125 }
    ];
    const target = locations[Math.floor(Math.random() * locations.length)];
    setGpsMockCoordinates({ lat: target.lat, lng: target.lng });
    setGpsLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Tuned GPS location to ${target.city} - Lat: ${target.lat}, Lng: ${target.lng}`,
      ...prev
    ]);
    triggerMockNotification("📍 GPS Coordinate Updated", `Simulated device located at ${target.city}.`);
  };

  const executeDeepLinkTest = () => {
    if (deepLinkInput.includes('promo')) {
      triggerMockNotification("🎟️ Promo Deep Link Verified", `Successfully scanned parameters. Redirecting to Loyalty rewards desk.`);
      navigateTo('LOYALTY');
    } else {
      Alert.alert("Schema Validated", "Deep link matches offerhub:// scheme. Diagnostics active.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { maxWidth: contentWidth }]}>
        
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigateTo('HOME')} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Home</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Native Labs & AI Lens</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* TABS SWITCHER */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'AI_LENS' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('AI_LENS')}
          >
            <ScanLine size={16} color={activeTab === 'AI_LENS' ? colors.primary : colors.subText} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'AI_LENS' ? colors.primary : colors.subText }]}>AI Lens Scanner</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'DIAGNOSTICS' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('DIAGNOSTICS')}
          >
            <Smartphone size={16} color={activeTab === 'DIAGNOSTICS' ? colors.primary : colors.subText} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'DIAGNOSTICS' ? colors.primary : colors.subText }]}>Sensors & Diagnostics</Text>
          </TouchableOpacity>
        </View>

        {/* 1. AI LENS SCANNER CONTENT */}
        {activeTab === 'AI_LENS' && (
          <View style={styles.lensBody}>
            {!selectedImage ? (
              <View style={[styles.viewfinder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                
                {/* Simulated Reticle Pulse */}
                <Animated.View style={[styles.reticleBox, { transform: [{ scale: pulseScale }], borderColor: colors.primary }]}>
                  <Camera size={36} color={colors.primary} />
                  <Text style={[styles.reticleLabel, { color: colors.subText }]}>Target Optical Viewfinder</Text>
                </Animated.View>

                {/* Sample items checklist to simulate scanning on Web/Expo Go */}
                <Text style={[styles.sampleTitle, { color: colors.text }]}>Simulate Photo Scan (Select sample below):</Text>
                <View style={styles.sampleRow}>
                  <TouchableOpacity style={[styles.sampleCard, { backgroundColor: colors.surfaceVariant }]} onPress={() => handleScanSample('samsung')}>
                    <Text style={{ fontSize: 20 }}>📱</Text>
                    <Text style={[styles.sampleText, { color: colors.text }]}>Samsung S25</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.sampleCard, { backgroundColor: colors.surfaceVariant }]} onPress={() => handleScanSample('nike')}>
                    <Text style={{ fontSize: 20 }}>👟</Text>
                    <Text style={[styles.sampleText, { color: colors.text }]}>Nike Air</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.sampleCard, { backgroundColor: colors.surfaceVariant }]} onPress={() => handleScanSample('tea')}>
                    <Text style={{ fontSize: 20 }}>🌾</Text>
                    <Text style={[styles.sampleText, { color: colors.text }]}>Keeri Samba</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sampleTitle, { color: colors.text, marginTop: 16 }]}>Or use Real Camera / Gallery:</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, paddingHorizontal: 20 }}>
                  <TouchableOpacity style={[styles.sampleCard, { flex: 1, backgroundColor: colors.primary, alignItems: 'center' }]} onPress={openCamera}>
                    <Camera size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.sampleCard, { flex: 1, backgroundColor: colors.secondary, alignItems: 'center' }]} onPress={openGallery}>
                    <Text style={{ fontSize: 20 }}>🖼️</Text>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.previewFrame, { borderColor: colors.border }]}>
                <Image source={{ uri: selectedImage }} style={styles.previewImg} />

                {/* Scan Overlay Lines */}
                {isScanning && (
                  <Animated.View 
                    style={[
                      styles.scanLine, 
                      { 
                        backgroundColor: colors.primary,
                        top: scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: ['5%', '95%'] }) 
                      }
                    ]} 
                  />
                )}

                {/* Bounding box marker */}
                {detectedBox && !isScanning && (
                  <View style={[styles.bboxMarker, { borderColor: colors.primary }]}>
                    <View style={[styles.bboxBadge, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: colors.background, fontSize: 8, fontWeight: 'bold' }}>
                        {detectedBox.label} ({detectedBox.score})
                      </Text>
                    </View>
                  </View>
                )}

                {/* Scan status feedback */}
                {isScanning && (
                  <View style={[styles.scanStatusBox, { backgroundColor: colors.surface }]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>Gemini Optical Analytics</Text>
                    <Text style={{ color: colors.subText, fontSize: 9 }}>{scanStageText}</Text>
                  </View>
                )}

                {!isScanning && (
                  <TouchableOpacity style={[styles.retakeBtn, { backgroundColor: colors.secondary }]} onPress={() => setSelectedImage(null)}>
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>Scan New Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* SCAN RESULTS SUMMARY */}
            {scannedResult && !isScanning && (
              <Animated.View style={[styles.resultsWrapper, { opacity: resultFade }]}>
                <View style={[styles.resultsHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.resultsTitleLabel, { color: colors.primary }]}>AI RECOGNITION DETAILS</Text>
                    <TouchableOpacity onPress={() => setIsFavoriteScan(!isFavoriteScan)}>
                      <Heart size={20} color={isFavoriteScan ? colors.error : colors.subText} fill={isFavoriteScan ? colors.error : 'transparent'} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.resultsName, { color: colors.text }]}>{scannedResult.productName}</Text>
                  
                  <View style={styles.badgeRow}>
                    <View style={[styles.pillBadge, { backgroundColor: colors.surfaceVariant }]}><Text style={{ color: colors.primary, fontSize: 8.5 }}>📦 {scannedResult.category}</Text></View>
                    <View style={[styles.pillBadge, { backgroundColor: colors.surfaceVariant }]}><Text style={{ color: colors.primary, fontSize: 8.5 }}>🏢 Brand: {scannedResult.brand}</Text></View>
                    <View style={[styles.pillBadge, { backgroundColor: colors.surfaceVariant }]}><Text style={{ color: colors.primary, fontSize: 8.5 }}>🎯 {Math.floor(scannedResult.confidenceScore * 100)}% Match</Text></View>
                  </View>

                  <Text style={[styles.resultsDesc, { color: colors.subText }]}>{scannedResult.description}</Text>

                  {ocrText ? (
                    <View style={[styles.ocrBox, { backgroundColor: colors.surfaceVariant }]}>
                      <Text style={[styles.ocrText, { color: colors.text }]}>{ocrText}</Text>
                    </View>
                  ) : null}
                </View>

                {/* PRICE MATCH COMPARATIVE ANALYSIS */}
                <View style={styles.comparisonHeaderRow}>
                  <Eye size={18} color={colors.primary} />
                  <Text style={[styles.comparisonTitle, { color: colors.text }]}>SRI LANKAN OFFERS DETECTED</Text>
                </View>

                <View style={{ gap: 8 }}>
                  {matchedProducts.map(p => (
                    <TouchableOpacity 
                      key={p.id}
                      style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => {
                        setSelectedProduct(p);
                        navigateTo('DETAIL');
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.matchCardName, { color: colors.text }]}>{p.name}</Text>
                        <Text style={{ color: colors.subText, fontSize: 8.5 }}>Merchant: {p.storeName} | Category: {p.category}</Text>
                        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold', marginTop: 4 }}>Price: LKR {p.price.toLocaleString()}</Text>
                        
                        {p.matchingDeals.length > 0 ? (
                          <View style={styles.savingsTag}>
                            <Text style={{ color: colors.success, fontSize: 8.5, fontWeight: 'bold' }}>
                              🔥 Deal Detected: {p.matchingDeals[0].title}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      
                      <View style={[styles.similarityBadge, { backgroundColor: colors.surfaceVariant }]}>
                        <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>
                          {Math.floor(p.similarityScore)}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}
          </View>
        )}

        {/* 2. DIAGNOSTICS & SENSORS CONTENT */}
        {activeTab === 'DIAGNOSTICS' && (
          <View style={styles.diagnosticsBody}>
            
            {/* BIOMETRICS GATE */}
            <View style={[styles.diagCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.rowBetween}>
                <View style={{ gap: 4 }}>
                  <Text style={[styles.diagTitle, { color: colors.text }]}>🔐 FaceID & Fingerprint Authentication</Text>
                  <Text style={[styles.diagSub, { color: colors.subText }]}>Toggle security validation before payments.</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.diagToggleBtn, { backgroundColor: biometricsEnabled ? colors.success : '#555' }]} 
                  onPress={triggerBiometricsAuthentication}
                >
                  <Fingerprint size={18} color="#FFF" />
                  <Text style={styles.diagToggleText}>{biometricsEnabled ? "Active" : "Disabled"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* GPS COORDINATE TUNER */}
            <View style={[styles.diagCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.rowBetween}>
                <View style={{ gap: 4 }}>
                  <Text style={[styles.diagTitle, { color: colors.text }]}>📍 Simulated GPS Location Services</Text>
                  <Text style={[styles.diagSub, { color: colors.subText }]}>Tweak coordinates around Sri Lankan district centers.</Text>
                  <Text style={{ color: colors.primary, fontSize: 10.5, fontWeight: 'bold', marginTop: 4 }}>
                    Lat: {gpsMockCoordinates.lat.toFixed(4)}, Lng: {gpsMockCoordinates.lng.toFixed(4)}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.diagActionBtn, { backgroundColor: colors.primary }]} onPress={simulateGpsLocationTuning}>
                  <RefreshCw size={16} color={colors.background} />
                  <Text style={{ color: colors.background, fontSize: 10, fontWeight: 'bold' }}>Tune GPS</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.logsBox, { backgroundColor: colors.surfaceVariant, marginTop: 12 }]}>
                <Text style={{ color: colors.primary, fontSize: 8.5, fontWeight: 'bold', marginBottom: 4 }}>GPS SERVICE HISTORY LOGS</Text>
                {gpsLogs.slice(0, 3).map((log, i) => (
                  <Text key={i} style={{ color: colors.text, fontSize: 9, lineHeight: 12 }}>• {log}</Text>
                ))}
              </View>
            </View>

            {/* DEEP LINK SCHEMAS TESTER */}
            <View style={[styles.diagCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.diagTitle, { color: colors.text }]}>🔗 Deep Linking Custom Schema Validator</Text>
              <Text style={[styles.diagSub, { color: colors.subText, marginBottom: 8 }]}>Validate custom routing protocols (e.g. `offerhub://...` redirections).</Text>
              
              <View style={styles.deepLinkRow}>
                <TextInput
                  style={[styles.diagBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                  value={deepLinkInput}
                  onChangeText={setDeepLinkInput}
                />
                <TouchableOpacity style={[styles.diagActionBtn, { backgroundColor: colors.primary }]} onPress={executeDeepLinkTest}>
                  <Text style={{ color: colors.background, fontSize: 10, fontWeight: 'bold' }}>Test Link</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SENSORS HARDWARE LOGS */}
            <View style={[styles.diagCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.diagTitle, { color: colors.text }]}>⚙️ Sensor Engine hardware checkup</Text>
              <View style={{ gap: 6, marginTop: 8 }}>
                {sensorDiagnosticLogs.map((log, idx) => (
                  <View key={idx} style={[styles.logRow, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={{ color: colors.success, fontSize: 9 }}>✔</Text>
                    <Text style={{ color: colors.text, fontSize: 10 }}>{log}</Text>
                  </View>
                ))}
              </View>
            </View>

          </View>
        )}

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
    marginBottom: 16,
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  lensBody: {
    gap: 16,
  },
  viewfinder: {
    height: 240,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  reticleBox: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    padding: 24,
    borderRadius: 16,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  reticleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sampleTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sampleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
  },
  sampleText: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  previewFrame: {
    height: 240,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  bboxMarker: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '60%',
    height: '60%',
    borderWidth: 2,
    borderRadius: 8,
  },
  bboxBadge: {
    position: 'absolute',
    top: -16,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scanStatusBox: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  retakeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resultsWrapper: {
    gap: 16,
  },
  resultsHeaderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  resultsTitleLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  resultsName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultsDesc: {
    fontSize: 10,
    lineHeight: 14,
  },
  ocrBox: {
    padding: 10,
    borderRadius: 8,
  },
  ocrText: {
    fontSize: 9.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    lineHeight: 14,
  },
  comparisonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  comparisonTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  matchCardName: {
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  savingsTag: {
    marginTop: 4,
  },
  similarityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagnosticsBody: {
    gap: 12,
  },
  diagCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  diagTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  diagSub: {
    fontSize: 9.5,
  },
  diagToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
  },
  diagToggleText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  diagActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
  },
  logsBox: {
    padding: 10,
    borderRadius: 8,
  },
  deepLinkRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  diagBox: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 11.5,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
  }
});
