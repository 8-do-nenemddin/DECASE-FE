<template>
  <div class="auth-container">
    <AuthLeftPanel />
    <div class="auth-right">
      <div class="form-wrapper">
        <h2>Enter your information</h2>
        <form @submit.prevent="handleSignup">
          <div class="id-input-group">
            <input
              type="text"
              v-model="userId"
              :class="['id-input', idCheckStatus === 'valid' ? 'is-valid' : '', idCheckStatus === 'invalid' ? 'is-invalid' : '']"
              placeholder="Input your ID"
              required
            />
            <button type="button" @click="checkIdDuplicate" class="duplicate-check-btn">중복 확인</button>
          </div>
          <div v-if="idCheckStatus === 'valid'" class="valid-feedback" style="margin-bottom: 15px; color: #198754;">
            사용 가능한 아이디입니다.
          </div>
          <div v-if="idCheckStatus === 'invalid'" class="invalid-feedback" style="margin-bottom: 15px; color: #dc3545;">
            이미 사용 중인 아이디입니다.
          </div>
          <input type="text" v-model="userName" placeholder="Input your name" required />
          <input type="password" v-model="password" placeholder="Input your pw" required />
          <input type="email" v-model="email" placeholder="Input your email" required />
          <select v-model="companyId" required @change="handleCompanyChange">
            <option disabled value="">Select your company</option>
            <option v-for="company in companies" :key="company.companyId" :value="company.companyId">
              {{ company.name }}
            </option>
          </select>
          <select v-model="departmentId" required>
            <option disabled value="">Select your department</option>
            <option v-for="department in departments" :key="department.departmentId" :value="department.departmentId">
              {{ department.name }}
            </option>
          </select>

          <button type="submit" class="submit-button" :disabled="isLoading">
            {{ isLoading ? '가입 중...' : '회원가입' }}
          </button>
        </form>
      </div>
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
        <h3>회원가입 완료!</h3>
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
        <h3>회원가입 실패</h3>
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

const router = useRouter();

const userId = ref('');
const idCheckStatus = ref('');
const userName = ref('');
const password = ref('');
const email = ref('');
const company = ref('');
const department = ref('');

const companyId = ref('');
const departmentId = ref('');
const companies = ref([]);
const departments = ref([]);
const isLoading = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');

const handleSignup = async () => {
  isLoading.value = true;

  try {
    const signupData = {
      id: userId.value,
      password: password.value,
      name: userName.value,
      email: email.value,
      companyId: parseInt(companyId.value),
      departmentId: parseInt(departmentId.value),
    };

    const response = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    const result = await response.json();

    if (response.status === 201) {
      console.log("회원가입 성공:", result);
      showSuccessModal.value = true;
      router.push('/signin')
    } else {
      throw new Error(result.message || '회원가입 실패');
    }
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    errorMessage.value = error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const checkIdDuplicate = async () => {
  if (!userId.value) {
    alert("아이디를 입력해주세요.");
    idCheckStatus.value = 'invalid';
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId.value }),
    });
    const result = await response.json();
    if (response.ok && result.data?.result === true) {
      idCheckStatus.value = 'valid';
    } else {
      idCheckStatus.value = 'invalid';
    }
  } catch (error) {
    console.error("아이디 중복 확인 실패:", error);
    idCheckStatus.value = 'invalid';
  }
};

const fetchCompanies = async () => {
  try {
    const response = await fetch('/api/v1/companies/search');
    const result = await response.json();
    if (response.ok) {
      companies.value = result.data;
    }
  } catch (error) {
    console.error('회사 정보 불러오기 실패:', error);
  }
};

const fetchDepartments = async (companyId) => {
  try {
    const response = await fetch(`/api/v1/departments/search?companyId=${companyId}&page=0&size=10`);
    const result = await response.json();
    if (response.ok) {
      departments.value = result.data;
    }
  } catch (error) {
    console.error('부서 정보 불러오기 실패:', error);
  }
};

import { onMounted } from 'vue';
onMounted(() => {
  fetchCompanies();
});

const handleCompanyChange = () => {
  if (companyId.value) {
    fetchDepartments(parseInt(companyId.value));
  } else {
    departments.value = [];
  }
};

const goToHome = () => {
  showSuccessModal.value = false;
  router.push('/home');
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
/* 전체 컨테이너 - 완전한 화면 채우기 */
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

/* 오른쪽 패널 (폼 영역) */
.auth-right {
  flex: 0 0 65%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  min-height: 100vh;
  overflow-y: auto;
  padding: 20px;
}

/* 폼 래퍼 */
.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

/* 제목 */
.auth-right h2 {
  margin-bottom: 30px;
  font-size: 1.8em;
  color: black;
  text-align: center;
  animation: slideInFromTop 1.8s ease-out both;
}

/* 폼 자체 */
form {
  display: flex;
  flex-direction: column;
  width: 100%;
  animation: slideInFromTop 1.8s ease-out 0.3s both;
}

/* 웅장한 애니메이션 효과 */
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

/* 아이디 입력 그룹 - 중복확인 버튼 정렬 개선 */
.id-input-group {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-bottom: 15px;
}

.id-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s ease;
}

.id-input:focus {
  outline: none;
  border-color: #000;
}

/* 중복확인 버튼 - id-input과 동일한 높이, 패딩, 정렬 */
.duplicate-check-btn {
  height: 44px;
  padding: 0 15px;
  background-color: #444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.duplicate-check-btn:hover {
  background-color: #333;
}

.duplicate-check-btn:active {
  background-color: #222;
}

/* 일반 인풋 스타일 */
input {
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #000;
}

/* Select 요소 스타일 통일 */
select {
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

select:focus {
  outline: none;
  border-color: #000;
}

select option {
  padding: 8px 12px;
  background-color: white;
  color: #333;
}

select option:disabled {
  color: #999;
}

/* 제출 버튼 */
.submit-button {
  padding: 15px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  transition: background-color 0.2s ease;
  margin-top: 5px;
}

.submit-button:hover {
  background-color: #333;
}

.submit-button:active {
  background-color: #000;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
    overflow-y: auto;
  }

  .auth-right h2 {
    font-size: 1.5em;
    margin-bottom: 20px;
  }

  .form-wrapper {
    max-width: 100%;
  }

  .id-input-group {
    margin-bottom: 12px;
  }

  .duplicate-check-btn {
    font-size: 0.8em;
    padding: 10px 12px;
  }

  input, select {
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .auth-right {
    padding: 15px;
  }

  .auth-right h2 {
    font-size: 1.3em;
    margin-bottom: 15px;
  }

  .id-input, input, select {
    padding: 10px 12px;
    font-size: 0.9em;
    margin-bottom: 10px;
  }

  .id-input-group {
    margin-bottom: 10px;
    gap: 8px;
  }

  .duplicate-check-btn {
    padding: 10px;
    font-size: 0.8em;
    min-width: 70px;
  }

  .submit-button {
    padding: 12px;
    font-size: 1em;
  }
}

/* 세로 화면이 짧은 경우 - 스크롤 허용 */
@media (max-height: 700px) {
  .auth-right {
    align-items: flex-start;
    padding-top: 30px;
    padding-bottom: 30px;
  }

  .auth-right h2 {
    margin-bottom: 20px;
    font-size: 1.5em;
  }

  .id-input-group {
    margin-bottom: 12px;
  }

  input, select {
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

.is-valid {
  border-color: #198754;
}

.is-invalid {
  border-color: #dc3545;
}

.valid-feedback,
.invalid-feedback {
  font-size: 0.875em;
  margin-top: -20px;
  margin-bottom: -20px;
}
</style>