gsap.registerPlugin(ScrollTrigger);

// Custom Cursor
const cursor = document.querySelector('.custom-cursor');
window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
});

// 1. Hero Entrance
gsap.from(".massive-text", {
    y: 100, opacity: 0, duration: 2, ease: "power4.out"
});

// 2. Voyager Parallax
gsap.to(".floating-img", {
    y: -150,
    ease: "none",
    scrollTrigger: {
        trigger: ".voyager",
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});

// 3. HORIZONTAL SCROLL
const horizontalSection = document.querySelector('.horizontal-container');
const horizontalWrapper = document.querySelector('.horizontal-wrapper');

// We calculate how far to move left by subtracting one screen width from the total width
let scrollTween = gsap.to(horizontalWrapper, {
    x: () => -(horizontalWrapper.scrollWidth - window.innerWidth) + "px",
    ease: "none",
    scrollTrigger: {
        trigger: horizontalSection,
        start: "top top", // When the section hits the top of the viewport
        end: () => "+=" + horizontalWrapper.scrollWidth, // Pin it for the duration of its width
        pin: true, // This is what locks the screen
        scrub: 1, // Smooth scrubbing
        invalidateOnRefresh: true
    }
});

// 4. Reveal Image inside Horizontal Scroll
// Using 'containerAnimation' allows ScrollTrigger to know it's moving sideways
gsap.from(".jwst-img", {
    scale: 0.5,
    opacity: 0,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".jwst",
        containerAnimation: scrollTween, // Link to the horizontal animation
        start: "left center", // Trigger when the panel reaches the center of screen
        toggleActions: "play none none reverse"
    }
});
