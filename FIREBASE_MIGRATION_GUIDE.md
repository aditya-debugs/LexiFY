# Firebase Authentication Migration Summary

## ✅ What Was Changed

Your authentication system has been successfully migrated from JWT + MongoDB to Firebase Authentication. Here's what changed:

### Backend Changes

1. **User Model** ([backend/src/models/User.js](backend/src/models/User.js))

   - Added `firebaseUid` field (required, unique, indexed)
   - Made `password` field optional (Firebase handles authentication)
   - Kept bcrypt methods for backward compatibility

2. **Auth Controller** ([backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js))

   - **Signup**: Now accepts `firebaseUid` instead of password, creates user in MongoDB after Firebase signup
   - **Login**: Simplified to lookup user by `firebaseUid` (Firebase handles credential verification)
   - **Logout**: Simplified (Firebase handles session on client)
   - Removed JWT token generation

3. **Auth Middleware** ([backend/src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js))

   - Now verifies Firebase ID tokens instead of JWT
   - Expects `Authorization: Bearer <token>` header
   - Uses Firebase Admin SDK for token verification
   - Provides better error messages for expired/invalid tokens

4. **Firebase Configuration** ([backend/src/config/firebase.js](backend/src/config/firebase.js))

   - NEW: Firebase Admin SDK initialization
   - Supports both service account JSON file and environment variables

5. **Server** ([backend/src/server.js](backend/src/server.js))
   - Initializes Firebase Admin SDK on startup

### Frontend Changes

1. **Firebase Setup** ([frontend/src/lib/firebase.js](frontend/src/lib/firebase.js))

   - NEW: Firebase client SDK configuration
   - Initializes Firebase Auth

2. **Auth Context** ([frontend/src/contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx))

   - NEW: Provides Firebase user state globally
   - Manages Firebase ID token
   - Auto-refreshes token every 55 minutes
   - Provides signOut function

3. **Axios Interceptor** ([frontend/src/lib/axios.js](frontend/src/lib/axios.js))

   - Automatically adds Firebase ID token to all API requests
   - Token is sent in `Authorization: Bearer <token>` header

4. **Auth Hooks**

   - **useLogin.js**: Uses Firebase `signInWithEmailAndPassword`, then syncs with backend
   - **useSignUp.js**: Uses Firebase `createUserWithEmailAndPassword`, then creates user in backend
   - **useLogout.js**: Signs out from Firebase and calls backend logout

5. **Login Page** ([frontend/src/pages/LoginPage.jsx](frontend/src/pages/LoginPage.jsx))

   - Changed from "Email or Username" to just "Email" (Firebase requirement)

6. **Main App** ([frontend/src/main.jsx](frontend/src/main.jsx))
   - Wrapped with `AuthProvider` to provide Firebase context

### Package Updates

- **Backend**: Added `firebase-admin@^13.0.2`
- **Frontend**: Added `firebase@^11.2.0`

## 🔧 Setup Required

### 1. Create Firebase Project

Follow the instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to:

- Create a Firebase project
- Enable Email/Password authentication
- Get your configuration keys
- Generate service account credentials

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Configure Environment Variables

**Frontend** (`frontend/.env`):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend** (`backend/.env`):

Option 1 - Service Account File (Recommended):

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
```

Option 2 - Environment Variables:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Database Migration (Optional)

If you have existing users, you'll need to migrate them. Here's a migration script:

```javascript
// backend/migrate-users.js
import User from "./src/models/User.js";
import { getFirebaseAdmin } from "./src/config/firebase.js";
import { connectDB } from "./src/lib/db.js";

async function migrateUsers() {
  await connectDB();
  const admin = getFirebaseAdmin();

  const users = await User.find({ firebaseUid: { $exists: false } });

  for (const user of users) {
    try {
      // Create Firebase user
      const firebaseUser = await admin.auth().createUser({
        email: user.email,
        password: Math.random().toString(36), // Random temp password
        displayName: user.fullName,
      });

      // Update MongoDB user with Firebase UID
      user.firebaseUid = firebaseUser.uid;
      await user.save();

      console.log(`Migrated user: ${user.email}`);

      // Send password reset email
      const link = await admin.auth().generatePasswordResetLink(user.email);
      console.log(`Password reset link for ${user.email}: ${link}`);
    } catch (error) {
      console.error(`Failed to migrate ${user.email}:`, error);
    }
  }
}

migrateUsers();
```

## 🎯 What Stays the Same

- All user data in MongoDB (friends, streaks, onboarding status, etc.)
- All other API endpoints and functionality
- Stream Chat integration
- Translation features
- Daily Word features
- UI/UX (except login now requires email instead of email/username)

## ✨ Benefits of Firebase Auth

1. **Google Service Integration**: Required for your hackathon
2. **Better Security**: Firebase handles secure password storage and token management
3. **Built-in Features**:
   - Email verification
   - Password reset
   - Account linking
   - Multi-factor authentication (can be enabled later)
4. **Easy Social Login**: Can add Google, GitHub, etc. with a few clicks
5. **Token Auto-Refresh**: Handles token expiration automatically
6. **Industry Standard**: Used by millions of apps

## 🚀 Next Steps

1. Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to create your Firebase project
2. Add environment variables
3. Run `npm install` in both frontend and backend
4. Test signup with a new user
5. Test login with that user
6. (Optional) Migrate existing users if needed

## 🔍 Testing Checklist

- [ ] New user signup
- [ ] User login
- [ ] User logout
- [ ] Protected routes (chat, profile, etc.)
- [ ] Stream Chat still works
- [ ] Translation feature still works
- [ ] Daily Word feature still works
- [ ] Friend requests still work

## 🆘 Troubleshooting

### "Firebase Admin not initialized"

- Check your backend `.env` file has correct Firebase credentials
- Ensure private key includes proper line breaks (`\n`)

### "Invalid token format"

- Make sure frontend is sending token in `Authorization: Bearer <token>` format
- Check that axios interceptor is working

### "User not found"

- Make sure you created the user in backend after Firebase signup
- Check MongoDB for user with matching `firebaseUid`

### Frontend can't connect

- Verify all `VITE_` prefixed variables are set in frontend `.env`
- Restart Vite dev server after changing `.env`
- Check Firebase Console that Email/Password auth is enabled

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Detailed setup guide

## ⚠️ Important Notes

- **Never commit** `.env` files or `serviceAccountKey.json`
- Firebase tokens expire after 1 hour (auto-refreshed by our code)
- Old JWT_SECRET_KEY is no longer needed (but keep it if you want backward compatibility)
- Users now MUST use email (not username) to login - this is a Firebase requirement
