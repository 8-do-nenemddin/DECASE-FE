<template>
  <div class="sidebar-overlay" @click="$emit('close')">
    <div 
      ref="sidebarRef"
      class="modern-sidebar" 
      :class="{ 
        'mobile': isMobile, 
        'tablet': isTablet,
        'resizing': isResizing 
      }"
      :style="sidebarStyles"
      @click.stop
    >
      <!-- 리사이즈 핸들 (데스크톱에서만 표시) -->
      <div 
        v-if="!isMobile && !isTablet"
        class="resize-handle" 
        @mousedown="startResize"
        :class="{ 'active': isResizing }"
      ></div>

      <!-- Header -->
      <div class="sidebar-header">
        <h2 class="header-title">파일 목록</h2>
        <button class="close-button" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="sidebar-content">
        <div
          v-for="(item, index) in sidebarItems"
          :key="index"
          class="sidebar-section"
          :class="{ 'expanded': item.expanded }"
        >
          <div class="section-header" @click="toggleItem(index)">
            <div class="section-header-content">
              <div class="expand-icon" :class="{ 'rotated': item.expanded }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
              <span class="section-title">{{ item.name }}</span>
              <span v-if="item.count" class="count-badge">{{ item.count }}</span>
            </div>
          </div>

          <div v-if="item.expanded" class="section-content">
            <!-- Empty state -->
            <div v-if="!item.files || item.files.length === 0" class="empty-state">
              <p class="empty-message">
                {{ '파일이 여기에 표시됩니다.' }}
              </p>
            </div>

            <!-- File list -->
            <div v-else class="file-grid">
              <div
                v-for="(file, fileIndex) in item.files"
                :key="fileIndex"
                class="file-item"
                :class="{ 'selected': selectedFileIndex === fileIndex }"
                @click="selectFile(file, fileIndex)"
                @contextmenu.prevent="showContextMenu($event, file, fileIndex)"
              >
                <div class="file-content">
                  <div class="file-icon" :class="file.color || 'default-color'">
                    {{ file.icon || getFileIcon(file.name) }}
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div v-if="file.date" class="file-date">{{ file.date }}</div>
                  </div>
                  <div v-if="file.count" class="file-count">
                    {{ file.count.toLocaleString() }}
                  </div>
                </div>
                
                <button
                  class="menu-button"
                  @click.stop="showContextMenu($event, file, fileIndex)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Context Menu -->
      <div
        v-if="contextMenu.show"
        class="context-menu"
        :style="{
          top: contextMenu.y + 'px',
          left: contextMenu.x + 'px'
        }"
        @click.stop
      >
        <div class="context-menu-item" @click="showFileInfo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>파일 정보</span>
        </div>
        <div class="context-menu-item" @click="downloadFile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>다운로드</span>
        </div>
      </div>

      <!-- File Info Modal -->
      <div v-if="fileInfoModal.show" class="modal-overlay" @click="closeFileInfo">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>파일 정보</h3>
            <button class="modal-close" @click="closeFileInfo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <div class="file-preview">
              <div class="preview-icon" :class="fileInfoModal.file?.color || 'default-color'">
                {{ fileInfoModal.file?.icon || '📁' }}
              </div>
              <div class="preview-details">
                <div class="preview-name">{{ fileInfoModal.file?.name }}</div>
                <div class="preview-meta">
                  <div v-if="fileInfoModal.file?.date" class="meta-row">
                    <span class="meta-label">생성일:</span>
                    <span class="meta-value">{{ fileInfoModal.file.date }}</span>
                  </div>
                  <div v-if="fileInfoModal.file?.count" class="meta-row">
                    <span class="meta-label">개수:</span>
                    <span class="meta-value">{{ fileInfoModal.file.count.toLocaleString() }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-label">유형:</span>
                    <span class="meta-value">메일함</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeFileInfo">닫기</button>
            <button class="btn-primary" @click="downloadFile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              다운로드
            </button>
          </div>
        </div>
      </div>

      <!-- Context overlay -->
      <div v-if="contextMenu.show" class="context-overlay" @click="hideContextMenu"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["close"]);

// Responsive state
const windowWidth = ref(window.innerWidth);
const sidebarWidth = ref(320);
const isResizing = ref(false);

// Computed responsive values
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);
const isDesktop = computed(() => windowWidth.value >= 1024);

