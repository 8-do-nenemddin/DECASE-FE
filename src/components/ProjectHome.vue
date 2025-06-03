<template>
  <div class="project-home-container">
    <header class="project-header-main-vue-style">
      <div class="logo-container">
        <img src="/DECASE-light.png" alt="DECASE Logo" class="logo" />
      </div>
      <div class="project-title-container">
        <h1>{{ projectName }}</h1>
      </div>
      <div class="header-actions-main-vue-style">
        <button class="action-button">최종 요구사항 정의서 생성</button>
        <div class="profile-icon-main-vue-style">프로필</div>
      </div>
    </header>
    <main class="project-main-content">
      <aside class="sidebar">
        <div v-for="(item, index) in sidebarItems" :key="index" 
             class="sidebar-item-container" 
             :class="{ 'expanded-container': item.expanded }">
          <div class="sidebar-item" @click="toggleItem(index)">
            <div class="sidebar-item-header">
              {{ item.name }}
              <span class="arrow" :class="{ 'expanded': item.expanded }">∨</span>
            </div>
            <div v-if="item.expanded" class="sidebar-item-content-integrated">
              <p v-if="item.name === '업로드한 파일' && (!item.files || item.files.length === 0)" class="empty-message">
                업로드된 파일 목록이 여기에 표시됩니다.
              </p>
              <ul v-if="item.name === '업로드한 파일' && item.files && item.files.length > 0" class="file-list file-list-scrollable">
                <li
                v-for="(file, fileIndex) in item.files"
                :key="fileIndex"
                class="file-item"
                >
                <div class="file-line">
                  <span
                  class="file-icon"
                  :class="'file-icon-' + getFileIcon(file.name).type"
                  >
                  {{ getFileIcon(file.name).type }}
                  </span>
                  <span class="file-name">{{ file.name }}</span>

                  <!-- ❌ 삭제 버튼: 파일명 오른쪽에 위치 -->
                  <button class="delete-button" @click.stop="deleteUploadedFile(fileIndex)">
                  ✕
                  </button>
                </div>
                <div class="file-date">{{ file.date }}</div>
                </li>
              </ul>

              <p v-if="item.name === '생성된 파일' && (!item.files || item.files.length === 0)" class="empty-message">
                생성된 파일 목록이 여기에 표시됩니다.
              </p>

              <ul v-if="item.name === '생성된 파일' && item.files && item.files.length > 0" class="file-list file-list-scrollable">
                <li v-for="(file, fileIndex) in item.files" :key="fileIndex" class="file-item">
                  <div class="file-line">
                  <span class="file-icon" :class="'file-icon-' + getFileIcon(file.name).type">
                    {{ getFileIcon(file.name).type }}
                  </span>
                  <span class="file-name">{{ file.name }}</span>

                  <!-- ⬇️ 다운로드 버튼 -->
                  <button class="download-button" @click.stop="downloadGeneratedFile(file)">
                    ⬇︎
                  </button>
                  </div>
                  <div class="file-date">{{ file.date }}</div>
                </li>
              </ul>

              <p v-if="item.name === '요구사항 Diff 창'" class="empty-message">
                요구사항 Diff 내용이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </aside>
      <section class="main-panel">
        <div class="panel-header"></div>

        <!-- 🔹 엑셀 미리보기 영역 (API로 받은 파일) -->
        <div v-if="excelPreviewData.length > 0" class="excel-preview">
          <h3>📊 Excel Preview</h3>
          <div class="table-scroll-container">
            <table>
            <tr v-for="(row, rowIndex) in excelPreviewData.slice(0, 10)" :key="rowIndex">
              <td v-for="(cell, colIndex) in row" :key="colIndex">{{ cell }}</td>
            </tr>
            </table>
          </div>
        </div>

        <!-- 📦 파일 업로드 영역 -->
        <div class="file-upload-area">
          <div class="upload-controls">
          <button class="add-file-button" @click="showOptions = !showOptions">
            <span>+</span>
            <transition name="fade">
            <div v-if="showOptions" class="file-options">
              <div @click="openFilePicker('meeting')">회의록</div>
              <div @click="openFilePicker('excel')">Excel</div>
              <div @click="openFilePicker('requirement')">요구사항 정의서</div>
            </div>
            </transition>
          </button>
          <div class="upload-placeholder">
            <p>{{ placeholderText }}</p>
          </div>
          <button class="upload-button" @click="uploadFiles">
            <span>↑</span>
          </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import * as XLSX from 'xlsx';
// import axios from 'axios';

