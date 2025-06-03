<template>
  <div class="sidebar-overlay" @click="$emit('close')">
    <div class="sidebar" @click.stop>
      <div class="sidebar-content">
        <div
          v-for="(item, index) in sidebarItems"
          :key="index"
          class="sidebar-item-container"
          :class="{ 'expanded-container': item.expanded }"
        >
          <div class="sidebar-item" @click="toggleItem(index)">
            <div class="sidebar-item-header">
              {{ item.name }}
              <span class="arrow" :class="{ expanded: item.expanded }">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.5 6L8 9.5L11.5 6H4.5Z"/>
                </svg>
              </span>
            </div>
            <div v-if="item.expanded" class="sidebar-item-content-integrated">
              <p
                v-if="
                  item.name === '업로드한 파일' &&
                  (!item.files || item.files.length === 0)
                "
                class="empty-message"
              >
                업로드된 파일 목록이 여기에 표시됩니다.
              </p>
              <ul
                v-if="
                  item.name === '업로드한 파일' &&
                  item.files &&
                  item.files.length > 0
                "
                class="file-list file-list-scrollable"
              >
                <li
                  v-for="(file, fileIndex) in item.files"
                  :key="fileIndex"
                  class="file-item"
                >
                  <div class="file-line">
                    <span
                      class="file-icon"
                      :class="'file-icon-' + getFileIcon(file.name).type"
                    >
                      {{ getFileIcon(file.name).type }}
                    </span>
                    <span class="file-name">{{ file.name }}</span>

                    <!-- ❌ 삭제 버튼: 파일명 오른쪽에 위치 -->
                    <button
                      class="delete-button"
                      @click.stop="deleteUploadedFile(fileIndex)"
                      title="파일 삭제"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="file-date">{{ file.date }}</div>
                </li>
              </ul>

              <p
                v-if="
                  item.name === '생성된 파일' &&
                  (!item.files || item.files.length === 0)
                "
                class="empty-message"
              >
                생성된 파일 목록이 여기에 표시됩니다.
              </p>

              <ul
                v-if="
                  item.name === '생성된 파일' &&
                  item.files &&
                  item.files.length > 0
                "
                class="file-list file-list-scrollable"
              >
                <li
                  v-for="(file, fileIndex) in item.files"
                  :key="fileIndex"
                  class="file-item generated-file-item"
                  @contextmenu.prevent="showContextMenu($event, file, fileIndex)"
                  @click="selectFile(file, fileIndex)"
                  :class="{ 'selected': selectedFileIndex === fileIndex }"
                >
                  <div class="file-line">
                    <span
                      class="file-icon"
                      :class="'file-icon-' + getFileIcon(file.name).type"
                    >
                      {{ getFileIcon(file.name).type }}
                    </span>
                    <span class="file-name">{{ file.name }}</span>

                    <!-- 메뉴 버튼 -->
                    <button
                      class="menu-button"
                      @click.stop="showContextMenu($event, file, fileIndex)"
                      title="메뉴"
                    >
                      ⋯
                    </button>
                  </div>
                  <div class="file-date">{{ file.date }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 컨텍스트 메뉴 -->
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
        <span class="context-menu-icon">ℹ️</span>
        파일 정보
      </div>
      <div class="context-menu-item" @click="downloadFile">
        <span class="context-menu-icon">⬇️</span>
        다운로드
      </div>
    </div>

    <!-- 파일 정보 모달 -->
    <div v-if="fileInfoModal.show" class="modal-overlay" @click="closeFileInfo">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>파일 정보</h3>
          <button class="modal-close" @click="closeFileInfo">✕</button>
        </div>
        <div class="modal-content">
          <div class="file-info-section">
            <div class="file-info-icon">
              {{ getFileIcon(fileInfoModal.file?.name || '').type }}
            </div>
            <div class="file-info-details">
              <div class="file-info-name">{{ fileInfoModal.file?.name }}</div>
              <div class="file-info-meta">
                <div class="info-row">
                  <span class="info-label">생성일:</span>
                  <span class="info-value">{{ fileInfoModal.file?.date }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">파일 형식:</span>
                  <span class="info-value">{{ getFileType(fileInfoModal.file?.name || '') }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">크기:</span>
                  <span class="info-value">{{ fileInfoModal.file?.size || '알 수 없음' }}</span>
                </div>
                <div class="info-row" v-if="fileInfoModal.file?.description">
                  <span class="info-label">설명:</span>
                  <span class="info-value">{{ fileInfoModal.file.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeFileInfo">닫기</button>
        </div>
      </div>
    </div>

    <!-- 오버레이 (컨텍스트 메뉴 닫기용) -->
    <div v-if="contextMenu.show" class="context-overlay" @click="hideContextMenu"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["close", "search"]);

// 선택된 파일 추적
const selectedFileIndex = ref(-1);

// 컨텍스트 메뉴 상태
const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  file: null,
  fileIndex: -1
});

// 파일 정보 모달 상태
const fileInfoModal = reactive({
  show: false,
  file: null,
  fileIndex: -1
});

// ✅ 목업 데이터 - 더 상세한 정보 추가
const sidebarItems = reactive([
  {
    name: "업로드한 파일",
    expanded: true,
    files: [
      {
        name: "기획서_v1.pdf",
        date: "2025-05-22",
        size: "2.3 MB",
        description: "프로젝트 기획 문서"
      },
      {
        name: "요구사항정의서.docx",
        date: "2025-05-21",
        size: "1.8 MB",
        description: "시스템 요구사항 정의서"
      },
    ],
  },
  {
    name: "생성된 파일",
    expanded: false,
    files: [
      {
        name: "API_명세서.json",
        date: "2025-05-22",
        size: "45 KB",
        description: "REST API 명세서 및 엔드포인트 정의"
      },
      {
        name: "디자인_가이드라인.md",
        date: "2025-05-21",
        size: "12 KB",
        description: "UI/UX 디자인 가이드라인 문서"
      },
      {
        name: "데이터베이스_스키마.sql",
        date: "2025-05-20",
        size: "8 KB",
        description: "MySQL 데이터베이스 스키마 정의"
      },
    ],
  },
]);

const toggleItem = (index) => {
  sidebarItems[index].expanded = !sidebarItems[index].expanded;
};

// 파일 선택
const selectFile = (file, index) => {
  selectedFileIndex.value = index;
};

// 컨텍스트 메뉴 표시
const showContextMenu = (event, file, fileIndex) => {
  contextMenu.file = file;
  contextMenu.fileIndex = fileIndex;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.show = true;
  selectedFileIndex.value = fileIndex;

  // 화면 경계 체크
  const menuWidth = 180;
  const menuHeight = 120;
  
  if (contextMenu.x + menuWidth > window.innerWidth) {
    contextMenu.x = window.innerWidth - menuWidth - 10;
  }
  
  if (contextMenu.y + menuHeight > window.innerHeight) {
    contextMenu.y = window.innerHeight - menuHeight - 10;
  }
};

// 컨텍스트 메뉴 숨기기
const hideContextMenu = () => {
  contextMenu.show = false;
  contextMenu.file = null;
  contextMenu.fileIndex = -1;
};

// 파일 정보 표시
const showFileInfo = () => {
  fileInfoModal.file = contextMenu.file;
  fileInfoModal.fileIndex = contextMenu.fileIndex;
  fileInfoModal.show = true;
  hideContextMenu();
};

// 파일 정보 모달 닫기
const closeFileInfo = () => {
  fileInfoModal.show = false;
  fileInfoModal.file = null;
  fileInfoModal.fileIndex = -1;
};

// 다운로드 (컨텍스트 메뉴에서)
const downloadFile = () => {
  console.log("다운로드 실행:", contextMenu.file?.name);
  downloadGeneratedFile(contextMenu.file);
  hideContextMenu();
};

// 다운로드 (모달에서)
const downloadFromModal = () => {
  console.log("다운로드 실행:", fileInfoModal.file?.name);
  downloadGeneratedFile(fileInfoModal.file);
  closeFileInfo();
};

// 파일 삭제 (컨텍스트 메뉴에서)
const deleteFile = () => {
  const generatedSection = sidebarItems.find(
    (item) => item.name === "생성된 파일"
  );
  if (generatedSection?.files && contextMenu.fileIndex >= 0) {
    generatedSection.files.splice(contextMenu.fileIndex, 1);
  }
  hideContextMenu();
  selectedFileIndex.value = -1;
};

// 간단한 파일 아이콘 타입 반환 함수
function getFileIcon(filename) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const iconMap = {
    pdf: "📄",
    docx: "📝",
    json: "⚙️",
    md: "📋",
    sql: "🗄️",
    txt: "📄",
    xlsx: "📊",
    csv: "📈"
  };
  return { type: iconMap[extension] || "📁" };
}

// 파일 타입 반환 함수
function getFileType(filename) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const typeMap = {
    pdf: "PDF 문서",
    docx: "Word 문서",
    json: "JSON 데이터",
    md: "Markdown 문서",
    sql: "SQL 스크립트",
    txt: "텍스트 파일",
    xlsx: "Excel 스프레드시트",
    csv: "CSV 데이터"
  };
  return typeMap[extension] || "알 수 없는 형식";
}

