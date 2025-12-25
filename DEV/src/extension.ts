import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    console.log("=== NEXA TEST EXTENSION ACTIVATED ===");

    const command = vscode.commands.registerCommand("nexaTest.hello", () => {
        vscode.window.showInformationMessage("Hello from NEXA Test Extension!");
        console.log("Hello command executed!");
    });

    context.subscriptions.push(command);
}

export function deactivate() {}
