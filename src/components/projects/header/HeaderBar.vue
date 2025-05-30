<template>
  <!-- 헤더 -->
  <header class="header">
    <div class="header-left">
      <img src="/DECASE-light.png" alt="DECASE Logo" class="logo-icon" />
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
          title="내보내기"
        >
          <svg
            width="20"
            height="20"
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

    <div class="header-center">
      <h1 class="project-title">Project 1</h1>
    </div>

    <div class="header-right">
      <button class="download-button">다운로드</button>
      <button class="icon-button" title="사용자">
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
      <button class="icon-button" @click="handleGoSettings" title="설정">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path
            d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM7 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
          ></path>
        </svg>
      </button>
    </div>
  </header>

  <!-- 검색 사이드바 -->
  <SearchRequirementsSidebar v-if="showSidebar" @close="closeSidebar" />

  <!-- 파일 관리 사이드 바 -->
  <ManageFileSidebar v-if="showFileListSidebar" @close="closeFileListSidebar" />

  <!-- 소스 업로드 모달 -->
  <UploadSourceModal
    v-if="showSourceUploadModal"
    @close="closeSourceUploadModal"
    @createProject="handleUploadSource"
  />
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SearchRequirementsSidebar from "./SearchRequirementsSidebar.vue";
import ManageFileSidebar from "./ManageFileSidebar.vue";
import UploadSourceModal from "./UploadSourceModal.vue";

const router = useRouter();

const showSidebar = ref(false);
const showFileListSidebar = ref(false);
const showSourceUploadModal = ref(false);

// 검색 사이드바
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const closeSidebar = () => {
  showSidebar.value = false;
};

// 파일 리스트 사이드 바
const toggleFileListSidebar = () => {
  showFileListSidebar.value = !showFileListSidebar.value;
};

const closeFileListSidebar = () => {
  showFileListSidebar.value = false;
};

// 소스 업로드 모달
const openSourceUploadModal = () => {
  showSourceUploadModal.value = true;
};
const closeSourceUploadModal = () => {
  showSourceUploadModal.value = false;
};

const handleUploadSource = (newSourceName) => {
  console.log(`요구사항 정의서 생성 중...`);
  closeModal();
  // router.push({ name: "", params: { sourceName: newSourceName } });
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
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  top: 0rem;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  width: 75px;
  height: 55px;
  background: linear-gradient(135deg, #e53e3e 0%, #ff6b35 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
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

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.project-title {
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  margin: 0;
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

/* 메인 컨텐츠 */
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(80vh);
  padding: 40px;
  text-align: center;
}

.welcome-title {
  font-size: 35px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 20px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .header-center {
    position: static;
    transform: none;
    order: 2;
    flex: 1;
    text-align: center;
  }

  .header-left {
    order: 1;
  }

  .header-right {
    order: 3;
  }

  .project-title {
    font-size: 18px;
  }

  .welcome-title {
    font-size: 36px;
  }

  .welcome-subtitle {
    font-size: 18px;
  }

  .main-content {
    padding: 24px;
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

  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }
}
</style>
