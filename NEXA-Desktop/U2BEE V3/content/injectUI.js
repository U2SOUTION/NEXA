// Content Script - 사이트에 UI 주입 (옵션 2)
// 기능 플래그 기반으로 안전하게 구현
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

    // iframe으로부터 오는 메시지 수신 (탭 클릭 시 사이드 패널 열기)
    window.addEventListener("message", async (event) => {
        // 보안: localhost에서만 메시지 수신
        if (!event.origin.includes("localhost") && !event.origin.includes("127.0.0.1")) {
            return;
        }

        if (event.data && event.data.type === "OPEN_SIDE_PANEL") {
            const tabName = event.data.tabName;

            try {
                // Content Script에서는 chrome.tabs API를 사용할 수 없으므로 Background Script로 요청
                chrome.runtime.sendMessage({
                    type: "OPEN_SIDE_PANEL",
                    tabName: tabName,
                }).catch((error) => {
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

            // 3. 스타일 주입
            const style = document.createElement("style");
            style.textContent = `
                :host {
                    display: block;
                }
                .u2bee-sidebar-container {
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                    border-left: 1px solid #e0e0e0;
                    pointer-events: auto;
                    overflow-y: auto;
                    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
                }
                .u2bee-sidebar-container.dark {
                    background: #1e1e1e;
                    border-left-color: #333333;
                }
                .u2bee-sidebar-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    display: block;
                }
                @media (max-width: 768px) {
                    .u2bee-sidebar-container {
                        width: 100vw;
                        border-left: none;
                        border-top: 1px solid #e0e0e0;
                    }
                }
            `;
            shadow.appendChild(style);

            // 4. 컨테이너 생성
            const container = document.createElement("div");
            container.className = "u2bee-sidebar-container";
            shadow.appendChild(container);

            // 5. iframe 생성 및 삽입
            const iframe = document.createElement("iframe");
            iframe.className = "u2bee-sidebar-iframe";
            iframe.src = "http://localhost:9000/#/extension?extension=u2bee&mode=injected";
            iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox");
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
