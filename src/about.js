// -----------------------------
// FALLING ROCKS INTRO ANIMATION
// -----------------------------
window.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("aboutHeader");
  const skills = document.querySelectorAll(".falling-skill");

  // --- Step 1: Fade in header ---
  header.style.opacity = 0;
  const tl = gsap.timeline();
  tl.to(header, {
    opacity: 1,
    scale: 0.8,
    duration: 2,
    ease: "power2.out"
  });

  // --- Step 2: Matter.js setup ---
  const { Engine, Runner, World, Bodies, Body } = Matter;
  const engine = Engine.create();
  const world = engine.world;
  world.gravity.y = 1.2; // gravity strength

  const wallThickness = 80;

  // invisible floor and walls
  const floor = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + 20,
    window.innerWidth,
    80,
    { isStatic: true, restitution: 0.6 }
  );
  const leftWall = Bodies.rectangle(
    -wallThickness / 2,
    window.innerHeight / 2,
    wallThickness,
    window.innerHeight,
    { isStatic: true }
  );
  const rightWall = Bodies.rectangle(
    window.innerWidth + wallThickness / 2,
    window.innerHeight / 2,
    wallThickness,
    window.innerHeight,
    { isStatic: true }
  );

  World.add(world, [floor, leftWall, rightWall]);

  // store bodies and DOM elements
  const rockBodies = [];

  // --- Step 3: spawn rocks after fade starts ---
  tl.add(() => {
    skills.forEach((el, i) => {
      const startX = 100 + Math.random() * (window.innerWidth - 200);
      const radius = el.offsetWidth / 2;

      // polygon shape for variety
      const rock = Bodies.polygon(startX, -100, 6, radius * 0.9, {
        restitution: 0.5,
        friction: 0.4,
        frictionStatic: 0.8,
        density: 0.002,
        angle: Math.random() * Math.PI,
      });

      setTimeout(() => {
        World.add(world, rock);
        rockBodies.push({ el, body: rock });
      }, i * 300); // spawn delay

      // small fade-in effect for rock
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1,
        duration: 1.2,
        delay: i * 0.25
      });
    });
  }, "-=1.2");

  // --- Step 4: run physics simulation ---
  const runner = Runner.create();
  Runner.run(runner, engine);

  // --- Step 5: sync DOM rocks to physics bodies ---
  (function update() {
    rockBodies.forEach(({ el, body }) => {
      el.style.left = `${body.position.x - el.offsetWidth / 2}px`;
      el.style.top = `${body.position.y - el.offsetHeight / 2}px`;
      el.style.transform = `rotate(${body.angle}rad)`;
    });
    requestAnimationFrame(update);
  })();

  // --- Step 6: handle window resize ---
  window.addEventListener("resize", () => {
    Body.setPosition(floor, {
      x: window.innerWidth / 2,
      y: window.innerHeight + 20
    });
  });
});

// -----------------------------
// ABOUT ME SECTION ANIMATION (with mouse repelling)
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.querySelector(".av-wrap");
  if (!wrap) return;

  const card = wrap.querySelector(".av-photo-card");
  const svg = wrap.querySelector(".av-lines");
  const labels = Array.from(wrap.querySelectorAll(".av-label"));

  // --- Create one SVG line per label ---
  const lines = labels.map(() => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", "rgba(255,255,255,0.9)");
    line.setAttribute("stroke-width", "1.5");
    line.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(line);
    return line;
  });

  // --- Position labels by % of wrapper ---
  const initialPositions = [];
  function placeLabels() {
    const rect = wrap.getBoundingClientRect();
    labels.forEach((el, i) => {
      const x = (+el.dataset.x / 100) * rect.width;
      const y = (+el.dataset.y / 100) * rect.height;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      initialPositions[i] = { x, y };
    });
  }

  // --- Draw connecting lines ---
  function updateLines() {
    const wrapRect = wrap.getBoundingClientRect();
    labels.forEach((el, i) => {
      const labelRect = el.getBoundingClientRect();
      const ax = (+el.dataset.ax / 100) * wrapRect.width;
      const ay = (+el.dataset.ay / 100) * wrapRect.height;
      const labelX = labelRect.left + labelRect.width / 2 - wrapRect.left;
      const labelY = labelRect.top + labelRect.height / 2 - wrapRect.top;
      lines[i].setAttribute("x1", ax);
      lines[i].setAttribute("y1", ay);
      lines[i].setAttribute("x2", labelX);
      lines[i].setAttribute("y2", labelY);
    });
  }

  // --- Mouse movement repelling effect ---
  const currentPositions = [];
  const repelRadius = 160;
  const repelStrength = 60;

  wrap.addEventListener("mousemove", (e) => {
    const rect = wrap.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    labels.forEach((label, i) => {
      const dx = initialPositions[i].x - mouseX;
      const dy = initialPositions[i].y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < repelRadius && distance > 0) {
        const force = (repelRadius - distance) / repelRadius;
        const moveX = (dx / distance) * repelStrength * force;
        const moveY = (dy / distance) * repelStrength * force;

        currentPositions[i] = {
          x: initialPositions[i].x + moveX,
          y: initialPositions[i].y + moveY,
        };
      } else {
        currentPositions[i] = {
          x: initialPositions[i].x,
          y: initialPositions[i].y,
        };
      }

      gsap.to(label, {
        left: currentPositions[i].x,
        top: currentPositions[i].y,
        duration: 0.25,
        ease: "power2.out",
        onUpdate: updateLines,
      });
    });
  });

  // --- When mouse leaves, reset all positions ---
  wrap.addEventListener("mouseleave", () => {
    labels.forEach((label, i) => {
      gsap.to(label, {
        left: initialPositions[i].x,
        top: initialPositions[i].y,
        duration: 0.6,
        ease: "power2.inOut",
        onUpdate: updateLines,
      });
    });
  });

  // --- Entry animations ---
  gsap.from(card, { opacity: 0, y: -20, duration: 0.9, ease: "power2.out" });

  gsap.from(".av-copy", {
    opacity: 0,
    y: 10,
    duration: 0.6,
    ease: "power2.out",
    delay: 0.25,
  });


  // --- Resize observer ---
  const ro = new ResizeObserver(() => {
    placeLabels();
    updateLines();
  });
  ro.observe(wrap);

  placeLabels();
  updateLines();

  gsap.ticker.add(updateLines);


// -----------------------------
// Scroll-triggered reveal animation (repeats every time)
// -----------------------------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Animate elements fading in from bottom to top
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: "power3.out" }
        );

        gsap.fromTo(
          labels,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: updateLines,
          }
        );

        gsap.fromTo(
          ".av-copy",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.8, ease: "power2.out", delay: 0.1 }
        );
      } else {
        // Fade out when section leaves viewport
        gsap.to([card, labels, ".av-copy"], {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power2.inOut",
        });
      }
    });
  },
  {
    threshold: 0.3, // trigger when 30% visible
  }
);

observer.observe(wrap);


  // --- Fade-in animation for Skills section ---
  const skillsSection = document.querySelector(".skills-section");
  if (skillsSection) {
    const icons = skillsSection.querySelectorAll(".icon-circle, .skills-group h3, .explore-link");

    const observer2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              icons,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                duration: 1.2,
                ease: "power3.out",
              }
            );
          } else {
            // fade out when section leaves viewport
            gsap.to(icons, {
              opacity: 0,
              y: 30,
              duration: 0.8,
              ease: "power2.inOut",
            });
          }
        });
      },
      { threshold: 0.3 } // triggers when 30% of section is visible
    );

    observer2.observe(skillsSection);
  }




});
