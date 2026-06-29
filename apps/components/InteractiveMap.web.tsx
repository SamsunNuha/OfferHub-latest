import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle messages posted from inside the Leaflet iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      
      if (event.data.type === 'MARKER_CLICK') {
        const found = locations.find(l => l.id === event.data.id);
        if (found) {
          onSelectLoc(found);
        }
      } else if (event.data.type === 'MAP_TAP') {
        if (isPlacementMode) {
          onPlaceLocation(event.data.latitude, event.data.longitude);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [locations, isPlacementMode, onSelectLoc, onPlaceLocation]);

  // Construct Leaflet HTML content dynamically
  const tileUrl = isDarkMap
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const markerColors = {
    selected: '#A865C9',
    unselected: '#7C4DFF',
    gps: '#00E676',
  };

  const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
      <style>
        html, body, #map {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: ${isDarkMap ? '#0c0717' : '#f6f2ff'};
        }
        .custom-pin {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 2px solid white;
          color: white;
          font-size: 14px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
        }
        .gps-pin {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #00E676;
          border: 2.5px solid white;
          box-shadow: 0 0 10px rgba(0,230,118,0.8);
          position: relative;
        }
        .gps-pulse {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: rgba(0,230,118,0.35);
          top: -7.5px;
          left: -7.5px;
          animation: pulse 1.8s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', {
          zoomControl: false
        }).setView([${center.latitude}, ${center.longitude}], 14);

        L.tileLayer('${tileUrl}', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
        }).addTo(map);

        // Add Zoom Control at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // GPS Pulse Marker
        const gpsIcon = L.divIcon({
          className: 'gps-container',
          html: '<div class="gps-pulse"></div><div class="gps-pin"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        L.marker([${gpsCoords.latitude}, ${gpsCoords.longitude}], { icon: gpsIcon }).addTo(map);

        // Markers mapping
        const markers = [];
        const locations = ${JSON.stringify(locations)};
        const selectedId = ${selectedLoc ? JSON.stringify(selectedLoc.id) : 'null'};

        locations.forEach(loc => {
          const isSelected = loc.id === selectedId;
          const emoji = loc.category === 'Grocery' ? '🛒' : loc.category === 'Electronics' ? '🔌' : loc.category === 'Fashion' ? '👗' : '🍕';
          const bgColor = isSelected ? '${markerColors.selected}' : '${markerColors.unselected}';
          
          const customIcon = L.divIcon({
            className: 'custom-pin-container',
            html: '<div class="custom-pin" style="background-color: ' + bgColor + ';">' + emoji + '</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const m = L.marker([loc.latitude, loc.longitude], { icon: customIcon })
            .addTo(map)
            .on('click', () => {
              window.parent.postMessage({ type: 'MARKER_CLICK', id: loc.id }, '*');
            });
          
          markers.push(m);
        });

        // Draw Directions Path
        const showDirections = ${showDirections};
        if (showDirections && selectedId) {
          const selLoc = locations.find(l => l.id === selectedId);
          if (selLoc) {
            const pathCoords = [
              [${gpsCoords.latitude}, ${gpsCoords.longitude}],
              [selLoc.latitude, selLoc.longitude]
            ];
            L.polyline(pathCoords, {
              color: '${markerColors.selected}',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.8
            }).addTo(map);
          }
        }

        // Render Heatmap circles
        const isHeatmap = ${isHeatmap};
        if (isHeatmap) {
          locations.forEach(loc => {
            L.circle([loc.latitude, loc.longitude], {
              color: 'rgba(213, 0, 0, 0.4)',
              fillColor: 'rgba(213, 0, 0, 0.2)',
              fillOpacity: 0.4,
              radius: 200
            }).addTo(map);
          });
        }

        // Map Click handling (for placing new markers)
        map.on('click', (e) => {
          const isPlacementMode = ${isPlacementMode};
          if (isPlacementMode) {
            window.parent.postMessage({
              type: 'MAP_TAP',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }, '*');
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef}
        title="Interactive Map"
        srcDoc={leafletHtml}
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '16px' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
