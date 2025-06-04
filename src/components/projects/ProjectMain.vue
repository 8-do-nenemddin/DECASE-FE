<template>
  <div class="project-main">
    <HeaderBar :project-name="projectName" />
    <!-- 메인 컨텐츠 -->
    <!-- <main class="main-content">
      <div class="welcome-section">
        <h2 class="welcome-title">Welcome aboard!</h2>
        <p class="welcome-title">Let's simplify your projects, together.</p>
      </div>
    </main> -->
    <ProjectContent></ProjectContent>
  </div>
</template>

<script setup>
import HeaderBar from "./header/HeaderBar.vue";
import ProjectContent from "./ProjectContent.vue";

const props = defineProps({
  projectName: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.project-main {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
}

/* 메인 컨텐츠 */
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

/* 반응형 디자인 */
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
