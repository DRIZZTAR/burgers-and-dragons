import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh) {
      // Activate shadow here
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
// Intensity
scene.environmentIntensity = 1;
gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001);

// HDR (RGBE) equirectangular
rgbeLoader.load('/environmentMaps/hyrule.hdr', (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.environment = environmentMap;
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 6);
directionalLight.position.set(-4, 6.5, 2.5);
scene.add(directionalLight);

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity');
gui.add(directionalLight.position, 'x').min(-10).max(10).step(0.001).name('lightX');
gui.add(directionalLight.position, 'y').min(-10).max(10).step(0.001).name('lighty');
gui.add(directionalLight.position, 'z').min(-10).max(10).step(0.001).name('lightz');

// Shadows
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.03;
directionalLight.shadow.bias = -0.007;
directionalLight.shadow.mapSize.set(512, 512);
gui.add(directionalLight, 'castShadow').name('lightShadow');
gui.add(directionalLight.shadow, 'normalBias').min(-0.05).max(0.05).step(0.001).name('normalLightBias');
gui.add(directionalLight.shadow, 'bias').min(-0.05).max(0.05).step(0.001).name('Bias');

// Helper
// const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightHelper);

// Target
directionalLight.target.position.set(0, 4, 0);
directionalLight.target.updateWorldMatrix();
/**
 * Models
 */
// Helmet
// gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
//   gltf.scene.scale.set(10, 10, 10);
//   scene.add(gltf.scene);

//   updateAllMaterials();
// });

// Hamburger
const hamburgerScale = {
  scaleX: 0.4,
  scaleY: 0.4,
  scaleZ: 0.4,
};

let hamburger;

gltfLoader.load('/models/voxel_link.glb', (gltf) => {
  hamburger = gltf.scene;
  hamburger.scale.set(hamburgerScale.scaleX, hamburgerScale.scaleY, hamburgerScale.scaleZ);
  scene.add(hamburger);

  // Add GUI controls for scaling
  gui
    .add(hamburgerScale, 'scaleX', 0.001, 2)
    .name('Scale X')
    .onChange((value) => {
      hamburger.scale.x = value;
    });

  gui
    .add(hamburgerScale, 'scaleY', 0, 2)
    .name('Scale Y')
    .onChange((value) => {
      hamburger.scale.y = value;
    });

  gui
    .add(hamburgerScale, 'scaleZ', 0.001, 2)
    .name('Scale Z')
    .onChange((value) => {
      hamburger.scale.z = value;
    });

  // Update materials if necessary
  updateAllMaterials();
});

// Walls and floor
const floorColorTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg');
floorColorTexture.colorSpace = THREE.SRGBColorSpace;
const floorNormalTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png');
const floorAORoughnessMetalnessTexture = textureLoader.load(
  '/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg'
);
const wallColorTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg');
wallColorTexture.colorSpace = THREE.SRGBColorSpace;
const wallNormalTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_nor_1k.jpg');
const wallAORoughnessMetalnessTexture = textureLoader.load(
  '/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg'
);

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(8, 8),
	new THREE.MeshStandardMaterial({
		map: wallColorTexture,
		normalMap: wallNormalTexture,
		aoMap: wallAORoughnessMetalnessTexture,
		roughnessMap: wallAORoughnessMetalnessTexture,
		metalnessMap: wallAORoughnessMetalnessTexture,
	})
);
floor.rotation.x = -Math.PI * 0.5;

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    normalMap: wallNormalTexture,
    aoMap: wallAORoughnessMetalnessTexture,
    roughnessMap: wallAORoughnessMetalnessTexture,
    metalnessMap: wallAORoughnessMetalnessTexture,
  })
);

wall.position.z = -4;
wall.position.y = 4;

scene.add(floor);
// scene.add(wall);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 5, 12);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Render
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Tone mapping

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;

gui.add(renderer, 'toneMapping', {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});

gui.add(renderer, 'toneMappingExposure').min(0.001).max(10).step(0.001);

// Shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Initialize the clock
const clock = new THREE.Clock();

/**
 * Animate
 */
const tick = () => {
  // Get the elapsed time
  const elapsedTime = clock.getElapsedTime();
  // Update controls
  controls.update();

if (hamburger) {
	const hoverAmplitude = 0.5; // Adjust hover height
	const hoverSpeed = 0.5; // Adjust hover speed
	const rotationSpeedX = 0.3; // Adjust rotation speed around x-axis
	const rotationSpeedY = 0.5; // Adjust rotation speed around y-axis

	const hoverOffset = 1.5; // Base height offset

	// Smooth hovering
	hamburger.position.y = Math.sin(Math.PI * elapsedTime * hoverSpeed) * hoverAmplitude + hoverOffset;

	// Smooth rotation
	hamburger.rotation.x = Math.cos(Math.PI * elapsedTime * rotationSpeedX) * 0.3;
	hamburger.rotation.y = Math.sin(Math.PI * elapsedTime * rotationSpeedY) * 0.5;
}

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