// 반응형 사이드바 스타일
const sidebarStyles = computed(() => {
  let width;
  
  if (isMobile.value) {
    // 모바일: 전체 화면 또는 화면 너비 - 여백
    width = Math.min(windowWidth.value - 40, 280);
  } else if (isTablet.value) {
    // 태블릿: 고정 너비
    width = 300;
  } else {
    // 데스크톱: 사용자 설정 가능한 너비
    width = sidebarWidth.value;
  }
  
  return {
    width: `${width}px`,
    maxWidth: isMobile.value ? '90vw' : 'none'
  };
});

// State
const selectedFileIndex = ref(-1);
const sidebarRef = ref(null);

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  file: null,
  fileIndex: -1
});

const fileInfoModal = reactive({
  show: false,
  file: null,
  fileIndex: -1
});

// Data
const sidebarItems = reactive([
  {
    name: "As-Is 보고서", 
    expanded: false,
    files: []
  },  
  {
    name: "업로드한 파일",
    expanded: true,
    files: [
      {
        name: "Google",
        icon: "☁️",
        color: "blue-gradient",
        date: "2025-05-22"
      },
      {
        name: "Google-aws",
        icon: "☁️", 
        color: "blue-gradient",
        date: "2025-05-21"
      },
      {
        name: "iCloud",
        icon: "☁️",
        color: "blue-gradient", 
        date: "2025-05-20"
      },
      {
        name: "Naver",
        icon: "☁️",
        color: "blue-gradient",
        date: "2025-05-19"
      }
    ]
  },
  {
    name: "생성된 파일",
    expanded: false,
    files: []
  }
]);

// 리사이즈 핸들러
const startResize = (event) => {
  if (isMobile.value || isTablet.value) return;
  
  isResizing.value = true;
  const startX = event.clientX;
  const startWidth = sidebarWidth.value;

  const handleMouseMove = (e) => {
    const newWidth = Math.max(280, Math.min(600, startWidth + (e.clientX - startX)));
    sidebarWidth.value = newWidth;
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // 커서 스타일 변경
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// Window resize handler
const handleWindowResize = () => {
  windowWidth.value = window.innerWidth;
  
  // 화면 크기 변경 시 사이드바 너비 자동 조정
  if (isMobile.value) {
    // 모바일로 전환 시
    sidebarWidth.value = Math.min(windowWidth.value - 40, 280);
  } else if (isTablet.value) {
    // 태블릿으로 전환 시
    sidebarWidth.value = 300;
  } else if (isDesktop.value && sidebarWidth.value < 320) {
    // 데스크톱으로 전환 시 최소 너비 보장
    sidebarWidth.value = 320;
  }
};

// Methods
const toggleItem = (index) => {
  sidebarItems[index].expanded = !sidebarItems[index].expanded;
};

const selectFile = (file, index) => {
  selectedFileIndex.value = index;
};

const showContextMenu = (event, file, fileIndex) => {
  const rect = sidebarRef.value?.getBoundingClientRect();
  const maxX = rect ? rect.width - 180 : window.innerWidth - 200;
  const maxY = window.innerHeight - 120;

  contextMenu.file = file;
  contextMenu.fileIndex = fileIndex;
  contextMenu.x = Math.min(event.clientX - (rect?.left || 0), maxX);
  contextMenu.y = Math.min(event.clientY, maxY);
  contextMenu.show = true;
  selectedFileIndex.value = fileIndex;
};

const hideContextMenu = () => {
  contextMenu.show = false;
  contextMenu.file = null;
  contextMenu.fileIndex = -1;
};

const showFileInfo = () => {
  fileInfoModal.file = contextMenu.file;
  fileInfoModal.fileIndex = contextMenu.fileIndex;
  fileInfoModal.show = true;
  hideContextMenu();
};

const closeFileInfo = () => {
  fileInfoModal.show = false;
  fileInfoModal.file = null;
  fileInfoModal.fileIndex = -1;
};

const downloadFile = () => {
  console.log("다운로드 실행:", contextMenu.file?.name || fileInfoModal.file?.name);
  hideContextMenu();
  closeFileInfo();
};

const getFileIcon = (filename) => {
  return "📁";
};

// Event handlers
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    hideContextMenu();
    closeFileInfo();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleWindowResize);
  handleWindowResize(); // 초기 설정
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleWindowResize);
});
</script>

<style scoped>
/* Base styles */
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

/* 반응형 클래스 */
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

/* 리사이즈 핸들 */
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

