# Aeneas 论文精读 · 独立学习网站

围绕 Assael et al., *Contextualizing ancient texts with generative neural networks*, Nature (2025) 的六讲研读路线。当前完成第一、二讲；后四讲只在首页保留规划卡片，不生成空白文章。

站点是完全静态的 HTML/CSS/JavaScript，不依赖 `hdy7031/ai-fable-notes`，不需要 MkDocs、Node、数据库或后端，也没有构建步骤。

## 线上地址

- 主页：https://hdy7031.github.io/aeneas-paper-study/
- 仓库：https://github.com/hdy7031/aeneas-paper-study
- 部署：GitHub Pages，`main` 分支根目录（Deploy from a branch）。

## 页面

- `index.html`：独立课程首页，展示 6 讲路线；只有第一、二讲可进入，其余为规划卡片。
- `lessons/01.html`：第一讲，从铭文学问题、平行铭文与传统检索讲到美因茨祭坛案例；含检索模式演示、三道测验和阅读进度。
- `lessons/02.html`：第二讲，从字符表示、Transformer、Attention、多任务训练讲到余弦相似度；含字符交互、上下文切换、注意力示意、余弦滑条、三道测验和阅读进度。

## 本地预览

直接打开 `index.html` 即可阅读；也可以在项目根目录运行：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。不要用 `file://` 与线上地址比较阅读进度：两者 origin 不同，`localStorage` 不会互相同步。

## 交互与进度

- 每讲有 6 个小节可标记“已掌握”，顶部和侧栏同步显示百分比。
- 进度保存在当前浏览器的 `localStorage`，键分别为 `aeneas-paper-study/lesson-01/v1` 与 `aeneas-paper-study/lesson-02/v1`，不跨设备同步。
- 第一讲包含“字面规则 / 历史特征”检索模式切换与三道测验。
- 第二讲包含 7 个字符的表示演示、缺口上下文切换、两组注意力示意、0°–180° 余弦滑条与三道测验。
- 交互数值、字符编号、注意力权重和二维向量均为教学模拟，不是 Aeneas 模型输出。

## 版权与图片来源

原论文以 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) 开放获取，但第三方图片材料需要单独判断：

- 论文 Fig. 1 的原照片为 The Metropolitan Museum of Art 公有领域藏品，论文图是包含作者数字重构的合成图。
- 论文 Extended Data Fig. 2 含 GDKE-Landesmuseum Mainz 摄影（Ursula Rudischer）与 CartoDB 地图等第三方材料，文章的 CC 许可不当然覆盖这些内容。

为遵守 NoDerivatives 条件并避免第三方授权风险，本站不内嵌这两张论文图，改为链接 Nature 官方图页，并在正文保留图注、署名和版权说明。第二讲所有图形、字符编号、示例向量与注意力权重均为原创 HTML/CSS/SVG/JavaScript 教学示意，不复制论文原图。

本站不包含论文完整 PDF、未公开研读报告、个人信息或与课程无关的文件。论文文字与图注的著作权归原作者及出版方；本站原创教学文字与交互代码仅用于非商业学习交流。

## 学术准确性

课程依据 Assael et al., *Contextualizing ancient texts with generative neural networks*, Nature (2025), DOI [10.1038/s41586-025-09292-5](https://doi.org/10.1038/s41586-025-09292-5) 的正文、图注与 Methods 整理。第二讲的字符 ID、示例向量、注意力权重及二维余弦演示均为教学模拟，不是 Aeneas 实际模型输出；读者应以论文 Fig. 2 与 Methods 为权威来源。

## 验证

2026-10-25 使用 Chromium 156 无头浏览器在 `1440×950` 与 `390×844` 两个视口完成 39 项检查，全部通过，运行期无 JS 异常、无本地资源加载失败：

- 首页 6 张课程卡片，只有第一、二讲可点击；4 张规划卡片没有指向不存在页面的链接。
- 第一、二讲桌面和手机均无横向溢出；第一讲 6 个目录锚点可跳转；两讲与首页互链正常。
- 第一讲检索模式切换、三道测验、阅读标记与 `localStorage` 持久化、清除记录均正常。
- 第二讲字符演示、缺口上下文切换、两组注意力示意、0°–180° 余弦滑条、三道测验、进度持久化与清除均正常。
- DOI、Nature 文章页、Fig. 1、Fig. 2、Extended Data Fig. 2 和 CC BY-NC-ND 4.0 页面均可打开（Nature 返回 200 并显示对应标题）。
