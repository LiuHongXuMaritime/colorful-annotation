import * as vscode from 'vscode';

/**
 * 注册本扩展提供的所有命令。
 *
 * 命令 ID 必须与 `package.json` 的 `contributes.commands` 保持一致。
 */
export function registerCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('colorful-annotations.helloWorld', () => {
			vscode.window.showInformationMessage('来自 Colorful annotations 的 Hello World！');
		}),
		vscode.commands.registerCommand('get-now-time', () => {
			vscode.window.showInformationMessage(formatNow());
		}),
		vscode.commands.registerCommand('colorful-annotations.openSettings', () => {
			// 直接打开本扩展的设置页，方便用户改颜色 / 语言映射
			vscode.commands.executeCommand(
				'workbench.action.openSettings',
				`@ext:${context.extension.id}`
			);
		})
	);
}

/**
 * 返回当前时间的本地化字符串。
 * @example 2025/05/28 16:06:32
 */
function formatNow(): string {
	return new Date().toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	});
}
