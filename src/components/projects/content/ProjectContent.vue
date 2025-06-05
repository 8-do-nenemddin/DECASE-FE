<template>
  <div class="project-main project-content">
    <div class="table-container">
      <div class="header-section">
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

    <div class="grid-wrapper">
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
import { ref, onMounted } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// AG Grid 모듈 등록 (필수!)
ModuleRegistry.registerModules([AllCommunityModule]);

// 로딩 상태
const loading = ref(false);

// API 설정
const API_BASE_URL = "http://localhost:8080";
const projectId = ref(1); // 프로젝트 ID (실제로는 props나 router에서 받아올 수 있음)
const revisionCount = ref(1); // 리비전 수

// 컬럼 정의 - API 응답에 맞게 수정
const columnDefs = ref([
  {
    field: "reqIdCode",
    headerName: "요구사항 ID",
    editable: false,
    width: 120,
    pinned: "left", // 고정 컬럼
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
      // 수정된 행이지만 수정 이유가 없는 경우 빨간 배경
      if (params.data.isModified && !params.data.modification_reason) {
        return { backgroundColor: "#ffebee", border: "1px solid #f44336" };
      }
      return null;
    },
  },
]);

// 테이블 데이터
const rowData = ref([]);

// 수정된 행들을 추적하는 배열
const modifiedRows = ref(new Set());

// 기본 컬럼 설정
const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  minWidth: 100,
};

// 그리드 옵션
const gridOptions = {
  enableRangeSelection: true, // 범위 선택 가능
  enableCellChangeFlash: true, // 변경된 셀 하이라이트
  undoRedoCellEditing: true, // Ctrl+Z, Ctrl+Y 지원
  undoRedoCellEditingLimit: 20,
  stopEditingWhenCellsLoseFocus: true,
  rowSelection: "multiple", // 다중 행 선택
  animateRows: true,
  getRowHeight: () => 60, // 행 높이 증가 (여러 줄 텍스트 표시용)
};

let gridApi = null;

// 그리드 준비 완료 시
function onGridReady(params) {
  gridApi = params.api;
  console.log("AG Grid 준비 완료");
  // 그리드가 준비되면 자동으로 데이터 로드
  loadDataFromAPI();
}

// API 응답 데이터를 테이블 형태로 변환하는 함수
function transformApiDataToTableData(apiData) {
  return apiData.map((item) => {
    // 출처 정보 정제
    const sourcesDisplay = item.sources
      .map(
        (source) =>
          `${source.docId} (${source.pageNum}페이지)\n${source.relSentence}`
      )
      .join("\n\n");

    // 출처 ID 목록
    const sourceIds = item.sources.map((source) => source.sourceId).join(", ");

    // 변경이력 정제 (빈 문자열 제외)
    const modificationHistory = item.modReason
      .filter((reason) => reason && reason.trim() !== "")
      .join("\n\n");

    // 최종 변경 일자 변환 (YYYY-MM-DD -> YYYY.MM.DD)
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
      // API 원본 데이터 보존
      _originalApiData: item,
    };
  });
}

