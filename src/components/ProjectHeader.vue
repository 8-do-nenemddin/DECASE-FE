<template>
  <header class="project-header-main-vue-style">
    <!-- 왼쪽 그룹 -->
    <div class="left-group">
      <div class="logo-container">
        <img src="/DECASE-light.png" alt="DECASE Logo" class="logo" />
      </div>
      <div class="search-container">
        <input 
          type="text" 
          placeholder="검색..." 
          class="search-input"
          @input="$emit('search', $event.target.value)"
        />
      </div>
      <button class="action-button list-btn" @click="$emit('showList')">
        리스트
      </button>
      <button class="action-button upload-btn" @click="$emit('uploadLogo')">
        업로드
      </button>
    </div>

    <!-- 중앙 프로젝트 이름 -->
    <div class="project-title-container">
      <h1>{{ projectName }}</h1>
    </div>

    <!-- 오른쪽 그룹 -->
    <div class="right-group">
      <button class="action-button download-btn" @click="$emit('generateRequirements')">
        다운로드
      </button>
      <div class="profile-icon-main-vue-style" @click="$emit('profileClick')">
        프로필
      </div>
      <div class="settings-icon" @click="$emit('settingsClick')">
        설정
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  projectName: {
    type: String,
    default: 'Project Name'
  }
});

const emit = defineEmits([
  'search', 
  'showList', 
  'uploadLogo', 
  'generateRequirements', 
  'profileClick', 
  'settingsClick'
]);
</script>

<style>

* {
  animation: none !important;
}

/* 헤더 레이아웃: grid로 정중앙 고정 */
.project-header-main-vue-style {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
}

/* 왼쪽 그룹 */
.left-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 35px;
  width: auto;
  display: block;
}

.search-container {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9em;
  width: 200px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* 중앙 프로젝트 이름 */
.project-title-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  white-space: nowrap;
}

.project-title-container h1 {
  font-size: 1.8em;
  font-weight: bold;
  margin: 0;
  color: #333;
}

/* 오른쪽 그룹 */
.right-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 공통 버튼 스타일 */
.action-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  background-color: #0056b3;
}

.list-btn {
  background-color: #28a745;
}

.list-btn:hover {
  background-color: #1e7e34;
}

.upload-btn {
  background-color: #ffc107;
  color: #212529;
}

.upload-btn:hover {
  background-color: #e0a800;
}

.download-btn {
  background-color: #17a2b8;
}

.download-btn:hover {
  background-color: #117a8b;
}

/* 프로필 아이콘 */
.profile-icon-main-vue-style {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75em;
  color: #6c757d;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.profile-icon-main-vue-style:hover {
  background-color: #dee2e6;
}

/* 설정 아이콘 */
.settings-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  background-color: #6c757d;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75em;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.settings-icon:hover {
  background-color: #5a6268;
}

/* 반응형 스타일 */
@media (max-width: 1200px) {
  .search-input {
    width: 150px;
  }

  .action-button {
    padding: 6px 10px;
    font-size: 0.8em;
  }

  .project-title-container h1 {
    font-size: 1.5em;
  }
}

@media (max-width: 768px) {
  .left-group,
  .right-group {
    gap: 10px;
  }

  .search-input {
    width: 120px;
  }

  .action-button {
    padding: 6px 8px;
    font-size: 0.75em;
  }

  .project-title-container h1 {
    font-size: 1.3em;
  }

  .profile-icon-main-vue-style,
  .settings-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
