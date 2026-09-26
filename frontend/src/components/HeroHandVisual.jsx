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
    const [posterMounted, setPosterMounted] = useState(true);
    const [failed, setFailed] = useState(false);
    const [active, setActive] = useState(true);
    const onReady = useCallback(() => setReady(true), []);
    const onFailure = useCallback(() => setFailed(true), []);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
        observer.observe(hostRef.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => { setReady(false); setPosterMounted(true); }, [reduced]);
    // Fully unmount the poster after its crossfade so it can never occlude the live canvas.
    useEffect(() => {
        if (!ready || failed || reduced) {
            setPosterMounted(true);
            return undefined;
        }
        const timer = setTimeout(() => setPosterMounted(false), 480);
        return () => clearTimeout(timer);
    }, [ready, failed, reduced]);
    const showCanvas = !reduced && !failed;
    const posterHidden = ready && showCanvas;
    const mode = reduced ? "still" : failed ? "fallback" : ready ? "3d" : "loading";
    return <div ref={hostRef} data-testid="hero-3d-hand" data-render-mode={mode}
        data-large-ring-finger="index" data-small-ring-finger="ring" data-hand-details="fitted-nails-sculpted-knuckles"
        role="img" aria-label="White 3D hand with visible fingernails and knuckle creases, wearing a silver emerald-cut diamond ring on the index finger, a smaller diamond solitaire on the ring finger, and a silver diamond tennis bracelet"
        className="relative h-full w-full">
        {posterMounted && <img data-testid="hero-hand-poster" src="/assets/hand/hero-hand-poster.png" alt=""
            aria-hidden="true"
            style={{ opacity: posterHidden ? 0 : 1, pointerEvents: "none", transition: "opacity 400ms ease", zIndex: 0 }}
            className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2" />}
        {showCanvas && <HandBoundary onFailure={onFailure}>
            <Suspense fallback={null}>
                <HeroHand progress={progress} hostRef={hostRef} active={active} onReady={onReady} onFailure={onFailure} />
            </Suspense>
        </HandBoundary>}
    </div>;
}
