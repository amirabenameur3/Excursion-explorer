import { updateSearchResultWeather, updateSearchResultPhoto } from "./search.js";
import { updateSearchDestinationDetails } from "./main.js";

// =========================
// INITIALIZE MENU
// =========================

export function initMenu() {

    // =========================
    // DOM ELEMENTS
    // =========================

    const menuButton = document.querySelector('.menu-button');
    const navMenu = document.querySelector('.main-navigation');
    const navLinks = document.querySelectorAll('.main-navigation a');

    // Safety check
    if (!menuButton || !navMenu) return;

    // =========================
    // MOBILE / DROPDOWN MENU
    // =========================

    const closeMenu = () => {
        if (!menuButton || !navMenu) return;

        menuButton.classList.remove('active');
        navMenu.classList.remove('active');
        menuButton.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        if (!menuButton || !navMenu) return;

        menuButton.classList.add('active');
        navMenu.classList.add('active');
        menuButton.setAttribute('aria-expanded', 'true');
    };

  
    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();

        const isOpen = navMenu.classList.contains('active');

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
 

    navLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
        const clickedButton = menuButton.contains(event.target);
        const clickedNav = navMenu.contains(event.target);

        if (!clickedButton && !clickedNav) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
}

// =========================
// INITIALIZE THEME
// =========================

export function initTheme() {

    // =========================
    // INITIALIZE ICONS
    // =========================

    lucide.createIcons();

    // =========================
    // DOM ELEMENTS
    // =========================

    const themeToggleButton = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');

    // Safety check
    if (!themeToggleButton) return;

    // =========================
    // THEME TOGGLE
    // =========================

    const updateThemeIcon = (theme) => {
        themeToggleButton.innerHTML = theme === 'light' ? `<i data-lucide="moon"></i>` : `<i data-lucide="sun"></i>`;
        lucide.createIcons();
    };

    if (!savedTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

// =========================
// HEADER SCROLL EFFECT
// =========================

export function initHeaderScroll() {
    const header = document.querySelector('.site-header');

    if (!header) return;

    const updateHeader = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader);
}

let activeDestinationFilter = "all";
let destinationsExpanded = false;

// =========================
// VIEW ALL DESTINATIONS
// =========================

export function initViewAllDestinations() {

    const viewAllDestButton = document.getElementById("viewAllDestinations");
    const destinationCards = document.querySelectorAll(".destination-card");

    if (!viewAllDestButton) return;

    viewAllDestButton.addEventListener("click", () => {

        destinationsExpanded = !destinationsExpanded;

        const favorites = getFavorites();
        let visibleCount = 0;

        destinationCards.forEach((card) => {

            const matchesFilter =
                activeDestinationFilter === "all" ||
                card.dataset.continent === activeDestinationFilter ||
                (
                    activeDestinationFilter === "favorites" &&
                    favorites.some((favorite) => favorite.id === card.dataset.city)
                );

            if (!matchesFilter) {
                card.classList.add("is-hidden");
                return;
            }

            visibleCount++;

            if (destinationsExpanded || visibleCount <= 3) {
                card.classList.remove("is-hidden");
            } else {
                card.classList.add("is-hidden");
            }
        });

        viewAllDestButton.innerHTML = destinationsExpanded
            ? 'Show less <i data-lucide="chevron-up"></i>'
            : 'View all <i data-lucide="chevron-right"></i>';

        lucide.createIcons();
    });
}

// =========================
// FILTER DESTINATIONS
// =========================

export function initDestinationFilters() {

    const filterButtons = document.querySelectorAll(".filter-btn");
    const destinationCards = document.querySelectorAll(".destination-card");
    const viewAllDestButton = document.getElementById("viewAllDestinations");

    if (!filterButtons.length || !destinationCards.length) return;

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeDestinationFilter = button.dataset.filter;
            destinationsExpanded = true;

            filterButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            destinationCards.forEach((card) => {
                const matchesFilter =
                    activeDestinationFilter === "all" ||
                    card.dataset.continent === activeDestinationFilter ||
                    (
                        activeDestinationFilter === "favorites" &&
                        getFavorites().some((favorite) => favorite.id === card.dataset.city)
                    );

                card.classList.toggle("is-hidden", !matchesFilter);
            });

            renderSavedSearchFavorites();

            if (viewAllDestButton) {
                viewAllDestButton.innerHTML =
                    'Show less <i data-lucide="chevron-up"></i>';
                lucide.createIcons();
            }
        });
    });
}

// =====================================
// SAVE FAVOURITE FEATURED DESTINATIONS
// =====================================

const FAVORITES_STORAGE_KEY = "excursionFavorites";

function getFavorites() {
    const favorites =
        JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];

    return favorites.map((favorite) => {
        if (typeof favorite === "string") {
            return {
                id: favorite,
                type: "featured"
            };
        }

        return favorite;
    });
}

function saveFavorites(favorites) {
    const uniqueFavorites = favorites.filter((favorite, index, array) => {
        return index === array.findIndex((item) => item.id === favorite.id);
    });

    localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(uniqueFavorites)
    );
}

function isFavorite(id) {
    return getFavorites().some((favorite) => favorite.id === id);
}

