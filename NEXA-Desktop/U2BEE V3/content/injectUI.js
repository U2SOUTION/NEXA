// Content Script - 사이트에 UI 주입 (옵션 2)
// 기능 플래그 기반으로 안전하게 구현
//
// ============================================================================
// ⚠️ 알려진 문제점 및 향후 계획
// ============================================================================
//
// 【현재 문제점】
// 1. Content Script에서 주입하는 iframe의 localhost 권한 요청 문제
//    - 이 파일(injectUI.js)은 Content Script로 실행되며, 웹 페이지에
//      U2BEE UI를 주입하기 위해 Shadow DOM 내부에 iframe을 삽입합니다.
//    - 웹 페이지 컨텍스트에서 localhost iframe을 삽입할 때
//      Chrome의 Private Network Access (PNA) 정책에 의해 각 사이트마다
//      "로컬 네트워크에서 원하는 기기를 찾아 연결" 권한을 요청합니다.
//    - Extension의 host_permissions로는 이 문제를 우회할 수 없습니다.
//    - 권한을 거부하면 주입된 iframe이 로드되지 않고 빈 창이 표시될 수 있습니다.
//    - 참고: Popup/Side Panel의 iframe은 Extension 페이지 컨텍스트에서 실행되므로
//            이 문제의 영향을 받지 않습니다.
//
// 2. 사이트별 권한 관리
//    - 각 웹 사이트 도메인별로 권한이 개별 관리됩니다.
//    - 한 번 허용해도 다른 사이트에서는 다시 요청됩니다.
//    - Extension 권한과 웹 페이지 권한은 별개로 동작합니다.
//
// 【해결 방안】
// 외부 서버(공인 도메인)로 이동 시 문제 해결:
//    - HTTPS 공인 도메인 사용 시 localhost 권한 요청이 발생하지 않습니다.
//    - 예: http://localhost:9000 → https://u2bee.nexa.com
//    - manifest.json의 host_permissions에 공인 도메인 추가 필요
//    - Content Script에서 주입하는 iframe src를 공인 도메인으로 변경 필요
//    - (Popup/Side Panel iframe도 함께 변경 필요)
//
// 【향후 계획】
// 1. 단기: 현재 기능 유지 (개발 및 테스트 계속 진행)
// 2. 중기: 외부 서버 배포 준비
//    - 도메인 및 호스팅 환경 구축
//    - HTTPS 인증서 설정
//    - 환경 변수 기반 URL 관리 구조 도입
// 3. 장기: 외부 서버로 마이그레이션
//    - localhost → 공인 도메인 전환
//    - manifest.json 및 모든 iframe src 업데이트
//    - 권한 요청 문제 완전 해결
//
// 【참고 사항】
// - 이 기능은 개발 중이며, 외부 서버 배포 후 완전히 해결될 예정입니다.
// - 현재는 사용자가 권한을 허용해야 Content Script에서 주입하는 iframe이 정상 작동합니다.
// - Popup/Side Panel의 iframe은 Extension 페이지 컨텍스트에서 실행되므로 이 문제의 영향을 받지 않습니다.
// - Inject UI 기능을 사용하지 않으면(Popup/Side Panel만 사용) 이 문제가 발생하지 않습니다.
//
// ============================================================================

