import { Suspense, lazy, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedLines, Reveal } from "@/components/Reveal";
import { IMAGES } from "@/data/products";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);
const SilverRing = lazy(() => import("@/three/SilverRing"));

const canWebGL = () => {
    try {
        const c = document.createElement("canvas");
        return !!(
            window.WebGLRenderingContext &&
            (c.getContext("webgl") || c.getContext("experimental-webgl"))
        );
    } catch (e) {
        return false;
    }
};

const LABELS = ["925 SILVER", "SIGNATURE FORM", "CRAFTED DETAIL"];

export default function LookCloserSection() {
    const reduced = usePrefersReducedMotion();
    const sectionRef = useRef(null);
    const progress = useRef(0);
    const [webgl] = useState(canWebGL);
    const show3D = webgl && !reduced;

    useEffect(() => {
        if (!show3D) return undefined;
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                onUpdate: (self) => {
                    progress.current = self.progress;
                },
            });
        });
        return () => ctx.revert();
    }, [show3D]);

    return (
        <section
            ref={sectionRef}
            data-testid="look-closer-section"
            className="overflow-hidden bg-cream px-5 py-24 md:px-14 md:py-40 lg:px-20"
        >
            <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-10 md:grid-cols-12">
                <div className="order-2 md:order-1 md:col-span-5">
                    <p className="micro mb-6">05 — Detail Study</p>
                    <MaskedLines
                        lines={["LOOK", "CLOSER."]}
                        className="font-serif text-6xl font-medium uppercase leading-[0.9] text-coal sm:text-7xl lg:text-[7rem]"
                    />
                    <Reveal delay={0.15}>
                        <p className="mt-6 font-serif text-2xl italic text-body md:text-3xl">
                            Details matter.
                        </p>
                        <div className="mt-10 space-y-0 border-t border-line">
                            {LABELS.map((label, i) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between border-b border-line py-4"
                                >
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
                                        {label}
                                    </span>
                                    <span className="micro">0{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
                <div className="order-1 md:order-2 md:col-span-7">
                    <Reveal delay={0.1}>
                        <div
                            data-testid="look-closer-canvas"
                            className="relative h-[52vh] border border-line bg-canvas md:h-[72vh]"
                        >
                            {show3D ? (
                                <Suspense
                                    fallback={
                                        <img
                                            src={IMAGES.ringDetail}
                                            alt="Macro detail of a 92.5 sterling silver SILVERSY ring"
                                            className="h-full w-full object-cover"
                                        />
                                    }
                                >
                                    <SilverRing progress={progress} />
                                </Suspense>
                            ) : (
                                <img
                                    src={IMAGES.ringDetail}
                                    alt="Macro detail of a 92.5 sterling silver SILVERSY ring"
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            )}
                            <span className="micro absolute bottom-4 left-4 bg-cream/85 px-3 py-1.5 backdrop-blur-sm">
                                {show3D ? "Drag your scroll — the piece follows" : "92.5 Sterling Silver"}
                            </span>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
