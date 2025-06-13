<template>
  <div class="requirement-approval-container">
    <!-- 로딩 상태 표시 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>수정된 요구사항을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 표시 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="loadModifiedRequirements" class="retry-button">다시 시도</button>
    </div>

    <!-- 수정된 요구사항 목록 -->
    <template v-else>
      <div class="main-content" :class="{ 'with-sidebar': showSidebar }">
        <div class="table-container">
          <div class="table-wrapper">
            <table class="requirements-table">
              <thead>
              <tr>
                <th class="col-division">구분</th>
                <th class="col-id">ID</th>
                <th class="col-type">요구사항 유형</th>
                <th class="col-name">요구사항명</th>
                <th class="col-description">요구사항 설명</th>
                <th class="col-category">대분류</th>
                <th class="col-category">중분류</th>
                <th class="col-category">소분류</th>
                <th class="col-priority">중요도</th>
                <th class="col-difficulty">난이도</th>
                <th class="col-source">출처</th>
                <th class="col-page">출처 페이지</th>
                <th class="col-date">변경일자</th>
                <th class="col-modifier">변경자</th>
                <th class="col-reason">수정 이유</th>
                <th class="col-approval">승인</th>
              </tr>
              </thead>
              <tbody>
              <template v-for="requirement in requirements" :key="requirement.id">
                <tr :class="{ 'selected': selectedRequirement?.id === requirement.id }" class="clickable-row">
                  <td class="row-label col-division">기존</td>
                  <td class="col-id">{{ requirement.original.id }}</td>
                  <td class="col-type">{{ requirement.original.type }}</td>
                  <td class="col-name">{{ requirement.original.name }}</td>
                  <td class="col-description">{{ requirement.original.description }}</td>
                  <td class="col-category">{{ requirement.original.category1 }}</td>
                  <td class="col-category">{{ requirement.original.category2 }}</td>
                  <td class="col-category">{{ requirement.original.category3 }}</td>
                  <td class="col-priority">{{ requirement.original.priority }}</td>
                  <td class="col-difficulty">{{ requirement.original.difficulty }}</td>
                  <td class="col-source">{{ requirement.original.source }}</td>
                  <td class="col-page">{{ requirement.original.sourcePage }}</td>
                  <td class="col-date">{{ requirement.original.modifiedDate }}</td>
                  <td class="col-modifier">{{ requirement.original.modifier }}</td>
                  <td class="col-reason">{{ requirement.original.reason }}</td>
                  <td rowspan="2" class="col-approval">
                    <button
                        @click.stop="approveRequirement(requirement.id)"
                        class="confirm-button approve"
                        style="margin-bottom: 5px"
                    >
                      승인
                    </button>
                    <button
                        @click.stop="rejectRequirement(requirement.id)"
                        class="confirm-button reject"
                        style="margin-top: 5px"
                    >
                      반려
                    </button>
                  </td>
                </tr>
                <tr :class="{ 'selected': selectedRequirement?.id === requirement.id }" class="clickable-row">
                  <td class="row-label col-division">제안</td>
                  <td class="col-id">{{ requirement.proposed.id }}</td>
                  <td class="col-type" :class="{ 'cell-changed': isChanged(requirement, 'type') }">{{ requirement.proposed.type }}</td>
                  <td class="col-name" :class="{ 'cell-changed': isChanged(requirement, 'name') }">{{ requirement.proposed.name }}</td>
                  <td class="col-description" :class="{ 'cell-changed': isChanged(requirement, 'description') }">{{ requirement.proposed.description }}</td>
                  <td class="col-category" :class="{ 'cell-changed': isChanged(requirement, 'category1') }">{{ requirement.proposed.category1 }}</td>
                  <td class="col-category" :class="{ 'cell-changed': isChanged(requirement, 'category2') }">{{ requirement.proposed.category2 }}</td>
                  <td class="col-category" :class="{ 'cell-changed': isChanged(requirement, 'category3') }">{{ requirement.proposed.category3 }}</td>
                  <td class="col-priority" :class="{ 'cell-changed': isChanged(requirement, 'priority') }">{{ requirement.proposed.priority }}</td>
                  <td class="col-difficulty" :class="{ 'cell-changed': isChanged(requirement, 'difficulty') }">{{ requirement.proposed.difficulty }}</td>
                  <td class="col-source" :class="{ 'cell-changed': isChanged(requirement, 'source') }">{{ requirement.proposed.source }}</td>
                  <td class="col-page" :class="{ 'cell-changed': isChanged(requirement, 'sourcePage') }">{{ requirement.proposed.sourcePage }}</td>
                  <td class="col-date" :class="{ 'cell-changed': isChanged(requirement, 'modifiedDate') }">{{ requirement.proposed.modifiedDate }}</td>
                  <td class="col-modifier" :class="{ 'cell-changed': isChanged(requirement, 'modifier') }">{{ requirement.proposed.modifier }}</td>
                  <td class="col-reason" :class="{ 'cell-changed': isChanged(requirement, 'reason') }">{{ requirement.proposed.reason }}</td>
                </tr>
              </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- 확인 모달 -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-icon" :class="confirmAction === 'approve' ? 'approve' : 'reject'">
            <span class="modal-icon-text">{{ confirmAction === 'approve' ? '✅' : '❌' }}</span>
          </div>
          <h3 class="modal-title">
            {{ confirmAction === 'approve' ? '승인 확인' : '반려 확인' }}
          </h3>
          <button @click="closeModal" class="modal-close-button">
            <span class="close-icon">×</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-message">
            {{ confirmAction === 'approve'
              ? '선택한 요구사항 수정을 승인하시겠습니까?'
              : '선택한 요구사항 수정을 반려하시겠습니까?'
            }}
          </p>
          <p class="modal-warning">이 작업은 되돌릴 수 없습니다.</p>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="cancel-button">취소</button>
          <button
              @click="confirmActionHandler"
              :disabled="processing"
              class="confirm-button"
              :class="confirmAction === 'approve' ? 'approve' : 'reject'"
          >
            {{ processing ? '처리 중...' : (confirmAction === 'approve' ? '승인' : '반려') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 성공 모달 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-icon success">
            <span class="modal-icon-text">✅</span>
          </div>
          <h3 class="modal-title">처리 완료</h3>
          <button @click="closeSuccessModal" class="modal-close-button">
            <span class="close-icon">×</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-message">{{ successMessage }}</p>
        </div>
        <div class="modal-actions">
          <button @click="closeSuccessModal" class="confirm-button approve">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import {useProjectStore} from "../../../../stores/projectStore.js";

const loading = ref(false);
const processing = ref(false);
const error = ref("");
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const confirmAction = ref("");
const targetRequirementId = ref(null);
const selectedRequirements = ref([]);
const successMessage = ref("");

const projectStore = useProjectStore();
const userId = projectStore.userId;

// Hardcoded demo data for UI testing
const requirements = ref([
  {
    id: 'REQ-001',
    original: {
      id: 'REQ-001',
      type: '기능',
      name: '로그인 기능',
      description: '사용자는 이메일과 비밀번호로 로그인할 수 있어야 한다.',
      category1: '인증',
      category2: '로그인',
      category3: '일반 사용자',
      priority: '높음',
      difficulty: '중간',
      source: 'RFP',
      sourcePage: '5',
      modifiedDate: '2024-06-01',
      modifier: '홍길동',
      reason: '초기 정의'
    },
    proposed: {
      id: 'REQ-001',
      type: '기능',
      name: '소셜 로그인 기능 추가',
      description: '사용자는 Google 또는 Kakao 계정으로도 로그인할 수 있어야 한다.',
      category1: '인증',
      category2: '로그인',
      category3: '소셜 연동',
      priority: '높음',
      difficulty: '높음',
      source: '회의록',
      sourcePage: '3',
      modifiedDate: '2025-06-10',
      modifier: '이영희',
      reason: '고객 요청 사항 반영'
    }
  },
  {
    id: 'REQ-002',
    original: {
      id: 'REQ-002',
      type: '비기능',
      name: '응답 시간',
      description: '모든 페이지는 3초 이내에 응답해야 한다.',
      category1: '성능',
      category2: '응답 속도',
      category3: '웹 클라이언트',
      priority: '중간',
      difficulty: '중간',
      source: 'RFP',
      sourcePage: '7',
      modifiedDate: '2024-06-01',
      modifier: '김민수',
      reason: '초기 정의'
    },
    proposed: {
      id: 'REQ-002',
      type: '비기능',
      name: '모바일 최적화 응답 시간',
      description: '모바일 환경에서는 2초 이내에 응답해야 한다.',
      category1: '성능',
      category2: '응답 속도',
      category3: '모바일',
      priority: '높음',
      difficulty: '높음',
      source: '회의록',
      sourcePage: '6',
      modifiedDate: '2025-06-11',
      modifier: '정지훈',
      reason: '성능 개선 필요'
    }
  }
]);

// 수정된 요구사항 로드
const loadModifiedRequirements = async () => {
  loading.value = true;
  error.value = "";

  try {
    // 실제 API 호출
  } catch (err) {
    console.error("요구사항 로드 오류:", err);
    error.value = err.message || "수정된 요구사항을 불러오는데 실패했습니다.";
  } finally {
    loading.value = false;
  }
};

const isChanged = (requirement, field) => {
  // original과 proposed 객체가 존재하고, 해당 필드가 모두 있는지 확인
  if (
      requirement &&
      requirement.original &&
      requirement.proposed &&
      Object.prototype.hasOwnProperty.call(requirement.original, field) &&
      Object.prototype.hasOwnProperty.call(requirement.proposed, field)
  ) {
    return requirement.original[field] !== requirement.proposed[field];
  }
  return false;
};

// 요구사항 승인
const approveRequirement = (requirementId) => {
  confirmAction.value = "approve";
  targetRequirementId.value = requirementId;
  showConfirmModal.value = true;
};

// 요구사항 반려
const rejectRequirement = (requirementId) => {
  confirmAction.value = "reject";
  targetRequirementId.value = requirementId;
  showConfirmModal.value = true;
};

// 일괄 승인
const bulkApprove = () => {
  confirmAction.value = "approve";
  targetRequirementId.value = null;
  showConfirmModal.value = true;
};

// 일괄 반려
const bulkReject = () => {
  confirmAction.value = "reject";
  targetRequirementId.value = null;
  showConfirmModal.value = true;
};

// 확인 액션 핸들러
const confirmActionHandler = async () => {
  processing.value = true;

  try {
    if (targetRequirementId.value) {
      // 단일 요구사항 처리
      const action = confirmAction.value === "approve" ? "승인" : "반려";

      // 실제 API 호출

      // 목록에서 제거
      modifiedRequirements.value = modifiedRequirements.value.filter(
          req => req.id !== targetRequirementId.value
      );

      successMessage.value = `요구사항이 ${action}되었습니다.`;
    } else {
      // 일괄 처리
      const action = confirmAction.value === "approve" ? "승인" : "반려";

      // 실제 API 호출

      // 목록에서 제거
      modifiedRequirements.value = modifiedRequirements.value.filter(
          req => !selectedRequirements.value.includes(req.id)
      );

      successMessage.value = `${selectedRequirements.value.length}개의 요구사항이 ${action}되었습니다.`;
      selectedRequirements.value = [];
    }

    showConfirmModal.value = false;
    showSuccessModal.value = true;
  } catch (err) {
    console.error("처리 오류:", err);
    error.value = "처리 중 오류가 발생했습니다.";
  } finally {
    processing.value = false;
  }
};

// 모달 닫기
const closeModal = () => {
  showConfirmModal.value = false;
  confirmAction.value = "";
  targetRequirementId.value = null;
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  successMessage.value = "";
};

onMounted(() => {
  // For UI testing: requirements are already hardcoded above and will show on mount.
});
</script>

<style scoped>
.requirement-approval-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

/* 로딩 및 에러 상태 스타일 (기존과 동일) */
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

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 420px;
  width: 100%;
  animation: modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modal-pop {
  from {
    transform: scale(0.9) translateY(10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  position: relative;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon.approve { background-color: #dcfce7; }
.modal-icon.reject { background-color: #fee2e2; }
.modal-icon.success { background-color: #dcfce7; }

.modal-icon-text {
  font-size: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.close-icon {
  line-height: 1;
}

.modal-body {
  padding: 0 1.5rem 1.5rem;
  font-size: 1rem;
  color: #4b5563;
}

.modal-message {
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.modal-warning {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background-color: #f9fafb;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  border-top: 1px solid #f3f4f6;
}

.cancel-button,
.confirm-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background-color: #ffffff;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.cancel-button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.confirm-button.approve {
  background-color: #10b981;
  color: white;
}
.confirm-button.approve:hover:not(:disabled) {
  background-color: #059669;
}

.confirm-button.reject {
  background-color: #ef4444;
  color: white;
}
.confirm-button.reject:hover:not(:disabled) {
  background-color: #dc2626;
}

.confirm-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

/* 테이블 컨테이너 */
.table-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 80vh;
}

.table-wrapper {
  min-width: 1400px; /* 최소 너비 설정 */
}

/* 메인 테이블 스타일 */
.requirements-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
  background-color: #fff;
}

/* 테이블 헤더 */
.requirements-table thead th {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 테이블 바디 */
.requirements-table tbody td {
  border: 1px solid #ddd;
  padding: 8px;
  vertical-align: top;
  background-color: #fff;
}

/* 컬럼별 너비 설정 */
.col-division {
  width: 60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-id {
  width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-type {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-name {
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-description {
  width: 300px;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.4;
}

.col-category {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-priority {
  width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-difficulty {
  width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-source {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-page {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-date {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-modifier {
  width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-reason {
  width: 300px;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.4;
}

.col-approval {
  width: 100px;
  text-align: center;
  vertical-align: middle;
}

/* 행 라벨 스타일 */
.row-label {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: center;
}

/* 클릭 가능한 행 */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f0f8ff;
}

.clickable-row.selected {
  background-color: #e6f3ff;
}

/* 승인/반려 버튼 */
.confirm-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 80px;
}

.confirm-button.approve {
  background-color: #28a745;
  color: white;
}

.confirm-button.approve:hover {
  background-color: #218838;
}

.confirm-button.reject {
  background-color: #dc3545;
  color: white;
}

.confirm-button.reject:hover {
  background-color: #c82333;
}

/* 사이드바와 함께 사용될 때 */
.main-content.with-sidebar {
  margin-left: 250px;
}

.main-content {
  transition: margin-left 0.3s;
  padding: 20px;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .requirements-table {
    font-size: 12px;
  }

  .col-description,
  .col-reason {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
  }

  .requirements-table {
    font-size: 11px;
  }

  .col-description,
  .col-reason {
    width: 150px;
  }
}

/* 내용이 변경된 셀을 위한 하이라이트 스타일 */
.cell-changed {
  background-color: #81c147; /* 연한 노란색 배경 */
  font-weight: 600; /* 폰트 살짝 굵게 */
  color: #81c147; /* 살짝 어두운 텍스트 색상 */
  transition: background-color 0.3s ease;
}
</style>