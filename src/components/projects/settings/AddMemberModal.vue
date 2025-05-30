<template>
  <!-- 멤버 추가 모달 -->
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">새 멤버 추가</h3>
        <button @click="closeModal" class="modal-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">이름</label>
          <input
            v-model="memberData.name"
            type="text"
            class="form-input"
            placeholder="멤버 이름을 입력하세요"
            @keyup.enter="handleAddMember"
          />
        </div>

        <div class="form-group">
          <label class="form-label">부서</label>
          <input
            v-model="memberData.department"
            type="text"
            class="form-input"
            placeholder="부서명을 입력하세요"
            @keyup.enter="handleAddMember"
          />
        </div>

        <div class="form-group">
          <label class="form-label">권한</label>
          <select v-model="memberData.permission" class="form-select">
            <option value="Read">Read</option>
            <option value="Read/Write">Read/Write</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <!-- 유효성 검증 메시지 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-cancel">취소</button>
        <button
          @click="handleAddMember"
          :disabled="!isFormValid"
          class="btn-add"
          :class="{ disabled: !isFormValid }"
        >
          추가
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "add-member"]);

const memberData = reactive({
  name: "",
  department: "",
  permission: "Read",
});

const errorMessage = ref("");

// 폼 유효성 검증
const isFormValid = computed(() => {
  return memberData.name.trim() && memberData.department.trim();
});

// 에러 메시지 자동 제거
watch([() => memberData.name, () => memberData.department], () => {
  if (errorMessage.value) {
    errorMessage.value = "";
  }
});

const handleAddMember = () => {
  if (!isFormValid.value) {
    errorMessage.value = "모든 필드를 입력해주세요.";
    return;
  }

  // 새 멤버 데이터 생성
  const newMember = {
    id: Date.now(),
    name: memberData.name.trim(),
    department: memberData.department.trim(),
    permission: memberData.permission,
  };

  // 부모 컴포넌트로 이벤트 전송
  emit("add-member", newMember);

  // 모달 닫기
  closeModal();
};

const closeModal = () => {
  // 폼 리셋
  resetForm();
  // 부모 컴포넌트로 닫기 이벤트 전송
  emit("close");
};

const resetForm = () => {
  memberData.name = "";
  memberData.department = "";
  memberData.permission = "Read";
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
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input:hover,
.form-select:hover {
  border-color: #d1d5db;
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
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-cancel,
.btn-add {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
}

.btn-cancel {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-add {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-add:hover:not(.disabled) {
  background: #059669;
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.btn-add.disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
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
    flex-direction: column;
  }

  .btn-cancel,
  .btn-add {
    width: 100%;
    justify-content: center;
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
}

/* 접근성 개선 */
.btn-add:focus-visible,
.btn-cancel:focus-visible,
.modal-close:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.form-input:focus-visible,
.form-select:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
</style>
