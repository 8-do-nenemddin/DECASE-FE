<template>
	<div class="auth-left">
	  <img src="/DECASE-dark.png" alt="DECASE Logo" class="logo" />
	  <p class="tagline">
		<span v-for="(char, index) in taglineChars" 
			  :key="index" 
			  :style="{ animationDelay: index * 0.1 + 's' }"
			  class="char">{{ char === ' ' ? '\u00A0' : char }}</span>
	  </p>
	</div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const tagline = '정의서를 쉽게, 프로젝트를 빠르게.';
  const taglineChars = ref([]);
  
  onMounted(() => {
	setTimeout(() => {
	  taglineChars.value = tagline.split('');
	}, 500); // 로고가 나타난 후 텍스트 애니메이션 시작
  });
  </script>
  
  <style scoped>
  .auth-left {
	flex: 0 0 35%;
	background-color: black;
	color: white;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 20px;
	height: 100vh;
  }
  
  .logo {
	width: 150px;
	margin-bottom: 20px;
	opacity: 0;
	animation: logoFadeIn 1s ease-out 0.3s forwards;
	transform: translateY(20px);
  }
  
  .tagline {
	font-size: 1.2em;
	text-align: center;
	line-height: 1.6;
  }
  
  .char {
	display: inline-block;
	opacity: 0;
	animation: charFadeIn 0.8s ease-out forwards;
	transform: translateY(20px);
  }
  
  @keyframes logoFadeIn {
	to {
	  opacity: 1;
	  transform: translateY(0);
	}
  }
  
  @keyframes charFadeIn {
	0% {
	  opacity: 0;
	  transform: translateY(20px) scale(0.8);
	}
	50% {
	  transform: translateY(-5px) scale(1.1);
	}
	100% {
	  opacity: 1;
	  transform: translateY(0) scale(1);
	}
  }
  </style>