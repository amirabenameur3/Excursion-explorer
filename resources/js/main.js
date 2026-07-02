import { initMenu, initTheme, initHeaderScroll, initViewAllDestinations, initDestinationFilters, initFavorites, saveRecentlyViewed } from "./ui.js";
import { initModal } from "./modal.js";
import { destinations } from "./data/destinations.js";
import { getLocalTime } from "./services/time.js";
import { fetchCountryInfo, fetchWeather } from "./services/api.js";
import { initGlobalSearch } from "./search.js";
import { initMap, updateMap } from "./services/map.js";
import { fetchNearbyAttractions } from "./services/geoapify.js";
import { generateBestTime, generatePackingReminder } from "./services/travelTips.js";
import { generateItinerary, renderItinerary } from "./services/itinerary.js";

// =========================
// INITIALIZE APPLICATION
// =========================

initMenu();
initTheme();
initHeaderScroll();
initViewAllDestinations();
initModal();
initGlobalSearch();
initDestinationFilters();
initFavorites();
initMap();

// ============================
// UPDATE FEATURED LOCAL TIME
// ============================

function updateLocalTime(city) {
    const destination = destinations[city];

    if (!destination) return;

    const { time, day, date } = getLocalTime(destination.timezone);

    document.getElementById('localTime').textContent = time;
    document.getElementById('localDay').textContent = day;
    document.getElementById('localDate').textContent = date;
}

// =============================
// UPDATE FEATURED COUNTRY INFO
// =============================

function updateCountryInfo(city) {
    const destination = destinations[city];

    if (!destination || !destination.countryInfo) return;

    document.getElementById("countryCurrency").textContent =
        destination.countryInfo.currency;

    document.getElementById("countryLanguage").textContent =
        destination.countryInfo.language;

    document.getElementById("countryPopulation").textContent =
        destination.countryInfo.population.toLocaleString();

    document.getElementById("countryCapital").textContent =
        destination.countryInfo.capital;
}

// =========================
// UPDATE FEATURED WEATHER
// =========================

async function updateWeather(city) {
    const destination = destinations[city];

    if (!destination) return;

    try {
        const weather = await fetchWeather(destination.lat, destination.lon);
        const windSpeed = Math.round(weather.wind.speed * 3.6);
        const iconCode = weather.weather[0].icon;


        document.getElementById("weatherTemp").textContent =
            `${Math.round(weather.main.temp)}°C`;
        
        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        document.getElementById("weatherDescription").textContent =
            weather.weather[0].description.replace(/\b\w/g, char => char.toUpperCase());

        document.getElementById("weatherHumidity").textContent =
            `Humidity: ${weather.main.humidity}%`;

        document.getElementById("weatherWind").textContent =
            `Wind: ${windSpeed} km/h`;
    } catch (error) {
        console.error(error);
    }
}

// =========================
// UPDATE CARD LOCAL TIME
// =========================

function updateDestinationCardTime(card, city) {
    const destination = destinations[city];

    if (!destination) return;

    const { time } = getLocalTime(destination.timezone);
    const timeElement = card.querySelector(".local-time");

    if (timeElement) {
        timeElement.textContent = time;
    }
}

// =========================
// UPDATE CARD WEATHER
// =========================

async function updateDestinationCardWeather(card, city) {
    const destination = destinations[city];

    if (!destination) return;

    try {
        const weather = await fetchWeather(destination.lat, destination.lon);

        const iconCode = weather.weather[0].icon;
        const tempElement = card.querySelector(".weather-temp");
        const iconElement = card.querySelector(".weather-icon");

        if (tempElement) {
            tempElement.textContent = `${Math.round(weather.main.temp)}°C`;
        }

        if (iconElement) {
            iconElement.innerHTML = `
                <img 
                    src="https://openweathermap.org/img/wn/${iconCode}.png" 
                    alt="${weather.weather[0].description}"
                >
            `;
        }
    } catch (error) {
        console.error(error);
    }
}

// =========================
// REFRESH ALL CARD TIMES
// =========================

function updateDestinationCardsTime() {
    document.querySelectorAll(".destination-card").forEach((card) => {
        const city = card.dataset.city;
        updateDestinationCardTime(card, city);
    });
}

// ===================================
// INITIALIZE DESTINATION CARDS DATA
// ===================================

