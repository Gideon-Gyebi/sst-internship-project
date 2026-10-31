# Student Study Tracker (SST)

Vite, vanilla JavaScript, and Firebase foundation for the ATU Virtual Internship mini project.

## Run locally

1. Install Node.js and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the Firebase Web app configuration values.
4. Run `npm run dev`.

The required values are `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. Create a Firebase project and Web app in the Firebase Console to obtain them. Enable Email/Password and Google providers in Authentication when implementing the authentication phase.

## Current foundation

The responsive dashboard shell includes Coastal Blue light and dark themes, a persistent theme choice, sample dashboard content, and mobile navigation. Task and account controls are visual placeholders until their implementation phases. Firestore rules scope task access to the signed-in user's `users/{userId}/tasks` path.

Use `npm run build` to create the Firebase Hosting files in `dist/`. Deploy Firestore rules only after creating the Firebase project and reviewing the target project in the Firebase CLI.
