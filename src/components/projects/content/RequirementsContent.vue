<template>
  <div class="project-main project-content">
    <div class="table-container">
      <div class="header-section">
        <div class="content-info">
          <h2 class="content-title">📋 요구사항 정의서</h2>
          <div class="file-details">
            <span class="detail-item">프로젝트 ID: {{ projectId }}</span>
            <span class="detail-item">리비전: {{ revision }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button
            @click="loadDataFromAPI"
            class="load-button"
            :disabled="loading"
          >
            {{ loading ? "🔄 로딩중..." : "🔄 데이터 새로고침" }}
          </button>
          <button
            @click="saveChanges"
            class="save-button"
            :disabled="modifiedRows.size === 0"
          >
            💾 저장 ({{ modifiedRows.size }})
          </button>
          <button
            @click="cancelChanges"
            class="cancel-button"
            :disabled="modifiedRows.size === 0"
          >
            ❌취소
          </button>
        </div>
      </div>
    </div>

    <div v-if="modifiedRows.size > 0" class="modification-notice">
      ⚠️ {{ modifiedRows.size }}개의 행이 수정되었습니다. 저장하기 전에 모든
      수정 이유를 입력해주세요.
    </div>

    <div v-if="loading" class="loading-notice">🔄 데이터를 불러오는 중...</div>

    <div v-if="error" class="error-notice">
      ❌ {{ error }}
      <button @click="loadDataFromAPI" class="retry-button">다시 시도</button>
    </div>

    <div class="grid-wrapper" v-if="!error">
      <ag-grid-vue
        class="ag-theme-alpine"
        style="height: 600px; width: 100%"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :gridOptions="gridOptions"
        @cell-value-changed="onCellValueChanged"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  revision: {
    type: Number,
    required: true,
  },
});

// 상태 관리
const loading = ref(false);
const error = ref(null);
const rowData = ref([]);
const modifiedRows = ref(new Set());

// 컬럼 정의
const columnDefs = ref([
  {
    field: "reqIdCode",
    headerName: "요구사항 ID",
    editable: false,
    width: 120,
    pinned: "left",
  },
  {
    field: "type",
    headerName: "요구사항 유형",
    editable: true,
    width: 120,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["기능", "비기능"],
    },
    valueFormatter: (params) => {
      return params.value === "FR"
        ? "기능"
        : params.value === "NFR"
        ? "비기능"
        : params.value;
    },
  },
  {
    field: "level1",
    headerName: "대분류",
    editable: true,
    width: 200,
  },
  {
    field: "level2",
    headerName: "중분류",
    editable: true,
    width: 200,
  },
  {
    field: "level3",
    headerName: "소분류",
    editable: true,
    width: 200,
  },
  {
    field: "name",
    headerName: "요구사항 명",
    editable: true,
    width: 250,
    cellEditor: "agLargeTextCellEditor",
    cellEditorPopup: true,
  },
  {
    field: "description",
    headerName: "요구사항 설명",
    editable: true,
    width: 200,
    cellEditor: "agLargeTextCellEditor",
    cellEditorPopup: true,
  },
  {
    field: "priority",
    headerName: "중요도",
    editable: true,
    width: 100,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["상", "중", "하"],
    },
    valueFormatter: (params) => {
      const priorityMap = { HIGH: "상", MIDDLE: "중", LOW: "하" };
      return priorityMap[params.value] || params.value;
    },
  },
  {
    field: "difficulty",
    headerName: "난이도",
    editable: true,
    width: 100,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["상", "중", "하"],
    },
    valueFormatter: (params) => {
      const difficultyMap = { HIGH: "상", MIDDLE: "중", LOW: "하" };
      return difficultyMap[params.value] || params.value;
    },
  },
  {
    field: "sourcesDisplay",
    headerName: "출처",
    editable: true,
    cellEditor: "agLargeTextCellEditor",
    width: 300,
    cellRenderer: (params) => {
      if (!params.value) return "";
      return `<div style="white-space: pre-line; line-height: 1.4;">${params.value}</div>`;
    },
  },
  {
    field: "sourceIds",
    headerName: "출처 ID",
    editable: true,
    width: 120,
  },
  {
    field: "managementStatus",
    headerName: "관리구분",
    editable: true,
    cellEditor: "agSelectCellEditor",
    width: 100,
    valueFormatter: (params) => {
      const statusMap = { true: "삭제", false: "등록" };
      return statusMap[params.value] || params.value;
    },
    cellStyle: (params) => {
      if (params.value === "삭제") {
        return { backgroundColor: "#ffebee", color: "#c62828" };
      }
      return { backgroundColor: "#e8f5e8", color: "#2e7d32" };
    },
  },
  {
    field: "modificationHistory",
    headerName: "변경이력",
    editable: true,
    width: 250,
    cellEditor: "agLargeTextCellEditor",
    cellRenderer: (params) => {
      if (!params.value) return "";
      return `<div style="white-space: pre-line; line-height: 1.4;">${params.value}</div>`;
    },
  },
  {
    field: "lastModifiedDate",
    headerName: "최종 변경 일자",
    editable: true,
    width: 130,
  },
  {
    field: "modification_reason",
    headerName: "수정 이유",
    editable: true,
    width: 200,
    cellEditor: "agLargeTextCellEditor",
    cellEditorPopup: true,
    cellStyle: (params) => {
      if (params.data.isModified && !params.data.modification_reason) {
        return { backgroundColor: "#ffebee", border: "1px solid #f44336" };
      }
      return null;
    },
  },
]);

