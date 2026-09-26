import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function cutGeometry(emerald) {
    const outline = emerald
        ? [[-0.36, -0.5], [0.36, -0.5], [0.5, -0.36], [0.5, 0.36], [0.36, 0.5], [-0.36, 0.5], [-0.5, 0.36], [-0.5, -0.36]]
        : Array.from({ length: 16 }, (_, i) => [Math.cos(i * Math.PI / 8) * 0.5, Math.sin(i * Math.PI / 8) * 0.5]);
    const levels = [[0.62, 0.22], [0.82, 0.12], [1, 0], [1, -0.035], [0.65, -0.23], [0.06, -0.42]];
    const rings = levels.map(([scale, z]) => outline.map(([x, y]) => [x * scale, y * scale, z]));
    const vertices = [];
    const triangle = (a, b, c) => vertices.push(...a, ...b, ...c);
    outline.forEach((_, i) => triangle([0, 0, 0.22], rings[0][i], rings[0][(i + 1) % outline.length]));
    rings.slice(0, -1).forEach((ring, layer) => {
        ring.forEach((a, i) => {
            const j = (i + 1) % ring.length;
            triangle(a, rings[layer + 1][i], rings[layer + 1][j]);
            triangle(a, rings[layer + 1][j], ring[j]);
        });
    });
    outline.forEach((_, i) => triangle([0, 0, -0.425], rings[5][(i + 1) % outline.length], rings[5][i]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
}

const EMERALD = cutGeometry(true);
const BRILLIANT = cutGeometry(false);
const SILVER = new THREE.MeshStandardMaterial({ color: "#eef1f4", metalness: 1, roughness: 0.115, envMapIntensity: 1.5 });
const DIAMOND = new THREE.MeshPhysicalMaterial({
    color: "#f6fbff", metalness: 0.05, roughness: 0.025, transmission: 0.72,
    thickness: 0.012, ior: 2.417, dispersion: 0.035, envMapIntensity: 2.2,
    clearcoat: 1, clearcoatRoughness: 0, specularIntensity: 1,
});

function createGlint() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 54);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.1, "rgba(255,255,255,.7)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 128, 128);
    context.beginPath();
    context.moveTo(64, 4); context.lineTo(68, 59); context.lineTo(122, 64);
    context.lineTo(68, 69); context.lineTo(64, 124); context.lineTo(60, 69);
    context.lineTo(6, 64); context.lineTo(60, 59); context.closePath();
    context.fillStyle = "rgba(255,255,255,.85)";
    context.fill();
    return new THREE.CanvasTexture(canvas);
}

function FacetGlint({ position, size = 0.005, phase = 0 }) {
    const sprite = useRef();
    const texture = useMemo(createGlint, []);
    const normal = useMemo(() => new THREE.Vector3(), []);
    const rotation = useMemo(() => new THREE.Quaternion(), []);
    const light = useMemo(() => new THREE.Vector3(-0.3 + phase, 0.6, 1).normalize(), [phase]);
    useFrame(() => {
        sprite.current.parent.getWorldQuaternion(rotation);
        normal.set(0, 0, 1).applyQuaternion(rotation);
        const highlight = Math.pow(Math.max(0, normal.dot(light)), 18);
        sprite.current.material.opacity = highlight * 0.7;
    });
    return <sprite ref={sprite} position={position} scale={[size, size, 1]}>
        <spriteMaterial map={texture} transparent opacity={0} depthTest toneMapped={false} depthWrite={false} />
    </sprite>;
}

function Gem({ emerald = false, width, length = width, glint = false }) {
    return <group>
        <mesh geometry={emerald ? EMERALD : BRILLIANT} material={DIAMOND} scale={[width, length, width]} castShadow />
        {glint && <FacetGlint position={[-width * 0.27, length * 0.26, width * 0.24]} size={width * 0.7} />}
    </group>;
}

function Prongs({ width, length, height, radius }) {
    return [-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <group key={`${x}-${z}`} position={[x * width, height / 2, z * length]}>
            <mesh material={SILVER} castShadow><cylinderGeometry args={[radius, radius, height, 10]} /></mesh>
            <mesh material={SILVER} position={[0, height / 2, 0]}><sphereGeometry args={[radius * 1.2, 12, 8]} /></mesh>
        </group>
    )));
}

export function IndexRing() {
    return <group name="index-emerald-ring" position={[0, -0.0015, -0.02]}>
        <mesh material={SILVER} scale={[0.96, 1.08, 1]} castShadow>
            <torusGeometry args={[0.0105, 0.00115, 14, 64]} />
        </mesh>
        <group position={[0, 0.0102, 0]}>
            <Prongs width={0.0058} length={0.008} height={0.0062} radius={0.00055} />
            <group position={[0, 0.0043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <Gem emerald width={0.015} length={0.021} glint />
            </group>
        </group>
    </group>;
}

export function RingFingerRing() {
    return <group name="ring-finger-solitaire" position={[-0.001, -0.0015, -0.02]}>
        <mesh material={SILVER} scale={[0.94, 1.04, 1]} castShadow>
            <torusGeometry args={[0.0095, 0.0009, 12, 64]} />
        </mesh>
        <group position={[0, 0.009, 0]}>
            <Prongs width={0.003} length={0.003} height={0.0047} radius={0.00042} />
            <group position={[0, 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <Gem width={0.009} glint />
            </group>
        </group>
    </group>;
}

export function TennisBracelet() {
    const stones = useMemo(() => Array.from({ length: 44 }, (_, i) => {
        const angle = i * Math.PI * 2 / 44;
        const normal = new THREE.Vector3(Math.cos(angle) / 0.0285, Math.sin(angle) / 0.021, 0).normalize();
        return { position: [0.0285 * Math.cos(angle), 0.021 * Math.sin(angle), 0],
            quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal) };
    }), []);
    const chain = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(stones.map(({ position }) => new THREE.Vector3(...position)), true);
        return new THREE.TubeGeometry(curve, 176, 0.00075, 6, true);
    }, [stones]);
    return <group name="wrist-tennis-bracelet" position={[0, -0.0015, 0.009]}>
        <mesh geometry={chain} material={SILVER} />
        {stones.map(({ position, quaternion }, i) => <group key={i} position={position} quaternion={quaternion}>
            <mesh material={SILVER}><torusGeometry args={[0.00165, 0.00027, 6, 16]} /></mesh>
            <group position={[0, 0, 0.001]}><Gem width={0.0036} glint={i === 6 || i === 11 || i === 16} /></group>
            {[-1, 1].flatMap((x) => [-1, 1].map((y) => <mesh key={`${x}-${y}`} position={[x * 0.00125, y * 0.00125, 0.0015]} material={SILVER}>
                <sphereGeometry args={[0.00032, 6, 4]} />
            </mesh>))}
        </group>)}
    </group>;
}