const route = useRoute();
const projectName = ref('');

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  if (['pdf'].includes(extension)) {
    return { type: 'pdf', color: '#FF5252' };
  } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
    return { type: 'xlsx', color: '#4CAF50' };
  } else if (['docx', 'doc'].includes(extension)) {
    return { type: 'docx', color: '#2196F3' };
  }
  
  return { type: 'file', color: '#9E9E9E' };
};

const sidebarItems = ref([
  { 
    name: '업로드한 파일', 
    expanded: false, 
    files: [
      { name: '제주도_관광_계획서.pdf', date: '2025-05-22' },
      { name: '제주도_관광_예산.docx', date: '2025-05-22' },
      { name: '제주도_관광_보고서.docx', date: '2025-05-22' }
    ] 
  },
  { 
    name: '생성된 파일', 
    expanded: true, 
    files: [
      { name: '제주도 관광 요구사항 정의서_v1.xls', date: '2025-05-22' },
      { name: '제주도 관광 조견표_v1.xls', date: '2025-05-22' },
      { name: '제주도 관광 보고서_v1.docx', date: '2025-05-22' },
      { name: '제주도 관광 보고서_v2.docx', date: '2025-05-24' },
    ]
  },
  { name: '요구사항 Diff 창', expanded: false, files: [] }, 
]);

const toggleItem = (index) => {
  sidebarItems.value[index].expanded = !sidebarItems.value[index].expanded;
};

onMounted(() => {
  projectName.value = route.params.projectName || 'Project Name'; 
});

const selectedFiles = ref([]);
const placeholderText = ref('파일을 드래그 앤 드롭하거나 + 버튼을 클릭하세요');

const showOptions = ref(false);

const openFilePicker = (type) => {
  showOptions.value = false;
  const input = document.createElement('input');
  input.type = 'file';
  
  if (type === 'meeting') {
    input.accept = '.doc,.docx';
  } else if (type === 'excel') {
    input.accept = '.xls,.xlsx,.csv';
  } else if (type === 'requirement') {
    input.accept = '.doc,.docx,.pdf';
  }
  
  input.onchange = (e) => {
    selectedFiles.value = Array.from(e.target.files);
    placeholderText.value = selectedFiles.value.map(file => file.name).join(', ');
  };
  
  input.click();
};

const uploadFiles = () => {
  // Implement file upload logic here
};

const excelPreviewData = ref([]); // 2D 배열

