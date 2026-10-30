import * as THREE from "./vendor/three.module.js";

const CORE_RADIUS = 0.82;
const NETWORK_NODE_COUNT = 56;
const PARTICLE_COUNT = 24;
const STAR_COUNT = 220;
const WEB_NODE_COUNT = 84;
const FIBER_COUNT = 240;
const TAU = Math.PI * 2;
const APPEARANCE_CYCLE = [
    { name: "black", duration: 12, next: "blue" },
    { name: "blue", duration: 8, next: "cosmic" },
    { name: "cosmic", duration: 10, next: "black" },
];
const APPEARANCE_TRANSITION = 3;
const APPEARANCE_METRICS = [
    "emissiveIntensity",
    "glowOpacity",
    "innerGlowOpacity",
    "networkOpacity",
    "spiderOpacity",
    "nodeOpacity",
    "energyOpacity",
    "vortexOpacity",
    "coreOpacity",
];

const APPEARANCES = {
    black: {
        core: new THREE.Color(0x03050b),
        emissive: new THREE.Color(0x020c19),
        glow: new THREE.Color(0x087bff),
        innerGlow: new THREE.Color(0x087bff),
        web: new THREE.Color(0x5ea8ff),
        emissiveIntensity: 0.16,
        glowOpacity: 0.34,
        innerGlowOpacity: 0.17,
        networkOpacity: 0.3,
        spiderOpacity: 0.34,
        nodeOpacity: 0.56,
        energyOpacity: 0.55,
        vortexOpacity: 0.1,
        coreOpacity: 0.78,
    },
    blue: {
        core: new THREE.Color(0x06416d),
        emissive: new THREE.Color(0x052a55),
        glow: new THREE.Color(0x087bff),
        innerGlow: new THREE.Color(0x00d9ff),
        web: new THREE.Color(0x9bdcff),
        emissiveIntensity: 0.44,
        glowOpacity: 0.51,
        innerGlowOpacity: 0.29,
        networkOpacity: 0.42,
        spiderOpacity: 0.48,
        nodeOpacity: 0.74,
        energyOpacity: 0.77,
        vortexOpacity: 0.19,
        coreOpacity: 0.64,
    },
    cosmic: {
        core: new THREE.Color(0x16070d),
        emissive: new THREE.Color(0x3c0714),
        glow: new THREE.Color(0xff245d),
        innerGlow: new THREE.Color(0x087bff),
        web: new THREE.Color(0xffa3b4),
        emissiveIntensity: 0.5,
        glowOpacity: 0.45,
        innerGlowOpacity: 0.32,
        networkOpacity: 0.47,
        spiderOpacity: 0.56,
        nodeOpacity: 0.82,
        energyOpacity: 0.9,
        vortexOpacity: 0.25,
        coreOpacity: 0.62,
    },
    error: {
        core: new THREE.Color(0x100710),
        emissive: new THREE.Color(0x260812),
        glow: new THREE.Color(0x7d1b3d),
        innerGlow: new THREE.Color(0xff245d),
        web: new THREE.Color(0xffa4b9),
        emissiveIntensity: 0.25,
        glowOpacity: 0.32,
        innerGlowOpacity: 0.19,
        networkOpacity: 0.32,
        spiderOpacity: 0.38,
        nodeOpacity: 0.62,
        energyOpacity: 0.58,
        vortexOpacity: 0.12,
        coreOpacity: 0.74,
    },
};

function smoothstep(value) {
    const clamped = THREE.MathUtils.clamp(value, 0, 1);
    return clamped * clamped * (3 - 2 * clamped);
}

function getAppearanceMix(elapsed) {
    const cycleLength = APPEARANCE_CYCLE.reduce((sum, item) => sum + item.duration, 0);
    let cycleTime = elapsed % cycleLength;
    let current = APPEARANCE_CYCLE[0];

    for (const appearance of APPEARANCE_CYCLE) {
        if (cycleTime < appearance.duration) {
            current = appearance;
            break;
        }
        cycleTime -= appearance.duration;
    }

    const transitionStart = current.duration - APPEARANCE_TRANSITION;
    const mix = smoothstep((cycleTime - transitionStart) / APPEARANCE_TRANSITION);
    return {
        current: APPEARANCES[current.name],
        next: APPEARANCES[current.next],
        name: mix > 0.5 ? current.next : current.name,
        mix,
    };
}

function blendAppearance(target, source, destination, amount) {
    target.core.lerpColors(source.core, destination.core, amount);
    target.emissive.lerpColors(source.emissive, destination.emissive, amount);
    target.glow.lerpColors(source.glow, destination.glow, amount);
    target.innerGlow.lerpColors(source.innerGlow, destination.innerGlow, amount);
    target.web.lerpColors(source.web, destination.web, amount);

    for (const property of APPEARANCE_METRICS) {
        target[property] = THREE.MathUtils.lerp(source[property], destination[property], amount);
    }
}

function createGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create the Peter Core glow texture.");

    const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
    gradient.addColorStop(0, "rgba(91, 220, 255, 0.34)");
    gradient.addColorStop(0.25, "rgba(37, 143, 255, 0.21)");
    gradient.addColorStop(0.62, "rgba(45, 80, 201, 0.08)");
    gradient.addColorStop(1, "rgba(30, 55, 160, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const redGradient = context.createRadialGradient(83, 61, 1, 83, 61, 60);
    redGradient.addColorStop(0, "rgba(255, 36, 93, 0.22)");
    redGradient.addColorStop(0.42, "rgba(181, 9, 38, 0.12)");
    redGradient.addColorStop(1, "rgba(181, 9, 38, 0)");
    context.fillStyle = redGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createNetwork() {
    const positions = [];
    const points = [];
    const colors = [];
    const directions = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < NETWORK_NODE_COUNT; index++) {
        const y = 1 - (index / (NETWORK_NODE_COUNT - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const angle = goldenAngle * index;
        const point = new THREE.Vector3(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius,
        );
        directions.push(point);
        points.push(point.clone().multiplyScalar(CORE_RADIUS * 1.015));

        const tint = index % 16 === 0
            ? new THREE.Color(0xff4fcb)
            : index % 5 === 0
                ? new THREE.Color(0xff245d)
                : index % 3 === 0
                    ? new THREE.Color(0x087bff)
                    : new THREE.Color(0x00d9ff);
        colors.push(tint);
    }

    const edges = [];
    for (let index = 0; index < NETWORK_NODE_COUNT; index++) {
        const nearest = directions
            .map((direction, candidate) => ({
                candidate,
                distance: directions[index].distanceToSquared(direction),
            }))
            .filter(({ candidate }) => candidate !== index)
            .sort((left, right) => left.distance - right.distance)
            .slice(0, 3);

        for (const { candidate } of nearest) {
            if (candidate > index) edges.push([index, candidate]);
        }
    }

    const linePositions = [];
    const lineColors = [];
    for (const [from, to] of edges) {
        linePositions.push(...points[from].toArray(), ...points[to].toArray());
        lineColors.push(...colors[from].toArray(), ...colors[to].toArray());
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });

    const nodeGeometry = new THREE.SphereGeometry(0.017, 6, 6);
    const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, NETWORK_NODE_COUNT);
    nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    points.forEach((point, index) => {
        const matrix = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
        nodes.setMatrixAt(index, matrix);
        nodes.setColorAt(index, colors[index]);
    });

    return {
        group: new THREE.Group(),
        lines: new THREE.LineSegments(lineGeometry, lineMaterial),
        nodes,
        points,
        directions,
        lineMaterial,
        nodeGeometry,
        nodeMaterial,
    };
}

