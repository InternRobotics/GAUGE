(function () {
  const CATEGORY_LABELS = { all: 'All 22', rigid: 'Rigid Body', cable: 'Cable', textile: 'Textile', 'soft-body': 'Soft Body' };
  const state = { category: 'all', search: '', sceneId: 'C3', material: 'wood', mode: 'standard' };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 639px)').matches;

  const esc = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const currentScene = () => GAUGE_SCENES.find((scene) => scene.id === state.sceneId);
  const getSceneValue = (value) => typeof value === 'object' && !Array.isArray(value) ? value[state.material] : value;

  const filterWrap = document.querySelector('#category-filters');
  Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.category = key;
    button.setAttribute('aria-pressed', key === state.category ? 'true' : 'false');
    button.addEventListener('click', () => {
      state.category = key;
      filterWrap.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      renderTasks();
    });
    filterWrap.append(button);
  });

  document.querySelector('#task-search').addEventListener('input', (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderTasks();
  });

  let taskObserver;
  const setupTaskObserver = () => {
    if (taskObserver) taskObserver.disconnect();
    const active = new Set();
    taskObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (!video.src) video.src = video.dataset.src;
          if (!prefersReducedMotion && !isMobile() && active.size < 3) {
            video.muted = true;
            video.play().then(() => active.add(video)).catch(() => {});
          }
        } else {
          video.pause();
          active.delete(video);
        }
      });
    }, { rootMargin: '220px 0px', threshold: 0.28 });
    document.querySelectorAll('.task-video').forEach((video) => taskObserver.observe(video));
  };

  function renderTasks() {
    const visible = GAUGE_TASKS.filter((task) => {
      const categoryMatch = state.category === 'all' || task.category === state.category;
      const haystack = `${task.title} ${task.description} ${task.physics.join(' ')} ${task.materials.join(' ')}`.toLowerCase();
      return categoryMatch && (!state.search || haystack.includes(state.search));
    });
    document.querySelector('#task-count').textContent = `${visible.length} ${visible.length === 1 ? 'task' : 'tasks'}`;
    document.querySelector('#task-grid').innerHTML = visible.map((task) => `
      <article class="task-card" data-task-id="${task.id}">
        <div class="video-frame">
          <video class="task-video" data-src="${encodeURI(task.video)}" muted loop playsinline preload="none" controls aria-label="Real-world trial for ${esc(task.title)}"></video>
          <span class="source-tag real-source">Real-world trial</span>
        </div>
        <div class="task-meta"><span>TASK ${String(task.id).padStart(2, '0')}</span><span>${CATEGORY_LABELS[task.category]}</span></div>
        <h3>${esc(task.title)}</h3>
        <p>${esc(task.description)}</p>
        <div class="tag-list">${task.physics.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
        <div class="card-footer"><span>${esc(task.materials.join(' · '))}</span><button type="button" data-open-task="${task.id}">View details <span aria-hidden="true">↗</span></button></div>
      </article>
    `).join('') || '<p class="empty-state">No tasks match this filter.</p>';
    setupTaskObserver();
  }

  const taskDialog = document.querySelector('#task-dialog');
  document.querySelector('#task-grid').addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-task]');
    if (!trigger) return;
    const task = GAUGE_TASKS.find((item) => item.id === Number(trigger.dataset.openTask));
    document.querySelector('#task-dialog-content').innerHTML = `
      <div class="dialog-kicker">TASK ${String(task.id).padStart(2, '0')} · ${CATEGORY_LABELS[task.category]}</div>
      <h2>${esc(task.title)}</h2>
      <p class="dialog-lede">${esc(task.description)}</p>
      <video src="${encodeURI(task.video)}" controls playsinline preload="metadata" aria-label="Full real-world video for ${esc(task.title)}"></video>
      <dl>
        <div><dt>Target physics</dt><dd>${esc(task.physics.join(', '))}</dd></div>
        <div><dt>Materials</dt><dd>${esc(task.materials.join(', '))}</dd></div>
        <div><dt>Source</dt><dd>Controlled real-world experiment</dd></div>
        <div><dt>Observation</dt><dd>Motion-capture trajectory and task-specific physical observables</dd></div>
      </dl>`;
    taskDialog.showModal();
  });

  document.querySelectorAll('.dialog-close').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  }));
  taskDialog.addEventListener('close', () => {
    const video = taskDialog.querySelector('video');
    if (video) { video.pause(); video.removeAttribute('src'); }
  });

  const sceneTabs = document.querySelector('#scene-tabs');
  GAUGE_SCENES.forEach((scene) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${scene.id} · ${scene.title}`;
    button.dataset.scene = scene.id;
    button.addEventListener('click', () => {
      state.sceneId = scene.id;
      state.material = scene.materials[0] || '';
      renderExplorer();
    });
    sceneTabs.append(button);
  });

  document.querySelector('#material-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-material]');
    if (!button) return;
    state.material = button.dataset.material;
    renderExplorer();
  });

  const modeTabs = document.querySelector('#mode-tabs');
  [['standard', 'Standard'], ['physics', 'Physics Negative']].forEach(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label; button.dataset.mode = value;
    button.addEventListener('click', () => { state.mode = value; renderExplorer(); });
    modeTabs.append(button);
  });

  function setSelected(container, selector, value, attribute) {
    container.querySelectorAll(selector).forEach((button) => {
      const selected = button.dataset[attribute] === value;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function renderExplorer() {
    const scene = currentScene();
    setSelected(sceneTabs, 'button', scene.id, 'scene');
    setSelected(modeTabs, 'button', state.mode, 'mode');
    const materialControl = document.querySelector('#material-control');
    const materialTabs = document.querySelector('#material-tabs');
    materialControl.hidden = scene.materials.length === 0;
    materialTabs.innerHTML = scene.materials.map((material) => `<button type="button" data-material="${material}" class="${material === state.material ? 'is-selected' : ''}" aria-pressed="${material === state.material}">${material[0].toUpperCase() + material.slice(1)}</button>`).join('');

    const frame = getSceneValue(scene.frame);
    const metadata = getSceneValue(scene.metadata);
    const prompt = getSceneValue(scene.prompt);
    document.querySelector('#input-panel').innerHTML = `
      <span class="panel-source real-source">Shared input frame</span>
      <img src="${frame}" alt="Shared first frame for ${esc(scene.title)}${state.material ? ` with ${state.material} material` : ''}" />
      <div class="input-title"><span>${scene.id}</span><h3>${esc(scene.title)}</h3></div>
      <dl>${metadata.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
      <details>
        <summary>Verified positive prompt <span>Paper Appendix C.1.1</span></summary>
        <p>${esc(prompt)}</p>
        <button class="copy-prompt" type="button">Copy prompt</button>
      </details>
      ${state.mode === 'physics' ? `<details><summary>Physical realism negative prompt <span>493 characters</span></summary><p>${esc(NEGATIVE_PROMPT)}</p></details>` : ''}
      <p class="prompt-note">Prompt text is preserved from the paper, including source wording inconsistencies.</p>`;

    document.querySelector('#model-grid').innerHTML = WORLD_MODELS.map((model) => {
      const video = getWorldModelVideo(model, scene, state.material, state.mode);
      if (!video) return `
        <article class="model-card unavailable">
          <div class="model-head"><div><span>Video world model</span><h3>${model.name}</h3></div><small>${model.resolution}</small></div>
          <div class="unavailable-message"><span aria-hidden="true">—</span><p>Not available for this interface</p><small>This model does not expose a separate negative-prompt field.</small></div>
        </article>`;
      return `
        <article class="model-card">
          <div class="model-head"><div><span>Video world model</span><h3>${model.name}</h3></div><small>${model.resolution}</small></div>
          <video src="${encodeURI(video)}" controls muted loop playsinline preload="metadata" aria-label="${model.name} output for ${esc(scene.title)}"></video>
          <div class="metric-row"><span>${esc(scene.metric)}</span><button type="button" data-enlarge="${model.id}">Enlarge</button></div>
        </article>`;
    }).join('');
  }

  document.querySelector('#input-panel').addEventListener('click', async (event) => {
    const button = event.target.closest('.copy-prompt');
    if (!button) return;
    await navigator.clipboard.writeText(getSceneValue(currentScene().prompt));
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = 'Copy prompt'; }, 1400);
  });

  document.querySelector('.playback-controls').addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-playback]');
    if (!trigger) return;
    const videos = [...document.querySelectorAll('#model-grid video')];
    if (trigger.dataset.playback === 'play') videos.forEach((video) => video.play().catch(() => {}));
    if (trigger.dataset.playback === 'pause') videos.forEach((video) => video.pause());
    if (trigger.dataset.playback === 'restart') videos.forEach((video) => { video.currentTime = 0; video.play().catch(() => {}); });
  });

  const videoDialog = document.querySelector('#video-dialog');
  document.querySelector('#model-grid').addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-enlarge]');
    if (!trigger) return;
    const sourceCard = trigger.closest('.model-card');
    const sourceVideo = sourceCard.querySelector('video');
    const title = sourceCard.querySelector('h3').textContent;
    document.querySelector('#video-dialog-content').innerHTML = `<h2>${esc(title)} · ${esc(currentScene().title)}</h2><video src="${sourceVideo.src}" controls autoplay muted loop playsinline></video>`;
    videoDialog.showModal();
  });
  videoDialog.addEventListener('close', () => { document.querySelector('#video-dialog-content').innerHTML = ''; });

  document.querySelector('#copy-citation').addEventListener('click', async (event) => {
    await navigator.clipboard.writeText(document.querySelector('#bibtex').innerText);
    event.currentTarget.textContent = 'Copied';
    setTimeout(() => { event.currentTarget.textContent = 'Copy'; }, 1400);
  });

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  nav.addEventListener('click', () => { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); });

  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.08 });
  if (!prefersReducedMotion) document.querySelectorAll('.section-block').forEach((section) => { section.classList.add('reveal'); revealObserver.observe(section); });

  renderTasks();
  renderExplorer();
  if (window.location.hash) {
    window.setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.classList.add('is-visible');
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, Math.max(0, target.offsetTop - 76));
        document.documentElement.style.removeProperty('scroll-behavior');
      }
    }, 120);
  }
})();
