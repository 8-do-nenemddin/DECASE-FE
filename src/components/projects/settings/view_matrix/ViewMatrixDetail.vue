<template>
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ item.name }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-info">
            <div class="info-row">
              <strong>요구사항 코드:</strong> {{ item.reqIdCode }}
            </div>
            <div class="info-row">
              <strong>버전:</strong> Version. {{ item.version }}
            </div>
            <div class="info-row">
              <strong>변경 유형:</strong> 
              <span class="change-badge" :class="getChangeTypeClass(item.changeType)">
                {{ getChangeTypeText(item.changeType) }}
              </span>
            </div>
            <div class="info-row">
              <strong>Level1:</strong> {{ item.level1 }}
            </div>
            <div class="info-row">
              <strong>Level2:</strong> {{ item.level2 }}
            </div>
            <div class="info-row">
              <strong>Level3:</strong> {{ item.level3 }} 
            </div>
            <div class="info-row">
              <strong>우선순위:</strong> {{ getPriorityText(item.priority) }} 
            </div>
            <div class="info-row">
              <strong>난이도:</strong> {{ getDifficultyText(item.difficulty) }} 
            </div>
            <div class="info-row">
              <strong>수정자:</strong> {{ item.modifiedByName }}
            </div>
            <div class="info-row">
              <strong>수정일시:</strong> {{ formatDate(item.revisionDate) }}
            </div>
            <div class="info-row">
              <strong>수정 사유:</strong> {{ item.modReason || "-" }}
            </div>
          </div>
          <div class="description-section" v-if="item.description">
            <h4>상세 설명</h4>
            <div class="description-content" v-html="formatDescription(item.description)"></div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DetailModal',
    props: {
      isVisible: {
        type: Boolean,
        default: false
      },
      item: {
        type: Object,
        default: () => ({})
      }
    },
    emits: ['close'],
    methods: {
      closeModal() {
        this.$emit('close');
      },
      handleOverlayClick() {
        this.closeModal();
      },
      getChangeTypeClass(changeType) {
        // 변경 유형에 따른 CSS 클래스 반환
        const typeMap = {
          'NEW': 'change-new',
          'MODIFY': 'change-modify',
          'DELETE': 'change-delete'
        };
        return typeMap[changeType] || '';
      },
      getChangeTypeText(changeType) {
        // 변경 유형 텍스트 반환
        const typeMap = {
          'NEW': '신규',
          'MODIFY': '수정',
          'DELETE': '삭제'
        };
        return typeMap[changeType] || changeType;
      },
      getPriorityText(priority) {
        const priorityMap = {
          'HIGH': '상',
          'MIDDLE': '중',
          'LOW': '하'
        };
        return priorityMap[priority] || priority;
      },
      getDifficultyText(difficulty) {
        const difficultyMap = {
          'HIGH': '상',
          'MIDDLE': '중',
          'LOW': '하'
        };
        return difficultyMap[difficulty] || difficulty;
      },
      formatDate(date) {
        if (!date) return '-';
        // 날짜 포맷팅 로직
        return new Date(date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      formatDescription(description) {
        if (!description) return '';
        // 설명 포맷팅 로직 (줄바꿈 등)
        return description.replace(/\n/g, '<br>');
      }
    }
  };
  </script>
  
  <style scoped>
 .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  max-width: 640px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  color: #111827;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
}

.close-btn:hover {
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.detail-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.info-row strong {
  font-weight: 600;
  min-width: 140px;
  color: #374151;
}

.description-section {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.description-section h4 {
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.description-content {
  background: #f9fafb;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #4f46e5;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

/* Change Badge Styles */
.change-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.change-new {
  background-color: #10b981; /* emerald */
}

.change-modify {
  background-color: #f59e0b; /* amber */
}

.change-delete {
  background-color: #ef4444; /* red */
}
  </style>