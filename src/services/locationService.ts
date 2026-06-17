import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export class LocationService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Location permission denied, using demo location');
        return this.getDemoLocation();
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return this.getDemoLocation();
    }
  }

  private static getDemoLocation(): LocationData {
    // Malawi coordinates (Lilongwe)
    return {
      latitude: -13.9626,
      longitude: 33.7741,
      accuracy: 10,
      timestamp: Date.now(),
    };
  }

  static async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        // Format: "Street, City" or just "City" if no street
        const parts = [];
        if (addr.street) parts.push(addr.street);
        if (addr.city) parts.push(addr.city);
        if (parts.length === 0 && addr.region) parts.push(addr.region);
        return parts.join(', ') || 'Unknown Location';
      }
      return 'Unknown Location';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Location coordinates recorded';
    }
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static isWithinRange(
    currentLat: number,
    currentLon: number,
    targetLat: number,
    targetLon: number,
    rangeMeters: number = 100
  ): boolean {
    const distance = this.calculateDistance(currentLat, currentLon, targetLat, targetLon);
    return distance <= rangeMeters;
  }
}