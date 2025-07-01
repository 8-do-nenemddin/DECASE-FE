<template>
  <CommonModal
    :closeOnOverlayClick="!isGenerating && !isCompleted && !updateFailed"
    :modalClass="modalClass"
    :closeButtonClass="closeButtonClass"
    @close="handleClose"
  >
    <!-- 에러 모달 -->
    <div v-if="showError" class="error-modal-overlay">
      <div class="error-modal">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">요청 실패</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <button class="error-close-button" @click="hideErrorModal">확인</button>
      </div>
    </div>

    <!-- 실패 화면 -->
    <div v-if="updateFailed" class="error-modal-overlay">
      <div class="error-modal">
        <div class="error-icon">❌</div>
        <h3 class="error-title">요구사항 정의서 업데이트 실패</h3>
        <p class="error-message">
          요구사항 정의서 업데이트 작업이 실패하였습니다.<br />다시 시도해
          주세요.
        </p>
        <button class="error-close-button" @click="closeModal">확인</button>
      </div>
    </div>

    <!-- 파일 개수 제한 경고 모달 -->
    <div v-if="showFileCountWarning" class="error-modal-overlay">
      <div class="error-modal">
        <div class="error-icon">📁</div>
        <h3 class="error-title">파일 업로드 제한</h3>
        <p class="error-message">한 번에 하나의 파일만 업로드할 수 있습니다.</p>
        <button class="error-close-button" @click="hideFileCountWarning">
          확인
        </button>
      </div>
    </div>

    <!-- 상태에 따른 UI -->
    <template v-if="isGenerating || isCompleted">
      <LoadingModal :isCompleted="isCompleted" @close="handleClose" />
    </template>
    <template v-else-if="!updateFailed">
      <div class="modal">
        <!-- Upload Area -->
        <div
  class="upload-area"
  @click="handleUploadAreaClick"
  @drop.prevent="handleDrop"
  @dragover.prevent
  @dragenter.prevent="isDragOver = true"
  @dragleave="handleDragLeave"
  :class="{ 'drag-over': isDragOver }"
>
  <div class="upload-icon">
    <svg
      width="24"
      height="24"
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
  <h2 class="modal-title">추가 자료 업로드</h2>
  <p class="modal-description">
    업로드한 자료를 기반으로 요구사항 정의서를 업데이트합니다.<br />
    <strong>한 번에 하나의 파일만 업로드 가능합니다.</strong><br />
    지원 파일 형식: PDF, Excel, Word, WAV
  </p>
  <input
    type="file"
    ref="fileInput"
    @change="handleFileSelect"
    accept=".pdf,.xlsx,.xls,.wav,.docx"
    style="display: none"
  />
</div>
        <!-- File List -->
        <div v-if="selectedFile" class="file-list">
          <h3 class="file-list-title">선택된 파일</h3>
          <div class="file-item">
            <div class="file-info">
              <div class="file-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  ></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div class="file-details">
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">{{
                  formatFileSize(selectedFile.size)
                }}</span>
              </div>
            </div>
            <button class="remove-file" @click="removeFile">×</button>
          </div>
        </div>
        
        <!-- 문서 이름 입력 필드 -->
<div class="document-name-section">
  <input
    type="text"
    v-model="documentName"
    placeholder="문서명을 입력해주세요."
    class="document-name-input"
  />
</div>

        <!-- Button Group -->
        <div class="button-group">
          <button
            class="upload-button"
            @click="handleUpload"
            :disabled="!selectedFile || isUploading"
          >
            <span v-if="isUploading" class="loading"></span>
            <span v-else class="upload-text">
              {{
                isUploading
                  ? "업로드 중..."
                  : selectedFile
                  ? "업로드"
                  : "파일을 선택해주세요."
              }}
            </span>
          </button>
          <button
            class="cancel-button"
            @click="closeModal"
            :disabled="isUploading"
          >
            취소
          </button>
        </div>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, computed } from "vue";
