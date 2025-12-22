import * as vscode from "vscode";
import * as path from "path";
import { AccordionTreeDataProvider, FileItem } from "./treeDataProvider";
import { WebviewProvider } from "./webviewProvider";

/**
 * NEXA 커스텀 탐색기 (아코디언 모드)
 * 기본 탐색기와 별도로 동작하는 커스텀 파일 탐색기
 */
export function activate(context: vscode.ExtensionContext) {
    console.log("NEXA Custom Explorer is now active!");

    // 웹뷰 제공자 등록
    const webviewProvider = new WebviewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(WebviewProvider.viewType, webviewProvider));

    // 파일 선택 감지 - 활성 에디터 변경 시
    const activeEditorWatcher = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document) {
            const filePath = editor.document.uri.fsPath;
            const fileName = path.basename(filePath);

            // 웹뷰에 파일 선택 알림
            webviewProvider.sendMessageToWebview({
                command: "fileSelected",
                data: {
                    filePath: filePath,
                    fileName: fileName,
                    // 여기에 해당 파일이 사용되는 페이지 리스트를 찾는 로직 추가 가능
                    pages: findPagesUsingFile(filePath), // 이 함수는 나중에 구현
                },
            });
        }
    });

    // 파일 내용 변경 감지
    const documentChangeWatcher = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document && vscode.window.activeTextEditor?.document === event.document) {
            const filePath = event.document.uri.fsPath;

            // 웹뷰에 파일 변경 알림 (새로고침 또는 실시간 업데이트)
            webviewProvider.sendMessageToWebview({
                command: "fileChanged",
                data: {
                    filePath: filePath,
                    content: event.document.getText(), // 필요시 내용 전송
                },
            });
        }
    });

    // 파일이 사용되는 페이지를 찾는 함수 (예시 - 실제 로직은 프로젝트에 맞게 구현)
    function findPagesUsingFile(filePath: string): string[] {
        // 예시: 파일명 기반으로 페이지 찾기
        // 실제로는 프로젝트 구조에 따라 다르게 구현
        const fileName = path.basename(filePath, path.extname(filePath));
        return [`http://localhost:9000/#/page/${fileName}`, `http://localhost:9000/#/view/${fileName}`];
    }

    // 웹뷰 표시 명령어
    const showWebviewCommand = vscode.commands.registerCommand("nexaExplorer.showWebview", () => {
        vscode.commands.executeCommand("workbench.view.extension.nexaExplorerContainer");
        // 웹뷰 뷰로 포커스 이동
        setTimeout(() => {
            vscode.commands.executeCommand("workbench.view.extension.nexaExplorer.webview");
        }, 100);
    });

    // TreeDataProvider 생성
    const treeDataProvider = new AccordionTreeDataProvider();

    // 커스텀 TreeView 생성 (체크박스 사용을 위해 canSelectMany: true)
    const treeView = vscode.window.createTreeView("nexaExplorer", {
        treeDataProvider: treeDataProvider,
        showCollapseAll: true,
        canSelectMany: true, // 체크박스 사용을 위해 true로 변경
    });

    // 폴더 확장 시 아코디언 모드 동작
    treeView.onDidExpandElement(async (e) => {
        const element = e.element;
        if (element.isFolder && element.resourceUri) {
            const folderPath = element.resourceUri.fsPath;
            const currentExpanded = treeDataProvider.getExpandedFolderPath();

            // 다른 폴더가 열려있으면 접기 (아코디언 모드)
            if (currentExpanded && currentExpanded !== folderPath) {
                // 다른 폴더 접기 - 먼저 모든 폴더 접기
                treeDataProvider.collapseAll();
                // refresh로 트리뷰 업데이트
                treeDataProvider.refresh();

                // 약간의 지연 후 새 폴더 확장 (트리뷰 업데이트 완료 대기)
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // 새 폴더 열기
            treeDataProvider.expandFolder(folderPath);
        }
    });

    // 폴더 접기 시 처리
    treeView.onDidCollapseElement((e) => {
        const element = e.element;
        if (element.isFolder && element.resourceUri) {
            const folderPath = element.resourceUri.fsPath;
            treeDataProvider.collapseFolder(folderPath);
        }
    });

    // 명령어: 폴더 확장 (아코디언 모드)
    const expandFolderCommand = vscode.commands.registerCommand("nexaExplorer.expandFolder", async (uri: vscode.Uri) => {
        if (uri) {
            const folderPath = uri.fsPath;
            treeDataProvider.expandFolder(folderPath);
            // 트리뷰에서 해당 항목 찾아서 확장
            await treeView.reveal(new FileItem(uri.fsPath.split(/[/\\]/).pop() || "", vscode.TreeItemCollapsibleState.Expanded, uri, true));
        }
    });

    // 명령어: 모든 폴더 접기
    const collapseAllCommand = vscode.commands.registerCommand("nexaExplorer.collapseAll", () => {
        treeDataProvider.collapseAll();
    });

    // 명령어: 새로고침
    const refreshCommand = vscode.commands.registerCommand("nexaExplorer.refresh", () => {
        treeDataProvider.refresh();
    });

    // 컨텍스트 메뉴: 폴더에서 우클릭 시 표시
    const openFolderCommand = vscode.commands.registerCommand("nexaExplorer.openFolder", async (item: FileItem) => {
        if (item.isFolder && item.resourceUri) {
            treeDataProvider.expandFolder(item.resourceUri.fsPath);
        }
    });

    // 체크박스 토글 명령어
    const toggleCheckboxCommand = vscode.commands.registerCommand("nexaExplorer.toggleCheckbox", async (item: FileItem) => {
        if (item.resourceUri) {
            const itemPath = item.resourceUri.fsPath;
            treeDataProvider.toggleCheckbox(itemPath);
            const isChecked = treeDataProvider.getCheckedItems().includes(itemPath);
            vscode.window.showInformationMessage(`${path.basename(itemPath)} ${isChecked ? "체크됨" : "체크 해제됨"}`);
        }
    });

    // 셀렉트 박스 값 선택 명령어
    const selectValueCommand = vscode.commands.registerCommand("nexaExplorer.selectValue", async (item: FileItem) => {
        if (item.resourceUri) {
            const itemPath = item.resourceUri.fsPath;
            const options = ["default", "option1", "option2", "option3"];
            const currentValue = treeDataProvider.getSelectValue(itemPath);

            const selected = await vscode.window.showQuickPick(options, {
                placeHolder: `값 선택 (현재: ${currentValue})`,
                canPickMany: false,
            });

            if (selected) {
                treeDataProvider.setSelectValue(itemPath, selected);
                vscode.window.showInformationMessage(`${path.basename(itemPath)}: ${selected} 선택됨`);
            }
        }
    });

    // 검색 명령어
    const searchCommand = vscode.commands.registerCommand("nexaExplorer.search", async () => {
        const currentQuery = treeDataProvider.getSearchQuery();
        const searchQuery = await vscode.window.showInputBox({
            prompt: "파일/폴더 검색",
            placeHolder: "검색어를 입력하세요...",
            value: currentQuery,
        });

        if (searchQuery !== undefined) {
            treeDataProvider.setSearchQuery(searchQuery);
            // 검색 상태 업데이트를 위한 when 조건 설정
            vscode.commands.executeCommand("setContext", "nexaExplorerHasSearch", searchQuery.length > 0);
        }
    });

    // 검색 초기화 명령어
    const clearSearchCommand = vscode.commands.registerCommand("nexaExplorer.clearSearch", () => {
        treeDataProvider.clearSearch();
        vscode.commands.executeCommand("setContext", "nexaExplorerHasSearch", false);
    });

    // 단축키: 아코디언 모드 토글
    const toggleCommand = vscode.commands.registerCommand("nexaExplorer.toggle", async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const uri = activeEditor.document.uri;
            const folderPath = uri.fsPath.split(/[/\\]/).slice(0, -1).join(path.sep);
            const currentExpanded = treeDataProvider.getExpandedFolderPath();

            // 토글: 같은 폴더면 닫고, 다르면 열기
            if (currentExpanded === folderPath) {
                // 현재 열린 폴더와 같으면 닫기
                treeDataProvider.collapseFolder(folderPath);
            } else {
                // 다른 폴더면 열기 (아코디언 모드)
                treeDataProvider.expandFolder(folderPath);
                // 트리뷰 새로고침 후 해당 폴더 찾아서 확장
                treeDataProvider.refresh();
                // 폴더 URI 생성하여 reveal 시도
                const folderUri = vscode.Uri.file(folderPath);
                try {
                    const folderItem = new FileItem(path.basename(folderPath), vscode.TreeItemCollapsibleState.Expanded, folderUri, true);
                    await treeView.reveal(folderItem, { expand: true });
                } catch (error) {
                    console.log("Could not reveal folder:", error);
                }
            }
        } else {
            // 활성 에디터가 없으면 모든 폴더 접기
            treeDataProvider.collapseAll();
        }
    });

    // 워크스페이스 변경 감지
    const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        treeDataProvider.refresh();
    });

    // 파일 시스템 변경 감지
    const fileWatcher = vscode.workspace.createFileSystemWatcher("**/*");
    fileWatcher.onDidCreate(() => treeDataProvider.refresh());
    fileWatcher.onDidDelete(() => treeDataProvider.refresh());
    fileWatcher.onDidChange(() => treeDataProvider.refresh());

    // 모든 구독 등록
    context.subscriptions.push(
        treeView,
        expandFolderCommand,
        collapseAllCommand,
        refreshCommand,
        openFolderCommand,
        toggleCommand,
        showWebviewCommand,
        toggleCheckboxCommand,
        selectValueCommand,
        searchCommand,
        clearSearchCommand,
        workspaceWatcher,
        fileWatcher,
        activeEditorWatcher,
        documentChangeWatcher
    );
}

export function deactivate() {}
