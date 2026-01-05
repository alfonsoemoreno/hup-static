(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Hero background (simple)
  const scriptEl = document.currentScript;
  const assetsBase = (() => {
    if (!scriptEl) return "";
    const url = new URL(scriptEl.src, window.location.href);
    return url.pathname.replace(/\/assets\/js\/main\.js$/, "");
  })();
  const assetPath = (path) =>
    `${assetsBase}/assets/${path}`.replace(/\/{2,}/g, "/");

  const heroBg = document.querySelector("[data-hero-bg]");
  if (heroBg) {
    heroBg.style.backgroundImage = `url('${assetPath("img/hero.webp")}')`;
  }

  // Parallax effect for video background
  const videoParallax = $(".video-parallax");
  if (videoParallax) {
    const applyVideoParallax = () => {
      const vh = window.innerHeight || 1;
      const rect = videoParallax.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const delta = (center - vh / 2) * 0.15;
      const clamped = Math.max(Math.min(delta, 120), -120);
      videoParallax.style.setProperty("--vp-offset", `${clamped}px`);
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        applyVideoParallax();
        ticking = false;
      });
      ticking = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", applyVideoParallax);
    applyVideoParallax();
  }

  // Parallax effect for landscape background (Safari-friendly)
  const landscapeBg = $("[data-landscape-bg]");
  if (landscapeBg) {
    const applyLandscapeParallax = () => {
      const vh = window.innerHeight || 1;
      const rect = landscapeBg.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const delta = (center - vh / 2) * 0.12;
      const clamped = Math.max(Math.min(delta, 100), -100);
      landscapeBg.style.setProperty("--lp-offset", `${clamped}px`);
    };
    let tickingLand = false;
    const onScrollLand = () => {
      if (tickingLand) return;
      window.requestAnimationFrame(() => {
        applyLandscapeParallax();
        tickingLand = false;
      });
      tickingLand = true;
    };
    window.addEventListener("scroll", onScrollLand, { passive: true });
    window.addEventListener("resize", applyLandscapeParallax);
    applyLandscapeParallax();
  }

  // Theme toggle (respects system preference by default)
  const themeToggle = $("#themeToggle");
  const themeStorageKey = "hup-theme";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  let userSetTheme = false;

  const themeLabels =
    document.documentElement.lang === "en"
      ? {
          toLight: "Switch to light mode",
          toDark: "Switch to dark mode",
        }
      : {
          toLight: "Cambiar a modo claro",
          toDark: "Cambiar a modo oscuro",
        };

  const storedTheme = (() => {
    try {
      return localStorage.getItem(themeStorageKey);
    } catch (_) {
      return null;
    }
  })();
  userSetTheme = Boolean(storedTheme);

  function applyTheme(theme, persist = false) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme =
      theme === "dark" ? "dark" : "light";
    syncThemeToggle(theme);
    if (persist) {
      userSetTheme = true;
      try {
        localStorage.setItem(themeStorageKey, theme);
      } catch (_) {
        /* ignore */
      }
    }
  }

  function syncThemeToggle(theme) {
    if (!themeToggle) return;
    const nextLabel = theme === "dark" ? themeLabels.toLight : themeLabels.toDark;
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", nextLabel);
    themeToggle.setAttribute("title", nextLabel);
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  const initialTheme =
    storedTheme || (prefersDark.matches ? "dark" : "light");
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }

  prefersDark.addEventListener("change", (event) => {
    if (storedTheme || userSetTheme) return;
    applyTheme(event.matches ? "dark" : "light");
  });

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
    if (hash === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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

  // Contact form (real send)
  const form = $("#contactForm");
  const status = $("#formStatus");
  if (form && status) {
    const endpoint = "https://mail-sender-delta-seven.vercel.app/api/contact";
    const lang = document.documentElement.lang || "es";
    const messages =
      lang === "en"
        ? {
            sending: "Sending...",
            success: "Thanks! We received your message and will reply soon.",
            error: "We couldn’t send your message. Please try again later.",
            invalid: "Please fill all required fields.",
          }
        : {
            sending: "Enviando...",
            success: "Gracias. Recibimos tu mensaje y te responderemos pronto.",
            error: "No pudimos enviar tu mensaje. Intenta más tarde.",
            invalid: "Completa todos los campos requeridos.",
          };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (!data.email || !data.message) {
        status.textContent = messages.invalid;
        return;
      }
      status.textContent = messages.sending;
      form.querySelector("button[type=submit]").disabled = true;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          status.textContent = messages.success;
          form.reset();
        } else {
          status.textContent = messages.error;
        }
      } catch (_) {
        status.textContent = messages.error;
      } finally {
        form.querySelector("button[type=submit]").disabled = false;
      }
    });
  }

  // Links placeholders (set your real phone/email/maps here)
  const mapsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Hotel+Ultimo+Paraiso+Lago+Brown+455+Cochrane+Aysen&travelmode=driving";
})();
