<template>
  <div class="project-main">
    <h1 class="title">요구사항 추적 매트릭스</h1>
    <div class="table-wrapper">
      <table class="requirements-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>요구사항 설명</th>
            <th>우선순위</th>
            <th>상태</th>
            <th>담당자</th>
            <th>마감일</th>
            <th>관련 기능</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="requirement in requirements" :key="requirement.id">
            <td>{{ requirement.id }}</td>
            <td>{{ requirement.description }}</td>
            <td>
              <span
                :class="['priority', requirement.priority.toLowerCase()]"
              >
                {{ requirement.priority }}
              </span>
            </td>
            <td>{{ requirement.status }}</td>
            <td>{{ requirement.assignee }}</td>
            <td>{{ requirement.dueDate }}</td>
            <td>{{ requirement.relatedFeature }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const requirements = ref([
  {
    id: "REQ-001",
    description: "사용자는 로그인할 수 있어야 한다.",
    priority: "높음",
    status: "완료",
    assignee: "김철수",
    dueDate: "2025-06-15",
    relatedFeature: "로그인 시스템",
  },
  {
    id: "REQ-002",
    description: "사용자는 비밀번호를 재설정할 수 있어야 한다.",
    priority: "중간",
    status: "진행 중",
    assignee: "이영희",
    dueDate: "2025-06-20",
    relatedFeature: "비밀번호 관리",
  },
  {
    id: "REQ-003",
    description: "사용자는 프로필을 업데이트할 수 있어야 한다.",
    priority: "낮음",
    status: "대기 중",
    assignee: "박민수",
    dueDate: "2025-06-30",
    relatedFeature: "프로필 관리",
  },
]);
</script>

<style scoped>
.project-main {
  padding: 2rem;
  font-family: 'Segoe UI', sans-serif;
  background-color: #fafafa;
  min-height: 100vh;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #ccc;
  padding-bottom: 0.5rem;
}

.table-wrapper {
  overflow-x: auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.requirements-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  min-width: 800px;
}

.requirements-table th,
.requirements-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}

.requirements-table thead th {
  background-color: #f0f0f0;
  font-weight: 600;
}

.requirements-table tbody tr:hover {
  background-color: #f9f9f9;
}

.priority {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.priority.높음 {
  background-color: #e74c3c;
}

.priority.중간 {
  background-color: #f39c12;
}

.priority.낮음 {
  background-color: #2ecc71;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .project-main {
    padding: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .requirements-table th,
  .requirements-table td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}
</style>
