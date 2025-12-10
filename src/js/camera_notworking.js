// camera.js
import * as THREE from 'three';

export function setUpScrollCam({
  fov = 20,
  near = 0.1,
  far = 100,
  aspect = window.innerWidth / window.innerHeight,

  startPos = new THREE.Vector3(5, 5, 5),

  scrollSpeed = 0.003,
  keySpeed = 0.15,
  minY = -10,
  maxY = 10,

  smoothness = 0.08,

  // mouse look limits
  minPitch = THREE.MathUtils.degToRad(-60), // look up limit
  maxPitch = THREE.MathUtils.degToRad(60),  // look down limit
  rotateSpeed = 0.002
} = {}) {

  // --- Make camera ---
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.copy(startPos);

  // Camera rotation state
  let yaw = 0;    // left-right rotation (around Y)
  let pitch = 0;  // up-down rotation (around X)

  // smooth Y target
  let targetY = camera.position.y;

  // --- Movement: scroll ---
  window.addEventListener("wheel", (e) => {
    targetY -= e.deltaY * scrollSpeed;
    targetY = Math.max(minY, Math.min(maxY, targetY));
  });

  // --- Movement: arrow keys ---
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") targetY -= keySpeed;
    if (e.key === "ArrowUp")   targetY += keySpeed;
    targetY = Math.max(minY, Math.min(maxY, targetY));
  });

  // --- Mouse look ---
  let isMouseDown = false;
  let lastX = 0, lastY = 0;

  window.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    // update yaw and pitch
    yaw -= dx * rotateSpeed;
    pitch -= dy * rotateSpeed;

    // clamp
    pitch = THREE.MathUtils.clamp(pitch, minPitch, maxPitch);
  });

  // --- Update function called each frame ---
  camera.updateScrollCam = () => {
    // smooth Y movement
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      smoothness
    );

    // Apply rotation directly
    camera.rotation.set(pitch, yaw, 0);
  };

  return camera;
}
