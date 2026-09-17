(() => {
    'use strict';

    const canvas = document.getElementById('brainCanvas');

    if (!canvas) {
        return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
        return;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -1000, y: -1000, active: false };
    const nodes = [];
    const particles = [];
    const stars = [];
    const spaceParticles = [];
    const ecosystem = [];
    const random = createRandom(142857);
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let head = null;
    let scrollTarget = 0;
    let scrollProgress = 0;
    let sectionTarget = 0;
    let sectionProgress = 0;
    let animationFrame = 0;

    /*
     * World states = WHERE the Brain sits for each of the 7 sections.
     * These are movement targets only; the Brain artwork itself is
     * unchanged. x is a fraction of viewport width, y of viewport
     * height, and scale/rotation/depth drive the cinematic travel.
     */
    const worldSections = [
        { x: 0, y: 0, scale: 1.00, rotation: 0, depth: 0.00 },
        { x: 0.31, y: -0.015, scale: 0.88, rotation: 0.035, depth: 0.18 },
        { x: -0.31, y: 0.015, scale: 0.84, rotation: -0.045, depth: 0.30 },
        { x: 0.30, y: -0.02, scale: 0.82, rotation: 0.055, depth: 0.42 },
        { x: -0.30, y: 0.02, scale: 0.79, rotation: -0.06, depth: 0.55 },
        { x: 0, y: -0.01, scale: 0.74, rotation: 0, depth: 0.72 },
        { x: 0, y: -0.02, scale: 0.68, rotation: 0, depth: 0.90 }
    ];
    let lastTime = performance.now();
    let pageVisible = !document.hidden;
    const entranceStart = performance.now();
    const entranceDuration = 3400;
    let serviceTimer = 0;
    let serviceTimeout = 0;
    let serviceIndex = 0;
    const serviceMessages = [
        'Website Development',
        'SEO Growth',
        'Social Media Marketing',
        'Video Editing',
        'Branding & Creative',
        'Digital Marketing'
    ];

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    function createRandom(seed) {
        let value = seed;

        return () => {
            value = (value * 16807) % 2147483647;
            return (value - 1) / 2147483646;
        };
    }

    function lerp(start, end, amount) {
        return start + (end - start) * amount;
    }

    function smoothstep(amount) {
        const clamped = clamp(amount, 0, 1);
        return clamped * clamped * (3 - clamped * 2);
    }

    /*
     * Continuous world interpolation: takes the fractional section index
     * (0..6) and blends the two neighbouring world states. Because the
     * index itself is continuous, the Brain NEVER snaps, resets or
     * teleports when crossing between sections.
     */
    function interpolateWorldState(index) {
        const last = worldSections.length - 1;
        const clamped = clamp(index, 0, last);
        const lower = Math.floor(clamped);
        const upper = Math.min(lower + 1, last);
        const amount = smoothstep(clamped - lower);
        const from = worldSections[lower];
        const to = worldSections[upper];

        return {
            x: lerp(from.x, to.x, amount),
            y: lerp(from.y, to.y, amount),
            scale: lerp(from.scale, to.scale, amount),
            rotation: lerp(from.rotation, to.rotation, amount),
            depth: lerp(from.depth, to.depth, amount)
        };
    }

    function resize() {
        const bounds = canvas.getBoundingClientRect();

        width = Math.max(1, bounds.width);
        height = Math.max(1, bounds.height);
        pixelRatio = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.5 : 2);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        head = createHeadBounds();
        createStars();
        createNodes();
        createParticles();
        createEcosystem();
        render(performance.now());
        scheduleFrame();
    }

    function createHeadBounds() {
        const mobile = width < 600;
        const scale = Math.min(width, height);

        return {
            centerX: width * 0.5,
            centerY: height * 0.5,
            radiusX: scale * (mobile ? 0.23 : 0.36),
            radiusY: scale * (mobile ? 0.3 : 0.47)
        };
    }

    function isInsideHead(x, y, padding = 0) {
        const skullX = (x - (head.centerX - head.radiusX * 0.08)) / (head.radiusX + padding);
        const skullY = (y - head.centerY) / (head.radiusY + padding);
        const skull = skullX * skullX + skullY * skullY <= 1;
        const jaw = x > head.centerX - head.radiusX * 0.38
            && x < head.centerX + head.radiusX * 0.95
            && y > head.centerY + head.radiusY * 0.2
            && y < head.centerY + head.radiusY * 0.78;
        const face = x > head.centerX + head.radiusX * 0.42
            && y > head.centerY - head.radiusY * 0.58
            && y < head.centerY + head.radiusY * 0.48;

        return skull || jaw || face;
    }

    function createStars() {
        stars.length = 0;
        spaceParticles.length = 0;
        const count = width < 600 ? 24 : 58;
        const spaceCount = width < 600 ? 18 : 42;

        for (let index = 0; index < count; index += 1) {
            stars.push({
                x: random() * width,
                y: random() * height,
                radius: 0.25 + random() * 0.75,
                alpha: 0.12 + random() * 0.32,
                phase: random() * Math.PI * 2,
                depth: 0.25 + random() * 0.75
            });
        }

        for (let index = 0; index < spaceCount; index += 1) {
            spaceParticles.push({
                x: random() * width,
                y: random() * height,
                size: 0.35 + random() * 1.15,
                alpha: 0.08 + random() * 0.22,
                depth: 0.15 + random() * 0.85,
                phase: random() * Math.PI * 2,
                drift: 0.35 + random() * 0.65
            });
        }
    }

    function createNodes() {
        nodes.length = 0;
        const mobile = width < 600;
        const targetCount = Math.round(mobile
            ? clamp(width * height / 6500, 52, 78)
            : clamp(width * height / 6200, 96, 170));
        let attempts = 0;

        while (nodes.length < targetCount && attempts < targetCount * 14) {
            attempts += 1;
            const x = head.centerX + (random() * 2 - 1) * head.radiusX * 1.04;
            const y = head.centerY + (random() * 2 - 1) * head.radiusY * 1.04;

            if (!isInsideHead(x, y, -3)) {
                continue;
            }

            nodes.push({
                x,
                y,
                baseX: x,
                baseY: y,
                vx: 0,
                vy: 0,
                radius: 0.7 + random() * 1.55,
                phase: random() * Math.PI * 2,
                energy: random(),
                depth: random() * 2 - 1
            });
        }
    }

    function createParticles() {
        particles.length = 0;
        const count = width < 600 ? 22 : 54;
        let attempts = 0;

        while (particles.length < count && attempts < count * 12) {
            attempts += 1;
            const x = head.centerX + (random() * 2 - 1) * head.radiusX * 1.12;
            const y = head.centerY + (random() * 2 - 1) * head.radiusY * 1.12;

            if (!isInsideHead(x, y, 0)) {
                continue;
            }

            particles.push({
                x,
                y,
                baseX: x,
                baseY: y,
                vx: (random() - 0.5) * 0.08,
                vy: (random() - 0.5) * 0.08,
                size: 0.35 + random() * 0.9,
                alpha: 0.18 + random() * 0.42,
                phase: random() * Math.PI * 2,
                depth: 0.35 + random() * 0.65
            });
        }
    }

    function createEcosystem() {
        ecosystem.length = 0;
        const mobile = width < 600;
        const concepts = mobile
            ? [
                { label: 'SEO', icon: 'search', angle: -1.1, distance: 0.92 },
                { label: 'Growth', icon: 'growth', angle: 0.25, distance: 0.94 },
                { label: 'Analytics', icon: 'chart', angle: 1.08, distance: 0.92 }
            ]
            : [
                { label: 'SEO', icon: 'search', angle: -1.2, distance: 0.94 },
                { label: 'Content', icon: 'content', angle: -0.55, distance: 0.98 },
                { label: 'Analytics', icon: 'chart', angle: 0.08, distance: 1.02 },
                { label: 'Growth', icon: 'growth', angle: 0.72, distance: 0.98 },
                { label: 'Social', icon: 'social', angle: 1.28, distance: 0.94 },
                { label: 'Brand', icon: 'brand', angle: 2.1, distance: 0.94 }
            ];

        concepts.forEach((concept, index) => {
            ecosystem.push({
                ...concept,
                phase: random() * Math.PI * 2,
                depth: 0.65 + random() * 0.35,
                index
            });
        });
    }

    function getScenePointer(zoom) {
        return {
            x: head.centerX + (pointer.x - head.centerX) / zoom,
            y: head.centerY + (pointer.y - head.centerY) / zoom
        };
    }

    function getSceneMotion(time) {
        const motionScale = reducedMotionQuery.matches ? 0 : 1;
        const activity = pointer.active ? 1 : 0;
        const entranceProgress = reducedMotionQuery.matches
            ? 1
            : clamp((time - entranceStart) / entranceDuration, 0, 1);
        const entrance = entranceProgress * entranceProgress * (3 - entranceProgress * 2);
        const pointerX = clamp((pointer.x - head.centerX) / Math.max(head.radiusX * 2.4, 1), -1, 1);
        const pointerY = clamp((pointer.y - head.centerY) / Math.max(head.radiusY * 2.4, 1), -1, 1);
        const breathing = Math.sin(time * 0.00105) * 0.012 * motionScale;
        const depthWave = Math.sin(time * 0.00042) * 0.018 * motionScale;
        const orbit = time * 0.00022;
        const yaw = Math.sin(time * 0.00032) * 0.065 * motionScale + pointerX * 0.035 * activity;
        const pitch = Math.cos(time * 0.00027) * 0.032 * motionScale + pointerY * 0.026 * activity;

        /*
         * Continuous world travel derived from the fractional section
         * index. The existing breathing / orbit / pointer / depth motion
         * is preserved and simply layered on top.
         *
         * On mobile the horizontal travel is reduced to ~40% so the Brain
         * never collides with the full-width stacked content.
         */
        const world = interpolateWorldState(sectionProgress);
        const travelFactor = width < 600 ? 0.4 : 1;
        const travelX = world.x * width * 0.42 * travelFactor;
        const travelY = world.y * height;
        const depthDrift = world.depth * 8;

        return {
            zoom: (0.5 + entrance * 0.5) * world.scale * (1 + scrollProgress * 0.05 + breathing + depthWave),
            scaleX: Math.cos(yaw) * (1 + breathing * 0.4),
            scaleY: Math.cos(pitch) * (1 - breathing * 0.3),
            rotation: Math.sin(time * 0.00016) * 0.018 * motionScale + world.rotation,
            offsetX: Math.sin(orbit) * 3.5 * motionScale + pointerX * 4 * activity + travelX,
            offsetY: Math.cos(orbit * 0.82) * 2.5 * motionScale + pointerY * 3 * activity + travelY + depthDrift,
            yaw,
            pitch
        };
    }

    function updateScrollTarget() {
        const sections = document.querySelectorAll('[data-brain-section]');

        if (sections.length < 2) {
            sectionTarget = 0;
            scrollTarget = 0;
            return;
        }

        /*
         * CONTINUOUS PAGE PROGRESS.
         * Map the viewport center (in document coordinates) onto the
         * document-space centers of all seven sections, producing a
         * fractional index such as 2.5 (half-way between 02 and 03).
         * This is what removes all snapping between sections.
         */
        const viewportCenter = window.scrollY + window.innerHeight * 0.5;
        const centers = [];

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            centers.push(rect.top + window.scrollY + rect.height * 0.5);
        });

        const firstCenter = centers[0];
        const lastCenter = centers[centers.length - 1];
        const position = clamp(viewportCenter, firstCenter, lastCenter);
        let index = centers.length - 1;

        for (let step = 0; step < centers.length - 1; step += 1) {
            const start = centers[step];
            const end = centers[step + 1];

            if (position <= start) {
                index = step;
                break;
            }

            if (position <= end) {
                const span = Math.max(end - start, 1);
                index = step + (position - start) / span;
                break;
            }
        }

        sectionTarget = index;
        scrollTarget = clamp(index / (centers.length - 1), 0, 1);

        if (reducedMotionQuery.matches) {
            sectionProgress = sectionTarget;
            scrollProgress = scrollTarget;
            render(performance.now());
        }
    }

    function drawBackground(time) {
        /*
         * Transparent cinematic overlay: the canvas is CLEARED and never
         * filled with an opaque rectangle, so each section's own
         * background stays visible underneath the Brain. Only soft,
         * semi-transparent atmosphere / glow / stars are painted.
         */
        context.clearRect(0, 0, width, height);

        const atmosphere = context.createRadialGradient(
            width * (0.56 + scrollProgress * 0.08),
            height * 0.46,
            0,
            width * 0.56,
            height * 0.46,
            Math.max(width, height) * 0.82
        );

        atmosphere.addColorStop(0, 'rgba(20, 96, 190, 0.16)');
        atmosphere.addColorStop(0.45, 'rgba(11, 52, 112, 0.06)');
        atmosphere.addColorStop(1, 'rgba(4, 16, 40, 0)');
        context.fillStyle = atmosphere;
        context.fillRect(0, 0, width, height);

        const glow = context.createRadialGradient(
            width * (0.77 - scrollProgress * 0.05),
            height * 0.33,
            0,
            width * 0.77,
            height * 0.33,
            Math.min(width, height) * 0.56
        );

        glow.addColorStop(0, 'rgba(22, 145, 255, 0.14)');
        glow.addColorStop(0.48, 'rgba(15, 88, 187, 0.05)');
        glow.addColorStop(1, 'rgba(15, 88, 187, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);

        if (pointer.active) {
            const pointerGlow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
            pointerGlow.addColorStop(0, 'rgba(73, 216, 255, 0.08)');
            pointerGlow.addColorStop(1, 'rgba(73, 216, 255, 0)');
            context.fillStyle = pointerGlow;
            context.fillRect(pointer.x - 180, pointer.y - 180, 360, 360);
        }

        stars.forEach((star) => {
            const twinkle = reducedMotionQuery.matches ? 1 : 0.72 + Math.sin(time * 0.001 + star.phase) * 0.28;
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(160, 223, 255, ${star.alpha * twinkle * (0.65 + star.depth * 0.35)})`;
            context.fill();
        });

        drawSpaceParticles(time);
    }

    function drawSpaceParticles(time) {
        const motionScale = reducedMotionQuery.matches ? 0 : 1;

        spaceParticles.forEach((particle) => {
            const depthMotion = scrollProgress * (particle.depth * 2 - 0.45) * 72;
            const driftX = Math.sin(time * 0.00012 * particle.drift + particle.phase) * 10 * motionScale;
            const driftY = Math.cos(time * 0.00016 * particle.drift + particle.phase) * 7 * motionScale;
            const x = ((particle.x + depthMotion + driftX) % width + width) % width;
            const y = ((particle.y + depthMotion * 0.24 + driftY) % height + height) % height;
            const depthScale = 0.72 + particle.depth * 0.7;
            const shimmer = reducedMotionQuery.matches
                ? 1
                : 0.78 + Math.sin(time * 0.0012 + particle.phase) * 0.22;

            context.beginPath();
            context.arc(x, y, particle.size * depthScale, 0, Math.PI * 2);
            context.fillStyle = `rgba(136, 213, 255, ${particle.alpha * shimmer * (0.55 + particle.depth * 0.45)})`;
            context.fill();
        });
    }

    function applySceneTransform(motion) {
        context.translate(head.centerX + motion.offsetX, head.centerY + motion.offsetY);
        context.rotate(motion.rotation);
        context.scale(motion.zoom * motion.scaleX, motion.zoom * motion.scaleY);
        context.translate(-head.centerX, -head.centerY);
    }

    function drawHeadSilhouette(time, motion) {
        const { centerX, centerY, radiusX, radiusY } = head;
        const pulse = reducedMotionQuery.matches ? 0 : Math.sin(time * 0.0011) * 1.5;

        context.save();
        applySceneTransform(motion);

        const profile = new Path2D();
        profile.moveTo(centerX + radiusX * 0.45, centerY - radiusY * 0.78);
        profile.bezierCurveTo(centerX + radiusX * 0.76, centerY - radiusY * 0.68, centerX + radiusX * 0.9, centerY - radiusY * 0.52, centerX + radiusX * 0.92, centerY - radiusY * 0.35);
        profile.quadraticCurveTo(centerX + radiusX * 0.94, centerY - radiusY * 0.2, centerX + radiusX * 1.17, centerY - radiusY * 0.14);
        profile.quadraticCurveTo(centerX + radiusX * 0.99, centerY - radiusY * 0.03, centerX + radiusX * 1.07, centerY + radiusY * 0.05);
        profile.quadraticCurveTo(centerX + radiusX * 0.95, centerY + radiusY * 0.18, centerX + radiusX * 0.72, centerY + radiusY * 0.25);
        profile.bezierCurveTo(centerX + radiusX * 0.78, centerY + radiusY * 0.45, centerX + radiusX * 0.69, centerY + radiusY * 0.61, centerX + radiusX * 0.52, centerY + radiusY * 0.72);

        context.strokeStyle = `rgba(111, 224, 255, ${0.44 + pulse * 0.015})`;
        context.lineWidth = 0.9 + pulse * 0.03;
        context.shadowColor = 'rgba(33, 170, 255, 0.3)';
        context.shadowBlur = 8;
        context.stroke(profile);
        context.shadowBlur = 0;

        const eye = new Path2D();
        eye.arc(centerX + radiusX * 0.65, centerY - radiusY * 0.3, radiusX * 0.025, 0, Math.PI * 2);
        context.fillStyle = 'rgba(194, 250, 255, 0.68)';
        context.fill(eye);

        const neck = new Path2D();
        neck.moveTo(centerX - radiusX * 0.2, centerY + radiusY * 0.88);
        neck.quadraticCurveTo(centerX - radiusX * 0.12, centerY + radiusY * 1.05, centerX - radiusX * 0.36, centerY + radiusY * 1.18);
        neck.moveTo(centerX + radiusX * 0.26, centerY + radiusY * 0.83);
        neck.quadraticCurveTo(centerX + radiusX * 0.21, centerY + radiusY * 1.05, centerX + radiusX * 0.49, centerY + radiusY * 1.13);
        context.strokeStyle = 'rgba(71, 180, 255, 0.25)';
        context.lineWidth = 0.8;
        context.stroke(neck);

        drawCortex(time, centerX, centerY, radiusX, radiusY);
        context.restore();
    }

    function drawCortex(time, centerX, centerY, radiusX, radiusY) {
        const fissure = new Path2D();
        fissure.moveTo(centerX + radiusX * 0.03, centerY - radiusY * 0.68);
        fissure.bezierCurveTo(centerX - radiusX * 0.14, centerY - radiusY * 0.3, centerX + radiusX * 0.13, centerY + radiusY * 0.05, centerX - radiusX * 0.02, centerY + radiusY * 0.63);
        context.strokeStyle = 'rgba(137, 237, 255, 0.3)';
        context.lineWidth = 0.8;
        context.stroke(fissure);

        const waveCount = 8;
        for (let index = 0; index < waveCount; index += 1) {
            const y = centerY - radiusY * 0.62 + index * radiusY * 0.17;
            const drift = reducedMotionQuery.matches ? 0 : Math.sin(time * 0.0008 + index) * 2;
            const wave = new Path2D();

            wave.moveTo(centerX - radiusX * 0.62, y + drift);
            wave.bezierCurveTo(centerX - radiusX * 0.32, y - radiusY * 0.1, centerX - radiusX * 0.14, y + radiusY * 0.1, centerX + radiusX * 0.02, y);
            wave.bezierCurveTo(centerX + radiusX * 0.2, y - radiusY * 0.1, centerX + radiusX * 0.39, y + radiusY * 0.08, centerX + radiusX * 0.69, y - drift);
            context.strokeStyle = `rgba(48, 167, 255, ${0.13 + index * 0.008})`;
            context.lineWidth = 0.55;
            context.stroke(wave);
        }

    }

    function getEcosystemPosition(element, time) {
        const drift = reducedMotionQuery.matches ? 0 : Math.sin(time * 0.00055 + element.phase) * 4;
        const distanceX = head.radiusX * element.distance;
        const distanceY = head.radiusY * element.distance;

        return {
            x: head.centerX + Math.cos(element.angle) * distanceX,
            y: head.centerY + Math.sin(element.angle) * distanceY + drift
        };
    }

    function drawEcosystemIcon(icon, x, y, size, active) {
        const stroke = active ? 'rgba(205, 252, 255, 0.95)' : 'rgba(116, 220, 255, 0.78)';

        context.save();
        context.translate(x, y);
        context.strokeStyle = stroke;
        context.fillStyle = active ? 'rgba(139, 240, 255, 0.2)' : 'rgba(63, 160, 255, 0.13)';
        context.lineWidth = 1;

        if (icon === 'search') {
            context.beginPath();
            context.arc(-1, -1, size * 0.28, 0, Math.PI * 2);
            context.moveTo(size * 0.12, size * 0.12);
            context.lineTo(size * 0.36, size * 0.36);
            context.stroke();
        } else if (icon === 'growth') {
            context.beginPath();
            context.moveTo(-size * 0.3, size * 0.26);
            context.lineTo(-size * 0.04, -size * 0.02);
            context.lineTo(size * 0.08, size * 0.1);
            context.lineTo(size * 0.36, -size * 0.3);
            context.stroke();
            context.beginPath();
            context.moveTo(size * 0.19, -size * 0.3);
            context.lineTo(size * 0.36, -size * 0.3);
            context.lineTo(size * 0.36, -size * 0.13);
            context.stroke();
        } else if (icon === 'chart') {
            context.beginPath();
            context.moveTo(-size * 0.34, size * 0.3);
            context.lineTo(-size * 0.34, -size * 0.25);
            context.lineTo(size * 0.34, -size * 0.25);
            context.lineTo(size * 0.34, size * 0.3);
            context.closePath();
            context.stroke();
            context.beginPath();
            context.moveTo(-size * 0.2, size * 0.12);
            context.lineTo(-size * 0.02, -size * 0.04);
            context.lineTo(size * 0.11, size * 0.06);
            context.lineTo(size * 0.25, -size * 0.14);
            context.stroke();
        } else if (icon === 'content') {
            context.beginPath();
            context.rect(-size * 0.3, -size * 0.32, size * 0.6, size * 0.64);
            context.moveTo(-size * 0.16, -size * 0.1);
            context.lineTo(size * 0.18, -size * 0.1);
            context.moveTo(-size * 0.16, size * 0.08);
            context.lineTo(size * 0.18, size * 0.08);
            context.stroke();
        } else if (icon === 'social') {
            context.beginPath();
            context.arc(0, 0, size * 0.28, 0, Math.PI * 2);
            context.arc(-size * 0.31, size * 0.2, size * 0.12, 0, Math.PI * 2);
            context.arc(size * 0.31, size * 0.2, size * 0.12, 0, Math.PI * 2);
            context.moveTo(-size * 0.21, size * 0.12);
            context.lineTo(-size * 0.06, size * 0.04);
            context.moveTo(size * 0.21, size * 0.12);
            context.lineTo(size * 0.06, size * 0.04);
            context.stroke();
        } else {
            context.beginPath();
            context.moveTo(0, -size * 0.36);
            context.lineTo(size * 0.3, -size * 0.16);
            context.lineTo(size * 0.23, size * 0.24);
            context.lineTo(0, size * 0.38);
            context.lineTo(-size * 0.23, size * 0.24);
            context.lineTo(-size * 0.3, -size * 0.16);
            context.closePath();
            context.fill();
            context.stroke();
        }
        context.restore();
    }

    function drawEcosystem(time, motion) {
        const scenePointer = getScenePointer(motion.zoom);
        const mobile = width < 600;
        const cardWidth = mobile ? 62 : 78;
        const cardHeight = mobile ? 23 : 27;

        context.save();
        applySceneTransform(motion);

        ecosystem.forEach((element) => {
            const position = getEcosystemPosition(element, time);
            const distance = Math.hypot(scenePointer.x - position.x, scenePointer.y - position.y);
            const active = pointer.active && distance < 120;
            const float = reducedMotionQuery.matches ? 0 : Math.sin(time * 0.0008 + element.phase) * 1.5;
            const cardX = position.x - cardWidth / 2;
            const cardY = position.y - cardHeight / 2 + float;
            const anchorX = head.centerX + (position.x - head.centerX) * 0.58;
            const anchorY = head.centerY + (position.y - head.centerY) * 0.58;

            context.beginPath();
            context.moveTo(anchorX, anchorY);
            context.lineTo(position.x, position.y + float);
            context.strokeStyle = active ? 'rgba(114, 238, 255, 0.48)' : 'rgba(62, 156, 236, 0.16)';
            context.lineWidth = active ? 0.9 : 0.55;
            context.stroke();

            context.fillStyle = active ? 'rgba(9, 42, 69, 0.84)' : 'rgba(5, 22, 43, 0.7)';
            context.strokeStyle = active ? 'rgba(142, 244, 255, 0.72)' : 'rgba(93, 193, 255, 0.32)';
            context.lineWidth = 0.7;
            context.beginPath();
            context.roundRect(cardX, cardY, cardWidth, cardHeight, cardHeight / 2);
            context.fill();
            context.stroke();

            drawEcosystemIcon(element.icon, cardX + 13, cardY + cardHeight / 2, mobile ? 10 : 12, active);
            context.font = `600 ${mobile ? 7 : 8}px Arial, sans-serif`;
            context.letterSpacing = '0.04em';
            context.fillStyle = active ? 'rgba(235, 254, 255, 0.96)' : 'rgba(177, 226, 255, 0.74)';
            context.textBaseline = 'middle';
            context.fillText(element.label.toUpperCase(), cardX + 24, cardY + cardHeight / 2 + 0.5);
        });
        context.restore();
    }

    function updateNodes(delta, time, zoom) {
        const scenePointer = getScenePointer(zoom);
        const spring = Math.min(0.075, delta * 0.0045);
        const damping = Math.pow(0.88, delta / 16.67);
        const motionScale = reducedMotionQuery.matches ? 0 : 1;

        nodes.forEach((node) => {
            const distanceX = scenePointer.x - node.x;
            const distanceY = scenePointer.y - node.y;
            const distance = Math.hypot(distanceX, distanceY);
            const influence = pointer.active && distance < 190 ? (190 - distance) / 190 : 0;
            const magneticForce = influence * 0.22 * motionScale;
            const idleX = Math.sin(time * 0.0007 + node.phase) * 0.7 * motionScale;
            const idleY = Math.cos(time * 0.0006 + node.phase) * 0.7 * motionScale;

            node.vx += (node.baseX + idleX - node.x) * spring;
            node.vy += (node.baseY + idleY - node.y) * spring;
            node.vx += distanceX / Math.max(distance, 1) * magneticForce;
            node.vy += distanceY / Math.max(distance, 1) * magneticForce;
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx * motionScale;
            node.y += node.vy * motionScale;
        });
    }

    function updateParticles(delta, zoom, time) {
        const scenePointer = getScenePointer(zoom);
        const motionScale = reducedMotionQuery.matches ? 0 : 1;

        particles.forEach((particle) => {
            const distanceX = scenePointer.x - particle.x;
            const distanceY = scenePointer.y - particle.y;
            const distance = Math.hypot(distanceX, distanceY);
            const influence = pointer.active && distance < 240 ? (240 - distance) / 240 : 0;
            const attraction = influence * 0.0009 * delta * particle.depth * motionScale;
            const drift = motionScale * delta * 0.00018;

            particle.vx += distanceX / Math.max(distance, 1) * attraction;
            particle.vy += distanceY / Math.max(distance, 1) * attraction;
            particle.vx += Math.sin(particle.phase + time * 0.0003) * drift;
            particle.vy += Math.cos(particle.phase + time * 0.00025) * drift;
            particle.vx *= 0.985;
            particle.vy *= 0.985;
            particle.x += particle.vx * motionScale;
            particle.y += particle.vy * motionScale;

            const returnForce = 0.00045 * delta;
            particle.x += (particle.baseX - particle.x) * returnForce;
            particle.y += (particle.baseY - particle.y) * returnForce;
        });
    }

    function drawSceneParticles(time, motion) {
        context.save();
        applySceneTransform(motion);

        particles.forEach((particle) => {
            const shimmer = reducedMotionQuery.matches ? 1 : 0.72 + Math.sin(time * 0.0018 + particle.phase) * 0.28;
            const depthScale = 0.8 + particle.depth * 0.35;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size * depthScale, 0, Math.PI * 2);
            context.fillStyle = `rgba(107, 221, 255, ${particle.alpha * shimmer * (0.72 + particle.depth * 0.28)})`;
            context.fill();
        });
        context.restore();
    }

    function drawConnections(time, motion) {
        const scenePointer = getScenePointer(motion.zoom);
        const maxDistance = Math.min(118, Math.max(72, width * 0.105));

        context.save();
        applySceneTransform(motion);

        for (let first = 0; first < nodes.length; first += 1) {
            for (let second = first + 1; second < nodes.length; second += 1) {
                const nodeA = nodes[first];
                const nodeB = nodes[second];
                const distance = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);

                if (distance > maxDistance) {
                    continue;
                }

                const midpointX = (nodeA.x + nodeB.x) / 2;
                const midpointY = (nodeA.y + nodeB.y) / 2;
                const proximity = 1 - distance / maxDistance;
                const activeDistance = Math.min(
                    Math.hypot(scenePointer.x - midpointX, scenePointer.y - midpointY),
                    Math.hypot(scenePointer.x - nodeA.x, scenePointer.y - nodeA.y),
                    Math.hypot(scenePointer.x - nodeB.x, scenePointer.y - nodeB.y)
                );
                const interaction = pointer.active ? Math.max(0, 1 - activeDistance / 220) : 0;
                const shimmer = reducedMotionQuery.matches ? 0 : (Math.sin(time * 0.0014 + first * 0.65) + 1) * 0.5;
                const depth = (nodeA.depth + nodeB.depth + 2) * 0.25;
                const alpha = (0.07 + proximity * 0.2 + interaction * 0.5 + shimmer * 0.035) * (0.72 + depth * 0.28);

                context.beginPath();
                context.moveTo(nodeA.x, nodeA.y);
                context.lineTo(nodeB.x, nodeB.y);
                context.strokeStyle = interaction > 0.2
                    ? `rgba(112, 235, 255, ${alpha})`
                    : `rgba(47, 143, 238, ${alpha})`;
                context.lineWidth = 0.45 + interaction * 1.05;
                context.stroke();

                if (proximity > 0.25 && (first * 7 + second) % 11 === 0) {
                    const travel = reducedMotionQuery.matches ? 0.5 : (time * 0.00032 + first * 0.19 + second * 0.07) % 1;
                    const energyX = nodeA.x + (nodeB.x - nodeA.x) * travel;
                    const energyY = nodeA.y + (nodeB.y - nodeA.y) * travel;
                    context.beginPath();
                    context.arc(energyX, energyY, 1.1 + interaction, 0, Math.PI * 2);
                    const pulseAlpha = 0.12 + interaction * 0.62 + (Math.sin(time * 0.001 + first) + 1) * 0.04;
                    context.fillStyle = `rgba(215, 252, 255, ${pulseAlpha})`;
                    context.fill();
                }
            }
        }
        context.restore();
    }

    function drawNodes(time, motion) {
        const scenePointer = getScenePointer(motion.zoom);

        context.save();
        applySceneTransform(motion);

        nodes.forEach((node) => {
            const distance = Math.hypot(scenePointer.x - node.x, scenePointer.y - node.y);
            const interaction = pointer.active ? Math.max(0, 1 - distance / 170) : 0;
            const pulse = reducedMotionQuery.matches ? 0.5 : (Math.sin(time * 0.002 + node.phase) + 1) * 0.5;
            const depthScale = 0.84 + (node.depth + 1) * 0.12;
            const radius = (node.radius + interaction * 2.25 + pulse * 0.4) * depthScale;

            if (interaction > 0) {
                context.beginPath();
                context.arc(node.x, node.y, radius * 4.8, 0, Math.PI * 2);
                context.fillStyle = `rgba(37, 195, 255, ${interaction * 0.09})`;
                context.fill();
            }

            context.beginPath();
            context.arc(node.x, node.y, radius, 0, Math.PI * 2);
            context.fillStyle = interaction > 0.15 ? '#efffff' : node.energy > 0.72 ? '#83edff' : '#2f9ff1';
            context.shadowColor = interaction > 0 ? '#9cf5ff' : '#168ed8';
            context.shadowBlur = 5 + interaction * 13;
            context.fill();
            context.shadowBlur = 0;
        });
        context.restore();
    }

    function render(time) {
        if (!head) {
            return;
        }

        const delta = Math.min(40, Math.max(0, time - lastTime));
        lastTime = time;
        const smoothing = reducedMotionQuery.matches ? 1 : 0.06;
        scrollProgress += (scrollTarget - scrollProgress) * smoothing;
        sectionProgress += (sectionTarget - sectionProgress) * smoothing;
        const motion = getSceneMotion(time);

        drawBackground(time);
        updateNodes(delta, time, motion.zoom);
        updateParticles(delta, motion.zoom, time);
        drawEcosystem(time, motion);
        drawSceneParticles(time, motion);
        drawHeadSilhouette(time, motion);
        drawConnections(time, motion);
        drawNodes(time, motion);

    }

    function scheduleFrame() {
        if (animationFrame || !pageVisible || reducedMotionQuery.matches) {
            return;
        }

        animationFrame = window.requestAnimationFrame((time) => {
            animationFrame = 0;
            render(time);
            scheduleFrame();
        });
    }

    function updatePointer(event) {
        const bounds = canvas.getBoundingClientRect();

        pointer.x = event.clientX - bounds.left;
        pointer.y = event.clientY - bounds.top;
        pointer.active = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
        scheduleFrame();
    }

    function resetPointer() {
        pointer.active = false;
        pointer.x = -1000;
        pointer.y = -1000;
    }

    function updateVisibility() {
        pageVisible = !document.hidden;

        if (!pageVisible) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            window.clearTimeout(serviceTimer);
            window.clearTimeout(serviceTimeout);
            serviceTimer = 0;
            serviceTimeout = 0;
            return;
        }

        lastTime = performance.now();
        render(lastTime);
        scheduleFrame();
        scheduleServiceRotation();
    }

    function scheduleServiceRotation() {
        if (serviceTimer || serviceTimeout || reducedMotionQuery.matches || !pageVisible) {
            return;
        }

        serviceTimer = window.setTimeout(() => {
            serviceTimer = 0;
            typeServiceMessage(serviceMessages[serviceIndex], 0);
        }, 1200);
    }

    function typeServiceMessage(message, characterIndex) {
        const messageElement = document.querySelector('[data-service-text]');

        if (!messageElement || !pageVisible || reducedMotionQuery.matches) {
            return;
        }

        messageElement.textContent = message.slice(0, characterIndex);

        if (characterIndex < message.length) {
            serviceTimeout = window.setTimeout(() => {
                serviceTimeout = 0;
                typeServiceMessage(message, characterIndex + 1);
            }, 62);
            return;
        }

        serviceTimer = window.setTimeout(() => {
            serviceTimer = 0;
            deleteServiceMessage(message, message.length);
        }, 1250);
    }

    function deleteServiceMessage(message, characterIndex) {
        const messageElement = document.querySelector('[data-service-text]');

        if (!messageElement || !pageVisible || reducedMotionQuery.matches) {
            return;
        }

        messageElement.textContent = message.slice(0, characterIndex);

        if (characterIndex > 0) {
            serviceTimeout = window.setTimeout(() => {
                serviceTimeout = 0;
                deleteServiceMessage(message, characterIndex - 1);
            }, 38);
            return;
        }

        serviceIndex = (serviceIndex + 1) % serviceMessages.length;
        serviceTimer = window.setTimeout(() => {
            serviceTimer = 0;
            typeServiceMessage(serviceMessages[serviceIndex], 0);
        }, 240);
    }

    function setupServiceRotation() {
        const messageElement = document.querySelector('[data-service-text]');

        if (!messageElement) {
            return;
        }

        messageElement.setAttribute('aria-live', 'polite');
        messageElement.setAttribute('aria-atomic', 'true');
        scheduleServiceRotation();
    }

    canvas.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('blur', resetPointer, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    document.addEventListener('visibilitychange', updateVisibility);

    resize();
    updateScrollTarget();
    setupServiceRotation();
})();