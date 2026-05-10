import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** @type {{ renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls, frame: number } | null} */
let active = null;

function makeLights(scene) {
  const amb = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xfff2cc, 1.1);
  dir.position.set(4, 6, 5);
  scene.add(dir);
}

function buildLayers(root) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x494904, metalness: 0.2, roughness: 0.55 });
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.BoxGeometry(2.2, 0.35, 1.6);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = i * 0.45 - 0.6;
    mesh.rotation.y = i * 0.12;
    root.add(mesh);
  }
}

function buildNodes(root) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x6b8f3c, metalness: 0.15, roughness: 0.5 });
  const positions = [
    [0, 0, 0],
    [1.8, 0.4, 0.3],
    [-1.2, -0.3, 1.4],
    [0.6, 1.1, -1.1],
  ];
  for (const [x, y, z] of positions) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
  }
  const lineMat = new THREE.LineBasicMaterial({ color: 0xbfbfbf });
  for (let i = 0; i < positions.length - 1; i++) {
    const p = positions[i];
    const q = positions[i + 1];
    const pts = [new THREE.Vector3(...p), new THREE.Vector3(...q)];
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(geom, lineMat));
  }
  root.add(group);
}

function buildCircuit(root) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.5, roughness: 0.35 });
  const torus = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.22, 16, 48), mat);
  torus.rotation.x = Math.PI / 2.2;
  root.add(torus);
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.8), new THREE.MeshStandardMaterial({ color: 0x2a4d69 }));
  chip.position.set(0, -0.9, 0);
  root.add(chip);
}

/**
 * @param {HTMLElement} container
 * @param {'layers' | 'nodes' | 'circuit'} preset
 */
export function mountTopicScene(container, preset) {
  disposeTopicScene();
  const w = container.clientWidth;
  const h = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050605);

  const camera = new THREE.PerspectiveCamera(45, w / h || 1, 0.1, 100);
  camera.position.set(3.2, 2.4, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.2, 0);

  makeLights(scene);
  const root = new THREE.Group();
  scene.add(root);

  if (preset === 'layers') buildLayers(root);
  else if (preset === 'nodes') buildNodes(root);
  else buildCircuit(root);

  const onResize = () => {
    const rw = container.clientWidth;
    const rh = container.clientHeight;
    camera.aspect = rw / rh || 1;
    camera.updateProjectionMatrix();
    renderer.setSize(rw, rh);
  };
  window.addEventListener('resize', onResize);

  active = { renderer, scene, camera, controls, onResize, frame: 0 };

  function tick() {
    if (!active || active.renderer !== renderer) return;
    controls.update();
    root.rotation.y += 0.0015;
    renderer.render(scene, camera);
    active.frame = requestAnimationFrame(tick);
  }

  active.frame = requestAnimationFrame(tick);
}

export function disposeTopicScene() {
  if (!active) return;
  cancelAnimationFrame(active.frame);
  window.removeEventListener('resize', active.onResize);
  active.controls.dispose();
  active.scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.geometry?.dispose?.();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
      else obj.material?.dispose?.();
    }
  });
  active.renderer.dispose();
  const canv = active.renderer.domElement;
  if (canv?.parentNode) canv.parentNode.removeChild(canv);
  active = null;
}
