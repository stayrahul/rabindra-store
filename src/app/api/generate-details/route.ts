import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { mode, query, categories } = await req.json();
    if (!query) return NextResponse.json({ error: 'Search query is required' }, { status: 400 });

   const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    let prompt = "";

    if (mode === 'from-local') {
      prompt = `
        You are an expert in Nepali grocery, agriculture, and retail. 
        A store owner typed this local/informal word: "${query}".
        Provide:
        1. "englishName": The standard, professional English name for this product.
        2. "nepaliName": The accurate translation in Nepali script (Devanagari).
        3. "description": A short, appealing 2-sentence English product description.
        4. "category": Pick the most appropriate category from this list: [${categories?.join(", ")}]. If none fit perfectly, default to "Uncategorized".
        Respond ONLY with a valid JSON object.
      `;
    } else {
      prompt = `
        You are an expert copywriter for a Nepali grocery store.
        I have a product named "${query}".
        Provide:
        1. "nepaliName": A high-quality translation of the product name in Nepali script.
        2. "description": A short, appealing 2-sentence English product description.
        Respond ONLY with a valid JSON object.
      `;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json\n?|```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonString);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}