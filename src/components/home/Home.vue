<template>
  <div class="background">
    <div class="header">
      <button class="nav-button" @click="goToSignup">회원가입</button>
      <button class="nav-button" @click="goToLogin">로그인</button>
    </div>

    <div class="content">
      <div ref="canvasContainer" class="canvas-container"></div>

      <h1 class="main-title">
        INNOVATE<br>
        WITH<br>
        DECASE
      </h1>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const router = useRouter();
const canvasContainer = ref(null);

// Three.js 관련 변수
let scene, camera, renderer, mesh, controls;

// 라우팅 함수
const goToSignup = () => router.push('/signup');
const goToLogin = () => router.push('/login');

// Three.js 초기화 함수
const initThree = () => {
  if (!canvasContainer.value) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, canvasContainer.value.clientWidth / canvasContainer.value.clientHeight, 0.1, 1000);
  camera.position.z = 2.5; // D 객체가 잘 보이도록 카메라 위치 조정

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  canvasContainer.value.appendChild(renderer.domElement);

  // --- 'D' 형태의 3D Geometry 생성 ---
  // 1. 'D' 모양의 2D Shape를 생성합니다.
  const letterDShape = new THREE.Shape();

  // 2. 바깥쪽 경로를 그립니다: 왼쪽 직선 -> 오른쪽 반원
  const outerRadius = 1;
  letterDShape.moveTo(0, -outerRadius);
  letterDShape.lineTo(0, outerRadius);
  letterDShape.arc(0, 0, outerRadius, Math.PI / 2, -Math.PI / 2, true); // 시계 방향으로 반원

  // 3. 안쪽 구멍(hole) 경로를 그립니다.
  const innerRadius = 0.6;
  const holePath = new THREE.Path();
  holePath.moveTo(0, -innerRadius);
  holePath.lineTo(0, innerRadius);
  holePath.arc(0, 0, innerRadius, Math.PI / 2, -Math.PI / 2, true);
  letterDShape.holes.push(holePath);

  // 4. 2D Shape를 3D로 돌출(Extrude)시키기 위한 설정을 정의합니다.
  const extrudeSettings = {
    steps: 2,
    depth: 0.4,           // 객체의 두께
    bevelEnabled: true,     // 베벨(모서리 깎기) 활성화
    bevelThickness: 0.1,    // 베벨의 두께
    bevelSize: 0.08,        // 베벨의 크기
    bevelOffset: 0,
    bevelSegments: 8        // 베벨을 얼마나 부드럽게 할지 (숫자가 클수록 부드러움)
  };

  // 5. 설정에 따라 돌출된 지오메트리를 생성합니다.
  const geometry = new THREE.ExtrudeGeometry(letterDShape, extrudeSettings);

  // 6. 생성된 지오메트리의 중심을 (0,0,0)으로 맞춥니다.
  geometry.center();

  // 7. 유리 질감 재질을 생성합니다. (이전과 동일)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0,
    transmission: 1.0,
    ior: 2.33,
    thickness: 1.0,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });

  // 8. 지오메트리와 재질을 합쳐 메쉬(객체)를 만듭니다.
  mesh = new THREE.Mesh(geometry, glassMaterial);
  scene.add(mesh);


  // 조명 설정 (이전과 동일)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight1 = new THREE.PointLight(0xffffff, 1);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);
  const pointLight2 = new THREE.PointLight(0xffddaa, 0.8);
  pointLight2.position.set(-5, -5, -5);
  scene.add(pointLight2);

  // 컨트롤 설정 (이전과 동일)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;

  animate();
};

// 애니메이션 및 리사이즈 함수 (이전과 동일)
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

const onResize = () => {
  if (camera && renderer && canvasContainer.value) {
    camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight);
  }
};

// 라이프사이클 훅 (이전과 동일)
onMounted(() => {
  initThree();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if(renderer) {
    renderer.dispose();
  }
  if(mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
});
</script>

<style>
/* 기존 스타일을 유지하면서 일부 수정 및 추가 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden; /* 전체 스크롤 방지 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.background {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 콘텐츠를 중앙으로 정렬 */
  align-items: center;
  background-color: #000;
  color: #fff;
  height: 100vh;
  width: 100vw;
}

.header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 10;
  display: flex;
  gap: 1.25rem;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;
  position: relative; /* 자식 요소의 absolute 포지셔닝 기준 */
}

/* 3D 오브젝트가 들어갈 캔버스 컨테이너 */
.canvas-container {
  position: absolute; /* 텍스트와 겹치도록 설정 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  height: 80vh;
  max-width: 800px; /* 최대 너비 제한 */
  max-height: 800px; /* 최대 높이 제한 */
  z-index: 1; /* 텍스트보다 뒤에 위치 */
}

/* 메인 타이틀 스타일 */
.main-title {
  font-size: clamp(2rem, 8vw, 5rem); /* 반응형 폰트 사이즈 */
  font-weight: 800; /* 더 굵게 */
  letter-spacing: 0.1em; /* 자간 */
  z-index: 5; /* 캔버스보다 앞에 위치 */
  pointer-events: none; /* 텍스트가 마우스 이벤트를 가로채지 않도록 설정 */
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3); /* 은은한 텍스트 그림자 */
}

.nav-button {
  background-color: rgba(255, 255, 255, 0.1); /* 반투명 배경 */
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3); /* 얇은 테두리 */
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px); /* 배경 블러 처리 (지원 브라우저) */
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .main-title {
    letter-spacing: 0.05em;
  }
}
</style>