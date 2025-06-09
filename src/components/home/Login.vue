<template>
	<div class="auth-container">
	  <AuthLeftPanel />
	  <div class="auth-right">
		<h2 class="title">Let's simplify your project.</h2>
		<form @submit.prevent="handleLogin" class="login-form">
		  <input 
			type="text" 
			v-model="userId" 
			placeholder="Input your ID" 
			required 
			class="input-field"
		  />
		  <input 
			type="password" 
			v-model="password" 
			placeholder="Input your pw" 
			required 
			class="input-field"
		  />
		  <button type="submit" class="submit-button" :disabled="isLoading">
			{{ isLoading ? '로그인 중...' : '로그인' }}
		  </button>
		</form>
	  </div>

	  <!-- 성공 모달 -->
	  <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
		<div class="modal-content success" @click.stop>
		  <div class="modal-icon">
			<svg width="60" height="60" viewBox="0 0 24 24" fill="none">
			  <circle cx="12" cy="12" r="12" fill="#10B981"/>
			  <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		  </div>
		  <h3>로그인 성공!</h3>
		  <p>환영합니다! 홈화면으로 이동합니다.</p>
		  <button @click="goToHome" class="modal-button success-button">
			홈으로 이동
		  </button>
		</div>
	  </div>

	  <!-- 실패 모달 -->
	  <div v-if="showErrorModal" class="modal-overlay" @click="closeModal">
		<div class="modal-content error" @click.stop>
		  <div class="modal-icon">
			<svg width="60" height="60" viewBox="0 0 24 24" fill="none">
			  <circle cx="12" cy="12" r="12" fill="#EF4444"/>
			  <path d="M12 8v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		  </div>
		  <h3>로그인 실패</h3>
		  <p>{{ errorMessage }}</p>
		  <button @click="closeModal" class="modal-button error-button">
			다시 시도
		  </button>
		</div>
	  </div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLeftPanel from './AuthLeftPanel.vue';
import { useProjectStore } from '/src/stores/projectStore.js';

const router = useRouter();

const userId = ref('');
const password = ref('');
const isLoading = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;

  try {
    // 로그인 데이터 준비
    const loginData = {
      id: userId.value,
      password: password.value,
    };

    console.log('로그인 요청:', loginData);

    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '로그인 실패');
    }

    const result = await response.json();
    const userInfo = result.data;
    console.log("사용자 정보:", userInfo);
    const memberStore = useProjectStore();
    memberStore.setUser(userInfo.memberId);
    console.log("로그인 성공:", result);

    // 로그인 성공 시 성공 모달 표시
    console.log("로그인 성공!");
    showSuccessModal.value = true;
    
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    errorMessage.value = error.message || '아이디 또는 비밀번호가 잘못되었습니다.';
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const goToHome = () => {
  showSuccessModal.value = false;
  router.push('/'); // 홈으로 이동
};

const closeModal = () => {
  showSuccessModal.value = false;
  showErrorModal.value = false;
  errorMessage.value = '';
};
</script>

<style>
/* 글로벌 리셋 - 전체 화면 보장 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
  width: 100%;
}

body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app, .vue-component-root {
  height: 100%;
  width: 100%;
}
</style>

<style scoped>
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.auth-right {
  flex: 0 0 65%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: white;
  min-height: 100vh;
}

.title {
  margin-bottom: 30px;
  font-size: 1.8em;
  color: black;
  text-align: center;
  animation: slideInFromTop 1.8s ease-out both;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  animation: slideInFromTop 1.8s ease-out 0.3s both;
}

.input-field {
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.submit-button {
  padding: 15px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #333;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.submit-button:active {
  background-color: #000;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 애니메이션 키프레임 */
@keyframes slideInFromTop {
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }
  60% {
    transform: translateY(10px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }
  
  .auth-right {
    flex: 1;
    padding: 20px;
    min-height: 100vh;
  }
  
  .title {
    font-size: 1.5em;
    margin-bottom: 20px;
  }
  
  .login-form {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .auth-right {
    padding: 15px;
  }
  
  .title {
    font-size: 1.3em;
    margin-bottom: 15px;
  }
  
  .input-field {
    padding: 10px 12px;
    font-size: 0.9em;
  }
  
  .submit-button {
    padding: 12px;
    font-size: 1em;
  }
}

/* 세로 화면이 짧은 경우 */
@media (max-height: 600px) {
  .auth-right {
    padding: 20px;
    justify-content: center;
  }
  
  .title {
    margin-bottom: 20px;
    font-size: 1.5em;
  }
  
  .input-field {
    margin-bottom: 12px;
  }
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-icon {
  margin-bottom: 20px;
}

.modal-content h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1F2937;
}

.modal-content p {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 30px;
  line-height: 1.5;
}

.modal-button {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.success-button {
  background-color: #10B981;
  color: white;
}

.success-button:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.error-button {
  background-color: #EF4444;
  color: white;
}

.error-button:hover {
  background-color: #DC2626;
  transform: translateY(-1px);
}
</style>