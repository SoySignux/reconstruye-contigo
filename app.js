'use strict';

// Prototipo sin backend. Ninguna acción envía datos a una institución.
const STORAGE_KEY = 'reconstruye-contigo-v1';
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2m4 0h2m-8 3h2"/>',
  chart: '<path d="M4 3v18h17M8 16v-5m5 5V7m5 9V4"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  list: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6m-6 4h6m-6 4h3"/>',
  folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  leaf: '<path d="M20 3C9 2 3 7 5 14s13 7 15-11ZM4 21 15 10"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .4-1 1.2-1 2.2M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  tools: '<path d="m14 6 4 4M3 21l8-8m-3-9 5 5-4 4-5-5 1-4Zm10-2a6 6 0 0 0-7 8l-8 8 3 3 8-8a6 6 0 0 0 8-7l-4 4-4-4Z"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2"/>',
  case: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c5 3 13 3 18 0M12 12v4"/>',
  edit: '<path d="m15 4 5 5M4 15 16 3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L9 20l-6 1Z"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.list}</svg>`;
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = new Date();
today.setHours(0, 0, 0, 0);
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseDate = s => new Date(`${s}T12:00:00`);
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const formatDate = (value, options = { day: 'numeric', month: 'short' }) => parseDate(value).toLocaleDateString('es-CL', options);
const relativeDate = value => !value ? 'Sin fecha' : value === dateKey(today) ? 'Hoy' : value === dateKey(addDays(today, 1)) ? 'Mañana' : formatDate(value);
const statuses = { pending: 'Pendiente', progress: 'En proceso', done: 'Completada' };
const categories = ['Vivienda', 'Documentación', 'Reconstrucción', 'Bienestar'];
const aids = [
  { id: 'alojamiento', title: 'Alojamiento temporal', category: 'Vivienda', icon: 'home', description: 'Un lugar seguro mientras organizas los siguientes pasos para recuperar tu vivienda.', institution: 'Apoyo municipal', consultation: 'Oficina de atención social de tu municipio (referencia ilustrativa).', requirements: ['Consultar disponibilidad de alojamiento en tu comuna.', 'Preguntar qué antecedentes de tu grupo familiar se solicitan.', 'Confirmar las condiciones y duración del apoyo.'], step: 'Consultar opciones de alojamiento' },
  { id: 'orientacion', title: 'Orientación para reconstruir', category: 'Reconstrucción', icon: 'tools', description: 'Conoce qué consultas hacer para planificar una vivienda segura y organizar las obras.', institution: 'Orientación habitacional', consultation: 'Área de vivienda municipal o equipo técnico correspondiente (por validar).', requirements: ['Preparar una descripción de la situación de la vivienda.', 'Consultar por una evaluación técnica profesional.', 'Preguntar por etapas, plazos y documentación aplicable.'], step: 'Solicitar orientación para reconstruir' },
  { id: 'documentos', title: 'Recuperación de documentos', category: 'Documentación', icon: 'folder', description: 'Organiza los documentos que necesitas recuperar y las consultas para obtenerlos.', institution: 'Atención ciudadana', consultation: 'Institución emisora de cada documento. Confirma el canal oficial antes de realizar una gestión.', requirements: ['Hacer una lista de los documentos perdidos.', 'Consultar los requisitos para cada reposición.', 'Confirmar costos, horarios y disponibilidad de atención.'], step: 'Consultar la reposición de documentos' },
  { id: 'materiales', title: 'Apoyo con materiales', category: 'Reconstrucción', icon: 'case', description: 'Prepara una lista de necesidades para consultar por redes de apoyo y materiales.', institution: 'Redes de apoyo local', consultation: 'Organización local o municipio. Las campañas y su disponibilidad deben verificarse.', requirements: ['Registrar los materiales que te indicó un profesional.', 'Consultar disponibilidad y condiciones de entrega.', 'Coordinar el retiro según tu disponibilidad.'], step: 'Consultar apoyo con materiales' },
  { id: 'acompanamiento', title: 'Acompañamiento emocional', category: 'Bienestar', icon: 'heart', description: 'Organiza una consulta sobre espacios de escucha y acompañamiento para ti y tu familia.', institution: 'Red comunitaria', consultation: 'Centro de salud o red de apoyo de tu comuna. Este prototipo no ofrece atención clínica.', requirements: ['Consultar los canales de orientación disponibles.', 'Preguntar por horarios y modalidad de atención.', 'Anotar tus preferencias para coordinar la consulta.'], step: 'Consultar opciones de acompañamiento' },
  { id: 'ayuda-vivienda', title: 'Orientación sobre ayudas de vivienda', category: 'Vivienda', icon: 'people', description: 'Reúne tus preguntas sobre apoyos habitacionales y los pasos para informarte.', institution: 'Área de vivienda', consultation: 'Equipo de vivienda de tu municipio (referencia ilustrativa, sin convenio ni conexión).', requirements: ['Consultar qué programas están vigentes para tu situación.', 'Confirmar requisitos directamente con la entidad responsable.', 'Anotar documentos, fechas y próximos pasos.'], step: 'Consultar ayudas de vivienda' },
];

