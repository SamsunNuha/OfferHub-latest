import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  Dimensions, Alert, TextInput 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { DISTRICT_CENTERS } from '../utils/districts';
import { scatterLocations, MapLocation, calculateDistance } from '../utils/districts';
import { DistrictSelectorDialog } from '../components/Dialogs';
import { Navigation, MapPin, Compass, Layers, Plus, Trash2, Eye } from 'lucide-react-native';

export const MapScreen: React.FC = () => {
  const { isDarkMode, currentUser, triggerMockNotification } = useAppContext();
  const { contentWidth, isMobile } = useDimensions();

  // Map state variables
  const [district, setDistrict] = useState('Colombo');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  
  const center = DISTRICT_CENTERS[district] || DISTRICT_CENTERS.Colombo;
  const [gpsLat, setGpsLat] = useState(center.latitude);
  const [gpsLon, setGpsLon] = useState(center.longitude);

  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  
  // Custom placed merchants
  const [placedLocs, setPlacedLocs] = useState<MapLocation[]>([]);

  // Layout control toggles
  const [isHeatmap, setIsHeatmap] = useState(false);
  const [isClustered, setIsClustered] = useState(false);
  const [isDarkMap, setIsDarkMap] = useState(true);
  const [showDirections, setShowDirections] = useState(false);
  const [isPlacementMode, setIsPlacementMode] = useState(false);

  // Load scattered pins on district change
  useEffect(() => {
    const list = scatterLocations(district);
    setLocations(list);
    setSelectedLoc(null);
    setShowDirections(false);
    
    // Recenter GPS dot closer to new district center
    setGpsLat(center.latitude);
    setGpsLon(center.longitude);
  }, [district]);

  // Combine default scattered locations and user custom placed locations
  const allLocations = [...locations, ...placedLocs.filter(l => l.district === district)];

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
    amber: '#FFB300',
    success: '#00E676',
    warning: '#FF9100',
    error: '#FF1744'
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    secondary: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
    amber: '#FF8F00',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#C62828'
  };

  const handleMapTap = (e: any) => {
    if (!isPlacementMode) return;

    // Simulate placing a new merchant at tap coordinate offset
    const nativeEvent = e.nativeEvent;
    
    // Translate tap position into simulated coordinate offset
    const mapHeight = 280;
    const latOffset = ((nativeEvent.locationY / mapHeight) - 0.5) * -0.015;
    const lonOffset = ((nativeEvent.locationX / Dimensions.get('window').width) - 0.5) * 0.015;

    const newLat = center.latitude + latOffset;
    const newLon = center.longitude + lonOffset;

    const newLoc: MapLocation = {
      id: `custom_${Date.now()}`,
      name: "User Placed Brand Outlet",
      category: "Grocery",
      latitude: newLat,
      longitude: newLon,
      district: district,
      address: `Simulated Coordinates: ${newLat.toFixed(4)}, ${newLon.toFixed(4)}`,
      contact: "+94 11 000 0000",
      rating: 5.0,
      offers: ["Platform Approved Deal 15% OFF"]
    };

    setPlacedLocs(prev => [...prev, newLoc]);
    setSelectedLoc(newLoc);
    setIsPlacementMode(false);
    triggerMockNotification("📍 Merchant Placed", `Successfully placed custom store at coordinates ${newLat.toFixed(4)}N, ${newLon.toFixed(4)}E`);
  };

  const handleDirectionsToggle = () => {
    if (!selectedLoc) return;
    setShowDirections(prev => !prev);
    if (!showDirections) {
      const dist = calculateDistance(gpsLat, gpsLon, selectedLoc.latitude, selectedLoc.longitude);
      triggerMockNotification("🛵 Directions Generated", `Calculating polyline path to ${selectedLoc.name}. Total distance: ${dist.toFixed(2)} km.`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.mainLayout, { maxWidth: contentWidth }]}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Store Locator & Live Map</Text>
            <Text style={{ color: colors.subText, fontSize: 11 }}>Discover closest platform verified discounts</Text>
          </View>
          <TouchableOpacity 
            style={[styles.dropdownBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowDistrictModal(true)}
          >
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>📍 {district}</Text>
          </TouchableOpacity>
        </View>

        {/* MAP GRID BOX */}
        <TouchableOpacity 
          activeOpacity={1}
          style={[
            styles.mapGridContainer, 
            { 
              backgroundColor: isDarkMap ? '#05020A' : '#EDE7F6', 
              borderColor: colors.border 
            }
          ]}
          onPress={handleMapTap}
        >
          {/* Simulated Grid Overlay lines */}
          <View style={styles.gridLinesOverlay} pointerEvents="none">
            {[1,2,3,4,5].map(i => (
              <View key={`h_${i}`} style={[styles.gridLineH, { top: `${i * 20}%`, borderColor: isDarkMap ? '#22163A' : '#D1C4E9' }]} />
            ))}
            {[1,2,3,4,5].map(i => (
              <View key={`v_${i}`} style={[styles.gridLineV, { left: `${i * 20}%`, borderColor: isDarkMap ? '#22163A' : '#D1C4E9' }]} />
            ))}
          </View>

          {/* Simulated Heatmap glow overlays */}
          {isHeatmap && (
            <View style={styles.heatmapOverlay} pointerEvents="none">
              <View style={[styles.heatSpot, { top: '30%', left: '40%' }]} />
              <View style={[styles.heatSpot, { top: '60%', left: '70%' }]} />
            </View>
          )}

          {/* User GPS Dot */}
          <View style={[styles.gpsDot, { top: '50%', left: '50%' }]}>
            <View style={styles.gpsPulse} />
            <View style={styles.gpsInner} />
          </View>

          {/* Scattered Store Pins */}
          {allLocations.map((loc, index) => {
            // Translate coordinates to relative percentage positions on screen grid
            const latDiff = loc.latitude - center.latitude;
            const lonDiff = loc.longitude - center.longitude;

            // Simple scaling factors to fit scattered bounds beautifully in center
            const relativeTop = 50 - (latDiff * 2500); // Inverse for latitude
            const relativeLeft = 50 + (lonDiff * 2500);

            const isSelected = selectedLoc?.id === loc.id;

            return (
              <TouchableOpacity
                key={loc.id}
                style={[
                  styles.pinContainer, 
                  { 
                    top: `${Math.min(90, Math.max(10, relativeTop))}%`, 
                    left: `${Math.min(90, Math.max(10, relativeLeft))}%` 
                  }
                ]}
                onPress={() => {
                  setSelectedLoc(loc);
                  setShowDirections(false);
                }}
              >
                <View style={[
                  styles.pinGlow, 
                  { backgroundColor: isSelected ? colors.primary : '#8E24AA' }
                ]} />
                <View style={[
                  styles.pinBody, 
                  { backgroundColor: isSelected ? colors.primary : colors.surface }
                ]}>
                  <Text style={{ fontSize: 10 }}>
                    {loc.category === 'Grocery' ? '🛒' : loc.category === 'Electronics' ? '🔌' : loc.category === 'Fashion' ? '👗' : '🍕'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Directions Polyline Path */}
          {showDirections && selectedLoc && (
            <View style={styles.directionLineContainer} pointerEvents="none">
              {/* Pulsing route line from center (GPS) to selectedLoc pin */}
              <View style={[styles.routePolyline, { borderColor: colors.primary }]} />
            </View>
          )}

          {/* Diagnostic placement overlay badge */}
          {isPlacementMode && (
            <View style={styles.placementBadge} pointerEvents="none">
              <Text style={styles.placementText}>PLACEMENT MODE ACTIVE: TAP GRID TO ADD OUTLET</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* MAP STYLE CONTROLS BAR */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: colors.surface }]}
            onPress={() => setIsDarkMap(!isDarkMap)}
          >
            <Compass size={14} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 10 }}>Style: {isDarkMap ? "Dark" : "Light"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: colors.surface }]}
            onPress={() => setIsHeatmap(!isHeatmap)}
          >
            <Layers size={14} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 10 }}>Heatmap: {isHeatmap ? "On" : "Off"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: colors.surface }]}
            onPress={() => setIsPlacementMode(!isPlacementMode)}
          >
            <Plus size={14} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 10 }}>Add Shop</Text>
          </TouchableOpacity>
        </View>

        {/* SELECTED STORE PROFILE DETAIL PANEL (BOTTOM SHEET) */}
        {selectedLoc ? (
          <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.locCategory, { color: colors.primary }]}>{selectedLoc.category.toUpperCase()} STORE</Text>
                <Text style={[styles.locName, { color: colors.text }]}>{selectedLoc.name}</Text>
              </View>
              <Text style={styles.ratingLabel}>⭐ {selectedLoc.rating}</Text>
            </View>
            
            <Text style={{ color: colors.subText, fontSize: 11, marginTop: 6 }}>📍 {selectedLoc.address}</Text>
            <Text style={{ color: colors.subText, fontSize: 11, marginTop: 2 }}>📞 Phone: {selectedLoc.contact}</Text>

            <View style={styles.offerTagRow}>
              {selectedLoc.offers.map((o, idx) => (
                <View key={idx} style={[styles.offerTag, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={{ color: colors.primary, fontSize: 9, fontWeight: 'bold' }}>🏷️ {o}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.row, { gap: 10, marginTop: 16 }]}>
              <TouchableOpacity 
                style={[styles.directionBtn, { backgroundColor: colors.primary }]}
                onPress={handleDirectionsToggle}
              >
                <Navigation size={14} color={colors.background} />
                <Text style={{ color: colors.background, fontSize: 12, fontWeight: 'bold', marginLeft: 6 }}>
                  {showDirections ? "Hide Directions" : "Draw Directions Path"}
                </Text>
              </TouchableOpacity>

              {selectedLoc.id.includes('custom') && (
                <TouchableOpacity 
                  style={[styles.removeBtn, { borderColor: '#D50000', borderWidth: 1 }]}
                  onPress={() => {
                    setPlacedLocs(prev => prev.filter(l => l.id !== selectedLoc.id));
                    setSelectedLoc(null);
                  }}
                >
                  <Trash2 size={14} color="#D50000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.subText, fontSize: 12, textAlign: 'center' }}>
              Tap any pin outlet on the coordinate grid map above to review active flyer vouchers and calculate routing distances.
            </Text>
          </View>
        )}

      </View>

      <DistrictSelectorDialog 
        visible={showDistrictModal}
        colors={colors}
        onDismiss={() => setShowDistrictModal(false)}
        onSelect={setDistrict}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  dropdownBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 20,
  },
  mapGridContainer: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  gridLinesOverlay: {
    ...StyleSheet.absoluteFill,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 0.5,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRightWidth: 0.5,
  },
  heatmapOverlay: {
    ...StyleSheet.absoluteFill,
  },
  heatSpot: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(213,0,0,0.3)',
    shadowColor: '#D50000',
    shadowRadius: 20,
    shadowOpacity: 0.8,
  },
  gpsDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginTop: -7,
    marginLeft: -7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,230,118,0.25)',
  },
  gpsInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  pinContainer: {
    position: 'absolute',
    width: 26,
    height: 26,
    marginTop: -13,
    marginLeft: -13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.15,
  },
  pinBody: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  directionLineContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routePolyline: {
    width: '40%',
    height: '40%',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 100,
    transform: [{ rotate: '-25deg' }],
    opacity: 0.7,
  },
  placementBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(213,0,0,0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  placementText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
    gap: 8,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 4,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locCategory: {
    fontSize: 9,
    fontWeight: 'black',
    letterSpacing: 1,
  },
  locName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  offerTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  offerTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  directionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
export default MapScreen;
