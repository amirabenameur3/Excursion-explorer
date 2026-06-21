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
                    favorites.includes(card.dataset.city)
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
                        getFavorites().includes(card.dataset.city)
                    );

                card.classList.toggle("is-hidden", !matchesFilter);
            });

            if (viewAllDestButton) {
                viewAllDestButton.innerHTML =
                    'Show less <i data-lucide="chevron-up"></i>';
                lucide.createIcons();
            }
        });
    });
}

// ============================
// SAVE FAVOURITE DESTINATIONS
// ============================

const FAVORITES_STORAGE_KEY = "excursionFavorites";

function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function isFavorite(city) {
    return getFavorites().includes(city);
}

export function initFavorites() {
    const favoriteButtons = document.querySelectorAll("[data-favorite]");

    favoriteButtons.forEach((button) => {
        const card = button.closest(".destination-card");
        const city = card.dataset.city;

        if (isFavorite(city)) {
            button.classList.add("is-favorite");
            button.setAttribute("aria-label", "Remove destination from favorites");
        }

        button.addEventListener("click", (event) => {
            event.stopPropagation();

            let favorites = getFavorites();

            if (favorites.includes(city)) {
                favorites = favorites.filter((item) => item !== city);
                button.classList.remove("is-favorite");
                button.setAttribute("aria-label", "Save destination");
            } else {
                favorites.push(city);
                button.classList.add("is-favorite");
                button.setAttribute("aria-label", "Remove destination from favorites");
            }

            saveFavorites(favorites);
        });
    });
}

