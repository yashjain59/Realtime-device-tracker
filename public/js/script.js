const socket = io();
const markers = {};

// Check if geolocation is available
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0 // No cached data
    });
}

// Initialize the map with a default view
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Yash Jain",
}).addTo(map);

// Listen for location updates from other users
socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;

    // Update the map view only for the current user's marker
    if (socket.id === id) {
        map.setView([latitude, longitude]);
    }

    // If the marker for this user already exists, update its position
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker for the user and add it to the map
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Remove a user's marker when they disconnect
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
