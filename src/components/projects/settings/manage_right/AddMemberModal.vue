<template>
  <!-- 멤버 초대 모달 -->
  <div v-if="isVisible" class="invite-modal-overlay" @click="closeModal">
    <div class="invite-modal" @click.stop>
      <div class="invite-modal-header">
        <h3 class="invite-modal-title">초대</h3>
        <button @click="closeModal" class="invite-modal-close">✕</button>
      </div>

      <div class="invite-modal-body">
        <!-- 이메일 입력 섹션 -->
        <div class="invite-email-section">
          <!-- 검색/추가 입력창 -->
          <div class="invite-search-input-container">
            <input
              v-model="searchEmail"
              type="email"
              class="invite-search-input"
              placeholder="초대할 사람의 이메일 입력"
              @keyup.enter="addEmailToList"
              @input="handleEmailInput"
            />
            <div class="invite-permission-toggle-container">
              <!-- 권한 토글 버튼들 -->
              <div class="invite-permission-toggle">
                <button
                  @click="selectPermission('Read')"
                  class="invite-permission-toggle-btn"
                  :class="{ 
                    'invite-active': selectedPermission === 'Read',
                    'invite-active-read': selectedPermission === 'Read'
                  }"
                  :disabled="!isValidEmail(searchEmail)"
                >
                  Read
                </button>
                <button
                  @click="selectPermission('Read/Write')"
                  class="invite-permission-toggle-btn"
                  :class="{ 
                    'invite-active': selectedPermission === 'Read/Write',
                    'invite-active-write': selectedPermission === 'Read/Write'
                  }"
                  :disabled="!isValidEmail(searchEmail)"
                >
                  Read/Write
                </button>
              </div>
              <button
                @click="addEmailToList"
                class="invite-add-email-btn"
                :disabled="!isValidEmail(searchEmail)"
              >
                추가
              </button>
            </div>
          </div>

          <!-- 추가된 이메일 목록 -->
          <div class="invite-email-list">
            <div
              v-for="(emailItem, index) in emailList"
              :key="index"
              class="invite-email-item"
            >
              <div class="invite-email-info">
                <span class="invite-email-text">{{ emailItem.email }}</span>
                <span
                  class="invite-email-permission"
                  :class="getPermissionClass(emailItem.permission)"
                >
                  {{ emailItem.displayPermission }}
                </span>
              </div>
              <button @click="removeEmail(index)" class="invite-remove-email-btn">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="invite-error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="invite-modal-footer">
        <button
          @click="sendInvitations"
          :disabled="emailList.length === 0"
          class="invite-btn-send"
          :class="{ 'invite-disabled': emailList.length === 0 }"
        >
          전송
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useProjectStore } from "/src/stores/projectStore";

const projectStore = useProjectStore();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "send-invitations"]);

const searchEmail = ref("");
const emailList = ref([]);
const selectedPermission = ref("Read");
const errorMessage = ref("");

// 권한에 따른 CSS 클래스 반환
const getPermissionClass = (permission) => {
  if (permission === 'READ') {
    return 'invite-permission-read';
  } else if (permission === 'READ_AND_WRITE') {
    return 'invite-permission-read-write';
  }
  return '';
};

// 이메일 유효성 검증
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email.trim());
};

// 이메일 입력 처리
const handleEmailInput = () => {
  if (errorMessage.value) {
    errorMessage.value = "";
  }
};

// 권한 선택
const selectPermission = (permission) => {
  if (!isValidEmail(searchEmail.value)) {
    errorMessage.value = "올바른 이메일 형식을 입력해주세요.";
    return;
  }
  selectedPermission.value = permission;
};

// 이메일을 목록에 추가
const addEmailToList = () => {
  const email = searchEmail.value.trim();

  if (!isValidEmail(email)) {
    errorMessage.value = "올바른 이메일 형식을 입력해주세요.";
    return;
  }

  if (emailList.value.find((item) => item.email === email)) {
    errorMessage.value = "이미 추가된 이메일입니다.";
    return;
  }

  // Map display label to API enum value
  const apiValue = selectedPermission.value === "Read" ? "READ" : "READ_AND_WRITE";

  emailList.value.push({
    email: email,
    permission: apiValue,
    displayPermission: selectedPermission.value,
  });

  searchEmail.value = "";
  errorMessage.value = "";
};

// 이메일 목록에서 제거
const removeEmail = (index) => {
  emailList.value.splice(index, 1);
};

