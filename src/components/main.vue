<template>
	<div id="app-container">
	  <header>
		<div class="logo-container">
		  <img src="/DECASE-light.png" alt="DECASE Logo" class="logo" />
		</div>
		<div class="welcome-message">
		  <h1>DECASE에 오신 것을 환영합니다.</h1>
		</div>
		<div class="profile-section">
		  <div class="profile-icon">프로필</div>
		</div>
	  </header>
  
	  <main>
		<div class="toolbar">
		  <button class="new-project-button" @click="openModal">+ 새로 만들기</button>
		  <div class="search-container">
			<span class="search-icon">🔍</span>
			<input type="text" v-model="searchQuery" placeholder="프로젝트 검색" class="search-input" />
		  </div>
		  <div class="view-options">
			<div class="view-toggle">
			  <button 
				class="view-toggle-button" 
				:class="{ 'active': selectedView === 'gallery' }" 
				@click="setView('gallery')">
				🗄️
			  </button>
			  <button 
				class="view-toggle-button" 
				:class="{ 'active': selectedView === 'list' }" 
				@click="setView('list')">
				☰
			  </button>
			  <select class="status-dropdown" v-model="statusFilter">
				<option value="all">모두</option>
				<option value="not_started">NOT_STARTED</option>
				<option value="in_progress">IN_PROGRESS</option>
				<option value="done">DONE</option>
			  </select>
			</div>
			<select class="sort-dropdown" v-model="sortOption">
			  <option value="date,asc">날짜 (오래된 순)</option>
			  <option value="date,desc">날짜 (최신 순)</option>
			  <option value="name,asc">이름 (오름차순)</option>
			  <option value="name,desc">이름 (내림차순)</option>
			</select>
		  </div>
		</div>
  
		<component :is="selectedViewComponent" :projects="sortedProjects" />
	  </main>
  
	  <CreateProjectModal v-if="showModal" @close="closeModal" @createProject="handleCreateProject" />
	</div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import CreateProjectModal from './CreateProjectModal.vue';
  import ProjectGallery from './ProjectGallery.vue';
  import ProjectList from './ProjectList.vue';
  
  const showModal = ref(false);
  const router = useRouter();
  
  const openModal = () => { showModal.value = true; };
  const closeModal = () => { showModal.value = false; };
  
  const handleCreateProject = (newProjectName) => {
	console.log(`새 프로젝트 '${newProjectName}'가 생성되었습니다.`);
	closeModal();
	router.push({ name: 'ProjectHome', params: { projectName: newProjectName } });
  };
  
  const projects = ref([
	{ id: 1, name: 'Project 1', date: '2025.04.07', versionInfo: '버전 이력 1개', status: 'NOT_STARTED' },
	{ id: 2, name: 'Project 2', date: '2025.04.11', versionInfo: '버전 이력 2개', status: 'IN_PROGRESS' },
	{ id: 3, name: 'Project 3', date: '2025.04.13', versionInfo: '버전 이력 3개', status: 'DONE' },
	{ id: 4, name: 'Project 4', date: '2024.06.22', versionInfo: '버전 이력 4개', status: 'DONE' },
	{ id: 5, name: 'Project 5', date: '2024.06.25', versionInfo: '버전 이력 5개', status: 'IN_PROGRESS' },
	{ id: 6, name: 'Project 6', date: '2024.12.21', versionInfo: '버전 이력 6개', status: 'DONE' },
  ]);
  
  const selectedView = ref('gallery');
  const searchQuery = ref('');
  const sortOption = ref('date,desc');
  const statusFilter = ref('all');
  
  const setView = (view) => { selectedView.value = view; };
  
  const selectedViewComponent = computed(() => {
	return selectedView.value === 'gallery' ? ProjectGallery : ProjectList;
  });
  
  const sortedProjects = computed(() => {
	const [field, order] = sortOption.value.split(',');
	let filtered = projects.value;
  
	if (searchQuery.value) {
	  const keyword = searchQuery.value.toLowerCase();
	  filtered = filtered.filter((project) => project.name.toLowerCase().includes(keyword));
	}
  
	if (statusFilter.value !== 'all') {
	  filtered = filtered.filter((project) => project.status.toLowerCase() === statusFilter.value);
	}
  
	return [...filtered].sort((a, b) => {
	  let comparison = 0;
	  if (field === 'date') {
		comparison = new Date(a.date) - new Date(b.date);
	  } else {
		comparison = a.name.localeCompare(b.name);
	  }
	  return order === 'asc' ? comparison : -comparison;
	});
  });
  </script>
  
  <style scoped>
  #app-container {
	display: flex;
	flex-direction: column;
	padding: 20px;
  }
  
  header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30px;
  }
  
  .logo {
	height: 50px;
  }
  
  .welcome-message h1 {
	font-size: 2em;
	font-weight: bold;
	margin: 0;
  }
  
  .profile-icon {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background-color: #e0e0e0;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 1em;
  }
  
  .toolbar {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
  }
  
  .search-container {
	display: flex;
	align-items: center;
	border: 1px solid #ccc;
	border-radius: 5px;
	padding-left: 8px;
	margin-left: auto;
	margin-right: 10px;
  }
  
  .search-icon {
	margin-right: 5px;
  }
  
  .search-input {
	padding: 10px;
	border: none;
	font-size: 1em;
	outline: none;
  }
  
  .new-project-button {
	background-color: #000;
	color: #fff;
	border: none;
	padding: 10px 20px;
	border-radius: 5px;
	cursor: pointer;
	font-size: 1em;
  }
  
  .view-options {
	display: flex;
	align-items: center;
  }
  
  .view-options button,
  .view-options select {
	margin-left: 10px;
	padding: 8px 12px;
	border: 1px solid #ccc;
	border-radius: 5px;
	background-color: #fff;
	cursor: pointer;
  }
  
  .view-options button.active {
	background-color: #e0e0e0;
  }
  
  .view-toggle {
	display: flex;
	align-items: center;
  }
  
  .view-toggle-button {
	margin: 0 5px;
	padding: 5px 10px;
	cursor: pointer;
  }
  </style>