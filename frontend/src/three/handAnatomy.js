import * as THREE from "three";
import { MeshBVH, acceleratedRaycast } from "three-mesh-bvh";

const FINGERS = ["index", "middle", "ring", "pinky"];
const NAIL = new THREE.MeshPhysicalMaterial({
    color: "#e3e4e1", roughness: 0.24, metalness: 0, ior: 1.46,
    clearcoat: 0.8, clearcoatRoughness: 0.19, envMapIntensity: 0.55,
    side: THREE.DoubleSide,
});
const FREE_EDGE = new THREE.MeshPhysicalMaterial({
    color: "#fafaf6", roughness: 0.32, clearcoat: 0.5, envMapIntensity: 0.5,
    side: THREE.DoubleSide,
});
const CUTICLE = new THREE.MeshStandardMaterial({ color: "#c4c7c3", roughness: 0.76 });

function jointFrames(scene) {
    return FINGERS.flatMap((finger, i) => ["proximal", "intermediate", "distal"].map((part, j) => {
        const bone = scene.getObjectByName(`${finger}-finger-phalanx-${part}`);
        return { inverse: bone.matrixWorld.clone().invert(),
            radius: [0.009, 0.0072, 0.006][j] * (i === 3 ? 0.84 : 1),
            length: [0.009, 0.0055, 0.0045][j], strength: [0.0009, 0.00085, 0.0005][j] };
    })).concat(["proximal", "distal"].map((part) => ({
        inverse: scene.getObjectByName(`thumb-phalanx-${part}`).matrixWorld.clone().invert(),
        radius: 0.008, length: 0.006, strength: 0.0007,
    })));
}

// Shape the actual skinned mesh, not floating spheres: each contour deforms with its joint.
function sculptKnuckles(mesh, frames) {
    mesh.geometry = mesh.geometry.clone();
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const details = new Float32Array(position.count * 4);
    const point = new THREE.Vector3(), local = new THREE.Vector3(), direction = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(position, i);
        let best = 0, displacement = 0;
        frames.forEach(({ inverse, radius, length, strength }) => {
            local.copy(point).applyMatrix4(inverse);
            direction.fromBufferAttribute(normal, i).transformDirection(inverse);
            const x = local.x / radius, z = local.z / length;
            const dorsal = THREE.MathUtils.smoothstep(local.y, 0.001, 0.004) * THREE.MathUtils.smoothstep(direction.y, 0.1, 0.7);
            const weight = Math.exp(-x * x * 1.4 - z * z * 1.8) * dorsal;
            displacement += weight * strength;
            if (weight > best) {
                best = weight;
                details.set([x, local.z / radius, dorsal, Math.exp(-z * z * 0.65)], i * 4);
            }
        });
        direction.fromBufferAttribute(normal, i);
        point.addScaledVector(direction, displacement);
        position.setXYZ(i, point.x, point.y, point.z);
    }
    geometry.setAttribute("jointDetail", new THREE.BufferAttribute(details, 4));
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
}

// A short, rounded-square natural nail. Surface samples fit each unique fingertip.
function fitNail(mesh, bone, width, length, start) {
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true;
    const direction = new THREE.Vector3(0, -1, 0).transformDirection(bone.matrixWorld);
    const surface = (u, v, lift = 0) => {
        const corner = Math.pow(Math.abs(v * 2 - 1), 8);
        const x = u * width * 0.5 * (1 - 0.23 * corner);
        const z = -start - v * length;
        ray.set(bone.localToWorld(new THREE.Vector3(x, 0.04, z)), direction);
        const hit = ray.intersectObject(mesh, false)[0];
        if (!hit) throw new Error(`Nail surface outside fingertip: ${bone.name}`);
        const p = bone.worldToLocal(hit.point.clone());
        p.y += 0.00018 + 0.00028 * (1 - u * u) * Math.sin(Math.PI * v) + lift;
        return p;
    };
    const vertices = [], indices = [], rows = 24, columns = 12;
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= columns; i++) {
        vertices.push(...surface(i / columns * 2 - 1, j / rows).toArray());
    }
    const geometry = new THREE.BufferGeometry();
    for (let j = 0; j < rows; j++) for (let i = 0; i < columns; i++) {
        const a = j * (columns + 1) + i, b = a + columns + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const edgeStart = (rows - 2) * columns * 6;
    geometry.addGroup(0, edgeStart, 0);
    geometry.addGroup(edgeStart, indices.length - edgeStart, 1);
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const nail = new THREE.Mesh(geometry, [NAIL, FREE_EDGE]);
    nail.name = `nail-${bone.name.replace(/-phalanx-distal/, "")}`;
    nail.castShadow = true;
    nail.receiveShadow = true;
    const rimPoints = [];
    for (let i = 0; i <= 16; i++) rimPoints.push(surface(-1, 1 - i / 16));
    for (let i = 1; i <= 20; i++) rimPoints.push(surface(i / 10 - 1, 0));
    for (let i = 1; i <= 16; i++) rimPoints.push(surface(1, i / 16));
    const rim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPoints), 64, 0.000075, 5, false), CUTICLE);
    rim.name = "nail-cuticle";
    nail.add(rim);
    bone.add(nail);
}

export function addHandAnatomy(scene) {
    const meshes = [];
    scene.traverse((object) => { if (object.isSkinnedMesh) meshes.push(object); });
    const frames = jointFrames(scene);
    meshes.forEach((mesh) => sculptKnuckles(mesh, frames));
    scene.updateMatrixWorld(true);
    // Bind-pose surface sampling needs no skinning. A one-time BVH avoids millions
    // of CPU skin transforms while fitting the five nails on mobile/cold loads.
    const mesh = new THREE.Mesh(meshes[0].geometry, meshes[0].material);
    mesh.matrixWorld.copy(meshes[0].matrixWorld);
    mesh.geometry.boundsTree = new MeshBVH(mesh.geometry);
    mesh.raycast = acceleratedRaycast;
    [
        ["index-finger", 0.009, 0.0135, 0.006],
        ["middle-finger", 0.0095, 0.014, 0.006],
        ["ring-finger", 0.0085, 0.013, 0.006],
        ["pinky-finger", 0.007, 0.012, 0.005],
        ["thumb", 0.011, 0.016, 0.006],
    ].forEach(([finger, width, length, start]) => fitNail(mesh, scene.getObjectByName(`${finger}-phalanx-distal`), width, length, start));
}
