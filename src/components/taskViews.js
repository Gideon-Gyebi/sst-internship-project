export function renderTaskDashboard({ tasks, filter, page, pageSize = 10, loading, loadError, error, busy, busyMessage, icon, escapeHtml }) {
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const pending = tasks.length - completed;
  const filteredTasks = tasks.filter((task) => filter === 'all' || task.status === filter);
  const pageCount = Math.ceil(filteredTasks.length / pageSize);
  const currentPage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const pageTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const countsUnknown = loading || loadError;
  const totalValue = countsUnknown ? '—' : tasks.length;
  const pendingValue = countsUnknown ? '—' : pending;
  const completedValue = countsUnknown ? '—' : completed;
  const progressText = loading ? 'Loading your tasks…' : loadError ? 'Tasks unavailable' : tasks.length ? `${completed} of ${tasks.length} tasks completed` : 'Ready for a fresh start';
  const taskContent = loading
    ? '<div class="tasks-loading" role="status">Loading your study tasks…</div>'
    : loadError
      ? `<div class="task-load-error" role="alert"><span class="task-load-error__icon">!</span><h3>Your tasks couldn’t be loaded</h3><p>${escapeHtml(error || 'Check your connection and Firestore access, then try again.')}</p><button class="button button--secondary" type="button" data-action="retry-tasks">Try again</button></div>`
      : pageTasks.length
        ? pageTasks.map((task) => taskRow(task, busy, icon, escapeHtml)).join('')
        : emptyState(filter, tasks.length > 0, icon);

  return `
    <section class="stats-grid" aria-label="Task summary">
      ${statCard('Total tasks', totalValue, 'list', 'stat-card--neutral', icon)}
      ${statCard('Pending', pendingValue, 'clock', 'stat-card--pending', icon)}
      ${statCard('Completed', completedValue, 'check', 'stat-card--complete', icon)}
    </section>
    <section class="task-panel" aria-labelledby="tasks-heading" aria-busy="${loading || busy}">
      <div class="panel-heading"><h2 id="tasks-heading">Your study tasks</h2><span class="progress-copy" aria-live="polite">${progressText}</span></div>
      <div class="tabs" role="group" aria-label="Filter tasks">
        ${tabButton('all', 'All', countsUnknown ? '—' : tasks.length, filter)}
        ${tabButton('pending', 'Pending', countsUnknown ? '—' : pending, filter)}
        ${tabButton('completed', 'Completed', countsUnknown ? '—' : completed, filter)}
      </div>
      <div class="task-table" role="table" aria-label="Study tasks">
        ${taskContent}
      </div>
      ${!loading && !loadError && pageCount > 1 ? `<nav class="task-pagination" aria-label="Study task pages"><span>Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredTasks.length)} of ${filteredTasks.length}</span><div><button class="button button--secondary" type="button" data-task-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">Previous</button><span class="task-pagination__current" aria-live="polite">Page ${currentPage} of ${pageCount}</span><button class="button button--secondary" type="button" data-task-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''} aria-label="Next page">Next</button></div></nav>` : ''}
      ${busyMessage ? `<p class="task-feedback" role="status">${escapeHtml(busyMessage)}</p>` : ''}
      <div class="panel-footer"><span>${loading ? 'Loading tasks' : loadError ? 'Task counts unavailable' : `Showing ${pageTasks.length} of ${filteredTasks.length} ${filter === 'all' ? 'tasks' : `${filter} tasks`}`}</span>${loadError ? '' : `<span class="footer-hint">${icon('check', 13)} Use the checkbox to change task status</span>`}</div>
    </section>`;
}

export function renderTaskDialog({ dialog, tasks, busy, error, icon, escapeHtml }) {
  if (!dialog) return '';

  const task = tasks.find((item) => item.id === dialog.taskId);
  if (dialog.mode !== 'add' && !task) return '';
  const draft = dialog.draft || task || { title: '', subject: '' };
  const titleError = dialog.fieldError === 'title';
  const subjectError = dialog.fieldError === 'subject';
  const errorNotice = error && !dialog.fieldError ? `<p class="dialog-error" role="alert">${escapeHtml(error)}</p>` : '';

  if (dialog.mode === 'delete') {
    return `<div class="modal-backdrop" data-action="backdrop"><section class="task-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="delete-warning">
      <button class="dialog-close" type="button" data-action="close-dialog" aria-label="Close dialog">×</button>
      <h2 id="dialog-title">Delete this task?</h2><p class="dialog-subtitle">This task will be permanently removed from your list.</p>
      <div class="delete-task-summary"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.subject)}</span><small>${icon(task.status === 'completed' ? 'check' : 'clock', 13)} ${task.status === 'completed' ? 'Completed' : 'Pending'}</small></div>
      <p class="delete-warning" id="delete-warning">${icon('warning', 15)} This action can’t be undone.</p>
      ${errorNotice}
      <div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog" ${busy ? 'disabled' : ''}>Cancel</button><button class="button button--danger" type="button" data-action="confirm-delete" ${busy ? 'disabled' : ''}>${icon('trash', 14)} ${busy ? 'Deleting…' : 'Delete task'}</button></div>
    </section></div>`;
  }

  const editing = dialog.mode === 'edit';
  return `<div class="modal-backdrop" data-action="backdrop"><section class="task-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
    <button class="dialog-close" type="button" data-action="close-dialog" aria-label="Close dialog" ${busy ? 'disabled' : ''}>×</button>
    <h2 id="dialog-title">${editing ? 'Edit task' : 'Add a study task'}</h2>
    <p class="dialog-subtitle" id="dialog-description">${editing ? 'A change of plan? Update the details below.' : 'Make your next step clear and manageable.'}</p>
    ${errorNotice}
    <form id="task-form" novalidate>
      <label class="field-label" for="task-title">Task title <span aria-hidden="true">*</span></label>
      <input class="auth-input task-input ${titleError ? 'auth-input--error' : ''}" id="task-title" name="title" type="text" maxlength="160" placeholder="e.g. Practice integration by parts" value="${escapeHtml(draft.title)}" aria-invalid="${titleError}" ${titleError ? 'aria-describedby="task-title-error"' : ''} required ${busy ? 'disabled' : ''} />
      ${titleError ? `<span class="field-error" id="task-title-error">${escapeHtml(error)}</span>` : ''}
      <label class="field-label" for="task-subject">Subject / course <span aria-hidden="true">*</span></label>
      <input class="auth-input task-input ${subjectError ? 'auth-input--error' : ''}" id="task-subject" name="subject" type="text" maxlength="120" placeholder="e.g. MATH 201 · Calculus II" value="${escapeHtml(draft.subject)}" aria-invalid="${subjectError}" ${subjectError ? 'aria-describedby="task-subject-error"' : ''} required ${busy ? 'disabled' : ''} />
      ${subjectError ? `<span class="field-error" id="task-subject-error">${escapeHtml(error)}</span>` : ''}
      <p class="task-form-note">${icon('clock', 14)} New tasks start as pending. Check them off when you’re done.</p>
      <div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog" ${busy ? 'disabled' : ''}>Cancel</button><button class="button button--primary" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : editing ? 'Save changes' : 'Save task'}</button></div>
    </form>
  </section></div>`;
}

function statCard(label, value, iconName, modifier, icon) {
  return `<article class="stat-card ${modifier}"><div><span>${label}</span><strong>${value}</strong></div><span class="stat-icon">${icon(iconName, 18)}</span></article>`;
}

function tabButton(key, label, count, activeFilter) {
  return `<button class="tab ${activeFilter === key ? 'tab--active' : ''}" type="button" aria-pressed="${activeFilter === key}" data-task-filter="${key}">${label}<span>${count}</span></button>`;
}

function taskRow(task, busy, icon, escapeHtml) {
  const complete = task.status === 'completed';
  const safeTitle = escapeHtml(task.title);
  return `<div class="task-row ${complete ? 'task-row--complete' : ''}" role="row">
    <span class="task-col task-details" role="cell"><button class="task-check ${complete ? 'task-check--checked' : ''}" type="button" role="checkbox" aria-checked="${complete}" aria-label="Mark ${safeTitle} ${complete ? 'pending' : 'completed'}" data-action="toggle-task" data-task-id="${escapeHtml(task.id)}" ${busy ? 'disabled' : ''}>${complete ? icon('check', 13) : ''}</button><span><strong>${safeTitle}</strong><small>${escapeHtml(task.subject)}</small></span></span>
    <span class="status-col" role="cell"><span class="status-pill ${complete ? 'status-pill--complete' : ''}">${icon(complete ? 'check' : 'clock', 13)}${complete ? 'Completed' : 'Pending'}</span></span>
    <span class="actions-col row-actions" role="cell"><button type="button" class="icon-button" data-action="edit-task" data-task-id="${escapeHtml(task.id)}" aria-label="Edit ${safeTitle}" ${busy ? 'disabled' : ''}>${icon('edit', 15)}</button><button type="button" class="icon-button" data-action="delete-task" data-task-id="${escapeHtml(task.id)}" aria-label="Delete ${safeTitle}" ${busy ? 'disabled' : ''}>${icon('trash', 15)}</button></span>
  </div>`;
}

function emptyState(filter, hasTasks, icon) {
  const heading = hasTasks ? `No ${filter} tasks right now.` : 'A clear list. A fresh start.';
  const description = hasTasks ? 'Choose another tab or add a study task.' : 'Add your first study task and give your next small step a place to live.';
  return `<div class="empty-state"><span class="empty-icon">${icon('list', 26)}</span><h3>${heading}</h3><p>${description}</p><button class="button button--primary" type="button" data-action="add-task">${icon('plus', 15)} Add ${hasTasks ? 'a' : 'your first'} task</button></div>`;
}
