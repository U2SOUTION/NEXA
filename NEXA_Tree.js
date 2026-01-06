const fs = require("fs");
const path = require("path");

// --- 설정 영역 ---
const MAX_DEPTH = 5; // 분석하고 싶은 깊이 (3~4단계 권장)
const EXCLUDE_DIRS = ["node_modules", ".quasar", ".cursor", "assets", "public", ".git", "dist", "build", ".vscode", "NEXA-Documentation", "uploads"];
const EXCLUDE_FILES = [".DS_Store", "package-lock.json", "yarn.lock", ".cursorignore", ".gitignore"];
// ----------------

function printTree(dir, depth = 0, prefix = "") {
    if (depth > MAX_DEPTH) return;

    const files = fs.readdirSync(dir);

    files.forEach((file, index) => {
        if (EXCLUDE_DIRS.includes(file) || EXCLUDE_FILES.includes(file)) return;

        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const isLast = index === files.length - 1;
        const connector = isLast ? "└── " : "├── ";

        console.log(`${prefix}${connector}${file}`);

        if (stats.isDirectory()) {
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            printTree(filePath, depth + 1, newPrefix);
        }
    });
}

console.log("✨ NEXA Project Structure:");
printTree("./");