function initialState() {
  return {
    version: 1,
    profile: { name: 'Leonardo Moncada', location: 'Lirquén, Biobío' },
    savedAids: [],
    tasks: [
      { id: 't1', title: 'Reunir documentos personales', category: 'Documentación', status: 'progress', date: dateKey(today), time: '10:00', notes: 'Preparar una lista de los documentos que necesito recuperar.' },
      { id: 't2', title: 'Consultar ayudas de vivienda', category: 'Vivienda', status: 'pending', date: dateKey(addDays(today, 1)), time: '11:00', notes: 'Anotar mis preguntas antes de la consulta.', aidId: 'ayuda-vivienda' },
      { id: 't3', title: 'Solicitar orientación técnica', category: 'Reconstrucción', status: 'pending', date: dateKey(addDays(today, 2)), time: '15:00', notes: '' },
      { id: 't4', title: 'Registrar las necesidades de mi vivienda', category: 'Reconstrucción', status: 'progress', date: '', time: '', notes: 'Ordenar las necesidades para conversar con un profesional.' },
      { id: 't5', title: 'Encontrar alojamiento temporal', category: 'Vivienda', status: 'done', date: dateKey(addDays(today, -3)), time: '09:00', notes: 'Alojamiento organizado con mi familia. Ejemplo de gestión completada.' },
      { id: 't6', title: 'Identificar mis redes de apoyo', category: 'Bienestar', status: 'done', date: dateKey(addDays(today, -2)), time: '17:00', notes: 'Anoté a quién puedo acudir para orientarme.' },
    ],
    shifts: [{ id: 's1', title: 'Turno de trabajo', date: dateKey(today), start: '14:00', end: '22:00' }],
  };
}

function validState(s) {
  const validDate = d => typeof d === 'string' && (d === '' || /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(parseDate(d).getTime()));
  const validTime = t => typeof t === 'string' && (t === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(t));
  return s && s.version === 1 && s.profile && typeof s.profile.name === 'string' && typeof s.profile.location === 'string' &&
    Array.isArray(s.savedAids) && s.savedAids.every(id => aids.some(a => a.id === id)) &&
    Array.isArray(s.tasks) && s.tasks.every(t => t && typeof t.id === 'string' && typeof t.title === 'string' && categories.includes(t.category) && Object.hasOwn(statuses, t.status) && validDate(t.date) && validTime(t.time) && typeof t.notes === 'string') &&
    Array.isArray(s.shifts) && s.shifts.every(s => s && typeof s.id === 'string' && typeof s.title === 'string' && validDate(s.date) && s.date && validTime(s.start) && s.start && validTime(s.end) && s.end && s.end > s.start);
}

let storageAvailable = true;
let recoveryWarning = false;
let state;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (validState(parsed)) state = parsed;
      else recoveryWarning = true;
    } catch { recoveryWarning = true; }
  }
} catch { storageAvailable = false; }
state ||= initialState();
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; recoveryWarning = false; return true; }
  catch { storageAvailable = false; return false; }
}
if (!recoveryWarning) persist();
let route = 'inicio';
let aidFilter = 'Todas';
let aidSearch = '';
let taskFilter = 'Todas';
let taskSearch = '';
let selectedDate = dateKey(today);
let weekStart = addDays(today, -((today.getDay() + 6) % 7));
let toastTimer;
const app = document.getElementById('app');
const modal = document.getElementById('modal');
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const counts = () => ({ total: state.tasks.length, pending: state.tasks.filter(t => t.status === 'pending').length, progress: state.tasks.filter(t => t.status === 'progress').length, done: state.tasks.filter(t => t.status === 'done').length });
const percent = () => state.tasks.length ? Math.round(counts().done / state.tasks.length * 100) : 0;
const sortTasks = list => [...list].sort((a, b) => `${a.date || '9999'} ${a.time}`.localeCompare(`${b.date || '9999'} ${b.time}`));
const badge = status => `<span class="badge dot ${status}">${statuses[status]}</span>`;

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 4200);
}
function save(message) {
  const saved = persist();
  render();
  toast(saved ? message : 'Cambio aplicado solo en esta sesión. El navegador no permite guardarlo.');
}
const navItems = [['inicio', 'home', 'Inicio'], ['ayudas', 'heart', 'Ayudas'], ['planificacion', 'calendar', 'Planificación'], ['seguimiento', 'chart', 'Seguimiento']];
const brand = `<img src="./assets/favicon.svg" alt=""/><div class="brand-name">Reconstruye<span>Contigo</span></div>`;

