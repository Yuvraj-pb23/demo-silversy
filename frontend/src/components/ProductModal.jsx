import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Instagram, MessageCircle } from "lucide-react";
import { formatPrice } from "@/data/products";
import { getLenis, INSTAGRAM_URL, whatsappLink } from "@/utils/scroll";

export default function ProductModal({ product, onClose }) {
    useEffect(() => {
        if (!product) return undefined;
        const lenis = getLenis();
        lenis && lenis.stop();
        document.body.style.overflow = "hidden";
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => {
            lenis && lenis.start();
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [product, onClose]);

    return (
        <AnimatePresence>
            {product && (
                <motion.div
                    data-testid="product-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 backdrop-blur-sm md:items-center md:p-8"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${product.name} details`}
                >
                    <motion.div
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                        className="grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-y-auto border border-line bg-canvas md:grid-cols-2 md:overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative aspect-[4/5] bg-sand md:aspect-auto md:min-h-[560px]">
                            <img
                                src={product.image}
                                alt={`${product.name} — 92.5 sterling silver`}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        <div className="relative flex flex-col justify-center p-7 md:p-12">
                            <button
                                data-testid="modal-close-btn"
                                onClick={onClose}
                                aria-label="Close product details"
                                className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center text-ink"
                            >
                                <X size={20} strokeWidth={1.5} />
                            </button>
                            <p className="micro">{product.category}</p>
                            <h3 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">
                                {product.name}
                            </h3>
                            <p className="mt-5 text-sm leading-relaxed text-body">
                                {product.description}
                            </p>
                            <div className="mt-6 flex items-center gap-3">
                                <span className="border border-line px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-body">
                                    92.5 Sterling Silver
                                </span>
                                {product.isNew && (
                                    <span className="border border-line px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-body">
                                        New
                                    </span>
                                )}
                            </div>
                            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                                {formatPrice(product.price)}
                            </p>
                            <div className="mt-8 flex flex-col gap-3">
                                <a
                                    data-testid="whatsapp-enquire-btn"
                                    href={whatsappLink(
                                        `Hi SILVERSY, I'd love to enquire about the ${product.name}.`,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pill-btn justify-center"
                                >
                                    <MessageCircle size={14} strokeWidth={2} />
                                    Enquire on WhatsApp
                                </a>
                                <a
                                    data-testid="instagram-view-btn"
                                    href={INSTAGRAM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pill-btn-light justify-center"
                                >
                                    <Instagram size={14} strokeWidth={2} />
                                    View on Instagram
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
