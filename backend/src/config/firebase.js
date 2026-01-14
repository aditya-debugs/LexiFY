import admin from "firebase-admin";

let firebaseAdmin;

export const initializeFirebase = () => {
  if (!firebaseAdmin) {
    try {
      // For production: use service account JSON file
      if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = require(process.env
          .FIREBASE_SERVICE_ACCOUNT_PATH);
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      // For development: use environment variables
      else if (process.env.FIREBASE_PROJECT_ID) {
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
      } else {
        console.warn("Firebase Admin not initialized - missing credentials");
      }
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
    }
  }
  return firebaseAdmin;
};

export const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    return initializeFirebase();
  }
  return firebaseAdmin;
};
