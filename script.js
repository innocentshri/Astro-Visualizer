gsap.registerPlugin(ScrollTrigger);

// Custom Cursor
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out"
    });
});

// Initial Page Load
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.to(".loader-text", { opacity: 0, duration: 0.5 })
        .to(".loader", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "power4.inOut"
        })
        .from(".main-title", {
            y: 150,
            skewY: 10,
            opacity: 0,
            duration: 1.5,
            ease: "power4.out"
        }, "-=0.5")
        .from(".tagline", { opacity: 0, y: 20 }, "-=1");
});

// Image Parallax/Zoom Effect
gsap.to(".image-container img", {
    scale: 1,
    scrollTrigger: {
        trigger: ".info-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
    }
});

// Text reveal on scroll
gsap.from(".text-side", {
    x: -50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: ".text-side",
        start: "top 70%",
        toggleActions: "play none none reverse"
    }
});