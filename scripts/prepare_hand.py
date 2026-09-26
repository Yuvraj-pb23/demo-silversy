"""Create the smooth local mannequin from the MIT WebXR generic right hand.

Run: python scripts/prepare_hand.py
Preserves 25 skin joints and weights; applies two Loop subdivisions to the mesh.
No external service is used at runtime. Licence is distributed beside the GLB.
"""
from pathlib import Path
import json
import struct

import numpy as np

ROOT = Path(__file__).resolve().parents[1] / "frontend/public/assets/hand"


def subdivide(vertices, weights, faces):
    neighbors = [set() for _ in vertices]
    edges = {}
    for a, b, c in faces:
        for i, j, opposite in ((a, b, c), (b, c, a), (c, a, b)):
            neighbors[i].add(j)
            neighbors[j].add(i)
            edges.setdefault(tuple(sorted((i, j))), []).append(opposite)
    boundary = [set() for _ in vertices]
    for (a, b), opposites in edges.items():
        if len(opposites) == 1:
            boundary[a].add(b)
            boundary[b].add(a)
    output = vertices.copy()
    for i, adjacent in enumerate(neighbors):
        if len(boundary[i]) == 2:
            output[i] = vertices[i] * 0.75 + vertices[list(boundary[i])].sum(axis=0) * 0.125
        elif adjacent:
            beta = 3 / (8 * len(adjacent)) if len(adjacent) > 3 else 3 / 16
            output[i] = vertices[i] * (1 - len(adjacent) * beta) + vertices[list(adjacent)].sum(axis=0) * beta
    points, influences = list(output), list(weights)
    edge_indices = {}
    for (a, b), opposites in edges.items():
        edge_indices[(a, b)] = len(points)
        point = (vertices[a] + vertices[b]) * 0.5
        if len(opposites) == 2:
            point = (vertices[a] + vertices[b]) * 0.375 + vertices[opposites].sum(axis=0) * 0.125
        points.append(point)
        influences.append((weights[a] + weights[b]) * 0.5)
    triangles = []
    for a, b, c in faces:
        ab, bc, ca = [edge_indices[tuple(sorted(edge))] for edge in ((a, b), (b, c), (c, a))]
        triangles.extend(((a, ab, ca), (b, bc, ab), (c, ca, bc), (ab, bc, ca)))
    return np.asarray(points), np.asarray(influences), np.asarray(triangles)


def main():
    data = (ROOT / "right.glb").read_bytes()
    json_size = struct.unpack_from("<I", data, 12)[0]
    gltf = json.loads(data[20:20 + json_size])
    binary = data[28 + json_size:]

    def accessor(index):
        spec = gltf["accessors"][index]
        view = gltf["bufferViews"][spec["bufferView"]]
        width = {"VEC3": 3, "VEC4": 4, "MAT4": 16, "SCALAR": 1}[spec["type"]]
        dtype = {5126: "<f4", 5123: "<u2", 5121: "u1"}[spec["componentType"]]
        return np.frombuffer(binary, dtype=dtype, count=spec["count"] * width,
                             offset=view.get("byteOffset", 0) + spec.get("byteOffset", 0)).reshape(-1, width)

    positions, original_joints, original_weights = accessor(0), accessor(3), accessor(4)
    # Weld UV seams before subdivision. The mannequin uses no painted texture.
    _, unique, inverse = np.unique(positions.round(7), axis=0, return_index=True, return_inverse=True)
    points = positions[unique].astype(np.float64)
    weights = np.zeros((len(points), 25))
    for i, source in enumerate(unique):
        for joint, value in zip(original_joints[source], original_weights[source]):
            weights[i, joint] += value
    faces = inverse[accessor(5).reshape(-1)].reshape(-1, 3)
    for _ in range(2):
        points, weights, faces = subdivide(points, weights, faces)
    normals = np.zeros_like(points)
    for a, b, c in faces:
        normal = np.cross(points[b] - points[a], points[c] - points[a])
        normals[a] += normal
        normals[b] += normal
        normals[c] += normal
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
    joints = np.argsort(weights, axis=1)[:, -4:]
    weights = np.take_along_axis(weights, joints, axis=1)
    weights /= weights.sum(axis=1, keepdims=True)
    binds = accessor(6).copy()
    payload, views, accessors = bytearray(), [], []

    def add(array, dtype, component_type, kind, bounds=False):
        array = np.asarray(array, dtype=dtype)
        while len(payload) % 4:
            payload.append(0)
        views.append({"buffer": 0, "byteOffset": len(payload), "byteLength": array.nbytes})
        payload.extend(array.tobytes())
        item = {"bufferView": len(views) - 1, "componentType": component_type,
                "count": len(array), "type": kind}
        if bounds:
            item.update(min=array.min(axis=0).tolist(), max=array.max(axis=0).tolist())
        accessors.append(item)
        return len(accessors) - 1

    attributes = {"POSITION": add(points, "<f4", 5126, "VEC3", True),
                  "NORMAL": add(normals, "<f4", 5126, "VEC3"),
                  "JOINTS_0": add(joints, "u1", 5121, "VEC4"),
                  "WEIGHTS_0": add(weights, "<f4", 5126, "VEC4")}
    indices = add(faces.reshape(-1, 1), "<u2", 5123, "SCALAR")
    gltf["skins"][0]["inverseBindMatrices"] = add(binds, "<f4", 5126, "MAT4")
    gltf["meshes"][0]["primitives"] = [{"attributes": attributes, "indices": indices, "material": 0}]
    gltf["bufferViews"], gltf["accessors"] = views, accessors
    gltf["buffers"] = [{"byteLength": len(payload)}]
    gltf["asset"]["extras"] = {"source": "WebXR Input Profiles generic-hand, MIT", "processing": "Two Loop subdivisions; skin weights retained"}
    encoded = json.dumps(gltf, separators=(",", ":")).encode()
    encoded += b" " * (-len(encoded) % 4)
    payload += b"\0" * (-len(payload) % 4)
    result = (struct.pack("<III", 0x46546C67, 2, 28 + len(encoded) + len(payload)) +
              struct.pack("<II", len(encoded), 0x4E4F534A) + encoded +
              struct.pack("<II", len(payload), 0x004E4942) + payload)
    (ROOT / "mannequin.glb").write_bytes(result)
    print(f"Saved smooth mannequin: {len(points)} vertices, {len(faces)} triangles, {len(result)} bytes")


if __name__ == "__main__":
    main()
