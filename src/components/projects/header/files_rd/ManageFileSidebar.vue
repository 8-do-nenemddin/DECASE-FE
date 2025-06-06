<template>
  <div class="sidebar-overlay" @click="$emit('close')">
    <div
      ref="sidebarRef"
      class="modern-sidebar sidebar"
      :class="{
        mobile: isMobile,
        tablet: isTablet,
        resizing: isResizing,
      }"
      :style="sidebarStyles"
      @click.stop
    >
      <!-- 리사이즈 핸들 (데스크톱에서만 표시) -->
      <div
        v-if="!isMobile && !isTablet"
        class="resize-handle"
        @mousedown="startResize"
        :class="{ active: isResizing }"
      ></div>

      <!-- Header -->
      <div class="sidebar-header"></div>

      <div class="sidebar-content">
        <div
          v-for="(item, index) in sidebarItems"
          :key="`section-${index}-${item.name}`"
          class="sidebar-section"
          :class="{ expanded: item.expanded }"
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
              <span v-if="item.count > 0" class="count-badge">{{
                item.count
              }}</span>
            </div>
          </div>

          <div v-if="item.expanded" class="section-content">
            <!-- Empty state -->
            <div
              v-if="!item.files || item.files.length === 0"
              class="empty-state"
            >
              <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-message">파일을 불러오는 중...</p>
              </div>
              <div v-else>
                <p class="empty-message">파일이 여기에 표시됩니다.</p>
              </div>
            </div>

            <!-- File list -->
            <div v-else class="file-grid">
              <div
                v-for="(file, fileIndex) in item.files"
                :key="`file-${item.type}-${fileIndex}-${
                  file.docId || file.revision || file.name
                }`"
                class="file-item"
                :class="{ selected: isFileSelected(fileIndex, item.type) }"
                @click="selectFile(file, fileIndex, item.type)"
                @contextmenu.prevent="
                  showContextMenu($event, file, fileIndex, item.type)
                "
              >
                <!-- 기존 파일 아이템 내용... -->
                <div class="file-content">
                  <div class="file-icon" :class="file.color || 'default-color'">
                    {{ file.icon || getFileIcon(file.name) }}
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div v-if="file.date" class="file-date">
                      {{ file.date }}
                    </div>
                  </div>
                  <div v-if="file.revision" class="file-revision">
                    v{{ file.revision }}
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
        </div>
      </div>

      <!-- Context Menu -->
      <div
        v-if="contextMenu.show"
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @click.stop
      >
        <div class="context-menu-item" @click="showFileInfo">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>파일 정보</span>
        </div>
        <div class="context-menu-item" @click="downloadFile">
          <svg
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
          <span>다운로드</span>
        </div>
      </div>

      <!-- File Info Modal -->
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
            <div class="file-preview">
              <div
                class="preview-icon"
                :class="fileInfoModal.file?.color || 'default-color'"
              >
                {{ fileInfoModal.file?.icon || "📁" }}
              </div>
              <div class="preview-details">
                <div class="preview-name">{{ fileInfoModal.file?.name }}</div>
                <div class="preview-meta">
                  <div v-if="fileInfoModal.file?.date" class="meta-row">
                    <span class="meta-label">생성일:</span>
                    <span class="meta-value">{{
                      fileInfoModal.file.date
                    }}</span>
                  </div>
                  <div v-if="fileInfoModal.file?.revision" class="meta-row">
                    <span class="meta-label">버전:</span>
                    <span class="meta-value"
                      >v{{ fileInfoModal.file.revision }}</span
                    >
                  </div>
                  <div v-if="fileInfoModal.file?.docId" class="meta-row">
                    <span class="meta-label">문서 ID:</span>
                    <span class="meta-value">{{
                      fileInfoModal.file.docId
                    }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-label">유형:</span>
                    <span class="meta-value">
                      {{
                        fileInfoModal.file?.docId
                          ? "업로드 파일"
                          : "생성된 파일"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeFileInfo">닫기</button>
            <button class="btn-primary" @click="downloadFile">
              <svg
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
              다운로드
            </button>
          </div>
        </div>
      </div>

      <!-- Context overlay -->
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

const emit = defineEmits(["close", "fileSelected"]);

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

// Responsive state
const windowWidth = ref(window.innerWidth);
const sidebarWidth = ref(320);
const isResizing = ref(false);

const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(
  () => windowWidth.value >= 768 && windowWidth.value < 1024
);

const sidebarStyles = computed(() => {
  let width;
  if (isMobile.value) {
    width = Math.min(windowWidth.value - 40, 280);
  } else if (isTablet.value) {
    width = 300;
  } else {
    width = sidebarWidth.value;
  }
  return {
    width: `${width}px`,
    maxWidth: isMobile.value ? "90vw" : "none",
  };
});

const sidebarRef = ref(null);
const isLoading = ref(false);

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  file: null,
  fileIndex: -1,
  sectionType: null, // 어느 섹션인지 추가
});

const fileInfoModal = reactive({
  show: false,
  file: null,
  fileIndex: -1,
  sectionType: null, // 어느 섹션인지 추가
});

// Data
const sidebarItems = reactive([
  {
    name: "As-Is 보고서",
    type: "as-is",
    expanded: false,
    files: [],
    count: 0,
  },
  {
    name: "업로드한 파일",
    type: "uploaded",
    expanded: true,
    files: [],
    count: 0,
  },
  {
    name: "생성된 파일",
    type: "generated",
    expanded: false,
    files: [],
    count: 0,
  },
]);

// loadAllData 함수 수정 - AS-IS 보고서 추가
const loadAllData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await Promise.allSettled([
      fetchAsIsReports(), // AS-IS 보고서 추가
      fetchUploadedFiles(),
      fetchGeneratedFiles(),
    ]);
  } finally {
    isLoading.value = false;
  }
};

// API 호출 함수들
const fetchUploadedFiles = async () => {
  try {
    const response = await fetch(
      `/api/v1/projects/${props.projectId}/document/uploads`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    await nextTick();

    if (Array.isArray(data)) {
      const uploadedFiles = data.map((item, index) => ({
        id: `uploaded-${item.docId}-${index}`,
        name: item.fileName || "이름 없음",
        icon: getFileIconByName(item.fileName),
        color: "blue-gradient",
        date: new Date().toISOString().split("T")[0],
        docId: item.docId,
        type: "uploaded",
      }));

      sidebarItems[1].files = uploadedFiles;
      sidebarItems[1].count = uploadedFiles.length;
    } else {
      sidebarItems[1].files = [];
      sidebarItems[1].count = 0;
    }
  } catch (error) {
    console.error("업로드된 파일 API 호출 오류:", error);
    sidebarItems[1].files = [];
    sidebarItems[1].count = 0;
  }
};

const fetchGeneratedFiles = async () => {
  try {
    const response = await fetch(`/api/projects/${props.projectId}/revision`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    await nextTick();

    if (Array.isArray(data)) {
      const generatedFiles = data.map((item, index) => ({
        id: `generated-${item.revision}-${index}`,
        name: item.label || "이름 없음",
        icon: "📄",
        color: "green-gradient",
        date: item.date || new Date().toISOString().split("T")[0],
        revision: item.revision,
        type: "generated",
      }));

      sidebarItems[2].files = generatedFiles;
      sidebarItems[2].count = generatedFiles.length;
    } else {
      sidebarItems[2].files = [];
      sidebarItems[2].count = 0;
    }
  } catch (error) {
    console.error("생성된 파일 API 호출 오류:", error);
    sidebarItems[2].files = [];
    sidebarItems[2].count = 0;
  }
};

const getFileIconByName = (fileName) => {
  if (!fileName) return "📁";
  const extension = fileName.split(".").pop()?.toLowerCase();
  const iconMap = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    csv: "📊",
    txt: "📄",
    json: "🔧",
    xml: "🔧",
    zip: "📦",
    rar: "📦",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    mp4: "🎬",
    avi: "🎬",
    mov: "🎬",
    mp3: "🎵",
    wav: "🎵",
  };
  return iconMap[extension] || "📁";
};

const downloadGeneratedFile = async (file) => {
  try {
    const response = await fetch(
      `/api/projects/${props.projectId}/revision/${file.revision}/download`
    );
    if (!response.ok) throw new Error(`다운로드 실패: ${response.status}`);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name}.pdf`;
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
    console.error("생성된 파일 다운로드 오류:", error);
    alert("파일 다운로드에 실패했습니다.");
  }
};

