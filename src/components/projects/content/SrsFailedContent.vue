<template>
  <div class="failed-card">
    <h2>요구사항 정의서 생성 실패</h2>
    <p>요구사항 정의서 생성에 실패했습니다.<br />다시 시도해 주세요.</p>
    <button @click="goToBasicContent">재시도</button>
    <div v-if="message" class="error-message">{{ message }}</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const goToBasicContent= () => {
  router.push('/basic');
};


const props = defineProps({
  message: { type: String, default: "" },
});
</script>

<style scoped>
.failed-card {
  width: 100%;
  max-width: 700px;
  background: #fff0f0;
  border: 1px solid #e57373;
  border-radius: 12px;
  padding: 60px;
  box-shadow: 0 2px 8px rgba(229, 115, 115, 0.08),
    0 1px 2px rgba(229, 115, 115, 0.12);
  text-align: center;
  margin: 0 auto;
}
.failed-card h2 {
  color: #d32f2f;
  font-size: 2rem;
  margin-bottom: 16px;
}
.failed-card p {
  color: #b71c1c;
  font-size: 1.1rem;
  margin-bottom: 24px;
}
.failed-card .error-message {
  color: #d32f2f;
  margin-top: 16px;
  font-size: 0.95rem;
}
.failed-card button {
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.failed-card button:hover {
  background: #b71c1c;
}
</style>
