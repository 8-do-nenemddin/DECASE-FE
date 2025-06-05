import { defineStore } from 'pinia';

export const useProjectStore = defineStore('projectStore', {
    state: () => ({
        projectId: null,
        projectName: null,
        userId: null,
    }),
    actions: {
        setProject(projectId, projectName) {
            this.projectId = projectId;
            this.projectName = projectName;
        },
        setUser(userId) {
            this.userId = userId;
        },
        resetProject() {
            this.projectId = null;
            this.projectName = null;
        },
        resetAll() {
            this.userId = null;
            this.projectId = null;
            this.projectName = null;
        },
    },
    persist: true,
});