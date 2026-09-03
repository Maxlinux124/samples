const ring = document.getElementById('ring3D');
const cards = document.querySelectorAll('.card-item-3d');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('paginationDots');

let totalCards = cards.length;
let currentIndex = 0;

// Configuration
const angleUnit = 360 / totalCards; // 8 cards = 45 degree space per card
let targetRotation = 0;
let currentRotation = 0;

// Physics and Drag variables
let isDragging = false;
let startX = 0;
let startRotation = 0;
let lastX = 0;
let velocity = 0;
let lastTime = 0;
let autoRotateActive = true;
let autoRotateSpeed = 0.05; // Base auto rotation angle addition per frame
let animationFrameId;

// Radius setting for 3D Circle
const getRadius = () => {
    return window.innerWidth < 640 ? 250 : 390; // Mobile vs Desktop scale
};

// Render dynamic pagination dots
for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement('div');
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${i === 0 ? 'bg-emerald-400 w-6' : 'bg-white/10'}`;
    dot.setAttribute('data-dot-index', i);
    dot.classList.add('cursor-pointer');
    dotsContainer.appendChild(dot);
    
    dot.addEventListener('click', () => {
        goToCard(i);
    });
}

const dots = document.querySelectorAll('[data-dot-index]');

// Update Position on the 3D space
function update3DCarousel() {
    const radius = getRadius();
    
    // Apply current rotation to the parent ring
    ring.style.transform = `rotateY(${currentRotation}deg)`;

    cards.forEach((card, i) => {
        const cardBaseAngle = i * angleUnit;
        
        // Set initial positioning of the cards on the cylinder
        card.style.transform = `rotateY(${cardBaseAngle}deg) translateZ(${radius}px)`;

        // Highlight/Focus logic for front facing card
        // Calculate actual angle relative to front (0 degrees or 360 degrees)
        const relativeAngle = (cardBaseAngle + currentRotation) % 360;
        // Normalize angle between -180 and 180
        let normalizedAngle = ((relativeAngle + 180) % 360) - 180;
        if (normalizedAngle < -180) normalizedAngle += 360;

        const absAngle = Math.abs(normalizedAngle);

        // If card is facing front (roughly within 22.5 degrees range of 0)
        if (absAngle < 22.5) {
            card.classList.add('active-card');
            card.style.opacity = '1';
            card.style.filter = 'none';
            card.style.pointerEvents = 'auto';
            card.style.zIndex = '30';
        } else {
            card.classList.remove('active-card');
            // Back cards will blur, fade and scale down slightly
            card.style.opacity = '0.22';
            card.style.filter = 'blur(4px) scale(0.88)';
            card.style.pointerEvents = 'none';
            card.style.zIndex = '10';
        }
    });

    // Calculate current index based on rotation
    let calculatedIndex = Math.round(-currentRotation / angleUnit) % totalCards;
    if (calculatedIndex < 0) calculatedIndex += totalCards;
    
    currentIndex = calculatedIndex;

    // Highlight Dots
    dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
            dot.className = "w-6 h-2 rounded-full bg-emerald-400 transition-all duration-300";
        } else {
            dot.className = "w-2 h-2 rounded-full bg-white/20 transition-all duration-300";
        }
    });
}

// Snap to nearest card position smoothly
function snapToNearest() {
    const targetSnapAngle = Math.round(targetRotation / angleUnit) * angleUnit;
    targetRotation = targetSnapAngle;
}

function goToCard(index) {
    // Find shortest rotation path to card index
    let diff = index - currentIndex;
    if (diff > totalCards / 2) diff -= totalCards;
    if (diff < -totalCards / 2) diff += totalCards;

    targetRotation -= diff * angleUnit;
    snapToNearest();
}

// Physics Animation Loop
function animLoop() {
    if (isDragging) {
        // Dragging coordinates are directly set
        currentRotation += (targetRotation - currentRotation) * 0.4;
    } else {
        if (autoRotateActive) {
            // Slow idle rotate if active
            targetRotation -= autoRotateSpeed;
        }
        
        // Apply inertia momentum friction when decelerating
        if (Math.abs(velocity) > 0.05) {
            targetRotation += velocity;
            velocity *= 0.94; // Friction damping factor
        } else {
            if (!autoRotateActive && velocity !== 0) {
                velocity = 0;
                snapToNearest();
            }
        }

        // Smoothly slide to target rotation
        currentRotation += (targetRotation - currentRotation) * 0.1;
    }

    // Normalise angle to avoid infinite overflow numbers
    if (currentRotation > 3600) {
        currentRotation -= 3600;
        targetRotation -= 3600;
    } else if (currentRotation < -3600) {
        currentRotation += 3600;
        targetRotation += 3600;
    }

    update3DCarousel();
    animationFrameId = requestAnimationFrame(animLoop);
}

// Pointer/Mouse Drag Handlers
function onPointerDown(e) {
    isDragging = true;
    autoRotateActive = false;
    startX = e.clientX || e.touches?.[0]?.clientX;
    startRotation = targetRotation;
    lastX = startX;
    velocity = 0;
    lastTime = performance.now();
}

// Window load trigger
window.onload = function() {
    animLoop();
    drawParticles();
};

function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.clientX || e.touches?.[0]?.clientX;
    const deltaX = x - startX;
    
    // Translate drag distance into rotation angle
    const dragFactor = window.innerWidth < 640 ? 0.35 : 0.22;
    targetRotation = startRotation + (deltaX * dragFactor);

    // Calculate instantaneous drag velocity
    const now = performance.now();
    const timeDelta = now - lastTime;
    if (timeDelta > 0) {
        velocity = ((x - lastX) * dragFactor) / (timeDelta / 16);
    }
    lastX = x;
    lastTime = now;
}

function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    // Snapping behavior triggered if velocity is low
    if (Math.abs(velocity) < 0.15) {
        snapToNearest();
    }
}

// Event Listeners for drag rotation
const stage = document.querySelector('.stage-3d');
stage.addEventListener('mousedown', onPointerDown);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp);

stage.addEventListener('touchstart', onPointerDown, { passive: true });
window.addEventListener('touchmove', onPointerMove, { passive: true });
window.addEventListener('touchend', onPointerUp);

// Pause idle auto-rotation on mouse hover inside the stage
stage.addEventListener('mouseenter', () => {
    autoRotateActive = false;
});
stage.addEventListener('mouseleave', () => {
    if (!isDragging) {
        autoRotateActive = true;
        velocity = 0;
    }
});

// Basic Navigation Clicks
nextBtn.addEventListener('click', () => {
    autoRotateActive = false;
    targetRotation -= angleUnit;
    snapToNearest();
});

prevBtn.addEventListener('click', () => {
    autoRotateActive = false;
    targetRotation += angleUnit;
    snapToNearest();
});

// Keyboard Arrow Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        autoRotateActive = false;
        targetRotation += angleUnit;
        snapToNearest();
    } else if (e.key === 'ArrowRight') {
        autoRotateActive = false;
        targetRotation -= angleUnit;
        snapToNearest();
    }
});

// Background Particles Setup
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.2 + 0.1; // Slowly drift upwards
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y -= this.speedY;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for efficiency
    }
}

// Initialize particles
for (let i = 0; i < 45; i++) {
    particles.push(new Particle());
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(drawParticles);
}

// Keep responsive radius calculation safe on resize
window.addEventListener('resize', () => {
    update3DCarousel();
});