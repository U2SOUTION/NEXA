// Popup 모드 전환 및 기본 기능
(function () {
    "use strict";

    const iframe = document.getElementById("u2bee-iframe");

    // iframe 로드 완료 시 보더 제거
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
    });

    // 초기 로드 시에도 iframe 크기 설정
    window.addEventListener("DOMContentLoaded", () => {
        console.log("DOM 로드 완료");
        // 초기 크기 강제 설정
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
    });

    // iframe 로드 에러 처리
    iframe.addEventListener("error", () => {
        console.error("iframe 로드 실패: NEXA Platform이 실행 중인지 확인하세요 (http://localhost:9000)");
    });

    // iframe에서 오는 메시지 수신 (팝업/사이드 패널 전환)
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
        }
    });

    // Extension 메시지 수신 (향후 확장용)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Popup 메시지 수신:", message);
        // 향후 구현 예정
        return true;
    });
})();
