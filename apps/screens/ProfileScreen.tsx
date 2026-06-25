import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ScrollView, Switch, Modal, TextInput, Alert 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { 
  User as UserIcon, Wallet, Settings, Bell, 
  Award, Calendar, Edit3, LogOut, ChevronRight, Package, CreditCard, CheckCircle
} from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const { 
    isDarkMode, toggleDarkMode, currentUser, appLanguage, setLanguage,
    orders, favorites, signOut, updateProfileDetails, depositCashbackWallet,
    updateUserRoleSimulated
  } = useAppContext();

  const { contentWidth, padding } = useDimensions();

  // Local settings states
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  // Edit Modal State
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phoneNumber || '');
  const [editCity, setEditCity] = useState(currentUser?.district || 'Colombo');

  // Load Cash Modal State
  const [loadCashModal, setLoadCashModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');

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

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    await updateProfileDetails(editName, editPhone, editCity);
    setEditModal(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleLoadCash = () => {
    const amt = parseFloat(cashAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }
    depositCashbackWallet(amt);
    setCashAmount('');
    setLoadCashModal(false);
    Alert.alert("Deposited!", `LKR ${amt.toLocaleString()} loaded into your offline wallet.`);
  };

  const memberSince = "2026-01-15";
  const userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.mainLayout, { maxWidth: contentWidth, paddingHorizontal: padding }]}>
        
        {/* PROFILE HEADER CARD */}
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          
          <View style={styles.headerInfo}>
            <View style={styles.row}>
              <Text style={[styles.userNameText, { color: colors.text }]}>{currentUser?.name}</Text>
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(0,230,118,0.1)' }]}>
                <Text style={{ color: '#00E676', fontSize: 8, fontWeight: 'bold' }}>✓ Verified</Text>
              </View>
            </View>
            <Text style={{ color: colors.subText, fontSize: 10 }}>@{currentUser?.email.split('@')[0]}</Text>
            
            <View style={[styles.row, { marginTop: 6, gap: 4 }]}>
              <Calendar size={10} color={colors.subText} />
              <Text style={{ color: colors.subText, fontSize: 9 }}>Premium user since: {memberSince}</Text>
            </View>
          </View>
        </View>

        {/* METRICS CARDS SCROLLER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
          
          {/* savings */}
          <View style={[styles.metricBox, { backgroundColor: 'rgba(0,200,83,0.06)', borderColor: '#00C853', borderWidth: 1 }]}>
            <Wallet size={16} color="#00C853" />
            <Text style={{ color: colors.subText, fontSize: 9, marginTop: 4 }}>Total Savings</Text>
            <Text style={{ color: '#00C853', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>LKR 42,500</Text>
          </View>

          {/* reward points */}
          <View style={[styles.metricBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <Award size={16} color="#FFD700" />
            <Text style={{ color: colors.subText, fontSize: 9, marginTop: 4 }}>Reward Points</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>{currentUser?.rewardPoints} PTS</Text>
          </View>

          {/* bookmark counts */}
          <View style={[styles.metricBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={{ fontSize: 14 }}>❤️</Text>
            <Text style={{ color: colors.subText, fontSize: 9, marginTop: 4 }}>Favorites</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>{favorites.length} Items</Text>
          </View>

          {/* order history count */}
          <View style={[styles.metricBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={{ fontSize: 14 }}>📦</Text>
            <Text style={{ color: colors.subText, fontSize: 9, marginTop: 4 }}>Completed Orders</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>{orders.length} Placed</Text>
          </View>

        </ScrollView>

        {/* WALLET DEPOSIT PANEL */}
        <View style={[styles.walletCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={{ color: colors.subText, fontSize: 10, fontWeight: 'bold' }}>CASHBACK WALLET FUNDS</Text>
              <Text style={[styles.walletMainVal, { color: colors.text }]}>LKR {currentUser?.walletBalance.toLocaleString()}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.depositBtn, { backgroundColor: colors.primary }]}
              onPress={() => setLoadCashModal(true)}
            >
              <Text style={{ color: colors.background, fontSize: 11, fontWeight: 'bold' }}>Load Cash</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ROLE CONSOLE PORTALS (SANDBOX) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardHeaderTitle, { color: colors.text }]}>Role-Based Management Portals</Text>
          <Text style={{ color: colors.subText, fontSize: 10, marginBottom: 12 }}>Quickly switch your login profile type in this Developer Sandbox:</Text>
          
          <View style={{ gap: 8 }}>
            <TouchableOpacity 
              style={[styles.portalRow, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => updateUserRoleSimulated('NORMAL')}
            >
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>User Feed</Text>
              <ChevronRight size={14} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.portalRow, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => updateUserRoleSimulated('MERCHANT')}
            >
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>Merchant Portal Dashboard</Text>
              <ChevronRight size={14} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.portalRow, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => updateUserRoleSimulated('ADMIN')}
            >
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>Super Admin Console Panel</Text>
              <ChevronRight size={14} color={colors.subText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECURE PROFILE FIELDS */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardHeaderTitle, { color: colors.text }]}>Profile Information</Text>
            <TouchableOpacity onPress={() => {
              setEditName(currentUser?.name || '');
              setEditPhone(currentUser?.phoneNumber || '');
              setEditCity(currentUser?.district || 'Colombo');
              setEditModal(true);
            }}>
              <Edit3 size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoSpacer} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Full Name</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{currentUser?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Email Address</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{currentUser?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Phone Number</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{currentUser?.phoneNumber || "Not Configured"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Province / City</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{currentUser?.district}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Account Type</Text>
            <Text style={[styles.infoVal, { color: colors.primary, fontWeight: 'bold' }]}>{currentUser?.role}</Text>
          </View>
        </View>

        {/* SYSTEM CONFIGURATIONS */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardHeaderTitle, { color: colors.text }]}>Configurations & Settings</Text>
          <View style={styles.infoSpacer} />
          
          {/* dark mode */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Premium Dark Theme</Text>
              <Text style={{ color: colors.subText, fontSize: 9 }}>Reduces screen eye strain</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ true: colors.primary }} />
          </View>

          {/* notifications */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Push Notifications</Text>
              <Text style={{ color: colors.subText, fontSize: 9 }}>Alerts for active localized vouchers</Text>
            </View>
            <Switch value={pushNotifs} onValueChange={setPushNotifs} trackColor={{ true: colors.primary }} />
          </View>

          {/* email */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Promo Newsletters</Text>
              <Text style={{ color: colors.subText, fontSize: 9 }}>Weekly campaign digests in mailbox</Text>
            </View>
            <Switch value={emailAlerts} onValueChange={setEmailAlerts} trackColor={{ true: colors.primary }} />
          </View>

          {/* biometrics */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Enable Biometrics</Text>
              <Text style={{ color: colors.subText, fontSize: 9 }}>Use face/fingerprint lock</Text>
            </View>
            <Switch value={biometrics} onValueChange={setBiometrics} trackColor={{ true: colors.primary }} />
          </View>

          {/* Language Toggle */}
          <View style={[styles.rowBetween, { marginTop: 12, borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 12 }]}>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>App Language</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['EN', 'SI', 'TA'] as const).map(lang => (
                <TouchableOpacity 
                  key={lang}
                  style={[
                    styles.langBtn,
                    { backgroundColor: appLanguage === lang ? colors.primary : colors.surfaceVariant }
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={{ color: appLanguage === lang ? colors.background : colors.text, fontSize: 9, fontWeight: 'bold' }}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* PAYMENT & ORDER HISTORY */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Package size={16} color={colors.primary} />
            <Text style={[styles.cardHeaderTitle, { color: colors.text }]}>Payment & Order History</Text>
          </View>

          {orders.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Package size={32} color={colors.subText} />
              <Text style={{ color: colors.subText, fontSize: 12, marginTop: 8 }}>No orders placed yet</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {orders.map((order: any) => (
                <View
                  key={order.id}
                  style={[styles.orderCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>#{order.id}</Text>
                      <Text style={{ color: colors.subText, fontSize: 9, marginTop: 2 }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date N/A'}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: order.status === 'DELIVERED' ? 'rgba(0,200,83,0.12)' : 'rgba(124,77,255,0.12)' }
                    ]}>
                      <CheckCircle size={10} color={order.status === 'DELIVERED' ? '#00C853' : colors.primary} />
                      <Text style={[
                        styles.statusText,
                        { color: order.status === 'DELIVERED' ? '#00C853' : colors.primary }
                      ]}>
                        {order.status || 'Processing'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <CreditCard size={11} color={colors.subText} />
                      <Text style={{ color: colors.subText, fontSize: 10 }}>
                        {order.paymentMethod || 'Cash on Delivery'}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>
                      LKR {order.totalPrice?.toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { borderColor: colors.border }]}
          onPress={signOut}
        >
          <LogOut size={16} color="#D50000" />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

      </View>

      {/* EDIT MODAL */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile Details</Text>
            
            <TextInput 
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Username"
              placeholderTextColor={colors.subText}
            />

            <TextInput 
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Phone number"
              placeholderTextColor={colors.subText}
              keyboardType="phone-pad"
            />

            <TextInput 
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
              value={editCity}
              onChangeText={setEditCity}
              placeholder="City / District"
              placeholderTextColor={colors.subText}
            />

            <View style={styles.modalBtnGroup}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(false)}>
                <Text style={{ color: colors.subText }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
                <Text style={{ color: colors.background, fontWeight: 'bold' }}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOAD CASH MODAL */}
      <Modal visible={loadCashModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border, width: 280 }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Load Wallet Cash</Text>
            <Text style={{ color: colors.subText, fontSize: 10, textAlign: 'center', marginBottom: 12 }}>Enter simulated deposit amount in LKR:</Text>
            
            <TextInput 
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant, textAlign: 'center' }]}
              value={cashAmount}
              onChangeText={setCashAmount}
              placeholder="LKR 5000"
              placeholderTextColor={colors.subText}
              keyboardType="numeric"
            />

            <View style={styles.modalBtnGroup}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setLoadCashModal(false)}>
                <Text style={{ color: colors.subText }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, { backgroundColor: colors.primary }]} onPress={handleLoadCash}>
                <Text style={{ color: colors.background, fontWeight: 'bold' }}>Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#C78DFF',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
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
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  metricsRow: {
    gap: 8,
    marginVertical: 14,
  },
  metricBox: {
    width: 120,
    padding: 12,
    borderRadius: 12,
  },
  walletCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  walletMainVal: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    color: '#FFEA00',
  },
  depositBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  portalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  infoSpacer: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoVal: {
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 10,
    gap: 8,
  },
  logoutText: {
    color: '#D50000',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 300,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 13,
  },
  modalBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalConfirm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  langBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderDivider: {
    height: 1,
    marginVertical: 2,
  },
})
export default ProfileScreen;
