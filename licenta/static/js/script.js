const map = L.map('map').setView([46.771139, 23.595250], 13);
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

const newSpotIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

if (typeof parkingSpots !== 'undefined' && parkingSpots.length) {
    parkingSpots.forEach(spot => {
        const icon = spot.approved ? newSpotIcon : parkingIcon;
        const popupContent = `
            <div class="container text-center">
                <h4>${spot.name}</h4>
                ${spot.image ? `<img src="${spot.image}" alt="Location Image" style="width: 100px; height: auto;" /><br>` : ''}                <div class="payment-info mt-2">
                    <strong>Payment Type:</strong> ${spot.payment ? spot.payment.payment_type : 'FREE'}<br>
                    ${spot.payment && spot.payment.hourly_rate && spot.payment.hourly_rate !== 'FREE' ? `<strong>Hourly Rate:</strong> ${spot.payment.hourly_rate}<br>` : ''}
                    ${spot.payment && spot.payment.daily_rate && spot.payment.daily_rate !== 'FREE' ? `<strong>Daily Rate:</strong> ${spot.payment.daily_rate}<br>` : ''}
                    <strong>Payment Methods:</strong> ${spot.payment ? spot.payment.payment_methods : 'None'}
                </div>
                <a class="btn btn-success mt-3">Is this spot real?</a>
            </div>
        `;

        L.marker([spot.latitude, spot.longitude], {icon: icon})
        .addTo(map)
        .bindPopup(popupContent);
    });
}

const locationAlert = document.getElementById('locationAlert');
if (locationAlert) {
    locationAlert.style.display = 'block';
}

navigator.geolocation.getCurrentPosition(function(position) {
    
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    
    map.setView([userLat, userLng], 15);
    
    if (locationAlert) {
        locationAlert.style.display = 'none';
    }
    
    const userMarker = L.marker([userLat, userLng], {icon: userIcon})
        .addTo(map)
        .bindPopup('Current location')
        .openPopup();

    if (typeof parkingSpots !== 'undefined' && parkingSpots.length) {
        let nearestSpot = null;
        let shortestDistance = Infinity;

        parkingSpots.forEach(spot => {
            const R = 6371;
            const dLat = toRad(spot.latitude - userLat);
            const dLon = toRad(spot.longitude - userLng);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(toRad(userLat)) * Math.cos(toRad(spot.latitude)) * 
                     Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestSpot = spot;
            }
        });
        
        if (nearestSpot) {
            const routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(userLat, userLng),
                    L.latLng(nearestSpot.latitude, nearestSpot.longitude)
                ],
                show: false,
                draggableWaypoints: false,
                routeWhileDragging: false,
                addWaypoints: false,
                lineOptions: {
                    styles: [{ color: '#0000FF', opacity: 1, weight: 5 }]
                },
                createMarker: function() { return null }
            }).addTo(map);

            const toggleButton = document.getElementById('toggleRoute');
            toggleButton.style.display = 'block';
            let isRouteVisible = true;

            toggleButton.addEventListener('click', function() {
                if (isRouteVisible) {
                    routingControl.remove();
                    toggleButton.textContent = 'Show Route';
                } else {
                    routingControl.addTo(map);
                    toggleButton.textContent = 'Hide Route';
                }
                isRouteVisible = !isRouteVisible;
            });
        }
    }
});

function toRad(degrees) {
    return degrees * Math.PI / 180;
}

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
    const locationAlert = document.getElementById('locationAlert');
    if (locationAlert) {
        locationAlert.style.display = 'block';
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            if (locationAlert) {
                locationAlert.style.display = 'none';
            }
            setLocation(position.coords.latitude, position.coords.longitude);
        }
    );
}