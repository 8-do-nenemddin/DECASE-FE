<template>
  <div id="app-container">
    <header class="main-header">
      <div class="left-section">
        <div class="brand-logo">
          <img src="/DECASE-logo-no-background.png" alt="DECASE Logo" class="logo-image" />
        </div>
      </div>

      <div class="center-section">
        <div class="page-title">
          <h1>Project Main</h1>
        </div>
      </div>

      <div class="right-section">
        <div class="user-actions">
          <button
            class="user-btn"
            @click="toggleProfileSidebar"
            title="사용자"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="content-area">
      <div class="control-bar">
        <div class="left-controls">
          <button class="create-btn" @click="openModal">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>새로 만들기</span>
          </button>
        </div>
        
        <div class="right-controls">
          <div class="search-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="프로젝트 검색"
              class="search-field"
            />
          </div>

          <div class="view-controls">
            <div class="view-switcher">
              <button
                class="view-btn"
                :class="{ active: selectedView === 'gallery' }"
                @click="setView('gallery')"
                title="갤러리 보기"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                class="view-btn"
                :class="{ active: selectedView === 'list' }"
                @click="setView('list')"
                title="리스트 보기"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>

            <select class="sort-select" v-model="sortOption">
              <option value="startDate,desc">날짜 (최신 순)</option>
              <option value="startDate,asc">날짜 (오래된 순)</option>
              <option value="name,asc">이름 (오름차순)</option>
              <option value="name,desc">이름 (내림차순)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="projects-area">
        <component :is="selectedViewComponent" :projects="displayedProjects" />
      </div>
      
      <footer class="page-footer">
        <div class="pagination" v-if="totalPages > 1">
          <button
            class="page-nav-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            이전
          </button>

          <div class="page-numbers">
            <button
              v-for="page in paginationPages"
              :key="page"
              :class="['page-num', { active: currentPage === page }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="page-nav-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </footer>
    </main>

    <CreateProjectModal
      v-if="showModal"
      @close="closeModal"
      @createProject="handleCreateProject"
    />

    <ProfileBar
      :isVisible="showProfileSidebar"
      @close="closeProfileSidebar"
      @logout="handleLogout"
      @withdraw="handleWithdraw"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import CreateProjectModal from "../main/CreateProjectModal.vue";
import ProjectGallery from "./ProjectGallery.vue";
import ProjectList from "./ProjectList.vue";
import MainHeader from "../main/MainHeader.vue";
import ProfileBar from "./ProfileBar.vue";
import { useProjectStore } from "/src/stores/projectStore.js";

// 상태 변수들
const showModal = ref(false);
const router = useRouter();
const showProfileSidebar = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;
const selectedView = ref("gallery");
const searchQuery = ref("");
const sortOption = ref("startDate,desc");

// 프로젝트 데이터
const projects = ref([]);

// 페이지네이션 관련 computed
const filteredProjects = computed(() => {
  let filtered = [...projects.value];

  // 검색 필터
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase();
    filtered = filtered.filter((project) =>
      project.name.toLowerCase().includes(keyword)
    );
  }

  // 정렬
  const [field, order] = sortOption.value.split(",");
  return filtered.sort((a, b) => {
    if (field === "startDate") {
      const dateA = new Date(a.startDate || a.date);
      const dateB = new Date(b.startDate || b.date);
      return order === "asc" ? dateA - dateB : dateB - dateA;
    } else if (field === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredProjects.value.length / itemsPerPage);
});

const displayedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProjects.value.slice(start, end);
});

const paginationPages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }

  return pages;
});

const selectedViewComponent = computed(() => {
  return selectedView.value === "gallery" ? ProjectGallery : ProjectList;
});

// 메서드들
const fetchProjects = async () => {
  try {
    const memberStore = useProjectStore();
    const memberId = memberStore.userId;
    const response = await fetch(`/api/v1/members/${memberId}/projects`);
    const json = await response.json();
    projects.value = json.data || [];
  } catch (error) {
    console.error("프로젝트 데이터를 불러오는 데 실패했습니다:", error);
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== "...") {
    currentPage.value = page;
  }
};

