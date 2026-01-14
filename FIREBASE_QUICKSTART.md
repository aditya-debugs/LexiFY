# Quick Start: Firebase Authentication

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "Streamify")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Email/Password Auth

1. In Firebase Console, click "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click "Email/Password"
5. Toggle "Enable"
6. Click "Save"

### Step 3: Get Frontend Config

1. Click gear icon ⚙️ > "Project settings"
2. Scroll to "Your apps"
3. Click web icon `</>`
4. Register app (nickname: "Streamify Web")
5. Copy the config values

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### Step 4: Get Backend Config

1. In "Project settings", go to "Service accounts" tab
2. Click "Generate new private key"
3. Save the JSON file securely (DON'T commit it!)

**Option A** - Use JSON file:
Create `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
MONGODB_URI=your_mongodb_uri
```

**Option B** - Use env vars (for deployment):
Extract from JSON and add to `backend/.env`:

```env
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"
MONGODB_URI=your_mongodb_uri
```

### Step 5: Install & Run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Step 6: Test

1. Go to `http://localhost:5173`
2. Click "Create account"
3. Fill in details and signup
4. Check Firebase Console > Authentication > Users to see your new user!

## ✅ That's it! You're using Firebase!

## 📝 Key Changes to Remember

### For Login:

- **Before**: Email OR Username + Password
- **Now**: Email + Password (Firebase requirement)

### For API Calls:

- **Before**: JWT token in cookie
- **Now**: Firebase token in `Authorization` header (automatic)

### For New Users:

- **Before**: Just signup and go
- **Now**: Created in Firebase first, then synced to your MongoDB

## 🔒 Security Best Practices

1. **Never commit**:

   - `frontend/.env`
   - `backend/.env`
   - `serviceAccountKey.json`

2. **Add to `.gitignore`**:

   ```
   .env
   .env.local
   **/serviceAccountKey.json
   ```

3. **For production**: Use environment variables, not JSON files

## 🎯 What Works Right Away

✅ User signup/login  
✅ Protected routes  
✅ All existing features (chat, friends, daily word, etc.)  
✅ Token auto-refresh  
✅ Better security

## 🚨 Common Issues

### "Firebase Admin not initialized"

→ Check backend `.env` has correct Firebase credentials

### "Invalid token"

→ Restart frontend dev server after changing `.env`

### "User not found"

→ Make sure you signed up (not logged in with old user)

## 📚 Full Documentation

- [FIREBASE_MIGRATION_GUIDE.md](FIREBASE_MIGRATION_GUIDE.md) - Complete details
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Step-by-step Firebase setup

## 🎉 Bonus: Easy Social Login

Want to add Google Sign-In? Just:

1. Enable it in Firebase Console
2. Add 2 lines of code to frontend
3. Done! (I can help with this)
