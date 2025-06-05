<template>
  <!-- 헤더 -->
  <header class="header">
    <div class="header-left">
      <img
        src="/DECASE-light.png"
        alt="DECASE Logo"
        class="logo-icon"
        @click="handleGoMain"
      />
      <div class="header-actions">
        <button class="icon-button" @click="toggleSidebar" title="검색">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <button class="icon-button" @click="toggleFileListSidebar" title="메뉴">
          <svg
            width="20"
            height="20"
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
        <!-- 소스 업로드 -->
        <button
          class="icon-button"
          @click="openSourceUploadModal"
          title="파일 업로드"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
        <!-- 목업 뷰어 버튼 추가 -->
        <button
          class="icon-button"
          @click="toggleMockupViewer"
          title="목업 뷰어"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
      <h1 class="project-title" @click="goToMain">
        {{ projectStore.projectName }}
      </h1>
    </div>
    <div class="header-right">
      <button class="download-button" @click="openDownloadFileModal">
        다운로드
      </button>
      <!-- 사용자 버튼에 프로필 바 토글 기능 추가 -->
      <button class="icon-button" @click="toggleProfileSidebar" title="사용자">
        <svg
          width="20"
          height="20"
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
        class="icon-button"
        @click="handleGoSettings(projectId)"
        title="설정"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 
         2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 
         1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 
         1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 
         1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 
         0-4h.09c.7 0 1.3-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 
         2 0 1 1 2.83-2.83l.06.06c.46.46 1.12.61 1.82.33.61-.26 1-.86 
         1-1.51V3a2 2 0 1 1 4 0v.09c0 .7.4 1.3 1 1.51.7.28 1.36.13 
         1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 
         1.82c.26.61.86 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.7 0-1.3.4-1.51 
         1z"
          />
        </svg>
      </button>
    </div>
  </header>

  <MockupViewer v-if="showMockupViewer" @close="closeMockupViewer" />

  <!-- 검색 사이드바 -->
  <SearchRequirementsSidebar v-if="showSidebar" @close="closeSidebar" />

  <!-- 파일 관리 사이드 바 (projectId 전달) -->
  <ManageFileSidebar
    v-if="showFileListSidebar"
    :projectId="props.projectId"
    @close="closeFileListSidebar"
    @fileSelected="handleFileSelected"
  />

  <!-- 소스 업로드 모달 -->
  <UploadSourceModal
    v-if="showSourceUploadModal"
    @close="closeSourceUploadModal"
    @createProject="handleUploadSource"
  />

  <!--  요구사항 정의서 다운로드 모달 -->
  <DownloadFileModal
    v-if="showDownloadFileModal"
    @close="closeDownloadFileModal"
    @createProject="handleDownloadSource"
  />

  <!-- 프로필 바 -->
  <ProfileBar
    :isVisible="showProfileSidebar"
    @close="closeProfileSidebar"
    @logout="handleLogout"
    @withdraw="handleWithdraw"
  />
</template>

<script setup>
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import SearchRequirementsSidebar from "./search_rd/SearchRequirementsSidebar.vue";
import ManageFileSidebar from "./files_rd/ManageFileSidebar.vue";
import UploadSourceModal from "./file_upload/UploadSourceModal.vue";
import DownloadFileModal from "./download_rd/DownloadFileModal.vue";
import ProfileBar from "../../main/ProfileBar.vue";
import MockupViewer from "./mockup/MockupViewer.vue";
import { useProjectStore } from "/src/stores/projectStore";

const emit = defineEmits(["fileSelected"]);

const projectStore = useProjectStore();

const router = useRouter();

const showSidebar = ref(false);
const showFileListSidebar = ref(false);
const showSourceUploadModal = ref(false);
const showDownloadFileModal = ref(false);
const showProfileSidebar = ref(false);
const showMockupViewer = ref(false); // 목업 뷰어 표시 상태

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const goToMain = () => {
  if (projectStore.projectId) {
    router.push(`/projects/${projectStore.projectId}`);
    console.log("다시 프로젝트");
  }
};

// 모든 사이드바 닫기 헬퍼 함수
const closeAllSidebars = () => {
  showSidebar.value = false;
  showFileListSidebar.value = false;
  showProfileSidebar.value = false; // 프로필 바도 포함
  showMockupViewer.value = false; // 목업 뷰어도 포함
};

// 프로필 사이드바 관련 메서드
const toggleProfileSidebar = () => {
  // 다른 사이드바가 열려있으면 닫기
  if (showSidebar.value) {
    showSidebar.value = false;
  }
  if (showFileListSidebar.value) {
    showFileListSidebar.value = false;
  }
  if (showMockupViewer.value) {
    showMockupViewer.value = false;
  }
  // 프로필 사이드바 토글
  showProfileSidebar.value = !showProfileSidebar.value;
};

