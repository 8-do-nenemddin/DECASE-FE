<template>
  <div class="mockup-viewer-pane" v-if="activeFile">
    <div class="viewer-header">
      <div class="header-content">
        <h3>{{ activeFile.name }} (v{{ activeFile.revision }})</h3>
        <div class="view-toggle">
          <button
            class="toggle-button"
            :class="{ active: viewerTab === 'preview' }"
            @click="viewerTab = 'preview'"
          >
            Preview
          </button>
          <button
            class="toggle-button"
            :class="{ active: viewerTab === 'code' }"
            @click="viewerTab = 'code'"
          >
            Code
          </button>
        </div>
      </div>
    </div>
    <div class="editor-toolbar" v-if="viewerTab === 'code'">
      <div class="toolbar-left">
        <span class="file-type">HTML</span>
      </div>
      <div class="toolbar-right">
        <button class="toolbar-button" @click="copyCode" title="코드 복사">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path>
          </svg>
        </button>
        <button class="toolbar-button" @click="saveCode" title="저장">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            ></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
      </div>
    </div>
    <div class="viewer-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
      <template v-else>
        <iframe
          v-if="viewerTab === 'preview'"
          class="preview-iframe"
          :srcdoc="code"
          sandbox="allow-scripts"
          referrerpolicy="no-referrer"
        ></iframe>
        <div v-else class="code-editor">
          <div class="line-numbers">
            <div v-for="n in totalLines" :key="n" class="line-number">
              {{ n }}
            </div>
          </div>
          <textarea
            class="code-textarea"
            v-model="code"
            spellcheck="false"
            @input="updateLineNumbers"
            ref="codeTextarea"
          ></textarea>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import { useProjectStore } from "../../../stores/projectStore";

const props = defineProps({
  activeFile: {
    type: Object,
    required: true,
  },
});

const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);
const viewerTab = ref("preview");
const code = ref("");
const isLoading = ref(false);
const totalLines = ref(1);
const codeTextarea = ref(null);

const updateLineNumbers = () => {
  if (!code.value) {
    totalLines.value = 1;
    return;
  }
  totalLines.value = code.value.split("\n").length;
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value);
    alert("코드가 클립보드에 복사되었습니다.");
  } catch (err) {
    console.error("코드 복사 실패:", err);
    alert("코드 복사에 실패했습니다.");
  }
};

// fetchCode 함수를 먼저 선언
const fetchCode = async () => {
  if (!props.activeFile) return;

  isLoading.value = true;
  try {
    const response = await axios.get(
      `/api/v1/projects/${projectId.value}/mockups/${props.activeFile.revision}/${props.activeFile.name}`
    );
    code.value = response.data;
    updateLineNumbers();
  } catch (error) {
    console.error("코드 로딩 실패:", error);
    code.value = "<!-- 파일을 불러오는 데 실패했습니다. -->";
    updateLineNumbers();
  } finally {
    isLoading.value = false;
  }
};

// 그 다음에 watch 설정
watch(
  () => props.activeFile,
  async (newFile) => {
    if (newFile) {
      await fetchCode();
    }
  },
  { immediate: true }
);

const saveCode = async () => {
  if (!props.activeFile) return;
  try {
    await axios.put(
      `/api/v1/projects/${projectId.value}/mockups/${props.activeFile.revision}/${props.activeFile.name}`,
      {
        code: code.value,
      }
    );
    alert("저장되었습니다!");
  } catch (error) {
    console.error(error);
    alert("저장 중 오류가 발생했습니다.");
  }
};

// Reset viewer tab when file changes
watch(
  () => props.activeFile,
  () => {
    viewerTab.value = "preview";
  }
);

onMounted(() => {
  if (codeTextarea.value) {
    codeTextarea.value.focus();
  }
});
</script>

<style scoped>
.mockup-viewer-pane {
  /* position: fixed; */
  top: 0;
  left: 340px;
  height: 100vh;
  /* width: calc(100vw - 340px); */
  background: #f9fafb;
  box-shadow: -2px 0 24px rgba(0, 0, 0, 0.06);
  z-index: 120;
  display: flex;
  flex-direction: column;
  animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.viewer-header {
  padding: 24px 32px 12px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.viewer-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.toggle-button {
  padding: 6px 12px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.toggle-button:hover {
  color: #374151;
}

.toggle-button.active {
  background: #fff;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #1e1e1e;
  border-bottom: 1px solid #333;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-type {
  color: #9cdcfe;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  background: rgba(156, 220, 254, 0.1);
  border-radius: 4px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.toolbar-button {
  padding: 6px;
  background: none;
  border: none;
  color: #9cdcfe;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toolbar-button:hover {
  background: rgba(156, 220, 254, 0.1);
}

.viewer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  min-height: 0;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
  background: #fff;
  min-height: 400px;
}

.code-editor {
  display: flex;
  background: #1e1e1e;
  height: 100%;
  font-family: "Fira Code", "Consolas", monospace;
  overflow: hidden;
}

.line-numbers {
  padding: 8px 8px 8px 0;
  background: #252526;
  color: #858585;
  text-align: right;
  user-select: none;
  border-right: 1px solid #333;
  position: sticky;
  left: 0;
  z-index: 1;
  overflow: hidden;
}

.line-number {
  padding: 0 8px;
  font-size: 12px;
  line-height: 1.5;
}

.code-textarea {
  flex: 1;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  padding: 8px;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  tab-size: 2;
  overflow-y: auto;
  overflow-x: auto;
}

.code-textarea::selection {
  background: #264f78;
}

.save-button-container {
  padding: 8px 16px;
  text-align: right;
}

.save-button {
  padding: 6px 12px;
  background-color: #1d4ed8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #174cb3;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .mockup-viewer-pane {
    left: 0;
    top: unset;
    bottom: 0;
    width: 100vw;
    height: 60vh;
    min-height: 320px;
    max-height: 80vh;
    border-radius: 18px 18px 0 0;
    box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.1);
  }

  .viewer-header,
  .viewer-tabs {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .code-textarea,
  .preview-iframe {
    min-height: 180px;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
