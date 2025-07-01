<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <!-- 프로젝트 생성 폼 -->
    <div v-if="!showSuccessModal" class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Create Project</h2>
        <p class="modal-subtitle">프로젝트에 대한 상세 정보를 입력해주세요.</p>
        <button class="close-button" @click="$emit('close')">X</button>
      </div>

      <div class="modal-content">
        <!-- 프로젝트 기간 -->
        <div class="date-section">
          <div class="date-label">프로젝트 기간</div>
          <div class="date-inputs">
            <input
              type="date"
              v-model="formData.startDate"
              class="date-input"
            />
            <span class="date-separator">~</span>
            <input
              type="date"
              v-model="formData.endDate"
              class="date-input"
              :disabled="!formData.startDate"
              :class="{ 'input-disabled': !formData.startDate }"
            />
          </div>
        </div>

        <!-- 프로젝트 이름 & 제안 PM -->
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">프로젝트 이름</label>
            <input
              type="text"
              v-model="formData.name"
              class="form-input"
              :disabled="!isDateRangeComplete"
              :class="{ 'input-disabled': !isDateRangeComplete }"
            />
          </div>
          <div class="form-field">
            <label class="form-label">제안 PM</label>
            <input
              type="text"
              v-model="formData.proposalPM"
              class="form-input"
              :disabled="!formData.name.trim()"
              :class="{ 'input-disabled': !formData.name.trim() }"
            />
          </div>
        </div>

        <!-- 프로젝트 설명 -->
        <div class="form-field full-width">
          <label class="form-label">프로젝트 설명</label>
          <textarea
            v-model="formData.description"
            class="form-textarea"
            :disabled="!formData.proposalPM.trim()"
            :class="{ 'input-disabled': !formData.proposalPM.trim() }"
          ></textarea>
        </div>

        <!-- 프로젝트 규모 -->
        <div class="form-field full-width">
          <label class="form-label">프로젝트 규모</label>
          <input
            type="text"
            :value="displayValue"
            @input="onInput"
            class="form-input"
            placeholder="숫자 입력 (최대 9,999조)"
            :disabled="!formData.description.trim()"
            :class="{ 'input-disabled': !formData.description.trim() }"
          />
          <div v-if="scaleError" class="error-message">{{ scaleError }}</div>
        </div>

        <!-- 생성 버튼 -->
        <div class="button-section">
          <button
            class="submit-button"
            @click="handleCreateProject"
            :disabled="isLoading || !isFormComplete"
          >
            <span v-if="isLoading" class="loading"></span>
            <span v-else>생성</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 성공 모달 -->
    <SuccessCreateProject
      v-if="showSuccessModal"
      @close="handleSuccessClose"
      @confirm="handleSuccessConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import SuccessCreateProject from "./ProjectCreationSuccessModal.vue";
import { useProjectStore } from "../../stores/projectStore";

const router = useRouter();
const emit = defineEmits(["close", "createProject"]);
const projectStore = useProjectStore();
const userId = computed(() => projectStore.userId);

const isLoading = ref(false);
const showSuccessModal = ref(false);
const scaleError = ref("");

const today = new Date().toISOString().split("T")[0];
const formData = ref({
  name: "",
  description: "",
  scale: "",
  proposalPM: "",
  startDate: today,
  endDate: today,
});

// 날짜 범위가 완료되었는지 확인
const isDateRangeComplete = computed(() => {
  return formData.value.startDate && formData.value.endDate;
});

// 전체 폼이 완료되었는지 확인
const isFormComplete = computed(() => {
  return (
    isDateRangeComplete.value &&
    formData.value.name.trim() &&
    formData.value.proposalPM.trim() &&
    formData.value.description.trim() &&
    formData.value.scale &&
    !scaleError.value
  );
});

const displayValue = computed(() => {
  if (!formData.value.scale) return "";
  return Number(formData.value.scale).toLocaleString();
});

function onInput(event) {
  const raw = event.target.value.replace(/\D/g, ""); // 숫자만

  // 1경(10,000조) = 10^16 = 10000000000000000 (16자리)
  // 9,999조 = 9999000000000000 (최대 13자리)
  const maxValue = 9999000000000000n; // 9,999조

  if (raw) {
    const numValue = Number(raw);
    if (numValue > maxValue) {
      scaleError.value = "프로젝트 규모는 9,999조를 초과할 수 없습니다.";
      return;
    } else {
      scaleError.value = "";
    }
  } else {
    scaleError.value = "";
  }

  const limited = raw.slice(0, 13); // 13자리 제한 (9,999조까지)
  formData.value.scale = limited;
}

const handleOverlayClick = () => {
  if (!showSuccessModal.value) {
    emit("close");
  }
};

const closeModal = () => {
  emit("close");
};