// 리사이즈 핸들러
const startResize = (event) => {
  if (isMobile.value || isTablet.value) return;
  isResizing.value = true;
  const startX = event.clientX;
  const startWidth = sidebarWidth.value;

  const handleMouseMove = (e) => {
    sidebarWidth.value = Math.max(
      280,
      Math.min(600, startWidth + (e.clientX - startX))
    );
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleWindowResize = () => {
  windowWidth.value = window.innerWidth;
  if (isMobile.value) {
    sidebarWidth.value = Math.min(windowWidth.value - 40, 280);
  } else if (isTablet.value) {
    sidebarWidth.value = 300;
  } else if (sidebarWidth.value < 320) {
    sidebarWidth.value = 320;
  }
};

// Methods
const toggleItem = (index) => {
  sidebarItems[index].expanded = !sidebarItems[index].expanded;
};

const showContextMenu = (event, file, fileIndex, sectionType) => {
  const rect = sidebarRef.value?.getBoundingClientRect();
  const maxX = rect ? rect.width - 180 : window.innerWidth - 200;
  const maxY = window.innerHeight - 120;

  contextMenu.file = file;
  contextMenu.fileIndex = fileIndex;
  contextMenu.sectionType = sectionType;
  contextMenu.x = Math.min(event.clientX - (rect?.left || 0), maxX);
  contextMenu.y = Math.min(event.clientY, maxY);
  contextMenu.show = true;

  // 컨텍스트 메뉴를 연 파일도 선택 상태로 만들기
  selectFile(file, fileIndex, sectionType);
};

const hideContextMenu = () => {
  contextMenu.show = false;
  contextMenu.file = null;
  contextMenu.fileIndex = -1;
  contextMenu.sectionType = null;
};

const showFileInfo = () => {
  fileInfoModal.file = contextMenu.file;
  fileInfoModal.fileIndex = contextMenu.fileIndex;
  fileInfoModal.sectionType = contextMenu.sectionType;
  fileInfoModal.show = true;
  hideContextMenu();
};

const closeFileInfo = () => {
  fileInfoModal.show = false;
  fileInfoModal.file = null;
  fileInfoModal.fileIndex = -1;
  fileInfoModal.sectionType = null;
};

const getFileIcon = (filename) => {
  return getFileIconByName(filename);
};

const handleKeydown = (event) => {
  if (event.key === "Escape") {
    hideContextMenu();
    closeFileInfo();
  }
};

// 데이터 새로고침
const refreshData = () => {
  loadAllData();
};

defineExpose({ refreshData, loadAllData });

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleWindowResize);
  handleWindowResize();
  if (props.projectId) {
    loadAllData();
  }
});

