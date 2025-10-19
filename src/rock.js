document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("rockTitle");
  const textBlock = document.getElementById("textBlock");
  const textBlock2 = document.getElementById("textBlock2"); // <— NEW
  const leftRock = document.getElementById("leftRock");
  const centerRock = document.getElementById("centerRock");
  const rightRock = document.getElementById("rightRock");

  const rocks = [leftRock, centerRock, rightRock];

  const rockImages = {
    igneous: "../assets/images/rock1.svg",
    metamorphic: "../assets/images/rock2.svg",
    sedimentary: "../assets/images/rock3.svg"
  };

  const rockData = {
    igneous: {
      title: "Igneous Rock — The Beginning",
      left: "metamorphic",
      right: "sedimentary",
      text: `
        <h3>Scientific Process:</h3>
        <p>Igneous rocks form when molten magma cools and solidifies, emerging from deep within the Earth as something entirely new. They represent the raw beginnings of creation — powerful, unrefined, and full of potential.</p>
        <h3>My Portfolio:</h3>
        <p>The home page marks the origin of creation, the first spark where ideas begin to take shape. Like magma cooling into solid form, it captures the foundation of design itself — raw energy becoming structure. Each project orbits around the igneous rock, symbolizing creativity drawn back to its source, the birthplace of design, experimentation, and transformation.</p>
      `
    },
    metamorphic: {
      title: "Metamorphic Rock — The Transformation",
      left: "sedimentary",
      right: "igneous",
      text: `
        <h3>Scientific Process:</h3>
        <p>When sedimentary rocks are buried deep within the Earth, they face intense heat and pressure. This doesn’t melt them; it transforms them. Their minerals realign, creating new structures and textures. Metamorphic rocks embody resilience, strength, and the beauty of change under pressure.</p>
        <h3>My Portfolio:</h3>
        <p>From About Me to My Work, the layers of my skills are pressed together and transformed into creation. The My Work page represents that metamorphic state — refined, complex, and resilient. Each project is shaped through the process of breaking down ideas, researching, analyzing, and developing them into a complete and well-formed product.</p>
      `
    },
    sedimentary: {
      title: "Sedimentary Rock — The Layers of Self",
      left: "igneous",
      right: "metamorphic",
      text: `
        <h3>Scientific Process:</h3>
        <p>Over time, igneous rocks are broken down by weathering and erosion. Their particles are carried by wind and water, gradually settling into layers that compress and harden into sedimentary rock. Each layer preserves traces of what came before — a record of change, time, and environment.</p>
        <h3>My Portfolio:</h3>
        <p>When the igneous stage breaks apart, it transforms into the About Me page. Here, my skills and experiences fall into place, layering over time to build a foundation. Each rock, from Figma and UI/UX to research and Java, represents both my technical and creative abilities. Through these skills, I’ve grown into a more refined designer and creator. The process reflects self-development, where fragments of knowledge and experience come together to form something cohesive and complete.</p>
      `
    }
  };

  let current = "igneous";

    // ---------- INITIAL FADE-IN SEQUENCE ----------
    gsap.set([rocks, title, textBlock, textBlock2], { opacity: 0, y: 40 }); // start slightly lower
    const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
    intro
      .to(rocks, { opacity: 1, y: 0, duration: 1 }) // rocks appear
      .to([title,textBlock2], { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")     // then title
      .to(textBlock, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3"); // then text





  function updateRocks(newCenter) {
    const newLeft = rockData[newCenter].left;
    const newRight = rockData[newCenter].right;
    const direction = getDirection(newCenter); // detect left or right scroll

    // Fade out title and text
    gsap.to([title, textBlock, textBlock2], { opacity: 0, duration: 0.3 });

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // Slide all rocks horizontally (like scrolling)
    const slideDistance = 300; // adjust how far they scroll
    const offset = direction === "left" ? -slideDistance : slideDistance;

    tl.to(rocks, { x: offset, opacity: 0.5, duration: 0.6 }, 0);

    // When off-screen, swap sources
    tl.add(() => {
      leftRock.src = rockImages[newLeft];
      leftRock.dataset.name = newLeft;
      centerRock.src = rockImages[newCenter];
      centerRock.dataset.name = newCenter;
      rightRock.src = rockImages[newRight];
      rightRock.dataset.name = newRight;

      // Reset instantly to opposite side before sliding back in
      gsap.set(rocks, { x: -offset });
    });

    // Slide new set back into place (scroll in)
    tl.to(rocks, { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" });

    // Update text and fade in
    tl.add(() => {
      title.textContent = rockData[newCenter].title;
      textBlock.innerHTML = rockData[newCenter].text;

      gsap.to([title, textBlock, textBlock2], { opacity: 1, duration: 0.6 });
      current = newCenter;
    });
  }

  // Helper to know direction of scroll (for realism)
  function getDirection(newCenter) {
    const order = ["igneous", "metamorphic", "sedimentary"];
    const currentIndex = order.indexOf(current);
    const newIndex = order.indexOf(newCenter);
    if (newIndex > currentIndex || (currentIndex === 2 && newIndex === 0)) return "right";
    return "left";
  }

  // Click handling
  [leftRock, centerRock, rightRock].forEach((rock) => {
    rock.addEventListener("click", () => {
      const clicked = rock.dataset.name || rock.alt.toLowerCase().split(" ")[0];
      if (clicked === current) return;
      updateRocks(clicked);
    });
  });

  // Initialize dataset
  leftRock.dataset.name = "metamorphic";
  centerRock.dataset.name = "igneous";
  rightRock.dataset.name = "sedimentary";
});
