/**
 * Utility functions for geolocation calculations
 */

function haversineDistance(coord1, coord2) {
  // coord = [lng, lat]
  const R = 6371;
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((coord1[1] * Math.PI) / 180) *
      Math.cos((coord2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coordsToGeoJSON(lat, lng) {
  return { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
}

module.exports = { haversineDistance, coordsToGeoJSON };
