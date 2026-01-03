import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
//import { setUpScrollCam } from './js/camera.js';
import { setupFreeOrbitCamera  } from './camera.js';

import { setupClickableLinks } from './clickLink.js';

import { setupVideoScreens } from "./videoScreens.js";

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

    

    // Camera
    // const camera = new THREE.PerspectiveCamera(
    //   50, window.innerWidth / window.innerHeight, 0.1, 100
    // );
    // camera.position.set(3, 0, 3);
    // camera.lookAt(0, 0, 0);

    // const camera = setUpScrollCam({
    //     startPos: new THREE.Vector3(6, 6, 6),
    //     lookAt: new THREE.Vector3(0, 4, 0),
    //     minY: -8,
    //     maxY: 8
    //     });
    



    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


    const camera = setupFreeOrbitCamera(renderer, {minY: -6.5  });

    // const camera = new THREE.PerspectiveCamera(20, window.innerWidth/window.innerHeight, 0.1, 100);
    // camera.position.set(5, 5, 5);
    // camera.lookAt(0,3,0);
    // setUpScrollCam(renderer, camera);
    // Lighting

    new RGBELoader(loading.manager)
  .setPath('/assets/hdris/')
  .load('room.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    //scene.background = texture; // optional
  });


    // const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    // scene.add(ambient);
    // const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    // dirLight.position.set(5, 10, 7.5);
    // scene.add(dirLight);

    // Load GLB
    let clickLinks = null;
    let videoScreens = null;

    const loader = new GLTFLoader(loading.manager);
    loader.load(
      '/assets/projects.glb',
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
            ContactButton: './contact.html',
            door : 'https://shreya6064.github.io/virtual-campus-demo/',

            bg_removal: 'https://github.com/shreya6064/remove-background',
            b42d: 'https://github.com/shreya6064/b42d',
            makespace: 'https://github.com/shreya6064/make-space',
            globalbevel: 'https://github.com/shreya6064/global-bevel',
            textnodes: '',
            originsetter: 'https://github.com/shreya6064/origin-setter',

            devpost_swiftstep: 'https://devpost.com/software/swift-step',
            devpost_halostream: 'https://devpost.com/software/holostream',
          },
        });


        videoScreens = setupVideoScreens({
          camera,
          domElement: renderer.domElement,
          sceneRoot: gltf.scene,
          screensByName: {
            prativerse_TV: "./videos/3d_virtual_campus_demo.mp4",
            traffic_sim: "./videos/traffic_sim.mp4",
            ufos: "./videos/ufos.mp4",
            poster_maker: "./videos/poster_maker.mp4",
            //VID_TV_02: "./videos/reel.mp4",
          },
          optionsByName: {
            prativerse_TV: { loop: true, muted: true },
            traffic_sim: { loop: true, muted: true },
            ufos: { loop: true, muted: true },
            poster_maker: { loop: true, muted: true },
            // VID_TV_02: { loop: true, muted: true }, // muted = easier on mobile
          },
        });
        loading.markGlbDone();


      },
      (xhr) => console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`),
      (error) => console.error(error)
    );

    // Controls (temporary)
    //const controls = new OrbitControls(camera, renderer.domElement);
    //controls.enableDamping = true;


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