function updateDestinationCards() {
    document.querySelectorAll(".destination-card").forEach((card) => {
        const city = card.dataset.city;

        updateDestinationCardTime(card, city);
        updateDestinationCardWeather(card, city);
    });
}

updateDestinationCards();

setInterval(() => {
    updateDestinationCardsTime();
}, 60000);

// =====================================
// UPDATE FEATURED DESTINATION DETAILS
// =====================================

async function updateDestinationDetails(city) {
    const destination = destinations[city];

    if (!destination) return;

    document.getElementById("destinationName").innerHTML = 
        `<i data-lucide="map-pin" aria-hidden="true"></i>${destination.city}, ${destination.country}`;
    
    updateLocalTime(city);
    updateCountryInfo(city);
    updateWeather(city);
    updateMap(destination.lat, destination.lon, `${destination.city}, ${destination.country}`);
    await updateTravelTips(city);

    lucide.createIcons();
}

// =============================
// UPDATE FEATURED TRAVEL TIPS
// =============================

async function updateTravelTips(city) {
    const destination = destinations[city];

    if (!destination) return;

    try {
        const weather = await fetchWeather(destination.lat, destination.lon);

        document.getElementById("bestTime").innerHTML =
            generateBestTime(destination.lat);

        renderPackingReminder(generatePackingReminder(weather));

    } catch (error) {
        console.error("Travel tips failed:", error);

        document.getElementById("bestTime").textContent =
            "Information not available";

        document.getElementById("packingReminder").textContent =
            "Information not available";
    }

    document.getElementById("topActivities").textContent =
        destination.modal?.experiences?.slice(0, 3).join(", ") ||
        "Information not available";

    renderNearbyAttractions(destination.nearbyAttractions);

    renderItinerary(
        generateItinerary(destination.nearbyAttractions, true)
    );
}

// ==================================
// GENERATE SEARCH TOP ACTIVITIES
// ==================================

function generateTopActivities(attractions, cleanName) {
    const categories = attractions.flatMap(
        (attraction) => attraction.categories
    );

    const activities = [];

    if (categories.some((category) => category.includes("heritage"))) {
        activities.push("Explore historic landmarks");
    }

    if (categories.some((category) => category.includes("tourism.sights"))) {
        activities.push("Visit iconic sightseeing spots");
    }

    if (categories.some((category) => category.includes("artwork"))) {
        activities.push("Discover public art and monuments");
    }

    if (categories.some((category) => category.includes("museum"))) {
        activities.push("Visit museums and cultural spaces");
    }

    if (categories.some((category) => category.includes("park"))) {
        activities.push("Relax in parks and green spaces");
    }

    return activities.length
        ? activities.join(", ")
        : `Explore ${cleanName}'s landmarks, neighborhoods, and cultural spots`;
}

// ===========================
// RENDER NEARBY ATTRACTIONS
// ===========================

function renderNearbyAttractions(attractions) {
    const nearbyAttractionsElement = document.getElementById("nearbyAttractions");

    if (!nearbyAttractionsElement) return;

    if (!attractions || !attractions.length) {
        nearbyAttractionsElement.innerHTML =
            '<p class="nearby-empty-text">No nearby attractions found</p>';
        return;
    }

    nearbyAttractionsElement.classList.remove("is-empty");

    nearbyAttractionsElement.innerHTML = attractions
        .map((attraction) => `
            <button
                class="attraction-link"
                type="button"
                data-lat="${attraction.lat}"
                data-lon="${attraction.lon}"
                data-name="${attraction.name}">
                <i data-lucide="map-pin" aria-hidden="true"></i>
                <span>${attraction.name}</span>
            </button>
        `)
        .join("");

    nearbyAttractionsElement
        .querySelectorAll(".attraction-link")
        .forEach((button) => {
            button.addEventListener("click", () => {
                nearbyAttractionsElement
                    .querySelectorAll(".attraction-link")
                    .forEach((item) => {
                        item.classList.remove("is-selected");
                    });

                button.classList.add("is-selected");

                updateMap(button.dataset.lat, button.dataset.lon, button.dataset.name, 15);

                const map = document.getElementById("destinationMap");
                
                map.scrollIntoView({
                    behavior: "smooth",
                    block: window.innerWidth <= 1024 ? "center" : "start"});
            });
        });

    lucide.createIcons();
}

// =========================
// RENDER PACKING REMINDER
// =========================

