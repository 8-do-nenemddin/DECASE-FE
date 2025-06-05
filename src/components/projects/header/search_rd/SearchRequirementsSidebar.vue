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
              <option value="functional">기능</option>
              <option value="performance">성능</option>
              <option value="security">보안</option>
              <option value="usability">사용성</option>
            </select>
          </div>

          <!-- 중분류 -->
          <div class="filter-section">
            <label class="filter-label">중분류</label>
            <select v-model="filters.subcategory" class="filter-select">
              <option value="">선택</option>
              <option value="ui">UI</option>
              <option value="api">API</option>
              <option value="database">데이터베이스</option>
              <option value="auth">인증</option>
            </select>
          </div>

          <!-- 소분류 -->
          <div class="filter-section">
            <label class="filter-label">소분류</label>
            <select v-model="filters.detailCategory" class="filter-select">
              <option value="">선택</option>
              <option value="form">폼</option>
              <option value="table">테이블</option>
              <option value="chart">차트</option>
              <option value="modal">모달</option>
            </select>
          </div>

          <!-- 유형 -->
          <div class="filter-section">
            <label class="filter-label">유형</label>
            <select v-model="filters.type" class="filter-select">
              <option value="">선택</option>
              <option value="requirement">요구사항</option>
              <option value="spec">명세</option>
              <option value="design">디자인</option>
              <option value="test">테스트</option>
            </select>
          </div>

          <!-- 중요도 & 난이도 -->
          <div class="filter-section">
            <label class="filter-label">중요도</label>
            <select v-model="filters.priority" class="filter-select">
              <option value="">선택</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>

          <div class="filter-section">
            <label class="filter-label">난이도</label>
            <select v-model="filters.difficulty" class="filter-select">
              <option value="">선택</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
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

        <!-- 검색 버튼 -->
        <div class="action-section">
          <button class="search-button" @click="performSearch">검색</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const emit = defineEmits(["close", "search"]);

const searchQuery = ref("");

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

const performSearch = () => {
  const searchParams = {
    query: searchQuery.value,
    filters: { ...filters },
    options: { ...options },
  };

  console.log("검색 실행:", searchParams);
  emit("search", searchParams);
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

/* 액션 섹션 */
.action-section {
  margin-top: 8px;
  padding-top: 4px;
}

.search-button {
  width: 100%;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  letter-spacing: -0.02em;
  box-shadow: 0 2px 8px rgba(31, 41, 55, 0.15);
}

.search-button:hover {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(31, 41, 55, 0.25);
}

.search-button:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.2);
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
</style>
