<template>
  <div class="content-container">
    <div class="icon-container">
      <span class="material-icons download-icon">file_download</span>
    </div>

    <h2 class="completion-text">다운로드 완료</h2>
    <div class="button-group">
      <button class="button confirm-button" @click="handleClose">확인</button>
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
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.content-container {
  padding: 3rem;
  font-family: "Noto Sans KR", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 2rem;
  min-height: 200px;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background-color: #f3f4f6;
  border-radius: 50%;
}

.download-icon {
  font-size: 2.5rem;
  color: black;
}

.completion-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.button-group {
  display: flex;
  justify-content: center;
  width: 100%;
}

.button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Noto Sans KR", sans-serif;
  min-width: 100px;
}

.confirm-button {
  background-color: black;
  color: white;
}

.confirm-button:hover {
  background-color: rgb(105, 102, 102);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(188, 192, 191, 0.3);
}
</style>