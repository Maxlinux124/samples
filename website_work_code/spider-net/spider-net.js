const canvas = document.getElementById('spiderWebCanvas');
const ctx = canvas.getContext('2d');

// Canvas ko full size karna
function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let points = [];
let mouse = { x: null, y: null };

// Mouse movement track karne ke liye
window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    
    // Har mouse move par naya point add hoga (Pygame ki tarah)
    points.push({ x: mouse.x, y: mouse.y, life: 100 });
});

function animate() {
    // Screen clear karna (Pygame screen.fill ke jaise)
    ctx.fillStyle = 'rgba(10, 10, 15, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Points ki life kam karna aur expire points ko hatana
    for (let i = points.length - 1; i >= 0; i--) {
        points[i].life -= 1;
        if (points[i].life <= 0) {
            points.splice(i, 1);
        }
    }

    // Lines draw karne ka logic (Pygame wala double loop)
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const p1 = points[i];
            const p2 = points[j];

            // Distance nikalna (math.hypot)
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 80) {
                // Alpha/Opacity calculate karna
                const alpha = Math.max(0, 1 - (dist / 80));
                
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                
                // Pygame color (100, 200, 255) ko web format me badla
                ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    // Mouse par chota circle banana (Pygame draw.circle)
    if (mouse.x !== null && mouse.y !== null) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    // Agla frame call karna (60fps target)
    requestAnimationFrame(animate);
}

// Animation start karein
animate();

// Agar mouse screen se bahar jaye toh circle gayab ho jaye
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});