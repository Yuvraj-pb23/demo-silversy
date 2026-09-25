import { ArrowUpRight } from "lucide-react";

export default function CategoryCard({ category, onSelect }) {
    return (
        <button
            data-testid={`category-card-${category.id}`}
            onClick={() => onSelect(category)}
            className={`group relative flex w-[68vw] shrink-0 snap-start flex-col border border-line bg-canvas text-left transition-colors duration-500 hover:border-silver md:w-auto ${category.span}`}
        >
            <div className="relative min-h-[220px] flex-1 overflow-hidden md:min-h-[240px]">
                <img
                    src={category.image}
                    alt={`SILVERSY ${category.name.toLowerCase()} in 92.5 sterling silver`}
                    loading="lazy"
                    className="card-img-zoom absolute inset-0 h-full w-full object-cover"
                />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
                <div>
                    <span className="font-serif text-xl uppercase leading-none text-ink md:text-2xl">
                        {category.name}
                    </span>
                    <span className="mt-1 block text-[11px] tracking-wide text-stone2">
                        {category.description}
                    </span>
                </div>
                <ArrowUpRight
                    size={18}
                    strokeWidth={1.5}
                    className="shrink-0 text-ink transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
            </div>
        </button>
    );
}
