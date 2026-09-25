import { ArrowRight } from "lucide-react";
import { Reveal, MaskedLines, ParallaxImage } from "@/components/Reveal";
import { IMAGES } from "@/data/products";
import { scrollToId } from "@/utils/scroll";

export default function CraftSection() {
    return (
        <section
            id="craft"
            data-testid="craft-section"
            className="border-y border-line bg-sand px-5 py-24 md:px-14 md:py-40 lg:px-20"
        >
            <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
                <Reveal>
                    <ParallaxImage
                        src={IMAGES.ringDetail}
                        alt="Macro close-up of a 92.5 sterling silver SILVERSY ring showing crafted detail"
                        className="aspect-[4/5] w-full"
                        speed={36}
                    />
                </Reveal>
                <div>
                    <p className="micro mb-6">06 — Craft</p>
                    <MaskedLines
                        lines={["THE ART", "OF DETAIL"]}
                        className="font-serif text-5xl font-medium uppercase leading-[0.92] text-coal sm:text-6xl lg:text-7xl"
                    />
                    <Reveal delay={0.15}>
                        <p className="mt-8 max-w-md text-base leading-[1.85] text-body md:text-lg">
                            Every piece should balance presence and simplicity — jewellery designed
                            to complement the person wearing it.
                        </p>
                        <button
                            data-testid="craft-discover-btn"
                            onClick={() => scrollToId("#collection")}
                            className="pill-btn mt-10"
                        >
                            Discover the Collection
                            <ArrowRight size={14} strokeWidth={2} />
                        </button>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
