import { course, findUnit, findTopic, findActivity } from './course-data.js';
import {
  getGamifyState,
  addPoints,
  completeMission,
  isMissionDone,
  resetProgress,
} from './gamify.js';
import { mountTopicScene, disposeTopicScene } from './topic-scene.js';

const app = document.getElementById('app');

function parseHash() {
  const h = (location.hash || '#/').replace(/^#/, '') || '/';
  const parts = h.split('/').filter(Boolean);
  return { parts };
}

function renderHeader() {
  const s = getGamifyState();
  return `
    <header class="shell-header">
      <div class="brand">
        <strong>${escapeHtml(course.title)}</strong>
        <span>Universidad FESC — 6.° semestre · Prototipo Web (Vite)</span>
      </div>
      <div class="stats-bar">
        <span class="pill" title="Puntos acumulados">${s.points} pts</span>
        <span class="pill" title="Misiones completadas">${s.missions.length} misiones</span>
        <button type="button" class="btn btn-ghost" id="btn-reset">Reiniciar progreso</button>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="shell-footer">
      Equipo proponente: Jesús Capacho · Julián Parada · Bairon Ardila — Integración LMS: Moodle (contenedor conceptual en esta demo).
    </footer>
  `;
}

function escapeHtml(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCourseProgress() {
  const s = getGamifyState();
  const activities = course.units.flatMap((u) => u.activities.map((a) => `${u.id}:${a.id}`));
  const done = activities.filter(isMissionDone).length;
  const total = activities.length;
  return {
    points: s.points,
    missions: s.missions.length,
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

function getUnitProgress(unit) {
  const total = unit.activities.length;
  const done = unit.activities.filter((a) => isMissionDone(`${unit.id}:${a.id}`)).length;
  return {
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

function getUnitIndex(unitId) {
  return course.units.findIndex((u) => u.id === unitId);
}

function isUnitUnlocked(unitId) {
  const index = getUnitIndex(unitId);
  if (index <= 0) return true;
  const previousUnit = course.units[index - 1];
  return previousUnit.activities.every((a) => isMissionDone(`${previousUnit.id}:${a.id}`));
}

function isActivityUnlocked(unit, activityId) {
  if (!isUnitUnlocked(unit.id)) return false;
  const index = unit.activities.findIndex((a) => a.id === activityId);
  if (index <= 0) return true;
  const previousActivity = unit.activities[index - 1];
  return isMissionDone(`${unit.id}:${previousActivity.id}`);
}

function routeLocked(title, message, backHref = '#/') {
  app.innerHTML = `
    ${renderHeader()}
    <main class="shell-main empty-state">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <a class="btn" href="${backHref}">Volver</a>
    </main>
    ${renderFooter()}
  `;
  bindReset();
}

function routeHome() {
  const progress = getCourseProgress();
  const cards = course.units
    .map((u) => {
      const unlocked = isUnitUnlocked(u.id);
      return `
      <article class="card ${unlocked ? '' : 'card-locked'}">
        <h2>${escapeHtml(u.title)}</h2>
        <p>${escapeHtml(u.summary)}</p>
        ${unlocked
          ? `<a class="btn" href="#/unidad/${u.id}">Abrir unidad</a>`
          : `<button class="btn btn-disabled" type="button">Unidad bloqueada</button>`}
      </article>
    `;
    })
    .join('');

  app.innerHTML = `
    ${renderHeader()}
    <main class="shell-main">
      <div class="hero">
        <h1>Arquitectura multinivel</h1>
        <p>${escapeHtml(course.subtitle)}</p>
      </div>
      <section class="progress-panel">
        <div>
          <strong>Progreso global:</strong>
          <span class="pill">${progress.percent}% completado</span>
        </div>
        <div>
          <span class="pill">${progress.points} pts</span>
          <span class="pill">${progress.done}/${progress.total} actividades completas</span>
          <span class="pill">${progress.missions} misiones</span>
        </div>
      </section>
      <section class="grid-cards">${cards}</section>
      <div class="byod-strip">
        <strong>Estrategia BYOD.</strong> Abre esta app en tu móvil o portátil; el módulo AR usa la cámara cuando lo permites.
        Para WebAR con marcador, emplea un patrón <em>Hiro</em> frente al panel derecho en la actividad (pantalla impresa u otro dispositivo).
      </div>
    </main>
    ${renderFooter()}
  `;
  bindReset();
}

function routeUnit(unitId) {
  const u = findUnit(unitId);
  if (!u) return routeNotFound();
  if (!isUnitUnlocked(u.id)) {
    return routeLocked(
      'Unidad bloqueada',
      'Completa las actividades de la unidad anterior para desbloquear esta unidad.',
      '#/',
    );
  }
  const unitProgress = getUnitProgress(u);
  const topicRows = u.topics
    .map((t) => {
      const done = isMissionDone(`${u.id}:${t.activityId}`);
      return `
      <li class="card topic-card" style="list-style:none;margin-bottom:0.75rem">
        <div class="topic-card-header">
          <h2 style="font-size:1rem">${escapeHtml(t.title)}</h2>
          <span class="status-pill ${done ? 'done' : 'pending'}">${done ? 'Completo' : 'Pendiente'}</span>
        </div>
        <p>${escapeHtml(t.blurb)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
          <a class="btn" href="#/tematica/${u.id}/${t.id}">Exploración inmersiva</a>
          <a class="btn btn-ghost" href="#/actividad/${u.id}/${t.activityId}">Ir a actividad vinculada</a>
        </div>
      </li>
    `;
    })
    .join('');

  app.innerHTML = `
    ${renderHeader()}
    <main class="shell-main">
      <nav class="breadcrumb"><a href="#/">Inicio</a> / ${escapeHtml(u.title)}</nav>
      <div class="hero">
        <h1>${escapeHtml(u.title)}</h1>
        <p>${escapeHtml(u.summary)}</p>
      </div>
      <section class="unit-progress-banner">
        <strong>Progreso de unidad:</strong>
        <span class="pill">${unitProgress.done}/${unitProgress.total} actividades</span>
        <span class="pill">${unitProgress.percent}% completado</span>
      </section>
      <h2 style="font-size:1rem;margin-bottom:0.75rem">Temáticas (nivel exploratorio)</h2>
      <ul style="padding:0;margin:0">${topicRows}</ul>
    </main>
    ${renderFooter()}
  `;
  bindReset();
}

function routeTopic(unitId, topicId) {
  const u = findUnit(unitId);
  const t = findTopic(u, topicId);
  if (!u || !t) return routeNotFound();
  const activity = u.activities.find((a) => a.id === t.activityId);
  const canContinue = activity ? isActivityUnlocked(u, activity.id) : true;

  app.innerHTML = `
    ${renderHeader()}
    <main class="shell-main topic-layout">
      <nav class="breadcrumb">
        <a href="#/">Inicio</a> / <a href="#/unidad/${u.id}">${escapeHtml(u.title)}</a> / ${escapeHtml(t.title)}
      </nav>
      <div class="hero">
        <h1>${escapeHtml(t.title)}</h1>
        <p>${escapeHtml(t.blurb)}</p>
      </div>
      <div class="topic-canvas-wrap" id="topic-canvas-root"></div>
      <p class="topic-hint">Arrastra para orbitar · rueda para zoom · espacio exploratorio antes de la teoría formal.</p>
      <div style="margin-top:0.5rem">
        ${canContinue
          ? `<a class="btn" href="#/actividad/${u.id}/${t.activityId}">Continuar a actividad (pantalla dividida)</a>`
          : `<button class="btn btn-disabled" type="button">Actividad bloqueada</button>`}
      </div>
      ${!canContinue ? '<p class="locked-note">Esta temática está bloqueada hasta completar la misión previa en la unidad.</p>' : ''}
    </main>
    ${renderFooter()}
  `;
  bindReset();

  const root = document.getElementById('topic-canvas-root');
  requestAnimationFrame(() => mountTopicScene(root, t.modelPreset));
}

function routeActivity(unitId, activityId) {
  const u = findUnit(unitId);
  const act = findActivity(u, activityId);
  if (!u || !act) return routeNotFound();

  const unlocked = isActivityUnlocked(u, activityId);
  const missionKey = `${unitId}:${activityId}`;
  const done = isMissionDone(missionKey);

  const quizHtml = act.quiz
    .map((q, qi) => {
      const opts = q.options
        .map(
          (o, oi) => `
        <label>
          <input type="radio" name="${escapeHtml(q.id)}" value="${escapeHtml(o.id)}" data-correct="${o.correct}" />
          ${escapeHtml(o.text)}
        </label>`,
        )
        .join('');
      return `
        <div class="quiz-q" data-q="${escapeHtml(q.id)}">
          <strong>${qi + 1}. ${escapeHtml(q.prompt)}</strong>
          <div class="quiz-options">${opts}</div>
        </div>`;
    })
    .join('');

  app.innerHTML = `
    ${renderHeader()}
    <main class="shell-main">
      <nav class="breadcrumb">
        <a href="#/">Inicio</a> / <a href="#/unidad/${u.id}">${escapeHtml(u.title)}</a> / ${escapeHtml(act.title)}
      </nav>
      <div class="hero">
        <h1>${escapeHtml(act.title)}</h1>
        <p>${escapeHtml(act.intro)}</p>
      </div>
      <p class="split-intro">
        Tres columnas: <strong>contexto teórico</strong> · <strong>reto gamificado</strong> · <strong>simulación WebAR</strong>.
        ${done ? '<span style="color:#3d7c47">Misión ya completada en este dispositivo.</span>' : ''}
      </p>
      <section class="split-grid">
        <div class="split-panel theory">
          <header>Contexto teórico</header>
          <div class="body">${act.theory}</div>
        </div>
        <div class="split-panel">
          <header>Reto gamificado</header>
          <div class="body">
            <p>Obtén todos los aciertos para sumar <strong>${act.missionPoints} puntos</strong> y cerrar la misión.</p>
            <form id="quiz-form">
              ${quizHtml}
              <button type="submit" class="btn" ${done || !unlocked ? 'disabled' : ''}>Validar respuestas</button>
            </form>
            ${!unlocked ? '<p class="locked-note">Esta misión está bloqueada. Completa la misión previa para desbloquear el reto.</p>' : ''}
            <div id="quiz-feedback" class="feedback" style="display:none"></div>
          </div>
        </div>
        <div class="split-panel">
          <header>Simulación WebAR (AR.js · navegador)</header>
          <iframe title="WebAR" src="/ar.html" loading="lazy"></iframe>
          <div class="ar-helper">
            <a class="btn btn-ghost" href="/ar.html" target="_blank" rel="noopener noreferrer">Abrir AR en pantalla completa</a>
            <p>Si el iframe no muestra la cámara, prueba en otra pestaña o usa un dispositivo compatible con cámara.</p>
          </div>
        </div>
      </section>
      <div class="byod-strip">
        <strong>Observa · Practica · Valida · Gana.</strong>
        En un piloto real, la práctica enlazaría a tu IDE y repositorio; aquí la validación es el cuestionario y la barra de puntos superior.
      </div>
    </main>
    ${renderFooter()}
  `;
  bindReset();

  const form = document.getElementById('quiz-form');
  const fb = document.getElementById('quiz-feedback');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!unlocked || done || isMissionDone(missionKey)) return;
    let correct = 0;
    let total = act.quiz.length;
    for (const q of act.quiz) {
      const picked = form.querySelector(`input[name="${q.id}"]:checked`);
      if (picked && picked.dataset.correct === 'true') correct++;
    }
    if (correct === total) {
      const share = Math.round(act.missionPoints);
      addPoints(share);
      completeMission(missionKey);
      fb.style.display = 'block';
      fb.className = 'feedback ok';
      fb.textContent = `Correcto: ${correct}/${total}. +${share} puntos. Misión completada.`;
      form.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
      syncHeaderOnly();
    } else {
      fb.style.display = 'block';
      fb.className = 'feedback err';
      fb.textContent = `Aciertos: ${correct}/${total}. Repasa el contexto o el marcador AR e inténtalo de nuevo.`;
    }
  });
}

function syncHeaderOnly() {
  const header = document.querySelector('header.shell-header');
  if (!header) return;
  header.outerHTML = renderHeader().trim();
  bindReset();
}

function routeNotFound() {
  app.innerHTML = `
    ${renderHeader()}
    <main class="shell-main empty-state">
      <p>Ruta no encontrada.</p>
      <a class="btn" href="#/">Volver al inicio</a>
    </main>
    ${renderFooter()}
  `;
  bindReset();
}

function bindReset() {
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('¿Borrar puntos y misiones en este navegador?')) {
      resetProgress();
      navigate();
    }
  });
}

function navigate() {
  disposeTopicScene();
  const { parts } = parseHash();
  if (parts.length === 0 || parts[0] === '') return routeHome();
  if (parts[0] === 'unidad' && parts[1]) return routeUnit(parts[1]);
  if (parts[0] === 'tematica' && parts[1] && parts[2]) return routeTopic(parts[1], parts[2]);
  if (parts[0] === 'actividad' && parts[1] && parts[2]) return routeActivity(parts[1], parts[2]);
  routeNotFound();
}

window.addEventListener('hashchange', navigate);
navigate();
