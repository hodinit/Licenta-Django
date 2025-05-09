const map = L.map('map').setView([44.4268, 26.1025], 13);
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




function setLocation(lat, lng) {
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    map.setView([lat, lng], 15);
}

map.on('click', function(spot) {
    setLocation(spot.latlng.lat, spot.latlng.lng);
});

function useCurrentLocation() {
    navigator.geolocation.getCurrentPosition(function(position) {
        setLocation(position.coords.latitude, position.coords.longitude);
    })
}
