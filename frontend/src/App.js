import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "@/index.css";
import { setLenis } from "@/utils/scroll";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Footer from "@/components/Footer";
import ProductModal from "@/components/ProductModal";
import AboutSection from "@/sections/AboutSection";
import Silver925Section from "@/sections/Silver925Section";
import CategoriesSection from "@/sections/CategoriesSection";
import SignatureSection from "@/sections/SignatureSection";
import LookCloserSection from "@/sections/LookCloserSection";
import CraftSection from "@/sections/CraftSection";
import MostLovedSection from "@/sections/MostLovedSection";
import InstagramSection from "@/sections/InstagramSection";
import StoreSection from "@/sections/StoreSection";
import FinalCTA from "@/sections/FinalCTA";

gsap.registerPlugin(ScrollTrigger);

function App() {
    const [activeProduct, setActiveProduct] = useState(null);

    useEffect(() => {
        const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
        setLenis(lenis);
        window.__lenis = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        return () => {
            gsap.ticker.remove(raf);
            lenis.destroy();
            setLenis(null);
        };
    }, []);

    return (
        <div className="bg-cream text-ink">
            <Navbar />
            <main>
                <Hero />
                <Marquee />
                <AboutSection />
                <Silver925Section />
                <CategoriesSection />
                <SignatureSection onView={setActiveProduct} />
                <LookCloserSection />
                <CraftSection />
                <MostLovedSection onView={setActiveProduct} />
                <InstagramSection />
                <StoreSection />
                <FinalCTA />
            </main>
            <Footer />
            <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
        </div>
    );
}

export default App;
