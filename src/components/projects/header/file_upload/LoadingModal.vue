<template>
  <div class="loading-container">
    <!-- Modern Gradient Background -->
    <div class="gradient-bg"></div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- AI Icon with Animation -->
      <div class="ai-icon-container">
        <div class="ai-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              fill="currentColor"
            />
            <path
              d="M19 15L19.5 17L22 17.5L19.5 18L19 20L18.5 18L16 17.5L18.5 17L19 15Z"
              fill="currentColor"
            />
            <path
              d="M5 15L5.5 17L8 17.5L5.5 18L5 20L4.5 18L2 17.5L4.5 17L5 15Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div class="pulse-ring"></div>
      </div>

      <!-- Loading Text -->
      <h2 class="loading-text">
        <span class="text-gradient">
          <span v-if="!isCompleted">업로드된 파일을 기반으로</span>
          <span v-else>요청 완료</span>
          <br />
          <span v-if="!isCompleted">AI에게 요구사항 정의서 수정 요청중...</span>
        </span>
      </h2>

      <!-- Progress Bar -->
      <div class="progress-container" v-if="!isCompleted">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <!-- Status Message -->
      <p class="status-message">
        <span v-if="!isCompleted"
          >AI에게 파일 분석 및 요구사항 업데이트를 요청하고 있습니다.</span
        >
        <span v-else>요구사항 업데이트는 약 30분 정도 소요됩니다.</span>
      </p>

      <!-- Info Message -->
      <div class="info-box" v-if="!isCompleted">
        <div class="info-icon">ℹ️</div>
        <p class="info-text">
          창을 닫아도 요구사항 업데이트 요청은 종료되지 않습니다.
        </p>
      </div>

      <!-- Close Button for Completed State -->
      <div v-if="isCompleted" class="close-actions">
        <button class="close-button" @click="handleClose">창 닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const handleClose = () => {
  emit("close");
};
</script>

<style scoped>
.loading-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #333 100%);
  border-radius: 16px;
}

.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #333 100%);
  opacity: 0.1;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.2;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
}

/* AI Icon */
.ai-icon-container {
  position: relative;
  margin-bottom: 32px;
}

.ai-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #333 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.ai-icon svg {
  width: 40px;
  height: 40px;
  animation: rotate 4s linear infinite;
}

.pulse-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Loading Text */
.loading-text {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 32px 0;
  line-height: 1.4;
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textShimmer 2s ease-in-out infinite;
}

@keyframes textShimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Progress Bar */
.progress-container {
  width: 100%;
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #333 100%);
  border-radius: 3px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: dotPulse 1.5s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Status Message */
.status-message {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  font-weight: 500;
}

/* Info Box */
.info-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.info-text {
  font-size: 14px;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}

/* Close Button */
.close-actions {
  margin-top: 24px;
}

.close-button {
  background: linear-gradient(135deg, #667eea 0%, #333 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  font-family: inherit;
}

.close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.close-button:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 32px 24px;
    margin: 16px;
  }

  .ai-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }

  .ai-icon svg {
    width: 32px;
    height: 32px;
  }

  .loading-text {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .status-message {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 24px 20px;
  }

  .ai-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .ai-icon svg {
    width: 28px;
    height: 28px;
  }

  .loading-text {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .info-text {
    font-size: 13px;
  }
}
</style>
