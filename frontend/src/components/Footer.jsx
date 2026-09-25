import { scrollToId, INSTAGRAM_URL, whatsappLink } from "@/utils/scroll";

const NAV = [
    { label: "HOME", target: "#top" },
    { label: "COLLECTION", target: "#collection" },
    { label: "ABOUT", target: "#about" },
    { label: "CONTACT", target: "#visit" },
];

const CATS = ["RINGS", "EARRINGS", "CHAINS", "BRACELETS", "KADA", "PAYAL"];

export default function Footer() {
    return (
        <footer data-testid="site-footer" className="border-t border-line bg-sand">
            <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-16 md:px-14 md:pt-24 lg:px-20">
                <button
                    data-testid="footer-brand"
                    onClick={() => scrollToId("#top")}
                    className="block text-left"
                    aria-label="Back to top"
                >
                    <span className="font-serif text-[16vw] font-medium uppercase leading-[0.8] tracking-[-0.02em] text-coal md:text-[11vw]">
                        Silversy<sup className="align-super text-[0.35em]">®</sup>
                    </span>
                    <span className="micro mt-4 block">The New Silver</span>
                </button>

                <div className="mt-14 grid grid-cols-2 gap-10 border-t border-line pt-12 md:mt-20 md:grid-cols-4">
                    <div>
                        <p className="micro mb-5">Navigation</p>
                        <ul className="space-y-3">
                            {NAV.map((item) => (
                                <li key={item.label}>
                                    <button
                                        data-testid={`footer-nav-${item.label.toLowerCase()}`}
                                        onClick={() => scrollToId(item.target)}
                                        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="micro mb-5">Categories</p>
                        <ul className="space-y-3">
                            {CATS.map((cat) => (
                                <li key={cat}>
                                    <button
                                        data-testid={`footer-cat-${cat.toLowerCase()}`}
                                        onClick={() => scrollToId("#collection")}
                                        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink"
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="micro mb-5">Social</p>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    data-testid="footer-instagram-link"
                                    href={INSTAGRAM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink"
                                >
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a
                                    data-testid="footer-whatsapp-link"
                                    href={whatsappLink("Hi SILVERSY!")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink"
                                >
                                    WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="micro mb-5">Studio</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] leading-loose text-ink">
                            92.5 Sterling Silver
                            <br />
                            Sirhind, Punjab
                            <br />
                            Since 2017
                        </p>
                    </div>
                </div>

                <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-20">
                    <p className="micro">© 2026 SILVERSY® — All rights reserved.</p>
                    <p className="micro">The New Silver</p>
                </div>
            </div>
        </footer>
    );
}
