// camera.js
import * as THREE from 'three';

export function setUpScrollCam({
  fov = 20,
  near = 0.1,
  far = 100,
  aspect = window.innerWidth / window.innerHeight,

  startPos = new THREE.Vector3(5, 5, 5),
  lookAt = new THREE.Vector3(0, 0, 0),

  scrollSpeed = 0.003,   // lower = smoother
  keySpeed = 0.15,        // target movement
  minY = -10,
  maxY = 10,

  smoothness = 0.08       // camera lerp factor
} = {}) {

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.copy(startPos);
  camera.lookAt(lookAt);

  // --- SMOOTH target Y ---
  let targetY = camera.position.y;

  // --- Scroll wheel handler ---
  window.addEventListener("wheel", (e) => {
    targetY -= e.deltaY * scrollSpeed;
    targetY = Math.max(minY, Math.min(maxY, targetY));
  });

  // --- Arrow keys ---
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") targetY -= keySpeed;
    if (e.key === "ArrowUp")   targetY += keySpeed;

    targetY = Math.max(minY, Math.min(maxY, targetY));
  });

  // --- Update function to be called in render loop ---
  camera.updateScrollCam = () => {
    // Smooth LERP toward target
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      smoothness
    );

    //camera.lookAt(lookAt);
  };

  return camera;
}
