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

const parkingSpots = JSON.parse('{{ locations|escapejs }}');
if (parkingSpots && parkingSpots.length) {
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
})
