// Background Service Worker - 메시지 라우팅 및 기본 기능
(function () {
    'use strict';

    console.log('U2BEE V3 Background Service Worker 시작');

    // Extension 설치 시
    chrome.runtime.onInstalled.addListener((details) => {
        console.log('U2BEE V3 설치됨:', details.reason);
        
        if (details.reason === 'install') {
            // 초기 설정
            chrome.storage.local.set({
                'u2bee_version': '3.0.0',
                'u2bee_installed_at': Date.now()
            });
        }
    });

    // 메시지 라우팅 (향후 확장용)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Background 메시지 수신:', message);

        // 메시지 타입에 따른 라우팅
        switch (message.type) {
            case 'CONTENT_TO_PLATFORM':
                // Content Script → Platform 통신 (향후 구현)
                forwardToPlatform(message);
                break;
            case 'PLATFORM_TO_CONTENT':
                // Platform → Content Script 통신 (향후 구현)
                forwardToContent(message);
                break;
            default:
                console.warn('알 수 없는 메시지 타입:', message.type);
        }

        return true; // 비동기 응답 허용
    });

    // Platform으로 메시지 전달 (향후 구현)
    function forwardToPlatform(message) {
        // HTTP/WebSocket 통신 구현 예정
        console.log('Platform으로 전달 (구현 예정):', message);
    }

    // Content Script로 메시지 전달 (향후 구현)
    function forwardToContent(message) {
        chrome.tabs.sendMessage(message.tabId, message.data).catch((error) => {
            console.error('Content Script로 메시지 전달 실패:', error);
        });
    }

    // 탭 업데이트 감지 (YouTube 페이지 감지용)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url) {
            // YouTube URL 감지 (향후 Content Script 활성화용)
            if (tab.url.includes('youtube.com')) {
                console.log('YouTube 페이지 감지:', tab.url);
                // 향후 Content Script 활성화 로직 추가 예정
            }
        }
    });
})();
