<template>
  <div
    v-if="isVisible"
    class="sidebar-overlay sidebar"
    @click.self="handleOverlayClick"
  >
    <div
      ref="sidebarRef"
      class="modern-sidebar"
      :class="{ mobile: isMobile, tablet: isTablet, resizing: isResizing }"
      :style="sidebarStyles"
      @click.stop
    >
      <div
        v-if="!isMobile && !isTablet"
        class="resize-handle"
        @mousedown="startResize"
        :class="{ active: isResizing }"
      ></div>

      <div class="sidebar-header"></div>

      <div class="sidebar-content">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-message">목록을 불러오는 중...</p>
        </div>

        <div v-else-if="sidebarItems.length === 0" class="empty-state">
          <p class="empty-message">표시할 목업 파일이 없습니다.</p>
        </div>

        <div
          v-else
          v-for="(item, index) in sidebarItems"
          :key="`section-${index}`"
          class="sidebar-section"
        >
          <div class="section-header" @click="toggleItem(index)">
            <div class="section-header-content">
              <div class="expand-icon" :class="{ rotated: item.expanded }">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
              <span class="section-title">{{ item.name }}</span>
              <span class="count-badge">{{ item.count }}</span>
              <button
                class="download-revision-btn"
                @click.stop="downloadRevision(item)"
                :disabled="isDownloading[item.revisionNumber]"
                :title="`ver ${item.revisionNumber} 전체 다운로드`"
              >
                <div
                  v-if="isDownloading[item.revisionNumber]"
                  class="download-spinner"
                ></div>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          </div>

          <transition name="expand">
            <div v-if="item.expanded" class="section-content">
              <div class="file-grid">
                <div
                  v-for="(file, fileIndex) in item.files"
                  :key="`file-${fileIndex}-${file.name}`"
                  class="file-item"
                  :class="{ selected: isFileSelected(fileIndex, item.type) }"
                  @click="selectFile(file, fileIndex, item.type)"
                  @contextmenu.prevent="
                    showContextMenu($event, file, fileIndex, item.type)
                  "
                >
                  <div class="file-content">
                    <div class="file-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                      >
                        <path
                          d="M14 1H2C1.44772 1 1 1.44772 1 2V14C1 14.5523 1.44772 15 2 15H14C14.5523 15 15 14.5523 15 14V2C15 1.44772 14.5523 1 14 1Z"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 1V15"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M1 5H15"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div class="file-info">
                      <div class="file-name">{{ file.name }}</div>
                    </div>
                  </div>
                  <button
                    class="menu-button"
                    @click.stop="
                      showContextMenu($event, file, fileIndex, item.type)
                    "
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div
        v-if="contextMenu.show"
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @click.stop
      >
        <div class="context-menu-item" @click="showFileInfo">
          <span>파일 정보</span>
        </div>
        <div class="context-menu-item" @click="downloadFile">
          <span>다운로드</span>
        </div>
      </div>

      <div
        v-if="fileInfoModal.show"
        class="modal-overlay"
        @click="closeFileInfo"
      >
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>파일 정보</h3>
            <button class="modal-close" @click="closeFileInfo">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <div class="preview-name">{{ fileInfoModal.file?.name }}</div>
            <div class="preview-meta">
              <div class="meta-row">
                <span class="meta-label">revision:</span
                ><span class="meta-value"
                  >v{{ fileInfoModal.file.revision }}</span
                >
              </div>
              <div class="meta-row">
                <span class="meta-label">유형:</span
                ><span class="meta-value">목업 파일</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeFileInfo">닫기</button>
            <button class="btn-primary" @click="downloadFile">다운로드</button>
          </div>
        </div>
      </div>

      <div
        v-if="contextMenu.show"
        class="context-overlay"
        @click="hideContextMenu"
      ></div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
import { useProjectStore } from "../../../../stores/projectStore";
import axios from "axios";

const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);
const memberId = computed(() => projectStore.userId);

