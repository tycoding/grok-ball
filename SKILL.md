---
name: grok-ball
description: 在业务系统中开发、接入与定制 Grok Ball 表情球组件——一个会跟随鼠标、内置 32 种表情状态、纯 SVG 实时驱动的 AI 表情球。当用户需要开发/接入 AI 表情球、情绪小球、会「看人」的动画 Logo、把情绪反馈集成到聊天或 Agent 界面、或用 emotionId 对接 AI 输出时使用本技能。
---

# Grok Ball 表情球开发 / 接入技能

本技能帮助你理解 Grok Ball 表情球是如何开发出来的，以及如何在任意业务系统中接入、定制它。

## 这个表情球是什么

一个「活」的圆球：一双眼睛实时跟随鼠标光标，能眨眼、呼吸、甩彩带，并内置 32 种表情状态。它由纯 SVG 驱动，单文件、零依赖，可被任何前端项目复用。

核心卖点：**用一个 `emotionId` 就能把 AI 的情绪/工作状态变成看得见的动画表情**（例如 AI 正在「思考中」→ `30`，任务完成 → `33` 撒花庆祝，出错 → `34` 涨红）。

## 它是怎么开发出来的（四层架构）

整个表情球由四层职责分明的引擎组成，理解这四层即可快速读懂或修改：

1. **几何数据层**（`window.EB_RINGS`）
   - `EXPRESSIONS`：25 组眼环轮廓，每组左右眼各 48 个点，是「表情长相」的底层素材。
   - `SHAPES`：`blob`（圆胖）/ `wedge`（三角）/ `gem`（菱形）身体轮廓 + 脸部拟合参数。
   - 坐标系统一为 viewBox `-15 -15 259 259`，头部中心 `HEAD_C = 114.2705`。

2. **表情配置层**（`window.EMOTION_SEED`）
   - 32 套表情，用声明式配置描述「这个表情长什么样、怎么动」：
     - `pool`：眼环索引池（引用第 1 层的轮廓，池内随机轮换）
     - `body`：身体的位置/缩放/旋转/颜色/呼吸，以及 `zzz`、`orbit`、`ribbons`、`confetti` 等特效开关
     - `eyes`：眼睛的缩放/位移/注视方向
     - `anims`：动画原语（`sine/pulse/jitter/scan/glance/blink`）
     - `sequence`：关键帧序列（入场动画、颜色渐变、切换到下一个表情等）
   - 表情 ID 是契约：`00-09` 生命周期、`10-29` 情绪反应、`30-49` 代理工作状态。

3. **渲染层**（`EmotionBall.createBall`）
   - 把「数据」画成 SVG：径向渐变身体 + 左右眼 path。
   - 关键难点是**球面投影**：眼睛在球面上移动时会按经度换算并做余弦压缩，绕到背面自动隐藏，才有「眼睛长在球上」的立体感。

4. **驱动层**（`EmotionBall.create`，对外 SDK）
   - 用**临界阻尼弹簧**做所有形变/开合/自旋的平滑过渡，用共享 rAF 时钟让多个实例只跑一个循环。
   - 注视跟随用帧率无关的指数平滑；眨眼用关键帧队列；待机有随机小动作。

## 如何在业务系统接入

### 最小接入（三步）

```js
// 1. 把引擎脚本引入页面（index.html 内已内联，可抽离成 emotion-ball.js）
// 2. 挂载到容器并指定初始表情
const ball = EmotionBall.create('#mount', { emotion: '02' });

// 3. 用 emotionId 切换表情，直接对接 AI 输出
ball.handleAIMessage({ emotionId: '30', tips: '正在思考用户问题' });
```

### 对接 AI 的推荐方式

后端/AI 返回一个 `emotionId`，前端调用 `handleAIMessage`，即可让表情球随 AI 状态变化：

| AI 状态 | emotionId | 效果 |
| --- | --- | --- |
| 思考/推理中 | `30` | 思考眼轮换 + 头顶彩带环绕 |
| 等待用户输入 | `35` | 聆听眼 + 目光上下扫读 |
| 生成回复中 | `39` | 扫读眼 + 随输出节奏缩放 |
| 任务完成 | `33` | 笑眼 + 甩彩带 + 撒花 |
| 出错 | `34` | 圆睁 + 脸色红白闪动 |
| 拒绝/受限 | `38` | 斜眼 + 摇头 |
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
EmotionBall.create('#mount', { emotion: '02', color: '#1a1a1a', eyeColor: '#f5f5f5' });

// 小尺寸（如 48px 角标）放大眼睛保证可读
EmotionBall.create('#mount', { emotion: '02', eyeScale: 1.4 });
```

### 缩略图（零帧成本静态渲染）

```js
EmotionBall.create(thumbEl, { emotion: id, autostart: false, eyeScale: 1.4 });
```

## 定制新表情

1. 在 `EMOTION_SEED` 追加一条配置，落到正确分组（ID 不能与现有冲突）。
2. 通过 `pool` 引用已有眼环，或用 `registerEmotion` 注册自定义眼环配置。
3. 用 `anims` + `sequence` 编排动画。

## 注意

- 单文件产物 `index.html` 内联了全部引擎，接入时可直接抽取其中的 `<script>` 块，或直接 iframe 嵌入。
- 派生自 [emotion-ball](https://github.com/sam70361/emotion-ball)，**非商用许可**，商业集成前需取得原版权所有者授权。
