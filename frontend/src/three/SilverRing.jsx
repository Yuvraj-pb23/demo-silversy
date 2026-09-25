import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";

function Ring({ progress }) {
    const group = useRef(null);
    useFrame((state, delta) => {
        const p = progress.current;
        if (group.current) {
            group.current.rotation.y += delta * 0.3;
            group.current.rotation.x = 0.42 + p * 0.55;
        }
        const targetZ = 4.8 - p * 1.5;
        state.camera.position.z += (targetZ - state.camera.position.z) * 0.08;
    });
    return (
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
            <group ref={group}>
                <mesh rotation={[Math.PI / 2.15, 0, 0]}>
                    <torusGeometry args={[1.18, 0.3, 64, 180]} />
                    <meshStandardMaterial
                        color="#f6f6f6"
                        metalness={1}
                        roughness={0.07}
                        envMapIntensity={2.2}
                    />
                </mesh>
                <mesh position={[0, 1.42, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.42, 0.3, 0.42]}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshPhysicalMaterial
                        color="#ffffff"
                        metalness={0}
                        roughness={0.01}
                        transmission={0.95}
                        thickness={0.5}
                        envMapIntensity={2.6}
                    />
                </mesh>
                <mesh position={[0, 1.22, 0]}>
                    <cylinderGeometry args={[0.16, 0.3, 0.22, 24]} />
                    <meshStandardMaterial color="#f0f0f0" metalness={1} roughness={0.1} envMapIntensity={2} />
                </mesh>
            </group>
        </Float>
    );
}

export default function SilverRing({ progress }) {
    return (
        <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.4, 4.8], fov: 40 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
            aria-hidden="true"
        >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 4, 5]} intensity={0.7} />
            <Ring progress={progress} />
            <Environment resolution={256}>
                <color attach="background" args={["#b9b4ac"]} />
                <Lightformer intensity={3.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
                <Lightformer intensity={2.6} position={[-5, 1, -1]} scale={[8, 3, 1]} />
                <Lightformer intensity={2.2} position={[5, 1, 0]} scale={[8, 3, 1]} />
                <Lightformer intensity={1.6} position={[0, 0, 5]} scale={[9, 4, 1]} color="#fff3e4" />
                <Lightformer intensity={1.4} position={[0, -4, 2]} rotation-x={-Math.PI / 3} scale={[9, 3, 1]} />
            </Environment>
        </Canvas>
    );
}
