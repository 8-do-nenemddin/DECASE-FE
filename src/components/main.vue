<template>
  <div id="app-container">
    <header>
      <div class="logo-container">
        <img src="/DECASE.png" alt="DECASE Logo" class="logo" />
      </div>
      <div class="welcome-message">
        <h1>DECASE에 오신 것을 환영합니다.</h1>
      </div>
      <div class="profile-section">
        <div class="profile-icon">프로필</div>
      </div>
    </header>

    <main>
      <div class="toolbar">
        <button class="new-project-button">+ 새로 만들기</button>
        <div class="view-options">
          <button class="view-toggle-button active">✓</button>
          <button class="view-toggle-button">🗄️</button>
          <button class="view-toggle-button">☰</button>
          <select class="sort-dropdown">
            <option>최신 항목</option>
          </select>
        </div>
      </div>

      <div class="project-grid">
        <div class="project-card" v-for="project in projects" :key="project.id">
          <h2>{{ project.name }}</h2>
          <p>{{ project.date }} {{ project.versionInfo }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const projects = ref([
  { id: 1, name: 'Project 1', date: '2025.05.12', versionInfo: '버전 이력 7개' },
  { id: 2, name: 'Project 2', date: '2025.05.12', versionInfo: '버전 이력 7개' },
  { id: 3, name: 'Project 3', date: '2025.05.12', versionInfo: '버전 이력 7개' },
  { id: 4, name: 'Project 4', date: '2025.05.12', versionInfo: '버전 이력 7개' },
]);
</script>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.logo-container {
  /* 로고 스타일 */
}

.logo {
  height: 50px; /* 임의의 값 */
}

.welcome-message h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
}

.profile-section {
  /* 프로필 섹션 스타일 */
}

.profile-icon {
  width: 80px; /* 임의의 값 */
  height: 80px; /* 임의의 값 */
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
}

main {
  /* 메인 콘텐츠 영역 스타일 */
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-project-button {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.view-options {
  display: flex;
  align-items: center;
}

.view-options button, .view-options select {
  margin-left: 10px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
}

.view-options button.active {
  background-color: #e0e0e0;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  height: 150px; /* 임의의 값 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project-card h2 {
  font-size: 1.5em;
  margin: 0 0 10px 0;
}

.project-card p {
  font-size: 0.9em;
  color: #555;
  margin: 0;
}
</style>