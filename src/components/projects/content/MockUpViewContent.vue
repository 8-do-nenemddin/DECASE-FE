<template>
  <div class="mockup-viewer-pane" v-if="activeFile && viewerTab">
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

    <div v-if="requirements.length" class="requirements-section">
      <div class="requirements-header" @click="toggleRequirements">
        <div class="requirements-title">
          <button class="toggle-btn" :class="{ expanded: requirementsExpanded }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <h4>반영된 요구사항</h4>
        </div>
        <div class="requirements-count">
          <span class="count-badge">{{ requirements.length }}</span>
        </div>
      </div>
      <div class="requirements-list" v-show="requirementsExpanded">
        <div
            v-for="(req, index) in requirements"
            :key="req.id"
            class="requirement-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="requirement-id">
            <span class="id-badge">{{ req.id }}</span>
          </div>
          <div class="requirement-content" @click="req.showDetail = !req.showDetail" style="cursor: pointer;">
            <p class="requirement-description">
              {{ req.description }}
              <span style="margin-left: 6px; font-size: 0.8rem; color: #3b82f6;">
                [{{ req.showDetail ? '접기' : '자세히' }}]
              </span>
            </p>
            <p
                v-if="req.showDetail"
                class="requirement-detail-description"
                style="margin-top: 6px; color: #334155; font-size: 0.85rem;"
            >
              {{ req.detailDescription || '상세 설명 없음' }}
            </p>
          </div>
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
const requirements = ref([]);
const isLoading = ref(false);
const totalLines = ref(1);
const codeTextarea = ref(null);
const emit = defineEmits(["openMockupSidebar"]);

const requirementsExpanded = ref(true);

const toggleRequirements = () => {
  requirementsExpanded.value = !requirementsExpanded.value;
};

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

const fetchRequirementDescriptions = async (projectId, ids) => {
  try {
    const response = await axios.post(
        `/api/v1/projects/${projectId}/requirements/descriptions`,
        { requirementIds: ids }
    );
    return response.data.descriptions; // [{ id: 101, description: "..." }]
  } catch (err) {
    console.error("요구사항 설명 로딩 실패:", err);
    return [];
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
    requirements.value = response.data.sourceRequirements || [];

    // 요구사항 설명 받아오기
    const ids = requirements.value.map((r) => r.id);
    const descriptions = await fetchRequirementDescriptions(projectId.value, ids);

    // 요구사항에 설명 병합
    requirements.value = requirements.value.map((req) => ({
      id: req.id,
      description: req.description,
      detailDescription:
          descriptions.find((desc) => desc.id === req.id)?.description || "",
      showDetail: false,
    }));

    updateLineNumbers();
  } catch (error) {
    console.error("코드 로딩 실패:", error);
    code.value = "<!-- 파일을 불러오는 데 실패했습니다. -->";
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

// Reset code and requirements when activeFile becomes invalid
watch(() => props.activeFile, (newVal) => {
  if (!newVal) {
    code.value = "";
    requirements.value = [];
    isLoading.value = false;
  }
});

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

.requirements-section {
  margin-top: 20px;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.requirements-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.requirements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.requirements-header:hover {
  background: #f8fafc;
}

.requirements-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.toggle-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.toggle-btn svg {
  transition: transform 0.2s ease;
}

.toggle-btn.expanded svg {
  transform: rotate(180deg);
}

.requirements-title h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  letter-spacing: -0.2px;
}

.requirements-count {
  display: flex;
  align-items: center;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.requirements-list {
  padding: 8px 12px 12px;
  max-height: 300px;
  overflow-y: auto;
  background: #ffffff;
}

.requirements-list::-webkit-scrollbar {
  width: 6px;
}

.requirements-list::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.requirements-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.requirements-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  animation: slideInUp 0.4s ease-out both;
}

.requirement-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background: #fafbfc;
}

.requirement-id {
  flex-shrink: 0;
}

.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.requirement-item:hover .id-badge {
  background: #e2e8f0;
  color: #475569;
}

.requirement-content {
  flex: 1;
  min-width: 0;
}

.requirement-description {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: 400;
  word-break: break-word;
}

.requirement-status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.status-indicator.completed {
  background: #f0f9ff;
  color: #0ea5e9;
  border: 1px solid #e0f2fe;
}

.requirement-item:hover .status-indicator.completed {
  background: #0ea5e9;
  color: white;
  border-color: #0ea5e9;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .requirements-section {
    margin-top: 16px;
    border-radius: 12px;
  }

  .requirements-header {
    padding: 12px 16px;
  }

  .requirements-title h4 {
    font-size: 0.95rem;
  }

  .requirement-item {
    padding: 10px 12px;
    gap: 10px;
    border-radius: 8px;
  }

  .id-badge {
    min-width: 36px;
    height: 24px;
    font-size: 0.75rem;
    border-radius: 6px;
  }

  .requirement-description {
    font-size: 0.85rem;
  }

  .status-indicator {
    width: 20px;
    height: 20px;
  }

  .status-indicator svg {
    width: 10px;
    height: 10px;
  }
}

.requirement-detail-description {
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>
