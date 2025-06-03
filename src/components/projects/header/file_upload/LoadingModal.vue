<template>
  <div class="loading-container">
    <div class="loading-spinner">
      <div class="dot dot1"></div>
      <div class="dot dot2"></div>
      <div class="dot dot3"></div>
      <div class="dot dot4"></div>
      <div class="dot dot5"></div>
      <div class="dot dot6"></div>
      <div class="dot dot7"></div>
      <div class="dot dot8"></div>
    </div>

    <!-- 로딩 텍스트 -->
    <h2 class="loading-text">요구사항 정의서 생성 중...</h2>

    <!-- 안내 메시지 -->
    <p class="loading-message">
      창을 닫아도 요구사항 정의서 생성은 종료되지 않습니다.
    </p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  min-height: 300px;
}

/* Loading Spinner */
.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 32px;
}

.dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #000000;
  border-radius: 50%;
  animation: loading 1.2s infinite ease-in-out;
}

.dot1 {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.dot2 {
  top: 15%;
  right: 15%;
  animation-delay: 0.15s;
}

.dot3 {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  animation-delay: 0.3s;
}

.dot4 {
  bottom: 15%;
  right: 15%;
  animation-delay: 0.45s;
}

.dot5 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.6s;
}

.dot6 {
  bottom: 15%;
  left: 15%;
  animation-delay: 0.75s;
}

.dot7 {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  animation-delay: 0.9s;
}

.dot8 {
  top: 15%;
  left: 15%;
  animation-delay: 1.05s;
}

@keyframes loading {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Loading Text */
.loading-text {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Loading Message */
.loading-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .loading-container {
    padding: 32px 16px;
    min-height: 250px;
  }

  .loading-spinner {
    width: 64px;
    height: 64px;
    margin-bottom: 28px;
  }

  .dot {
    width: 10px;
    height: 10px;
  }

  .loading-text {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .loading-message {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .loading-container {
    padding: 24px 12px;
    min-height: 220px;
  }

  .loading-spinner {
    width: 56px;
    height: 56px;
    margin-bottom: 24px;
  }

  .dot {
    width: 8px;
    height: 8px;
  }

  .loading-text {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .loading-message {
    font-size: 12px;
  }
}
</style>