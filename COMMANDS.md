# Project Commands

Use this reference for the commands used to work on, run, and deploy the Student Study Tracker (SST). Add new commands here as the project workflow grows.

## Install and run the app

| Command | What it does in this project |
| --- | --- |
| `npm install` | Installs the project dependencies listed in `package.json`. Run this after cloning the project or when dependencies have changed. |
| `npm run dev` | Starts the Vite development server for local testing. Open the Local URL printed in the terminal, usually `http://localhost:5173`. Keep this terminal running while using the app; press `Ctrl+C` to stop the server. |
| `npm run build` | Builds the app for production and writes the output to `dist/`. |
| `npm run preview` | Serves the most recent production build locally. Run `npm run build` first; this is for previewing the built output, while `npm run dev` is the normal development workflow. |
| `npm run test:rules` | Starts the Firestore Emulator with the isolated `demo-sst` project, runs the Firestore security-rule tests with Node's built-in test runner, and shuts the emulator down. Requires Java 11+ and the Firebase CLI. It does not connect to or change live Firestore data. |

## Firebase

| Command | What it does in this project |
| --- | --- |
| `firebase deploy --only firestore:rules --project sstv1-e6dc0` | Publishes the repository's `firestore.rules` to the SST Firebase project. Use after reviewing rule changes. Requires Firebase CLI access to the project. |
| `firebase deploy --only hosting --project sstv1-e6dc0` | Publishes the latest `dist/` build to Firebase Hosting. Run `npm run build` first. Requires Firebase CLI access to the project. |

## Git review helpers

| Command | What it does in this project |
| --- | --- |
| `git status --short` | Shows changed and untracked project files before committing. |
| `git diff --check` | Checks the current changes for whitespace errors. |
| `git diff` | Shows the current uncommitted code changes for review. |

## Local setup notes

- Run commands from the repository root, where `package.json` is located.
- Local Firebase configuration belongs in `.env` (created from `.env.example`) and should not be committed.
- The local Vite app uses the configured Firebase project. Authentication and Firestore actions can affect that project's live data.
