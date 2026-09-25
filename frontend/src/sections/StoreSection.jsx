import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { Reveal, MaskedLines, ParallaxImage } from "@/components/Reveal";
import { IMAGES } from "@/data/products";
import { whatsappLink } from "@/utils/scroll";

const DIRECTIONS_URL =
    "https://www.google.com/maps/search/?api=1&query=SILVERSY%20Sirhind%20Punjab";

export default function StoreSection() {
    return (
        <section
            id="visit"
            data-testid="store-section"
            className="border-t border-line bg-sand px-5 py-24 md:px-14 md:py-40 lg:px-20"
        >
            <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
                <div className="order-2 md:order-1">
                    <p className="micro mb-6">09 — In Person</p>
                    <MaskedLines
                        lines={["VISIT", "SILVERSY"]}
                        className="font-serif text-5xl font-medium uppercase leading-[0.92] text-coal sm:text-6xl lg:text-7xl"
                    />
                    <Reveal delay={0.15}>
                        <p className="mt-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
                            <MapPin size={14} strokeWidth={1.75} />
                            Sirhind, Punjab
                        </p>
                        <p className="mt-5 max-w-md text-base leading-[1.85] text-body">
                            Discover the collection in person.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            <a
                                data-testid="directions-btn"
                                href={DIRECTIONS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pill-btn"
                            >
                                Get Directions
                                <ArrowRight size={14} strokeWidth={2} />
                            </a>
                            <a
                                data-testid="whatsapp-us-btn"
                                href={whatsappLink("Hi SILVERSY, I'd like to plan a visit to the store.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pill-btn-light"
                            >
                                <MessageCircle size={14} strokeWidth={2} />
                                WhatsApp Us
                            </a>
                        </div>
                    </Reveal>
                </div>
                <Reveal className="order-1 md:order-2">
                    <ParallaxImage
                        src={IMAGES.chainPendant}
                        alt="SILVERSY silver jewellery in soft store light"
                        className="aspect-[4/5] w-full md:aspect-[5/6]"
                        speed={36}
                    />
                </Reveal>
            </div>
        </section>
    );
}