const setView = (view) => {
  selectedView.value = view;
};

// 프로필 사이드바 관련
const toggleProfileSidebar = () => {
  showProfileSidebar.value = !showProfileSidebar.value;
};

const closeProfileSidebar = () => {
  showProfileSidebar.value = false;
};

const handleLogout = () => {
  console.log("로그아웃");
  closeProfileSidebar();
};

const handleWithdraw = () => {
  console.log("탈퇴하기");
  closeProfileSidebar();
};

// 모달 관련
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleCreateProject = (newProjectName) => {
  console.log(`새 프로젝트 '${newProjectName}'가 생성되었습니다.`);

  const newProject = {
    id: Date.now(),
    name: newProjectName,
    startDate: new Date().toISOString().split("T")[0],
    versionInfo: "버전 이력 0개",
    status: "NOT_STARTED",
  };

  projects.value.unshift(newProject);
  closeModal();
  currentPage.value = 1;

  if (newProjectName.id) {
    router.push({
      name: "ProjectMain",
      params: { projectId: newProjectName.id },
    });
  }
};

// 라이프사이클
onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#app-container {
  width: 100%;
  min-height: 100vh;
  background-color: #fafbfc;
  font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif;
  display: flex;
  flex-direction: column;
}

/* 헤더 스타일 */
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 72px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.left-section {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.brand-logo {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-image {
  padding-left: 20px;
  height: 40px;
  width: auto;
  max-width: 150px;
  object-fit: contain;
  display: block;
}

.center-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.page-title h1 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.right-section {
  display: flex;
  align-items: center;
  min-width: 200px;
  justify-content: flex-end;
}

.user-actions {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 4px;
}

.user-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
}

.user-btn:hover {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

/* 메인 콘텐츠 */
.content-area {
  flex: 1;
  padding: 30px 50px;
  display: flex;
  flex-direction: column;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.left-controls {
  display: flex;
  align-items: center;
}

.create-btn {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
}

.create-btn:hover {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 18px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 15px;
}

.search-box:focus-within {
  border-color: #4a5568;
  background: white;
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
}

.search-field {
  padding: 12px 6px;
  border: none;
  font-size: 14px;
  outline: none;
  width: 240px;
  color: #2d3748;
  background: transparent;
}

.search-field::placeholder {
  color: #a0aec0;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.view-switcher {
  display: flex;
  background: #f7fafc;
  border-radius: 8px;
  padding: 3px;
  border: 1px solid #e2e8f0;
}

.view-btn {
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #718096;
}

.view-btn:hover {
  color: #4a5568;
  background: #edf2f7;
}

.view-btn.active {
  background: #4a5568;
  color: white;
}

.sort-select {
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f7fafc;
  font-size: 14px;
  cursor: pointer;
  color: #2d3748;
  outline: none;
  min-width: 170px;
}

.sort-select:hover,
.sort-select:focus {
  border-color: #4a5568;
  background: white;
}

.projects-area {
  flex: 1;
  min-height: 400px;
}

/* 페이지네이션 */
.page-footer {
  margin-top: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.page-nav-btn {
  padding: 10px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.page-nav-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.page-nav-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-num {
  padding: 8px 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #2d3748;
  min-width: 40px;
  text-align: center;
}

.page-num:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.page-num.active {
  background: #4a5568;
  color: white;
  border-color: #4a5568;
  font-weight: 600;
}

/* 반응형 */
@media (max-width: 1024px) {
  .main-header {
    padding: 15px 30px;
  }
  
  .content-area {
    padding: 25px 30px;
  }
  
  .search-field {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    height: auto;
  }
  
  .left-section,
  .right-section {
    min-width: auto;
  }
  
  .content-area {
    padding: 20px;
  }
  
  .control-bar {
    flex-direction: column;
    gap: 18px;
    padding: 20px;
  }
  
  .right-controls {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  
  .search-field {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-header,
  .content-area {
    padding: 15px;
  }
  
  .page-title h1 {
    font-size: 24px;
  }
  
  .view-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .sort-select {
    min-width: auto;
    flex: 1;
  }
}
</style>