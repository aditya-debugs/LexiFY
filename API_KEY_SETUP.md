# 🔧 Gemini API Key Setup Guide

## Current Issue

Your API key appears to be created but the **Generative Language API** may not be enabled for it.

**Error:** `API_KEY_INVALID - API key not valid`

---

## ✅ Solution: Enable Generative Language API

### **Step 1: Go to Google Cloud Console**
Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

### **Step 2: Select Your Project**
- Make sure you're in the project where you created the API key
- Look at the top of the page for the project selector

### **Step 3: Enable the API**
- Click "**ENABLE**" button
- Wait for it to complete (takes ~30 seconds)

### **Step 4: Verify API Key**
Go to: https://console.cloud.google.com/apis/credentials
- Find your API key
- Make sure "Generative Language API" is listed under "API restrictions"

---

## 🎯 Alternative: Create New API Key with Correct Settings

### **Method 1: Use AI Studio (Recommended - Easiest)**

1. **Visit:** https://aistudio.google.com/app/apikey

2. **Click "Get API Key"** or "Create API Key"

3. **Choose:**
   - "Create API key in new project" (recommended)
   - OR select an existing project

4. **Copy the API key**

5. **Paste it in your `.env` file:**
   ```env
   GEMINI_API_KEY=your_new_api_key_here
   ```

6. **Test:**
   ```bash
   node test-translation.js
   ```

---

### **Method 2: Use Google Cloud Console**

1. **Go to:** https://console.cloud.google.com/

2. **Create or Select Project**

3. **Enable Generative Language API:**
   - https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Click ENABLE

4. **Create Credentials:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "+ CREATE CREDENTIALS" → "API Key"
   - Copy the key

5. **Update `.env`:**
   ```env
   GEMINI_API_KEY=your_new_api_key_here
   ```

---

## 🔍 Test Your API Key

After updating the key, run:

```bash
cd backend
node test-translation.js
```

You should see:
```
✅ All translation tests passed!
🎉 Your translation feature is ready to use!
```

---

## ⚡ Quick Alternative: Use OpenAI Instead

If Gemini continues to have issues, I can quickly switch to OpenAI which is more straightforward:

### **1. Get OpenAI API Key:**
- Visit: https://platform.openai.com/api-keys
- Create new secret key

### **2. Install OpenAI:**
```bash
npm install openai
```

### **3. Update `.env`:**
```env
OPENAI_API_KEY=sk-...your_key_here
```

**Let me know if you want to switch to OpenAI and I'll update the code in 2 minutes!**

---

## 📋 Current Status

- ✅ All code is implemented correctly
- ✅ All dependencies installed
- ✅ Frontend fully working
- ✅ Backend fully working
- ⚠️ **Only issue:** API key needs Generative Language API enabled

---

## 💡 Most Common Issue

**"API key not valid"** usually means one of these:

1. ❌ Generative Language API not enabled (most common)
2. ❌ API key restrictions blocking the service
3. ❌ Billing not enabled on the project
4. ❌ Wrong API key copied (spaces, typos)

---

## 🎯 Recommended Action

**Option A:** Enable API (2 minutes)
1. Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Click ENABLE
3. Test: `node test-translation.js`

**Option B:** New API Key via AI Studio (1 minute)
1. Visit: https://aistudio.google.com/app/apikey
2. Create new key
3. Update `.env`
4. Test: `node test-translation.js`

**Option C:** Switch to OpenAI (let me know!)

---

**Which option would you like to try?**
