<template>
  <div class="project-info-container">
    <!-- 로딩 상태 표시 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>프로젝트 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 표시 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="loadProjectData" class="retry-button">다시 시도</button>
    </div>

    <!-- 프로젝트 정보 폼 -->
    <template v-else>
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
                  :disabled="true"
                />
              </div>
              <span class="date-separator">~</span>
              <div class="date-input-wrapper">
                <input
                  type="date"
                  v-model="projectData.endDate"
                  class="date-input"
                  :disabled="true"
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
                :disabled="true"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="project-pm">제안 PM</label>
              <input
                id="project-pm"
                type="text"
                v-model="projectData.pm"
                class="form-input"
                :disabled="true"
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
              :disabled="true"
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
                :disabled="true"
              />
              <span class="unit-label">원</span>
            </div>
            <div v-if="scaleError" class="error-message">{{ scaleError }}</div>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProjectStore } from "../../../../stores/projectStore";

const scaleError = ref('');
const loading = ref(false);
const error = ref('');

const projectData = reactive({
  startDate: "",
  endDate: "",
  name: "",
  pm: "",
  description: "",
  scale: "",
});

const route = useRoute();
const projectStore = useProjectStore();

// projectId를 여러 방법으로 가져오기 시도
const projectId = computed(() => {
  if (projectStore.projectId) {
    return projectStore.projectId;
  }
  
  if (route.params.id) {
    return route.params.id;
  }
  
  if (route.query.projectId) {
    return route.query.projectId;
  }
  
  return null;
});

// 날짜 포맷 함수
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('날짜 변환 오류:', e);
    return '';
  }
};

// 프로젝트 데이터 로드 함수
const loadProjectData = async () => {
  if (!projectId.value) {
    error.value = '프로젝트 ID를 찾을 수 없습니다.';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    const res = await fetch(`/api/v1/projects/${projectId.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`프로젝트 정보 로드 실패: ${res.status} ${res.statusText}`);
    }
    
    const json = await res.json();
    const data = json.data;
    
    // 데이터 설정
    projectData.name = data.name || '';
    projectData.scale = data.scale ? String(data.scale) : '';
    projectData.startDate = formatDateForInput(data.startDate);
    projectData.endDate = formatDateForInput(data.endDate);
    projectData.description = data.description || '';
    projectData.pm = data.proposalPM || '';
    
  } catch (err) {
    console.error('프로젝트 로드 오류:', err);
    error.value = err.message || '프로젝트 정보를 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProjectData();
});

function onScaleInput(event) {
  const raw = event.target.value.replace(/[^\d]/g, '');
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
  
  const limited = raw.slice(0, 13);
  projectData.scale = limited;
}

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

/* 로딩 상태 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 상태 스타일 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin: 2rem 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  color: #dc2626;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.retry-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* 기존 스타일들 */
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
}

.form-input:focus-visible,
.form-textarea:focus-visible,
.date-input:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>