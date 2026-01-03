// Background Service Worker - 메시지 라우팅 및 기본 기능
(function () {
    'use strict';


    // Extension 설치 시
    chrome.runtime.onInstalled.addListener((details) => {
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

    // 탭 정보를 Extension 프레임으로 전달하는 공통 함수
    function sendPageInfoToExtension(pageInfo, tabId, windowId) {
        if (!windowId) {
            console.warn('[Background] windowId가 없어 Extension으로 메시지 전달 불가:', {
                tabId,
                pageInfo
            });
            return;
        }

        const messageData = {
            ...pageInfo,
            tabId: tabId,
            windowId: windowId
        };

        // Popup/Side Panel로 전달 (모든 인스턴스에 브로드캐스트, 각 인스턴스에서 창 ID로 필터링)
        chrome.runtime.sendMessage({
            type: 'PAGE_INFO_UPDATE',
            data: messageData
        }).catch((error) => {
            // Popup/Side Panel이 열려있지 않으면 무시 (정상)
        });
    }

    // 활성 탭의 페이지 정보를 조회하여 Extension 프레임으로 전달
    function requestAndSendActiveTabInfo(tabId, windowId) {
        if (!tabId) {
            // tabId가 없으면 windowId에 해당하는 창의 활성 탭 조회
            // windowId가 없으면 현재 포커스된 창의 활성 탭 조회
            const queryOptions = windowId 
                ? { active: true, windowId: windowId }
                : { active: true, currentWindow: true };
            
            chrome.tabs.query(queryOptions).then((tabs) => {
                if (tabs.length > 0) {
                    requestAndSendActiveTabInfo(tabs[0].id, tabs[0].windowId);
                }
            }).catch((error) => {
                console.error('[Background] 활성 탭 조회 실패:', error);
            });
            return;
        }

        // Content Script에 페이지 정보 요청
        chrome.tabs.sendMessage(tabId, {
            type: 'REQUEST_PAGE_INFO'
        }).then((response) => {
            if (response && response.success && response.data) {
                sendPageInfoToExtension(response.data, tabId, windowId);
            }
        }).catch((error) => {
            // Content Script가 없으면 프로그래밍 방식으로 주입 시도
            chrome.tabs.get(tabId).then((tab) => {
                if (!tab || !tab.url) {
                    console.error('[Background] 탭 정보 조회 실패: 탭이 없거나 URL이 없음');
                    return;
                }

                // 특수 스키마는 제외
                if (tab.url.startsWith('chrome://') || 
                    tab.url.startsWith('chrome-extension://') ||
                    tab.url.startsWith('edge://')) {
                    return;
                }

                // Content Script를 프로그래밍 방식으로 주입 시도
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content/content.js']
                }).then(() => {
                    // 주입 후 약간의 지연을 두고 다시 요청
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tabId, {
                            type: 'REQUEST_PAGE_INFO'
                        }).then((response) => {
                            if (response && response.success && response.data) {
                                sendPageInfoToExtension(response.data, tabId, windowId);
                            }
                        }).catch((retryError) => {
                            // 그래도 실패하면 탭 정보 직접 조회
                            const pageInfo = {
                                url: tab.url,
                                title: tab.title || '제목 없음',
                                timestamp: Date.now()
                            };
                            sendPageInfoToExtension(pageInfo, tabId, windowId || tab.windowId);
                        });
                    }, 300);
                }).catch((injectError) => {
                    // 주입 실패 시 탭 정보 직접 조회
                    const pageInfo = {
                        url: tab.url,
                        title: tab.title || '제목 없음',
                        timestamp: Date.now()
                    };
                    sendPageInfoToExtension(pageInfo, tabId, windowId || tab.windowId);
                });
            }).catch((error) => {
                console.error('[Background] 탭 정보 조회 실패:', error);
            });
        });
    }

    // 메시지 라우팅
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // 메시지 타입에 따른 라우팅
        switch (message.type) {
            case 'PAGE_INFO_UPDATE':
                // Content Script에서 페이지 정보 업데이트 수신
                const sourceTabId = sender.tab?.id;
                const sourceWindowId = sender.tab?.windowId;
                
                // 해당 창의 활성 탭인지 확인 (sourceWindowId를 사용하여 특정 창의 활성 탭만 확인)
                if (!sourceWindowId) {
                    sendResponse({ success: true });
                    return true;
                }

                chrome.tabs.query({ active: true, windowId: sourceWindowId }).then((activeTabs) => {
                    const isActiveTab = activeTabs.some(tab => tab.id === sourceTabId);
                    
                    if (!isActiveTab) {
                        sendResponse({ success: true });
                        return;
                    }
                    
                    // 활성 탭인 경우에만 Platform으로 전달
                    forwardToPlatform({
                        type: 'PAGE_INFO_UPDATE',
                        data: {
                            ...message.data,
                            tabId: sourceTabId,
                            windowId: sourceWindowId
                        }
                    });

                    // Popup/Side Panel로 메시지 전달 (활성 탭만)
                    sendPageInfoToExtension(message.data, sourceTabId, sourceWindowId);
                }).catch((error) => {
                    console.error('[Background] 활성 탭 확인 실패:', error);
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
                const targetTabId = message.tabId || null;
                const targetWindowId = message.windowId || null;
                
                requestAndSendActiveTabInfo(targetTabId, targetWindowId);
                
                sendResponse({ success: true });
                return true;

            default:
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

    // 탭 업데이트 감지 (활성 탭만 처리)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && tab.windowId) {
            // 해당 창의 활성 탭인지 확인 (tab.windowId를 사용하여 특정 창의 활성 탭만 확인)
            chrome.tabs.query({ active: true, windowId: tab.windowId }).then((activeTabs) => {
                const isActiveTab = activeTabs.some(activeTab => activeTab.id === tabId);
                
                if (!isActiveTab) {
                    return; // 비활성 탭은 무시
                }
                
                // 활성 탭의 페이지 로드 완료 시 Content Script에 정보 요청
                if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                    chrome.tabs.sendMessage(tabId, {
                        type: 'REQUEST_PAGE_INFO'
                    }).then((response) => {
                        if (response && response.success && response.data) {
                            sendPageInfoToExtension(response.data, tabId, tab.windowId);
                        }
                    }).catch((error) => {
                        // Content Script가 없으면 프로그래밍 방식으로 주입 시도
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['content/content.js']
                        }).then(() => {
                            // 주입 후 약간의 지연을 두고 다시 요청
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tabId, {
                                    type: 'REQUEST_PAGE_INFO'
                                }).then((response) => {
                                    if (response && response.success && response.data) {
                                        sendPageInfoToExtension(response.data, tabId, tab.windowId);
                                    }
                                }).catch((retryError) => {
                                    // 그래도 실패하면 탭 정보 직접 조회
                                    if (tab.url && tab.title) {
                                        const pageInfo = {
                                            url: tab.url,
                                            title: tab.title || '제목 없음',
                                            timestamp: Date.now()
                                        };
                                        sendPageInfoToExtension(pageInfo, tabId, tab.windowId);
                                    }
                                });
                            }, 300);
                        }).catch((injectError) => {
                            // 주입 실패 시 탭 정보 직접 조회
                            if (tab.url && tab.title) {
                                const pageInfo = {
                                    url: tab.url,
                                    title: tab.title || '제목 없음',
                                    timestamp: Date.now()
                                };
                                sendPageInfoToExtension(pageInfo, tabId, tab.windowId);
                            }
                        });
                    });
                }
            }).catch((error) => {
                console.error('[Background] 활성 탭 확인 실패:', error);
            });
        }
    });

    // 탭 활성화 변경 감지 (다른 탭으로 전환 시)
    chrome.tabs.onActivated.addListener((activeInfo) => {
        // 새로 활성화된 탭의 정보 요청 및 전송
        requestAndSendActiveTabInfo(activeInfo.tabId, activeInfo.windowId);
    });

    // 창 포커스 변경 감지 (다른 브라우저 창으로 전환 시)
    chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            return; // 모든 창이 포커스를 잃은 경우
        }
        
        // 포커스된 창의 활성 탭 정보 요청
        chrome.tabs.query({ active: true, windowId: windowId }).then((tabs) => {
            if (tabs.length > 0) {
                const activeTab = tabs[0];
                requestAndSendActiveTabInfo(activeTab.id, windowId);
            }
        }).catch((error) => {
            console.error('[Background] 활성 탭 조회 실패:', error);
        });
    });
})();
