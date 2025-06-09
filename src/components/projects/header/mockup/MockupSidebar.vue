<template>
  <div v-if="isVisible" class="sidebar-overlay" @click.self="handleOverlayClick">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
              <span class="section-title">{{ item.name }}</span>
              <span class="count-badge">{{ item.count }}</span>
              <button
                  class="download-revision-btn"
                  @click.stop="downloadRevision(item)"
                  :disabled="isDownloading[item.revisionNumber]"
                  :title="`리비전 ${item.revisionNumber} 전체 다운로드`"
              >
                <div v-if="isDownloading[item.revisionNumber]" class="download-spinner"></div>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                    @contextmenu.prevent="showContextMenu($event, file, fileIndex, item.type)"
                >
                  <div class="file-content">
                    <div class="file-icon orange-gradient">🖼️</div>
                    <div class="file-info">
                      <div class="file-name">{{ file.name }}</div>
                    </div>
                  </div>
                  <button class="menu-button" @click.stop="showContextMenu($event, file, fileIndex, item.type)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div v-if="contextMenu.show" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @click.stop>
        <div class="context-menu-item" @click="showFileInfo"><span>파일 정보</span></div>
        <div class="context-menu-item" @click="downloadFile"><span>다운로드</span></div>
      </div>

      <div v-if="fileInfoModal.show" class="modal-overlay" @click="closeFileInfo">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>파일 정보</h3>
            <button class="modal-close" @click="closeFileInfo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <div class="preview-name">{{ fileInfoModal.file?.name }}</div>
            <div class="preview-meta">
              <div class="meta-row"><span class="meta-label">리비전:</span><span class="meta-value">v{{ fileInfoModal.file.revision }}</span></div>
              <div class="meta-row"><span class="meta-label">유형:</span><span class="meta-value">목업 파일</span></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeFileInfo">닫기</button>
            <button class="btn-primary" @click="downloadFile">다운로드</button>
          </div>
        </div>
      </div>

      <div v-if="contextMenu.show" class="context-overlay" @click="hideContextMenu"></div>
    </div>
    <div class="mockup-viewer-pane" v-if="activeFile">
      <div class="viewer-header">
        <h3>{{ activeFile.name }} (v{{ activeFile.revision }})</h3>
      </div>
      <div class="viewer-tabs">
        <button :class="{ active: viewerTab === 'preview' }" @click="viewerTab = 'preview'">Preview</button>
        <button :class="{ active: viewerTab === 'code' }" @click="viewerTab = 'code'">Code</button>
      </div>
      <div class="save-button-container" v-if="viewerTab === 'code'">
        <button class="save-button" @click="saveCode">저장</button>
      </div>
      <div class="viewer-content">
        <iframe
            v-if="viewerTab === 'preview'"
            class="preview-iframe"
            :srcdoc="activeFile.code"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        ></iframe>
        <textarea
            v-else
            class="code-textarea"
            v-model="activeFile.code"
            spellcheck="false"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useProjectStore } from '/src/stores/projectStore';
import axios from 'axios';
// Save code for active file
const saveCode = async () => {
  if (!activeFile.value) return;
  try {
    await axios.put(`/api/v1/projects/mockups/${projectStore.projectId}/${activeFile.value.revision}/${activeFile.value.name}`, {
      code: activeFile.value.code
    });
    alert('저장되었습니다!');
  } catch (error) {
    console.error(error);
    alert('저장 중 오류가 발생했습니다.');
  }
};

const props = defineProps({
  isVisible: Boolean,
});
const emit = defineEmits(['close', 'fileSelected']);

const handleOverlayClick = (event) => {
  const headerEl = document.querySelector('.header-bar');
  if (headerEl && headerEl.contains(event.target)) return;
  emit('close');
};

const projectStore = useProjectStore();

// --- 상태 변수 (State) ---
const windowWidth = ref(window.innerWidth);
const sidebarWidth = ref(340);
const isResizing = ref(false);
const sidebarRef = ref(null);
const isLoading = ref(true);

const sidebarItems = ref([]);
const selectedFiles = reactive({});
const isDownloading = ref({}); // 리비전별 다운로드 상태 관리

const contextMenu = reactive({ show: false, x: 0, y: 0, file: null, fileIndex: -1, sectionType: null });
const fileInfoModal = reactive({ show: false, file: null, fileIndex: -1, sectionType: null });

