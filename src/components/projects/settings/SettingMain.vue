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
        <div class="content-wrapper" :class="{ 'matrix-layout': currentComponent === 'ProjectMatrix' }">
          <!-- 컴포넌트 전환 애니메이션 적용 -->
          <Transition name="slide-up" mode="out-in">
            <div :key="currentComponent">
              <!-- 프로젝트 정보 수정 -->
              <EditProjectInfo v-if="currentComponent === 'ProjectInfo'" />

              <!-- 요구사항 수정 승인 -->
              <RequirementApprove v-if="currentComponent === 'RequirementApprove'" />

              <!-- 요구사항 추적 매트릭스 -->
              <ViewMatrix v-if="currentComponent === 'ProjectMatrix'" />

              <!-- 권한 관리 -->
              <ManageRight :project-id="projectId" v-if="currentComponent === 'ProjectRight'" />

              <!-- 초대 현황 -->
              <Invitation :project-id="projectId" v-if="currentComponent === 'Invitation'" />
            </div>
          </Transition>
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
import RequirementApprove from "./requirement_approve/RequirementApprove.vue";

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

</script>

<style>
/* 글로벌 스타일 */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: "Inter", "Pretendard", -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, sans-serif;
  background-color: #f8fafc;
  color: #1f2937;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  width: 80%;
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 0;
  position: relative;
}

.main-layout {
  display: flex !important;
  flex: 1;
  width: 100%; /* 너비 조정 */
  height: calc(100vh - 4rem);
  gap: 0 !important;
  margin: 0 auto; /* 가운데 정렬을 위해 추가 */
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
  justify-content: center; /* 왼쪽 정렬로 변경 */ 
  overflow-y: auto;
  background: transparent;
  padding: 0; /* 패딩 제거 */
}

.content-wrapper {
  width: 100%;
  max-width: none; /* 최대 너비 제한 제거 */
  display: flex;
  justify-content: flex-start; /* 왼쪽 정렬로 변경 */
  position: relative;
  margin: 0; /* 마진 제거 */
}

.content-wrapper > * {
  width: 100%; /* 너비를 100%로 변경 */
  max-width: none; /* 최대 너비 제한 제거 */
}

/* ViewMatrix 컴포넌트만 왼쪽 정렬 */
.content-wrapper.matrix-layout {
  justify-content: flex-start !important;
  align-items: flex-start;
  padding: 1rem 2rem; /* 좌우 패딩 추가 */
}

.content-wrapper.matrix-layout > * {
  width: 100% !important;
  max-width: calc(100vw - 320px) !important; /* 사이드바 너비 고려한 최대 너비 */
  margin-left: 0 !important;
  align-self: flex-start;
  overflow-x: auto; /* 가로 스크롤 허용 */
}

/* Vue Transition 애니메이션 정의 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 요구사항 매트릭스 스타일 */
.requirement-matrix {
  margin: 0; /* 왼쪽 정렬을 위해 margin을 0으로 변경 */
  width: 100%;
  max-width: 1400px; /* 매트릭스 최대 너비 제한 */
}

.matrix-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 매트릭스 테이블 컨테이너 스타일 */
.matrix-table-container {
  overflow-x: auto;
  overflow-y: visible;
  max-width: 100%;
}

/* 매트릭스 테이블 스타일 */
.matrix-table {
  width: 100%;
  min-width: 800px; /* 최소 너비 설정으로 요소 겹침 방지 */
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed; /* 고정 테이블 레이아웃으로 셀 너비 균등 분배 */
}

.matrix-table th,
.matrix-table td {
  padding: 0.75rem 0.5rem;
  text-align: center;
  border: 1px solid #e5e7eb;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 120px; /* 최소 셀 너비로 겹침 방지 */
  max-width: 200px; /* 최대 셀 너비로 과도한 확장 방지 */
}

.matrix-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.matrix-table td {
  background-color: #ffffff;
  font-size: 0.8125rem;
}

/* 첫 번째 열 (요구사항명) 스타일 */
.matrix-table th:first-child,
.matrix-table td:first-child {
  text-align: left;
  min-width: 200px;
  max-width: 300px;
  font-weight: 500;
}

/* 체크박스나 상태 표시 셀 */
.matrix-table .status-cell {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
}

/* 매트릭스 테이블 호버 효과 */
.matrix-table tbody tr:hover {
  background-color: #f8fafc;
}

.matrix-table tbody tr:hover td {
  background-color: #f8fafc;
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

  .content-wrapper.matrix-layout > * {
    width: 100% !important;
    max-width: calc(100vw - 2rem) !important; /* 모바일에서 패딩 고려 */
  }

  /* 매트릭스 테이블 모바일 최적화 */
  .matrix-table {
    min-width: 600px; /* 모바일에서 최소 너비 줄임 */
    font-size: 0.75rem;
  }

  .matrix-table th,
  .matrix-table td {
    padding: 0.5rem 0.25rem;
    min-width: 80px;
    max-width: 150px;
  }

  .matrix-table th:first-child,
  .matrix-table td:first-child {
    min-width: 150px;
    max-width: 200px;
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

  /* 모바일에서 애니메이션 속도 조정 */
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
  
  /* ViewMatrix는 적절한 너비 제한 */
  .content-wrapper.matrix-layout {
    max-width: 1500px !important; /* 매트릭스에 적합한 너비 */
  }

  .requirement-matrix {
    max-width: 1400px;
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

/* 메인 애니메이션: 스르르 올라오는 효과 - 이제 사용되지 않음 */
@keyframes slideUpFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 기존 애니메이션 유지 (필요시) */
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
</style>