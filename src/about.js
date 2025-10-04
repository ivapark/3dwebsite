window.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("aboutHeader");
  const skills = document.querySelectorAll(".falling-skill");

  // Start hidden
  header.style.opacity = 0;
  skills.forEach(el => { el.style.opacity = 0; });

  const tl = gsap.timeline();

  // Step 1: Fade in IVA PARK + subtitle + contact
  tl.to(header, {
    opacity: 1,
    scale: 0.8,
    duration: 2,
    ease: "power2.out"
    
  });



  // Step 2: While the header is still fading, rocks start falling
  tl.add(() => {
    skills.forEach((el, i) => {
      const startX = Math.random() * (window.innerWidth - 150);
      el.style.left = `${startX}px`;

      gsap.fromTo(el,
        {
          y: -200,
          rotation: Math.random() * 360,
          opacity: 0
        },
        {
          y: window.innerHeight - 120,
          opacity: 1,
          rotation: "+=40",
          duration: 3 + Math.random() * 1.5,
          ease: "bounce.out",
          delay: i * 0.2
        }
      );
    });
  }, "-=1.5"); // <- start 1s *before* header fade completes
});
