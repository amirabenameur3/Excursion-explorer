function getCategories(attractions = []) {
    return attractions.flatMap((attraction) => attraction.categories || []);
}

function addUnique(items, item) {
    if (!items.includes(item)) {
        items.push(item);
    }
}

export function generateItinerary(attractions = [], useNames = false)  {
    if (useNames && attractions.length) {
        const timeSlots = [
            "🌅 Morning",
            "☀️ Afternoon",
            "🌆 Evening"
        ];

        return attractions.slice(0, 3).map((attraction, index) => {
            return {
                time: timeSlots[index],
                activity: attraction.name
            };
        });
    }

    const categories = getCategories(attractions);
    const activities = [];

    if (categories.some((category) => category.includes("heritage"))) {
        addUnique(activities, "Explore historic landmarks and heritage sites");
    }

    if (categories.some((category) => category.includes("tourism.sights"))) {
        addUnique(activities, "Walk around the main sightseeing spots");
    }

    if (categories.some((category) => category.includes("museum"))) {
        addUnique(activities, "Visit museums and cultural attractions");
    }

    if (categories.some((category) => category.includes("park"))) {
        addUnique(activities, "Relax in parks and green spaces");
    }

    if (categories.some((category) => category.includes("artwork"))) {
        addUnique(activities, "Discover public art, statues, and monuments");
    }

    const defaults = [
        "Start with the main landmarks",
        "Explore local neighborhoods and cultural spots",
        "Walk through the city center and enjoy the atmosphere"
    ];

    defaults.forEach((item) => {
        if (activities.length < 3) {
            addUnique(activities, item);
        }
    });

    const timeSlots = [
        "🌅 Morning",
        "☀️ Afternoon",
        "🌆 Evening"
    ];

    return activities.slice(0, 3).map((activity, index) => {
        return {
            time: timeSlots[index],
            activity
        };
    });
}

export function renderItinerary(items) {
    const list = document.getElementById("modalItinerary");

    if (!list) return;

    list.innerHTML = "";

    items.forEach((item) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${item.time}</strong>
            <span>${item.activity}</span>
        `;

        list.appendChild(li);
    });
}