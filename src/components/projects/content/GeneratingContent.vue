<template>
  <div class="generating-card">
    <div class="generating-content">
      <div class="generating-icon">
        <div class="spinner"></div>
      </div>
      <h2 class="generating-title">요구사항정의서 생성중입니다</h2>
      <p class="generating-subtitle">
        업로드된 RFP 파일을 분석하여 요구사항정의서를 생성하고 있습니다.<br />
        <strong>약 30분 정도 소요될 예정입니다.</strong>
      </p>
      <div class="generating-progress">
        <div class="pulse-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 별도의 로직 없음
</script>

<style scoped>
.generating-card {
  width: 100%;
  max-width: 700px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 80px 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.generating-icon {
  margin-bottom: 32px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.generating-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
}

.generating-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 40px;
}

.generating-subtitle strong {
  color: #374151;
  font-weight: 600;
}

.generating-progress {
  margin-top: 20px;
}

.pulse-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pulse-dots span {
  width: 8px;
  height: 8px;
  background: #6b7280;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.pulse-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
