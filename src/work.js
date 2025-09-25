
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

  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(
    '../assets/models/pink_quartzite/scene.gltf',
    (gltf) => {
      limestone = gltf.scene;
      scene.add(limestone);
  
      // --- Normalize size ---
      const box = new THREE.Box3().setFromObject(limestone);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 6 / maxDim;  // target size ~10 units
      limestone.scale.setScalar(scaleFactor);
  
      // --- Recompute box AFTER scaling ---
      const box2 = new THREE.Box3().setFromObject(limestone);
      const center = box2.getCenter(new THREE.Vector3());
  
      // --- Recenter to origin ---
      limestone.position.sub(center);
  
      // --- Push back in Z ---
      limestone.position.z = -50;
  
      // Animate forward
      gsap.to(limestone.position, { z: 0, duration: 2, ease: "power2.out" });
  
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
