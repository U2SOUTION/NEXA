// Content Script - 타이틀 및 URL 수집
(function () {
    "use strict";

    // 특수 스키마 URL에서 실행되지 않도록 필터링
    const currentUrl = window.location.href;
    if (currentUrl.startsWith("chrome://") || currentUrl.startsWith("chrome-extension://") || currentUrl.startsWith("moz-extension://") || currentUrl.startsWith("edge://")) {
        return; // Content Script 실행 중단
    }

    // 마지막 전송 정보 추적 (중복 방지)
    let lastSentInfo = {
        url: "",
        title: "",
    };
    let lastSendTime = 0;
    const MIN_SEND_INTERVAL = 100; // 최소 전송 간격 (ms)

    // 페이지 타입 감지
    function getPageType() {
        const url = window.location.href;
        if (url.includes("youtube.com")) {
            if (url.includes("/shorts/")) {
                return "SHORTS";
            }
            if (url.includes("/watch")) {
                return "YOUTUBE";
            }
        }
        return "WEBSITE";
    }

    // 타이틀 정제 (앞의 숫자 제거, - YouTube 제거)
    function cleanTitle(title) {
        return title
            .replace(/^\([0-9]+\)\s*/, "") // 앞의 숫자 제거
            .replace(/\s*-\s*YouTube$/, "") // 끝의 "- YouTube" 제거
            .trim();
    }

    // 채널명 포맷팅 (@ 추가)
    function formatChannelName(name) {
        if (!name) return undefined;
        try {
            const decodedName = decodeURIComponent(name);
            return decodedName.startsWith("@") ? decodedName : `@${decodedName}`;
        } catch {
            return name.startsWith("@") ? name : `@${name}`;
        }
    }

    // YouTube 상세 정보 수집
    async function collectYoutubeDetails() {
        const videoId = new URL(window.location.href).searchParams.get("v") || undefined;

        // 채널 정보 수집 (요소 로드 대기)
        let channelElement = document.querySelector("#owner #channel-name a");
        let retryCount = 0;
        while ((!channelElement || document.title === "YouTube") && retryCount < 10) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            channelElement = document.querySelector("#owner #channel-name a");
            retryCount++;
        }

        const channelUrl = channelElement?.getAttribute("href") || "";
        const channelName = channelElement?.textContent?.trim();
        const channelIdentifier = channelUrl.split("/@")[1]?.split("/")[0] || channelName;

        // 썸네일 URL 생성
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;

        // JSON-LD 구조화 데이터에서 추가 정보 추출 시도
        let description, publishedAt, duration, viewCount, likeCount;
        try {
            const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
            if (jsonLdScript) {
                const jsonLdData = JSON.parse(jsonLdScript.textContent);
                if (Array.isArray(jsonLdData)) {
                    const videoData = jsonLdData.find((item) => item["@type"] === "VideoObject");
                    if (videoData) {
                        description = videoData.description;
                        publishedAt = videoData.uploadDate;
                        duration = videoData.duration;
                    }
                } else if (jsonLdData["@type"] === "VideoObject") {
                    description = jsonLdData.description;
                    publishedAt = jsonLdData.uploadDate;
                    duration = jsonLdData.duration;
                }
            }
        } catch (e) {
            // JSON-LD 파싱 실패 시 무시
        }

        // 플랫폼 내부 데이터에서 통계 정보 추출 시도
        try {
            if (window.ytInitialPlayerResponse?.videoDetails) {
                const details = window.ytInitialPlayerResponse.videoDetails;
                viewCount = details.viewCount ? parseInt(details.viewCount) : undefined;
                duration = duration || details.lengthSeconds ? `PT${details.lengthSeconds}S` : duration;
            }
        } catch (e) {
            // 내부 데이터 접근 실패 시 무시
        }

        return {
            videoId,
            channelName: formatChannelName(channelIdentifier),
            channelId: channelUrl.split("/channel/")[1]?.split("/")[0] || channelUrl.split("/c/")[1]?.split("/")[0] || undefined,
            thumbnail: thumbnailUrl,
            description,
            publishedAt,
            duration,
            viewCount,
            likeCount,
        };
    }

    // YouTube Shorts 상세 정보 수집
    async function collectShortsDetails() {
        const videoId = window.location.pathname.split("/shorts/")[1];

        // 활성 쇼츠의 채널 정보 수집
        let activeContainer = document.querySelector("ytd-reel-video-renderer[is-active] .ytReelChannelBarViewModelChannelName a");
        let retryCount = 0;
        while (!activeContainer && retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            activeContainer = document.querySelector("ytd-reel-video-renderer[is-active] .ytReelChannelBarViewModelChannelName a");
            retryCount++;
        }

        const channelUrl = activeContainer?.getAttribute("href") || "";
        const channelIdentifier = channelUrl.split("/@")[1]?.split("/")[0];

        // 썸네일 URL 생성
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;

        // 플랫폼 내부 데이터에서 정보 추출 시도
        let description, viewCount, likeCount;
        try {
            if (window.ytInitialData) {
                const reelData = window.ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.richGridRenderer?.contents?.[0]?.reelItemRenderer;
                if (reelData) {
                    viewCount = reelData.viewCountText?.simpleText ? parseInt(reelData.viewCountText.simpleText.replace(/[^0-9]/g, "")) : undefined;
                }
            }
        } catch (e) {
            // 내부 데이터 접근 실패 시 무시
        }

        return {
            videoId,
            channelName: formatChannelName(channelIdentifier),
            channelId: channelUrl.split("/channel/")[1]?.split("/")[0] || channelUrl.split("/c/")[1]?.split("/")[0] || undefined,
            thumbnail: thumbnailUrl,
            description,
            viewCount,
            likeCount,
        };
    }

    // 웹사이트 상세 정보 수집
    async function collectWebDetails() {
        // og:site_name
        const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute("content");

        // Schema.org 구조화 데이터 확인
        let publisherFromSchema = null;
        let description = null;
        let image = null;
        let author = null;
        let publishedAt = null;

        try {
            const schemaPublisher = document.querySelector('script[type="application/ld+json"]')?.textContent;
            if (schemaPublisher) {
                const schema = JSON.parse(schemaPublisher);
                if (Array.isArray(schema)) {
                    const item = schema.find((i) => i["@type"] === "Article" || i["@type"] === "WebPage" || i["@type"] === "BlogPosting");
                    if (item) {
                        publisherFromSchema = item.publisher?.name || item.author?.name;
                        description = description || item.description;
                        image = image || item.image;
                        author = author || item.author?.name;
                        publishedAt = publishedAt || item.datePublished;
                    }
                } else if (schema["@type"]) {
                    publisherFromSchema = schema.publisher?.name || schema.author?.name;
                    description = description || schema.description;
                    image = image || schema.image;
                    author = author || schema.author?.name;
                    publishedAt = publishedAt || schema.datePublished;
                }
            }
        } catch (e) {
            // Schema.org 파싱 실패 시 무시
        }

        // 메타 태그에서 정보 추출
        const metaPublisher = document.querySelector('meta[name="publisher"]')?.getAttribute("content") || document.querySelector('meta[name="author"]')?.getAttribute("content");
        description = description || document.querySelector('meta[name="description"]')?.getAttribute("content") || document.querySelector('meta[property="og:description"]')?.getAttribute("content");
        image = image || document.querySelector('meta[property="og:image"]')?.getAttribute("content") || document.querySelector('meta[property="twitter:image"]')?.getAttribute("content");
        author = author || document.querySelector('meta[name="author"]')?.getAttribute("content");
        publishedAt = publishedAt || document.querySelector('meta[property="article:published_time"]')?.getAttribute("content");

        // 호스트명을 기본값으로 사용
        const hostname = new URL(window.location.href).hostname;

        return {
            publisher: ogSiteName || publisherFromSchema || metaPublisher || hostname,
            description,
            image,
            author,
            publishedAt,
        };
    }

    // 현재 페이지 정보 수집 (상세 정보 포함)
    async function collectPageInfo() {
        const pageType = getPageType();
        const baseInfo = {
            url: window.location.href,
            title: cleanTitle(document.title),
            pageType: pageType,
            timestamp: Date.now(),
        };

        // 페이지 타입별 상세 정보 수집
        try {
            if (pageType === "YOUTUBE") {
                const youtubeDetails = await collectYoutubeDetails();
                return { ...baseInfo, ...youtubeDetails };
            } else if (pageType === "SHORTS") {
                const shortsDetails = await collectShortsDetails();
                return { ...baseInfo, ...shortsDetails };
            } else {
                const webDetails = await collectWebDetails();
                return { ...baseInfo, ...webDetails };
            }
        } catch (error) {
            console.error("[Content Script] 상세 정보 수집 실패:", error);
            // 실패 시 기본 정보만 반환
            return baseInfo;
        }
    }

    // Background로 페이지 정보 전송 (중복 방지)
    async function sendPageInfoToBackground() {
        const pageInfo = await collectPageInfo();
        const now = Date.now();

        // 중복 체크: 같은 URL과 타이틀이면 무시
        if (lastSentInfo.url === pageInfo.url && lastSentInfo.title === pageInfo.title) {
            return;
        }

        // 너무 빠른 연속 전송 방지
        if (now - lastSendTime < MIN_SEND_INTERVAL) {
            return;
        }

        // 전송 정보 업데이트
        lastSentInfo = {
            url: pageInfo.url,
            title: pageInfo.title,
        };
        lastSendTime = now;

        chrome.runtime
            .sendMessage({
                type: "PAGE_INFO_UPDATE",
                data: pageInfo,
            })
            .catch((error) => {
                console.error("[Content Script] Background로 메시지 전송 실패:", error);
            });
    }

    // YouTube 네비게이션 이벤트 감지
    document.addEventListener("yt-navigate-start", () => {
        // 네비게이션 시작 시 처리 (필요시)
    });

    document.addEventListener("yt-navigate-finish", () => {
        // 네비게이션 완료 시 페이지 정보 수집
        setTimeout(sendPageInfoToBackground, 500);
    });

    // 초기 로드 시 정보 전송
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(sendPageInfoToBackground, 500); // DOM 로드 후 약간의 지연
        });
    } else {
        setTimeout(sendPageInfoToBackground, 500);
    }

    // URL 변경 감지 (SPA 페이지 대응)
    let lastUrl = window.location.href;
    let lastTitle = document.title;

    // MutationObserver로 타이틀 변경 감지
    const titleObserver = new MutationObserver(() => {
        if (document.title !== lastTitle) {
            lastTitle = document.title;
            sendPageInfoToBackground();
        }
    });

    // 타이틀 요소 감시 시작
    const titleElement = document.querySelector("title");
    if (titleElement) {
        titleObserver.observe(titleElement, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

    // Shorts 활성 쇼츠 변경 감지 (MutationObserver)
    let lastShortsVideoId = null;
    const shortsObserver = new MutationObserver(() => {
        if (getPageType() === "SHORTS") {
            const activeVideo = document.querySelector("ytd-reel-video-renderer[is-active]");
            if (activeVideo) {
                const videoId = activeVideo.getAttribute("video-id");
                if (videoId && videoId !== lastShortsVideoId) {
                    lastShortsVideoId = videoId;
                    sendPageInfoToBackground();
                }
            }
        }
    });

    // Shorts 감시 시작 (body 전체 감시)
    if (document.body) {
        shortsObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["is-active", "video-id"],
        });
    }

    // URL 변경 감지 (popstate, pushstate)
    window.addEventListener("popstate", () => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            sendPageInfoToBackground();
        }
    });

    // History API 감지
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
        originalPushState.apply(history, arguments);
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            setTimeout(sendPageInfoToBackground, 100);
        }
    };

    history.replaceState = function () {
        originalReplaceState.apply(history, arguments);
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            setTimeout(sendPageInfoToBackground, 100);
        }
    };

    // Extension 메시지 수신
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case "COLLECT_CONTENT":
                // 콘텐츠 수집 요청
                collectPageInfo()
                    .then((pageInfo) => {
                        sendResponse({ success: true, data: pageInfo });
                    })
                    .catch((error) => {
                        sendResponse({ success: false, error: error.message });
                    });
                return true; // 비동기 응답
            case "REQUEST_PAGE_INFO":
                // 페이지 정보 요청
                collectPageInfo()
                    .then((pageInfo) => {
                        sendResponse({ success: true, data: pageInfo });
                    })
                    .catch((error) => {
                        sendResponse({ success: false, error: error.message });
                    });
                return true;
            default:
                sendResponse({ success: false, error: "Unknown message type" });
        }
    });
})();
