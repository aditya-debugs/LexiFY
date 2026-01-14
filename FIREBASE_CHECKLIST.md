# Firebase Setup Checklist

Use this checklist to set up Firebase Authentication for your Streamify app.

## ☐ Part 1: Firebase Console Setup (5 min)

### Create Project

- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Click "Add project" or "Create a project"
- [ ] Enter project name (e.g., "Streamify")
- [ ] Disable Google Analytics (optional)
- [ ] Click "Create project"

### Enable Authentication

- [ ] Click "Authentication" in sidebar
- [ ] Click "Get started"
- [ ] Go to "Sign-in method" tab
- [ ] Click on "Email/Password"
- [ ] Toggle "Enable"
- [ ] Click "Save"

### Get Frontend Config

- [ ] Click gear icon ⚙️ next to "Project Overview"
- [ ] Click "Project settings"
- [ ] Scroll to "Your apps" section
- [ ] Click web icon `</>`
- [ ] Register app (nickname: "Streamify Web")
- [ ] Copy the firebaseConfig object

### Get Backend Config

- [ ] Still in "Project settings"
- [ ] Click "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Download JSON file
- [ ] Save it securely (DON'T commit to git!)

## ☐ Part 2: Local Setup (5 min)

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed

### Configure Frontend

- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Add `VITE_FIREBASE_API_KEY` from Firebase config
- [ ] Add `VITE_FIREBASE_AUTH_DOMAIN` from Firebase config
- [ ] Add `VITE_FIREBASE_PROJECT_ID` from Firebase config
- [ ] Add `VITE_FIREBASE_STORAGE_BUCKET` from Firebase config
- [ ] Add `VITE_FIREBASE_MESSAGING_SENDER_ID` from Firebase config
- [ ] Add `VITE_FIREBASE_APP_ID` from Firebase config

### Configure Backend

- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Add `FIREBASE_PROJECT_ID` from downloaded JSON
- [ ] Add `FIREBASE_CLIENT_EMAIL` from downloaded JSON
- [ ] Add `FIREBASE_PRIVATE_KEY` from downloaded JSON (with \n)
- [ ] Verify `MONGODB_URI` is set
- [ ] Verify other existing env vars are set

### Security Check

- [ ] Verify `.gitignore` includes `.env`
- [ ] Verify `.gitignore` includes `serviceAccountKey.json`
- [ ] Verify `.env` files are NOT tracked by git
- [ ] Verify downloaded JSON is NOT in project folder

## ☐ Part 3: Testing (5 min)

### Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- [ ] Backend server started successfully
- [ ] Frontend dev server started successfully
- [ ] No errors in backend console
- [ ] No errors in frontend console

### Test Authentication

- [ ] Open http://localhost:5173
- [ ] Click "Create account"
- [ ] Fill in: Full Name, Username, Email, Password
- [ ] Click "Create Account"
- [ ] Account created successfully
- [ ] Redirected to onboarding or home page

### Verify in Firebase

- [ ] Open Firebase Console
- [ ] Go to Authentication > Users
- [ ] New user appears in list
- [ ] User's email matches what you entered

### Test Login

- [ ] Logout from the app
- [ ] Click "Sign in"
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] Successfully logged in
- [ ] Redirected to home page

### Test Protected Routes

- [ ] Try accessing chat page (should work)
- [ ] Try accessing profile page (should work)
- [ ] Try accessing friends page (should work)
- [ ] Try accessing daily word page (should work)

### Test Logout

- [ ] Click logout button
- [ ] Successfully logged out
- [ ] Redirected to login page
- [ ] Can't access protected routes without login

## ☐ Part 4: Optional - Migrate Existing Users

**Only if you have existing users in MongoDB:**

```bash
cd backend
node migrate-to-firebase.js
```

- [ ] Migration script ran successfully
- [ ] All users migrated
- [ ] Password reset links generated
- [ ] Send reset links to users

## ☐ Part 5: Production Checklist

### Before Deploying

- [ ] Environment variables set on hosting platform
- [ ] Firebase project is in production mode
- [ ] CORS configured for production domain
- [ ] Firebase security rules reviewed
- [ ] Rate limiting configured
- [ ] Error logging set up
- [ ] Monitoring configured

### Security

- [ ] `.env` files not committed
- [ ] Service account JSON not committed
- [ ] Firebase API keys restricted to domains
- [ ] HTTPS enabled on production
- [ ] Security headers configured

### Testing in Production

- [ ] Test signup in production
- [ ] Test login in production
- [ ] Test logout in production
- [ ] Test all features work
- [ ] Test on mobile devices
- [ ] Test with different browsers

## 📚 Need Help?

If something doesn't work:

1. Check `FIREBASE_QUICKSTART.md` for quick solutions
2. Check `FIREBASE_SETUP.md` for detailed steps
3. Check `FIREBASE_MIGRATION_GUIDE.md` for troubleshooting
4. Ask for help!

## ✅ All Done!

When all items are checked, your Firebase Authentication is fully set up and ready for production!

---

**Quick Reference:**

- Frontend: Email + Password login only
- Backend: Verifies Firebase tokens
- MongoDB: Still stores user data + firebaseUid
- All features: Still work the same!

🎉 Ready for your hackathon!
