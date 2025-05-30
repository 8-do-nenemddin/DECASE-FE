<template>
  <div class="app-container">
    <!-- 헤더 컴포넌트 -->
    <SettingsHeader :project-title="'Project 1'" />

    <div class="main-layout">
      <!-- 사이드바 컴포넌트 -->
      <SettingsSidebar
        :current-component="currentComponent"
        @change-component="handleChangeComponent"
      />

      <!-- 메인 콘텐츠 -->
      <main class="content-area">
        <!-- 프로젝트 정보 수정 -->
        <EditProjectInfo v-if="currentComponent === 'ProjectInfo'" />

        <!-- 요구사항 추적 매트릭스 -->
        <ViewMatrix v-if="currentComponent === 'ProjectMatrix'" />

        <!-- 권한 관리 -->
        <ManageRight v-if="currentComponent === 'ProjectRight'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SettingsHeader from "./SettingsHeader.vue";
import SettingsSidebar from "./SettingsSidebar.vue";
import EditProjectInfo from "./EditProjectInfo.vue";
import ViewMatrix from "./ViewMatrix.vue";
import ManageRight from "./ManageRight.vue";

const currentComponent = ref("ProjectInfo"); // 기본 컴포넌트

const handleChangeComponent = (componentName) => {
  currentComponent.value = componentName;
};

const addRequirement = () => {
  console.log("요구사항 추가 클릭");
  // 요구사항 추가 로직 구현
};
</script>

<style>
/* 글로벌 스타일 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Inter", "Pretendard", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
  background-color: #f8fafc;
  color: #1f2937;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.main-layout {
  display: flex;
  flex: 1;
  height: calc(100vh - 4rem);
}

.content-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: transparent;
}

/* 요구사항 매트릭스 스타일 */
.requirement-matrix {
  max-width: 800px;
  margin: 0 auto;
}

.matrix-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
  transition: all 0.3s ease;
}

.matrix-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 2rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.header-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #fef3c7, #fbbf24);
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content {
  flex: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.card-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.empty-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.add-requirement-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.add-requirement-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
}

.add-requirement-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 1rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
    height: auto;
  }

  .content-area {
    padding: 1rem;
  }

  .card-header {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .header-icon {
    font-size: 1.75rem;
    padding: 0.5rem;
    align-self: center;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .add-requirement-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .content-area {
    padding: 0.75rem;
  }

  .card-header {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .card-description {
    font-size: 0.8125rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-title {
    font-size: 1.125rem;
  }

  .empty-description {
    font-size: 0.8125rem;
  }

  .add-requirement-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.8125rem;
  }
}

/* 스크롤바 스타일링 */
.content-area::-webkit-scrollbar {
  width: 8px;
}

.content-area::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.content-area::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

/* 포커스 접근성 개선 */
.add-requirement-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 로딩 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.matrix-card,
.permission-card {
  animation: fadeIn 0.6s ease-out;
}
</style>
