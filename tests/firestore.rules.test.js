import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

const projectId = 'demo-sst';
let testEnvironment;

function taskData(overrides = {}) {
  return {
    title: 'Review lecture notes',
    subject: 'MATH 201',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function taskReference(userId, taskId = 'task-1', context = testEnvironment.authenticatedContext(userId)) {
  return doc(context.firestore(), 'users', userId, 'tasks', taskId);
}

describe('Firestore task security rules', function () {
  before(async function () {
    testEnvironment = await initializeTestEnvironment({
      projectId,
      firestore: {
        rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
      },
    });
  });

  beforeEach(async function () {
    await testEnvironment.clearFirestore();
  });

  after(async function () {
    await testEnvironment.cleanup();
  });

  it('denies unauthenticated reads and writes', async function () {
    const db = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(db, 'users', 'alice', 'tasks')));
    await assertFails(setDoc(doc(db, 'users', 'alice', 'tasks', 'task-1'), taskData()));
  });

  it('allows a user to create, read, update, and delete a valid task', async function () {
    const reference = taskReference('alice');
    await assertSucceeds(setDoc(reference, taskData()));
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(updateDoc(reference, {
      status: 'completed',
      updatedAt: serverTimestamp(),
    }));
    await assertSucceeds(deleteDoc(reference));
  });

  it('prevents a user from reading, updating, or deleting another user’s task', async function () {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', 'alice', 'tasks', 'task-1'), taskData());
    });

    const bobReference = taskReference('alice', 'task-1', testEnvironment.authenticatedContext('bob'));
    await assertFails(getDoc(bobReference));
    await assertFails(updateDoc(bobReference, { title: 'Changed by Bob', updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(bobReference));
  });

  it('denies whitespace-only titles and course names', async function () {
    await assertFails(setDoc(taskReference('alice'), taskData({ title: '   ' })));
    await assertFails(setDoc(taskReference('alice', 'task-2'), taskData({ subject: '\t  ' })));
  });

  it('denies task fields that exceed the supported limits', async function () {
    await assertFails(setDoc(taskReference('alice'), taskData({ title: 'x'.repeat(161) })));
    await assertFails(setDoc(taskReference('alice', 'task-2'), taskData({ subject: 'x'.repeat(121) })));
  });

  it('denies invalid statuses, missing required data, and extra fields', async function () {
    const { subject, ...missingSubject } = taskData();
    assert.equal(subject, 'MATH 201');
    await assertFails(setDoc(taskReference('alice'), taskData({ status: 'archived' })));
    await assertFails(setDoc(taskReference('alice', 'task-2'), missingSubject));
    await assertFails(setDoc(taskReference('alice', 'task-3'), taskData({ unexpected: true })));
  });

  it('does not allow a user to change a task creation timestamp', async function () {
    const reference = taskReference('alice');
    await assertSucceeds(setDoc(reference, taskData()));
    await assertFails(updateDoc(reference, {
      createdAt: Timestamp.fromMillis(0),
      updatedAt: serverTimestamp(),
    }));
  });
});
