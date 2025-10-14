let scene, camera, renderer, group, innerSphere;
let cards = [];
let clickable = false;
let targetCameraX = 0, targetCameraY = 0;

const CARD_COUNT = 20;
const radius = 16;

const loader = new THREE.TextureLoader();

// Loader flags
let typingDone = false;
let texturesDone = false;

// ---- STARTUP ----
init();
animate();
startTypewriter();

// ---- TYPEWRITER ----
function startTypewriter(){
  const text = "Loading...";
  const el = document.getElementById('loaderText');
  el.textContent = "";
  
  let i = 0;
  const typingSpeed = 120;
  let cycles = 0;
  const maxCycles = 3; // Run 3 cycles
  
  function tick() {
    if (i < text.length) {
      el.textContent = text.slice(0, i + 1);
      i++;
      setTimeout(tick, typingSpeed);
    } else {
      cycles++;
      if (cycles < maxCycles && !texturesDone) {
        setTimeout(() => { i = 0; el.textContent = ""; tick(); }, 500);
      } else {
        typingDone = true;
        checkReady();
      }
    }
  }
  tick();
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 60;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  group = new THREE.Group();
  scene.add(group);

  // --- Create a LoadingManager ---
  const manager = new THREE.LoadingManager();
  manager.onLoad = function () {
    // All textures finished loading
    texturesDone = true;
    checkReady();
  };

  const loader = new THREE.TextureLoader(manager);

  const placeholderMat = new THREE.MeshBasicMaterial({
    color: 0xeeeeee,  // light gray placeholder
    side: THREE.DoubleSide
  });
  

  // --- Replace color cards with images ---
  for (let i = 0; i < CARD_COUNT; i++) {
    const angle = (i / CARD_COUNT) * Math.PI * 2;
  
    // Each card starts with the placeholder
    const card = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2), placeholderMat.clone());
    card.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    card.scale.set(0.1, 0.1, 0.1);
    cards.push(card);
    group.add(card);

    
  
    // Load the actual texture asynchronously
    const texture = loader.load(
      `./assets/images/img${i+1}.svg`,
      (tex) => {
        // On load → swap the texture + fade in
        

        card.material.map = tex;
        card.material.needsUpdate = true;
        gsap.fromTo(card.material, { opacity: 0 }, { opacity: 1, duration: 1 });
      }
    );
  }
  

  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(
    './assets/models/igneous_rock_basalt/scene.gltf',
    (gltf) => {
      innerSphere = gltf.scene;                // <--- Save it here
      innerSphere.scale.set(2, 2, 2);       // Adjust as needed
      innerSphere.position.set(0, 0, 0);
      innerSphere.visible = false;             // Start hidden
      innerSphere.traverse(obj => {
        if (obj.isMesh) {
          obj.material.transparent = true;
          obj.material.opacity = 0;   // start invisible
        }
      });

      
      scene.add(innerSphere);
  
      // Center it using bounding box
      const box = new THREE.Box3().setFromObject(innerSphere);
      const center = box.getCenter(new THREE.Vector3());
      innerSphere.position.sub(center);        // recenters the geometry to (0,0,0)
    },
    undefined,
    (err) => console.error("GLTF load error:", err)
  );
  



  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onClick);
}

// ---- CHECK READY ----
function checkReady() {
  if (typingDone && texturesDone) {
    const loaderEl = document.getElementById('loader');
    loaderEl.classList.add('fade-out');
    setTimeout(() => {
      loaderEl.remove();
      runTimeline();
    }, 800);
  }
}

function runTimeline() {
  // Animate cards appearing
  cards.forEach((card, idx) => {
    gsap.to(card.material, { opacity: 1, duration: 1, delay: idx * 0.02 });
    gsap.to(card.scale, { x: 2, y: 2, z: 2, duration: 1, delay: idx * 0.02 });
  });

  gsap.to(group.rotation, { z: "+=6.28", duration: 2, ease: "power1.inOut" });

  const sphereTargets = computeSpherePositions(CARD_COUNT, radius);
  
  cards.forEach((card, idx) => {
    const t = sphereTargets[idx];
  
    // Animate position
    gsap.to(card.position, {
      x: t.x, y: t.y, z: t.z,
      delay: 1.2, duration: 2, ease: "power2.inOut"
    });
  
    // Smoothly rotate so the card faces outward from the center
    const startQuat = card.quaternion.clone();
  
    // compute outward direction (from center through target position)
    // --- Ensure consistent outward & upright orientation ---
    const outward = t.clone().normalize(); // outward direction (from origin to card)
    const up = new THREE.Vector3(0, 1, 0); // global up reference

    // Calculate a stable right vector (cross product)
    const right = new THREE.Vector3().crossVectors(up, outward).normalize();

    // Recalculate a corrected up (orthogonal to outward and right)
    const correctedUp = new THREE.Vector3().crossVectors(outward, right).normalize();

    // Build rotation matrix
    const mat = new THREE.Matrix4().makeBasis(right, correctedUp, outward);

    // Extract quaternion from matrix
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(mat);

    // Apply that rotation
    card.quaternion.copy(targetQuat);


  
    const endQuat = card.quaternion.clone();
  
    // reset back to start rotation before animating
    card.quaternion.copy(startQuat);
  
    gsap.to(card.quaternion, {
      x: endQuat.x,
      y: endQuat.y,
      z: endQuat.z,
      w: endQuat.w,
      delay: 1.2,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => card.quaternion.normalize()
    });
  });
  

  gsap.fromTo(group.rotation, { x: Math.PI / 2 }, { x: 0, y: Math.PI / 6, duration: 3, delay: 1.2 });
  gsap.to(group.rotation, { y: "+=6.28", duration: 40, repeat: -1, ease: "none", delay: 4 });

  gsap.timeline({ delay: 3 })
  //.to(camera.position, { z: 25, duration: 1, ease: "power2.inOut" })
  .to(camera.position, { 
    z: 10, 
    duration: 2, 
    ease: "power2.inOut",
    onStart: () => {   // <--- change here
      innerSphere.visible = true;
  
      innerSphere.traverse(obj => {
        if (obj.isMesh) {
          gsap.to(obj.material, {
            opacity: 1,
            duration: 2,
            ease: "power2.out"
          });
        }
      });
    },
    onComplete: () => {
      clickable = true; // only enable interaction after zoom finishes
    }
  });
  


}

