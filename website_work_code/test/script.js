// --- MOUSE MOVEMENT GLOW EFFECT ---
const glow = document.getElementById('pointerGlow');
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// --- SPOTLIGHT EFFECT FOR CARDS ---
const cards = document.querySelectorAll('.service-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});

// --- ELECTRIC MATRIX BACKGROUND CANVAS ---
const canvas = document.getElementById('electricCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.life = Math.random() * 100 + 50;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.life <= 0) {
            this.reset();
        }
    }
    draw() {
        ctx.fillStyle = `rgba(0, 210, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Spark/Lightning effect array
const particles = [];
const maxParticles = 60;

for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw and Update Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Random Electric Bolt trigger
    if (Math.random() < 0.03) {
        drawLightning();
    }

    requestAnimationFrame(animate);
}

// Micro-lightning flashes simulating high tech energy
function drawLightning() {
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    let startX = Math.random() * width;
    let startY = Math.random() * (height * 0.3); // trigger near top/mid
    
    ctx.moveTo(startX, startY);
    
    for (let i = 0; i < 5; i++) {
        startX += (Math.random() - 0.5) * 40;
        startY += Math.random() * 30 + 10;
        ctx.lineTo(startX, startY);
    }
    ctx.stroke();
}

animate();