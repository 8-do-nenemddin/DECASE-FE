<template>
  <div>
    <!-- 사이드 패널 -->
    <div class="sidebar" :class="{ 'open': isOpen }">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <span class="requirement-id">{{ reqIdCode }}</span>
          <div>{{ latestRequirement?.name }}</div>
        </div>
        <button class="close-button" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="sidebar-content" v-if="historyData.length > 0">
        <!-- 요약 정보 카드 -->
        <div class="summary-card">
          <div class="summary-header">
            <h3>요구사항 요약</h3>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-content">
                <div class="summary-label">요구사항 설명</div>
                <div class="summary-value">{{ latestRequirement?.description }}</div>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon">👤</div>
              <div class="summary-content">
                <div class="summary-label">최종 수정자</div>
                <div class="summary-value">{{ latestRequirement?.modifiedByName }}</div>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon">📅</div>
              <div class="summary-content">
                <div class="summary-label">최종 수정일</div>
                <div class="summary-value">{{ formatDate(latestRequirement?.revisionDate) }}</div>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon">🔄</div>
              <div class="summary-content">
                <div class="summary-label">총 변경 횟수</div>
                <div class="summary-value">{{ historyData.length }}회</div>
              </div>
            </div>
          </div>
        </div>

        <div class="history-section">
          <h4 class="section-title">변경 이력</h4>
          <div class="history-timeline">
            <div 
              v-for="(history, index) in sortedHistoryData" 
              :key="history.revisionNumber"
              class="history-item"
            >
              <div class="history-dot"></div>
              <div class="history-content">
                <div class="history-header">
                  <span class="history-action">
                    <span class="change-badge" :class="getChangeTypeClass(history.changeType)">
                      {{ getChangeTypeText(history.changeType) }}
                    </span>
                    <span class="revision-number">Version. {{ history.version }}</span>
                  </span>
                  <span class="history-date">{{ formatDate(history.revisionDate) }}</span>
                </div>
                <div class="history-details">
                  <div class="history-user">수정자: {{ history.modifiedByName }}</div>
                  <div class="history-description" v-if="history.modReason">
                    <strong>수정 사유:</strong> {{ history.modReason }}
                  </div>
                </div>
                <div v-if="history.type || history.level1 || history.level2 || history.level3">
                  <span class="info-value">[{{ history.type === "NFR" ? "비기능" : "기능" }}] > {{ history.level1 }} > {{ history.level2 }} > {{ history.level3 }}</span>
                </div>
                <!-- 통합된 정보 섹션 -->
                <div class="info-section">
                  <!-- 요구사항 설명 -->
                  <div class="info-description" v-if="history.description">
                    <div class="info-description-content" v-html="formatDescription(history.description)"></div>
                  </div>
                  
                  <!-- 기본 정보 그리드 -->
                  <div class="info-grid">
                    <!-- 우선순위와 난이도를 한 줄에 표시 -->
                    <div class="info-row" v-if="history.priority || history.difficulty">
                      <div class="info-item half-width" v-if="history.priority">
                        <span class="info-label">우선순위:</span>
                        <span class="info-value" :data-priority="history.priority === 'HIGH' ? '상' : history.priority === 'MIDDLE' ? '중' : '하'">
                          {{ history.priority === "HIGH" ? "상" : history.priority === "MIDDLE" ? "중" : "하" }}
                        </span>
                      </div>
                      <div class="info-item half-width" v-if="history.difficulty">
                        <span class="info-label">난이도:</span>
                        <span class="info-value" :data-difficulty="history.difficulty === 'HIGH' ? '상' : history.difficulty === 'MIDDLE' ? '중' : '하'">
                          {{ history.difficulty === "HIGH" ? "상" : history.difficulty === "MIDDLE" ? "중" : "하" }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="sidebar-content">
        <div class="loading-message">
          변경 이력을 불러오는 중...
        </div>
      </div>
    </div>

    <!-- 오버레이 -->
    <div v-if="isOpen" class="overlay" @click="$emit('close')"></div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectStore } from '../../../../stores/projectStore'

export default {
  name: 'ViewMatrixSideBar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    reqIdCode: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  setup(props) {
    const historyData = ref([])
    const projectStore = useProjectStore()
    const projectId = computed(() => projectStore.projectId)


    const latestRequirement = computed(() => {
      // 가장 최근 revisionDate를 가진 항목을 찾음
      if (historyData.value.length === 0) return null
      return historyData.value.reduce((latest, current) => 
        new Date(current.revisionDate) > new Date(latest.revisionDate) ? current : latest
      )
    })
    
    const sortedHistoryData = computed(() => {
      return [...historyData.value].sort((a, b) => a.revisionNumber - b.revisionNumber)
    })

    const loadHistoryData = async (reqIdCode) => {
      if (!reqIdCode) return
      
      try {
        const response = await fetch(`/api/v1/matrix/projects/${projectId.value}/srs/${reqIdCode}`)
        const result = await response.json()

        if (result.status === 200) {
          historyData.value = result.data || []
        } else {
          console.error('Failed to load history data:', result.message)
          historyData.value = []
        }
      } catch (error) {
        console.error('Failed to load history data:', error)
        historyData.value = []
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getChangeTypeText = (type) => {
      const typeMap = {
        'ADD': '추가',
        'MOD': '수정',
        'DEL': '삭제'
      }
      return typeMap[type] || type
    }

    const getChangeTypeClass = (type) => {
      const classMap = {
        'ADD': 'change-add',
        'MOD': 'change-mod',
        'DEL': 'change-del'
      }
      return classMap[type] || ''
    }

    const formatDescription = (desc) => {
      if (!desc) return ''
      return desc
        .replace(/\[([^\]]+)\]/g, '<strong>[$1]</strong>')
        .replace(/\n/g, '<br>')
    }

    const hasNameChange = (current, previous) => {
      return current.name !== previous.name
    }

    const hasDescriptionChange = (current, previous) => {
      return current.description !== previous.description
    }

    const hasCategory3Change = (current, previous) => {
      return current.category3 !== previous.category3
    }

    watch(() => props.reqIdCode, (newReqIdCode) => {
      if (newReqIdCode && props.isOpen) {
        loadHistoryData(newReqIdCode)
      }
    })

    watch(() => props.isOpen, (isOpen) => {
      if (isOpen && props.reqIdCode) {
        loadHistoryData(props.reqIdCode)
      }
    })

    onMounted(() => {
      if (props.isOpen && props.reqIdCode) {
        loadHistoryData(props.reqIdCode)
      }
    })

    return {
      historyData,
      latestRequirement,
      sortedHistoryData,
      formatDate,
      getChangeTypeText,
      getChangeTypeClass,
      formatDescription,
      hasNameChange,
      hasDescriptionChange,
      hasCategory3Change
    }
  }
}
</script>

