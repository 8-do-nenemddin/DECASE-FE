<template>
	<table class="project-table">
	  <thead>
		<tr>
		  <th>제목</th>
		  <th>소스</th>
		  <th>상태</th>
		  <th>생성됨</th>
		</tr>
	  </thead>
	  <tbody>
		<tr v-for="project in projects" :key="project.id" @click="navigateToProject(project.name)" class="project-row">
		  <td class="title-cell">
			{{ project.name }}
		  </td>
		  <td>{{ project.versionInfo }}</td>
		  <td>
			<span class="status-badge" :class="'status-' + project.status.toLowerCase()">
			  {{ project.status }}
			</span>
		  </td>
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
  
  .project-table tr {
  border-bottom: 1px solid #444;
}

  .project-table th,
  .project-table td {
	padding: 16px;
	text-align: left;
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

  .status-badge {
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 0.8em;
  }
  
  .status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

	/* ✅ 상태별 배경/글자색 */
	.status-done {
	background-color: #ede7f6;
	color: #512da8;
	}

	.status-in_progress {
	background-color: #e8f5e9;
	color: #2e7d32;
	}

	.status-not_started {
	background-color: #f5f5f5;
	color: #616161;
	}
  </style>
  