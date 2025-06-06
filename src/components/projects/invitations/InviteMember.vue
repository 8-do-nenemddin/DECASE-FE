<template>
  <!-- 프로젝트 참여 여부 모달 -->
  <Transition name="modal-fade">
    <div v-if="showParticipationModal" class="modal-overlay" @click="closeParticipationModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-icon participation-icon">
            <span class="question-icon">🤝</span>
          </div>
          <h3 class="modal-title">프로젝트 참여</h3>
          <button @click="closeParticipationModal" class="modal-close-button">
            <span class="close-icon">✕</span>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-message participation-message">
            {{ projectData.name }} 에 참여하시겠습니까?
          </p>
        </div>
        
        <div class="modal-actions">
          <button @click="acceptParticipation" class="accept-button">
            <span class="accept-icon">✓</span>
            수락
          </button>
          <button @click="declineParticipation" class="decline-button">
            거부
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";

// Props로 token 받기 (라우터에서 props: true 설정한 경우)
const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const showParticipationModal = ref(false);

const projectData = reactive({
  name: "",
  projectId: ""
});

const route = useRoute();
// token은 props나 route.params에서 가져올 수 있음
const inviteToken = props.token || route.params.token;

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/projects/members/invitation/${inviteToken}`);
    if (!res.ok) throw new Error("초대 정보 로드 실패");

    const result = await res.json();
    const data = result.data; // <-- 실제 응답의 data 필드에 접근

    projectData.name = data.projectName;
    projectData.projectId = data.projectId;

    console.log(projectData);

    showParticipationModal.value = true;
  } catch (err) {
    console.error(err);
    projectData.name = "잘못된 프로젝트";
    showParticipationModal.value = true;
  }
});

// 프로젝트 참여 관련 함수들
const closeParticipationModal = () => {
  showParticipationModal.value = false;
};

const acceptParticipation = async () => {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/projects/invitation?token=${inviteToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await res.json();
    console.log(result);

    // joined: false이면 회원가입 안내
    if (!res.ok ) {
      alert('잘못된 접근입니다.');
    }
    else if (result.data.joined === false) {
      alert('회원가입을 먼저 진행해주세요.');
    } else {
      alert('프로젝트 참여 완료되었습니다. 로그인 해주세요.');
    }

    // 성공 시 홈으로 이동
    window.location.href = 'http://localhost:5173/home';
  } catch (err) {
    console.error(err);
    alert('프로젝트 참여에 실패했습니다.');
  }
};


const declineParticipation = () => {
  showParticipationModal.value = false;
  
  // 사용자에게 확인 메시지 표시
  if (confirm('창을 닫으시겠습니까? (창이 자동으로 닫히지 않으면 직접 닫아주세요)')) {
    try {
      window.close();
    } catch (e) {
      alert('창을 직접 닫아주세요. (Ctrl+W 또는 탭 닫기 버튼)');
    }
  } else {
    // 사용자가 취소한 경우 홈으로 이동
    window.location.href = 'http://localhost:5173/home';
  }
};
</script>

<style scoped>
/* 기존 스타일과 동일 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

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
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  position: relative;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.participation-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.question-icon {
  font-size: 1.5rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  flex: 1;
}

.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.modal-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.modal-message {
  font-size: 0.875rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.participation-message {
  text-align: center;
  font-size: 1rem;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.decline-button {
  flex: 1;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.decline-button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.accept-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.accept-button:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.accept-icon {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 0 1rem 1rem 1rem;
  }

  .modal-actions {
    padding: 1rem;
  }
}

.accept-button:focus-visible,
.decline-button:focus-visible,
.modal-close-button:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>