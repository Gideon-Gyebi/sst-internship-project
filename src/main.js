import './styles.css';
import { firebaseReady, firebaseSetupMessage } from './firebase.js';
import {
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
  watchAuthState,
} from './services/auth.js';
import { renderTaskDashboard, renderTaskDialog } from './components/taskViews.js';

const icon = (name, size = 18) => {
  const paths = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h8"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    sprout: '<path d="M12 22v-9m0 4c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-4c0-5 3-8 8-8 0 5-3 8-8 8Z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    plus: '<path d="M12 5v14m-7-7h14"/>',
    logout: '<path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a14.8 14.8 0 0 1-3 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 3-.4"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
    warning: '<path d="m10.3 3.9-8 14A1.4 1.4 0 0 0 3.5 20h17a1.4 1.4 0 0 0 1.2-2.1l-8-14a1.9 1.9 0 0 0-3.4 0Z"/><path d="M12 9v4m0 3h.01"/>',
  };
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
};

const storedTheme = localStorage.getItem('sst-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const state = {
  theme: storedTheme || (prefersDark ? 'dark' : 'light'),
  authLoading: firebaseReady,
  user: null,
  authMode: 'login',
  authBusy: false,
  authError: '',
  email: '',
  name: '',
  mobileMenuOpen: false,
  signOutBusy: false,
  tasks: [],
  tasksLoading: false,
  taskError: '',
  taskFilter: 'all',
  taskPage: 1,
  taskBusy: false,
  taskBusyMessage: '',
  tasksLoadFailed: false,
  taskDialog: null,
  stopWatchingTasks: null,
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function errorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email. Sign in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/invalid-credential': 'That email and password combination could not be verified.',
    'auth/user-disabled': 'This account is unavailable. Contact the project owner for help.',
    'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts were made. Wait a little and try again.',
    'auth/network-request-failed': 'A network error interrupted sign-in. Check your connection and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow popups and try again.',
    'auth/unauthorized-domain': 'This site is not on the Firebase Authentication authorized domains list.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Authentication yet.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Sign in using its original method.',
  };
  return messages[error?.code] || 'We could not complete sign-in. Please try again.';
}

function taskErrorMessage(error) {
  const messages = {
    'permission-denied': 'Firestore blocked this request. Deploy the project’s Firestore rules, then reload.',
    unauthenticated: 'Your sign-in expired. Sign in again to manage your tasks.',
    unavailable: 'Firestore is temporarily unavailable. Check your connection and try again.',
    'deadline-exceeded': 'Firestore took too long to respond. Please try again.',
    'not-found': 'This task is no longer available. Refresh the list and try again.',
  };
  return messages[error?.code] || 'We could not save that task. Please try again.';
}

function render() {
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('#app').innerHTML = state.authLoading
    ? renderLoading()
    : state.user ? renderDashboard(state.user) : renderAuthScreen();

  bindThemeControls();
  if (state.user) bindDashboardControls();
  else if (!state.authLoading) bindAuthControls();
}

function renderLoading() {
  return `<main class="auth-loading" aria-live="polite"><span class="brand-mark">${icon('book', 19)}</span><p>Getting your workspace ready…</p></main>`;
}

