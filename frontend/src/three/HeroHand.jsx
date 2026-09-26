import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createHandRig, poseHand } from "./handRig";
import { IndexRing, RingFingerRing, TennisBracelet } from "./HandJewellery";

function Studio() {
    return <>
        <ambientLight intensity={0.38} />
        <directionalLight position={[-3, 5, 5]} intensity={2.6} castShadow
            shadow-mapSize={[1024, 1024]} shadow-bias={-0.0003} shadow-normalBias={0.012}
            shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} />
        <directionalLight position={[4, 1, 3]} intensity={0.8} color="#eef3ff" />
        <Environment resolution={256} frames={1}>
            <color attach="background" args={["#676a70"]} />
            <Lightformer intensity={4} position={[-3, 3, 4]} rotation={[0, -0.6, 0]} scale={[2, 6, 1]} />
            <Lightformer intensity={3} position={[4, 0, 3]} rotation={[0, 0.6, 0]} scale={[0.65, 6, 1]} />
            <Lightformer intensity={3} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[5, 3, 1]} />
            <Lightformer intensity={1.5} position={[0, -3, 5]} scale={[3, 0.7, 1]} />
        </Environment>
    </>;
}

function Mannequin({ progress, hostRef, onReady }) {
    const { scene } = useGLTF("/assets/hand/mannequin.glb");
    const rig = useMemo(() => createHandRig(scene), [scene]);
    const group = useRef();
    const current = useRef(0);
    const frames = useRef(0);
    const { camera, size, gl } = useThree();

    useEffect(() => {
        camera.zoom = size.height / 5.65;
        camera.updateProjectionMatrix();
    }, [camera, size]);
    useEffect(() => {
        // Keeps the actual scene inspectable in development without a separate demo route.
        if (process.env.NODE_ENV === "development") gl.domElement.__silversyRig = rig;
        return () => { delete gl.domElement.__silversyRig; rig.material.dispose(); };
    }, [gl, rig]);

    useFrame((_, delta) => {
        current.current = THREE.MathUtils.damp(current.current, progress.current, 10, Math.min(delta, 0.05));
        if (Math.abs(current.current - progress.current) < 0.0001) current.current = progress.current;
        const p = current.current;
        poseHand(rig, p);
        group.current.rotation.set(0.035 * p, -0.1 - p * 0.12, -0.055 + p * 0.035);
        group.current.position.y = p * 0.38;
        if (hostRef.current) hostRef.current.dataset.curlProgress = p.toFixed(3);
        frames.current += 1;
        if (frames.current === 3) onReady();
    });

    return <group ref={group}>
        <group position={[-0.12, -0.60, -0.75]} rotation={[0, Math.PI / 2, Math.PI]} scale={22}>
            <primitive object={rig.scene} dispose={null} />
            <mesh position={[0.0375, 0.105, 0.01]} scale={[0.65, 1, 1]} material={rig.material} castShadow receiveShadow>
                <cylinderGeometry args={[0.029, 0.0258, 0.09, 64]} />
            </mesh>
        </group>
        {createPortal(<IndexRing />, rig.index)}
        {createPortal(<RingFingerRing />, rig.ring)}
        {createPortal(<TennisBracelet />, rig.wrist)}
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
            gl.toneMappingExposure = 1.1;
        }}
        style={{ background: "transparent", pointerEvents: "none" }} aria-hidden="true">
        <ContextGuard onFailure={onFailure} />
        <Suspense fallback={null}>
            <Studio />
            <Mannequin progress={progress} hostRef={hostRef} onReady={onReady} />
        </Suspense>
    </Canvas>;
}
