<template>
	<div class="project-grid">
	  <div class="project-card" v-for="project in projects" :key="project.id" @click="navigateToProject(project.name)">
		<h2>{{ project.name }}</h2>
		<p>
		{{ project.date }} ・ {{ project.versionInfo }} ・
		<span class="project-status" :class="'status-' + project.status.toLowerCase()">
			{{ project.status }}
		</span>
		</p>

	  </div>
	</div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';

  const props = defineProps({
	projects: {
	  type: Array,
	  required: true
	}
  });

  const router = useRouter();

  const navigateToProject = (projectName) => {
    router.push({ name: 'ProjectHome', params: { projectName: projectName } });
  };
  </script>
  
  <style scoped>
  .project-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
  }
  
  .project-card {
	border: 1px solid #ccc;
	border-radius: 8px;
	padding: 20px;
	height: 150px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	background-color: #fff;
    cursor: pointer; /* Add cursor pointer for better UX */
  }
  
  .project-card h2 {
	font-size: 1.5em;
	margin: 0 0 10px 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
  }
  
  .project-card p {
	font-size: 0.9em;
	color: #555;
	margin: 0;
  }
  </style>

<style scoped>
.project-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-top: 8px;
  display: inline-block;
}

.status-active {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.status-inactive {
  background-color: #fff3e0;
  color: #e65100;
}

.status-completed {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.project-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-top: 8px;
  display: inline-block;
  font-weight: 500;
  min-width: 100px;
  text-align: center;
  text-transform: capitalize;
}

/* ✅ 상태별 스타일 */
.status-done {
  background-color: #ede7f6; /* 연보라 */
  color: #512da8;           /* 진보라 */
}

.status-in_progress {
  background-color: #e8f5e9; /* 연녹색 */
  color: #2e7d32;           /* 진녹색 */
}

.status-not_started {
  background-color: #f5f5f5; /* 연회색 */
  color: #616161;           /* 중회색 */
}
</style>