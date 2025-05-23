<template>
	<div id="app-container">
	  <header>
		<div class="logo-container">
		  <img src="/DECASE.png" alt="DECASE Logo" class="logo" />
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
			</div>
			<select class="sort-dropdown">
			  <option>최신 항목</option>
			</select>
		  </div>
		</div>
  
		<component :is="selectedViewComponent" :projects="projects" />
	  </main>
	</div>
	<CreateProjectModal v-if="showModal" @close="closeModal" @createProject="handleCreateProject" />
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import CreateProjectModal from './CreateProjectModal.vue';
  import ProjectGallery from './ProjectGallery.vue';
  import ProjectList from './ProjectList.vue';
  
  const showModal = ref(false);
  
  const openModal = () => {
	showModal.value = true;
  };
  
  const closeModal = () => {
	showModal.value = false;
  };
  
  const handleCreateProject = () => {
	console.log('새 프로젝트가 생성되었습니다.');
  };

  const projects = ref([
	{ id: 1, name: 'Project 1', date: '2025.05.12', versionInfo: '버전 이력 7개' },
	{ id: 2, name: 'Project 2', date: '2025.05.12', versionInfo: '버전 이력 7개' },
	{ id: 3, name: 'Project 3', date: '2025.05.12', versionInfo: '버전 이력 7개' },
	{ id: 4, name: 'Project 4', date: '2025.05.12', versionInfo: '버전 이력 7개' },
	]);
  
  const selectedView = ref('gallery');
  
  const setView = (view) => {
	selectedView.value = view;
  };
  
  const selectedViewComponent = computed(() => {
	return selectedView.value === 'gallery' ? ProjectGallery : ProjectList;
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
  
  /* .logo-container {
  } */
  
  .logo {
	height: 50px;
  }
  
  .welcome-message h1 {
	font-size: 2em;
	font-weight: bold;
	margin: 0;
  }
  
  /* .profile-section {
  } */
  
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
  
  /* main {
  } */
  
  .toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
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