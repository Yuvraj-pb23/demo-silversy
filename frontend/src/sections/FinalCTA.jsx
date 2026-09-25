import { ArrowRight, Instagram } from "lucide-react";
import { Reveal, MaskedLines } from "@/components/Reveal";
import { IMAGES } from "@/data/products";
import { scrollToId, INSTAGRAM_URL } from "@/utils/scroll";

export default function FinalCTA() {
    return (
        <section
            data-testid="final-cta-section"
            className="relative overflow-hidden border-t border-line bg-cream px-5 py-28 md:px-14 md:py-48 lg:px-20"
        >
            <img
                src={IMAGES.ringMacro}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="pointer-events-none absolute -right-24 top-1/2 hidden w-[46vw] -translate-y-1/2 select-none opacity-30 mix-blend-multiply lg:block"
            />
            <div className="relative mx-auto max-w-[1500px]">
                <p className="micro mb-8">10 — Begin</p>
                <MaskedLines
                    lines={["FIND YOUR", "SIGNATURE", "PIECE."]}
                    className="font-serif text-6xl font-medium uppercase leading-[0.9] text-coal sm:text-7xl lg:text-[8rem]"
                />
                <Reveal delay={0.25}>
                    <p className="mt-8 max-w-md text-base leading-[1.85] text-body md:text-lg">
                        Discover the world of 92.5 sterling silver jewellery.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-3">
                        <button
                            data-testid="final-explore-btn"
                            onClick={() => scrollToId("#collection")}
                            className="pill-btn"
                        >
                            Explore Collection
                            <ArrowRight size={14} strokeWidth={2} />
                        </button>
                        <a
                            data-testid="final-instagram-btn"
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pill-btn-light"
                        >
                            <Instagram size={14} strokeWidth={2} />
                            Follow on Instagram
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
