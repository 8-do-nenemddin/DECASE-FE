<template>
  <div class="m-project-main-container">
    <HeaderBar
      ref="headerBar"
      @fileSelected="handleFileSelected"
      @search="handleSearch"
      @mockupFileSelected="handleMockupFileSelected"
    />
    <div class="m-content-wrapper" :class="contentClasses">
      <ProjectContent ref="projectContentRef" :headerBar="headerBar" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { useProjectStore } from "/src/stores/projectStore";
import HeaderBar from "./header/HeaderBar.vue";
import ProjectContent from "./content/ProjectContent.vue";

const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);
const memberId = computed(() => projectStore.memberId);
const error = ref("");
const loading = ref(false);
const projectData = reactive({
  startDate: "",
  endDate: "",
  name: "",
  pm: "",
  description: "",
  scale: "",
  creatorMemberId: null,
});

const projectContentRef = ref(null);
const headerBar = ref(null);

const handleFileSelected = (file) => {
  projectContentRef.value?.handleFileSelected(file);
};

const handleSearch = (searchTerm) => {
  projectContentRef.value?.handleSearch(searchTerm);
};

const handleMockupFileSelected = (file) => {
  projectContentRef.value?.handleMockupFileSelected(file);
};

// 사이드바 상태를 전역적으로 감지
const showSidebar = ref(false);

// DOM에서 사이드바 존재 여부 체크
const checkSidebarVisibility = () => {
  const searchSidebar = document.querySelector(".sidebar"); // 검색 사이드바
  const fileSidebar = document.querySelector(".sidebar"); // 파일 사이드바
  showSidebar.value = !!(searchSidebar || fileSidebar);
};

// 날짜 포맷 함수 (ISO 문자열을 YYYY-MM-DD로 변환)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (e) {
    console.error("날짜 변환 오류:", e);
    return "";
  }
};

// 프로젝트 데이터 로드 함수
const loadProjectData = async () => {
  if (!projectId.value) {
    error.value = "프로젝트 ID를 찾을 수 없습니다.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    console.log("프로젝트 ID:", projectId.value);

    const res = await fetch(`/api/v1/projects/${projectId.value}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 필요한 경우 인증 헤더 추가
        // 'Authorization': `Bearer ${token}`
      },
    });

    console.log("응답 상태:", res.status);

    if (!res.ok) {
      throw new Error(
        `프로젝트 정보 로드 실패: ${res.status} ${res.statusText}`
      );
    }

    const json = await res.json();
    const data = json.data;
    console.log("받은 데이터:", data);

    // 데이터 설정
    projectData.name = data.name || "";
    projectData.scale = data.scale ? String(data.scale) : "";
    projectData.startDate = formatDateForInput(data.startDate);
    projectData.endDate = formatDateForInput(data.endDate);
    projectData.description = data.description || "";
    projectData.pm = data.proposalPM || "";
    projectData.creatorMemberId = data.creatorMemberId || null;

    console.log("매인 설정 후 projectData:", JSON.stringify(projectData, null, 2));
  } catch (err) {
    console.error("프로젝트 로드 오류:", err);
    error.value = err.message || "프로젝트 정보를 불러오는데 실패했습니다.";
  } finally {
    loading.value = false;
  }
};

// 주기적으로 사이드바 상태 확인
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(checkSidebarVisibility, 100);
  loadProjectData();
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const contentClasses = computed(() => ({
  "with-sidebar": showSidebar.value,
}));
</script>

<style scoped>
.m-project-main-container {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
}

.m-content-wrapper {
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.m-content-wrapper.with-sidebar {
  margin-left: 320px;
}

/* 반응형: 모바일에서는 margin 적용 안함 */
@media (max-width: 768px) {
  .m-content-wrapper.with-sidebar {
    margin-left: 0;
    width: 100%;
  }
}

/* 기존 스타일들... */
.m-main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(80vh);
  padding: 40px;
  text-align: center;
}

.m-welcome-title {
  font-size: 35px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0 0;
  line-height: 1.2;
}

.m-welcome-subtitle {
  font-size: 20px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .m-project-title {
    font-size: 18px;
  }

  .m-welcome-title {
    font-size: 36px;
  }

  .m-welcome-subtitle {
    font-size: 18px;
  }

  .m-main-content {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .m-welcome-title {
    font-size: 28px;
  }

  .m-welcome-subtitle {
    font-size: 16px;
  }
}
</style>