'use strict';
// Use a dialog around an unchanged image; never crop or annotate the paper bitmap.
document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.createElement('dialog');
  dialog.className = 'zoom-dialog';
  dialog.setAttribute('aria-label', '图像放大阅读');
  dialog.innerHTML = '<div class="zoom-toolbar"><span>原图完整显示；可切换原尺寸并横向滚动。Esc 关闭。</span><div><button class="zoom-close" type="button" data-size>切换原尺寸</button> <button class="zoom-close" type="button" data-close>关闭</button></div></div><div class="zoom-body"><img alt=""></div>';
  document.body.append(dialog);
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.querySelector('[data-size]').onclick = () => dialog.classList.toggle('expanded');
  document.querySelectorAll('img[data-zoom]').forEach(img => {
    const open = () => {
      dialog.classList.remove('expanded');
      const target = dialog.querySelector('img'); target.src = img.src; target.alt = img.alt;
      dialog.showModal();
    };
    img.addEventListener('click', open);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'zoom-trigger'; button.textContent = '放大阅读 ↗'; button.setAttribute('aria-label', '放大：' + img.alt);
    const tools = document.createElement('div'); tools.className = 'figure-tools'; tools.append(button); img.after(tools); button.onclick = open;
  });
  document.querySelectorAll('table.mini-table').forEach(table => {
    if (table.parentElement.classList.contains('table-wrap')) return;
    const wrap = document.createElement('div'); wrap.className = 'table-wrap'; wrap.tabIndex = 0; wrap.setAttribute('role','region'); wrap.setAttribute('aria-label','表格，可横向滚动');table.before(wrap);wrap.append(table);
  });
  // Long chapters can exceed an IntersectionObserver's useful ratio thresholds.
  // Track chapter starts instead so the highlighted link matches the text on screen.
  const sections = [...document.querySelectorAll('[data-section]')];
  const links = [...document.querySelectorAll('#toc a')];
  let scheduled = false;
  function highlight() {
    scheduled = false;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 190) current = section;
      else break;
    }
    if (current) links.forEach(a => a.classList.toggle('active', a.hash === '#' + current.id));
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(highlight); } }, {passive:true});
  addEventListener('resize', highlight); highlight();
});
