import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createHandRig, poseHand } from "./handRig";
import { IndexRing, RingFingerRing, TennisBracelet } from "./HandJewellery";

const HAND_MODEL = "/assets/hand/mannequin.glb";
// Preload at module scope so the fetch is not tied to a mounting component.
// This avoids the StrictMode double-mount abort race that leaves Suspense pending.
useGLTF.preload(HAND_MODEL);

function Studio() {
    return <>
        <ambientLight intensity={0.28} />
        <directionalLight position={[-3, 4, 5]} intensity={2.1} castShadow
            shadow-mapSize={[2048, 2048]} shadow-bias={-0.00015} shadow-normalBias={0.002}
            shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
        <directionalLight position={[4, 0, 2]} intensity={0.45} color="#f2f5ff" />
        <Environment resolution={512} frames={1}>
            <color attach="background" args={["#44484e"]} />
            <Lightformer intensity={3.2} position={[-3, 4, 5]} scale={[3, 5]} />
            <Lightformer intensity={4} position={[4, 0, 2]} scale={[0.55, 6]} />
            <Lightformer intensity={2.5} position={[0, 6, -3]} scale={[5, 3]} />
            <Lightformer intensity={0.7} position={[-4, -2, -1]} scale={[6, 5]} />
            <Lightformer intensity={1.1} position={[0, -2, 5]} scale={[4, 2]} />
            <Lightformer color="#080a0d" intensity={1} position={[0.6, 0.5, 4]} scale={[0.9, 4]} />
            <Lightformer intensity={3} position={[2, 2, -4]} scale={[1.5, 3]} />
            <Lightformer intensity={2} position={[-2, -3, -4]} scale={[2, 1]} />
        </Environment>
    </>;
}

function Mannequin({ progress, hostRef, onReady }) {
    const { scene } = useGLTF(HAND_MODEL);
    const rig = useMemo(() => createHandRig(scene), [scene]);
    const group = useRef();
    const current = useRef(0);
    const signalled = useRef(false);
    const [environment, setEnvironment] = useState(null);
    const { camera, size, gl, scene: world } = useThree();

    useEffect(() => {
        camera.zoom = size.height / 5.65;
        camera.updateProjectionMatrix();
    }, [camera, size]);
    useEffect(() => {
        // Keeps the actual scene inspectable in development without a separate demo route.
        if (process.env.NODE_ENV === "development") gl.domElement.__silversyRig = rig;
        return () => { delete gl.domElement.__silversyRig; rig.material.dispose(); };
    }, [gl, rig]);
    // Mannequin only mounts after the GLB resolves (Suspense). Signalling ready from
    // the first render frame is deterministic (useFrame provably runs) and lets the
    // poster crossfade out; a StrictMode-cancelled rAF effect proved unreliable here.
    useFrame((_, delta) => {
        current.current = THREE.MathUtils.damp(current.current, progress.current, 10, Math.min(delta, 0.05));
        if (Math.abs(current.current - progress.current) < 0.0001) current.current = progress.current;
        const p = current.current;
        poseHand(rig, p);
        group.current.rotation.set(0.035 * p, -0.1 - p * 0.12, -0.055 + p * 0.035);
        group.current.position.y = p * 0.38;
        if (hostRef.current) hostRef.current.dataset.curlProgress = p.toFixed(3);
        if (world.environment && world.environment !== environment) setEnvironment(world.environment);
        if (!signalled.current && environment) { signalled.current = true; onReady(); }
    });

    return <group ref={group}>
        <group position={[-0.12, -0.60, -0.75]} rotation={[0, Math.PI / 2, Math.PI]} scale={22}>
            <primitive object={rig.scene} dispose={null} />
            <mesh position={[0.0375, 0.105, 0.01]} scale={[0.65, 1, 1]} material={rig.material} castShadow receiveShadow>
                <cylinderGeometry args={[0.029, 0.0258, 0.09, 64]} />
            </mesh>
        </group>
        {createPortal(<IndexRing environment={environment} />, rig.index)}
        {createPortal(<RingFingerRing environment={environment} />, rig.ring)}
        {createPortal(<TennisBracelet environment={environment} />, rig.wrist)}
    </group>;
}

function ContextGuard({ onFailure }) {
    const { gl } = useThree();
    useEffect(() => {
        const lost = (event) => { event.preventDefault(); onFailure(); };
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", lost);
        return () => canvas.removeEventListener("webglcontextlost", lost);
    }, [gl, onFailure]);
    return null;
}

export default function HeroHand({ progress, hostRef, active, onReady, onFailure }) {
    return <Canvas orthographic shadows dpr={[1, 2]} frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 10], zoom: 100, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1;
            gl.shadowMap.type = THREE.PCFShadowMap;
        }}
        style={{ background: "transparent", pointerEvents: "none", position: "relative", zIndex: 1 }} aria-hidden="true">
        <ContextGuard onFailure={onFailure} />
        <Suspense fallback={null}>
            <Studio />
            <Mannequin progress={progress} hostRef={hostRef} onReady={onReady} />
        </Suspense>
    </Canvas>;
}
