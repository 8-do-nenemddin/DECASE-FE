<template>
  <div class="app-container">
    <!-- 메인 콘텐츠 -->
    <div class="main-content" :class="{ 'with-sidebar': showSidebar }">
      <div class="table-container">
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
                <th>수정자</th>
                <th>최종 수정일</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="requirement in requirements" 
                :key="requirement.id"
                @click="openSidebar(requirement)"
                :class="{ 'selected': selectedRequirement?.id === requirement.id }"
                class="clickable-row"
              >
                <td class="id-cell">{{ requirement.id }}</td>
                <td class="description-cell">{{ requirement.description }}</td>
                <td>
                  <span :class="getPriorityClass(requirement.priority)">
                    {{ requirement.priority }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(requirement.status)">
                    {{ requirement.status }}
                  </span>
                </td>
                <td>{{ requirement.assignee }}</td>
                <td>{{ requirement.dueDate }}</td>
                <td>{{ requirement.relatedFeature }}</td>
                <td>{{ requirement.modifier }}</td>
                <td>{{ requirement.lastModified }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 사이드바 컴포넌트 -->
    <Transition name="slide-right">
      <ViewMatrixSideBar
        v-if="showSidebar"
        :isOpen="showSidebar"
        :selectedRequirement="selectedRequirement"
        :requirementHistories="requirementHistories"
        @close="closeSidebar"
      />
    </Transition>
  </div>
</template>

<script>
import { ref } from 'vue'
import ViewMatrixSideBar from './ViewMatrixSideBar.vue'

export default {
  name: 'ViewMatrix',
  components: {
    ViewMatrixSideBar
  },
  setup() {
    const showSidebar = ref(false)
    const selectedRequirement = ref(null)

    const requirements = ref([
      {
        id: "REQ-001",
        description: "사용자는 로그인할 수 있어야 한다.",
        priority: "높음",
        status: "완료",
        assignee: "김철수",
        dueDate: "2025-06-15",
        relatedFeature: "로그인 시스템",
        modifier: "이영희",
        lastModified: "2025-06-10"
      },
      {
        id: "REQ-002",
        description: "사용자는 비밀번호를 재설정할 수 있어야 한다.",
        priority: "중간",
        status: "진행 중",
        assignee: "이영희",
        dueDate: "2025-06-20",
        relatedFeature: "비밀번호 관리",
        modifier: "박민수",
        lastModified: "2025-06-08"
      },
      {
        id: "REQ-003",
        description: "사용자는 프로필을 업데이트할 수 있어야 한다.",
        priority: "낮음",
        status: "대기 중",
        assignee: "박민수",
        dueDate: "2025-06-30",
        relatedFeature: "프로필 관리",
        modifier: "김철수",
        lastModified: "2025-06-05"
      },
      {
        id: "REQ-004",
        description: "시스템은 실시간 알림을 제공해야 한다.",
        priority: "높음",
        status: "진행 중",
        assignee: "정민지",
        dueDate: "2025-06-25",
        relatedFeature: "알림 시스템",
        modifier: "정민지",
        lastModified: "2025-06-09"
      },
      {
        id: "REQ-005",
        description: "사용자는 데이터를 Excel/CSV 형태로 내보낼 수 있어야 한다.",
        priority: "중간",
        status: "대기 중",
        assignee: "홍길동",
        dueDate: "2025-07-05",
        relatedFeature: "데이터 관리",
        modifier: "홍길동",
        lastModified: "2025-06-07"
      }
    ])

    const requirementHistories = ref({
      "REQ-001": [
        {
          action: "상태 변경",
          date: "2025-06-10 14:30",
          user: "이영희",
          description: "테스트 완료 후 상태 변경",
          changes: [
            { field: "상태", old: "진행 중", new: "완료" }
          ]
        },
        {
          action: "담당자 변경",
          date: "2025-06-08 09:15",
          user: "프로젝트 매니저",
          description: "업무 재분배로 인한 담당자 변경",
          changes: [
            { field: "담당자", old: "박민수", new: "김철수" }
          ]
        },
        {
          action: "요구사항 생성",
          date: "2025-06-01 10:00",
          user: "김철수",
          description: "초기 요구사항 등록"
        }
      ],
      "REQ-002": [
        {
          action: "우선순위 변경",
          date: "2025-06-08 16:20",
          user: "박민수",
          description: "비즈니스 우선순위 조정",
          changes: [
            { field: "우선순위", old: "낮음", new: "중간" }
          ]
        },
        {
          action: "상태 변경",
          date: "2025-06-07 11:45",
          user: "이영희",
          description: "개발 시작",
          changes: [
            { field: "상태", old: "대기 중", new: "진행 중" }
          ]
        },
        {
          action: "요구사항 생성",
          date: "2025-06-02 14:30",
          user: "이영희",
          description: "보안 강화를 위한 요구사항 추가"
        }
      ],
      "REQ-003": [
        {
          action: "마감일 연장",
          date: "2025-06-05 13:10",
          user: "김철수",
          description: "다른 프로젝트 우선순위로 인한 일정 조정",
          changes: [
            { field: "마감일", old: "2025-06-25", new: "2025-06-30" }
          ]
        },
        {
          action: "요구사항 생성",
          date: "2025-06-03 09:00",
          user: "박민수",
          description: "사용자 경험 개선을 위한 요구사항"
        }
      ],
      "REQ-004": [
        {
          action: "상태 변경",
          date: "2025-06-09 10:30",
          user: "정민지",
          description: "개발 시작",
          changes: [
            { field: "상태", old: "대기 중", new: "진행 중" }
          ]
        },
        {
          action: "요구사항 생성",
          date: "2025-06-04 16:00",
          user: "정민지",
          description: "실시간 커뮤니케이션 기능 추가"
        }
      ],
      "REQ-005": [
        {
          action: "요구사항 수정",
          date: "2025-06-07 14:20",
          user: "홍길동",
          description: "내보내기 형식 구체화",
          changes: [
            { field: "설명", old: "사용자는 데이터를 내보낼 수 있어야 한다.", new: "사용자는 데이터를 Excel/CSV 형태로 내보낼 수 있어야 한다." }
          ]
        },
        {
          action: "요구사항 생성",
          date: "2025-06-06 11:00",
          user: "홍길동",
          description: "데이터 관리 기능 강화"
        }
      ]
    })

    const openSidebar = (requirement) => {
      selectedRequirement.value = requirement
      showSidebar.value = true
    }

    const closeSidebar = () => {
      showSidebar.value = false
      setTimeout(() => {
        selectedRequirement.value = null
      }, 300)
    }

    const getPriorityClass = (priority) => {
      const classMap = {
        '높음': 'tag priority-high',
        '중간': 'tag priority-medium',
        '낮음': 'tag priority-low'
      }
      return classMap[priority] || 'tag'
    }

    const getStatusClass = (status) => {
      const classMap = {
        '완료': 'tag status-complete',
        '진행 중': 'tag status-in-progress',
        '대기 중': 'tag status-pending'
      }
      return classMap[status] || 'tag'
    }

    return {
      showSidebar,
      selectedRequirement,
      requirements,
      requirementHistories,
      openSidebar,
      closeSidebar,
      getPriorityClass,
      getStatusClass
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  width: 80%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: transparent;
  color: #2d3748;
}

/* 메인 콘텐츠 */
.main-content {
  flex: 1;
  width: 90%;
  min-width: 90%;
  padding: 0;
  background: transparent;
  overflow-y: auto;
  transition: margin-right 0.3s ease;
  max-width: 90%;
}

.main-content.with-sidebar {
  margin-right: 40%;
}

/* 테이블 컨테이너 */
.table-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.requirements-table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  background: white;
}

.requirements-table th {
  color: black;
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.requirements-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  vertical-align: middle;
  white-space: nowrap;
}

.id-cell {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #4f46e5;
  min-width: 100px;
}

.description-cell {
  white-space: normal;
  max-width: 350px;
  line-height: 1.4;
  font-weight: 500;
}

.clickable-row {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.clickable-row:hover {
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.clickable-row.selected {
  background: linear-gradient(135deg, #ebf4ff 0%, #dbeafe 100%);
  border-left: 4px solid #4f46e5;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
}

/* 태그 스타일 */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.priority-high {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid #f87171;
}

.priority-medium {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
  border: 1px solid #f59e0b;
}

.priority-low {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  border: 1px solid #10b981;
}

.status-complete {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  border: 1px solid #10b981;
}

.status-in-progress {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  border: 1px solid #3b82f6;
}

.status-pending {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1px solid #64748b;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}

/* 사이드바 스타일 - 컴포넌트 내부에서 정의 */
:deep(.sidebar) {
  position: fixed;
  top: 0;
  right: 0;
  width: 40%;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
}

:deep(.sidebar.open) {
  transform: translateX(0);
}

:deep(.sidebar-header) {
  padding: 2rem;
  background: linear-gradient(135deg, black 0%, gray 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.sidebar-title) {
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

:deep(.requirement-id) {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.close-button) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.close-button:hover) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

:deep(.sidebar-content) {
  padding: 2rem;
}

:deep(.requirement-info) {
  margin-bottom: 2.5rem;
}

:deep(.requirement-title) {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
  line-height: 1.5;
  font-weight: 600;
}

:deep(.info-grid) {
  display: grid;
  gap: 1rem;
}

:deep(.info-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

:deep(.label) {
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
}

:deep(.value) {
  font-weight: 500;
  color: #1e293b;
}

:deep(.section-title) {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.125rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 700;
}

:deep(.history-timeline) {
  position: relative;
  padding-left: 2rem;
}

:deep(.history-timeline::before) {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  border-radius: 2px;
}

:deep(.history-item) {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 2rem;
}

:deep(.history-dot) {
  position: absolute;
  left: -1.25rem;
  top: 0.5rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: 4px solid white;
  box-shadow: 0 0 0 2px #667eea, 0 2px 8px rgba(102, 126, 234, 0.3);
}

:deep(.history-content) {
  background: rgba(255, 255, 255, 0.8);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(5px);
}

:deep(.history-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

:deep(.history-action) {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

:deep(.history-date) {
  font-size: 0.75rem;
  color: #64748b;
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

:deep(.history-details) {
  margin-bottom: 1rem;
}

:deep(.history-user) {
  font-weight: 600;
  color: #4338ca;
  margin-bottom: 0.25rem;
}

:deep(.history-description) {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.4;
}

:deep(.history-changes) {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

:deep(.change-item) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  flex-wrap: wrap;
}

:deep(.change-field) {
  font-weight: 600;
  color: #475569;
  min-width: 60px;
}

:deep(.change-old) {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid #f87171;
}

:deep(.change-arrow) {
  color: #64748b;
  font-weight: bold;
  font-size: 1rem;
}

:deep(.change-new) {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid #10b981;
}

:deep(.overlay) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 900;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .main-content.with-sidebar {
    margin-right: 0;
  }
  
  :deep(.sidebar) {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0;
  }

  .table-container {
    margin: 0;
  }

  .requirements-table th,
  .requirements-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }

  .description-cell {
    max-width: 200px;
  }

  :deep(.sidebar) {
    width: 100%;
  }

  :deep(.sidebar-content) {
    padding: 1.5rem;
  }

  :deep(.info-item) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  :deep(.change-item) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>