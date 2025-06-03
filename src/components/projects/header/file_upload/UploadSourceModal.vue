<template>
  <CommonModal
    :closeOnOverlayClick="!isGenerating && !isCompleted"
    :modalClass="modalClass"
    :closeButtonClass="closeButtonClass"
    @close="handleClose"
  >
    <!-- 상태에 따른 UI -->
    <template v-if="isCompleted">
      <SuccessUploadFileModal />
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

/* Responsive Design */
@media (max-width: 768px) {
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
  .upload-area {
    padding: 24px 16px;
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