const handleCreateProject = async () => {
  if (!isFormComplete.value) {
    alert("모든 필수 항목을 입력해주세요.");
    return;
  }

  isLoading.value = true;

  try {
    const requestBody = {
      name: formData.value.name,
      scale: formData.value.scale,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      description: formData.value.description,
      proposalPM: formData.value.proposalPM,
      creatorMemberId: userId.value,
    };

    const response = await fetch("/api/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (result.status !== 201) {
      throw new Error(result.message || "프로젝트 생성에 실패했습니다.");
    }

    // 성공적으로 생성된 프로젝트 정보
    const newProject = result.data;

    console.log(result.data);

    const now = new Date();
    const start = new Date(newProject.startDate);
    const end = new Date(newProject.endDate);

    if (start > now || end < now) {
      newProject.status = "INACTIVE";
    } else {
      newProject.status = "ACTIVE";
    }

    if (newProject.creatorMemberId === userId.value) {
      newProject.isAdmin = true;
    } else {
      newProject.isAdmin = false;
    }

    projectStore.setProject(
      newProject.projectId,
      newProject.name,
      0,
      newProject.status,
      newProject.isAdmin,
    );
    projectStore.setPermission("READ_AND_WRITE");
    projectStore.setRevisionCount(newProject.revisionCount);

    showSuccessModal.value = true;
    closeModal();
    router.push(`/projects/${projectStore.projectId}`);
  } catch (error) {
    console.error("프로젝트 생성 중 오류:", error);
    alert(error.message || "알 수 없는 오류가 발생했습니다.");
  } finally {
    isLoading.value = false;
  }
};

const handleSuccessConfirm = () => {
  // 부모 컴포넌트에게 프로젝트 데이터 전달
  emit("createProject", { ...formData.value });
  showSuccessModal.value = false;
  emit("close");
};

const handleSuccessClose = () => {
  showSuccessModal.value = false;
  emit("close");
};
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 980px;
  height: auto;
  margin: 1rem;
  overflow: hidden;
  transform: scale(0.9) translateY(20px);
  animation: slideUp 0.3s ease forwards;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-container::-webkit-scrollbar {
  display: none;
}

.modal-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes slideUp {
  to {
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  position: relative;
  padding: 12px 48px 12px 48px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
}

.modal-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  letter-spacing: -0.025em;
}

.modal-subtitle {
  font-size: 14px;
  color: #64748b;
  font-weight: 400;
}

.close-button {
  position: absolute;
  top: 24px;
  right: 32px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
  transform: scale(1.05);
}

.modal-content {
  padding: 24px 48px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 프로젝트 기간 섹션 */
.date-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 320px;
}

.date-input {
  padding: 0px 16px;
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: #1f2937;
  background: #ffffff;
  transition: all 0.2s ease;
  min-height: 40px;
}

.date-input:focus {
  outline: none;
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.date-separator {
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
  margin: 0 4px;
}

/* 비활성화된 입력 필드 스타일 */
.input-disabled {
  background-color: #f9fafb !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
  border-color: #e5e7eb !important;
}

.input-disabled:hover {
  border-color: #e5e7eb !important;
}

/* 폼 행 (2열 레이아웃) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: #1f2937;
  background: #ffffff;
  transition: all 0.2s ease;
  min-height: 40px;
}

.form-input:focus:not(:disabled) {
  outline: none;
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-input:hover:not(:disabled) {
  border-color: #9ca3af;
}

.form-textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: #1f2937;
  background: #ffffff;
  transition: all 0.2s ease;
  resize: none;
  min-height: 100px;
  line-height: 1.5;
}

.form-textarea:focus:not(:disabled) {
  outline: none;
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-textarea:hover:not(:disabled) {
  border-color: #9ca3af;
}

/* 에러 메시지 */
.error-message {
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
}

/* 버튼 섹션 */
.button-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.submit-button {
  background: #000000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 80px;
  font-family: inherit;
}

.submit-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }

  .modal-header {
    padding: 40px 40px 32px 40px;
  }

  .modal-content {
    padding: 32px 40px 40px 40px;
    gap: 28px;
  }

  .modal-title {
    font-size: 28px;
  }

  .modal-subtitle {
    font-size: 15px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    max-width: none;
  }

  .date-separator {
    text-align: center;
    margin: 4px 0;
  }

  .close-button {
    top: 32px;
    right: 32px;
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 12px;
    max-width: calc(100vw - 24px);
  }

  .modal-header {
    padding: 32px 32px 24px 32px;
  }

  .modal-content {
    padding: 24px 32px 32px 32px;
    gap: 24px;
  }

  .modal-title {
    font-size: 24px;
  }

  .modal-subtitle {
    font-size: 14px;
  }

  .close-button {
    top: 24px;
    right: 24px;
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .form-textarea {
    min-height: 120px;
  }

  .form-input,
  .date-input {
    padding: 14px 16px;
    font-size: 15px;
    min-height: 48px;
  }

  .form-textarea {
    padding: 14px 16px;
    font-size: 15px;
  }

  .submit-button {
    padding: 14px 28px;
    font-size: 15px;
  }
}
</style>
