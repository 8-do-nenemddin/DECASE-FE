<template>
    <header class="project-header-main-vue-style">
      <div class="logo-container">
        <img src="/DECASE-light.png" alt="DECASE Logo" class="logo" />
      </div>
      <div class="project-title-container">
        <h1>{{ projectName }}</h1>
      </div>
      <div class="header-actions-main-vue-style">
        <button class="action-button" @click="$emit('generateRequirement')">
          최종 요구사항 정의서 생성
        </button>
        <div class="profile-icon-main-vue-style" @click="$emit('profileClick')">
          프로필
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  defineProps({
    projectName: {
      type: String,
      default: 'Project Name'
    }
  });
  
  defineEmits(['generateRequirement', 'profileClick']);
  </script>
  
  <style scoped>
  /* 전역 애니메이션 제거 */
  * {
    box-sizing: border-box;
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  
  /* 필요한 호버 효과만 허용 */
  .action-button:hover,
  .profile-icon-main-vue-style:hover {
    transition: all 0s !important;
  }
  
  /* 헤더 - 애니메이션 완전 제거 */
  .project-header-main-vue-style {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    background-color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    /* 헤더 애니메이션 제거 */
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  
  .logo-container {
    display: flex;
    align-items: center;
  }
  
  .logo {
    height: 60px;
    width: auto;
    display: block;
    /* 로고 애니메이션 제거 */
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  
  .project-title-container {
    flex: 1;
    text-align: center;
  }
  
  .project-title-container h1 {
    font-size: 1.8em;
    font-weight: bold;
    margin: 0;
    color: #333;
    /* 제목 애니메이션 제거 */
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  
  .header-actions-main-vue-style {
    display: flex;
    align-items: center;
    gap: 15px;
    /* 헤더 액션 애니메이션 제거 */
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  
  .header-actions-main-vue-style .action-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 500;
    /* 버튼 애니메이션 제거하되 호버 시에만 즉시 변경 */
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  
  .header-actions-main-vue-style .action-button:hover {
    background-color: #0056b3;
  }
  
  .profile-icon-main-vue-style {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #e9ecef;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8em;
    color: #6c757d;
    cursor: pointer;
    /* 프로필 아이콘 애니메이션 제거 */
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  
  .profile-icon-main-vue-style:hover {
    background-color: #dee2e6;
  }
  </style>