import { defineEmits } from "vue";
import CommonModal from "../../../util/CommonModal.vue";
import LoadingModal from "./LoadingModal.vue";
import { useProjectStore } from "../../../../stores/projectStore";

const emit = defineEmits(["close", "upload"]);
const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);
const memberId = computed(() => projectStore.userId);

const modalClass = computed(() => "");
const closeButtonClass = computed(() => "");

const fileInput = ref(null);
const selectedFile = ref(null); // 단일 파일로 변경
const isDragOver = ref(false);
const isUploading = ref(false);
const isGenerating = ref(false);
const isCompleted = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const updateFailed = ref(false);
let pollingInterval = null;

const showFileCountWarning = ref(false); // 파일 개수 경고 모달

const handleClose = () => {
  stopPollingSrsUpdateStatus();
  resetModal();
  emit("close");
};

const handleComplete = () => {
  resetModal();
  emit("close");
};

const documentName = ref('');

const resetModal = () => {
  selectedFile.value = null; // 단일 파일로 변경
  isDragOver.value = false;
  isUploading.value = false;
  isGenerating.value = false;
  isCompleted.value = false;
};

const closeModal = () => {
  stopPollingSrsUpdateStatus();
  resetModal();
  emit("close");
};

const handleDragLeave = (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDrop = (e) => {
  const files = Array.from(e.dataTransfer.files);
  isDragOver.value = false;

  // 여러 파일이 드롭된 경우 경고
  if (files.length > 1) {
    showFileCountWarning.value = true;
    return;
  }

  addFile(files[0]);
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);

  // 여러 파일이 선택된 경우 경고 (실제로는 input에 multiple이 없어서 발생하지 않음)
  if (files.length > 1) {
    showFileCountWarning.value = true;
    return;
  }

  if (files.length > 0) {
    addFile(files[0]);
  }

  // 파일 입력 초기화
  e.target.value = "";
};

const addFile = (file) => {
  if (!file) return;

  const allowed = [".pdf", ".csv", ".xlsx", ".xls", ".wav", ".docx"];
  const fileExtension = "." + file.name.split(".").pop().toLowerCase();

  if (allowed.includes(fileExtension)) {
    selectedFile.value = file;
  }
};

const removeFile = () => {
  selectedFile.value = null;
};

const formatFileSize = (bytes) => {
  const units = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[i];
};

const handleUpload = async () => {
  if (!selectedFile.value || !documentName.value){
    closeModal();
    return;
  }

  isUploading.value = true;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("documentName", documentName.value);

    const response = await fetch(
      `/api/v1/projects/${projectId.value}/requirement-documents/update?memberId=${memberId.value}`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    console.log(formData.get("documentName"));

    if (response.ok) {
      // 200 OK 응답
      console.log("요구사항 정의서 수정 요청 성공");
      isUploading.value = false;
      isGenerating.value = true;
      updateFailed.value = false;
      startPollingSrsUpdateStatus();
    } else {
      // HTTP 에러 응답
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.error("업로드 실패:", err);
    isUploading.value = false;
    isGenerating.value = false;
    showErrorModal(err.message || "요청 처리 중 오류가 발생했습니다.");
  }
};

function startPollingSrsUpdateStatus() {
  if (pollingInterval) return;
  pollingInterval = setInterval(fetchSrsUpdateStatus, 5000); // 5초마다 polling
  fetchSrsUpdateStatus(); // 즉시 1회 실행
}

function stopPollingSrsUpdateStatus() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

async function fetchSrsUpdateStatus() {
  if (!isGenerating.value) {
    stopPollingSrsUpdateStatus();
    return;
  }
  try {
    const res = await fetch(
      `/ai/api/v1/jobs/srs-agent/latest-status?project_id=${projectId.value}&member_id=${memberId.value}&job_name=SRS_UPDATE`
    );
    if (res.status === 404 || res.status === 500) {
      stopPollingSrsUpdateStatus();
      isGenerating.value = false;
      showErrorModal("서버 오류");
      return;
    }
    if (!res.ok) throw new Error("상태 확인 실패");
    const data = await res.json();
    if (data.status === "PROCESSING") {
      // 계속 polling
      return;
    } else if (data.status === "FAILED") {
      stopPollingSrsUpdateStatus();
      isGenerating.value = false;
      updateFailed.value = true;
    } else if (data.status === "COMPLETED") {
      stopPollingSrsUpdateStatus();
      isGenerating.value = false;
      isCompleted.value = true;
    }
  } catch (err) {
    stopPollingSrsUpdateStatus();
    isGenerating.value = false;
    showErrorModal(err.message || "상태 확인 중 오류가 발생했습니다.");
  }
}

const handleUploadAreaClick = () => {
  fileInput.value?.click();
};

const showErrorModal = (message) => {
  errorMessage.value = message;
  showError.value = true;
};

const hideErrorModal = () => {
  showError.value = false;
  errorMessage.value = "";
};

const hideFileCountWarning = () => {
  showFileCountWarning.value = false;
};
</script>

<style scoped>
.modal {
  padding: 32px;
  max-width: auto;
  margin: 0 auto;
}

/* Upload Area */
.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  background: #fafafa;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #999;
  background: #f5f5f5;
}

