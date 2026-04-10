import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: fileBase64,
                }
              },
              {
                text: `Extract the meal plan, calorie targets, and ingredients from this document. 
                Return the data in a structured JSON format matching this schema:
                {
                  "calorieTarget": number,
                  "meals": [
                    { "day": string, "breakfast": string, "lunch": string, "dinner": string, "snacks": string }
                  ],
                  "ingredients": [
                    { "name": string, "requiredAmount": number, "unit": "g" | "kg" | "ml" | "l" | "pcs" | "cups" | "tbsp" | "tsp" }
                  ]
                }
                If a field is missing, provide a reasonable default or leave it empty. 
                Ensure all ingredients have a name, amount, and unit.`
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    const parsed = JSON.parse(text);

    const result: MealPlan = {
      ...parsed,
      ingredients: parsed.ingredients.map((ing: any) => ({
        ...ing,
        id: Math.random().toString(36).substr(2, 9),
        onHand: 0,
        pricePerUnit: 0,
      })),
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error parsing meal plan:', error);
    return res.status(500).json({ 
      error: 'Failed to parse meal plan. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
