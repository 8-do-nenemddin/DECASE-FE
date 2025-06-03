<template>
  <header class="header">
    <div class="logo-container">
      <img src="/DECASE-light.png" alt="DECASE Logo" class="logo" />
    </div>
    <div class="welcome-message">
      <h1>DECASE에 오신 것을 환영합니다.</h1>
    </div>
    <div class="profile-section">
      <div class="profile-icon" @click="toggleProfileSidebar">
        <span>프로필</span>
      </div>
    </div>

    <!-- 분리된 프로필 사이드바 컴포넌트 사용 -->
    <ProfileBar
      :isVisible="showProfileSidebar"
      :profileData="profileData"
      @close="closeProfileSidebar"
      @logout="handleLogout"
      @withdraw="handleWithdraw"
    />
  </header>
</template>

<script setup>
import { ref } from "vue";
import ProfileBar from "./ProfileBar.vue"; // 분리된 컴포넌트 import

const showProfileSidebar = ref(false);

// 프로필 데이터
const profileData = ref({
  name: '김민주',
  company: 'SK AX',
  role: '미래혁신부'
});

const toggleProfileSidebar = () => {
  showProfileSidebar.value = !showProfileSidebar.value;
};

const closeProfileSidebar = () => {
  showProfileSidebar.value = false;
};

const handleLogout = () => {
  console.log("로그아웃");
  // 로그아웃 로직 구현
};

const handleWithdraw = () => {
  console.log("탈퇴하기");
  // 탈퇴 로직 구현
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  /* 모든 애니메이션 완전 제거 (모달 제외) */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* 필요한 호버 효과만 허용 */
.profile-icon:hover {
  transition: all 0.2s ease !important;
}

/* Header Styles - 높이 줄이고 애니메이션 효과 제거 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px; /* 35px에서 20px로 줄임 */
  background-color: #ffffff;
  position: relative;
  min-height: 60px; /* 130px에서 90px로 줄임 */
  width: 100%;
  flex-shrink: 0;
  font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif;
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
  width: 60px;
  display: block;
  margin-top: 30px;
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

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .header {
    padding: 15px 40px;
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
}

@media (max-width: 480px) {
  .header {
    padding: 15px;
  }
  
  .welcome-message h1 {
    font-size: 1.4em;
  }
}
</style>