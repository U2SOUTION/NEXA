const fs = require("fs");
const path = require("path");

// --- 설정 영역 ---
const MAX_DEPTH = 3;
const EXCLUDE_DIRS = ["node_modules", ".quasar", ".cursor", "assets", "public", ".git", "dist", "build", ".vscode", "NEXA-Documentation", "uploads"];
const EXCLUDE_FILES = [".DS_Store", "package-lock.json", "yarn.lock", ".cursorignore", ".gitignore"];
const OUTPUT_FILE = "project_structure.txt";
// ----------------

let output = "✨ NEXA Project Structure:\n";

function generateTreeString(dir, depth = 0, prefix = "") {
    if (depth > MAX_DEPTH) return;

    // 디렉토리가 존재하지 않을 경우를 대비한 예외 처리
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    const filteredFiles = files.filter((file) => !EXCLUDE_DIRS.includes(file) && !EXCLUDE_FILES.includes(file));

    filteredFiles.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const isLast = index === filteredFiles.length - 1;
        const connector = isLast ? "└── " : "├── ";

        // 폴더일 경우 이름 뒤에 /를 붙입니다.
        const displayName = stats.isDirectory() ? `${file}/` : file;

        output += `${prefix}${connector}${displayName}\n`;

        if (stats.isDirectory()) {
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            generateTreeString(filePath, depth + 1, newPrefix);
        }
    });
}

generateTreeString("./");

try {
    fs.writeFileSync(OUTPUT_FILE, output, "utf8");
    console.log(`✨ 폴더 구분이 추가된 트리가 저장되었습니다: ${OUTPUT_FILE}`);
} catch (err) {
    console.error("파일 저장 중 오류가 발생했습니다:", err);
}
