---
name: grok-ball
description: 在业务系统中开发、接入与定制 Grok Ball 表情球组件——一个会跟随鼠标、内置 32 种表情状态、纯 SVG 实时驱动的 AI 表情球（单文件、零依赖、MIT 协议）。当用户需要开发/接入 AI 表情球、情绪小球、会「看人」的动画 Logo、把情绪反馈集成到聊天或 Agent 界面、或用 emotionId 对接 AI 输出时使用本技能。
---

# Grok Ball 表情球开发 / 接入技能

本技能帮助你理解 Grok Ball 表情球是如何开发出来的，以及如何在任意业务系统中接入、定制它。

## 这个表情球是什么

一个「活」的圆球：一双眼睛实时跟随鼠标光标，能眨眼、呼吸、上下浮动，并内置 32 种表情状态。它由纯 SVG 驱动，单文件、零依赖，可被任何前端项目复用。

核心卖点：**用一个 `emotionId` 就能把 AI 的情绪/工作状态变成看得见的动画表情**（例如 AI 正在「思考中」→ `30`，任务完成 → `33` 撒花庆祝，出错 → `34` 涨红）。

## 它是怎么开发出来的（原创引擎，三层）

整个表情球由一个原创的轻量引擎实现，理解这三层即可快速读懂或修改：

1. **眼睛形状层（`SHAPES`）**
   - 8 种原创几何，全部是「局部坐标中心 `(0,0)`」的 SVG path：`open`（椭圆）、`wide`（大椭圆）、`half`（半闭）、`focus`（小点）、`glance`（斜视）、`closed`（闭合线）、`smile`（笑弧）、`angry`（怒目斜线）。
   - 线形表情（闭合/笑/怒）用 `stroke` + 圆头描边；块形表情用 `fill`。

2. **表情数据层（`EMOTIONS`）**
   - 32 条声明式配置，每条描述「这个表情长什么样、怎么动」：
     - `eye` / `eyeL`+`eyeR`：眼睛形状（左右可不同，如困惑「一大一小」）
     - `color`：身体色；`breathe`：呼吸幅度；`blink`：眨眼间隔（`null` 不眨）
     - `lookX/lookY`：基础注视偏移；`tilt`：头倾斜；`bob`：上下浮动；`shake`：抖动；`nod`：摇头
     - `scan/scanY`：扫视；`dart`：慌乱；`pulse`：缩放脉冲；`focus`：两眼内聚；`flash`：颜色闪烁；`fx`：特效
   - 表情 ID 是契约：`00-09` 生命周期、`10-29` 情绪反应、`30-49` 代理工作状态。

3. **引擎层（`GrokBall.create`，对外 SDK）**
   - 构建 SVG（径向渐变身体 + 左右眼 path + 特效层），每个活跃实例一个 rAF 循环。
   - 核心动画：注视指数平滑 + 球面横向压缩（眼睛在球面移动时横向变窄，产生立体感）、眨眼（支持左右交替）、呼吸、颜色 lerp 过渡。
   - 特效：`orbit`（思考光环）、`zzz`（睡眠漂浮字母）、`confetti`（撒花粒子）。

## 如何在业务系统接入

### 最小接入（三步）

```js
// 1. 把 index.html 中的引擎脚本抽离成独立文件引入
// 2. 挂载到容器并指定初始表情
const ball = GrokBall.create('#mount', { emotion: '02' });

// 3. 用 emotionId 切换表情，直接对接 AI 输出
ball.setEmotion('30');   // 思考中
```

### 对接 AI 的推荐方式

后端/AI 返回一个 `emotionId`，前端调用 `setEmotion`，即可让表情球随 AI 状态变化：

| AI 状态 | emotionId | 效果 |
| --- | --- | --- |
| 思考/推理中 | `30` | 眼睛上翻 + 头顶光环环绕 |
| 等待用户输入 | `35` | 眼睛上下扫读 |
| 生成回复中 | `39` | 眼睛随输出节奏缩放 |
| 任务完成 | `33` | 笑眼 + 撒花 |
| 出错 | `34` | 圆睁 + 脸色红白闪动 |
| 拒绝/受限 | `38` | 怒目 + 摇头 |
| 休眠/空闲 | `00` / `02` | 闭眼 zzz / 待机放空 |

### 注视跟随

```js
window.addEventListener('pointermove', e => {
  const r = el.getBoundingClientRect();
  ball.setGaze(
    (e.clientX - (r.left + r.width / 2)) / (r.width / 2),
    (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
  );
});
```

### 主题色 / 尺寸定制

```js
// 黑球 + 白眼睛（Grok 风格）
GrokBall.create('#mount', { emotion: '02', color: '#1a1a1a', eyeColor: '#f5f5f5' });

// 小尺寸（如 48px 角标）放大眼睛保证可读
GrokBall.create('#mount', { emotion: '02', eyeScale: 1.4 });
```

### 缩略图（零帧成本静态渲染）

```js
GrokBall.create(thumbEl, { emotion: id, autostart: false, eyeScale: 1.4 });
```

## 定制新表情

1. 在 `EMOTIONS` 追加一条配置，落到正确分组（ID 不能与现有冲突）。
2. 组合已有眼睛形状 `SHAPES`，或用 `eyeL/eyeR` 搭配出左右不同；需要新形状时在 `SHAPES` 里加一个 path。
3. 用 `lookX/lookY/bob/scan/shake/flash/fx` 等字段编排动画。

## 注意

- 单文件产物 `index.html` 内联了全部引擎，接入时可抽取其中的 `<script>` 块，或直接 iframe 嵌入。
- 本项目为原创实现，**MIT 协议**，可自由使用、修改、商用。
