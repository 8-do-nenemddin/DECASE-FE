<template>
  <!-- 프로필 사이드바 -->
  <Transition name="overlay" appear>
    <div v-if="isVisible" class="profile-sidebar-overlay" @click="handleClose">
      <Transition name="slide" appear>
        <div v-if="isVisible" class="profile-sidebar" @click.stop>
          <div class="sidebar-content">
            <!-- 닫기 버튼 -->
            <button class="close-button" @click="handleClose">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div class="profile-info">
              <div class="sidebar-profile-icon">
                <span>프로필</span>
              </div>
              <div class="profile-name">{{ profileData.name }}</div>
              <div class="profile-company">{{ profileData.companyName }}</div>
              <div class="profile-role">{{ profileData.departmentName }}</div>
            </div>

            <div class="sidebar-divider"></div>

            <button class="logout-button" @click="showLogoutModal">
              로그아웃
            </button>
            <div class="sidebar-footer">
              <button class="withdraw-button" @click="showWithdrawModal">
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- 로그아웃 확인 모달 -->
  <Transition name="modal-overlay">
    <div
      v-if="isLogoutModalVisible"
      class="modal-overlay"
      @click="closeLogoutModal"
    >
      <Transition name="modal-content">
        <div v-if="isLogoutModalVisible" class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>로그아웃</h3>
          </div>
          <div class="modal-body">
            <p>정말 로그아웃 하시겠습니까?</p>
          </div>
          <div class="modal-footer">
            <button class="modal-confirm-btn" @click="confirmLogout">
              확인
            </button>
            <button class="modal-cancel-btn" @click="closeLogoutModal">
              취소
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- 탈퇴 확인 모달 -->
  <Transition name="modal-overlay">
    <div
      v-if="isWithdrawModalVisible"
      class="modal-overlay"
      @click="closeWithdrawModal"
    >
      <Transition name="modal-content">
        <div v-if="isWithdrawModalVisible" class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>회원 탈퇴</h3>
          </div>
          <div class="modal-body">
            <p>정말 탈퇴하시겠습니까?</p>
            <p class="warning-text">
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
          </div>
          <div class="modal-footer">
            <button class="modal-withdraw-btn" @click="confirmWithdraw">
              탈퇴
            </button>
            <button class="modal-cancel-btn" @click="closeWithdrawModal">
              취소
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from "vue";

  // Props 정의
  const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  profileData: {
    type: Object,
    default: () => ({})  // 기본값으로 빈 객체
  }
});

// Emits 정의
const emit = defineEmits(["close", "logout", "withdraw", "goHome"]);

// 프로필 데이터 상태
const profileData = ref({});
const memberId = 1; // 하드코딩된 memberId, 추후에는 동적으로 처리 필요

const fetchProfile = async () => {
  try {
    const response = await fetch(`/api/v1/members/${memberId}`);
    const result = await response.json();

    if (result.status === 200) {
      profileData.value = result.data;
    } else {
      throw new Error(result.message || "프로필을 가져오는 데 실패했습니다.");
    }
  } catch (error) {
    console.error("프로필 호출 오류:", error);
  }
};

onMounted(() => {
  fetchProfile();
});

// 모달 상태 관리
const isLogoutModalVisible = ref(false);
const isWithdrawModalVisible = ref(false);

// 이벤트 핸들러
const handleClose = () => {
  emit("close");
};

// 로그아웃 모달 관련
const showLogoutModal = () => {
  isLogoutModalVisible.value = true;
};

const closeLogoutModal = () => {
  isLogoutModalVisible.value = false;
};

const confirmLogout = () => {
  console.log("로그아웃 확인");
  emit("logout");
  emit("goHome"); // 홈으로 이동
  emit("close");
  closeLogoutModal();
};

// 탈퇴 모달 관련
const showWithdrawModal = () => {
  isWithdrawModalVisible.value = true;
};

const closeWithdrawModal = () => {
  isWithdrawModalVisible.value = false;
};

const confirmWithdraw = () => {
  console.log("탈퇴 확인");
  emit("withdraw");
  emit("goHome"); // 홈으로 이동
  emit("close");
  closeWithdrawModal();
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif;
}

/* Vue Transition 애니메이션 - 오버레이 */
.overlay-enter-active {
  transition: opacity 0.3s ease-out;
}

.overlay-leave-active {
  transition: opacity 0.3s ease-in;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Vue Transition 애니메이션 - 슬라이드 */
.slide-enter-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-leave-active {
  transition: transform 0.3s ease-in;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 모달 애니메이션 */
.modal-overlay-enter-active {
  transition: opacity 0.3s ease-out;
}

.modal-overlay-leave-active {
  transition: opacity 0.3s ease-in;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.3s ease-out;
}

.modal-content-leave-active {
  transition: all 0.3s ease-in;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

/* 프로필 사이드바 오버레이 */
.profile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

/* 프로필 사이드바 */
.profile-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 10000;
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 35px;
  position: relative;
}

/* 닫기 버튼 */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  transition: all 0.2s ease;
  z-index: 1;
}

.close-button:hover {
  background: #f7fafc;
  color: #2d3748;
  transform: scale(1.05);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.sidebar-profile-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #718096;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.profile-company {
  font-size: 17px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.profile-role {
  font-size: 15px;
  color: #718096;
  margin: 0;
}

.sidebar-divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
  margin: 25px 0;
}

.profile-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-bottom: 35px;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logout-button {
  width: 100%;
  padding: 16px;
  background: white;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: #f7fafc;
  border-color: #4a5568;
}

.withdraw-button {
  width: 100%;
  background: white;
  color: #e53e3e;
  border: 1px solid #e53e3e;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.withdraw-button:hover {
  background: #e53e3e;
  color: white;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 8px;
  font-size: 15px;
  color: #2d3748;
  line-height: 1.5;
}

.warning-text {
  color: #e53e3e !important;
  font-size: 13px !important;
  margin-top: 8px !important;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-cancel-btn,
.modal-confirm-btn,
.modal-withdraw-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.modal-cancel-btn {
  background: white;
  color: #4a5568;
  border-color: #e2e8f0;
}

.modal-cancel-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.modal-confirm-btn {
  background: #3182ce;
  color: white;
  border-color: #3182ce;
}

.modal-confirm-btn:hover {
  background: #2c5282;
  border-color: #2c5282;
}

.modal-withdraw-btn {
  background: #e53e3e;
  color: white;
  border-color: #e53e3e;
}

.modal-withdraw-btn:hover {
  background: #c53030;
  border-color: #c53030;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .profile-sidebar {
    width: 100vw;
  }

  .modal-content {
    width: 95%;
    max-width: 350px;
  }
}
</style>
