import { defineStore } from 'pinia';

export const useProjectStore = defineStore('projectStore', {
    state: () => ({
        projectId: null,
        projectName: null,
        status: null,
        userId: null,
    }),
    actions: {
        setProject(projectId, projectName, status) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.status = status
        },
        setUser(userId) {
            this.userId = userId;
        },
        resetProject() {
            this.projectId = null;
            this.projectName = null;
            this.status = null;
        },
        resetAll() {
            this.userId = null;
            this.projectId = null;
            this.projectName = null;
            this.status = null;
        },
    },
    persist: true,
});