<template>
	<table class="project-table">
	  <thead>
		<tr>
		  <th>제목</th>
		  <th>소스</th>
		  <th>생성됨</th>
		</tr>
	  </thead>
	  <tbody>
		<tr v-for="project in projects" :key="project.id" @click="navigateToProject(project.name)" class="project-row">
		  <td class="title-cell">
			{{ project.name }}
		  </td>
		  <td>{{ project.versionInfo }}</td>
		  <td>{{ project.date }}</td>
		</tr>
	  </tbody>
	</table>
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
  .project-table {
	width: 100%;
	border-collapse: collapse;
	color: #333;
  }
  
  .project-table th,
  .project-table td {
	padding: 16px;
	text-align: left;
	border-bottom: 1px solid #444;
  }
  
  .project-table th {
	color: #aaa;
	font-weight: normal;
  }
  
  .project-row {
    cursor: pointer; /* Add cursor pointer for better UX */
  }

  .project-row:hover {
    background-color: #f0f0f0; /* Optional: Add hover effect */
  }
  
  .title-cell {
	display: flex;
	align-items: center;
  }
  
  .thumbnail {
	width: 28px;
	height: 28px;
	margin-right: 10px;
	border-radius: 4px;
	object-fit: cover;
  }
  </style>
  