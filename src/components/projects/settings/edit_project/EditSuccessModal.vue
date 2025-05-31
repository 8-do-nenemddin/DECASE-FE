<template>
  <CommonModal
    :closeOnOverlayClick="true"
    :modalClass="modalClass"
    :closeButtonClass="closeButtonClass"
    @close="handleClose"
  >
    <div class="content-container">
      <div class="completion-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h2 class="completion-text">수정 완료</h2>
      <div class="button-group">
        <button class="button confirm-button" @click="handleClose">확인</button>
      </div>
    </div>
  </CommonModal>
</template>

<script setup>
import { defineEmits } from "vue";
import CommonModal from "../../../util/CommonModal.vue";

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
  padding: 1rem;
  padding-top: 4rem;
  /* padding-bottom: 0rem; */
  font-family: "Noto Sans KR", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 200px;
  justify-content: space-between;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.download-icon {
  font-size: 4rem;
  color: #1f2937;
}

.completion-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin: 0;
  margin-bottom: 3rem;
  line-height: 1.4;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: auto;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: "Noto Sans KR", sans-serif;
}

.confirm-button {
  background-color: #1f2937;
  color: white;
}

.confirm-button:hover {
  background-color: #374151;
}
</style>
