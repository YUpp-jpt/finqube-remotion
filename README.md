# Finqube · 完整产品演绎 — Remotion

使用 React、CSS、SVG 与 WebGL 重建的 Finqube 竖屏产品演绎。新版重新校准了共享空间镜头、逐词回弹、荧光引导轨迹、卡片比例、流动光场和 19–25 秒鱼眼巡游。

- 对应片段：[d6d4ea89-8987-44ea-b30e-3913b2580cd9](https://motionface.cc/?recording=d6d4ea89-8987-44ea-b30e-3913b2580cd9)
- Composition：`FinqubeFull`
- 画幅：720 × 1280，9:16
- 帧率与长度：60 fps，2722 帧，45.366667 秒
- 导出：H.264 / yuv420p + AAC，MP4

## 运行与渲染

需要 Node.js 22 或更新版本，以及 pnpm 11.25.0。首次渲染会下载 Chrome Headless Shell。19–25 秒镜片使用 WebGL，渲染浏览器需要支持 WebGL。

```sh
pnpm install --frozen-lockfile
pnpm run studio
```

在 Remotion Studio 中选择 `FinqubeFull`，可逐帧查看全部分镜。Studio 和 render 都会先从可编辑的源场景生成 6 秒中间素材；源码不变时会复用本地缓存。

```sh
pnpm run check
pnpm run render
pnpm run verify
```

默认成片保存在 `renders/finqube.mp4`，检查报告保存在 `renders/verification.json`。输出与 `public/card-tour-source.mp4` 中间素材不进入 Git；其生成源码完整保留在仓库中。

```sh
pnpm run render -- --output renders/custom.mp4
pnpm run verify -- --input renders/custom.mp4 --report renders/custom-verification.json
pnpm run audio
```

## 编辑

`src/SceneFilm.tsx` 编排整片分镜、文字、轨道、周边卡片、价格和片尾；`src/Stage.tsx` 定义共享 3D 世界、逐词回弹、全局光场及引导轨迹。`src/guide-trajectory.ts` 存储从用户提供的参考视频测得的光迹坐标，所有运动只依赖帧号。

`src/CardTour.tsx` 定义 19–25 秒卡片空间、投影矩阵、分轴镜头速度、逐卡运动模糊和附着卡片的字幕。`src/Lens.tsx` 对本工程生成的中间帧做连续解析径向采样，避免 8 位 SVG 位移图的台阶。`src/TourField.tsx` 定义该镜头随相机变化的光场。

`src/components.tsx` 绘制可编辑的仪表盘、收入、发票、交易、支出及价格卡片。`src/Root.tsx` 注册画幅、帧率与长度。`tools/generate-audio.mjs` 从固定种子生成原创 120 BPM 电子配乐，可重新生成完全一致的 WAV。

## 复刻范围与素材

重建了参考的构图、绿色体系、主要英文文案、财务 UI、空间运镜及主要切点。新版以原视频的密集时序采样和用户提供的[效果模板](https://github.com/guangjun5952/motionface-finqube-full-template)进行参数校准。当前工程为独立重绘，参考模板的原音轨和源代码文件未并入本仓库。

字体优先使用本机 Arial，随仓库分发 Arimo 作为兼容回退；表情使用浏览器的原生彩色字形。原片配乐由原创合成音轨替代。字体字形、部分界面细节与音乐仍有差异，不宣称逐像素一致。

参考视频仅用于本地分析，不随仓库分发。签名下载地址和网站绑定凭证不进入源码、文档、提交或渲染日志。字体许可见 [public/fonts/OFL.txt](public/fonts/OFL.txt)，来源与时间线见 [docs/reference-analysis.md](docs/reference-analysis.md)。品牌文字仅用于对应参考片段的复刻演示。
