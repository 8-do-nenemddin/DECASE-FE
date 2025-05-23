<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">X</button>
      <div class="modal-header">
        <img src="/DECASE.png" alt="DECASE Logo" class="modal-logo" />
        <h2>프로젝트 생성</h2>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <input type="text" placeholder="프로젝트 이름을 입력하세요." />
          <select>
            <option disabled selected value="">도메인을 선택하세요.</option>
            <!-- Add domain options here -->
            <option value="domain1">도메인1</option>
            <option value="domain2">도메인2</option>
          </select>
        </div>
        <p class="info-text">소스를 추가하면 DECASE가 가장 중요한 정보에 따라 요구사항 정의서를 제공합니다.</p>
        <div class="file-upload-area">
          <div class="upload-icon">+</div>
          <p><strong>소스 업로드</strong></p>
          <p>업로드할 파일을 선택하거나 드래그 앤 드롭하세요. (예: RFP, 회의록, 엑셀)</p>
          <p>지원 파일 형식 : .pdf, .xlsx</p>
          <input type="file" multiple @change="handleFileUpload" style="display: none;" ref="fileInput"/>
          <button @click="triggerFileInput">파일 선택</button>
          <div v-if="uploadedFiles.length > 0" class="uploaded-files-list">
            <h4>업로드된 파일:</h4>
            <ul>
              <li v-for="file in uploadedFiles" :key="file.name">{{ file.name }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="create-project-button" @click="createProject">프로젝트 생성</button>
      </div>
    </div>
    <ProjectCreationSuccessModal v-if="showSuccessModal" @close="closeSuccessModal" />
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue';
import ProjectCreationSuccessModal from './ProjectCreationSuccessModal.vue'; // Import the success modal

const emit = defineEmits(['close', 'createProject']);
const fileInput = ref(null);
const showSuccessModal = ref(false); // Reactive state for success modal visibility
const uploadedFiles = ref([]); // Reactive state for uploaded files

const close = () => {
  emit('close');
};

const createProject = () => {
  // Placeholder for project creation logic
  console.log('프로젝트 생성 로직');
  // emit('createProject'); // We might want to emit this after success modal is closed or handled
  showSuccessModal.value = true; // Show the success modal
  // Do not close the main modal immediately, let the success modal handle it or close after confirmation
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  emit('createProject'); // Emit createProject after success modal is closed
  close(); // Close the main modal after the success modal is closed
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  const allowedExtensions = ['pdf', 'xlsx', 'xls', 'doc', 'docx'];
  const filteredFiles = Array.from(files).filter(file => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      alert('허용되지 않은 형식입니다');
      return false;
    }
    return true;
  });
  uploadedFiles.value = [...uploadedFiles.value, ...filteredFiles];
  console.log('업로드된 파일:', uploadedFiles.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  width: 600px; /* Adjust as needed */
  max-width: 90%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-header {
  margin-bottom: 20px;
}

.modal-logo {
  height: 40px; /* Adjust as needed */
  margin-bottom: 10px;
}

.modal-header h2 {
  font-size: 1.8em;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.modal-body .form-group {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.modal-body input[type="text"],
.modal-body select {
  flex-grow: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
}

.info-text {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 25px;
}

.file-upload-area {
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 25px;
  cursor: pointer;
}

.file-upload-area .upload-icon {
  font-size: 2em;
  color: #aaa;
  background-color: #f0f0f0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px auto;
}

.file-upload-area p {
  margin: 5px 0;
  font-size: 0.9em;
  color: #555;
}

.file-upload-area p:nth-of-type(2) { /* "업로드할 파일을 선택하거나..." */
  font-size: 0.8em;
}

.file-upload-area p:nth-of-type(3) { /* "지원 파일 형식..." */
  font-size: 0.8em;
  color: #777;
}

.file-upload-area button {
    margin-top: 10px;
    padding: 8px 15px;
    font-size: 0.9em;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
}

.uploaded-files-list {
  margin-top: 15px;
  text-align: left;
}

.uploaded-files-list h4 {
  font-size: 0.9em;
  margin-bottom: 5px;
  color: #333;
}

.uploaded-files-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.uploaded-files-list li {
  font-size: 0.8em;
  color: #555;
  padding: 3px 0;
  border-bottom: 1px solid #eee;
}

.uploaded-files-list li:last-child {
  border-bottom: none;
}

.modal-footer {
  text-align: right;
}

.create-project-button {
  background-color: #e0e0e0; /* Light gray, as in the image */
  color: #333;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
}

.create-project-button:hover {
  background-color: #d0d0d0;
}
</style>