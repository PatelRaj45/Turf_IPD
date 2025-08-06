/**
 * Geocoder utility for location-based operations
 * This utility provides functions for geocoding (converting addresses to coordinates)
 * and reverse geocoding (converting coordinates to addresses)
 */

/**
 * Convert address to coordinates (latitude, longitude)
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number}>} - The coordinates
 */
export const geocode = async (address) => {
  // In a production environment, you would use a geocoding service like Google Maps, Mapbox, etc.
  // For now, we'll return a mock implementation
  
  // Mock implementation - in production, replace with actual API call
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock coordinates for Mumbai (as an example)
      const mockCoordinates = {
        lat: 19.0760 + (Math.random() - 0.5) * 0.1, // Add some randomness for demo
        lng: 72.8777 + (Math.random() - 0.5) * 0.1
      };
      
      resolve(mockCoordinates);
    }, 100);
  });
};

/**
 * Convert coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - The address
 */
export const reverseGeocode = async (lat, lng) => {
  // Mock implementation - in production, replace with actual API call
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock address
      resolve('123 Cricket Street, Mumbai, Maharashtra, India');
    }, 100);
  });
};

/**
 * Get geocode information from zipcode
 * @param {string} zipcode - The zipcode to geocode
 * @returns {Promise<{latitude: number, longitude: number}>} - The coordinates
 */
export const getGeocodeFromZip = async (zipcode) => {
  // Mock implementation - in production, replace with actual API call
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock coordinates based on zipcode
      const mockCoordinates = {
        latitude: 19.0760 + (parseInt(zipcode.substring(0, 2)) / 100),
        longitude: 72.8777 + (parseInt(zipcode.substring(2, 4)) / 100)
      };
      
      resolve(mockCoordinates);
    }, 100);
  });
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @param {string} unit - Unit of distance (km or mi)
 * @returns {number} - Distance in specified unit
 */
export const getDistance = (lat1, lng1, lat2, lng2, unit = 'km') => {
  const radius = unit === 'mi' ? 3963.2 : 6378.1; // Earth radius in miles or km
  
  // Convert latitude and longitude from degrees to radians
  const latRad1 = (lat1 * Math.PI) / 180;
  const latRad2 = (lat2 * Math.PI) / 180;
  const lngRad1 = (lng1 * Math.PI) / 180;
  const lngRad2 = (lng2 * Math.PI) / 180;
  
  // Haversine formula
  const dLat = latRad2 - latRad1;
  const dLng = lngRad2 - lngRad1;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(latRad1) * Math.cos(latRad2) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = radius * c;
  
  return distance;
};