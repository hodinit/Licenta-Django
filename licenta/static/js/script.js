const map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

const parkingIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
const userIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// parkingSpots must be injected into the template from backend
if (typeof parkingSpots !== 'undefined' && parkingSpots.length) {
    parkingSpots.forEach(spot => {
        L.marker([spot.latitude, spot.longitude], {icon: parkingIcon})
        .addTo(map)
        .bindPopup(spot.name);
    });
}

navigator.geolocation.getCurrentPosition(function(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    
    map.setView([userLat, userLng], 15);

    const userMarker = L.marker([userLat, userLng], {icon: userIcon})
        .addTo(map)
        .bindPopup('Current location')
        .openPopup();
});