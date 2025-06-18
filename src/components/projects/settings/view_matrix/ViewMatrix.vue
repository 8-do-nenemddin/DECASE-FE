<template>
  <div class="change-history-container">
    <div class="filters">
      <div class="filters-row">
        <div class="filter-group">
          <select id="changeType" v-model="selectedChangeType" @change="filterHistory">
            <option value="">전체</option>
            <option value="ADD">추가</option>
            <option value="MOD">수정</option>
            <option value="DEL">삭제</option>
          </select>
        </div>
        <div class="filter-group search-group">
          <div class="search-input-wrapper">
            <input 
              id="searchInput"
              type="text" 
              v-model="searchKeyword" 
              @input="filterHistory"
              placeholder="요구사항 이름 또는 코드를 입력하세요"
            />
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        <div class="filter-actions">
          <button class="reset-btn" @click="resetFilters">초기화</button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>변경유형</th>
            <th>요구사항 코드</th>
            <th>요구사항 이름</th>
            <th>버전</th>
            <th>수정자</th>
            <th>수정일시</th>
            <th>변경 이력</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in paginatedHistory" 
            :key="item.reqIdCode + '-' + item.revisionNumber"
            class="history-row"
            :class="getChangeTypeClass(item.changeType)"
            @click="handleRowClick(item)"
          >
            <td>
              <span class="change-badge" :class="getChangeTypeClass(item.changeType)">
                {{ getChangeTypeText(item.changeType) }}
              </span>
            </td>
            <td class="req-code">{{ item.reqIdCode }}</td>
            <td class="req-name">{{ item.name }}</td>
            <td class="revision">Version. {{ item.version }}</td>
            <td class="modifier">{{ item.modifiedByName }}</td>
            <td class="date">{{ formatDate(item.revisionDate) }}</td>
            <td>
              <button 
                class="detail-btn"
                @click.stop="openViewMatrix(item)">
                상세보기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="paginatedHistory.length === 0" class="no-data">
        검색 결과가 없습니다.
      </div>
    </div>
    <Transition name="slide-right">
      <ViewMatrixSideBar
        v-if="showViewMatrix"
        :isOpen="showViewMatrix"
        :reqIdCode="selectedReqIdCode"
        @close="closeViewMatrix"
      />
    </Transition>

    <!-- 상세 정보 모달 -->
    <div v-if="selectedItem" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedItem.name }}</h3>
          <button class="close-btn" @click="closeDetail">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-info">
            <div class="info-row">
              <strong>요구사항 코드:</strong> {{ selectedItem.reqIdCode }}
            </div>
            <div class="info-row">
              <strong>버전:</strong> Version. {{ selectedItem.version }}
            </div>
            <div class="info-row">
              <strong>변경 유형:</strong> 
              <span class="change-badge" :class="getChangeTypeClass(selectedItem.changeType)">
                {{ getChangeTypeText(selectedItem.changeType) }}
              </span>
            </div>
            <div class="info-row">
              <strong>Level1:</strong> {{ selectedItem.level1 }}
            </div>
            <div class="info-row">
              <strong>Level2:</strong> {{ selectedItem.level2 }}
            </div>
            <div class="info-row">
              <strong>Level3:</strong> {{ selectedItem.level3 }} 
            </div>
            <div class="info-row">
              <strong>우선순위:</strong> {{ selectedItem.priority === "HIGH" ? "상" : selectedItem.priority === "MIDDLE" ? "중" : "하"}} 
            </div>
            <div class="info-row">
              <strong>난이도:</strong> {{ selectedItem.difficulty === "HIGH" ? "상" : selectedItem.difficulty === "MIDDLE" ? "중" : "하"}} 
            </div>
            <div class="info-row">
              <strong>수정자:</strong> {{ selectedItem.modifiedByName }}
            </div>
            <div class="info-row">
              <strong>수정일시:</strong> {{ formatDate(selectedItem.revisionDate) }}
            </div>
            <div class="info-row">
              <strong>수정 사유:</strong> {{ item.modReason || '-' }}
            </div>
          </div>
          <div class="description-section" v-if="selectedItem.description">
            <h4>상세 설명</h4>
            <div class="description-content" v-html="formatDescription(selectedItem.description)"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        이전
      </button>
      <span class="page-info">
        {{ currentPage }} / {{ totalPages }}
      </span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ViewMatrixSideBar from './ViewMatrixSideBar.vue'
import { useProjectStore } from '../../../../stores/projectStore'

