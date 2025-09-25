
let scene, camera, renderer, limestone;
let targetCameraX = 0, targetCameraY = 0;
let clickable = true; // allow movement right away


init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 20;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  renderer.outputEncoding = THREE.sRGBEncoding;


  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(
    '../assets/models/limestone/scene.gltf',
    (gltf) => {
      limestone = gltf.scene;
      limestone.scale.set(2, 2, 2);
      limestone.position.set(0, 0, -50); // start far away
      scene.add(limestone);
  
      // --- Recenter limestone ---
      const box = new THREE.Box3().setFromObject(limestone);
      const center = box.getCenter(new THREE.Vector3());
      limestone.position.sub(center); // shifts geometry so center is at (0,0,0)
      limestone.position.z = -50;     // push it back again after recentering
  

      // Add lights
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
      dirLight.position.set(5, 10, 7.5);
      scene.add(dirLight);

      // Animate limestone forward
      gsap.to(limestone.position, { z: 0, duration: 2, ease: "power2.out" });
  
      // Fade in header after 1s
      gsap.to("#aboutHeader", { opacity: 1, y: 0, duration: 1.5, delay: 1 });
    }
  );
  
  

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove);


  
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


// --- Fade-out + zoom-out transition for About page ---
function setupPageTransitions() {
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetUrl = link.getAttribute("href");

      // 1) Skip if staying on About page
      if (targetUrl.includes("about.html")) return;

      e.preventDefault(); // stop instant navigation

      const tl = gsap.timeline({
        onComplete: () => {
          window.location.href = targetUrl;
        }
      });

      // 2) Animate limestone rock backward & fade meshes
      if (limestone) {
        tl.to(limestone.position, { z: -50, duration: 1.5, ease: "power2.inOut" }, 0);
        tl.to(limestone.rotation, { y: "+=0", duration: 1.5, ease: "power2.inOut" }, 0);

        // traverse meshes to fade materials
        limestone.traverse(obj => {
          if (obj.isMesh && obj.material) {
            obj.material.transparent = true;
            tl.to(obj.material, { opacity: 0, duration: 1 }, 0.5);
          }
        });
      }

      // 3) Animate text/images fading & scaling
      tl.to("#aboutHeader", { opacity: 0, scale: 0.8, duration: 1, ease: "power2.inOut" }, 0);
    });
  });
}

// Call after DOM is ready
window.addEventListener("DOMContentLoaded", setupPageTransitions);

