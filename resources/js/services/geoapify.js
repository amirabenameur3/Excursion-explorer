import { GEOAPIFY_API_KEY } from "./config.js";

// =========================
// CALCULATE DISTANCE BETWEEN TWO LOCATIONS
// =========================

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;

    const toRadians = (degrees) =>
        degrees * (Math.PI / 180);

    const latitudeDifference =
        toRadians(lat2 - lat1);

    const longitudeDifference =
        toRadians(lon2 - lon1);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(longitudeDifference / 2) ** 2;

    const c =
        2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}

// =========================
// SCORE ATTRACTION QUALITY
// =========================

function getAttractionScore(attraction) {
    const categories = attraction.categories;

    let score = 0;

    if (categories.some((category) =>
        category.includes("tourism.sights")
    )) {
        score += 10;
    }

    if (categories.some((category) =>
        category.includes("entertainment.museum")
    )) {
        score += 9;
    }

    if (categories.some((category) =>
        category.includes("heritage")
    )) {
        score += 8;
    }

    if (categories.some((category) =>
        category.includes("leisure.park")
    )) {
        score += 7;
    }

    if (categories.some((category) =>
        category.includes("religion")
    )) {
        score += 6;
    }

    if (categories.some((category) =>
        category.includes("tourism.attraction")
    )) {
        score += 5;
    }

    // Lower priority for minor points of interest
    if (categories.some((category) =>
        category.includes("artwork") ||
        category.includes("sculpture") ||
        category.includes("statue") ||
        category.includes("memorial") ||
        category.includes("monument") ||
        category.includes("plaque")
    )) {
        score -= 8;
    }

    return score;
}

// ============================================
// SELECT GEOGRAPHICALLY DIVERSE ATTRACTIONS
// ============================================

function selectDiverseAttractions(attractions, limit = 5) {
    const distanceThresholds = [1000, 750, 500, 250, 0];
    const selectedAttractions = [];

    for (const minimumDistance of distanceThresholds) {
        for (const attraction of attractions) {
            const isAlreadySelected =
                selectedAttractions.includes(attraction);

            if (isAlreadySelected) continue;

            const isFarEnough = selectedAttractions.every(
                (selectedAttraction) =>
                    calculateDistance(
                        attraction.lat,
                        attraction.lon,
                        selectedAttraction.lat,
                        selectedAttraction.lon
                    ) >= minimumDistance
            );

            if (isFarEnough) {
                selectedAttractions.push(attraction);
            }

            if (selectedAttractions.length === limit) {
                return selectedAttractions;
            }
        }
    }

    return selectedAttractions;
}


// =========================
// FETCH NEARBY ATTRACTIONS
// =========================

export async function fetchNearbyAttractions(lat, lon) {
    const radius = 5000;
    const requestLimit = 50;
    const displayLimit = 5;

    const url =
        `https://api.geoapify.com/v2/places` +
        `?categories=tourism.attraction,tourism.sights,entertainment.museum,heritage,leisure.park` +
        `&filter=circle:${lon},${lat},${radius}` +
        `&bias=proximity:${lon},${lat}` +
        `&limit=${requestLimit}` +
        `&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch nearby attractions: ${response.status}`
        );
    }

    const data = await response.json();

    const attractions = data.features
        .filter((place) => {
            const properties = place.properties;

            return (
                properties.name &&
                Number.isFinite(properties.lat) &&
                Number.isFinite(properties.lon)
            );
        })
        .map((place) => ({
            name: place.properties.name.trim(),
            categories: place.properties.categories || [],
            lat: place.properties.lat,
            lon: place.properties.lon
        }));

    // Remove duplicate attractions by normalized name
    const uniqueAttractions = [];

    for (const attraction of attractions) {
        const normalizedName =
            attraction.name.toLowerCase();

        const isDuplicate = uniqueAttractions.some(
            (item) =>
                item.name.toLowerCase() === normalizedName
        );

        if (!isDuplicate) {
            uniqueAttractions.push(attraction);
        }
    }

    // Rank major attractions above minor artworks and memorials
    const rankedAttractions = [...uniqueAttractions].sort(
        (a, b) => getAttractionScore(b) - getAttractionScore(a)
    );

    return selectDiverseAttractions(
        rankedAttractions,
        displayLimit
   );
}