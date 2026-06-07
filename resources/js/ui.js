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

// =========================
// VIEW ALL DESTINATIONS
// =========================

export function initViewAllDestinations() {

    // =========================
    // DOM ELEMENTS
    // =========================

    const viewAllDestButton = document.getElementById('viewAllDestinations');
    const hiddenCards = document.querySelectorAll('.extra-destination');

    // Safety check
    if (!viewAllDestButton) return;

    let expanded = false;

    viewAllDestButton.addEventListener('click', () => {

        if(!expanded) {
            hiddenCards.forEach((card) => {
                card.classList.remove('is-hidden');
            });

            viewAllDestButton.innerHTML = 'Show less <i data-lucide="chevron-up"></i>';
            lucide.createIcons();
            expanded = true;

        } else {
            hiddenCards.forEach((card) => {
                card.classList.add('is-hidden');
            });

            viewAllDestButton.innerHTML = 'View all <i data-lucide="chevron-right"></i>';
            lucide.createIcons();
            expanded = false;

        }
    });
}




