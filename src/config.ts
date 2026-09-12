import * as vscode from 'vscode';

/**
 * 本扩展的配置读取层。
 *
 * 所有**默认值**都写在 `package.json` 的 `contributes.configuration` 里，
 * 这样用户在设置界面能直接看到当前默认值，并基于它修改。
 * 本文件负责：
 * 1. 读取用户设置的值
 * 2. 与 package.json 声明的默认值合并（对象型设置支持「只改其中一项」）
 */

/** 配置节名称，需与 `package.json` 中 `contributes.configuration` 的键前缀一致 */
export const CONFIG_SECTION = 'colorfulAnnotations';

/**
 * 兜底行注释前缀。
 *
 * 正常情况下用不到——默认语言表由 `package.json` 声明；
 * 只有设置项缺失（比如用户手动删掉了默认值）时才回退到这里。
 */
export const FALLBACK_LINE_COMMENT_PREFIX = '//';

/** 内置默认值与用户设置合并后的最终配置 */
export interface ExtensionConfig {
	/** 总开关，关闭时不绘制任何装饰 */
	enable: boolean;
	/** 标记字母 -> 颜色 */
	markerColors: Record<string, string>;
	/** 语言 ID -> 行注释前缀 */
	lineCommentPrefixes: Record<string, string>;
	/** 不处理的语言 ID 集合 */
	excludeLanguages: ReadonlySet<string>;
	/** 防抖延迟（毫秒） */
	updateDelay: number;
}

/**
 * 读取 VS Code 设置。
 *
 * 对 `colors` / `lineCommentPrefixes` 这类对象型设置，会把 `package.json`
 * 声明的默认值与用户值合并，因此用户可以只覆盖其中几项。
 */
export function getConfig(): ExtensionConfig {
	const settings = vscode.workspace.getConfiguration(CONFIG_SECTION);

	return {
		enable: settings.get<boolean>('enable', true),
		markerColors: mergeObjectSetting(settings, 'colors'),
		lineCommentPrefixes: mergeObjectSetting(settings, 'lineCommentPrefixes'),
		excludeLanguages: new Set(settings.get<string[]>('excludeLanguages', [])),
		updateDelay: settings.get<number>('updateDelay', 100),
	};
}

/**
 * 合并对象型设置的「默认值」与「用户值」。
 *
 * VS Code 对对象型设置是整体替换的，这里手动做一次浅合并，
 * 于是用户只写 `{ "r": "#ff0000" }` 也能保留其它默认颜色。
 */
function mergeObjectSetting(
	settings: vscode.WorkspaceConfiguration,
	key: string
): Record<string, string> {
	const inspected = settings.inspect<Record<string, string>>(key);
	const userValue =
		inspected?.workspaceFolderValue ??
		inspected?.workspaceValue ??
		inspected?.globalValue;
	return { ...(inspected?.defaultValue ?? {}), ...(userValue ?? {}) };
}

/** 取得某个语言的行注释前缀，未收录时回退到兜底前缀 */
export function getLineCommentPrefix(config: ExtensionConfig, languageId: string): string {
	return config.lineCommentPrefixes[languageId] ?? FALLBACK_LINE_COMMENT_PREFIX;
}

/**
 * 为每个标记字母生成匹配正则。
 * @param linePrefix 行注释前缀，如 "//"、"#"
 * @param markers 需要支持的标记字母集合
 * @returns 标记字母 -> 正则 的映射
 */
export function createMarkerPatterns(
	linePrefix: string,
	markers: Iterable<string>
): Map<string, RegExp> {
	const prefix = escapeRegExp(linePrefix);
	const patterns = new Map<string, RegExp>();
	for (const marker of markers) {
		patterns.set(marker, new RegExp(`${prefix}\\s*@${escapeRegExp(marker)}\\b`));
	}
	return patterns;
}

/** 转义正则表达式中的元字符 */
function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
