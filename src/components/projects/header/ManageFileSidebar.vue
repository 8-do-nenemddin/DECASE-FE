<template>
  <div class="sidebar-overlay" @click="$emit('close')">
    <div class="sidebar" @click.stop>
      <div class="sidebar-content">
        <div
          v-for="(item, index) in sidebarItems"
          :key="index"
          class="sidebar-item-container"
          :class="{ 'expanded-container': item.expanded }"
        >
          <div class="sidebar-item" @click="toggleItem(index)">
            <div class="sidebar-item-header">
              {{ item.name }}
              <span class="arrow" :class="{ expanded: item.expanded }">∨</span>
            </div>
            <div v-if="item.expanded" class="sidebar-item-content-integrated">
              <p
                v-if="
                  item.name === '업로드한 파일' &&
                  (!item.files || item.files.length === 0)
                "
                class="empty-message"
              >
                업로드된 파일 목록이 여기에 표시됩니다.
              </p>
              <ul
                v-if="
                  item.name === '업로드한 파일' &&
                  item.files &&
                  item.files.length > 0
                "
                class="file-list file-list-scrollable"
              >
                <li
                  v-for="(file, fileIndex) in item.files"
                  :key="fileIndex"
                  class="file-item"
                >
                  <div class="file-line">
                    <span
                      class="file-icon"
                      :class="'file-icon-' + getFileIcon(file.name).type"
                    >
                      {{ getFileIcon(file.name).type }}
                    </span>
                    <span class="file-name">{{ file.name }}</span>

                    <!-- ❌ 삭제 버튼: 파일명 오른쪽에 위치 -->
                    <button
                      class="delete-button"
                      @click.stop="deleteUploadedFile(fileIndex)"
                      title="파일 삭제"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="file-date">{{ file.date }}</div>
                </li>
              </ul>

              <p
                v-if="
                  item.name === '생성된 파일' &&
                  (!item.files || item.files.length === 0)
                "
                class="empty-message"
              >
                생성된 파일 목록이 여기에 표시됩니다.
              </p>

              <ul
                v-if="
                  item.name === '생성된 파일' &&
                  item.files &&
                  item.files.length > 0
                "
                class="file-list file-list-scrollable"
              >
                <li
                  v-for="(file, fileIndex) in item.files"
                  :key="fileIndex"
                  class="file-item"
                >
                  <div class="file-line">
                    <span
                      class="file-icon"
                      :class="'file-icon-' + getFileIcon(file.name).type"
                    >
                      {{ getFileIcon(file.name).type }}
                    </span>
                    <span class="file-name">{{ file.name }}</span>

                    <!-- ⬇️ 다운로드 버튼 -->
                    <button
                      class="download-button"
                      @click.stop="downloadGeneratedFile(file)"
                      title="파일 다운로드"
                    ></button>
                  </div>
                  <div class="file-date">{{ file.date }}</div>
                </li>
              </ul>

              <p v-if="item.name === '요구사항 Diff 창'" class="empty-message">
                요구사항 Diff 내용이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const emit = defineEmits(["close", "search"]);

const searchQuery = ref("");

const filters = reactive({
  category: "",
  subcategory: "",
  detailCategory: "",
  type: "",
  priority: "",
});

const options = reactive({
  rfp: false,
  proposal: false,
  additional: false,
  functional: false,
});

// ✅ 목업 데이터 추가
const sidebarItems = reactive([
  {
    name: "업로드한 파일",
    expanded: true,
    files: [
      {
        name: "기획서_v1.pdf",
        date: "2025-05-22",
      },
      {
        name: "요구사항정의서.docx",
        date: "2025-05-21",
      },
    ],
  },
  {
    name: "생성된 파일",
    expanded: false,
    files: [
      {
        name: "API_명세서.json",
        date: "2025-05-22",
      },
      {
        name: "디자인_가이드라인.md",
        date: "2025-05-21",
      },
    ],
  },
  {
    name: "요구사항 Diff 창",
    expanded: false,
    files: [], // 이 섹션은 파일이 아닌 텍스트일 가능성이 있음
  },
]);

const toggleItem = (index) => {
  sidebarItems[index].expanded = !sidebarItems[index].expanded;
};

const performSearch = () => {
  const searchParams = {
    query: searchQuery.value,
    filters: { ...filters },
    options: { ...options },
  };

  console.log("검색 실행:", searchParams);
  emit("search", searchParams);
};

// 간단한 파일 아이콘 타입 반환 함수 (이미 있는 것으로 가정)
function getFileIcon(filename) {
  const extension = filename.split(".").pop();
  const iconMap = {
    pdf: "📄",
    docx: "📝",
    json: "⚙️",
    md: "📋",
  };
  return { type: iconMap[extension] || "📁" };
}

