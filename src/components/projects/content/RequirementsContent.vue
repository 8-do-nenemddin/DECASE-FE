<template>
  <div class="project-main project-content">
    <div class="table-container">
      <div class="header-section">
        <div class="content-info">
          <h2 class="content-title">
            <span> </span>
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              ></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span> 요구사항 정의서 </span>
          </h2>
          <div class="file-details">
            <span class="detail-item">ver. {{ revision }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button
            v-if="mockupExists"
            @click="viewMockup"
            class="mockup-button-view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>목업 보러가기</span>
          </button>
          <button
            v-if="!mockupExists"
            @click="createMockup"
            class="mockup-button"
            :disabled="loading"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>목업 생성</span>
          </button>
          <button
            @click="downloadRequirements"
            class="load-button"
            :disabled="loading"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{{ loading ? "다운로드중..." : "다운로드" }}</span>
          </button>
          <button
            @click="saveChanges"
            class="save-button"
            :disabled="modifiedRows.size === 0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
              />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>수정 요청 ({{ modifiedRows.size }})</span>
          </button>
          <button
            @click="cancelChanges"
            class="cancel-button"
            :disabled="modifiedRows.size === 0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>취소</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="modifiedRows.size > 0" class="modification-notice">
      ⚠️ {{ modifiedRows.size }}개의 행이 수정되었습니다. 저장하기 전에 모든
      수정 사유를 입력해주세요. 수정 사유는 변경 이력에 자동 반영됩니다.
    </div>

    <div v-if="loading" class="loading-notice">🔄 데이터를 불러오는 중...</div>

    <div v-if="error" class="error-notice">
      ❌ {{ error }}
      <button @click="loadDataFromAPI" class="retry-button">다시 시도</button>
    </div>

    <!-- 행 높이 조절 버튼: 표 바로 위에 위치 -->
    <div
      class="row-height-buttons"
      style="
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 8px;
        margin-top: 8px;
        margin-right: 10px;
      "
    >
      <button
        :class="{ active: rowHeightLevel === 1 }"
        @click="setRowHeightLevel(1)"
        title="좁게"
        style="background: none; border: none; cursor: pointer"
      >
        <svg width="24" height="24">
          <rect x="4" y="6" width="16" height="2" rx="1" fill="#3b82f6" />
          <rect x="4" y="10" width="16" height="2" rx="1" fill="#3b82f6" />
          <rect x="4" y="14" width="16" height="2" rx="1" fill="#3b82f6" />
          <rect x="4" y="18" width="16" height="2" rx="1" fill="#3b82f6" />
        </svg>
      </button>
      <button
        :class="{ active: rowHeightLevel === 2 }"
        @click="setRowHeightLevel(2)"
        title="중간"
        style="background: none; border: none; cursor: pointer"
      >
        <svg width="24" height="24">
          <rect x="4" y="5" width="16" height="4" rx="1.5" fill="#3b82f6" />
          <rect x="4" y="11" width="16" height="4" rx="1.5" fill="#3b82f6" />
          <rect x="4" y="17" width="16" height="4" rx="1.5" fill="#3b82f6" />
        </svg>
      </button>
      <button
        :class="{ active: rowHeightLevel === 3 }"
        @click="setRowHeightLevel(3)"
        title="넓게"
        style="background: none; border: none; cursor: pointer"
      >
        <svg width="24" height="24">
          <rect x="4" y="4" width="16" height="5" rx="2.5" fill="#3b82f6" />
          <rect x="4" y="11" width="16" height="5" rx="2.5" fill="#3b82f6" />
          <rect x="4" y="18" width="16" height="5" rx="2.5" fill="#3b82f6" />
        </svg>
      </button>
    </div>

    <div class="grid-wrapper" v-if="!error">
      <ag-grid-vue
        class="ag-theme-alpine"
        style="height: 600px; width: 100%"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :gridOptions="gridOptions"
        :headerHeight="55"
        @cell-value-changed="onCellValueChanged"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive, onUnmounted, nextTick } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useProjectStore } from "/src/stores/projectStore.js";

