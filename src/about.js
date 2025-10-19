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
  world.gravity.y = 1.2; // adjust gravity strength

  const wallThickness = 80;

  // invisible floor
  const floor = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight +20,
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


  

  // store bodies and their DOM elements
  const rockBodies = [];

  // --- Step 3: spawn rocks after fade starts ---
  tl.add(() => {
    skills.forEach((el, i) => {
      const startX = 100 + Math.random() * (window.innerWidth - 20);
      const radius = el.offsetWidth / 2;

      // random polygon shape for variety
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
      }, i * 300); // ← each rock spawns 300ms apart


      // small fade-in effect for the rock
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
      y: window.innerHeight +20
    });
  });
});
