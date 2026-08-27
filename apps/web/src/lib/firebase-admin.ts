import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

if (!getApps().length) {
  const serviceAccountPath = path.join(process.cwd(), '../../firebase-admin.json/talora-2bd7b-firebase-adminsdk-fbsvc-d86305ec7c.json');
  let credential;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } catch (err) {
      console.error("Invalid FIREBASE_SERVICE_ACCOUNT env variable");
    }
  } else {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      credential = cert(serviceAccount);
    } catch (err) {
      console.warn("Firebase admin service account not found at", serviceAccountPath);
    }
  }

  if (credential) {
    initializeApp({ credential });
  }
}

export const adminAuth = getApps().length ? getAuth() : null;
