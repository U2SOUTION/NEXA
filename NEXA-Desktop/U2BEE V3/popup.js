// Popup 모드 전환 및 기본 기능
(function () {
    "use strict";

    const iframe = document.getElementById("u2bee-iframe");

    // 대기 중인 메시지 큐
    const pendingMessages = [];

    // iframe으로 메시지 전달 (큐에 추가)
    function queueMessage(message) {
        pendingMessages.push(message);
        sendPendingMessages();
    }

    // 대기 중인 메시지 전송 시도
    function sendPendingMessages() {
        if (iframe.contentWindow && pendingMessages.length > 0) {
            console.log("[Popup] 대기 중인 메시지 전송:", pendingMessages.length);
            pendingMessages.forEach((msg) => {
                try {
                    iframe.contentWindow.postMessage(msg, "*");
                    console.log("[Popup] 큐 메시지 전송 완료:", msg);
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

        // 디버깅: 크기 확인
        console.log("U2BEE UI 로드 완료");
        console.log("iframe 크기:", iframe.offsetWidth, "x", iframe.offsetHeight);
        console.log("body 크기:", document.body.offsetWidth, "x", document.body.offsetHeight);
        console.log("html 크기:", document.documentElement.offsetWidth, "x", document.documentElement.offsetHeight);

        // iframe이 body를 완전히 덮는지 확인 및 강제 설정
        if (iframe.offsetWidth < document.body.offsetWidth || iframe.offsetHeight < document.body.offsetHeight) {
            console.warn("iframe이 body를 완전히 덮지 못함! 강제로 크기 설정");
            iframe.style.width = document.body.offsetWidth + "px";
            iframe.style.height = document.body.offsetHeight + "px";
            iframe.style.position = "absolute";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
        }

        // iframe 로드 완료 후 대기 중인 메시지 전송 (fallback)
        // 주로 IFRAME_READY 메시지로 처리되지만, 혹시 모를 경우를 대비한 fallback
        setTimeout(() => {
            console.log("[Popup] iframe 로드 완료 (fallback), 대기 중인 메시지 전송 시도");
            sendPendingMessages();
        }, 2000); // fallback 딜레이 (IFRAME_READY가 오지 않을 경우를 대비)
    });

    // 초기 로드 시에도 iframe 크기 설정 및 현재 페이지 정보 요청
    window.addEventListener("DOMContentLoaded", async () => {
        console.log("DOM 로드 완료");
        // 초기 크기 강제 설정
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.right = "0";
        iframe.style.bottom = "0";

        // 현재 활성 탭의 페이지 정보 요청
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            if (currentTab && currentTab.id) {
                console.log("[Popup] 현재 탭 정보 요청:", currentTab.url);
                // Background에 현재 탭 정보 요청
                chrome.runtime
                    .sendMessage({
                        type: "REQUEST_CURRENT_PAGE_INFO",
                        tabId: currentTab.id,
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
                await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
                // Popup 닫기
                window.close();
            } catch (error) {
                console.error("Side Panel 열기 실패:", error);
                alert("Side Panel을 열 수 없습니다. Chrome 114 이상이 필요합니다.");
            }
        } else if (event.data && event.data.type === "IFRAME_READY") {
            // iframe이 준비 완료되었다는 메시지 수신
            console.log("[Popup] iframe 준비 완료 메시지 수신, 대기 중인 메시지 전송");
            sendPendingMessages();

            // 현재 페이지 정보 즉시 요청
            chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                const currentTab = tabs[0];
                if (currentTab && currentTab.id) {
                    console.log("[Popup] iframe 준비 완료 후 페이지 정보 즉시 요청");
                    chrome.runtime
                        .sendMessage({
                            type: "REQUEST_CURRENT_PAGE_INFO",
                            tabId: currentTab.id,
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
        console.log("[Popup] Background 메시지 수신:", message);

        // iframe으로 메시지 전달 함수
        function sendToIframe() {
            if (iframe.contentWindow) {
                // 메시지 구조 확인 및 전달
                const messageToSend = {
                    type: "EXTENSION_MESSAGE",
                    data: message.type === "PAGE_INFO_UPDATE" ? { type: "PAGE_INFO_UPDATE", data: message.data } : message.data || message,
                };

                console.log("[Popup] iframe으로 메시지 전달:", messageToSend);
                console.log("[Popup] iframe src:", iframe.src);
                console.log("[Popup] iframe contentWindow:", iframe.contentWindow);
                console.log("[Popup] 현재 window.location.origin:", window.location.origin);

                try {
                    // targetOrigin을 "*"로 설정하여 모든 origin에서 수신 가능하도록 함
                    iframe.contentWindow.postMessage(
                        messageToSend,
                        "*" // 보안: 실제 배포 시에는 특정 origin으로 제한
                    );
                    console.log("[Popup] postMessage 전송 완료, 메시지:", JSON.stringify(messageToSend));
                } catch (error) {
                    console.error("[Popup] postMessage 전송 실패:", error);
                }
                return true;
            }
            return false;
        }

        // 즉시 전달 시도
        if (!sendToIframe()) {
            // iframe이 아직 로드되지 않았으면 큐에 추가
            console.warn("[Popup] iframe이 아직 로드되지 않음, 메시지를 큐에 추가");
            const messageToSend = {
                type: "EXTENSION_MESSAGE",
                data: message.type === "PAGE_INFO_UPDATE" ? { type: "PAGE_INFO_UPDATE", data: message.data } : message.data || message,
            };
            queueMessage(messageToSend);
        }

        sendResponse({ success: true });
        return true;
    });
})();
