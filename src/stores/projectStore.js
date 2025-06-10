import { defineStore } from "pinia";
import axios from "axios";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projectId: null,
    projectName: null,
    // 추후 수정
    // Project 상태 저장 (요구사항 입력 전 / 요구사항 생성중 / 요구사항 생성완료)
    projectRevision: 0,
    status: null,
    userId: null,
    isAdmin: null,
  }),
  actions: {
    setProject(projectId, projectName, projectRevision, status, isAdmin) {
      this.projectId = projectId;
      this.projectName = projectName;
      this.projectRevision = projectRevision;
      this.status = status;
      this.isAdmin = isAdmin;
    },
    setUser(userId) {
      this.userId = userId;
    },
    resetProject() {
      this.projectId = null;
      this.projectName = null;
      this.projectRevision = null;
      this.status = null;
      this.isAdmin = null;
    },
    resetAll() {
      this.userId = null;
      this.projectId = null;
      this.projectName = null;
      this.projectRevision = null;
      this.status = null;
      this.isAdmin = null;
    },
  },
  persist: true,
});
