<template>
  <header class="header">
    <div class="header-left">
      <div class="brand-logo" @click="handleGoMain">
        <img src="/DECASE-logo-no-background.png" alt="DECASE Logo" class="logo-image" />
      </div>

      <div class="header-actions">
        <button
          class="icon-button search-btn"
          @click="toggleSidebar"
          title="검색"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <button
          class="icon-button menu-btn"
          @click="toggleFileListSidebar"
          title="메뉴"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <button
          v-if="projectStore.permission === 'READ_AND_WRITE'"
          class="icon-button upload-btn"
          @click="handleUploadClick"
          title="파일 업로드"
          :disabled="projectStore.projectRevision === 0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
        <button
          class="icon-button mockup-btn"
          @click="toggleMockupSidebar"
          title="목업 뷰어"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>
      </div>
    </div>

    <div class="header-center">
      <div class="project-title-container" @click="goToMain">
        <h1 class="project-title">{{ projectStore.projectName }}</h1>
        <div class="project-status">{{ projectStore.status }} PROJECT</div>
      </div>
    </div>

    <div class="header-right">
      <button class="download-button" @click="openDownloadFileModal">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6" />
          <polyline points="12 2 12 14" />
          <polyline points="5 9 12 16 19 9" />
        </svg>
        <span>다운로드</span>
      </button>

      <div class="action-buttons">
        <button
          class="icon-button profile-btn"
          @click="toggleProfileSidebar"
          title="사용자"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
        <button
          class="icon-button settings-btn"
          @click="handleGoSettings"
          title="설정"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.3-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.12.61 1.82.33.61-.26 1-.86 1-1.51V3a2 2 0 1 1 4 0v.09c0 .7.4 1.3 1 1.51.7.28 1.36.13 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.26.61.86 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.7 0-1.3.4-1.51 1z"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <MockupSidebar
    :isVisible="showMockupSidebar"
    @close="closeMockupSidebar"
    @fileSelected="handleMockupFileSelected"
  />
  <SearchRequirementsSidebar
    v-if="showSidebar"
    :selectedRevision="projectStore.projectRevision"
    @close="closeSidebar"
    @search="handleSearch"
  />
  <ManageFileSidebar
    v-if="showFileListSidebar"
    :projectId="projectId"
    @close="closeFileListSidebar"
    @fileSelected="handleFileSelected"
  />
  <UploadSourceModal
    v-if="showSourceUploadModal"
    @close="closeSourceUploadModal"
    @createProject="handleUploadSource"
  />
  <DownloadFileModal
    v-if="showDownloadFileModal"
    @close="closeDownloadFileModal"
    @createProject="handleDownloadSource"
  />
  <ProfileBar
    :isVisible="showProfileSidebar"
    @close="closeProfileSidebar"
    @logout="handleLogout"
    @withdraw="handleWithdraw"
  />
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import SearchRequirementsSidebar from "./search_rd/SearchRequirementsSidebar.vue";
import ManageFileSidebar from "./files_rd/ManageFileSidebar.vue";
import UploadSourceModal from "./file_upload/UploadSourceModal.vue";
import DownloadFileModal from "./download_rd/DownloadFileModal.vue";
import ProfileBar from "../../main/ProfileBar.vue";
import MockupSidebar from "./mockup/MockupSidebar.vue";
import { useProjectStore } from "/src/stores/projectStore";

const emit = defineEmits([
  "fileSelected",
  "search",
  "mockupFileSelected",
  "openMockupSidebar",
]);

const projectStore = useProjectStore();
const router = useRouter();
const projectId = computed(() => projectStore.projectId);

const showSidebar = ref(false);
const showFileListSidebar = ref(false);
const showSourceUploadModal = ref(false);
const showDownloadFileModal = ref(false);
const showProfileSidebar = ref(false);
const showMockupSidebar = ref(false);

const goToMain = () => {
  if (projectId) {
    router.push(`/projects/${projectId.value}`);
    console.log("다시 프로젝트");
  }
};

const closeAllSidebars = () => {
  showSidebar.value = false;
  showFileListSidebar.value = false;
  showProfileSidebar.value = false;
  showMockupSidebar.value = false;
};

const toggleProfileSidebar = () => {
  if (showSidebar.value) showSidebar.value = false;
  if (showFileListSidebar.value) showFileListSidebar.value = false;
  if (showMockupSidebar.value) showMockupSidebar.value = false;
  showProfileSidebar.value = !showProfileSidebar.value;
};

const closeProfileSidebar = () => {
  showProfileSidebar.value = false;
};

const toggleMockupSidebar = () => {
  if (showSidebar.value) showSidebar.value = false;
  if (showFileListSidebar.value) showFileListSidebar.value = false;
  if (showProfileSidebar.value) showProfileSidebar.value = false;
  showMockupSidebar.value = !showMockupSidebar.value;
};

const closeMockupSidebar = () => {
  showMockupSidebar.value = false;
};

const handleMockupFileSelected = (mockupFile) => {
  console.log("HeaderBar received mockup file:", mockupFile);
  emit("mockupFileSelected", mockupFile);
};

const handleLogout = () => {
  console.log("로그아웃");
  closeProfileSidebar();
};

const handleWithdraw = () => {
  console.log("탈퇴하기");
  closeProfileSidebar();
};

