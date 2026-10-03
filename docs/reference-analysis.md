# 参考分析与重建说明

参考页面：https://motionface.cc/?recording=d6d4ea89-8987-44ea-b30e-3913b2580cd9

参考视频实测为 720 × 1280、60 fps、H.264，视频 2722 帧 / 45.366667 秒，AAC 48 kHz 双声道音轨延伸至约 45.418667 秒。重建以视频帧数为准。

## 主要切点

| 帧范围（末端不含） | 时间 | 画面与动作 |
| --- | --- | --- |
| 0–210 | 0–3.5s | 浅色绿光背景，Are You a / Freelancer / Creator，绿色高亮与旋转弧形 |
| 210–480 | 3.5–8s | 深绿色背景，Still Managing / Finances / through，XLS 卡片与 Client $$$ 提示条 |
| 480–720 | 8–12s | 半透明漏斗与荧光绿底部，Payments / Expenses / Where is my Money?，散落的 XLS |
| 720–948 | 12–15.8s | 暗色仪表盘进入浅色背景，侧向滑动露出 AI Powered Finance Manager |
| 948–1140 | 15.8–19s | Built For，三层虚线轨道，Freelancer / Creator / Consultant 圆形标识 |
| 1140–1500 | 19–25s | 卡片空间运镜：Track Income / Manage Invoices / Organize Transactions / Understand Business |
| 1500–1650 | 25–27.5s | 浅色仪表盘与 Simple / Workspace，周边浮动卡片 |
| 1650–1740 | 27.5–29s | The Best Part?，暗色仪表盘与六个功能标签 |
| 1740–1920 | 29–32s | Completely FREE!! to Start / Until You Wanna Upgrade，漂浮表情 |
| 1920–2190 | 32–36.5s | That too at / no monthly Subscription，$14.90 One Time Payment 价格卡与指针 |
| 2190–2320 | 36.5–38.666667s | 浅色背景与浮动卡片，∞ Lifetime Access |
| 2320–2722 | 38.666667–45.366667s | finqube 品牌、Join the Waitlist、暗色仪表盘、www.finqube.one、Join Now |

深绿色基底约为 `#002c1e`，浅色基底为 `#fbfff6`，标题荧光绿为 `#cbff67`，卡片为接近白色；收入曲线和数据为绿，支出环图为绿、蓝、橙。背景采用大面积模糊光团，财务卡片采用透视、轻微倾斜与连续运镜。

参考音轨不是静音。本地测量约 -15.81 LUFS，true peak 约 -0.06 dBTP；未将该音轨复制入仓库。重建音轨为独立编写的鼓组、低音、分解和弦、氛围和转场音效，不包含外部采样。

## 可分发资源

- 界面与图形：本次独立编写的 React / CSS / SVG 源码。
- 配乐：`tools/generate-audio.mjs` 原创确定性合成，`public/audio/soundtrack.wav` 为生成结果。
- 字体：Arimo variable，来自 [Google Fonts 的 Arimo 目录](https://github.com/google/fonts/tree/main/ofl/arimo)，随仓库保留原始 OFL 许可。
- 原视频与检查帧保留在本地分析目录，未提交到公开仓库。

## 差异

动画主场景切点与源视频一致，标题和主要财务数字复用参考画面；字体、音乐、表情样式、部分细小卡片排版和运动曲线是独立重建。该工程适合进一步精调与导出，不宣称逐像素或音频波形一致。