// 삭제 및 다운로드 함수
function deleteUploadedFile(index) {
  const uploadedSection = sidebarItems.find(
    (item) => item.name === "업로드한 파일"
  );
  if (uploadedSection?.files) {
    uploadedSection.files.splice(index, 1);
  }
}

function downloadGeneratedFile(file) {
  console.log("다운로드 실행:", file.name);
  // 실제 다운로드 로직 구현
}

// 키보드 이벤트 처리
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    hideContextMenu();
    closeFileInfo();
  }
};

// 라이프사이클
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: #ffffff;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.12);
  z-index: 51;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

@keyframes sidebarSlideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-content {
  margin-top: 70px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-item-container {
  background: #ffffff;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar-item-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.sidebar-item-container.expanded-container {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: #9ca3af;
}

.sidebar-item {
  cursor: pointer;
}

.sidebar-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 15px;
  color: #374151;
  background: #fafafa;
  transition: all 0.3s ease;
  letter-spacing: -0.02em;
}

.sidebar-item-header:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
  width: 20px;
  height: 20px;
}

.arrow.expanded {
  transform: rotate(180deg);
  color: #374151;
}

.arrow svg {
  width: 16px;
  height: 16px;
}

.sidebar-item-content-integrated {
  padding: 0;
  animation: contentSlideDown 0.3s ease-out;
  background: #ffffff;
}

