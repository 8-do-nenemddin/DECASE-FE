<template>
  <div class="upload-content">
    <div class="content-header">
      <h2 class="content-title">📄 업로드된 파일 미리보기</h2>
      <div class="file-info">
        <span class="file-id">문서 ID: {{ docId }}</span>
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

      <!-- DOCX 미리보기 (HTML 변환된 내용) -->
      <div v-else-if="previewData.fileType === 'docx'" class="docx-preview">
        <div class="document-content" v-html="previewData.htmlContent"></div>
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
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  docId: {
    type: String,
    required: true,
  },
});

const loading = ref(false);
const error = ref(null);
const previewData = ref(null);

// 파일 확장자에서 파일 타입 추출
const getFileTypeFromExtension = (filename) => {
  if (!filename) return "unknown";
  const extension = filename.split(".").pop().toLowerCase();
  return extension;
};

// API에서 파일 미리보기 데이터 로드
const loadPreview = async () => {
  if (!props.docId) return;

  loading.value = true;
  error.value = null;
  previewData.value = null;

  try {
    console.log("파일 미리보기 로드:", props.docId);

    // 먼저 파일 정보를 가져옴 (메타데이터 API가 있다면)
    // 없다면 파일 타입을 PDF로 가정하고 직접 URL 생성
    const previewUrl = `/api/v1/documents/${props.docId}/preview`;

    // HEAD 요청으로 파일 존재 여부 확인
    const headResponse = await fetch(previewUrl, { method: "HEAD" });

    if (!headResponse.ok) {
      throw new Error(`파일을 찾을 수 없습니다. (${headResponse.status})`);
    }

    // Content-Type 헤더에서 파일 타입 확인
    const contentType = headResponse.headers.get("content-type");
    let fileType = "unknown";

    if (contentType) {
      if (contentType.includes("pdf")) {
        fileType = "pdf";
      } else if (
        contentType.includes("word") ||
        contentType.includes("officedocument")
      ) {
        fileType = "docx";
      } else if (contentType.includes("image")) {
        fileType = "image";
      } else if (contentType.includes("text")) {
        fileType = "text";
      }
    }

    // Content-Disposition 헤더에서 파일명 추출 (있는 경우)
    const contentDisposition = headResponse.headers.get("content-disposition");
    let fileName = `document_${props.docId}`;

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(
        /filename\*?=['"]?([^'"\s]+)['"]?/
      );
      if (fileNameMatch) {
        fileName = decodeURIComponent(fileNameMatch[1]);
      }
    }

    console.log("파일 타입:", fileType, "파일명:", fileName);

    // 파일 타입에 따라 미리보기 데이터 설정
    if (fileType === "pdf") {
      previewData.value = {
        fileType: "pdf",
        previewUrl: previewUrl,
        fileName: fileName,
      };
    } else if (fileType === "docx") {
      // DOCX의 경우 별도 처리가 필요하거나 지원하지 않음을 표시
      previewData.value = {
        fileType: "docx",
        fileName: fileName,
        htmlContent: "<p>DOCX 파일 미리보기는 현재 지원되지 않습니다.</p>",
      };
    } else {
      // 기타 파일 타입
      previewData.value = {
        fileType: fileType,
        fileName: fileName,
      };
    }
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
  try {
    const response = await fetch(`/api/v1/documents/${props.docId}/preview`);
    if (!response.ok) throw new Error("다운로드 실패");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = previewData.value?.fileName || `document_${props.docId}`;
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

// docId 변경 감지
watch(
  () => props.docId,
  (newDocId) => {
    if (newDocId) {
      loadPreview();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.docId) {
    loadPreview();
  }
});
</script>

<style scoped>
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
}

.file-id {
  font-size: 14px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 6px;
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

.docx-preview {
  padding: 40px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.document-content {
  line-height: 1.6;
  color: #374151;
}

.document-content h1,
.document-content h2,
.document-content h3 {
  color: #1f2937;
  margin-top: 24px;
  margin-bottom: 12px;
}

.document-content p {
  margin-bottom: 12px;
}

.document-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.document-content th,
.document-content td {
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  text-align: left;
}

.document-content th {
  background: #f9fafb;
  font-weight: 600;
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

  .content-title {
    font-size: 20px;
  }

  .pdf-iframe {
    height: calc(100vh - 300px);
  }

  .docx-preview {
    padding: 20px;
    max-height: calc(100vh - 300px);
  }
}
</style>
