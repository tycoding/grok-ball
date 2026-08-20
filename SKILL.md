---
name: grok-ball
description: 在业务系统中开发、接入与定制 Grok Ball 表情球组件——一个会跟随鼠标、内置 32 种表情状态、纯 SVG 实时驱动的 AI 表情球（单文件、零依赖、MIT 协议）。当用户需要开发/接入 AI 表情球、情绪小球、会「看人」的动画 Logo、把情绪反馈集成到聊天或 Agent 界面、或用 emotionId 对接 AI 输出时使用本技能。
---

# Grok Ball 表情球开发 / 接入技能

本技能帮助你理解 Grok Ball 表情球是如何开发出来的，以及如何在任意业务系统中接入、定制它。

## 这个表情球是什么

一个「活」的圆球：一双眼睛实时跟随鼠标光标，能眨眼、呼吸、上下浮动，并内置 32 种表情状态。它由纯 SVG 驱动，单文件、零依赖，可被任何前端项目复用。

核心卖点：**用一个 `emotionId` 就能把 AI 的情绪/工作状态变成看得见的动画表情**（例如 AI 正在「思考中」→ `30`，任务完成 → `33` 撒花庆祝，出错 → `34` 涨红）。

## 它是怎么开发出来的（五层引擎）

可读实现位于 `src/grok-ball.js`，理解下面五层即可快速读懂或修改：

1. **眼环几何层（`EB_RINGS`）**
   - `EXPRESSIONS` 包含 25 组眼环，每组是 `[左眼48点, 右眼48点]`，眼睛位置、比例和左右不对称直接保存在坐标中。
   - `SHAPES` 提供 blob/wedge/gem 身体轮廓，以及脸部拟合参数。

2. **表情数据层（`EMOTION_SEED`）**
   - 32 条声明式配置，每条描述「这个表情长什么样、怎么动」：
     - `pool/poolMs/poolSpeed`：眼环索引池、轮换间隔和形变弹簧速度
     - `body/eyes`：身体姿态与左右眼覆盖参数
     - `blinkMs/openness/antics`：眨眼、常驻开合度和待机小动作
     - `anims/sequence`：动画原语与关键帧序列
   - 表情 ID 是契约：`00-09` 生命周期、`10-29` 情绪反应、`30-49` 代理工作状态。

3. **球面渲染层**
   - 在眼睛当前高度采样身体轮廓的局部半宽，把横向位置换算为经度，再用余弦压缩眼宽。
   - 自旋偏航后眼睛绕到背面时自动隐藏，保持真正贴合球面。

4. **彩带与粒子层**
   - 彩带使用 3D 轨道历史点形成头宽尾细拖尾，按深度拆成前后 path，并使用 5-stop 色相漂移渐变。
   - 另有 `zzz` 和 confetti 粒子。

5. **驱动层（`GrokBall.create`）**
   - 共享 rAF、临界阻尼弹簧、眼环逐点插值、眨眼队列、注视平滑和 sequence 采样。
   - TypeScript 使用方从 `src/grok-ball.ts` 导入同一运行时及完整类型，不维护第二套实现。

## 如何在业务系统接入

### 最小接入（三步）

```js
// 1. 引入独立运行时：<script src="./src/grok-ball.js"></script>
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

1. 通过 `GrokBall.config.register()` 注册配置，或在 `EMOTION_SEED` 追加一条并落到正确分组（ID 不能冲突）。
2. 用 `pool` 组合已有 25 组眼环；新增眼环时必须保持左右各 48 点，才能逐点插值。
3. 用 `body/eyes/anims/sequence` 编排姿态和动画。
4. 修改 `src/grok-ball.js` 后运行 `node scripts/build-inline.mjs` 更新单文件成品。

## 注意

- 单文件产物 `index.html` 内联压缩引擎；业务接入优先直接使用 `src/grok-ball.js` 或 `src/grok-ball.ts`。
- 本项目为原创实现，**MIT 协议**，可自由使用、修改、商用。
