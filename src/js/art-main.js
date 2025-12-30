import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
//import { setUpScrollCam } from './js/camera.js';
import { setupFreeOrbitCamera  } from './camera.js';
import { setupClickableLinks } from './clickLink.js';
import { createLoadingOverlay } from "./loadingOverlay.js";
import { createLoadingController } from "./loadingManager.js";



const overlayUI = createLoadingOverlay();

let readyToRender = false;

const loading = createLoadingController({
  overlayUI,
  onReady: () => { readyToRender = true; },
});



// Scene
    const scene = new THREE.Scene();




    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


    const camera = setupFreeOrbitCamera(renderer, { minY: -11.2 });



    new RGBELoader(loading.manager)
  .setPath('/assets/hdris/')
  .load('room.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    //scene.background = texture; // optional
  });



  let clickLinks = null;
    // Load GLB
    const loader = new GLTFLoader(loading.manager);
    loader.load(
      '/assets/art.glb',
      (gltf) => {
        scene.add(gltf.scene);
        clickLinks = setupClickableLinks({
                          camera,
                          domElement: renderer.domElement,
                          sceneRoot: gltf.scene,
                          linksByName: {
                            HomeButton: './index.html',
                            ProjectsButton: './projects.html',
                            ShadersButton: './shaders.html',
                            ArtButton: './art.html',
                            AboutButton: './about.html',
                            ContactButton: './contact.html'
                          },
                        });
        loading.markGlbDone();
      },
      (xhr) => console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`),
      (error) => console.error(error)
    );



    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Loop
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      camera.updateFreeOrbitCamera();
      //camera.updateFreeCam(); 
      //controls.update();
      renderer.render(scene, camera);
    }
    animate();