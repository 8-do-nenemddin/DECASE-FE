<template>
  <div class="project-info-container">
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
        <input
          id="project-scale"
          type="text"
          v-model="projectData.scale"
          class="form-input"
          placeholder="프로젝트 규모를 입력하세요"
        />
      </div>

      <!-- 저장 버튼 -->
      <div class="form-actions">
        <button @click="saveProject" class="save-button">
          <span class="save-icon">💾</span>
          저장
        </button>
      </div>
    </div>

    <!-- 프로젝트 삭제 -->
    <div class="delete-section">
      <button @click="deleteProject" class="delete-button">
        프로젝트 삭제
      </button>
    </div>
  </div>

  <EditSuccessModal
    v-if="showSuccessSaveModal"
    @close="closeSuccessSaveModal"
  ></EditSuccessModal>
</template>

<script setup>
import { ref, reactive } from "vue";
import EditSuccessModal from "./EditSuccessModal.vue";

const showSuccessSaveModal = ref(false);

const projectData = reactive({
  startDate: "2025-05-29",
  endDate: "2025-05-30",
  name: "",
  pm: "",
  description: "",
  scale: "",
});

// 프로젝트 내용 수정 저장 모달
const saveProject = () => {
  console.log("프로젝트 저장:", projectData);
  showSuccessSaveModal.value = true;
  // 실제 저장 로직 구현
};
const closeSuccessSaveModal = () => {
  showSuccessSaveModal.value = false;
};

const deleteProject = () => {
  if (confirm("정말로 프로젝트를 삭제하시겠습니까?")) {
    console.log("프로젝트 삭제");
    // 실제 삭제 로직 구현
  }
};
</script>

<style scoped>
.project-info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
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
}

/* 포커스 가능한 요소들의 접근성 개선 */
.form-input:focus-visible,
.form-textarea:focus-visible,
.date-input:focus-visible,
.save-button:focus-visible,
.delete-button:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>