export function initFavorites(container = document) {
    const favoriteButtons = container.querySelectorAll("[data-favorite]");

    favoriteButtons.forEach((button) => {
        
        const card = button.closest(".destination-card");
        const city = card.dataset.city;

        if (!city) return;

        if (isFavorite(city)) {
            button.classList.add("is-favorite");
            button.setAttribute("aria-label", "Remove destination from favorites");
        } else {
            button.classList.remove("is-favorite");
            button.setAttribute("aria-label", "Save destination");
        }

        button.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            let favorites = getFavorites();

            if (favorites.some((favorite) => favorite.id === city)) {
                favorites = favorites.filter((favorite) => favorite.id !== city);
                button.classList.remove("is-favorite");
                button.setAttribute("aria-label", "Save destination");
            } else {
                const isSearchResult = card.classList.contains("search-result-card");
                const favoriteDestination = isSearchResult
                    ? {
                        id: city,
                        type: "search",
                        name: card.dataset.name,
                        country: card.dataset.country,
                        countryCode: card.dataset.countryCode || "",
                        state: card.dataset.state || "",
                        lat: card.dataset.lat,
                        lon: card.dataset.lon
                    }
                    : {
                        id: city,
                        type: "featured"
                    };

                if (!favorites.some((favorite) => favorite.id === city)) {
                    favorites.push(favoriteDestination);
                }
                    
                favorites.push(favoriteDestination);
                
                button.classList.add("is-favorite");
                button.setAttribute("aria-label", "Remove destination from favorites");
            }

            saveFavorites(favorites);
            
            if (activeDestinationFilter === "favorites") {
                renderSavedSearchFavorites();

                const favoriteIds = getFavorites().map((favorite) => favorite.id);
                
                document.querySelectorAll(".destination-card").forEach((card) => {
                    if (!favoriteIds.includes(card.dataset.city)) {
                        card.classList.add("is-hidden");
                    }
                });
            }
        };
    });
}

// ======================================
// SAVE FAVOURITE SEARCHED DESTINATIONS
// ======================================

function renderSavedSearchFavorites() {
    const savedSearchContainer = document.getElementById("savedSearchDestinations");

    if (!savedSearchContainer) return;

    savedSearchContainer.innerHTML = "";

    if (activeDestinationFilter !== "favorites") return;

    const searchFavorites = getFavorites().filter((favorite) => {
        return favorite.type === "search";
    });

    if (!searchFavorites.length) return;

    savedSearchContainer.innerHTML = searchFavorites.map((destination) => `
        <article class="destination-card search-result-card"
                data-city="${destination.id}"
                data-lat="${destination.lat}"
                data-lon="${destination.lon}"
                data-name="${destination.name}"
                data-country="${destination.country}"
                data-country-code="${destination.countryCode || ""}"
                data-state="${destination.state || ""}">

            <div class="image-wrapper">
                <img
                    src="https://placehold.co/600x400?text=${encodeURIComponent(destination.name)}"
                    alt="Travel view of ${destination.name}"
                    class="destination-image"
                    loading="lazy"
                >

                <button
                    class="favorite-btn search-favorite-btn is-favorite"
                    type="button"
                    aria-label="Remove destination from favorites"
                    data-favorite>
                    <i data-lucide="heart" aria-hidden="true"></i>
                </button>

                <div class="destination-meta">
                    <div class="weather-badge">
                        <span class="weather-icon">--</span>
                        <span class="weather-temp">Loading...</span>
                    </div>

                    <div class="time-badge">
                        <i data-lucide="clock-3" aria-hidden="true"></i>
                        <span class="local-time">--:--</span>
                    </div>
                </div>
            </div>

            <div class="destination-content">
                <div class="destination-info">
                    <h3>${destination.name}</h3>
                    <p class="destination-location">
                        <i data-lucide="map-pin" aria-hidden="true"></i>
                        ${destination.country}
                    </p>
                </div>

                <button
                    type="button"
                    class="details-link"
                    aria-label="View details about ${destination.name}"
                    data-modal-target="destinationModal"
                    data-search-details
                    data-name="${destination.name}"
                    data-country="${destination.country}"
                    data-country-code="${destination.countryCode || ""}"
                    data-state="${destination.state || ""}"
                    data-lat="${destination.lat}"
                    data-lon="${destination.lon}">
                    View Details
                    <i data-lucide="arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </article>
    `).join("");

    lucide.createIcons();
    initFavorites(savedSearchContainer);

    const savedCards = savedSearchContainer.querySelectorAll(".search-result-card");
    
    savedCards.forEach((card) => {
        updateSearchResultWeather(card, card.dataset.lat, card.dataset.lon);
        updateSearchResultPhoto(card, card.dataset.name, card.dataset.country);
    });

    savedCards.forEach((card) => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".destination-card").forEach((c) => {
                c.classList.remove("active");
            });
            
            card.classList.add("active");
            
            updateSearchDestinationDetails({
                name: card.dataset.name,
                country: card.dataset.country,
                countryCode: card.dataset.countryCode,
                state: card.dataset.state,
                lat: card.dataset.lat,
                lon: card.dataset.lon
            });
            
            document.getElementById("destination-details").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}