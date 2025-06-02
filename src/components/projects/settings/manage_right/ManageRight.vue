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
                <span class="profile-badge">프로필</span>
                <span class="member-name">{{ member.name }}</span>
                <span class="member-department">{{ member.department }}</span>
              </div>
            </div>
          </div>

          <div class="member-actions">
            <div class="permission-dropdown">
              <select
                v-model="member.permission"
                @change="updatePermission(member.id, member.permission)"
                class="permission-select"
              >
                <option value="Read">Read</option>
                <option value="Read/Write">Read/Write</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button @click="deleteMember(index)" class="delete-button">
              삭제
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
  </div>
</template>

<script setup>
import { ref } from "vue";
import AddMemberModal from "./AddMemberModal.vue";
import AddSuccessModal from "./AddSuccessModal.vue";

const showAddMemberModal = ref(false);
const showSuccessModal = ref(false);

const members = ref([
  {
    id: 1,
    name: "최민주",
    department: "SK AX 미래혁신팀",
    permission: "Read/Write",
  },
  {
    id: 2,
    name: "이민주",
    department: "SK AX 미래혁신팀",
    permission: "Read/Write",
  },
  {
    id: 3,
    name: "강민주",
    department: "SK AX 재무팀",
    permission: "Read",
  },
  {
    id: 4,
    name: "박민주",
    department: "SK AX 인사팀",
    permission: "Read",
  },
]);

const updatePermission = (memberId, permission) => {
  console.log(`멤버 ${memberId}의 권한을 ${permission}으로 변경`);
  // 실제 권한 업데이트 로직
};

const deleteMember = (index) => {
  if (confirm("정말로 이 멤버를 삭제하시겠습니까?")) {
    members.value.splice(index, 1);
  }
};

// 모달 닫기 처리 (X버튼, 취소 버튼)
const handleModalClose = () => {
  console.log("AddMemberModal 닫기");
  showAddMemberModal.value = false;
};

// 초대 전송 처리 (전송 버튼 클릭 시)
const handleSendInvitations = (invitationData) => {
  console.log("초대 전송 처리:", invitationData);

  // 실제 초대 전송 API 호출 로직
  // API 호출이 성공하면 멤버 목록 업데이트 등의 로직 수행

  // AddMemberModal 닫기
  showAddMemberModal.value = false;

  // 성공 모달 표시
  showSuccessModal.value = true;
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

.profile-badge {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.member-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.member-department {
  color: #6b7280;
  font-size: 0.875rem;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.permission-dropdown {
  position: relative;
}

.permission-select {
  background: #1f2937;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  min-width: 100px;
  text-align: center;
  transition: all 0.3s ease;
}

.permission-select:hover {
  background: #374151;
}

.permission-select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.delete-button {
  background: #1f2937;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #374151;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.15);
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
  }

  .permission-select {
    min-width: 120px;
  }

  .modal {
    margin: 1rem;
    width: calc(100% - 2rem);
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

  .add-member-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
