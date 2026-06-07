export function getLocalTime(timezone) {
    const now = new Date();

    return {
        time: now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone
        }),

        day: now.toLocaleDateString([], {
            weekday: 'long',
            timeZone: timezone
        }),

        date: now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: timezone
        })
    };
}