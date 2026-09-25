import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/data/products";

export default function ProductCard({ product, onView, className = "" }) {
    return (
        <article
            data-testid={`product-card-${product.id}`}
            className={`group flex flex-col ${className}`}
        >
            <button
                onClick={() => onView(product)}
                aria-label={`View ${product.name}`}
                className="relative block overflow-hidden border border-line bg-canvas text-left transition-colors duration-500 hover:border-silver"
            >
                <div className="aspect-[4/5] overflow-hidden">
                    <img
                        src={product.image}
                        alt={`${product.name} — 92.5 sterling silver ${product.category.toLowerCase()} by SILVERSY`}
                        loading="lazy"
                        className="card-img-zoom h-full w-full object-cover"
                    />
                </div>
                {product.isNew && (
                    <span className="absolute left-4 top-4 border border-line bg-cream/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-ink backdrop-blur-sm">
                        New
                    </span>
                )}
            </button>
            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div>
                    <h3 className="font-serif text-lg leading-tight text-ink md:text-xl">
                        {product.name}
                    </h3>
                    <p className="micro mt-1.5">{product.category}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
                        {formatPrice(product.price)}
                    </p>
                </div>
                <button
                    data-testid={`product-view-btn-${product.id}`}
                    onClick={() => onView(product)}
                    className="text-link-arrow shrink-0 sm:mt-1"
                >
                    View Piece
                    <ArrowRight
                        size={13}
                        strokeWidth={2}
                        className="transition-transform duration-500 group-hover:translate-x-1"
                    />
                </button>
            </div>
        </article>
    );
}
