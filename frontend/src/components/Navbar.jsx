import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, Instagram, MessageCircle } from "lucide-react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { scrollToId, getLenis, INSTAGRAM_URL, whatsappLink } from "@/utils/scroll";

const MENU_LINKS = [
    { label: "HOME", target: "#top" },
    { label: "COLLECTION", target: "#collection" },
    { label: "SIGNATURE", target: "#signature" },
    { label: "ABOUT", target: "#about" },
    { label: "VISIT US", target: "#visit" },
];

export default function Navbar() {
    const reduced = usePrefersReducedMotion();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const lenis = getLenis();
        if (open) lenis && lenis.stop();
        else lenis && lenis.start();
    }, [open]);

    const go = (target) => {
        setOpen(false);
        setTimeout(() => scrollToId(target), 60);
    };

    return (
        <>
            <header
                id="site-nav"
                data-testid="site-nav"
                className={`fixed top-0 inset-x-0 z-50 ${reduced ? "" : "opacity-0"}`}
            >
                <div className="border-b border-line bg-canvas/85 backdrop-blur-md">
                    <nav className="mx-auto grid h-16 md:h-20 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-10">
                        <div className="flex items-center">
                            <button
                                data-testid="nav-menu-btn"
                                onClick={() => setOpen(true)}
                                aria-label="Open menu"
                                className="flex min-h-[44px] items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink"
                            >
                                <Menu size={18} strokeWidth={1.5} />
                                <span className="hidden sm:inline">Menu</span>
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <button
                                id="nav-logo"
                                data-testid="nav-logo"
                                onClick={() => go("#top")}
                                aria-label="SILVERSY — back to top"
                                className={reduced ? "" : "opacity-0"}
                            >
                                <img
                                    src="/assets/logo-mark.png"
                                    alt="SILVERSY® — The New Silver"
                                    className="h-9 w-auto md:h-11"
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                                data-testid="nav-search-btn"
                                aria-label="Search the collection"
                                onClick={() => go("#signature")}
                                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink"
                            >
                                <Search size={18} strokeWidth={1.5} />
                            </button>
                            <a
                                data-testid="nav-instagram-link"
                                href={INSTAGRAM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="SILVERSY on Instagram"
                                className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-ink sm:flex"
                            >
                                <Instagram size={18} strokeWidth={1.5} />
                            </a>
                            <a
                                data-testid="nav-whatsapp-link"
                                href={whatsappLink("Hi SILVERSY, I'd love to know more about the collection.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Chat with SILVERSY on WhatsApp"
                                className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-ink sm:flex"
                            >
                                <MessageCircle size={18} strokeWidth={1.5} />
                            </a>
                        </div>
                    </nav>
                </div>
            </header>

            <AnimatePresence>
                {open && (
                    <motion.div
                        data-testid="mobile-menu-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="fixed inset-0 z-[70] flex flex-col bg-cream"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu"
                    >
                        <div className="flex h-16 md:h-20 items-center justify-between border-b border-line px-4 md:px-10">
                            <span className="micro">Silversy® — Menu</span>
                            <button
                                data-testid="mobile-menu-close"
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                                className="flex min-h-[44px] min-w-[44px] items-center justify-center"
                            >
                                <X size={22} strokeWidth={1.5} />
                            </button>
                        </div>
                        <nav className="flex flex-1 flex-col justify-center gap-1 px-6 md:px-14">
                            {MENU_LINKS.map((link, i) => (
                                <motion.button
                                    key={link.label}
                                    data-testid={`menu-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                                    initial={reduced ? false : { opacity: 0, y: 26 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                                    onClick={() => go(link.target)}
                                    className="group flex items-baseline gap-4 py-2 text-left"
                                >
                                    <span className="micro w-8">0{i + 1}</span>
                                    <span className="font-serif text-5xl uppercase leading-none text-coal transition-transform duration-500 group-hover:translate-x-2 md:text-7xl">
                                        {link.label}
                                    </span>
                                </motion.button>
                            ))}
                        </nav>
                        <div className="flex items-center justify-between border-t border-line px-6 py-5 md:px-14">
                            <span className="micro">The New Silver</span>
                            <div className="flex gap-6">
                                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="micro text-ink" data-testid="menu-instagram-link">
                                    Instagram
                                </a>
                                <a href={whatsappLink("Hi SILVERSY!")} target="_blank" rel="noopener noreferrer" className="micro text-ink" data-testid="menu-whatsapp-link">
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
