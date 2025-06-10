<template>
  <!-- 멤버 초대 모달 -->
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">초대</h3>
        <button @click="closeModal" class="modal-close">✕</button>
      </div>

      <div class="modal-body">
        <!-- 이메일 입력 섹션 -->
        <div class="email-section">
          <!-- 검색/추가 입력창 -->
          <div class="search-input-container">
            <input
              v-model="searchEmail"
              type="email"
              class="search-input"
              placeholder="초대할 사람의 이메일 입력"
              @keyup.enter="addEmailToList"
              @input="handleEmailInput"
            />
            <div class="permission-dropdown-container">
              <button
                @click="togglePermissionDropdown"
                class="permission-button"
                :disabled="!isValidEmail(searchEmail)"
              >
                권한
                <span
                  class="dropdown-arrow"
                  :class="{ open: showPermissionDropdown }"
                  >▼</span
                >
              </button>

              <!-- 권한 선택 드롭다운 -->
              <div
                v-if="showPermissionDropdown"
                class="permission-dropdown"
                @click.stop
              >
                <div class="permission-options">
                  <button
                    @click="selectPermissionAndAdd('Read')"
                    class="permission-option"
                    :class="{ selected: selectedPermission === 'Read' }"
                  >
                    <span class="permission-label">Read</span>
                    <span class="permission-description">읽기 권한만</span>
                  </button>
                  <button
                    @click="selectPermissionAndAdd('Read/Write')"
                    class="permission-option"
                    :class="{ selected: selectedPermission === 'Read/Write' }"
                  >
                    <span class="permission-label">Read/Write</span>
                    <span class="permission-description">읽기/쓰기 권한</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 추가된 이메일 목록 -->
          <div class="email-list">
            <div
              v-for="(emailItem, index) in emailList"
              :key="index"
              class="email-item"
            >
              <div class="email-info">
                <span class="email-text">{{ emailItem.email }}</span>
                <span
                  class="email-permission"
                  :class="emailItem.permission.toLowerCase().replace('_', '-')"
                >
                  {{ emailItem.displayPermission }}
                </span>
              </div>
              <button @click="removeEmail(index)" class="remove-email-btn">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="modal-footer">
        <button
          @click="sendInvitations"
          :disabled="emailList.length === 0"
          class="btn-send"
          :class="{ disabled: emailList.length === 0 }"
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
const showPermissionDropdown = ref(false);
const errorMessage = ref("");

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

// 권한 드롭다운 토글
const togglePermissionDropdown = () => {
  if (!isValidEmail(searchEmail.value)) {
    errorMessage.value = "올바른 이메일 형식을 입력해주세요.";
    return;
  }
  showPermissionDropdown.value = !showPermissionDropdown.value;
};

// 권한 선택 및 이메일 추가
const selectPermissionAndAdd = (label) => {
  // Map display label to API enum value
  const apiValue = label === "Read" ? "READ" : "READ_AND_WRITE";
  selectedPermission.value = label;
  addEmailToList(apiValue, label);
  showPermissionDropdown.value = false;
};

// 이메일을 목록에 추가
const addEmailToList = (permission, displayLabel = selectedPermission.value) => {
  const email = searchEmail.value.trim();

  if (!isValidEmail(email)) {
    errorMessage.value = "올바른 이메일 형식을 입력해주세요.";
    return;
  }

  if (emailList.value.find((item) => item.email === email)) {
    errorMessage.value = "이미 추가된 이메일입니다.";
    return;
  }

  emailList.value.push({
    email: email,
    permission: permission,
    displayPermission: displayLabel,
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

// 외부 클릭으로 드롭다운 닫기
const handleClickOutside = (event) => {
  if (showPermissionDropdown.value) {
    showPermissionDropdown.value = false;
  }
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
  showPermissionDropdown.value = false;
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

// 이벤트 리스너 추가/제거
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
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

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.email-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input-container {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-input:hover {
  border-color: #d1d5db;
}

.permission-dropdown-container {
  position: relative;
}

.permission-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #1f2937;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 90px;
}

.permission-button:hover:not(:disabled) {
  background: #374151;
  transform: translateY(-1px);
}

.permission-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.permission-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 60;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
  overflow: hidden;
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.permission-options {
  display: flex;
  flex-direction: column;
}

.permission-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.875rem 1rem;
  background: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.permission-option:last-child {
  border-bottom: none;
}

.permission-option:hover {
  background: #f8fafc;
}

.permission-option.selected {
  background: #eff6ff;
  color: #1d4ed8;
}

.permission-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
}

.permission-description {
  font-size: 0.75rem;
  color: #6b7280;
}

.permission-option.selected .permission-description {
  color: #3b82f6;
}

.email-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.email-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.email-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.email-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.email-text {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
  word-break: break-all;
}

.email-permission {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  white-space: nowrap;
}

.email-permission.read {
  background: #fef3c7;
  color: #92400e;
}

.email-permission.read-write {
  background: #d1fae5;
  color: #065f46;
}

.remove-email-btn {
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

.remove-email-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid #fecaca;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-send {
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

.btn-send:hover:not(.disabled) {
  background: #374151;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.15);
}

.btn-send.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 스크롤바 스타일링 */
.email-list::-webkit-scrollbar {
  width: 6px;
}

.email-list::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.email-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.email-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .modal-footer {
    padding: 1.25rem;
  }

  .search-input-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .permission-dropdown-container {
    width: 100%;
  }

  .permission-button {
    width: 100%;
    justify-content: center;
  }

  .email-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .btn-send {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal {
    margin: 0.75rem;
    width: calc(100% - 1.5rem);
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .email-item {
    padding: 0.5rem 0.75rem;
  }

  .email-text {
    font-size: 0.8125rem;
  }

  .permission-label {
    font-size: 0.8125rem;
  }

  .permission-description {
    font-size: 0.6875rem;
  }
}

/* 접근성 개선 */
.btn-send:focus-visible,
.permission-button:focus-visible,
.permission-option:focus-visible,
.modal-close:focus-visible,
.remove-email-btn:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.search-input:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
</style>
