import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
//import { setUpScrollCam } from './js/camera.js';
import { setupFreeOrbitCamera  } from './camera.js';

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



    const camera = setupFreeOrbitCamera(renderer);

    // const camera = new THREE.PerspectiveCamera(20, window.innerWidth/window.innerHeight, 0.1, 100);
    // camera.position.set(5, 5, 5);
    // camera.lookAt(0,3,0);
    // setUpScrollCam(renderer, camera);
    // Lighting

    new RGBELoader()
  .setPath('/hdris/')
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
    const loader = new GLTFLoader();
    loader.load(
      '/projects.glb',
      (gltf) => {
        scene.add(gltf.scene);
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