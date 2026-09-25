import { Reveal, MaskedLines } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

const LAYOUT = [
    "md:col-span-5",
    "md:col-span-4 md:mt-28",
    "md:col-span-4 md:-mt-14",
    "md:col-span-5 md:mt-10",
];

export default function SignatureSection({ onView }) {
    const featured = PRODUCTS.filter((p) => p.featured);
    return (
        <section
            id="signature"
            data-testid="signature-section"
            className="border-t border-line bg-sand px-5 py-24 md:px-14 md:py-40 lg:px-20"
        >
            <div className="mx-auto max-w-[1500px]">
                <p className="micro mb-6">04 — Signature</p>
                <MaskedLines
                    lines={["SIGNATURE", "PIECES"]}
                    className="font-serif text-5xl font-medium uppercase leading-[0.92] text-coal sm:text-6xl lg:text-[5.5rem]"
                />
                <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-24 md:grid-cols-9">
                    {featured.map((product, i) => (
                        <Reveal key={product.id} delay={i * 0.08} className={LAYOUT[i % LAYOUT.length]}>
                            <ProductCard product={product} onView={onView} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
