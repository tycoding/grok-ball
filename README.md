# Grok Ball

一个会「看」你的 AI 表情球：圆球 + 一双眼睛实时跟随鼠标，内置 **32 种表情状态**（生命周期 / 情绪反应 / 代理工作状态三组），纯 SVG 驱动、零运行依赖。

> 灵感来自 Grok 的 Logo 动态效果，但本项目与 xAI / Grok 无关，代码为原创实现。

## 特性

- **单文件成品**：`index.html` 内联压缩后的引擎，一个文件即可运行，无需 npm 或外部资源。
- **原始眼环几何**：25 组左右各 48 点的轮廓，保留比例、位置与左右不对称细节。
- **真实球面投影**：基于身体轮廓采样、经度换算和余弦压缩；自旋到背面时眼睛自动隐藏。
- **32 种表情**：睡眠、待机、好奇、开心、惊讶、生气、思考中、任务完成、检索资料……全部可切换。
- **完整动画**：逐点眼环形变、眨眼弹簧、注视、呼吸、序列动画、3D 彩带、睡眠 zzz、撒花。
- **可嵌入业务**：提供 `GrokBall.create()` SDK，可用 `emotionId` 直接对接 AI 输出。
- **可维护源码**：提供可直接引用的 JS 运行时和带 Agent 消息类型的 TypeScript 入口。
- **MIT 协议**：免费使用、修改、商用均可。

## 快速开始

直接双击打开 `index.html`，或在浏览器中访问。

移动鼠标，右下角和预览区的球都会注视你；点击右下角小球会自旋并甩出 3D 彩带。

## 目录结构

```
.
├── index.html                 # 单文件成品（压缩引擎 + 配置面板）
├── src/
│   ├── grok-ball.js           # 可读、可直接引用的完整浏览器引擎
│   └── grok-ball.ts           # TypeScript API 与 Agent 消息入口
├── scripts/build-inline.mjs   # 把 JS 引擎压缩并内联回 index.html
├── README.md
├── AGENTS.md    # 给 AI 编程助手的开发指引
├── SKILL.md     # 给 AI 的技能：如何开发 / 接入表情球
└── LICENSE      # MIT 许可证
```

## 给 AI 的一句话

复制下面这句话，粘贴给你的 AI 助手（Claude、opencode、Cursor 等），它会读取本仓库的技能文档，帮你开发或接入这个表情组件：

```
请先阅读 grok-ball 仓库（https://github.com/tycoding/grok-ball）的 SKILL.md 和 AGENTS.md，
然后按照技能指引，帮我在我的业务系统中开发 / 接入一个会跟随鼠标、可切换 32 种表情的 Grok Ball 表情组件。
```

## 在业务系统中使用

```js
// 1. 直接引入可读的独立运行时
// <script src="./src/grok-ball.js"></script>
const ball = GrokBall.create('#mount', {
  emotion: '02',      // 初始表情
  color: '#1a1a1a',   // 可选：固定主题色（黑球）
  eyeColor: '#f5f5f5'
});

// 2. 用 emotionId 切换表情（可直接对接 AI 输出）
ball.setEmotion('30');   // 思考中

// 3. 让球注视某个方向（-1..1）
ball.setGaze(0.5, -0.3);

// 4. 销毁
ball.destroy();
```

TypeScript 项目可直接导入带类型入口：

```ts
import GrokBall, { applyAgentEmotion } from './src/grok-ball';

const ball = GrokBall.create('#mount', { emotion: '02' });
applyAgentEmotion(ball, { emotionId: '30', tips: '正在思考' });
```

## 重新生成单文件成品

修改 `src/grok-ball.js` 后运行：

```bash
node scripts/build-inline.mjs
```

构建脚本使用固定版本的 Terser 压缩引擎并写回 `index.html`；这只是维护工具，生成的页面仍然零运行依赖。

更多表情 ID 对照与高级用法见 [SKILL.md](./SKILL.md)。

## 32 种表情对照

| 分组 | 表情 ID |
| --- | --- |
| 生命周期 | 00 睡眠 · 01 唤醒 · 02 待机放空 · 03 好奇 · 04 发呆 · 05 加载苏醒 · 06 休眠 · 07 抖动唤醒 |
| 情绪反应 | 10 开心 · 11 疑惑 · 12 失落 · 13 惊讶 · 14 害羞 · 15 疲惫 · 16 专注 · 17 慌张 · 18 无奈 · 19 满意 · 20 困惑 · 21 生气 |
| 代理工作状态 | 30 思考中 · 31 接收任务 · 32 处理中忙碌 · 33 任务完成 · 34 出错 · 35 等待输入 · 36 联网加载 · 37 复述回忆 · 38 拒绝/受限 · 39 输出回复 · 40 检索资料 · 41 停止终止 |

## 许可证

[MIT](./LICENSE) — 免费使用、修改、商用。

「Grok」是 xAI 的商标，本项目仅用于学习交流，与 xAI 无任何关联。