// 기본 컬럼 설정
const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  minWidth: 100,
};

// 그리드 옵션
const gridOptions = {
  enableRangeSelection: true,
  enableCellChangeFlash: true,
  undoRedoCellEditing: true,
  undoRedoCellEditingLimit: 20,
  stopEditingWhenCellsLoseFocus: true,
  rowSelection: "multiple",
  animateRows: true,
  getRowHeight: () => 60,
};

let gridApi = null;

// 그리드 준비 완료 시
function onGridReady(params) {
  gridApi = params.api;
  console.log("AG Grid 준비 완료");
  loadDataFromAPI();
}

// API 응답 데이터를 테이블 형태로 변환
function transformApiDataToTableData(apiData) {
  return apiData.map((item) => {
    const sourcesDisplay = item.sources
      .map(
        (source) =>
          `${source.docId} (${source.pageNum}페이지)\n${source.relSentence}`
      )
      .join("\n\n");

    const sourceIds = item.sources.map((source) => source.sourceId).join(", ");

    const modificationHistory = item.modReason
      .filter((reason) => reason && reason.trim() !== "")
      .join("\n\n");

    const lastModifiedDate = item.createdDate.replace(/-/g, ".");

    return {
      reqPk: item.reqPk,
      reqIdCode: item.reqIdCode,
      revisionCount: item.revisionCount,
      type: item.type === "FR" ? "기능" : "비기능",
      level1: item.level1,
      level2: item.level2,
      level3: item.level3,
      name: item.name,
      description: item.description,
      priority:
        item.priority === "HIGH"
          ? "상"
          : item.priority === "MIDDLE"
          ? "중"
          : "하",
      difficulty:
        item.difficulty === "HIGH"
          ? "상"
          : item.difficulty === "MIDDLE"
          ? "중"
          : "하",
      sourcesDisplay: sourcesDisplay,
      sourceIds: sourceIds,
      managementStatus: item.isDeleted ? "삭제" : "등록",
      modificationHistory: modificationHistory,
      lastModifiedDate: lastModifiedDate,
      modification_reason: "",
      isModified: false,
      originalData: null,
      _originalApiData: item,
    };
  });
}

// API에서 데이터 로드
async function loadDataFromAPI() {
  if (!props.projectId || !props.revision) {
    error.value = "프로젝트 ID 또는 리비전 정보가 없습니다.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    console.log("요구사항 데이터 로드:", {
      projectId: props.projectId,
      revision: props.revision,
    });

    const apiUrl = `/api/projects/${props.projectId}/requirements/generated?revisionCount=${props.revision}`;
    console.log("API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    const apiData = await response.json();
    console.log("API 응답 데이터:", apiData);

    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.warn(
        `리비전 ${props.revision}에 대한 요구사항 데이터가 없습니다.`
      );
      rowData.value = [];
      return;
    }

    const transformedData = transformApiDataToTableData(apiData);
    rowData.value = transformedData;
    modifiedRows.value.clear();

    console.log("데이터 로드 완료:", transformedData);
  } catch (err) {
    console.error("❌ 데이터 로드 실패:", err);
    error.value = err.message || "데이터를 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
}