function renderAuthScreen() {
  const registering = state.authMode === 'register';
  const title = registering ? 'Create your account' : 'Welcome back';
  const error = state.authError ? `<div class="auth-message auth-message--error" role="alert">${escapeHtml(state.authError)}</div>` : '';
  const setupNotice = firebaseSetupMessage ? `<div class="auth-message auth-message--setup" role="status">${escapeHtml(firebaseSetupMessage)}</div>` : '';

  return `
    <main class="auth-layout">
      <section class="auth-story" aria-label="About Student Study Tracker">
        <a class="brand" href="#" aria-label="Student Study Tracker"><span class="brand-mark">${icon('book', 19)}</span><span class="brand-copy"><strong>SST</strong><small>Student Study Tracker</small></span></a>
        <div class="auth-story__content">
          <span class="auth-eyebrow">Your studies. A little clearer.</span>
          <h1>Less mental clutter.<br />More meaningful progress.</h1>
          <p>A calm place to organize your coursework, keep track of tasks, and see how far you’ve come.</p>
          <ul class="benefit-list">
            <li><span>${icon('list', 17)}</span>One clear list for every course</li>
            <li><span>${icon('check', 17)}</span>Small wins you can actually see</li>
            <li><span>${icon('sprout', 17)}</span>A workspace that fits your rhythm</li>
          </ul>
        </div>
        <p class="auth-story__footer">Made for steady progress, not perfect days.</p>
      </section>

      <section class="auth-panel" aria-labelledby="auth-title">
        <div class="auth-theme">${themeToggle('auth-theme-toggle')}</div>
        <a class="brand auth-mobile-brand" href="#" aria-label="Student Study Tracker"><span class="brand-mark">${icon('book', 19)}</span><span class="brand-copy"><strong>SST</strong><small>Student Study Tracker</small></span></a>
        <div class="auth-card">
          <h2 id="auth-title">${title}</h2>
          <p class="auth-subtitle">${registering ? 'A fresh start for a more focused semester.' : 'Pick up where you left off. You’ve got this.'}</p>
          ${setupNotice}${error}
          <button class="google-button" type="button" data-action="google" ${state.authBusy || !firebaseReady ? 'disabled' : ''}>
            <span class="google-mark" aria-hidden="true">G</span><span>${state.authBusy ? 'Connecting…' : 'Continue with Google'}</span>
          </button>
          <div class="auth-divider"><span>or continue with email</span></div>
          <form id="auth-form" novalidate>
            ${registering ? `<label class="field-label" for="full-name">Full name</label><input class="auth-input" id="full-name" name="name" type="text" autocomplete="name" placeholder="Your name" value="${escapeHtml(state.name)}" required ${state.authBusy ? 'disabled' : ''} />` : ''}
            <label class="field-label" for="email">Email address</label>
            <input class="auth-input" id="email" name="email" type="email" autocomplete="email" placeholder="you@university.edu" value="${escapeHtml(state.email)}" required ${state.authBusy ? 'disabled' : ''} />
            <label class="field-label" for="password">Password</label>
            <div class="password-field"><input class="auth-input" id="password" name="password" type="password" autocomplete="${registering ? 'new-password' : 'current-password'}" placeholder="${registering ? 'Create a password' : 'Enter your password'}" minlength="8" required ${state.authBusy ? 'disabled' : ''} /><button class="password-toggle" type="button" data-action="toggle-password" aria-label="Show password" aria-pressed="false">${icon('eye', 17)}</button></div>
            ${registering ? '<p class="password-hint">Use at least 8 characters.</p>' : ''}
            <button class="button button--primary auth-submit" type="submit" ${state.authBusy || !firebaseReady ? 'disabled' : ''}>${state.authBusy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}</button>
          </form>
          <p class="auth-switch">${registering ? 'Already have an account?' : 'New to SST?'} <button type="button" data-action="switch-mode">${registering ? 'Sign in' : 'Create an account'}</button></p>
        </div>
        <p class="auth-legal">© 2026 SST · A little structure. A lot more clarity.</p>
      </section>
    </main>`;
}

