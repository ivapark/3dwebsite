
let scene, camera, renderer, pink_quartzite;
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

  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(
    '../assets/models/pink_quartzite/scene.gltf',
    (gltf) => {
      pink_quartzite = gltf.scene;
      scene.add(pink_quartzite);
  
      // --- Normalize size ---
      const box = new THREE.Box3().setFromObject(pink_quartzite);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 6 / maxDim;  // target size ~10 units
      pink_quartzite.scale.setScalar(scaleFactor);
  
      // --- Recompute box AFTER scaling ---
      const box2 = new THREE.Box3().setFromObject(pink_quartzite);
      const center = box2.getCenter(new THREE.Vector3());
  
      // --- Recenter to origin ---
      pink_quartzite.position.sub(center);
  
      // --- Push back in Z ---
      pink_quartzite.position.z = -50;
  
      // Animate forward
      gsap.to(pink_quartzite.position, { z: 0, duration: 2, ease: "power2.out" });
  
      // Fade in header
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
        if (targetUrl.includes("work.html")) return;
  
        e.preventDefault(); // stop instant navigation
  
        const tl = gsap.timeline({
          onComplete: () => {
            window.location.href = targetUrl;
          }
        });
  
        // 2) Animate limestone rock backward & fade meshes
        if (pink_quartzite) {
          tl.to(pink_quartzite.position, { z: -50, duration: 1.5, ease: "power2.inOut" }, 0);
          tl.to(pink_quartzite.rotation, { y: "+=0", duration: 1.5, ease: "power2.inOut" }, 0);
  
          // traverse meshes to fade materials
          pink_quartzite.traverse(obj => {
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
