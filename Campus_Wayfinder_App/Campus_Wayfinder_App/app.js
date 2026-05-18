//
// ============================================
// CAMPUS BOUNDS

const buildingMarkers = [];
let activePOIs = {};
const southWest = L.latLng(-37.63012, 143.88818);
const northEast = L.latLng(-37.62208, 143.89760);

const campusBounds = L.latLngBounds(southWest, northEast);

//
// ============================================
// MAP INIT


const map = L.map('map', {

    center: [
        (southWest.lat + northEast.lat) / 2,
        (southWest.lng + northEast.lng) / 2
    ],

    zoom: 17,
    minZoom: 16,
    maxZoom: 18,

    maxBounds: campusBounds,
    maxBoundsViscosity: 1.0
});

map.attributionControl.setPrefix(false);

//
// ============================================
// BASE MAP


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

//
// ============================================
// SHARED OSRM FOOT ROUTER


const sharedRouter = L.Routing.osrmv1({
    serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1'
});

//
// ============================================
// USER LOCATION


let userMarker = null;
let accuracyCircle = null;
let userLatLng = null;

//
// ============================================
// ROUTING STATE


let routingControl = null;
let destinationMarker = null;

//
// ============================================
// LIVE GPS


function updateUserLocation(lat, lng, accuracy) {

    userLatLng = L.latLng(lat, lng);

    if (!campusBounds.contains(userLatLng)) return;

    if (!userMarker) {

        userMarker = L.circleMarker(userLatLng, {
            radius: 10,
            fillColor: "#007bff",
            color: "#fff",
            weight: 3,
            fillOpacity: 1
        }).addTo(map);

        accuracyCircle = L.circle(userLatLng, {
            radius: accuracy,
            color: "#007bff",
            fillOpacity: 0.15
        }).addTo(map);

        map.setView(userLatLng, 18);

    } else {

        userMarker.setLatLng(userLatLng);
        accuracyCircle.setLatLng(userLatLng);
        accuracyCircle.setRadius(accuracy);
    }
}

if (navigator.geolocation) {

    navigator.geolocation.watchPosition(

        (pos) => {
            updateUserLocation(
                pos.coords.latitude,
                pos.coords.longitude,
                pos.coords.accuracy
            );
        },

        (err) => console.log(err),

        {
            enableHighAccuracy: true,
            maximumAge: 1000
        }
    );
}

//
// ============================================
// BUILDINGS GEOJSON


fetch('data/buildings.geojson')
.then(res => res.json())
.then(data => {

    L.geoJSON(data, {
/* So the building isnt highlighted
        style: () => ({
            color: '#007bff',
            weight: 2,
            fillColor: '#007bff',
            fillOpacity: 0.2
        }),
*/
        style: () => ({
            color: '#cccccc',
            weight: 1,
            fillColor: '#cccccc',
            fillOpacity: 0.05
        }),

        onEachFeature: function(feature, layer) {

            const name = feature?.properties?.name || "Building";
            const pageUrl = "pages/default.html";
			
			// ============================================
            // ADD BUILDING MARKER (NEW FEATURE)
            // ============================================

            const center = layer.getBounds().getCenter();

            const marker = L.marker(center, {
                icon: L.divIcon({
                    className: 'building-icon',
                    html: `<i class="fa-solid fa-building"></i>`,
                    iconSize: [25, 25]
                })
            }).bindPopup(`
                <div style="text-align:center;">
                    <h3>${name}</h3>
                </div>
            `);

            buildingMarkers.push(marker);
			



            layer.on('click', function(e) {

                // ✅ IMPORTANT FIX:
                // use EXACT click location, not centroid or entrance snapping
                const clickedLatLng = e.latlng;

                layer.bindPopup(`

                    <div style="text-align:center; min-width:180px;">

                        <h3>${name}</h3>

                        <button
                            onclick="window.location.href='${pageUrl}'"
                            style="
                                width:100%;
                                margin-bottom:10px;
                                padding:10px;
                                border:none;
                                border-radius:8px;
                                background:#007bff;
                                color:white;
                            "
                        >
                            Open Building
                        </button>

                        <button
                            onclick="routeToBuilding(${clickedLatLng.lat}, ${clickedLatLng.lng}, '${name}')"
                            style="
                                width:100%;
                                padding:10px;
                                border:none;
                                border-radius:8px;
                                background:#28a745;
                                color:white;
                            "
                        >
                            Directions
                        </button>

                    </div>

                `);

                layer.openPopup(clickedLatLng);
            });
        }

    }).addTo(map);
});

