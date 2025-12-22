import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * 웹뷰 제공자 - 플랫폼 연결용
 */
export class WebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "nexaExplorer.webview";

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
            enableCommandUris: true,
        };

        // 웹뷰가 항상 표시되도록 설정
        webviewView.show?.(true);

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // 웹뷰에서 메시지 수신
        webviewView.webview.onDidReceiveMessage(
            (message) => {
                switch (message.command) {
                    case "connect":
                        // 플랫폼 연결 로직
                        this._handleConnect(message.data);
                        break;
                    case "sendData":
                        // 데이터 전송
                        this._handleSendData(message.data);
                        break;
                    case "openBrowser":
                        // 브라우저에서 열기
                        vscode.env.openExternal(vscode.Uri.parse(message.url));
                        break;
                    case "test":
                        // 테스트 메시지
                        console.log("테스트 메시지 수신:", message.data);
                        vscode.window.showInformationMessage(`웹뷰에서 메시지 수신: ${message.data?.message || "테스트"}`);
                        break;
                    case "dataManagement":
                        console.log("데이터 관리 요청:", message.data);
                        vscode.window.showInformationMessage("데이터 관리 기능 호출됨");
                        break;
                    case "connection":
                        console.log("연결 설정 요청:", message.data);
                        vscode.window.showInformationMessage("연결 설정 기능 호출됨");
                        break;
                    case "settings":
                        console.log("설정 요청:", message.data);
                        vscode.window.showInformationMessage("설정 기능 호출됨");
                        break;
                }
            },
            undefined,
            []
        );
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // localhost 서버를 표시하기 위해 기본 iframe HTML 사용
        // 커스텀 HTML 파일은 주석 처리 (필요시 활성화)
        /*
        try {
            const htmlPath = path.join(this._extensionUri.fsPath, "webview", "index.html");
            if (fs.existsSync(htmlPath)) {
                let html = fs.readFileSync(htmlPath, "utf8");
                html = this._injectVSCodeAPI(html);
                return html;
            }
        } catch (error) {
            console.log("커스텀 HTML 파일 로드 실패, 기본 HTML 사용:", error);
        }
        */

        // 기본 HTML (localhost 서버를 iframe으로 표시)
        return `<!DOCTYPE html>
<html lang="ko">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*; style-src 'self' 'unsafe-inline' http://localhost:*; img-src 'self' data: http://localhost:* https:; font-src 'self' data: http://localhost:*; connect-src 'self' http://localhost:* https:; frame-src 'self' http://localhost:* https:;">
    <title>NEXA Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .header {
            padding: 8px 12px;
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-sideBar-border);
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .url-input {
            flex: 1;
            padding: 4px 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-size: 12px;
        }
        .button {
            padding: 4px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .iframe-container {
            flex: 1;
            overflow: hidden;
            position: relative;
            background-color: #ffffff;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }
        .error-message {
            padding: 20px;
            text-align: center;
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            margin: 20px;
            border-radius: 4px;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: var(--vscode-foreground);
            font-size: 14px;
        }
        .page-list-container {
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-sideBar-border);
            padding: 8px 12px;
            flex-shrink: 0;
        }
        .page-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
            color: var(--vscode-foreground);
        }
        .page-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .page-item {
            padding: 4px 10px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: background-color 0.2s;
        }
        .page-item:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
    </style>
</head>
<body>
    <div class="header">
        <input type="text" class="url-input" id="urlInput" value="http://localhost:9000/#/" placeholder="웹사이트 URL 입력">
        <button class="button" id="loadBtn">로드</button>
        <button class="button" id="openBtn">브라우저에서 열기</button>
    </div>
    <div class="page-list-container" id="pageListContainer" style="display: none;">
        <div class="page-list-header">
            <span>사용 중인 페이지:</span>
            <button class="button" id="closePageList" style="padding: 2px 8px; font-size: 11px;">닫기</button>
        </div>
        <div class="page-list" id="pageList"></div>
    </div>
    <div class="iframe-container">
        <div class="loading" id="loading">로딩 중...</div>
        <iframe id="webFrame" src="http://localhost:9000/#/" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation allow-modals allow-downloads"></iframe>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const urlInput = document.getElementById('urlInput');
        const loadBtn = document.getElementById('loadBtn');
        const openBtn = document.getElementById('openBtn');
        const webFrame = document.getElementById('webFrame');
        const loading = document.getElementById('loading');
        const pageListContainer = document.getElementById('pageListContainer');
        const pageList = document.getElementById('pageList');
        const closePageList = document.getElementById('closePageList');

        // 로드 버튼
        loadBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) {
                loading.style.display = 'block';
                try {
                    webFrame.src = url;
                } catch (error) {
                    loading.textContent = '로드 실패: ' + error.message;
                }
            }
        });

        // Enter 키로 로드
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadBtn.click();
            }
        });

        // 브라우저에서 열기
        openBtn.addEventListener('click', () => {
            const url = urlInput.value.trim() || 'http://localhost:9000/#/';
            vscode.postMessage({
                command: 'openBrowser',
                url: url
            });
        });

        // iframe 로드 완료
        webFrame.addEventListener('load', () => {
            loading.style.display = 'none';
            console.log('웹사이트 로드 완료');
            
            // iframe 내부의 링크 클릭을 가로채서 iframe 내부에서 처리
            try {
                const iframeDoc = webFrame.contentDocument || webFrame.contentWindow.document;
                if (iframeDoc) {
                    // 모든 링크에 대해 새 창으로 열리지 않도록 처리
                    const links = iframeDoc.querySelectorAll('a[target="_blank"], a[target="_new"]');
                    links.forEach(link => {
                        link.setAttribute('target', '_self');
                    });
                    
                    // 동적으로 추가되는 링크도 처리
                    const observer = new MutationObserver(() => {
                        const newLinks = iframeDoc.querySelectorAll('a[target="_blank"], a[target="_new"]');
                        newLinks.forEach(link => {
                            link.setAttribute('target', '_self');
                        });
                    });
                    
                    observer.observe(iframeDoc.body, {
                        childList: true,
                        subtree: true
                    });
                }
            } catch (e) {
                // CORS 제한으로 접근 불가능할 수 있음
                console.log('iframe 내부 접근 제한:', e);
            }
        });

        // 확장 프로그램에서 메시지 수신
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'fileSelected':
                    // 파일 선택 시 해당 페이지 리스트 표시
                    console.log('파일 선택됨:', message.data);
                    if (message.data.pages && message.data.pages.length > 0) {
                        // 페이지 리스트 표시
                        showPageList(message.data.pages);
                        // 첫 번째 페이지 자동 로드
                        loadPage(message.data.pages[0]);
                    }
                    break;
                case 'fileChanged':
                    // 파일 변경 시 새로고침
                    console.log('파일 변경됨:', message.data);
                    refreshIframe();
                    break;
                case 'loadPage':
                    // 특정 페이지 로드
                    loadPage(message.data.url);
                    break;
            }
        });

        // 페이지 리스트 닫기
        closePageList.addEventListener('click', () => {
            pageListContainer.style.display = 'none';
        });

        // 페이지 로드 함수
        function loadPage(url) {
            urlInput.value = url;
            loading.style.display = 'block';
            webFrame.src = url;
        }

        // 페이지 리스트 표시 함수
        function showPageList(pages) {
            pageList.innerHTML = '';
            pages.forEach(page => {
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                pageItem.textContent = page;
                pageItem.addEventListener('click', () => {
                    loadPage(page);
                });
                pageList.appendChild(pageItem);
            });
            pageListContainer.style.display = 'block';
        }

        // iframe 새로고침 함수
        function refreshIframe() {
            loading.style.display = 'block';
            webFrame.src = webFrame.src; // 현재 URL로 새로고침
        }

        webFrame.addEventListener('error', () => {
            loading.textContent = '로드 실패 (보안 제한 또는 네트워크 오류)';
            loading.style.display = 'block';
        });
    </script>
</body>
</html>`;
    }

    private _handleConnect(data: any) {
        console.log("플랫폼 연결 요청:", data);
        // 여기에 실제 플랫폼 연결 로직 구현
        // 예: HTTP 요청, WebSocket 연결 등

        // 연결 상태 업데이트
        if (this._view) {
            this._view.webview.postMessage({
                command: "updateStatus",
                connected: data.action === "connect",
            });
        }
    }

    private _handleSendData(data: any) {
        console.log("데이터 전송:", data);
        // 여기에 실제 데이터 전송 로직 구현
    }

    public sendMessageToWebview(message: any) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    /**
     * HTML에 VSCode API 스크립트 주입
     */
    private _injectVSCodeAPI(html: string): string {
        // 이미 vscode API가 있으면 주입하지 않음
        if (html.includes("acquireVsCodeApi")) {
            return html;
        }

        // </body> 태그 앞에 VSCode API 스크립트 추가
        const vscodeScript = `
    <script>
        const vscode = acquireVsCodeApi();
        
        // 확장 프로그램에서 메시지 수신
        window.addEventListener('message', event => {
            const message = event.data;
            if (typeof window.handleVSCodeMessage === 'function') {
                window.handleVSCodeMessage(message);
            }
        });
        
        // 전역 함수로 메시지 전송
        window.sendToVSCode = function(command, data) {
            vscode.postMessage({ command, data });
        };
    </script>
`;

        return html.replace("</body>", vscodeScript + "</body>");
    }
}
