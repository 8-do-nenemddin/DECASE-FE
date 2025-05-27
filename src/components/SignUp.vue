<template>
	<div class="auth-container">
	  <AuthLeftPanel />
	  <div class="auth-right">
		<div class="form-wrapper">
		  <h2>Enter your information</h2>
		  <form @submit.prevent="handleSignup">
			<input type="text" v-model="userId" placeholder="Input your ID" required />
			<input type="password" v-model="password" placeholder="Input your pw" required />
			<input type="email" v-model="email" placeholder="Input your email" required />
			<input type="text" v-model="company" placeholder="Input your company" />
			<input type="text" v-model="department" placeholder="Input your department" />
			<button type="submit" class="submit-button">회원가입</button>
		  </form>
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import AuthLeftPanel from './AuthLeftPanel.vue';
  
  const userId = ref('');
  const password = ref('');
  const email = ref('');
  const company = ref('');
  const department = ref('');
  
  const handleSignup = () => {
	console.log('회원가입 요청:', {
	  userId: userId.value,
	  password: password.value,
	  email: email.value,
	  company: company.value,
	  department: department.value,
	});
  };
  </script>
  
  <style scoped>
  /* ✅ 브라우저 전체 채우기 */
  html, body {
	height: 100%;
	margin: 0;
	padding: 0;
	overflow: hidden;
  }
  
  /* 전체 컨테이너 */
  .auth-container {
	display: flex;
	height: 100vh;
	width: 100vw;
  }
  
  /* 오른쪽 패널 (폼 영역) */
  .auth-right {
	flex: 0 0 65%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: white;
	height: 100vh; /* ✅ 강제 고정 */
	overflow: hidden;
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
  }
  
  /* 폼 자체 */
  form {
	display: flex;
	flex-direction: column;
	width: 100%;
  }
  
  /* 인풋 */
  input {
	padding: 12px 15px;
	margin-bottom: 15px;
	border: 1px solid #ccc;
	border-radius: 8px;
	font-size: 1em;
  }
  
  /* 버튼 */
  .submit-button {
	padding: 15px;
	background-color: black;
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-size: 1.1em;
	font-weight: bold;
  }
  </style>