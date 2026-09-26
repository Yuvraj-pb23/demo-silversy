import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const FINGERS = ["index", "middle", "ring", "pinky"];
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const turn = new THREE.Quaternion();

export function createHandRig(source) {
    const scene = clone(source);
    const material = new THREE.MeshPhysicalMaterial({
        color: "#f7f4ee", roughness: 0.34, metalness: 0,
        clearcoat: 0.16, clearcoatRoughness: 0.3,
    });
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
