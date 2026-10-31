# Student Study Tracker (SST) — Implementation Objectives

## 1. Purpose of This Document

This document is the primary implementation specification for the **Student Study Tracker (SST)** web application.

Before making significant changes, the implementation agent must review:

1. This `OBJECTIVES.md` file.
2. The ATU Virtual Internship project brief provided in the repository.
3. The exported SST UI/UX design PDFs in the `design/` directory.

### Source-of-truth priority

When requirements conflict, use this order:

1. **ATU project brief** — governing academic requirements.
2. **OBJECTIVES.md** — agreed functional and technical implementation decisions.
3. **UI/UX design PDFs** — visual and interaction reference.

Do not silently introduce major features, frameworks, services, or architectural changes outside these sources. If a requirement is unclear, choose the simplest solution consistent with the existing project.

---

# 2. Project Identity

**Application name:** Student Study Tracker  
**Abbreviation:** SST  
**Project type:** Student study-task tracking web application

SST is a production-oriented web application that allows students to securely manage and track their study tasks.

The application should allow authenticated users to create, view, edit, complete, organise and delete their study tasks while monitoring their overall progress.

The application must remain small enough to satisfy the ATU beginner mini-project scope while using carefully selected modern services to provide personalised user accounts and cloud-based data persistence.

---

# 3. Core Objectives

The application must enable a user to:

- Create study tasks.
- Associate each task with a subject or course.
- View saved tasks clearly.
- Edit an existing task.
- Mark a task as complete.
- Change a completed task back to pending.
- Delete a task.
- View tasks through organised status tabs.
- View summary statistics for total, pending and completed tasks.
- Retain personalised data after refresh and across authenticated devices.
- Sign in securely and access only their own data.
- Switch manually between light and dark themes.

---

# 4. Mandatory ATU Requirements

The following requirements originate from the governing ATU project brief and must work correctly:

## 4.1 Add a Task

The user must be able to add a task containing:

- Task title.
- Subject or course name.

A blank task title must not be accepted.

## 4.2 Display Tasks

Saved tasks must be displayed clearly.

## 4.3 Toggle Completion

The user must be able to:

- Mark a task as complete.
- Change a completed task back to incomplete/pending.

The visual interface must clearly distinguish task status.

## 4.4 Delete a Task

The user must be able to permanently remove a task.

Deletion must update both the interface and persistent data.

## 4.5 Persistence

Tasks must remain available after the page is refreshed.

For SST, Cloud Firestore will provide persistent storage for authenticated users.

## 4.6 Empty State

When no tasks exist, display a helpful and clear empty-state message.

---

# 5. Approved Enhancements

The following features are deliberate enhancements beyond the minimum ATU requirements:

- User authentication.
- Google sign-in.
- Email/password registration and login.
- Cloud Firestore database.
- Personalised user data.
- Cross-device data access for authenticated users.
- Editing existing tasks.
- Dashboard statistics.
- Task filtering through tabs.
- Manual light/dark theme switching.

These enhancements must not interfere with or replace the mandatory requirements.

---

# 6. Technology Stack

Use the following approved stack:

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Vite

Do not introduce React, Vue, Angular or another frontend framework unless explicitly approved.

## Development Environment

- Visual Studio Code
- Node.js and npm
- Vite development server

## Firebase Services

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

Firebase Cloud Functions are not currently required.

---

# 7. Application Architecture Principles

The project must remain modular and understandable.

Separate responsibilities where practical:

- UI rendering and interaction.
- Authentication.
- Firestore/database operations.
- Validation.
- Theme management.
- Utility/helper functions.

Avoid placing the entire application inside one large JavaScript file.

However, do not over-engineer the project with unnecessary abstraction layers.

The implementation should remain understandable to the project owner, who must be able to explain the submitted application.

---

# 8. Authentication Requirements

SST must support:

## 8.1 Google Authentication

Provide a visible Google sign-in option.

