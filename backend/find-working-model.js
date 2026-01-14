import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("Testing different Gemini models...\n");

const models = [
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.0-pro",
  "gemini-pro",
];

for (const modelName of models) {
  try {
    console.log(`🔄 Testing: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello in Spanish");
    const text = await result.response.text();
    console.log(`✅ ${modelName} WORKS!`);
    console.log(`   Response: ${text.substring(0, 80)}...\n`);
    
    console.log(`\n🎉 Use this model name: "${modelName}"\n`);
    break;
  } catch (e) {
    console.log(`❌ ${modelName} failed`);
    console.log(`   Error: ${e.message.substring(0, 120)}...\n`);
  }
}
