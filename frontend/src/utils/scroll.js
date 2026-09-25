let lenis = null;

export const setLenis = (instance) => {
    lenis = instance;
};

export const getLenis = () => lenis;

export const scrollToId = (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.5 });
    else el.scrollIntoView({ behavior: "smooth" });
};

export const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || "";
export const INSTAGRAM_URL =
    process.env.REACT_APP_INSTAGRAM_URL || "https://www.instagram.com/silversy_co";

export const whatsappLink = (message) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