function renderDashboard(user) {
  const displayName = user.displayName?.trim() || user.email?.split('@')[0] || 'there';
  const safeName = escapeHtml(displayName);
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'S';
  const dashboardSubtitle = state.tasksLoading
    ? 'Loading your saved study tasks…'
    : state.tasksLoadFailed
      ? 'Your saved study tasks are temporarily unavailable.'
      : state.tasks.length
        ? 'Your coursework, in one calm place. Keep your momentum going.'
        : 'Your semester, organized. Let’s start with your first study task.';
  return `
    <div class="app-shell">
      <aside class="sidebar ${state.mobileMenuOpen ? 'sidebar--open' : ''}" aria-label="Main navigation">
        <a class="brand" href="#dashboard" aria-label="Student Study Tracker home"><span class="brand-mark">${icon('book', 19)}</span><span class="brand-copy"><strong>SST</strong><small>Student Study Tracker</small></span></a>
        <div class="sidebar-label">Workspace</div>
        <a class="nav-link nav-link--active" href="#dashboard">${icon('grid', 16)}<span>Dashboard</span></a>
        <section class="sidebar-note" aria-label="Study tip"><span class="sidebar-note__icon">${icon('sprout', 17)}</span><strong>A little progress, daily.</strong><p>Make space for what matters. One study task at a time.</p></section>
        <div class="sidebar-bottom"><div class="sidebar-label">Appearance</div>${themeToggle('sidebar-theme')}<button class="signout-button" type="button" data-action="signout" ${state.signOutBusy ? 'disabled' : ''}>${icon('logout', 15)}<span>${state.signOutBusy ? 'Signing out…' : 'Sign out'}</span></button></div>
      </aside>
      <div class="workspace">
        <header class="topbar"><button class="icon-button mobile-menu" type="button" aria-label="Toggle navigation" aria-expanded="${state.mobileMenuOpen}" data-action="menu">${icon('menu')}</button><div class="breadcrumb">${icon('grid', 15)}<span aria-hidden="true">/</span><span>Dashboard</span></div><div class="profile"><span class="avatar">${escapeHtml(initials)}</span><span>${safeName}</span></div></header>
        <main class="main-content" id="dashboard">
          <div class="mobile-brand-row"><a class="brand" href="#dashboard"><span class="brand-mark">${icon('book', 19)}</span><span class="brand-copy"><strong>SST</strong></span></a>${themeToggle('mobile-theme')}</div>
          ${state.authError ? `<div class="auth-message auth-message--error" role="alert">${escapeHtml(state.authError)}</div>` : ''}
          ${state.taskError && !state.taskDialog && !state.tasksLoadFailed ? `<div class="auth-message auth-message--error" role="alert">${escapeHtml(state.taskError)}</div>` : ''}
          <section class="welcome-row"><div><h1>Welcome to your workspace, ${safeName}</h1><p>${dashboardSubtitle}</p></div><button class="button button--primary" type="button" data-action="add-task" ${state.taskBusy || state.tasksLoadFailed ? 'disabled' : ''}>${icon('plus', 16)} Add task</button></section>
          ${renderTaskDashboard({ tasks: state.tasks, filter: state.taskFilter, page: state.taskPage, pageSize: 10, loading: state.tasksLoading, loadError: state.tasksLoadFailed, error: state.taskError, busy: state.taskBusy, busyMessage: state.taskBusyMessage, icon, escapeHtml })}
          <p class="page-note">Small steps add up. Focus on one task at a time.</p>
        </main>
      </div>
      <nav class="mobile-bottom-nav" aria-label="Mobile navigation"><a href="#dashboard">${icon('grid', 16)} Dashboard</a><span class="mobile-initials">${escapeHtml(initials)}</span><button type="button" class="icon-button" data-action="signout" aria-label="Sign out" ${state.signOutBusy ? 'disabled' : ''}>↪</button></nav>
      ${renderTaskDialog({ dialog: state.taskDialog, tasks: state.tasks, busy: state.taskBusy, error: state.taskError, icon, escapeHtml })}
    </div>`;
}

function themeToggle(className) {
  return `<div class="theme-toggle ${className}" role="group" aria-label="Choose color theme"><button type="button" data-theme-choice="light" aria-pressed="${state.theme === 'light'}">${icon('sun', 14)}<span>Light</span></button><button type="button" data-theme-choice="dark" aria-pressed="${state.theme === 'dark'}">${icon('moon', 14)}<span>Dark</span></button></div>`;
}

function bindThemeControls() {
  document.querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => {
    state.theme = button.dataset.themeChoice;
    localStorage.setItem('sst-theme', state.theme);
    document.documentElement.dataset.theme = state.theme;
    document.querySelectorAll('[data-theme-choice]').forEach((themeButton) => {
      themeButton.setAttribute('aria-pressed', String(themeButton.dataset.themeChoice === state.theme));
    });
  }));
}

function bindAuthControls() {
  const form = document.querySelector('#auth-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    state.email = String(formData.get('email') || '').trim();
    state.name = String(formData.get('name') || '').trim();
    const password = String(formData.get('password') || '');
    if (state.authMode === 'register' && password.length < 8) {
      state.authError = 'Choose a password with at least 8 characters.';
      render();
      return;
    }

    state.authError = '';
    state.authBusy = true;
    setAuthFormBusy(true);
    try {
      if (state.authMode === 'register') {
        state.user = await registerWithEmail({ name: state.name, email: state.email, password });
        state.authBusy = false;
        render();
      } else {
        await loginWithEmail({ email: state.email, password });
      }
    } catch (error) {
      state.authError = errorMessage(error);
      state.authBusy = false;
      render();
      document.querySelector('#password')?.focus();
    }
  });

  document.querySelector('[data-action="google"]')?.addEventListener('click', async () => {
    state.authError = '';
    state.authBusy = true;
    setAuthFormBusy(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      state.authError = errorMessage(error);
      state.authBusy = false;
      render();
    }
  });

  document.querySelector('[data-action="switch-mode"]')?.addEventListener('click', () => {
    state.authMode = state.authMode === 'login' ? 'register' : 'login';
    state.authError = '';
    render();
    document.querySelector(state.authMode === 'register' ? '#full-name' : '#email')?.focus();
  });

  document.querySelector('[data-action="toggle-password"]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const input = document.querySelector('#password');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    button.innerHTML = icon(show ? 'eyeOff' : 'eye', 17);
  });
}

