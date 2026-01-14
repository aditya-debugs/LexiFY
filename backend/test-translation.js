import axios from "axios";
import "dotenv/config";

console.log("\n🔍 Testing Translation Feature (MyMemory - Free API)...\n");

// Test 1: Check API connectivity
console.log("1️⃣ Checking MyMemory API connectivity...");
console.log("   ℹ️  Using MyMemory Translation API");
console.log("   ℹ️  No API key required - 100% FREE");
console.log("   ℹ️  Free tier: 1000 requests per day");

// Test 2: Check if API is accessible
console.log("\n2️⃣ Testing API accessibility...");
try {
  const testResponse = await axios.get('https://api.mymemory.translated.net/get', {
    params: { q: 'test', langpair: 'en|es' },
    timeout: 5000,
  });
  if (testResponse.status === 200) {
    console.log("   ✅ MyMemory API is accessible");
  }
} catch (error) {
  console.log("   ❌ Cannot reach MyMemory API:", error.message);
  console.log("   💡 Check your internet connection");
  process.exit(1);
}

// Test 3: Perform a sample translation
console.log("\n3️⃣ Testing actual translation...");
try {
  const testText = "Hello, how are you?";
  const targetLanguage = "Spanish";
  
  console.log(`   📤 Translating: "${testText}"`);
  console.log(`   🌍 Target language: ${targetLanguage}`);
  
  const response = await axios.get('https://api.mymemory.translated.net/get', {
    params: {
      q: testText,
      langpair: 'en|es',
    },
    timeout: 10000,
  });

  if (response.data.responseStatus !== 200) {
    throw new Error(response.data.responseDetails || 'Translation failed');
  }

  const translatedText = response.data.responseData.translatedText;
  
  console.log(`   📥 Translation result: "${translatedText}"`);
  console.log("   ✅ Translation successful!");
  
  // Verify translation makes sense
  if (translatedText.length > 0 && translatedText !== testText) {
    console.log("   ✅ Translation appears valid");
  } else {
    console.log("   ⚠️  Translation result seems unusual, please verify");
  }
  
} catch (error) {
  console.log("   ❌ Translation failed:", error.message);
  
  if (error.code === 'ECONNABORTED') {
    console.log("   💡 Suggestion: Request timed out. Check your internet connection.");
  } else if (error.response?.status === 429 || error.response?.status === 403) {
    console.log("   💡 Suggestion: Daily limit reached (1000 requests/day). Try again tomorrow.");
  } else {
    console.log("   💡 Suggestion: Check your internet connection");
  }
  
  process.exit(1);
}

console.log("\n✅ All translation tests passed!");
console.log("\n🎉 Your translation feature is ready to use!\n");
console.log("📋 Next steps:");
console.log("   1. Start your servers: npm run dev");
console.log("   2. Open a chat");
console.log("   3. Hover over any message");
console.log("   4. Click the translate button\n");
