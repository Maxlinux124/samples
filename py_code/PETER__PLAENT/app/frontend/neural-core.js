const NEURON_COLORS = [
    "#3b82f6",
    "#22d3ee",
    "#a5f3fc",
    "#7dd3fc",
    "#38bdf8"
];

class NeuralEngine {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ui = ui || {};
        this.ctx = canvas.getContext("2d");

        this.nodes = [];
        this.particles = [];
        this.connections = [];

        this.maxNodes = 42;
        this.maxParticles = 96;
        this.pause = false;
        this.lastTime = 0;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 30;
        this.animId = 0;

        this.state = "IDLE";
        this.idlePulse = 0;
        this.listeningPulse = 0;
        this.processingPulse = 0;
        this.speakingPulse = 0;

        this.width = 0;
        this.height = 0;
        this.dpr = 1;

        this.coreSize = 0;
        this.coreVelX = 0;
        this.coreVelY = 0;

        this.micLevel = 0;
        this.animPeriod = 0;

        this.init();
    }

    init() {
        const rect = this.canvas.getBoundingClientRect();
        this.resize(rect.width, rect.height);
        this.resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            this.resize(width, height);
        });
        this.resizeObserver.observe(this.canvas.parentElement || this.canvas);
        this.handleVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(this.animId);
                this.animId = 0;
            } else {
                this.start();
            }
        };
        document.addEventListener("visibilitychange", this.handleVisibilityChange);
        for (let i = 0; i < 22; i++) {
            this.addNode();
        }

        this.state = "IDLE";
        this.updateCoreText();
    }

    resize(width, height) {
        const previousWidth = this.width;
        const previousHeight = this.height;
        this.width = width || this.canvas.clientWidth || 800;
        this.height = height || this.canvas.clientHeight || 600;
        this.dpr = Math.min(window.devicePixelRatio || 1, 1.25);

        if (previousWidth && previousHeight) {
            const scaleX = this.width / previousWidth;
            const scaleY = this.height / previousHeight;
            for (const point of [...this.nodes, ...this.particles]) {
                point.x *= scaleX;
                point.y *= scaleY;
            }
        }

        this.canvas.width = Math.max(1, Math.round(this.width * this.dpr));
        this.canvas.height = Math.max(1, Math.round(this.height * this.dpr));

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.canvas.style.width = this.width + "px";
        this.canvas.style.height = this.height + "px";

        this.coreSize = Math.min(this.width, this.height) * 0.06;
    }

    start() {
        if (this.animId || document.hidden) return;
        this.lastTime = performance.now();
        this.lastFrameTime = 0;
        this.animId = requestAnimationFrame((now) => this.loop(now));
    }

    destroy() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = 0;
        }
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
        this.resizeObserver.disconnect();
        this.nodes = [];
        this.particles = [];
        this.connections = [];
        this.threads = [];
    }

    setState(nextState) {
        this.state = nextState || "IDLE";
        this.updateCoreText();
    }

    updateCoreText() {
        const label = this.ui.coreLabel;
        const sub = this.ui.coreSub;
        const map = {
            IDLE: ["PETER CORE", "STANDBY"],
            LISTENING: ["LISTENING", "", "blue"],
            PROCESSING: ["PROCESSING REQUEST", "", "cyan"],
            SPEAKING: ["PETER IS SPEAKING", "", "cyan"],
            ERROR: ["NETWORK ERROR", ""]
        };
        const entry = map[this.state] || map.IDLE;
        if (label) label.textContent = entry[0] || "";
        if (sub) {
            sub.textContent = entry[1] || "";
            sub.style.color = entry[2] || "";
        }
    }

    loop(now) {
        if (document.hidden) {
            this.animId = 0;
            return;
        }
        if (now - this.lastFrameTime < this.frameInterval) {
            this.animId = requestAnimationFrame((t) => this.loop(t));
            return;
        }

        const dt = Math.min(0.05, (now - this.lastTime) / 1000);
        this.lastTime = now;
        this.lastFrameTime = now;

        if (this.pause) {
            this.render(dt, now);
            this.animId = requestAnimationFrame((t) => this.loop(t));
            return;
        }

        if (document.hidden) {
            this.render(dt, now);
            this.animId = requestAnimationFrame((t) => this.loop(t));
            return;
        }

        const statePulse = this.state === "LISTENING"
            ? Math.sin(now * 0.006) * 0.25
            : 0;

        this.micLevel = Math.max(0, Math.min(0.9, this.micLevel + (statePulse * 0.06)));

        this.updateCorePulse(dt, now, statePulse);
        this.buildGraph();
        this.updateParticles(dt);
        this.render(dt, now);

        this.animId = requestAnimationFrame((t) => this.loop(t));
    }

    updateCorePulse(dt, now, base) {
        this.coreVelX += (Math.random() - 0.5) * 0.002;
        this.coreVelY += (Math.random() - 0.5) * 0.002;
        this.coreVelX = Math.max(-0.01, Math.min(0.01, this.coreVelX));
        this.coreVelY = Math.max(-0.01, Math.min(0.01, this.coreVelY));

        this.coreRingColors = this.coreRingColors || [];
        this.coreRingColors.push(
            this.hslToRgb(
                this.state === "LISTENING" ? 200 : 210,
                0.75,
                0.45 + Math.sin(now * 0.002) * base * 0.5
            )
        );
    }

    buildGraph() {
        if (!this.nodes.length) return;

        const nextNodes = Math.min(this.maxNodes, Math.floor(this.nodes.length * 1.25));

        while (this.nodes.length < nextNodes) {
            this.addNode();
        }

        const connections = [];
        const seen = new Set();

        for (let i = 0; i < this.nodes.length; i++) {
            const point = this.nodes[i];

            if (i === 0 || i % 3 === 0) {
                this.trail = this.trail || [];
                this.trail.push({ x: point.x, y: point.y, ring: 0, distance: 0 });
            }

            const nearby = this.findNear(point, this.nodes, 80, 230);

            for (let j = 0; j < nearby.length; j++) {
                const target = nearby[j];
                if (seen.has(point.id + "-" + target.id)) continue;
                if (seen.has(target.id + "-" + point.id)) continue;

                const distance = Math.hypot(point.x - target.x, point.y - target.y);
                const weight = 1 - Math.min(distance / 260, 1);

                if (weight > 0.48) {
                    connections.push({ from: point, to: target, weight, distance });
                    seen.add(point.id + "-" + target.id);
                }
            }
        }

        this.connections = connections;
    }

    findNear(point, nodes, radius, maxDistance) {
        const nearby = [];
        for (let k = 0; k < nodes.length; k++) {
            const other = nodes[k];
            if (other === point) continue;
            const distance = Math.hypot(point.x - other.x, point.y - other.y);
            if (distance <= radius || distance <= maxDistance) {
                nearby.push(other);
                if (nearby.length >= 100) break;
            }
        }
        return nearby;
    }

    addNode() {
        const x = this.width * 0.1 + Math.random() * this.width * 0.8;
        const y = this.height * 0.05 + Math.random() * this.height * 0.9;
        const id = Date.now() + "-" + Math.random().toString(16).slice(2, 8);

        this.nodes.push({ id, x, y, hue: Math.random() * 38 + 190, alpha: 0.7 + Math.random() * 0.3 });
    }

    updateParticles(dt) {
        const len = Math.floor(this.maxParticles * (0.4 + this.micLevel * 0.5));
        for (let i = 0; i < len; i++) {
            if (this.particles.length < len) {
                this.particles.push(this.createParticle());
            } else {
                this.particles[i].life -= dt;
            }
        }

        while (this.particles.length > len) this.particles.pop();

        for (const particle of this.particles) {
            particle.x += (Math.random() - 0.5) * 120 * dt;
            particle.y += (Math.random() - 0.5) * 120 * dt;
            particle.life -= dt * (0.4 + this.micLevel * 0.6);
            particle.phase = (particle.phase + dt * (25 + this.micLevel * 30)) % (Math.PI * 2);
        }

        this.particles = this.particles.filter((p) => p.life > 0);
    }

    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            speed: 5 + Math.random() * 30,
            size: 1.2 + Math.random() * 2.4,
            phase: Math.random() * Math.PI * 2,
            life: 0.2 + Math.random() * 0.3,
            hue: Math.random() * 42 + 185,
            alpha: 0.5 + Math.random() * 0.5
        };
    }

    render(dt, now) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = "rgba(6, 10, 18, 0.25)";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 160 + 120 * Math.sin(dt * 0.2), 0, Math.PI * 2, false);
        ctx.fill();

        for (const particle of this.particles) {
            const a = this.state === "LISTENING" ? 0.75 : 0.45;
            const alpha = particle.alpha * a;

            const x = particle.x + Math.sin(particle.phase) * 50;
            const y = particle.y + Math.cos(particle.phase) * 50;

            const size = (this.micLevel * 4) * 1.6 + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(particle.hue + this.micLevel * 40) % 360}, 85%, 65%, ${alpha})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, size * 2.1, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(particle.hue + 90) % 360}, 70%, 75%, ${alpha * 0.2})`;
            ctx.fill();
        }

        const activeConnections = this.connections.filter((c) => c.weight > 0.56);

        for (const connection of activeConnections) {
            const alpha = connection.weight * 0.5 * (0.5 + Math.sin(now * 0.006) * 0.5);
            const color = `hsla(${(connection.from.hue + this.micLevel * 20) % 360}, 85%, 65%, ${alpha})`;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.4 + connection.weight * 1.8;
            ctx.beginPath();
            ctx.moveTo(connection.from.x, connection.from.y);
            ctx.lineTo(connection.to.x, connection.to.y);
            ctx.stroke();
        }

        for (const node of this.nodes) {
            const pulse = this.micLevel * 0.6;
            const radius = 2 + pulse + 1.4 * node.alpha;

            const x = node.x;
            const y = node.y;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${node.hue}, 85%, 65%, ${node.alpha * 0.8})`;
            ctx.fill();

            ctx.shadowColor = `hsla(${node.hue}, 85%, 65%, 0.8)`;
            ctx.shadowBlur = 12 * pulse;
        }
    }

    hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.min(100, Math.max(0, s));
        l = Math.min(100, Math.max(0, l));

        const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l / 100 - c / 2;

        let r = 0;
        let g = 0;
        let b = 0;

        if (h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (h < 300) {
            r = x;
            g = 0;
            b = c;
        } else {
            r = c;
            g = 0;
            b = x;
        }

        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ];
    }
}

export { NeuralEngine };
