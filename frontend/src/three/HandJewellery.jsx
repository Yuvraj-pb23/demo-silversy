import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshRefractionMaterial } from "@react-three/drei";
import * as THREE from "three";

function cutGeometry(emerald) {
    const outline = emerald
        ? [[-0.36, -0.5], [0.36, -0.5], [0.5, -0.36], [0.5, 0.36], [0.36, 0.5], [-0.36, 0.5], [-0.5, 0.36], [-0.5, -0.36]]
        : Array.from({ length: 16 }, (_, i) => [Math.cos(i * Math.PI / 8) * 0.5, Math.sin(i * Math.PI / 8) * 0.5]);
    const levels = [[0.62, 0.22], [0.82, 0.12], [1, 0], [1, -0.035], [0.65, -0.23], [0.06, -0.42]];
    const rings = levels.map(([scale, z], layer) => outline.map(([x, y], i) => {
        const angle = !emerald && layer === 4 ? Math.PI / 16 : 0;
        const star = !emerald && layer === 1 && i % 2 ? 0.82 : 1;
        return [(x * Math.cos(angle) - y * Math.sin(angle)) * scale * star,
            (x * Math.sin(angle) + y * Math.cos(angle)) * scale * star, z];
    }));
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
    geometry.setIndex(Array.from({ length: vertices.length / 3 }, (_, i) => i));
    geometry.computeVertexNormals();
    return geometry;
}

const EMERALD = cutGeometry(true);
const BRILLIANT = cutGeometry(false);
const SILVER = new THREE.MeshPhysicalMaterial({
    color: "#e9ecef", metalness: 1, roughness: 0.075, envMapIntensity: 1.15,
    clearcoat: 0.25, clearcoatRoughness: 0.06,
});

function DiamondMaterial({ environment, emerald = false }) {
    return environment ? <MeshRefractionMaterial envMap={environment} bounces={emerald ? 6 : 4}
        ior={2.417} fresnel={0.12} aberrationStrength={0.012} fastChroma color="#ffffff" />
        : <meshPhysicalMaterial color="#ffffff" metalness={0} roughness={0.03} />;
}

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

function Gem({ emerald = false, width, length = width, glint = false, environment }) {
    return <group>
        <mesh geometry={emerald ? EMERALD : BRILLIANT} scale={[width, length, width]}>
            <DiamondMaterial environment={environment} emerald={emerald} />
        </mesh>
        {glint && <FacetGlint position={[-width * 0.27, length * 0.26, width * 0.24]} size={width * 0.32} />}
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

function Gallery({ width, length }) {
    const geometry = useMemo(() => {
        const points = [[-0.7, -1], [0.7, -1], [1, -0.7], [1, 0.7], [0.7, 1], [-0.7, 1], [-1, 0.7], [-1, -0.7]]
            .map(([x, z]) => new THREE.Vector3(x * width, 0, z * length));
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true, "centripetal"), 48, 0.0004, 8, true);
    }, [width, length]);
    return <mesh geometry={geometry} material={SILVER} position={[0, 0.0015, 0]} castShadow />;
}

export function IndexRing({ environment }) {
    return <group name="index-emerald-ring" position={[0, -0.0015, -0.02]}>
        <mesh material={SILVER} scale={[0.96, 1.08, 1]} castShadow>
            <torusGeometry args={[0.0105, 0.00115, 20, 96]} />
        </mesh>
        <group position={[0, 0.0102, 0]}>
            <Gallery width={0.0058} length={0.008} />
            <Prongs width={0.0058} length={0.008} height={0.0062} radius={0.00055} />
            <group position={[0, 0.0043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <Gem emerald width={0.015} length={0.021} glint environment={environment} />
            </group>
        </group>
    </group>;
}

export function RingFingerRing({ environment }) {
    return <group name="ring-finger-solitaire" position={[-0.001, -0.0015, -0.02]}>
        <mesh material={SILVER} scale={[0.94, 1.04, 1]} castShadow>
            <torusGeometry args={[0.0095, 0.0009, 20, 96]} />
        </mesh>
        <group position={[0, 0.009, 0]}>
            <Gallery width={0.003} length={0.003} />
            <Prongs width={0.003} length={0.003} height={0.0047} radius={0.00042} />
            <group position={[0, 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <Gem width={0.009} glint environment={environment} />
            </group>
        </group>
    </group>;
}

function BraceletSettings({ stones, environment }) {
    const seats = useRef(), prongs = useRef(), caps = useRef(), diamonds = useRef();
    useLayoutEffect(() => {
        const base = new THREE.Matrix4(), local = new THREE.Matrix4(), matrix = new THREE.Matrix4();
        const scale = new THREE.Vector3(1, 1, 1);
        const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        stones.forEach(({ position, quaternion }, i) => {
            base.compose(new THREE.Vector3(...position), quaternion, scale);
            seats.current.setMatrixAt(i, base);
            local.compose(new THREE.Vector3(0, 0, 0.001), new THREE.Quaternion(), new THREE.Vector3(0.0036, 0.0036, 0.0036));
            diamonds.current.setMatrixAt(i, matrix.multiplyMatrices(base, local));
            [-1, 1].forEach((x, xi) => [-1, 1].forEach((y, yi) => {
                const index = i * 4 + xi * 2 + yi;
                local.compose(new THREE.Vector3(x * 0.00125, y * 0.00125, 0.0007), turn, scale);
                prongs.current.setMatrixAt(index, matrix.multiplyMatrices(base, local));
                local.makeTranslation(x * 0.00125, y * 0.00125, 0.0015);
                caps.current.setMatrixAt(index, matrix.multiplyMatrices(base, local));
            }));
        });
        [seats, prongs, caps, diamonds].forEach(({ current }) => {
            current.instanceMatrix.needsUpdate = true;
            current.computeBoundingSphere();
        });
    }, [stones]);
    return <>
        <instancedMesh name="bracelet-silver-settings" ref={seats} args={[undefined, SILVER, 44]} castShadow>
            <torusGeometry args={[0.00165, 0.00027, 8, 24]} />
        </instancedMesh>
        <instancedMesh name="bracelet-prongs" ref={prongs} args={[undefined, SILVER, 176]}>
            <cylinderGeometry args={[0.00023, 0.00029, 0.0015, 8]} />
        </instancedMesh>
        <instancedMesh ref={caps} args={[undefined, SILVER, 176]}>
            <sphereGeometry args={[0.00031, 8, 6]} />
        </instancedMesh>
        <instancedMesh name="bracelet-diamonds" ref={diamonds} args={[BRILLIANT, undefined, 44]}>
            <DiamondMaterial environment={environment} />
        </instancedMesh>
    </>;
}

export function TennisBracelet({ environment }) {
    const stones = useMemo(() => Array.from({ length: 44 }, (_, i) => {
        const angle = i * Math.PI * 2 / 44;
        const normal = new THREE.Vector3(Math.cos(angle) / 0.0285, Math.sin(angle) / 0.021, 0).normalize();
        return { position: [0.0285 * Math.cos(angle), 0.021 * Math.sin(angle), 0],
            quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal) };
    }), []);
    const chain = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(stones.map(({ position }) => new THREE.Vector3(...position)), true);
        return new THREE.TubeGeometry(curve, 176, 0.00065, 8, true);
    }, [stones]);
    return <group name="wrist-tennis-bracelet" position={[0, -0.0015, 0.009]}>
        <mesh geometry={chain} material={SILVER} castShadow />
        <BraceletSettings stones={stones} environment={environment} />
    </group>;
}
