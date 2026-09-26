import { useEffect, useRef } from "react";
import { HeroHandVisual } from "@/components/HeroHandVisual";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { scrollToId } from "@/utils/scroll";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const HERO_CATS = ["RINGS", "EARRINGS", "CHAINS", "BRACELETS", "KADA", "PAYAL"];

export default function Hero() {
    const reduced = usePrefersReducedMotion();
    const rootRef = useRef(null);
    const progress = useRef(0);
    const wrapRef = useRef(null);
    const mastRef = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const sinceRef = useRef(null);
    const hintRef = useRef(null);

    useEffect(() => {
        if (reduced) return undefined;

        const ctx = gsap.context(() => {
            const mast = mastRef.current;
            const dyFn = () => {
                const centerY = mast.offsetTop + mast.offsetHeight / 2;
                const targetY = window.innerWidth < 768 ? 33 : 40;
                return targetY - centerY;
            };
            const scaleFn = () => {
                const targetH = window.innerWidth < 768 ? 13 : 17;
                return targetH / mast.offsetHeight;
            };

            const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: "top top",
                    end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 768 ? 1.9 : 2.6))}`,
                    scrub: 0.5,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        progress.current = self.progress;
                    },
                },
            });

            tl.set("#site-nav", { autoAlpha: 0, y: -14 }, 0);
            tl.set("#nav-logo", { autoAlpha: 0, scale: 0.92 }, 0);
            tl.to(wrapRef.current, { scale: 1.045, duration: 0.62 }, 0);
            tl.to(leftRef.current, { y: -46, autoAlpha: 0, duration: 0.26, ease: "power1.in" }, 0.3);
            tl.to(rightRef.current, { y: -64, autoAlpha: 0, duration: 0.26, ease: "power1.in" }, 0.32);
            tl.to([sinceRef.current, hintRef.current], { autoAlpha: 0, duration: 0.18 }, 0.34);
            tl.to(mast, { y: dyFn, scale: scaleFn, duration: 0.38, ease: "power2.inOut" }, 0.58);
            tl.to("#site-nav", { autoAlpha: 1, y: 0, duration: 0.1, ease: "power1.out" }, 0.88);
            tl.to("#nav-logo", { autoAlpha: 1, scale: 1, duration: 0.1, ease: "power1.out" }, 0.9);
            tl.to(mast, { autoAlpha: 0, duration: 0.07 }, 0.93);
        });

        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => ScrollTrigger.refresh());
        }

        return () => {
            window.removeEventListener("load", onLoad);
            progress.current = 0;
            ctx.revert();
        };
    }, [reduced]);

    return (
        <section
            ref={rootRef}
            id="top"
            data-testid="hero-section"
            className="relative h-[100svh] overflow-hidden bg-cream"
            aria-label="SILVERSY — The New Silver"
        >
            {/* Giant masthead — the brand identity before the logo */}
            <div
                ref={mastRef}
                data-testid="hero-masthead"
                className="pointer-events-none absolute inset-x-0 top-[12%] z-[1] select-none text-center will-change-transform md:top-[10%]"
            >
                <h1 className="whitespace-nowrap font-serif text-[20vw] font-medium uppercase leading-[0.85] tracking-[-0.02em] text-coal md:text-[17.5vw]">
                    Silversy
                </h1>
            </div>

            {/* Opaque 3D anatomy naturally occludes the masthead; only the wrist edge fades. */}
            <div
                className="pointer-events-none absolute inset-x-0 top-[16%] z-[2] flex justify-center md:top-[12%]"
                style={{
                    WebkitMaskImage: "linear-gradient(to bottom, black 94%, transparent 100%)",
                    maskImage: "linear-gradient(to bottom, black 94%, transparent 100%)",
                }}
            >
                <div ref={wrapRef} className="h-[52vh] w-full max-w-[1060px] will-change-transform md:h-[74vh]">
                    <HeroHandVisual progress={progress} reduced={reduced} />
                </div>
            </div>

            {/* Left editorial block */}
            <div
                ref={leftRef}
                className="absolute inset-x-0 bottom-[10%] z-[3] flex flex-col items-center px-6 text-center md:inset-x-auto md:bottom-auto md:left-12 md:top-[36%] md:max-w-[300px] md:items-start md:px-0 md:text-left lg:left-16"
            >
                <h2 className="font-serif text-3xl font-medium uppercase leading-[0.95] text-coal md:text-[3.4rem]">
                    The New
                    <br />
                    Silver
                </h2>
                <p className="micro mt-4 text-ink">92.5 Sterling Silver Jewellery</p>
                <p className="mt-3 hidden text-sm leading-relaxed text-body md:block">
                    Modern designs, timeless craftsmanship. Pieces that stay with you.
                </p>
                <button
                    data-testid="hero-explore-btn"
                    onClick={() => scrollToId("#collection")}
                    className="pill-btn mt-6"
                >
                    Explore Collection
                    <ArrowRight size={14} strokeWidth={2} />
                </button>
            </div>

            {/* Right editorial column */}
            <div
                ref={rightRef}
                className="absolute right-12 top-[32%] z-[3] hidden w-[240px] lg:block xl:right-16"
            >
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] leading-[1.9] text-ink">
                    More than
                    <br />
                    jewellery
                    <br />a story
                </p>
                <div className="my-5 h-px w-10 bg-ink/30" />
                <ul className="divide-y divide-line border-y border-line">
                    {HERO_CATS.map((cat) => (
                        <li key={cat}>
                            <button
                                data-testid={`hero-category-link-${cat.toLowerCase()}`}
                                onClick={() => scrollToId("#collection")}
                                className="group flex w-full items-center justify-between py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink"
                            >
                                {cat}
                                <ArrowUpRight
                                    size={13}
                                    strokeWidth={1.75}
                                    className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Since badge */}
            <div ref={sinceRef} className="absolute bottom-6 left-5 z-[3] md:bottom-8 md:left-12 lg:left-16">
                <span className="micro text-ink" data-testid="hero-since-badge">
                    [ Since 2017 ]
                </span>
            </div>

            {/* Scroll hint */}
            <div
                ref={hintRef}
                className="absolute bottom-6 left-1/2 z-[3] hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
                aria-hidden="true"
            >
                <span className="micro">Scroll</span>
                <span className="scroll-hint-line" />
            </div>
        </section>
    );
}
