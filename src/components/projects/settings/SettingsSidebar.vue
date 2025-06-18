<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item">
          <button
            :class="[
              'nav-button',
              { active: currentComponent === 'ProjectInfo' },
            ]"
            @click="$emit('changeComponent', 'ProjectInfo')"
          >
            <span class="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                ></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            <span class="nav-text">프로젝트 정보 수정</span>
          </button>
        </li>

        <li class="nav-item">
          <button
            :class="[
              'nav-button',
              { active: currentComponent === 'RequirementApprove' },
            ]"
            @click="$emit('changeComponent', 'RequirementApprove')"
          >
            <span class="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                ></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            <span class="nav-text">요구사항 수정 승인</span>
          </button>
        </li>

        <li class="nav-item">
          <button
            :class="[
              'nav-button',
              { active: currentComponent === 'ProjectMatrix' },
            ]"
            @click="$emit('changeComponent', 'ProjectMatrix')"
          >
            <span class="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </span>
            <span class="nav-text">요구사항 추적 매트릭스</span>
          </button>
        </li>

        <li class="nav-item">
          <button
            :class="[
              'nav-button',
              { active: currentComponent === 'ProjectRight' },
            ]"
            @click="$emit('changeComponent', 'ProjectRight')"
          >
            <span class="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <span class="nav-text">멤버 관리</span>
          </button>
        </li>

        <li class="nav-item">
          <button
            :class="[
              'nav-button',
              { active: currentComponent === 'Invitation' },
            ]"
            @click="$emit('changeComponent', 'Invitation')"
          >
            <span class="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                ></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <span class="nav-text">초대 현황</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  currentComponent: {
    type: String,
    required: true,
  },
});

defineEmits(["changeComponent"]);
</script>

<style scoped>
.sidebar {
  width: 16rem;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
  transition: all 0.3s ease;
}

.sidebar-nav {
  padding: 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  border-bottom: 1px solid #f3f4f6;
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  position: relative;
  overflow: hidden;
}

.nav-button::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.nav-button:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: #374151;
  transform: translateX(4px);
}

.nav-button:hover::before {
  transform: scaleY(1);
}

.nav-button.active {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #4338ca;
  font-weight: 600;
  transform: translateX(4px);
}

.nav-button.active::before {
  transform: scaleY(1);
}

.nav-icon {
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.nav-button:hover .nav-icon {
  transform: scale(1.1) rotate(5deg);
}

.nav-button.active .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  flex: 1;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.nav-button.active .nav-text {
  font-weight: 600;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .sidebar {
    width: 14rem;
  }

  .nav-button {
    padding: 1rem 1.25rem;
    font-size: 0.8125rem;
  }

  .nav-icon {
    font-size: 1rem;
    width: 1.25rem;
    height: 1.25rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    overflow-x: auto;
  }

  .nav-list {
    display: flex;
  }

  .nav-item {
    flex: 1;
    border-bottom: none;
    border-right: 1px solid #f3f4f6;
  }

  .nav-item:last-child {
    border-right: none;
  }

  .nav-button {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    text-align: center;
    white-space: nowrap;
  }

  .nav-button:hover,
  .nav-button.active {
    transform: translateY(-2px);
  }

  .nav-text {
    font-size: 0.75rem;
    line-height: 1.2;
  }
}

@media (max-width: 480px) {
  .nav-button {
    padding: 0.5rem 0.25rem;
    gap: 0.25rem;
  }

  .nav-icon {
    font-size: 0.875rem;
    width: 1rem;
    height: 1rem;
  }

  .nav-text {
    font-size: 0.6875rem;
  }
}

/* 스크롤바 스타일링 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f8fafc;
}

.sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}
</style>
