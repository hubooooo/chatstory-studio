# ChatStory Studio 开源发布验收报告

2026-11-07 已获用户确认，完成公共仓库和 **v0.1.0 预发布**。这是预发布版本，不宣称稳定 v1.0.0。

| 项目 | 实际结果 |
|---|---|
| 公共仓库 | https://github.com/hubooooo/chatstory-studio |
| Release | https://github.com/hubooooo/chatstory-studio/releases/tag/v0.1.0 |
| 可见性与状态 | PUBLIC；非草稿；prerelease=true |
| 发布源码 Commit | d349e22e1038ea476adb33d80fb7f638c6f687d6 |
| 发布时间 | 2026-11-07 16:35:40，Asia/Shanghai |
| 通过的 CI | https://github.com/hubooooo/chatstory-studio/actions/runs/42355944377 |
| CI 检查 | Windows、Ubuntu、完整 Git 历史 Gitleaks 扫描全部通过；CI 与 Tag 指向同一提交 |
| 许可证 | 自有源码 MIT；依赖保留独立许可条件 |
| 安装器 | 未提供 Electron 安装器；提供源码 ZIP、Windows 启动脚本 |

## 远端验收

读取仓库、Release、Tag、CI 和附件 API，确认实际公开状态、提交和检查结果。22 个源码／视频／辅助产物核对 GitHub SHA-256 摘要与大小，加发布清单和校验清单共下载核验 24 个主要文件。下载的三个 MP4 再次通过 FFprobe 和 FFmpeg 完整解码：1080×1920、30 FPS、H.264 + AAC。

机器可读回执：[github-publication.json](github-publication.json)。本报告基于实际远端读取和下载验证，不以推送命令成功替代验收。发布后的文档回执提交可晚于 Tag，它不改变已标记版本的源码和附件。

## 工程质量和使用材料

15 项本地单元／Schema／媒体工具测试通过，0 失败、0 跳过。Windows 和 Ubuntu 远端执行类型检查、规范检查、构建、测试、依赖审计及真实离线重复渲染。编辑器导入、状态设置、保存重载、消息编辑、语音试听、界面导出和队列落盘均已实际执行。

架构见 ARCHITECTURE_REVIEW.md。渲染、代表帧、自动滚屏、实际语音时长、音画同步、重复帧哈希、预览／导出一致性见 RENDER_QA_REPORT.md。30 秒／60 秒渲染约 54／105 秒，进程树内存采样峰值约 1.57 GiB，具体环境和限制见 PERFORMANCE_REPORT.md。

README.md 和 README_EN.md 提供安装、Windows 启动、可运行 JSON、单条／批量命令、TTS、本地录音和故障处理。Release 提供源码 ZIP、三个成品视频、原始／准备后 JSON、字幕、缩略图、日志和媒体校验结果。

## 授权与安全

两个参考仓库在审计提交中缺少实际许可证文件，因此没有复制其源码或资产；保留了来源、Commit 和独立新增实现说明。自有源码为 MIT，Remotion 自定义许可对部分企业有额外授权要求；媒体工具、系统语音和在线服务保留各自条件，不宣称所有依赖都可无条件免费使用。

未上传用户项目、未审阅的录音／照片、运行依赖、缓存或凭证。公开语音、图片、音效和剧本均为审阅过的虚构示例。完整 Git 历史扫描包含根提交；初次 Action 的根提交范围和容器 Git 所有者问题均已实际修复并重跑通过。公共仓库已启用私密漏洞报告。

## 限制与维护

财务／名片卡片采用简化原创视觉；撤回是通知，不指定删除历史气泡；过高的单条消息需拆分；中断任务从头重渲染；没有 Electron 安装器。物理扬声器主观听感及全新操作系统验收不由本次自动验证替代。

更多主题、更丰富语音和动画、AI 剧本生成及模板／批量增强属于未来路线图。使用 Issues、贡献指南及安全策略维护项目。后续修复使用新版本，不覆盖已发布 Tag 或源码附件以隐藏差异。
