import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Enable Edge Runtime for faster serverless performance
export const runtime = 'edge';

interface GenerateRequest {
  mode: 'from-local' | 'from-english' | 'enhance';
  query: string;
  categories?: string[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<GenerateRequest>;
    const { mode, query, categories = [] } = body;

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      console.error("CRITICAL: Gemini API Key is missing or invalid.");
      return NextResponse.json({
        error: 'AI Configuration Error',
        message: 'Server configuration error.'
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
    let prompt = "";
    let responseSchema;

    // Utilize Structured Outputs (responseSchema) to guarantee the exact JSON object payload
    if (mode === 'from-local') {
      const categoryList = categories.length > 0 ? categories.join(", ") : "General";
      prompt = `
        You are an expert in Nepali wholesale retail. A store owner typed this local/informal word: "${query}".
        Pick the most appropriate category from this list: [${categoryList}]. Provide translation and a 3-sentence description. First sentence English, second Nepali, third highlighting wholesale reliability.
      `;
      responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
          englishName: { type: SchemaType.STRING, description: "Standard professional English name" },
          nepaliName: { type: SchemaType.STRING, description: "Accurate translation in Nepali script" },
          description: { type: SchemaType.STRING, description: "3-sentence high-converting description" },
          category: { type: SchemaType.STRING, description: "Closest matching category" }
        },
        required: ["englishName", "nepaliName", "description", "category"]
      };
    } else if (mode === 'from-english') {
      prompt = `
        You are an expert copywriter for a wholesale store in Nepal.
        Product: "${query}". Write a high-converting description (one paragraph English, one paragraph Nepali) and standard translation.
      `;
      responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
          nepaliName: { type: SchemaType.STRING, description: "Professional translation in Nepali script" },
          description: { type: SchemaType.STRING, description: "High-converting description in English and Nepali" }
        },
        required: ["nepaliName", "description"]
      };
    } else {
      prompt = `Enhance this product description for a premium wholesale mart: "${query}". Include a professional Nepali translation as well.`;
      responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
          description: { type: SchemaType.STRING, description: "The enhanced description including both English and Nepali" }
        },
        required: ["description"]
      };
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any // ENFORCES the JSON shape automatically
      }
    });

    const responseText = result.response.text();
    let parsedData;

    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, "Raw:", responseText);
      return NextResponse.json({
        error: 'AI Output Error',
        message: 'The AI generated malformed data.'
      }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json({
      error: 'Failed to generate details',
      message: error?.message || 'An unknown error occurred'
    }, { status: 500 });
  }
}