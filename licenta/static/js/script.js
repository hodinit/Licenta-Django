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
                <strong>Payment Methods:</strong> ${spot.payment.payment_methods}
            `;
        }

        const popupContent = `
            <div class="container text-center">
                <h4>${spot.name}</h4>
                <img src="${spot.image}" alt="Location Image" style="width: 100px; height: auto;" /><br>
                <div class="mt-2">
                    ${paymentInfo}
                </div>
                <a class="btn btn-success mt-3" onclick="approveSpot(${spot._id}, ${spot.approved})">Is this spot real?</a>
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

function approveSpot(spotId, currentApprovalStatus) {
        const newApprovalStatus = !currentApprovalStatus;

        fetch(approveSpotUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                spot_id: spotId,
                approved: newApprovalStatus
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log("Spot approval updated successfully!");
                
                // Find and update the marker for this spot
                Object.values(map._layers).forEach(layer => {
                    if (layer instanceof L.Marker && layer.getLatLng) {
                        const popup = layer.getPopup();
                        if (popup && popup.getContent().includes(`approveSpot(${spotId}`)) {
                            layer.setIcon(newApprovalStatus ? newSpotIcon : parkingIcon);
                            
                            // Update the popup content to reflect the new status
                            const currentContent = popup.getContent();
                            const updatedContent = currentContent.replace(
                                `approveSpot(${spotId}, ${currentApprovalStatus})`,
                                `approveSpot(${spotId}, ${newApprovalStatus})`
                            );
                            popup.setContent(updatedContent);
                        }
                    }
                });
            } else {
                console.log("Error:", data.error);
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }

function togglePaymentForm() {
    const isFree = document.getElementById('is_free').checked;
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.style.display = isFree ? 'none' : 'block';
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