import { Reveal, MaskedLines } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

export default function MostLovedSection({ onView }) {
    return (
        <section
            data-testid="most-loved-section"
            className="bg-cream px-5 py-24 md:px-14 md:py-40 lg:px-20"
        >
            <div className="mx-auto max-w-[1500px]">
                <p className="micro mb-6">07 — Most Loved</p>
                <MaskedLines
                    lines={["MOST LOVED", "CREATIONS"]}
                    className="font-serif text-5xl font-medium uppercase leading-[0.92] text-coal sm:text-6xl lg:text-7xl"
                />
                <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-24 md:grid-cols-4 md:gap-x-6">
                    {PRODUCTS.map((product, i) => (
                        <Reveal key={product.id} delay={(i % 4) * 0.07}>
                            <ProductCard product={product} onView={onView} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
