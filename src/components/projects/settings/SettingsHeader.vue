<template>
  <!-- 헤더 -->
  <header class="header">
    <div class="header-left">
      <div class="back-button-container">
        <button class="back-button" @click="goToMain" title="돌아가기">
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
            <path d="M19 12H5M12 19L5 12L12 5" />
          </svg>
        </button>
      </div>
    </div>

    <div class="header-center">
      <div class="project-title-container" @click="goToMain">
        <h1 class="project-title">{{ projectName }}</h1>
        <div class="project-status">{{ status }} PROJECT</div>
      </div>
    </div>

    <div class="header-right">
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
      </div>
    </div>
  </header>

  <!-- 프로필 바 -->
  <ProfileBar
    :isVisible="showProfileSidebar"
    @close="closeProfileSidebar"
    @logout="handleLogout"
    @withdraw="handleWithdraw"
  />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { computed } from "vue";
import { useRouter } from "vue-router";
import ProfileBar from "../../main/ProfileBar.vue";
import { useProjectStore } from "/src/stores/projectStore";

const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);
const projectName = computed(() => projectStore.projectName);
const status = computed(() => projectStore.status);

const router = useRouter();
const showSidebar = ref(false);
const showProfileSidebar = ref(false);

const goToMain = () => {
  if (projectId) {
    router.push(`/projects/${projectId.value}`);
  }
};

// 프로필 사이드바 관련 메서드
const toggleProfileSidebar = () => {
  // 다른 사이드바가 열려있으면 닫기
  if (showSidebar.value) {
    showSidebar.value = false;
  }
  // 프로필 사이드바 토글
  showProfileSidebar.value = !showProfileSidebar.value;
};

const closeProfileSidebar = () => {
  showProfileSidebar.value = false;
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

const handleGoMain = () => {
  router.push({ name: "MainView" });
};
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

/* 뒤로가기 버튼 스타일 */
.back-button-container {
  display: flex;
  align-items: center;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 4px;
  backdrop-filter: blur(8px);
}

.back-button {
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

.back-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.back-button:hover {
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.back-button:hover::before {
  opacity: 1;
}

.back-button:active {
  transform: translateY(0);
}

/* 아이콘 버튼 스타일 */
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

.profile-btn:hover {
  color: #f59e0b;
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

  .back-button-container {
    padding: 2px;
    gap: 2px;
  }

  .action-buttons {
    padding: 2px;
    gap: 2px;
  }

  .icon-button,
  .back-button {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
    height: 60px;
  }

  .project-title {
    font-size: 18px;
  }

  .back-button-container {
    gap: 1px;
  }

  .action-buttons {
    gap: 1px;
  }

  .icon-button,
  .back-button {
    width: 32px;
    height: 32px;
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

  .icon-button,
  .back-button {
    color: #94a3b8;
  }

  .back-button-container,
  .action-buttons {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(148, 163, 184, 0.2);
  }
}

/* 스크롤 시 헤더 효과 */
.header.scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
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