// videoScreens.js
import * as THREE from "three";

/**
 * Turns named meshes into video screens.
 * - click to toggle play/pause
 * - supports multiple screens
 *
 * Usage:
 *   const vs = setupVideoScreens({ camera, domElement, sceneRoot: gltf.scene, screensByName: {...} });
 *   // in animate:
 *   vs.update(); // optional (mostly not needed, but kept for future)
 */
export function setupVideoScreens({
  camera,
  domElement,
  sceneRoot,
  screensByName, // { "VID_TV_01": "/videos/demo.mp4", ... }
  optionsByName = {}, // per-screen overrides
  defaultOptions = {
    loop: true,
    muted: false,      // if you want autoplay, set muted:true
    playsInline: true, // important for iOS
    preload: "auto",
    crossOrigin: "anonymous", // if hosting videos elsewhere with CORS
  },
  toggleOnClick = true,
} = {}) {
  if (!camera) throw new Error("setupVideoScreens: camera is required");
  if (!domElement) throw new Error("setupVideoScreens: domElement is required");
  if (!sceneRoot) throw new Error("setupVideoScreens: sceneRoot is required");
  if (!screensByName) throw new Error("setupVideoScreens: screensByName is required");

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const screens = []; // { mesh, video, texture }

  function makeVideo(url, opts) {
    const v = document.createElement("video");
    v.src = url;
    v.loop = !!opts.loop;
    v.muted = !!opts.muted;
    v.preload = opts.preload ?? "auto";
    v.playsInline = !!opts.playsInline;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    if (opts.crossOrigin) v.crossOrigin = opts.crossOrigin;

    // On mobile, user gesture is usually required to play audio.
    // We'll start playback on click anyway.
    return v;
  }

  function attachVideoToMesh(mesh, url, opts) {
    const video = makeVideo(url, opts);
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace; // if your renderer uses SRGBColorSpace
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Ensure mesh has a material we can edit
    const material = mesh.material?.clone ? mesh.material.clone() : new THREE.MeshStandardMaterial();
    material.map = texture;
    material.emissive = new THREE.Color(0xffffff);     // make it feel "screen-like"
    material.emissiveIntensity = 1.0;
    material.emissiveMap = texture;
    material.needsUpdate = true;

    mesh.material = material;

    screens.push({ mesh, video, texture });
  }

  // Build screens from names
  for (const [name, url] of Object.entries(screensByName)) {
    const mesh = sceneRoot.getObjectByName(name);
    if (!mesh) {
      console.warn(`[videoScreens] Mesh not found: "${name}"`);
      continue;
    }
    const opts = { ...defaultOptions, ...(optionsByName[name] || {}) };
    attachVideoToMesh(mesh, url, opts);
  }

  function setMouseFromEvent(e) {
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function onClick(e) {
    if (!toggleOnClick || screens.length === 0) return;

    setMouseFromEvent(e);
    raycaster.setFromCamera(mouse, camera);

    const meshes = screens.map(s => s.mesh);
    const hits = raycaster.intersectObjects(meshes, true);
    if (hits.length === 0) return;

    // Walk up to the named mesh
    let obj = hits[0].object;
    let screen = null;
    while (obj && !screen) {
      screen = screens.find(s => s.mesh === obj);
      obj = obj.parent;
    }
    if (!screen) return;

    const v = screen.video;

    // If you want “only one plays at a time”, pause others:
    // screens.forEach(s => { if (s.video !== v) s.video.pause(); });

    if (v.paused) {
      v.play().catch(err => console.warn("[videoScreens] play() blocked:", err));
    } else {
      v.pause();
    }
  }

  domElement.addEventListener("click", onClick);

  return {
    screens,
    update() {
      // no-op for now; VideoTexture updates internally
    },
    dispose() {
      domElement.removeEventListener("click", onClick);
      screens.forEach(s => {
        s.video.pause();
        s.texture.dispose?.();
        // material dispose optional:
        s.mesh.material?.dispose?.();
      });
      screens.length = 0;
    }
  };
}