//
// ============================================
// ROUTING FUNCTION


function routeToBuilding(lat, lng, name) {

    if (!userLatLng) {
        alert("Waiting for GPS location...");
        return;
    }

    const destination = L.latLng(lat, lng);

    if (destinationMarker) {
        map.removeLayer(destinationMarker);
    }

    destinationMarker = L.marker(destination)
        .addTo(map)
        .bindPopup(name)
        .openPopup();

    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({

        waypoints: [
            userLatLng,
            destination
        ],

        router: sharedRouter,

        lineOptions: {
            styles: [{
                color: '#007bff',
                weight: 6,
                opacity: 0.9
            }]
        },

        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        createMarker: () => null

    }).addTo(map);

    map.closePopup();
}

//
// ============================================
// MAP CLICK (FREE DESTINATION)


map.on('click', function(e) {

    const clickedLatLng = e.latlng;

    let clickedOnBuilding = false;

    map.eachLayer(layer => {
        if (layer.feature && layer.getBounds) {
            if (layer.getBounds().contains(clickedLatLng)) {
                clickedOnBuilding = true;
            }
        }
    });

    if (!clickedOnBuilding) {

        if (!userLatLng) {
            alert("Waiting for GPS location...");
            return;
        }

        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }

        destinationMarker = L.marker(clickedLatLng)
            .addTo(map)
            .bindPopup("Custom Destination")
            .openPopup();

        if (routingControl) {
            map.removeControl(routingControl);
        }

        routingControl = L.Routing.control({

            waypoints: [
                userLatLng,
                clickedLatLng
            ],

            router: sharedRouter,

            lineOptions: {
                styles: [{
                    color: '#007bff',
                    weight: 6,
                    opacity: 0.9
                }]
            },

            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            createMarker: () => null

        }).addTo(map);
    }
});

//
// ============================================
// BOUNDARY LOCK


/* Open Menu */
function openMenu() {
  document.getElementById("poiMenu").style.display = "block";
}
/* Close Menu  */
function closeMenu() {
  document.getElementById("poiMenu").style.display = "none";
}


/* BOTTOM NAVIGATION ACTIVE STATE HANDLER */
const navButtons = document.querySelectorAll("footer button");

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        navButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

    });

});


const poiMarkers = {
    toilets: [],
    buildings: [],
    parking: [],
    elevators: [],
    water: [],
    fed_living: []
};

/*
====================================
POI LAYER TOGGLE SYSTEM
====================================
Handles UI clicks + marker visibility updates
*/
document.addEventListener("DOMContentLoaded", () => {

    const poiItems = document.querySelectorAll(".poi-item");

    poiItems.forEach(item => {

        item.addEventListener("click", () => {

            const type = item.dataset.poi;

            // toggle UI state
            const isActive = item.classList.toggle("active");

            // store state globally (IMPORTANT: no re-declare)
            activePOIs[type] = isActive;

            // special case: buildings
            if (type === "buildings") {
                toggleBuildings(isActive);
            }

            // update all POI markers
            togglePOIMarkers();
        });
    });

});


/*
====================================
POI MARKER TOGGLE SYSTEM
====================================
Shows/hides markers based on activePOIs state
*/
function togglePOIMarkers() {

    Object.keys(poiMarkers).forEach(type => {

        const markers = poiMarkers[type];
        const isActive = activePOIs[type];

        if (!markers) return;

        markers.forEach(marker => {

            if (isActive) {

                if (!map.hasLayer(marker)) {
                    map.addLayer(marker);
                }

            } else {

                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
            }
        });
    });
}


/*
====================================
BUILDINGS TOGGLE
====================================
Simple show/hide system for building markers
*/
function toggleBuildings(show) {

    buildingMarkers.forEach(marker => {

        if (show) {

            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }

        } else {

            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });
}



map.on('drag', function() {
    map.panInsideBounds(campusBounds, { animate: false });
});
