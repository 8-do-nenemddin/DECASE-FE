<template>
  <div class="mockup-viewer-pane" v-if="activeFile">
    <div class="viewer-header">
      <h3>{{ activeFile.name }} (v{{ activeFile.revision }})</h3>
    </div>
    <div class="viewer-tabs">
      <button
        :class="{ active: viewerTab === 'preview' }"
        @click="viewerTab = 'preview'"
      >
        Preview
      </button>
      <button
        :class="{ active: viewerTab === 'code' }"
        @click="viewerTab = 'code'"
      >
        Code
      </button>
    </div>
    <div class="save-button-container" v-if="viewerTab === 'code'">
      <button class="save-button" @click="saveCode">저장</button>
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
        <textarea
          v-else
          class="code-textarea"
          v-model="code"
          spellcheck="false"
        ></textarea>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
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

// fetchCode 함수를 먼저 선언
const fetchCode = async () => {
  if (!props.activeFile) return;

  isLoading.value = true;
  try {
    const response = await axios.get(
      `/api/v1/projects/${projectId.value}/mockups/${props.activeFile.revision}/${props.activeFile.name}`
    );
    code.value = response.data;
  } catch (error) {
    console.error("코드 로딩 실패:", error);
    code.value = "<!-- 파일을 불러오는 데 실패했습니다. -->";
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

.viewer-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.viewer-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
  background: #f3f4f6;
}

.viewer-tabs button {
  flex: 1;
  padding: 12px 0;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-bottom 0.2s;
}

.viewer-tabs button.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
  background: #fff;
}

.viewer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  min-height: 0;
  overflow: auto;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
  background: #fff;
  min-height: 400px;
}

.code-textarea {
  width: 100%;
  height: 100%;
  min-height: 400px;
  flex: 1;
  border: none;
  background: #fff;
  resize: none;
  padding: 20px;
  font-family: "Fira Mono", "Menlo", "Consolas", "monospace";
  font-size: 15px;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;
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
