import * as vscode from 'vscode';

/**
 * 注册本扩展提供的所有命令。
 *
 * 命令 ID 必须与 `package.json` 的 `contributes.commands` 保持一致。
 */
export function registerCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('colorful-annotations.openSettings', () => {
			// 直接打开本扩展的设置页，方便用户改颜色 / 语言映射
			vscode.commands.executeCommand(
				'workbench.action.openSettings',
				`@ext:${context.extension.id}`
			);
		})
	);
}