const saveCode = async () => {
  if (!activeFile.value) return;
  try {
    await axios.put(
      `/api/v1/projects/${projectId.value}/mockups/${activeFile.value.revision}/${activeFile.value.name}`,
      {
        code: activeFile.value.code,
      }
    );
    alert("저장되었습니다!");
  } catch (error) {
    console.error(error);
    alert("저장 중 오류가 발생했습니다.");
  }
};

const props = defineProps({
  isVisible: Boolean,
});
const emit = defineEmits(["close", "fileSelected"]);

const handleOverlayClick = (event) => {
  const headerEl = document.querySelector(".header-bar");
  if (headerEl && headerEl.contains(event.target)) return;
  emit("close");
};

// --- 상태 변수 (State) ---
const windowWidth = ref(window.innerWidth);
const sidebarWidth = ref(320);
const isResizing = ref(false);
const sidebarRef = ref(null);
const isLoading = ref(true);

const sidebarItems = ref([]);
const selectedFiles = reactive({});
const isDownloading = ref({}); // 리비전별 다운로드 상태 관리

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  file: null,
  fileIndex: -1,
  sectionType: null,
});
const fileInfoModal = reactive({
  show: false,
  file: null,
  fileIndex: -1,
  sectionType: null,
});

// --- 데이터 로딩 및 처리 ---
const loadMockupData = async () => {
  if (!projectId.value) {
    console.log("Project ID is not available");
    return;
  }
  console.log("Loading mockup data for project:", projectId.value);
  isLoading.value = true;
  sidebarItems.value = [];
  try {
    const res = await axios.get(`/api/v1/projects/${projectId.value}/mockups`);
    console.log("Mockup data response:", res.data);
    const groupedMockups = res.data;

    const items = Object.entries(groupedMockups).map(([revision, files]) => {
      const type = `mockup-rev-${revision}`;
      selectedFiles[type] = -1;
      // revisionCount가 undefined일 경우를 대비해 안전하게 처리
      const currentRevision = projectStore.revisionCount;
      const isExpanded =
        currentRevision !== undefined &&
        revision === currentRevision.toString();
      console.log(
        "Processing revision:",
        revision,
        "currentRevision:",
        currentRevision,
        "isExpanded:",
        isExpanded
      );
      return {
        name: `목업 revision ${revision}`,
        type: type,
        revisionNumber: revision,
        expanded: isExpanded,
        files: files.map((fileName) => ({
          name: fileName,
          revision: revision,
          type: "mockup",
        })),
        count: files.length,
      };
    });
    // 최신 리비전이 위로 오도록 정렬
    sidebarItems.value = items.sort(
      (a, b) => Number(b.revisionNumber) - Number(a.revisionNumber)
    );
    console.log("Final sidebar items:", sidebarItems.value);
  } catch (error) {
    console.error("목업 데이터를 불러오는 중 오류 발생:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    sidebarItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

const downloadMockupFile = async (file) => {
  if (!file) return;
  try {
    const url = `/api/v1/projects/${projectId.value}/mockups/${file.revision}/${file.name}`;
    const response = await axios.get(url, { responseType: "blob" });

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("목업 파일 다운로드 오류:", error);
    alert("파일 다운로드에 실패했습니다.");
  }
};

// 리비전 전체 다운로드 함수 추가
const downloadRevision = async (item) => {
  if (!item.revisionNumber || !projectId) return;

  // 다운로드 상태 설정
  isDownloading.value[item.revisionNumber] = true;

  try {
    const url = `/api/v1/projects/${projectId.value}/mockups/${item.revisionNumber}/download`;
    const response = await axios.get(url, {
      responseType: "blob",
      timeout: 60000, // 60초 타임아웃
    });

    // 파일명 생성 (예: mockup-revision-1.zip)
    const fileName = `mockup-revision-${item.revisionNumber}.zip`;

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    console.log(`리비전 ${item.revisionNumber} 다운로드 완료`);
  } catch (error) {
    console.error(`리비전 ${item.revisionNumber} 다운로드 오류:`, error);
    if (error.response?.status === 404) {
      alert("해당 리비전의 파일을 찾을 수 없습니다.");
    } else if (error.code === "ECONNABORTED") {
      alert("다운로드 시간이 초과되었습니다. 다시 시도해주세요.");
    } else {
      alert("리비전 다운로드에 실패했습니다.");
    }
  } finally {
    // 다운로드 상태 해제
    isDownloading.value[item.revisionNumber] = false;
  }
};

// --- 사용자 인터랙션 ---
const toggleItem = (index) => {
  sidebarItems.value[index].expanded = !sidebarItems.value[index].expanded;
};

const activeFile = ref(null);
const viewerTab = ref("preview");

const selectFile = (file, fileIndex, type) => {
  console.log("목업 파일 선택됨:", file);
  const fileData = {
    name: file.name,
    revision: file.revision,
  };
  console.log("발생할 이벤트 데이터:", fileData);
  emit("fileSelected", fileData);
  closeSidebar();
};

const isFileSelected = (fileIndex, sectionType) => {
  return selectedFiles[sectionType] === fileIndex;
};

const downloadFile = () => {
  const file = contextMenu.file || fileInfoModal.file;
  downloadMockupFile(file);
  hideContextMenu();
  closeFileInfo();
};

const showContextMenu = (event, file, fileIndex, sectionType) => {
  const rect = sidebarRef.value?.getBoundingClientRect();
  contextMenu.file = file;
  contextMenu.fileIndex = fileIndex;
  contextMenu.sectionType = sectionType;
  contextMenu.x = Math.min(
    event.clientX - (rect?.left || 0),
    (sidebarRef.value?.clientWidth || 340) - 180
  );
  contextMenu.y = event.clientY;
  contextMenu.show = true;
};

const hideContextMenu = () => {
  contextMenu.show = false;
};
const showFileInfo = () => {
  fileInfoModal.file = contextMenu.file;
  fileInfoModal.show = true;
  hideContextMenu();
};
const closeFileInfo = () => {
  fileInfoModal.show = false;
};

// --- 반응형 및 리사이즈 로직 ---
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(
  () => windowWidth.value >= 768 && windowWidth.value < 1024
);
const sidebarStyles = computed(() => ({
  width: `${isMobile.value ? windowWidth.value : sidebarWidth.value}px`,
}));

const startResize = (event) => {
  isResizing.value = true;
  const startX = event.clientX;
  const startWidth = sidebarWidth.value;

  const handleMouseMove = (e) => {
    sidebarWidth.value = Math.max(
      300,
      Math.min(600, startWidth + (startX - e.clientX))
    );
  };
  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

// --- 라이프사이클 훅 ---
const handleKeydown = (event) => {
  if (event.key === "Escape") {
    hideContextMenu();
    closeFileInfo();
    emit("close");
  }
};
const handleWindowResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleWindowResize);
  console.log("Component mounted, projectStore state:", {
    projectId: projectId.value,
    revisionCount: projectStore.revisionCount,
  });
});
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", handleWindowResize);
});

