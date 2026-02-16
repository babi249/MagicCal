export type Language = 'en' | 'ar';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type HealthRating = 'green' | 'yellow' | 'red';

export interface UserProfile {
  id: string; // Unique ID for the profile
  name: string; // User's name
  country: string; // User's country for cost estimation
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  dailyCalorieTarget: number;
}

export interface FoodItem {
  id: string;
  name: string;
  nameAr?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number; 
  weight: string; // e.g., "150g"
  timestamp: number;
  time: string; // HH:MM
  mealType: MealType;
  healthRating?: HealthRating;
  image?: string; // base64
  visualEmoji?: string; // e.g., "🥚"
  estimatedCost?: number;
  currency?: string;
}

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  items: FoodItem[];
}

export interface AnalysisResult {
  foodName: string;
  foodNameAr: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  estimatedWeight: string;
  confidence: number;
  visualEmoji: string;
  estimatedCost: number;
  currency: string;
  healthRating: HealthRating;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[]; // Step by step
  prepTime: string; // e.g. "30 mins"
  estimatedCost: number;
  currency: string;
  savedAt: number;
}

export interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  estimatedCost: number;
  currency: string;
}

export interface ReportItem {
  emoji: string;
  title: string;
  description: string;
}

export interface DailyReport {
  summary: string;
  score: number; // 0-100
  goodChoices: ReportItem[];
  improvements: ReportItem[];
}