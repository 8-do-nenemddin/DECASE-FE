<template>
  <div class="app-container">
    <!-- 헤더 컴포넌트 -->
    <SettingsHeader :project-id="projectId" />

    <div class="main-layout">
      <!-- 사이드바 컴포넌트 - 고정 폭으로 유지 -->
      <SettingsSidebar
        :current-component="currentComponent"
        :is-admin="isAdmin"
        @change-component="handleChangeComponent"
      />

      <!-- 메인 콘텐츠 -->
      <main class="content-area">
        <!-- 프로젝트 정보 수정 -->
        <EditProjectInfo 
          v-if="currentComponent === 'ProjectInfo'" 
          :project-id="projectId"
        />

        <!-- 요구사항 추적 매트릭스 -->
        <ViewMatrix 
          v-if="currentComponent === 'ProjectMatrix'" 
          :project-id="projectId"
        />

        <!-- 권한 관리 - admin만 접근 가능 -->
        <ManageRight 
          v-if="currentComponent === 'ProjectRight' && isAdmin" 
          :project-id="projectId" 
        />

        <!-- 초대 현황 - admin만 접근 가능 -->
        <Invitation 
          v-if="currentComponent === 'Invitation' && isAdmin" 
          :project-id="projectId"
          @send-invitations="handleSendInvitations"
        />

        <!-- 권한 없음 메시지 -->
        <div 
          v-if="(currentComponent === 'ProjectRight' || currentComponent === 'Invitation') && !isAdmin" 
          class="no-permission-message"
        >
          <div class="permission-card">
            <div class="permission-icon">🔒</div>
            <h3 class="permission-title">접근 권한이 없습니다</h3>
            <p class="permission-description">
              이 기능은 관리자만 사용할 수 있습니다. 프로젝트 관리자에게 문의하세요.
            </p>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-message">
          <div class="loading-spinner"></div>
          <p>권한을 확인하는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-if="error" class="error-message">
          <div class="error-card">
            <div class="error-icon">⚠️</div>
            <h3 class="error-title">오류가 발생했습니다</h3>
            <p class="error-description">{{ error }}</p>
            <button @click="retryPermissionCheck" class="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import SettingsHeader from "./SettingsHeader.vue";
import SettingsSidebar from "./SettingsSidebar.vue";
import EditProjectInfo from "./edit_project/EditProjectInfo.vue";
import ViewMatrix from "./view_matrix/ViewMatrix.vue";
import ManageRight from "./manage_right/ManageRight.vue";
import Invitation from "./invitation/Invitation.vue";
import { useProjectStore } from "../../../stores/projectStore";

// 반응형 상태
const currentComponent = ref("ProjectInfo"); // 기본 컴포넌트
const isAdmin = ref(false); // 관리자 권한 상태
const isLoading = ref(true); // 로딩 상태
const error = ref(null); // 에러 상태

// 스토어에서 필요한 값들 가져오기
const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);
const userId = computed(() => projectStore.userId);

// API 기본 URL
const API_BASE_URL = 'http://localhost:8080';

// 사용자 권한 확인 함수
const checkUserPermission = async () => {
  if (!projectId.value || !userId.value) {
    error.value = "프로젝트 ID 또는 사용자 ID가 없습니다.";
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/${projectId.value}/members/${userId.value}/permission`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 필요시 인증 헤더 추가
          // 'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`권한 확인 실패: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    isAdmin.value = Boolean(data.isAdmin);
    console.log(isAdmin.value)
  } catch (err) {
    console.error('Error checking user permission:', err);
    error.value = err.message || '권한 확인 중 오류가 발생했습니다.';
    isAdmin.value = false;
  } finally {
    isLoading.value = false;
  }
};

// 권한 확인 재시도 함수
const retryPermissionCheck = () => {
  checkUserPermission();
};

// 초대 발송 핸들러
const handleSendInvitations = async (invitationList) => {
  // admin 권한 재확인
  if (!isAdmin.value) {
    alert('초대 권한이 없습니다.');
    return;
  }

  if (!Array.isArray(invitationList) || invitationList.length === 0) {
    alert('초대할 사용자를 선택해주세요.');
    return;
  }

  const mappedList = invitationList.map(item => ({
    email: item.email,
    permission: item.permission === "Read" ? "READ" : "READ_AND_WRITE",
    projectId: projectId.value
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 필요시 인증 헤더 추가
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        projectId: projectId.value,
        invitations: mappedList
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `초대 발송 실패: ${response.status}`);
    }

    const result = await response.json();
    alert(`${result.successCount || mappedList.length}명의 사용자에게 초대를 발송했습니다.`);
    
    // 초대 현황 새로고침 (필요시 이벤트 발생)
    // EventBus.$emit('invitation-sent');
    
  } catch (err) {
    console.error('Error sending invitations:', err);
    alert(err.message || '초대 발송 중 오류가 발생했습니다.');
  }
};

// 컴포넌트 마운트 시 권한 확인
onMounted(() => {
  checkUserPermission();
});
</script>

<style scoped>
/* 기존 스타일 유지 */
* {
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}

.main-layout {
  display: flex;
  flex: 1;
  height: calc(100vh - 4rem);
  min-height: 0;
  position: relative;
  margin: 0;
  padding: 0;
}

.main-layout > :first-child {
  flex-shrink: 0;
  width: 280px;
  min-width: 280px;
  min-height: calc(100vh - 4rem);
  height: auto;
  position: sticky;
  top: 0;
  align-self: stretch;
  transition: width 0.3s ease;
  overflow-y: auto;
  background: white;
  border-right: 1px solid #e5e7eb;
  margin: 0;
  padding: 0;
}

.content-area {
  flex: 1;
  min-width: 0;
  padding: 2rem;
  overflow-y: auto;
  background: transparent;
}

/* 권한 없음 메시지 스타일 */
.no-permission-message,
.loading-message,
.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.permission-card,
.error-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
}

.permission-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.permission-title,
.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.permission-description,
.error-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

/* 로딩 스타일 */
.loading-message {
  flex-direction: column;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 버튼 스타일 */
.retry-button {
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

.retry-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
}

.retry-button:active {
  transform: translateY(0);
}

.retry-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .content-area {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .content-area {
    padding: 1rem;
  }

  .permission-card,
  .error-card {
    padding: 2rem 1.5rem;
  }

  .permission-title,
  .error-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .content-area {
    padding: 0.75rem;
  }

  .permission-card,
  .error-card {
    padding: 1.5rem 1rem;
  }

  .permission-title,
  .error-title {
    font-size: 1.125rem;
  }

  .permission-description,
  .error-description {
    font-size: 0.8125rem;
  }

  .retry-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 320px) {
  .content-area {
    padding: 0.5rem;
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

.permission-card,
.error-card {
  animation: fadeIn 0.6s ease-out;
}
</style>