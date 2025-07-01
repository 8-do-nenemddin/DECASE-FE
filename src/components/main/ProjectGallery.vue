<template>
  <div class="project-grid">
    <div
        class="project-card"
        :class="{ 'dropdown-open': project.showDropdown }"
        v-for="project in localProjects"
        :key="project.projectId"
        @click="
        project.showDropdown ? null : navigateToProject(project.projectId)
      "
    >
      <div class="project-status-wrapper">
        <span
            class="project-status"
            :class="
            'status-' +
            getProjectStatus(project).toLowerCase().replaceAll(' ', '_')
          "
        >
          {{ getProjectStatus(project) }}
        </span>
      </div>

      <div class="project-content">
        <h3 class="project-header">
          <span class="project-name">{{ project.name }}</span>
        </h3>
        <p>
          {{ project.startDate }} ~ {{ project.endDate }} ・ 버전 이력
          {{ project.revisionCount }}개
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 스크립트 코드는 변경할 필요가 없으므로 그대로 유지합니다.
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "/src/stores/projectStore.js";

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

const navigateToProject = async (projectId) => {
  const selectedProject = localProjects.value.find(
      (p) => p.projectId === projectId
  );

  console.log(selectedProject);

  const now = new Date();
  const start = new Date(selectedProject.startDate);
  const end = new Date(selectedProject.endDate);

  if (start > now || end < now) {
    selectedProject.status = "INACTIVE";
  } else {
    selectedProject.status = "ACTIVE";
  }

  if (selectedProject) {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/revision`);
      const revisions = await response.json();
      const revisionCount = revisions.length || 0;

      try {
        const authResponse = await fetch(`/api/v1/projects/${projectId}/authority/${projectStore.userId}`);
        const { permission } = await authResponse.json();
        projectStore.setPermission(permission);
      } catch (authError) {
        console.error("Failed to fetch authority info:", authError);
      }

      projectStore.setProject(
          selectedProject.projectId,
          selectedProject.name,
          revisionCount,
          selectedProject.status,
          selectedProject.isAdmin
      );
      router.push({
        name: "ProjectMain",
        params: { projectId: selectedProject.projectId },
      });
    } catch (error) {
      console.error("Failed to fetch revision count:", error);

      try {
        const authResponse = await fetch(`/api/v1/projects/${projectId}/authority`);
        const authority = await authResponse.json();
        console.log("User authority:", authority);
        // You can handle the authority info as needed
      } catch (authError) {
        console.error("Failed to fetch authority info:", authError);
      }

      // If API call fails, use the existing revision count
      projectStore.setProject(
          selectedProject.projectId,
          selectedProject.name,
          selectedProject.revisionCount,
          selectedProject.status,
          selectedProject.isAdmin
      );
      router.push({
        name: "ProjectMain",
        params: { projectId: selectedProject.projectId },
      });
    }
  }
};

function getProjectStatus(project) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 초기화

  const startDate = new Date(project.startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(project.endDate);
  endDate.setHours(23, 59, 59, 999); // 오늘 끝까지 포함

  if (today < startDate) return "not_started";
  if (today <= endDate) return "in_progress";
  return "done";
}
</script>

<style scoped>
/* ========== 주요 수정 사항 ========== */
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
  /* 고정 높이 제거 -> 내용에 따라 유연하게 조절 */
  /* height: 200px; */
  min-height: 180px; /* 카드의 최소 높이만 지정 */
  display: flex;
  flex-direction: column;
  /* space-between 제거 -> 위에서부터 쌓이도록 */
  /* justify-content: space-between; */
  gap: 16px; /* 컨텐츠 사이의 간격 추가 */
  background-color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 프로젝트명 스타일 수정 */
.project-name {
  /* 1줄 말줄임표 스타일 제거 */
  /* white-space: nowrap; */

  /* 2줄 말줄임표 스타일 적용 (필수!) */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word; /* 긴 단어 강제 줄바꿈 */
  line-height: 1.4; /* 줄 간격 조절 */
  /* 이름이 짧을 때도 2줄 높이를 유지하여 레이아웃 깨짐 방지 */
  min-height: calc(1.4em * 2);
}

/* 헤더 스타일 수정 - 더 이상 flex 컨테이너가 아님 */
.project-header {
  /* display: flex; justify-content: space-between; align-items: center; 제거 */
  font-size: 1em;
  margin: 0; /* 마진 초기화 */
  font-weight: 600;
  color: #1a202c;
}

/* 상태(Status) 마진 수정 */
.project-status {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.7em;
  font-weight: 600;
  /* margin-left 제거 */
  /* margin-left: 10px; */
  /* 기타 스타일 유지 */
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
  overflow: visible;
}

/* ========== 기존 스타일 유지 ========== */
.project-card:hover {
  border-color: #4a5568;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(4px);
  background-color: #fafbfc;
}
.project-card p {
  color: #718096;
  font-size: 0.9em;
  margin: 0;
  font-weight: 500;
  transition: color 0.2s ease;
  /* 카드 하단에 붙도록 설정 */
  margin-top: auto;
}
.project-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

/* 상태별 스타일 */
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

/* 반응형 스타일은 대부분 유지, 일부만 조정 */
@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 0;
  }
  .project-card {
    padding: 20px;
    min-height: 160px;
    gap: 12px;
  }
  .project-header {
    font-size: 1.1em;
  }
}

@media (max-width: 480px) {
  .project-card {
    padding: 16px;
    min-height: 150px;
    gap: 8px;
  }
  .project-header {
    font-size: 1em;
  }
}
</style>