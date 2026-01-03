// Popup 모드 전환 및 기본 기능
(function () {
    "use strict";

    const iframe = document.getElementById("u2bee-iframe");

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
                    console.log("[Popup] 내 창 ID 초기화/업데이트:", myWindowId, "탭 ID:", tabs[0].id);
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
                        console.log("[Popup] 내 창 ID 초기화/업데이트 (getCurrent 사용):", myWindowId);
                    }
                    return myWindowId;
                }
            } catch (getCurrentError) {
                console.warn("[Popup] windows.getCurrent() 실패:", getCurrentError);
            }

            console.warn("[Popup] 활성 탭을 찾을 수 없음");
        } catch (error) {
            console.error("[Popup] 창 ID 초기화 실패:", error);
        }
        return null;
    }

    // 초기화 시 창 ID 설정
    initializeMyWindowId();

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
                    console.error("[Popup] 큐 메시지 전송 실패:", error);
                }
            });
            pendingMessages.length = 0; // 큐 비우기
        }
    }

    // iframe 로드 완료 시 보더 제거 및 대기 중인 메시지 전송
    iframe.addEventListener("load", () => {
        // iframe 보더 완전 제거
        iframe.style.border = "none";
        iframe.style.outline = "none";
        iframe.style.boxShadow = "none";

        // iframe이 body를 완전히 덮는지 확인 및 강제 설정
        if (iframe.offsetWidth < document.body.offsetWidth || iframe.offsetHeight < document.body.offsetHeight) {
            iframe.style.width = document.body.offsetWidth + "px";
            iframe.style.height = document.body.offsetHeight + "px";
            iframe.style.position = "absolute";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
        }

        // iframe 로드 완료 후 대기 중인 메시지 전송 (fallback)
        setTimeout(() => {
            sendPendingMessages();
        }, 2000);
    });

    // 초기 로드 시에도 iframe 크기 설정 및 현재 페이지 정보 요청
    window.addEventListener("DOMContentLoaded", async () => {
        // 초기 크기 강제 설정
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.right = "0";
        iframe.style.bottom = "0";

        // 창 ID가 아직 설정되지 않았으면 다시 시도
        const initializedWindowId = await initializeMyWindowId();
        if (!initializedWindowId) {
            setTimeout(async () => {
                await initializeMyWindowId();
            }, 500);
        }

        // 현재 활성 탭의 페이지 정보 요청
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            if (currentTab && currentTab.id) {
                chrome.runtime
                    .sendMessage({
                        type: "REQUEST_CURRENT_PAGE_INFO",
                        tabId: currentTab.id,
                        windowId: myWindowId || currentTab.windowId,
                    })
                    .catch((error) => {
                        console.error("[Popup] 현재 페이지 정보 요청 실패:", error);
                    });
            }
        } catch (error) {
            console.error("[Popup] 탭 정보 조회 실패:", error);
        }
    });

    // iframe 로드 에러 처리
    iframe.addEventListener("error", () => {
        console.error("iframe 로드 실패: NEXA Platform이 실행 중인지 확인하세요 (http://localhost:9000)");
    });

    // iframe에서 오는 메시지 수신 (팝업/사이드 패널 전환 및 준비 완료)
    window.addEventListener("message", async (event) => {
        // 보안: localhost에서만 메시지 수신
        if (!event.origin.includes("localhost") && !event.origin.includes("127.0.0.1")) {
            return;
        }

        if (event.data && event.data.type === "TOGGLE_EXTENSION_MODE") {
            try {
                // 사이드 패널로 전환
                await chrome.sidePanel.open({ windowId: myWindowId || (await chrome.windows.getCurrent()).id });
                // Popup 닫기
                window.close();
            } catch (error) {
                console.error("Side Panel 열기 실패:", error);
                alert("Side Panel을 열 수 없습니다. Chrome 114 이상이 필요합니다.");
            }
        } else if (event.data && event.data.type === "IFRAME_READY") {
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
            chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                const currentTab = tabs[0];
                if (currentTab && currentTab.id) {
                    chrome.runtime
                        .sendMessage({
                            type: "REQUEST_CURRENT_PAGE_INFO",
                            tabId: currentTab.id,
                            windowId: myWindowId || currentTab.windowId,
                        })
                        .catch((error) => {
                            console.error("[Popup] 페이지 정보 요청 실패:", error);
                        });
                }
            });
        }
    });

    // Extension 메시지 수신 및 iframe으로 전달
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

                try {
                    iframe.contentWindow.postMessage(messageToSend, "*");
                    return true;
                } catch (error) {
                    console.error("[Popup] postMessage 전송 실패:", error);
                }
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