function renderPackingReminder(items) {
    const container = document.getElementById("packingReminder");

    if (!container) return;

    container.innerHTML = items
        .map(item => `<span class="travel-tip-chip">${item}</span>`)
        .join("");
}

// ===================================
// UPDATE SEARCH DESTINATION DETAILS
// ===================================

export async function updateSearchDestinationDetails(destination) {
    const cleanName = destination.name.replace("City of ", "").trim();

    document.getElementById("destinationName").innerHTML =
        `<i data-lucide="map-pin" aria-hidden="true"></i>
        ${
            destination.state
                ? `${cleanName}, ${destination.state}, ${destination.country}`
                : `${cleanName}, ${destination.country}`
        }`;

    // Weather + local time from OpenWeather timezone offset
    try {
        const weather = await fetchWeather(destination.lat, destination.lon);

        document.getElementById("bestTime").innerHTML = generateBestTime(destination.lat);
        
        renderPackingReminder(generatePackingReminder(weather));

        const windSpeed = Math.round(weather.wind.speed * 3.6);
        const iconCode = weather.weather[0].icon;

        document.getElementById("weatherTemp").textContent =
            `${Math.round(weather.main.temp)}°C`;

        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        document.getElementById("weatherDescription").textContent =
            weather.weather[0].description.replace(/\b\w/g, char => char.toUpperCase());

        document.getElementById("weatherHumidity").textContent =
            `Humidity: ${weather.main.humidity}%`;

        document.getElementById("weatherWind").textContent =
            `Wind: ${windSpeed} km/h`;

        const localDate = new Date(Date.now() + weather.timezone * 1000);

        document.getElementById("localTime").textContent =
            localDate.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC"
            });

        document.getElementById("localDay").textContent =
            localDate.toLocaleDateString("en-US", {
                weekday: "long",
                timeZone: "UTC"
            });

        document.getElementById("localDate").textContent =
            localDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC"
            });

    } catch (error) {
        console.error("Search destination weather/time failed:", error);
    }

    // Country info
    try {
        let country;

    try {
        country = await fetchCountryInfo(destination.countryCode);
    } catch {
        country = await fetchCountryInfo(destination.country);
    }

    const currency = Object.values(country.currencies || {})[0]?.name || "N/A";
    const language = Object.values(country.languages || {})[0] || "N/A";

    document.getElementById("countryCurrency").textContent = currency;
    document.getElementById("countryLanguage").textContent = language;
    document.getElementById("countryPopulation").textContent =
        country.population?.toLocaleString() || "N/A";
    document.getElementById("countryCapital").textContent =
        country.capital?.[0] || "N/A";
    
    } catch (error) {
        console.error("Search destination country info failed:", error);
        document.getElementById("countryCurrency").textContent = "N/A";
        document.getElementById("countryLanguage").textContent = "N/A";
        document.getElementById("countryPopulation").textContent = "N/A";
        document.getElementById("countryCapital").textContent = "N/A";
    }

    updateMap(destination.lat, destination.lon, `${cleanName}, ${destination.country}`);

    try {
        const attractions = await fetchNearbyAttractions(destination.lat, destination.lon);

        renderNearbyAttractions(attractions);
        
        document.getElementById("topActivities").textContent = generateTopActivities(attractions, cleanName);

        } catch (error) {
            console.error("Nearby attractions failed:", error);
            
            document.getElementById("nearbyAttractions").innerHTML = '<p class="nearby-empty-text">Nearby attractions not available</p>';
        }

    lucide.createIcons();
}

// =============================
// DEFAULT SELECTED DESTINATION
// =============================

let selectedCity = "Prague";

updateDestinationDetails(selectedCity);

setInterval(() => {
    updateLocalTime(selectedCity);
}, 60000);

// =========================
// FEATURED CARD CLICK HANDLER
// =========================

document.querySelectorAll(".destination-card").forEach((card) => {
    card.addEventListener("click", () => {

        document.querySelectorAll(".destination-card").forEach((c) => {
            c.classList.remove("active");
        });

        card.classList.add("active");

        selectedCity = card.dataset.city;

        const destination = destinations[selectedCity];
        
        if (destination) {
            saveRecentlyViewed({
                id: selectedCity,
                type: "featured",
                name: destination.city,
                country: destination.country,
                countryCode: destination.countryCode,
                lat: destination.lat,
                lon: destination.lon
            });
        }

        updateDestinationDetails(selectedCity);

        document.getElementById("destination-details").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

