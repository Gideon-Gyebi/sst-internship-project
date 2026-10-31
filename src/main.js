import './styles.css';
import { firebaseSetupMessage } from './firebase.js';

const icon = (name, size = 18) => {
  const paths = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h8"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    sprout: '<path d="M12 22v-9m0 4c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-4c0-5 3-8 8-8 0 5-3 8-8 8Z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    plus: '<path d="M12 5v14m-7-7h14"/>',
  };
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

const tasks = [
  { title: 'Practice integration by parts', subject: 'MATH 201 · Calculus II', complete: false },
  { title: 'Review cellular respiration', subject: 'BIO 101 · Biology', complete: false },
  { title: 'Outline the research essay', subject: 'HIST 210 · World History', complete: false },
  { title: 'Complete the recursion problem set', subject: 'CS 102 · Computer Science', complete: false },
  { title: 'Read and annotate chapter 4', subject: 'ENG 105 · Literature', complete: true },
  { title: 'Submit the lab report', subject: 'PHYS 101 · Physics', complete: true },
];

const storedTheme = localStorage.getItem('sst-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let theme = storedTheme || (prefersDark ? 'dark' : 'light');
let filter = 'all';
let mobileMenuOpen = false;

function render() {
  document.documentElement.dataset.theme = theme;
  const completed = tasks.filter((task) => task.complete).length;
  const pending = tasks.length - completed;
  const visibleTasks = tasks.filter((task) => filter === 'all' || (filter === 'completed' ? task.complete : !task.complete));
  const firstName = 'Alex';

  document.querySelector('#app').innerHTML = `
    <div class="app-shell">
      <aside class="sidebar ${mobileMenuOpen ? 'sidebar--open' : ''}" aria-label="Main navigation">
        <a class="brand" href="#dashboard" aria-label="Student Study Tracker home">
          <span class="brand-mark">${icon('book', 19)}</span>
          <span class="brand-copy"><strong>sst</strong><small>Student Study Tracker</small></span>
        </a>
        <div class="sidebar-label">Workspace</div>
        <a class="nav-link nav-link--active" href="#dashboard">${icon('grid', 16)}<span>Dashboard</span></a>
        <section class="sidebar-note" aria-label="Study tip">
          <span class="sidebar-note__icon">${icon('sprout', 17)}</span>
          <strong>A little progress, daily.</strong>
          <p>Make space for what matters. One study task at a time.</p>
        </section>
        <div class="sidebar-bottom">
          <div class="sidebar-label">Appearance</div>
          ${themeToggle('sidebar-theme')}
          <button class="signout-button" type="button" disabled title="Sign-out is added in the authentication phase">${icon('menu', 15)}<span>Sign out</span></button>
        </div>
      </aside>

      <div class="workspace">
        <header class="topbar">
          <button class="icon-button mobile-menu" type="button" aria-label="Toggle navigation" aria-expanded="${mobileMenuOpen}" data-action="menu">${icon('menu')}</button>
          <div class="breadcrumb">${icon('grid', 15)}<span aria-hidden="true">/</span><span>Dashboard</span></div>
          <div class="profile"><span class="avatar">AM</span><span>Alex Morgan</span><span class="chevron" aria-hidden="true">⌄</span></div>
        </header>

        <main class="main-content" id="dashboard">
          <div class="mobile-brand-row"><a class="brand" href="#dashboard"> <span class="brand-mark">${icon('book', 19)}</span><span class="brand-copy"><strong>sst</strong></span></a>${themeToggle('mobile-theme')}</div>
          ${firebaseSetupMessage ? `<div class="setup-notice" role="status">${firebaseSetupMessage}</div>` : ''}
          <section class="welcome-row">
            <div><h1>A little progress starts here, ${firstName}</h1><p>Your coursework, in one calm place. Let’s make today count.</p></div>
            <button class="button button--primary" type="button" disabled title="Task creation is added in the next phase">${icon('plus', 16)} Add task</button>
          </section>

          <section class="stats-grid" aria-label="Task summary">
            ${statCard('Total tasks', tasks.length, 'list', 'stat-card--neutral')}
            ${statCard('Pending', pending, 'clock', 'stat-card--pending')}
            ${statCard('Completed', completed, 'check', 'stat-card--complete')}
          </section>

          <section class="task-panel" aria-labelledby="tasks-heading">
            <div class="panel-heading"><h2 id="tasks-heading">Your study tasks</h2><span class="progress-copy">${completed} of ${tasks.length} tasks completed</span></div>
            <div class="tabs" role="tablist" aria-label="Filter tasks">
              ${tabButton('all', 'All', tasks.length)}${tabButton('pending', 'Pending', pending)}${tabButton('completed', 'Completed', completed)}
            </div>
            <div class="task-table" role="table" aria-label="Study tasks">
              <div class="table-header" role="row"><span class="task-col" role="columnheader">Task / course</span><span class="status-col" role="columnheader">Status</span><span class="actions-col" role="columnheader">Actions</span></div>
              ${visibleTasks.length ? visibleTasks.map(taskRow).join('') : `<div class="empty-state"><span class="empty-icon">${icon('list', 26)}</span><h3>No tasks in this view</h3><p>Choose another tab to see your study tasks.</p></div>`}
            </div>
            <div class="panel-footer"><span>Showing ${visibleTasks.length} of ${tasks.length} tasks</span><span class="footer-hint">${icon('check', 13)} Check a task to mark it as completed</span></div>
          </section>
          <p class="page-note">Small steps add up. Focus on one task at a time.</p>
        </main>
      </div>
      <nav class="mobile-bottom-nav" aria-label="Mobile navigation"><a href="#dashboard">${icon('grid', 16)} Dashboard</a><span class="mobile-initials">AM</span><button type="button" class="icon-button" disabled aria-label="Sign out">↪</button></nav>
    </div>`;

  document.querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => {
    theme = button.dataset.themeChoice;
    localStorage.setItem('sst-theme', theme);
    render();
  }));
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    render();
  }));
  document.querySelector('[data-action="menu"]')?.addEventListener('click', () => {
    mobileMenuOpen = !mobileMenuOpen;
    render();
  });
}