function setAuthFormBusy(busy) {
  const form = document.querySelector('#auth-form');
  if (form) {
    form.setAttribute('aria-busy', String(busy));
    form.querySelectorAll('input, button').forEach((control) => { control.disabled = busy; });
  }
  const googleButton = document.querySelector('[data-action="google"]');
  if (googleButton) googleButton.disabled = busy;
  const submitButton = form?.querySelector('[type="submit"]');
  if (submitButton) submitButton.textContent = 'Please wait…';
}

function bindDashboardControls() {
  document.querySelector('[data-action="menu"]')?.addEventListener('click', () => {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    render();
  });
  document.querySelectorAll('[data-action="signout"]').forEach((button) => button.addEventListener('click', async () => {
    state.signOutBusy = true;
    state.authError = '';
    render();
    try {
      await logout();
    } catch (error) {
      state.authError = errorMessage(error);
      state.signOutBusy = false;
      render();
    }
  }));

  document.querySelectorAll('[data-action="add-task"]').forEach((button) => button.addEventListener('click', () => {
    showTaskDialog({ mode: 'add', draft: { title: '', subject: '' } });
  }));

  document.querySelectorAll('[data-task-filter]').forEach((button) => button.addEventListener('click', () => {
    state.taskFilter = button.dataset.taskFilter;
    state.taskPage = 1;
    render();
  }));

  document.querySelectorAll('[data-task-page]').forEach((button) => button.addEventListener('click', () => {
    const isMovingForward = Number(button.dataset.taskPage) > state.taskPage;
    state.taskPage = Number(button.dataset.taskPage);
    render();
    const pageButton = document.querySelector(`.task-pagination [aria-label="${isMovingForward ? 'Previous' : 'Next'} page"]`);
    pageButton?.focus({ preventScroll: true });
    document.querySelector('.task-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  document.querySelectorAll('[data-action="toggle-task"]').forEach((button) => button.addEventListener('click', async () => {
    if (state.taskBusy) return;
    const task = state.tasks.find((item) => item.id === button.dataset.taskId);
    if (!task) return;
    state.taskBusy = true;
    state.taskBusyMessage = 'Updating task status…';
    state.taskError = '';
    render();
    try {
      const { setTaskStatus } = await import('./services/tasks.js');
      await setTaskStatus(state.user.uid, task.id, task.status === 'completed' ? 'pending' : 'completed');
    } catch (error) {
      state.taskError = taskErrorMessage(error);
    } finally {
      state.taskBusy = false;
      state.taskBusyMessage = '';
      render();
    }
  }));

  document.querySelectorAll('[data-action="edit-task"]').forEach((button) => button.addEventListener('click', () => {
    showTaskDialog({ mode: 'edit', taskId: button.dataset.taskId, draft: null });
  }));

  document.querySelectorAll('[data-action="delete-task"]').forEach((button) => button.addEventListener('click', () => {
    showTaskDialog({ mode: 'delete', taskId: button.dataset.taskId, draft: null });
  }));

  document.querySelectorAll('[data-action="close-dialog"]').forEach((button) => button.addEventListener('click', closeTaskDialog));
  document.querySelector('[data-action="backdrop"]')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeTaskDialog();
  });
  document.querySelector('[data-action="confirm-delete"]')?.addEventListener('click', confirmDeleteTask);
  document.querySelector('[data-action="retry-tasks"]')?.addEventListener('click', () => {
    if (!state.user || state.tasksLoading) return;
    watchCurrentUserTasks(state.user);
    render();
  });
  document.querySelector('#task-form')?.addEventListener('submit', saveTaskForm);
  document.querySelector('.task-dialog')?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !state.taskBusy) closeTaskDialog();
  });
}

function showTaskDialog(dialog) {
  if (state.taskBusy) return;
  state.taskDialog = dialog;
  state.taskError = '';
  render();
  if (dialog.mode !== 'delete') requestAnimationFrame(() => document.querySelector('#task-title')?.focus());
}

function closeTaskDialog() {
  if (state.taskBusy) return;
  state.taskDialog = null;
  state.taskError = '';
  render();
  requestAnimationFrame(() => document.querySelector('[data-action="add-task"]')?.focus());
}

