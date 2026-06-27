const GEOAPIFY_API_KEY = "a2d2bf9fd09042a8b466c9bc137149c6";

export async function fetchNearbyAttractions(lat, lon) {
    const radius = 5000;
    const limit = 5;

    const url = 
        `https://api.geoapify.com/v2/places` +
        `?categories=tourism.attraction,tourism.sights,entertainment.museum,heritage,leisure.park,natural` +
        `&filter=circle:${lon},${lat},${radius}` +
        `&bias=proximity:${lon},${lat}` +
        `&limit=${limit}` +
        `&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch nearby attractions");
    }

    const data = await response.json();

    const attractions = data.features
        .filter((place) => place.properties.name)
        .map((place) => ({
            name: place.properties.name,
            categories: place.properties.categories || [],
            lat: place.properties.lat,
            lon: place.properties.lon
        }));
        
    const uniqueAttractions = [];
    
    for (const attraction of attractions) {
        if (!uniqueAttractions.some((item) => item.name === attraction.name)) {
            uniqueAttractions.push(attraction);
        }
    }
        
    return uniqueAttractions.slice(0, limit);
}