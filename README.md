# Aeneas 论文精读站

围绕 Assael et al., *Contextualizing ancient texts with generative neural networks*, Nature 645, 141–147 (2025)，[DOI](https://doi.org/10.1038/s41586-025-09292-5)。供计算机专业研一学生理解方法、准备约 20 分钟汇报。

线上：https://hdy7031.github.io/aeneas-paper-study/

纯静态 HTML / CSS / JavaScript，无构建步骤、外部字体、运行时库或后端。独立于 `ai-fable-notes`。GitHub Pages 从 `main` 根目录部署，保留 `.nojekyll`。

## 内容与文件

- `index.html`：六讲路线，只开放第一、二讲；第三至第六讲保留规划。
- `lessons/01.html`：历史问题、受损实物、平行铭文与美因茨案例；区分军事文书、美因茨祭坛和 Fig. 2 短语三个例子的角色。
- `lessons/02.html`：沿 `senatus` 讲字符 → ID → Embedding → 位置 → Q/K/V → Attention → 多头 → 完整层 → 16 层 → 任务头 → 训练 → 检索；附指标解读、课堂讲法、追问和 20 分钟提纲。
- `assets/course.css`：共用长文阅读样式，桌面两栏、手机单栏，公式换行与表格局部滚动。
- `assets/course.js`：原图 / 教学图放大、表格滚动容器、适合长章节的目录定位。
- `assets/lesson02.js`：数值计算台、多头合并、Fig. 2 定位、训练 / 推理切换、余弦交互与原进度键兼容。
- `assets/diagrams/`：10 张原创 SVG，按职责列于下表。
- `assets/paper/fig1.png`、`fig2.png`：完整原样论文图；[来源与许可](assets/paper/README.md)。

| 教学图 | 解释的难点 |
| --- | --- |
| characters.svg | 字符、地址 ID、可学习查表向量与矩阵维度 |
| context.svg | 同一个字符为什么有不同上下文表示 |
| qkv.svg | 同一输入通过三组独立投影产生 Q/K/V |
| heads.svg | 注意力头的并行、拼接与输出投影 |
| layer.svg | 官方实现的 Pre-norm、两条残差路径、Attention 与 FFN |
| depth.svg | 16 层更新表示，字符位置保持对齐 |
| fig2-map.svg | 按原文事实独立重绘文字、图像、任务与检索分支 |
| training.svg | 多任务损失怎样共同影响共享参数 |
| representations.svg | 字符向量、上下文序列与铭文检索向量的区别 |
| parallels.svg | 字面重合、社会功能、地域相同为何不是同一回事 |

Attention 的点积、缩放、Softmax、V 加权求和直接用原生 HTML / JS 展示逐步数值，不另用装饰性图片。图像均可通过有键盘入口的放大对话框查看。所有 ID、二维参数、权重与梯度数字均为教学模拟，不是 Aeneas 实际输出。

## 教学取舍与证据

只补理解当前计算所需的前置。向量、点积、矩阵乘法随例子解释；RoPE、ResNet、KL 散度先掌握用途；梯度的小算例可选展开。正文不要求先学完整线性代数或微积分。

重点区分 Self-Attention 的一般能力与 Aeneas 实现：官方 `T5DecoderLayer` 使用有效位 mask 而非 GPT 式因果遮罩；图像仅在地域头融合；检索聚合文字主干输出，不拼预测年份、省份或视觉向量。

论文与实现有两处需保留说明：Methods 同段的 384 / 1536 维度表述不一致，公开代码区分 emb_dim=384 与 mlp_dim=1536；Fig. 2 的 Add and normalize 概略图与公开实现 Pre-norm 的次序展示不同。课程公开这些差异，不将其无声改成同一说法。检索聚合公式保留原文分母 N。

实验部分明确 CER、Top-20、地域 Top-1/3、年代距区间边界的意义；Table 1 人机研究与 Table 2 自动评估分开。75% / 90% 为受试者反馈，不是检索准确率；案例相似不是历史因果证明，多任务收益也不等于完成逐组件消融。

## 进度兼容

原 localStorage 键保持不变：

- `aeneas-paper-study/lesson-01/v1`
- `aeneas-paper-study/lesson-02/v1`

两讲仍各有六个掌握标记。保留 `sections`、旧测验记录及第二讲其他已有字段；新版题目会提示重新作答。课程进度不跨浏览器、域名或设备同步。无法使用存储时仍可阅读与运行交互。

## 预览与验证

在根目录运行 `python -m http.server 8000`，访问 `http://localhost:8000/`；也可直接打开首页。使用 HTTP 预览时的进度和线上进度相互独立。

2026-10-25 升级验证：

- JavaScript 语法、10 张 SVG XML、页面本地资源与锚点检查。
- Chromium 1440×950 验证字符查表、三个查询位置、Attention 五步与播放、单 / 双头合并、原图模块定位、训练 / 推理、余弦极值、两讲测验、旧进度持久化与清除、图片放大 / Esc。
- 390×844 手机只作必要的布局与可读性快检；修复长公式换行，确认无页面横向溢出，表格在自身容器内滚动。
- 核对 s 的权重 `[0.401,0.198,0.401]`、V 汇总 `[0.802,2.000]`、双头输出 `[0.701,1.401]`；浏览器无脚本异常。
- 桌面与手机三页的本地图像实际加载，目录锚点有效；第三至第六讲无虚假文章入口。

验证截图和临时脚本保留于被 Git 忽略的 `_audit/`，不发布到课程站。