.upload-icon {
  width: 48px;
  height: 48px;
  background: black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: black;
  margin: 0 0 8px 0;
}

.modal-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* File List */
.file-list {
  margin-bottom: 24px;
}

.file-list-title {
  font-size: 14px;
  font-weight: 600;
  color: black;
  margin: 0 0 16px 0;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background: #f0f0f0;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  width: 32px;
  height: 32px;
  background: black;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: black;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.remove-file {
  width: 24px;
  height: 24px;
  border: none;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.remove-file:hover {
  background: #cc3333;
}

/* Button Group */
.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button {
  background: white;
  color: black;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cancel-button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-button {
  background: black;
  color: white;
  border: 1px solid black;
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 120px;
}

.upload-button:hover:not(:disabled) {
  background: #333;
}

.upload-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.upload-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal {
    padding: 24px;
    max-width: calc(100vw - 2rem);
    margin: 1rem;
  }

  .modal-title {
    font-size: 18px;
  }

  .upload-icon {
    width: 40px;
    height: 40px;
  }

  .upload-area {
    padding: 20px;
  }

  .file-item {
    padding: 10px;
  }

  .file-icon {
    width: 28px;
    height: 28px;
  }

  .button-group {
    flex-direction: column;
    gap: 8px;
  }

  .cancel-button,
  .upload-button {
    width: 100%;
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 24px 20px;
  }

  .ai-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .ai-icon svg {
    width: 28px;
    height: 28px;
  }

  .loading-text {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .info-text {
    font-size: 13px;
  }
}

/* Error Modal Styles */
.error-modal-overlay {
  position: fixed;
  border-radius: 25px;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 16px 0;
}

.error-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.error-close-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.error-close-button:hover {
  background: #b91c1c;
}

/* 기존 upload-area 스타일 (변경 없음) */
.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px; /* 수정: 문서 이름 섹션과의 간격 */
  background: #fafafa;
}

/* 문서 이름 입력 섹션 */
.document-name-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.document-name-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  transition: border-color 0.2s ease;
}

.document-name-input:focus {
  outline: none;
  border-color: #999;
}

.document-name-input::placeholder {
  color: #999;
}

.input-buttons {
  display: flex;
  gap: 8px;
}

.confirm-name-button {
  background: white;
  color: black;
  border: 1px solid #ccc;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}

.confirm-name-button:hover {
  background: #f5f5f5;
  border-color: #999;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .document-name-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .confirm-name-button {
    width: 100%;
  }
}
</style>
