<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 로딩 상태가 아닐 때: 업로드 UI -->
      <div v-if="!isGenerating && !isCompleted">
        <!-- X 버튼 -->
        <button class="close-button" @click="closeModal">X</button>

        <!-- 업로드 영역 -->
        <div
          class="upload-area"
          @click="handleUploadAreaClick"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          :class="{ 'drag-over': isDragOver }"
        >
          <!-- 업로드 아이콘 -->
          <div class="upload-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17,8 12,3 7,8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>

          <!-- 업로드 제목 -->
          <h2 class="upload-title">소스 업로드</h2>

          <!-- 업로드 설명 -->
          <p class="upload-description">
            업로드할 파일을 선택하거나 드래그 앤 드롭해주세요. (예: RFP, 회의록,
            엑셀)<br />
            지원 파일 형식 : pdf, .xlsx, .xls, .wav, .docx
          </p>

          <!-- 히든 파일 인풋 -->
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            multiple
            accept=".pdf,.xlsx,.xls,.wav,.docx"
            style="display: none"
          />
        </div>

        <!-- 선택된 파일 목록 -->
        <div v-if="selectedFiles.length > 0" class="file-list">
          <h3 class="file-list-title">선택된 파일</h3>
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="file-item"
          >
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <button class="remove-file" @click="removeFile(index)">×</button>
          </div>
        </div>

        <!-- 버튼 그룹 -->
        <div class="button-group">
          <button
            class="upload-button"
            @click="handleUpload"
            :disabled="selectedFiles.length === 0 || isUploading"
          >
            <span v-if="isUploading" class="loading"></span>
            <span v-else>{{
              selectedFiles.length === 0 ? "확인" : "업로드"
            }}</span>
          </button>
          <button class="cancel-button" @click="closeModal">취소</button>
        </div>
      </div>

      <!-- 생성 완료 상태일 때: 완료 UI -->
      <div v-if="isCompleted" class="completion-container">
        <!-- X 버튼 -->
        <button class="close-button" @click="closeModal">X</button>
        <!-- 완료 아이콘 -->
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

        <!-- 완료 텍스트 -->
        <h2 class="completion-text">생성 완료</h2>
        <div class="button-group">
          <button class="complete-confirm-button" @click="closeModal">
            확인
          </button>
        </div>
      </div>

      <!-- 로딩 상태일 때: 생성 중 UI -->
      <div v-else-if="isGenerating && !isCompleted" class="loading-container">
        <!-- X 버튼 -->
        <button class="close-button" @click="closeModal">X</button>

        <div class="loading-spinner">
          <div class="dot dot1"></div>
          <div class="dot dot2"></div>
          <div class="dot dot3"></div>
          <div class="dot dot4"></div>
          <div class="dot dot5"></div>
          <div class="dot dot6"></div>
          <div class="dot dot7"></div>
          <div class="dot dot8"></div>
        </div>

        <!-- 로딩 텍스트 -->
        <h2 class="loading-text">요구사항 정의서 생성 중...</h2>

        <!-- 안내 메시지 -->
        <p class="loading-message">
          창을 닫아도 요구사항 정의서 생성은 종료되지 않습니다.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "upload"]);

const fileInput = ref(null);
const selectedFiles = ref([]);
const isDragOver = ref(false);
const isUploading = ref(false);
const isGenerating = ref(false);
const isCompleted = ref(false);

const handleOverlayClick = () => {
  // 생성 중이거나 완료 상태일 때는 오버레이 클릭으로 닫지 않음
  if (!isGenerating.value && !isCompleted.value) {
    resetModal();
    emit("close");
  }
};

// 모달 상태 초기화 함수
const resetModal = () => {
  selectedFiles.value = [];
  isDragOver.value = false;
  isUploading.value = false;
  isGenerating.value = false;
  isCompleted.value = false;
};

// 모달 닫기 함수
const closeModal = () => {
  resetModal();
  emit("close");
};

// 드래그 앤 드롭 핸들러
const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDragEnter = (e) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragOver.value = false;

  const files = Array.from(e.dataTransfer.files);
  addFiles(files);
};

// 파일 선택 핸들러
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  addFiles(files);
};

