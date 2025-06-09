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
              <span class="avatar-icon">👤</span>
            </div>

            <div class="member-details">
              <div class="member-header">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-department">{{ member.department }}</span>
                <span v-if="member.isAdmin" class="member-admin">Admin</span>
              </div>
            </div>
          </div>

          <div class="member-actions">
            <div class="permission-toggle-container">
              <span class="permission-label">{{ member.permission === 'READ' ? 'Read' : 'Read/Write' }}</span>
              <div
                class="permission-toggle"
                :class="{ 'active': member.permission === 'READ_AND_WRITE' }"
                @click="showPermissionModal(member)"
              >
                <div class="toggle-slider">
                  <div class="toggle-icon">
                    <span v-if="member.permission === 'READ'">📖</span>
                    <span v-else>✍️</span>
                  </div>
                </div>
              </div>
            </div>

            <button @click="showDeleteModal(member, index)" class="delete-button">
              <span class="delete-icon">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 멤버 추가 버튼 -->
      <div class="add-member-section">
        <button @click="showAddMemberModal = true" class="add-member-button">
          <span class="button-icon">➕</span>
          멤버 추가
        </button>
      </div>
    </div>

    <!-- 멤버 추가 모달 컴포넌트 -->
    <AddMemberModal
      :is-visible="showAddMemberModal"
      @close="handleModalClose"
      @send-invitations="handleSendInvitations"
    />

    <!-- 성공 모달 (독립적으로 관리) -->
    <AddSuccessModal v-if="showSuccessModal" @close="handleSuccessClose" />

    <!-- 권한 변경 확인 모달 -->
    <div v-if="showPermissionChangeModal" class="modal-overlay" @click="closePermissionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">권한 변경 확인</h3>
          <button @click="closePermissionModal" class="close-button">
            <span>×</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="member-info-modal">
            <div class="avatar-small">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="member-details-modal">
              <div class="member-name-modal">{{ selectedMember?.name }}</div>
              <div class="member-department-modal">{{ selectedMember?.department }}</div>
            </div>
          </div>

          <div class="permission-change-info">
            <p class="change-message">
              <span class="current-permission">{{ selectedMember?.permission }}</span>
              <span class="arrow">→</span>
              <span class="new-permission">{{ getNewPermission(selectedMember?.permission) }}</span>
            </p>
            <p class="confirm-message">권한을 변경하시겠습니까?</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="confirmPermissionChange" class="confirm-button">
            변경
          </button>
          <button @click="closePermissionModal" class="cancel-button">
            취소
          </button>
        </div>
      </div>
    </div>

    <!-- 멤버 삭제 확인 모달 -->
    <div v-if="showDeleteConfirmModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">멤버 삭제 확인</h3>
          <button @click="closeDeleteModal" class="close-button">
            <span>×</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="member-info-modal">
            <div class="avatar-small">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="member-details-modal">
              <div class="member-name-modal">{{ memberToDelete?.name }}</div>
              <div class="member-department-modal">{{ memberToDelete?.department }}</div>
            </div>
          </div>

          <div class="delete-warning">
            <div class="warning-icon">⚠️</div>
            <p class="warning-message">
              이 멤버를 삭제하면 더 이상 <br>해당 프로젝트에 접근할 수 없습니다.
            </p>
            <p class="confirm-message">정말로 삭제하시겠습니까?</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="confirmDelete" class="delete-confirm-button">
            삭제
          </button>
          <button @click="closeDeleteModal" class="cancel-button">
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';
import AddMemberModal from "./AddMemberModal.vue";
import AddSuccessModal from "./AddSuccessModal.vue";

const showAddMemberModal = ref(false);
const showSuccessModal = ref(false);
const showPermissionChangeModal = ref(false);
const showDeleteConfirmModal = ref(false);
const selectedMember = ref(null);
const memberToDelete = ref(null);
const memberIndexToDelete = ref(null);

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
});

const members = ref([]);
const projectId = props.projectId;

const fetchProjectMembers = async () => {
  try {
    const response = await fetch(`/api/v1/projects/${projectId}/members`);
    const result = await response.json();

    console.log(result)

    if (response.ok) {
      members.value = result.data;
    } else {
      console.error('멤버 불러오기 실패:', result.message);
    }
  } catch (error) {
    console.error('API 호출 에러:', error);
  }
};

onMounted(() => {
  fetchProjectMembers();
});

// 권한 변경 모달 표시
const showPermissionModal = (member) => {
  selectedMember.value = member;
  showPermissionChangeModal.value = true;
};

// 새로운 권한 반환
const getNewPermission = (currentPermission) => {
  return currentPermission === 'READ' ? 'READ_AND_WRITE' : 'READ';
};

