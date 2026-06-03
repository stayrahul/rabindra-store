import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function generateProductDescription(productName: string, category: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
    const prompt = `Write a professional, high-converting product description for a wholesale mart in Simraungadh, Nepal. 
    Product: ${productName}
    Category: ${category}
    
    Requirements:
    1. One paragraph in professional English.
    2. One paragraph in professional Nepali (using Devanagari script).
    3. Focus on quality, wholesale reliability, and bulk value.
    Keep it concise but premium.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}
