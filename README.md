# Colorful Annotations

给代码注释加彩色高亮。在注释里写一个 `@标记`，整行就会变色。

```ts
// @r 这里有 bug，必须先修
// @g 已完成，已自测
// @b 补充说明：这里的算法来自某某论文
const total = items.reduce((sum, item) => sum + item.price, 0);
```

```python
# @r 待修复
# @y 注意：这个函数有副作用
```

## 功能

- **一个标记一行颜色**：`@r` 整行变红、`@g` 变绿，内置 10 种颜色
- **自动识别注释语法**：TypeScript、Python、SQL、Lua 等 29 种语言开箱可用
- **所见即所得**：输入、切换文件、滚动时都会即时重绘
- **完全可配置**：颜色、语言前缀、总开关、排除语言、重绘延迟都能改，**改完立即生效**，无需重载窗口
- **纯本地**：不联网，不收集任何数据

## 颜色标记

| 标记 | 颜色 | 色值 |
|------|------|------|
| `@r` | 红 | `#ff5555` |
| `@g` | 绿 | `#50fa7b` |
| `@b` | 蓝 | `#6a9fff` |
| `@y` | 黄 | `#f1fa8c` |
| `@o` | 橙 | `#ffb86c` |
| `@p` | 紫 | `#bd93f9` |
| `@c` | 青 | `#8be9fd` |
| `@m` | 品红 | `#ff79c6` |
| `@k` | 灰 | `#8b949e` |
| `@w` | 白 | `#f8f8f2` |

标记后面可以继续写内容，比如 `// @r 待修复：空指针`；也可以和普通注释文字混在一起。

## 支持的注释语法

| 前缀 | 语言 |
|------|------|
| `//` | TypeScript、JavaScript、Java、C、C++、C#、Go、Rust、Swift、Kotlin、PHP、Dart、SCSS、Less |
| `#` | Python、Shell、PowerShell、Ruby、Perl、R、YAML、TOML、Dockerfile |
| `--` | SQL、Lua |
| `;` | INI |
| `'` | Visual Basic |

未列出的语言默认按 `//` 处理，你可以在设置里补上。

## 设置

打开方式：命令面板执行 `Colorful Annotations: 打开设置`，或按 `Ctrl+,` 搜索 `Colorful Annotations`。

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| `colorfulAnnotations.colors` | 10 种颜色 | 标记字母 → 颜色。只写想改的项，未写的沿用默认 |
| `colorfulAnnotations.enable` | `true` | 总开关，关闭后不再绘制任何高亮 |
| `colorfulAnnotations.excludeLanguages` | `[]` | 不处理的语言 ID 列表 |
| `colorfulAnnotations.lineCommentPrefixes` | 29 种语言 | 各语言的行注释前缀，可覆盖或新增 |
| `colorfulAnnotations.updateDelay` | `100` | 输入停止后延迟重绘的毫秒数（防抖） |

## 自定义示例

```jsonc
{
  // 把红色改成更醒目的，并新增一个青色标记 @x
  "colorfulAnnotations.colors": {
    "r": "#ff0000",
    "x": "#00ffff"
  },

  // 让 Vue 单文件组件也支持 // 标记
  "colorfulAnnotations.lineCommentPrefixes": {
    "vue": "//"
  },

  // Markdown / JSON 里不想看到高亮
  "colorfulAnnotations.excludeLanguages": ["markdown", "json"],

  // 大文件里想更跟手，可以把延迟调小
  "colorfulAnnotations.updateDelay": 50
}
```

对象型设置（`colors`、`lineCommentPrefixes`）**只需要写想改的键**，其余自动沿用默认值。

## 已知限制

- 只识别**行注释**。HTML、CSS、Markdown 这类以块注释为主的语言暂不支持
- `@w`（白色 `#f8f8f2`）在浅色主题下几乎看不见，建议改成灰色
- 目前只在**当前活动编辑器**上生效，不做后台常驻扫描

## 开发

```bash
npm install
npm run watch      # 监听编译；或在 VS Code 里直接按 F5 启动扩展开发宿主
npm run package    # 生产构建
vsce package       # 打包成 .vsix
```

## License

[MIT](LICENSE)
