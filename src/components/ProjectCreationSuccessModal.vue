<template>
  <div class="success-modal-overlay" @click.self="closeSuccessModal">
    <div class="success-modal-content">
      <p>프로젝트 생성이 완료되었습니다!</p>
      <button @click="closeSuccessModal">확인</button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['close']);

const closeSuccessModal = () => {
  emit('close');
};
</script>

<style scoped>
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Ensure it's above the create project modal */
}

.success-modal-content {
  background-color: white;
  padding: 20px 40px;
  border-radius: 20px; /* More rounded corners */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: auto;
  min-width: 300px; /* Minimum width */
  display: flex; /* Use flexbox for alignment */
  justify-content: space-between; /* Space between text and button */
  align-items: center; /* Vertically align items */
}

.success-modal-content p {
  margin: 0;
  font-size: 1em;
  color: #333;
  margin-right: 20px; /* Add some space to the right of the text */
}

.success-modal-content button {
  background-color: #e0e0e0; /* Light gray, as in the image */
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
}

.success-modal-content button:hover {
  background-color: #d0d0d0;
}
</style>