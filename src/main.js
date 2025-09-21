import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

let scene, camera, renderer, group, innerSphere;
let cards = [];
const CARD_COUNT = 60;
const radius = 16;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 60;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = 0;
  renderer.domElement.style.left = 0;
  document.body.appendChild(renderer.domElement);

  // Group for cards
  group = new THREE.Group();
  scene.add(group);

  // Card geometry / material
  const geom = new THREE.PlaneGeometry(2, 1.2);

  // ---- Create cards on a circle (tiny & hidden) ----
  for (let i = 0; i < CARD_COUNT; i++) {
    const angle = (i / CARD_COUNT) * Math.PI * 2;
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });

    const card = new THREE.Mesh(geom, mat);
    card.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    card.scale.set(0.2, 0.2, 0.2); // start small
    cards.push(card);
    group.add(card);
  }

  // Small sphere inside (for after zoom)
  const innerGeo = new THREE.SphereGeometry(2, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  innerSphere = new THREE.Mesh(innerGeo, innerMat);
  innerSphere.visible = false;
  scene.add(innerSphere);

  document.getElementById('startBtn').addEventListener('click', runTimeline);
  window.addEventListener('resize', onResize);
}

function runTimeline() {
  // ---- Stage 1: appear + grow while swirling ----
  cards.forEach((card, idx) => {
    gsap.to(card.material, { opacity: 1, duration: 1, delay: idx * 0.02 });
    gsap.to(card.scale, { x: 1, y: 1, z: 1, duration: 1, delay: idx * 0.02 });
  });

  // swirl
  gsap.to(group.rotation, { z: "+=6.28", duration: 5, ease: "power1.inOut" });

  // ---- Stage 2: morph into sphere & show from bottom ----
  const sphereTargets = computeSpherePositions(CARD_COUNT, radius);
  cards.forEach((card, idx) => {
    const t = sphereTargets[idx];
    gsap.to(card.position, {
      x: t.x,
      y: t.y,
      z: t.z,
      delay: 1.2,
      duration: 2,
      ease: "power2.inOut"
    });
  });

  // tilt sphere so we see bottom first, then side
  gsap.fromTo(group.rotation, { x: Math.PI / 2 }, { x: 0, y: Math.PI / 6, duration: 3, delay: 1.2 });

  // ---- Stage 3: slow spin ----
  gsap.to(group.rotation, {
    y: "+=6.28",
    duration: 40,
    repeat: -1,
    ease: "none",
    delay: 4
  });

  // ---- Stage 4: zoom into inside ----
  gsap.timeline({ delay: 6 })
    .to(camera.position, { z: 25, duration: 2, ease: "power2.inOut" })
    .to(camera.position, { z: 10, duration: 2, ease: "power2.inOut" })
    .to(camera.position, {
      z: 0,
      duration: 3,
      ease: "power2.inOut",
      onComplete: () => {
        innerSphere.visible = true;
      }
    });
}

function computeSpherePositions(count, r) {
  // Fibonacci sphere
  const pts = [];
  const offset = 2 / count;
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = ((i * offset) - 1) + offset / 2;
    const radius = Math.sqrt(1 - y * y);
    const phi = i * inc;
    const x = Math.cos(phi) * radius;
    const z = Math.sin(phi) * radius;
    pts.push(new THREE.Vector3(x * r, y * r, z * r));
  }
  return pts;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
