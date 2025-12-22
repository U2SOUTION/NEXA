import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

/**
 * 파일/폴더 트리 아이템
 */
export class FileItem extends vscode.TreeItem {
    public checkboxState?: vscode.TreeItemCheckboxState;
    public selectValue?: string;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly resourceUri?: vscode.Uri,
        public readonly isFolder: boolean = false,
        checkboxState?: vscode.TreeItemCheckboxState,
        selectValue?: string
    ) {
        super(label, collapsibleState);

        this.tooltip = resourceUri ? resourceUri.fsPath : label;
        this.description = resourceUri ? path.basename(resourceUri.fsPath) : "";

        // 체크박스 상태 설정
        this.checkboxState = checkboxState ?? vscode.TreeItemCheckboxState.Unchecked;

        // 셀렉트 박스 값 설정
        this.selectValue = selectValue ?? "default";

        if (isFolder) {
            this.iconPath = vscode.ThemeIcon.Folder;
            this.contextValue = "folder";
        } else {
            this.iconPath = vscode.ThemeIcon.File;
            this.contextValue = "file";
        }

        // 셀렉트 박스 표시를 위한 description 추가
        if (this.selectValue && this.selectValue !== "default") {
            this.description = `${this.description} [${this.selectValue}]`;
        }

        if (resourceUri) {
            this.command = {
                command: "vscode.open",
                title: "Open File",
                arguments: [resourceUri],
            };
        }
    }
}

/**
 * 파일 시스템 트리 데이터 제공자
 * 아코디언 모드 지원 (한 번에 하나의 폴더만 열림)
 */
