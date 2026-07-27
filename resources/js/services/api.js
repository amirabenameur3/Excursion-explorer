import { WEATHER_API_KEY, REST_COUNTRIES_API_KEY } from "./config.js";

// =========================
// FETCH COUNTRY INFORMATION
// =========================

export async function fetchCountryInfo(countryCode) {
    const code = countryCode.trim().toUpperCase();

    const url =
        `https://api.restcountries.com/countries/v5/codes.alpha_2/${encodeURIComponent(code)}?` +
        "response_fields=currencies,languages,population,capitals";

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${REST_COUNTRIES_API_KEY}`
        }
    });

    const result = await response.json();

    if (!response.ok) {
        const message =
            result.errors?.[0]?.message ||
            `Country request failed with status ${response.status}`;

        throw new Error(message);
    }

    const country = result.data?.objects?.[0];

    if (!country) {
        throw new Error(`No country found for code: ${code}`);
    }

    return country;
}

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