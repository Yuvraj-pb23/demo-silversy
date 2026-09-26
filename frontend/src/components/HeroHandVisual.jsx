import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

const HeroHand = lazy(() => import("@/three/HeroHand"));

class HandBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch() { this.props.onFailure(); }
    render() { return this.state.failed ? null : this.props.children; }
}

export function HeroHandVisual({ progress, reduced }) {
    const hostRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);
    const [active, setActive] = useState(true);
    const onReady = useCallback(() => setReady(true), []);
    const onFailure = useCallback(() => setFailed(true), []);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
        observer.observe(hostRef.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => { setReady(false); }, [reduced]);
    const showCanvas = !reduced && !failed;
    const mode = reduced ? "still" : failed ? "fallback" : ready ? "3d" : "loading";
    return <div ref={hostRef} data-testid="hero-3d-hand" data-render-mode={mode}
        data-large-ring-finger="index" data-small-ring-finger="ring"
        role="img" aria-label="White 3D mannequin hand wearing a large emerald-cut ring on the index finger, a small solitaire on the ring finger, and a stone-set tennis bracelet"
        className="relative h-full w-full">
        <img data-testid="hero-hand-poster" src="/assets/hand/hero-hand-poster.png" alt=""
            aria-hidden="true" className={`absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2 transition-opacity duration-300 ${ready && showCanvas ? "opacity-0" : "opacity-100"}`} />
        {showCanvas && <HandBoundary onFailure={onFailure}>
            <Suspense fallback={null}>
                <HeroHand progress={progress} hostRef={hostRef} active={active} onReady={onReady} onFailure={onFailure} />
            </Suspense>
        </HandBoundary>}
    </div>;
}
