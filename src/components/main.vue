<template>
  <div id="app-container">
    <header class="header">
      <div class="logo-container">
        <img src="/DECASE-light.png" alt="DECASE Logo" class="logo" />
      </div>
      <div class="welcome-message">
        <h1 :class="{ 'fade-out': welcomeMessageFaded }">
          DECASE에 오신 것을 환영합니다.
        </h1>
      </div>
      <div class="profile-section">
        <div class="profile-icon" @click="toggleProfileSidebar">
          <span>프로필</span>
        </div>
      </div>
    </header>

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
    <div
      v-if="showProfileSidebar"
      class="profile-sidebar-overlay"
      @click="closeProfileSidebar"
    >
      <div class="profile-sidebar" @click.stop>
        <div class="sidebar-content">
          <div class="profile-info">
            <div class="sidebar-profile-icon">
              <span>프로필</span>
            </div>
            <div class="profile-name">김민주</div>
            <div class="profile-company">SK AX</div>
            <div class="profile-role">미래혁신부</div>
          </div>

          <div class="sidebar-divider"></div>

          <button class="logout-button" @click="logout">로그아웃</button>
          <div class="sidebar-footer">
            <button class="withdraw-button" @click="withdraw">탈퇴하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import CreateProjectModal from "./CreateProjectModal.vue";
import ProjectGallery from "./ProjectGallery.vue";
import ProjectList from "./ProjectList.vue";

const showModal = ref(false);
const router = useRouter();
const welcomeMessageFaded = ref(false);
const showProfileSidebar = ref(false);

// 환영 메시지 페이드 아웃 타이머
onMounted(() => {
  setTimeout(() => {
    welcomeMessageFaded.value = true;
  }, 3000); // 3초 후 페이드 아웃 시작
});

const toggleProfileSidebar = () => {
  showProfileSidebar.value = !showProfileSidebar.value;
};

const closeProfileSidebar = () => {
  showProfileSidebar.value = false;
};

const logout = () => {
  console.log("로그아웃");
  showProfileSidebar.value = false;
  // 로그아웃 로직 구현
};

const withdraw = () => {
  console.log("탈퇴하기");
  showProfileSidebar.value = false;
  // 탈퇴 로직 구현
};

const openModal = () => {
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
};

const handleCreateProject = (newProjectName) => {
  console.log(`새 프로젝트 '${newProjectName}'가 생성되었습니다.`);
  closeModal();
  router.push({ name: "ProjectMain", params: { projectName: newProjectName } });
};

const projects = ref([
  {
    id: 1,
    name: "Project 1",
    date: "2025.04.07",
    versionInfo: "버전 이력 1개",
    status: "NOT_STARTED",
  },
  {
    id: 2,
    name: "Project 2",
    date: "2025.04.11",
    versionInfo: "버전 이력 2개",
    status: "IN_PROGRESS",
  },
  {
    id: 3,
    name: "Project 3",
    date: "2025.04.13",
    versionInfo: "버전 이력 3개",
    status: "DONE",
  },
  {
    id: 4,
    name: "Project 4",
    date: "2024.06.22",
    versionInfo: "버전 이력 4개",
    status: "DONE",
  },
  {
    id: 5,
    name: "Project 5",
    date: "2024.06.25",
    versionInfo: "버전 이력 5개",
    status: "IN_PROGRESS",
  },
  {
    id: 6,
    name: "Project 6",
    date: "2024.12.21",
    versionInfo: "버전 이력 6개",
    status: "DONE",
  },
]);

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
}

#app-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #ffffff;
  font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif;
  padding: 20px;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.logo-container {
  flex-shrink: 0;
}

.logo {
  height: 100px;
  width: 120px;
}

.welcome-message {
  flex: 1;
  text-align: center;
}

.welcome-message h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #333;
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: welcomeSlideIn 1.2s ease-out;
}

