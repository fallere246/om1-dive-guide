(() => {
  'use strict';

  // localStorage はプライベートモード等で使えないことがあるので必ず try/catch
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* noop */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* noop */ } },
  };
  const PREFIX = 'om1dive:';

  /* ---------- テーマ切替 ---------- */
  const root = document.documentElement;
  const savedTheme = store.get(PREFIX + 'theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  document.getElementById('themeBtn')?.addEventListener('click', () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    store.set(PREFIX + 'theme', root.dataset.theme);
  });

  /* ---------- チェックボックスの保存 ---------- */
  const boxes = document.querySelectorAll('input[type="checkbox"][data-key]');
  const syncStep = (box) => {
    const li = box.closest('ol.steps > li');
    if (li) li.classList.toggle('done', box.checked);
  };
  const updateProgress = () => {
    document.querySelectorAll('[data-checklist]').forEach((card) => {
      const all = card.querySelectorAll('input[data-key]');
      const done = [...all].filter((b) => b.checked).length;
      const p = card.querySelector('.progress');
      if (p) p.textContent = `${done} / ${all.length}`;
    });
  };
  boxes.forEach((box) => {
    box.checked = store.get(PREFIX + box.dataset.key) === '1';
    syncStep(box);
    box.addEventListener('change', () => {
      if (box.checked) store.set(PREFIX + box.dataset.key, '1');
      else store.del(PREFIX + box.dataset.key);
      syncStep(box);
      updateProgress();
    });
  });
  updateProgress();

  const clearBoxes = (scope) => {
    scope.forEach((el) => el.querySelectorAll('input[data-key]').forEach((b) => {
      b.checked = false; store.del(PREFIX + b.dataset.key); syncStep(b);
    }));
    updateProgress();
  };
  document.querySelectorAll('[data-reset]').forEach((btn) => btn.addEventListener('click', () => {
    if (!confirm('チェックをすべて外しますか？')) return;
    const names = btn.dataset.reset.split(/\s+/);
    clearBoxes(names.map((n) => document.querySelector(`[data-checklist="${n}"]`)).filter(Boolean));
  }));
  document.querySelectorAll('[data-reset-steps]').forEach((btn) => btn.addEventListener('click', () => {
    if (!confirm('手順のチェックをすべて外しますか？')) return;
    clearBoxes([...document.querySelectorAll(`ol.steps[data-steps="${btn.dataset.resetSteps}"]`)]);
  }));

  /* ---------- タイマー ---------- */
  let audioCtx = null;
  const beep = () => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach((t) => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
        o.frequency.value = 880; g.gain.value = 0.2;
        o.connect(g).connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.2);
      });
    } catch { /* noop */ }
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
  };
  const fmt = (s) => {
    const m = Math.floor(s / 60); const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };
  document.querySelectorAll('[data-timer]').forEach((el) => {
    const disp = el.querySelector('.display');
    let endAt = 0; let id = 0;
    const stop = () => { clearInterval(id); id = 0; };
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      disp.textContent = fmt(left);
      if (left === 0) { stop(); el.classList.add('finished'); beep(); }
    };
    el.querySelectorAll('[data-sec]').forEach((b) => b.addEventListener('click', () => {
      // ユーザー操作の中で AudioContext を作っておく（iOS は操作なしで音を鳴らせないため）
      try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch { /* noop */ }
      stop(); el.classList.remove('finished');
      endAt = Date.now() + Number(b.dataset.sec) * 1000;
      tick(); id = setInterval(tick, 250);
    }));
    el.querySelector('[data-stop]')?.addEventListener('click', () => {
      stop(); el.classList.remove('finished'); disp.textContent = fmt(0);
    });
  });

  /* ---------- LED 点滅の一時停止 ---------- */
  const ledBtn = document.getElementById('ledPause');
  ledBtn?.addEventListener('click', () => {
    const paused = document.body.classList.toggle('led-pause');
    ledBtn.textContent = paused ? '点滅を再開' : '点滅を止める';
  });

  /* ---------- 画像の拡大表示 ---------- */
  const lb = document.getElementById('lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const lbImg = lb.querySelector('img');
    document.querySelectorAll('img.zoomable').forEach((img) => img.addEventListener('click', () => {
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lb.showModal();
    }));
    lb.addEventListener('click', () => lb.close());
  }

  /* ---------- 目次のハイライトと先頭へボタン ---------- */
  const links = [...document.querySelectorAll('.toc a')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      const a = map.get(e.target.id);
      if (a) {
        a.classList.add('active');
        // scrollIntoView は sticky の目次ごとページを縦に動かしてしまうので、目次の横スクロールだけを動かす
        const ul = a.parentElement.parentElement;
        ul.scrollTo({ left: a.offsetLeft - ul.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));

  const toTop = document.getElementById('toTop');
  addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0 }));

  /* ---------- オフライン対応 ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
