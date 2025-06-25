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
        let icon = newSpotIcon;
        let paymentInfo = `<strong>Payment Type:</strong> ${spot.payment.payment_type}<br>`;
        
        if (spot.payment.payment_type != 'Free') {
            paymentInfo += `
                <strong>Fee:</strong> ${spot.payment.fee} ${spot.payment.currency}<br>
                <strong>Payment Method:</strong> ${spot.payment.payment_methods}
            `;
        }

        const popupContent = `
            <div class="container text-center">
                <h4>${spot.name}</h4>
                <img src="${spot.image}" alt="Location Image" style="width: 200px; height: auto;" /><br>
                <div class="mt-2">
                    ${paymentInfo}
                </div>
                ${!spot.approved ? 
                    `<div class="mt-3">
                        ${spot.isCreator
                            ? `<button class="btn btn-secondary" disabled>Spot added by you</button>`
                            : spot.hasVoted 
                                ? `<button class="btn btn-secondary" disabled>Already voted</button>`
                                : `<button class="btn btn-success" onclick="approveSpot(${spot._id})">Is this spot real?</button>`
                        }
                    </div>`
                    : ''}
            </div>
        `;

        if (spot.approved == true) {
            icon = parkingIcon;
        }

        L.marker([spot.latitude, spot.longitude], {icon: icon})
        .addTo(map)
        .bindPopup(popupContent);
    });
}    

function approveSpot(spotId) {
    const button = event.target;
    button.disabled = true;

    fetch(approveSpotUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            spot_id: spotId
        })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.success) {
            button.className = 'btn btn-secondary';
            button.textContent = 'Vote recorded';
            button.disabled = true;
        } else {
            button.disabled = false;
        }
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
            if (spot.approved == true) {
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
            
            const refreshButton = document.getElementById('refreshPage');
            refreshButton.style.display = 'block';
            
            refreshButton.addEventListener('click', function() {
                location.reload();
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