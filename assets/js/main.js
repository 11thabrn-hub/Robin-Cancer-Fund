(() => {
  const VENMO_USER = "Robin-Whiteman-3";
  const VENMO_WEB = "https://account.venmo.com/u/Robin-Whiteman-3";
  const NOTE = "Robin Cancer Fund — medical bills";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector(".site-header");
  const mobileBar = document.querySelector(".mobile-bar");
  const donate = document.getElementById("donate");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox?.querySelector("img");
  const lightboxCaption = lightbox?.querySelector(".lightbox-caption");

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (mobileBar && donate && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        mobileBar.classList.toggle("is-hidden", entry.isIntersecting);
      },
      { threshold: 0.18 }
    );
    io.observe(donate);
  }

  const flashCopied = (button) => {
    if (!button) return;
    const original = button.dataset.label || button.textContent;
    button.dataset.label = original;
    button.textContent = "Copied";
    button.classList.add("is-copied");
    window.setTimeout(() => {
      button.textContent = button.dataset.label;
      button.classList.remove("is-copied");
    }, 1800);
  };

  const copyText = async (text, button) => {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(button);
      return true;
    } catch {
      try {
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.left = "-9999px";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
        flashCopied(button);
        return true;
      } catch {
        window.prompt("Copy this:", text);
        return false;
      }
    }
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      copyText(button.getAttribute("data-copy") || "", button);
    });
  });

  const qrSets = {
    givesendgo: {
      src: "assets/img/qr-givesendgo.png",
      alt: "Scan to donate on GiveSendGo",
      note: "GiveSendGo · card, Apple Pay, and more",
    },
    venmo: {
      src: "assets/img/qr-venmo.png",
      alt: "Scan to donate on Venmo",
      note: "Venmo",
    },
    paypal: {
      src: "assets/img/qr-paypal.png",
      alt: "Scan to donate on PayPal",
      note: "PayPal",
    },
    cashapp: {
      src: "assets/img/qr-cashapp.png",
      alt: "Scan to donate on Cash App",
      note: "Cash App",
    },
  };

  document.querySelectorAll("[data-qr]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const set = qrSets[btn.getAttribute("data-qr")];
      if (!set) return;
      const group = btn.closest("[data-qr-group]");
      if (!group) return;
      group.querySelectorAll("[data-qr]").forEach((other) => {
        const on = other === btn;
        other.classList.toggle("is-active", on);
        other.setAttribute("aria-selected", on ? "true" : "false");
      });
      const img = group.querySelector("[data-qr-image]");
      const note = group.querySelector("[data-qr-note]");
      if (img) {
        img.src = set.src;
        img.alt = set.alt;
      }
      if (note) note.textContent = set.note;
    });
  });

  const venmoAppUrl = (amount) => {
    const params = new URLSearchParams({
      txn: "pay",
      recipients: VENMO_USER,
      note: NOTE,
    });
    if (amount) params.set("amount", String(amount));
    return `venmo://paycharge?${params.toString()}`;
  };

  const openVenmo = (amount) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = venmoAppUrl(amount);
      window.setTimeout(() => {
        window.location.href = VENMO_WEB;
      }, 900);
      return;
    }
    window.open(VENMO_WEB, "_blank", "noopener,noreferrer");
  };

  document.querySelectorAll("[data-venmo]").forEach((el) => {
    el.addEventListener("click", (event) => {
      const amount = el.getAttribute("data-venmo");
      if (amount === "web") return;
      event.preventDefault();
      openVenmo(amount === "any" ? "" : amount);
    });
  });

  const sharePayload = () => ({
    title: "Help Momma Robin fight cancer",
    text: "Please help Momma Robin. Liver cancer came first — then doctors found bone cancer during treatment. Her family has already spent more than $60,000 out of pocket. Please give what you can, or share this page.",
    url: window.location.href,
  });

  const openShareWindow = (url) => {
    window.open(url, "share-robin", "noopener,noreferrer,width=640,height=720");
  };

  document.querySelectorAll("[data-share]").forEach((button) => {
    button.addEventListener("click", async () => {
      const payload = sharePayload();
      if (navigator.share) {
        try {
          await navigator.share(payload);
          return;
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      }
      const copied = await copyText(payload.url, button);
      if (!copied) window.open(VENMO_WEB, "_blank", "noopener,noreferrer");
    });
  });

  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", () => copyText(window.location.href, button));
  });

  const facebookShare = document.querySelector("[data-facebook-share]");
  if (facebookShare) {
    facebookShare.addEventListener("click", (event) => {
      event.preventDefault();
      openShareWindow(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
      );
    });
  }

  const xShare = document.querySelector("[data-x-share]");
  if (xShare) {
    xShare.addEventListener("click", (event) => {
      event.preventDefault();
      const payload = sharePayload();
      openShareWindow(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(payload.text)}&url=${encodeURIComponent(payload.url)}`
      );
    });
  }

  const whatsappShare = document.querySelector("[data-whatsapp-share]");
  if (whatsappShare) {
    whatsappShare.addEventListener("click", (event) => {
      event.preventDefault();
      const payload = sharePayload();
      openShareWindow(
        `https://wa.me/?text=${encodeURIComponent(`${payload.text} ${payload.url}`)}`
      );
    });
  }

  const linkedinShare = document.querySelector("[data-linkedin-share]");
  if (linkedinShare) {
    linkedinShare.addEventListener("click", (event) => {
      event.preventDefault();
      openShareWindow(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
      );
    });
  }

  const emailShare = document.querySelector("[data-email-share]");
  if (emailShare) {
    emailShare.addEventListener("click", (event) => {
      const payload = sharePayload();
      emailShare.href = `mailto:?subject=${encodeURIComponent(payload.title)}&body=${encodeURIComponent(`${payload.text}\n\n${payload.url}`)}`;
    });
  }

  const smsShare = document.querySelector("[data-sms-share]");
  if (smsShare) {
    smsShare.addEventListener("click", () => {
      const payload = sharePayload();
      smsShare.href = `sms:?&body=${encodeURIComponent(`${payload.text} ${payload.url}`)}`;
    });
  }

  const openLightbox = (src, alt, caption) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (lightboxCaption) lightboxCaption.textContent = caption || alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-lightbox");
    lightbox.querySelector(".lightbox-close")?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-lightbox");
    lightboxImg.removeAttribute("src");
  };

  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      openLightbox(
        button.getAttribute("data-full") || button.querySelector("img")?.currentSrc,
        button.querySelector("img")?.alt,
        button.getAttribute("data-caption")
      );
    });
  });

  lightbox?.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox?.classList.contains("is-open")) closeLightbox();
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    const reveal = document.querySelectorAll(".reveal");
    const rio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            rio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveal.forEach((el) => rio.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
})();
