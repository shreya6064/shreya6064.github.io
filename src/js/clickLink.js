// clickLinks.js
import * as THREE from 'three';

/**
 * Registers clickable GLB objects by name and navigates to relative links.
 *
 * Usage:
 *   const click = setupClickableLinks({
 *     camera,
 *     domElement: renderer.domElement,
 *     sceneRoot: gltf.scene, // recommended (faster + safer than whole scene)
 *     linksByName: { ProjectsButton: './projects.html' },
 *   });
 *
 * Optional:
 *   click.dispose() when changing scenes/pages
 */
export function setupClickableLinks({
  camera,
  domElement,
  sceneRoot,
  linksByName,
  open = (href) => { window.location.href = href; },
  hoverCursor = true,
}) {
  if (!camera) throw new Error('setupClickableLinks: camera is required');
  if (!domElement) throw new Error('setupClickableLinks: domElement is required');
  if (!sceneRoot) throw new Error('setupClickableLinks: sceneRoot is required');
  if (!linksByName || typeof linksByName !== 'object') {
    throw new Error('setupClickableLinks: linksByName object is required');
  }

  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();

  // Build a list of objects to raycast against.
  // We store the actual objects found by name.
  const clickableObjects = [];
  const urlByUuid = new Map();

  for (const [name, href] of Object.entries(linksByName)) {
    const obj = sceneRoot.getObjectByName(name);
    if (!obj) {
      console.warn(`[clickLinks] Object not found in GLB: "${name}"`);
      continue;
    }
    clickableObjects.push(obj);
    urlByUuid.set(obj.uuid, href);
  }

  function setMouseFromEvent(event) {
    const rect = domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    mouseNDC.set(x, y);
  }

  function intersectFirst(event) {
    if (clickableObjects.length === 0) return null;

    setMouseFromEvent(event);
    raycaster.setFromCamera(mouseNDC, camera);

    // "true" means it will check descendants too (good if your named object is a parent)
    const hits = raycaster.intersectObjects(clickableObjects, true);
    if (hits.length === 0) return null;

    // We may hit a child mesh, so walk up until we find a registered clickable root.
    let obj = hits[0].object;
    while (obj && !urlByUuid.has(obj.uuid)) obj = obj.parent;

    if (!obj) return null;
    return { href: urlByUuid.get(obj.uuid), hit: hits[0], object: obj };
  }

  function onClick(event) {
    const res = intersectFirst(event);
    if (!res) return;
    open(res.href);
  }

  function onMove(event) {
    const res = intersectFirst(event);
    domElement.style.cursor = res ? 'pointer' : '';
  }

  domElement.addEventListener('click', onClick);
  if (hoverCursor) domElement.addEventListener('mousemove', onMove);

  return {
    dispose() {
      domElement.removeEventListener('click', onClick);
      if (hoverCursor) domElement.removeEventListener('mousemove', onMove);
      domElement.style.cursor = '';
    },
    debug: {
      clickableObjects,
      linksByName,
    },
  };
}
