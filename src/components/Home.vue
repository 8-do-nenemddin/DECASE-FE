<template>
	<div class="background">
	  <div class="header">
		<button class="nav-button" @click="goToSignup">회원가입</button>
		<button class="nav-button" @click="goToSignIn">로그인</button>
	  </div>
	  <div class="content">
		<img src="/DECASE-dark.png" alt="Logo" class="logo" />
		<p class="subtitle">정의서를 쉽게, 프로젝트를 빠르게.</p>
	  </div>
	</div>
  </template>
  
  <script setup>
	import { useRouter } from 'vue-router';
	const router = useRouter();

	const goToSignup= () => {
	router.push('/signup');
	};

	const goToSignIn = () => {
	router.push('/signin');
	};
	</script>
  
  <style>
  /* 글로벌 리셋 - 강력한 전체 화면 설정 */
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
  
  /* 배경 컨테이너 - 강력한 전체 화면 설정 */
  .background {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100vw;
	background-color: #000;
	color: #fff;
	overflow: hidden;
  }
  
  /* 헤더 - 반응형 개선 */
  .header {
	position: absolute;
	top: 0;
	right: 0;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	padding: 1.5rem;
	gap: 1.25rem;
	z-index: 10;
	animation: slideInFromTop 1.8s ease-out 1.2s both;
  }
  
  /* 메인 콘텐츠 - 중앙 정렬 개선 */
  .content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	flex: 1;
	height: 100%;
	padding: 2rem;
  }
  
  /* 버튼 스타일 - 반응형 개선 + 애니메이션 */
  .nav-button {
	background-color: #fff;
	color: #000;
	border: none;
	padding: 0.75rem 1.5rem;
	border-radius: 2rem;
	cursor: pointer;
	font-weight: 600;
	font-size: 0.875rem;
	transition: all 0.3s ease;
	white-space: nowrap;
	box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  }
  
  .nav-button:hover {
	background-color: #f0f0f0;
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
  }
  
  .nav-button:active {
	transform: translateY(0);
	box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  }
  
  /* 로고 - 반응형 크기 조정 + 애니메이션 */
  .logo {
	width: min(300px, 80vw);
	height: auto;
	margin-bottom: 1.5rem;
	animation: slideInFromTop 1.8s ease-out both;
  }
  
  /* 부제목 - 반응형 텍스트 크기 + 애니메이션 */
  .subtitle {
	font-size: clamp(1rem, 3vw, 1.6rem);
	font-weight: 300;
	margin: 0;
	line-height: 1.2;
	opacity: 0.9;
	animation: slideInFromTop 1.8s ease-out 0.5s both;
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
  
  @keyframes fadeInScale {
	0% {
	  transform: scale(0.8);
	  opacity: 0;
	}
	100% {
	  transform: scale(1);
	  opacity: 1;
	}
  }
  
  /* 태블릿 크기 */
  @media (max-width: 768px) {
	.header {
	  padding: 1rem;
	  gap: 1rem;
	}
	
	.nav-button {
	  padding: 0.625rem 1.25rem;
	  font-size: 0.8rem;
	}
	
	.content {
	  padding: 1.5rem;
	}
	
	.logo {
	  width: min(250px, 75vw);
	  margin-bottom: 1rem;
	}
	
	.subtitle {
	  font-size: clamp(0.9rem, 3.5vw, 1.2rem);
	}
  }
  
  /* 모바일 크기 */
  @media (max-width: 480px) {
	.header {
	  padding: 0.75rem;
	  gap: 0.75rem;
	}
	
	.nav-button {
	  padding: 0.5rem 1rem;
	  font-size: 0.75rem;
	  border-radius: 1.5rem;
	}
	
	.content {
	  padding: 1rem;
	}
	
	.logo {
	  width: min(200px, 70vw);
	  margin-bottom: 0.75rem;
	}
	
	.subtitle {
	  font-size: clamp(0.8rem, 4vw, 1.1rem);
	}
  }
  
  /* 초소형 화면 */
  @media (max-width: 320px) {
	.header {
	  padding: 0.5rem;
	}
	
	.nav-button {
	  padding: 0.375rem 0.75rem;
	  font-size: 0.7rem;
	}
	
	.logo {
	  width: min(180px, 65vw);
	}
  }
  
  /* 세로 화면이 매우 짧은 경우 */
  @media (max-height: 500px) {
	.content {
	  flex: 1;
	  justify-content: center;
	}
	
	.logo {
	  width: min(200px, 60vw);
	  margin-bottom: 0.5rem;
	}
	
	.subtitle {
	  font-size: clamp(1rem, 3vw, 1.5rem);
	}
  }
  </style>