(function () {
    "use strict";

    // 특수 스키마 URL에서 실행되지 않도록 필터링
    const currentUrl = window.location.href;
    if (currentUrl.startsWith("chrome://") || currentUrl.startsWith("chrome-extension://") || currentUrl.startsWith("moz-extension://") || currentUrl.startsWith("edge://")) {
        return; // Content Script 실행 중단
    }

    // UI 삽입 상태 추적
    let sidebarHost = null;
    let isInitialized = false;
    let injectedIframe = null; // iframe 참조 저장

    // 설정 확인 및 UI 초기화 함수
    function checkAndInitUI() {
        chrome.storage.local.get(["u2bee_injectUI_enabled", "u2bee_ui_mode"], (result) => {
            const enabled = result.u2bee_injectUI_enabled ?? false;
            const uiMode = result.u2bee_ui_mode ?? "sidepanel"; // 'sidepanel' | 'injected'

            if (!enabled || uiMode !== "injected") {
                // 비활성화된 경우 기존 UI 제거
                if (sidebarHost && sidebarHost.parentNode) {
                    sidebarHost.remove();
                    sidebarHost = null;
                    injectedIframe = null;
                    // 토글 버튼도 제거
                    const toggleBtn = document.getElementById("u2bee-sidebar-toggle");
                    if (toggleBtn) {
                        toggleBtn.remove();
                    }
                    // 메인 콘텐츠 영역 복원
                    restoreMainContent();
                }
                // 기능이 비활성화되어 있거나 사이드 패널 모드
                isInitialized = true;
                return; // 즉시 종료 - 기존 기능에 영향 없음
            }

            // 이미 삽입되어 있으면 재초기화하지 않음
            if (sidebarHost && sidebarHost.parentNode) {
                return;
            }

            // DOM 로드 대기
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => {
                    setTimeout(() => initInjectUI(), 500);
                });
            } else {
                setTimeout(() => initInjectUI(), 500);
            }
        });
    }

    // 초기 실행
    checkAndInitUI();

    // 설정 변경 감지 (실시간 반영)
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && (changes.u2bee_injectUI_enabled || changes.u2bee_ui_mode)) {
            checkAndInitUI();
        }
    });

    // Background에서 직접 메시지 수신 (즉시 반영)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "SETTINGS_UPDATED") {
            checkAndInitUI();
            sendResponse({ success: true });
        }
        return true;
    });

    // Content Script에서 주입한 iframe으로부터 오는 메시지 수신 (탭 클릭 시 사이드 패널 열기)
    // 이 이벤트 리스너는 웹 페이지 컨텍스트에서 실행되며, Shadow DOM 내부의 iframe과 통신합니다.
    window.addEventListener("message", async (event) => {
        // 보안: localhost에서만 메시지 수신
        // TODO: 외부 서버 배포 시 공인 도메인으로 변경 필요
        // 예: event.origin.includes("u2bee.nexa.com")
        // 참고: Popup/Side Panel의 메시지 수신 로직과는 별개입니다.
        if (!event.origin.includes("localhost") && !event.origin.includes("127.0.0.1")) {
            return;
        }

        if (event.data && event.data.type === "OPEN_SIDE_PANEL") {
            const tabName = event.data.tabName;

            try {
                // Content Script에서는 chrome.tabs API를 사용할 수 없으므로 Background Script로 요청
                chrome.runtime
                    .sendMessage({
                        type: "OPEN_SIDE_PANEL",
                        tabName: tabName,
                    })
                    .catch((error) => {
                        console.error("[U2BEE InjectUI] 사이드 패널 열기 요청 실패:", error);
                    });
            } catch (error) {
                console.error("[U2BEE InjectUI] 사이드 패널 열기 실패:", error);
            }
        }
    });

    // UI 주입 초기화
    async function initInjectUI() {
        try {
            // 사이트 정책 확인
            const canInject = await checkSitePolicy();
            if (!canInject) {
                return;
            }

            // 레이아웃 분석
            const layout = analyzeSiteLayout();
            if (!layout) {
                return;
            }

            // 사이드바 삽입
            await injectSidebar(layout);
        } catch (error) {
            console.error("[U2BEE InjectUI] 초기화 실패:", error);
            // 실패해도 기존 기능 유지
        }
    }

    // 사이트 정책 확인
    async function checkSitePolicy() {
        try {
            // CSP 확인
            const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            if (metaCSP && metaCSP.content.includes("frame-src 'none'")) {
                return false;
            }

            // Shadow DOM 지원 확인
            if (!document.body || !document.body.attachShadow) {
                return false;
            }

            return true;
        } catch (error) {
            console.warn("[U2BEE InjectUI] 사이트 정책 확인 실패:", error);
            return false;
        }
    }

    // 사이트 레이아웃 분석
    function analyzeSiteLayout() {
        const hostname = window.location.hostname;

        // YouTube
        if (hostname.includes("youtube.com")) {
            return {
                type: "youtube",
                sidebarWidth: "80px", // 탭만 보이도록 좁게 설정
                sidebarPosition: "right",
                mainContentSelectors: ["#primary", "#contents", 'ytd-watch-flexy[role="main"]', "#page-manager > ytd-browse"],
            };
        }

        // 일반 웹사이트
        return {
            type: "generic",
            sidebarWidth: "80px", // 탭만 보이도록 좁게 설정
            sidebarPosition: "right",
            mainContentSelectors: ["main", ".main-content", "#main", "#content", ".content", "article"],
        };
    }

    // 메인 콘텐츠 원본 스타일 저장
    let mainContentElement = null;
    let originalMainContentStyles = {};

    // 메인 콘텐츠 복원 함수
    function restoreMainContent() {
        if (mainContentElement && originalMainContentStyles.width !== undefined) {
            mainContentElement.style.width = originalMainContentStyles.width || "";
            mainContentElement.style.marginRight = originalMainContentStyles.marginRight || "";
            mainContentElement = null;
            originalMainContentStyles = {};
        }
    }

    // 사이드바 삽입
    async function injectSidebar(layout) {
        try {
            // 이미 삽입되어 있는지 확인
            const existingHost = document.getElementById("u2bee-sidebar-host");
            if (existingHost) {
                sidebarHost = existingHost;
                return;
            }

            // 1. Shadow DOM 호스트 생성
            const host = document.createElement("div");
            host.id = "u2bee-sidebar-host";
            host.setAttribute("data-u2bee-injected", "true");
            sidebarHost = host; // 전역 변수에 저장
            host.style.cssText = `
                position: fixed;
                top: 0;
                ${layout.sidebarPosition}: 0;
                width: ${layout.sidebarWidth};
                height: 100vh;
                z-index: 999999;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            `;

            // 2. Shadow DOM 생성
            const shadow = host.attachShadow({ mode: "closed" });

            // 3. 스타일 주입 - 완전히 투명하게
            const style = document.createElement("style");
            style.textContent = `
                :host {
                    display: block;
                    background: transparent !important;
                }
                .u2bee-sidebar-container {
                    width: 100%;
                    height: 100%;
                    background: transparent !important;
                    border: none !important;
                    pointer-events: auto;
                    overflow: visible !important;
                    box-shadow: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .u2bee-sidebar-iframe {
                    width: 100%;
                    height: 100%;
                    border: none !important;
                    display: block;
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            `;
            shadow.appendChild(style);

            // 4. 컨테이너 생성
            const container = document.createElement("div");
            container.className = "u2bee-sidebar-container";
            shadow.appendChild(container);

            // 5. Content Script에서 웹 페이지에 주입할 iframe 생성 및 삽입
            //    이 iframe은 Shadow DOM 내부에 삽입되어 웹 페이지에 U2BEE UI를 표시합니다.
            //    TODO: 외부 서버 배포 시 localhost를 공인 도메인으로 변경 필요
            //    예: "http://localhost:9000" → "https://u2bee.nexa.com"
            //    참고: Popup/Side Panel의 iframe과는 별개로 관리됩니다.
            const iframe = document.createElement("iframe");
            iframe.className = "u2bee-sidebar-iframe";
            iframe.src = "http://localhost:9000/#/extension?extension=u2bee&mode=injected";
            iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox");
            iframe.setAttribute("allowtransparency", "true");
            iframe.style.cssText = `
                background: transparent !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            container.appendChild(iframe);
            injectedIframe = iframe; // 전역 변수에 저장

            // 6. DOM에 삽입
            document.body.appendChild(host);
            sidebarHost = host; // 전역 변수에 저장

            // 7. 메인 콘텐츠 영역 조정 제거 (탭만 보이므로 불필요)
            // adjustMainContent(layout); // 주석 처리

            // 8. 토글 버튼 제거 (항상 탭이 보여야 하므로)
            // addToggleButton(host, layout); // 주석 처리
        } catch (error) {
            console.error("[U2BEE InjectUI] 사이드바 삽입 실패:", error);
            throw error;
        }
    }
})();
