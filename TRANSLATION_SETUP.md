# 🚀 Quick Setup Guide - Message Translation Feature

## ⚡ 5-Minute Setup

### Step 1: Get Gemini API Key (2 minutes)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the API key

### Step 2: Configure Backend (1 minute)
```bash
cd backend
```

Open `.env` file and add:
```env
GEMINI_API_KEY=paste_your_api_key_here
```

### Step 3: Install Dependencies (1 minute)
```bash
# Already done if you followed the main setup!
npm install
```

### Step 4: Start Servers (1 minute)
```bash
# From project root
npm run dev
```

This starts both frontend and backend servers.

## ✅ Verify Installation

1. Open http://localhost:5173
2. Login to your account
3. Navigate to a chat
4. Hover over any message
5. You should see a small translate button appear!

## 🎯 How to Use

### Desktop:
1. Hover over any message
2. Click the translate button (Languages icon)
3. Modal opens with translation

### Mobile:
1. Long-press on a message (500ms)
2. Translate button appears
3. Tap to translate

## 🔧 Configuration

### Change Your Native Language
1. Click your profile avatar (top-right)
2. Click "Edit Profile"
3. Update "Native Language" field
4. Save

All translations will now target your native language!

## 🐛 Troubleshooting

### Button Not Appearing?
- Refresh the page (Ctrl+R)
- Check console for errors (F12)
- Verify you're on ChatPage (`/chat/:id`)

### "Translation service not configured"?
- Check `GEMINI_API_KEY` is set in `backend/.env`
- Restart backend: `npm run dev`

### Slow Translations?
- First translation takes 2-3 seconds (API call)
- Subsequent translations are instant (cached!)

## 📊 What You Get

- ✨ Smart caching (instant repeat translations)
- 🌍 100+ languages supported
- 🎨 Beautiful DaisyUI modal
- 📱 Mobile-optimized
- ⚡ Loading states & error handling
- 🔐 Secure JWT authentication

## 💡 Pro Tips

1. **Hover, don't click** - Button appears on hover for clean UI
2. **Cache is magic** - Translate same message multiple times, it's instant!
3. **Mobile gestures** - Long-press messages for translate button
4. **Update language** - Change native language in profile anytime

## 📝 Example Usage

**Scenario**: Your friend sends "Bonjour, comment ça va?" (French)

1. You hover over the message
2. Click translate button
3. See: "Hello, how are you?" (English)

That's it! 🎉

---

**Need more help?** Check `TRANSLATION_FEATURE_README.md` for detailed docs.
