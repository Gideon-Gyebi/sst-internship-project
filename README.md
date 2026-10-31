# Student Study Tracker (SST)

Vite, vanilla JavaScript, and Firebase foundation for the ATU Virtual Internship mini project.

## Run locally

1. Install Node.js and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the Firebase Web app configuration values.
4. Run `npm run dev`.

The required values are `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. Create a Firebase project and Web app in the Firebase Console to obtain them. Enable Email/Password and Google providers in Authentication when implementing the authentication phase.

## Current implementation

The app includes Firebase email/password registration and login, Google sign-in, restored authentication state, and sign-out. Signed-in users can create, view, edit, complete or reopen, and delete their own study tasks in Firestore. The responsive dashboard includes task counts, status filters, empty states, and Coastal Blue light and dark themes. Firestore rules validate task fields and restrict access to the signed-in user's `users/{userId}/tasks` path.

Use `npm run build` to create the Firebase Hosting files in `dist/`. In the Firebase Console, enable Email/Password and Google sign-in under Authentication. For local Google sign-in, make sure `localhost` is in Authentication's authorized domains. After reviewing `firestore.rules`, deploy it before testing live task operations: `firebase deploy --only firestore:rules --project sstv1-e6dc0`.
