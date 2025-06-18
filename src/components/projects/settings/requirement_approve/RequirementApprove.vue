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
        <div class="table-controls">
          <button @click="bulkApprove" :disabled="selectedRequirements.length === 0" class="bulk-button approve">선택 승인</button>
          <button @click="bulkApprove" class="bulk-button approve">전체 승인</button>
          <button @click="bulkReject" class="bulk-button reject">전체 반려</button>
        </div>
        <div class="table-container">
          <div class="table-wrapper">
            <table class="requirements-table">
              <thead>
              <tr>
                <th class="col-toggle sticky-col" style="left: 0;"></th>
                <th class="col-select sticky-col" style="left: 40px;">선택</th>
                <th class="col-approval sticky-col" style="left: 90px;">승인/반려</th>
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
              </tr>
              </thead>
              <tbody>
              <template v-for="requirement in requirements" :key="requirement.id">
                <tr @click="toggleRow(requirement.proposed.id)" class="clickable-row">
                  <td class="col-toggle sticky-col" style="left: 0;">
                    <button @click.stop="toggleRow(requirement.proposed.id)" class="toggle-button">
                      {{ expandedRows.includes(requirement.proposed.id) ? '▼' : '▶' }}
                    </button>
                  </td>
                  <td class="col-select sticky-col" style="left: 40px;">
                    <input type="checkbox" v-model="selectedRequirements" :value="requirement.proposed.id" @click.stop />
                  </td>
                  <td class="col-approval sticky-col button-group" style="left: 90px;">
                    <button @click.stop="approveRequirement(requirement.proposed.id)" class="confirm-button approve">승인</button>
                    <button @click.stop="rejectRequirement(requirement.proposed.id)" class="confirm-button reject">반려</button>
                  </td>
                  <td class="col-id" :class="{ 'cell-changed': isChanged(requirement, 'id') }">{{ requirement.proposed.idCode }}</td>
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
                  <td class="col-date" :class="{ 'cell-changed': isChanged(requirement, 'modifiedDate') }">{{ formatDate(requirement.proposed.modifiedDate) }}</td>
                  <td class="col-modifier" :class="{ 'cell-changed': isChanged(requirement, 'modifier') }">{{ requirement.proposed.modifier }}</td>
                  <td class="col-reason" :class="{ 'cell-changed': isChanged(requirement, 'reason') }">{{ requirement.proposed.reason }}</td>
                </tr>
                <tr class="details-row" v-if="expandedRows.includes(requirement.proposed.id)">
                  <td></td>
                  <td colspan="16">
                    <div class="change-details-container">
                      <h4>수정된 항목 상세 비교</h4>

                      <div class="change-item" v-if="isChanged(requirement, 'type')">
                        <strong class="change-label">요구사항 유형</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.type }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.type }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'name')">
                        <strong class="change-label">요구사항명</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.name }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.name }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'description')">
                        <strong class="change-label">요구사항 설명</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.description }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.description }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'category1')">
                        <strong class="change-label">대분류</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.category1 }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.category1 }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'category2')">
                        <strong class="change-label">중분류</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.category2 }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.category2 }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'category3')">
                        <strong class="change-label">소분류</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.category3 }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.category3 }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'priority')">
                        <strong class="change-label">중요도</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.priority }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.priority }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'difficulty')">
                        <strong class="change-label">난이도</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.difficulty }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.difficulty }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'source')">
                        <strong class="change-label">출처</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.source }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.source }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'sourcePage')">
                        <strong class="change-label">출처 페이지</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.sourcePage }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.sourcePage }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'modifiedDate')">
                        <strong class="change-label">변경일자</strong>
                        <div class="change-content">
                          <span class="original-value">{{ formatDate(requirement.original.modifiedDate) }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ formatDate(requirement.proposed.modifiedDate) }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'modifier')">
                        <strong class="change-label">변경자</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.modifier }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.modifier }}</span>
                        </div>
                      </div>
                      <div class="change-item" v-if="isChanged(requirement, 'reason')">
                        <strong class="change-label">수정 이유</strong>
                        <div class="change-content">
                          <span class="original-value">{{ requirement.original.reason }}</span>
                          <span class="arrow">→</span>
                          <span class="proposed-value">{{ requirement.proposed.reason }}</span>
                        </div>
                      </div>

                    </div>
                  </td>
                </tr>
                <tr class="separator-row">
                  <td colspan="17"></td>
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

const fieldsToCompare = [
  { key: 'description', label: '요구사항 설명' },
  { key: 'category1', label: '대분류' },
  { key: 'category2', label: '중분류' },
  { key: 'category3', label: '소분류' },
  { key: 'type', label: '요구사항 유형' },
  { key: 'name', label: '요구사항명' },
  { key: 'priority', label: '중요도' },
  { key: 'difficulty', label: '난이도' },
  { key: 'source', label: '출처' },
  { key: 'sourcePage', label: '출처 페이지' },
  { key: 'modifiedDate', label: '변경일자' },
  { key: 'modifier', label: '변경자' },
  { key: 'reason', label: '수정 이유' },
];

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

// 날짜 포맷터: YYYY-MM-DD만 추출
const formatDate = (dateStr) => {
  return dateStr ? dateStr.split('T')[0] : '';
};

// 요구사항 목록
const requirements = ref([]);

// 수정된 요구사항 로드
const loadModifiedRequirements = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch(`/api/v1/projects/${projectStore.projectId}/requirements/pending`);
    if (!response.ok) throw new Error("서버 오류: " + response.status);
    const data = await response.json();
    // idCode 기준 오름차순 정렬 (localeCompare 사용)
    requirements.value = data.sort((a, b) => {
      return a.proposed.idCode.localeCompare(b.proposed.idCode);
    });
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
  showConfirmModal.value = true; // ✅ ensure modal opens
};