const fetchExcelFromAPI = async () => {
  try {
    const response = await axios.get('/api/excel', {
      responseType: 'arraybuffer',
    });
    const workbook = XLSX.read(new Uint8Array(response.data), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    excelPreviewData.value = data;
  } catch (error) {
    console.error('엑셀 파일 가져오기 실패:', error);
  }
};

const fetchExcelFromDemoFile = async () => {
  try {
    const response = await fetch('/public/resource/[칠칠맞조]_300. 요구사항정의서_v0.1.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    excelPreviewData.value = data;
  } catch (err) {
    console.error('데모 엑셀 파일 불러오기 실패:', err);
  }
};

onMounted(() => {
  projectName.value = route.params.projectName || 'Project Name';
//   fetchExcelFromAPI(); // 엑셀 데이터 불러오기
  fetchExcelFromDemoFile();
});

const deleteUploadedFile = (indexToDelete) => {
  const uploadItem = sidebarItems.value.find((item) => item.name === '업로드한 파일');
  if (uploadItem && uploadItem.files.length > indexToDelete) {
    uploadItem.files.splice(indexToDelete, 1);
  }
};

const downloadGeneratedFile = (file) => {
  // 예시: 백엔드에 파일명이 포함된 경로 요청
  const link = document.createElement('a');
  link.href = `/api/download?filename=${encodeURIComponent(file.name)}`;
  link.download = file.name;
  link.click();
};

</script>

<style scoped>
/* 전역 애니메이션 제거 */
* {
  box-sizing: border-box;
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* 필요한 호버 효과만 허용 */
.sidebar-item:hover,
.action-button:hover,
.profile-icon-main-vue-style:hover,
.add-file-button:hover,
.upload-button:hover,
.delete-button:hover,
.download-button:hover,
.file-options div:hover {
  transition: all 0s !important;
}

/* 전체 컨테이너 */
.project-home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f8f9fa;
}

/* 헤더 - 애니메이션 완전 제거 */
.project-header-main-vue-style {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
  background-color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 헤더 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 60px;
  width: auto;
  display: block;
  /* 로고 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.project-title-container {
  flex: 1;
  text-align: center;
}

.project-title-container h1 {
  font-size: 1.8em;
  font-weight: bold;
  margin: 0;
  color: #333;
  /* 제목 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.header-actions-main-vue-style {
  display: flex;
  align-items: center;
  gap: 15px;
  /* 헤더 액션 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.header-actions-main-vue-style .action-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  /* 버튼 애니메이션 제거하되 호버 시에만 즉시 변경 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.header-actions-main-vue-style .action-button:hover {
  background-color: #0056b3;
}

.profile-icon-main-vue-style {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8em;
  color: #6c757d;
  cursor: pointer;
  /* 프로필 아이콘 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.profile-icon-main-vue-style:hover {
  background-color: #dee2e6;
}

/* 메인 콘텐츠 */
.project-main-content {
  display: flex;
  flex: 1;
  gap: 20px;
  min-height: 0;
}

/* 사이드바 */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.sidebar-item {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  /* 사이드바 아이템 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.sidebar-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.sidebar-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  font-weight: 500;
  color: #333;
}

.sidebar-item .arrow {
  font-weight: bold;
  color: #6c757d;
  /* 화살표 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.sidebar-item .arrow.expanded {
  transform: rotate(180deg) !important;
}

.sidebar-item-content-integrated {
  padding: 0 16px 16px;
  border-top: 1px solid #f1f3f4;
  margin-top: 0;
}

.empty-message {
  color: #6c757d;
  font-size: 0.85em;
  padding: 12px 0;
  text-align: center;
  font-style: italic;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}

.file-list-scrollable {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.file-list-scrollable::-webkit-scrollbar {
  width: 6px;
}

.file-list-scrollable::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.file-list-scrollable::-webkit-scrollbar-track {
  background-color: transparent;
}

.file-item {
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.file-item:last-child {
  border-bottom: none;
}

.file-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  flex-shrink: 0;
  border: 1px solid;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7em;
  font-weight: 500;
  text-align: center;
  min-width: 35px;
}

.file-icon-pdf {
  border-color: #FF5252;
  color: #FF5252;
  background-color: rgba(255, 82, 82, 0.1);
}

.file-icon-xlsx {
  border-color: #4CAF50;
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.file-icon-docx {
  border-color: #2196F3;
  color: #2196F3;
  background-color: rgba(33, 150, 243, 0.1);
}

.file-icon-file {
  border-color: #9E9E9E;
  color: #9E9E9E;
  background-color: rgba(158, 158, 158, 0.1);
}

.file-name {
  flex: 1;
  font-size: 0.85em;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-date {
  font-size: 0.7em;
  color: #6c757d;
  margin-top: 4px;
  text-align: right;
}

.delete-button,
.download-button {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.9em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  /* 버튼 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.delete-button:hover {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}

.download-button:hover {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

/* 메인 패널 */
.main-panel {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 엑셀 미리보기 */
.excel-preview {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.excel-preview h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.1em;
}

.table-scroll-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
}

.table-scroll-container table {
  width: 100%;
  border-collapse: collapse;
  min-width: max-content;
}

.table-scroll-container td {
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  white-space: nowrap;
  font-size: 0.85em;
  color: #495057;
}

.table-scroll-container tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* 파일 업로드 영역 */
.file-upload-area {
  flex-shrink: 0;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 80px;
}

.upload-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.add-file-button {
  position: relative;
  width: 50px;
  height: 40px;
  border-radius: 8px;
  background-color: #6c757d;
  color: white;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  /* 버튼 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.add-file-button:hover {
  background-color: #5a6268;
}

.file-options {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 120px;
  overflow: hidden;
}

.file-options div {
  font-size: 0.85em;
  padding: 12px 16px;
  cursor: pointer;
  color: #333;
  border-bottom: 1px solid #f1f3f4;
  /* 옵션 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.file-options div:last-child {
  border-bottom: none;
}

.file-options div:hover {
  background-color: #f8f9fa;
}

.upload-placeholder {
  flex: 1;
  height: 40px;
  border: 1px dashed #ced4da;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  background-color: white;
  font-size: 0.9em;
}

.upload-button {
  width: 50px;
  height: 40px;
  border-radius: 8px;
  background-color: #28a745;
  color: white;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  /* 업로드 버튼 애니메이션 제거 */
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

.upload-button:hover {
  background-color: #218838;
}

/* 애니메이션 완전 제거 */
.fade-enter-active, .fade-leave-active {
  transition: none !important;
  animation: none !important;
}

.fade-enter-from, .fade-leave-to {
  opacity: 1 !important;
}
</style>