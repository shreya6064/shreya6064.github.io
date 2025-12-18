// camera.js (freeOrbitCamera.js)
import * as THREE from 'three';

export function setupFreeOrbitCamera(renderer, {
  // ---- framing ----
  distance = 7,
  startRotation = { yaw: THREE.MathUtils.degToRad(45), pitch: 0 },
  minPitch = THREE.MathUtils.degToRad(-10),
  maxPitch = THREE.MathUtils.degToRad(10),
  minYaw = THREE.MathUtils.degToRad(0),
  maxYaw = THREE.MathUtils.degToRad(90),

  // ---- movement ----
  scrollSpeed = 0.003,
  keySpeed = 0.15,
  smoothness = 0.1,
  minY = -10,
  maxY = 5,
  rotateSpeed = 0.003,

  // ---- responsive ----
  responsive = {
    breakpoint: 768,
    fovDesktop: 20,
    fovMobile: 55,
    distanceDesktop: distance,
    distanceMobile: 11,
    // optional: slightly wider yaw on mobile if you want
    // minYawMobile: minYaw, maxYawMobile: maxYaw,
  },

  // ---- touch/gesture tuning ----
  touch = {
    enabled: true,
    pinchSpeed: 0.015,   // how fast pinch changes distance
    minDistance: 4,
    maxDistance: 30,
  },
} = {}) {

  const dom = renderer.domElement;

  // Important for mobile: prevent page scroll/zoom eating gestures
  dom.style.touchAction = "none";

  // ---- CREATE PIVOT ----
  const pivot = new THREE.Object3D();
  pivot.position.set(0, 5, 0);

  // ---- CAMERA ----
  const camera = new THREE.PerspectiveCamera(
    responsive?.fovDesktop ?? 20,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  let yaw = startRotation.yaw;
  let pitch = startRotation.pitch;

  let targetY = pivot.position.y;

  // distance becomes mutable now (for responsive + pinch)
  let currentDistance = distance;

  function updateCameraPosition() {
    camera.position.x = pivot.position.x + currentDistance * Math.cos(pitch) * Math.sin(yaw);
    camera.position.y = pivot.position.y + currentDistance * Math.sin(pitch);
    camera.position.z = pivot.position.z + currentDistance * Math.cos(pitch) * Math.cos(yaw);
    camera.lookAt(pivot.position);
  }

  // ---- RESPONSIVE APPLY ----
  function applyResponsive() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < (responsive?.breakpoint ?? 768);

    const fov = isMobile ? (responsive?.fovMobile ?? 55) : (responsive?.fovDesktop ?? 20);
    camera.fov = fov;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const desiredDist = isMobile
      ? (responsive?.distanceMobile ?? 11)
      : (responsive?.distanceDesktop ?? distance);

    currentDistance = desiredDist;
    updateCameraPosition();
  }

  camera.applyResponsive = applyResponsive;

  applyResponsive();

  // ======= DESKTOP MOUSE ROTATION =======
  let draggingMouse = false;
  let lastX = 0;
  let lastY = 0;

  dom.addEventListener("mousedown", (e) => {
    draggingMouse = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", () => { draggingMouse = false; });

  dom.addEventListener("mousemove", (e) => {
    if (!draggingMouse) return;

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

  // ======= SCROLL: move pivot up/down (desktop) =======
  window.addEventListener("wheel", (e) => {
    // On mobile, wheel doesn't apply; safe to keep.
    targetY -= e.deltaY * scrollSpeed;
    targetY = THREE.MathUtils.clamp(targetY, minY, maxY);
  }, { passive: true });

  // ======= ARROWS: move pivot up/down =======
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") targetY -= keySpeed;
    if (e.key === "ArrowUp")   targetY += keySpeed;
    targetY = THREE.MathUtils.clamp(targetY, minY, maxY);
  });

  // ======= TOUCH / POINTER (1-finger rotate, 2-finger pinch) =======
  const activePointers = new Map(); // id -> {x,y}
  let lastPinchDist = null;

  function getPinchDistance() {
    const pts = Array.from(activePointers.values());
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function onPointerDown(e) {
    if (!touch?.enabled) return;
    dom.setPointerCapture?.(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.size === 2) {
      lastPinchDist = getPinchDistance();
    }
  }

  function onPointerMove(e) {
    if (!touch?.enabled) return;
    if (!activePointers.has(e.pointerId)) return;

    const prev = activePointers.get(e.pointerId);
    const cur = { x: e.clientX, y: e.clientY };
    activePointers.set(e.pointerId, cur);

    // 1 pointer => rotate like mouse drag
    if (activePointers.size === 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;

      yaw -= dx * rotateSpeed;
      yaw = THREE.MathUtils.clamp(yaw, minYaw, maxYaw);

      pitch -= dy * rotateSpeed;
      pitch = THREE.MathUtils.clamp(pitch, minPitch, maxPitch);

      updateCameraPosition();
      return;
    }

    // 2 pointers => pinch zoom (change distance)
    if (activePointers.size === 2) {
      const dist = getPinchDistance();
      if (lastPinchDist != null) {
        const delta = dist - lastPinchDist;

        currentDistance -= delta * (touch?.pinchSpeed ?? 0.015);
        currentDistance = THREE.MathUtils.clamp(
          currentDistance,
          touch?.minDistance ?? 4,
          touch?.maxDistance ?? 30
        );

        updateCameraPosition();
      }
      lastPinchDist = dist;
    }
  }

  function onPointerUp(e) {
    if (!touch?.enabled) return;
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) lastPinchDist = null;
  }

  dom.addEventListener("pointerdown", onPointerDown);
  dom.addEventListener("pointermove", onPointerMove);
  dom.addEventListener("pointerup", onPointerUp);
  dom.addEventListener("pointercancel", onPointerUp);

  // ======= UPDATE EACH FRAME =======
  camera.updateFreeOrbitCamera = () => {
    pivot.position.y = THREE.MathUtils.lerp(pivot.position.y, targetY, smoothness);
    updateCameraPosition();
  };

  // Optional: auto-apply responsive on resize
  window.addEventListener('resize', () => {
    applyResponsive();
  });

  return camera;
}