A user should be able to authenticate using their Google account through Firebase Authentication.

## 8.2 Email and Password Authentication

Provide appropriate registration and login functionality.

Registration must allow a new user to create an account.

Existing users must be able to sign in.

## 8.3 Authentication State

The application must:

- Detect whether a user is signed in.
- Prevent unauthenticated users from accessing protected task data.
- Display the appropriate authentication screens when signed out.
- Restore the authenticated experience when the user returns, according to Firebase Authentication behaviour.
- Provide a sign-out action.

Do not store passwords manually.

All password handling must be delegated to Firebase Authentication.

---

# 9. Firestore Data Requirements

Each authenticated user must only access their own tasks.

A recommended structure is:

```text
users/
  {userId}/
    tasks/
      {taskId}
```

Each task should contain the minimum information necessary for the application, including:

```text
title
subject
status
createdAt
updatedAt
```

Status should support at least:

- `pending`
- `completed`

Use server-generated timestamps where appropriate.

The final structure may be adjusted if necessary, but user ownership and data isolation must be maintained.

---

# 10. Firestore Security Requirements

Firestore Security Rules are essential.

The implementation must ensure that:

- Unauthenticated users cannot access protected task data.
- Authenticated users can access only their own data.
- A user cannot read another user's tasks.
- A user cannot modify another user's tasks.
- A user cannot delete another user's tasks.

Do not deploy Firestore with unrestricted production access.

---

# 11. Application Flow

## 11.1 Unauthenticated User

```text
Open SST
    ↓
Authentication screen
    ↓
Login / Register / Google Sign-In
    ↓
Successful authentication
    ↓
Dashboard
```

## 11.2 Authenticated User

```text
Open SST
    ↓
Authentication state detected
    ↓
Load user's tasks
    ↓
Dashboard
```

## 11.3 Task Workflow

```text
Dashboard
    ↓
Add Task CTA
    ↓
Task Form
    ↓
Validate Input
    ↓
Save to Firestore
    ↓
Refresh Task Interface and Statistics
```

## 11.4 Task Management

Each task must support appropriate actions:

```text
View
Edit
Toggle Completion
Delete
```

Actions must update Firestore and the interface.

---

# 12. Dashboard Requirements

The dashboard must include:

## Summary Statistics

Display:

- Total Tasks
- Pending Tasks
- Completed Tasks

Statistics must accurately reflect the authenticated user's current task data.

## Primary Action

Include a prominent **Add Task** call-to-action.

## Task Management

Display a single structured task list.

The list must include tabs for:

- All
- Pending
- Completed

The active tab must clearly indicate the selected filter.

## Task Information

Each task must clearly display:

- Task title.
- Subject/course.
- Status.
- Appropriate actions.

Completed and pending tasks must be visually distinct.

---

# 13. Task Forms

## Add Task Form

The Add Task CTA should open an appropriate form or modal.

Minimum fields:

- Task title — required.
- Subject/course — required unless the final design clearly indicates otherwise.

Provide:

- Save/Add action.
- Cancel/close action.
- Clear validation feedback.

## Edit Task Form

Editing should open a form/modal containing the existing task information.

The user must be able to modify the appropriate fields and save the changes.

Changes must persist to Firestore.

---

# 14. Delete Behaviour

Deleting a task must not occur accidentally.

Follow the approved UI/UX design for confirmation behaviour.

Where a confirmation dialog is present, clearly identify the action as destructive.

After successful deletion:

- Remove the task from Firestore.
- Update the visible task list.
- Update dashboard statistics.
- Display appropriate feedback where supported by the design.

---

# 15. Light and Dark Themes

SST must provide a manual light/dark theme switch.

Requirements:

- The theme toggle must be clearly accessible.
- Both themes must maintain readability and appropriate contrast.
- Important controls and status indicators must remain clearly visible.
- The theme should be applied consistently throughout the application.
- Theme preference should persist between visits where practical.

