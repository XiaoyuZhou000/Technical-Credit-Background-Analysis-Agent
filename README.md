# Technical Credit Background Agent — Slidev

14 张英文幻灯片（13 张主讲 + 1 张备用），含中文 presenter notes。内容依据分享聊天及补充的 E2 调度提案，保留了 confirmed / proposed / open decision 的区别。

## 启动

需要 Node.js >= 18；本项目固定使用兼容本机 Node 20 的 Slidev 51.8.2。

```powershell
npm install
npm run dev
```

打开终端给出的地址。按右方向键或空格逐步展示；按 P 进入演讲者模式查看中文 notes。按 O 打开总览。

```powershell
npm run build
npm run export
```

`dist/` 是静态构建；通过 HTTP 服务器访问，不能直接双击 index.html。PDF 不保留交互动画。

## 演示节奏

- Slide 2：三次点击展示 Automatic / Responsive / Efficient。
- Slide 4：三次点击展示背景 Agent、共享 Detector、Labeling UI。
- Slide 6：四种调度机制、最早执行时间公式，以及待调优的 3s / 30s 建议起始值。
- Slide 7：四次点击讲述完整 storyboard。
- Slide 9：US-06–10 的验收标准和交付顺序。
- Slide 10：六次点击演示 Auto Save、防抖、去重、冷却及重启缓存，预期共两次调用。
- 其他页只在扩展目标或结论处使用轻量 reveal。

建议主讲约 10–12 分钟。所有 Sprint 1 功能和 call 数字均标注为计划或预期，未声称已经实现或测量。US-06–08 纳入 Sprint 1；US-09 在真实 detector 接入前完成；US-10 的配置入口留待后续 sprint。冷却期间的修改延后处理，不能丢弃。

## 内容依据

https://chatgpt.com/share/6af151b4-e5e4-83e8-ae7c-d8ebdfedcfef

根据用户补充的 Prof. Gorton 回复截图，已确认：双方在现有 VS Code extension repo 中使用独立分支，共享检测逻辑和既有 labeling UI；我们负责自动触发、异步调度、持久缓存及 AI 调用优化，另一组负责 Manual Agent 和检测模块。

团队已决定 Manual Agent 不共用 Background Agent 缓存；调度服务是否共享仍待确认。个人分工即将由 Xiaoyu 和 Yezhen 私下讨论确认，不预先指定个人任务。详细接口、3s / 30s 参数及具体构建/PR步骤仍为建议。

## 目录说明

- `slides.md`：正文和中文讲稿。
- `styles/index.css`：配色、布局和动画样式。
- `slide-bottom.vue`：所有页面（含封面）右下角动态显示当前页 / 总页数；总览和导出使用各自页面的页码。
- `package.json`：可搬移、重新安装的 Slidev 项目配置。

当前工作目录为 `E:\Wen\学习\NEU\CS6510\project`。已从 `CS6510-2026\tc-background-agent-slides` 复制源码，原目录保持不变。

本机已提供现有工作区中的依赖副本。若直接运行，使用 `npm run dev`、`npm run build` 和 `npm run export` 即可。在其他电脑上先运行 `npm install`。


## 验证结果

- 静态网页构建与 14 页 PDF 导出通过。
- 14 页已检查内容边界，验收表布局修正后复查通过；保留架构图字号修正和右侧大纲隐藏样式。
- 重点验证第 2、4、7、10 页的逐步展示。
- 本机依赖由现有工作区复制，未通过网络重新安装；跨机器安装仍需网络。
