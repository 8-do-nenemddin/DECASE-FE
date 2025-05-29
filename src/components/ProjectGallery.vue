<template>
  <div class="project-grid">
    <div
      class="project-card"
      v-for="project in localProjects"
      :key="project.id"
      @click="project.showDropdown ? null : navigateToProject(project.name)"
    >
      <h2 class="project-header">
        <span class="project-name">{{ project.name }}</span>
        <div
          class="project-status-wrapper"
          @click.stop="toggleDropdown(project)"
        >
          <span
            class="project-status"
            :class="
              'status-' + project.status.toLowerCase().replaceAll(' ', '_')
            "
          >
            {{ project.status }}
          </span>
          <ul v-if="project.showDropdown" class="status-dropdown">
            <li
              v-for="status in statusOptions"
              :key="status"
              class="project-status"
              :class="'status-' + status.toLowerCase().replaceAll(' ', '_')"
              @click.stop="changeStatus(project, status)"
            >
              {{ status }}
            </li>
          </ul>
        </div>
      </h2>
      <p>{{ project.date }} ・ {{ project.versionInfo }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

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
      showDropdown: false,
    }));
  },
  { immediate: true, deep: true }
);

const router = useRouter();

const navigateToProject = (projectName) => {
  router.push({ name: "ProjectHome", params: { projectName } });
};

const statusOptions = ["NOT_STARTED", "IN_PROGRESS", "DONE"];

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
  cursor: pointer;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  margin: 0 0 10px 0;
}

.project-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.project-status-wrapper {
  position: relative;
  display: inline-block;
}

.project-status {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7em;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  height: 24px;
  text-align: center;
  text-transform: capitalize;
  margin-left: 10px;
  background-color: #eee;
}

.status-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
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

.status-dropdown .project-status {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 6px;
  font-size: 0.65em;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  margin: 2px 2px;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  box-sizing: border-box;
  min-width: 90px;
  max-width: 120px;
}

.status-dropdown .project-status:hover {
  filter: brightness(0.95);
}

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
