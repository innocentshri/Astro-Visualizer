gsap.registerPlugin(ScrollTrigger);

// --- CUSTOM CURSOR ---
const cursor = document.querySelector('.custom-cursor');
window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
});

// Cursor hover effects on interactables
document.querySelectorAll('button, .holo-card').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.5, borderColor: '#ff007f' }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, borderColor: '#00f0ff' }));
});

// --- THREE.JS IMMERSIVE UNIVERSE ---
const canvas = document.querySelector('#universe-canvas');
const scene = new THREE.Scene();

// Camera setup for deep space perspective
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.z = 2000; 

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Generate Starfield / Nebula Particles
const particlesCount = 15000;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

const colorCyan = new THREE.Color('#00f0ff');
const colorPurple = new THREE.Color('#b026ff');
const colorWhite = new THREE.Color('#ffffff');

for(let i = 0; i < particlesCount * 3; i+=3) {
    // Spread particles deep across Z-axis to allow flying through them
    posArray[i] = (Math.random() - 0.5) * 4000;     // X
    posArray[i+1] = (Math.random() - 0.5) * 4000;   // Y
    posArray[i+2] = (Math.random() - 0.5) * 8000;   // Z (Depth)

    // Mix colors for nebula effect
    const mixRatio = Math.random();
    let starColor = colorWhite;
    if(mixRatio > 0.6) starColor = colorCyan;
    if(mixRatio > 0.85) starColor = colorPurple;

    colorsArray[i] = starColor.r;
    colorsArray[i+1] = starColor.g;
    colorsArray[i+2] = starColor.b;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

// Shader material for glowing, colored points
const particlesMaterial = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const starMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(starMesh);

// Mouse Parallax Logic
let mouseX = 0; let mouseY = 0;
window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Slowly rotate the entire galaxy
    starMesh.rotation.y = elapsedTime * 0.02;
    starMesh.rotation.z = elapsedTime * 0.01;

    // Smooth camera drift based on mouse
    camera.position.x += (mouseX * 500 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 500 - camera.position.y) * 0.02;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- GSAP SCROLL ANIMATIONS ---

// 1. WebGL Camera Fly-Through (The core "Massive" feeling)
// As you scroll down, the camera flies deep into the Z-axis of the Three.js scene
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
        // Move camera from z=2000 down to z=-3000
        gsap.to(camera.position, {
            z: 2000 - (self.progress * 5000),
            duration: 0.5,
            ease: "power1.out"
        });

        // Update HUD Velocity and Distance logic
        document.getElementById('velocity-tracker').innerText = (self.velocity / 100).toFixed(2) + "c";
        document.getElementById('distance-tracker').innerText = Math.round(self.progress * 46000) + " M LY";
    }
});

// 2. Journey Milestones (Storytelling fade-in)
const milestones = gsap.utils.toArray('.milestone');
milestones.forEach((milestone, i) => {
    ScrollTrigger.create({
        trigger: milestone,
        start: "top center",
        end: "bottom center",
        toggleClass: "active",
    });
});

// 3. Staggered reveal for Explorer Cards
gsap.from(".holo-card", {
    scrollTrigger: { trigger: ".sec-explore", start: "top 70%" },
    y: 100, opacity: 0, duration: 1, stagger: 0.2, ease: "power4.out"
});

// 4. Dashboard Entry Animation
gsap.from(".dashboard-wrapper", {
    scrollTrigger: { trigger: ".sec-dashboard", start: "top 60%" },
    scale: 0.95, opacity: 0, rotationX: 10, duration: 1.2, ease: "expo.out"
});

// 5. Gallery Masonry Reveal
gsap.from(".gal-item", {
    scrollTrigger: { trigger: ".sec-gallery", start: "top 80%" },
    scale: 0.8, opacity: 0, duration: 1, stagger: 0.1, ease: "back.out(1.7)"
});

// 6. Hero Glitch Entry
window.addEventListener('load', () => {
    gsap.from(".glitch-title", { y: 50, opacity: 0, duration: 2, ease: "power4.out" });
    gsap.from(".eyebrow-text, .hero-cta", { opacity: 0, duration: 2, delay: 0.5 });
});