const projectStore = useProjectStore();
const userId = projectStore.userId;

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

const emit = defineEmits(["mockupFileSelected"]);

// 상태 관리
const loading = ref(false);
const error = ref(null);
const rowData = ref([]);
const modifiedRows = ref(new Set());
const searchParams = ref(null);
const mockupExists = ref(true); // 초기값은 false
const gridApi = ref(null);
const rowHeightLevel = ref(1); // 1: 작게, 2: 중간, 3: 크게

const rowHeightOptions = {
  1: 28, // 글자 1개 높이
  2: 200, // 문장 3개 정도
  3: 500, // 글자 10개 정도
};

function setRowHeightLevel(level) {
  rowHeightLevel.value = level;
  if (gridApi.value) {
    gridApi.value.resetRowHeights();
  }
}
const fullList = ref([]);

// 컬럼 정의
const columnDefs = ref([
  {
    field: "reqIdCode",
    headerName: "요구사항 ID",
    editable: false,
    width: 140,
    pinned: "left",
  },
  {
    field: "type",
    headerName: "요구사항\n 유형",
    editable: true,
    width: 50,
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
    width: 150,
  },
  {
    field: "level2",
    headerName: "중분류",
    editable: true,
    width: 150,
  },
  {
    field: "level3",
    headerName: "소분류",
    editable: true,
    width: 150,
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
    width: 300,
    cellEditor: "agLargeTextCellEditor",
    cellEditorPopup: true,
  },
  {
    field: "priority",
    headerName: "중요도",
    editable: true,
    width: 50,
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
    width: 50,
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
    width: 50,
  },
  {
    field: "managementStatus",
    headerName: "관리\n구분",
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["등록", "삭제"],
    },
    width: 50,
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
  // undoRedoCellEditingLimit: 20,
  stopEditingWhenCellsLoseFocus: true,
  rowSelection: "multiple",
  animateRows: true,
  getRowHeight: () => rowHeightOptions[rowHeightLevel.value],
};

// 그리드 준비 완료 시
function onGridReady(params) {
  gridApi.value = params.api;
  console.log("AG Grid 준비 완료");
  // 그리드가 준비된 후에 데이터 로드
  nextTick(() => {
    loadDataFromAPI();
  });
}

// API 응답 데이터를 테이블 형태로 변환
function transformApiDataToTableData(apiData) {
  return apiData.map((item) => {
    // Handle sources if they exist, otherwise use empty array
    const sourcesDisplay =
      item.sources && item.sources.length > 0
        ? item.sources
            .map(
              (source) =>
                `${source.docId} (${source.pageNum}페이지)\n${source.relSentence}`
            )
            .join("\n\n")
        : "";

    const sourceIds =
      item.sources && item.sources.length > 0
        ? item.sources.map((source) => source.sourceId).join(", ")
        : "";

    // Handle modification reasons if they exist, otherwise use empty array
    const modificationHistory =
      item.modReason && Array.isArray(item.modReason)
        ? item.modReason
            .filter((reason) => reason && reason.trim() !== "")
            .join("\n\n")
        : "";

    const lastModifiedDate = item.createdDate
      ? item.createdDate.replace(/-/g, ".")
      : "";

    // Store raw values for type, priority, and difficulty
    return {
      reqPk: item.reqPk,
      reqIdCode: item.reqIdCode,
      revisionCount: item.revisionCount,
      type: item.type === "FR" ? "기능" : "비기능",
      level1: item.level1 || "",
      level2: item.level2 || "",
      level3: item.level3 || "",
      name: item.name || "",
      description: item.description || "",
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

// 검색 이벤트 핸들러
const handleSearch = async (params) => {
  try {
    loading.value = true;
    error.value = null;
    searchParams.value = params;

    if (!props.projectId || !props.revision) {
      error.value = "프로젝트 ID 또는 리비전 정보가 없습니다.";
      return;
    }

    // 검색 파라미터 상세 로깅
    console.log("=== 검색 파라미터 상세 정보 ===");
    console.log("1. 기본 정보:");
    console.log("- 프로젝트 ID:", props.projectId);
    console.log("- 리비전:", props.revision);
    console.log("2. 검색 조건:");
    console.log("- 검색어:", params.query);
    console.log("- 대분류:", params.level1);
    console.log("- 중분류:", params.level2);
    console.log("- 소분류:", params.level3);
    console.log("- 유형:", params.type);
    console.log("- 중요도:", params.priority);
    console.log("- 난이도:", params.difficulty);
    console.log("- 문서 유형:", params.docType);
    console.log("3. 전체 파라미터 객체:", params);

    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append("query", params.query);
    if (params.level1) queryParams.append("level1", params.level1);
    if (params.level2) queryParams.append("level2", params.level2);
    if (params.level3) queryParams.append("level3", params.level3);

    // type 파라미터 처리 (0: 기능, 1: 비기능)
    if (params.type !== undefined && params.type !== null) {
      queryParams.append("type", params.type);
    }

    // difficulty 파라미터 처리 (0: 상, 1: 중, 2: 하)
    if (params.difficulty !== undefined && params.difficulty !== null) {
      queryParams.append("difficulty", params.difficulty);
    }

    // priority 파라미터 처리 (0: 상, 1: 중, 2: 하)
    if (params.priority !== undefined && params.priority !== null) {
      queryParams.append("priority", params.priority);
    }

    if (params.docType && Array.isArray(params.docType)) {
      params.docType.forEach((type) => queryParams.append("docType", type));
    }

    // 리비전 정보 추가
    queryParams.append("revisionCount", props.revision);

    const apiUrl = `/api/v1/projects/${
      props.projectId
    }/documents/search?${queryParams.toString()}`;

    // API URL 로깅
    console.log("=== API 요청 정보 ===");
    console.log("1. 요청 URL:", apiUrl);
    console.log("2. 쿼리 파라미터:");
    for (const [key, value] of queryParams.entries()) {
      console.log(`- ${key}: ${value}`);
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      credentials: "include", // 쿠키 포함
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`검색 요청이 실패했습니다. (${response.status})`);
    }

    const responseData = await response.json();
    console.log("Search API Response:", responseData);

    // 응답 데이터 구조 확인 및 처리
    let apiData;
    if (responseData && responseData.data) {
      apiData = responseData.data;
    } else if (Array.isArray(responseData)) {
      apiData = responseData;
    } else {
      console.error("예상치 못한 응답 구조:", responseData);
      throw new Error("응답 데이터 구조가 올바르지 않습니다.");
    }

    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.warn("검색 결과가 없습니다.");
      rowData.value = [];
      return;
    }

    // 데이터 변환 및 그리드 업데이트
    const transformedData = transformApiDataToTableData(apiData);
    console.log("변환된 데이터:", transformedData);

    // rowData를 먼저 업데이트
    rowData.value = transformedData;
    modifiedRows.value.clear();

    // gridApi가 준비되었는지 확인하고 데이터 설정
    await nextTick();
    if (gridApi.value && typeof gridApi.value.setRowData === "function") {
      gridApi.value.setRowData(transformedData);
      gridApi.value.refreshCells();
      gridApi.value.sizeColumnsToFit();
    } else {
      console.warn("AG Grid가 아직 초기화되지 않았습니다.");
    }

    console.log("검색 결과 로드 완료. 결과 수:", transformedData.length);
  } catch (err) {
    console.error("❌ 검색 실패:", err);
    error.value = err.message || "검색 중 오류가 발생했습니다.";
    rowData.value = [];
  } finally {
    loading.value = false;
  }
};

// API에서 데이터 로드
async function loadDataFromAPI() {
  if (!props.projectId || !props.revision) {
    error.value = "프로젝트 ID 또는 리비전 정보가 없습니다.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    let apiUrl;
    if (searchParams.value) {
      // 검색 파라미터가 있는 경우 검색 API 사용
      const queryParams = new URLSearchParams();
      if (searchParams.value.query)
        queryParams.append("query", searchParams.value.query);
      if (searchParams.value.level1)
        queryParams.append("level1", searchParams.value.level1);
      if (searchParams.value.level2)
        queryParams.append("level2", searchParams.value.level2);
      if (searchParams.value.level3)
        queryParams.append("level3", searchParams.value.level3);
      if (searchParams.value.type)
        queryParams.append("type", searchParams.value.type);
      if (searchParams.value.difficulty)
        queryParams.append("difficulty", searchParams.value.difficulty);
      if (searchParams.value.priority)
        queryParams.append("priority", searchParams.value.priority);
      if (searchParams.value.docType) {
        searchParams.value.docType.forEach((type) =>
          queryParams.append("docType", type)
        );
      }

      apiUrl = `/api/v1/projects/${
        props.projectId
      }/documents/search?${queryParams.toString()}`;
    } else {
      // 일반 요구사항 로드
      apiUrl = `/api/v1/projects/${props.projectId}/requirements/generated?revisionCount=${props.revision}`;
    }

    console.log("API URL:", apiUrl);

    const mockupCheckUrl = `/api/v1/projects/${props.projectId}/mockups/${props.revision}/exist`;

    const [requirementsResponse, mockupResponse] = await Promise.all([
      fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
      }),
      fetch(mockupCheckUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
      }),
    ]);

    if (!requirementsResponse.ok || !mockupResponse.ok) {
      throw new Error("하나 이상의 API 요청이 실패했습니다.");
    }

    const responseData = await requirementsResponse.json();
    const mockupData = await mockupResponse.json();
    mockupExists.value = mockupData.mockupExists;

    console.log("Mockup 존재 여부:", mockupExists);
    console.log("API 응답 데이터:", responseData);

    let apiData;
    if (responseData.data && Array.isArray(responseData.data)) {
      apiData = responseData.data;
    } else if (Array.isArray(responseData)) {
      apiData = responseData;
    } else {
      console.error("예상치 못한 응답 구조:", responseData);
      throw new Error("응답 데이터 구조가 올바르지 않습니다.");
    }

    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.warn("검색 결과가 없습니다.");
      rowData.value = [];
      fullList.value = [];
      return;
    }

    const transformedData = transformApiDataToTableData(apiData);
    rowData.value = transformedData;
    fullList.value = transformedData;
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
    gridApi.value.refreshCells({
      rowNodes: [gridApi.value.getRowNode(rowIndex)],
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

  gridApi.value.refreshCells({
    rowNodes: [gridApi.value.getRowNode(rowIndex)],
    columns: ["modification_reason"],
  });
}

// 저장 함수
function saveChanges() {
  console.log("=== 저장 시도 ===");
  const modifiedRowsData = rowData.value.filter((row) => row.isModified);
  if (modifiedRowsData.length === 0) {
    return;
  }
  saveBulkChanges(modifiedRowsData);
}

// 일괄 저장 API 호출
async function saveBulkChanges(modifiedData) {
  try {
    // 데이터 변환
    const transformedData = modifiedData.map((row) => {
      const priorityMap = { 상: "HIGH", 중: "MIDDLE", 하: "LOW" };
      const typeMap = { 기능: "FR", 비기능: "NFR" };

      const transformed = {
        memberId: userId, //일단 1로 하고 추후 수정
        reqPk: row._originalApiData.reqPk,
        type: typeMap[row.type] || row.type,
        level1: row.level1,
        level2: row.level2,
        level3: row.level3,
        priority: priorityMap[row.priority] || row.priority,
        difficulty: priorityMap[row.difficulty] || row.difficulty,
        name: row.name,
        description: row.description,
        deleted: row.managementStatus === "삭제",
        modReason: row.modification_reason,
      };

      console.log("변환된 행 데이터:", transformed);
      return transformed;
    });

    console.log("백엔드로 전송할 데이터:", transformedData);

    const response = await fetch(
      `/api/v1/projects/${props.projectId}/requirements/${props.revision}/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(transformedData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("서버 응답:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("서버 응답:", result);

    if (result.status === 200) {
      modifiedRows.value.clear();
      await loadDataFromAPI();
    } else {
      throw new Error(result.message || "저장 중 오류가 발생했습니다.");
    }
  } catch (error) {
    console.error("❌ 일괄 저장 실패:", error);
    alert(error.message || "저장 중 오류가 발생했습니다. 다시 시도해주세요.");
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
    gridApi.value.refreshCells();
    console.log("모든 변경사항이 취소되었습니다.");
  }
}

// function createMockup() {
//   console.log(mockupExists.value)
//   if (mockupExists.value === false) {
//     console.log("....")
//     mockupExists.value = true;
//   }
// }

async function createMockup() {
  loading.value = true;

  try {
    const response = await fetch(
      `/api/v1/projects/${props.projectId}/mockups/${props.revision}?outputFolderName=index.html`,
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("목업 생성 요청이 실패했습니다.");
    }

    // 2초 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("목업 생성이 시작되었습니다. 약 10분 정도 소요될 예정입니다.");
    mockupExists.value = true;
  } catch (error) {
    console.error("목업 생성 실패:", error);
    alert("목업 생성 중 오류가 발생했습니다.");
  } finally {
    loading.value = false;
  }
}

// API에서 데이터 로드
async function downloadRequirements() {
  if (!props.projectId || !props.revision) {
    error.value = "프로젝트 ID 또는 리비전 정보가 없습니다.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `/api/v1/projects/${props.projectId}/requirements/downloads?revisionCount=${props.revision}`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DECASE-Requirements-Specification-v${props.revision}.xlsx`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("다운로드 완료");
  } catch (err) {
    console.error("❌ 다운로드 실패:", err);
    error.value = err.message || "다운로드 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
}

// 카테고리 가져오기 함수
const fetchCategories = async () => {
  try {
    if (!props.projectId || !props.revision) {
      console.error("Project ID or revision is not available");
      return;
    }

    console.log(
      "Fetching categories for project:",
      props.projectId,
      "revision:",
      props.revision
    );

    const response = await fetch(
      `/api/v1/projects/${props.projectId}/documents/${props.revision}/categories`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    console.log("Received categories:", data);

    if (data) {
      if (data["대분류"]) categories["대분류"] = data["대분류"];
      if (data["중분류"]) categories["중분류"] = data["중분류"];
      if (data["소분류"]) categories["소분류"] = data["소분류"];
    }

    // 컬럼 정의 업데이트
    updateColumnDefs();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
};

// 컬럼 정의 업데이트 함수
const updateColumnDefs = () => {
  columnDefs.value = [
    {
      field: "reqIdCode",
      headerName: "요구사항 ID",
      editable: false,
      width: 140,
      pinned: "left",
    },
    {
      field: "type",
      headerName: "요구사항\n 유형",
      editable: true,
      width: 50,
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
      width: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: categories["대분류"],
      },
    },
    {
      field: "level2",
      headerName: "중분류",
      editable: true,
      width: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: categories["중분류"],
      },
    },
    {
      field: "level3",
      headerName: "소분류",
      editable: true,
      width: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: categories["소분류"],
      },
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
      width: 250,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
    },
    {
      field: "priority",
      headerName: "중요도",
      editable: true,
      width: 50,
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
      width: 50,
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
      width: 50,
    },
    {
      field: "managementStatus",
      headerName: "관리\n구분",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["등록", "삭제"],
      },
      width: 50,
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
  ];
};

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
      if (gridApi.value) {
        fetchCategories(); // 카테고리 먼저 가져오기
        loadDataFromAPI();
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  console.log("RequirementsContent 마운트됨:", {
    projectId: props.projectId,
    revision: props.revision,
  });
  fetchCategories(); // 초기 카테고리 로드
});

// 컴포넌트 정의
defineExpose({
  handleSearch,
});

// 목업 보기 함수 추가
const viewMockup = () => {
  console.log("목업 보기 버튼 클릭됨");
  const mockupData = {
    name: "index.html",
    revision: props.revision,
  };
  console.log("발생할 이벤트 데이터:", mockupData);
  emit("mockupFileSelected", mockupData);
};

// 컴포넌트 언마운트 시 gridApi 초기화
onUnmounted(() => {
  gridApi.value = null;
});
</script>

<style scoped>
.project-main.project-content {
  padding: 20px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: #f8f9fa;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.header-section {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
}

.content-info {
  display: flex;
}

.content-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  font-size: 14px;
  /* color: #374151; */
  /* background: #e5e7eb; */
  padding: 0px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.mockup-button,
.mockup-button-view,
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.mockup-button svg,
.mockup-button-view svg,
.load-button svg,
.save-button svg,
.cancel-button svg {
  flex-shrink: 0;
}

/* [NEW] Mockup Button Styles */
.mockup-button {
  background-color: #3b82f6;
  color: white;
}

.mockup-button-view {
  background-color: #3b82f6;
  color: white;
}
.mockup-button-view:hover:not(:disabled) {
  background-color: #3b82f6;
}

.load-button {
  background-color: #3b82f6;
  color: white;
}

.load-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.load-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-weight: 500;
  font-size: 14px;
}

.loading-notice {
  background-color: #dbeafe;
  border: 1px solid #3b82f6;
  color: #1e40af;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-notice {
  background-color: #fef2f2;
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-button {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #dc2626;
}

.grid-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 0;
}

/* AG Grid 테마 커스터마이징 - UploadContent와 일치 */
:deep(.ag-theme-alpine) {
  --ag-header-background-color: #f8f9fa;
  --ag-header-foreground-color: #374151;
  --ag-odd-row-background-color: #ffffff;
  --ag-even-row-background-color: #f8f9fa;
  --ag-row-hover-color: #f0f9ff;
  --ag-selected-row-background-color: #bbdefb;
  --ag-border-color: #d1d5db;
  --ag-font-size: 13px;
  --ag-row-height: 60px;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.ag-header) {
  border-bottom: 1px solid #d1d5db;
  background-color: #f3f4f6; /* 연한 회색 배경 */
}

:deep(.ag-header-cell) {
  border-right: 1px solid #d1d5db;
  font-weight: 600;
  color: #374151;
}

:deep(.ag-cell) {
  border-right: 1px solid #d1d5db;
  line-height: 1.4;
  display: flex;
  align-items: center;
  padding: 4px 12px;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 13px;
}

:deep(.ag-row) {
  border-bottom: 1px solid #d1d5db;
}

:deep(.ag-row:hover) {
  background-color: #f0f9ff;
}

:deep(.ag-cell-flash) {
  background-color: #fff3cd !important;
  transition: background-color 0.5s;
}

:deep(.ag-header-cell-text) {
  font-weight: 600;
  color: #374151;
  font-size: 12px;
}

/* 로딩 상태 스타일 */
.loading-notice::before {
  content: "";
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .project-content {
    padding: 16px;
  }

  .header-section {
    padding: 16px;
  }

  .content-title {
    font-size: 20px;
  }

  .file-details {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .detail-item {
    font-size: 13px;
  }

  .action-buttons {
    justify-content: center;
    width: 100%;
  }

  .load-button,
  .save-button,
  .cancel-button {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    padding: 10px 14px;
  }

  .modification-notice,
  .loading-notice,
  .error-notice {
    margin: 0 16px 16px 16px;
    font-size: 13px;
  }

  .error-notice {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .grid-wrapper {
    margin: 0 16px;
    height: calc(100vh - 400px);
  }

  :deep(.ag-theme-alpine) {
    --ag-font-size: 12px;
    --ag-row-height: 50px;
  }

  :deep(.ag-cell) {
    padding: 6px 8px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
  }

  .load-button,
  .save-button,
  .cancel-button {
    width: 100%;
  }
}

:deep(.ag-header-cell-text) {
  white-space: pre-line; /* 줄바꿈 문자를 실제 줄바꿈으로 처리 */
  line-height: 1.3;
  font-weight: 600;
  color: #374151;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.row-height-buttons button svg rect {
  fill: #9ca3af !important; /* 기본 색상을 회색으로 설정 */
}

.row-height-buttons button.active svg rect {
  fill: #3b82f6 !important; /* 활성화된 버튼만 파란색으로 설정 */
}
</style>
