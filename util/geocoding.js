// Geocoding utility using free OpenStreetMap/Nominatim API
// No API key required - completely free!

/**
 * Geocode a location string to coordinates
 * @param {string} location - Location text (e.g., "Jaipur, Rajasthan, India")
 * @returns {Object|null} - { latitude, longitude } or null if failed
 */
async function geocodeLocation(location) {
  try {
    const encodedLocation = encodeURIComponent(location);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WanderLust/1.0'
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        placeName: result.display_name,
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 * @param {number} longitude - Longitude
 * @param {number} latitude - Latitude
 * @returns {Object|null} - Address info or null if failed
 */
async function reverseGeocode(longitude, latitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WanderLust/1.0'
      }
    });

    const data = await response.json();

    if (data) {
      return {
        placeName: data.display_name,
        address: data.display_name
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
}

module.exports = {
  geocodeLocation,
  reverseGeocode
};

