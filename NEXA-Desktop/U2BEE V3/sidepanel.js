// Side Panel 모드 전환 및 기본 기능
(function () {
    "use strict";

    const iframe = document.getElementById("u2bee-iframe");
    const loading = document.getElementById("loading");

    // iframe 로드 완료 시 로딩 숨기기
    iframe.addEventListener("load", () => {
        loading.style.display = "none";
        console.log("U2BEE UI 로드 완료");
    });

    // iframe 로드 에러 처리
    iframe.addEventListener("error", () => {
        loading.textContent = "로드 실패: NEXA Platform이 실행 중인지 확인하세요 (http://localhost:9000)";
        loading.style.display = "block";
    });

    // 주의: Chrome Extension API에서 사이드 패널을 프로그래밍 방식으로 닫는 공식 API가 없으므로,
    // 사이드 패널에서 팝업으로 전환하는 기능은 제공하지 않습니다.
    // 사용자는 확장 프로그램 아이콘을 클릭하여 팝업을 열 수 있습니다.

    // Extension 메시지 수신 (향후 확장용)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Side Panel 메시지 수신:", message);
        // 향후 구현 예정
        return true;
    });
})();
