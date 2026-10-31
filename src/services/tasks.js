import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDb } from '../firebase.js';

async function userTasks(userId) {
  const db = await getDb();
  if (!db) throw new Error('Firebase is not configured.');
  if (!userId) throw new Error('Sign in before opening study tasks.');
  return collection(db, 'users', userId, 'tasks');
}

async function userTask(userId, taskId) {
  return doc(await userTasks(userId), taskId);
}

export async function subscribeToTasks(userId, onTasks, onError) {
  return onSnapshot(await userTasks(userId), (snapshot) => {
    const tasks = snapshot.docs.map((taskDocument) => ({
      id: taskDocument.id,
      ...taskDocument.data(),
    }));

    tasks.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    onTasks(tasks);
  }, onError);
}

export async function createTask(userId, { title, subject }) {
  return addDoc(await userTasks(userId), {
    title: title.trim(),
    subject: subject.trim(),
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTask(userId, taskId, { title, subject }) {
  return updateDoc(await userTask(userId, taskId), {
    title: title.trim(),
    subject: subject.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function setTaskStatus(userId, taskId, status) {
  return updateDoc(await userTask(userId, taskId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function removeTask(userId, taskId) {
  return deleteDoc(await userTask(userId, taskId));
}
