import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

if (!admin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), '../../firebase-admin.json/talora-2bd7b-firebase-adminsdk-fbsvc-d86305ec7c.json');
  let credential;
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    credential = admin.credential.cert(serviceAccount);
  } catch (err) {
    console.error("Firebase admin service account not found at", serviceAccountPath);
  }

  if (credential) {
    admin.initializeApp({ credential });
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
