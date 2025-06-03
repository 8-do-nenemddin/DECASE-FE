<template>
  <CommonModal
    :closeOnOverlayClick="!isGenerating && !isCompleted"
    :modalClass="modalClass"
    :closeButtonClass="closeButtonClass"
    @close="handleClose"
  >
    <!-- 상태에 따른 UI -->
    <template v-if="isCompleted">
      <SuccessUploadFileModal @close="handleSuccessClose" />
    </template>
    <template v-else-if="isGenerating">
      <LoadingModal />
    </template>
    <template v-else>
      <!-- 업로드 영역 -->
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17,8 12,3 7,8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h2 class="upload-title">소스 업로드</h2>
        <p class="upload-description">
          업로드할 파일을 선택하거나 드래그 앤 드롭해주세요. (예: RFP, 회의록, 엑셀)<br />
          지원 파일 형식 : pdf, .xlsx, .xls, .wav, .docx
        </p>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          multiple
          accept=".pdf,.xlsx,.xls,.wav,.docx"
          style="display: none"
        />
      </div>

      <!-- 파일 목록 -->
      <div v-if="selectedFiles.length" class="file-list">
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

      <!-- 버튼 -->
      <div class="button-group">
        <button
          class="upload-button"
          @click="handleUpload"
          :disabled="!selectedFiles.length || isUploading"
        >
          <span v-if="isUploading" class="loading"></span>
          <span v-else>{{ selectedFiles.length ? '업로드' : '확인' }}</span>
        </button>
        <button class="cancel-button" @click="closeModal">취소</button>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { defineEmits } from 'vue';
import CommonModal from '../../../util/CommonModal.vue';
import LoadingModal from './LoadingModal.vue';
import SuccessUploadFileModal from './SuccessUploadFileModal.vue';

const emit = defineEmits(['close', 'upload']);

// 여기에 modalClass, closeButtonClass 추가 (필요시 클래스명 변경 가능)
const modalClass = computed(() => '');
const closeButtonClass = computed(() => '');

const fileInput = ref(null);
const selectedFiles = ref([]);
const isDragOver = ref(false);
const isUploading = ref(false);
const isGenerating = ref(false);
const isCompleted = ref(false);

const handleClose = () => {
  resetModal();
  emit('close');
};

const handleSuccessClose = () => {
  resetModal();
  emit('close');
};

const resetModal = () => {
  selectedFiles.value = [];
  isDragOver.value = false;
  isUploading.value = false;
  isGenerating.value = false;
  isCompleted.value = false;
};

const closeModal = () => {
  resetModal();
  emit('close');
};

const handleDragLeave = (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDrop = (e) => {
  const files = Array.from(e.dataTransfer.files);
  isDragOver.value = false;
  addFiles(files);
};

const handleFileSelect = (e) => {
  addFiles(Array.from(e.target.files));
};

const addFiles = (files) => {
  const allowed = ['.pdf', '.xlsx', '.xls', '.wav', '.docx'];
  const validFiles = files.filter((file) =>
    allowed.includes('.' + file.name.split('.').pop().toLowerCase())
  );
  selectedFiles.value.push(...validFiles);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
};

const handleUpload = async () => {
  if (!selectedFiles.value.length) {
    closeModal();
    return;
  }

  isUploading.value = true;

  try {
    await new Promise((res) => setTimeout(res, 1500));
    emit('upload', selectedFiles.value);
    isUploading.value = false;
    isGenerating.value = true;
    await new Promise((res) => setTimeout(res, 3000));
    isGenerating.value = false;
    isCompleted.value = true;
  } catch (err) {
    console.error('업로드 실패:', err);
    isUploading.value = false;
    isGenerating.value = false;
  }
};

const handleUploadAreaClick = () => {
  fileInput.value?.click();
};
</script>

<style scoped>
/* Upload Area */
.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(139, 92, 246, 0.02));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #6366f1;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  transform: translateY(-2px);
  box-shadow: 0 20px 40px -12px rgba(99, 102, 241, 0.25);
}

.upload-area:hover::before,
.upload-area.drag-over::before {
  opacity: 1;
}

.upload-icon {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.upload-area:hover .upload-icon,
.upload-area.drag-over .upload-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
}

.upload-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b, #475569);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 20px 0;
  letter-spacing: -0.025em;
}

.upload-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  margin: 0;
  font-weight: 400;
}

/* File List */
.file-list {
  margin-bottom: 32px;
}

.file-list-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  letter-spacing: -0.025em;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.file-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.file-size {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.remove-file {
  width: 28px;
  height: 28px;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.remove-file:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Button Group */
.button-group {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.cancel-button {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  letter-spacing: -0.025em;
}

.cancel-button:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: #475569;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.upload-button {
  background: linear-gradient(135deg, black, black);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 120px;
  letter-spacing: -0.025em;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.upload-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #5855f7, #7c3aed);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
}

.upload-button:active:not(:disabled) {
  transform: translateY(-1px);
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.loading {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
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
  padding: 60px 40px;
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
}

/* Completion Container */
.completion-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 40px;
  position: relative;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
}

/* Completion Icon */
.completion-icon {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.3);
  animation: completionPulse 2s ease-in-out infinite;
}

@keyframes completionPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 12px 40px rgba(16, 185, 129, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 16px 48px rgba(16, 185, 129, 0.4);
  }
}

/* Completion Text */
.completion-text {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b, #475569);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 20px 0;
  letter-spacing: -0.025em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-area {
    padding: 40px 24px;
    margin-bottom: 24px;
  }

  .upload-icon {
    width: 72px;
    height: 72px;
    margin-bottom: 24px;
  }

  .upload-title {
    font-size: 24px;
  }

  .upload-description {
    font-size: 14px;
  }

  .button-group {
    flex-direction: column;
    gap: 12px;
  }

  .cancel-button,
  .upload-button {
    width: 100%;
    padding: 16px 24px;
  }

  .file-list-title {
    font-size: 16px;
  }

  .loading-container {
    padding: 48px 32px;
  }

  .completion-container {
    padding: 64px 32px;
  }

  .completion-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
  }

  .completion-text {
    font-size: 24px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .upload-area {
    padding: 32px 20px;
  }

  .upload-icon {
    width: 64px;
    height: 64px;
  }

  .upload-title {
    font-size: 22px;
  }

  .upload-description {
    font-size: 13px;
  }

  .loading-container {
    padding: 40px 24px;
  }

  .completion-container {
    padding: 56px 24px;
  }

  .completion-icon {
    width: 72px;
    height: 72px;
    margin-bottom: 20px;
  }

  .completion-text {
    font-size: 22px;
    margin-bottom: 12px;
  }

  .file-item {
    padding: 14px 16px;
  }

  .button-group {
    gap: 10px;
  }
}
</style>