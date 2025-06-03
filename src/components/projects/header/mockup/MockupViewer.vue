<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-window">
        <div class="modal-header">
          <span class="title">{{ title }}</span>
          <button class="close-btn" @click="close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
  
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id" 
            :class="['tab-btn', { active: activeTab === tab.id }]" 
            @click="setActiveTab(tab.id)"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            {{ tab.name }}
          </button>
        </div>
  
        <div class="tab-content">
          <div class="preview-tab" v-show="activeTab === 'preview'">
            <iframe 
              ref="previewFrame" 
              class="preview-iframe" 
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              src="about:blank"
              scrolling="no"
            ></iframe>
          </div>
  
          <div class="code-tab" v-show="activeTab === 'code'">
            <div class="code-editor">
              <textarea v-model="htmlCode" class="code-textarea" spellcheck="false" placeholder="HTML 코드를 입력하세요..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, nextTick } from 'vue'
  
  const props = defineProps({
    title: {
      type: String,
      default: 'HTML & CSS Live Viewer'
    },
    initialCode: {
      type: String,
      default: `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      padding: 20px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    h1 { 
      color: #2d3748; 
      font-size: 2rem;
      margin: 0 0 12px 0;
      font-weight: 700;
    }
    p { 
      color: #718096; 
      font-size: 1rem;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    button { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 8px; 
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    button:hover { 
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }
  </style>
  <title>Modern Sample</title>
  </head>
  <body>
    <div class="container">
      <h1>Hello World! 👋</h1>
      <p>실시간 HTML + CSS 미리보기입니다.<br>코드를 수정하면 즉시 반영됩니다.</p>
      <button onclick="alert('버튼이 클릭되었습니다!')">클릭해보세요</button>
    </div>
  </body>
  </html>`
    }
  })
  
  const emit = defineEmits(['close'])
  
  const visible = ref(true)
  const activeTab = ref('preview')
  const tabs = [
    { id: 'preview', name: 'Preview', icon: '✨' },
    { id: 'code', name: 'Code', icon: '💻' }
  ]
  
  const htmlCode = ref(props.initialCode)
  const previewFrame = ref(null)
  
  // iframe 문서 업데이트 함수 - 개선된 버전
  const updatePreview = async () => {
    if (!previewFrame.value) return
    
    try {
      const iframe = previewFrame.value
      const doc = iframe.contentDocument || iframe.contentWindow.document
      
      // 기존 내용 완전히 제거
      doc.documentElement.innerHTML = ''
      
      // 새로운 내용 작성
      doc.open()
      doc.write(htmlCode.value)
      doc.close()
      
      // iframe 내부 문서에 스크롤 방지 스타일 강제 적용
      setTimeout(() => {
        const style = doc.createElement('style')
        style.textContent = `
          html, body {
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `
        if (doc.head) {
          doc.head.appendChild(style)
        } else if (doc.body) {
          doc.body.insertBefore(style, doc.body.firstChild)
        }
      }, 10)
      
    } catch (error) {
      console.warn('Preview update failed:', error)
    }
  }
  
  // iframe 로드 완료 시 내용 업데이트
  const handleIframeLoad = () => {
    updatePreview()
  }
  
  onMounted(async () => {
    await nextTick()
    if (previewFrame.value) {
      // iframe 로드 이벤트 리스너 추가
      previewFrame.value.addEventListener('load', handleIframeLoad)
    }
    updatePreview()
  })
  
  // htmlCode 변경 시 debounce 적용하여 성능 개선
  let updateTimeout = null
  watch(htmlCode, () => {
    if (updateTimeout) {
      clearTimeout(updateTimeout)
    }
    updateTimeout = setTimeout(() => {
      if (activeTab.value === 'preview') {
        updatePreview()
      }
    }, 300)
  }, { flush: 'post' })
  
  const setActiveTab = async (tabId) => {
    const prevTab = activeTab.value
    activeTab.value = tabId
    
    // Preview 탭으로 전환 시 iframe 강제 새로고침
    if (tabId === 'preview' && prevTab !== 'preview') {
      await nextTick()
      
      // iframe src를 빈 값으로 설정했다가 다시 about:blank로 설정하여 강제 새로고침
      const iframe = previewFrame.value
      if (iframe) {
        iframe.src = 'about:blank'
        await nextTick()
        
        // 짧은 지연 후 내용 업데이트
        setTimeout(() => {
          updatePreview()
        }, 50)
      }
    }
  }
  
  const close = () => {
    visible.value = false
    emit('close')
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .modal-window {
    width: 95vw;
    max-width: 1400px;
    height: 90vh;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .modal-header {
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    font-weight: 600;
    font-size: 18px;
    letter-spacing: -0.5px;
  }
  
  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  .tabs {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .tab-btn {
    flex: 1;
    padding: 16px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    color: #64748b;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
  }
  
  .tab-btn:hover {
    background: #e2e8f0;
    color: #475569;
  }
  
  .tab-btn.active {
    background: white;
    color: #1e293b;
  }
  
  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px 3px 0 0;
  }
  
  .tab-icon {
    font-size: 16px;
  }
  
  .tab-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    background: #f8fafc;
  }
  
  .preview-tab {
    flex: 1;
    padding: 16px;
  }
  
  .preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .code-tab {
    flex: 1;
    display: flex;
    padding: 16px;
  }
  
  .code-editor {
    flex: 1;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .code-textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', Consolas, monospace;
    font-size: 14px;
    line-height: 1.6;
    padding: 24px;
    box-sizing: border-box;
    background: #1e1e2e;
    color: #cdd6f4;
    outline: none;
    overflow: auto;
    tab-size: 2;
  }
  
  .code-textarea::placeholder {
    color: #6c7086;
  }
  
  .code-textarea::-webkit-scrollbar {
    width: 8px;
  }
  
  .code-textarea::-webkit-scrollbar-track {
    background: #313244;
  }
  
  .code-textarea::-webkit-scrollbar-thumb {
    background: #585b70;
    border-radius: 4px;
  }
  
  .code-textarea::-webkit-scrollbar-thumb:hover {
    background: #6c7086;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .modal-window {
      width: 98vw;
      height: 95vh;
      border-radius: 12px;
    }
    
    .modal-header {
      height: 56px;
      padding: 0 16px;
      font-size: 16px;
    }
    
    .tab-btn {
      padding: 12px 16px;
      font-size: 14px;
    }
    
    .preview-tab,
    .code-tab {
      padding: 12px;
    }
    
    .code-textarea {
      padding: 16px;
      font-size: 13px;
    }
  }
  </style>