import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Compass, MapPin, Navigation, Crosshair, Info } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function QiblaScreen() {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA',
  });
  
  const [qiblaDirection, setQiblaDirection] = useState(58);
  const [deviceHeading, setDeviceHeading] = useState(0);

  const calculateQiblaDirection = () => {
    const kaabahLat = 21.4225;
    const kaabahLng = 39.8262;
    
    const lat1 = currentLocation.latitude * Math.PI / 180;
    const lat2 = kaabahLat * Math.PI / 180;
    const deltaLng = (kaabahLng - currentLocation.longitude) * Math.PI / 180;
    
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    setQiblaDirection(bearing);
  };

  useEffect(() => {
    calculateQiblaDirection();
  }, [currentLocation]);

  const handleCalibrate = () => {
    Alert.alert(
      'Calibrate Compass',
      'Move your device in a figure-8 pattern to calibrate the compass.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            setTimeout(() => {
              Alert.alert('Calibration Complete', 'Your compass has been calibrated successfully.');
            }, 3000);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#059669', '#10b981']}
        style={styles.header}>
        <Text style={styles.headerTitle}>Qibla Direction</Text>
        <Text style={styles.headerSubtitle}>Find the direction to Mecca</Text>
      </LinearGradient>

      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <MapPin size={20} color="#059669" />
          <Text style={styles.locationTitle}>Current Location</Text>
        </View>
        <Text style={styles.locationText}>
          {currentLocation.city}, {currentLocation.country}
        </Text>
        <Text style={styles.coordinatesText}>
          {currentLocation.latitude.toFixed(4)}°, {currentLocation.longitude.toFixed(4)}°
        </Text>
      </View>

      <View style={styles.compassContainer}>
        <View style={styles.compassWrapper}>
          <View style={styles.compass}>
            <LinearGradient
              colors={['#1f2937', '#374151']}
              style={styles.compassGradient}>
              <View style={styles.cardinalContainer}>
                <Text style={[styles.cardinalText, styles.north]}>N</Text>
                <Text style={[styles.cardinalText, styles.east]}>E</Text>
                <Text style={[styles.cardinalText, styles.south]}>S</Text>
                <Text style={[styles.cardinalText, styles.west]}>W</Text>
              </View>
              <View style={styles.centerDot} />
              <View style={styles.crosshair}>
                <Crosshair size={32} color="#ffffff" strokeWidth={3} />
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.directionInfo}>
          <Text style={styles.directionDegrees}>{Math.round(qiblaDirection)}°</Text>
          <Text style={styles.directionLabel}>to Mecca</Text>
        </View>
      </View>

      <View style={styles.accuracyCard}>
        <View style={styles.accuracyHeader}>
          <View style={[styles.accuracyDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.accuracyTitle}>Qibla Finder Active</Text>
        </View>
        <Text style={styles.accuracyDescription}>
          Point your device towards Mecca based on the direction shown above
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.calibrateButton} onPress={handleCalibrate}>
          <Navigation size={20} color="#ffffff" />
          <Text style={styles.calibrateButtonText}>Calibrate Compass</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.infoButton}>
          <Info size={20} color="#6b7280" />
          <Text style={styles.infoButtonText}>How to Use</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.distanceCard}>
        <Text style={styles.distanceTitle}>Distance to Mecca</Text>
        <Text style={styles.distanceValue}>5,585 km</Text>
        <Text style={styles.distanceSubtitle}>Great Circle Distance</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#dcfce7',
    fontWeight: '500',
  },
  locationCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -15,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#6b7280',
  },
  compassContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  compassWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  compassGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardinalContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardinalText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  north: {
    top: 15,
    alignSelf: 'center',
  },
  east: {
    right: 15,
    top: '50%',
    marginTop: -10,
  },
  south: {
    bottom: 15,
    alignSelf: 'center',
  },
  west: {
    left: 15,
    top: '50%',
    marginTop: -10,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  crosshair: {
    position: 'absolute',
  },
  directionInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  directionDegrees: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  directionLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  accuracyCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accuracyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  accuracyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  accuracyDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  calibrateButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  calibrateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  infoButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  distanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  distanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  distanceSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
});