import { ArrowRight } from "lucide-react";
import { Reveal, MaskedLines, ParallaxImage } from "@/components/Reveal";
import { IMAGES } from "@/data/products";
import { scrollToId } from "@/utils/scroll";

export default function AboutSection() {
    return (
        <section id="about" data-testid="about-section" className="bg-cream px-5 py-24 md:px-14 md:py-40 lg:px-20">
            <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-7">
                    <p className="micro mb-6">01 — About Silversy</p>
                    <MaskedLines
                        lines={["MORE THAN", "JEWELLERY."]}
                        className="font-serif text-5xl font-medium uppercase leading-[0.92] tracking-[-0.01em] text-coal sm:text-6xl lg:text-[6.5rem]"
                    />
                </div>
                <div className="flex flex-col justify-end md:col-span-5">
                    <Reveal delay={0.15}>
                        <p className="max-w-md text-base leading-[1.85] text-body md:text-lg">
                            At Silversy, jewellery is more than an accessory. It is a reflection of
                            identity, expression and the moments we choose to remember.
                        </p>
                        <p className="mt-5 max-w-md text-sm leading-[1.85] text-stone2">
                            Designed in 92.5 sterling silver — modern forms, finished by hand, made to
                            stay with you.
                        </p>
                        <button
                            data-testid="about-story-btn"
                            onClick={() => scrollToId("#craft")}
                            className="text-link-arrow group mt-8"
                        >
                            Our Story
                            <ArrowRight size={14} strokeWidth={2} className="transition-transform duration-500 group-hover:translate-x-1" />
                        </button>
                    </Reveal>
                </div>
            </div>
            <Reveal className="mx-auto mt-16 max-w-[1500px] md:mt-24" delay={0.1}>
                <ParallaxImage
                    src={IMAGES.earringDrop}
                    alt="Editorial SILVERSY silver jewellery lifestyle portrait"
                    className="aspect-[4/5] w-full md:aspect-[21/9]"
                    speed={48}
                />
            </Reveal>
        </section>
    );
}
