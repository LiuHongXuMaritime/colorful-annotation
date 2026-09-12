import * as vscode from 'vscode';

import {
	createMarkerPatterns,
	ExtensionConfig,
	getConfig,
	getLineCommentPrefix,
} from './config';

/**
 * 为注释中的 `@r`、`@g`、`@b` 等标记着色。
 *
 * 颜色表、语言表、防抖延迟全部来自 {@link getConfig}（定义在 `config.ts`）。
 * 作为 `vscode.Disposable`，可注册到 `context.subscriptions` 中，
 * 在扩展停用时自动释放装饰类型与定时器。
 */
export class DecorationManager implements vscode.Disposable {
	/** 标记字母 -> 装饰类型 */
	private readonly decorations = new Map<string, vscode.TextEditorDecorationType>();
	/** 语言 ID -> 「标记 -> 正则」，避免每次重绘都重新构造 */
	private readonly patternCache = new Map<string, Map<string, RegExp>>();
	private config: ExtensionConfig;
	private timer: NodeJS.Timeout | undefined;

	constructor() {
		this.config = getConfig();
		this.applyConfig();
	}

	/** 用户修改设置后重新加载配置，并刷新所有可见编辑器 */
	reload(): void {
		this.disposeDecorations();
		this.patternCache.clear();
		this.config = getConfig();
		this.applyConfig();
		this.refreshVisibleEditors();
	}

	/** 总开关或语言被排除时，清空该编辑器的装饰 */
	update(editor: vscode.TextEditor): void {
		if (!this.isActive(editor.document.languageId)) {
			this.clear(editor);
			return;
		}

		const patterns = this.getMarkerPatterns(editor.document.languageId);
		const ranges = new Map<string, vscode.Range[]>();
		for (const marker of patterns.keys()) {
			ranges.set(marker, []);
		}

		const document = editor.document;
		for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
			const line = document.lineAt(lineNumber);
			if (line.isEmptyOrWhitespace) {
				continue;
			}

			const range = new vscode.Range(lineNumber, 0, lineNumber, line.text.length);
			for (const [marker, pattern] of patterns) {
				if (pattern.test(line.text)) {
					ranges.get(marker)?.push(range);
				}
			}
		}

		for (const [marker, decoration] of this.decorations) {
			editor.setDecorations(decoration, ranges.get(marker) ?? []);
		}
	}

	/** 防抖版本的 {@link update}，适用于高频的文档变更事件 */
	scheduleUpdate(editor: vscode.TextEditor): void {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(() => {
			this.timer = undefined;
			this.update(editor);
		}, this.config.updateDelay);
	}

	dispose(): void {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}
		this.disposeDecorations();
		this.patternCache.clear();
	}

	/** 按当前配置创建装饰类型 */
	private applyConfig(): void {
		for (const [marker, color] of Object.entries(this.config.markerColors)) {
			this.decorations.set(
				marker,
				vscode.window.createTextEditorDecorationType({ color })
			);
		}
	}

	/** 释放所有装饰类型 */
	private disposeDecorations(): void {
		for (const decoration of this.decorations.values()) {
			decoration.dispose();
		}
		this.decorations.clear();
	}

	/** 当前语言是否应该被处理 */
	private isActive(languageId: string): boolean {
		return this.config.enable && !this.config.excludeLanguages.has(languageId);
	}

	/** 清空某个编辑器的全部装饰 */
	private clear(editor: vscode.TextEditor): void {
		for (const decoration of this.decorations.values()) {
			editor.setDecorations(decoration, []);
		}
	}

	/** 取得某个语言的「标记 -> 正则」映射（带缓存） */
	private getMarkerPatterns(languageId: string): Map<string, RegExp> {
		let patterns = this.patternCache.get(languageId);
		if (!patterns) {
			patterns = createMarkerPatterns(
				getLineCommentPrefix(this.config, languageId),
				Object.keys(this.config.markerColors)
			);
			this.patternCache.set(languageId, patterns);
		}
		return patterns;
	}

	/** 刷新当前可见的所有编辑器 */
	private refreshVisibleEditors(): void {
		for (const editor of vscode.window.visibleTextEditors) {
			this.update(editor);
		}
	}
}