The exported design PDFs are the primary visual reference for the approved light and dark appearances.

Do not implement a theme that contradicts the design references.

---

# 16. UI/UX Implementation Rules

The exported SST UI/UX PDFs are the visual source of truth.

Implementation must closely follow them for:

- Layout.
- Navigation.
- Component placement.
- Visual hierarchy.
- Task presentation.
- Authentication screens.
- Forms and modals.
- Empty states.
- Light mode.
- Dark mode.

Design direction:

- Minimalist.
- Professional.
- Modern.
- Production-oriented.
- Student productivity focused.

Use the approved **Coastal Blue** visual direction.

Avoid unnecessary decorative elements, excessive animations or features not supported by the project requirements.

---

# 17. Navigation

Use the approved hybrid navigation concept:

- Persistent sidebar where appropriate on larger desktop screens.
- Compact and responsive navigation on smaller screens.

The implementation must follow the visual design PDFs.

Navigation must remain usable across supported screen sizes.

---

# 18. Responsive Design

Although Figma focuses on the web interface, the implemented application must adapt gracefully to:

- Desktop computers.
- Laptops.
- Tablets.
- Mobile browsers.

The application should not simply shrink the desktop layout.

Responsive behaviour must preserve:

- Readability.
- Navigation usability.
- Form accessibility.
- Task action accessibility.
- Appropriate spacing.

---

# 19. Validation and Error Handling

The application must:

- Reject blank task titles.
- Provide understandable validation feedback.
- Handle authentication errors appropriately.
- Handle expected Firestore failures gracefully.
- Avoid exposing sensitive technical information to users.

Use clear, user-friendly messages.

---

# 20. Loading and Feedback States

Where appropriate, provide clear states for:

- Loading user authentication.
- Loading tasks.
- Saving a task.
- Updating a task.
- Deleting a task.

Avoid allowing confusing duplicate actions while an important operation is still processing.

Feedback should remain consistent with the minimalist UI.

---

# 21. Accessibility Expectations

Implement reasonable accessibility practices, including:

- Semantic HTML.
- Proper labels for form controls.
- Keyboard-accessible controls where practical.
- Sufficient colour contrast.
- Buttons with understandable purposes.
- Avoid relying solely on colour to communicate critical task status.

---

# 22. Project Structure

The implementation agent may create and refine folders and files as development requires.

Keep the project organised around clear responsibilities.

Expected categories may include:

```text
src/
  components/
  services/
  styles/
  pages/
  utils/
  assets/

design/
  Dashboard · Light.pdf
  Dashboard · Dark.pdf

docs/
  ARCHITECTURE.md
  DEVELOPMENT-LOG.md
  TESTING.md
  SUBMISSION-CHECKLIST.md
```

Root files may include:

```text
OBJECTIVES.md
README.md
package.json
firebase.json
firestore.rules
firestore.indexes.json
.gitignore
```

The exact file structure may evolve as implementation requires.

Do not create unnecessary files merely to make the repository appear complex.

---

# 23. Documentation Rules

Documentation should be useful and concise.

Do not update multiple documentation files after every minor code change.

Update documentation when a meaningful event occurs, such as:

- A significant architectural decision.
- Completion of a major feature.
- Discovery and resolution of an important issue.
- Completion of meaningful testing.
- A submission-relevant milestone.

The following documents are expected as useful development references:

## ARCHITECTURE.md

Record significant architecture and technical decisions.

## DEVELOPMENT-LOG.md

Record major development milestones and significant decisions.

## TESTING.md

Record required tests, actual results and important corrections.

## SUBMISSION-CHECKLIST.md

Track resources and evidence required for the ATU submission.

---

# 24. Required Testing

At minimum, test the governing ATU requirements:

| Test | Expected Result |
|---|---|
| Add task with valid title | Task appears correctly |
| Submit blank title | Submission is prevented or validation is shown |
| Mark task complete | Task is visibly completed |
| Change completed task back | Task returns to pending |
| Delete task | Task is removed |
| Refresh application | Saved task data remains available |

