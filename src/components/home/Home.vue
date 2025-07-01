<template>
  <div id="scene-container">
    <div class="header">
      <button class="nav-button" @click="goToSignup">회원가입</button>
      <button class="nav-button" @click="goToLogin">로그인</button>
    </div>
    <div class="canvas-wrapper">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useRouter } from 'vue-router';

const router = useRouter();

const goToSignup= () => {
  router.push('/signup');
};

const goToLogin = () => {
  router.push('/login');
};

const canvasRef = ref(null)

onMounted(() => {
  const canvas = canvasRef.value
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputEncoding = THREE.sRGBEncoding

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 10)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)

  // 텍스트 기반 배경 텍스처 (3줄로 수정)
  const textCanvas = document.createElement('canvas')
  textCanvas.width = 1024
  textCanvas.height = 1024
  const ctx = textCanvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, textCanvas.width, textCanvas.height)
  ctx.font = 'bold 100px Georgia'
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.fillText('BREAK', 512, 380)
  ctx.fillText('THE', 512, 520)
  ctx.fillText('CASE', 512, 660)

  const backgroundTexture = new THREE.CanvasTexture(textCanvas)
  backgroundTexture.encoding = THREE.sRGBEncoding
  scene.background = backgroundTexture
  scene.environment = backgroundTexture

  const loader = new GLTFLoader()
  loader.load('/Untitled.glb', (gltf) => {
    const model = gltf.scene
    const wrapper = new THREE.Group()
    wrapper.add(model)

    // 중심 정렬
    const box = new THREE.Box3().setFromObject(model)
    const center = new THREE.Vector3()
    box.getCenter(center)
    model.position.sub(center)

    wrapper.scale.set(4, 4, 4)
    scene.add(wrapper)

    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xf5f5f5),
          metalness: 0,
          roughness: 0.05,
          transparent: true,
          opacity: 0.7,
          transmission: 1.0,
          thickness: 1.5,
          ior: 1.5,
          reflectivity: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.5
        })
      }
    })
  })

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableZoom = false
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.5
  controls.target.set(0, 0, 0)

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
})
</script>

<style scoped>
.header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 30; /* UI는 항상 최상단 */
  display: flex;
  gap: 1.25rem;
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

#scene-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #02162a;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

</style>