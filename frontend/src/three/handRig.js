import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { addHandAnatomy } from "./handAnatomy";

const FINGERS = ["index", "middle", "ring", "pinky"];
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const turn = new THREE.Quaternion();

function makeSkinMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
        color: "#f2f2ef", roughness: 0.66, metalness: 0, envMapIntensity: 0.45,
        clearcoat: 0.03, clearcoatRoughness: 0.6, sheen: 0.12,
        sheenColor: new THREE.Color("#ffffff"), sheenRoughness: 0.8,
    });
    material.defaultAttributeValues = { jointDetail: [0, 0, 0, 0] };
    material.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nattribute vec4 jointDetail;\nvarying vec4 vJointDetail;\nvarying vec3 vSkinObjPos;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSkinObjPos = position;\nvJointDetail = jointDetail;");
        shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>
                varying vec3 vSkinObjPos;
                varying vec4 vJointDetail;
                float skinNoise(vec3 p) {
                    return sin(p.x * 623.0 + sin(p.z * 419.0)) * sin(p.y * 571.0 + p.z * 391.0);
                }
                float jointCreases() {
                    vec2 q = vJointDetail.xy;
                    float mask = (1.0 - smoothstep(0.55, 1.0, abs(q.x))) * vJointDetail.z * vJointDetail.w;
                    float curve = q.y + 0.14 * q.x * q.x + 0.016 * sin(q.x * 12.0);
                    float aa = max(fwidth(curve), 0.022);
                    float folds = 1.0 - smoothstep(0.025, 0.025 + aa, abs(curve));
                    folds += 0.65 * (1.0 - smoothstep(0.02, 0.02 + aa, abs(curve - 0.25)));
                    folds += 0.45 * (1.0 - smoothstep(0.015, 0.015 + aa, abs(curve + 0.23)));
                    return folds * mask;
                }`)
            .replace("#include <color_fragment>", `#include <color_fragment>
                diffuseColor.rgb *= 1.0 - 0.14 * jointCreases();`)
            .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
                {
                    float H = skinNoise(vSkinObjPos) * 0.0004 - jointCreases() * 0.0022;
                    vec3 dpx = dFdx(-vViewPosition), dpy = dFdy(-vViewPosition);
                    vec3 r1 = cross(dpy, normal), r2 = cross(normal, dpx);
                    float det = dot(dpx, r1);
                    vec3 grad = sign(det) * (dFdx(H) * r1 + dFdy(H) * r2);
                    normal = normalize(abs(det) * normal - grad);
                }`);
    };
    material.customProgramCacheKey = () => "silversy-white-anatomy-v2";
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
    scene.updateMatrixWorld(true);
    addHandAnatomy(scene);
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
        if (i === 0) bone.quaternion.multiply(turn.setFromAxisAngle(Z, -0.48));
        bone.quaternion.multiply(turn.setFromAxisAngle(X, -[0.14, 0.13, 0.08][i] - progress * [0.25, 0.38, 0.40][i]));
    });
    rig.scene.updateMatrixWorld(true);
}
