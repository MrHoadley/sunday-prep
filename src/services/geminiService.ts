import { MealPlan } from "../types";

export async function parseMealPlanFile(fileBase64: string, mimeType: string): Promise<MealPlan> {
  const response = await fetch('/api/parse-meal-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileBase64,
      mimeType,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse meal plan');
  }

  return await response.json();
}
