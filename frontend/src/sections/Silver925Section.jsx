import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal, MaskedLines } from "@/components/Reveal";

const PILLARS = ["PURITY", "CRAFT", "TIMELESS DESIGN"];

export default function Silver925Section() {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [60, -60]);

    return (
        <section
            ref={ref}
            data-testid="silver925-section"
            className="relative overflow-hidden border-y border-line bg-canvas px-5 py-24 text-center md:py-40"
        >
            <p className="micro mb-4">02 — The Standard</p>
            <div className="relative">
                <motion.span
                    style={{ y }}
                    aria-hidden="true"
                    className="text-shimmer pointer-events-none block select-none font-serif text-[42vw] font-semibold leading-[0.8] md:text-[26vw]"
                >
                    925
                </motion.span>
                <div className="relative z-[1] -mt-[6vw] md:-mt-[4vw]">
                    <MaskedLines
                        lines={["CRAFTED IN 925"]}
                        className="font-serif text-4xl font-medium uppercase tracking-[-0.01em] text-coal sm:text-5xl lg:text-6xl"
                    />
                    <Reveal delay={0.2}>
                        <p className="micro mt-5 text-ink">92.5 Sterling Silver</p>
                    </Reveal>
                </div>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3 md:mt-24">
                {PILLARS.map((pillar, i) => (
                    <Reveal key={pillar} delay={i * 0.1} className="bg-canvas px-6 py-8">
                        <span className="micro block text-ink">0{i + 1}</span>
                        <span className="mt-3 block font-serif text-xl uppercase tracking-wide text-coal md:text-2xl">
                            {pillar}
                        </span>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