// --- 데이터 로딩 및 처리 ---
const loadMockupData = async () => {
  if (!projectStore.projectId) return;
  isLoading.value = true;
  sidebarItems.value = [];
  try {
    const res = await axios.get(`/api/v1/projects/mockups/${projectStore.projectId}`);
    const groupedMockups = res.data;

    const items = Object.entries(groupedMockups).map(([revision, files]) => {
      const type = `mockup-rev-${revision}`;
      selectedFiles[type] = -1;
      return {
        name: `목업 리비전 ${revision}`,
        type: type,
        revisionNumber: revision, // 리비전 번호 추가
        expanded: true,
        files: files.map(fileName => ({
          name: fileName,
          revision: revision,
          type: 'mockup',
        })),
        count: files.length,
      };
    });
    // 최신 리비전이 위로 오도록 정렬
    sidebarItems.value = items.sort((a, b) => Number(b.revisionNumber) - Number(a.revisionNumber));
  } catch (error) {
    console.error("목업 데이터를 불러오는 중 오류 발생:", error);
    sidebarItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

const downloadMockupFile = async (file) => {
  if (!file) return;
  try {
    const url = `/api/v1/projects/mockups/${projectStore.projectId}/${file.revision}/${file.name}`;
    const response = await axios.get(url, { responseType: 'blob' });

    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("목업 파일 다운로드 오류:", error);
    alert('파일 다운로드에 실패했습니다.');
  }
};

// 리비전 전체 다운로드 함수 추가
const downloadRevision = async (item) => {
  if (!item.revisionNumber || !projectStore.projectId) return;

  // 다운로드 상태 설정
  isDownloading.value[item.revisionNumber] = true;

  try {
    const url = `/api/v1/projects/mockups/${projectStore.projectId}/${item.revisionNumber}/download`;
    const response = await axios.get(url, {
      responseType: 'blob',
      timeout: 60000 // 60초 타임아웃
    });

    // 파일명 생성 (예: mockup-revision-1.zip)
    const fileName = `mockup-revision-${item.revisionNumber}.zip`;

    const blob = new Blob([response.data]);
    const link = document.createElement('a');
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
      alert('해당 리비전의 파일을 찾을 수 없습니다.');
    } else if (error.code === 'ECONNABORTED') {
      alert('다운로드 시간이 초과되었습니다. 다시 시도해주세요.');
    } else {
      alert('리비전 다운로드에 실패했습니다.');
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
const viewerTab = ref('preview');

const selectFile = async (file, fileIndex, sectionType) => {
  Object.keys(selectedFiles).forEach(key => selectedFiles[key] = -1);
  selectedFiles[sectionType] = fileIndex;

  emit('fileSelected', {
    type: 'mockup',
    revision: file.revision,
    fileName: file.name,
  });

  try {
    const res = await axios.get(`/api/v1/projects/mockups/${projectStore.projectId}/${file.revision}/${file.name}`);
    activeFile.value = {
      ...file,
      code: await res.data
    };
  } catch (error) {
    console.error("파일 불러오기 실패:", error);
    activeFile.value = {
      ...file,
      code: '<!-- 파일을 불러오는 데 실패했습니다. -->'
    };
  }

  viewerTab.value = 'preview';
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
  contextMenu.x = Math.min(event.clientX - (rect?.left || 0), (sidebarRef.value?.clientWidth || 340) - 180);
  contextMenu.y = event.clientY;
  contextMenu.show = true;
};

const hideContextMenu = () => { contextMenu.show = false; };
const showFileInfo = () => {
  fileInfoModal.file = contextMenu.file;
  fileInfoModal.show = true;
  hideContextMenu();
};
const closeFileInfo = () => { fileInfoModal.show = false; };

// --- 반응형 및 리사이즈 로직 ---
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);
const sidebarStyles = computed(() => ({ width: `${isMobile.value ? windowWidth.value : sidebarWidth.value}px` }));

const startResize = (event) => {
  isResizing.value = true;
  const startX = event.clientX;
  const startWidth = sidebarWidth.value;

  const handleMouseMove = (e) => {
    sidebarWidth.value = Math.max(300, Math.min(600, startWidth + (startX - e.clientX)));
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
    emit('close');
  }
};
const handleWindowResize = () => { windowWidth.value = window.innerWidth; };

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleWindowResize);
});
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", handleWindowResize);
});

watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      loadMockupData();
    });
  }
});

watch(() => projectStore.projectId, (newId) => {
  if (newId && props.isVisible) {
    loadMockupData();
  }
});
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
  font-family: 'Fira Mono', 'Menlo', 'Consolas', 'monospace';
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
  padding: 15px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

/* Sidebar Sections */
.sidebar-section {
  margin-bottom: 16px;
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-header {
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.section-header:hover {
  background: #f3f4f6;
}

.section-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expand-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
  display: flex;
  align-items: center;
}

.expand-icon.rotated {
  transform: rotate(90deg);
  color: #374151;
}

.section-title {
  flex: 1;
  font-weight: 500;
  color: #374151;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.count-badge {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

/* Download Button */
.download-revision-btn {
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.download-revision-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #111827;
  transform: scale(1.05);
}

.download-revision-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.section-content {
  animation: expandDown 0.3s ease-out;
  border-top: 1px solid #f3f4f6;
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
  padding: 12px 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-item:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.file-item.selected {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.file-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* File Icons */
.file-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.file-icon.blue-gradient {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.file-icon.green-gradient {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.file-icon.orange-gradient {
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.file-icon.default-color {
  background: #f3f4f6;
}

/* File Info */
.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  margin-bottom: 2px;
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
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.file-item:hover .menu-button {
  opacity: 1;
}

.menu-button:hover {
  background: #e5e7eb;
  color: #111827;
  transform: scale(1.1);
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
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
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
    box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.10);
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