function computeSpherePositions(count, r) {
  const pts = [];
  const offset = 2 / count;
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = ((i * offset) - 1) + offset / 2;
    const rad = Math.sqrt(1 - y * y);
    const phi = i * inc;
    const x = Math.cos(phi) * rad;
    const z = Math.sin(phi) * rad;
    pts.push(new THREE.Vector3(x * r, y * r, z * r));
  }
  return pts;
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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(e) {
  if (!clickable) return;

  // Normalize mouse coords (-1 to +1)
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // ---- CASE 1️⃣: Rock Click → Go to About Page ----
  if (innerSphere) {
    const rockHits = raycaster.intersectObject(innerSphere, true);
    if (rockHits.length > 0) {
      clickable = false;
      const tl = gsap.timeline({
        onComplete: () => {
          window.location.href = "./pages/about.html";
        }
      });

      // Zoom out camera
      tl.to(camera.position, { z: 100, duration: 1.5, ease: "power2.inOut" });

      // Fade + shrink cards
      cards.forEach(card => {
        tl.to(card.material, { opacity: 0, duration: 1 }, "<");
        tl.to(card.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1 }, "<");
      });

      // Fade rock
      innerSphere.traverse(obj => {
        if (obj.isMesh) {
          tl.to(obj.material, { opacity: 0, duration: 1 }, "<");
        }
      });

      return;
    }
  }

  // ---- CASE 2️⃣: Card Click → Pop Out ----
  const cardHits = raycaster.intersectObjects(cards, false);
  if (cardHits.length > 0) {
    const clickedCard = cardHits[0].object;
    clickable = false;

    // Duplicate that card visually
    const clone = clickedCard.clone();


    clone.material = clickedCard.material.clone();
    clone.material.transparent = true;
    clone.material.opacity = 1;
    clickedCard.updateMatrixWorld(true);
    clickedCard.getWorldPosition(clone.position);
    clickedCard.getWorldQuaternion(clone.quaternion);
    clone.scale.copy(clickedCard.scale);
    scene.add(clone);
    clone.scale.x *= -1


    // Fade out the rock
    innerSphere.traverse(obj => {
      if (obj.isMesh) {
        gsap.to(obj.material, { opacity: 0, duration: 0.5, ease: "power2.out" });
      }
    });

    // Bring clone forward & face camera center
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);

    const distanceFromCamera = 15; // adjust to bring closer/further
    const targetPos = camera.position.clone().add(cameraDir.multiplyScalar(distanceFromCamera));
    const faceQuat = new THREE.Quaternion().copy(camera.quaternion);

    const tl = gsap.timeline();

    // Move clone directly to screen center in front of camera
    tl.to(clone.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1,
      ease: "power2.out"
    });

    
    // Enlarge slightly for focus
    tl.to(clone.scale, {
      x: clone.scale.x * 3,
      y: clone.scale.y * 3,
      z: clone.scale.z * 3,
      duration: 1,
      ease: "power2.out"
    }, "<");

    // Make it face the viewer
    tl.to(clone.quaternion, {
      x: faceQuat.x,
      y: faceQuat.y,
      z: faceQuat.z,
      w: faceQuat.w,
      duration: 1,
      ease: "power2.out"
    }, "<");

    // ---- Add outside click listener ----
    const handleOutsideClick = (event) => {
      // Recalculate mouse for outside click detection
      const tempMouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(tempMouse, camera);
      const checkCard = raycaster.intersectObject(clone, false);

      // If clicked outside the popped image
      if (checkCard.length === 0) {
        document.removeEventListener("click", handleOutsideClick);
        const tlOut = gsap.timeline({
          onComplete: () => {
            
            scene.remove(clone);
            clone.geometry.dispose();
            clone.material.dispose();
            clickable = true;
          }
        });

        // Fade clone out
        tlOut.to(clone.material, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut"
        });

        // Fade rock back in
        innerSphere.traverse(obj => {
          if (obj.isMesh) {
            tlOut.to(obj.material, { opacity: 1, duration: 0.6, ease: "power2.inOut" }, "<");
          }
        });
      }
    };

    // Delay adding this listener so it doesn't trigger immediately
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 200);

    return;
  }
}



// Attach event listener
window.addEventListener("click", onClick);





