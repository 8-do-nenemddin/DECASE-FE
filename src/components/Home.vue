<template>
	<div class="back-groud">
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
	.back-groud {
		background-color: black;
		width: 100vw;
		height: 100vh;
	}

	.header {
		display: flex;
		justify-content: flex-end;
		padding: 20px;
		gap: 10px;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex-grow: 1;
		text-align: center;
	}

	.nav-button {
		background-color: white;
		color: black;
		border: none;
		padding: 10px 20px;
		border-radius: 20px;
		cursor: pointer;
		font-weight: bold;
		font-size: 0.9em;
	}

	.logo {
		padding-top: 10%;
		width: 250px;
		margin-bottom: 10px;
	}

.subtitle {
  font-size: 2em;
  color: white;
}

</style>