import { PEXELS_API_KEY } from "./config.js";

// =========================
// FETCH DESTINATION PHOTO
// =========================

export async function fetchDestinationPhoto(destinationName, country, state) {
    // Build the search query
    const query = state
        ? `${destinationName} ${state} ${country}`
        : `${destinationName} ${country}`;

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch destination photo");
    }

    const data = await response.json();

    if (!data.photos.length) {
        return null;
    }

    return data.photos[0].src.large;
}