// 파일 추가
const addFiles = (files) => {
  const validFiles = files.filter((file) => {
    const validTypes = [".pdf", ".xlsx", ".xls", ".wav", ".docx"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    return validTypes.includes(fileExtension);
  });

  selectedFiles.value = [...selectedFiles.value, ...validFiles];
};

// 파일 제거
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 업로드 처리
const handleUpload = async () => {
  if (selectedFiles.value.length === 0) {
    closeModal();
    return;
  }

  isUploading.value = true;

  try {
    // 1단계: 파일 업로드 처리 (1.5초)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    emit("upload", selectedFiles.value);
    console.log("업로드 완료:", selectedFiles.value);

    // 2단계: 업로드 완료 후 생성 상태로 변경
    isUploading.value = false;
    isGenerating.value = true;

    // 3단계: 요구사항 정의서 생성 처리 (3초)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 4단계: 생성 완료 상태로 변경
    isGenerating.value = false;
    isCompleted.value = true;
  } catch (error) {
    console.error("처리 실패:", error);
    isUploading.value = false;
    isGenerating.value = false;
  }
};

// 업로드 영역 클릭 시 파일 선택
const handleUploadAreaClick = () => {
  fileInput.value?.click();
};
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 600px;
  margin: 1rem;
  padding: 32px;
  transform: scale(0.9) translateY(20px);
  animation: slideUp 0.3s ease forwards;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

@keyframes slideUp {
  to {
    transform: scale(1) translateY(0);
  }
}

/* Close Button */
.close-button {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
  transform: scale(1.05);
}

/* Upload Area */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 48px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #e53e3e;
  background: rgba(229, 62, 62, 0.05);
}

.upload-icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #6b7280;
  transition: all 0.3s ease;
}

.upload-area:hover .upload-icon,
.upload-area.drag-over .upload-icon {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  transform: scale(1.05);
}

.upload-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.upload-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* File List */
.file-list {
  margin-bottom: 24px;
}

.file-list-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #f3f4f6;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

.remove-file {
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.remove-file:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Button Group */
.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cancel-button:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #9ca3af;
}

.complete-confirm-button {
  background: transparent;
  color: #000000;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.complete-confirm-button:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #9ca3af;
}

.upload-button {
  background: #000000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 100px;
}

.upload-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  position: relative;
}

/* Loading Message */
.loading-message {
  font-size: 14px;
  color: #6b7280;
  margin: 24px 0 0 0;
  line-height: 1.5;
}

/* Completion Container */
.completion-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 40px;
  position: relative;
}

/* Completion Icon */
.completion-icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #000000;
}

/* Completion Text */
.completion-text {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

/* Confirm Button */
.confirm-button {
  background: #000000;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.confirm-button:hover {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Loading Spinner */
.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 32px;
}

.dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #000000;
  border-radius: 50%;
  animation: loading 1.2s infinite ease-in-out;
}

.dot1 {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.dot2 {
  top: 15%;
  right: 15%;
  animation-delay: 0.15s;
}

.dot3 {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  animation-delay: 0.3s;
}

.dot4 {
  bottom: 15%;
  right: 15%;
  animation-delay: 0.45s;
}

.dot5 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.6s;
}

.dot6 {
  bottom: 15%;
  left: 15%;
  animation-delay: 0.75s;
}

.dot7 {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  animation-delay: 0.9s;
}

.dot8 {
  top: 15%;
  left: 15%;
  animation-delay: 1.05s;
}

@keyframes loading {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Loading Text */
.loading-text {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    margin: 16px;
    max-width: calc(100vw - 32px);
    padding: 24px;
  }

  .upload-area {
    padding: 32px 24px;
  }

  .upload-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }

  .upload-title {
    font-size: 20px;
  }

  .upload-description {
    font-size: 13px;
  }

  .button-group {
    flex-direction: column;
  }

  .cancel-button,
  .upload-button {
    width: 100%;
  }

  .loading-spinner {
    width: 64px;
    height: 64px;
    margin-bottom: 28px;
  }

  .dot {
    width: 10px;
    height: 10px;
  }

  .loading-text {
    font-size: 20px;
  }

  .completion-container {
    padding: 48px 32px;
  }

  .completion-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }

  .completion-text {
    font-size: 20px;
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 12px;
    max-width: calc(100vw - 24px);
    padding: 20px;
  }

  .upload-area {
    padding: 24px 16px;
  }

  .close-button {
    top: 16px;
    right: 16px;
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .loading-spinner {
    width: 56px;
    height: 56px;
    margin-bottom: 24px;
  }

  .dot {
    width: 8px;
    height: 8px;
  }

  .loading-text {
    font-size: 18px;
  }

  .completion-container {
    padding: 40px 24px;
  }

  .completion-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
  }

  .completion-text {
    font-size: 18px;
    margin-bottom: 8px;
  }
}
</style>
