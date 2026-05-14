import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Image, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports, subscribeToReportUpdates } from '../services/reportService';
import { AnimalReport } from '../lib/supabaseTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 3.139,
  longitude: 101.6869,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const data = await getAllReports();
      setReports(data.filter(r => r.latitude && r.longitude));
    } catch (error) {
      console.error('Error fetching reports for map:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToReportUpdates((updatedReport) => {
      setReports(prev => {
        const index = prev.findIndex(r => r.id === updatedReport.id);
        if (index !== -1) {
          // Update existing
          const newReports = [...prev];
          newReports[index] = updatedReport;
          return newReports;
        } else if (updatedReport.latitude && updatedReport.longitude) {
          // Add new if it has coordinates
          return [...prev, updatedReport];
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [fetchReports]);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'new': return colors.minimalist.coral;
      case 'in_progress': return '#D97706'; // Amber
      case 'rescued': return '#2563EB'; // Blue
      case 'resolved': return '#059669'; // Green
      default: return colors.minimalist.textLight;
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return 'paw';
      case 'cat': return 'paw';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsMyLocationButton
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude!,
              longitude: report.longitude!,
            }}
            pinColor={getMarkerColor(report.status)}
          >
            <Callout
              tooltip
              onPress={() => router.push({
                pathname: '/ngo-report-detail',
                params: { reportId: report.id }
              })}
            >
              <View style={styles.calloutContainer}>
                <View style={styles.calloutHeader}>
                  <Text style={styles.calloutTitle}>{report.species.toUpperCase()}</Text>
                  <View style={[styles.statusDot, { backgroundColor: getMarkerColor(report.status) }]} />
                </View>
                <Text style={styles.calloutSubtitle}>{report.breed || 'Unknown Breed'}</Text>
                <Text style={styles.calloutAddress} numberOfLines={1}>{report.address}</Text>
                <View style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={12} color="#fff" />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.minimalist.coral} />
        </View>
      )}

      {/* Floating Controls */}
      <View style={styles.controls}>
        <Pressable
          style={styles.controlButton}
          onPress={fetchReports}
        >
          <Ionicons name="refresh" size={24} color={colors.minimalist.textDark} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.minimalist.textDark,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: colors.minimalist.textMedium,
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 10,
    color: colors.minimalist.textLight,
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: colors.minimalist.coral,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
