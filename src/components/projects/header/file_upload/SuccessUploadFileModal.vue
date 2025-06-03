<template>
  <div class="completion-container">
    <div class="completion-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <h2 class="completion-text">생성 완료</h2>
    
    <div class="button-group">
      <button class="complete-confirm-button" @click="handleClose">확인</button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";

const emit = defineEmits(["close"]);
// 확인 버튼 클릭 처리
const handleClose = () => {
  console.log("다운로드 완료 모달 - 확인 버튼 클릭, 모달 닫기");
  emit("close");
};
</script>

<style scoped>
.completion-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  min-height: 200px;
}

.completion-icon {
  color: #22c55e;
  margin-bottom: 24px;
  animation: checkmark-bounce 0.6s ease-out;
}

.completion-text {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 32px;
  margin-top: 0;
}

.button-group {
  display: flex;
  justify-content: center;
  width: 100%;
}

.complete-confirm-button {
  background: #000000;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.complete-confirm-button:hover {
  background: #1a202c;
  transform: translateY(-1px);
}

.complete-confirm-button:active {
  transform: translateY(0);
}

@keyframes checkmark-bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .completion-container {
    padding: 32px 16px;
  }
  
  .completion-text {
    font-size: 20px;
    margin-bottom: 24px;
  }
  
  .complete-confirm-button {
    padding: 10px 24px;
    font-size: 14px;
    min-width: 100px;
  }
}
</style>