<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <div class="header">
      <div class="header-left">
        <div class="logo">
          <span>D</span>
        </div>
        <h1 class="project-title">{{ projectData.title }}</h1>
        <button
          @click="isEditing = true"
          class="edit-btn"
          title="프로젝트명 편집"
        >
          ✏️
        </button>
      </div>
      <div class="delete-project">프로젝트 삭제</div>
    </div>

    <div class="main-container">
      <!-- 사이드바 -->
      <div class="sidebar">
        <nav>
          <button
            v-for="item in menuItems"
            :key="item.id"
            @click="activeTab = item.id"
            :class="['menu-item', { active: activeTab === item.id }]"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </nav>
      </div>

      <!-- 메인 콘텐츠 -->
      <div class="content">
        <!-- 프로젝트 정보 탭 -->
        <div v-if="activeTab === '정보'" class="content-card">
          <div class="form-container">
            <!-- 프로젝트 기간 -->
            <div class="form-group">
              <label class="form-label"> 📅 프로젝트 기간 </label>
              <div class="date-range">
                <input
                  type="date"
                  v-model="projectData.startDate"
                  class="date-input"
                />
                <span class="date-separator">~</span>
                <input
                  type="date"
                  v-model="projectData.endDate"
                  class="date-input"
                />
              </div>
            </div>

            <!-- 프로젝트 이름과 담당 PM -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">프로젝트 이름</label>
                <input
                  type="text"
                  v-model="projectData.title"
                  class="form-input"
                  placeholder="프로젝트 이름을 입력하세요"
                />
              </div>
              <div class="form-group">
                <label class="form-label">담당 PM</label>
                <input
                  type="text"
                  v-model="projectData.manager"
                  class="form-input"
                  placeholder="담당 PM을 입력하세요"
                />
              </div>
            </div>

            <!-- 프로젝트 설명 -->
            <div class="form-group">
              <label class="form-label">프로젝트 설명</label>
              <textarea
                v-model="projectData.description"
                rows="6"
                class="form-textarea"
                placeholder="프로젝트에 대한 상세한 설명을 입력하세요..."
              ></textarea>
            </div>

            <!-- 프로젝트 목표 -->
            <div class="form-group">
              <label class="form-label">프로젝트 목표</label>
              <textarea
                v-model="projectData.goals"
                rows="3"
                class="form-textarea"
                placeholder="프로젝트의 목표를 입력하세요..."
              ></textarea>
            </div>

            <!-- 저장 버튼 -->
            <div class="save-section">
              <button @click="handleSave" class="save-btn">💾 저장</button>
            </div>
          </div>
        </div>

        <!-- 요구사항 추적 매트릭스 탭 -->
        <div v-if="activeTab === '매트릭스'" class="content-card">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>요구사항 추적 매트릭스</h3>
            <p>프로젝트의 요구사항을 추적하고 관리합니다.</p>
            <button class="action-btn blue">➕ 요구사항 추가</button>
          </div>
        </div>

        <!-- 권한 관리 탭 -->
        <div v-if="activeTab === '관리'" class="content-card">
          <div class="empty-state">
            <div class="empty-icon">⚙️</div>
            <h3>권한 관리</h3>
            <p>프로젝트 멤버들의 권한을 설정하고 관리합니다.</p>
            <button class="action-btn green">➕ 멤버 추가</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 프로젝트명 편집 모달 -->
    <div v-if="isEditing" class="modal-overlay" @click="isEditing = false">
      <div class="modal" @click.stop>
        <h3>프로젝트명 편집</h3>
        <input
          type="text"
          v-model="projectData.title"
          class="modal-input"
          placeholder="새 프로젝트명 입력"
        />
        <div class="modal-actions">
          <button @click="isEditing = false" class="btn-cancel">취소</button>
          <button @click="isEditing = false" class="btn-save">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";

export default {
  name: "ProjectManagementInterface",
  setup() {
    const projectData = reactive({
      title: "Project 1",
      startDate: "2025-05-29",
      endDate: "2025-05-30",
      manager: "",
      description: "",
      goals: "",
    });

    const activeTab = ref("정보");
    const isEditing = ref(false);

    const menuItems = [
      { id: "정보", label: "프로젝트 정보 수정", icon: "✏️" },
      { id: "매트릭스", label: "요구사항 추적 매트릭스", icon: "📋" },
      { id: "관리", label: "권한 관리", icon: "⚙️" },
    ];

    const handleSave = () => {
      console.log("프로젝트 저장:", projectData);
      // 실제로는 API 호출
    };

    return {
      projectData,
      activeTab,
      isEditing,
      menuItems,
      handleSave,
    };
  },
};
</script>

<style scoped>
/* 기본 레이아웃 */
.header {
  background: white;
  border-bottom: 1px solid #d1d5db;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  width: 2.5rem;
  height: 2.5rem;
  background: black;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.125rem;
}

.project-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.edit-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.delete-project {
  color: #ef4444;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.delete-project:hover {
  color: #dc2626;
}

.main-container {
  display: flex;
}

/* 사이드바 */
.sidebar {
  width: 16rem;
  background: white;
  border-right: 1px solid #d1d5db;
  min-height: calc(100vh - 73px);
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item.active {
  background: #eff6ff;
  color: #1d4ed8;
  border-right: 4px solid #3b82f6;
}

.menu-icon {
  font-size: 1rem;
  transition: transform 0.2s;
}

.menu-item:hover .menu-icon {
  transform: scale(1.1);
}

/* 메인 콘텐츠 */
.content {
  flex: 1;
  padding: 2rem;
}

.content-card {
  max-width: 64rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

/* 폼 스타일 */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.form-textarea {
  resize: none;
}

.date-range {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.date-separator {
  color: #6b7280;
}

.save-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: black;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.save-btn:hover {
  background: #1f2937;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.save-btn:active {
  transform: translateY(0);
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.blue {
  background: #3b82f6;
  color: white;
}

.action-btn.blue:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.action-btn.green {
  background: #10b981;
  color: white;
}

.action-btn.green:hover {
  background: #059669;
  transform: translateY(-2px);
}

/* 모달 */
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
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 24rem;
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

.modal h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.modal-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-cancel {
  color: #6b7280;
  border: 1px solid #d1d5db;
  background: white;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-save {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn-save:hover {
  background: #2563eb;
}

/* 반응형 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
