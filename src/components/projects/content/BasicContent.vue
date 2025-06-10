<template>
  <main class="main-content">
    <!-- 추후 수정-->
    <!-- v-if : Project 상태에 따라서 (요구사항 입력 전 / 요구사항 생성중 / 요구사항 생성완료)-->
    <div class="upload-card" v-if="projectStore.projectRevision === 0">
      <h2 class="upload-title">RFP 파일 업로드</h2>
      <p class="upload-subtitle">프로젝트 제안 요청서(RFP) 파일을 업로드해주세요.</p>

      <div
          class="upload-zone"
          :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
          @click="triggerFileInput"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleFileDrop"
      >
        <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx,.hwp,.zip"
            style="display: none;"
        />

        <div v-if="!selectedFile" class="upload-empty">
          <div class="upload-icon">📄</div>
          <p class="upload-placeholder">
            파일을 드래그하거나 클릭하여 선택하세요
            <small>PDF 파일 지원 (최대 1GB)</small>
          </p>
        </div>

        <div v-else class="file-preview">
          <div class="file-icon">✓</div>
          <div class="file-info">
            <div class="file-name">{{ selectedFile.name }}</div>
            <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
          </div>
          <button @click.stop="clearFile" class="clear-button">
            삭제
          </button>
        </div>
      </div>

      <button
          @click="handleSubmit"
          :disabled="!selectedFile || isUploading"
          class="submit-button"
      >
        <span v-if="isUploading">업로드 중...</span>
        <span v-else>업로드 시작</span>
      </button>

      <div v-if="isUploading" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ Math.round(uploadProgress) }}%</div>
      </div>
    </div>

    <!-- 요구사항정의서 생성 중 화면 -->
    <!-- 추후 수정-->
    <!-- v-if : Project 상태에 따라서 (요구사항 입력 전 / 요구사항 생성중 / 요구사항 생성완료)-->
    <div class="generating-card" v-if="projectStore.projectRevision === 1">
      <div class="generating-content">
        <div class="generating-icon">
          <div class="spinner"></div>
        </div>
        <h2 class="generating-title">요구사항정의서 생성중입니다</h2>
        <p class="generating-subtitle">
          업로드된 RFP 파일을 분석하여 요구사항정의서를 생성하고 있습니다.
          <br>
          <strong>약 30분 정도 소요될 예정입니다.</strong>
        </p>
        <div class="generating-progress">
          <div class="pulse-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup>
import { ref } from 'vue';
import { useProjectStore } from "/src/stores/projectStore";

const projectStore = useProjectStore();

// DOM 요소를 참조하기 위한 ref
const fileInput = ref(null);
// 선택된 파일을 저장하기 위한 ref
const selectedFile = ref(null);
// 드래그 상태
const isDragOver = ref(false);
// 업로드 상태
const isUploading = ref(false);
// 업로드 진행률
const uploadProgress = ref(0);
// 요구사항정의서 생성 상태
const isGenerating = ref(false);

// 파일 업로드 영역을 클릭했을 때 숨겨진 input을 클릭시키는 함수
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value.click();
  }
};

// 파일이 선택되었을 때 실행되는 함수
const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
  }
};

// 드래그 오버 이벤트 처리
const handleDragOver = (event) => {
  isDragOver.value = true;
};

// 드래그 리브 이벤트 처리
const handleDragLeave = (event) => {
  isDragOver.value = false;
};

// 파일을 드래그 앤 드롭했을 때 실행되는 함수
const handleFileDrop = (event) => {
  isDragOver.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
  }
};

// 선택된 파일을 삭제하는 함수
const clearFile = () => {
  selectedFile.value = null;
  fileInput.value.value = '';
  uploadProgress.value = 0;
};

// 파일 크기 포맷팅 함수
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 파일을 서버로 제출하는 함수
const handleSubmit = async () => {
  if (!selectedFile.value || isUploading.value) {
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    // FormData 객체를 사용하여 파일을 서버로 전송
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    console.log('다음 파일을 서버로 업로드합니다:', selectedFile.value.name);

    const response = await fetch(`/api/v1/projects/${projectStore.projectId}/requirement-documents?memberId=${projectStore.userId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('업로드 실패');
    }

    const data = await response.json();

    alert(`'${selectedFile.value.name}' 파일이 성공적으로 업로드되었습니다!`);
    clearFile();

    isGenerating.value = true;
  } catch (error) {
    console.error('업로드 실패:', error);
    alert('파일 업로드 중 오류가 발생했습니다.');
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
}

.upload-card {
  width: 100%;
  max-width: 700px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: all 0.3s ease;
}

.upload-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.upload-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  letter-spacing: -0.025em;
}

.upload-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 400;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 40px;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: 32px;
  background: #fafafa;
  position: relative;
}

.upload-zone:hover {
  border-color: #374151;
  background: #f5f5f5;
}

.upload-zone.drag-over {
  border-color: #000000;
  background: #f0f0f0;
  transform: scale(1.005);
}

.upload-zone.uploading {
  opacity: 0.7;
  cursor: not-allowed;
}

.upload-empty .upload-icon {
  font-size: 3.5rem;
  color: #d1d5db;
  margin-bottom: 20px;
  transition: color 0.25s ease;
}

.upload-zone:hover .upload-empty .upload-icon {
  color: #6b7280;
}

.upload-placeholder {
  color: #374151;
  font-size: 1.125rem;
  line-height: 1.6;
  font-weight: 500;
  margin: 0;
}

.upload-placeholder small {
  display: block;
  margin-top: 8px;
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 400;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  text-align: left;
}

.file-icon {
  font-size: 2rem;
  color: #10b981;
  margin-right: 16px;
  font-weight: bold;
}

.file-info {
  flex: 1;
  margin-right: 16px;
}

.file-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  word-break: break-all;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
}

.clear-button {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}

.submit-button {
  width: 100%;
  padding: 16px 24px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  background: #000000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.025em;
}

.submit-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.progress-container {
  margin-top: 24px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #000000;
  width: 0%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* 요구사항정의서 생성 중 스타일 */
.generating-card {
  width: 100%;
  max-width: 700px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 80px 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.generating-icon {
  margin-bottom: 32px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generating-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
}

.generating-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 40px;
}

.generating-subtitle strong {
  color: #374151;
  font-weight: 600;
}

.generating-progress {
  margin-top: 20px;
}

.pulse-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pulse-dots span {
  width: 8px;
  height: 8px;
  background: #6b7280;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.pulse-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>