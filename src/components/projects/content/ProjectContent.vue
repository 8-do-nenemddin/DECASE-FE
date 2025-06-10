<template>
  <div class="project-content">
    <!-- 각 컴포넌트를 wrapper로 감싸서 전체 너비 보장 -->
    <div class="content-wrapper">
      <BasicContent v-if="!selectedFile" />

      <AsIsReportContent
        v-else-if="selectedFile.type === 'as-is'"
        :docId="selectedFile.docId"
        :file="selectedFile.file"
      />

      <UploadContent
        v-else-if="selectedFile.type === 'uploaded'"
        :docId="selectedFile.docId"
        :file="selectedFile.file"
      />

      <RequirementsContent
        v-else-if="selectedFile.type === 'generated'"
        :projectId="selectedFile.projectId"
        :revision="
          projectStore.projectRevision >= 1
            ? projectStore.projectRevision
            : selectedFile.revision
        "
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BasicContent from "./BasicContent.vue";
import UploadContent from "./UploadContent.vue";
import RequirementsContent from "./RequirementsContent.vue";
import AsIsReportContent from "./AsisContent.vue"; // AS-IS 컴포넌트 추가
import { useProjectStore } from "../../../stores/projectStore";

const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);

console.log("✅✅✅✅✅✅✅✅");
console.log(
  projectStore.projectId,
  projectStore.projectName,
  projectStore.projectRevision
);

// 선택된 파일 정보
const selectedFile = ref(null);
const requirementsContentRef = ref(null);

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

// 검색 이벤트 처리
const handleSearch = (searchParams) => {
  if (
    selectedFile.value?.type === "generated" &&
    requirementsContentRef.value
  ) {
    requirementsContentRef.value.handleSearch(searchParams);
  }
};

// 파일 선택 해제 (필요한 경우)
const clearSelection = () => {
  selectedFile.value = null;
};

// 외부에서 접근할 수 있도록 expose
defineExpose({
  handleFileSelected,
  handleSearch,
  clearSelection,
});

onMounted(() => {
  console.log("ProjectContent 마운트됨, projectId:", projectId.value);
});
</script>

<style scoped>
.project-content {
  width: 100%;
  height: 100vh;
  /* display: flex; */
  /* justify-content: center; */
  /* align-items: center; */
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.project-content.with-sidebar {
  margin-left: 260px;
}
</style>
