<template>
  <div class="app-container">
    <!-- 헤더 컴포넌트 -->
    <SettingsHeader :project-id="projectId" />

    <div class="main-layout">
      <!-- 사이드바 컴포넌트 -->
      <SettingsSidebar
          :current-component="currentComponent"
          @change-component="handleChangeComponent"
      />

      <!-- 메인 콘텐츠 -->
      <main class="content-area">
        <div class="content-wrapper">
          <!-- 프로젝트 정보 수정 -->
          <EditProjectInfo v-if="currentComponent === 'ProjectInfo'" />

          <!-- 요구사항 추적 매트릭스 -->
          <ViewMatrix v-if="currentComponent === 'ProjectMatrix'" />

          <!-- 권한 관리 -->
          <ManageRight :project-id="projectId" v-if="currentComponent === 'ProjectRight'" />

          <!-- 초대 현황 -->
          <Invitation :project-id="projectId" v-if="currentComponent === 'Invitation'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SettingsHeader from "./SettingsHeader.vue";
import SettingsSidebar from "./SettingsSidebar.vue";
import EditProjectInfo from "./edit_project/EditProjectInfo.vue";
import ViewMatrix from "./view_matrix/ViewMatrix.vue";
import ManageRight from "./manage_right/ManageRight.vue";
import Invitation from "./invitation/Invitation.vue";

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
});

console.log(props.projectId)

const currentComponent = ref("ProjectInfo"); // 기본 컴포넌트

const handleChangeComponent = (componentName) => {
  currentComponent.value = componentName;
};

const handleSendInvitations = async (invitationList) => {
  const mappedList = invitationList.map(item => ({
    email: item.email,
    permission: item.permission === "Read" ? "READ" : "READ_AND_WRITE"
  }));

  try {
    const response = await fetch('/api/send-invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mappedList)
    });
    if (!response.ok) {
      throw new Error('Failed to send invitations');
    }
    // handle success
  } catch (error) {
    console.error(error);
    // handle error
  }
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
  display: flex !important;
  flex: 1;
  height: calc(100vh - 4rem);
  gap: 0 !important; /* 사이드바와 메인 콘텐츠 사이 간격 제거 */
}

/* 사이드바 강제 고정 */
.main-layout > *:first-child {
  flex: 0 0 280px !important;
  width: 280px !important;
  min-width: 280px !important;
  max-width: 280px !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
  margin-right: 0 !important; /* 우측 마진 제거 */
}

/* 메인 콘텐츠 */
.content-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  overflow-y: auto;
  background: transparent;
  min-width: 0;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.content-wrapper > * {
  width: 100%;
  max-width: 800px;
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

  .main-layout > *:first-child {
    flex: none !important;
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }

  .content-area {
    padding: 1rem;
  }

  .content-wrapper {
    max-width: none;
  }

  .content-wrapper > * {
    max-width: none;
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

/* 대형 화면에서도 콘텐츠 너비 제한 */
@media (min-width: 1441px) {
  .content-wrapper {
    max-width: 1200px;
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