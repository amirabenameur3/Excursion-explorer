export async function fetchCountryInfo(countryCode) {
    const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch country information");
    }

    const data = await response.json();
    return data[0];
}

const WEATHER_API_KEY = "de124c0a8ce155bb6b177d5ea6b3fa08";

export async function fetchWeather(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }

    return await response.json();
}