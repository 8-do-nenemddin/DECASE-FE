<template>
  <div class="upload-content">
    <div class="content-header">
      <h2 class="content-title">📄 AS IS 보고서</h2>
      <div class="file-info">
        <span class="file-id">문서 ID: {{ docId }}</span>
        <span v-if="previewData" class="file-name">{{
          previewData.fileName
        }}</span>
        <button
          @click="refreshPreview"
          class="refresh-button"
          :disabled="loading"
        >
          {{ loading ? "🔄 로딩중..." : "🔄 새로고침" }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>파일을 불러오는 중...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>파일을 불러올 수 없습니다</h3>
      <p>{{ error }}</p>
      <button @click="refreshPreview" class="retry-button">다시 시도</button>
    </div>

    <div v-else-if="previewData" class="preview-container">
      <!-- PDF 미리보기 -->
      <div v-if="previewData.fileType === 'pdf'" class="pdf-preview">
        <iframe
          :src="previewData.previewUrl"
          class="pdf-iframe"
          title="PDF 미리보기"
        ></iframe>
      </div>

      <!-- 기타 파일 타입 -->
      <div v-else class="unsupported-preview">
        <div class="unsupported-icon">📎</div>
        <h3>미리보기를 지원하지 않는 파일 형식입니다</h3>
        <p>파일 타입: {{ previewData.fileType }}</p>
        <button @click="downloadFile" class="download-button">
          📥 파일 다운로드
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useProjectStore } from "/src/stores/projectStore";

const projectStore = useProjectStore();

const props = defineProps({
  docId: {
    type: String,
    required: true,
  },
  file: {
    type: Object,
    required: false,
  },
});

// projectId는 store에서 가져오기
const projectId = computed(() => projectStore.projectId);

const loading = ref(false);
const error = ref(null);
const previewData = ref(null);

// 파일 확장자 추출 함수
const getFileExtension = (fileName) => {
  if (!fileName) return "";
  return fileName.split(".").pop().toLowerCase();
};

// API에서 파일 미리보기 데이터 로드
const loadPreview = async () => {
  if (!props.docId || !projectId.value) {
    error.value = "프로젝트 ID 또는 문서 ID가 없습니다.";
    return;
  }

  loading.value = true;
  error.value = null;
  previewData.value = null;

  try {
    console.log("AS IS 보고서 미리보기 로드:", {
      projectId: projectId.value,
      docId: props.docId,
    });

    // props에서 파일 정보가 있다면 사용
    let fileName = "";
    if (props.file && props.file.name) {
      fileName = props.file.name;
      console.log("파일명:", fileName);
    }

    // AS IS 보고서는 항상 PDF로 처리
    previewData.value = {
      fileType: "pdf",
      fileName: fileName || `as-is-report-${props.docId}.pdf`,
      previewUrl: `/api/v1/projects/${projectId.value}/documents/as-is/${props.docId}/preview`,
    };

    console.log("AS IS 보고서 미리보기 URL:", previewData.value.previewUrl);
  } catch (err) {
    console.error("미리보기 로드 오류:", err);
    error.value = err.message || "파일을 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
};

// 미리보기 새로고침
const refreshPreview = () => {
  loadPreview();
};

// 파일 다운로드
const downloadFile = async () => {
  if (!projectId.value || !props.docId) {
    alert("프로젝트 ID 또는 문서 ID가 없습니다.");
    return;
  }

  try {
    const downloadUrl = `/api/v1/projects/${projectId.value}/documents/as-is/${props.docId}/preview`;
    console.log("다운로드 URL:", downloadUrl);

    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error("다운로드 실패");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      previewData.value?.fileName || `as-is-report-${props.docId}.pdf`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
    alert("파일 다운로드에 실패했습니다.");
  }
};

// props와 projectId 변경 감지
watch(
  [() => props.docId, projectId],
  ([newDocId, newProjectId]) => {
    if (newDocId && newProjectId) {
      loadPreview();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.docId && projectId.value) {
    loadPreview();
  }
});
</script>

<style scoped>
/* 기존 스타일과 동일 */
.upload-content {
  padding: 20px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: #f8f9fa;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.file-id {
  font-size: 14px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 6px;
}

.file-name {
  font-size: 14px;
  color: #374151;
  background: #e5e7eb;
  padding: 6px 12px;
  border-radius: 6px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.refresh-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background: #2563eb;
}

.refresh-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.error-icon,
.unsupported-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button,
.download-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s;
}

.retry-button:hover,
.download-button:hover {
  background: #2563eb;
}

.preview-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pdf-iframe {
  width: 100%;
  height: calc(100vh - 200px);
  border: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .upload-content {
    padding: 16px;
  }

  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .file-info {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
  }

  .file-name {
    max-width: 100%;
  }

  .content-title {
    font-size: 20px;
  }

  .pdf-iframe {
    height: calc(100vh - 300px);
  }
}
</style>
