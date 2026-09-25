const ITEMS = ["THE NEW SILVER", "92.5 STERLING SILVER", "SILVERSY®", "SINCE 2017"];

export default function Marquee() {
    const row = [...ITEMS, ...ITEMS, ...ITEMS];
    return (
        <div
            data-testid="editorial-marquee"
            aria-hidden="true"
            className="overflow-hidden border-y border-line bg-canvas py-5 md:py-7"
        >
            <div className="marquee-track flex w-max items-center whitespace-nowrap">
                {[0, 1].map((half) => (
                    <div key={half} className="flex items-center">
                        {row.map((item, i) => (
                            <span key={`${half}-${i}`} className="flex items-center">
                                <span className="px-6 font-serif text-2xl uppercase tracking-wide text-coal/50 md:px-10 md:text-4xl">
                                    {item}
                                </span>
                                <span className="text-sm text-silver">✦</span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
