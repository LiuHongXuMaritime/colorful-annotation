// 'vscode' 模块包含 VS Code 的可扩展性 API
// 导入该模块，并在下面的代码中以别名 vscode 引用它
import * as vscode from 'vscode';

import { registerCommands } from './commands';
import { CONFIG_SECTION } from './config';
import { DecorationManager } from './decorations';

/**
 * 当扩展被激活时会调用此方法。
 * 扩展的激活事件为 `onStartupFinished`，因此 VS Code 启动完成后即会激活。
 */
export function activate(context: vscode.ExtensionContext): void {
	// 输出诊断信息，这行代码在扩展激活时只会执行一次
	console.log('恭喜，你的扩展 "colorful-annotations" 现已激活！');

	// 注释着色：作为一个 Disposable 注册，停用时会自动释放
	const decorations = new DecorationManager();
	context.subscriptions.push(decorations);

	// 注册命令
	registerCommands(context);

	// 注册编辑器相关的事件监听
	context.subscriptions.push(
		// 用户修改本扩展的设置后即时生效
		vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration(CONFIG_SECTION)) {
				decorations.reload();
			}
		}),
		// 监听注释内容变化
		vscode.workspace.onDidChangeTextDocument(event => {
			const editor = vscode.window.activeTextEditor;
			if (editor && event.document === editor.document) {
				decorations.scheduleUpdate(editor);
			}
		}),
		// 监听活动文件切换
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				decorations.update(editor);
			}
		}),
		// 监听可见区域变化（滚动），实现所见即所得
		vscode.window.onDidChangeTextEditorVisibleRanges(event => {
			decorations.update(event.textEditor);
		})
	);

	// 首次激活时立即着色
	if (vscode.window.activeTextEditor) {
		decorations.update(vscode.window.activeTextEditor);
	}
}

// 当扩展被停用时会调用此方法
export function deactivate(): void {}