function themeToggle(className) {
  return `<div class="theme-toggle ${className}" role="group" aria-label="Choose color theme"><button type="button" data-theme-choice="light" aria-pressed="${theme === 'light'}">${icon('sun', 14)}<span>Light</span></button><button type="button" data-theme-choice="dark" aria-pressed="${theme === 'dark'}">${icon('moon', 14)}<span>Dark</span></button></div>`;
}

function statCard(label, value, iconName, modifier) {
  return `<article class="stat-card ${modifier}"><div><span>${label}</span><strong>${value}</strong></div><span class="stat-icon">${icon(iconName, 18)}</span></article>`;
}

function tabButton(key, label, count) {
  return `<button class="tab ${filter === key ? 'tab--active' : ''}" type="button" role="tab" aria-selected="${filter === key}" data-filter="${key}">${label}<span>${count}</span></button>`;
}

function taskRow(task) {
  return `<div class="task-row ${task.complete ? 'task-row--complete' : ''}" role="row"><span class="task-col task-details" role="cell"><span class="task-check ${task.complete ? 'task-check--checked' : ''}" aria-hidden="true">${task.complete ? icon('check', 13) : ''}</span><span><strong>${task.title}</strong><small>${task.subject}</small></span></span><span class="status-col" role="cell"><span class="status-pill ${task.complete ? 'status-pill--complete' : ''}">${icon(task.complete ? 'check' : 'clock', 13)}${task.complete ? 'Completed' : 'Pending'}</span></span><span class="actions-col row-actions" role="cell"><button type="button" class="icon-button" disabled aria-label="Edit ${task.title}">✎</button><button type="button" class="icon-button" disabled aria-label="Delete ${task.title}">⌫</button></span></div>`;
}

render();
