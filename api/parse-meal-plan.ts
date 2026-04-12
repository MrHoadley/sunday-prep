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

    // Try the newest API first
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBase64
              }
            },
            {
              text: `Extract the meal plan, calorie targets, and ingredients from this document. 

Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "calorieTarget": 2100,
  "meals": [
    { "day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "...", "snacks": "..." }
  ],
  "ingredients": [
    { "name": "Chicken breast", "requiredAmount": 1000, "unit": "g" }
  ]
}

Rules:
- calorieTarget: number (use 2000 if not found)
- meals: array with day, breakfast, lunch, dinner, snacks
- ingredients: name, requiredAmount (number), unit (g/kg/ml/l/pcs/cups/tbsp/tsp)
- Return ONLY JSON, no other text`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      // Log the error but return a fallback
      return res.status(500).json({ 
        error: 'API unavailable',
        details: `Status: ${response.status}, ${errorText.substring(0, 200)}`
      });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from API');
    }

    const text = data.candidates[0]?.content?.parts[0]?.text;
    if (!text) {
      throw new Error('No text in response');
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
      error: 'Failed to parse meal plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
