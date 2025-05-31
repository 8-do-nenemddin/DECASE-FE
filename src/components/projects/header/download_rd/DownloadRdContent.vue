<template>
  <!-- 확인 컴포넌트 -->
  <SuccessDownloadModal v-if="currentView === 'confirm'" @close="closeModal" />
  <!-- 다운로드 확인 모달 -->
  <div class="content-container" @click.stop v-if="currentView === 'download'">
    <!-- 다운로드 아이콘 -->
    <div class="icon-container">
      <span class="material-icons download-icon">file_download</span>
    </div>

    <!-- 제목 -->
    <h2 class="title">요구사항 정의서를 다운로드 하시겠습니까?</h2>

    <!-- 파일 목록 -->
    <div class="file-section">
      <p class="file-list-title">** 다운로드 예정 파일 **</p>
      <ul class="file-list">
        <li>Project1_요구사항_정의서.xlsx</li>
        <li>Project1_조건표.xlsx</li>
        <li>Project1_요구사항_정의서_추적_매트릭스.xlsx</li>
      </ul>
    </div>

    <!-- 버튼 그룹 -->
    <div class="button-group">
      <button class="button confirm-button" @click="handleConfirm">확인</button>
      <button class="button cancel-button" @click="handleCancel">취소</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SuccessDownloadModal from "./SuccessDownloadModal.vue";

// 이벤트 정의
const emit = defineEmits(["close", "confirm"]);

// 반응형 데이터
const showModal = ref(true);
const currentView = ref("download"); // 'confirm' 또는 'download'

// 메서드들
const handleConfirm = () => {
  // 확인 버튼 클릭 시 SuccessUploadFileModal로 전환
  console.log("다운로드 확인 - SuccessUploadFileModal로 전환");
  currentView.value = "confirm";
  emit("confirm");
};

const handleCancel = () => {
  // 취소 버튼 클릭 시 모달 닫기
  console.log("다운로드 취소");
  closeModal();
};

const closeModal = () => {
  // 모달 완전히 닫기
  showModal.value = false;
  emit("close");
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.content-container {
  padding: 32px;
  margin: 35px;
  margin-bottom: 5px;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.download-icon {
  font-size: 4rem;
  color: #1f2937;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.4;
}

.file-section {
  margin-bottom: 2rem;
}

.file-list-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
}

.file-list {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin: 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.file-list li {
  margin-bottom: 0.25rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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

.cancel-button {
  background-color: #1f2937;
  color: white;
}

.cancel-button:hover {
  background-color: #374151;
}
</style>
