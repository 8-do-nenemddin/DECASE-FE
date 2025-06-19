<template>
  <div class="sidebar-overlay" @click="$emit('close')">
    <div class="sidebar" @click.stop>
      <div class="sidebar-content">
        <!-- 검색 입력 -->
        <div class="search-section">
          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
            placeholder="검색어를 입력하세요"
          />
        </div>

        <!-- 필터 옵션들 -->
        <div class="filter-sections">
          <!-- 대분류 -->
          <div class="filter-section">
            <label class="filter-label">대분류</label>
            <select v-model="filters.category" class="filter-select">
              <option value="">선택</option>
              <option
                v-for="category in categories['대분류']"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <!-- 중분류 -->
          <div class="filter-section">
            <label class="filter-label">중분류</label>
            <select v-model="filters.subcategory" class="filter-select">
              <option value="">선택</option>
              <option
                v-for="category in categories['중분류']"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <!-- 소분류 -->
          <div class="filter-section">
            <label class="filter-label">소분류</label>
            <select v-model="filters.detailCategory" class="filter-select">
              <option value="">선택</option>
              <option
                v-for="category in categories['소분류']"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <!-- 유형 -->
          <div class="filter-section">
            <label class="filter-label">유형</label>
            <select v-model="filters.type" class="filter-select">
              <option value="">선택</option>
              <option value="fr">기능</option>
              <option value="nfr">비기능</option>
            </select>
          </div>

          <!-- 중요도 & 난이도 -->
          <div class="filter-section">
            <label class="filter-label">중요도</label>
            <select v-model="filters.priority" class="filter-select">
              <option value="">선택</option>
              <option value="high">상</option>
              <option value="medium">중</option>
              <option value="low">하</option>
            </select>
          </div>

          <div class="filter-section">
            <label class="filter-label">난이도</label>
            <select v-model="filters.difficulty" class="filter-select">
              <option value="">선택</option>
              <option value="high">상</option>
              <option value="medium">중</option>
              <option value="low">하</option>
            </select>
          </div>
        </div>

        <!-- 체크박스 옵션들 -->
        <div class="checkbox-section">
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="options.rfp" />
              <span class="checkbox-label">RFP</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="options.proposal" />
              <span class="checkbox-label">회의록</span>
            </label>
          </div>

          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="options.additional" />
              <span class="checkbox-label">추가 파일</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="options.functional" />
              <span class="checkbox-label">회의록(음성)</span>
            </label>
          </div>
        </div>
        <!-- 초기화 버튼 -->
        <button
          class="reset-button"
          @click="resetFilters"
          style="margin-top: 0px"
        >
          초기화
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import { useProjectStore } from "../../../../stores/projectStore";

const projectStore = useProjectStore();
const projectId = projectStore.projectId;

const emit = defineEmits(["close", "search"]);

const props = defineProps({
  selectedRevision: {
    type: Number,
    default: null,
  },
});

const searchQuery = ref("");
const categories = reactive({
  대분류: [],
  중분류: [],
  소분류: [],
});

const filters = reactive({
  category: "",
  subcategory: "",
  detailCategory: "",
  type: "",
  priority: "",
  difficulty: "",
});

const options = reactive({
  rfp: false,
  proposal: false,
  additional: false,
  functional: false,
});

// 검색 파라미터 생성 함수
const createSearchParams = () => {
  // docType 체크박스 값을 문자열로 변환
  const docTypes = [];
  if (options.rfp) docTypes.push("RFP");
  if (options.proposal) docTypes.push("MOMD");
  if (options.additional) docTypes.push("EXTRA");
  if (options.functional) docTypes.push("MOMV");

  // Map type values
  const typeMap = {
    fr: 0, // 기능
    nfr: 1, // 비기능
  };

  // Map difficulty and priority values
  const levelMap = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const searchParams = {
    query: searchQuery.value,
    level1: filters.category || undefined,
    level2: filters.subcategory || undefined,
    level3: filters.detailCategory || undefined,
    type: filters.type ? typeMap[filters.type] : undefined,
    difficulty: filters.difficulty ? levelMap[filters.difficulty] : undefined,
    priority: filters.priority ? levelMap[filters.priority] : undefined,
    docType: docTypes.length > 0 ? docTypes : undefined,
  };

  // Remove undefined values
  Object.keys(searchParams).forEach((key) => {
    if (searchParams[key] === undefined) {
      delete searchParams[key];
    }
  });

  return searchParams;
};