async function saveTaskForm(event) {
  event.preventDefault();
  if (state.taskBusy || !state.taskDialog) return;

  const formData = new FormData(event.currentTarget);
  const draft = {
    title: String(formData.get('title') || '').trim(),
    subject: String(formData.get('subject') || '').trim(),
  };
  state.taskDialog.draft = draft;

  if (!draft.title) {
    state.taskDialog.fieldError = 'title';
    state.taskError = 'Enter a task title to continue.';
    render();
    document.querySelector('#task-title')?.focus();
    return;
  }
  if (!draft.subject) {
    state.taskDialog.fieldError = 'subject';
    state.taskError = 'Enter a subject or course to continue.';
    render();
    document.querySelector('#task-subject')?.focus();
    return;
  }

  const dialog = state.taskDialog;
  dialog.fieldError = null;
  state.taskBusy = true;
  state.taskError = '';
  render();
  let saved = false;
  try {
    const { createTask, updateTask } = await import('./services/tasks.js');
    if (dialog.mode === 'edit') await updateTask(state.user.uid, dialog.taskId, draft);
    else await createTask(state.user.uid, draft);
    state.taskDialog = null;
    state.taskError = '';
    saved = true;
  } catch (error) {
    state.taskError = taskErrorMessage(error);
  } finally {
    state.taskBusy = false;
    render();
    if (saved) requestAnimationFrame(() => document.querySelector('[data-action="add-task"]')?.focus());
  }
}

async function confirmDeleteTask() {
  if (state.taskBusy || state.taskDialog?.mode !== 'delete') return;
  const taskId = state.taskDialog.taskId;
  state.taskBusy = true;
  state.taskError = '';
  render();
  let removed = false;
  try {
    const { removeTask } = await import('./services/tasks.js');
    await removeTask(state.user.uid, taskId);
    state.taskDialog = null;
    removed = true;
  } catch (error) {
    state.taskError = taskErrorMessage(error);
  } finally {
    state.taskBusy = false;
    render();
    if (removed) requestAnimationFrame(() => document.querySelector('[data-action="add-task"]')?.focus());
  }
}

async function watchCurrentUserTasks(user) {
  state.stopWatchingTasks?.();
  state.stopWatchingTasks = null;
  state.tasks = [];
  state.tasksLoading = Boolean(user);
  state.tasksLoadFailed = false;
  state.taskError = '';
  state.taskFilter = 'all';
  state.taskPage = 1;
  state.taskDialog = null;

  if (!user) return;

  const userId = user.uid;
  try {
    const { subscribeToTasks } = await import('./services/tasks.js');
    if (state.user?.uid !== userId) return;
    const stopWatching = await subscribeToTasks(userId, (tasks) => {
      if (state.user?.uid !== userId) return;
      state.tasks = tasks;
      state.tasksLoading = false;
      state.tasksLoadFailed = false;
      if (state.taskDialog && state.taskDialog.mode !== 'add' && !tasks.some((task) => task.id === state.taskDialog.taskId)) {
        state.taskDialog = null;
        state.taskError = 'That task is no longer available. Your list has been refreshed.';
      }
      render();
    }, (error) => {
      if (state.user?.uid !== userId) return;
      state.tasksLoading = false;
      state.tasksLoadFailed = true;
      state.taskError = taskErrorMessage(error);
      render();
    });
    if (state.user?.uid !== userId) {
      stopWatching();
      return;
    }
    state.stopWatchingTasks = stopWatching;
  } catch (error) {
    if (state.user?.uid !== userId) return;
    state.tasksLoading = false;
    state.tasksLoadFailed = true;
    state.taskError = taskErrorMessage(error);
    render();
  }
}

render();

if (firebaseReady) {
  watchAuthState((user) => {
    state.user = user;
    watchCurrentUserTasks(user);
    state.authLoading = false;
    state.authBusy = false;
    state.signOutBusy = false;
    state.authError = '';
    document.title = user ? 'Dashboard · SST' : 'Sign in · SST';
    render();
  }, () => {
    state.stopWatchingTasks?.();
    state.stopWatchingTasks = null;
    state.authLoading = false;
    state.user = null;
    state.tasks = [];
    state.tasksLoading = false;
    state.authError = 'We could not restore your sign-in. Refresh the page or try again.';
    render();
  });
} else {
  state.authLoading = false;
  render();
}
