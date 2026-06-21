import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { 
  Check, Trash2, Users, ShoppingBag, DollarSign, Award, ArrowLeft, Shield, 
  Home, Tag, Settings, MessageSquare, LogOut, Menu, X, Database, Plus, RefreshCw, Activity 
} from 'lucide-react-native';
import { initialTickets } from '../shared/mockDb';

export const AdminPanelScreen: React.FC = () => {
  const { 
    isDarkMode, products, offers, allUsers, allOrders, 
    approveProduct, deleteProduct, approveOffer, deleteOffer, navigateTo, currentUser, signOut 
  } = useAppContext();

  const { isMobile, width } = useDimensions();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CATALOGUE' | 'MODERATION' | 'CLEARANCE' | 'SUPPORT'>('DASHBOARD');
  
  // Sidebar state for mobile screen
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Catalogue states
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [catalogueFilter, setCatalogueFilter] = useState<'PRODUCTS' | 'OFFERS'>('PRODUCTS');

  // Support desk tickets state
  const [tickets, setTickets] = useState(initialTickets);
  const [replyText, setReplyText] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  // Clearance action states
  const [isSeeding, setIsSeeding] = useState(false);
  const [clearanceMessage, setClearanceMessage] = useState('');

  // Styles/Theme configuration
  const colors = isDarkMode ? {
    background: '#090514', // Sleek dark body
    sidebarBg: '#0F0920', // Distinct sidebar dark purple
    surface: '#150E28', // Core cards
    surfaceVariant: '#22163E', // Active items / highlights
    border: '#2C1D4E',
    primary: '#C78DFF', // Neon purple accent
    primaryGlow: 'rgba(199, 141, 255, 0.15)',
    secondary: '#8E24AA',
    text: '#FFFFFF',
    subText: '#B0A2C9',
    success: '#00C853',
    error: '#D50000',
    warning: '#FFAB00'
  } : {
    background: '#F5F0FF',
    sidebarBg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D3C5F0',
    primary: '#7C4DFF',
    primaryGlow: 'rgba(124, 77, 255, 0.1)',
    secondary: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
    success: '#2E7D32',
    error: '#C62828',
    warning: '#FF8F00'
  };

  // Stats calculation
  const totalSales = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingProducts = products.filter(p => !p.isApproved);
  const pendingOffers = offers.filter(o => !o.isApproved);
  const liveProducts = products.filter(p => p.isApproved);
  const liveOffers = offers.filter(o => o.isApproved);

  // Admin Profile Info
  const adminName = currentUser?.name || "Mohamed Ruskan";
  const adminEmail = currentUser?.email || "admin@offerlanka.com";
  const adminAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";

  // Seeding Database
  const triggerDatabaseSeed = async () => {
    setIsSeeding(true);
    setClearanceMessage('');
    try {
      const { FirebaseService } = require('../services/firebaseService');
      if (FirebaseService.isFirebaseAvailable()) {
        await FirebaseService.seedFirebaseIfNeeded();
        setClearanceMessage('Database seed check completed successfully! Default collections verified.');
      } else {
        setClearanceMessage('Firebase is currently offline or running mock database mode.');
      }
    } catch (e: any) {
      setClearanceMessage(`Error running database seed: ${e.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Support Reply Action
  const handleReplyTicket = (id: number) => {
    if (!replyText.trim()) return;
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'RESOLVED', reply: replyText };
      }
      return t;
    }));
    setReplyText('');
    setActiveTicketId(null);
  };

  // Navigation handlers
  const handleNavigation = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigateTo('AUTH');
  };

  // ----------------------------------------------------
  // SIDEBAR COMPONENT (Reusable for Desktop and Mobile Drawer)
  // ----------------------------------------------------
  const renderSidebarContent = () => (
    <View style={{ flex: 1 }}>
      {/* Sidebar Header / Logo */}
      <View style={[styles.sidebarHeader, { borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Image source={require('../assets/logo.png')} style={{ width: 110, height: 35 }} resizeMode="contain" />
        <View style={[styles.enterpriseBadge, { backgroundColor: colors.primaryGlow, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }]}>
          <Text style={[styles.enterpriseText, { color: colors.primary, fontSize: 8 }]}>ENTERPRISE</Text>
        </View>
      </View>

      {/* User Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image source={{ uri: adminAvatar }} style={styles.profileAvatar as any} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>{adminName}</Text>
          <Text style={[styles.profileRole, { color: colors.success }]}>● SUPER ADMIN</Text>
        </View>
      </View>

      {/* NAVIGATION ITEMS */}
      <View style={styles.menuContainer}>
        <Text style={[styles.menuHeading, { color: colors.subText }]}>NAVIGATION</Text>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigateTo('HOME')}
        >
          <Home size={18} color={colors.subText} />
          <Text style={[styles.menuItemText, { color: colors.subText }]}>Consumer Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.menuItem, 
            activeTab === 'DASHBOARD' && [styles.menuItemActive, { backgroundColor: colors.surfaceVariant, borderColor: colors.primary }]
          ]} 
          onPress={() => handleNavigation('DASHBOARD')}
        >
          <Activity size={18} color={activeTab === 'DASHBOARD' ? colors.primary : colors.subText} />
          <Text style={[styles.menuItemText, { color: activeTab === 'DASHBOARD' ? colors.text : colors.subText, fontWeight: activeTab === 'DASHBOARD' ? 'bold' : 'normal' }]}>
            Admin Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.menuItem, 
            activeTab === 'CATALOGUE' && [styles.menuItemActive, { backgroundColor: colors.surfaceVariant, borderColor: colors.primary }]
          ]} 
          onPress={() => handleNavigation('CATALOGUE')}
        >
          <Tag size={18} color={activeTab === 'CATALOGUE' ? colors.primary : colors.subText} />
          <Text style={[styles.menuItemText, { color: activeTab === 'CATALOGUE' ? colors.text : colors.subText, fontWeight: activeTab === 'CATALOGUE' ? 'bold' : 'normal' }]}>
            Offer Catalogue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.menuItem, 
            activeTab === 'MODERATION' && [styles.menuItemActive, { backgroundColor: colors.surfaceVariant, borderColor: colors.primary }]
          ]} 
          onPress={() => handleNavigation('MODERATION')}
        >
          <Shield size={18} color={activeTab === 'MODERATION' ? colors.primary : colors.subText} />
          <Text style={[styles.menuItemText, { color: activeTab === 'MODERATION' ? colors.text : colors.subText, fontWeight: activeTab === 'MODERATION' ? 'bold' : 'normal' }]}>
            Moderation Queue
          </Text>
          {(pendingProducts.length + pendingOffers.length) > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeCountText}>{pendingProducts.length + pendingOffers.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.menuItem, 
            activeTab === 'CLEARANCE' && [styles.menuItemActive, { backgroundColor: colors.surfaceVariant, borderColor: colors.primary }]
          ]} 
          onPress={() => handleNavigation('CLEARANCE')}
        >
          <Settings size={18} color={activeTab === 'CLEARANCE' ? colors.primary : colors.subText} />
          <Text style={[styles.menuItemText, { color: activeTab === 'CLEARANCE' ? colors.text : colors.subText, fontWeight: activeTab === 'CLEARANCE' ? 'bold' : 'normal' }]}>
            System Clearance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.menuItem, 
            activeTab === 'SUPPORT' && [styles.menuItemActive, { backgroundColor: colors.surfaceVariant, borderColor: colors.primary }]
          ]} 
          onPress={() => handleNavigation('SUPPORT')}
        >
          <MessageSquare size={18} color={activeTab === 'SUPPORT' ? colors.primary : colors.subText} />
          <Text style={[styles.menuItemText, { color: activeTab === 'SUPPORT' ? colors.text : colors.subText, fontWeight: activeTab === 'SUPPORT' ? 'bold' : 'normal' }]}>
            Support Desk
          </Text>
          {tickets.filter(t => t.status === 'PENDING').length > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: colors.warning }]}>
              <Text style={styles.badgeCountText}>{tickets.filter(t => t.status === 'PENDING').length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sign Out at the Bottom */}
      <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={18} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainLayout, { backgroundColor: colors.background }]}>
      
      {/* ----------------------------------------------------
          DESKTOP / WIDESCREEN SIDEBAR
          ---------------------------------------------------- */}
      {!isMobile && (
        <View style={[styles.sidebarDesktop, { backgroundColor: colors.sidebarBg, borderRightColor: colors.border }]}>
          {renderSidebarContent()}
        </View>
      )}

      {/* ----------------------------------------------------
          MOBILE SIDEBAR DRAWER OVERLAY
          ---------------------------------------------------- */}
      {isMobile && mobileMenuOpen && (
        <View style={styles.mobileDrawerOverlay}>
          <View style={[styles.mobileDrawer, { backgroundColor: colors.sidebarBg, borderRightColor: colors.border }]}>
            <View style={styles.mobileCloseContainer}>
              <TouchableOpacity onPress={() => setMobileMenuOpen(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>{renderSidebarContent()}</ScrollView>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setMobileMenuOpen(false)} />
        </View>
      )}

      {/* ----------------------------------------------------
          CORE CONTENT AREA
          ---------------------------------------------------- */}
      <View style={styles.contentArea}>
        
        {/* MOBILE HEADER BAR */}
        {isMobile && (
          <View style={[styles.mobileHeader, { backgroundColor: colors.sidebarBg, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setMobileMenuOpen(true)}>
              <Menu size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.mobileHeaderTitle, { color: colors.text }]}>Offer Lanka Admin</Text>
            <View style={{ width: 24 }} /> {/* Spacer */}
          </View>
        )}

        {/* MAIN PANEL VIEW */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* TAB 1: ANALYTICS DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <View style={styles.viewSection}>
              <View style={styles.welcomeRow}>
                <View>
                  <Text style={[styles.welcomeSub, { color: colors.subText }]}>System Overview</Text>
                  <Text style={[styles.welcomeTitle, { color: colors.text }]}>Morning, {adminName}</Text>
                </View>
                <View style={[styles.badgeClearance, { backgroundColor: colors.primaryGlow }]}>
                  <Text style={[styles.badgeClearanceText, { color: colors.primary }]}>SECURE CONSOLE</Text>
                </View>
              </View>

              {/* STATS TILES GRID */}
              <View style={styles.statsGrid}>
                
                <View style={[styles.statTileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.statTileHeader}>
                    <DollarSign size={20} color={colors.primary} />
                    <View style={[styles.trendBadge, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}>
                      <Text style={[styles.trendBadgeText, { color: colors.success }]}>+12.4%</Text>
                    </View>
                  </View>
                  <Text style={[styles.statTileVal, { color: colors.text }]}>LKR {totalSales.toLocaleString()}</Text>
                  <Text style={[styles.statTileLabel, { color: colors.subText }]}>Total Sales Revenue</Text>
                </View>

                <View style={[styles.statTileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.statTileHeader}>
                    <Users size={20} color={colors.primary} />
                    <View style={[styles.trendBadge, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}>
                      <Text style={[styles.trendBadgeText, { color: colors.success }]}>Active</Text>
                    </View>
                  </View>
                  <Text style={[styles.statTileVal, { color: colors.text }]}>{allUsers.length}</Text>
                  <Text style={[styles.statTileLabel, { color: colors.subText }]}>Total Registered Users</Text>
                </View>

                <View style={[styles.statTileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.statTileHeader}>
                    <ShoppingBag size={20} color={colors.primary} />
                    <Text style={{ fontSize: 10, color: colors.subText }}>Stock verified</Text>
                  </View>
                  <Text style={[styles.statTileVal, { color: colors.text }]}>{liveProducts.length}</Text>
                  <Text style={[styles.statTileLabel, { color: colors.subText }]}>Approved Products</Text>
                </View>

                <View style={[styles.statTileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.statTileHeader}>
                    <Award size={20} color={colors.primary} />
                    <View style={[styles.liveIndicator, { backgroundColor: colors.success }]} />
                    <Text style={[styles.liveText, { color: colors.success }]}>Live</Text>
                  </View>
                  <Text style={[styles.statTileVal, { color: colors.text }]}>{liveOffers.length}</Text>
                  <Text style={[styles.statTileLabel, { color: colors.subText }]}>Active Deals</Text>
                </View>

              </View>

              {/* HIGHLIGHT DETAILS */}
              <View style={[styles.systemStatusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Platform Operations Integrity</Text>
                <Text style={[styles.cardSubText, { color: colors.subText }]}>
                  The localized OfferHub application is connected to the live Firebase Auth and Firestore Database instances. 
                  Real-time synchronization is active for products, discount offers, and customer order records.
                </Text>
                <View style={[styles.indicatorBar, { borderColor: colors.border }]}>
                  <View style={[styles.indicatorDot, { backgroundColor: colors.success }]} />
                  <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>All systems functional (Connected to Firebase)</Text>
                </View>
              </View>

              {/* RECENT ORDERS MINI TABLE */}
              <View style={[styles.recentOrdersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Recent Transactions</Text>
                {allOrders.slice(0, 4).map(o => (
                  <View key={o.id} style={[styles.orderMiniRow, { borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.orderMiniId, { color: colors.primary }]}>Order #{o.id}</Text>
                      <Text style={[styles.orderMiniItems, { color: colors.text }]} numberOfLines={1}>{o.productNames}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>LKR {o.totalPrice.toLocaleString()}</Text>
                      <Text style={{ color: colors.success, fontSize: 10 }}>{o.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: OFFER CATALOGUE */}
          {activeTab === 'CATALOGUE' && (
            <View style={styles.viewSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>Platform Offer Catalogue</Text>
              <Text style={[styles.welcomeSub, { color: colors.subText, marginBottom: 16 }]}>
                Manage approved active items available to users in the consumer feed.
              </Text>

              {/* CAT FILTERS AND SEARCH */}
              <View style={[styles.catalogueHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput 
                  style={[styles.searchBox, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Search catalogue items..."
                  placeholderTextColor={colors.subText}
                  value={catalogueSearch}
                  onChangeText={setCatalogueSearch}
                />

                <View style={styles.catalogueTabs}>
                  <TouchableOpacity 
                    style={[styles.catTabBtn, catalogueFilter === 'PRODUCTS' && [styles.catTabBtnActive, { backgroundColor: colors.primary }]]}
                    onPress={() => setCatalogueFilter('PRODUCTS')}
                  >
                    <Text style={[styles.catTabText, { color: catalogueFilter === 'PRODUCTS' ? colors.background : colors.text }]}>
                      Products ({liveProducts.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.catTabBtn, catalogueFilter === 'OFFERS' && [styles.catTabBtnActive, { backgroundColor: colors.primary }]]}
                    onPress={() => setCatalogueFilter('OFFERS')}
                  >
                    <Text style={[styles.catTabText, { color: catalogueFilter === 'OFFERS' ? colors.background : colors.text }]}>
                      Deals & Offers ({liveOffers.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* LIST ITEMS */}
              <View style={{ gap: 10 }}>
                {catalogueFilter === 'PRODUCTS' ? (
                  liveProducts
                    .filter(p => p.name.toLowerCase().includes(catalogueSearch.toLowerCase()) || p.storeName.toLowerCase().includes(catalogueSearch.toLowerCase()))
                    .map(p => (
                      <View key={p.id} style={[styles.catalogItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.catalogItemName, { color: colors.text }]}>{p.name}</Text>
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>LKR {p.price.toLocaleString()}</Text>
                          <Text style={{ color: colors.subText, fontSize: 10 }}>Merchant: {p.storeName} | Stock: {p.stockCount}</Text>
                        </View>
                        <TouchableOpacity 
                          style={[styles.deleteBtn, { backgroundColor: 'rgba(213, 0, 0, 0.1)' }]}
                          onPress={() => deleteProduct(p.id)}
                        >
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))
                ) : (
                  liveOffers
                    .filter(o => o.title.toLowerCase().includes(catalogueSearch.toLowerCase()) || o.storeName.toLowerCase().includes(catalogueSearch.toLowerCase()))
                    .map(o => (
                      <View key={o.id} style={[styles.catalogItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.catalogItemName, { color: colors.text }]}>{o.title}</Text>
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{o.discountPercent}% OFF</Text>
                          <Text style={{ color: colors.subText, fontSize: 10 }}>Merchant: {o.storeName} | Valid Until: {o.validUntil}</Text>
                        </View>
                        <TouchableOpacity 
                          style={[styles.deleteBtn, { backgroundColor: 'rgba(213, 0, 0, 0.1)' }]}
                          onPress={() => deleteOffer(o.id)}
                        >
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))
                )}
              </View>
            </View>
          )}

          {/* TAB 3: MODERATION QUEUE */}
          {activeTab === 'MODERATION' && (
            <View style={styles.viewSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>Moderation Approvals Queue</Text>
              <Text style={[styles.welcomeSub, { color: colors.subText, marginBottom: 16 }]}>
                Review, validate and authorize merchant submissions before they go live.
              </Text>

              {/* PRODUCTS APPROVAL SECTION */}
              <View style={styles.moderationGroup}>
                <Text style={[styles.groupHeading, { color: colors.text }]}>Pending Products ({pendingProducts.length})</Text>
                {pendingProducts.length === 0 ? (
                  <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.subText, fontSize: 11 }}>No products awaiting moderation.</Text>
                  </View>
                ) : (
                  pendingProducts.map(p => (
                    <View key={p.id} style={[styles.modRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modItemTitle, { color: colors.text }]}>{p.name}</Text>
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>LKR {p.price.toLocaleString()}</Text>
                        <Text style={{ color: colors.subText, fontSize: 10 }}>Store: {p.storeName} | Stock: {p.stockCount}</Text>
                        <Text style={{ color: colors.subText, fontSize: 9, marginTop: 4 }}>Description: {p.description}</Text>
                      </View>
                      <View style={styles.modActions}>
                        <TouchableOpacity style={[styles.actionRoundBtn, { backgroundColor: colors.success }]} onPress={() => approveProduct(p.id)}>
                          <Check size={16} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionRoundBtn, { backgroundColor: colors.error }]} onPress={() => deleteProduct(p.id)}>
                          <Trash2 size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* OFFERS APPROVAL SECTION */}
              <View style={[styles.moderationGroup, { marginTop: 20 }]}>
                <Text style={[styles.groupHeading, { color: colors.text }]}>Pending Deals & Offers ({pendingOffers.length})</Text>
                {pendingOffers.length === 0 ? (
                  <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.subText, fontSize: 11 }}>No deals/vouchers awaiting moderation.</Text>
                  </View>
                ) : (
                  pendingOffers.map(o => (
                    <View key={o.id} style={[styles.modRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modItemTitle, { color: colors.text }]}>{o.title}</Text>
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{o.discountPercent}% OFF</Text>
                        <Text style={{ color: colors.subText, fontSize: 10 }}>Store: {o.storeName} | Expires: {o.validUntil}</Text>
                      </View>
                      <View style={styles.modActions}>
                        <TouchableOpacity style={[styles.actionRoundBtn, { backgroundColor: colors.success }]} onPress={() => approveOffer(o.id)}>
                          <Check size={16} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionRoundBtn, { backgroundColor: colors.error }]} onPress={() => deleteOffer(o.id)}>
                          <Trash2 size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* TAB 4: SYSTEM CLEARANCE */}
          {activeTab === 'CLEARANCE' && (
            <View style={styles.viewSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>System Database Clearance</Text>
              <Text style={[styles.welcomeSub, { color: colors.subText, marginBottom: 16 }]}>
                Core database administration, mock seeding, and user profile management.
              </Text>

              {/* ACTIONS CARD */}
              <View style={[styles.adminActionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 6 }]}>Database Operations</Text>
                <Text style={{ color: colors.subText, fontSize: 11, marginBottom: 16 }}>
                  If your live Firebase collections are empty, trigger the automatic database seed to upload products, brands, and active deals.
                </Text>

                <TouchableOpacity 
                  style={[styles.seedBtn, { backgroundColor: colors.primary }]}
                  onPress={triggerDatabaseSeed}
                  disabled={isSeeding}
                >
                  {isSeeding ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <>
                      <Database size={16} color={colors.background} />
                      <Text style={[styles.seedBtnText, { color: colors.background }]}>Seed Mock Data to Firebase</Text>
                    </>
                  )}
                </TouchableOpacity>

                {clearanceMessage ? (
                  <View style={[styles.alertBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                    <Text style={{ color: colors.text, fontSize: 11 }}>{clearanceMessage}</Text>
                  </View>
                ) : null}
              </View>

              {/* USER MANAGER SECTION */}
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.groupHeading, { color: colors.text, marginBottom: 8 }]}>Registered Platform Accounts ({allUsers.length})</Text>
                {allUsers.map(u => (
                  <View key={u.email} style={[styles.userListItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View>
                      <Text style={[styles.userListName, { color: colors.text }]}>{u.name}</Text>
                      <Text style={{ color: colors.subText, fontSize: 10 }}>{u.email}</Text>
                      <Text style={{ color: colors.subText, fontSize: 9, marginTop: 2 }}>City: {u.district} | Points: {u.rewardPoints}</Text>
                    </View>
                    <View style={[styles.roleBadgeContainer, { backgroundColor: u.role === 'ADMIN' ? colors.error : u.role === 'MERCHANT' ? colors.secondary : colors.primary }]}>
                      <Text style={styles.roleBadgeText}>{u.role}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 5: SUPPORT DESK */}
          {activeTab === 'SUPPORT' && (
            <View style={styles.viewSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>Support Desk Tickets</Text>
              <Text style={[styles.welcomeSub, { color: colors.subText, marginBottom: 16 }]}>
                Address and resolve customer inquiries and merchant concerns.
              </Text>

              {/* TICKETS LIST */}
              <View style={{ gap: 12 }}>
                {tickets.map(t => (
                  <View key={t.id} style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.ticketHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.ticketSubject, { color: colors.text }]}>{t.subject}</Text>
                        <Text style={{ color: colors.subText, fontSize: 10 }}>From: {t.user} ({t.email}) • {t.date}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: t.status === 'PENDING' ? 'rgba(255,171,0,0.1)' : 'rgba(0,200,83,0.1)' }]}>
                        <Text style={{ color: t.status === 'PENDING' ? colors.warning : colors.success, fontSize: 9, fontWeight: 'bold' }}>
                          {t.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.ticketMessage, { color: colors.text }]}>{t.message}</Text>

                    {t.reply ? (
                      <View style={[styles.replyBox, { backgroundColor: colors.surfaceVariant }]}>
                        <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>Admin Response:</Text>
                        <Text style={{ color: colors.text, fontSize: 11 }}>{t.reply}</Text>
                      </View>
                    ) : (
                      activeTicketId === t.id ? (
                        <View style={{ marginTop: 12 }}>
                          <TextInput 
                            style={[styles.replyInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            placeholder="Type reply response..."
                            placeholderTextColor={colors.subText}
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                          />
                          <View style={styles.replyActionRow}>
                            <TouchableOpacity style={styles.cancelReplyBtn} onPress={() => setActiveTicketId(null)}>
                              <Text style={{ color: colors.subText, fontSize: 11 }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.submitReplyBtn, { backgroundColor: colors.primary }]} onPress={() => handleReplyTicket(t.id)}>
                              <Text style={{ color: colors.background, fontSize: 11, fontWeight: 'bold' }}>Send Response</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity style={[styles.replyBtn, { borderColor: colors.border }]} onPress={() => setActiveTicketId(t.id)}>
                          <Text style={[styles.replyBtnText, { color: colors.primary }]}>Reply Ticket</Text>
                        </TouchableOpacity>
                      )
                    )}
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
    flexDirection: 'row',
  },
  // Desktop Sidebar
  sidebarDesktop: {
    width: 250,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 10,
  },
  // Mobile Header
  mobileHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  mobileHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Mobile Drawer
  mobileDrawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  mobileDrawer: {
    width: 250,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 10,
  },
  mobileCloseContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  // Sidebar Header
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  logoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconText: {
    color: '#FFF',
    fontWeight: 'black',
    fontSize: 14,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '900',
  },
  enterpriseBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  enterpriseText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Profile Section
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profileName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  profileRole: {
    fontSize: 8,
    fontWeight: 'black',
    marginTop: 2,
  },
  // Navigation Menu
  menuContainer: {
    paddingHorizontal: 16,
    gap: 6,
  },
  menuHeading: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuItemActive: {
    borderWidth: 1,
  },
  menuItemText: {
    fontSize: 12,
  },
  badgeCount: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCountText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Sidebar Footer
  sidebarFooter: {
    marginTop: 40,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Content Layout
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  viewSection: {
    gap: 20,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSub: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  badgeClearance: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeClearanceText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  // Stats Tiles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statTileCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  statTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 'auto',
    marginRight: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statTileVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  statTileLabel: {
    fontSize: 10,
  },
  // Cards
  systemStatusCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardSubText: {
    fontSize: 11,
    lineHeight: 16,
  },
  indicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    borderTopWidth: 0.5,
    paddingTop: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentOrdersCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  orderMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  orderMiniId: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderMiniItems: {
    fontSize: 10,
    marginTop: 2,
  },
  // Catalogue View
  catalogueHeaderCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  searchBox: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  catalogueTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  catTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  catTabBtnActive: {
    shadowOpacity: 0.1,
  },
  catTabText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  catalogItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  catalogItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
  },
  // Moderation
  moderationGroup: {
    gap: 8,
  },
  groupHeading: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modRow: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modItemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionRoundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Clearance View
  adminActionsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  seedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 10,
    marginTop: 8,
  },
  seedBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  userListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  userListName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Tickets View
  ticketCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketSubject: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ticketMessage: {
    fontSize: 11,
    lineHeight: 16,
  },
  replyBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  replyBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  replyBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  replyInput: {
    height: 60,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
  },
  replyActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelReplyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  submitReplyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  }
});