// 요구사항 반려
const rejectRequirement = (requirementId) => {
  confirmAction.value = "reject";
  targetRequirementId.value = requirementId;
  showConfirmModal.value = true; // ✅ ensure modal opens
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

      await fetch(`/api/v1/projects/${projectStore.projectId}/requirements/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ pendingPk: targetRequirementId.value, status: confirmAction.value === "approve" ? 2 : 1 }])
      });

      // 목록에서 제거
      requirements.value = requirements.value.filter(
          req => req.id !== targetRequirementId.value
      );

      successMessage.value = `요구사항이 ${action}되었습니다.`;
    } else {
      // 일괄 처리
      const action = confirmAction.value === "approve" ? "승인" : "반려";

      await fetch(`/api/v1/projects/${projectStore.projectId}/requirements/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRequirements.value.map(id => ({
          pendingPk: id,
          status: confirmAction.value === "approve" ? 2 : 1
        })))
      });

      // 목록에서 제거
      requirements.value = requirements.value.filter(
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
  loadModifiedRequirements();
});
const expandedRows = ref([]);
const toggleRow = (id) => {
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter(rowId => rowId !== id);
  } else {
    expandedRows.value.push(id);
  }
};
</script>

<style scoped>
/* 상세 비교 영역의 기본 행 스타일 */
.details-row > td {
  padding: 0 !important;
  /* 아래 내용이 비치지 않도록 배경색 지정 */
  background-color: #f7f9fc;
  border-bottom: 1px solid #e0e7ff;
}

/* 1. 스크롤을 따라 움직이는 투명 껍데기 */
.non-scrolling-wrapper {
  width: 100%;
}

/* 2. 실제 내용 컨테이너 */
.change-details-container {
  padding: 20px 30px;
  text-align: left;
}

.change-details-container h4 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.change-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.change-label {
  flex-basis: 120px;
  flex-shrink: 0;
  font-weight: 500;
  color: #4b5563;
  padding-top: 8px;
  font-size: 14px;
}

/* 3. Grid 레이아웃과 줄바꿈 처리를 위한 핵심 스타일 */
.change-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: start;
  width: 100%;
  max-width: 900px;
  padding: 8px;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.original-value,
.proposed-value {
  word-wrap: break-word;
  word-break: break-all;
  min-width: 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.original-value {
  color: #ef4444;
  text-decoration: line-through;
}

.arrow {
  color: #6b7280;
  font-weight: bold;
}

.proposed-value {
  color: #22c55e;
  font-weight: 600;
}

.requirement-approval-container { max-width: 1400px; margin: 0 auto; padding: 2rem; font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif; }
.main-content { transition: margin-left 0.3s; }
.table-controls { display: flex; justify-content: flex-end; gap: 0.5rem; margin-bottom: 1rem; }
.bulk-button { padding: 8px 14px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; background-color: #fff; }
.bulk-button:disabled { background-color: #f3f4f6; cursor: not-allowed; color: #9ca3af; }
.bulk-button.approve:not(:disabled):hover { border-color: #22c55e; color: #166534; background-color: #f0fdf4; }
.bulk-button.reject:not(:disabled):hover { border-color: #ef4444; color: #991b1b; background-color: #fef2f2; }

.table-container { width: 100%; overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
.table-wrapper { min-width: 1900px; }
.requirements-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
.requirements-table thead th { background-color: #f9fafb; padding: 12px 10px; text-align: center; font-weight: 600; color: #374151; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.requirements-table tbody td { padding: 10px; vertical-align: middle; text-align: center; border-bottom: 1px solid #f3f4f6; background-color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.requirements-table tbody tr:last-child td { border-bottom: none; }
.clickable-row { cursor: pointer; transition: background-color 0.1s ease-in-out; }
.clickable-row:hover { background-color: #f9fafb; }

.col-toggle { width: 40px; }
.col-select { width: 50px; }
.col-approval { width: 90px; }
.col-id { width: 150px; }
.col-type, .col-category, .col-priority, .col-difficulty, .col-source, .col-page, .col-modifier { width: 90px; }
.col-name { width: 220px; text-align: left;}
.col-description { width: 350px; white-space: normal; word-wrap: break-word; text-align: left; line-height: 1.5; }
.col-date { width: 100px; }
.col-reason { width: 250px; white-space: normal; word-wrap: break-word; text-align: left; line-height: 1.5; }

.sticky-col { position: sticky; z-index: 2; background-color: #fff; }
.clickable-row:hover .sticky-col { background-color: #f9fafb; }
.requirements-table thead th.sticky-col { background-color: #f9fafb; z-index: 11; }

.toggle-button { background: none; border: none; cursor: pointer; font-size: 16px; color: #9ca3af; }
.button-group { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.confirm-button { padding: 5px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; width: 60px; }
.confirm-button.approve { background-color: #10b981; color: white; }
.confirm-button.approve:hover { background-color: #059669; }
.confirm-button.reject { background-color: #ef4444; color: white; }
.confirm-button.reject:hover { background-color: #dc2626; }
.cell-changed { background-color: #f0fdf4 !important; }
.cell-changed > .original-value { text-decoration: line-through; }
/* Modal overlay and modal styles for floating modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  margin: 0 0 1rem;
  font-size: 15px;
  color: #374151;
}

.modal-warning {
  margin: 0;
  font-size: 13px;
  color: #ef4444;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.confirm-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background: #f3f4f6;
  color: #374151;
}

.confirm-button.approve {
  background: #10b981;
  color: white;
}

.confirm-button.reject {
  background: #ef4444;
  color: white;
}
</style>