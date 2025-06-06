<template>
  <div class="pdf-analyzer">
    <div class="upload-section">
      <h2>PDF 분석기</h2>

      <!-- 파일 업로드 영역 -->
      <div
        class="upload-area"
        :class="{ dragover: isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleFileDrop"
        @click="$refs.fileInput.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".pdf"
          @change="handleFileSelect"
          style="display: none"
        />

        <div v-if="!selectedFile" class="upload-placeholder">
          <i class="upload-icon">📄</i>
          <p>PDF 파일을 클릭하거나 드래그하여 업로드하세요</p>
          <p class="upload-hint">최대 50MB까지 지원됩니다</p>
        </div>

        <div v-else class="file-info">
          <i class="file-icon">📋</i>
          <span>{{ selectedFile.name }}</span>
          <span class="file-size"
            >({{ formatFileSize(selectedFile.size) }})</span
          >
          <button @click.stop="clearFile" class="clear-btn">✕</button>
        </div>
      </div>

      <!-- 분석 버튼 -->
      <button
        @click="analyzeFile"
        :disabled="!selectedFile || isAnalyzing"
        class="analyze-btn"
      >
        <span v-if="isAnalyzing">분석 중...</span>
        <span v-else>분석 시작</span>
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isAnalyzing" class="loading">
      <div class="spinner"></div>
      <p>PDF를 분석하고 있습니다. 잠시만 기다려주세요...</p>
    </div>

    <!-- 오류 메시지 -->
    <div v-if="error" class="error">
      <h3>오류 발생</h3>
      <p>{{ error }}</p>
      <button @click="error = null" class="close-btn">닫기</button>
    </div>

    <!-- 마크다운 미리보기 -->
    <div v-if="markdownContent" class="preview-section">
      <div class="preview-header">
        <h3>분석 결과</h3>
        <div class="preview-controls">
          <button @click="copyToClipboard" class="copy-btn">복사</button>
          <button @click="downloadMarkdown" class="download-btn">
            다운로드
          </button>
        </div>
      </div>

      <div class="preview-content">
        <!-- 마크다운 렌더링 -->
        <div class="markdown-preview" v-html="renderedMarkdown"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from "marked";

export default {
  name: "PdfAnalyzer",
  data() {
    return {
      selectedFile: null,
      isAnalyzing: false,
      isDragOver: false,
      markdownContent: "",
      error: null,
    };
  },
  computed: {
    renderedMarkdown() {
      if (!this.markdownContent) return "";
      return marked(this.markdownContent);
    },
  },
  methods: {
    handleFileDrop(event) {
      this.isDragOver = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.selectFile(files[0]);
      }
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectFile(file);
      }
    },

    selectFile(file) {
      if (file.type !== "application/pdf") {
        this.error = "PDF 파일만 업로드할 수 있습니다.";
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        // 50MB
        this.error =
          "파일 크기가 너무 큽니다. 50MB 이하의 파일을 선택해주세요.";
        return;
      }

      this.selectedFile = file;
      this.error = null;
      this.markdownContent = "";
    },

    clearFile() {
      this.selectedFile = null;
      this.markdownContent = "";
      this.error = null;
      this.$refs.fileInput.value = "";
    },

    async analyzeFile() {
      if (!this.selectedFile) return;

      this.isAnalyzing = true;
      this.error = null;

      const formData = new FormData();
      formData.append("file", this.selectedFile);

      try {
        const response = await fetch("http://localhost:8080/api/pdf/analyze", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          this.markdownContent = result.markdownContent;
        } else {
          this.error = result.message || "분석 중 오류가 발생했습니다.";
        }
      } catch (err) {
        console.error("분석 오류:", err);
        this.error = "서버와의 통신 중 오류가 발생했습니다.";
      } finally {
        this.isAnalyzing = false;
      }
    },

    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.markdownContent);
        alert("클립보드에 복사되었습니다!");
      } catch (err) {
        console.error("복사 실패:", err);
        alert("복사에 실패했습니다.");
      }
    },

    downloadMarkdown() {
      const blob = new Blob([this.markdownContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.selectedFile.name.replace(".pdf", "")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
  },
};
</script>

<style scoped>
.pdf-analyzer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Noto Sans KR", sans-serif;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #333;
}

.file-icon {
  font-size: 24px;
}

.file-size {
  color: #666;
  font-size: 14px;
}

.clear-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
}

.analyze-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  transition: background 0.3s ease;
}

.analyze-btn:hover:not(:disabled) {
  background: #0056b3;
}

.analyze-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  padding: 20px;
  margin: 20px 0;
  color: #c53030;
}

.error h3 {
  margin: 0 0 10px 0;
}

.close-btn {
  background: #c53030;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.preview-section {
  margin-top: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  background: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  color: #333;
}

.preview-controls {
  display: flex;
  gap: 10px;
}

.copy-btn,
.download-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.download-btn {
  background: #17a2b8;
}

.copy-btn:hover {
  background: #218838;
}

.download-btn:hover {
  background: #138496;
}

.preview-content {
  max-height: 600px;
  overflow-y: auto;
}

.markdown-preview {
  padding: 20px;
  line-height: 1.6;
  color: #333;
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  color: #2c3e50;
  margin-top: 24px;
  margin-bottom: 16px;
}

.markdown-preview p {
  margin-bottom: 16px;
}

.markdown-preview pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
}

.markdown-preview code {
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-preview blockquote {
  border-left: 4px solid #007bff;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
}

.markdown-preview ul,
.markdown-preview ol {
  padding-left: 20px;
  margin-bottom: 16px;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-preview th,
.markdown-preview td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.markdown-preview th {
  background: #f8f9fa;
  font-weight: bold;
}
</style>
