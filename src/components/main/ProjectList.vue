<template>
	<table class="project-table">
	  <thead>
		<tr>
		  <th>제목</th>
		  <th>소스</th>
		  <th>상태</th>
		  <th>프로젝트 기간</th>
		</tr>
	  </thead>
	  <tbody>
		<tr
		  v-for="project in localProjects"
		  :key="project.id"
		  @click="project.showDropdown ? null : navigateToProject(project.projectId)"
		  class="project-row"
		>
		  <td class="title-cell">{{ project.name }}</td>
		  <td>버전 이력 {{ project.revisionCount }}개</td>
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
		  <td>{{ project.startDate }}~{{project.endDate}}</td>
		</tr>
	  </tbody>
	</table>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '/src/stores/projectStore.js';
const projectStore = useProjectStore();

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

const navigateToProject = (projectId) => {
  const selectedProject = localProjects.value.find(p => p.projectId === projectId);
  if (selectedProject) {
    projectStore.setProject(selectedProject.projectId, selectedProject.name);
    router.push({ name: "ProjectMain", params: { projectId: selectedProject.projectId } });
  }
};
</script>

<style scoped>
.project-table {
  width: 100%;
  border-collapse: collapse;
  color: #333;
  background-color: white;
}

.project-table th,
.project-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #ccc;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

.project-row {
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.project-row:hover td {
  background-color: #f1f1f1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.status-wrapper {
  position: relative;
  display: inline-block;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.7em;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  height: 28px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
  cursor: pointer;
}

.status-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  list-style: none;
  padding: 8px 0;
  margin: 8px 0 0;
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: max-content;
  min-width: 150px;
  pointer-events: auto;
}

.status-dropdown li {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.75em;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  margin: 2px 6px;
  border-radius: 6px;
}

.status-dropdown .status-badge {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  font-size: 0.7em;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  margin: 2px 4px;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  box-sizing: border-box;
  min-width: 110px;
  max-width: none;
}

/* 상태별 스타일 - 첨부 파일과 동일하게 */
.status-done {
  background-color: #f0fff4;
  color: #22543d;
  border-color: #9ae6b4;
}

.status-in_progress {
  background-color: #fef5e7;
  color: #744210;
  border-color: #f6e05e;
}

.status-not_started {
  background-color: #f7fafc;
  color: #4a5568;
  border-color: #cbd5e0;
}
</style>