.resize-handle::after {
  content: '';
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 40px;
  background: #d1d5db;
  border-radius: 1px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resize-handle:hover::after,
.resize-handle.active::after {
  opacity: 1;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;
}

.close-button {
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e5e7eb;
  color: #111827;
  transform: scale(1.05);
}

/* Content */
.sidebar-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

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

.sidebar-section {
  margin-bottom: 16px;
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-section:hover {
  background: transparent;
}

.sidebar-section.expanded {
  background: transparent;
}

/* Section header */
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

/* Section content */
.section-content {
  animation: expandDown 0.3s ease-out;
  border-top: 1px solid #f3f4f6;
}

.empty-state {
  padding: 32px 20px;
  text-align: center;
}

.empty-message {
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
  margin: 0;
  line-height: 1.5;
}

/* File grid */
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

.file-icon.default-color {
  background: #f3f4f6;
}

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

.file-count {
  background: #f3f4f6;
  color: #374151;
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

/* Context menu */
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

/* Modal */
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

/* Responsive Design */
@media (max-width: 767px) {
  .modern-sidebar {
    width: 100vw !important;
    max-width: none !important;
  }
  
  .sidebar-header {
    padding: 20px;
  }
  
  .header-title {
    font-size: 18px;
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

@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar-header {
    padding: 22px;
  }
  
  .sidebar-content {
    padding: 18px;
  }
  
  .file-icon {
    width: 30px;
    height: 30px;
  }
  
  .context-menu {
    min-width: 170px;
  }
}

@media (min-width: 1024px) {
  .modern-sidebar {
    min-width: 280px;
    max-width: 600px;
  }
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .modern-sidebar {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .sidebar-header {
    border-bottom-color: #374151;
  }
  
  .header-title {
    color: #f9fafb;
  }
  
  .close-button {
    background: #374151;
    color: #9ca3af;
  }
  
  .close-button:hover {
    background: #4b5563;
    color: #f9fafb;
  }
  
  .section-header:hover {
    background: #374151;
  }
  
  .section-title {
    color: #e5e7eb;
  }
  
  .expand-icon {
    color: #9ca3af;
  }
  
  .expand-icon.rotated {
    color: #d1d5db;
  }
  
  .file-item {
    background: #374151;
  }
  
  .file-item:hover {
    background: #4b5563;
  }
  
  .file-item.selected {
    background: rgba(59, 130, 246, 0.2);
  }
  
  .file-name {
    color: #f9fafb;
  }
  
  .file-date {
    color: #9ca3af;
  }
  
  .file-count {
    background: #4b5563;
    color: #e5e7eb;
  }
  
  .menu-button {
    background: #4b5563;
    color: #9ca3af;
  }
  
  .menu-button:hover {
    background: #6b7280;
    color: #f9fafb;
  }
  
  .context-menu {
    background: #1f2937;
    border-color: #374151;
  }
  
  .context-menu-item {
    color: #e5e7eb;
  }
  
  .context-menu-item:hover {
    background: #374151;
    color: #f9fafb;
  }
  
  .modal {
    background: #1f2937;
    border-color: #374151;
  }
  
  .modal-header {
    border-bottom-color: #374151;
  }
  
  .modal-header h3 {
    color: #f9fafb;
  }
  
  .modal-close {
    background: #374151;
    color: #9ca3af;
  }
  
  .modal-close:hover {
    background: #4b5563;
    color: #f9fafb;
  }
  
  .preview-name {
    color: #f9fafb;
  }
  
  .meta-label {
    color: #9ca3af;
  }
  
  .meta-value {
    color: #e5e7eb;
  }
  
  .modal-footer {
    background: #111827;
    border-top-color: #374151;
  }
  
  .btn-secondary {
    background: #374151;
    color: #e5e7eb;
  }
  
  .btn-secondary:hover {
    background: #4b5563;
    color: #f9fafb;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .file-icon,
  .preview-icon {
    image-rendering: -webkit-optimize-contrast;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .expand-icon {
    transition: none;
  }
  
  .sidebar-overlay,
  .modern-sidebar,
  .section-content,
  .context-menu,
  .modal-overlay,
  .modal {
    animation: none;
  }
}

/* Print styles */
@media print {
  .sidebar-overlay,
  .modern-sidebar {
    display: none;
  }
}

/* Focus styles for accessibility */
.close-button:focus-visible,
.menu-button:focus-visible,
.modal-close:focus-visible,
.btn-primary:focus-visible,
.btn-secondary:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.file-item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.section-header:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.context-menu-item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
  background: #f3f4f6;
}

/* Custom scrollbar for WebKit browsers */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Firefox scrollbar */
.sidebar-content {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

/* Loading states (for future enhancement) */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>