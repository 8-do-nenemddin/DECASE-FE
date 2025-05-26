<template>
  <div class="project-home-container">
    <header class="project-header-main-vue-style">
      <div class="logo-container">
        <img src="/DECASE.png" alt="DECASE Logo" class="logo" />
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
.project-home-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Ensure container takes full viewport height */
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden; /* Prevent overall page scroll, children will handle their own scroll if needed */
}

.project-header-main-vue-style {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-shrink: 0; /* Prevent header from shrinking */
}

.logo-container .logo {
  height: 50px;
}

.project-title-container h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
}

.header-actions-main-vue-style {
  display: flex;
  align-items: center;
}

.header-actions-main-vue-style .action-button {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-right: 20px;
}

.profile-icon-main-vue-style {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
}

.project-main-content {
  display: flex;
  flex-grow: 1; /* Allow main content to fill available vertical space */
  gap: 20px;
  overflow: hidden; /* Prevent this container from scrolling, children will handle their own */
  min-height: 0; /* Important for flex children to allow shrinking and scrolling */
}

.sidebar {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0; /* Prevent sidebar from shrinking horizontally */
  overflow-y: auto; /* Allow sidebar to scroll vertically if content exceeds its height */
  padding-bottom: 10px; /* Add some padding at the bottom if it scrolls */
}

.sidebar-item-container { 
  /* This container is mostly for margin/spacing if needed, 
     the .sidebar-item will handle the visual appearance */
}

.sidebar-item {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.95em;
  background-color: #fff;
  display: flex;
  flex-direction: column; /* Allow content to flow vertically */
  transition: all 0.3s ease; /* Smooth transition for height changes */
}

.sidebar-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%; /* Ensure header takes full width */
}

.sidebar-item .arrow {
  font-weight: bold;
  transition: transform 0.3s ease;
}

.sidebar-item .arrow.expanded {
  transform: rotate(180deg);
}

.sidebar-item-content-integrated {
  margin-top: 10px; /* Space between header and content */
  width: 100%;
  /* No border or background here, it's part of the .sidebar-item */
}

.empty-message {
    color: #777;
    font-size: 0.9em;
    padding: 5px 0;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  position: relative;
  padding-bottom: 22px; /* 날짜 들어갈 공간 확보 */
  overflow: hidden;
}

.file-item {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  display: flex;
  flex-direction: column;
  position: relative;
}

.file-line {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between; /* 아이콘+이름 왼쪽, 삭제 버튼 오른쪽 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-date {
  font-size: 0.7em;
  color: #888;
  text-align: right;
  margin-top: 4px;
  padding-right: 4px;
}

.file-icon {
  background-color: transparent !important;
  border: 1px solid;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-right: 8px;
  min-width: 30px;
  text-align: center;
}

.file-icon-pdf {
  border-color: #FF5252;
  color: #FF5252;
}

.file-icon-xlsx {
  border-color: #4CAF50;
  color: #4CAF50;
}

.file-icon-docx {
  border-color: #2196F3;
  color: #2196F3;
}

.file-icon-file {
  border-color: #9E9E9E;
  color: #9E9E9E;
}

.welcome-text {
  margin-top: auto;
  padding: 10px;
  font-size: 0.9em;
  color: #555;
  flex-shrink: 0; /* Prevent welcome text from shrinking */
}

.main-panel {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
  max-height: 70vh;
}

.file-upload-area {
  flex-grow: 1; /* 📦 상대적으로 작게 */
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  color: #777;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70px; /* 원래 200px → 줄이기 */
}

.upload-controls {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
}

  .add-file-button {
    position: relative;
    width: 80px;
    height: 40px;
    border-radius: 5px 5px 0 0; /* Rounded corners only on top */
    background-color: #777;
    color: white;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
  }

  .file-options {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #777;
    border: 1px solid #ccc;
    border-radius: 0 0 5px 5px; /* Rounded corners only on bottom */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 10;
    width: 80px; /* Match the width of the add-file-button */
    transition: all 0.3s ease;
  }

  .file-options div {
    font-size: 0.5em;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .file-options div:hover {
    background-color: #f0f0f0;
  }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

.upload-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #777;
  color: white;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
}

.upload-placeholder {
  flex-grow: 1;
  height: 40px;
  border: 1px dashed #ccc;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
}

.excel-preview {
  flex-grow: 4; /* 🧱 공간 더 크게 */
  margin-bottom: 20px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  padding: 10px;
  max-height: 100%; /* 제한 없이 꽉 채우기 */
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.table-scroll-container {
  overflow-x: auto;        /* 👈 가로 스크롤 */
  width: 100%;
}

.table-scroll-container table {
  width: max-content;      /* 👈 내용에 맞춰 넓이 설정 */
  border-collapse: collapse;
}

.table-scroll-container td {
  border: 1px solid #ddd;
  padding: 4px 8px;
  white-space: nowrap;     /* 👈 셀 안에서 줄바꿈 방지 */
  font-size: 14px;
}

.file-list-scrollable {
  max-height: 180px; /* 대략 4~5줄 */
  overflow-y: auto;
  padding-right: 4px; /* 스크롤바 공간 확보 */
}

/* 스크롤바 예쁘게 (크롬 기준) */
.file-list-scrollable::-webkit-scrollbar {
  width: 6px;
}
.file-list-scrollable::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.file-list-scrollable::-webkit-scrollbar-track {
  background-color: transparent;
}

.delete-button {
  margin-left: auto;
  background: none;
  border: none;
  color: #ccc;
  font-size: 0.9em;
  cursor: pointer;
  transition: color 0.2s ease;
}

.delete-button:hover {
  color: #ff4d4f;
}

.download-button {
  background: none;
  border: none;
  color: #aaa;
  font-size: 0.9em;
  cursor: pointer;
  padding: 2px 6px;
  transition: color 0.2s ease;
}

.download-button:hover {
  color: #007bff;
}
</style>