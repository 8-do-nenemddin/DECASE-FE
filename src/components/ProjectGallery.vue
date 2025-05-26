<template>
	<div class="project-grid">
	  <div class="project-card" v-for="project in projects" :key="project.id">
		<h2>{{ project.name }}</h2>
		<p>{{ project.date }} ・ {{ project.versionInfo }}</p>
	  </div>
	</div>
  </template>
  
  <script setup>
  const props = defineProps({
	projects: {
	  type: Array,
	  required: true
	}
  });
  </script>
  
  <style scoped>
  .project-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
  }
  
  .project-card {
	border: 1px solid #ccc;
	border-radius: 8px;
	padding: 20px;
	height: 150px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	background-color: #fff;
  }
  
  .project-card h2 {
	font-size: 1.5em;
	margin: 0 0 10px 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
  }
  
  .project-card p {
	font-size: 0.9em;
	color: #555;
	margin: 0;
  }
  </style>