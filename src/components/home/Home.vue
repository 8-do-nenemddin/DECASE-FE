<template>
  <div class="background">
    <div class="header">
      <button class="nav-button" @click="goToSignup">회원가입</button>
      <button class="nav-button" @click="goToLogin">로그인</button>
    </div>

    <div class="content">
      <h1 class="main-title">
        INNOVATE<br />
        WITH<br />
        DECASE
      </h1>
    </div>

    <div ref="canvasContainer" class="canvas-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const router = useRouter();
const canvasContainer = ref(null);
let renderer;

// 창 크기 조절 시 3D 캔버스 크기도 조절하는 함수
const onResize = (camera) => {
  if (camera && renderer && canvasContainer.value) {
    camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight);
  }
};

const goToSignup = () => router.push('/signup');
const goToLogin = () => router.push('/login');

const initThree = () => {
  if (!canvasContainer.value) return;

  // 1. SCENE SETUP
  // Scene for text/background
  const sceneBackground = new THREE.Scene();
  // Scene for 3D model
  const sceneModel = new THREE.Scene();

  // Camera shared for both scenes
  const camera = new THREE.PerspectiveCamera(
    75,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  canvasContainer.value.appendChild(renderer.domElement);

  // 2. RENDER TARGET for background (text)
  const renderTarget = new THREE.WebGLRenderTarget(
    canvasContainer.value.clientWidth,
    canvasContainer.value.clientHeight
  );

  // 3. TEXT CANVAS TEXTURE
  function makeTextTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    // background
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
    // text
    ctx.font = `bold ${Math.floor(height * 0.11)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 16;
    const lines = ['INNOVATE', 'WITH', 'DECASE'];
    const lineHeight = height * 0.13;
    const centerY = height / 2 - lineHeight;
    lines.forEach((txt, i) => {
      ctx.fillText(txt, width / 2, centerY + i * lineHeight);
    });
    return new THREE.CanvasTexture(canvas);
  }

  // 4. TEXT PLANE in sceneBackground
  const bgW = canvasContainer.value.clientWidth;
  const bgH = canvasContainer.value.clientHeight;
  const aspect = bgW / bgH;
  const textTexture = makeTextTexture(bgW, bgH);
  const textPlaneGeo = new THREE.PlaneGeometry(2 * aspect, 2);
  const textPlaneMat = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
  const textPlane = new THREE.Mesh(textPlaneGeo, textPlaneMat);
  sceneBackground.add(textPlane);

  // 5. BACKGROUND PLANE for sceneModel (will get updated with renderTarget.texture)
  const bgPlaneGeo = new THREE.PlaneGeometry(2 * aspect, 2);
  const bgPlaneMat = new THREE.MeshPhysicalMaterial({
    map: renderTarget.texture,
    transmission: 1.0,
    opacity: 1.0,
    transparent: true,
    roughness: 0.1,
    metalness: 0,
    ior: 1.2,
    thickness: 0.5
  });
  const bgPlane = new THREE.Mesh(bgPlaneGeo, bgPlaneMat);
  // Place behind model
  bgPlane.position.z = -0.1;
  sceneModel.add(bgPlane);

  // 6. GLASS MATERIAL
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0.05,
    transmission: 1.0,
    ior: 1.5,
    thickness: 1.5,
    side: THREE.DoubleSide,
    envMapIntensity: 1.0,
  });

  // 7. HDRI ENVIRONMENT MAP
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    sceneModel.environment = texture;
    glassMaterial.envMap = texture;
    glassMaterial.needsUpdate = true;
  });

  // 8. LOAD GLB MODEL into sceneModel
  const loader = new GLTFLoader();
  loader.load('/Untitled.glb', (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) child.material = glassMaterial;
    });
    model.scale.set(1.8, 1.8, 1.8);
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);
    sceneModel.add(model);
  }, undefined, console.error);

  // 9. LIGHTS (only in sceneModel)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  sceneModel.add(ambientLight);
  const pointLight1 = new THREE.PointLight(0xffffff, 1.5);
  pointLight1.position.set(5, 5, 5);
  sceneModel.add(pointLight1);
  const pointLight2 = new THREE.PointLight(0xffddaa, 1);
  pointLight2.position.set(-5, -5, -5);
  sceneModel.add(pointLight2);

  // 10. ORBIT CONTROLS (for model scene only)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // 11. ANIMATION LOOP: render background to texture, then model scene to screen
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    // update background render (text) to texture
    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(sceneBackground, camera);
    renderer.setRenderTarget(null);
    // update background plane material map to renderTarget.texture (already set, but ensure updated)
    bgPlane.material.map = renderTarget.texture;
    bgPlane.material.needsUpdate = true;
    // render model scene (with bgPlane using renderTarget.texture)
    renderer.render(sceneModel, camera);
  };
  animate();

  // 12. RESIZE HANDLING
  const resizeHandler = () => {
    if (!canvasContainer.value) return;
    const width = canvasContainer.value.clientWidth;
    const height = canvasContainer.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    // update render target
    renderTarget.setSize(width, height);
    // update background and bg planes
    const aspect = width / height;
    textPlane.geometry.dispose();
    textPlane.geometry = new THREE.PlaneGeometry(2 * aspect, 2);
    textTexture.dispose();
    textPlane.material.map = makeTextTexture(width, height);
    textPlane.material.needsUpdate = true;
    bgPlane.geometry.dispose();
    bgPlane.geometry = new THREE.PlaneGeometry(2 * aspect, 2);
    bgPlane.material.needsUpdate = true;
  };
  window.addEventListener('resize', resizeHandler);
  return resizeHandler;
};

let resizeHandlerInstance;

onMounted(() => {
  resizeHandlerInstance = initThree();
});

onUnmounted(() => {
  if (resizeHandlerInstance) {
    window.removeEventListener('resize', resizeHandlerInstance);
  }
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.background {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #000;
  color: #fff;
  z-index: 10;
}
.background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-size: cover;
  opacity: 0.08;
  pointer-events: none;
  z-index: 1;
}
.header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 30; /* UI는 항상 최상단 */
  display: flex;
  gap: 1.25rem;
}
.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  /* [핵심] 텍스트를 3D 캔버스 뒤로 보냄 */
  z-index: 10;
}
.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* [핵심] 3D 캔버스를 텍스트 앞으로 가져옴 */
  z-index: 20;
}
.main-title {
  font-size: clamp(2rem, 8vw, 5rem);
  font-weight: 800;
  letter-spacing: 0.1em;
  line-height: 1.3;
  pointer-events: none;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  color: #fff;
  /* [핵심] 텍스트가 겹칠 때 색상이 반전되어 상호작용하는 느낌과 가독성을 모두 확보 */
  mix-blend-mode: difference;
}
.nav-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}
.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}
</style>