<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" :class="modalClass" @click.stop>
      <!-- <button
        class="close-button"
        :class="closeButtonClass"
        @click.stop="closeModal"
      >
        X
      </button> -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  closeOnOverlayClick: {
    type: Boolean,
    default: true,
  },
  modalClass: {
    type: String,
    default: "",
  },
  closeButtonClass: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    emit("close");
  }
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
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

.modal-container {
  background: white;
  border-radius: 25px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 600px;
  margin: 1rem;
  padding: 32px;
  transform: scale(0.9) translateY(20px);
  animation: slideUp 0.3s ease forwards;
  /* border: 1px solid rgba(255, 255, 255, 0.2); */
  position: relative;
}

@keyframes slideUp {
  to {
    transform: scale(1) translateY(0);
  }
}

.close-button {
  position: absolute;
  top: 24px;
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
  z-index: 70;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .modal-container {
    margin: 16px;
    max-width: calc(100vw - 32px);
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 12px;
    max-width: calc(100vw - 24px);
    padding: 20px;
  }

  .close-button {
    top: 16px;
    right: 16px;
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>
