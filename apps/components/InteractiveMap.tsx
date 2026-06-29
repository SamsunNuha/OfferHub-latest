import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapLocation } from '../utils/districts';

interface InteractiveMapProps {
  center: { latitude: number; longitude: number };
  locations: MapLocation[];
  selectedLoc: MapLocation | null;
  onSelectLoc: (loc: MapLocation | null) => void;
  showDirections: boolean;
  isHeatmap: boolean;
  isDarkMap: boolean;
  isPlacementMode: boolean;
  onPlaceLocation: (latitude: number, longitude: number) => void;
  gpsCoords: { latitude: number; longitude: number };
}

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#120b24" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#120b24" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#a89bc4" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#3f2d6b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#22183d" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#05020a" }]
  }
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  locations,
  selectedLoc,
  onSelectLoc,
  showDirections,
  isHeatmap,
  isDarkMap,
  isPlacementMode,
  onPlaceLocation,
  gpsCoords,
}) => {
  const mapRef = useRef<MapView>(null);

  // Animate to region when center changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  }, [center]);

  const handleMapPress = (e: any) => {
    if (isPlacementMode) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      onPlaceLocation(latitude, longitude);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={isDarkMap ? darkMapStyle : undefined}
        onPress={handleMapPress}
      >
        {/* GPS Location Pin */}
        <Marker
          coordinate={gpsCoords}
          title="Your Location"
          description="Calculated GPS Center"
        >
          <View style={styles.gpsDot}>
            <View style={styles.gpsPulse} />
            <View style={styles.gpsInner} />
          </View>
        </Marker>

        {/* Scattered Store Pins */}
        {locations.map((loc) => {
          const isSelected = selectedLoc?.id === loc.id;
          const emoji = loc.category === 'Grocery' ? '🛒' : loc.category === 'Electronics' ? '🔌' : loc.category === 'Fashion' ? '👗' : '🍕';
          
          return (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.name}
              description={loc.offers[0] || loc.category}
              onPress={() => onSelectLoc(loc)}
            >
              <View style={[
                styles.pinBody,
                { backgroundColor: isSelected ? '#A865C9' : '#FFFFFF', borderColor: isSelected ? '#FFFFFF' : '#3F2D6B' }
              ]}>
                <Text style={styles.pinText}>{emoji}</Text>
              </View>
            </Marker>
          );
        })}

        {/* Heatmap overlay represented via translucent Circle areas */}
        {isHeatmap && locations.map((loc) => (
          <Circle
            key={`heat_${loc.id}`}
            center={{ latitude: loc.latitude, longitude: loc.longitude }}
            radius={250}
            fillColor="rgba(213, 0, 0, 0.2)"
            strokeColor="rgba(213, 0, 0, 0.4)"
            strokeWidth={1}
          />
        ))}

        {/* Directions Polyline Path */}
        {showDirections && selectedLoc && (
          <Polyline
            coordinates={[
              { latitude: gpsCoords.latitude, longitude: gpsCoords.longitude },
              { latitude: selectedLoc.latitude, longitude: selectedLoc.longitude }
            ]}
            strokeColor="#A865C9"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gpsDot: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.25)',
  },
  gpsInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  pinBody: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  pinText: {
    fontSize: 14,
  },
});
