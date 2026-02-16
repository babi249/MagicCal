import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserProfile, FoodItem, MealSuggestion, DailyReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to calculate BMR and TDEE
export const calculatePlan = async (profile: Omit<UserProfile, 'id' | 'name'>, lang: 'en' | 'ar'): Promise<string> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Calculate daily calorie needs for a user with these stats:
    Weight: ${profile.weight}kg, Height: ${profile.height}cm, Age: ${profile.age}, Gender: ${profile.gender}, Activity: ${profile.activityLevel}, Goal: ${profile.goal}.
    
    Return a short, encouraging summary in ${lang === 'en' ? 'English' : 'Arabic'}. 
    Include the calculated BMR and TDEE (Total Daily Energy Expenditure) and the recommended daily calorie intake.
    Keep it under 50 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Plan calc error", error);
    return lang === 'en' ? "Could not calculate plan." : "تعذر حساب الخطة.";
  }
};

export const suggestMeal = async (remainingCalories: number, currentLogs: FoodItem[], country: string, lang: 'en' | 'ar'): Promise<MealSuggestion | null> => {
  const modelId = "gemini-3-flash-preview";

  const consumedText = currentLogs.map(l => l.name).join(", ");
  
  const prompt = `
    The user is in ${country} and has ${remainingCalories} calories remaining for the day.
    They have already eaten: ${consumedText || "Nothing yet"}.
    
    Suggest ONE healthy, **PROTEIN-RICH** meal (like eggs, chicken, legumes) that fits within the remaining calories.
    IT MUST BE LOCALLY AVAILABLE AND POPULAR IN ${country}.
    
    Provide a FULL RECIPE so the user can cook it.
    
    Return JSON format:
    {
      "name": "Meal Name",
      "description": "Short description",
      "calories": 450,
      "protein": 30,
      "carbs": 50,
      "fat": 15,
      "fiber": 8,
      "ingredients": ["2 Eggs", "1 tbsp Olive Oil", "Salt"],
      "instructions": ["Step 1: Heat pan", "Step 2: Crack eggs"],
      "prepTime": "15 mins",
      "estimatedCost": 25,
      "currency": "SAR"
    }
    Language: ${lang === 'en' ? 'English' : 'Arabic'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            prepTime: { type: Type.STRING },
            estimatedCost: { type: Type.NUMBER },
            currency: { type: Type.STRING }
          }
        }
      }
    });
    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as MealSuggestion;
  } catch (error) {
    console.error("Suggestion error", error);
    return null;
  }
};

export const generateDailyReport = async (logs: FoodItem[], lang: 'en' | 'ar'): Promise<DailyReport | null> => {
  const modelId = "gemini-3-flash-preview";
  
  const itemsList = logs.map(l => `${l.name} (${l.calories}kcal)`).join(", ");

  const prompt = `
    Analyze this list of foods eaten today: ${itemsList || "No food logged yet"}.
    Language: ${lang === 'en' ? 'English' : 'Arabic'}.
    
    Provide a structured daily report.
    - Give a health score from 0 to 100 based on balance and quality.
    - Provide 2-3 specific "Good Choices" (benefits).
    - Provide 2-3 "Improvements" (substitutions or warnings).
    - Use expressive Emojis for each item.
    - Be brief and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                score: { type: Type.NUMBER },
                goodChoices: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            emoji: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    }
                },
                improvements: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            emoji: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });
    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as DailyReport;
  } catch (error) {
    console.error("Report gen error", error);
    return null;
  }
};

export const analyzeFoodImage = async (base64Image: string, country: string, lang: 'en' | 'ar'): Promise<AnalysisResult[]> => {
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    Analyze this image of food. Identify the items separately (e.g. separate milk, sugar, biscuits).
    Estimate the portion size and weight (in grams) for each item realistically.
    Search your internal knowledge base for nutritional info and CURRENT MARKET PRICES in ${country}.
    
    Assess the healthiness of each item:
    - GREEN: Healthy, protein-rich, balanced (e.g., eggs, chicken, veggies).
    - YELLOW: Moderate choice.
    - RED: Unhealthy, high fat, high sugar (e.g., sweets, fried food, soda).
    
    Return a JSON array of items.
    For each item provide:
    - name (English)
    - nameAr (Arabic translation of name)
    - calories (number, estimated total for the portion)
    - protein (grams)
    - carbs (grams)
    - fat (grams)
    - fiber (grams)
    - estimatedWeight (string, e.g. "150g")
    - confidence (0-1)
    - visualEmoji (a single emoji representing the food)
    - estimatedCost (number, approximate price in local currency of ${country})
    - currency (string, ISO code for ${country})
    - healthRating (string: 'green', 'yellow', or 'red')
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              foodName: { type: Type.STRING },
              foodNameAr: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              estimatedWeight: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              visualEmoji: { type: Type.STRING },
              estimatedCost: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              healthRating: { type: Type.STRING, enum: ["green", "yellow", "red"] }
            }
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as AnalysisResult[];
  } catch (error: any) {
    console.error("Image analysis error", error);
    throw new Error(error.message || "Failed to analyze image");
  }
};

export const analyzeFoodAudio = async (base64Audio: string, mimeType: string, country: string, lang: 'en' | 'ar'): Promise<AnalysisResult[]> => {
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    Listen to this audio description of food intake.
    Identify the items mentioned separately. If sizes aren't mentioned, estimate standard serving sizes.
    Location for price context: ${country}.
    
    Assess healthiness: Green (Healthy/Protein), Yellow (Moderate), Red (High Fat/Sugar).
    
    Return a JSON array of items with nutritional info.
    - name (English)
    - nameAr (Arabic)
    - calories
    - protein
    - carbs
    - fat
    - fiber
    - estimatedWeight
    - confidence
    - visualEmoji (a single emoji)
    - estimatedCost (price in ${country})
    - currency (ISO code)
    - healthRating ('green', 'yellow', 'red')
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Audio } }, 
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                foodName: { type: Type.STRING },
                foodNameAr: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                estimatedWeight: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                visualEmoji: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                healthRating: { type: Type.STRING, enum: ["green", "yellow", "red"] }
              }
            }
          }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as AnalysisResult[];
  } catch (error: any) {
    console.error("Audio analysis error", error);
    throw new Error(error.message || "Failed to analyze audio");
  }
};