.welcome-message h1.fade-out {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

@keyframes welcomeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.profile-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.profile-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.profile-icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(
    circle,
    rgba(196, 57, 61, 0.2) 0%,
    transparent 70%
  );
  transition: all 0.4s ease;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.profile-icon:hover {
  background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.profile-icon:hover::before {
  width: 100px;
  height: 100px;
}

/* 프로필 사이드바 오버레이 */
.profile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
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

/* 프로필 사이드바 */
.profile-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes sidebarSlideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 60px 40px 40px;
}

.profile-info {
  text-align: center;
  /* flex: 1; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
}

.sidebar-profile-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 15px 0;
}

.profile-company {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.profile-role {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.sidebar-divider {
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin-top: 10px;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 0;
}

.logout-button {
  width: 100%;
  padding: 20px;
  background: white;
  color: #333;
  border: none;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.logout-button:hover {
  background: #f8f9fa;
}

.withdraw-button {
  width: 100%;
  background: white;
  color: #c4393d;
  border: none;
  padding: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: right;
}

.withdraw-button:hover {
  background: rgba(196, 57, 61, 0.05);
}
/* 반응형 사이드바 */
@media (max-width: 768px) {
  .profile-sidebar {
    width: 100vw;
    right: 0;
  }

  .sidebar-content {
    padding: 40px 30px 30px;
  }
}

@media (max-width: 480px) {
  .sidebar-content {
    padding: 30px 20px 20px;
  }

  .profile-name {
    font-size: 20px;
  }

  .profile-company {
    font-size: 16px;
  }

  .profile-role {
    font-size: 14px;
  }
}

/* Main Content */
.main-content {
  /* 기본 패딩 제거 */
}

/* Toolbar Styles */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-project-button {
  background: linear-gradient(135deg, #c4393d 0%, #e85a5f 50%, #ff8a80 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(196, 57, 61, 0.3);
  position: relative;
  overflow: hidden;
}

.new-project-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s;
}

.new-project-button:hover::before {
  left: 100%;
}

.new-project-button:hover {
  background: linear-gradient(135deg, #a52d32 0%, #c4393d 50%, #e85a5f 100%);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(196, 57, 61, 0.4);
}

.new-project-button:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 4px 15px rgba(196, 57, 61, 0.5);
}

.plus-icon {
  font-size: 20px;
  font-weight: 300;
  transition: transform 0.3s ease;
}

.new-project-button:hover .plus-icon {
  transform: rotate(90deg);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  padding: 0 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.search-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(196, 57, 61, 0.05) 0%,
    rgba(232, 90, 95, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.search-container:focus-within {
  border-color: #c4393d;
  box-shadow: 0 6px 20px rgba(196, 57, 61, 0.2);
  transform: translateY(-1px);
}

.search-container:focus-within::before {
  opacity: 1;
}

.search-icon {
  margin-right: 8px;
  color: #c4393d;
  font-size: 16px;
  transition: all 0.3s ease;
  z-index: 1;
}

.search-container:focus-within .search-icon {
  color: #a52d32;
  transform: scale(1.1);
}

.search-input {
  padding: 12px 4px;
  border: none;
  font-size: 14px;
  outline: none;
  width: 200px;
  color: #333;
  background: transparent;
  z-index: 1;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: #999;
}

/* View Options */
.view-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-toggle {
  display: flex;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 25px;
  padding: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.view-toggle-button {
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  position: relative;
  overflow: hidden;
}

.view-toggle-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(196, 57, 61, 0.1) 0%,
    rgba(232, 90, 95, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
}

.view-toggle-button:hover {
  transform: translateY(-2px);
  color: #c4393d;
}

.view-toggle-button:hover::before {
  opacity: 1;
}

.view-toggle-button.active {
  background: linear-gradient(135deg, #c4393d 0%, #e85a5f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(196, 57, 61, 0.3);
  transform: translateY(-1px);
}

.view-toggle-button.active::before {
  opacity: 0;
}

.view-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.view-toggle-button:hover .view-icon {
  transform: scale(1.1);
}

/* Dropdown Styles */
.dropdown {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.dropdown::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(196, 57, 61, 0.05) 0%,
    rgba(232, 90, 95, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dropdown:hover,
.dropdown:focus {
  border-color: #c4393d;
  outline: none;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(196, 57, 61, 0.15);
}

.dropdown:hover::before,
.dropdown:focus::before {
  opacity: 1;
}

.status-dropdown {
  min-width: 100px;
}

.sort-dropdown {
  min-width: 140px;
}

/* 전체적인 애니메이션 추가 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  animation: fadeInUp 0.6s ease-out;
}

.toolbar {
  animation: fadeInUp 0.8s ease-out;
}

.projects-container {
  animation: fadeInUp 1s ease-out;
}

/* 호버 시 부드러운 펄스 효과 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(196, 57, 61, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(196, 57, 61, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(196, 57, 61, 0);
  }
}

.new-project-button:active {
  animation: pulse 0.6s;
}

/* Responsive Design */
@media (max-width: 1024px) {
  #app-container {
    padding: 16px;
  }

  .welcome-message h1 {
    font-size: 24px;
  }

  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .toolbar-right {
    justify-content: space-between;
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .toolbar-right {
    flex-direction: column;
    gap: 12px;
  }

  .view-options {
    justify-content: center;
  }

  .search-input {
    width: 150px;
  }
}
</style>
