import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, 
  TouchableOpacity, Alert 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { Award, Gift, ShieldAlert, Sparkles, Send } from 'lucide-react-native';

export const LoyaltyScreen: React.FC = () => {
  const { 
    isDarkMode, currentUser, coupons, redeemCoupon, 
    applyReferralCode, purchaseVipSubscription, triggerMockNotification
  } = useAppContext();

  const { contentWidth, padding } = useDimensions();

  // Local inputs
  const [refCodeInput, setRefCodeInput] = useState('');
  const [refResultMsg, setRefResultMsg] = useState<string | null>(null);

  // Theme colors
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

  const handleRedeem = async (couponCode: string) => {
    const success = await redeemCoupon(couponCode);
    if (success) {
      Alert.alert("Coupon Redeemed!", `Successfully redeemed code ${couponCode}! discount active.`);
    } else {
      Alert.alert("Redeem Failed", "Check if you have sufficient points or if the coupon was already redeemed.");
    }
  };

  const handleApplyRef = () => {
    setRefResultMsg(null);
    if (!refCodeInput.trim()) return;

    const res = applyReferralCode(refCodeInput);
    if (res === 'SUCCESS') {
      setRefResultMsg("Referral Applied! Credited LKR 500 & 200 pts.");
      setRefCodeInput('');
    } else {
      setRefResultMsg(res);
    }
  };

  const handlePurchaseVip = (tier: 'SILVER' | 'GOLD') => {
    const res = purchaseVipSubscription(tier);
    if (res === 'SUCCESS') {
      Alert.alert("VIP Active!", `Successfully subscribed to ${tier} Membership!`);
    } else {
      Alert.alert("Failed", res);
    }
  };

  // Next level points progress
  const points = currentUser?.rewardPoints || 0;
  const progressRatio = Math.min(1, points / 10000);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.mainLayout, { maxWidth: contentWidth, paddingHorizontal: padding }]}>
        
        {/* REWARD POINTS BANNER */}
        <View style={[styles.rewardBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.labelText, { color: colors.subText }]}>LOYALTY REWARDS BALANCE</Text>
              <Text style={[styles.pointsVal, { color: colors.primary }]}>{points} PTS</Text>
            </View>
            <Award size={40} color={colors.primary} />
          </View>

          {/* Progress bar */}
          <View style={{ marginTop: 16 }}>
            <View style={styles.rowBetween}>
              <Text style={{ color: colors.subText, fontSize: 10 }}>Tier Level Progress (Next: 10,000 PTS)</Text>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>{Math.floor(progressRatio * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>

        {/* REDEEMABLE COUPONS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎁 Redeem Points for Vouchers</Text>
          <View style={{ gap: 8 }}>
            {coupons.map(coupon => (
              <View key={coupon.code} style={[styles.couponRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.couponIconBox, { backgroundColor: colors.surfaceVariant }]}>
                  <Gift size={18} color={colors.primary} />
                </View>
                
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>{coupon.code}</Text>
                  <Text style={{ color: colors.subText, fontSize: 10 }}>{coupon.description}</Text>
                  <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>Cost: {coupon.costPoints} Points</Text>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.redeemBtn, 
                    { 
                      backgroundColor: coupon.isRedeemed ? '#444' : colors.primary,
                      opacity: (points >= coupon.costPoints && !coupon.isRedeemed) ? 1 : 0.6 
                    }
                  ]}
                  disabled={points < coupon.costPoints || coupon.isRedeemed}
                  onPress={() => handleRedeem(coupon.code)}
                >
                  <Text style={{ color: colors.background, fontSize: 9, fontWeight: 'bold' }}>
                    {coupon.isRedeemed ? "Redeemed" : "Redeem"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* REFERRAL SYSTEM */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardHeader, { color: colors.text }]}>🎁 Refer & Earn Rewards</Text>
          <Text style={{ color: colors.subText, fontSize: 11, marginBottom: 12 }}>
            Share your code to earn cash and points. Enter a friend's code below to receive LKR 500 cashback instantly!
          </Text>

          <View style={styles.referralShareBox}>
            <Text style={{ color: colors.subText, fontSize: 10 }}>YOUR REFERRAL CODE:</Text>
            <View style={styles.rowBetween}>
              <Text style={[styles.refCodeText, { color: colors.primary }]}>{currentUser?.referralCode || "REF-XXXX"}</Text>
              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => {
                  triggerMockNotification("🔗 Code Copied", "Your referral code has been copied to the clipboard.");
                  Alert.alert("Copied!", "Referral code copied to clipboard!");
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>Copy Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Apply Input */}
          {!currentUser?.hasClaimedReferral ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: colors.subText, fontSize: 9, marginBottom: 4 }}>APPLY FRIEND'S REFERRAL CODE</Text>
              <View style={[styles.applyRow, { borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}>
                <TextInput 
                  style={[styles.applyInput, { color: colors.text }]}
                  placeholder="e.g. REF-LANKA-991"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={refCodeInput}
                  onChangeText={setRefCodeInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={[styles.applyActionBtn, { backgroundColor: colors.primary }]} onPress={handleApplyRef}>
                  <Send size={12} color={colors.background} />
                </TouchableOpacity>
              </View>
              {refResultMsg && (
                <Text style={{ color: refResultMsg.includes('Applied') ? '#00C853' : '#D50000', fontSize: 10, marginTop: 4, fontWeight: 'bold' }}>
                  {refResultMsg}
                </Text>
              )}
            </View>
          ) : (
            <View style={[styles.claimedBadge, { backgroundColor: 'rgba(0,200,83,0.1)' }]}>
              <Text style={{ color: '#00C853', fontSize: 11, fontWeight: 'bold' }}>✓ Referral Bonus Claimed successfully!</Text>
            </View>
          )}
        </View>

        {/* VIP SUBSCRIPTION PLANS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⭐ Elite VIP Subscriptions</Text>
          <View style={styles.vipContainer}>
            
            {/* SILVER PLAN */}
            <View style={[styles.vipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: '#90A4AE', fontSize: 13, fontWeight: 'bold' }}>🥈 SILVER VIP</Text>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: 'bold' }}>LKR 290/mo</Text>
              </View>
              <Text style={{ color: colors.subText, fontSize: 9, marginVertical: 6 }}>
                +300 LKR welcome gift cashback. Added VIP badge, 1.5x points multiplier.
              </Text>
              <TouchableOpacity 
                style={[styles.vipBuyBtn, { backgroundColor: currentUser?.subscriptionState === 'SILVER' ? '#444' : colors.primary }]}
                disabled={currentUser?.subscriptionState === 'SILVER'}
                onPress={() => handlePurchaseVip('SILVER')}
              >
                <Text style={{ color: colors.background, fontSize: 9, fontWeight: 'bold' }}>
                  {currentUser?.subscriptionState === 'SILVER' ? 'Active' : 'Buy Subscription'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* GOLD PLAN */}
            <View style={[styles.vipCard, { backgroundColor: colors.surface, borderColor: '#FFD700', borderWidth: 1 }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: '#FFD700', fontSize: 13, fontWeight: 'bold' }}>👑 GOLD VIP</Text>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: 'bold' }}>LKR 590/mo</Text>
              </View>
              <Text style={{ color: colors.subText, fontSize: 9, marginVertical: 6 }}>
                +800 LKR welcome gift cashback. Elite Gold VIP badge, 2.5x points multiplier, free express courier!
              </Text>
              <TouchableOpacity 
                style={[styles.vipBuyBtn, { backgroundColor: currentUser?.subscriptionState === 'GOLD' ? '#444' : '#FFD700' }]}
                disabled={currentUser?.subscriptionState === 'GOLD'}
                onPress={() => handlePurchaseVip('GOLD')}
              >
                <Text style={{ color: '#0C0717', fontSize: 9, fontWeight: 'bold' }}>
                  {currentUser?.subscriptionState === 'GOLD' ? 'Active' : 'Buy Subscription'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

      </View>
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
  rewardBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  labelText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  pointsVal: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  couponIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redeemBtn: {
    height: 24,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  referralShareBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  refCodeText: {
    fontSize: 18,
    fontWeight: 'black',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  shareBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  applyRow: {
    flexDirection: 'row',
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  applyInput: {
    flex: 1,
    fontSize: 12,
  },
  applyActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimedBadge: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  vipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  vipCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  vipBuyBtn: {
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
export default LoyaltyScreen;
