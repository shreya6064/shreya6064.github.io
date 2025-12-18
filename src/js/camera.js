// freeOrbitCamera.js
import * as THREE from 'three';

export function setupFreeOrbitCamera(renderer, {
  distance = 7,                // radius around pivot
  startRotation = { yaw: THREE.MathUtils.degToRad(45), pitch: 0 }, //{ yaw: 0.8, pitch: 0.4 } //0.8 is 45 degree
  minPitch = THREE.MathUtils.degToRad(-10),
  maxPitch = THREE.MathUtils.degToRad(10),
  minYaw = THREE.MathUtils.degToRad(0),
  maxYaw = THREE.MathUtils.degToRad(90),

  scrollSpeed = 0.003,
  keySpeed = 0.15,
  smoothness = 0.1,
  minY = -10,
  maxY = 5,

  rotateSpeed = 0.003
} = {}) {

  // ---- CREATE PIVOT ----
  const pivot = new THREE.Object3D();
  pivot.position.set(0, 5, 0);

  // ---- CAMERA ----
  const camera = new THREE.PerspectiveCamera(20,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  let yaw = startRotation.yaw;
  let pitch = startRotation.pitch;

  let targetY = pivot.position.y;

  // position camera based on yaw/pitch every frame
  function updateCameraPosition() {
    camera.position.x = pivot.position.x + distance * Math.cos(pitch) * Math.sin(yaw);
    camera.position.y = pivot.position.y + distance * Math.sin(pitch);
    camera.position.z = pivot.position.z + distance * Math.cos(pitch) * Math.cos(yaw);

    camera.lookAt(pivot.position);
  }

  updateCameraPosition();


  // ======= MOUSE ROTATION (rotate pivot) =======
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  renderer.domElement.addEventListener("mousedown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", () => dragging = false);

  renderer.domElement.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const dx = (e.clientX - lastX);
    const dy = (e.clientY - lastY);

    lastX = e.clientX;
    lastY = e.clientY;

    yaw -= dx * rotateSpeed;
    yaw = THREE.MathUtils.clamp(yaw, minYaw, maxYaw);
    pitch -= dy * rotateSpeed;

    pitch = THREE.MathUtils.clamp(pitch, minPitch, maxPitch);

    updateCameraPosition();
  });


  // ======= SCROLL: move pivot up/down =======
  window.addEventListener("wheel", (e) => {
    targetY -= e.deltaY * scrollSpeed;
    targetY = THREE.MathUtils.clamp(targetY, minY, maxY);
  });

  // ======= ARROWS: move pivot up/down =======
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") targetY -= keySpeed;
    if (e.key === "ArrowUp")   targetY += keySpeed;
    targetY = THREE.MathUtils.clamp(targetY, minY, maxY);
  });


  // ======= UPDATE EACH FRAME =======
  camera.updateFreeOrbitCamera = () => {
    pivot.position.y = THREE.MathUtils.lerp(pivot.position.y, targetY, smoothness);
    updateCameraPosition();
  };

  return camera;
}
