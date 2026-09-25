import { Reveal, MaskedLines } from "@/components/Reveal";
import CategoryCard from "@/components/CategoryCard";
import { CATEGORIES } from "@/data/categories";
import { scrollToId } from "@/utils/scroll";

export default function CategoriesSection() {
    return (
        <section
            id="collection"
            data-testid="collection-section"
            className="bg-cream py-24 md:py-40"
        >
            <div className="mx-auto max-w-[1500px] px-5 md:px-14 lg:px-20">
                <p className="micro mb-6">03 — Categories</p>
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <MaskedLines
                        lines={["EXPLORE THE", "COLLECTION"]}
                        className="font-serif text-5xl font-medium uppercase leading-[0.92] text-coal sm:text-6xl lg:text-7xl"
                    />
                    <Reveal delay={0.2}>
                        <p className="max-w-xs text-sm leading-relaxed text-stone2">
                            Seven families of 92.5 sterling silver — each designed to be worn every
                            day, kept for years.
                        </p>
                    </Reveal>
                </div>
            </div>
            <Reveal className="mt-12 md:mt-20" delay={0.1}>
                <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:grid md:auto-rows-[250px] md:grid-cols-6 md:gap-5 md:overflow-visible md:px-14 lg:px-20">
                    {CATEGORIES.map((cat) => (
                        <CategoryCard key={cat.id} category={cat} onSelect={() => scrollToId("#signature")} />
                    ))}
                </div>
            </Reveal>
        </section>
    );
}
