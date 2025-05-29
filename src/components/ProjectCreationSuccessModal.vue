<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="success-modal-container" @click.stop>
      <!-- X 버튼 -->
      <button class="close-button" @click="$emit('close')">X</button>

      <!-- 성공 아이콘 -->
      <div class="success-icon">
        <svg viewBox="0 0 100 100" class="checkmark-svg">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#000"
            stroke-width="4"
            class="circle-bg"
          />
          <path
            d="M25 50 L42 67 L75 34"
            fill="none"
            stroke="#000"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="checkmark"
          />
        </svg>
      </div>

      <!-- 성공 메시지 -->
      <h2 class="success-title">Project 생성 완료</h2>

      <!-- 확인 버튼 -->
      <button class="confirm-button" @click="handleConfirm">확인</button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["close", "confirm"]);

const handleOverlayClick = () => {
  emit("close");
};

const handleConfirm = () => {
  emit("confirm");
};
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.success-modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 480px;
  padding: 48px 40px;
  margin: 1rem;
  overflow: hidden;
  transform: scale(0.9) translateY(20px);
  animation: slideUp 0.3s ease forwards;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 32px;
}

.success-modal-container::-webkit-scrollbar {
  display: none;
}

.success-modal-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes slideUp {
  to {
    transform: scale(1) translateY(0);
  }
}

/* Close Button */
.close-button {
  position: absolute;
  top: 20px;
  right: 24px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
  transform: scale(1.05);
}

/* Success Icon */
.success-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark-svg {
  width: 100%;
  height: 100%;
}

.circle-bg {
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  animation: circle-fill 0.6s ease-in-out 0.2s forwards;
}

.checkmark {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: checkmark-draw 0.4s ease-in-out 0.6s forwards;
}

@keyframes circle-fill {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Success Title */
.success-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  letter-spacing: -0.025em;
}

/* Confirm Button */
.confirm-button {
  background: #000000;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  min-width: 100px;
}

.confirm-button:hover {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.confirm-button:active {
  transform: translateY(0);
}

/* Loading animation for icon */
.success-icon {
  animation: iconScale 0.5s ease-out 0.3s both;
}

@keyframes iconScale {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .success-modal-container {
    margin: 16px;
    max-width: calc(100vw - 32px);
    padding: 40px 32px;
    gap: 28px;
  }

  .success-title {
    font-size: 20px;
  }

  .success-icon {
    width: 70px;
    height: 70px;
  }

  .close-button {
    top: 16px;
    right: 20px;
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .success-modal-container {
    margin: 12px;
    max-width: calc(100vw - 24px);
    padding: 32px 24px;
    gap: 24px;
  }

  .success-title {
    font-size: 18px;
  }

  .success-icon {
    width: 60px;
    height: 60px;
  }

  .confirm-button {
    padding: 12px 28px;
    font-size: 14px;
  }

  .close-button {
    top: 12px;
    right: 16px;
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
}
</style>
