// Popup 모드 전환 및 기본 기능
(function () {
    'use strict';

    const iframe = document.getElementById('u2bee-iframe');
    const loading = document.getElementById('loading');
    const modeToggle = document.getElementById('mode-toggle');

    // iframe 로드 완료 시 로딩 숨기기
    iframe.addEventListener('load', () => {
        loading.style.display = 'none';
        console.log('U2BEE UI 로드 완료');
    });

    // iframe 로드 에러 처리
    iframe.addEventListener('error', () => {
        loading.textContent = '로드 실패: NEXA Platform이 실행 중인지 확인하세요 (http://localhost:9000)';
        loading.style.display = 'block';
    });

    // 사이드 패널로 전환
    modeToggle.addEventListener('click', async () => {
        try {
            // Side Panel 열기
            await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
            // Popup 닫기
            window.close();
        } catch (error) {
            console.error('Side Panel 열기 실패:', error);
            alert('Side Panel을 열 수 없습니다. Chrome 114 이상이 필요합니다.');
        }
    });

    // Extension 메시지 수신 (향후 확장용)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Popup 메시지 수신:', message);
        // 향후 구현 예정
        return true;
    });
})();
