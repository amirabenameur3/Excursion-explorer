import { destinations } from "./data/destinations.js";

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
    // MODAL EVENT HANDLING
    // =========================

    document.addEventListener('click', (event) => {

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