// 검색 실행 함수
const performSearch = () => {
  const searchParams = createSearchParams();
  console.log("검색 실행:", searchParams);
  emit("search", searchParams);
};

// 모든 필터 변경 감지
watch(
  [
    searchQuery,
    () => filters.category,
    () => filters.subcategory,
    () => filters.detailCategory,
    () => filters.type,
    () => filters.priority,
    () => filters.difficulty,
    () => options.rfp,
    () => options.proposal,
    () => options.additional,
    () => options.functional,
  ],
  () => {
    performSearch();
  },
  { deep: true }
);

const fetchCategories = async () => {
  try {
    const projectId = projectStore.projectId;
    if (!projectId) {
      console.error("Project ID is not available");
      return;
    }
    if (!props.selectedRevision) {
      console.log("No revision selected, skipping category fetch");
      return;
    }
    console.log(
      "Fetching categories for project:",
      projectId,
      "revision:",
      props.selectedRevision
    );

    const response = await axios.get(
      `/api/v1/projects/${projectId}/documents/${props.selectedRevision}/categories`
    );

    console.log("Received categories response:", response.data);

    if (response.data) {
      // 각 카테고리 배열이 존재하는지 확인하고 할당
      if (response.data["대분류"])
        categories["대분류"] = response.data["대분류"];
      if (response.data["중분류"])
        categories["중분류"] = response.data["중분류"];
      if (response.data["소분류"])
        categories["소분류"] = response.data["소분류"];

      console.log("Updated categories state:", categories);
    } else {
      console.error("No category data in response");
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
  }
};

// Watch for changes in selectedRevision
watch(
  () => props.selectedRevision,
  (newRevision) => {
    if (newRevision) {
      fetchCategories();
    }
  }
);

onMounted(() => {
  if (props.selectedRevision) {
    fetchCategories();
  }
});
// 필터 초기화 함수
const resetFilters = () => {
  searchQuery.value = "";
  filters.category = "";
  filters.subcategory = "";
  filters.detailCategory = "";
  filters.type = "";
  filters.priority = "";
  filters.difficulty = "";
  options.rfp = false;
  options.proposal = false;
  options.additional = false;
  options.functional = false;
};
</script>

<style scoped>
/* 사이드바 오버레이 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* background: rgba(0, 0, 0, 0.4); */
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 사이드바 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: #ffffff;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.12);
  z-index: 51;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

@keyframes sidebarSlideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-content {
  margin-top: 70px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 검색 섹션 */
.search-section {
  margin-bottom: 4px;
}

.search-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fafafa;
  font-family: inherit;
  line-height: 1.4;
}

.search-input:focus {
  outline: none;
  border-color: #e53e3e;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.08);
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

/* 필터 섹션들 */
.filter-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
  letter-spacing: -0.02em;
}

.filter-select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  line-height: 1.4;
  color: #374151;
}

.filter-select:focus {
  outline: none;
  border-color: #e53e3e;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.08);
}

.filter-select:hover {
  border-color: #d1d5db;
  background: #ffffff;
}

.filter-select option {
  padding: 8px;
  font-size: 14px;
}

/* 체크박스 섹션 */
.checkbox-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 0;
}

.checkbox-item:hover {
  color: #e53e3e;
}

.checkbox-item:hover .checkbox-label {
  color: #e53e3e;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #e53e3e;
  margin: 0;
}

.checkbox-label {
  font-size: 14px;
  color: #4b5563;
  user-select: none;
  font-weight: 500;
  line-height: 1.4;
  transition: color 0.2s ease;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
  }

  .sidebar-content {
    padding: 24px 20px;
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .sidebar-content {
    padding: 20px 16px;
    gap: 20px;
  }

  .filter-sections {
    gap: 18px;
  }

  .checkbox-section {
    gap: 14px;
  }

  .checkbox-group {
    gap: 10px;
  }
}

/* 스크롤바 커스터마이징 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f9fafb;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Firefox 스크롤바 */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.reset-button {
  margin-top: 20px;
  padding: 10px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.3s ease;
}

.reset-button:hover {
  background: #c53030;
}
</style>
