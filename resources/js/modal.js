import { destinations } from "./data/destinations.js";
import { fetchWikipediaSummary } from "./services/wiki.js";
import { updateSearchDestinationDetails } from "./main.js";
import { fetchNearbyAttractions } from "./services/geoapify.js";
import { generateSearchExperiences, generateSearchHiddenGems, generateSearchTravelTips } from "./services/searchModalTips.js";
import { generateItinerary, renderItinerary } from "./services/itinerary.js";

// =========================
// INITIALIZE MODAL
// =========================

export function initModal() {

    // =========================
    // MODAL STATE
    // =========================

    let activeModal = null;
    let lastFocusedElement = null;

    // =========================
    // MODAL HELPERS
    // =========================

    const getFocusableElements = (container) => {
        return Array.from(
            container.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter((element) => {
            return !element.hasAttribute('hidden') &&
            element.offsetParent !== null;
        });
    };

    const trapFocus = (event) => {
        if (!activeModal || event.key !== 'Tab') return;

        const modalBox = activeModal.querySelector('.modal');
        if (!modalBox) return;

        const focusableElements = getFocusableElements(modalBox);
        if (focusableElements.length === 0) {
            event.preventDefault();
            modalBox.focus();
            return;
        } 

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 1) {
            event.preventDefault();
            firstElement.focus();
            return;
        }

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    };

    const openModal = (modal, triggerButton) => {
        if (!modal) return;

        activeModal = modal;
        lastFocusedElement = triggerButton || document.activeElement;

        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            modal.classList.add('active');

            const modalBox = modal.querySelector('.modal');
            if (modalBox) modalBox.focus();
        });

        document.body.classList.add('modal-open');
    };

    const closeModal = (modal, restoreFocus = true) => {
        if (!modal) return;

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        setTimeout(() => {
            modal.hidden = true;

            if (restoreFocus && lastFocusedElement) {
                lastFocusedElement.focus();
            }

            if (activeModal === modal) {
                activeModal = null;
            }
        }, 300);
    };

    const populateList = (listId, items) => {
        const list = document.getElementById(listId);

        if (!list) return;

        list.innerHTML = "";

        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    };

    const updateModalContent = (city) => {
        const destination = destinations[city];

        if (!destination || !destination.modal) return;

        const modalData = destination.modal;

        document.getElementById("modalTitle").textContent = `${destination.city}, ${destination.country}`;
        
        const modalImage = document.getElementById("modalImage");
        modalImage.src = modalData.image;
        modalImage.alt = `${destination.city} destination image`;

        document.getElementById("modalDescription").textContent = modalData.description;

        populateList("modalExperiences", modalData.experiences);
        populateList("modalFood", modalData.food);
        populateList("modalHiddenGems", modalData.hiddenGems);
        populateList("modalTips", modalData.tips);

        const tourismLink = document.getElementById("tourismLink");

        if (modalData.tourismUrl) {
            tourismLink.href = modalData.tourismUrl;
            tourismLink.hidden = false;
        } else {
            tourismLink.hidden = true;
        }
    }

    // =========================
    // SEARCH MODAL CONTENT
    // =========================

    const updateSearchModalContent = async (destination) => {

        const cleanName = destination.name.replace("City of ", "").trim();
        document.getElementById("modalTitle").textContent = 
            destination.state
                ? `${cleanName}, ${destination.state}, ${destination.country}`
                : `${cleanName}, ${destination.country}`;

        const modalImage = document.getElementById("modalImage");
        modalImage.src = destination.cardImage?.src || "https://placehold.co/800x400?text=Destination";
        modalImage.alt = `${cleanName} destination image`;

        const modalDescription = document.getElementById("modalDescription");
        
        modalDescription.textContent = `Loading information about ${destination.name}...`;
        
        try {
            const wikiData = await fetchWikipediaSummary(
                cleanName,
                destination.country,
                destination.state
            );
            
            modalDescription.textContent = wikiData?.extract || `Explore ${cleanName}, ${destination.country}.`;

            if (wikiData?.image) {
                modalImage.src = wikiData.image;
                modalImage.alt = `View of ${cleanName}`;
                
                if (destination.cardImage) {
                    destination.cardImage.src = wikiData.image;
                    destination.cardImage.alt = `Travel view of ${cleanName}`;
                }
            }
        
        } catch (error) {
            console.error("Wikipedia fetch failed:", error);
            
            modalDescription.textContent = `Explore ${destination.name}, ${destination.country}.`;
        }

        const locationLabel = destination.state
            ? `${cleanName}, ${destination.state}`
            : cleanName;

        // Geoapify attractions for richer modal content
        let attractions = [];
        
        try {
            attractions = await fetchNearbyAttractions(destination.lat, destination.lon);
        } catch (error) {
            console.error("Search modal attractions failed:", error);
        }

        const itinerary = generateItinerary(attractions);
        renderItinerary(itinerary);
        
        populateList("modalExperiences", generateSearchExperiences(attractions, locationLabel));
        
        populateList("modalFood", [
            `Try traditional food from ${destination.country}`,
            `Look for local restaurants and cafés near the city center`,
            `Explore markets or regional specialties if available`
        ]);
        
        populateList("modalHiddenGems", generateSearchHiddenGems(attractions, locationLabel));
        
        populateList("modalTips", generateSearchTravelTips(attractions, cleanName));

        const tourismLink = document.getElementById("tourismLink");
        tourismLink.href = `https://www.google.com/search?q=${encodeURIComponent(
            `${destination.name} ${destination.country} official tourism website`
        )}`;
        
        tourismLink.textContent = "Find Official Tourism Website";
        tourismLink.hidden = false;
    };

    // =========================
    // MODAL EVENT HANDLING
    // =========================

    document.addEventListener('click', async (event) => {

        // =========================
        // OPEN MODAL
        // =========================

        const openButton = event.target.closest('[data-modal-target]');

        if (openButton) {
            event.preventDefault();

            const destinationName = openButton.dataset.destination;

            if (destinationName) {
                updateModalContent(destinationName);
            }

            if (openButton.hasAttribute("data-search-details")) {
                event.stopPropagation();
                const card = openButton.closest("article.search-result-card");
                const cardImage = card.querySelector(".destination-image");
                
                const destination = {
                    ...openButton.dataset,
                    cardImage: cardImage
                };

                updateSearchModalContent(destination);
                updateSearchDestinationDetails(destination);

                document.querySelectorAll(".destination-card").forEach((card) => {
                    card.classList.remove("active");
                });
                
                card.classList.add("active");
                
                document.getElementById("destination-details").scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            const modalId = openButton.dataset.modalTarget;
            const modal = document.getElementById(modalId);

            openModal(modal, openButton);
            return;
        }

        // =========================
        // CLOSE MODAL
        // =========================

        const closeButton = event.target.closest('[data-close-modal]');

        if (closeButton) {
            const modal = closeButton.closest('.modal-overlay');
            closeModal(modal);
            return;
        }

        // =========================
        // CLICK OUTSIDE (OVERLAY)
        // =========================

        if (event.target.classList.contains('modal-overlay')) {
            closeModal(event.target);
        }
    });

    // Handle Escape key and focus trapping

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && activeModal) {
            closeModal(activeModal);
            return;
        }
        trapFocus(event);
    });
}