const closeProfileSidebar = () => {
  showProfileSidebar.value = false;
};

// 목업 뷰어 관련 메서드
const toggleMockupViewer = () => {
  closeAllSidebars(); // 다른 모든 사이드바 닫기
  showMockupViewer.value = true;
};

const closeMockupViewer = () => {
  showMockupViewer.value = false;
};

const handleLogout = () => {
  console.log("로그아웃");
  closeProfileSidebar();
  // 로그아웃 로직 구현
  // 예: router.push({ name: "Login" });
};

const handleWithdraw = () => {
  console.log("탈퇴하기");
  closeProfileSidebar();
  // 탈퇴 로직 구현
};

// 검색 사이드바
const toggleSidebar = () => {
  // 다른 사이드바가 열려있으면 닫기
  if (showFileListSidebar.value) {
    showFileListSidebar.value = false;
  }
  if (showProfileSidebar.value) {
    showProfileSidebar.value = false;
  }
  if (showMockupViewer.value) {
    showMockupViewer.value = false;
  }
  // 검색 사이드바 토글
  showSidebar.value = !showSidebar.value;
};

const closeSidebar = () => {
  showSidebar.value = false;
};

// 파일 리스트 사이드 바
const toggleFileListSidebar = () => {
  // 다른 사이드바가 열려있으면 닫기
  if (showSidebar.value) {
    showSidebar.value = false;
  }
  if (showProfileSidebar.value) {
    showProfileSidebar.value = false;
  }
  if (showMockupViewer.value) {
    showMockupViewer.value = false;
  }
  // 파일 리스트 사이드바 토글
  showFileListSidebar.value = !showFileListSidebar.value;
};

// 파일 선택 처리 함수 추가
const handleFileSelected = (fileData) => {
  console.log("선택된 파일:", fileData);

  emit("fileSelected", fileData);

  if (fileData.type === "uploaded") {
    // 업로드한 파일 선택 시 docId 사용
    console.log("업로드한 파일 docId:", fileData.docId);
    // ProjectContent로 docId 전달하는 로직 추가
  } else if (fileData.type === "generated") {
    // 생성된 파일 선택 시 projectId와 revision 사용
    console.log(
      "생성된 파일 projectId:",
      fileData.projectId,
      "revision:",
      fileData.revision
    );
    // ProjectContent로 projectId와 revision 전달하는 로직 추가
  }
};

const closeFileListSidebar = () => {
  showFileListSidebar.value = false;
};

// 소스 업로드 모달
const openSourceUploadModal = () => {
  closeAllSidebars();
  showSourceUploadModal.value = true;
};
const closeSourceUploadModal = () => {
  showSourceUploadModal.value = false;
};

// 요구사항 정의서 다운로드 모달
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

const handleGoSettings = (projectId) => {
  console.log(`'${projectId}' 세팅`);
  router.push({ name: "ProjectSetting", params: { projectId: projectId } });
};
</script>

<style scoped>
.project-main {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
}

/* 헤더 스타일 */
.header {
  display: flex;
  align-items: center;
  justify-content: center; /* 중앙 정렬 */
  padding: 0 40px;
  height: 64px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  position: relative;
  z-index: 10;
  gap: 40px; /* 좌우 간격 */
  isolation: isolate;
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.header-left,
.header-right {
  flex: 0 0 auto; /* 고정 크기 */
  display: flex;
  align-items: center;
  gap: 16px;
  transform: none !important;
}

.header-center {
  flex: 1 1 auto; /* 공간 채움 */
  text-align: center;
  position: static; /* 절대 위치 제거 */
  transform: none;
  transform: none !important;
}

.logo-icon {
  width: auto;
  height: 45px;
  background: linear-gradient(135deg, #e53e3e 0%, #ff6b35 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.icon-button:hover {
  background: #f3f4f6;
  color: #374151;
}

/* 활성 상태 표시 (사이드바가 열려있을 때) */
.icon-button.active {
  background: #f3f4f6;
  color: #374151;
}

.project-title {
  font-size: 30px;
  font-weight: 700;
  color: #111827;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.download-button {
  background: #000000;
  color: white;
  border: none;
  padding: 8px 30px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-button:hover {
  background: #1f2937;
  transform: translateY(-1px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    justify-content: space-between; /* 좌우 분리 */
  }

  .header-left {
    order: 1;
  }

  .header-center {
    flex: none;
    order: 2;
    position: static;
    transform: none;
    text-align: center;
    margin: 0 auto;
  }

  .header-right {
    order: 3;
  }

  .project-title {
    font-size: 18px;
  }

  .download-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
  }

  .header-actions {
    gap: 4px;
  }

  .icon-button {
    width: 36px;
    height: 36px;
  }

  .download-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .project-title {
    font-size: 16px;
  }
}
</style>
