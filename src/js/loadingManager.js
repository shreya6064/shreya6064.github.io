// src/js/loadingManager.js
import * as THREE from "three";

export function createLoadingController({
  overlayUI,                // required: the object from createLoadingOverlay()
  initialLabel = "Loading 3D scene…",
  finishingLabel = "Finishing up…",
  readyLabel = "Ready!",
  onReady = null,           // optional callback when fully done
} = {}) {
  if (!overlayUI) throw new Error("createLoadingController: overlayUI is required");

  const manager = new THREE.LoadingManager();

  let glbDone = false;
  let managerDone = false;

  overlayUI.setLabel(initialLabel);
  overlayUI.setProgress(0);

  function tryFinish() {
    if (glbDone && managerDone) {
      overlayUI.setProgress(1);
      overlayUI.setLabel(readyLabel);
      overlayUI.hide();
      onReady?.();
    }
  }

  manager.onLoad = () => {
    managerDone = true;
    tryFinish();
  };

  manager.onError = (url) => {
    console.warn("[LoadingManager] Failed to load:", url);
  };

  return {
    manager,

    // Use this as GLTFLoader's onProgress callback
    onGlbProgress(xhr) {
      if (xhr?.total) {
        overlayUI.setProgress(xhr.loaded / xhr.total);
      } else {
        // fallback so it doesn’t look stuck if total is unknown
        overlayUI.setProgress(0.05);
      }
    },

    // Call this inside GLTFLoader onLoad
    markGlbDone() {
      glbDone = true;
      overlayUI.setProgress(1);
      overlayUI.setLabel(finishingLabel);
      tryFinish();
    },

    // Optional: if you want to manually force finish
    _debugForceFinish() {
      glbDone = true;
      managerDone = true;
      tryFinish();
    },
  };
}
