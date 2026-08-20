# AGENTS.md

本文件面向在此仓库内工作的 AI 编程助手，说明项目结构、运行方式与开发约束，帮助你快速上手并正确修改代码。

## 项目是什么

Grok Ball 是一个单文件、零依赖的 AI 表情球组件：圆球 + 一双跟随鼠标的眼睛，内置 32 种表情状态，纯 SVG 实时驱动。对外只有一个产物 `index.html`，其中**内联**了全部引擎源码。

## 目录结构

```
.
├── index.html   # 唯一产物（单文件，内联 5 个 <script> 块）
├── README.md    # 项目说明 + 快速开始 + 给 AI 的复制语
├── AGENTS.md    # 本文档：开发指引
├── SKILL.md     # 技能：如何开发 / 接入表情球（面向业务集成）
└── LICENSE      # 许可证
```

## index.html 内部结构（5 个 script 块，顺序不可变）

按依赖顺序内联了原 emotion-ball 引擎的四层 + 一层自定义面板：

1. **几何数据层（rings.js）** — `window.EB_RINGS`
   - `HEAD_C = 114.2705`（头部中心，坐标系 viewBox `-15 -15 259 259`）
   - `EXPRESSIONS`：25 组眼环（每组 `[左眼环, 右眼环]`，各 48 点轮廓）
   - `SHAPES`：`blob` / `wedge` / `gem` 三种身体形状（`ring` 轮廓 + `face` 脸部拟合参数）
   - `STAR_GOLD`、`EYE_HALF` 等常量

2. **表情配置层（emotions.js）** — `window.EMOTION_GROUPS` + `window.EMOTION_SEED`
   - 32 套表情，ID 分段：`00-09` 生命周期、`10-29` 情绪反应、`30-49` 代理工作状态、`50+` 自定义
   - 每套字段：`id/name/group/desc/transition/gaze/pool/poolMs/poolSpeed/blinkMs/openness/antics/body/eyes/anims/sequence`
   - `pool` 是眼环索引池（引用 `EXPRESSIONS` 下标），`body` 含 `x/y/scale/rotate/color/breathe/ribbons/confetti/zzz/orbit`

3. **渲染层（ball.js）** — `EmotionBall.createBall(container, opts)`
   - 构建 SVG 骨架（径向渐变身体 + 左右眼 path）
   - 眼睛球面投影（经度换算 + 余弦压缩 + 自旋偏航）
   - 彩带、撒花、zzz 粒子
   - 返回 `{ svg, applyPose, burst, destroy }`

4. **驱动层（engine.js）** — `EmotionBall.create(target, opts)`
   - 配置注册中心 `EmotionBall.config`，共享 rAF 时钟，动画原语（sine/pulse/jitter/scan/glance/blink）
   - 临界阻尼弹簧 + 表情形变插值 + 眨眼 + 注视 + 待机小动作 + 关键帧序列
   - 对外 SDK：`setEmotion / handleAIMessage / setGaze / clearGaze / spin / burst / bounce / on / off / startTour / stopTour / registerEmotion / destroy`

5. **自定义面板脚本（本仓库）**
   - 右下角品牌球：`EmotionBall.create(cornerEl, { emotion:'02', color:'#1a1a1a', eyeColor:'#f5f5f5', idle:false })`，点击 `spin(1)`
   - 32 张卡片缩略图：`EmotionBall.create(thumb, { emotion:id, autostart:false, eyeScale:1.4 })`（静态渲染，零帧成本）
   - 预览引擎：选中 → `setEmotion`；自定义颜色 → 销毁重建；大小滑块改容器尺寸
   - 注视：`pointermove` 给两个引擎 `setGaze`

## 关键 opts（`EmotionBall.create` 参数）

| 参数 | 含义 |
| --- | --- |
| `emotion` | 初始表情 id |
| `color` | 固定主题色（覆盖表情自带 `body.color`） |
| `eyeColor` | 眼睛颜色（默认黑眼睛时生效） |
| `eyeScale` | 小尺寸下放大眼睛占比 |
| `autostart: false` | 静态渲染一帧，不启动动画（缩略图用） |
| `lite` | 跳过彩带/撒花/zzz |
| `idle` | 待机自动切换 `{ standbyAfter, sleepAfter, standbyId, sleepId }` |
| `fallbackId` | 未知表情 id 时的兜底表情 |

## 开发约束

- **保持单文件**：`index.html` 必须内联全部依赖，不得引入外部 JS/CSS/字体/网络资源。
- **脚本顺序不可变**：rings → emotions → ball → engine → 面板，缺一不可。
- **表情 ID 是契约**：`00-41` 不可重排，新表情追加到 `EMOTION_SEED` 且落到正确分组。
- **缩略图用静态渲染**：卡片一律 `autostart:false`，不要为缩略图启动动画循环。
- **布局约束**：外层页面不滚动（`body { overflow: hidden }`），表情列表只在 `.emo-scroll` 内部滚动。
- 所有 SVG 用 `createElementNS` 创建；数据库/后端无关，纯前端。

## 验证

修改后：浏览器打开 `index.html`，确认 32 张缩略图正常、点击切换表情、鼠标注视、右下角球点击甩彩带；缩放到窄屏确认单列布局不溢出。

## 许可注意

派生自 [emotion-ball](https://github.com/sam70361/emotion-ball)，**非商用许可**：可免费查看、修改与注明出处地分享，禁止商业用途。修改代码时保留 `LICENSE` 中的版权声明，不得删除出处。
