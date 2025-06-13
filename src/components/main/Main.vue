<template>
  <div id="app-container">
    <header class="header">
      <div class="header-left">
        <div class="logo-container">
          <div class="logo-icon">
            <img src="/DECASE-light.png" alt="DECASE Logo" class="logo" />
          </div>
          <span class="logo-text">DECASE</span>
        </div>
      </div>

      <div class="header-center">
        <div class="welcome-message">
          <h1>프로젝트 관리</h1>
        </div>
      </div>

      <div class="header-right">
        <div class="action-buttons">
          <button
            class="icon-button profile-btn"
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

    <main class="main-content">
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="new-project-button" @click="openModal">
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
        <div class="toolbar-right">
          <div class="search-container">
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
              class="search-input"
            />
          </div>

          <div class="view-options">
            <div class="view-toggle">
              <button
                class="view-toggle-button"
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
                class="view-toggle-button"
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

            <select class="dropdown sort-dropdown" v-model="sortOption">
              <option value="startDate,desc">날짜 (최신 순)</option>
              <option value="startDate,asc">날짜 (오래된 순)</option>
              <option value="name,asc">이름 (오름차순)</option>
              <option value="name,desc">이름 (내림차순)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="projects-container">
        <component :is="selectedViewComponent" :projects="displayedProjects" />
      </div>
      <footer>
        <!-- 수정된 페이지네이션 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            이전
          </button>

          <div class="pagination-pages">
            <button
              v-for="page in paginationPages"
              :key="page"
              :class="['page-button', { active: currentPage === page }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="pagination-button"
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

    <!-- 프로필 사이드바 -->
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
    // 총 페이지가 7개 이하면 모두 표시
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // 총 페이지가 많으면 현재 페이지 기준으로 표시
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
    // 테스트용 더미 데이터
    // projects.value = Array.from({ length: 25 }, (_, i) => ({
    //   id: i + 1,
    //   name: `프로젝트 ${i + 1}`,
    //   startDate: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    //   versionInfo: `버전 이력 ${i % 5}개`,
    //   status: ["NOT_STARTED", "IN_PROGRESS", "DONE"][i % 3]
    // }));
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
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.modal-overlay,
.modal-content {
  animation: initial !important;
  transition: initial !important;
  transform: initial !important;
  opacity: 1 !important;
  display: flex !important;
}

.profile-icon:hover,
.new-project-button:hover,
.search-container:focus-within,
.view-toggle-button:hover,
.dropdown:hover,
.logout-button:hover,
.withdraw-button:hover {
  transition: all 0.2s ease !important;
}

#app-container {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #fafbfc;
  font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 72px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  position: relative;
  z-index: 50;
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 16px;
  margin-bottom: 5px;
}

.logo-container:hover {
  background: rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
}

.logo {
  height: 100%;
  width: auto;
  max-height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: contain;
  margin-top: 30px !important;
  animation: none !important;
  transform: none !important;
  transition: none !important;
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #000000;
  letter-spacing: 0.02em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
    sans-serif;
  margin-top: 5px !important;
}

.welcome-message h1 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.new-project-button {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
}

.new-project-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.4);
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
}

.new-project-button:active {
  transform: translateY(0);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 4px;
  backdrop-filter: blur(8px);
}

.icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  position: relative;
  overflow: hidden;
}

.icon-button:hover {
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.icon-button:active {
  transform: translateY(0);
}

.profile-btn:hover {
  color: #f59e0b;
}

.main-content {
  flex: 1;
  padding: 30px 50px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 35px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.toolbar-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.search-container {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 15px;
  transition: all 0.2s ease;
}

.search-container:focus-within {
  border-color: #4a5568;
  background: white;
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
}

.search-input {
  padding: 12px 6px;
  border: none;
  font-size: 14px;
  outline: none;
  width: 240px;
  color: #2d3748;
  background: transparent;
}

.search-input::placeholder {
  color: #a0aec0;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.view-toggle {
  display: flex;
  background: #f7fafc;
  border-radius: 8px;
  padding: 3px;
  border: 1px solid #e2e8f0;
}

.view-toggle-button {
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #718096;
  font-size: 15px;
  transition: all 0.2s ease;
}

.view-toggle-button:hover {
  color: #4a5568;
  background: #edf2f7;
}

.view-toggle-button.active {
  background: #4a5568;
  color: white;
  box-shadow: 0 1px 3px rgba(74, 85, 104, 0.2);
}

.dropdown {
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f7fafc;
  font-size: 14px;
  cursor: pointer;
  color: #2d3748;
  outline: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown:hover,
.dropdown:focus {
  border-color: #4a5568;
  background: white;
}

.sort-dropdown {
  min-width: 170px;
}

.projects-container {
  flex: 1;
  width: 100%;
  min-height: 400px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.pagination-button {
  padding: 10px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: #f7fafc;
}

.pagination-pages {
  display: flex;
  gap: 6px;
  align-items: center;
}

.page-button {
  padding: 8px 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #2d3748;
  min-width: 40px;
  text-align: center;
  transition: all 0.2s ease;
}

.page-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.page-button.active {
  background: #4a5568;
  color: white;
  border-color: #4a5568;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(74, 85, 104, 0.3);
}

@media (max-width: 1200px) {
  .header {
    padding: 15px 40px;
  }

  .main-content {
    padding: 25px 40px;
  }

  .logo-container,
  .profile-section {
    width: 150px;
  }

  .logo {
    height: 45px;
  }
}

@media (max-width: 1024px) {
  .header {
    padding: 15px 30px;
  }

  .main-content {
    padding: 25px 30px;
  }

  .search-input {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 20px;
    min-height: auto;
  }

  .logo-container,
  .profile-section {
    width: auto;
  }

  .logo {
    height: 40px;
  }

  .welcome-message h1 {
    font-size: 1.6em;
  }

  .main-content {
    padding: 20px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
    padding: 20px;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .search-input {
    width: 180px;
  }

  .pagination-container {
    gap: 8px;
  }

  .pagination-pages {
    gap: 4px;
  }

  .page-button {
    padding: 6px 10px;
    min-width: 35px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 15px;
  }

  .main-content {
    padding: 15px;
  }

  .welcome-message h1 {
    font-size: 1.4em;
  }

  .toolbar-right {
    flex-direction: column;
    gap: 12px;
  }

  .view-options {
    justify-content: center;
  }

  .search-input {
    width: 100%;
    min-width: 160px;
  }

  .dropdown {
    min-width: auto;
    flex: 1;
  }

  .pagination-container {
    flex-direction: column;
    gap: 10px;
  }

  .pagination-pages {
    order: 2;
  }

  .pagination-button {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
