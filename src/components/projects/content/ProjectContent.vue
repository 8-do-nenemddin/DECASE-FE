<template>
  <div class="project-content">
    <!-- 기본 화면 -->
    <BasicContent v-if="!selectedFile" />

    <!-- AS-IS 보고서 선택 시 -->
    <AsIsReportContent
      v-else-if="selectedFile.type === 'as-is'"
      :docId="selectedFile.docId"
      :file="selectedFile.file"
    />

    <!-- 업로드 파일 선택 시 -->
    <UploadContent
      v-else-if="selectedFile.type === 'uploaded'"
      :docId="selectedFile.docId"
      :file="selectedFile.file"
    />

    <!-- 생성된 파일 선택 시 -->
    <RequirementsContent
      v-else-if="selectedFile.type === 'generated'"
      :projectId="selectedFile.projectId"
      :revision="selectedFile.revision"
    />
  </div>
</template>

<script setup>
console.log("컴포넌트 새로 로딩됨");
import { ref, onMounted } from "vue";
import BasicContent from "./BasicContent.vue";
import UploadContent from "./UploadContent.vue";
import RequirementsContent from "./RequirementsContent.vue";
import AsIsReportContent from "./AsisContent.vue"; // AS-IS 컴포넌트 추가

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

// 선택된 파일 정보
const selectedFile = ref(null);

// 파일 선택 이벤트 처리 (부모에서 호출)
const handleFileSelected = (fileData) => {
  selectedFile.value = {
    type: fileData.type,
    docId: fileData.docId,
    file: fileData.file, // file 객체 전체 전달
    // // AS-IS 보고서의 경우 추가 정보
    ...(fileData.type === "as-is" && {
      projectId: fileData.projectId,
    }),
    // 생성된 파일의 경우 추가 정보
    ...(fileData.type === "generated" && {
      projectId: fileData.projectId,
      revision: fileData.revision,
    }),
  };
};

// 파일 선택 해제 (필요한 경우)
const clearSelection = () => {
  selectedFile.value = null;
};

// 외부에서 접근할 수 있도록 expose
defineExpose({
  handleFileSelected,
  clearSelection,
});

onMounted(() => {
  console.log("ProjectContent 마운트됨, projectId:", props.projectId);
});
</script>

<style scoped>
.project-content {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 64px); /* 헤더 높이 제외 */
}
</style>
