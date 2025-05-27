<template>
	<div class="auth-container">
	  <AuthLeftPanel />
	  <div class="auth-right">
		<h2>Let's simplify your project.</h2>
		<form @submit.prevent="handleLogin">
		  <input type="text" v-model="userId" placeholder="Input your ID" required />
		  <input type="password" v-model="password" placeholder="Input your pw" required />
		  <button type="submit" class="submit-button">로그인</button>
		</form>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import AuthLeftPanel from './AuthLeftPanel.vue';
  
  const userId = ref('');
  const password = ref('');
  
  const handleLogin = () => {
	console.log('로그인 요청:', {
	  userId: userId.value,
	  password: password.value,
	});
  };
  </script>
  
  <style scoped>
  .auth-container {
	display: flex;
	height: 100vh;
	width: 100vw;
  }
  .auth-right {
	flex: 0 0 65%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 40px;
	background-color: white;
  }
  .auth-right h2 {
	margin-bottom: 30px;
	font-size: 1.8em;
	color: black;
  }
  form {
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 400px;
  }
  input {
	padding: 12px 15px;
	margin-bottom: 15px;
	border: 1px solid #ccc;
	border-radius: 8px;
	font-size: 1em;
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
  }
  </style>