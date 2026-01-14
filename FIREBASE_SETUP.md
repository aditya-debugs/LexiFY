# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your Streamify application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project" or "Create a project"
3. Enter your project name (e.g., "Streamify")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click on "Get started"
3. Go to the "Sign-in method" tab
4. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 3: Get Frontend Configuration

1. In Firebase Console, click on the gear icon (⚙️) next to "Project Overview"
2. Click on "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "Streamify Web")
6. Copy the `firebaseConfig` object

### Frontend Environment Variables

Create or update `frontend/.env` with:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 4: Generate Service Account for Backend

1. In Firebase Console, go to "Project settings" (gear icon)
2. Click on the "Service accounts" tab
3. Click on "Generate new private key"
4. A JSON file will be downloaded - **keep this secure!**

### Backend Environment Variables (Option 1: Using JSON file)

1. Save the downloaded JSON file in a secure location (NOT in your repository)
2. Add to `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/your/serviceAccountKey.json
```

### Backend Environment Variables (Option 2: Using environment variables)

Extract values from the downloaded JSON file and add to `backend/.env`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Note**: The private key must include the `\n` characters as shown.

## Step 5: Install Dependencies

### Frontend

```bash
cd frontend
npm install firebase
```

### Backend

```bash
cd backend
npm install firebase-admin
```

## Step 6: Update .gitignore

Make sure your `.gitignore` includes:

```
# Firebase
**/serviceAccountKey.json
**/.env
**/.env.local
```

## Step 7: Test the Setup

1. Start your backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Try signing up with a new account
4. Check the Firebase Console > Authentication > Users to see if the user was created

## Security Rules

Firebase Authentication is automatically secured. The backend will verify all tokens using Firebase Admin SDK.

## Troubleshooting

### "Firebase Admin not initialized"

- Check that your environment variables are correctly set
- Ensure the private key includes proper line breaks (`\n`)
- Verify the service account JSON path is correct

### "Invalid API key"

- Double-check your frontend `.env` file
- Ensure all VITE\_ prefixed variables are set correctly
- Restart your Vite dev server after changing .env

### "Authentication failed"

- Check Firebase Console > Authentication to see if Email/Password is enabled
- Verify users are being created in Firebase Console
- Check browser console and backend logs for specific errors

## Additional Firebase Features

You can enable additional authentication methods in Firebase Console:

- Google Sign-In
- GitHub Sign-In
- Phone Authentication
- And more...

Simply enable them in the Firebase Console > Authentication > Sign-in method tab.