function createSpiderWeb() {
    const directions = [];
    const points = [];
    const colors = [];
    const nodeLayers = [];
    const layerRadii = [1.02, 1.25, 1.49];
    const nodesPerLayer = WEB_NODE_COUNT / layerRadii.length;
    const nodesPerRing = nodesPerLayer;
    const palette = [
        new THREE.Color(0x087bff),
        new THREE.Color(0x00d9ff),
        new THREE.Color(0xff245d),
        new THREE.Color(0xff4fcb),
        new THREE.Color(0xeaf6ff),
    ];
    const hash = (value) => {
        const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
        return result - Math.floor(result);
    };

    for (let index = 0; index < WEB_NODE_COUNT; index++) {
        const layer = Math.floor(index / nodesPerLayer);
        const layerIndex = index % nodesPerLayer;
        const angle = TAU * layerIndex / nodesPerRing + layer * 0.13 + (hash(index + 19) - 0.5) * 0.055;
        const depth = (hash(index + 3) - 0.5) * 0.18;
        const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), depth).normalize();
        directions.push(direction);
        nodeLayers.push(layer);
        points.push(direction.clone().multiplyScalar(layerRadii[layer]));

        const colorChoice = hash(index + 41);
        const paletteIndex = colorChoice < 0.38 ? 0
            : colorChoice < 0.7 ? 1
                : colorChoice < 0.88 ? 2
                    : colorChoice < 0.94 ? 3
                        : 4;
        colors.push(palette[paletteIndex].clone());
    }

    const edges = new Set();
    for (let index = 0; index < WEB_NODE_COUNT; index++) {
        const neighbors = directions
            .map((point, candidate) => ({ candidate, distance: directions[index].distanceToSquared(point) }))
            .filter(({ candidate }) => candidate !== index)
            .sort((left, right) => left.distance - right.distance)
            .slice(0, 3);
        for (const { candidate } of neighbors) {
            edges.add(`${Math.min(index, candidate)}:${Math.max(index, candidate)}`);
        }

        if (index % 3 === 0) {
            const adjacentLayer = (nodeLayers[index] + 1) % layerRadii.length;
            const crossLayer = directions
                .map((point, candidate) => ({ candidate, distance: directions[index].distanceToSquared(point) }))
                .filter(({ candidate }) => nodeLayers[candidate] === adjacentLayer)
                .sort((left, right) => left.distance - right.distance)[0];
            if (crossLayer) edges.add(`${Math.min(index, crossLayer.candidate)}:${Math.max(index, crossLayer.candidate)}`);
        }
    }

    const createCurve = (start, end, seed, radial = false) => {
        const midpoint = start.clone().add(end).multiplyScalar(0.5);
        const outward = midpoint.clone().normalize();
        let tangent = start.clone().cross(end);
        if (tangent.lengthSq() < 0.0001) tangent = outward.clone().cross(new THREE.Vector3(0, 0, 1));
        tangent.normalize();
        const bend = 0.018 + hash(seed + 83) * (radial ? 0.065 : 0.13);
        const control = midpoint
            .addScaledVector(outward, bend)
            .addScaledVector(tangent, (hash(seed + 97) - 0.5) * (radial ? 0.16 : 0.18))
            .add(new THREE.Vector3(0, 0, (hash(seed + 109) - 0.5) * (radial ? 0.18 : 0.08)));
        return new THREE.QuadraticBezierCurve3(start, control, end);
    };
    const strands = [];
    for (const edge of edges) {
        const [from, to] = edge.split(":").map(Number);
        const startColor = colors[from];
        const endColor = startColor.clone().lerp(colors[to], 0.5);
        if (hash(from * 97 + to) > 0.72) endColor.lerp(palette[(from + to) % palette.length], 0.24);
        strands.push({
            curve: createCurve(points[from], points[to], from * 31 + to),
            startColor,
            endColor,
            radial: false,
            primary: false,
        });
    }

    for (let index = 0; index < WEB_NODE_COUNT; index += 4) {
        const direction = directions[index];
        const startColor = colors[index];
        strands.push({
            curve: createCurve(direction.clone().multiplyScalar(CORE_RADIUS * 0.94), points[index], index + 211, true),
            startColor,
            endColor: startColor.clone().lerp(palette[1], 0.28),
            radial: true,
            primary: index % 16 === 0,
        });
    }

    const radialStrands = [];
    for (let index = 0; index < FIBER_COUNT; index++) {
        const angle = TAU * (index + (hash(index + 307) - 0.5) * 0.38) / FIBER_COUNT;
        const depthLayer = index % 5;
        const depth = (depthLayer - 2) * 0.042 + (hash(index + 317) - 0.5) * 0.035;
        const startRadius = CORE_RADIUS * (0.9 + hash(index + 331) * 0.06);
        const endRadius = index % 4 === 0
            ? 1.08 + hash(index + 347) * 0.29
            : 1.42 + hash(index + 353) * 0.09;
        const spiral = index % 7 === 0 ? (hash(index + 367) - 0.5) * 0.58 : (hash(index + 367) - 0.5) * 0.1;
        const start = new THREE.Vector3(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius, depth * 0.32);
        const endAngle = angle + spiral;
        let end = new THREE.Vector3(Math.cos(endAngle) * endRadius, Math.sin(endAngle) * endRadius, depth);
        const connectsToRing = index % 4 !== 0;
        if (connectsToRing) {
            const ringIndex = Math.round(((endAngle % TAU + TAU) % TAU) / TAU * nodesPerRing) % nodesPerRing;
            end = points[(layerRadii.length - 1) * nodesPerLayer + ringIndex].clone();
        }

        const colorChoice = hash(index + 379);
        const colorIndex = colorChoice < 0.43 ? 0
            : colorChoice < 0.82 ? 1
                : colorChoice < 0.89 ? 2
                    : colorChoice < 0.96 ? 3
                        : 4;
        const endColor = palette[colorIndex].clone();
        const startColor = palette[1].clone().lerp(palette[4], colorIndex === 4 ? 0.68 : 0.22);
        const strand = {
            curve: createCurve(start, end, index + 503, true),
            startColor,
            endColor,
            radial: true,
            primary: index % 48 === 0,
            connectsToRing,
        };
        radialStrands.push(strand);
        strands.push(strand);
    }

    const primaryCount = Math.min(15, Math.floor(radialStrands.length * 0.065));
    for (let index = 0; index < primaryCount; index++) {
        radialStrands[Math.floor((index + 0.5) * radialStrands.length / primaryCount)].primary = true;
    }

    const linePositions = [];
    const lineColors = [];
    const lineSegments = 12;
    for (const strand of strands) {
        for (let segment = 0; segment < lineSegments; segment++) {
            const first = segment / lineSegments;
            const second = (segment + 1) / lineSegments;
            linePositions.push(...strand.curve.getPoint(first).toArray(), ...strand.curve.getPoint(second).toArray());
            lineColors.push(
                ...strand.startColor.clone().lerp(strand.endColor, first).toArray(),
                ...strand.startColor.clone().lerp(strand.endColor, second).toArray(),
            );
        }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    const primaryTubeSegments = 14;
    const primaryRadialSegments = 4;
    const tubePositions = [];
    const tubeNormals = [];
    const tubeColors = [];
    const tubeIndices = [];
    for (const strand of strands.filter(({ primary }) => primary)) {
        const tube = new THREE.TubeGeometry(strand.curve, primaryTubeSegments, 0.0038, primaryRadialSegments, false);
        const tubePosition = tube.getAttribute("position");
        const tubeNormal = tube.getAttribute("normal");
        const tubeIndex = tube.getIndex();
        const vertexOffset = tubePositions.length / 3;
        for (let vertex = 0; vertex < tubePosition.count; vertex++) {
            const row = Math.floor(vertex / (primaryRadialSegments + 1));
            const amount = row / primaryTubeSegments;
            tubePositions.push(tubePosition.getX(vertex), tubePosition.getY(vertex), tubePosition.getZ(vertex));
            tubeNormals.push(tubeNormal.getX(vertex), tubeNormal.getY(vertex), tubeNormal.getZ(vertex));
            tubeColors.push(...strand.startColor.clone().lerp(strand.endColor, amount).toArray());
        }
        for (let index = 0; index < tubeIndex.count; index++) tubeIndices.push(tubeIndex.getX(index) + vertexOffset);
        tube.dispose();
    }
    const primaryGeometry = new THREE.BufferGeometry();
    primaryGeometry.setAttribute("position", new THREE.Float32BufferAttribute(tubePositions, 3));
    primaryGeometry.setAttribute("normal", new THREE.Float32BufferAttribute(tubeNormals, 3));
    primaryGeometry.setAttribute("color", new THREE.Float32BufferAttribute(tubeColors, 3));
    primaryGeometry.setIndex(tubeIndices);
    const primaryMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });
    const primaryLines = new THREE.Mesh(primaryGeometry, primaryMaterial);

    const nodeGeometry = new THREE.SphereGeometry(0.014, 6, 5);
    const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });
    const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, WEB_NODE_COUNT);
    nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    points.forEach((point, index) => {
        const scale = index % 7 === 0 ? 1.45 : (index % 3 === 0 ? 1.1 : 0.82);
        nodes.setMatrixAt(index, new THREE.Matrix4().compose(
            point,
            new THREE.Quaternion(),
            new THREE.Vector3(scale, scale, scale),
        ));
        nodes.setColorAt(index, colors[index]);
    });

    const flows = [];
    const radialFlowCount = 24;
    const networkFlowCount = 12;
    const flowCount = radialFlowCount + networkFlowCount;
    const webStrands = strands.filter((strand) => !strand.radial);
    for (let index = 0; index < flowCount; index++) {
        const radial = index < radialFlowCount;
        const pool = radial ? radialStrands : webStrands;
        const poolIndex = radial
            ? Math.floor(index * pool.length / radialFlowCount)
            : Math.floor((index - radialFlowCount) * pool.length / networkFlowCount);
        const strand = pool[poolIndex];
        flows.push({
            curve: strand.curve,
            radial: strand.radial,
            phase: hash(index + 401) * 0.82,
            speed: 0.055 + hash(index + 503) * 0.075,
            direction: index % 2 === 0 ? 1 : -1,
            color: strand.startColor.clone().lerp(palette[4], 0.24),
        });
    }

    const energyGeometry = new THREE.BufferGeometry();
    const energyPositions = new Float32Array(flowCount * 3);
    const energyColors = new Float32Array(flowCount * 3);
    flows.forEach((flow, index) => flow.color.toArray(energyColors, index * 3));
    energyGeometry.setAttribute("position", new THREE.BufferAttribute(energyPositions, 3));
    energyGeometry.setAttribute("color", new THREE.BufferAttribute(energyColors, 3));
    const energyMaterial = new THREE.PointsMaterial({
        size: 0.023,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.76,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });

    return {
        group: new THREE.Group(),
        lines,
        primaryLines,
        nodes,
        lineGeometry,
        lineMaterial,
        primaryGeometry,
        primaryMaterial,
        nodeGeometry,
        nodeMaterial,
        energyGeometry,
        energyMaterial,
        energy: new THREE.Points(energyGeometry, energyMaterial),
        flows,
        strands,
        points,
    };
}