// AS-IS 보고서 가져오는 함수 추가
const fetchAsIsReports = async () => {
  try {
    const response = await fetch(
      `/api/v1/projects/${props.projectId}/documents/as-is`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const responseData = await response.json();
    console.log(responseData);
    await nextTick();

    let data;
    if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
    } else if (Array.isArray(responseData)) {
      data = responseData;
    } else {
      data = [];
    }

    if (Array.isArray(data)) {
      const asIsFiles = data.map((item, index) => ({
        id: `as-is-${item.docId}-${index}`,
        name: item.name || "이름 없음",
        icon: "📋", // AS-IS 보고서 아이콘
        color: "orange-gradient", // 오렌지 그래디언트
        date: formatDate(item.createdDate),
        docId: item.docId,
        type: "as-is",
        createdBy: item.createdBy,
      }));

      sidebarItems[0].files = asIsFiles;
      sidebarItems[0].count = asIsFiles.length;
    } else {
      sidebarItems[0].files = [];
      sidebarItems[0].count = 0;
    }
  } catch (error) {
    console.error("AS-IS 보고서 API 호출 오류:", error);
    sidebarItems[0].files = [];
    sidebarItems[0].count = 0;
  }
};

// 날짜 포맷팅 함수 추가
const formatDate = (dateArray) => {
  if (!Array.isArray(dateArray) || dateArray.length < 3) {
    return new Date().toISOString().split("T")[0];
  }

  const [year, month, day] = dateArray;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};

// sidebarItems의 selectedFiles에 as-is 추가
const selectedFiles = reactive({
  "as-is": -1, // AS-IS 보고서 선택 인덱스 추가
  uploaded: -1, // 업로드한 파일 선택 인덱스
  generated: -1, // 생성된 파일 선택 인덱스
});