export class AccordionTreeDataProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

    // 아코디언 모드: 현재 열린 폴더 경로 저장
    private expandedFolderPath: string | null = null;
    private workspaceRoot: string | null = null;
    
    // 체크박스 상태 저장
    private checkedItems: Set<string> = new Set();
    
    // 셀렉트 박스 값 저장
    private selectValues: Map<string, string> = new Map();
    
    // 검색어 저장
    private searchQuery: string = "";

    constructor() {
        // 워크스페이스 루트 가져오기
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FileItem): Thenable<FileItem[]> {
        // 루트 레벨: 워크스페이스 폴더들 표시
        if (!element) {
            return this.getWorkspaceFolders();
        }

        // 하위 폴더/파일 표시
        return this.getFolderChildren(element.resourceUri!);
    }

    /**
     * 워크스페이스 폴더 목록 가져오기
     */
    private async getWorkspaceFolders(): Promise<FileItem[]> {
        if (!this.workspaceRoot) {
            return [];
        }

        try {
            const items = await fs.promises.readdir(this.workspaceRoot, { withFileTypes: true });
            const folders: FileItem[] = [];

            for (const item of items) {
                // 숨김 파일/폴더 제외 (.git, .vscode 등)
                if (item.name.startsWith(".")) {
                    continue;
                }

                const fullPath = path.join(this.workspaceRoot!, item.name);
                
                // 검색 필터링: 검색어가 있으면 매칭되는 항목만 표시
                if (this.searchQuery) {
                    const matches = this.matchesSearch(item.name, fullPath);
                    if (item.isDirectory()) {
                        // 폴더는 하위에 매칭 항목이 있으면 표시
                        const hasMatch = await this.hasMatchingChildren(fullPath);
                        if (!matches && !hasMatch) {
                            continue;
                        }
                    } else {
                        // 파일은 매칭되지 않으면 표시하지 않음
                        if (!matches) {
                            continue;
                        }
                    }
                }

                const uri = vscode.Uri.file(fullPath);

                if (item.isDirectory()) {
                    // 아코디언 모드: 현재 열린 폴더만 확장 가능 상태로 설정
                    const isExpanded = this.expandedFolderPath === fullPath;
                    const checkboxState = this.checkedItems.has(fullPath) 
                        ? vscode.TreeItemCheckboxState.Checked 
                        : vscode.TreeItemCheckboxState.Unchecked;
                    const selectValue = this.selectValues.get(fullPath) || "default";
                    folders.push(new FileItem(item.name, isExpanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed, uri, true, checkboxState, selectValue));
                } else {
                    // 파일은 항상 접힌 상태 (파일은 자식이 없음)
                    const checkboxState = this.checkedItems.has(fullPath) 
                        ? vscode.TreeItemCheckboxState.Checked 
                        : vscode.TreeItemCheckboxState.Unchecked;
                    const selectValue = this.selectValues.get(fullPath) || "default";
                    folders.push(new FileItem(item.name, vscode.TreeItemCollapsibleState.None, uri, false, checkboxState, selectValue));
                }
            }

            return folders.sort((a, b) => {
                // 폴더 먼저, 그 다음 파일
                if (a.isFolder !== b.isFolder) {
                    return a.isFolder ? -1 : 1;
                }
                return a.label.localeCompare(b.label);
            });
        } catch (error) {
            console.error("Error reading workspace folders:", error);
            return [];
        }
    }

    /**
     * 폴더의 자식 항목 가져오기
     */
    private async getFolderChildren(uri: vscode.Uri): Promise<FileItem[]> {
        try {
            const folderPath = uri.fsPath;
            const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
            const children: FileItem[] = [];

            for (const item of items) {
                // 숨김 파일/폴더 제외
                if (item.name.startsWith(".")) {
                    continue;
                }

                const fullPath = path.join(folderPath, item.name);
                
                // 검색 필터링: 검색어가 있으면 매칭되는 항목만 표시
                if (this.searchQuery) {
                    const matches = this.matchesSearch(item.name, fullPath);
                    if (item.isDirectory()) {
                        // 폴더는 하위에 매칭 항목이 있으면 표시
                        const hasMatch = await this.hasMatchingChildren(fullPath);
                        if (!matches && !hasMatch) {
                            continue;
                        }
                    } else {
                        // 파일은 매칭되지 않으면 표시하지 않음
                        if (!matches) {
                            continue;
                        }
                    }
                }

                const childUri = vscode.Uri.file(fullPath);

                if (item.isDirectory()) {
                    // 아코디언 모드: 현재 열린 폴더의 하위 폴더만 확장 가능
                    const isExpanded = this.expandedFolderPath === fullPath;
                    const checkboxState = this.checkedItems.has(fullPath) 
                        ? vscode.TreeItemCheckboxState.Checked 
                        : vscode.TreeItemCheckboxState.Unchecked;
                    const selectValue = this.selectValues.get(fullPath) || "default";
                    children.push(new FileItem(item.name, isExpanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed, childUri, true, checkboxState, selectValue));
                } else {
                    const checkboxState = this.checkedItems.has(fullPath) 
                        ? vscode.TreeItemCheckboxState.Checked 
                        : vscode.TreeItemCheckboxState.Unchecked;
                    const selectValue = this.selectValues.get(fullPath) || "default";
                    children.push(new FileItem(item.name, vscode.TreeItemCollapsibleState.None, childUri, false, checkboxState, selectValue));
                }
            }

            return children.sort((a, b) => {
                if (a.isFolder !== b.isFolder) {
                    return a.isFolder ? -1 : 1;
                }
                return a.label.localeCompare(b.label);
            });
        } catch (error) {
            console.error("Error reading folder children:", error);
            return [];
        }
    }

    /**
     * 폴더 확장 (아코디언 모드: 다른 폴더는 접기)
     */
    expandFolder(folderPath: string): void {
        // 아코디언 모드: 다른 폴더가 열려있으면 접기
        const wasDifferent = this.expandedFolderPath && this.expandedFolderPath !== folderPath;

        // 새 폴더 열기
        this.expandedFolderPath = folderPath;

        // 항상 새로고침하여 트리뷰 상태 동기화
        this.refresh();
    }

    /**
     * 폴더 접기
     */
    collapseFolder(folderPath: string): void {
        if (this.expandedFolderPath === folderPath) {
            this.expandedFolderPath = null;
            this.refresh();
        }
    }

    /**
     * 모든 폴더 접기
     */
    collapseAll(): void {
        this.expandedFolderPath = null;
        this.refresh();
    }

    /**
     * 현재 열린 폴더 경로 가져오기
     */
    getExpandedFolderPath(): string | null {
        return this.expandedFolderPath;
    }

    /**
     * 체크박스 토글
     */
    toggleCheckbox(itemPath: string): void {
        if (this.checkedItems.has(itemPath)) {
            this.checkedItems.delete(itemPath);
        } else {
            this.checkedItems.add(itemPath);
        }
        this.refresh();
    }

    /**
     * 셀렉트 박스 값 설정
     */
    setSelectValue(itemPath: string, value: string): void {
        this.selectValues.set(itemPath, value);
        this.refresh();
    }

    /**
     * 체크된 항목 가져오기
     */
    getCheckedItems(): string[] {
        return Array.from(this.checkedItems);
    }

    /**
     * 셀렉트 박스 값 가져오기
     */
    getSelectValue(itemPath: string): string {
        return this.selectValues.get(itemPath) || "default";
    }

    /**
     * 검색어 설정
     */
    setSearchQuery(query: string): void {
        this.searchQuery = query.toLowerCase().trim();
        this.refresh();
    }

    /**
     * 검색어 가져오기
     */
    getSearchQuery(): string {
        return this.searchQuery;
    }

    /**
     * 검색어 초기화
     */
    clearSearch(): void {
        this.searchQuery = "";
        this.refresh();
    }

    /**
     * 항목이 검색어와 일치하는지 확인
     */
    private matchesSearch(itemName: string, itemPath: string): boolean {
        if (!this.searchQuery) {
            return true;
        }
        const nameMatch = itemName.toLowerCase().includes(this.searchQuery);
        const pathMatch = itemPath.toLowerCase().includes(this.searchQuery);
        return nameMatch || pathMatch;
    }

    /**
     * 폴더에 검색 결과가 있는지 확인 (하위 항목 포함)
     */
    private async hasMatchingChildren(folderPath: string): Promise<boolean> {
        try {
            const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
            for (const item of items) {
                if (item.name.startsWith(".")) {
                    continue;
                }
                const fullPath = path.join(folderPath, item.name);
                if (this.matchesSearch(item.name, fullPath)) {
                    return true;
                }
                if (item.isDirectory()) {
                    const hasMatch = await this.hasMatchingChildren(fullPath);
                    if (hasMatch) {
                        return true;
                    }
                }
            }
            return false;
        } catch {
            return false;
        }
    }
}
