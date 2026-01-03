// Content Script - 기본 구조 (현재는 빈 스크립트)
(function () {
    'use strict';

    console.log('U2BEE V3 Content Script 로드됨');

    // 현재 페이지 URL 확인
    const currentUrl = window.location.href;
    console.log('현재 페이지:', currentUrl);

    // YouTube 페이지 감지
    if (currentUrl.includes('youtube.com')) {
        console.log('YouTube 페이지 감지됨');
        // 향후 정보 추출 로직 추가 예정
    }

    // Extension 메시지 수신 (향후 확장용)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Content Script 메시지 수신:', message);

        switch (message.type) {
            case 'COLLECT_CONTENT':
                // 콘텐츠 수집 요청 (향후 구현)
                collectContent().then((data) => {
                    sendResponse({ success: true, data });
                }).catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
                return true; // 비동기 응답
            default:
                console.warn('알 수 없는 메시지 타입:', message.type);
                sendResponse({ success: false, error: 'Unknown message type' });
        }
    });

    // 콘텐츠 수집 함수 (향후 구현)
    async function collectContent() {
        // 향후 구현 예정
        return {
            url: currentUrl,
            timestamp: Date.now()
        };
    }
})();
