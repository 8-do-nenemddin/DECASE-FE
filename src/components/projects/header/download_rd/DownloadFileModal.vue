<template>
  <CommonModal
    :close-on-overlay-click="true"
    :modal-class="modalClasses"
    :close-button-class="closeButtonClasses"
    class="modern-modal"
    @close="handleClose"
  >
    <div class="modal-content">
      <DownloadRdContent @close="handleClose" />
    </div>
  </CommonModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CommonModal from '../../../util/CommonModal.vue'
import DownloadRdContent from './DownloadRdContent.vue'

// Props
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'large'].includes(value)
  },
  theme: {
    type: String,
    default: 'auto',
    validator: (value) => ['light', 'dark', 'auto'].includes(value)
  }
})

// Emits
const emit = defineEmits(['close'])

// Computed classes
const modalClasses = computed(() => {
  const base = 'modern-modal-container'
  const variants = {
    default: 'modal-default',
    compact: 'modal-compact', 
    large: 'modal-large'
  }
  return `${base} ${variants[props.variant]}`
})

const closeButtonClasses = computed(() => {
  return 'modern-close-btn'
})

// Methods
const handleClose = () => {
  emit('close')
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    handleClose()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Modern Modal Container */
:deep(.modern-modal-container) {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 8px 32px rgba(99, 102, 241, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
  transform: translateZ(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

:deep(.modern-modal-container::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(139, 92, 246, 0.02));
  opacity: 1;
  transition: opacity 0.4s ease;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :deep(.modern-modal-container) {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-color: rgba(55, 65, 81, 0.6);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.6),
      0 8px 32px rgba(99, 102, 241, 0.2),
      0 0 0 1px rgba(55, 65, 81, 0.3);
  }

  :deep(.modern-modal-container::before) {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  }
}

/* Modal Variants */
:deep(.modal-default) {
  max-width: 600px;
  min-height: 400px;
  margin: 2rem;
}

:deep(.modal-compact) {
  max-width: 400px;
  min-height: 300px;
  margin: 1.5rem;
}

:deep(.modal-large) {
  max-width: 900px;
  min-height: 600px;
  margin: 1rem;
}

/* Modern Close Button */
:deep(.modern-close-btn) {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.modern-close-btn:hover) {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: #475569;
  border-color: #cbd5e1;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

:deep(.modern-close-btn:active) {
  transform: scale(1.05) rotate(90deg);
}

@media (prefers-color-scheme: dark) {
  :deep(.modern-close-btn) {
    background: linear-gradient(135deg, #374151, #1f2937);
    border-color: rgba(75, 85, 99, 0.6);
    color: #9ca3af;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  :deep(.modern-close-btn:hover) {
    background: linear-gradient(135deg, #4b5563, #374151);
    color: #d1d5db;
    border-color: rgba(107, 114, 128, 0.8);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
}

/* Enhanced Glass Effect */
:deep(.modern-modal-container)::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg, 
    transparent, 
    rgba(255, 255, 255, 0.6), 
    transparent
  );
}

@media (prefers-color-scheme: dark) {
  :deep(.modern-modal-container)::after {
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
  }
}

/* Modal Content */
.modal-content {
  position: relative;
  min-height: 100%;
  z-index: 1;
}

/* Animations */
:deep(.modern-modal) {
  animation: modalSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Enhanced Scrollbar */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.05));
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (prefers-color-scheme: dark) {
  .modal-content::-webkit-scrollbar-track {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #4b5563, #374151);
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #6b7280, #4b5563);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  :deep(.modal-default),
  :deep(.modal-compact),
  :deep(.modal-large) {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
    min-height: auto;
  }
  
  .modal-content {
    padding: 32px;
  }
  
  :deep(.modern-close-btn) {
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  :deep(.modal-default),
  :deep(.modal-compact),
  :deep(.modal-large) {
    margin: 0.5rem;
    border-radius: 16px;
  }
  
  .modal-content {
    padding: 24px;
  }

  :deep(.modern-close-btn) {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

/* Focus Management */
:deep(.modern-modal-container:focus-within) {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 8px 32px rgba(99, 102, 241, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    0 0 0 3px rgba(99, 102, 241, 0.3);
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  :deep(.modern-modal-container) {
    background: white;
    border: 3px solid black;
    backdrop-filter: none;
  }
  
  :deep(.modern-close-btn) {
    background: white;
    border: 2px solid black;
    color: black;
  }
  
  @media (prefers-color-scheme: dark) {
    :deep(.modern-modal-container) {
      background: black;
      border-color: white;
    }

    :deep(.modern-close-btn) {
      background: black;
      border-color: white;
      color: white;
    }
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  :deep(.modern-modal) {
    animation: none;
  }
  
  * {
    transition-duration: 0.01ms !important;
  }
}

/* Enhanced Hover Effects */
:deep(.modern-modal-container:hover) {
  transform: translateY(-2px);
  box-shadow: 
    0 32px 64px -12px rgba(0, 0, 0, 0.3),
    0 12px 40px rgba(99, 102, 241, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

@media (prefers-color-scheme: dark) {
  :deep(.modern-modal-container:hover) {
    box-shadow: 
      0 32px 64px -12px rgba(0, 0, 0, 0.7),
      0 12px 40px rgba(99, 102, 241, 0.3),
      0 0 0 1px rgba(55, 65, 81, 0.4);
  }
}

/* Loading States */
.modal-content.loading {
  opacity: 0.8;
  pointer-events: none;
}

.modal-content.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border: 3px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>