// 셀 값 변경 감지
function onCellValueChanged(event) {
  const { data, colDef, newValue, oldValue, rowIndex } = event;

  if (colDef.field === "modification_reason") {
    console.log("수정 이유가 입력됨:", newValue);
    gridApi.refreshCells({
      rowNodes: [gridApi.getRowNode(rowIndex)],
      columns: ["modification_reason"],
    });
    return;
  }

  if (!data.originalData) {
    data.originalData = { ...data };
    delete data.originalData.isModified;
    delete data.originalData.originalData;
    delete data.originalData.modification_reason;
  }

  data.isModified = true;
  modifiedRows.value.add(data.reqIdCode);

  gridApi.refreshCells({
    rowNodes: [gridApi.getRowNode(rowIndex)],
    columns: ["modification_reason"],
  });
}

// 저장 함수
function saveChanges() {
  console.log("=== 저장 시도 ===");
  const modifiedRowsData = rowData.value.filter((row) => row.isModified);
  saveBulkChanges(modifiedRowsData);
}

// 일괄 저장 API 호출
async function saveBulkChanges(modifiedData) {
  try {
    console.log("백엔드로 전송할 데이터:", modifiedData);

    // 시뮬레이션 응답
    setTimeout(() => {
      console.log("✅ 일괄 저장 성공 (시뮬레이션)");

      rowData.value.forEach((row) => {
        if (row.isModified) {
          row.isModified = false;
          row.originalData = null;
          row.modification_reason = "";
        }
      });

      modifiedRows.value.clear();
      gridApi.refreshCells();
      alert("모든 변경사항이 저장되었습니다!");
    }, 1000);
  } catch (error) {
    console.error("❌ 일괄 저장 실패:", error);
    alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

// 변경사항 취소
function cancelChanges() {
  const modifiedRowsData = rowData.value.filter((row) => row.isModified);

  if (modifiedRowsData.length === 0) {
    alert("변경된 데이터가 없습니다.");
    return;
  }

  if (confirm(`${modifiedRowsData.length}개의 변경사항을 취소하시겠습니까?`)) {
    rowData.value.forEach((row) => {
      if (row.isModified && row.originalData) {
        Object.assign(row, row.originalData);
        row.isModified = false;
        row.originalData = null;
        row.modification_reason = "";
      }
    });

    modifiedRows.value.clear();
    gridApi.refreshCells();
    console.log("모든 변경사항이 취소되었습니다.");
  }
}

// props 변경 감지
watch(
  [() => props.projectId, () => props.revision],
  ([newProjectId, newRevision], [oldProjectId, oldRevision]) => {
    if (
      (newProjectId && newProjectId !== oldProjectId) ||
      (newRevision && newRevision !== oldRevision)
    ) {
      console.log(
        `요구사항 데이터 변경: projectId=${newProjectId}, revision=${newRevision}`
      );
      if (gridApi) {
        loadDataFromAPI();
      }
    }
  },
  { immediate: false }
);

onMounted(() => {
  console.log("RequirementsContent 마운트됨:", {
    projectId: props.projectId,
    revision: props.revision,
  });
});
</script>

<style scoped>
.grid-wrapper {
  padding: 0px 10px;
}

.table-container {
  padding: 20px;
  background-color: #ffffff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.content-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.file-details {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  background: #f3f4f6;
  color: #374151;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.load-button,
.save-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.load-button {
  background-color: #3b82f6;
  color: white;
}

.load-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.save-button {
  background-color: #10b981;
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #059669;
}

.save-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #ef4444;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.cancel-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.modification-notice {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 500;
}

.loading-notice {
  background-color: #dbeafe;
  border: 1px solid #3b82f6;
  color: #1e40af;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 500;
}

.error-notice {
  background-color: #fef2f2;
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-button {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #dc2626;
}

/* AG Grid 테마 커스터마이징 */
:deep(.ag-theme-alpine) {
  --ag-header-background-color: #f8f9fa;
  --ag-header-foreground-color: #495057;
  --ag-odd-row-background-color: #ffffff;
  --ag-even-row-background-color: #f8f9fa;
  --ag-row-hover-color: #e3f2fd;
  --ag-selected-row-background-color: #bbdefb;
  font-size: 13px;
}

:deep(.ag-cell-flash) {
  background-color: #fff3cd !important;
  transition: background-color 0.5s;
}

:deep(.ag-header-cell-text) {
  font-weight: 600;
}

:deep(.ag-cell) {
  line-height: 1.4;
  display: flex;
  align-items: center;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .table-container {
    padding: 10px;
  }

  .header-section {
    gap: 12px;
  }

  .content-title {
    font-size: 20px;
  }

  .action-buttons {
    justify-content: center;
  }

  .file-details {
    justify-content: center;
  }

  .error-notice {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