watch(
  () => projectId,
  (newId) => {
    console.log("Project ID changed:", newId);
    if (newId && props.isVisible) {
      loadMockupData();
    }
  }
);

// Add new watch for projectStore
watch(
  () => projectStore.revisionCount,
  (newCount) => {
    console.log("Revision count changed:", newCount);
  }
);

// Add watch for isVisible
watch(
  () => props.isVisible,
  (newValue) => {
    console.log("Sidebar visibility changed:", newValue);
    if (newValue) {
      nextTick(() => {
        loadMockupData();
      });
    }
  }
);
</script>

<style scoped>
/* Mockup Viewer Pane Styles */
.mockup-viewer-pane {
  position: fixed;
  top: 0;
  left: 340px;
  height: 100vh;
  width: calc(100vw - 340px);
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

/* Sidebar Base Styles */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  animation: overlayFadeIn 0.3s ease-out;
}

.modern-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}

.modern-sidebar.mobile {
  width: 100vw !important;
  max-width: 90vw;
}

.modern-sidebar.tablet {
  width: 300px !important;
}

.modern-sidebar.resizing {
  transition: none;
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.resize-handle:hover,
.resize-handle.active {
  background: linear-gradient(90deg, transparent, #3b82f6);
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  padding-top: 52px;
  flex-shrink: 0;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

/* Sidebar Sections */
.sidebar-section {
  margin-bottom: 4px;
  background: transparent;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.section-header:hover {
  background: rgba(59, 130, 246, 0.08);
}

.section-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expand-icon {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
  display: flex;
  align-items: center;
  width: 16px;
  height: 16px;
}

.expand-icon.rotated {
  transform: rotate(90deg);
  color: #374151;
}

.section-title {
  flex: 1;
  font-weight: 500;
  color: #1f2937;
  font-size: 13px;
  letter-spacing: -0.01em;
}

.count-badge {
  background: #e5e7eb;
  color: #4b5563;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  box-shadow: none;
}

/* Download Button */
.download-revision-btn {
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
}

.download-revision-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.08);
  color: #374151;
  transform: none;
}

.download-revision-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.download-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.section-content {
  animation: expandDown 0.2s ease-out;
  border-top: none;
  padding-left: 12px;
}

/* Loading and Empty States */
.empty-state {
  padding: 32px 20px;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.loading-message,
.empty-message {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.empty-message {
  font-style: italic;
  line-height: 1.5;
}

/* File Grid and Items */
.file-grid {
  padding: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  margin-bottom: 2px;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-item:hover {
  background: rgba(59, 130, 246, 0.08);
}

.file-item.selected {
  background: rgba(59, 130, 246, 0.12);
  border-left: none;
}

.file-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

/* File Icons */
.file-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  color: #6b7280;
}

.file-icon.orange-gradient {
  background: none;
  box-shadow: none;
  color: #f97316;
}

.file-name {
  font-weight: 400;
  color: #374151;
  font-size: 13px;
  margin-bottom: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-date {
  font-size: 11px;
  color: #6b7280;
}

.file-revision {
  background: #dcfce7;
  color: #166534;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
}

.menu-button {
  opacity: 0;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.menu-button:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #374151;
  transform: none;
}

.file-item:hover .menu-button {
  opacity: 1;
}

/* Context Menu */
.context-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
  animation: contextSlideIn 0.2s ease-out;
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  color: #374151;
  font-size: 14px;
  transition: all 0.2s ease;
}

.context-menu-item:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.3s ease-out;
}

.modal {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-content {
  padding: 24px;
}

.file-preview {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.preview-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.preview-icon.blue-gradient {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.preview-icon.green-gradient {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.preview-icon.orange-gradient {
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
}

.preview-icon.default-color {
  background: #f3f4f6;
}

.preview-details {
  flex: 1;
}

.preview-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  word-break: break-word;
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  color: #374151;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Button Styles */
.btn-secondary {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #111827;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

@keyframes expandDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
}

@keyframes contextSlideIn {
  from {
    transform: translateY(-8px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Scrollbar Styles */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Focus Styles */
.modal-close:focus-visible,
.menu-button:focus-visible,
.btn-primary:focus-visible,
.btn-secondary:focus-visible,
.download-revision-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.file-item:focus-visible,
.section-header:focus-visible,
.context-menu-item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* Responsive Design */
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
    animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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

  .modern-sidebar {
    width: 100vw !important;
    max-width: none !important;
  }

  .sidebar-header {
    padding: 20px;
  }

  .sidebar-content {
    padding: 16px;
  }

  .section-header {
    padding: 14px 16px;
  }

  .file-grid {
    padding: 8px;
  }

  .file-item {
    padding: 14px;
    margin-bottom: 6px;
  }

  .file-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .file-name {
    font-size: 13px;
  }

  .file-date {
    font-size: 10px;
  }

  .context-menu {
    min-width: 160px;
  }

  .context-menu-item {
    padding: 14px;
    font-size: 13px;
  }

  .modal {
    width: 95%;
    margin: 16px;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 20px;
  }

  .preview-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .preview-name {
    font-size: 16px;
  }

  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 12px 18px;
    font-size: 13px;
  }
}

@media (min-width: 1024px) {
  .modern-sidebar {
    min-width: 280px;
    max-width: 600px;
  }
}

/* Save Button Styles */
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
</style>
