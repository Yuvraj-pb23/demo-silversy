import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const FINGERS = ["index", "middle", "ring", "pinky"];
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const turn = new THREE.Quaternion();

function makeSkinMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
        color: "#f4f1ea", roughness: 0.62, metalness: 0,
        clearcoat: 0.08, clearcoatRoughness: 0.55, sheen: 0.35,
        sheenColor: new THREE.Color("#efe7dc"), sheenRoughness: 0.7,
    });
    material.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nvarying vec3 vSkinObjPos;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSkinObjPos = position;");
        shader.fragmentShader = shader.fragmentShader
            .replace(
                "#include <common>",
                `#include <common>
                varying vec3 vSkinObjPos;
                float sHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
                float sNoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
                    return mix(mix(mix(sHash(i + vec3(0,0,0)), sHash(i + vec3(1,0,0)), f.x),
                                   mix(sHash(i + vec3(0,1,0)), sHash(i + vec3(1,1,0)), f.x), f.y),
                               mix(mix(sHash(i + vec3(0,0,1)), sHash(i + vec3(1,0,1)), f.x),
                                   mix(sHash(i + vec3(0,1,1)), sHash(i + vec3(1,1,1)), f.x), f.y), f.z); }
                float sFbm(vec3 p){ float a = 0.5, s = 0.0; for(int i = 0; i < 4; i++){ s += a * sNoise(p); p *= 2.04; a *= 0.5; } return s; }
                float skinHeight(vec3 p){
                    float wrinkle = sFbm(p * 30.0);
                    float lines = abs(sFbm(p * 52.0) - 0.5);
                    float pores = sFbm(p * 110.0);
                    return wrinkle * 0.5 + (0.5 - lines) * 0.42 + pores * 0.12;
                }`,
            )
            .replace(
                "#include <normal_fragment_maps>",
                `#include <normal_fragment_maps>
                {
                    float H = skinHeight(vSkinObjPos);
                    float dHx = dFdx(H);
                    float dHy = dFdy(H);
                    vec3 Sp = -vViewPosition;
                    vec3 dpx = dFdx(Sp);
                    vec3 dpy = dFdy(Sp);
                    vec3 r1 = cross(dpy, normal);
                    vec3 r2 = cross(normal, dpx);
                    float det = dot(dpx, r1);
                    vec3 grad = sign(det) * (dHx * r1 + dHy * r2);
                    normal = normalize(abs(det) * normal - 0.17 * grad);
                }`,
            );
    };
    material.customProgramCacheKey = () => "silversy-skin-v1";
    return material;
}

export function createHandRig(source) {
    const scene = clone(source);
    const material = makeSkinMaterial();
    scene.traverse((object) => {
        if (object.isMesh) {
            object.material = material;
            object.castShadow = true;
            object.receiveShadow = true;
            object.frustumCulled = false;
        }
    });
    scene.updateMatrixWorld(true);
    const wrist = scene.getObjectByName("wrist");
    // The WebXR asset supplies independent world-pose joints. This non-XR rig
    // reparents once, preserving bind transforms, to create anatomical chains.
    const chains = FINGERS.map((finger) => [
        `${finger}-finger-metacarpal`, `${finger}-finger-phalanx-proximal`,
        `${finger}-finger-phalanx-intermediate`, `${finger}-finger-phalanx-distal`, `${finger}-finger-tip`,
    ]);
    chains.push(["thumb-metacarpal", "thumb-phalanx-proximal", "thumb-phalanx-distal", "thumb-tip"]);
    chains.forEach((names) => {
        let parent = wrist;
        names.forEach((name) => {
            const bone = scene.getObjectByName(name);
            parent.attach(bone);
            parent = bone;
        });
    });
    const joints = [];
    FINGERS.forEach((finger, fingerIndex) => {
        ["proximal", "intermediate", "distal"].forEach((part, partIndex) => {
            const bone = scene.getObjectByName(`${finger}-finger-phalanx-${part}`);
            joints.push({ bone, rest: bone.quaternion.clone(), fingerIndex, partIndex });
        });
    });
    const thumb = ["metacarpal", "phalanx-proximal", "phalanx-distal"].map((part) => {
        const bone = scene.getObjectByName(`thumb-${part}`);
        return { bone, rest: bone.quaternion.clone() };
    });
    return { scene, wrist, material, joints, thumb,
        index: scene.getObjectByName("index-finger-phalanx-proximal"),
        ring: scene.getObjectByName("ring-finger-phalanx-proximal") };
}

export function poseHand(rig, progress) {
    rig.joints.forEach(({ bone, rest, fingerIndex, partIndex }) => {
        const delay = [0.075, 0.04, 0.02, 0][fingerIndex];
        const p = THREE.MathUtils.smoothstep(progress, delay, 0.95);
        const open = [0.025, 0.035, 0.11, 0.2][fingerIndex] * [1, 0.8, 0.4][partIndex];
        const angle = open + p * [0.97, 1.18, 0.65][partIndex];
        bone.quaternion.copy(rest).multiply(turn.setFromAxisAngle(X, -angle));
    });
    rig.thumb.forEach(({ bone, rest }, i) => {
        bone.quaternion.copy(rest);
        bone.quaternion.multiply(turn.setFromAxisAngle(Y, [0.30, 0, 0][i] + progress * [0.35, 0.05, 0][i]));
        bone.quaternion.multiply(turn.setFromAxisAngle(X, -[0.14, 0.13, 0.08][i] - progress * [0.25, 0.38, 0.40][i]));
    });
    rig.scene.updateMatrixWorld(true);
}
