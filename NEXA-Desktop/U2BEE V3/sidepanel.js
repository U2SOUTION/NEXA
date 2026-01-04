// Side Panel 모드 전환 및 기본 기능
(function () {
    "use strict";

    const iframe = document.getElementById("u2bee-iframe");
    const loading = document.getElementById("loading");

    // 대기 중인 메시지 큐
    const pendingMessages = [];

    // 이 Extension 인스턴스가 속한 창의 windowId (초기화 시 설정)
    let myWindowId = null;

    // 자신이 속한 창의 windowId 초기화
    async function initializeMyWindowId() {
        try {
            // 방법 1: currentWindow를 사용하여 자신이 속한 창의 활성 탭 조회
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0) {
                const newWindowId = tabs[0].windowId;
                if (newWindowId !== myWindowId) {
                    myWindowId = newWindowId;
                    console.log("[Side Panel] 내 창 ID 초기화/업데이트:", myWindowId, "탭 ID:", tabs[0].id);
                }
                return myWindowId;
            }

            // 방법 2: currentWindow가 실패하면 windows.getCurrent() 시도
            try {
                const currentWindow = await chrome.windows.getCurrent();
                if (currentWindow && currentWindow.id) {
                    const newWindowId = currentWindow.id;
                    if (newWindowId !== myWindowId) {
                        myWindowId = newWindowId;
                        console.log("[Side Panel] 내 창 ID 초기화/업데이트 (getCurrent 사용):", myWindowId);
                    }
                    return myWindowId;
                }
            } catch (getCurrentError) {
                console.warn("[Side Panel] windows.getCurrent() 실패:", getCurrentError);
            }

            console.warn("[Side Panel] 활성 탭을 찾을 수 없음");
        } catch (error) {
            console.error("[Side Panel] 창 ID 초기화 실패:", error);
        }
        return null;
    }

    // 초기화 시 창 ID 설정
    initializeMyWindowId();

    // DOM 로드 완료 시 최신 페이지 정보 요청
    window.addEventListener("DOMContentLoaded", async () => {
        // 창 ID 초기화
        const initializedWindowId = await initializeMyWindowId();
        if (!initializedWindowId) {
            setTimeout(async () => {
                await initializeMyWindowId();
            }, 500);
        }

        // 최신 페이지 정보 요청
        setTimeout(async () => {
            try {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                const currentTab = tabs[0];
                if (currentTab && currentTab.id) {
                    const windowIdToUse = myWindowId || currentTab.windowId;
                    chrome.runtime
                        .sendMessage({
                            type: "REQUEST_CURRENT_PAGE_INFO",
                            tabId: currentTab.id,
                            windowId: windowIdToUse,
                        })
                        .catch((error) => {
                            console.error("[Side Panel] 페이지 정보 요청 실패:", error);
                        });
                }
            } catch (error) {
                console.error("[Side Panel] 탭 정보 조회 실패:", error);
            }
        }, 500);
    });

    // 탭 활성화 변경 감지 (사이드 패널이 열려있는 동안 탭이 변경될 수 있음)
    chrome.tabs.onActivated.addListener((activeInfo) => {
        // 자신의 창인지 확인
        if (myWindowId && activeInfo.windowId === myWindowId) {
            setTimeout(() => {
                chrome.runtime
                    .sendMessage({
                        type: "REQUEST_CURRENT_PAGE_INFO",
                        tabId: activeInfo.tabId,
                        windowId: activeInfo.windowId,
                    })
                    .catch((error) => {
                        console.error("[Side Panel] 탭 변경 후 페이지 정보 요청 실패:", error);
                    });
            }, 200);
        } else if (!myWindowId) {
            initializeMyWindowId().then((newWindowId) => {
                if (newWindowId === activeInfo.windowId) {
                    setTimeout(() => {
                        chrome.runtime
                            .sendMessage({
                                type: "REQUEST_CURRENT_PAGE_INFO",
                                tabId: activeInfo.tabId,
                                windowId: activeInfo.windowId,
                            })
                            .catch((error) => {
                                console.error("[Side Panel] 탭 변경 후 페이지 정보 요청 실패:", error);
                            });
                    }, 200);
                }
            });
        }
    });

    // iframe으로 메시지 전달 (큐에 추가)
    function queueMessage(message) {
        pendingMessages.push(message);
        sendPendingMessages();
    }

    // 대기 중인 메시지 전송 시도
    function sendPendingMessages() {
        if (iframe.contentWindow && pendingMessages.length > 0) {
            pendingMessages.forEach((msg) => {
                try {
                    iframe.contentWindow.postMessage(msg, "*");
                } catch (error) {
                    console.error("[Side Panel] 큐 메시지 전송 실패:", error);
                }
            });
            pendingMessages.length = 0; // 큐 비우기
        }
    }

    // iframe 로드 완료 시 로딩 숨기기 및 현재 페이지 정보 요청
    iframe.addEventListener("load", async () => {
        loading.style.display = "none";

        // 창 ID가 아직 설정되지 않았으면 다시 시도
        const initializedWindowId = await initializeMyWindowId();
        if (!initializedWindowId) {
            setTimeout(async () => {
                await initializeMyWindowId();
            }, 500);
        }

        // iframe 로드 완료 후 대기 중인 메시지 전송 (fallback)
        setTimeout(() => {
            sendPendingMessages();
        }, 2000);

        // 현재 활성 탭의 페이지 정보 요청
        setTimeout(async () => {
            try {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                const currentTab = tabs[0];
                if (currentTab && currentTab.id) {
                    const windowIdToUse = myWindowId || currentTab.windowId;
                    chrome.runtime
                        .sendMessage({
                            type: "REQUEST_CURRENT_PAGE_INFO",
                            tabId: currentTab.id,
                            windowId: windowIdToUse,
                        })
                        .catch((error) => {
                            console.error("[Side Panel] 현재 페이지 정보 요청 실패:", error);
                        });
                }
            } catch (error) {
                console.error("[Side Panel] 탭 정보 조회 실패:", error);
            }
        }, 300);
    });

    // iframe 로드 에러 처리
    iframe.addEventListener("error", () => {
        loading.textContent = "로드 실패: NEXA Platform이 실행 중인지 확인하세요 (http://localhost:9000)";
        loading.style.display = "block";
    });

    // 주의: Chrome Extension API에서 사이드 패널을 프로그래밍 방식으로 닫는 공식 API가 없으므로,
    // 사이드 패널에서 팝업으로 전환하는 기능은 제공하지 않습니다.
    // 사용자는 확장 프로그램 아이콘을 클릭하여 팝업을 열 수 있습니다.

    // 창 포커스 변경 감지 (사이드 패널이 열려있는 동안 창이 변경될 수 있음)
    chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            return; // 모든 창이 포커스를 잃은 경우
        }

        initializeMyWindowId().then((newWindowId) => {
            if (newWindowId && newWindowId !== myWindowId) {
                chrome.tabs.query({ active: true, windowId: newWindowId }).then((tabs) => {
                    if (tabs.length > 0) {
                        const currentTab = tabs[0];
                        chrome.runtime
                            .sendMessage({
                                type: "REQUEST_CURRENT_PAGE_INFO",
                                tabId: currentTab.id,
                                windowId: newWindowId,
                            })
                            .catch((error) => {
                                console.error("[Side Panel] 페이지 정보 요청 실패:", error);
                            });
                    }
                });
            }
        });
    });

    // 설정 저장/로드 핸들러
    async function handleSettingsMessage(event) {
        if (!event.data || (event.data.type !== "SAVE_SETTINGS" && event.data.type !== "REQUEST_SETTINGS")) {
            return false; // 다른 메시지는 처리하지 않음
        }

        try {
            if (event.data.type === "REQUEST_SETTINGS") {
                // 설정 로드 요청
                const settings = await chrome.storage.local.get(["u2bee_ui_mode", "u2bee_injectUI_enabled"]);
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        {
                            type: "SETTINGS_RESPONSE",
                            data: {
                                u2bee_ui_mode: settings.u2bee_ui_mode || "sidepanel",
                                u2bee_injectUI_enabled: settings.u2bee_injectUI_enabled || false,
                            },
                        },
                        "*"
                    );
                }
            } else if (event.data.type === "SAVE_SETTINGS") {
                // 설정 저장 요청
                const settingsToSave = {};
                if (event.data.data.u2bee_ui_mode !== undefined) {
                    settingsToSave.u2bee_ui_mode = event.data.data.u2bee_ui_mode;
                }
                if (event.data.data.u2bee_injectUI_enabled !== undefined) {
                    settingsToSave.u2bee_injectUI_enabled = event.data.data.u2bee_injectUI_enabled;
                }
                await chrome.storage.local.set(settingsToSave);
                console.log("[Side Panel] 설정 저장 완료:", settingsToSave);

                // 설정 저장 후 현재 활성 탭에 메시지 전송하여 즉시 반영
                try {
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs.length > 0 && tabs[0].id) {
                        chrome.tabs
                            .sendMessage(tabs[0].id, {
                                type: "SETTINGS_UPDATED",
                                data: settingsToSave,
                            })
                            .catch((error) => {
                                // Content Script가 없거나 로드되지 않은 경우 무시 (정상)
                                console.log("[Side Panel] 설정 변경 알림 전송 실패 (정상일 수 있음):", error.message);
                            });
                    }
                } catch (error) {
                    console.error("[Side Panel] 설정 변경 알림 전송 실패:", error);
                }
            }
            return true;
        } catch (error) {
            console.error("[Side Panel] 설정 처리 실패:", error);
            return false;
        }
    }

    // iframe에서 오는 메시지 수신 (준비 완료)
    window.addEventListener("message", async (event) => {
        // 보안: localhost에서만 메시지 수신
        if (!event.origin.includes("localhost") && !event.origin.includes("127.0.0.1")) {
            return;
        }

        // 설정 관련 메시지 처리
        if (event.data && (event.data.type === "SAVE_SETTINGS" || event.data.type === "REQUEST_SETTINGS")) {
            await handleSettingsMessage(event);
            return;
        }

        if (event.data && event.data.type === "IFRAME_READY") {
            // iframe이 준비 완료되었다는 메시지 수신
            sendPendingMessages();

            // 창 ID가 아직 설정되지 않았으면 다시 시도
            const initializedWindowId = await initializeMyWindowId();
            if (!initializedWindowId) {
                setTimeout(async () => {
                    await initializeMyWindowId();
                }, 500);
            }

            // 현재 페이지 정보 즉시 요청
            setTimeout(() => {
                chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                    const currentTab = tabs[0];
                    if (currentTab && currentTab.id) {
                        const windowIdToUse = myWindowId || currentTab.windowId;
                        chrome.runtime
                            .sendMessage({
                                type: "REQUEST_CURRENT_PAGE_INFO",
                                tabId: currentTab.id,
                                windowId: windowIdToUse,
                            })
                            .catch((error) => {
                                console.error("[Side Panel] 페이지 정보 요청 실패:", error);
                            });
                    }
                });
            }, 300);
        }
    });

    // 탭 전환 함수
    function switchTab(tabName) {
        if (iframe.contentWindow) {
            try {
                iframe.contentWindow.postMessage(
                    {
                        type: "EXTENSION_MESSAGE",
                        data: {
                            type: "SWITCH_TAB",
                            tabName: tabName,
                        },
                    },
                    "*"
                );
            } catch (error) {
                console.error("[Side Panel] 탭 전환 메시지 전송 실패:", error);
            }
        }
    }

    // Extension 메시지 수신 및 iframe으로 전달
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // 탭 전환 메시지 처리
        if (message.type === "SWITCH_TAB") {
            const messageWindowId = message.windowId;

            // 자신의 창 메시지인지 확인
            if (!myWindowId) {
                initializeMyWindowId().then((initializedWindowId) => {
                    if (initializedWindowId === messageWindowId) {
                        switchTab(message.tabName);
                    }
                });
            } else if (messageWindowId === myWindowId) {
                switchTab(message.tabName);
            }

            sendResponse({ success: true });
            return true;
        }

        // PAGE_INFO_UPDATE 메시지인 경우, 자신의 창에 해당하는 메시지만 처리
        if (message.type === "PAGE_INFO_UPDATE" && message.data) {
            const messageWindowId = message.data.windowId;

            // 메시지에 창 ID가 없으면 무시 (필터링 불가)
            if (!messageWindowId) {
                sendResponse({ success: true });
                return true;
            }

            // 창 ID가 설정되지 않았으면 즉시 설정 시도
            if (!myWindowId) {
                initializeMyWindowId().then((initializedWindowId) => {
                    if (!initializedWindowId || messageWindowId !== initializedWindowId) {
                        return;
                    }
                    processPageInfoMessage(message);
                });
            } else {
                // 자신의 창 메시지인지 확인
                if (messageWindowId !== myWindowId) {
                    sendResponse({ success: true });
                    return true;
                }
                processPageInfoMessage(message);
            }
        } else {
            // 다른 타입의 메시지는 그대로 처리
            processPageInfoMessage(message);
        }

        sendResponse({ success: true });
        return true;
    });

    // 페이지 정보 메시지 처리 함수
    function processPageInfoMessage(message) {
        // iframe으로 메시지 전달 함수
        function sendToIframe() {
            if (iframe.contentWindow) {
                const messageToSend = {
                    type: "EXTENSION_MESSAGE",
                    data: message.type === "PAGE_INFO_UPDATE" ? { type: "PAGE_INFO_UPDATE", data: message.data } : message.data || message,
                };

                iframe.contentWindow.postMessage(messageToSend, "*");
                return true;
            }
            return false;
        }

        // 즉시 전달 시도
        if (!sendToIframe()) {
            // iframe이 아직 로드되지 않았으면 큐에 추가
            const messageToSend = {
                type: "EXTENSION_MESSAGE",
                data: message.type === "PAGE_INFO_UPDATE" ? { type: "PAGE_INFO_UPDATE", data: message.data } : message.data || message,
            };
            queueMessage(messageToSend);
        }
    }
})();