// selectFile 함수 수정
const selectFile = (file, fileIndex, sectionType) => {
  // 모든 선택 상태 초기화
  selectedFiles["as-is"] = -1;
  selectedFiles.uploaded = -1;
  selectedFiles.generated = -1;

  // 해당 섹션만 선택
  if (sectionType === "as-is") {
    selectedFiles["as-is"] = fileIndex;
  } else if (sectionType === "uploaded") {
    selectedFiles.uploaded = fileIndex;
  } else if (sectionType === "generated") {
    selectedFiles.generated = fileIndex;
  }

  // 부모 컴포넌트로 선택된 파일 정보 전달
  const fileData = {
    type: sectionType,
    file: file,
    index: fileIndex,
    docId: file.docId,
  };

  // AS-IS 보고서의 경우
  if (sectionType === "as-is") {
    fileData.docId = file.docId;
    fileData.projectId = props.projectId;
  }
  // 업로드한 파일의 경우
  else if (sectionType === "uploaded") {
    fileData.docId = file.docId;
  }
  // 생성된 파일의 경우
  else if (sectionType === "generated") {
    fileData.projectId = props.projectId;
    fileData.revision = file.revision;
  }

  emit("fileSelected", fileData);
  console.log("파일 선택됨:", fileData);
};

// isFileSelected 함수 수정
const isFileSelected = (fileIndex, sectionType) => {
  if (sectionType === "as-is") {
    return selectedFiles["as-is"] === fileIndex;
  } else if (sectionType === "uploaded") {
    return selectedFiles.uploaded === fileIndex;
  } else if (sectionType === "generated") {
    return selectedFiles.generated === fileIndex;
  }
  return false;
};

// downloadFile 함수에 as-is 추가
const downloadFile = () => {
  const file = contextMenu.file || fileInfoModal.file;
  if (!file) return;

  if (file.type === "as-is") {
    downloadAsIsFile(file);
  } else if (file.type === "uploaded") {
    downloadUploadedFile(file);
  } else if (file.type === "generated") {
    downloadGeneratedFile(file);
  }

  hideContextMenu();
  closeFileInfo();
};
// AS-IS 파일 다운로드 함수 수정
const downloadAsIsFile = async (file) => {
  try {
    const response = await fetch(`/api/v1/documents/${file.docId}/downloads`);
    if (!response.ok) throw new Error(`다운로드 실패: ${response.status}`);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
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
    console.error("AS-IS 보고서 다운로드 오류:", error);
    alert("파일 다운로드에 실패했습니다.");
  }
};

// 업로드된 파일 다운로드 함수 수정
const downloadUploadedFile = async (file) => {
  try {
    const response = await fetch(`/api/v1/documents/${file.docId}/downloads`);
    if (!response.ok) throw new Error(`다운로드 실패: ${response.status}`);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
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
    console.error("업로드된 파일 다운로드 오류:", error);
    alert("파일 다운로드에 실패했습니다.");
  }
};

// onUnmounted에서 선택 상태 초기화에 as-is 추가
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", handleWindowResize);
  hideContextMenu();
  closeFileInfo();
  selectedFiles["as-is"] = -1;
  selectedFiles.uploaded = -1;
  selectedFiles.generated = -1;
  isLoading.value = false;
});

// watch에서 프로젝트 변경 시 선택 상태 초기화에 as-is 추가
watch(
  () => props.projectId,
  (newProjectId, oldProjectId) => {
    if (newProjectId && newProjectId !== oldProjectId) {
      selectedFiles["as-is"] = -1;
      selectedFiles.uploaded = -1;
      selectedFiles.generated = -1;
      loadAllData();
    }
  },
  { immediate: false }
);
</script>
<style scoped>
/* 기본 스타일만 유지 - 불필요한 다크모드, 반응형 등 제거 */
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

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  padding-top: 52px;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

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

.section-content {
  animation: expandDown 0.3s ease-out;
  border-top: 1px solid #f3f4f6;
}

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

.file-icon.green-gradient {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
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

/* 애니메이션 */
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 스크롤바 */
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

/* 포커스 스타일 */
.modal-close:focus-visible,
.menu-button:focus-visible,
.btn-primary:focus-visible,
.btn-secondary:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.file-item:focus-visible,
.section-header:focus-visible,
.context-menu-item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* 반응형 (최소한만 유지) */
@media (max-width: 767px) {
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

.file-icon.orange-gradient {
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.preview-icon.orange-gradient {
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
}
</style>