function render() {
  const current = navItems.find(n => n[0] === route);
  document.title = `${current[2]} · Reconstruye Contigo`;
  const initials = state.profile.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
  app.innerHTML = `
    <aside class="sidebar" aria-label="Menú principal">
      <a href="#inicio" class="brand" aria-label="Reconstruye Contigo, inicio">${brand}</a>
      <p class="brand-caption">UN NUEVO COMIENZO, CONTIGO</p>
      <nav class="navigation">${navItems.map(([id, ico, label]) => `<a class="nav-link ${route === id ? 'active' : ''}" href="#${id}" ${route === id ? 'aria-current="page"' : ''}>${icon(ico)}${label}${id === 'seguimiento' ? `<span class="nav-count">${counts().total}</span>` : ''}</a>`).join('')}</nav>
      <div class="sidebar-bottom">
        <div class="support-card">${icon('leaf')}<h3>No tienes que hacerlo solo.</h3><p>Cada pequeño paso cuenta.<br>Avancemos a tu ritmo.</p><button class="text-button" data-action="help">Conoce cómo empezar ${icon('arrow')}</button></div>
        <button class="profile" data-action="profile" aria-label="Editar perfil de demostración"><span class="avatar">${escapeHTML(initials)}</span><span><strong>${escapeHTML(state.profile.name)}</strong><small>${escapeHTML(state.profile.location)}</small></span>${icon('chevron')}</button>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar"><div class="breadcrumb">Mi espacio ${icon('chevron')}<strong>${current[2]}</strong></div><a href="#inicio" class="brand mobile-brand">${brand}</a><div class="topbar-right"><span class="local-label">${icon('shield')}${storageAvailable ? 'Guardado en este dispositivo' : 'Solo en esta sesión'}</span><span class="demo-pill">Modo demostración</span><button class="icon-button" data-action="help" aria-label="Ayuda sobre el prototipo">${icon('help')}</button></div></header>
      <main id="main" tabindex="-1">${!storageAvailable ? '<p class="storage-warning" role="alert">El almacenamiento no está disponible. Los cambios se perderán al cerrar esta página. Puedes exportarlos desde tu perfil.</p>' : ''}${recoveryWarning ? '<p class="storage-warning" role="alert">Los datos guardados no se pudieron leer. Se muestran ejemplos; los nuevos cambios reemplazarán los datos anteriores.</p>' : ''}${({ inicio: renderHome, ayudas: renderAids, planificacion: renderSchedule, seguimiento: renderTracking })[route]()}<footer class="footer"><span>${icon('leaf')}Paso a paso, volvemos a construir.</span><span>Prototipo académico · Los Geoinformáticos</span></footer></main>
    </div>
    <nav class="mobile-nav" aria-label="Navegación móvil">${navItems.map(([id, ico, label]) => `<a href="#${id}" class="${route === id ? 'active' : ''}" ${route === id ? 'aria-current="page"' : ''}>${icon(ico)}<span>${label}</span></a>`).join('')}</nav>`;
}