export default {
  name: 'ChangeHistory',
  components: { ViewMatrixSideBar },
  setup() {
    const historyData = ref([])
    const selectedChangeType = ref('')
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const selectedItem = ref(null)
    const showViewMatrix = ref(false)
    const selectedReqIdCode = ref('')
    const projectStore = useProjectStore()
    const projectId = computed(() => projectStore.projectId)

    const loadHistoryDatas = async () => {
      try {
        const response = await fetch(`/api/v1/matrix/projects/${projectId.value}`)
        const result = await response.json()

        if (result.status === 200) {
          historyData.value = result.data || []
          selectedReqIdCode.value = historyData.reqIdCode;
        } else {
          console.error('Failed to load history data:', result.message)
          historyData.value = []
        }
      } catch (error) {
        console.error('Failed to load history data:', error)
        historyData.value = []
      }
    }

    const filteredHistory = computed(() => {
      let filtered = historyData.value
      if (selectedChangeType.value) {
        filtered = filtered.filter(item => item.changeType === selectedChangeType.value)
      }
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(keyword) ||
          item.reqIdCode.toLowerCase().includes(keyword)
        )
      }
      return filtered.sort((a, b) => new Date(b.revisionDate) - new Date(a.revisionDate))
    })

    const paginatedHistory = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      return filteredHistory.value.slice(start, start + itemsPerPage.value)
    })

    const totalPages = computed(() => Math.ceil(filteredHistory.value.length / itemsPerPage.value))

    const formatDate = (dateString) => new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    })

    const getChangeTypeText = (type) => ({ ADD: '추가', MOD: '수정', DEL: '삭제' }[type] || type)
    const getChangeTypeClass = (type) => ({ ADD: 'change-add', MOD: 'change-mod', DEL: 'change-del' }[type] || '')
    const formatDescription = (desc) => desc?.replace(/\[([^\]]+)\]/g, '<strong>[$1]</strong>').replace(/\n/g, '<br>') || ''

    const handleRowClick = (item) => { selectedItem.value = item }
    const closeDetail = () => { selectedItem.value = null }
    const openViewMatrix = (item) => {
      selectedReqIdCode.value = item.reqIdCode
      showViewMatrix.value = true
      selectedItem.value = null
    }
    const closeViewMatrix = () => {
      showViewMatrix.value = false
      selectedReqIdCode.value = ''
      selectedItem.value = null}
    const filterHistory = () => { currentPage.value = 1 }
    const resetFilters = () => {
      selectedChangeType.value = ''
      searchKeyword.value = ''
      currentPage.value = 1
    }
    const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

    onMounted(() => {
      loadHistoryDatas()
    })

    return {
      selectedChangeType, searchKeyword, currentPage, selectedItem,
      selectedReqIdCode, showViewMatrix, paginatedHistory, totalPages,
      formatDate, getChangeTypeText, getChangeTypeClass, formatDescription,
      handleRowClick, closeDetail, openViewMatrix, closeViewMatrix,
      filterHistory, resetFilters, prevPage, nextPage
    }
  }
}
</script>

<style scoped>
.change-history-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.filters {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
}

.filters-row {
  display: flex;
  align-items: end;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.filter-group.search-group {
  flex: 1;
  min-width: 300px;
}

.filter-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.filter-group select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-input-wrapper {
  position: relative;
}

.search-input-wrapper input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-input-wrapper input::placeholder {
  color: #9ca3af;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #6b7280;
  pointer-events: none;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.reset-btn {
  padding: 12px 20px;
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.reset-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.history-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.history-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.history-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.history-row:hover {
  background-color: #f9fafb;
}

.history-row.change-add {
  border-left: 3px solid #10b981;
}

.history-row.change-mod {
  border-left: 3px solid #f59e0b;
}

.history-row.change-del {
  border-left: 3px solid #ef4444;
}

.change-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.change-badge.change-add {
  background: #10b981;
}

.change-badge.change-mod {
  background: #f59e0b;
}

.change-badge.change-del {
  background: #ef4444;
}

.req-code {
  font-family: 'Courier New', monospace;
  color: #4f46e5;
  font-weight: 600;
}

.req-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.revision {
  font-weight: 600;
  color: #4f46e5;
}

.date {
  color: #6b7280;
  font-size: 0.85rem;
}

.mod-reason {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-btn {
  padding: 6px 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.detail-btn:hover {
  background: #4338ca;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1rem;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 1100px;          /* 고정 너비 */
  height: 700px;         /* 고정 높이 */
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;      /* 전체 모달의 overflow 숨김 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;        /* 헤더 크기 고정 */
  background: white;     /* 헤더 배경 고정 */
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;      /* 본문만 스크롤 */
  flex: 1;               /* 남은 공간 모두 사용 */
}

.detail-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.description-section h4 {
  color: #1f2937;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.description-content {
  line-height: 1.6;
  color: #374151;
  background: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #4f46e5;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 20px;
}

.page-btn {
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #4338ca;
}

.page-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #374151;
  padding: 0 10px;
}

@media (max-width: 1200px) {
  .history-table {
    font-size: 12px;
  }
  
  .history-table th,
  .history-table td {
    padding: 8px;
  }
  
  .req-name {
    max-width: 200px;
  }
  
  .mod-reason {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .filter-group.search-group {
    min-width: auto;
  }
  
  .filter-actions {
    justify-content: center;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .history-table {
    min-width: 800px;
  }
  
  .modal-content {
    margin: 20px;
    max-width: none;
    max-height: calc(100vh - 40px);
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: calc(100vw - 40px);  /* 모바일에서는 반응형 */
    height: calc(100vh - 40px); /* 모바일에서는 반응형 */
    margin: 20px;
    max-width: none;
    max-height: none;
  }
}
</style>