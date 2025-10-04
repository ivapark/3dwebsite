let scene, camera, renderer;
let targetCameraX = 0, targetCameraY = 0;
let clickable = true;
let rocks = {};
let rockGroup;                // holds all rocks
let loadedCount = 0;
const EXPECTED = 3;           // how many rocks you will load


init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 20;
  rockGroup = new THREE.Group();
  scene.add(rockGroup);


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  const gltfLoader = new THREE.GLTFLoader();

  // Helper loader
  function loadRock(name, path) {
    gltfLoader.load(path, (gltf) => {
      const rock = gltf.scene;
  
      // ---- normalize size ----
      const box = new THREE.Box3().setFromObject(rock);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 4 / maxDim;          // make all comparable
      rock.scale.setScalar(scaleFactor);

      // Add lights
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
      dirLight.position.set(5, 10, 7.5);
      scene.add(dirLight);
  
      // ---- recenter the rock around its own pivot ----
      const box2 = new THREE.Box3().setFromObject(rock);
      const center = box2.getCenter(new THREE.Vector3());
      rock.position.sub(center);                // now rock is centered at (0,0,0)
  
      // start far, then animate in
      rock.position.z = -50;
      rock.traverse(o => { if (o.isMesh && o.material) o.material.transparent = true; });
      rockGroup.add(rock);
  
      gsap.to(rock.position, { z: 0, duration: 2, ease: "power2.out" });
  
      rocks[name] = rock;
      loadedCount++;
      layoutRocks();                            // position + center the whole group
    });
  }
  
  
  function layoutRocks() {
    const spacingX = 8;   // horizontal distance between left & right
    const spacingY = 6;   // vertical distance between rows
  
    const children = rockGroup.children;
  
    // Position them relative to (0,0)
    if (children.length === 1) {
      children[0].position.set(0, 0, 0);
    } else if (children.length === 2) {
      children[0].position.set(-spacingX / 2, 0, 0);
      children[1].position.set( spacingX / 2, 0, 0);
    } else if (children.length >= 3) {
      // Two on top, one centered below
      children[0].position.set(-spacingX / 2, spacingY / 2, 0); // left-top
      children[1].position.set( spacingX / 2, spacingY / 2, 0); // right-top
      children[2].position.set(0, -spacingY / 2, 0);            // bottom center
    }
  
    // --- recenter the entire group ---
    const gbox = new THREE.Box3().setFromObject(rockGroup);
    const gcenter = gbox.getCenter(new THREE.Vector3());
  
    // reset first
    rockGroup.position.set(0, 0, 0);
  
    // shift so bounding box center is at origin
    rockGroup.position.x = -gcenter.x;
    rockGroup.position.y = -gcenter.y;
  
    // --- apply manual offset DOWN to clear the header ---
    rockGroup.position.y -= 1; // adjust value until rocks sit comfortably below text
  }
  
  
  
  // Load all rocks
  loadRock("igneous", "../assets/models/igneous_rock_basalt/scene.gltf", -6);
  loadRock("sedimentary", "../assets/models/limestone/scene.gltf", 0);
  loadRock("metamorphic", "../assets/models/pink_quartzite/scene.gltf", 6);

  window.addEventListener("resize", onResize);
  window.addEventListener("mousemove", onMouseMove);

  // Hover overlays with raycasting
  window.addEventListener("mousemove", onRockHover);

  // Fade in header
  gsap.to("#aboutHeader", { opacity: 1, y: 0, duration: 1.5, delay: 1 });

  setupPageTransitions();
}

function animate() {
  requestAnimationFrame(animate);

  if (clickable) {
    camera.position.x += (targetCameraX - camera.position.x) * 0.05;
    camera.position.y += (targetCameraY - camera.position.y) * 0.05;
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
  if (!clickable) return;
  targetCameraX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetCameraY = -(e.clientY / window.innerHeight - 0.5) * 2;
}

// Raycasting for hover overlays
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onRockHover(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(Object.values(rocks), true);

  // Hide all overlays
  document.querySelectorAll(".rock-overlay").forEach(o => o.classList.remove("show"));

  if (intersects.length > 0) {
    const first = intersects[0].object;
    if (rocks.igneous && first.parent === rocks.igneous) {
      document.getElementById("igneous-overlay").classList.add("show");
    }
    if (rocks.sedimentary && first.parent === rocks.sedimentary) {
      document.getElementById("sedimentary-overlay").classList.add("show");
    }
    if (rocks.metamorphic && first.parent === rocks.metamorphic) {
      document.getElementById("metamorphic-overlay").classList.add("show");
    }
  }
}

// Page transitions
function setupPageTransitions() {
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetUrl = link.getAttribute("href");
      if (targetUrl.includes("rock.html")) return;

      e.preventDefault();
      const tl = gsap.timeline({ onComplete: () => window.location.href = targetUrl });

      Object.values(rocks).forEach(rock => {
        tl.to(rock.position, { z: -50, duration: 1.5, ease: "power2.inOut" }, 0);
        rock.traverse(obj => {
          if (obj.isMesh && obj.material) {
            obj.material.transparent = true;
            tl.to(obj.material, { opacity: 0, duration: 1 }, 0.5);
          }
        });
      });

      tl.to("#aboutHeader", { opacity: 0, scale: 0.8, duration: 1 }, 0);
    });
  });
}
