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

    // Platform(iframe)으로 메시지 전달
    function forwardToPlatform(message) {
        // 모든 탭에서 Platform iframe 찾기
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url && (tab.url.includes('localhost:9000') || tab.url.includes('127.0.0.1:9000'))) {
                    // Platform 페이지에 메시지 전송
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'EXTENSION_MESSAGE',
                        data: message.data
                    }).catch((error) => {
                        // Content Script가 없거나 로드되지 않은 경우 무시
                        console.log('[Background] Platform으로 메시지 전달 실패 (정상일 수 있음):', error.message);
                    });
                }
            });
        });

        // Popup/Side Panel의 iframe에도 메시지 전달 시도
        // postMessage를 통한 직접 통신은 popup.js/sidepanel.js에서 처리
    }

    // 메시지 라우팅
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('[Background] 메시지 수신:', message.type, message);

        // 메시지 타입에 따른 라우팅
        switch (message.type) {
            case 'PAGE_INFO_UPDATE':
                // Content Script에서 페이지 정보 업데이트 수신
                console.log('[Background] 페이지 정보 업데이트:', message.data);
                
                // Platform으로 전달
                forwardToPlatform({
                    type: 'PAGE_INFO_UPDATE',
                    data: {
                        ...message.data,
                        tabId: sender.tab?.id
                    }
                });

                // Popup/Side Panel로 메시지 전달 시도
                // Popup/Side Panel이 열려있을 때만 수신 가능
                chrome.runtime.sendMessage({
                    type: 'PAGE_INFO_UPDATE',
                    data: {
                        ...message.data,
                        tabId: sender.tab?.id
                    }
                }).catch((error) => {
                    // Popup/Side Panel이 열려있지 않으면 무시 (정상)
                    console.log('[Background] Extension 프레임으로 메시지 전달 실패 (정상일 수 있음):', error.message);
                });

                sendResponse({ success: true });
                return true;

            case 'CONTENT_TO_PLATFORM':
                // Content Script → Platform 통신
                forwardToPlatform(message);
                sendResponse({ success: true });
                return true;

            case 'PLATFORM_TO_CONTENT':
                // Platform → Content Script 통신
                forwardToContent(message);
                sendResponse({ success: true });
                return true;

            case 'REQUEST_CURRENT_PAGE_INFO':
                // Popup/Side Panel에서 현재 페이지 정보 요청
                console.log('[Background] 현재 페이지 정보 요청:', message.tabId);
                if (message.tabId) {
                    // Content Script에 페이지 정보 요청
                    chrome.tabs.sendMessage(message.tabId, {
                        type: 'REQUEST_PAGE_INFO'
                    }).then((response) => {
                        if (response && response.success && response.data) {
                            console.log('[Background] 페이지 정보 수신:', response.data);
                            // Popup/Side Panel로 전달
                            chrome.runtime.sendMessage({
                                type: 'PAGE_INFO_UPDATE',
                                data: response.data
                            }).catch((error) => {
                                console.log('[Background] Extension 프레임으로 메시지 전달 실패:', error.message);
                            });
                        }
                    }).catch((error) => {
                        console.log('[Background] Content Script로 메시지 전달 실패:', error.message);
                        // Content Script가 없으면 탭 정보 직접 조회
                        chrome.tabs.get(message.tabId).then((tab) => {
                            if (tab && tab.url && tab.title) {
                                const pageInfo = {
                                    url: tab.url,
                                    title: tab.title,
                                    timestamp: Date.now()
                                };
                                console.log('[Background] 탭 정보 직접 조회:', pageInfo);
                                chrome.runtime.sendMessage({
                                    type: 'PAGE_INFO_UPDATE',
                                    data: pageInfo
                                }).catch((error) => {
                                    console.log('[Background] Extension 프레임으로 메시지 전달 실패:', error.message);
                                });
                            }
                        }).catch((error) => {
                            console.error('[Background] 탭 정보 조회 실패:', error);
                        });
                    });
                }
                sendResponse({ success: true });
                return true;

            default:
                console.warn('[Background] 알 수 없는 메시지 타입:', message.type);
                sendResponse({ success: false, error: 'Unknown message type' });
        }
    });


    // Content Script로 메시지 전달
    function forwardToContent(message) {
        if (message.tabId) {
            chrome.tabs.sendMessage(message.tabId, message.data).catch((error) => {
                console.error('[Background] Content Script로 메시지 전달 실패:', error);
            });
        } else {
            console.warn('[Background] tabId가 없어 Content Script로 전달할 수 없음');
        }
    }

    // 탭 업데이트 감지
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url) {
            // 페이지 로드 완료 시 Content Script에 정보 요청
            if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                chrome.tabs.sendMessage(tabId, {
                    type: 'REQUEST_PAGE_INFO'
                }).catch((error) => {
                    // Content Script가 없는 페이지는 무시
                    console.log('[Background] Content Script 없음 (정상일 수 있음):', tab.url);
                });
            }
        }
    });
})();
