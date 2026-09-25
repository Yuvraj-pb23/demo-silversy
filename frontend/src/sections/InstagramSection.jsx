import { Instagram, ArrowRight } from "lucide-react";
import { Reveal, MaskedLines } from "@/components/Reveal";
import { IMAGES } from "@/data/products";
import { INSTAGRAM_URL } from "@/utils/scroll";

const TILES = [
    { src: IMAGES.ringStudio, alt: "Silver ring still life from the SILVERSY world", span: "row-span-2" },
    { src: IMAGES.earringHoop, alt: "Silver hoop earrings editorial shot", span: "" },
    { src: IMAGES.chainModel, alt: "Silver chain worn editorial style", span: "" },
    { src: IMAGES.ringMacro, alt: "Macro of sterling silver ring", span: "" },
    { src: IMAGES.braceletStack, alt: "Silver bracelet stack detail", span: "row-span-2" },
    { src: IMAGES.chainPendant, alt: "Silver pendant chain detail", span: "" },
];

export default function InstagramSection() {
    return (
        <section
            id="world"
            data-testid="instagram-section"
            className="border-t border-line bg-canvas px-5 py-24 md:px-14 md:py-40 lg:px-20"
        >
            <div className="mx-auto max-w-[1500px]">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="micro mb-6">08 — Instagram</p>
                        <MaskedLines
                            lines={["THE SILVERSY", "WORLD"]}
                            className="font-serif text-5xl font-medium uppercase leading-[0.92] text-coal sm:text-6xl lg:text-7xl"
                        />
                    </div>
                    <Reveal delay={0.2}>
                        <a
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="micro flex items-center gap-2 text-ink"
                            data-testid="instagram-handle-link"
                        >
                            <Instagram size={14} strokeWidth={1.75} />
                            @silversy_co
                        </a>
                    </Reveal>
                </div>
                <div className="mt-14 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:mt-20 md:auto-rows-[240px] md:grid-cols-4 md:gap-4">
                    {TILES.map((tile, i) => (
                        <Reveal key={tile.src + i} delay={(i % 4) * 0.06} className={tile.span}>
                            <a
                                href={INSTAGRAM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`instagram-tile-${i}`}
                                className="group relative block h-full w-full overflow-hidden border border-line"
                                aria-label={`Open SILVERSY Instagram — ${tile.alt}`}
                            >
                                <img
                                    src={tile.src}
                                    alt={tile.alt}
                                    loading="lazy"
                                    className="card-img-zoom h-full w-full object-cover"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25">
                                    <Instagram
                                        size={22}
                                        strokeWidth={1.5}
                                        className="text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    />
                                </span>
                            </a>
                        </Reveal>
                    ))}
                </div>
                <Reveal className="mt-12 flex justify-center" delay={0.1}>
                    <a
                        data-testid="instagram-follow-btn"
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-btn"
                    >
                        Follow @silversy_co
                        <ArrowRight size={14} strokeWidth={2} />
                    </a>
                </Reveal>
            </div>
        </section>
    );
}
