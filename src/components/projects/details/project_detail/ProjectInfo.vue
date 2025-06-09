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
                  readonly
              />
            </div>
            <span class="date-separator">~</span>
            <div class="date-input-wrapper">
              <input
                  type="date"
                  v-model="projectData.endDate"
                  class="date-input"
                  readonly
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
                readonly
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="project-pm">제안 PM</label>
            <input
                id="project-pm"
                type="text"
                v-model="projectData.pm"
                class="form-input"
                readonly
            />
          </div>
        </div>

        <!-- 프로젝트 설명 -->
        <div class="form-section">
          <label class="form-label" for="project-description">프로젝트 설명</label>
          <textarea
              id="project-description"
              v-model="projectData.description"
              rows="6"
              class="form-textarea"
              readonly
          ></textarea>
        </div>

        <!-- 프로젝트 규모 -->
        <div class="form-section">
          <label class="form-label" for="project-scale">프로젝트 규모</label>
          <div class="input-with-unit">
            <input
                id="project-scale"
                type="text"
                :value="displayValue"
                class="form-input no-spinner"
                readonly
            />
            <span class="unit-label">원</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const projectData = reactive({
  startDate: "",
  endDate: "",
  name: "",
  pm: "",
  description: "",
  scale: ""
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
  } catch (err) {
    console.error(err);
  }
});

const displayValue = computed(() => {
  if (!projectData.scale) return '';
  return Number(projectData.scale).toLocaleString();
});
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