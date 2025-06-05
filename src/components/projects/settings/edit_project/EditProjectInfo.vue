<template>
  <div class="project-info-container">
    <Transition name="slide-up" appear>
      <div class="form-card">
        <!-- 프로젝트 기간 -->
        <div class="form-section">
          <label class="form-label">프로젝트 기간</label>
          <div class="date-range-container">
            <div class="date-input-wrapper">
              <input
                type="date"
                v-model="projectData.startDate"
                class="date-input"
              />
            </div>
            <span class="date-separator">~</span>
            <div class="date-input-wrapper">
              <input
                type="date"
                v-model="projectData.endDate"
                class="date-input"
              />
            </div>
          </div>
        </div>

        <!-- 프로젝트 이름과 담당 PM -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="project-name">프로젝트 이름</label>
            <input
              id="project-name"
              type="text"
              v-model="projectData.name"
              class="form-input"
              placeholder="프로젝트 이름을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="project-pm">제안 PM</label>
            <input
              id="project-pm"
              type="text"
              v-model="projectData.pm"
              class="form-input"
              placeholder="담당 PM을 입력하세요"
            />
          </div>
        </div>

        <!-- 프로젝트 설명 -->
        <div class="form-section">
          <label class="form-label" for="project-description"
            >프로젝트 설명</label
          >
          <textarea
            id="project-description"
            v-model="projectData.description"
            rows="6"
            class="form-textarea"
            placeholder="프로젝트에 대한 상세한 설명을 입력하세요..."
          ></textarea>
        </div>

        <!-- 프로젝트 규모 -->
        <div class="form-section">
          <label class="form-label" for="project-scale">프로젝트 규모</label>
          <div class="input-with-unit">
            <input
              id="project-scale"
              type="text"
              @input="onScaleInput"
              :value="displayValue"
              class="form-input no-spinner"
              placeholder="0"
            />
            <span class="unit-label">원</span>
          </div>
          <div v-if="scaleError" class="error-message">{{ scaleError }}</div>
        </div>

        <!-- 저장 버튼 -->
        <div class="form-actions">
          <button @click="saveProject" class="save-button">
            <span class="save-icon">💾</span>
            저장
          </button>
        </div>
      </div>
    </Transition>

    <!-- 프로젝트 삭제 -->
    <Transition name="slide-up" appear>
      <div class="delete-section">
        <button @click="showDeleteModal = true" class="delete-button">
          프로젝트 삭제
        </button>
      </div>
    </Transition>
  </div>

  <!-- 삭제 확인 모달 -->
  <Transition name="modal-fade">
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <span class="warning-icon">⚠️</span>
          </div>
          <h3 class="modal-title">프로젝트 삭제</h3>
          <button @click="closeDeleteModal" class="modal-close-button">
            <span class="close-icon">✕</span>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">
            정말로 이 프로젝트를 삭제하시겠습니까?
          </p>
          <p class="modal-warning">
            삭제된 프로젝트는 복구할 수 없습니다.
          </p>
        </div>
        
        <div class="modal-actions">
          <button @click="confirmDelete" class="confirm-delete-button">
            <span class="delete-icon">🗑️</span>
            삭제
          </button>
          <button @click="closeDeleteModal" class="cancel-button">
            취소
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 저장 성공 모달 -->
  <EditSuccessModal
    v-if="showSuccessSaveModal"
    @close="closeSuccessSaveModal"
  ></EditSuccessModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import EditSuccessModal from "./EditSuccessModal.vue";
import router from "../../../../router";

const showSuccessSaveModal = ref(false);
const showDeleteModal = ref(false);
const scaleError = ref('');

const projectData = reactive({
  startDate: "",
  endDate: "",
  name: "",
  pm: "",
  description: "",
  scale: "",
  creatorMemberId: null,
});

const route = useRoute();
const projectId = route.params.projectId;

onMounted(async () => {
  try {
    const res = await fetch(`/api/v1/projects/${projectId}`);
    if (!res.ok) throw new Error("프로젝트 정보 로드 실패");
    const data = await res.json();
    projectData.name = data.name;
    projectData.scale = data.scale.toString();
    projectData.startDate = data.startDate.slice(0, 10);
    projectData.endDate = data.endDate.slice(0, 10);
    projectData.description = data.description;
    projectData.pm = data.proposalPM;
    projectData.creatorMemberId = data.creatorMemberId;
  } catch (err) {
    console.error(err);
  }
});

