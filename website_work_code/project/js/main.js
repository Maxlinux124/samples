const container = document.getElementById("scene-container");

// 1. Scene & Camera Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.015); // Depth control ke liye fog

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 40;

// 2. Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
renderer.toneMapping = THREE.ReinternalToneMapping;
container.appendChild(renderer.domElement);

// 3. Post-Processing (The Magic Bloom/Glow effect)
const renderScene = new THREE.RenderPass(scene, camera);
// Parameters: resolution, strength, radius, threshold
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.15);

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// 4. Advanced Particle System (With Sin/Cos Mathematical Structure for Trails)
const particleCount = 20000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3); // Physics calculations ke liye

for (let i = 0; i < particleCount; i++) {
    // Ek elegant vertical cylinder/helix shape generate karne ke liye
    const theta = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 8; 
    const y = (Math.random() - 0.5) * 60;

    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius;

    // Baseline store kar rhe hain jisse animation smooth noise generate kare
    initialPositions[i * 3] = positions[i * 3];
    initialPositions[i * 3 + 1] = positions[i * 3 + 1];
    initialPositions[i * 3 + 2] = positions[i * 3 + 2];
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Premium Cyberpunk Cyan/Green Tone
const material = new THREE.PointsMaterial({
    color: 0x00ffcc, 
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending // Isse particles overlap hone par jyada glow karenge
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// 5. Mouse Interaction Variables
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

window.addEventListener('mousemove', (event) => {
    // Normalized coordinates (-0.5 to 0.5)
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// 6. Animation Loop (Noise, Interactivity, Trails)
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime() * 0.5;
    const positionsArray = geometry.attributes.position.array;

    // Smooth Mouse Lerping (Cinematic Camera easing)
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Camera organic movement
    camera.position.x = targetX * 15;
    camera.position.y = -targetY * 15;
    camera.lookAt(0, 0, 0);

    // Particle Interaction & Noise Shader Simulation
    for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        
        // Initial setup ko base banakar waves (Sine/Cosine noise) produce karna
        const initX = initialPositions[idx];
        const initY = initialPositions[idx + 1];
        const initZ = initialPositions[idx + 2];

        // Wave effect (Noise physics emulation)
        positionsArray[idx] = initX + Math.sin(time + initY * 0.1) * 2.0;
        positionsArray[idx + 2] = initZ + Math.cos(time + initX * 0.1) * 2.0;

        // Interactive Attraction: Mouse ke paas aane par particles ka halka tilt hona
        positionsArray[idx] += targetX * 3.0 * (1.0 - Math.abs(initY)/30); 
    }
    
    geometry.attributes.position.needsUpdate = true;

    // Slow rotation over time
    particles.rotation.y = time * 0.05;

    // Render via Composer (Not renderer) to apply Bloom
    composer.render();
}

animate();

// 7. Responsive Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});