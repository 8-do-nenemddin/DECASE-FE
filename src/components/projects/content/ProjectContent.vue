<template>
  <div class="m-project-content-container">
    <!-- 각 컴포넌트를 wrapper로 감싸서 전체 너비 보장 -->
    <div class="m-content-wrapper">
      <!-- Mockup 파일이 활성화된 경우 -->
      <template v-if="activeMockupFile">
        <MockUpViewContent
          :activeFile="activeMockupFile"
          @openMockupSidebar="handleOpenMockupSidebar"
        />
      </template>
      <!-- Mockup 파일이 활성화되지 않은 경우 -->
      <template v-else>
        <!-- 1. selectedFile이 있는 경우 -->
        <template v-if="selectedFile">
          <AsIsReportContent
            v-if="selectedFile.type === 'as-is'"
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
            ref="requirementsContentRef"
            :projectId="selectedFile.projectId"
            :revision="
              projectStore.projectRevision >= 1
                ? projectStore.projectRevision
                : selectedFile.revision
            "
            @mockupFileSelected="handleMockupFileSelected"
          />
        </template>
        <!-- 2. selectedFile이 없는 경우 -->
        <template v-else>
          <!-- 2-1. PROCESSING 상태 -->
          <template v-if="srsStatus === 'PROCESSING'">
            <GeneratingContent />
          </template>
          <!-- 2-2. FAILED 상태 -->
          <template v-else-if="srsStatus === 'FAILED'">
            <SrsFailedContent :message="srsMessage" @retry="handleRetry" />
          </template>
          <!-- 2-3. COMPLETED 상태 or revision >= 1: 요구사항 정의서 화면 -->
          <template
            v-else-if="
              projectStore.projectRevision >= 1 || srsStatus === 'COMPLETED'
            "
          >
            <RequirementsContent
              ref="requirementsContentRef"
              :projectId="projectStore.projectId"
              :revision="projectStore.projectRevision"
              @mockupFileSelected="handleMockupFileSelected"
            />
          </template>
          <!-- 2-4. revision === 0: RFP 업로드 화면 -->
          <template v-else>
            <BasicContent @generation-started="handleGenerationStarted" />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import BasicContent from "./BasicContent.vue";
import UploadContent from "./UploadContent.vue";
import RequirementsContent from "./RequirementsContent.vue";
import AsIsReportContent from "./AsisContent.vue"; // AS-IS 컴포넌트 추가
import MockUpViewContent from "./MockUpViewContent.vue";
import { useProjectStore } from "../../../stores/projectStore";
import SrsFailedContent from "./SrsFailedContent.vue";
import GeneratingContent from "./GeneratingContent.vue";

const projectStore = useProjectStore();
const projectId = computed(() => projectStore.projectId);
let pollingInterval = null;

// 선택된 파일 정보
const selectedFile = ref(null);
const requirementsContentRef = ref(null);

const props = defineProps({
  headerBar: Object, // 상위에서 ref로 내려줌
});

function handleOpenMockupSidebar() {
  props.headerBar?.handleOpenMockupSidebar();
}

// 파일 선택 이벤트 처리 (부모에서 호출)
const handleFileSelected = (fileData) => {
  selectedFile.value = {
    type: fileData.type,
    docId: fileData.docId,
    file: fileData.file, // file 객체 전체 전달
    ...(fileData.type === "as-is" && {
      projectId: fileData.projectId,
    }),
    ...(fileData.type === "generated" && {
      projectId: fileData.projectId,
      revision: fileData.revision,
    }),
  };
};

// 검색 이벤트 처리
const handleSearch = (searchParams) => {
  if (
    requirementsContentRef.value &&
    typeof requirementsContentRef.value.handleSearch === "function"
  ) {
    requirementsContentRef.value.handleSearch(searchParams);
  }
};

// 파일 선택 해제 (필요한 경우)
const clearSelection = () => {
  selectedFile.value = null;
};

const activeMockupFile = ref(null);

const handleMockupFileSelected = (file) => {
  console.log("ProjectContent received mockup file:", file);
  selectedFile.value = null; // 기존 선택된 파일 초기화
  activeMockupFile.value = {
    name: file.name,
    revision: file.revision,
  };
  console.log("Updated activeMockupFile:", activeMockupFile.value);
};

const handleGenerationStarted = () => {
  srsStatus.value = "PROCESSING";
};

const srsStatus = ref(null); // "PROCESSING", "FAILED", "COMPLETED" 등
const srsMessage = ref("");

const fetchSrsStatus = async () => {
  if (!projectStore.projectId || !projectStore.userId) return;
  try {
    const res = await fetch(
      `/ai/api/v1/jobs/srs-agent/latest-status?project_id=${projectStore.projectId}&member_id=${projectStore.userId}&job_name=SRS`
    );

    if (!res.ok) throw new Error("status fetch error");
    const data = await res.json();
    srsStatus.value = data.status;
    srsMessage.value = data.message;

    if (data.status === "COMPLETED") {
      // 상태가 완료되면, projectStore의 revision을 1로 갱신
      await projectStore.setProjectRevision(1);
    }
  } catch (e) {
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId.value}/document/uploads`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        // 문서가 전혀 없는 초기 상태
        srsStatus.value = null;
        return;
      }

      // 문서는 있지만 다른 에러가 난 경우 → FAILED 처리
      console.error("SRS 상태 확인 실패:", e);
      // srsStatus.value = "FAILED";
      // srsMessage.value = "";
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    } catch (docCheckError) {
      console.error("문서 유무 확인 실패:", docCheckError);
      srsStatus.value = "FAILED";
      srsMessage.value = "";
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    }
  }
};

const startPolling = () => {
  if (pollingInterval) return; // 이미 폴링 중이면 시작하지 않음
  pollingInterval = setInterval(fetchSrsStatus, 60000); // 10분마다 상태 확인
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

watch(srsStatus, (newStatus) => {
  if (newStatus === "PROCESSING") {
    startPolling();
  } else {
    stopPolling();
  }
});

onMounted(() => {
  console.log("ProjectContent 마운트됨, projectId:", projectId.value);
  fetchSrsStatus();
});

onUnmounted(() => {
  stopPolling(); // 컴포넌트가 사라질 때 폴링 중지
});

const handleRetry = () => {
  srsStatus.value = null; // 상태 초기화
};

// 외부에서 접근할 수 있도록 expose
defineExpose({
  handleFileSelected,
  handleSearch,
  clearSelection,
  handleMockupFileSelected,
});
</script>

<style scoped>
.m-project-content-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

/* Hide scrollbar for all browsers */
::-webkit-scrollbar {
  display: none;
}

* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.m-project-content.with-sidebar {
  margin-left: 260px;
}
</style>