Also test SST enhancements:

- User registration.
- Email/password login.
- Google sign-in.
- Sign-out.
- User data isolation.
- Task editing.
- All/Pending/Completed filtering.
- Statistics accuracy.
- Light/dark theme switching.
- Responsive behaviour.

Record actual results for the final report.

---

# 25. ATU Submission Requirements

Prepare evidence for a final project report/document of approximately 2–4 pages containing:

- Student name.
- Project title.
- Short problem statement.
- Required features implemented.
- Simple screen sketch or application screenshot.
- Testing checklist with actual results.
- One development challenge.
- How the challenge was addressed.
- One future improvement.
- Live application URL.
- GitHub repository URL.

The final application must be deployed and accessible from its live URL.

The GitHub repository must contain the project source code.

Do not commit passwords, private keys or other secrets.

---

# 26. Academic Integrity

The project owner must understand the submitted work and be prepared to explain how it functions.

AI assistance and outside material must be appropriately identified in the final report where required by the governing ATU instructions.

Do not present generated code as understood if it has not been reviewed and explained to the project owner.

---

# 27. Implementation Priorities

Implement in meaningful stages rather than attempting everything without verification.

Recommended priority:

## Phase 1 — Foundation

- Analyse repository and design references.
- Initialise or verify Vite project configuration.
- Establish clean application structure.
- Configure Firebase project integration.
- Establish global styles and theme foundation.

## Phase 2 — Authentication

- Email/password registration.
- Email/password login.
- Google sign-in.
- Authentication state handling.
- Sign-out.

## Phase 3 — Core Task Functionality

- Create tasks.
- Read/display tasks.
- Toggle completion.
- Delete tasks.
- Edit tasks.

## Phase 4 — Dashboard Experience

- Statistics.
- Task tabs/filters.
- Empty state.
- Loading and feedback states.

## Phase 5 — Security and Quality

- Firestore Security Rules.
- Input validation.
- Error handling.
- Responsive implementation.
- Accessibility review.

## Phase 6 — Testing and Deployment

- Complete required testing.
- Correct identified problems.
- Deploy to Firebase Hosting.
- Verify live application.
- Record testing evidence.
- Prepare submission resources.

---

# 28. Acceptance Criteria

SST is ready for submission when:

- All mandatory ATU features work correctly.
- Users can authenticate successfully.
- Each authenticated user accesses only their own tasks.
- Tasks can be created, displayed, edited, completed/uncompleted and deleted.
- Dashboard statistics are accurate.
- All/Pending/Completed filtering works.
- Empty states work correctly.
- Light and dark modes work consistently.
- The application follows the approved UI/UX design closely.
- The application works appropriately across common device sizes.
- Firestore Security Rules protect user data.
- Required testing has been completed and documented.
- The application is successfully deployed.
- The GitHub repository contains the appropriate source code.
- Required report resources have been collected.

---

# 29. Instructions for the Implementation Agent

Before implementation:

1. Inspect the repository.
2. Read this `OBJECTIVES.md`.
3. Read the governing ATU project brief.
4. Review all available SST UI/UX design PDFs.
5. Identify the current project state.
6. Reuse existing correct files and structure where possible.

During implementation:

- Follow the source-of-truth priority defined in this document.
- Do not unnecessarily rewrite working code.
- Work in meaningful feature groups.
- Keep the architecture understandable.
- Test changes before considering them complete.
- Add files and folders only when they provide a clear purpose.
- Protect secrets and Firebase configuration appropriately.
- Update documentation only at meaningful milestones.

If an implementation detail is not explicitly specified, choose the simplest secure solution that supports the project goals and existing design.

The objective is not merely to generate code quickly.

The objective is to produce a **functional, secure, understandable, visually cohesive and submission-ready Student Study Tracker (SST)**.