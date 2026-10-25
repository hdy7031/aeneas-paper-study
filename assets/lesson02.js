'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const key = 'aeneas-paper-study/lesson-02/v1';
  let state;
  try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch { state = {}; }
  if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};
  if (!Array.isArray(state.sections) || state.sections.length !== 6) state.sections = Array(6).fill(false);
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Private or full storage: reading stays usable. */ } };
  function progress() {
    const n = state.sections.filter(Boolean).length;
    $('mini-progress').textContent = n + ' / 6 小节';
    $('side-percent').textContent = Math.round(n / 6 * 100) + '%';
    ['reading-progress', 'side-bar'].forEach(id => $(id).style.width = n / 6 * 100 + '%');
    document.querySelectorAll('[data-mark]').forEach(b => {
      const yes = !!state.sections[+b.dataset.mark]; b.setAttribute('aria-pressed', String(yes));
      b.textContent = (yes ? '✓ ' : '□ ') + b.textContent.replace(/^[✓□]\s*/, '');
    });
  }
  document.querySelectorAll('[data-mark]').forEach(b => b.onclick = () => { const n = +b.dataset.mark; state.sections[n] = !state.sections[n]; save(); progress(); });
  progress();
  if (state.quiz !== undefined) $('quiz-summary').textContent = '保留的上次测验记录：' + (typeof state.quiz === 'number' ? state.quiz : state.quiz.score) + ' / 3。本次题目已升级，建议重新作答。';
  $('clear-progress').onclick = () => {
    if (!confirm('清除第二讲的学习进度和测验记录？')) return;
    state = { sections: Array(6).fill(false) }; save(); progress();
    document.querySelectorAll('input[type=radio]').forEach(e => e.checked = false);
    document.querySelectorAll('.feedback').forEach(e => e.textContent = ''); $('quiz-summary').textContent = '';
  };
  $('print-btn').onclick = () => window.print();
  const chars = [...'senatus'], ids = [17, 4, 11, 1, 18, 20, 17];
  const embedding = [[1, 0], [0, 1], [1, 1], [.5, -.5], [.2, .6], [-.3, .7], [1, 0]];
  const fmt = n => Number(n.toFixed(3)).toFixed(3);
  const vec = v => '[' + v.map(fmt).join(', ') + ']';
  chars.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.setAttribute('aria-label', '查看第 ' + (i + 1) + ' 个字符 ' + c);
    b.onclick = () => {
      [...$('char-tokens').children].forEach(e => e.setAttribute('aria-pressed', String(e === b)));
      $('char-result').innerHTML = '第 ' + (i + 1) + ' 个字符 <b>' + c + '</b> → 教学 ID ' + ids[i] + ' → 查表向量 <code>' + vec(embedding[i]) + '</code>。<br>' + (c === 's' ? '首尾两个 s 共用这行参数；位置与上下文会在后续计算中使表示不同。' : '这是查表阶段，尚未融入整句上下文。下一节用 s、e、n 的三个向量接着算。');
    };
    $('char-tokens').append(b);
  });
  $('char-tokens').firstElementChild.click();

  const X = [[1, 0], [0, 1], [1, 1]];
  const WQ = [[1, 0], [0, 1]], WK = [[1, 0], [0, 2]], WV = [[1, 1], [0, 2]];
  const dot = (a, b) => a.reduce((s, n, i) => s + n * b[i], 0);
  const mm = (a, b) => a.map(row => b[0].map((_, c) => row.reduce((sum, n, k) => sum + n * b[k][c], 0)));
  const Q = mm(X, WQ), K = mm(X, WK), V = mm(X, WV);
  function attention(query, keys, values) {
    const scores = keys.map(k => dot(query, k));
    const scaled = scores.map(n => n / Math.sqrt(query.length));
    const exponentials = scaled.map(Math.exp), total = exponentials.reduce((a, b) => a + b, 0);
    const weights = exponentials.map(n => n / total);
    const z = values[0].map((_, c) => weights.reduce((sum, n, i) => sum + n * values[i][c], 0));
    return { scores, scaled, exponentials, total, weights, z };
  }
  let query = 0, step = 0, timer = null;
  const names = ['① 投影', '② 点积', '③ 缩放', '④ Softmax', '⑤ 汇总 V'];
  function stop() { clearInterval(timer); timer = null; $('att-play').textContent = '逐步播放'; }
  names.forEach((name, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.dataset.step = i;
    b.onclick = () => { stop(); step = i; drawAttention(); }; $('attention-steps').append(b);
  });
  function drawAttention() {
    const a = attention(Q[query], K, V), c = chars[query];
    const panels = [
      '<h4>① 为 ' + c + ' 产生 Q，也为全部位置产生 K/V</h4>输入 x=' + vec(X[query]) + '，q=xWQ=' + vec(Q[query]) + '。<br>K 三行为 ' + K.map(vec).join('、') + '。<br>V 三行为 ' + V.map(vec).join('、') + '。<p>输入 X(3×2)，输出 Q/K/V 各为 3×2。本步只是投影，尚未分配权重。</p>',
      '<h4>② 用 q 对照三个 K，得到一行分数</h4>q=' + vec(Q[query]) + '<br>' + K.map((k, j) => c + '→' + chars[j] + '：' + Q[query].map((n, i) => n + '×' + k[i]).join('+') + '=' + fmt(a.scores[j])).join('<br>') + '<p>这一行得到 ' + vec(a.scores) + '，维度 1×3；整批查询一起算为 QKᵀ(3×3)。</p>',
      '<h4>③ 控制分数幅度</h4>' + vec(a.scores) + ' / √2 = ' + vec(a.scaled) + '<p>维度仍为 1×3，数值还不是概率。2 是每头 Q/K 的维数，不是字符个数 3。</p>',
      '<h4>④ Softmax：一行分数变成总和为 1 的权重</h4>exp(分数) ≈ ' + vec(a.exponentials) + '<br>指数之和 ≈ ' + fmt(a.total) + '<br>分别除以总和：α ≈ ' + vec(a.weights) + '<p>权重作用于 s、e、n 三个位置，不等同于字符修复概率或历史置信度。</p>',
      '<h4>⑤ 按 α 汇总三个 V</h4>' + a.weights.map((w, j) => fmt(w) + ' × ' + vec(V[j])).join(' + ') + '<br><b>z' + c + ' ≈ ' + vec(a.z) + '</b><p>1×3 权重乘 3×2 的 V，输出 1×2。这个位置参考了自己与另外两个位置；它还是中间表示，需要后续层和任务头。</p>'
    ];
    $('attention-output').innerHTML = panels[step];
    $('att-prev').disabled = step === 0; $('att-next').disabled = step === 4;
    document.querySelectorAll('[data-step]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.step === step)));
    document.querySelectorAll('[data-query]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.query === query)));
    $('attention-bars').innerHTML = step < 3 ? '' : a.weights.map((w, i) => '<div class="weight-row"><span>' + chars[i] + '</span><div class="weight-bar"><i style="width:' + w * 100 + '%"></i></div><span>' + (w * 100).toFixed(1) + '%</span></div>').join('');
    $('attention-bar-note').textContent = step < 3 ? '权重在 Softmax 一步出现；此前先理解分数。' : '当前查询 ' + c + ' 参考 s、e、n 的权重。每次换字符，重新取对应的 Q 行计算，不是读取真实模型。';
  }
  document.querySelectorAll('[data-query]').forEach(b => b.onclick = () => { stop(); query = +b.dataset.query; drawAttention(); });
  $('att-prev').onclick = () => { stop(); step = Math.max(0, step - 1); drawAttention(); };
  $('att-next').onclick = () => { stop(); step = Math.min(4, step + 1); drawAttention(); };
  $('att-play').onclick = () => {
    if (timer) { stop(); return; }
    step = 0; drawAttention(); $('att-play').textContent = '暂停播放';
    timer = setInterval(() => { step++; drawAttention(); if (step === 4) stop(); }, 5500);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  drawAttention();

  function drawHeads(mode) {
    const a = attention(Q[0], K, V);
    const q2 = mm(X, [[0, 1], [1, 0]]), a2 = attention(q2[0], X, X);
    const concatenated = [...a.z, ...a2.z];
    const WO = [[.5, 0], [0, .5], [.5, 0], [0, .5]], z = mm([concatenated], WO)[0];
    $('head-output').innerHTML = mode === 'single' ? '<h4>头 1 沿用刚才的配方</h4>对 s，α≈' + vec(a.weights) + '，输出 z₁≈' + vec(a.z) + '。<p>这是一种信息组合；另一头可以用不同参数比较同样的位置。</p>' : '<h4>头 2 使用另一套配方，再合并</h4>WQ₂=[[0,1],[1,0]]，WK₂=WV₂=单位矩阵。<br>s 的 q₂=[0,1]，分数=[0,1,1]；经 √2 缩放和 Softmax 得 α₂≈' + vec(a2.weights) + '。<br>用 V₂=X 汇总：z₂≈' + vec(a2.z) + '。<br>拼接 [z₁,z₂]≈' + vec(concatenated) + '，从 1×2 变为 1×4。<br>本例 WO=[[0.5,0],[0,0.5],[0.5,0],[0,0.5]]，投影回 1×2：<b>' + vec(z) + '</b>。<p>真实 WO 是可学习参数，不要求简单平均。这里特意选简单配方方便验算。</p>';
    document.querySelectorAll('[data-head]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.head === mode)));
  }
  document.querySelectorAll('[data-head]').forEach(b => b.onclick = () => drawHeads(b.dataset.head)); drawHeads('single');
  const modules = {
    input: '<b>① 看原图最上方：照片与 Senatus… 转录。</b><p>文字已经转录，模型不是先在这里做 OCR。字符中可有缺损标记，另加前缀位置。照片与文字是两条输入路径。</p>',
    torso: '<b>② 看原图右侧的 Torso decoder 与 ×16。</b><p>文字经过字符 Embedding 与 16 层加工；本课第三节正是在展开这个方块。输出仍是一串与位置对齐的向量，而不是一句翻译。</p>',
    restoration: '<b>③ 看中部最下面的任务头，沿向左箭头到 Restoration。</b><p>图中输出 s e n a t 补在 #us 前，得到 senatus；未知长度判断的细节需结合 Methods。缺口表示用于预测，任务头不是注意力头。搜索可反复前向补字，不按 GPT 单向生成解释。</p>',
    date: '<b>④ 看左侧 Date 的黄色分布，向右追溯到中间任务头。</b><p>前缀 h₁ 输入年代头，输出 160 个十年区间的概率。分布保留不确定性；它不是检索时追加的年份标签。</p>',
    region: '<b>⑤ 沿原图照片 → Vision 网络 → Geographical attribution 的线找。</b><p>照片的特征与文字前缀表示在地域头融合。它没有先回到文字主干再流向修复、年代、检索。ResNet 只需先理解为图像特征提取器。</p>',
    retrieval: '<b>⑥ 看原图底部：Contextualization 与铭文候选。</b><p>主干的前缀与其余文字表示聚合为铭文向量，用余弦相似度在 LED 训练集中排序。输出是真实记录；相似分数没有证明历史关系。</p>'
  };
  function drawModule(name) { $('module-note').innerHTML = modules[name]; document.querySelectorAll('[data-module]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.module === name))); }
  document.querySelectorAll('[data-module]').forEach(b => b.onclick = () => drawModule(b.dataset.module)); drawModule('input');
  function drawFlow(mode) {
    const lines = mode === 'train' ? ['训练铭文 + 可用年代 / 地域标注；人为遮挡字符', '前向：Embedding → 主干 → 任务头 → 预测', '与参考目标比较 → 加权 Loss', '反向：梯度经过任务头回到共享主干', '优化器更新参数 θ（训练才有）'] : ['新铭文 + 可用照片；使用固定参数 θ', '前向：Embedding → 主干 → 任务头 / 向量聚合', '输出修复与归属候选 / 相似铭文', '学者核对史料；本次查询不更新 θ'];
    $('flow-output').innerHTML = '<div class="flow-grid">' + lines.map((s, i) => (i ? '<div class="flow-arrow">↓</div>' : '') + '<div class="' + (mode === 'train' && i > 2 ? 'backward' : '') + '">' + s + '</div>').join('') + '</div><p class="micro">' + (mode === 'train' ? '相同共享参数接收多个任务的误差；没有地域标签时不应凭空提供地域监督。' : '修复搜索可多次调用前向网络；多次前向计算仍然不是重新训练。') + '</p>';
    document.querySelectorAll('[data-flow]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.flow === mode)));
  }
  document.querySelectorAll('[data-flow]').forEach(b => b.onclick = () => drawFlow(b.dataset.flow)); drawFlow('train');
  function drawAngle() {
    const angle = +$('vec-angle').value, rad = angle * Math.PI / 180;
    const x = 270 + 185 * Math.cos(rad), y = 230 - 185 * Math.sin(rad);
    $('candidate-vector').setAttribute('x2', x); $('candidate-vector').setAttribute('y2', y);
    $('candidate-label').setAttribute('x', x + 10); $('candidate-label').setAttribute('y', y - 10);
    $('angle-value').textContent = angle + '°'; $('cos-value').textContent = Math.cos(rad).toFixed(3);
    $('vector-explain').textContent = angle === 0 ? '同向：余弦为 1。只能说明方向一致，不能证明史实。' : angle === 90 ? '垂直：余弦为 0。相似分数不是正确率。' : angle === 180 ? '反向：余弦为 −1。仍然是几何关系。' : '角度越小，方向越接近；它只排序模型空间中的相似程度。';
  }
  $('vec-angle').addEventListener('input', drawAngle); drawAngle();
  const feedback = ['Attention 的权重乘的是 V，结果仍为上下文加工中的向量，不是最后修复答案。', '训练任务通过梯度塑造共享表示；推理时不重新训练，也不直接拼入预测年份。', '有效位 mask 允许参考两侧；图像在地域头才融合；检索使用文字主干表示。'];
  $('grade').onclick = () => {
    let correct = 0;
    document.querySelectorAll('.quiz-card').forEach((box, i) => {
      const answer = box.querySelector('input:checked'), yes = answer && answer.value === box.dataset.answer;
      if (yes) correct++;
      box.querySelector('.feedback').textContent = (!answer ? '尚未作答。' : yes ? '正确。' : '再想一下。') + feedback[i];
    });
    $('quiz-summary').textContent = '本次得分：' + correct + ' / 3。能解释原因比选中答案更重要。'; state.quiz = correct; save();
  };
})();
