// Side Panel 모드 전환 및 기본 기능
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

    // 팝업으로 전환 (새 창으로 열기)
    modeToggle.addEventListener('click', async () => {
        try {
            // Extension 팝업 열기
            await chrome.action.openPopup();
        } catch (error) {
            console.error('Popup 열기 실패:', error);
            // 팝업을 직접 열 수 없는 경우 새 창으로 열기
            chrome.windows.create({
                url: chrome.runtime.getURL('popup.html'),
                type: 'popup',
                width: 800,
                height: 600
            });
        }
    });

    // Extension 메시지 수신 (향후 확장용)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Side Panel 메시지 수신:', message);
        // 향후 구현 예정
        return true;
    });
})();
