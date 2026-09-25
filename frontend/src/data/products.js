const U = (id, extra = "") => `https://images.unsplash.com/${id}?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000${extra}`;

export const IMAGES = {
    ringMacro: U("photo-1621311628038-01cd988520c2"),
    ringDetail: U("photo-1590703160323-ac5d3fc14089"),
    ringStudio: U("photo-1620135104013-1abdff4b1ca7"),
    earringDrop: U("photo-1611653842967-39eb011b2ca3"),
    earringHoop: U("photo-1535632066927-ab7c9ab60908"),
    chainModel: U("photo-1616294099799-dab525ec05c1"),
    chainPendant: U("photo-1599459183540-09f1fd687a2e"),
    braceletStack: U("photo-1605884878538-6468614df578"),
};

export const PRODUCTS = [
    {
        id: "aria-solitaire",
        name: "Aria Solitaire Ring",
        category: "Rings",
        price: null,
        image: IMAGES.ringMacro,
        description:
            "A sculptural 92.5 sterling silver solitaire — a single stone held in a clean, modern setting that catches light with every movement.",
        featured: true,
        isNew: true,
    },
    {
        id: "mira-drop-earrings",
        name: "Mira Drop Earrings",
        category: "Earrings",
        price: null,
        image: IMAGES.earringDrop,
        description:
            "Fluid drop earrings in 92.5 sterling silver, polished to a soft mirror finish — designed to move with you.",
        featured: true,
        isNew: false,
    },
    {
        id: "sia-curb-chain",
        name: "Sia Curb Chain",
        category: "Chains",
        price: null,
        image: IMAGES.chainModel,
        description:
            "A refined curb chain in 92.5 sterling silver — quiet alone, effortless layered.",
        featured: true,
        isNew: false,
    },
    {
        id: "vira-classic-kada",
        name: "Vira Classic Kada",
        category: "Kada",
        price: null,
        image: IMAGES.braceletStack,
        description:
            "The everyday kada, reinterpreted — a clean silver line with a hand-finished edge.",
        featured: true,
        isNew: true,
    },
    {
        id: "vera-band-ring",
        name: "Vera Band Ring",
        category: "Rings",
        price: null,
        image: IMAGES.ringStudio,
        description:
            "A wide, weightless band in high-polish 92.5 sterling silver — minimal, certain, yours.",
        featured: false,
        isNew: false,
    },
    {
        id: "noor-hoop-earrings",
        name: "Noor Hoop Earrings",
        category: "Earrings",
        price: null,
        image: IMAGES.earringHoop,
        description:
            "Classic hoops with a softened profile — light on the ear, strong on presence.",
        featured: false,
        isNew: false,
    },
    {
        id: "tara-pendant-chain",
        name: "Tara Pendant Chain",
        category: "Chains",
        price: null,
        image: IMAGES.chainPendant,
        description:
            "A delicate pendant on a fine silver chain — a small detail that holds the whole look.",
        featured: false,
        isNew: false,
    },
    {
        id: "luna-line-bracelet",
        name: "Luna Line Bracelet",
        category: "Bracelets",
        price: null,
        image: IMAGES.ringDetail,
        description:
            "A precise line of silver around the wrist — engineered for everyday, finished for evening.",
        featured: false,
        isNew: true,
    },
];

export const formatPrice = (price) =>
    price == null ? "PRICE ON REQUEST" : `₹ ${price.toLocaleString("en-IN")}`;
