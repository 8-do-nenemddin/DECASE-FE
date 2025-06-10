<template>
    <div>
      <!-- 사이드 패널 -->
      <div class="sidebar" :class="{ 'open': isOpen }">
        <div class="sidebar-header">
          <div class="sidebar-title">
            <span class="requirement-id">{{ selectedRequirement?.id }}</span>
            변경 이력 및 상세 정보
          </div>
          <button class="close-button" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="sidebar-content" v-if="selectedRequirement">
          <div class="requirement-info">
            <h3 class="requirement-title">{{ selectedRequirement.description }}</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="label">현재 상태</span>
                <span :class="getStatusClass(selectedRequirement.status)">
                  {{ selectedRequirement.status }}
                </span>
              </div>
              
              <div class="info-item">
                <span class="label">우선순위</span>
                <span :class="getPriorityClass(selectedRequirement.priority)">
                  {{ selectedRequirement.priority }}
                </span>
              </div>
              
              <div class="info-item">
                <span class="label">담당자</span>
                <span class="value">{{ selectedRequirement.assignee }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">마감일</span>
                <span class="value">{{ selectedRequirement.dueDate }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">관련 기능</span>
                <span class="value">{{ selectedRequirement.relatedFeature }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">최종 수정자</span>
                <span class="value">{{ selectedRequirement.modifier }}</span>
              </div>
            </div>
          </div>
  
          <div class="history-section">
            <h4 class="section-title">변경 이력</h4>
            <div class="history-timeline">
              <div 
                v-for="(history, index) in getRequirementHistory(selectedRequirement.id)" 
                :key="index"
                class="history-item"
              >
                <div class="history-dot"></div>
                <div class="history-content">
                  <div class="history-header">
                    <span class="history-action">{{ history.action }}</span>
                    <span class="history-date">{{ history.date }}</span>
                  </div>
                  <div class="history-details">
                    <div class="history-user">{{ history.user }}</div>
                    <div class="history-description">{{ history.description }}</div>
                  </div>
                  <div v-if="history.changes" class="history-changes">
                    <div v-for="change in history.changes" :key="change.field" class="change-item">
                      <span class="change-field">{{ change.field }}:</span>
                      <span class="change-old">{{ change.old }}</span>
                      <span class="change-arrow">→</span>
                      <span class="change-new">{{ change.new }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 오버레이 -->
      <div v-if="isOpen" class="overlay" @click="$emit('close')"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RequirementsSidebar',
    props: {
      isOpen: {
        type: Boolean,
        default: false
      },
      selectedRequirement: {
        type: Object,
        default: null
      },
      requirementHistories: {
        type: Object,
        default: () => ({})
      }
    },
    emits: ['close'],
    methods: {
      getRequirementHistory(requirementId) {
        return this.requirementHistories[requirementId] || []
      },
      getPriorityClass(priority) {
        const classMap = {
          '높음': 'tag priority-high',
          '중간': 'tag priority-medium',
          '낮음': 'tag priority-low'
        }
        return classMap[priority] || 'tag'
      },
      getStatusClass(status) {
        const classMap = {
          '완료': 'tag status-complete',
          '진행 중': 'tag status-in-progress',
          '대기 중': 'tag status-pending'
        }
        return classMap[status] || 'tag'
      }
    }
  }
  </script>
  
  <style scoped>
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
  
  /* 사이드 패널 */
  .sidebar {
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
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-header {
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
  
  .sidebar-title {
    font-size: 1.25rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .requirement-id {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .close-button {
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
  
  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  .sidebar-content {
    padding: 2rem;
  }
  
  .requirement-info {
    margin-bottom: 2.5rem;
  }
  
  .requirement-title {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
    font-size: 1.25rem;
    line-height: 1.5;
    font-weight: 600;
  }
  
  .info-grid {
    display: grid;
    gap: 1rem;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(248, 250, 252, 0.8);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  
  .label {
    font-weight: 600;
    color: #475569;
    font-size: 0.875rem;
  }
  
  .value {
    font-weight: 500;
    color: #1e293b;
  }
  
  .section-title {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
    font-size: 1.125rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e2e8f0;
    font-weight: 700;
  }
  
  .history-timeline {
    position: relative;
    padding-left: 2rem;
  }
  
  .history-timeline::before {
    content: '';
    position: absolute;
    left: 0.75rem;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #667eea, #764ba2);
    border-radius: 2px;
  }
  
  .history-item {
    position: relative;
    margin-bottom: 2rem;
    padding-left: 2rem;
  }
  
  .history-dot {
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
  
  .history-content {
    background: rgba(255, 255, 255, 0.8);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(5px);
  }
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .history-action {
    font-weight: 700;
    color: #1e293b;
    font-size: 0.95rem;
  }
  
  .history-date {
    font-size: 0.75rem;
    color: #64748b;
    font-family: 'Monaco', 'Menlo', monospace;
    background: #f1f5f9;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }
  
  .history-details {
    margin-bottom: 1rem;
  }
  
  .history-user {
    font-weight: 600;
    color: #4338ca;
    margin-bottom: 0.25rem;
  }
  
  .history-description {
    color: #64748b;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .history-changes {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .change-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    flex-wrap: wrap;
  }
  
  .change-field {
    font-weight: 600;
    color: #475569;
    min-width: 60px;
  }
  
  .change-old {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #dc2626;
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-weight: 500;
    border: 1px solid #f87171;
  }
  
  .change-arrow {
    color: #64748b;
    font-weight: bold;
    font-size: 1rem;
  }
  
  .change-new {
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #059669;
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-weight: 500;
    border: 1px solid #10b981;
  }
  
  .overlay {
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
    .sidebar {
      width: 50%;
    }
  }
  
  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
    }
  
    .sidebar-content {
      padding: 1.5rem;
    }
  
    .info-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  
    .change-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
  </style>