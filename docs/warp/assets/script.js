// 側欄開合（行動裝置）
const toggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
if (toggle && sidebar) {
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  sidebar.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') sidebar.classList.remove('open');
  });
}

// 程式碼複製按鈕
document.querySelectorAll('.markdown-body pre').forEach((pre) => {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = '複製';
  btn.addEventListener('click', async () => {
    const code = pre.querySelector('code');
    try {
      await navigator.clipboard.writeText(code ? code.innerText : pre.innerText);
      btn.textContent = '已複製 ✓';
    } catch {
      btn.textContent = '複製失敗';
    }
    setTimeout(() => (btn.textContent = '複製'), 1600);
  });
  pre.appendChild(btn);
});

// 目錄捲動高亮（scroll spy）
const tocLinks = Array.from(document.querySelectorAll('.toc a'));
if (tocLinks.length) {
  const map = new Map();
  tocLinks.forEach((a) => {
    const id = decodeURIComponent(a.hash.slice(1));
    const h = document.getElementById(id);
    if (h) map.set(h, a);
  });
  const headings = Array.from(map.keys());
  let current = null;
  const setActive = (link) => {
    if (current === link) return;
    tocLinks.forEach((a) => a.classList.remove('active'));
    if (link) {
      link.classList.add('active');
      current = link;
    }
  };
  const onScroll = () => {
    const y = window.scrollY + 90;
    let best = null;
    for (const h of headings) {
      if (h.offsetTop <= y) best = h;
      else break;
    }
    setActive(best ? map.get(best) : null);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 外部連結開新分頁
document.querySelectorAll('.markdown-body a[href^="http"]').forEach((a) => {
  a.target = '_blank';
  a.rel = 'noopener';
});
