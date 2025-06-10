<template>
  <main class="main-content">
    <div class="welcome-section">
      <h2 class="welcome-title">Welcome aboard!</h2>
      <p class="welcome-subtitle">Let's simplify your projects, together.</p>
    </div>
  </main>
</template>

<script setup>
// 기본 컨텐트는 특별한 로직이 필요하지 않음
</script>

<style scoped>
.main-content {
  width: 100%;
  min-height: calc(80vh);
  padding: 40px;
  text-align: center;
  /* display: flex; 제거 */
  /* flex-direction: column; 제거 */
  /* align-items: center; 제거 */
  /* justify-content: center; 제거 */
}

.welcome-section {
  max-width: 800px; /* 필요시 최대 너비 설정 */
  margin: 0 auto; /* 중앙 정렬 */
  padding-top: 20vh; /* 수직 중앙 정렬을 위한 상단 패딩 */
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
  .welcome-section {
    padding: 30px 20px;
  }

  .welcome-title {
    font-size: 36px;
  }

  .welcome-subtitle {
    font-size: 18px;
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
