<template>
  <div class="invitation-container">
    <div class="invitation-card">
      <!-- 초대 목록 -->
      <div class="invitation-list">
        <div
            v-for="(invite, index) in invitations"
            :key="invite.email"
            class="invitation-item"
        >
          <div class="invitation-info">
            <div class="avatar">
              <span class="avatar-icon">📧</span>
            </div>

            <div class="invitation-details">
              <div class="invitation-header">
                <span class="invitation-email">{{ invite.email }}</span>
                <div class="status-badge" :class="{ 'accepted': invite.accepted, 'pending': !invite.accepted }">
                  <span class="status-icon">{{ invite.accepted ? '✅' : '⏳' }}</span>
                  <span class="status-text">{{ invite.accepted ? '수락됨' : '미수락' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="invitation-actions">
            <div class="permission-display">
              <span class="permission-label">{{ invite.permission === 'READ' ? 'Read' : 'Read/Write' }}</span>
              <div class="permission-indicator" :class="{ 'write-access': invite.permission === 'READ_AND_WRITE' }">
                <div class="permission-icon">
                  <span v-if="invite.permission === 'READ'">📖</span>
                  <span v-else>✍️</span>
                </div>
              </div>
            </div>

            <button @click="showCancelModal(invite, index)" class="cancel-button">
              <span class="cancel-icon">❌</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 초대가 없을 때 표시 -->
      <div v-if="invitations.length === 0" class="empty-state">
        <div class="empty-icon">📮</div>
        <h3 class="empty-title">초대가 없습니다</h3>
        <p class="empty-description">아직 보낸 초대가 없습니다.</p>
      </div>
    </div>

    <!-- 초대 취소 확인 모달 -->
    <div v-if="showCancelConfirmModal" class="modal-overlay" @click="closeCancelModal">
      <div class="modal-content cancel-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">초대 취소 확인</h3>
          <button @click="closeCancelModal" class="close-button">
            <span>×</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="invitation-info-modal">
            <div class="avatar-small">
              <span class="avatar-icon">📧</span>
            </div>
            <div class="invitation-details-modal">
              <div class="invitation-email-modal">{{ inviteToCancel?.email }}</div>
              <div class="invitation-status-modal">
                <span class="status-badge-small" :class="{ 'accepted': inviteToCancel?.accepted, 'pending': !inviteToCancel?.accepted }">
                  {{ inviteToCancel?.accepted ? '수락됨' : '미수락' }}
                </span>
              </div>
            </div>
          </div>

          <div class="cancel-warning">
            <div class="warning-icon">⚠️</div>
            <p class="warning-message">
              이 초대를 취소하면 해당 사용자는 <br>더 이상 프로젝트에 참여할 수 없습니다.
            </p>
            <p class="confirm-message">정말로 초대를 취소하시겠습니까?</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="confirmCancel" class="cancel-confirm-button">
            취소
          </button>
          <button @click="closeCancelModal" class="keep-button">
            유지
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const projectId = route.params.projectId || 1;

const invitations = ref([]);
const showCancelConfirmModal = ref(false);
const inviteToCancel = ref(null);
const inviteIndexToCancel = ref(null);

const fetchInvitations = async () => {
  try {
    const response = await fetch(`/api/v1/projects/${projectId}/members/invitation`);
    const result = await response.json();
    if (result.status === 200) {
      invitations.value = result.data;
    }
  } catch (error) {
    console.error('초대 목록을 불러오는 중 오류 발생:', error);
  }
};

// 취소 모달 표시
const showCancelModal = (invite, index) => {
  inviteToCancel.value = invite;
  inviteIndexToCancel.value = index;
  showCancelConfirmModal.value = true;
};

// 취소 확인
const confirmCancel = async () => {
  if (inviteToCancel.value) {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/members/invitation/cancel`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 1, email:inviteToCancel.value.email })
      });

      if (!response.ok) {
        throw new Error("초대 취소 실패");
      }

      invitations.value.splice(inviteIndexToCancel.value, 1);
      console.log(`초대 취소됨: ${inviteToCancel.value.email}`);
    } catch (error) {
      console.error('초대 취소 실패:', error);
      alert('초대 취소에 실패했습니다.');
    } finally {
      closeCancelModal();
    }
  }
};

// 취소 모달 닫기
const closeCancelModal = () => {
  showCancelConfirmModal.value = false;
  inviteToCancel.value = null;
  inviteIndexToCancel.value = null;
};

onMounted(() => {
  fetchInvitations();
});
</script>

<style scoped>
.invitation-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 2rem;
}

.invitation-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.invitation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.invitation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.invitation-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.invitation-info {
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

.invitation-details {
  flex: 1;
}

.invitation-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.invitation-email {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.status-badge.accepted {
  background: #dcfce7;
  color: #059669;
  border: 1px solid #bbf7d0;
}

.status-icon {
  font-size: 0.75rem;
}

.status-text {
  font-weight: 500;
}

.invitation-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.permission-display {
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

.permission-indicator {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid #e5e7eb;
}

.permission-indicator.write-access {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #10b981;
}

.permission-icon {
  font-size: 0.875rem;
}

.cancel-button {
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

.cancel-button:hover {
  background: #fecaca;
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.cancel-icon {
  font-size: 0.875rem;
}

/* 빈 상태 스타일 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.8;
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

.invitation-info-modal {
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

.invitation-details-modal {
  flex: 1;
}

.invitation-email-modal {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.invitation-status-modal {
  color: #6b7280;
  font-size: 0.75rem;
}

.status-badge-small {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 500;
}

.status-badge-small.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-small.accepted {
  background: #dcfce7;
  color: #059669;
}

/* 취소 모달 특별 스타일 */
.cancel-modal .modal-header {
  border-bottom-color: #fed7d7;
}

.cancel-warning {
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

.confirm-message {
  color: #374151;
  font-size: 0.875rem;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.keep-button {
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

.keep-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.cancel-confirm-button {
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

.cancel-confirm-button:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .invitation-container {
    padding: 1rem;
  }

  .invitation-item {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .invitation-info {
    justify-content: flex-start;
  }

  .invitation-actions {
    justify-content: space-between;
    width: 100%;
  }

  .permission-display {
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
  .invitation-container {
    padding: 0.75rem;
  }

  .invitation-list {
    padding: 1rem;
    gap: 0.75rem;
  }

  .invitation-item {
    padding: 1rem;
  }

  .invitation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .invitation-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .permission-display {
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }

  .modal-footer {
    flex-direction: column;
  }

  .keep-button,
  .cancel-confirm-button {
    width: 100%;
  }
}
</style>