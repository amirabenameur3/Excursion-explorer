import { initMenu, initTheme, initHeaderScroll, initViewAllDestinations } from "./ui.js";
import { initModal } from "./modal.js";
import { destinations } from './data/destinations.js';
import { getLocalTime } from './services/time.js';
import { fetchCountryInfo, fetchWeather } from "./services/api.js";

initMenu();
initTheme();
initHeaderScroll();
initViewAllDestinations();
initModal();

function updateLocalTime(city) {
    const destination = destinations[city];

    if (!destination) return;

    const { time, day, date } = getLocalTime(destination.timezone);

    document.getElementById('localTime').textContent = time;
    document.getElementById('localDay').textContent = day;
    document.getElementById('localDate').textContent = date;
}

const defaultCity = "Prague";

updateLocalTime(defaultCity);

setInterval(() => {
    updateLocalTime(defaultCity);
}, 60000);

async function updateCountryInfo(city) {
    const destination = destinations[city];

    if (!destination) return;

    try {
        const country = await fetchCountryInfo(destination.countryCode);

        const currency = Object.values(country.currencies)[0].name;
        const language = Object.values(country.languages)[0];

        document.getElementById("countryCurrency").textContent = currency;
        document.getElementById("countryLanguage").textContent = language;
        document.getElementById("countryPopulation").textContent =
            country.population.toLocaleString();
        document.getElementById("countryCapital").textContent =
            country.capital[0];
    } catch (error) {
        console.error(error);
    }
}

updateCountryInfo(defaultCity);

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

updateWeather(defaultCity);