import { defineStore } from 'pinia';

export const useProjectStore = defineStore('projectStore', {
    state: () => ({
        projectId: null,
        projectName: null,
        status: null,
        userId: null,
        isAdmin: null
    }),
    actions: {
        setProject(projectId, projectName, status, isAdmin) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.status = status;
            this.isAdmin = isAdmin;
        },
        setUser(userId) {
            this.userId = userId;
        },
        resetProject() {
            this.projectId = null;
            this.projectName = null;
            this.status = null;
            this.isAdmin = null;
        },
        resetAll() {
            this.userId = null;
            this.projectId = null;
            this.projectName = null;
            this.status = null;
            this.isAdmin = null;
        },
    },
    persist: true,
});