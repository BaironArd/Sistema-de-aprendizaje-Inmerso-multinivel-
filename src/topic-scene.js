import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** @type {{ renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls, frame: number, raycaster: THREE.Raycaster, mouse: THREE.Vector2, hovered: THREE.Mesh | null } | null} */
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
  const hoverMat = new THREE.MeshStandardMaterial({ color: 0x6b6b0a, metalness: 0.3, roughness: 0.4 });
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.BoxGeometry(2.2, 0.35, 1.6);
    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.position.y = i * 0.45 - 0.6;
    mesh.rotation.y = i * 0.12;
    mesh.userData.originalMat = mat;
    mesh.userData.hoverMat = hoverMat;
    mesh.userData.pulse = 0;
    mesh.userData.layerIndex = i;
    root.add(mesh);
  }
}

function buildNodes(root) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x6b8f3c, metalness: 0.15, roughness: 0.5 });
  const hoverMat = new THREE.MeshStandardMaterial({ color: 0x8fb53c, metalness: 0.2, roughness: 0.4 });
  const positions = [
    [0, 0, 0],
    [1.8, 0.4, 0.3],
    [-1.2, -0.3, 1.4],
    [0.6, 1.1, -1.1],
  ];
  for (let i = 0; i < positions.length; i++) {
    const [x, y, z] = positions[i];
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), mat.clone());
    mesh.position.set(x, y, z);
    mesh.userData.originalMat = mat;
    mesh.userData.hoverMat = hoverMat;
    mesh.userData.pulse = 0;
    mesh.userData.nodeIndex = i;
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
  const hoverMat = new THREE.MeshStandardMaterial({ color: 0xe0b527, metalness: 0.6, roughness: 0.3 });
  const torus = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.22, 16, 48), mat.clone());
  torus.rotation.x = Math.PI / 2.2;
  torus.userData.originalMat = mat;
  torus.userData.hoverMat = hoverMat;
  torus.userData.pulse = 0;
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

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

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

  const onMouseMove = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };
  renderer.domElement.addEventListener('mousemove', onMouseMove);

  active = { renderer, scene, camera, controls, onResize, onMouseMove, raycaster, mouse, hovered: null, frame: 0 };

  function tick() {
    if (!active || active.renderer !== renderer) return;
    controls.update();

    // Raycasting for hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(root.children, true);
    const newHovered = intersects.length > 0 ? intersects[0].object : null;

    if (active.hovered !== newHovered) {
      if (active.hovered && active.hovered.userData.hoverMat) {
        active.hovered.material = active.hovered.userData.originalMat;
      }
      active.hovered = newHovered;
      if (newHovered && newHovered.userData.hoverMat) {
        newHovered.material = newHovered.userData.hoverMat;
      }
    }

    // Animate objects
    root.traverse((obj) => {
      if (obj.isMesh && obj.userData.pulse !== undefined) {
        obj.userData.pulse += 0.02;
        const scale = 1 + Math.sin(obj.userData.pulse) * 0.05;
        obj.scale.setScalar(scale);
      }
    });

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
  active.renderer.domElement.removeEventListener('mousemove', active.onMouseMove);
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