function heading(title, subtitle, action = '') {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function empty(title, description, action = '') { return `<div class="empty">${icon('leaf')}<h3>${title}</h3><p>${description}</p>${action}</div>`; }
function taskRow(t) {
  return `<div class="task-row"><button class="task-check ${t.status === 'done' ? 'checked' : ''}" data-action="toggle-task" data-id="${escapeHTML(t.id)}" aria-label="${t.status === 'done' ? 'Marcar como pendiente' : 'Completar'}: ${escapeHTML(t.title)}" aria-pressed="${t.status === 'done'}">${t.status === 'done' ? icon('check') : ''}</button><div class="task-info"><h3><button class="task-title" data-action="edit-task" data-id="${escapeHTML(t.id)}">${escapeHTML(t.title)}</button></h3><p>${icon('calendar')}${relativeDate(t.date)}${t.time && t.date ? ` · ${t.time}` : ''}</p></div>${badge(t.status)}</div>`;
}
function renderHome() {
  const c = counts();
  const pending = sortTasks(state.tasks.filter(t => t.status !== 'done')).slice(0, 3);
  const progress = percent();
  const next = pending[0];
  return `${heading(`Hola, ${escapeHTML(state.profile.name.split(' ')[0])} <span aria-hidden="true">☀</span>`, 'Este es tu espacio para avanzar, un paso a la vez.', `<span class="date-label">${icon('calendar')}${today.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>`)}
    <section class="hero" aria-labelledby="hero-title"><div class="hero-content"><div class="eyebrow">${icon('leaf')}Estamos contigo en este camino</div><h2 id="hero-title">Un nuevo comienzo<br>se construye paso a paso.</h2><p>Organiza tus gestiones, encuentra orientación<br class="desktop-break"> y reconoce todo lo que ya has avanzado.</p><a class="button primary" href="#${next ? 'seguimiento' : 'ayudas'}">${next ? 'Continuar mi proceso' : 'Explorar las ayudas'}${icon('arrow')}</a></div><img class="hero-art" src="./assets/home-illustration.svg" alt="Una casa entre árboles, símbolo de un nuevo comienzo"/></section>
    <section class="stats" aria-label="Resumen de gestiones">${[['list', c.total, 'Gestiones en total'], ['clock', c.pending, 'Pendientes'], ['folder', c.progress, 'En proceso'], ['circleCheck', c.done, 'Completadas']].map(([i, n, l]) => `<div class="stat"><div class="stat-icon">${icon(i)}</div><div><strong>${n}</strong><p>${l}</p></div></div>`).join('')}</section>
    <div class="dashboard-grid"><section class="panel"><div class="panel-heading"><div><h2>Tus próximos pasos</h2><p>Un poco de organización, más tranquilidad.</p></div><a class="text-button" href="#planificacion">Ver agenda ${icon('arrow')}</a></div><div class="task-list">${pending.length ? pending.map(taskRow).join('') : empty('Todo al día', 'Puedes añadir una nueva gestión cuando lo necesites.')}</div><div class="panel-footer"><button class="text-button" data-action="new-task">${icon('plus')}Añadir una gestión</button></div></section>
    <section class="panel"><div class="panel-heading"><h2>Cada avance cuenta</h2>${icon('leaf')}</div><div class="progress-content"><div class="progress-display"><div class="progress-ring" role="img" aria-label="${progress}% de gestiones completadas"><svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="42"/><circle class="value" cx="50" cy="50" r="42" stroke-dasharray="${progress * 2.63894} 263.894"/></svg><div class="ring-label"><strong>${progress}%</strong><small>de tu recorrido</small></div></div><div class="progress-description"><strong>${c.done ? 'Vas por buen camino' : 'Tu camino empieza aquí'}</strong><p>${c.done} de ${c.total} gestiones<br>completadas. A tu ritmo.</p></div></div><ul class="milestones">${state.tasks.filter(t => t.status === 'done').slice(0, 2).map(t => `<li>${icon('circleCheck')}${escapeHTML(t.title)}</li>`).join('')}${next ? `<li class="unfinished">${icon('circle')}${escapeHTML(next.title)}</li>` : ''}</ul></div></section></div>
    <section class="help-section"><div class="section-heading"><h2>¿Qué necesitas hoy?</h2><span class="muted" style="font-size:11px">Todo en un mismo lugar</span></div><div class="quick-grid">${[['ayudas', 'heart', 'Encontrar una ayuda', 'Explora apoyos y requisitos.'], ['planificacion', 'calendar', 'Organizar mi semana', 'Haz espacio entre tus turnos.'], ['seguimiento', 'chart', 'Revisar mis avances', 'Cada gestión es un paso más.']].map(([r, i, t, d]) => `<a class="quick-card" href="#${r}"><div class="quick-icon">${icon(i)}</div><div><h3>${t}</h3><p>${d}</p></div>${icon('arrow')}</a>`).join('')}</div></section>`;
}

function renderAids() {
  return `${heading('Las ayudas, en un solo lugar', 'Encuentra orientación para dar tu próximo paso.')}
    <div class="notice">${icon('info')}<div><strong>Información ilustrativa.</strong> Estas fichas muestran cómo funcionaría el directorio. Los apoyos, requisitos e instituciones deben validarse en sus canales oficiales. No se realizan postulaciones.</div></div>
    <div class="toolbar"><div class="search">${icon('search')}<input id="aid-search" type="search" placeholder="Buscar una ayuda…" aria-label="Buscar ayudas" value="${escapeHTML(aidSearch)}"/></div><div class="filters" aria-label="Filtrar ayudas">${['Todas', ...categories, 'Guardadas'].map(f => `<button class="filter ${aidFilter === f ? 'active' : ''}" data-action="aid-filter" data-filter="${f}" aria-pressed="${aidFilter === f}">${f}</button>`).join('')}</div></div><div id="aid-results">${aidResults()}</div>`;
}
function normalize(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function aidResults() {
  const filtered = aids.filter(a => (aidFilter === 'Todas' || a.category === aidFilter || aidFilter === 'Guardadas' && state.savedAids.includes(a.id)) && normalize(`${a.title} ${a.description} ${a.category}`).includes(normalize(aidSearch)));
  return `<p class="results-label" role="status">${filtered.length} ${filtered.length === 1 ? 'ayuda disponible' : 'ayudas disponibles'} · Ejemplos de orientación</p><div class="aid-grid">${filtered.length ? filtered.map(a => `<article class="aid-card"><div class="aid-card-top"><div class="aid-symbol">${icon(a.icon)}</div><button class="bookmark ${state.savedAids.includes(a.id) ? 'saved' : ''}" data-action="bookmark" data-id="${a.id}" aria-label="${state.savedAids.includes(a.id) ? 'Quitar de guardadas' : 'Guardar'}: ${a.title}" aria-pressed="${state.savedAids.includes(a.id)}">${icon('bookmark')}</button></div><div><span class="badge neutral">${a.category}</span></div><h3>${a.title}</h3><p>${a.description}</p><div class="aid-card-bottom"><span>${a.institution}</span><button class="text-button" data-action="aid-detail" data-id="${a.id}">Ver orientación ${icon('arrow')}</button></div></article>`).join('') : empty('No encontramos ayudas', 'Prueba otra búsqueda o cambia el filtro.', '<button class="button secondary" data-action="clear-aid-filters">Ver todas las ayudas</button>')}</div>`;
}

function renderSchedule() {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const events = [...state.tasks.filter(t => t.date === selectedDate).map(t => ({ ...t, kind: 'task', sortTime: t.time || '99' })), ...state.shifts.filter(s => s.date === selectedDate).map(s => ({ ...s, kind: 'shift', sortTime: s.start }))].sort((a, b) => a.sortTime.localeCompare(b.sortTime));
  const unscheduled = state.tasks.filter(t => !t.date && t.status !== 'done');
  return `${heading('Una semana a tu ritmo', 'Organiza tus gestiones sin perder de vista tus turnos.', `<button class="button primary" data-action="new-task">${icon('plus')}Nueva gestión</button>`)}
    <div class="schedule-layout"><section class="panel"><div class="week-toolbar"><h2>${formatDate(dateKey(days[0]))} — ${formatDate(dateKey(days[6]), { day: 'numeric', month: 'long', year: 'numeric' })}</h2><div class="week-actions"><button class="icon-button" data-action="week-prev" aria-label="Semana anterior">${icon('left')}</button><button class="button secondary small" data-action="week-today">Hoy</button><button class="icon-button" data-action="week-next" aria-label="Semana siguiente">${icon('chevron')}</button></div></div><div class="week-days" aria-label="Días de la semana">${days.map(d => { const key = dateKey(d); return `<button class="day ${key === selectedDate ? 'selected' : ''} ${key === dateKey(today) ? 'today' : ''}" data-action="select-date" data-date="${key}" aria-label="${formatDate(key, { weekday: 'long', day: 'numeric', month: 'long' })}" aria-pressed="${key === selectedDate}"><span>${d.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '')}</span><strong>${d.getDate()}</strong><span class="dots">${state.tasks.some(t => t.date === key) ? '<i></i>' : ''}${state.shifts.some(s => s.date === key) ? '<i class="shift"></i>' : ''}</span></button>`; }).join('')}</div><div class="day-agenda"><h3>${formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>${events.length ? events.map(e => `<div class="agenda-event ${e.kind === 'shift' ? 'shift' : ''}"><div class="event-time">${e.kind === 'shift' ? `${e.start}<br>${e.end}` : e.time || 'Sin hora'}</div><div class="event-detail"><h3>${escapeHTML(e.title)}</h3><p>${e.kind === 'shift' ? 'Tiempo ocupado · Turno laboral' : `${e.category} · ${statuses[e.status]}`}</p></div><button class="icon-button" data-action="${e.kind === 'shift' ? 'edit-shift' : 'edit-task'}" data-id="${escapeHTML(e.id)}" aria-label="Editar ${escapeHTML(e.title)}">${icon('edit')}</button></div>`).join('') : empty('Un espacio para ti', 'No tienes gestiones ni turnos para este día.', '<button class="button secondary small" data-action="new-task">Añadir una gestión</button>')}</div><div class="calendar-legend"><span><i></i>Gestión personal</span><span><i class="shift"></i>Turno de trabajo</span></div></section>
    <aside class="schedule-side"><section class="panel"><div class="panel-heading"><div><h2>Mis turnos</h2><p>Organiza tu disponibilidad.</p></div></div><div style="padding:8px 18px 19px"><p class="muted" style="font-size:12px;margin-bottom:15px">Registra las horas en que estás trabajando para planificar tus gestiones.</p><button class="button secondary small" data-action="new-shift">${icon('plus')}Añadir un turno</button></div></section><section class="panel"><div class="panel-heading"><h2>Por agendar <span class="muted">(${unscheduled.length})</span></h2></div><div class="task-list">${unscheduled.length ? unscheduled.map(t => `<div class="task-row"><div class="task-info"><h3>${escapeHTML(t.title)}</h3><button class="text-button" style="margin-top:9px;font-size:11px" data-action="edit-task" data-id="${escapeHTML(t.id)}">Elegir fecha ${icon('arrow')}</button></div></div>`).join('') : '<p class="muted" style="padding:10px 0 20px;font-size:12px">Tus gestiones pendientes ya tienen fecha.</p>'}</div></section><div class="notice">${icon('leaf')}No necesitas resolver todo hoy. Deja también espacio para descansar.</div></aside></div>`;
}

function renderTracking() {
  return `${heading('Tu esfuerzo se convierte en avances', 'Registra lo que has hecho y ten claro qué sigue.', `<button class="button primary" data-action="new-task">${icon('plus')}Nueva gestión</button>`)}<section class="progress-summary" aria-label="Progreso total"><div><h2>Mi proceso de recuperación</h2><p>${counts().done} de ${counts().total} gestiones completadas · Avance de tus tareas, no de las obras</p></div><div class="progress-track" role="progressbar" aria-label="Gestiones completadas" aria-valuenow="${percent()}" aria-valuemin="0" aria-valuemax="100"><span style="width:${percent()}%"></span></div><strong>${percent()}%</strong></section>
    <div class="toolbar"><div class="search">${icon('search')}<input id="task-search" type="search" placeholder="Buscar una gestión…" aria-label="Buscar gestiones" value="${escapeHTML(taskSearch)}"/></div><div class="filters" aria-label="Filtrar gestiones">${['Todas', ...categories].map(f => `<button class="filter ${taskFilter === f ? 'active' : ''}" data-action="task-filter" data-filter="${f}" aria-pressed="${taskFilter === f}">${f}</button>`).join('')}</div></div><div id="tracking-results">${trackingResults()}</div>`;
}
function trackingResults() {
  const filtered = sortTasks(state.tasks.filter(t => (taskFilter === 'Todas' || t.category === taskFilter) && normalize(`${t.title} ${t.notes}`).includes(normalize(taskSearch))));
  return `<p class="results-label" role="status">${filtered.length} ${filtered.length === 1 ? 'gestión' : 'gestiones'} en tu recorrido</p><div class="kanban">${Object.entries(statuses).map(([status, label]) => { const tasks = filtered.filter(t => t.status === status); return `<section class="kanban-column" aria-label="${label}"><div class="column-heading"><h2>${badge(status)}</h2><span class="count">${tasks.length}</span></div>${tasks.length ? tasks.map(t => `<article class="tracking-card"><span class="badge neutral">${t.category}</span><h3>${escapeHTML(t.title)}</h3><p>${t.notes ? escapeHTML(t.notes) : 'Puedes añadir una observación a esta gestión.'}</p><div class="card-date">${icon('calendar')}${relativeDate(t.date)}${t.date && t.time ? ` · ${t.time}` : ''}</div><select data-status-id="${escapeHTML(t.id)}" aria-label="Estado de ${escapeHTML(t.title)}">${Object.entries(statuses).map(([v, l]) => `<option value="${v}" ${t.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select><div class="tracking-card-bottom"><button class="text-button" data-action="edit-task" data-id="${escapeHTML(t.id)}">${icon('edit')}Editar y añadir notas</button></div></article>`).join('') : `<p class="muted" style="font-size:11px;padding:12px 4px">No hay gestiones ${status === 'done' ? 'completadas' : status === 'progress' ? 'en proceso' : 'pendientes'}${taskSearch || taskFilter !== 'Todas' ? ' con este filtro' : ' por ahora'}.</p>`}</section>`; }).join('')}</div>`;
}

function showModal(title, subtitle, content) {
  modal.innerHTML = `<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button class="icon-button" data-action="close-modal" aria-label="Cerrar ventana">${icon('close')}</button></div>${content}`;
  if (!modal.open) modal.showModal();
}
function showTask(id) {
  const task = id ? state.tasks.find(t => t.id === id) : null;
  if (id && !task) return;
  const t = task || { title: '', category: 'Documentación', status: 'pending', date: route === 'planificacion' ? selectedDate : '', time: '', notes: '' };
  showModal(task ? 'Tu gestión, paso a paso' : 'Un nuevo paso', 'Organiza esta gestión a tu ritmo.', `<form id="task-form" data-id="${escapeHTML(id || '')}"><div class="modal-body"><div class="form-grid"><div class="field full"><label for="task-title">¿Qué necesitas hacer?</label><input id="task-title" name="title" value="${escapeHTML(t.title)}" required maxlength="120" placeholder="Ej. Consultar opciones de alojamiento"/></div><div class="field"><label for="task-category">Categoría</label><select id="task-category" name="category">${categories.map(c => `<option ${c === t.category ? 'selected' : ''}>${c}</option>`).join('')}</select></div><div class="field"><label for="task-status">Estado</label><select id="task-status" name="status">${Object.entries(statuses).map(([v, l]) => `<option value="${v}" ${v === t.status ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label for="task-date">Fecha <span class="muted">(opcional)</span></label><input id="task-date" name="date" type="date" value="${t.date}" min="2020-01-01" max="2100-12-31"/></div><div class="field"><label for="task-time">Hora <span class="muted">(opcional)</span></label><input id="task-time" name="time" type="time" value="${t.time}"/></div><div class="field full"><label for="task-notes">Mis observaciones</label><textarea id="task-notes" name="notes" maxlength="2000" placeholder="Anota lo que averiguaste o lo que falta por resolver…">${escapeHTML(t.notes)}</textarea><small>Las notas se guardan solo en este navegador.</small></div></div></div><p class="form-error" role="alert"></p><div class="form-actions">${task ? `<button class="button danger small" type="button" data-action="delete-task" data-id="${escapeHTML(task.id)}">Eliminar</button>` : ''}<button class="button secondary" type="button" data-action="close-modal">Cancelar</button><button class="button primary" type="submit">${icon('check')}Guardar gestión</button></div></form>`);
}
function showShift(id) {
  const s = id ? state.shifts.find(s => s.id === id) : { title: 'Turno de trabajo', date: selectedDate, start: '08:00', end: '17:00' };
  if (!s) return;
  showModal(id ? 'Editar turno' : 'Haz espacio para tus turnos', 'Marca el tiempo que tienes ocupado.', `<form id="shift-form" data-id="${escapeHTML(id || '')}"><div class="modal-body"><div class="form-grid"><div class="field full"><label for="shift-title">Nombre del turno</label><input id="shift-title" name="title" value="${escapeHTML(s.title)}" maxlength="80" required/></div><div class="field full"><label for="shift-date">Día</label><input type="date" id="shift-date" name="date" value="${s.date}" min="2020-01-01" max="2100-12-31" required/></div><div class="field"><label for="shift-start">Desde</label><input type="time" id="shift-start" name="start" value="${s.start}" required/></div><div class="field"><label for="shift-end">Hasta</label><input type="time" id="shift-end" name="end" value="${s.end}" required/></div><small class="muted field full">Para un turno nocturno, registra un tramo por cada día.</small></div></div><p class="form-error" role="alert"></p><div class="form-actions">${id ? `<button class="button danger small" type="button" data-action="delete-shift" data-id="${escapeHTML(id)}">Eliminar</button>` : ''}<button class="button secondary" type="button" data-action="close-modal">Cancelar</button><button class="button primary" type="submit">Guardar turno</button></div></form>`);
}
function showAid(id) {
  const a = aids.find(a => a.id === id);
  if (!a) return;
  const existing = state.tasks.find(t => t.aidId === a.id);
  showModal(a.title, `${a.category} · Ficha ilustrativa`, `<div class="modal-body"><p>${a.description}</p><h3>Preguntas y pasos para orientarte</h3><ul class="document-list">${a.requirements.map(r => `<li>${icon('circleCheck')}<span>${r}</span></li>`).join('')}</ul><h3>¿A quién consultar?</h3><p>${a.consultation}</p><div class="notice">${icon('info')}Este ejemplo no confirma beneficios, requisitos ni elegibilidad. Añadir una gestión solo crea una tarea personal; no envía una solicitud.</div></div><div class="form-actions"><button class="button secondary" data-action="close-modal">Cerrar</button><button class="button primary" data-action="${existing ? 'view-aid-task' : 'add-aid-task'}" data-id="${a.id}">${icon(existing ? 'arrow' : 'plus')}${existing ? 'Ver mi gestión' : 'Añadir a mis gestiones'}</button></div>`);
}
function showHelp() {
  showModal('Un paso a la vez', 'Una guía para usar Reconstruye Contigo.', `<div class="modal-body"><ol class="help-steps"><li><strong>Encuentra orientación</strong><p>Explora las fichas de Ayudas y añade las que necesites a tus gestiones.</p></li><li><strong>Organiza tu disponibilidad</strong><p>En Planificación, registra tus turnos y elige una fecha para cada tarea.</p></li><li><strong>Reconoce tus avances</strong><p>En Seguimiento, cambia los estados y anota lo que has averiguado.</p></li></ol><div class="notice">${icon('info')}Prototipo académico con datos de ejemplo. No está conectado a instituciones ni envía solicitudes, notificaciones o recordatorios. Los cambios permanecen en este navegador.</div><h3>Tu espacio de demostración</h3><p>Puedes cambiar el nombre del perfil, exportar tus datos o volver a los ejemplos iniciales.</p></div><div class="form-actions"><button class="button secondary" data-action="profile">${icon('people')}Mi perfil y datos</button><button class="button primary" data-action="close-modal">Entendido</button></div>`);
}
function showProfile() {
  showModal('Mi espacio', 'Personaliza el perfil de demostración.', `<form id="profile-form"><div class="modal-body"><div class="form-grid"><div class="field full"><label for="profile-name">Nombre</label><input id="profile-name" name="name" value="${escapeHTML(state.profile.name)}" maxlength="60" required/></div><div class="field full"><label for="profile-location">Localidad</label><input id="profile-location" name="location" value="${escapeHTML(state.profile.location)}" maxlength="80" required/></div></div><h3>Tus datos en este dispositivo</h3><p>Este prototipo no tiene cuentas ni sincronización. Si borras los datos del navegador, también se borran tus gestiones.</p><div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:17px"><button class="button secondary small" type="button" data-action="export">${icon('download')}Exportar mis datos</button><button class="button secondary small" type="button" data-action="reset">Restablecer demostración</button></div></div><p class="form-error" role="alert"></p><div class="form-actions"><button class="button secondary" type="button" data-action="close-modal">Cancelar</button><button class="button primary" type="submit">Guardar perfil</button></div></form>`);
}
function confirmDelete(kind, id) {
  const collection = kind === 'task' ? state.tasks : state.shifts;
  const item = collection.find(x => x.id === id);
  if (!item) return;
  showModal('¿Eliminar este registro?', '', `<div class="modal-body"><p>Se eliminará <strong>${escapeHTML(item.title)}</strong> de este dispositivo. Esta acción no se puede deshacer.</p></div><div class="form-actions"><button class="button secondary" data-action="edit-${kind}" data-id="${escapeHTML(id)}">Volver</button><button class="button danger" data-action="confirm-delete-${kind}" data-id="${escapeHTML(id)}">Eliminar registro</button></div>`);
}

document.addEventListener('click', event => {
  const b = event.target.closest('[data-action]');
  if (!b) return;
  const { action, id, filter } = b.dataset;
  switch (action) {
    case 'help': showHelp(); break;
    case 'profile': showProfile(); break;
    case 'close-modal': modal.close(); break;
    case 'new-task': showTask(); break;
    case 'edit-task': showTask(id); break;
    case 'new-shift': showShift(); break;
    case 'edit-shift': showShift(id); break;
    case 'delete-task': confirmDelete('task', id); break;
    case 'delete-shift': confirmDelete('shift', id); break;
    case 'confirm-delete-task': state.tasks = state.tasks.filter(t => t.id !== id); modal.close(); save('Gestión eliminada.'); break;
    case 'confirm-delete-shift': state.shifts = state.shifts.filter(s => s.id !== id); modal.close(); save('Turno eliminado.'); break;
    case 'toggle-task': {
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;
      task.status = task.status === 'done' ? 'pending' : 'done';
      save(task.status === 'done' ? 'Un paso más. Gestión completada.' : 'Gestión marcada como pendiente.');
      break;
    }
    case 'aid-filter': aidFilter = filter; render(); break;
    case 'task-filter': taskFilter = filter; render(); break;
    case 'clear-aid-filters': aidFilter = 'Todas'; aidSearch = ''; render(); break;
    case 'bookmark': {
      const saved = state.savedAids.includes(id);
      state.savedAids = saved ? state.savedAids.filter(a => a !== id) : [...state.savedAids, id];
      save(saved ? 'Ayuda quitada de tus guardadas.' : 'Ayuda guardada para consultar después.');
      break;
    }
    case 'aid-detail': showAid(id); break;
    case 'add-aid-task': {
      const a = aids.find(a => a.id === id);
      if (!a || state.tasks.some(t => t.aidId === id)) return;
      const task = { id: uid(), title: a.step, category: a.category, status: 'pending', date: '', time: '', notes: 'Confirmar la información en los canales oficiales. Ficha de ejemplo.', aidId: id };
      state.tasks.push(task);
      save('Gestión añadida. Ahora puedes elegir una fecha.');
      showTask(task.id);
      break;
    }
    case 'view-aid-task': { const task = state.tasks.find(t => t.aidId === id); if (task) showTask(task.id); break; }
    case 'select-date': selectedDate = b.dataset.date; render(); break;
    case 'week-prev': weekStart = addDays(weekStart, -7); selectedDate = dateKey(addDays(parseDate(selectedDate), -7)); render(); break;
    case 'week-next': weekStart = addDays(weekStart, 7); selectedDate = dateKey(addDays(parseDate(selectedDate), 7)); render(); break;
    case 'week-today': weekStart = addDays(today, -((today.getDay() + 6) % 7)); selectedDate = dateKey(today); render(); break;
    case 'export': {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `reconstruye-contigo-${dateKey(today)}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Datos exportados a un archivo JSON.');
      break;
    }
    case 'reset': showModal('¿Volver al ejemplo inicial?', '', '<div class="modal-body"><p>Se eliminarán tus cambios, turnos, ayudas guardadas y notas de este navegador. Volverás al perfil de Leonardo con las gestiones de ejemplo.</p></div><div class="form-actions"><button class="button secondary" data-action="profile">Cancelar</button><button class="button danger" data-action="confirm-reset">Restablecer demostración</button></div>'); break;
    case 'confirm-reset': state = initialState(); recoveryWarning = false; aidFilter = taskFilter = 'Todas'; aidSearch = taskSearch = ''; selectedDate = dateKey(today); weekStart = addDays(today, -((today.getDay() + 6) % 7)); modal.close(); save('Demostración restablecida.'); break;
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'aid-search') { aidSearch = event.target.value; document.getElementById('aid-results').innerHTML = aidResults(); }
  if (event.target.id === 'task-search') { taskSearch = event.target.value; document.getElementById('tracking-results').innerHTML = trackingResults(); }
});
document.addEventListener('change', event => {
  const id = event.target.dataset.statusId;
  if (!id) return;
  const task = state.tasks.find(t => t.id === id);
  if (task && Object.hasOwn(statuses, event.target.value)) {
    task.status = event.target.value;
    save(`Gestión actualizada: ${statuses[task.status].toLowerCase()}.`);
    document.querySelector(`[data-status-id="${CSS.escape(id)}"]`)?.focus();
  }
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (!['task-form', 'shift-form', 'profile-form'].includes(form.id)) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const error = text => { form.querySelector('.form-error').textContent = text; };
  if (form.id === 'task-form') {
    data.title = data.title.trim(); data.notes = data.notes.trim();
    if (!data.title) return error('Escribe un nombre para la gestión.');
    if (data.time && !data.date) return error('Elige una fecha para guardar la hora, o deja ambos campos vacíos.');
    if (data.date && data.time && data.status !== 'done' && state.shifts.some(s => s.date === data.date && data.time >= s.start && data.time < s.end)) return error('Esta hora coincide con un turno de trabajo. Elige un horario fuera de ese turno.');
    const existing = state.tasks.find(t => t.id === form.dataset.id);
    if (existing) Object.assign(existing, data);
    else state.tasks.push({ id: uid(), ...data });
    modal.close(); save(existing ? 'Gestión actualizada.' : 'Tu nueva gestión está lista.');
  }
  if (form.id === 'shift-form') {
    data.title = data.title.trim();
    if (!data.title) return error('Escribe un nombre para el turno.');
    if (data.end <= data.start) return error('La hora de término debe ser posterior al inicio. Divide los turnos nocturnos en dos días.');
    if (state.shifts.some(s => s.id !== form.dataset.id && s.date === data.date && data.start < s.end && data.end > s.start)) return error('Este horario se superpone con otro turno. Ajusta las horas.');
    if (state.tasks.some(t => t.date === data.date && t.status !== 'done' && t.time && t.time >= data.start && t.time < data.end)) return error('Tienes una gestión en ese horario. Reagéndala antes de guardar este turno.');
    const existing = state.shifts.find(s => s.id === form.dataset.id);
    if (existing) Object.assign(existing, data);
    else state.shifts.push({ id: uid(), ...data });
    selectedDate = data.date;
    const day = parseDate(data.date); weekStart = addDays(day, -((day.getDay() + 6) % 7));
    modal.close(); save('Turno guardado en tu agenda.');
  }
  if (form.id === 'profile-form') {
    data.name = data.name.trim(); data.location = data.location.trim();
    if (!data.name || !data.location) return error('Completa tu nombre y localidad.');
    state.profile = data; modal.close(); save('Perfil actualizado.');
  }
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const box = modal.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
  }
});
function navigate() {
  const next = location.hash.replace('#', '') || 'inicio';
  // El ancla de accesibilidad apunta a <main>, no a una nueva pantalla.
  if (next === 'main') { document.getElementById('main')?.focus(); return; }
  route = navItems.some(n => n[0] === next) ? next : 'inicio';
  render(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { navigate(); document.getElementById('main')?.focus({ preventScroll: true }); });
navigate();