function createNeuralParticleCloud(count) {
    const positions = new Float32Array(count * 3);
    const baseColors = new Float32Array(count * 3);
    const directions = new Float32Array(count * 3);
    const baseRadii = new Float32Array(count);
    const phaseOffsets = new Float32Array(count);
    const crossWaveOffsets = new Float32Array(count);
    const palette = [
        new THREE.Color(0x168cff),
        new THREE.Color(0x00d9ff),
        new THREE.Color(0x5bc2ff),
        new THREE.Color(0xeaf6ff),
    ];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const hash = (value) => {
        const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
        return result - Math.floor(result);
    };

    for (let index = 0; index < count; index++) {
        const offset = index * 3;
        const y = 1 - ((index + 0.5) / count) * 2;
        const ringRadius = Math.sqrt(1 - y * y);
        const angle = goldenAngle * index;
        const x = Math.cos(angle) * ringRadius;
        const z = Math.sin(angle) * ringRadius;
        directions[offset] = x;
        directions[offset + 1] = y;
        directions[offset + 2] = z;
        baseRadii[index] = 1.32 + (hash(index + 97) - 0.5) * 0.09;
        phaseOffsets[index] = angle * 3.2 + y * 7.4 + hash(index + 193) * 0.7;
        crossWaveOffsets[index] = angle * 6.8 - y * 3.5 + hash(index + 241) * 0.9;

        const colorChoice = hash(index + 277);
        const color = palette[colorChoice < 0.66 ? 0 : colorChoice < 0.91 ? 1 : colorChoice < 0.98 ? 2 : 3];
        color.toArray(baseColors, offset);
        color.toArray(positions, offset);
        positions[offset] *= baseRadii[index];
        positions[offset + 1] *= baseRadii[index];
        positions[offset + 2] *= baseRadii[index];
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color", new THREE.BufferAttribute(baseColors.slice(), 3).setUsage(THREE.DynamicDrawUsage));
    const material = new THREE.PointsMaterial({
        size: 0.0135,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.93,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });

    return {
        points: new THREE.Points(geometry, material),
        geometry,
        material,
        directions,
        baseColors,
        baseRadii,
        phaseOffsets,
        crossWaveOffsets,
    };
}

function createStarfield(scene) {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    for (let index = 0; index < STAR_COUNT; index++) {
        const offset = index * 3;
        positions[offset] = (Math.random() - 0.5) * 8.5;
        positions[offset + 1] = (Math.random() - 0.5) * 5.2;
        positions[offset + 2] = -1.2 - Math.random() * 5.8;
        const color = index % 13 === 0 ? new THREE.Color(0xff5b74) : new THREE.Color(0x8dcfff);
        color.toArray(colors, offset);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
        size: 0.017,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        toneMapped: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    return { points, geometry, material };
}

function createInnerVortices() {
    const group = new THREE.Group();
    const rings = [];
    for (const [radius, color, opacity, tilt] of [
        [0.65, 0x61dfff, 0.22, 0.72],
        [0.57, 0x40aaff, 0.18, 1.36],
        [0.48, 0xff245d, 0.13, 1.92],
    ]) {
        const geometry = new THREE.TorusGeometry(radius, 0.006, 5, 96);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.set(tilt, tilt * 0.7, tilt * 0.3);
        group.add(ring);
        rings.push({ geometry, material });
    }
    return { group, rings };
}

function createParticles() {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const particles = [];

    for (let index = 0; index < PARTICLE_COUNT; index++) {
        const phase = (index / PARTICLE_COUNT) * TAU;
        const orbit = 0.12 + ((index * 7) % 13) / 24;
        const height = -0.42 + ((index * 11) % 17) / 21;
        const color = index % 11 === 0
            ? new THREE.Color(0xff5b74)
            : index % 2 === 0
                ? new THREE.Color(0x39b6ff)
                : new THREE.Color(0x69edff);

        particles.push({
            phase,
            orbit,
            height,
            speed: 0.12 + ((index * 5) % 9) * 0.012,
            wobble: 0.035 + ((index * 3) % 7) * 0.006,
            color,
        });
        color.toArray(colors, index * 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.035,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    return { points: new THREE.Points(geometry, material), geometry, material, particles };
}

export function initPeterCore3D() {
    const container = document.getElementById("peterCore3d");
    if (!container) throw new Error("Peter Core 3D container was not found.");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 30);
    camera.position.set(0, 0.04, 4.45);
    camera.lookAt(0, -0.02, 0);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("aria-label", "Interactive Peter Core visualization. Move the pointer or use the arrow keys to shift the view.");
    container.appendChild(renderer.domElement);
    container.dataset.webgl = "available";
    container.dataset.appearance = "black";
    const neuralField = document.getElementById("neuralField");
    if (neuralField) neuralField.dataset.webgl = "available";

    scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x071326, 0.62));
    const starfield = createStarfield(scene);

    const keyLight = new THREE.DirectionalLight(0xeaf6ff, 1.05);
    keyLight.position.set(-3, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x087bff, 2.6, 4.5, 2);
    fillLight.position.set(1.4, 0.5, 2);
    scene.add(fillLight);

    const glowTexture = createGlowTexture();
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: APPEARANCES.black.glow,
        transparent: true,
        opacity: APPEARANCES.black.glowOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.set(0, 0.18, -0.72);
    glow.scale.set(3.35, 3.35, 1);
    scene.add(glow);

    const coreGroup = new THREE.Group();
    coreGroup.position.y = 0.19;
    scene.add(coreGroup);

    const coreGeometry = new THREE.SphereGeometry(CORE_RADIUS, 36, 28);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: APPEARANCES.black.core,
        emissive: APPEARANCES.black.emissive,
        emissiveIntensity: APPEARANCES.black.emissiveIntensity,
        metalness: 0.34,
        roughness: 0.24,
        clearcoat: 0.84,
        clearcoatRoughness: 0.25,
        transparent: true,
        opacity: APPEARANCES.black.coreOpacity,
        depthWrite: false,
    });
    const sphere = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(sphere);

    const shellGeometry = new THREE.SphereGeometry(CORE_RADIUS * 1.018, 32, 24);
    const shellMaterial = new THREE.MeshBasicMaterial({
        color: APPEARANCES.black.glow,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.09,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    coreGroup.add(shell);

    const innerGlowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: APPEARANCES.black.innerGlow,
        transparent: true,
        opacity: APPEARANCES.black.innerGlowOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });
    const innerGlow = new THREE.Sprite(innerGlowMaterial);
    innerGlow.position.set(0, 0, 0.24);
    innerGlow.scale.set(1.75, 1.75, 1);
    coreGroup.add(innerGlow);
    const coreSparkMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xeaf6ff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });
    const coreSpark = new THREE.Sprite(coreSparkMaterial);
    coreSpark.position.set(0, 0, CORE_RADIUS * 0.91);
    coreSpark.scale.set(0.34, 0.34, 1);
    coreGroup.add(coreSpark);
    const innerVortices = createInnerVortices();
    coreGroup.add(innerVortices.group);

    const network = createNetwork();
    network.group.add(network.lines, network.nodes);
    coreGroup.add(network.group);
    const spiderWeb = createSpiderWeb();
    const neuralCloud = createNeuralParticleCloud(
        window.matchMedia("(max-width: 760px)").matches ? 6800 : 11200,
    );
    spiderWeb.group.add(spiderWeb.energy, neuralCloud.points);
    coreGroup.add(spiderWeb.group);
    const particles = createParticles();
    coreGroup.add(particles.points);
    const resizeRenderer = () => {
        const { width, height } = container.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;

        const aspect = width / height;
        const framingAspect = Math.min(1, aspect);
        const modelDiameter = 3.2;
        const verticalView = modelDiameter / framingAspect;
        camera.fov = THREE.MathUtils.radToDeg(
            2 * Math.atan(verticalView / (2 * camera.position.z)),
        );
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        const pixelRatioLimit = window.matchMedia("(max-width: 760px)").matches ? 1 : 1.2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioLimit));
        renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);
    resizeRenderer();
    renderer.render(scene, camera);

    const disposableGeometries = [
        coreGeometry,
        shellGeometry,
        network.lines.geometry,
        network.nodeGeometry,
        spiderWeb.lineGeometry,
        spiderWeb.primaryGeometry,
        spiderWeb.nodeGeometry,
        spiderWeb.energyGeometry,
        neuralCloud.geometry,
        particles.geometry,
        starfield.geometry,
        ...innerVortices.rings.map(({ geometry }) => geometry),
    ];
    const disposableMaterials = [
        coreMaterial,
        shellMaterial,
        network.lineMaterial,
        network.nodeMaterial,
        spiderWeb.lineMaterial,
        spiderWeb.primaryMaterial,
        spiderWeb.nodeMaterial,
        spiderWeb.energyMaterial,
        neuralCloud.material,
        particles.material,
        starfield.material,
        glowMaterial,
        innerGlowMaterial,
        coreSparkMaterial,
        ...innerVortices.rings.map(({ material }) => material),
    ];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clock = new THREE.Clock();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const matrix = new THREE.Matrix4();
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let animationFrame = 0;
    let lastFrameTime = 0;
    let elapsed = 0;
    let coreState = "standby";
    let activityLevel = 0;
    const appearanceTarget = {
        ...APPEARANCES.black,
        core: APPEARANCES.black.core.clone(),
        emissive: APPEARANCES.black.emissive.clone(),
        glow: APPEARANCES.black.glow.clone(),
        innerGlow: APPEARANCES.black.innerGlow.clone(),
        web: APPEARANCES.black.web.clone(),
    };
    const renderAppearance = {
        ...APPEARANCES.black,
        core: APPEARANCES.black.core.clone(),
        emissive: APPEARANCES.black.emissive.clone(),
        glow: APPEARANCES.black.glow.clone(),
        innerGlow: APPEARANCES.black.innerGlow.clone(),
        web: APPEARANCES.black.web.clone(),
    };
    const activityAppearances = {
        listening: { appearance: APPEARANCES.blue, intensity: 0.62 },
        waiting: { appearance: APPEARANCES.cosmic, intensity: 0.66 },
        processing: { appearance: APPEARANCES.cosmic, intensity: 0.74 },
        speaking: { appearance: APPEARANCES.cosmic, intensity: 0.64 },
        responding: { appearance: APPEARANCES.cosmic, intensity: 0.68 },
        error: { appearance: APPEARANCES.error, intensity: 0.78 },
    };

    const handlePointerMove = (event) => {
        const bounds = renderer.domElement.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) return;
        pointerTarget.y = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.34;
        pointerTarget.x = ((event.clientY - bounds.top) / bounds.height - 0.5) * -0.22;
        if (reducedMotion.matches) {
            coreGroup.rotation.set(pointerTarget.x, pointerTarget.y, 0);
            renderer.render(scene, camera);
        }
    };
    const resetPointer = () => {
        pointerTarget.x = 0;
        pointerTarget.y = 0;
        if (reducedMotion.matches) {
            coreGroup.rotation.set(0, 0, 0);
            renderer.render(scene, camera);
        }
    };
    const handlePointerKey = (event) => {
        const directions = {
            ArrowDown: [0.08, 0],
            ArrowLeft: [0, -0.08],
            ArrowRight: [0, 0.08],
            ArrowUp: [-0.08, 0],
        };
        const direction = directions[event.key];
        if (!direction) return;
        event.preventDefault();
        pointerTarget.x = THREE.MathUtils.clamp(pointerTarget.x + direction[0], -0.24, 0.24);
        pointerTarget.y = THREE.MathUtils.clamp(pointerTarget.y + direction[1], -0.34, 0.34);
        if (reducedMotion.matches) {
            coreGroup.rotation.set(pointerTarget.x, pointerTarget.y, 0);
            renderer.render(scene, camera);
        }
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", resetPointer);
    renderer.domElement.addEventListener("keydown", handlePointerKey);

    const renderFrame = (now) => {
        animationFrame = 0;
        const delta = Math.min(clock.getDelta(), 0.05);
        elapsed += delta;

        if (!reducedMotion.matches) {
            pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * Math.min(delta * 4, 1);
            pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * Math.min(delta * 4, 1);
            coreGroup.rotation.x = Math.sin(elapsed * 0.12) * 0.035 + pointerCurrent.x;
            coreGroup.rotation.y = elapsed * 0.11 + pointerCurrent.y;
            const activity = activityAppearances[coreState];
            const activityTarget = activity?.intensity || 0;
            activityLevel += (activityTarget - activityLevel) * (1 - Math.exp(-delta * 1.7));
            const neuralActivity = 1 + activityLevel * 0.78;
            network.group.rotation.y += delta * 0.028 * neuralActivity;
            network.group.rotation.x = Math.sin(elapsed * 0.12) * 0.035;
            spiderWeb.group.rotation.y -= delta * 0.012 * neuralActivity;
            spiderWeb.group.rotation.x = Math.sin(elapsed * 0.09) * 0.018;
            innerVortices.group.rotation.y += delta * 0.026;
            innerVortices.group.rotation.z = Math.sin(elapsed * 0.1) * 0.015;
            starfield.points.rotation.y = Math.sin(elapsed * 0.035) * 0.012;
            starfield.points.rotation.x = Math.cos(elapsed * 0.03) * 0.008;

            const breath = 1 + Math.sin(elapsed * 1.1) * 0.012;
            coreGroup.scale.setScalar(breath);
            const mode = getAppearanceMix(elapsed);
            blendAppearance(appearanceTarget, mode.current, mode.next, mode.mix);
            if (activity) {
                blendAppearance(appearanceTarget, appearanceTarget, activity.appearance, activity.intensity);
            }
            const easing = 1 - Math.exp(-delta * 1.8);
            blendAppearance(renderAppearance, renderAppearance, appearanceTarget, easing);
            container.dataset.appearance = activity ? coreState : mode.name;

            const activePulse = activity ? 0.16 : 0;
            const rhythmicPulse = coreState === "speaking" ? (Math.sin(elapsed * 2.2) + 1) * 0.035 : 0;
            coreMaterial.color.copy(renderAppearance.core);
            coreMaterial.emissive.copy(renderAppearance.emissive);
            coreMaterial.opacity = renderAppearance.coreOpacity;
            coreMaterial.emissiveIntensity = renderAppearance.emissiveIntensity
                * (1 + (Math.sin(elapsed * 1.1) + 1) * 0.06 + activePulse);
            shellMaterial.color.copy(renderAppearance.glow);
            shellMaterial.opacity = renderAppearance.glowOpacity * 0.28;
            glowMaterial.color.copy(renderAppearance.glow);
            glowMaterial.opacity = renderAppearance.glowOpacity * (0.92 + (Math.sin(elapsed * 0.72) + 1) * 0.08);
            innerGlowMaterial.color.copy(renderAppearance.innerGlow);
            innerGlowMaterial.opacity = renderAppearance.innerGlowOpacity * (0.9 + (Math.sin(elapsed * 0.92) + 1) * 0.1);
            coreSparkMaterial.opacity = 0.14 + activityLevel * 0.24 + rhythmicPulse;
            coreSpark.scale.setScalar(0.34 + activityLevel * 0.08 + rhythmicPulse * 0.2);
            network.lineMaterial.color.copy(renderAppearance.web);
            network.lineMaterial.opacity = renderAppearance.networkOpacity;
            network.nodeMaterial.opacity = renderAppearance.nodeOpacity;
            spiderWeb.lineMaterial.opacity = renderAppearance.spiderOpacity * (0.3 + activityLevel * 0.16);
            spiderWeb.primaryMaterial.opacity = 0.28 + activityLevel * 0.14;
            spiderWeb.nodeMaterial.opacity = renderAppearance.nodeOpacity * (0.44 + activityLevel * 0.18);
            spiderWeb.energyMaterial.opacity = renderAppearance.energyOpacity
                * (0.4 + activityLevel * 0.4 + rhythmicPulse);
            neuralCloud.material.opacity = 0.78 + activityLevel * 0.14;
            particles.material.opacity = renderAppearance.energyOpacity * 0.72;
            fillLight.color.copy(renderAppearance.glow);
            fillLight.intensity = 1.3 + renderAppearance.emissiveIntensity * 2.3;
            innerVortices.rings.forEach(({ material }, index) => {
                material.opacity = renderAppearance.vortexOpacity * (index === 2 ? 0.7 : 1);
            });

            network.points.forEach((point, index) => {
                const pulse = 1 + (Math.sin(elapsed * 1.8 + index * 1.73) + 1) * 0.16;
                position.copy(point).multiplyScalar(breath);
                scale.setScalar(pulse);
                matrix.compose(position, quaternion, scale);
                network.nodes.setMatrixAt(index, matrix);
            });
            network.nodes.instanceMatrix.needsUpdate = true;

            spiderWeb.points.forEach((point, index) => {
                const pulse = 1 + (Math.sin(elapsed * (1.1 + activityLevel * 0.7) + index * 1.31) + 1) * 0.11;
                const baseScale = index % 7 === 0 ? 1.45 : (index % 3 === 0 ? 1.1 : 0.82);
                position.copy(point);
                scale.setScalar(baseScale * pulse);
                matrix.compose(position, quaternion, scale);
                spiderWeb.nodes.setMatrixAt(index, matrix);
            });
            spiderWeb.nodes.instanceMatrix.needsUpdate = true;

            const webPositions = spiderWeb.energyGeometry.attributes.position;
            spiderWeb.flows.forEach((flow, index) => {
                const progress = (flow.phase + elapsed * flow.speed * neuralActivity) % 1;
                const outwardWave = coreState === "speaking" || coreState === "responding";
                const direction = flow.radial && outwardWave ? 1 : flow.direction;
                const t = direction > 0 ? progress : 1 - progress;
                const point = flow.curve.getPoint(t, position);
                webPositions.setXYZ(index, point.x, point.y, point.z);
            });
            webPositions.needsUpdate = true;

            const cloudPositions = neuralCloud.geometry.attributes.position.array;
            const cloudColors = neuralCloud.geometry.attributes.color.array;
            const cloudSpeed = 0.25 + activityLevel * 0.38;
            for (let index = 0; index < neuralCloud.baseRadii.length; index++) {
                const offset = index * 3;
                const phase = neuralCloud.phaseOffsets[index] + elapsed * cloudSpeed;
                const crossWave = neuralCloud.crossWaveOffsets[index] - elapsed * cloudSpeed * 0.64;
                const radius = neuralCloud.baseRadii[index]
                    + Math.sin(phase) * 0.052
                    + Math.sin(crossWave) * 0.026;
                const waveLight = (Math.sin(phase * 0.72 + crossWave * 0.2 - elapsed * 0.24) + 1) * 0.5;
                const brightness = 0.25 + Math.pow(waveLight, 1.35) * 0.75;
                cloudPositions[offset] = neuralCloud.directions[offset] * radius;
                cloudPositions[offset + 1] = neuralCloud.directions[offset + 1] * radius;
                cloudPositions[offset + 2] = neuralCloud.directions[offset + 2] * radius;
                cloudColors[offset] = neuralCloud.baseColors[offset] * brightness;
                cloudColors[offset + 1] = neuralCloud.baseColors[offset + 1] * brightness;
                cloudColors[offset + 2] = neuralCloud.baseColors[offset + 2] * brightness;
            }
            neuralCloud.geometry.attributes.position.needsUpdate = true;
            neuralCloud.geometry.attributes.color.needsUpdate = true;

            const particlePositions = particles.geometry.attributes.position;
            particles.particles.forEach((particle, index) => {
                const angle = particle.phase + elapsed * particle.speed * neuralActivity;
                const offset = index * 3;
                particlePositions.array[offset] = Math.cos(angle) * particle.orbit;
                particlePositions.array[offset + 1] = particle.height + Math.sin(angle * 1.7) * particle.wobble;
                particlePositions.array[offset + 2] = Math.sin(angle) * particle.orbit;
            });
            particlePositions.needsUpdate = true;
        }

        renderer.render(scene, camera);
        if (!reducedMotion.matches && !document.hidden) {
            const nextFrame = (time) => {
                if (time - lastFrameTime < 1000 / 40) {
                    animationFrame = requestAnimationFrame(nextFrame);
                    return;
                }
                lastFrameTime = time;
                renderFrame(time);
            };
            animationFrame = requestAnimationFrame(nextFrame);
        }
    };

    const startAnimation = () => {
        if (animationFrame || document.hidden) return;
        clock.start();
        animationFrame = requestAnimationFrame(renderFrame);
    };
    const handleVisibilityChange = () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        } else {
            startAnimation();
        }
    };
    const handleMotionChange = () => {
        if (reducedMotion.matches) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            renderer.render(scene, camera);
        } else {
            startAnimation();
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionChange);
    startAnimation();

    return {
        setState(state) {
            coreState = activityAppearances[state] ? state : "standby";
            const activity = activityAppearances[coreState];
            container.dataset.appearance = activity ? coreState : "black";
            if (reducedMotion.matches) {
                const appearance = activity?.appearance || APPEARANCES.black;
                coreMaterial.color.copy(appearance.core);
                coreMaterial.emissive.copy(appearance.emissive);
                coreMaterial.opacity = appearance.coreOpacity;
                coreMaterial.emissiveIntensity = appearance.emissiveIntensity;
                shellMaterial.color.copy(appearance.glow);
                shellMaterial.opacity = appearance.glowOpacity * 0.28;
                glowMaterial.color.copy(appearance.glow);
                glowMaterial.opacity = appearance.glowOpacity;
                innerGlowMaterial.color.copy(appearance.innerGlow);
                innerGlowMaterial.opacity = appearance.innerGlowOpacity;
                coreSparkMaterial.opacity = 0.14 + (activity?.intensity || 0) * 0.24;
                coreSpark.scale.setScalar(0.34 + (activity?.intensity || 0) * 0.08);
                network.lineMaterial.color.copy(appearance.web);
                network.lineMaterial.opacity = appearance.networkOpacity;
                network.nodeMaterial.opacity = appearance.nodeOpacity;
                spiderWeb.lineMaterial.color.set(0xffffff);
                spiderWeb.lineMaterial.opacity = appearance.spiderOpacity * 0.3;
                spiderWeb.primaryMaterial.opacity = 0.28 + (activity?.intensity || 0) * 0.14;
                spiderWeb.nodeMaterial.opacity = appearance.nodeOpacity * 0.44;
                spiderWeb.energyMaterial.opacity = appearance.energyOpacity
                    * (0.4 + (activity?.intensity || 0) * 0.4);
                neuralCloud.material.opacity = 0.78 + (activity?.intensity || 0) * 0.14;
                particles.material.opacity = appearance.energyOpacity * 0.72;
                fillLight.color.copy(appearance.glow);
                fillLight.intensity = 1.3 + appearance.emissiveIntensity * 2.3;
                innerVortices.rings.forEach(({ material }, index) => {
                    material.opacity = appearance.vortexOpacity * (index === 2 ? 0.7 : 1);
                });
                renderer.render(scene, camera);
            }
        },
        destroy() {
            cancelAnimationFrame(animationFrame);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            reducedMotion.removeEventListener("change", handleMotionChange);
            renderer.domElement.removeEventListener("pointermove", handlePointerMove);
            renderer.domElement.removeEventListener("pointerleave", resetPointer);
            renderer.domElement.removeEventListener("keydown", handlePointerKey);
            resizeObserver.disconnect();
            for (const geometry of disposableGeometries) geometry.dispose();
            for (const material of disposableMaterials) material.dispose();
            glowTexture.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        },
    };
}