// 삭제 및 다운로드 함수 (이벤트 전달용 기본 목업)
function deleteUploadedFile(index) {
  const uploadedSection = sidebarItems.find(
    (item) => item.name === "업로드한 파일"
  );
  if (uploadedSection?.files) {
    uploadedSection.files.splice(index, 1);
  }
}

function downloadGeneratedFile(file) {
  console.log("다운로드 실행:", file.name);
}
</script>

<style scoped>
/* 사이드바 오버레이 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

/* 사이드바 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 51;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

@keyframes sidebarSlideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.sidebar-content {
  margin-top: 70px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 사이드바 아이템 컨테이너 */
.sidebar-item-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-item-container:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.sidebar-item-container.expanded-container {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

/* 사이드바 아이템 헤더 */
.sidebar-item {
  cursor: pointer;
}

.sidebar-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 15px;
  color: #2d3748;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  transition: all 0.3s ease;
  position: relative;
}

.sidebar-item-header:hover {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
  color: #1a202c;
}

.sidebar-item-header::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.sidebar-item-header:hover::before {
  transform: scaleY(1);
}

/* 화살표 아이콘 */
.arrow {
  font-size: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #718096;
  display: inline-block;
}

.arrow.expanded {
  transform: rotate(180deg);
  color: #4a5568;
}

/* 사이드바 아이템 콘텐츠 */
.sidebar-item-content-integrated {
  padding: 0;
  animation: contentSlideDown 0.3s ease-out;
  background: white;
}

@keyframes contentSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 빈 메시지 */
.empty-message {
  padding: 20px;
  text-align: center;
  color: #a0aec0;
  font-size: 14px;
  font-style: italic;
  background: linear-gradient(145deg, #f7fafc, #edf2f7);
  margin: 0;
}

/* 파일 목록 */
.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.file-list-scrollable::-webkit-scrollbar {
  width: 6px;
}

.file-list-scrollable::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.file-list-scrollable::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #cbd5e0, #a0aec0);
  border-radius: 3px;
}

.file-list-scrollable::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #a0aec0, #718096);
}

/* 파일 아이템 */
.file-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f4f8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: white;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 #667eea;
}

.file-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.file-item:hover::before {
  transform: scaleY(1);
}

/* 파일 라인 */
.file-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

/* 파일 아이콘 */
.file-icon {
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: linear-gradient(135deg, #edf2f7, #e2e8f0);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.file-item:hover .file-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: scale(1.1) rotate(5deg);
}

/* 파일명 */
.file-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.file-item:hover .file-name {
  color: #1a202c;
  font-weight: 600;
}

/* 파일 날짜 */
.file-date {
  font-size: 12px;
  color: #a0aec0;
  margin-left: 36px;
  transition: color 0.3s ease;
}

.file-item:hover .file-date {
  color: #718096;
}

/* 삭제 버튼 */
.delete-button {
  background: linear-gradient(135deg, #fed7d7, #feb2b2);
  color: #c53030;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: scale(0.8);
  flex-shrink: 0;
}

.file-item:hover .delete-button {
  opacity: 1;
  transform: scale(1);
}

.delete-button:hover {
  background: linear-gradient(135deg, #fc8181, #f56565);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(197, 48, 48, 0.3);
}

.delete-button:active {
  transform: scale(0.95);
}

/* 다운로드 버튼 */
.download-button {
  background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: scale(0.8);
  flex-shrink: 0;
  position: relative;
}

.download-button::before {
  content: "⬇";
  color: #38a169;
  font-size: 14px;
  font-weight: bold;
}

.file-item:hover .download-button {
  opacity: 1;
  transform: scale(1);
}

.download-button:hover {
  background: linear-gradient(135deg, #68d391, #48bb78);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
}

.download-button:hover::before {
  color: white;
}

.download-button:active {
  transform: scale(0.95);
}

/* 검색 섹션 */
.search-section {
  margin-bottom: 8px;
}

.search-input {
  width: 85%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  font-family: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.search-input::placeholder {
  color: #a0aec0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
  }

  .sidebar-content {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .sidebar-content {
    padding: 16px 12px;
    gap: 16px;
  }

  .sidebar-item-header {
    padding: 14px 16px;
    font-size: 14px;
  }

  .file-item {
    padding: 14px 16px;
  }

  .file-name {
    font-size: 13px;
  }

  .file-date {
    font-size: 11px;
    margin-left: 32px;
  }
}

/* 스크롤바 숨김 */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f7fafc;
}

.sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #e2e8f0, #cbd5e0);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #cbd5e0, #a0aec0);
}
</style>
