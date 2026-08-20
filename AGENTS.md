# AGENTS.md

本文件面向在此仓库内工作的 AI 编程助手，说明项目结构、运行方式与开发约束，帮助你快速上手并正确修改代码。

## 项目是什么

Grok Ball 是一个零运行依赖的 AI 表情球组件：圆球 + 一双跟随鼠标的眼睛，内置 32 种表情状态，纯 SVG 实时驱动。`index.html` 是单文件成品，`src/` 保存供 AI 和开发者维护、复用的引擎源码。

## 目录结构

```
.
├── index.html                 # 单文件成品（内联压缩引擎 + 配置面板）
├── src/
│   ├── grok-ball.js           # 完整可读引擎，是运行时真源
│   └── grok-ball.ts           # 类型安全入口与 Agent 消息协议
├── scripts/build-inline.mjs   # 压缩 JS 并更新 index.html
├── README.md    # 项目说明 + 快速开始 + 给 AI 的复制语
├── AGENTS.md    # 本文档：开发指引
├── SKILL.md     # 技能：如何开发 / 接入表情球
└── LICENSE      # MIT 许可证
```

## 引擎结构

`src/grok-ball.js` 按依赖顺序包含五层：

1. **几何数据**：`EB_RINGS.EXPRESSIONS` 有 25 组眼环，每组左右各 48 点；`SHAPES` 提供 blob/wedge/gem 身体轮廓。
2. **表情配置**：32 条 `EMOTION_SEED`，通过 `pool/body/eyes/anims/sequence` 描述眼环池、姿态和动画。
3. **渲染层**：按眼睛高度采样身体局部半宽，执行经度换算、余弦压缩和背面隐藏。
4. **特效层**：3D 轨道拖尾分为前后两段，使用独立 5-stop 色相渐变，并包含 confetti/zzz。
5. **驱动层**：共享 rAF、临界阻尼弹簧、眼环逐点插值、眨眼队列、注视、sequence 和公开 SDK。

`src/grok-ball.ts` 不复制几何和动画实现；它加载同一 JS 真源并提供完整的公开类型、内置 ID 联合类型和 `AgentEmotionMessage`。这样 JS/TS 使用方共享一套行为。

`index.html` 有两个 `<script>`：第一个是由构建脚本生成的压缩引擎，第二个是演示面板逻辑：

   - 右下角品牌球：`GrokBall.create(cornerEl, { emotion:'02', color:'#1a1a1a', eyeColor:'#f5f5f5' })`
   - 32 张卡片缩略图：`GrokBall.create(thumb, { emotion:id, autostart:false, eyeScale:1.4 })`
   - 预览引擎：选中 → `setEmotion`；自定义颜色 → 销毁重建；大小滑块改容器尺寸
   - 注视：`pointermove` 给预览球与右下角球 `setGaze`

## 对外 SDK（`window.GrokBall`）

| 成员 | 含义 |
| --- | --- |
| `GrokBall.create(el, opts)` | 创建实例，返回引擎对象 |
| `engine.setEmotion(id)` | 切换表情（`id` 见 `EMOTIONS`） |
| `engine.setGaze(nx, ny)` / `clearGaze()` | 设置/清除注视方向（-1..1） |
| `engine.spin(turns)` | 触发球面自旋与 3D 甩带 |
| `engine.handleAIMessage(message)` | 消费 `{ emotionId, tips? }` 或对应 JSON 字符串 |
| `engine.destroy()` | 销毁实例 |
| `GrokBall.EMOTIONS` / `GrokBall.GROUPS` | 表情数据 / 分组数据 |

`create` 的 `opts`：

| 参数 | 含义 |
| --- | --- |
| `emotion` | 初始表情 id |
| `color` | 固定主题色（覆盖表情自带色） |
| `eyeColor` | 眼睛颜色 |
| `eyeScale` | 小尺寸下放大眼睛 |
| `autostart: false` | 静态渲染一帧，不启动动画（缩略图用） |

## 开发约束

- **保持单文件成品**：`index.html` 必须零运行依赖，不得引入外部 JS/CSS/字体/网络资源。
- **只维护真源**：引擎修改先落在 `src/grok-ball.js`，然后运行 `node scripts/build-inline.mjs`，不要直接手改 HTML 中的压缩代码。
- **TS 不复制实现**：`src/grok-ball.ts` 负责类型和集成，不另写一套动画逻辑。
- **表情 ID 是契约**：`00-41` 不可重排，新表情追加到 `EMOTIONS` 且落到正确分组。
- **缩略图用静态渲染**：卡片一律 `autostart:false`。
- **布局约束**：外层页面不滚动（`body { overflow: hidden }`），表情列表只在 `.emo-scroll` 内部滚动。
- 所有 SVG 用 `createElementNS` 创建；纯前端，无后端/数据库。

## 验证

修改后先运行：

```bash
node --check src/grok-ball.js
tsc --noEmit --target ES2020 --module ES2020 --moduleResolution bundler --lib ES2020,DOM src/grok-ball.ts
node scripts/build-inline.mjs
```

涉及渲染行为时再打开 `index.html`，确认 32 张缩略图、表情切换、注视、自旋彩带和窄屏布局。

## 许可

[MIT](./LICENSE)，代码为原创实现，可自由使用、修改、商用。
