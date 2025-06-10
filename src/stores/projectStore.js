import { defineStore } from "pinia";
import axios from "axios";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projectId: null,
    projectName: null,
    // 추후 수정
    // Project 상태 저장 (요구사항 입력 전 / 요구사항 생성중 / 요구사항 생성완료)
    projectRevision: 0,
    revisionCount: 0, // 추가된 리비전 카운트
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
    setRevisionCount(count) {
      // 리비전 카운트 설정을 위한 새로운 액션
      this.revisionCount = count;
    },
    setUser(userId) {
      this.userId = userId;
    },
    resetProject() {
      this.projectId = null;
      this.projectName = null;
      this.projectRevision = null;
      this.revisionCount = 0; // 리비전 카운트도 리셋
      this.status = null;
      this.isAdmin = null;
    },
    resetAll() {
      this.userId = null;
      this.projectId = null;
      this.projectName = null;
      this.projectRevision = null;
      this.revisionCount = 0; // 리비전 카운트도 리셋
      this.status = null;
      this.isAdmin = null;
    },
  },
  persist: true,
});
