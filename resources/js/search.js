import { fetchCountryInfo, fetchWeather } from "./services/api.js";
import { fetchDestinationPhoto } from "./services/photos.js";
import { updateSearchDestinationDetails } from "./main.js";

// =========================
// GLOBAL DESTINATION SEARCH
// =========================

export function initGlobalSearch() {

    const searchForm = document.querySelector(".destination-search");
    const searchInput = document.getElementById("destinationSearch");
    const searchResultsSection = document.getElementById("search-results");
    const destinationContainer = document.getElementById("destinationContainer");

    if (!searchForm || !searchInput || !searchResultsSection || !destinationContainer) return;

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) return;

        searchDestination(query, searchResultsSection, destinationContainer);
    });
}

// =========================
// FORMAT SEARCH RESULTS
// =========================

function formatSearchResults(results) {
    return results.map((result) => {
        return {
            name: result.name,
            displayName: result.display_name,
            lat: Number(result.lat),
            lon: Number(result.lon),
            type: result.type,
            category: result.category,
            countryCode: result.address?.country_code?.toUpperCase() || null,
            country: result.address?.country || null,
            state: result.address?.state || result.address?.county || null
        };
    });
}

// =========================
// RENDER SEARCH RESULTS
// =========================

function renderSearchResults(destinations, searchResultsSection, destinationContainer) {
    destinationContainer.innerHTML = "";

    if (!destinations.length) {
        searchResultsSection.hidden = false;
        searchResultsSection.setAttribute("aria-hidden", "false");

        destinationContainer.innerHTML = `
            <p class="empty-search-message">No destinations found.</p>
        `;

        return;
    }

    searchResultsSection.hidden = false;
    searchResultsSection.setAttribute("aria-hidden", "false");

    destinationContainer.innerHTML = destinations.map((destination) => `
        <article class="destination-card search-result-card"
                data-lat="${destination.lat}"
                data-lon="${destination.lon}"
                data-name="${destination.name}"
                data-country="${destination.country}"
                data-country-code="${destination.countryCode || ""}"
                data-state="${destination.state || ""}">

            <div class="image-wrapper">
                <img
                    src="https://placehold.co/600x400?text=${encodeURIComponent(destination.name)}"
                    alt="Travel view of ${destination.name}"
                    class="destination-image"
                    loading="lazy"
                >

                <div class="destination-meta">

                    <div class="weather-badge">
                        <span class="weather-icon">--</span>
                        <span class="weather-temp">Loading...</span>
                    </div>

                    <div class="time-badge">
                        <i data-lucide="clock-3" aria-hidden="true"></i>
                        <span class="local-time">--:--</span>
                    </div>

                </div>
            </div>

            <div class="destination-content">

                <div class="destination-info">
                    <h3>${destination.name}</h3>

                    <p class="destination-location">
                        <i data-lucide="map-pin" aria-hidden="true"></i>
                        ${destination.country}
                    </p>
                </div>

                <button
                    type="button"
                    class="details-link"
                    aria-label="View details about ${destination.name}"
                    data-modal-target="destinationModal"
                    data-search-details
                    data-name="${destination.name}"
                    data-country="${destination.country}"
                    data-country-code="${destination.countryCode || ""}"
                    data-state="${destination.state || ""}"
                    data-lat="${destination.lat}"
                    data-lon="${destination.lon}">
                    View Details
                    <i data-lucide="arrow-right" aria-hidden="true"></i>
                </button>

            </div>
        </article>
    `).join("");

    lucide.createIcons();

    // Update weather for each search result
    const cards = destinationContainer.querySelectorAll(".search-result-card");
    
    cards.forEach((card) => {
        const { lat, lon, name, country } = card.dataset;
        updateSearchResultWeather(card, lat, lon);
        updateSearchResultPhoto(card, name, country);
    });

    // =========================
    // CARD CLICK HANDLER
    // =========================
     
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            
            document.querySelectorAll(".destination-card").forEach((c) => {
                c.classList.remove("active");
            });
            
            card.classList.add("active");
            
            updateSearchDestinationDetails({
                name: card.dataset.name,
                country: card.dataset.country,
                countryCode: card.dataset.countryCode,
                state: card.dataset.state,
                lat: card.dataset.lat,
                lon: card.dataset.lon
            });
            
            document.getElementById("destination-details").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    searchResultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ================================
// SEARCH RESULT WEATHER AND TIME
// ================================

async function updateSearchResultWeather(card, lat, lon) {
    try {
        const weatherData = await fetchWeather(lat, lon);

        const temperature = Math.round(weatherData.main.temp);
        const icon = weatherData.weather[0].icon;
        const description = weatherData.weather[0].description;

        const weatherTemp = card.querySelector(".weather-temp");
        const weatherIcon = card.querySelector(".weather-icon");
        const localTime = card.querySelector(".local-time");

        weatherTemp.textContent = `${temperature}°C`;

        weatherIcon.innerHTML = `
            <img
                src="https://openweathermap.org/img/wn/${icon}.png"
                alt="${description}"
                width="24"
                height="24"
            >
        `;

        const localDate = new Date((Date.now() + weatherData.timezone * 1000));

        const formattedTime = localDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "UTC"
        });

        localTime.textContent = formattedTime;

    } catch (error) {
        console.error("Weather fetch failed:", error);
    }
}

// ==================================
// SEARCH RESULT DESTINATION PHOTOS
// ==================================

async function updateSearchResultPhoto(card, destinationName, country, state) {
    try {
        const image = card.querySelector(".destination-image");
        const photoUrl = await fetchDestinationPhoto(destinationName, country, state);

        if (!photoUrl) return;

        image.src = photoUrl;
        image.alt = `Travel view of ${destinationName}`;

        const button = card.querySelector("[data-search-details]");

        if (button) {
            button.dataset.image = photoUrl;
        }

    } catch (error) {
        console.error("Photo fetch failed:", error);
    }  
}

// =========================
// SEARCH DESTINATION
// =========================

async function searchDestination(query, searchResultsSection, destinationContainer) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=5`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not fetch destination data");
        }

        const data = await response.json();
        const destinations = formatSearchResults(data);

        renderSearchResults(destinations, searchResultsSection, destinationContainer);

    } catch(error) {
        console.error("Search failed:", error);
    }
}




