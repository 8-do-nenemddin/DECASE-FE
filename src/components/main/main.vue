<template>
  <div id="app-container">
    <MainHeader @toggleProfile="toggleProfileSidebar"></MainHeader>

    <main class="main-content">
      <div class="toolbar">
        <button class="new-project-button" @click="openModal">
          <span class="plus-icon">+</span>
          새로 만들기
        </button>

        <div class="toolbar-right">
          <div class="search-container">
            <div class="search-icon">🔍</div>
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
                <span class="view-icon">⚏</span>
              </button>
              <button
                class="view-toggle-button"
                :class="{ active: selectedView === 'list' }"
                @click="setView('list')"
                title="리스트 보기"
              >
                <span class="view-icon">☰</span>
              </button>
            </div>

            <select class="dropdown status-dropdown" v-model="statusFilter">
              <option value="all">모두</option>
              <option value="not_started">시작 전</option>
              <option value="in_progress">진행 중</option>
              <option value="done">완료</option>
            </select>

            <select class="dropdown sort-dropdown" v-model="sortOption">
              <option value="date,desc">날짜 (최신 순)</option>
              <option value="date,asc">날짜 (오래된 순)</option>
              <option value="name,asc">이름 (오름차순)</option>
              <option value="name,desc">이름 (내림차순)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="projects-container">
        <component :is="selectedViewComponent" :projects="sortedProjects" />
      </div>
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

const showModal = ref(false);
const router = useRouter();
const showProfileSidebar = ref(false);

// 프로필 사이드바 관련 메서드
const toggleProfileSidebar = () => {
  showProfileSidebar.value = !showProfileSidebar.value;
};

const closeProfileSidebar = () => {
  showProfileSidebar.value = false;
};

const handleLogout = () => {
  console.log("로그아웃");
  closeProfileSidebar();
  // 로그아웃 로직 구현
};

const handleWithdraw = () => {
  console.log("탈퇴하기");
  closeProfileSidebar();
  // 탈퇴 로직 구현
};

// 모달 관련 메서드
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleCreateProject = (newProjectName) => {
  console.log(`새 프로젝트 '${newProjectName}'가 생성되었습니다.`);

  // 새 프로젝트를 projects 배열에 추가
  const newProject = {
    id: Date.now(),
    name: newProjectName,
    date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    versionInfo: "버전 이력 0개",
    status: "NOT_STARTED",
  };
  projects.value.unshift(newProject);

  closeModal();
  router.push({ name: "ProjectMain", params: { projectId: projectId } });
};

// 프로젝트 데이터
const projects = ref([]);

const fetchProjects = async () => {
  try {
    const memberId = 1; // 하드코딩된 테스트용 ID
    const page = 0;
    const size = 10;

    console.log("요청 보냄");

    const response = await fetch(`/api/v1/members/${memberId}/projects?page=${page}&size=${size}`);
    const json = await response.json();

    console.log("받은 데이터:", json);

    projects.value = json.data;
  } catch (error) {
    console.error("프로젝트 데이터를 불러오는 데 실패했습니다:", error);
  }
};

onMounted(() => {
  fetchProjects();
});

// 뷰 및 필터 관련
const selectedView = ref("gallery");
const searchQuery = ref("");
const sortOption = ref("date,desc");
const statusFilter = ref("all");

const setView = (view) => {
  selectedView.value = view;
};

const selectedViewComponent = computed(() => {
  return selectedView.value === "gallery" ? ProjectGallery : ProjectList;
});

const sortedProjects = computed(() => {
  const [field, order] = sortOption.value.split(",");
  let filtered = projects.value;

  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase();
    filtered = filtered.filter((project) =>
      project.name.toLowerCase().includes(keyword)
    );
  }

  if (statusFilter.value !== "all") {
    filtered = filtered.filter(
      (project) => project.status.toLowerCase() === statusFilter.value
    );
  }

  return [...filtered].sort((a, b) => {
    let comparison = 0;
    if (field === "date") {
      comparison = new Date(a.date) - new Date(b.date);
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return order === "asc" ? comparison : -comparison;
  });
});
</script>

<style scoped>
* {
  box-sizing: border-box;
  /* 모든 애니메이션 완전 제거 (모달 제외) */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* 모달은 예외 처리 - 표시되도록 허용 */
.modal-overlay,
.modal-content {
  animation: initial !important;
  transition: initial !important;
  transform: initial !important;
  opacity: 1 !important;
  display: flex !important;
}

/* 필요한 호버 효과만 허용 */
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

/* Header Styles - 높이 줄이고 애니메이션 효과 제거 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px; /* 35px에서 20px로 줄임 */
  background-color: #ffffff;
  position: relative;
  min-height: 90px; /* 130px에서 90px로 줄임 */
  width: 100%;
  flex-shrink: 0;
}

.logo-container {
  flex-shrink: 0;
  width: 200px; /* 250px에서 200px로 줄임 */
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.logo {
  height: 50px;
  width: auto;
  display: block;
  /* 로고 애니메이션 완전 제거 */
  animation: none !important;
  transform: none !important;
  transition: none !important;
}

.welcome-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.welcome-message h1 {
  font-size: 2em;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
  letter-spacing: -0.5px;
  /* 환영 메시지 애니메이션 완전 제거 */
  animation: none !important;
  transition: none !important;
  opacity: 1 !important;
}

.profile-section {
  flex-shrink: 0;
  width: 200px; /* 250px에서 200px로 줄임 */
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.profile-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #718096;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* 프로필 아이콘 애니메이션 완전 제거, 호버만 허용 */
  animation: none !important;
  transform: none !important;
}

.profile-icon:hover {
  background: #edf2f7;
  border-color: #4a5568;
  color: #4a5568;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 30px 50px; /* 40px에서 30px로 줄임 */
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Toolbar Styles */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.new-project-button {
  background: #4a5568;
  color: white;
  border: none;
  padding: 16px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(74, 85, 104, 0.2);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.new-project-button:hover {
  background: #2d3748;
  box-shadow: 0 4px 12px rgba(74, 85, 104, 0.3);
}

.plus-icon {
  font-size: 18px;
  font-weight: 300;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

/* Search Container */
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

.search-icon {
  margin-right: 10px;
  color: #718096;
  font-size: 15px;
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

/* View Options */
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

.view-icon {
  font-size: 15px;
}

/* Dropdown Styles */
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

.status-dropdown {
  min-width: 130px;
}

.sort-dropdown {
  min-width: 170px;
}

/* Projects Container */
.projects-container {
  flex: 1;
  width: 100%;
  min-height: 400px;
}

/* 반응형 디자인 */
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
}
</style>