// 권한 변경 확인Unresolved variable memberId
const confirmPermissionChange = async () => {
  if (selectedMember.value) {
    const projectId = props.projectId;
    const memberId = selectedMember.value.memberId;
    const newPermission = getNewPermission(selectedMember.value.permission);

    try {
      const response = await fetch(
          `/api/v1/projects/${projectId}/members/${memberId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              permission: newPermission
            })
          }
       );
      if (!response.ok) {
        throw new Error("권한 변경 실패");
      }

      selectedMember.value.permission = newPermission;
      console.log(`멤버 ${selectedMember.value.id}의 권한을 ${newPermission}으로 변경`);
    } catch (error) {
      console.error("권한 변경 중 오류:", error);
      alert("권한 변경에 실패했습니다.");
    } finally {
      closePermissionModal();
    }
  }
};

// 권한 변경 모달 닫기
const closePermissionModal = () => {
  showPermissionChangeModal.value = false;
  selectedMember.value = null;
};

// 삭제 모달 표시
const showDeleteModal = (member, index) => {
  memberToDelete.value = member;
  memberIndexToDelete.value = index;
  showDeleteConfirmModal.value = true;
};

// 삭제 확인
const confirmDelete = async () => {
  if (memberIndexToDelete.value !== null && memberToDelete.value) {
    const projectId = props.projectId;
    const memberId = memberToDelete.value.memberId;

    try {
      const response = await fetch(
          `/api/v1/projects/${projectId}/members/${memberId}`,
          {
            method: "DELETE",
          }
      );

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      members.value.splice(memberIndexToDelete.value, 1);
      console.log(`멤버 ${memberToDelete.value.name} 삭제됨`);
    } catch (error) {
      console.error("멤버 삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    } finally {
      closeDeleteModal();
    }
  }
};

// 삭제 모달 닫기
const closeDeleteModal = () => {
  showDeleteConfirmModal.value = false;
  memberToDelete.value = null;
  memberIndexToDelete.value = null;
};

// 모달 닫기 처리 (X버튼, 취소 버튼)
const handleModalClose = () => {
  console.log("AddMemberModal 닫기");
  showAddMemberModal.value = false;
};

// 초대 전송 처리 (전송 버튼 클릭 시)
const handleSendInvitations = async (invitationData) => {
  console.log("초대 전송 처리:", invitationData);

  try {
    const response = await fetch(`/api/v1/projects/${props.projectId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*"
      },
      body: JSON.stringify(invitationData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("초대 실패:", result.message || "Unknown error");
      alert("초대에 실패했습니다.");
      return;
    }

    console.log("초대 성공:", result);
    showAddMemberModal.value = false;
    showSuccessModal.value = true;

    // 초대 성공 후 멤버 목록 다시 불러오기
    await fetchProjectMembers();

  } catch (error) {
    console.error("초대 요청 에러:", error);
    alert("초대 요청 중 오류가 발생했습니다.");
  }
};

// 성공 모달 닫기 처리
const handleSuccessClose = () => {
  console.log("AddSuccessModal 닫기");
  showSuccessModal.value = false;
};
</script>

<style scoped>
.permission-container {
  max-width: 800px;
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
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.permission-toggle:not(.active) .toggle-icon {
  opacity: 0.7;
}

.permission-toggle.active .toggle-icon {
  opacity: 1;
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

.button-icon {
  font-size: 1rem;
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
}

.avatar-small .avatar-icon {
  font-size: 1rem;
  color: #6b7280;
}

.member-details-modal {
  flex: 1;
}

.member-name-modal {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.member-department-modal {
  color: #6b7280;
  font-size: 0.75rem;
}

/* 권한 변경 모달 스타일 */
.permission-change-info {
  text-align: center;
}

.change-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.current-permission {
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-weight: 500;
}

.new-permission {
  padding: 0.5rem 0.75rem;
  background: #dcfce7;
  color: #059669;
  border-radius: 8px;
  font-weight: 500;
}

.arrow {
  color: #6b7280;
  font-weight: 600;
}

.confirm-message {
  color: #374151;
  font-size: 0.875rem;
  margin: 0;
}

/* 삭제 모달 특별 스타일 */
.delete-modal .modal-header {
  border-bottom-color: #fed7d7;
}

.delete-warning {
  text-align: center;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 12px;
  border: 1px solid #fecaca;
}

.warning-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.warning-message {
  color: #7f1d1d;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.cancel-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.confirm-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.delete-confirm-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-confirm-button:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
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

  .member-actions {
    justify-content: space-between;
    width: 100%;
  }

  .permission-toggle-container {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .permission-label {
    text-align: left;
    min-width: auto;
  }

  .modal-content {
    margin: 1rem;
    max-width: none;
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

  .member-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .permission-toggle-container {
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }

  .add-member-button {
    width: 100%;
    justify-content: center;
  }

  .change-message {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-button,
  .confirm-button,
  .delete-confirm-button {
    width: 100%;
  }
}
</style>