<template>
  <!-- 성공 컴포넌트 -->
  <SuccessDownloadModal 
    v-if="currentView === 'confirm'" 
    @close="closeModal" 
  />
  
  <!-- 다운로드 확인 모달 -->
  <div 
    v-if="currentView === 'download'"
    class="modal"
    @click.stop
  >
    <div class="modal-header">
      <div class="download-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </div>
      <h2 class="modal-title">요구사항 정의서 다운로드</h2>
      <p class="modal-description">다음 파일들을 다운로드하시겠습니까?</p>
    </div>

    <div class="file-list">
      <h3 class="file-list-title">다운로드 파일 목록</h3>
      <div 
        v-for="(file, index) in files" 
        :key="index" 
        class="file-item"
        :class="{ 'downloading': file.isDownloading, 'completed': file.isCompleted, 'error': file.hasError }"
      >
        <div class="file-info">
          <div class="file-icon">
            <svg v-if="!file.isDownloading && !file.isCompleted && !file.hasError" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <div v-else-if="file.isDownloading" class="loading-spinner"></div>
            <svg v-else-if="file.isCompleted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <svg v-else-if="file.hasError" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ file.size }}</span>
            <span v-if="file.hasError" class="error-message">다운로드 실패</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 진행률 표시 -->
    <div v-if="isProcessing" class="progress-section">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${downloadProgress}%` }"
        ></div>
      </div>
      <p class="progress-text">{{ currentStep }} ({{ downloadProgress }}%)</p>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="errorMessage" class="error-section">
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <div class="button-group">
      <button 
        class="download-button" 
        @click="handleConfirm" 
        :disabled="isProcessing"
      >
        <span v-if="isProcessing" class="loading"></span>
        <span v-else class="download-text">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {{ isProcessing ? '다운로드 중...' : '다운로드' }}
        </span>
      </button>
      <button 
        class="cancel-button" 
        @click="handleCancel"
        :disabled="isProcessing"
      >
        취소
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SuccessDownloadModal from './SuccessDownloadModal.vue'
import { useProjectStore } from '../../../../stores/projectStore'
import JSZip from 'jszip'

const emit = defineEmits(['close', 'confirm'])

const currentView = ref('download')
const isProcessing = ref(false)
const downloadProgress = ref(0)
const currentStep = ref('')
const errorMessage = ref('')
const projectStore = useProjectStore()
const projectId = ref(projectStore.projectId)
const projectName = ref(projectStore.projectName)

const files = ref([
  { 
    name: `${projectName.value}_조견표.xlsx`, 
    size: '2.3 MB',
    apiUrl: `/api/v1/projects/${projectId.value}/mapping-table/downloads`,
    isDownloading: false,
    isCompleted: false,
    hasError: false
  },
  { 
    name: `${projectName.value}_요구사항 정의서.xlsx`, 
    size: '1.8 MB',
    apiUrl: `/api/v1/projects/${projectId.value}/requirements/downloads`,
    isDownloading: false,
    isCompleted: false,
    hasError: false
  },
  { 
    name: `${projectName.value}_요구사항 추적 매트릭스.xlsx`, 
    size: '3.1 MB',
    apiUrl: `/api/v1/matrix/projects/${projectId.value}/downloads`,
    isDownloading: false,
    isCompleted: false,
    hasError: false
  }
])

const handleConfirm = async () => {
  isProcessing.value = true
  downloadProgress.value = 0
  errorMessage.value = ''
  currentStep.value = '다운로드 준비 중...'

  try {
    const zip = new JSZip()
    const totalSteps = files.value.length + 1 // API 호출 + ZIP 생성
    let completedSteps = 0

    // 각 파일 상태 초기화
    files.value.forEach(file => {
      file.isDownloading = false
      file.isCompleted = false
      file.hasError = false
    })

    // 각 API에서 파일 다운로드
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      file.isDownloading = true
      currentStep.value = `${file.name} 다운로드 중...`

      try {
        const fileBlob = await downloadFile(file.apiUrl)
        zip.file(file.name, fileBlob)
        
        file.isDownloading = false
        file.isCompleted = true
        completedSteps++
        downloadProgress.value = Math.round((completedSteps / totalSteps) * 100)
        
      } catch (error) {
        console.error(`파일 다운로드 실패: ${file.name}`, error)
        file.isDownloading = false
        file.hasError = true
        
        // 실패한 파일은 에러 정보를 텍스트 파일로 추가
        zip.file(`${file.name}_error.txt`, `다운로드 실패: ${error.message}`)
        completedSteps++
        downloadProgress.value = Math.round((completedSteps / totalSteps) * 100)
      }
    }

    // ZIP 파일 생성
    currentStep.value = 'ZIP 파일 생성 중...'
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    downloadProgress.value = 100
    currentStep.value = '다운로드 완료!'

    // ZIP 파일 자동 다운로드
    const currentDate = new Date().toISOString().split('T')[0]
    const zipFileName = `요구사항정의서_${projectId.value}_${currentDate}.zip`
    downloadBlob(zipBlob, zipFileName)

    // 성공 모달로 전환
    setTimeout(() => {
      currentView.value = 'confirm'
      emit('confirm')
    }, 1000)

  } catch (error) {
    console.error('ZIP 다운로드 실패:', error)
    errorMessage.value = `다운로드 실패: ${error.message}`
  } finally {
    isProcessing.value = false
  }
}

const downloadFile = async (apiUrl) => {
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 필요한 경우 인증 헤더 추가
      // 'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.blob()
}

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const handleCancel = () => {
  emit('close')
}

const closeModal = () => {
  emit('close')
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !isProcessing.value) {
    handleConfirm()
  } else if (event.key === 'Escape') {
    handleCancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal {
  padding: 32px;
  max-width: 480px;
  margin: 0 auto;
}

/* Modal Header */
.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.download-icon {
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
  padding: 12px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f0f0f0;
}

.file-item.downloading {
  background: #e3f2fd;
  border-color: #2196f3;
}

.file-item.completed {
  background: #e8f5e8;
  border-color: #4caf50;
}

.file-item.error {
  background: #ffebee;
  border-color: #f44336;
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
  transition: all 0.2s ease;
}

.file-item.downloading .file-icon {
  background: #2196f3;
}

.file-item.completed .file-icon {
  background: #4caf50;
}

.file-item.error .file-icon {
  background: #f44336;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
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

.error-message {
  font-size: 11px;
  color: #f44336;
  font-weight: 500;
}

/* Progress Section */
.progress-section {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin: 0;
}

/* Error Section */
.error-section {
  margin-bottom: 20px;
  padding: 12px;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
}

.error-text {
  font-size: 14px;
  color: #f44336;
  margin: 0;
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

.download-button {
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

.download-button:hover:not(:disabled) {
  background: #333;
}

.download-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.download-text {
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

  .download-icon {
    width: 40px;
    height: 40px;
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
  .download-button {
    width: 100%;
    padding: 12px 20px;
  }
}
</style>