<style scoped>
/* 모던 흑백 요약 카드 스타일 */
.summary-card {
  background: #575555;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 
              0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.summary-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.current-version {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-grid {
  display: grid;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.summary-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.summary-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-weight: 500;
  font-size: 0.95rem;
}

/* 모던 흑백 변경 타입 배지 스타일 */
.change-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 8px;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.change-badge.change-add {
  background: #47ff50;
  color: black;
}

.change-badge.change-mod {
  background: #fff67d;
  color: #000000;
  border: 1px solid #e0e0e0;
}

.change-badge.change-del {
  background: rgb(255, 0, 0);
  color: black;
  border: 1px solid #e0e0e0;
}

.revision-number {
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 8px;
}

/* 모던 흑백 사이드 패널 */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 40%;
  height: 100vh;
  background: linear-gradient(145deg, #fafafa 0%, #ffffff 100%);
  border-left: 1px solid #e0e0e0;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow-y: auto;
  box-shadow: -20px 0 40px rgba(0, 0, 0, 0.1);
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 2rem;
  background: linear-gradient(145deg, #000000 0%, #1a1a1a 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  letter-spacing: -0.025em;
}

.requirement-id {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  font-weight: 500;
  letter-spacing: 0.05em;
  width: fit-content;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.sidebar-content {
  padding: 2rem;
  background: #ffffff;
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #000000;
  font-size: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  font-size: 0.875rem;
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
  width: 2px;
  background: linear-gradient(to bottom, #000000, #666666);
  border-radius: 1px;
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #000000;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #000000, 0 2px 8px rgba(0, 0, 0, 0.15);
}

.history-content {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.history-content:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.history-action {
  font-weight: 600;
  color: #000000;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.history-date {
  font-size: 0.75rem;
  color: #666666;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  background: #f5f5f5;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.history-details {
  margin-bottom: 1rem;
}

.history-user {
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.history-description {
  color: #666666;
  font-size: 0.875rem;
  line-height: 1.4;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #666666;
  font-size: 1rem;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
  transition: opacity 0.4s ease;
  z-index: 900;
  backdrop-filter: blur(4px);
}

/* 모던 정보 섹션 스타일 */
.info-section {
  margin-top: 1.25rem;
  padding: 1.5rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

/* 요구사항 설명 섹션 */
.info-description {
  margin-bottom: 1.5rem;
}

.info-description-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-description-content {
  line-height: 1.6;
  color: #343a40;
  background: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 0.875rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 60px;
}

.info-description-content:empty::before {
  content: '설명이 없습니다.';
  color: #adb5bd;
  font-style: italic;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* 우선순위와 난이도를 한 줄에 표시하는 컨테이너 */
.info-row {
  display: flex;
  gap: 0.75rem;
}

.info-item.half-width {
  flex: 1;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 0.875rem 1.125rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.info-item:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.info-label {
  font-size: 0.875rem;
  color: #495057;
  font-weight: 500;
  margin-right: 1rem;
  flex-shrink: 0;
}

.info-value {
  font-size: 0.875rem;
  color: #212529;
  font-weight: 600;
  text-align: right;
  background: #f8f9fa;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

/* 우선순위별 색상 구분 */
.info-item:has([data-priority]) .info-value {
  background: #ffebee;
  color: #c62828;
  border-color: #ffcdd2;
}

.info-item:has([data-priority="중"]) .info-value {
  background: #fff3e0;
  color: #f57c00;
  border-color: #ffcc02;
}

.info-item:has([data-priority="하"]) .info-value {
  background: #e8f5e8;
  color: #2e7d32;
  border-color: #c8e6c9;
}

/* 난이도별 색상 구분 */
.info-item:has([data-difficulty]) .info-value {
  background: #ffebee;
  color: #c62828;
  border-color: #ffcdd2;
}

.info-item:has([data-difficulty="중"]) .info-value {
  background: #fff8e1;
  color: #f57c00;
  border-color: #ffecb3;
}

.info-item:has([data-difficulty="하"]) .info-value {
  background: #e8f5e8;
  color: #2e7d32;
  border-color: #c8e6c9;
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

  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    text-align: center;
  }

  .info-section {
    padding: 1rem;
  }
  
  .info-item {
    padding: 0.75rem 1rem;
  }
  
  .info-label {
    font-size: 0.8rem;
    margin-right: 0.75rem;
  }
  
  .info-value {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-item.half-width {
    flex: none;
  }
}
</style>