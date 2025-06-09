<template>
  <div class="project-main">
    <HeaderBar @fileSelected="handleFileSelected" />
    <div class="content-wrapper" :class="contentClasses">
      <ProjectContent ref="projectContentRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useProjectStore } from "/src/stores/projectStore";
import HeaderBar from "./header/HeaderBar.vue";
import ProjectContent from "./content/ProjectContent.vue";

const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);

const projectContentRef = ref(null);

const handleFileSelected = (fileData) => {
  // ProjectContent의 handleFileSelected 메서드 호출
  if (projectContentRef.value) {
    projectContentRef.value.handleFileSelected(fileData);
  }
};

// 사이드바 상태를 전역적으로 감지
const showSidebar = ref(false);

// DOM에서 사이드바 존재 여부 체크
const checkSidebarVisibility = () => {
  const searchSidebar = document.querySelector(".sidebar"); // 검색 사이드바
  const fileSidebar = document.querySelector(".sidebar"); // 파일 사이드바
  showSidebar.value = !!(searchSidebar || fileSidebar);
};

// 주기적으로 사이드바 상태 확인
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(checkSidebarVisibility, 100);
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
.project-main {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
}

.content-wrapper {
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper.with-sidebar {
  margin-left: 320px;
}

/* 반응형: 모바일에서는 margin 적용 안함 */
@media (max-width: 768px) {
  .content-wrapper.with-sidebar {
    margin-left: 0;
  }
}

/* 기존 스타일들... */
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(80vh);
  padding: 40px;
  text-align: center;
}

.welcome-title {
  font-size: 35px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 20px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .project-title {
    font-size: 18px;
  }

  .welcome-title {
    font-size: 36px;
  }

  .welcome-subtitle {
    font-size: 18px;
  }

  .main-content {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }
}
</style>
