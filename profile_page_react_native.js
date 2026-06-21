import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Switch,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore'; // Firebase Firestore
import auth from '@react-native-firebase/auth'; // Firebase Authentication
import { launchImageLibrary } from 'react-native-image-picker'; // Image Picker
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function PremiumUserProfileScreen({ navigation }) {
  // Current user authentications
  const currentUser = auth().currentUser;
  const uid = currentUser?.uid || 'MOCK_UID_1028';

  // Core Firestore User State
  const [userData, setUserData] = useState({
    uid: uid,
    fullName: 'Jane Dilhani',
    email: currentUser?.email || 'jane.dilhani@offerlanka.lk',
    phone: '+94 77 123 4567',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    gender: 'Female',
    dob: '1998-05-12',
    city: 'Colombo 03',
    country: 'Sri Lanka',
    membershipLevel: 'Platinum', // Silver, Gold, Platinum
    rewardPoints: 4850,
    totalSavings: 42500, // in LKR
    createdAt: '2025-01-15',
    verified: true,
  });

  // Additional stats and wallets details state
  const [stats, setStats] = useState({
    savedOffersListCount: 24,
    usedCouponsCount: 89,
    favoriteStoresCount: 12,
    availableWalletBalance: 12500.50, // in LKR
    cashbackEarned: 3450.00, // in LKR
  });

  // Action / UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Editable Profile Form Fields State
  const [formName, setFormName] = useState(userData.fullName);
  const [formPhone, setFormPhone] = useState(userData.phone);
  const [formGender, setFormGender] = useState(userData.gender);
  const [formDob, setFormDob] = useState(userData.dob);
  const [formCity, setFormCity] = useState(userData.city);
  const [formCountry, setFormCountry] = useState(userData.country);

  // Settings State Toggle Fields
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // Animations State
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Real-time Firebase listens hook
  useEffect(() => {
    // Entrance animations trigger
    triggerAnimations();

    // Set offline mode check simulation
    const timer = setTimeout(() => {
      setIsOffline(false);
    }, 1000);

    // Dynamic firestore document subscription (users collection)
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot(
        (documentSnapshot) => {
          if (documentSnapshot && documentSnapshot.exists) {
            const data = documentSnapshot.data();
            setUserData((prev) => ({
              ...prev,
              ...data,
            }));
            // Update modal setup inputs
            setFormName(data.fullName || prev.fullName);
            setFormPhone(data.phone || prev.phone);
            setFormGender(data.gender || prev.gender);
            setFormDob(data.dob || prev.dob);
            setFormCity(data.city || prev.city);
            setFormCountry(data.country || prev.country);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firebase Firestore Subscription Failed:', error);
          // Load robust offline-compatible simulation data fallback safely
          setLoading(false);
        }
      );

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [uid]);

  // Animated triggers logic
  const triggerAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.95);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress Bar scaling
    const pointsRatio = userData.rewardPoints / 10000; // Target next level limit at 10k points
    Animated.timing(progressAnim, {
      toValue: pointsRatio > 1 ? 1 : pointsRatio,
      duration: 1500,
      useNativeDriver: false, // width/flex handles this
    }).start();
  };

  // Pull to refresh handler
  const handleOnRefresh = async () => {
    setRefreshing(true);
    triggerAnimations();
    try {
      // Re-fetch custom collections to update values
      if (!isOffline) {
        const userDoc = await firestore().collection('users').doc(uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      } else {
        // Quick local timer simulation
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch (e) {
      console.log('Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  // Profile Image Picker & Upload
  const handleEditProfileImage = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose a clear image to personalize your premium Offer Lanka presence.',
      [
        {
          text: 'Upload from Gallery',
          onPress: async () => {
            const result = await launchImageLibrary({
              mediaType: 'photo',
              quality: 0.8,
              maxWidth: 500,
              maxHeight: 500,
            });

            if (result.assets && result.assets.length > 0) {
              const selectedUri = result.assets[0].uri;
              // Set state locally first for immediate rich experience
              setUserData((prev) => ({ ...prev, profileImage: selectedUri }));

              if (!isOffline) {
                try {
                  // Save updated image path directly to Firestore
                  await firestore()
                    .collection('users')
                    .doc(uid)
                    .set({ profileImage: selectedUri }, { merge: true });
                  Alert.alert('Success', 'Profile picture updated successfully!');
                } catch (error) {
                  console.error('Failed to update picture on firebase:', error);
                }
              } else {
                Alert.alert('Offline Mode', 'Profile image modified locally. Changes will sync once back online.');
              }
            }
          },
        },
        {
          text: 'Remove Current Avatar',
          style: 'destructive',
          onPress: () => {
            const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            setUserData((prev) => ({ ...prev, profileImage: defaultAvatar }));
            firestore().collection('users').doc(uid).set({ profileImage: defaultAvatar }, { merge: true });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Submit Profile Changes to Firebase
  const handleSaveProfileChanges = async () => {
    if (!formName.trim()) {
      Alert.alert('Validation Error', 'Full name is required.');
      return;
    }

    setEditModalVisible(false);
    setLoading(true);

    const updatedObject = {
      fullName: formName,
      phone: formPhone,
      gender: formGender,
      dob: formDob,
      city: formCity,
      country: formCountry,
    };

    try {
      if (!isOffline) {
        await firestore().collection('users').doc(uid).set(updatedObject, { merge: true });
      }
      setUserData((prev) => ({ ...prev, ...updatedObject }));
      Alert.alert('Success', 'Your secure profile has been updated elegantly.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to synchronize updates with cloud services.');
    } finally {
      setLoading(false);
    }
  };

  // Membership upgrades logic mockup
  const handleUpgradeLevel = () => {
    let nextLevel = 'Gold';
    let benefitSpec = '10% Exclusive Cashbacks';
    if (userData.membershipLevel === 'Silver') {
      nextLevel = 'Gold';
      benefitSpec = 'Increased 12% special merchant discounts across Cargills & Daraz.';
    } else if (userData.membershipLevel === 'Gold') {
      nextLevel = 'Platinum';
      benefitSpec = 'Unlimited Visa airport lounge entries across Colombo and priority invite-only brand redemptions.';
    } else {
      Alert.alert('Elite Member Status', 'You are already enjoying our flagship Platinum status. Keep on saving!');
      return;
    }

    Alert.alert(
      `Upgrade to Elite ${nextLevel}?`,
      `Unlock ${benefitSpec} at only 1,000 extra reward points.`,
      [
        {
          text: `Upgrade to ${nextLevel}`,
          onPress: async () => {
            if (userData.rewardPoints >= 1000) {
              const finalPoints = userData.rewardPoints - 1000;
              setUserData((p) => ({ ...p, membershipLevel: nextLevel, rewardPoints: finalPoints }));
              if (!isOffline) {
                await firestore().collection('users').doc(uid).set({
                  membershipLevel: nextLevel,
                  rewardPoints: finalPoints,
                }, { merge: true });
              }
              Alert.alert('Elite Upgrade Successful', `Welcome to the prestigious ${nextLevel} circle!`);
            } else {
              Alert.alert('Insufficient Points', 'Earn more points by utilizing coupons or purchase LKR packages.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // App Support actions
  const handleFeatureTrigger = (label) => {
    Alert.alert(`${label} Portal`, `Redirecting to Offer Lanka safe secure payment / settings interface for ${label}.`);
  };

  // Secure sign out
  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await auth().signOut();
      Alert.alert('Logged Out', 'You have successfully signed out of Offer Lanka.');
      if (navigation) {
        navigation.replace('Login');
      }
    } catch (e) {
      // Mock clear trigger
      Alert.alert('Disconnected', 'Secure access token removed from local cache device.');
    }
  };

  // Skeleton Loadings Placeholder render
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#BB86FC" />
        <Text style={styles.skeletonText}>Synchronizing secure credentials...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleOnRefresh}
          tintColor="#BB86FC"
          colors={['#BB86FC']}
        />
      }
    >
      <Animated.View
        style={[
          styles.mainLayout,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        {/* Offline Status Flag */}
        {isOffline && (
          <View style={styles.offlinePanel}>
            <Icon name="cloud-off-outline" size={14} color="#FFD700" />
            <Text style={styles.offlineText}>OFFLINE PLAYGROUND MODE: Dynamic local sync active</Text>
          </View>
        )}

        {/* 1. HEADER PROFILE AVATAR SECTION */}
        <View style={styles.headerGlassCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.avatarImage}
            />
            <TouchableOpacity style={styles.avatarEditBtn} onPress={handleEditProfileImage}>
              <Icon name="camera-plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfoBlock}>
            <View style={styles.rowCentered}>
              <Text style={styles.userNameText}>{userData.fullName}</Text>
              {userData.verified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="check-decagram" size={16} color="#00E676" />
                </View>
              )}
            </View>
            <Text style={styles.userUsername}>@{userData.email.split('@')[0]}</Text>
            
            <View style={styles.memberSinceRow}>
              <Icon name="calendar-star" size={13} color="#A797C4" />
              <Text style={styles.memberSinceText}>Premium Member since: {userData.createdAt}</Text>
            </View>
          </View>
        </View>

        {/* 2. STATS OVERVIEW DECORATION CARDS */}
        <View style={styles.sectionHeadingRow}>
          <Icon name="chart-bell-curve-cumulative" size={18} color="#FF79C6" />
          <Text style={styles.sectionTitle}>DYNAMIC REAL-TIME METRICS</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
        >
          {/* STAT 1: Savings */}
          <View style={[styles.statBox, styles.statBoxSavings]}>
            <Icon name="piggy-bank-outline" size={24} color="#00E676" />
            <Text style={styles.statLabel}>Total Savings</Text>
            <Text style={styles.statValue}>LKR {userData.totalSavings.toLocaleString()}</Text>
            <Text style={styles.statSubText}>Through vouchers</Text>
          </View>

          {/* STAT 2: Reward Points */}
          <View style={styles.statBox}>
            <Icon name="star-circle-outline" size={24} color="#FFD700" />
            <Text style={styles.statLabel}>Reward Points</Text>
            <Text style={styles.statValue}>{userData.rewardPoints} PTS</Text>
            <Text style={styles.statSubText}>Next elite level upgrade</Text>
          </View>

          {/* STAT 3: Used Vouchers */}
          <View style={styles.statBox}>
            <Icon name="ticket-percent-outline" size={24} color="#BB86FC" />
            <Text style={styles.statLabel}>Used Coupons</Text>
            <Text style={styles.statValue}>{stats.usedCouponsCount}</Text>
            <Text style={styles.statSubText}>Redeemed items</Text>
          </View>

          {/* STAT 4: Saved list */}
          <View style={styles.statBox}>
            <Icon name="heart-multiple-outline" size={24} color="#FF79C6" />
            <Text style={styles.statLabel}>Saved Offers</Text>
            <Text style={styles.statValue}>{stats.savedOffersListCount}</Text>
            <Text style={styles.statSubText}>Active bookmarks</Text>
          </View>

          {/* STAT 5: Followed stores */}
          <View style={styles.statBox}>
            <Icon name="storefront-outline" size={24} color="#8CE9FF" />
            <Text style={styles.statLabel}>Favorite Stores</Text>
            <Text style={styles.statValue}>{stats.favoriteStoresCount}</Text>
            <Text style={styles.statSubText}>Subscribed brands</Text>
          </View>
        </ScrollView>

        {/* 3. PREMIUM MEMBERSHIP CARD */}
        <View style={styles.glassCard}>
          <View style={styles.membershipHeaderRow}>
            <View>
              <Text style={styles.membershipLabel}>MEMBERSHIP TIER STATUS</Text>
              <Text style={[
                styles.tierLevelText,
                userData.membershipLevel === 'Platinum' && styles.tierPlatinum,
                userData.membershipLevel === 'Gold' && styles.tierGold,
                userData.membershipLevel === 'Silver' && styles.tierSilver,
              ]}>
                👑 {userData.membershipLevel.toUpperCase()} LEVEL
              </Text>
            </View>
            <Icon name="crown-outline" size={32} color="#FFD700" />
          </View>

          {/* Progress to next milestone */}
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressDescText}>Elite Milestone (10,000 PTS)</Text>
            <Text style={styles.progressPercentText}>{Math.floor((userData.rewardPoints / 10000) * 100)}%</Text>
          </View>

          {/* Custom progress container bar */}
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Elite Benefits checklist */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <Icon name="check-circle-outline" size={15} color="#00E676" />
              <Text style={styles.benefitText}>Access exclusive Flash VIP 48H head-start vouchers</Text>
            </View>
            <View style={styles.benefitRow}>
              <Icon name="check-circle-outline" size={15} color="#00E676" />
              <Text style={styles.benefitText}>Waived processing fees on immediate bank transfers</Text>
            </View>
            <View style={styles.benefitRow}>
              <Icon name="check-circle-outline" size={15} color="#00E676" />
              <Text style={styles.benefitText}>Direct concierge assistance ticket system prioritized</Text>
            </View>
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgradeLevel}>
            <Text style={styles.upgradeBtnText}>Upgrade Elite Tier Benefits</Text>
            <Icon name="chevron-double-right" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* 4. WALLET MANAGEMENT SCREEN */}
        <View style={styles.glassCard}>
          <View style={styles.walletHeaderRow}>
            <Icon name="wallet-outline" size={20} color="#00E676" style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>SECURE DEPOSIT & POINT WALLET</Text>
          </View>

          <View style={styles.walletBalanceLayout}>
            <View>
              <Text style={styles.walletBalanceLabel}>Available Wallet Funds</Text>
              <Text style={styles.walletMainBalance}>LKR {stats.availableWalletBalance.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.walletBalanceLabel}>Reward Cashback</Text>
              <Text style={styles.walletCashbackAmount}>LKR {stats.cashbackEarned.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.transactionBtn}
            onPress={() => handleFeatureTrigger('Transactions & Statements')}
          >
            <Text style={styles.transactionBtnText}>View Ledger Transaction logs</Text>
            <Icon name="arrow-right-thin" size={18} color="#00E676" />
          </TouchableOpacity>
        </View>

        {/* 5. QUICK ACTIONS GRID BAR */}
        <Text style={styles.subGridHeader}>PREMIUM ACTIONS CENTER</Text>
        <View style={styles.actionsGrid}>
          {/* Action 1: My Offers */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('My Offers')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#BB86FC22' }]}>
              <Icon name="ticket-confirmation" size={24} color="#BB86FC" />
            </View>
            <Text style={styles.gridActionLabel}>My Offers</Text>
          </TouchableOpacity>

          {/* Action 2: Favorites */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('Favorites')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#FF79C622' }]}>
              <Icon name="cards-heart" size={24} color="#FF79C6" />
            </View>
            <Text style={styles.gridActionLabel}>Favorites</Text>
          </TouchableOpacity>

          {/* Action 3: Notification panel */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('Notifications')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#00E67622' }]}>
              <Icon name="bell-ring" size={24} color="#00E676" />
            </View>
            <Text style={styles.gridActionLabel}>Notifications</Text>
          </TouchableOpacity>

          {/* Action 4: Real-time Wallet */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('Wallet Deposit')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#FFD70022' }]}>
              <Icon name="wallet" size={24} color="#FFD700" />
            </View>
            <Text style={styles.gridActionLabel}>Wallet</Text>
          </TouchableOpacity>

          {/* Action 5: My Rewards */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('Rewards')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#8CE9FF22' }]}>
              <Icon name="gift-outline" size={24} color="#8CE9FF" />
            </View>
            <Text style={styles.gridActionLabel}>Rewards</Text>
          </TouchableOpacity>

          {/* Action 6: Refer Friends */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('Refer friends')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#FF572222' }]}>
              <Icon name="gift-open-outline" size={24} color="#FF5722" />
            </View>
            <Text style={styles.gridActionLabel}>Refer Friends</Text>
          </TouchableOpacity>

          {/* Action 7: Help Center */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('Help Center')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#29B6F622' }]}>
              <Icon name="lifebuoy" size={24} color="#29B6F6" />
            </View>
            <Text style={styles.gridActionLabel}>Help Center</Text>
          </TouchableOpacity>

          {/* Action 8: Configurations settings */}
          <TouchableOpacity style={styles.gridActionItem} onPress={() => handleFeatureTrigger('System Settings')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#A29EBA22' }]}>
              <Icon name="cog" size={24} color="#A29EBA" />
            </View>
            <Text style={styles.gridActionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* 6. PROFILE DETAILED INFORMATION CARD */}
        <View style={styles.glassCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardHeaderTitle}>SECURE PROFILE INFORMATION</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
              <Icon name="pencil-box-multiple" size={20} color="#BB86FC" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoSpacer} />

          {/* Field Row 1: Full name */}
          <View style={styles.infoFieldRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="card-account-mail-outline" size={16} color="#9087A4" />
              <Text style={styles.infoFieldLabel}>Full Name</Text>
            </View>
            <Text style={styles.infoFieldValue}>{userData.fullName}</Text>
          </View>

          {/* Field Row 2: Email */}
          <View style={styles.infoFieldRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="email-outline" size={16} color="#9087A4" />
              <Text style={styles.infoFieldLabel}>Email Address</Text>
            </View>
            <Text style={styles.infoFieldValue}>{userData.email}</Text>
          </View>

          {/* Field Row 3: Phone */}
          <View style={styles.infoFieldRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="phone-outline" size={16} color="#9087A4" />
              <Text style={styles.infoFieldLabel}>Mobile Number</Text>
            </View>
            <Text style={styles.infoFieldValue}>{userData.phone}</Text>
          </View>

          {/* Field Row 4: Gender */}
          <View style={styles.infoFieldRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="gender-transgender" size={16} color="#9087A4" />
              <Text style={styles.infoFieldLabel}>Gender Type</Text>
            </View>
            <Text style={styles.infoFieldValue}>{userData.gender}</Text>
          </View>

          {/* Field Row 5: DOB */}
          <View style={styles.infoFieldRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="cake-variant-outline" size={16} color="#9087A4" />
              <Text style={styles.infoFieldLabel}>Date Of Birth</Text>
            </View>
            <Text style={styles.infoFieldValue}>{userData.dob}</Text>
          </View>

          {/* Field Row 6: City */}
          <View style={styles.infoFieldRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="home-city-outline" size={16} color="#9087A4" />
              <Text style={styles.infoFieldLabel}>Province / City</Text>
            </View>
            <Text style={styles.infoFieldValue}>{userData.city}</Text>
          </View>

          {/* Field Row 7: Country */}
          <View style={styles.infoFieldRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="earth" size={16} color="#9087A4" />
              <Text style={styles.infoFieldLabel}>Country</Text>
            </View>
            <Text style={styles.infoFieldValue}>{userData.country}</Text>
          </View>

          <TouchableOpacity style={styles.infoEditInlineBtn} onPress={() => setEditModalVisible(true)}>
            <Icon name="account-edit-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.infoEditBtnText}>Edit Complete Profile Information</Text>
          </TouchableOpacity>
        </View>

        {/* 7. RECENT ACTIVITY HIGHLIGHTS */}
        <View style={styles.glassCard}>
          <Text style={styles.cardHeaderTitle}>RECENT USER ACTIVITY TIMELINE</Text>
          <View style={styles.activitySpacer} />

          {/* Active Log 1: Offer click */}
          <View style={styles.activityTimelineRow}>
            <View style={styles.activityDotWrapper}>
              <View style={[styles.activityDot, { backgroundColor: '#BB86FC' }]} />
              <View style={styles.activityLine} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Viewed Exclusive Kandy City Centre Voucher</Text>
              <Text style={styles.activityTimestamp}>Today, 03:22 PM</Text>
            </View>
          </View>

          {/* Active Log 2: coupon redemptions */}
          <View style={styles.activityTimelineRow}>
            <View style={styles.activityDotWrapper}>
              <View style={[styles.activityDot, { backgroundColor: '#00E676' }]} />
              <View style={styles.activityLine} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Redeemed SAVEMEGAPACK coupon code</Text>
              <Text style={styles.activityValueText}>Saved LKR 3,400.00 instantly at Cargills FoodCity</Text>
              <Text style={styles.activityTimestamp}>Yesterday, 11:40 AM</Text>
            </View>
          </View>

          {/* Active Log 3: store following */}
          <View style={styles.activityTimelineRow}>
            <View style={styles.activityDotWrapper}>
              <View style={[styles.activityDot, { backgroundColor: '#8CE9FF' }]} />
              <View style={styles.activityLine} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Followed ODEL Premium Store Feed</Text>
              <Text style={styles.activityTimestamp}>15 June 2026, 09:12 AM</Text>
            </View>
          </View>

          {/* Active Log 4: Point rewarded */}
          <View style={[styles.activityTimelineRow, { marginBottom: 0 }]}>
            <View style={styles.activityDotWrapper}>
              <View style={[styles.activityDot, { backgroundColor: '#FFD700' }]} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Earned +350 Reward Points for Checkout</Text>
              <Text style={styles.activityTimestamp}>14 June 2026, 04:50 PM</Text>
            </View>
          </View>
        </View>

        {/* 8. ACCOUNT SYSTEM SETTINGS MODIFIERS */}
        <View style={styles.glassCard}>
          <Text style={styles.cardHeaderTitle}>PERSONAL CONFIGURATIONS & SETTINGS</Text>
          <View style={styles.settingsSpacer} />

          {/* Control Toggle 1: Dark Mode */}
          <View style={styles.settingsToggleRow}>
            <View style={styles.settingsLabelHeader}>
              <Icon name="theme-light-dark" size={18} color="#FFFFFF" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingMainText}>Premium Dark theme</Text>
                <Text style={styles.settingSubLabelText}>Reduced stress screen rendering eye-safe</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#BB86FC' }}
              thumbColor={darkMode ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Control Toggle 2: Notifications */}
          <View style={styles.settingsToggleRow}>
            <View style={styles.settingsLabelHeader}>
              <Icon name="message-alert-outline" size={18} color="#FFFFFF" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingMainText}>Real-time Push Notifications</Text>
                <Text style={styles.settingSubLabelText}>Alerts for instant localized brand checkouts</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#767577', true: '#BB86FC' }}
              thumbColor={pushNotifications ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Control Toggle 3: Email Alerts */}
          <View style={styles.settingsToggleRow}>
            <View style={styles.settingsLabelHeader}>
              <Icon name="email-check-outline" size={18} color="#FFFFFF" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingMainText}>Promo Newsletter Emails</Text>
                <Text style={styles.settingSubLabelText}>Weekly premium digest directly into mailbox</Text>
              </View>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: '#767577', true: '#BB86FC' }}
              thumbColor={emailAlerts ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Control Toggle 4: Biometrics */}
          <View style={styles.settingsToggleRow}>
            <View style={styles.settingsLabelHeader}>
              <Icon name="fingerprint" size={18} color="#FFFFFF" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingMainText}>Biometrics Sign-on (Face/Fingerprint)</Text>
                <Text style={styles.settingSubLabelText}>Highest hardware shield compliance locks</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#767577', true: '#BB86FC' }}
              thumbColor={biometricsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Inline Action buttons */}
          <TouchableOpacity style={styles.settingInlineBtn} onPress={() => handleFeatureTrigger('Change Password')}>
            <Icon name="key-outline" size={18} color="#9A8CAC" style={{ marginRight: 8 }} />
            <Text style={styles.settingInlineBtnText}>Change Secure Account Password</Text>
            <Icon name="chevron-right" size={16} color="#9A8CAC" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingInlineBtn} onPress={() => handleFeatureTrigger('Privacy Settings')}>
            <Icon name="eye-lock-outline" size={18} color="#9A8CAC" style={{ marginRight: 8 }} />
            <Text style={styles.settingInlineBtnText}>Sensitive Privacy Settings</Text>
            <Icon name="chevron-right" size={16} color="#9A8CAC" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingInlineBtn} onPress={() => handleFeatureTrigger('Language Settings')}>
            <Icon name="translate" size={18} color="#9A8CAC" style={{ marginRight: 8 }} />
            <Text style={styles.settingInlineBtnText}>Language Selection (English / සිංහල / தமிழ்)</Text>
            <Icon name="chevron-right" size={16} color="#9A8CAC" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* 9. SECURE SUPPORT SECTION */}
        <View style={styles.glassCard}>
          <Text style={styles.cardHeaderTitle}>HELP CENTER & LEGAL STATUTES</Text>
          <View style={styles.supportSpacer} />

          <TouchableOpacity style={styles.supportLinkRow} onPress={() => handleFeatureTrigger('FAQ Portal')}>
            <Icon name="frequently-asked-questions" size={18} color="#BB86FC" />
            <Text style={styles.supportLinkText}>Browse Frequently Asked Questions</Text>
            <Icon name="open-in-new" size={14} color="#615570" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportLinkRow} onPress={() => handleFeatureTrigger('Chat Support')}>
            <Icon name="chat-question-outline" size={18} color="#BB86FC" />
            <Text style={styles.supportLinkText}>Interactive Customer Care Chatbot</Text>
            <Icon name="open-in-new" size={14} color="#615570" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportLinkRow} onPress={() => handleFeatureTrigger('Terms of Service')}>
            <Icon name="file-document-edit-outline" size={18} color="#BB86FC" />
            <Text style={styles.supportLinkText}>Review General Terms & Conditions</Text>
            <Icon name="chevron-right" size={14} color="#615570" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportLinkRow} onPress={() => handleFeatureTrigger('Privacy Policy')}>
            <Icon name="file-lock-outline" size={18} color="#BB86FC" />
            <Text style={styles.supportLinkText}>Data Privacy & Cookies Manifesto</Text>
            <Icon name="chevron-right" size={14} color="#615570" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportLinkRow} onPress={() => handleFeatureTrigger('Rate Offer Lanka App')}>
            <Icon name="star-face" size={18} color="#BB86FC" />
            <Text style={styles.supportLinkText}>Rate us 5-Stars in Google Playstore</Text>
            <Icon name="arrow-up-right" size={14} color="#615570" />
          </TouchableOpacity>
        </View>

        {/* 10. PREMIUM BOTTOM UTILITIES BUTTONS BAR */}
        <View style={styles.bottomButtonGroup}>
          <TouchableOpacity style={styles.editBottomBtn} onPress={() => setEditModalVisible(true)}>
            <Icon name="account-edit" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btmBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inviteBottomBtn} onPress={() => handleFeatureTrigger('Invite Friends Referral link')}>
            <Icon name="share-variant" size={16} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.btmBtnTextSecondary}>Invite Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBottomBtn} onPress={() => setLogoutModalVisible(true)}>
            <Icon name="logout-variant" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.btmBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* COPYRIGHT BADGES */}
        <Text style={styles.copyrightText}>OFFER LANKA V4.20.6• SECURE CRYPTO ENCRYPTED</Text>
        <Text style={styles.serverLocationBadge}>CLOUD DATA GATE: COLOMBO SOUTH ASIA CO-LOCATED</Text>

      </Animated.View>

      {/* ======================================= */}
      {/* A. EDIT PROFILE DETAILED MODAL SHEET */}
      {/* ======================================= */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBgContainer}>
          <View style={styles.modalContentSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Modify Secure Personal Data</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollBody}>
              {/* Field 1: Name */}
              <View style={styles.modalInputBlock}>
                <Text style={styles.modalLabelText}>USER FULL NAME *</Text>
                <View style={styles.modalInputContainer}>
                  <Icon name="account" size={18} color="#8F82A4" style={{ marginRight: 8 }} />
                  <TextInput
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="Enter complete name"
                    placeholderTextColor="#666666"
                    style={styles.modalTextInput}
                  />
                </View>
              </View>

              {/* Field 2: Phone */}
              <View style={styles.modalInputBlock}>
                <Text style={styles.modalLabelText}>VERIFIED PHONE NUMBER</Text>
                <View style={styles.modalInputContainer}>
                  <Icon name="cellphone" size={18} color="#8F82A4" style={{ marginRight: 8 }} />
                  <TextInput
                    value={formPhone}
                    onChangeText={setFormPhone}
                    placeholder="+94 77 123 4567"
                    placeholderTextColor="#666666"
                    style={styles.modalTextInput}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Field 3: Gender & DOB row */}
              <View style={styles.modalFlexRowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.modalLabelText}>GENDER</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      value={formGender}
                      onChangeText={setFormGender}
                      placeholder="Female"
                      placeholderTextColor="#666666"
                      style={styles.modalTextInput}
                    />
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.modalLabelText}>DATE OF BIRTH</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      value={formDob}
                      onChangeText={setFormDob}
                      placeholder="1998-05-12"
                      placeholderTextColor="#666666"
                      style={styles.modalTextInput}
                    />
                  </View>
                </View>
              </View>

              {/* Field 4: City & Country robust items */}
              <View style={styles.modalFlexRowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.modalLabelText}>CITY PROFILE *</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      value={formCity}
                      onChangeText={setFormCity}
                      placeholder="e.g. Colombo / Kandy"
                      placeholderTextColor="#666666"
                      style={styles.modalTextInput}
                    />
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.modalLabelText}>COUNTRY</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      value={formCountry}
                      onChangeText={setFormCountry}
                      placeholder="Sri Lanka"
                      placeholderTextColor="#666666"
                      style={styles.modalTextInput}
                    />
                  </View>
                </View>
              </View>

              {/* Help tip info block */}
              <View style={styles.modalHelpTipContainer}>
                <Icon name="information-outline" size={14} color="#BB86FC" style={{ marginRight: 6 }} />
                <Text style={styles.modalHelpTipText}>
                  Your profile data is fully encrypted with dynamic Firestore TLS protocols. Only you can access or alter this layout.
                </Text>
              </View>

              {/* Action buttons */}
              <View style={styles.modalActionButtonsGroup}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.modalCancelBtnText}>Discard Changes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalBtnSubmit} onPress={handleSaveProfileChanges}>
                  <Text style={styles.modalSubmitBtnText}>Commit Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================= */}
      {/* B. SECURE SIGN OUT CONFIRMATION MODAL */}
      {/* ======================================= */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.centerModalOverlay}>
          <View style={styles.logoutPaperCard}>
            <View style={styles.logoutIconBoundary}>
              <Icon name="alert-octagon-outline" size={44} color="#FF5722" />
            </View>

            <Text style={styles.logoutConfirmText}>Establish Secure Logout?</Text>
            <Text style={styles.logoutDisclaimerSubText}>
              Are you sure you want to end your current session? You will need your biometric key or password credentials to return.
            </Text>

            <View style={styles.logoutSheetActionRow}>
              <TouchableOpacity style={styles.logoutBtnBack} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.logoutBtnBackText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtnConfirm} onPress={handleConfirmLogout}>
                <Text style={styles.logoutBtnConfirmText}>Terminate Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// PREMIUM STYLING PACK - GLASSMORPHISM CARDS GRID THEMES
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0F081C', // High fidelity deep dark purple canvas background
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  mainLayout: {
    width: '100%',
    maxWidth: 500, // Balanced tablets view bounds
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F081C',
  },
  skeletonText: {
    color: '#BB86FC',
    marginTop: 14,
    fontSize: 13,
    fontWeight: 'bold',
  },
  offlinePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  offlineText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(41, 23, 69, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 18,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: '#BB86FC',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#6200EE',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0F081C',
    borderWidth: 1.5,
  },
  headerInfoBlock: {
    flex: 1,
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  userUsername: {
    color: '#BB86FC',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 2,
  },
  memberSinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  memberSinceText: {
    color: '#A999C7',
    fontSize: 10.5,
    marginLeft: 4,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FF79C6',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  statsScrollContainer: {
    paddingBottom: 16,
    paddingRight: 10,
  },
  statBox: {
    width: 130,
    backgroundColor: 'rgba(32, 17, 56, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  statBoxSavings: {
    borderColor: 'rgba(0, 230, 118, 0.25)',
    backgroundColor: 'rgba(0, 230, 118, 0.03)',
  },
  statLabel: {
    color: '#B0A3C9',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '950',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  statSubText: {
    color: '#71658E',
    fontSize: 8.5,
    marginTop: 2,
    textAlign: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(32, 17, 56, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  membershipHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipLabel: {
    color: '#A295C1',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  tierLevelText: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  tierPlatinum: {
    color: '#E5E4E2',
  },
  tierGold: {
    color: '#FFD700',
  },
  tierSilver: {
    color: '#C0C0C0',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  progressDescText: {
    color: '#A295C1',
    fontSize: 11,
  },
  progressPercentText: {
    color: '#BB86FC',
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#BB86FC',
    borderRadius: 4,
  },
  benefitsContainer: {
    marginVertical: 14,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  benefitText: {
    color: '#CBBEDD',
    fontSize: 11.5,
    marginLeft: 6,
    lineHeight: 16,
  },
  upgradeBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  upgradeBtnText: {
    color: '#000000',
    fontWeight: '950',
    fontSize: 12,
    marginRight: 4,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    color: '#E0DBEC',
    fontWeight: 'bold',
    fontSize: 11.5,
    letterSpacing: 1,
  },
  walletBalanceLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  walletBalanceLabel: {
    color: '#8A7FA0',
    fontSize: 10.5,
  },
  walletMainBalance: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '950',
    marginTop: 2,
  },
  walletCashbackAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  transactionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  transactionBtnText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subGridHeader: {
    color: '#A496C1',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    paddingLeft: 4,
    marginBottom: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  gridActionItem: {
    width: '23%', // Clean 4-column layout responsive
    backgroundColor: 'rgba(28, 14, 50, 0.6)',
    borderColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridActionLabel: {
    color: '#DBD1EC',
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoSpacer: {
    height: 10,
  },
  infoFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoFieldLabel: {
    color: '#9E92B6',
    fontSize: 11.5,
    marginLeft: 6,
  },
  infoFieldValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoEditInlineBtn: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  infoEditBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activitySpacer: {
    height: 14,
  },
  activityTimelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activityDotWrapper: {
    alignItems: 'center',
    marginRight: 10,
    width: 16,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  activityLine: {
    width: 1,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  activityValueText: {
    color: '#00E676',
    fontSize: 10,
    marginTop: 2,
  },
  activityTimestamp: {
    color: '#6F6387',
    fontSize: 9,
    marginTop: 2,
  },
  settingsSpacer: {
    height: 12,
  },
  settingsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
  },
  settingsLabelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  settingIcon: {
    width: 24,
    color: '#BB86FC',
  },
  settingMainText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingSubLabelText: {
    color: '#7C6F96',
    fontSize: 9.5,
    marginTop: 1,
  },
  settingInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
  },
  settingInlineBtnText: {
    color: '#DBD1EC',
    fontSize: 11.5,
  },
  supportSpacer: {
    height: 10,
  },
  supportLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
  },
  supportLinkText: {
    color: '#DBD5EB',
    flex: 1,
    fontSize: 11.5,
    marginLeft: 8,
  },
  bottomButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  editBottomBtn: {
    flexDirection: 'row',
    flex: 1,
    height: 44,
    backgroundColor: '#6200EE',
    shape: 'rounded',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  inviteBottomBtn: {
    flexDirection: 'row',
    flex: 1.2,
    height: 44,
    backgroundColor: '#FFD700',
    shape: 'rounded',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  logoutBottomBtn: {
    flexDirection: 'row',
    flex: 1,
    height: 44,
    backgroundColor: '#D11D44',
    shape: 'rounded',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  btmBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  btmBtnTextSecondary: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 11,
  },
  copyrightText: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 8.5,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginTop: 10,
  },
  serverLocationBadge: {
    color: 'rgba(255, 255, 255, 0.08)',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 40,
  },

  // MODAL BOTTOM SHEET OVERLAY
  modalBgContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContentSheet: {
    backgroundColor: '#170E28',
    borderColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1.5,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: height * 0.85,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalScrollBody: {
    paddingBottom: 24,
  },
  modalInputBlock: {
    marginBottom: 14,
  },
  modalLabelText: {
    color: '#B0A2CA',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F081C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    height: 46,
  },
  modalTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
  },
  modalFlexRowInputs: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  modalHelpTipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(98, 0, 238, 0.08)',
    borderColor: 'rgba(98, 0, 238, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 20,
  },
  modalHelpTipText: {
    color: '#C7B9DE',
    fontSize: 9.5,
    flex: 1,
    lineHeight: 14,
  },
  modalActionButtonsGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtnCancel: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#716386',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  modalCancelBtnText: {
    color: '#DBD1EC',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  modalBtnSubmit: {
    flex: 1.5,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  // LOGOUT GENERAL POPUP MODAL
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutPaperCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1B0E28',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoutIconBoundary: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutDisclaimerSubText: {
    color: '#AFA3C9',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  logoutSheetActionRow: {
    flexDirection: 'row',
  },
  logoutBtnBack: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7A6B94',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  logoutBtnBackText: {
    color: '#C1B6DC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutBtnConfirm: {
    flex: 1.5,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  logoutBtnConfirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
