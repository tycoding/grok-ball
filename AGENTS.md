# AGENTS.md

本文件面向在此仓库内工作的 AI 编程助手，说明项目结构、运行方式与开发约束，帮助你快速上手并正确修改代码。

## 项目是什么

Grok Ball 是一个单文件、零依赖、纯原创实现的 AI 表情球组件：圆球 + 一双跟随鼠标的眼睛，内置 32 种表情状态，纯 SVG 实时驱动。对外只有一个产物 `index.html`。

## 目录结构

```
.
├── index.html   # 唯一产物（单文件，含原创引擎 + 配置面板）
├── README.md    # 项目说明 + 快速开始 + 给 AI 的复制语
├── AGENTS.md    # 本文档：开发指引
├── SKILL.md     # 技能：如何开发 / 接入表情球
└── LICENSE      # MIT 许可证
```

## index.html 内部结构（两个 `<script>` 块）

1. **引擎脚本（原创）** — 挂载 `window.GrokBall`
   - **眼睛形状 `SHAPES`**：8 种原创几何（`open` 椭圆 / `wide` 大椭圆 / `half` 半闭 / `focus` 小点 / `glance` 斜视 / `closed` 闭合线 / `smile` 笑弧 / `angry` 怒目斜线），局部坐标中心为 `(0,0)`，用 `ellipsePath()` 与手写 path 表达。
   - **表情数据 `EMOTIONS`**：32 条声明式配置，字段含义：
     - `id/group/name/desc`：标识与文案
     - `eye`（或 `eyeL`+`eyeR`）：左右眼形状 key，`eyeL/eyeR` 可分别指定（如困惑「一大一小」）
     - `color`：身体色；`breathe`：呼吸幅度；`blink`：眨眼间隔 `[min,max]`，`null` 不眨
     - `gaze`：是否跟随鼠标；`lookX/lookY`：基础注视偏移
     - `tilt`：头部倾斜；`bob`+`bobPer`：上下浮动；`shake`：入场抖动；`nod`：左右摇头
     - `scan`/`scanY`：左右/上下扫视；`dart`：慌张乱晃；`pulse`：缩放脉冲；`focus`：两眼内聚
     - `flash`：颜色闪烁序列；`scale`：眼睛整体缩放；`fx`：特效 `'orbit'|'zzz'|'confetti'`
   - **引擎 `createBall(el, opts)`**：构建 SVG（径向渐变身体 + 左右眼 path + 特效层），每个活跃实例一个 rAF 循环；`autostart:false` 时只静态渲染一帧（缩略图用）。
   - 核心动画：注视指数平滑、球面横向压缩、眨眼（支持 `altBlink` 左右交替）、呼吸、颜色 lerp 过渡、特效（orbit 环带 / zzz 漂浮 / confetti 撒花）。

2. **面板脚本** — 配置面板逻辑
   - 右下角品牌球：`GrokBall.create(cornerEl, { emotion:'02', color:'#1a1a1a', eyeColor:'#f5f5f5' })`，点击切「任务完成」撒花后复位
   - 32 张卡片缩略图：`GrokBall.create(thumb, { emotion:id, autostart:false, eyeScale:1.4 })`
   - 预览引擎：选中 → `setEmotion`；自定义颜色 → 销毁重建；大小滑块改容器尺寸
   - 注视：`pointermove` 给预览球与右下角球 `setGaze`

## 对外 SDK（`window.GrokBall`）

| 成员 | 含义 |
| --- | --- |
| `GrokBall.create(el, opts)` | 创建实例，返回引擎对象 |
| `engine.setEmotion(id)` | 切换表情（`id` 见 `EMOTIONS`） |
| `engine.setGaze(nx, ny)` / `clearGaze()` | 设置/清除注视方向（-1..1） |
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

- **保持单文件**：`index.html` 必须零依赖，不得引入外部 JS/CSS/字体/网络资源。
- **表情 ID 是契约**：`00-41` 不可重排，新表情追加到 `EMOTIONS` 且落到正确分组。
- **缩略图用静态渲染**：卡片一律 `autostart:false`。
- **布局约束**：外层页面不滚动（`body { overflow: hidden }`），表情列表只在 `.emo-scroll` 内部滚动。
- 所有 SVG 用 `createElementNS` 创建；纯前端，无后端/数据库。

## 验证

修改后：浏览器打开 `index.html`，确认 32 张缩略图正常、点击切换表情、鼠标注视、右下角球点击撒花；缩放到窄屏确认单列布局不溢出。

## 许可

[MIT](./LICENSE)，代码为原创实现，可自由使用、修改、商用。
