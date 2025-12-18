function applyResponsiveCamera(camera) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;

  // If your camera is PerspectiveCamera:
  if (camera.isPerspectiveCamera) {
    camera.fov = isMobile ? 55 : 35;  // wider lens on mobile
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // If your custom camera has a "distance" setting, increase it on mobile.
  // This depends on your setupFreeOrbitCamera implementation.
  if (typeof camera.setOrbitDistance === "function") {
    camera.setOrbitDistance(isMobile ? 11 : 8);
  } else if ("distance" in camera) {
    // only if your setup attaches distance onto camera
    camera.distance = isMobile ? 11 : 8;
  }
}
