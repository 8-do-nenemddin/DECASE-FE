<template>
  <div class="mockup-viewer-pane" v-if="activeFile">
    <div class="viewer-header">
      <div class="header-content-row">
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
    <div style="height: 16px"></div>
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
        <div
          v-if="viewerTab === 'code' && sourceRequirements.length"
          class="source-req-list"
        >
          <div class="source-req-title">🔖 반영된 요구사항</div>
          <ul>
            <li v-for="req in sourceRequirements" :key="req.id">
              <strong>[{{ req.id }}]</strong> {{ req.description }}
            </li>
          </ul>
        </div>
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
const revision = computed(() => props.activeFile.revision);
const viewerTab = ref("preview");
const code = ref("");
const isLoading = ref(false);
const totalLines = ref(1);
const codeTextarea = ref(null);
const emit = defineEmits(["openMockupSidebar"]);
const sourceRequirements = ref([]);

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

const fetchCode = async () => {
  if (!props.activeFile) return;
  isLoading.value = true;
  try {
    const response = await axios.get(
      `/api/v1/projects/${projectId.value}/mockups/${props.activeFile.revision}/${props.activeFile.name}`
    );
    code.value = response.data.html;
    sourceRequirements.value = response.data.sourceRequirements || [];
    updateLineNumbers();
  } catch (error) {
    console.error("코드 로딩 실패:", error);
    code.value = "<!-- 파일을 불러오는 데 실패했습니다. -->";
    sourceRequirements.value = [];
    updateLineNumbers();
  } finally {
    isLoading.value = false;
  }
};

// 컴포넌트가 마운트되거나 activeFile이 변경될 때 코드를 불러옴
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
  emit("openMockupSidebar");
});
</script>

<style scoped>
.mockup-viewer-pane {
  padding: 20px;
  height: calc(100vh - 64px);
  background: #ffffff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px) saturate(160%);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 0;
}
.viewer-header:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 12px 40px 0 rgba(30, 41, 59, 0.22);
}

.header-content-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.viewer-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.view-toggle {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  border: 1px solid #e2e8f0;
}
.toggle-button {
  padding: 10px 24px;
  border: none;
  background: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  background-color: transparent;
}
.toggle-button.active {
  background: #3b82f6;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}
.toggle-button:hover:not(.active) {
  background: #f1f5f9;
  color: #0f172a;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px;
  background: #f8fafc;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  border-bottom: 1.5px solid #e2e8f0;
}
.file-type {
  color: #3b82f6;
  font-size: 15px;
  font-weight: 700;
  padding: 8px 18px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  letter-spacing: 1px;
}
.toolbar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  padding: 0;
}
.toolbar-button:hover {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
.toolbar-button svg {
  width: 16px;
  height: 16px;
  transition: all 0.2s ease;
}
.toolbar-button:hover svg {
  stroke: #ffffff;
}
.toolbar-right {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}

.viewer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  overflow: hidden;
  min-height: 0;
  position: relative;
  transition: background 0.3s;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
  flex: 1;
  background: #ffffff;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.04) inset;
  border-radius: 16px;
  margin: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-editor {
  display: flex;
  background: #ffffff;
  height: 100%;
  min-height: 500px;
  font-family: "Fira Code", "Consolas", monospace;
  overflow: hidden;
  position: relative;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 0 32px rgba(0, 0, 0, 0.04) inset;
}
.line-numbers {
  padding: 16px 12px 16px 0;
  background: #f8fafc;
  color: #3b82f6;
  text-align: right;
  user-select: none;
  border-right: 2px solid #e2e8f0;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  width: 56px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
}
.code-textarea {
  flex: 1;
  background: transparent;
  color: #1e293b;
  border: none;
  padding: 16px 16px 16px 56px;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 15px;
  line-height: 1.7;
  resize: none;
  outline: none;
  tab-size: 2;
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;
  height: 100%;
  border-radius: 0 0 24px 0;
  box-shadow: none;
  transition: background 0.3s;
}
.code-textarea::selection {
  background: #e2e8f0;
}
.code-textarea::-webkit-scrollbar {
  width: 7px;
  background: transparent;
}
.code-textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
}
.loading-spinner {
  width: 56px;
  height: 56px;
  border: 5px solid #e2e8f0;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin-bottom: 24px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .mockup-viewer-pane {
    padding: 12px;
  }
  .viewer-header {
    padding: 12px;
    border-radius: 16px;
  }
  .viewer-header h3 {
    font-size: 1.2rem;
  }
  .editor-toolbar {
    padding: 10px;
    border-radius: 12px 12px 0 0;
  }
  .toolbar-button {
    padding: 8px 12px;
    font-size: 13px;
  }
  .preview-iframe {
    margin: 8px;
    min-height: 300px;
    border-radius: 10px;
  }
  .viewer-content {
    border-radius: 0 0 16px 16px;
  }
  .code-editor {
    border-radius: 0 0 16px 16px;
  }
  .line-numbers {
    width: 36px;
    font-size: 12px;
    border-radius: 0 0 0 12px;
  }
  .code-textarea {
    padding: 8px 8px 8px 36px;
    font-size: 13px;
    border-radius: 0 0 16px 0;
  }
  .loading-state {
    border-radius: 16px;
  }
}
</style>

.source-req-list {
  padding: 16px 16px 8px 56px;
  background: #fef9c3;
  border-bottom: 1px solid #facc15;
  font-size: 14px;
}

.source-req-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: #92400e;
}

.source-req-list ul {
  padding-left: 0;
  list-style: none;
}

.source-req-list li {
  margin-bottom: 4px;
  color: #78350f;
}