// 초대 전송
const sendInvitations = () => {
  if (emailList.value.length === 0) {
    errorMessage.value = "초대할 이메일을 추가해주세요.";
    return;
  }

  const invitationData = {
    invitations: emailList.value,
  };

  console.log("초대 전송:", invitationData);

  const adminId = projectStore.userId;
  const formattedList = emailList.value.map(({ email, permission }) => ({
    adminId,
    email,
    permission
  }));
  emit("send-invitations", formattedList);
};

// 성공 모달 닫기 처리
const handleSuccessClose = () => {
  console.log("성공 모달 닫기");
  showSuccessModal.value = false;
  closeModal(); // 전체 모달 닫기
};

// 모달 닫기
const closeModal = () => {
  resetForm();
  emit("close");
};

// 폼 리셋
const resetForm = () => {
  searchEmail.value = "";
  emailList.value = [];
  selectedPermission.value = "Read";
  errorMessage.value = "";
};

// 모달이 열릴 때 폼 리셋
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      resetForm();
    }
  }
);
</script>

<style scoped>
/* 모달 스타일 */
.invite-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
  animation: inviteFadeIn 0.3s ease-out;
}

@keyframes inviteFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.invite-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  animation: inviteModalSlideIn 0.3s ease-out;
}

@keyframes inviteModalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.invite-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.invite-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.invite-modal-close {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.invite-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.invite-email-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.invite-search-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invite-search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.invite-search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.invite-search-input:hover {
  border-color: #d1d5db;
}

.invite-permission-toggle-container {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.invite-permission-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 4px;
  flex: 1;
}

.invite-permission-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.invite-permission-toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.invite-permission-toggle-btn.invite-active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* Read 버튼 활성화 스타일 */
.invite-permission-toggle-btn.invite-active-read {
  background: #dbeafe !important;
  color: #1e40af !important;
}

/* Read/Write 버튼 활성화 스타일 */
.invite-permission-toggle-btn.invite-active-write {
  background: #dcfce7 !important;
  color: #166534 !important;
}

.invite-permission-toggle-btn:hover:not(:disabled):not(.invite-active) {
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
}

.invite-add-email-btn {
  padding: 0.75rem 1.5rem;
  background: #1f2937;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.invite-add-email-btn:hover:not(:disabled) {
  background: #374151;
  transform: translateY(-1px);
}

.invite-add-email-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.invite-email-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.invite-email-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.invite-email-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.invite-email-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.invite-email-text {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
  word-break: break-all;
}

.invite-email-permission {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  white-space: nowrap;
}

.invite-permission-read {
  background: #dbeafe !important;
  color: #1e40af !important;
}

.invite-permission-read-write {
  background: #dcfce7 !important;
  color: #166534 !important;
}

.invite-remove-email-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.invite-remove-email-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.invite-error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid #fecaca;
}

.invite-modal-footer {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.invite-btn-send {
  padding: 0.875rem 3rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: #1f2937;
  color: white;
  min-width: 120px;
}

.invite-btn-send:hover:not(.invite-disabled) {
  background: #374151;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.15);
}

.invite-btn-send.invite-disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 스크롤바 스타일링 */
.invite-email-list::-webkit-scrollbar {
  width: 6px;
}

.invite-email-list::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.invite-email-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.invite-email-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .invite-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .invite-modal-header {
    padding: 1.25rem;
  }

  .invite-modal-body {
    padding: 1.25rem;
  }

  .invite-modal-footer {
    padding: 1.25rem;
  }

  .invite-permission-toggle-container {
    flex-direction: column;
    align-items: stretch;
  }

  .invite-add-email-btn {
    width: 100%;
  }

  .invite-email-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .invite-btn-send {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .invite-modal {
    margin: 0.75rem;
    width: calc(100% - 1.5rem);
  }

  .invite-modal-header {
    padding: 1rem;
  }

  .invite-modal-body {
    padding: 1rem;
  }

  .invite-modal-footer {
    padding: 1rem;
  }

  .invite-modal-title {
    font-size: 1.125rem;
  }

  .invite-email-item {
    padding: 0.5rem 0.75rem;
  }

  .invite-email-text {
    font-size: 0.8125rem;
  }

  .invite-permission-toggle-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}

/* 접근성 개선 */
.invite-btn-send:focus-visible,
.invite-add-email-btn:focus-visible,
.invite-permission-toggle-btn:focus-visible,
.invite-modal-close:focus-visible,
.invite-remove-email-btn:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.invite-search-input:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
</style>