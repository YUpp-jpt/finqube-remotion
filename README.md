# Finqube · 完整产品演绎 — Remotion

使用 React、CSS 与 SVG 重绘的 Finqube 竖屏产品演绎。包含完整动画源码、锁定依赖、内置字体、原创音轨、渲染与成片检查工具。

- 对应片段：[d6d4ea89-8987-44ea-b30e-3913b2580cd9](https://motionface.cc/?recording=d6d4ea89-8987-44ea-b30e-3913b2580cd9)
- Composition：`FinqubeFull`
- 画幅：720 × 1280，9:16
- 帧率与长度：60 fps，2722 帧，45.366667 秒
- 导出：H.264 / yuv420p + AAC，MP4

## 运行与渲染

需要 Node.js 22 或更新版本，以及 pnpm 11.25.0。首次安装会下载依赖、FFmpeg 和渲染浏览器；安装后画面、字体和配乐均使用本地资源。

```sh
pnpm install --frozen-lockfile
pnpm run studio
```

在 Remotion Studio 中选择 `FinqubeFull`，可逐帧查看全部分镜。

```sh
pnpm run check
pnpm run render
pnpm run verify
```

默认成片保存在 `renders/finqube.mp4`，检查报告保存在 `renders/verification.json`。输出目录不进入 Git。

```sh
pnpm run render -- --output renders/custom.mp4
pnpm run verify -- --input renders/custom.mp4 --report renders/custom-verification.json
pnpm run audio
```

## 编辑

`src/Finqube.tsx` 定义分镜、颜色、文案、帧号、卡片运镜、轨道、矢量表情与指针动画。`SCENES` 中的边界与参考主场景切点一致。所有运动只依赖帧号，不使用真实时钟、CSS transition 或非确定性随机数。

`src/components.tsx` 绘制可编辑的仪表盘、收入、发票、交易、支出及价格卡片。`src/Root.tsx` 注册画幅、帧率与长度。`tools/generate-audio.mjs` 从固定种子生成原创 120 BPM 电子配乐，可重新生成完全一致的 WAV。

## 复刻范围与素材

重建了参考的构图、绿色体系、主要英文文案、财务 UI、场景顺序和主要切点。细节为人工组件重绘，不是逐像素复制。字体使用随仓库分发的 Arimo（Arial 度量兼容替代），原片配乐由原创合成音轨替代，卡片微动与表情细节存在差异。

参考视频仅用于本地分析，不随仓库分发。签名下载地址和网站绑定凭证不进入源码、文档、提交或渲染日志。字体许可见 [public/fonts/OFL.txt](public/fonts/OFL.txt)，来源与时间线见 [docs/reference-analysis.md](docs/reference-analysis.md)。品牌文字仅用于对应参考片段的复刻演示。
