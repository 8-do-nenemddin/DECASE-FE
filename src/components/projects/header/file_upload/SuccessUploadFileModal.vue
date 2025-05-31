<template>
  <div class="completion-icon">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>

  <h2 class="completion-text">생성 완료</h2>
  <div class="button-group">
    <button class="complete-confirm-button" @click="$emit('close')">
      확인
    </button>
  </div>
</template>

<style scoped>
.completion-icon {
  color: #000000;
  margin-bottom: 24px;
}

.completion-text {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 24px;
}

.complete-confirm-button {
  background: #000000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.complete-confirm-button:hover {
  background: #1a202c;
}
</style>