// API URL 생성 함수
function buildApiUrl(projectId, revisionCount) {
  const baseUrl = `${API_BASE_URL}/api/projects/${projectId}/requirements/generated`;
  const params = new URLSearchParams();

  if (revisionCount) {
    params.append("revisionCount", revisionCount);
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// API에서 데이터를 로드하는 함수
async function loadDataFromAPI() {
  if (!projectId.value || projectId.value < 1) {
    console.error("유효하지 않은 프로젝트 ID:", projectId.value);
    return;
  }

  if (!revisionCount.value || revisionCount.value < 1) {
    console.error("유효하지 않은 리비전 수:", revisionCount.value);
    return;
  }

  loading.value = true;
  try {
    console.log("API에서 데이터 로드 시작...");
    console.log("프로젝트 ID:", projectId.value);
    console.log("리비전 수:", revisionCount.value);

    // 동적 URL 생성
    const apiUrl = buildApiUrl(projectId.value, revisionCount.value);
    console.log("API URL:", apiUrl);

    // CORS 문제 해결을 위한 옵션들
    const requestOptions = {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      mode: "cors", // CORS 모드 명시적 설정
      credentials: "omit", // 쿠키 등 자격 증명 제외
    };

    // 실제 API 호출
    const response = await fetch(apiUrl, requestOptions);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    const apiData = await response.json();
    console.log("API 응답 데이터:", apiData);

    // 빈 배열 체크
    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.warn(
        `프로젝트 ID ${projectId.value}에 대한 요구사항 데이터가 없습니다.`
      );
      rowData.value = [];
      return;
    }

    // API 데이터를 테이블 형태로 변환
    const transformedData = transformApiDataToTableData(apiData);
    rowData.value = transformedData;

    // 수정 상태 초기화
    modifiedRows.value.clear();

    console.log("데이터 로드 완료:", transformedData);
    console.log(
      `${transformedData.length}개의 요구사항을 성공적으로 불러왔습니다.`
    );
  } catch (error) {
    console.error("❌ 데이터 로드 실패:", error);
    console.error("오류 상세:", error.message);

    // CORS 오류인지 확인
    if (error.message.includes("404")) {
      console.error(`프로젝트 ID ${projectId.value}를 찾을 수 없습니다.`);
    } else if (error.message.includes("500")) {
      console.error("서버 내부 오류가 발생했습니다.");
    } else {
      console.error("데이터를 불러오는 중 오류가 발생했습니다:", error.message);
    }
  } finally {
    loading.value = false;
  }
}

// 🎯 셀 값 변경 감지 - 수정 이유 체크 로직 추가!
function onCellValueChanged(event) {
  const { data, colDef, newValue, oldValue, rowIndex } = event;

  // 수정 이유 컬럼 변경인 경우는 별도 처리
  if (colDef.field === "modification_reason") {
    console.log("수정 이유가 입력됨:", newValue);
    // 그리드 새로고침으로 셀 스타일 업데이트
    gridApi.refreshCells({
      rowNodes: [gridApi.getRowNode(rowIndex)],
      columns: ["modification_reason"],
    });
    return;
  }

  // 원본 데이터 저장 (첫 수정시에만)
  if (!data.originalData) {
    data.originalData = { ...data };
    delete data.originalData.isModified;
    delete data.originalData.originalData;
    delete data.originalData.modification_reason;
  }

  // 수정 상태 마킹
  data.isModified = true;
  modifiedRows.value.add(data.reqIdCode);

  // 그리드 새로고침으로 수정 이유 셀 스타일 업데이트
  gridApi.refreshCells({
    rowNodes: [gridApi.getRowNode(rowIndex)],
    columns: ["modification_reason"],
  });
}

// 저장 버튼 클릭 시 호출되는 함수
function saveChanges() {
  console.log("=== 저장 시도 ===");

  const modifiedRowsData = rowData.value.filter((row) => row.isModified);

  // 백엔드 API 호출
  saveBulkChanges(modifiedRowsData);
}

// 일괄 저장 API 호출 함수
async function saveBulkChanges(modifiedData) {
  try {
    console.log("백엔드로 전송할 데이터:", modifiedData);

    // 실제 API 호출 (현재는 시뮬레이션)
    /*
    const response = await fetch('/api/bulk-update-requirements', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modifiedRows: modifiedData,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('일괄 업데이트 실패');
    }
    
    const result = await response.json();
    console.log('서버 응답:', result);
    */

    // 시뮬레이션 응답
    setTimeout(() => {
      console.log("✅ 일괄 저장 성공 (시뮬레이션)");

      // 저장 성공 후 수정 상태 초기화
      rowData.value.forEach((row) => {
        if (row.isModified) {
          row.isModified = false;
          row.originalData = null;
          row.modification_reason = "";
        }
      });

      modifiedRows.value.clear();

      // 그리드 새로고침
      gridApi.refreshCells();

      alert("모든 변경사항이 저장되었습니다!");
    }, 1000);
  } catch (error) {
    console.error("❌ 일괄 저장 실패:", error);
    alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

// 변경사항 취소 함수
function cancelChanges() {
  const modifiedRowsData = rowData.value.filter((row) => row.isModified);

  if (modifiedRowsData.length === 0) {
    alert("변경된 데이터가 없습니다.");
    return;
  }

  if (confirm(`${modifiedRowsData.length}개의 변경사항을 취소하시겠습니까?`)) {
    rowData.value.forEach((row) => {
      if (row.isModified && row.originalData) {
        // 원본 데이터로 복원
        Object.assign(row, row.originalData);
        row.isModified = false;
        row.originalData = null;
        row.modification_reason = "";
      }
    });

    modifiedRows.value.clear();

    // 그리드 새로고침
    gridApi.refreshCells();

    console.log("모든 변경사항이 취소되었습니다.");
  }
}

// 컴포넌트 마운트 시 자동 로드는 onGridReady에서 처리
onMounted(() => {
  console.log("컴포넌트 마운트 완료");
  console.log(
    `현재 설정 - 프로젝트 ID: ${projectId.value}, 리비전 수: ${revisionCount.value}`
  );
  // 그리드가 준비되면 onGridReady에서 자동으로 loadDataFromAPI()가 호출됩니다.
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

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.api-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.api-controls label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-field {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  width: 80px;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.table-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
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
}

.load-button {
  background-color: #3b82f6;
  color: white;
}

.load-button:hover {
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

/* 변경된 셀 하이라이트 */
:deep(.ag-cell-flash) {
  background-color: #fff3cd !important;
  transition: background-color 0.5s;
}

/* 헤더 텍스트 스타일 */
:deep(.ag-header-cell-text) {
  font-weight: 600;
}

/* 셀 텍스트 줄바꿈 처리 */
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

  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }

  .api-controls {
    justify-content: center;
  }

  .table-title {
    font-size: 20px;
    text-align: center;
  }

  .action-buttons {
    justify-content: center;
  }
}
</style>
