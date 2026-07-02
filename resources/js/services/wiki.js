export async function fetchWikipediaSummary(name, country, state) {
    const cleanName = name.replace("City of ", "").trim();

    const queries = [
        state ? `${cleanName}, ${state}` : null,
        state ? `${cleanName}, ${state}, ${country}` : null,
        `${cleanName}, ${country}`,
        cleanName
    ].filter(Boolean);

    for (const query of queries) {

        try {
            const response = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );

            if (!response.ok) continue;

            const data = await response.json();

            if (data.extract && data.type !== "disambiguation" && !data.description?.toLowerCase().includes("surname")) {
                return {
                    extract: data.extract,
                    image: data.originalimage?.source || data.thumbnail?.source || null
                };
            }

        } catch (error) {
            console.error("Wikipedia fetch failed:", error);
        }
    }

    return null;
}