@keyframes contentSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-message {
  padding: 24px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
  background: #fafafa;
  margin: 0;
  line-height: 1.4;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.file-list-scrollable::-webkit-scrollbar {
  width: 6px;
}

.file-list-scrollable::-webkit-scrollbar-track {
  background: #f9fafb;
}

.file-list-scrollable::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.file-list-scrollable::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.file-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: #ffffff;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #f9fafb;
}

/* 생성된 파일 아이템 추가 스타일 */
.generated-file-item {
  cursor: pointer;
}

.generated-file-item.selected {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.generated-file-item.selected .file-name {
  color: #1d4ed8;
  font-weight: 600;
}

.file-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.file-icon {
  font-size: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f3f4f6;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.file-item:hover .file-icon {
  background: #e5e7eb;
}

.file-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
  line-height: 1.4;
}

.file-item:hover .file-name {
  color: #1f2937;
  font-weight: 600;
}

.file-date {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 40px;
  transition: color 0.3s ease;
}

.file-item:hover .file-date {
  color: #6b7280;
}

/* 기존 버튼 스타일 */
.delete-button {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: scale(0.8);
  flex-shrink: 0;
}

.file-item:hover .delete-button {
  opacity: 1;
  transform: scale(1);
}

.delete-button:hover {
  background: #fecaca;
  color: #b91c1c;
  transform: scale(1.05);
}

.delete-button:active {
  transform: scale(0.95);
}

/* 메뉴 버튼 */
.menu-button {
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: scale(0.8);
  flex-shrink: 0;
}

.generated-file-item:hover .menu-button {
  opacity: 1;
  transform: scale(1);
}

.menu-button:hover {
  background: #e5e7eb;
  color: #374151;
  transform: scale(1.05);
}

.menu-button:active {
  transform: scale(0.95);
}

/* 컨텍스트 메뉴 */
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
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
  animation: contextMenuSlideIn 0.2s ease-out;
}

@keyframes contextMenuSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;
}

.context-menu-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.context-menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.context-menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.context-menu-item.danger {
  color: #dc2626;
}

.context-menu-item.danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.context-menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalOverlayFadeIn 0.3s ease-out;
}

@keyframes modalOverlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 24px;
}

.file-info-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.file-info-icon {
  font-size: 48px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  flex-shrink: 0;
}

.file-info-details {
  flex: 1;
}

.file-info-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  word-break: break-word;
}

.file-info-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
}

.info-value {
  font-size: 14px;
  color: #374151;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-icon {
  font-size: 16px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
  }

  .sidebar-content {
    padding: 24px 20px;
  }

  .modal {
    width: 95%;
    margin: 0 10px;
  }

  .file-info-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .file-info-icon {
    margin-bottom: 8px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .sidebar-content {
    padding: 20px 16px;
    gap: 16px;
  }

  .sidebar-item-header {
    padding: 14px 16px;
    font-size: 14px;
  }

  .file-item {
    padding: 14px 16px;
  }

  .file-name {
    font-size: 13px;
  }

  .file-date {
    font-size: 11px;
    margin-left: 36px;
  }

  .context-menu {
    min-width: 160px;
  }

  .context-menu-item {
    padding: 10px 14px;
    font-size: 13px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-content {
    padding: 20px;
  }

  .file-info-name {
    font-size: 16px;
  }

  .modal-footer {
    padding: 16px 20px;
  }
}

/* 스크롤바 커스터마이징 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f9fafb;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Firefox 스크롤바 */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}
</style>