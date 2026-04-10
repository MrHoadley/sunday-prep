import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface MealPlan {
  calorieTarget: number;
  meals: {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  }[];
  ingredients: {
    id: string;
    name: string;
    requiredAmount: number;
    unit: string;
    onHand: number;
    pricePerUnit: number;
  }[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { fileBase64, mimeType } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const sizeInBytes = (fileBase64.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024;
    if (sizeInBytes > maxSize) {
      return res.status(400).json({ error: 'File too large. Maximum 10MB.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a meal planning assistant. Extract meal plan information from the following document content and return ONLY valid JSON.

Document type: ${mimeType}

Return this exact structure:
{
  "calorieTarget": 2100,
  "meals": [
    { "day": "Monday", "breakfast": "Eggs", "lunch": "Salad", "dinner": "Chicken", "snacks": "Nuts" }
  ],
  "ingredients": [
    { "name": "Eggs", "requiredAmount": 12, "unit": "pcs" }
  ]
}

Extract from this content (partial): ${fileBase64.substring(0, 30000)}

Return only JSON, no markdown, no code blocks.`
        }]
      }]
    });

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No text in Gemini response');
    }

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);

    const mealPlan: MealPlan = {
      calorieTarget: parsed.calorieTarget || 2000,
      meals: parsed.meals || [],
      ingredients: (parsed.ingredients || []).map((ing: any) => ({
        name: ing.name || 'Unknown',
        requiredAmount: ing.requiredAmount || 0,
        unit: ing.unit || 'g',
        id: Math.random().toString(36).substr(2, 9),
        onHand: 0,
        pricePerUnit: 0,
      })),
    };

    return res.status(200).json(mealPlan);

  } catch (error) {
    console.error('Error parsing meal plan:', error);
    return res.status(500).json({ 
      error: 'Failed to parse meal plan. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
