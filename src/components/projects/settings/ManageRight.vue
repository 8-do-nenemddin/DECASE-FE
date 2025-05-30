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

    <!-- 멤버 추가 모달 -->
    <div v-if="showAddMemberModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">새 멤버 추가</h3>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">이름</label>
            <input
              v-model="newMember.name"
              type="text"
              class="form-input"
              placeholder="멤버 이름을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label class="form-label">부서</label>
            <input
              v-model="newMember.department"
              type="text"
              class="form-input"
              placeholder="부서명을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label class="form-label">권한</label>
            <select v-model="newMember.permission" class="form-select">
              <option value="Read">Read</option>
              <option value="Read/Write">Read/Write</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">취소</button>
          <button @click="addMember" class="btn-add">추가</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const showAddMemberModal = ref(false);

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

const newMember = reactive({
  name: "",
  department: "",
  permission: "Read",
});

const updatePermission = (memberId, permission) => {
  console.log(`멤버 ${memberId}의 권한을 ${permission}으로 변경`);
  // 실제 권한 업데이트 로직
};

const deleteMember = (index) => {
  if (confirm("정말로 이 멤버를 삭제하시겠습니까?")) {
    members.value.splice(index, 1);
  }
};

const addMember = () => {
  if (newMember.name && newMember.department) {
    members.value.push({
      id: Date.now(),
      name: newMember.name,
      department: newMember.department,
      permission: newMember.permission,
    });

    // 폼 리셋
    newMember.name = "";
    newMember.department = "";
    newMember.permission = "Read";

    closeModal();
  }
};

const closeModal = () => {
  showAddMemberModal.value = false;
  // 폼 리셋
  newMember.name = "";
  newMember.department = "";
  newMember.permission = "Read";
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

/* 모달 스타일 */
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
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-cancel,
.btn-add {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-add {
  background: #10b981;
  color: white;
  border: 1px solid #10b981;
}

.btn-add:hover {
  background: #059669;
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
