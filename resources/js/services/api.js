// =========================
// FETCH COUNTRY INFORMATION
// =========================

export async function fetchCountryInfo(countryValue) {
    if (!countryValue) {
        throw new Error("Missing country value");
    }

    const isCountryCode = countryValue.length === 2;

    const endpoint = isCountryCode
        ? `https://restcountries.com/v3.1/alpha/${encodeURIComponent(countryValue)}`
        : `https://restcountries.com/v3.1/name/${encodeURIComponent(countryValue)}?fullText=true`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error("Failed to fetch country info");
    }

    const data = await response.json();

    return Array.isArray(data) ? data[0] : data;
}

// =========================
// OPENWEATHER API
// =========================

const WEATHER_API_KEY = "de124c0a8ce155bb6b177d5ea6b3fa08";

// =========================
// FETCH CURRENT WEATHER
// =========================

export async function fetchWeather(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }

    return response.json();
}