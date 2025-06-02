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
		<tr
		  v-for="project in localProjects"
		  :key="project.id"
		  @click="project.showDropdown ? null : navigateToProject(project.name)"
		  class="project-row"
		>
		  <td class="title-cell">{{ project.name }}</td>
		  <td>{{ project.versionInfo }}</td>
		  <td>
			<div class="status-wrapper" @click.stop="toggleDropdown(project)">
			  <span
				class="status-badge"
				:class="'status-' + project.status.toLowerCase().replaceAll(' ', '_')"
			  >
				{{ project.status }}
			  </span>
			  <ul v-if="project.showDropdown" class="status-dropdown">
				<li
				  v-for="status in statusOptions"
				  :key="status"
				  class="status-badge"
				  :class="'status-' + status.toLowerCase().replaceAll(' ', '_')"
				  @click.stop="changeStatus(project, status)"
				>
				  {{ status }}
				</li>
			  </ul>
			</div>
		  </td>
		  <td>{{ project.date }}</td>
		</tr>
	  </tbody>
	</table>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  
  const props = defineProps({
	projects: {
	  type: Array,
	  required: true,
	},
  });
  
  const localProjects = ref([]);
  
  watch(
	() => props.projects,
	(newVal) => {
	  localProjects.value = newVal.map((p) => ({
		...p,
		showDropdown: false,
	  }));
	},
	{ immediate: true, deep: true }
  );
  
  const router = useRouter();
  const statusOptions = ['NOT_STARTED', 'IN_PROGRESS', 'DONE'];
  
  const toggleDropdown = (project) => {
	localProjects.value.forEach((p) => {
	  if (p !== project) p.showDropdown = false;
	});
	project.showDropdown = !project.showDropdown;
  };
  
  const changeStatus = (project, status) => {
	project.status = status;
	project.showDropdown = false;
  };
  
  const navigateToProject = (projectName) => {
	router.push({ name: 'ProjectHome', params: { projectName } });
  };
  </script>
  
  <style scoped>
 .project-table {
  width: 100%;
  border-collapse: collapse;
  color: #333;
  background-color: white; /* 테이블 전체 배경 */
}

.project-table th,
.project-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #ccc;
  background-color: transparent; /* 셀 배경 제거: 호버 덮지 않도록 */
  transition: background-color 0.2s ease;
}

.project-row {
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.project-row:hover td {
  background-color: #f1f1f1; /* 행 호버 시 셀 배경에 색상 적용 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
  .status-wrapper {
	position: relative;
	display: inline-block;
  }
  
  .status-badge {
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 0.75em;
	font-weight: 500;
	min-width: 90px;
	text-align: center;
	display: inline-block;
	cursor: pointer;
	white-space: nowrap;
  }
  
  .status-dropdown {
	position: absolute;
	top: 110%;
	left: 0;
	background: white;
	border: 1px solid #ccc;
	border-radius: 6px;
	list-style: none;
	padding: 4px 0;
	margin: 4px 0 0;
	z-index: 100;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	width: max-content;
	min-width: 120px;
  }
  
  .status-dropdown li {
	padding: 6px 12px;
	cursor: pointer;
	font-size: 0.75em;
	transition: background-color 0.2s ease;
	white-space: nowrap;
  }
  
  .status-dropdown li:hover {
	background-color: #f0f0f0;
  }
  
  /* 상태별 스타일 */
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