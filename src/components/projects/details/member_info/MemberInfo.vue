<template>
  <div class="permission-container">
    <div class="permission-card">
      <!-- 멤버 목록 -->
      <div class="member-list">
        <div
          v-for="(member, index) in members"
          :key="member.id"
          class="member-item"
        >
          <div class="member-info">
            <div class="avatar">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div class="member-details">
              <div class="member-header">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-department">{{ member.department }}</span>
                <span v-if="member.isAdmin" class="member-admin">Admin</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { useProjectStore } from "/src/stores/projectStore";

const projectStore = useProjectStore();

const members = ref([]);
const projectId = ref(projectStore.projectId);

const fetchProjectMembers = async () => {
  try {
    const response = await fetch(`/api/v1/projects/${projectId.value}/members`);
    const result = await response.json();

    console.log(result);

    if (response.ok) {
      members.value = result.data;
    } else {
      console.error("멤버 불러오기 실패:", result.message);
    }
  } catch (error) {
    console.error("API 호출 에러:", error);
  }
};

onMounted(() => {
  fetchProjectMembers();
});
</script>

<style scoped>
.permission-container {
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 2rem;
}

.permission-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.member-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6b7280;
}

.avatar-icon {
  font-size: 1.25rem;
  color: #6b7280;
}

.member-details {
  flex: 1;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.member-name {
  font-weight: 700;
  color: #111827;
  font-size: 1rem;
}

.member-department {
  color: #6b7280;
  font-size: 0.8rem;
}

.member-admin {
  color: #6aaae6;
  font-size: 0.7rem;
  background-color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 999px; /* 완전한 pill 모양 */
  border: 1px solid #6aaae6; /* 테두리 추가 (선택사항) */
  display: inline-block; /* padding과 border-radius를 적용하려면 필요함 */
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 토글 스위치 스타일 */
.permission-toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.permission-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  min-width: 80px;
  text-align: right;
}

.permission-toggle {
  position: relative;
  width: 60px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.permission-toggle:hover {
  background: #d1d5db;
  transform: scale(1.05);
}

.permission-toggle.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.permission-toggle.active:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.permission-toggle.active .toggle-slider {
  transform: translateX(28px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.permission-toggle.active .toggle-icon {
  color: white;
}

.permission-toggle:not(.active) .toggle-icon {
  opacity: 0.7;
}

.delete-button {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.delete-button:hover {
  background: #fecaca;
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.delete-icon {
  font-size: 1rem;
}

.add-member-section {
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.add-member-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.add-member-button:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
}

.add-member-button svg {
  color: white;
}

/* 모달 공통 스타일 */
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.member-info-modal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.avatar-small {
  width: 2rem;
  height: 2rem;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6b7280;
}

.avatar-small .avatar-icon {
  font-size: 1rem;
  color: #6b7280;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .permission-container {
    padding: 1rem;
  }

  .member-item {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .member-info {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .permission-container {
    padding: 0.75rem;
  }

  .member-list {
    padding: 1rem;
    gap: 0.75rem;
  }

  .member-item {
    padding: 1rem;
  }

  .member-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
