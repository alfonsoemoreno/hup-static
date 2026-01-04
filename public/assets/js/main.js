(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Hero background (simple)
  const heroBg = document.querySelector("[data-hero-bg]");
  if (heroBg) {
    heroBg.style.backgroundImage = "url('/assets/img/hero.jpg')";
  }

  // Mobile menu
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close on link click (mobile)
    $$(".nav__link", navMenu).forEach((a) => {
      a.addEventListener("click", () => {
        if (navMenu.classList.contains("is-open")) {
          navMenu.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      const target = e.target;
      const clickedInside =
        navMenu.contains(target) || navToggle.contains(target);
      if (!clickedInside && navMenu.classList.contains("is-open")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Smooth scroll with offset for sticky header
  const header = $(".header");
  const headerH = () => (header ? header.getBoundingClientRect().height : 0);

  function scrollToHash(hash) {
    const el = document.querySelector(hash);
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - headerH() - 10;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // Intercept same-page anchors
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      history.replaceState(null, "", href);
      scrollToHash(href);
    });
  });

  // If loaded with hash, offset it
  window.addEventListener("load", () => {
    if (location.hash) scrollToHash(location.hash);
  });

  // Language switch keeps section
  $$("[data-lang-switch]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = a.getAttribute("href");
      if (!target) return;
      const hash = location.hash || "";
      // preserve anchor for equivalent sections (if IDs differ ES/EN, map below)
      const mapped = mapHashForLanguage(hash, target);
      a.setAttribute("href", target + mapped);
    });
  });

  // Map ES/EN section ids so the switch lands on the equivalent section.
  function mapHashForLanguage(hash, targetHref) {
    if (!hash) return "";
    const toEnglish = targetHref.startsWith("/en");
    const map = {
      "#sobre": "#about",
      "#habitaciones": "#rooms",
      "#servicios": "#amenities",
      "#galeria": "#gallery",
      "#ubicacion": "#location",
      "#contacto": "#contact",
      "#about": "#sobre",
      "#rooms": "#habitaciones",
      "#amenities": "#servicios",
      "#gallery": "#galeria",
      "#location": "#ubicacion",
      "#contact": "#contacto",
    };
    // If switching to English and currently in Spanish, map; and vice versa
    return map[hash] ? map[hash] : hash;
  }

  // Simple Lightbox
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxClose = $("#lightboxClose");

  function openLightbox(src, alt = "") {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  $$("[data-gallery] .thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      const full = btn.getAttribute("data-full");
      const img = $("img", btn);
      if (!full) return;
      openLightbox(full, img?.alt || "");
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      // close when clicking backdrop (not the image)
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // Contact form (placeholder)
  const form = $("#contactForm");
  const status = $("#formStatus");
  if (form && status) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.textContent =
        document.documentElement.lang === "en"
          ? "Form not connected yet. We'll wire it later."
          : "Formulario aún no conectado. Luego lo enlazamos.";
    });
  }

  // Links placeholders (set your real phone/email/maps here)
  const phone = "+56XXXXXXXXX";
  const email = "contacto@hotelultimoparaiso.cl";
  const mapsUrl = "https://www.google.com/maps";

  $$("[data-phone]").forEach((a) => {
    a.textContent = phone;
    a.setAttribute("href", `tel:${phone.replace(/\s+/g, "")}`);
  });

  $$("[data-email]").forEach((a) => {
    a.textContent = email;
    a.setAttribute("href", `mailto:${email}`);
  });

  const mapsLink = document.querySelector("[data-maps-link]");
  if (mapsLink) mapsLink.setAttribute("href", mapsUrl);
})();
