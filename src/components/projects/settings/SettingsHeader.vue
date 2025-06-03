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
    </div>

    <div class="header-center">
      <h1 class="project-title" @click="goToMain">{{ decodedProjectName }}</h1>
    </div>
    <div class="header-right">
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
import { ref } from "vue";
import { computed } from 'vue';
import { useRouter } from "vue-router";
import ProfileBar from "../../main/ProfileBar.vue";

const router = useRouter();
const showSidebar = ref(false);
const showProfileSidebar = ref(false);

const props = defineProps({
  projectName: {
    type: String,
    required: true
  }
});

const decodedProjectName = computed(() => decodeURIComponent(props.projectName));

const goToMain = () => {
  if (props.projectName) {
    router.push(`/projects/${props.projectName}`);
  }
}

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