// =========================
// MAP STATE
// =========================

let map;
let marker;

// =========================
// DEFAULT MAP SETTINGS
// =========================

const DEFAULT_LAT = 50.0755;
const DEFAULT_LON = 14.4378;
const DEFAULT_ZOOM = 11;

// =========================
// INITIALIZE MAP
// =========================

export function initMap() {
    const mapElement = document.getElementById("destinationMap");

    if (!mapElement) return;
    
    map = L.map("destinationMap").setView([DEFAULT_LAT, DEFAULT_LON], DEFAULT_ZOOM);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    marker = L.marker([DEFAULT_LAT, DEFAULT_LON])
        .addTo(map)
        .bindPopup("Prague, Czech Republic");
}

// =========================
// UPDATE MAP LOCATION
// =========================

export function updateMap(lat, lon, name, zoom = 11) {
    if (!map) return;

    lat = Number(lat);
    lon = Number(lon);

    map.setView([lat, lon], zoom);

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(name)
        .openPopup();
}