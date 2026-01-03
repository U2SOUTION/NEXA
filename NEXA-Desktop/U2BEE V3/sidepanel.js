// Side Panel 모드 전환 및 기본 기능
(function () {
    "use strict";

    const iframe = document.getElementById("u2bee-iframe");
    const loading = document.getElementById("loading");

    // iframe 로드 완료 시 로딩 숨기기 및 현재 페이지 정보 요청
    iframe.addEventListener("load", async () => {
        loading.style.display = "none";
        console.log("U2BEE UI 로드 완료");

        // 현재 활성 탭의 페이지 정보 요청
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            if (currentTab && currentTab.id) {
                console.log("[Side Panel] 현재 탭 정보 요청:", currentTab.url);
                // Background에 현재 탭 정보 요청
                chrome.runtime.sendMessage({
                    type: 'REQUEST_CURRENT_PAGE_INFO',
                    tabId: currentTab.id
                }).catch((error) => {
                    console.error("[Side Panel] 현재 페이지 정보 요청 실패:", error);
                });
            }
        } catch (error) {
            console.error("[Side Panel] 탭 정보 조회 실패:", error);
        }
    });

    // iframe 로드 에러 처리
    iframe.addEventListener("error", () => {
        loading.textContent = "로드 실패: NEXA Platform이 실행 중인지 확인하세요 (http://localhost:9000)";
        loading.style.display = "block";
    });

    // 주의: Chrome Extension API에서 사이드 패널을 프로그래밍 방식으로 닫는 공식 API가 없으므로,
    // 사이드 패널에서 팝업으로 전환하는 기능은 제공하지 않습니다.
    // 사용자는 확장 프로그램 아이콘을 클릭하여 팝업을 열 수 있습니다.

    // Extension 메시지 수신 및 iframe으로 전달
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("[Side Panel] Background 메시지 수신:", message);

        // iframe으로 메시지 전달 함수
        function sendToIframe() {
            if (iframe.contentWindow) {
                // 메시지 구조 확인 및 전달
                const messageToSend = {
                    type: "EXTENSION_MESSAGE",
                    data: message.type === 'PAGE_INFO_UPDATE' 
                        ? { type: 'PAGE_INFO_UPDATE', data: message.data }
                        : (message.data || message)
                };
                
                console.log("[Side Panel] iframe으로 메시지 전달:", messageToSend);
                iframe.contentWindow.postMessage(
                    messageToSend,
                    "*" // 보안: 실제 배포 시에는 특정 origin으로 제한
                );
                return true;
            }
            return false;
        }

        // 즉시 전달 시도
        if (!sendToIframe()) {
            // iframe이 아직 로드되지 않았으면 로드 완료 후 전달
            console.warn("[Side Panel] iframe이 아직 로드되지 않음, 로드 대기 중...");
            iframe.addEventListener("load", () => {
                sendToIframe();
            }, { once: true });
        }

        sendResponse({ success: true });
        return true;
    });
})();