const toggleSidebar = () => {
  if (showFileListSidebar.value) showFileListSidebar.value = false;
  if (showProfileSidebar.value) showProfileSidebar.value = false;
  if (showMockupSidebar.value) showMockupSidebar.value = false;
  showSidebar.value = !showSidebar.value;
};

const closeSidebar = () => {
  showSidebar.value = false;
};

const toggleFileListSidebar = () => {
  if (showSidebar.value) showSidebar.value = false;
  if (showProfileSidebar.value) showProfileSidebar.value = false;
  if (showMockupSidebar.value) showMockupSidebar.value = false;
  showFileListSidebar.value = !showFileListSidebar.value;
};

const handleFileSelected = (fileData) => {
  console.log("선택된 파일:", fileData);
  emit("fileSelected", fileData);
};

const closeFileListSidebar = () => {
  showFileListSidebar.value = false;
};

const openSourceUploadModal = () => {
  closeAllSidebars();
  showSourceUploadModal.value = true;
};

const handleUploadClick = () => {
  if (projectStore.permission !== "READ_AND_WRITE") {
    alert("권한이 없습니다.");
    return;
  }
  openSourceUploadModal();
};

const closeSourceUploadModal = () => {
  showSourceUploadModal.value = false;
};

const openDownloadFileModal = () => {
  closeAllSidebars();
  showDownloadFileModal.value = true;
};

const closeDownloadFileModal = () => {
  showDownloadFileModal.value = false;
};

const handleUploadSource = (newSourceName) => {
  closeSourceUploadModal();
};

const handleDownloadSource = (newSourceName) => {
  closeDownloadFileModal();
};

const handleGoMain = () => {
  router.push({ name: "MainView" });
};

const handleGoSettings = () => {
  const projectId = projectStore.projectId;
  console.log(`'${projectId}' 세팅, 관리자인지 확인 중... ${projectStore.isAdmin}`);
  if (projectStore.isAdmin) {
    router.push({ name: "ProjectSetting", params: { projectId } });
  } else {
    router.push({ name: "ProjectDetail", params: { projectId } });
  }
};

const handleSearch = (searchParams) => {
  emit("search", searchParams);
};

function handleOpenMockupSidebar() {
  showMockupSidebar.value = true;
  emit("openMockupSidebar");
}

defineExpose({ handleOpenMockupSidebar });
</script>

<style scoped>
.project-main {
  min-height: 100vh;
  background-color: #fafbfc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", sans-serif;
}

/* 헤더 스타일 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 72px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  position: relative;
  z-index: 50;
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-image {
  padding-left: 20px;
  height: 40px;
  width: auto;
  max-width: 150px;
  object-fit: contain;
  display: block;
}

.logo-image:hover {
  transform: translateY(-2px);
}

/* 헤더 액션 버튼들 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 4px;
  backdrop-filter: blur(8px);
}

.icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  position: relative;
  overflow: hidden;
}

.icon-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.icon-button:hover {
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.icon-button:hover::before {
  opacity: 1;
}

.icon-button:active {
  transform: translateY(0);
}

.search-btn:hover {
  color: #10b981;
}
.menu-btn:hover {
  color: #f59e0b;
}
.upload-btn:hover {
  color: #8b5cf6;
}
.mockup-btn:hover {
  color: #ef4444;
}

/* 프로젝트 타이틀 */
.project-title-container {
  text-align: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.project-title-container:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-1px);
}

.project-title {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.project-status {
  font-size: 11px;
  font-weight: 500;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

/* 다운로드 버튼 */
.download-button {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
}

.download-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: 16px;
}

.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.4);
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
}

.download-button:active {
  transform: translateY(0);
}

/* 액션 버튼 그룹 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 4px;
  backdrop-filter: blur(8px);
}

.profile-btn:hover {
  color: #f59e0b;
}
.settings-btn:hover {
  color: #64748b;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .header {
    padding: 0 24px;
    gap: 16px;
  }

  .project-title {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    height: 64px;
    flex-wrap: nowrap;
  }

  .header-left {
    gap: 12px;
    min-width: auto;
  }

  .header-center {
    flex: none;
    min-width: 0;
  }

  .header-right {
    gap: 8px;
    min-width: auto;
  }

  .project-title {
    font-size: 20px;
  }

  .project-status {
    display: none;
  }

  .download-button span {
    display: none;
  }

  .download-button {
    padding: 12px;
    min-width: 48px;
  }

  .header-actions {
    padding: 2px;
    gap: 2px;
  }

  .action-buttons {
    padding: 2px;
    gap: 2px;
  }

  .icon-button {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
    height: 60px;
  }

  .logo-icon {
    width: 40px;
    height: 36px;
  }

  .project-title {
    font-size: 18px;
  }

  .header-actions {
    gap: 1px;
  }

  .action-buttons {
    gap: 1px;
  }

  .icon-button {
    width: 32px;
    height: 32px;
  }

  .download-button {
    padding: 10px;
    min-width: 44px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-bottom-color: rgba(148, 163, 184, 0.2);
  }

  .project-title {
    background: linear-gradient(135deg, #f1f5f9 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .icon-button {
    color: #94a3b8;
  }

  .header-actions,
  .action-buttons {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(148, 163, 184, 0.2);
  }
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  animation: fadeInUp 0.6s ease-out;
}
</style>