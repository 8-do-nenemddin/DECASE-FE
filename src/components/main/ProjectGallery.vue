<template>
  <div class="project-grid">
    <div
      class="project-card"
      :class="{ 'dropdown-open': project.showDropdown }"
      v-for="project in localProjects"
      :key="project.projectId"
      @click="project.showDropdown ? null : navigateToProject(project.projectId)"
    >

    <h2 class="project-header">
  <span class="project-name">{{ project.name }}</span>
  <div class="project-status-wrapper">
    <span
      class="project-status"
      :class="'status-' + getProjectStatus(project).toLowerCase().replaceAll(' ', '_')"
    >
      {{ getProjectStatus(project) }}
    </span>
  </div>
</h2>

      <p>{{ project.startDate }} ~ {{project.endDate}} ・ 버전 이력 {{ project.revisionCount }}개</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from '/src/stores/projectStore.js';

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
});

const localProjects = ref([]);

watch(
  () => props.projects,
  (newProjects) => {
    localProjects.value = newProjects.map((p) => ({
      ...p,
    }));
  },
  { immediate: true, deep: true }
);

const router = useRouter();
const projectStore = useProjectStore();

const navigateToProject = (projectId) => {
  const selectedProject = localProjects.value.find(p => p.projectId === projectId);

  console.log(selectedProject)

  const now = new Date();
  const start = new Date(selectedProject.startDate);
  const end = new Date(selectedProject.endDate);

  if (start > now || end < now) {
    selectedProject.status = "INACTIVE";
  } else {
    selectedProject.status = "ACTIVE";
  }

  if (selectedProject) {
    projectStore.setProject(selectedProject.projectId, selectedProject.name, selectedProject.revisionCount, selectedProject.status, selectedProject.isAdmin);
    router.push({
      name: "ProjectMain",
      params: { projectId: selectedProject.projectId },
    });
  }
};

function getProjectStatus(project) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // 시간 초기화

  const startDate = new Date(project.startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(project.endDate);
  endDate.setHours(23, 59, 59, 999);  // 오늘 끝까지 포함

  if (today < startDate) return "not_started";
  if (today <= endDate) return "in_progress";
  return "done";
}

</script>

<style scoped>
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: 20px 0;
}

.project-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 상단 그라데이션 바 */
.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4a5568 0%, #2d3748 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

/* 강화된 카드 호버 효과 - 단순화 */
.project-card:hover {
  border-color: #4a5568;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(4px);
  background-color: #fafbfc;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25em;
  margin: 0 0 16px 0;
  font-weight: 600;
  color: #1a202c;
}

.project-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  flex: 1;
  margin-right: 12px;
  transition: color 0.2s ease;
}

.project-status-wrapper {
  position: relative;
  display: inline-block;
}

.project-status {
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
  margin-left: 10px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
  overflow: visible;
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
  overflow: visible;
}

.status-dropdown .project-status {
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
  overflow: visible;
  transform: none;
}

/* 카드 하단 정보 스타일 */
.project-card p {
  color: #718096;
  font-size: 0.9em;
  margin: 0;
  font-weight: 500;
  transition: color 0.2s ease;
}

/* 상태별 스타일 개선 */
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

/* 반응형 */
@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 0;
  }
  
  .project-card {
    padding: 20px;
    height: 140px;
  }
  
  .project-header {
    font-size: 1.1em;
    margin-bottom: 12px;
  }
  
  .project-status {
    min-width: 70px;
    height: 24px;
    font-size: 0.65em;
  }
}

@media (max-width: 480px) {
  .project-card {
    padding: 16px;
    height: 130px;
  }
  
  .project-header {
    font-size: 1em;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .project-name {
    margin-right: 0;
  }
  
  .project-status {
    margin-left: 0;
  }
}
</style>