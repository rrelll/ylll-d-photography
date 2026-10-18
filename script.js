
"use strict";

// COPYRIGHT YEAR
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// MOBILE NAVIGATION
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function closeMobileMenu() {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
}

if (menuToggle && navLinks) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.textContent = isOpen ? "×" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", event => {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeMobileMenu();
    });
}

// LIGHTBOX ELEMENTS
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

let currentGallery = [];
let currentImageIndex = 0;
let previousFocusedElement = null;
let previousBodyOverflow = "";
let touchStartX = 0;
let touchStartY = 0;

// GALLERY HELPERS
function getGalleryGroup(item) {
    return item.closest(".gallery") || item.closest("section") || item.parentElement;
}

function getImagesInSameGallery(item) {
    const group = getGalleryGroup(item);
    return galleryItems.filter(photo => getGalleryGroup(photo) === group);
}

// DISPLAY IMAGE
function showImage(index) {
    if (!currentGallery.length || !lightboxImage) return;

    currentImageIndex = (index + currentGallery.length) % currentGallery.length;

    const item = currentGallery[currentImageIndex];
    const image = item.querySelector("img");
    if (!image) return;

    lightboxImage.src = item.dataset.full || image.src;
    lightboxImage.alt = image.alt || "Photography portfolio image";

    if (lightboxCaption) {
        lightboxCaption.textContent = item.dataset.caption || image.alt || "";
    }

    const disableNavigation = currentGallery.length < 2;
    if (lightboxPrev) lightboxPrev.disabled = disableNavigation;
    if (lightboxNext) lightboxNext.disabled = disableNavigation;
}

// OPEN LIGHTBOX
function openLightbox(item) {
    if (!lightbox || !lightboxImage) return;

    currentGallery = getImagesInSameGallery(item);
    currentImageIndex = currentGallery.indexOf(item);
    if (currentImageIndex < 0) return;

    previousFocusedElement = item;
    previousBodyOverflow = document.body.style.overflow;

    showImage(currentImageIndex);
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (lightboxClose) lightboxClose.focus();
}

// CLOSE LIGHTBOX
function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains("active")) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;

    if (lightboxImage) lightboxImage.src = "";

    if (previousFocusedElement) previousFocusedElement.focus();

    previousFocusedElement = null;
    currentGallery = [];
    currentImageIndex = 0;
}

// MAKE PHOTOS INTERACTIVE
galleryItems.forEach(item => {
    const image = item.querySelector("img");
    if (!image) return;

    if (item.tagName !== "BUTTON" && item.tagName !== "A") {
        if (!item.hasAttribute("tabindex")) item.setAttribute("tabindex", "0");

        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `View photo: ${image.alt || "Photography"}`);
    }

    item.addEventListener("click", () => openLightbox(item));

    if (item.tagName !== "BUTTON" && item.tagName !== "A") {
        item.addEventListener("keydown", event => {
            if (event.target !== item) return;

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(item);
            }
        });
    }
});

// LIGHTBOX BUTTONS
if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => showImage(currentImageIndex - 1));
}

if (lightboxNext) {
    lightboxNext.addEventListener("click", () => showImage(currentImageIndex + 1));
}

// CLOSE WHEN CLICKING THE BACKGROUND
if (lightbox) {
    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) closeLightbox();
    });
}

// KEYBOARD NAVIGATION
document.addEventListener("keydown", event => {
    if (lightbox?.classList.contains("active")) {
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            showImage(currentImageIndex - 1);
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            showImage(currentImageIndex + 1);
        }
    }

    if (event.key === "Escape") closeMobileMenu();
});

// MOBILE SWIPE NAVIGATION
if (lightbox) {
    lightbox.addEventListener("touchstart", event => {
        const touch = event.changedTouches[0];
        touchStartX = touch.screenX;
        touchStartY = touch.screenY;
    }, { passive: true });

    lightbox.addEventListener("touchend", event => {
        if (!lightbox.classList.contains("active")) return;

        const touch = event.changedTouches[0];
        const differenceX = touch.screenX - touchStartX;
        const differenceY = touch.screenY - touchStartY;

        if (
            Math.abs(differenceX) > 50 &&
            Math.abs(differenceX) > Math.abs(differenceY)
        ) {
            showImage(currentImageIndex + (differenceX < 0 ? 1 : -1));
        }
    }, { passive: true });
}