function onScaleInput(event) {
  const raw = event.target.value.replace(/[^\d]/g, ''); // 숫자만 추출
  
  // 9,999조 = 9999000000000000 (최대값)
  const maxValue = 9999000000000000;
  
  if (raw) {
    const numValue = Number(raw);
    if (numValue > maxValue) {
      scaleError.value = '프로젝트 규모는 9,999조를 초과할 수 없습니다.';
      return;
    } else {
      scaleError.value = '';
    }
  } else {
    scaleError.value = '';
  }
  
  // 13자리로 제한 (9,999조까지)
  const limited = raw.slice(0, 13);
  projectData.scale = limited;
}

const displayValue = computed(() => {
  if (!projectData.scale) return '';
  return Number(projectData.scale).toLocaleString();
});

// 프로젝트 내용 수정 저장 모달
const saveProject = async () => {
  try {
    const res = await fetch(`/api/v1/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectData.name,
        scale: Number(projectData.scale),
        startDate: new Date(projectData.startDate).toISOString(),
        endDate: new Date(projectData.endDate).toISOString(),
        description: projectData.description,
        proposalPM: projectData.pm,
        creatorMemberId: projectData.creatorMemberId,
      }),
    });
    if (!res.ok) throw new Error("프로젝트 저장 실패");
    showSuccessSaveModal.value = true;
  } catch (err) {
    console.error("저장 실패:", err.message);
  }
};

const closeSuccessSaveModal = () => {
  showSuccessSaveModal.value = false;
};

// 삭제 모달 관련 함수들
const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const confirmDelete = async () => {
  try {
    const response = await fetch(`/api/v1/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("프로젝트 삭제 실패");
    }

    console.log("프로젝트 삭제 완료");
    showDeleteModal.value = false;

    // 삭제 후 메인 페이지로 이동
    router.push({ name: "MainView" });
  } catch (error) {
    console.error("프로젝트 삭제 중 오류 발생:", error);
    alert("프로젝트 삭제에 실패했습니다.");
  }
};
</script>

<style scoped>
.project-info-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 슬라이드 업 애니메이션 */
.slide-up-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* 모달 애니메이션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  color: #1f2937;
  font-family: inherit;
  line-height: 1.5;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  transform: translateY(-1px);
}

.form-input:hover,
.form-textarea:hover {
  border-color: #d1d5db;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.date-range-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-input-wrapper {
  flex: 1;
  position: relative;
}

.date-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  color: #1f2937;
  font-family: inherit;
}

.date-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  transform: translateY(-1px);
}

.date-separator {
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.15);
}

.save-button:hover {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(31, 41, 55, 0.25);
}

.save-button:active {
  transform: translateY(0);
}

.save-icon {
  font-size: 1rem;
}

.delete-section {
  margin-top: 2rem;
  text-align: right;
}

.delete-button {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #fef2f2;
  color: #dc2626;
  transform: translateY(-1px);
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  position: relative;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.warning-icon {
  font-size: 1.5rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  flex: 1;
}

.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.modal-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.modal-message {
  font-size: 0.875rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.modal-warning {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.cancel-button {
  flex: 1;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.confirm-delete-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-delete-button:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.delete-icon {
  font-size: 0.875rem;
}

.input-with-unit {
  position: relative;
  display: inline-block;
  width: 100%;
}

.input-with-unit .form-input {
  padding-right: 2.5rem;
}

.unit-label {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  font-size: 0.875rem;
}

.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .project-info-container {
    padding: 1rem;
  }

  .form-card {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .date-range-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .date-separator {
    display: none;
  }

  .form-actions {
    justify-content: center;
  }

  .save-button {
    width: 100%;
    justify-content: center;
  }

  .modal-container {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }

  .modal-actions {
    flex-direction: column;
  }

  /* 모바일에서 애니메이션 조정 */
  .slide-up-enter-from {
    transform: translateY(30px);
  }
}

@media (max-width: 480px) {
  .project-info-container {
    padding: 0.75rem;
  }

  .form-card {
    padding: 1rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
  }

  .form-input,
  .form-textarea,
  .date-input {
    padding: 0.75rem;
    font-size: 0.8125rem;
  }

  .save-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.8125rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 0 1rem 1rem 1rem;
  }

  .modal-actions {
    padding: 1rem;
  }
}

/* 포커스 가능한 요소들의 접근성 개선 */
.form-input:focus-visible,
.form-textarea:focus-visible,
.date-input:focus-visible,
.save-button:focus-visible,
.delete-button:focus-visible,
.cancel-button:focus-visible,
.confirm-delete-button:focus-visible,
.modal-close-button:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>