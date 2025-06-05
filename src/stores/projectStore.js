import { defineStore } from 'pinia';

export const useProjectStore = defineStore('projectStore', {
    state: () => ({
        projectId: null,
        projectName: null,
    }),
    actions: {
        setProject(projectId, projectName) {
            this.projectId = projectId;
            this.projectName = projectName;
        },
    },
    persist: true,
});