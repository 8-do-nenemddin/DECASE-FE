<template>
  <!-- 헤더 -->
  <header class="header">
    <div class="header-left" @click="handleGoHome">
      <img src="/DECASE-light.png" alt="DECASE Logo" class="logo-icon" />
    </div>

    <div class="header-center">
      <h1 class="project-title">Project 1</h1>
    </div>

    <div class="header-right">
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
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

defineProps({
  projectTitle: {
    type: String,
    default: "Project 1",
  },
});

const handleGoHome = (projectId) => {
  console.log(`'${projectId}' 홈으로`);
  router.push({ name: "ProjectHome", params: { projectId: projectId } });
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
