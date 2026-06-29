function getCategories(attractions) {
    return attractions.flatMap((attraction) => attraction.categories || []);
}

function addUnique(items, item) {
    if (!items.includes(item)) {
        items.push(item);
    }
}

export function generateSearchExperiences(attractions, cleanName) {
    if (!attractions || !attractions.length) {
        return [
            `Explore the main landmarks and points of interest in ${cleanName}`,
            `Walk around local neighborhoods and discover the local atmosphere`,
            `Visit museums, parks, viewpoints, or historic areas nearby`
        ];
    }

    const categories = getCategories(attractions);
    const experiences = [];

    if (categories.some((category) => category.includes("heritage"))) {
        addUnique(experiences, "Explore historic landmarks and heritage sites");
    }

    if (categories.some((category) => category.includes("tourism.sights"))) {
        addUnique(experiences, "Visit iconic sightseeing spots");
    }

    if (categories.some((category) => category.includes("artwork"))) {
        addUnique(experiences, "Discover public art, statues, and monuments");
    }

    if (categories.some((category) => category.includes("museum"))) {
        addUnique(experiences, "Visit museums and cultural spaces");
    }

    if (categories.some((category) => category.includes("park"))) {
        addUnique(experiences, "Relax in parks and green spaces");
    }

    attractions.slice(0, 3).forEach((attraction) => {
        if (experiences.length < 3) {
            addUnique(experiences, `Visit ${attraction.name}`);
        }
    });

    return experiences.slice(0, 3);
}

export function generateSearchHiddenGems(attractions, cleanName) {
    const hiddenGems = [];

    if (attractions && attractions.length) {
        attractions.slice(3, 6).forEach((attraction) => {
            addUnique(hiddenGems, `Discover ${attraction.name}`);
        });
    }

    const defaults = [
        `Explore quieter neighborhoods around ${cleanName}`,
        "Look for lesser-known viewpoints and local streets",
        "Visit small parks, squares, and cultural corners"
    ];

    defaults.forEach((item) => {
        if (hiddenGems.length < 3) {
            addUnique(hiddenGems, item);
        }
    });

    return hiddenGems.slice(0, 3);
}

export function generateSearchTravelTips(attractions, cleanName) {
    const categories = getCategories(attractions || []);
    const tips = [];

    if (categories.some((category) => category.includes("heritage"))) {
        addUnique(tips, "Start your visit in the historic city center");
    }

    if (categories.some((category) => category.includes("museum"))) {
        addUnique(tips, "Visit museums earlier in the day to avoid larger crowds");
    }

    if (categories.some((category) => category.includes("park"))) {
        addUnique(tips, "Take time to relax in parks and green spaces");
    }

    if (categories.some((category) => category.includes("tourism.sights"))) {
        addUnique(tips, "Plan your route to include the city's main sightseeing spots");
    }

    tips.push(
        `Check the weather before visiting ${cleanName}`,
        "Save nearby attractions before your trip",
        "Check opening hours and transport options in advance"
    );

    return tips.slice(0, 3);
}