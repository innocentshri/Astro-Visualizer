// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- 1. THREE.JS 3D UNIVERSE SETUP ---
const canvas = document.querySelector('#universe-canvas');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 50; // Start back a bit

// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for retina

// --- 2. CREATE THE INFINITE STARFIELD ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000; // 5000 stars
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread stars widely across X, Y, and deep into the Z axis
    posArray[i] = (Math.random() - 0.5) * 500;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.5,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const starMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(starMesh);

// --- 3. CREATE HOLOGRAPHIC PLANET ---
// This acts as the visual anchor in the 3D space
const planetGeometry = new THREE.SphereGeometry(15, 32, 32);
const planetMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xb026ff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.15 
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(20, 0, -50); // Position it off to the right and deep in space
scene.add(planet);

// --- 4. ANIMATION LOOP ---
const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;

// Mouse tracking for subtle camera parallax
window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
});

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Slowly rotate the universe and the planet
    starMesh.rotation.y = elapsedTime * 0.02;
    planet.rotation.y = elapsedTime * 0.1;
    planet.rotation.x = elapsedTime * 0.05;

    // Subtle camera movement based on mouse (Parallax)
    camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 5. SCROLL INTERACTIONS & GSAP ---

// A. Move the 3D camera through the starfield when scrolling
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrubbing
    onUpdate: (self) => {
        // Move camera forward on Z axis
        camera.position.z = 50 - (self.progress * 150);
        
        // Update HUD coordinates
        document.getElementById('coordinates').innerText = 
            `${Math.round(camera.position.x)}, ${Math.round(camera.position.y)}, ${Math.round(camera.position.z)}`;
    }
});

// B. Animate HTML UI elements entering the screen
gsap.utils.toArray('.glass-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1, // Stagger effect
        ease: "power3.out"
    });
});

gsap.from(".massive-title", { y: 100, opacity: 0, duration: 1.5, ease: "power4.out" });

// --- 6. AUDIO SYSTEM (Foundation) ---
const audioBtn = document.getElementById('audio-toggle');
let audioPlaying = false;
// Note: Browsers block autoplay. Create an audio object here with a valid URL later.
const ambientSound = new Audio(); 

audioBtn.addEventListener('click', () => {
    audioPlaying = !audioPlaying;
    if(audioPlaying) {
        audioBtn.innerText = "AUDIO: ON";
        audioBtn.style.background = "var(--accent-cyan)";
        audioBtn.style.color = "#000";
        // ambientSound.play();
    } else {
        audioBtn.innerText = "AUDIO: OFF";
        audioBtn.style.background = "none";
        audioBtn.style.color = "var(--accent-cyan)";
        // ambientSound.pause();
    }
});
