// =========================
// BEST TIME TO VISIT
// =========================

export function generateBestTime(lat) {
    const month = new Date().getMonth();
    const isNorthern = Number(lat) >= 0;

    const bestMonths = isNorthern
        ? "April – June • September – October"
        : "October – December • February – April";

    const peakMonths = isNorthern
        ? [5, 6, 7]
        : [11, 0, 1];

    const shoulderMonths = isNorthern
        ? [3, 4, 8, 9]
        : [2, 3, 9, 10];

    const monthName = new Date().toLocaleString("en-US", {
        month: "long"
    });

    if (shoulderMonths.includes(month)) {
        return `
            <strong>🌿 Shoulder season (${monthName})</strong>
            <span>Pleasant weather and fewer crowds.</span>
            <span><strong>Best months:</strong> ${bestMonths}</span>
        `;
    }

    if (peakMonths.includes(month)) {
        return `
            <strong>☀️ Peak season (${monthName})</strong>
            <span>Expect higher prices and busier attractions.</span>
            <span><strong>Best months:</strong> ${bestMonths}</span>
        `;
    }

    return `
        <strong>🍂 Off season (${monthName})</strong>
        <span>Quieter attractions and often lower prices.</span>
        <span><strong>Best months:</strong> ${bestMonths}</span>
    `;
}

// =========================
// PACKING REMINDER
// =========================

export function generatePackingReminder(weather) {
    if (!weather) {
        return ["Check local forecast"];
    }

    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed * 3.6;
    const condition = weather.weather[0].main.toLowerCase();

    const reminders = [];

    if (temp <= 5) {
        reminders.push("🧥 Warm coat", "🧣 Gloves & scarf");
    } else if (temp <= 15) {
        reminders.push("🧥 Light jacket");
    } else if (temp >= 28) {
        reminders.push("🧴 Sunscreen", "😎 Sunglasses", "💧 Stay hydrated");
    }

    if (humidity >= 75 && temp >= 20) {
        reminders.push("💧 Extra water");
    }

    if (windSpeed >= 25) {
        reminders.push("🌬️ Windproof jacket");
    }

    if (condition.includes("rain")) {
        reminders.push("☔ Umbrella", "🥾 Waterproof shoes");
    }

    if (condition.includes("snow")) {
        reminders.push("❄️ Warm layers", "🥾 Waterproof boots");
    }

    if (condition.includes("clear") && temp >= 18) {
        reminders.push("🧢 Hat");
    }

    const defaultReminders = [
        "👟 Comfortable shoes",
        "🔋 Phone charger",
        "🧥 Weather-appropriate clothes"
    ];
    
    for (const item of defaultReminders) {
        if (reminders.length >= 3) break;
        
        if (!reminders.includes(item)) {
            reminders.push(item);
        }
    }

    return reminders.length
        ? [...new Set(reminders)]
        : ["👟 Comfortable shoes", "🔋 Phone charger", "🧥 Weather-appropriate clothes"];
}