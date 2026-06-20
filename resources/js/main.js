import { initMenu, initTheme, initHeaderScroll, initViewAllDestinations } from "./ui.js";
import { initModal } from "./modal.js";
import { destinations } from './data/destinations.js';
import { getLocalTime } from './services/time.js';
import { fetchCountryInfo, fetchWeather } from "./services/api.js";
import { initGlobalSearch } from "./search.js";

initMenu();
initTheme();
initHeaderScroll();
initViewAllDestinations();
initModal();
initGlobalSearch();

function updateLocalTime(city) {
    const destination = destinations[city];

    if (!destination) return;

    const { time, day, date } = getLocalTime(destination.timezone);

    document.getElementById('localTime').textContent = time;
    document.getElementById('localDay').textContent = day;
    document.getElementById('localDate').textContent = date;
}

async function updateCountryInfo(city) {
    const destination = destinations[city];

    if (!destination) return;

    try {
        const country = await fetchCountryInfo(destination.countryCode);

        const currency = Object.values(country.currencies)[0].name;
        const language = Object.values(country.languages)[0];

        document.getElementById("countryCurrency").textContent = currency;
        document.getElementById("countryLanguage").textContent = language;
        document.getElementById("countryPopulation").textContent = country.population.toLocaleString();
        document.getElementById("countryCapital").textContent = country.capital[0];

    } catch (error) {
        console.error(error);
    }
}

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

function updateDestinationCardTime(card, city) {
    const destination = destinations[city];

    if (!destination) return;

    const { time } = getLocalTime(destination.timezone);
    const timeElement = card.querySelector(".local-time");

    if (timeElement) {
        timeElement.textContent = time;
    }
}

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

function updateDestinationCardsTime() {
    document.querySelectorAll(".destination-card").forEach((card) => {
        const city = card.dataset.city;
        updateDestinationCardTime(card, city);
    });
}

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

function updateDestinationDetails(city) {
    const destination = destinations[city];

    if (!destination) return;

    document.getElementById("destinationName").innerHTML = 
        `<i data-lucide="map-pin" aria-hidden="true"></i>${destination.city}, ${destination.country}`;
    
    updateLocalTime(city);
    updateCountryInfo(city);
    updateWeather(city);

    lucide.createIcons();
}

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

    lucide.createIcons();
}

let selectedCity = "Prague";

updateDestinationDetails(selectedCity);

setInterval(() => {
    updateLocalTime(selectedCity);
}, 60000);

document.querySelectorAll(".destination-card").forEach((card) => {
    card.addEventListener("click", () => {

        document.querySelectorAll(".destination-card").forEach((c) => {
            c.classList.remove("active");
        });

        card.classList.add("active");

        selectedCity = card.dataset.city;
        updateDestinationDetails(selectedCity);

        document.getElementById("destination-details").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

