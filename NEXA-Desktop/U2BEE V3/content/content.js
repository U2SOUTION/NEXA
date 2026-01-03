// Content Script - 타이틀 및 URL 수집
(function () {
    'use strict';

    // 특수 스키마 URL에서 실행되지 않도록 필터링
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('chrome://') || 
        currentUrl.startsWith('chrome-extension://') ||
        currentUrl.startsWith('moz-extension://') ||
        currentUrl.startsWith('edge://')) {
        return; // Content Script 실행 중단
    }

    // 현재 페이지 정보 수집
    function collectPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            timestamp: Date.now()
        };
    }

    // Background로 페이지 정보 전송
    function sendPageInfoToBackground() {
        const pageInfo = collectPageInfo();

        chrome.runtime.sendMessage({
            type: 'PAGE_INFO_UPDATE',
            data: pageInfo
        }).catch((error) => {
            console.error('[Content Script] Background로 메시지 전송 실패:', error);
        });
    }

    // 초기 로드 시 정보 전송
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(sendPageInfoToBackground, 500); // DOM 로드 후 약간의 지연
        });
    } else {
        setTimeout(sendPageInfoToBackground, 500);
    }

    // URL 변경 감지 (SPA 페이지 대응)
    let lastUrl = window.location.href;
    let lastTitle = document.title;

    // MutationObserver로 타이틀 변경 감지
    const titleObserver = new MutationObserver(() => {
        if (document.title !== lastTitle) {
            lastTitle = document.title;
            sendPageInfoToBackground();
        }
    });

    // 타이틀 요소 감시 시작
    const titleElement = document.querySelector('title');
    if (titleElement) {
        titleObserver.observe(titleElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // URL 변경 감지 (popstate, pushstate)
    window.addEventListener('popstate', () => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            sendPageInfoToBackground();
        }
    });

    // History API 감지
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(history, arguments);
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            setTimeout(sendPageInfoToBackground, 100);
        }
    };

    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            setTimeout(sendPageInfoToBackground, 100);
        }
    };

    // Extension 메시지 수신
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case 'COLLECT_CONTENT':
                // 콘텐츠 수집 요청
                const pageInfo = collectPageInfo();
                sendResponse({ success: true, data: pageInfo });
                return true; // 비동기 응답
            case 'REQUEST_PAGE_INFO':
                // 페이지 정보 요청
                sendResponse({ success: true, data: collectPageInfo() });
                return true;
            default:
                sendResponse({ success: false, error: 'Unknown message type' });
        }
    });
})();
