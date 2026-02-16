import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, FoodItem, AnalysisResult, Language, MealSuggestion, DailyReport, MealType, HealthRating, Recipe } from './types';
import { calculatePlan, analyzeFoodImage, analyzeFoodAudio, suggestMeal, generateDailyReport } from './services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { 
  CameraIcon, 
  MicrophoneIcon, 
  SparklesIcon,
  XMarkIcon, 
  PencilIcon,
  PlusIcon,
  HomeIcon,
  StopIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
  BeakerIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  UserCircleIcon,
  PlusCircleIcon,
  TrashIcon,
  BookOpenIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

// --- Constants ---
const LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const COUNTRIES = [
    "Saudi Arabia", "United Arab Emirates", "Egypt", "Kuwait", "Qatar", "Jordan", 
    "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "India", "China", "Japan", "Brazil", "Mexico"
];

// --- Translations ---
const translations = {
  en: {
    appTitle: "MagiCal",
    dailySummary: "Calories Left",
    left: "Left",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    fiber: "Fiber",
    suggestMeal: "Suggest Meal",
    manualAdd: "Manual Add",
    dailyAnalysis: "Analysis",
    dailyAnalysisTitle: "Daily Insights",
    tapToLog: "Tap the orange button to log",
    analyzing: "Analyzing...",
    listening: "Listening...",
    confirmItems: "Confirm Items",
    addToLog: "Done",
    cancel: "Cancel",
    save: "Save Changes",
    add: "Add",
    foodName: "Food Name",
    calories: "Calories",
    weight: "Weight",
    editEntry: "Edit Entry",
    createProfile: "Create Profile",
    name: "Name",
    country: "Country",
    weightInput: "Weight (kg)",
    heightInput: "Height (cm)",
    ageInput: "Age",
    createPlan: "Create Plan",
    healthScore: "Health Score",
    fixResults: "Fix results",
    gram: "g",
    home: "Home",
    plan: "My Plan",
    settings: "Settings",
    water: "Water",
    waterTarget: "Daily Target",
    todaysMeals: "Today's Meals",
    noMeals: "No meals logged today",
    addWater: "+250ml",
    yourPlan: "Your Daily Plan",
    gender: "Gender",
    male: "Male",
    female: "Female",
    activity: "Activity Level",
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    active: "Active",
    goal: "Goal",
    lose: "Lose Weight",
    maintain: "Maintain",
    gain: "Build Muscle",
    edit: "Edit Plan",
    goodChoices: "Good Choices",
    improvements: "Improvements",
    score: "Daily Score",
    selectProfile: "Select Profile",
    createNew: "Create New",
    cost: "Est. Cost",
    suggesting: "Finding local meal...",
    ingredients: "Ingredients",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    time: "Time",
    mealType: "Meal Type",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this meal?",
    recipes: "Recipes",
    saveRecipe: "Save Recipe",
    instructions: "Instructions",
    prepTime: "Prep Time",
    noRecipes: "No saved recipes yet.",
    viewRecipe: "View Recipe",
    deleteData: "Delete All Data",
    logout: "Logout",
    confirmDataDelete: "This will delete all logs and recipes. Are you sure?",
  },
  ar: {
    appTitle: "ماجيكال",
    dailySummary: "المتبقي",
    left: "متبقي",
    protein: "بروتين",
    carbs: "كربوهيدرات",
    fat: "دهون",
    fiber: "ألياف",
    suggestMeal: "اقتراح وجبة",
    manualAdd: "إضافة يدوية",
    dailyAnalysis: "تحليل",
    dailyAnalysisTitle: "رؤى يومية",
    tapToLog: "اضغط الزر البرتقالي للتسجيل",
    analyzing: "جاري التحليل...",
    listening: "جاري الاستماع...",
    confirmItems: "تأكيد",
    addToLog: "تم",
    cancel: "إلغاء",
    save: "حفظ التغييرات",
    add: "إضافة",
    foodName: "الاسم",
    calories: "سعرات",
    weight: "الوزن",
    editEntry: "تعديل",
    createProfile: "إنشاء ملف",
    name: "الاسم",
    country: "الدولة",
    weightInput: "الوزن",
    heightInput: "الطول",
    ageInput: "العمر",
    createPlan: "إنشاء الخطة",
    healthScore: "نقاط الصحة",
    fixResults: "تصحيح النتائج",
    gram: "غ",
    home: "الرئيسية",
    plan: "خطتي",
    settings: "إعدادات",
    water: "الماء",
    waterTarget: "الهدف اليومي",
    todaysMeals: "وجبات اليوم",
    noMeals: "لم يتم تسجيل وجبات",
    addWater: "+٢٥٠مل",
    yourPlan: "خطتك اليومية",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    activity: "النشاط",
    sedentary: "خامل",
    light: "خفيف",
    moderate: "متوسط",
    active: "نشيط",
    goal: "الهدف",
    lose: "خسارة وزن",
    maintain: "حفاظ",
    gain: "بناء عضلات",
    edit: "تعديل الخطة",
    goodChoices: "خيارات جيدة",
    improvements: "تحسينات",
    score: "النقاط اليومية",
    selectProfile: "اختر الملف الشخصي",
    createNew: "إنشاء جديد",
    cost: "السعر المتوقع",
    suggesting: "البحث عن وجبة محلية...",
    ingredients: "المكونات",
    breakfast: "إفطار",
    lunch: "غداء",
    dinner: "عشاء",
    snack: "وجبة خفيفة",
    time: "الوقت",
    mealType: "نوع الوجبة",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذه الوجبة؟",
    recipes: "وصفات",
    saveRecipe: "حفظ الوصفة",
    instructions: "طريقة التحضير",
    prepTime: "وقت التحضير",
    noRecipes: "لا توجد وصفات محفوظة.",
    viewRecipe: "عرض الوصفة",
    deleteData: "مسح جميع البيانات",
    logout: "تسجيل خروج",
    confirmDataDelete: "سيتم مسح جميع السجلات والوصفات. هل أنت متأكد؟",
  }
};

// --- Helper Components ---

// Custom SVG Bottom Nav Background
const BottomNavCurve = () => (
  <svg viewBox="0 0 375 80" className="absolute bottom-0 left-0 w-full h-[90px] text-bg-dark drop-shadow-2xl z-0" preserveAspectRatio="none">
    <path 
      d="M0,20 C0,20 0,0 0,0 L375,0 C375,0 375,20 375,20 L375,80 L0,80 L0,20 Z" 
      fill="currentColor" 
      className="hidden" // Hiding the blocky fallback
    />
    <path 
      d="M0,30 Q0,0 30,0 L110,0 Q130,0 135,15 Q150,55 187.5,55 Q225,55 240,15 Q245,0 265,0 L345,0 Q375,0 375,30 L375,90 L0,90 Z" 
      fill="currentColor" 
    />
  </svg>
);

const CircularProgress = ({ progress, size = 100, strokeWidth = 10, color = "#1E1E1E" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
};

// --- Live Audio Utils ---
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return new Blob([int16], { type: 'audio/pcm;rate=16000' });
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Views state
  type View = 'dashboard' | 'plan' | 'recipes' | 'settings';
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Profile
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Data
  const [todayLogs, setTodayLogs] = useState<FoodItem[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  // States
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult[] | null>(null);
  
  // Modals & Forms
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [editForm, setEditForm] = useState({ name: '', weight: '', calories: 0, cost: 0, time: '', mealType: 'breakfast' as MealType });
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  
  // Swipe State
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const touchStartRef = useRef<number>(0);
  
  // Report & Suggestions
  const [reportData, setReportData] = useState<DailyReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [suggestionData, setSuggestionData] = useState<MealSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  // Live Mode
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"disconnected" | "connected" | "speaking">("disconnected");
  const [waveform, setWaveform] = useState<number[]>([10, 15, 30, 15, 10]);
  const [isMicClosing, setIsMicClosing] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const visualizerContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  
  // --- Initialization ---
  useEffect(() => {
    const savedProfiles = localStorage.getItem('liquidcal_profiles');
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      setProfiles(parsed);
    }
  }, []);

  useEffect(() => {
    if (profiles.length > 0) localStorage.setItem('liquidcal_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfile) {
      const dateKey = new Date().toISOString().split('T')[0];
      const storageKey = `liquidcal_logs_${activeProfile.id}_${dateKey}`;
      const waterKey = `liquidcal_water_${activeProfile.id}_${dateKey}`;
      const recipesKey = `liquidcal_recipes_${activeProfile.id}`;
      
      const savedLogs = localStorage.getItem(storageKey);
      if (savedLogs) setTodayLogs(JSON.parse(savedLogs));
      else setTodayLogs([]);

      const savedWater = localStorage.getItem(waterKey);
      if (savedWater) setWaterIntake(Number(savedWater));
      else setWaterIntake(0);

      const savedRecipes = localStorage.getItem(recipesKey);
      if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
      else setRecipes([]);
    }
  }, [activeProfile]);

  useEffect(() => {
    if (activeProfile) {
      const dateKey = new Date().toISOString().split('T')[0];
      const storageKey = `liquidcal_logs_${activeProfile.id}_${dateKey}`;
      const waterKey = `liquidcal_water_${activeProfile.id}_${dateKey}`;
      const recipesKey = `liquidcal_recipes_${activeProfile.id}`;

      localStorage.setItem(storageKey, JSON.stringify(todayLogs));
      localStorage.setItem(waterKey, String(waterIntake));
      localStorage.setItem(recipesKey, JSON.stringify(recipes));
    }
  }, [todayLogs, waterIntake, recipes, activeProfile]);

  // Sync edit form when item selected
  useEffect(() => {
    if (editingItem) {
        setEditForm({
            name: editingItem.name,
            weight: editingItem.weight,
            calories: editingItem.calories,
            cost: editingItem.estimatedCost || 0,
            time: editingItem.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit'}),
            mealType: editingItem.mealType || 'breakfast'
        });
    }
  }, [editingItem]);

  // Camera initialization effect
  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        alert("Could not access camera. Please ensure permissions are granted.");
        setShowCamera(false);
      }
    };

    if (showCamera && !analysisResult) {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, analysisResult]);

  // --- Visualizer ---
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; 
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      visualizerContextRef.current = ctx;
      analyzerRef.current = analyser;

      const updateWaveform = () => {
         if (!analyzerRef.current) return;
         const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
         analyzerRef.current.getByteFrequencyData(dataArray);
         const indices = [4, 8, 12, 16, 20, 16, 12, 8, 4]; // More bars
         const newWaveform = indices.map(i => {
             const val = dataArray[i] || 0;
             return Math.max(8, (val / 255) * 60);
         });
         setWaveform(newWaveform);
         animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (e) {
      console.error("Visualizer error", e);
    }
  };

  const stopVisualizer = () => {
     if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
     if (visualizerContextRef.current && visualizerContextRef.current.state !== 'closed') {
       visualizerContextRef.current.close();
     }
     setWaveform([10, 15, 30, 15, 10]);
  };

  // --- Logic for Calorie Calc ---
  const calculateDailyTarget = (weight: number, height: number, age: number, gender: string, activity: string, goal: string) => {
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'male' ? 5 : -161;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    let tdee = bmr * (activityMultipliers[activity] || 1.2);

    if (goal === 'lose') tdee -= 500;
    if (goal === 'gain') tdee += 500;
    
    return Math.round(tdee);
  };

  // --- Helpers for Grouping ---
  const determineMealType = (): MealType => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) return 'breakfast';
      if (hour >= 11 && hour < 16) return 'lunch';
      if (hour >= 16 && hour < 22) return 'dinner';
      return 'snack';
  };

  const currentTime = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit'});

  // --- Actions ---

  const handleCreateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = Number(formData.get('weight'));
    const height = Number(formData.get('height'));
    const age = Number(formData.get('age'));
    const gender = formData.get('gender') as 'male' | 'female';
    const activity = formData.get('activity') as UserProfile['activityLevel'];
    const goal = formData.get('goal') as UserProfile['goal'];
    const country = formData.get('country') as string;

    const tdee = calculateDailyTarget(weight, height, age, gender, activity, goal);

    const newProfile: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      country, weight, height, age, gender, activityLevel: activity, goal,
      dailyCalorieTarget: tdee
    };
    setProfiles([...profiles, newProfile]);
    setActiveProfile(newProfile);
    setIsCreatingProfile(false);
  };

  const handleUpdatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeProfile) return;
    
    const formData = new FormData(e.currentTarget);
    const weight = Number(formData.get('weight'));
    const activity = formData.get('activity') as UserProfile['activityLevel'];
    const goal = formData.get('goal') as UserProfile['goal'];
    
    const newTarget = calculateDailyTarget(
        weight, 
        activeProfile.height, 
        activeProfile.age, 
        activeProfile.gender, 
        activity, 
        goal
    );

    const updatedProfile = { 
        ...activeProfile, 
        weight, 
        activityLevel: activity, 
        goal, 
        dailyCalorieTarget: newTarget 
    };

    setActiveProfile(updatedProfile);
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setIsEditingPlan(false);
  };

  const startCamera = () => {
    setShowCamera(true);
    setAnalysisResult(null);
    setIsMenuOpen(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    setShowCamera(false);
    processImage(base64);
  };

  const processImage = async (base64: string) => {
    if (!activeProfile) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeFoodImage(base64, activeProfile.country, lang);
      setAnalysisResult(results);
    } catch (e) { alert("Error analyzing image"); } finally { setIsAnalyzing(false); }
  };

  const toggleRecording = async () => {
    setIsMenuOpen(false);
    if (isRecording) {
      setIsMicClosing(true);
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        stopVisualizer();
        setIsRecording(false);
        setIsMicClosing(false);
      }, 300);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startVisualizer(stream);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mediaRecorder.onstop = () => {
           const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
           const reader = new FileReader();
           reader.readAsDataURL(blob);
           reader.onloadend = () => processAudio((reader.result as string).split(',')[1], mediaRecorder.mimeType);
           stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) { 
          console.error(err);
          alert("Mic error: Please ensure permissions are granted."); 
      }
    }
  };

  const processAudio = async (base64: string, mime: string) => {
    if (!activeProfile) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeFoodAudio(base64, mime, activeProfile.country, lang);
      setAnalysisResult(results);
    } catch (e) { alert("Error analyzing audio"); } finally { setIsAnalyzing(false); }
  };

  const startLiveSession = async () => {
     if(!activeProfile) return;
     setIsLiveMode(true);
     setLiveStatus("connected");
     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
     
     try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         startVisualizer(stream);
    
         const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
         inputContextRef.current = new AudioContextClass({ sampleRate: 16000 });
         audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
         
         const sessionPromise = ai.live.connect({
            model: LIVE_MODEL,
            callbacks: {
               onopen: () => {
                 const source = inputContextRef.current!.createMediaStreamSource(stream);
                 const processor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
                 processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = new Int16Array(inputData.length);
                    for(let i=0; i<inputData.length; i++) pcmData[i] = inputData[i] * 32768;
                    let binary = '';
                    const bytes = new Uint8Array(pcmData.buffer);
                    for(let i=0; i<bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                    sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: "audio/pcm;rate=16000", data: btoa(binary) }}));
                 };
                 source.connect(processor);
                 processor.connect(inputContextRef.current!.destination);
               },
               onmessage: async (msg: LiveServerMessage) => {
                  if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                      setLiveStatus("speaking");
                      const audioData = decode(msg.serverContent.modelTurn.parts[0].inlineData.data);
                      const buffer = await decodeAudioData(audioData, audioContextRef.current!);
                      const source = audioContextRef.current!.createBufferSource();
                      source.buffer = buffer;
                      source.connect(audioContextRef.current!.destination);
                      source.start(0);
                      source.onended = () => setLiveStatus("connected");
                  }
               },
               onclose: () => { stopVisualizer(); setIsLiveMode(false); }
            },
            config: { responseModalities: [Modality.AUDIO], systemInstruction: "Helpful nutritionist." }
         });
         liveSessionRef.current = sessionPromise;
     } catch (err) {
         console.error("Live session error:", err);
         alert("Could not start live session.");
         setIsLiveMode(false);
     }
  };

  const stopLiveSession = () => {
      setIsMicClosing(true);
      setTimeout(() => {
          if(liveSessionRef.current) liveSessionRef.current.then((s:any) => s.close && s.close());
          if(inputContextRef.current?.state !== 'closed') inputContextRef.current?.close();
          if(audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
          stopVisualizer();
          setIsLiveMode(false);
          setIsMicClosing(false);
      }, 300);
  };

  const confirmLog = () => {
    if (!analysisResult) return;
    const defaultTime = currentTime();
    const defaultMeal = determineMealType();
    
    const newItems = analysisResult.map(res => ({
      id: Math.random().toString(36).substr(2, 9),
      name: res.foodName,
      nameAr: res.foodNameAr,
      calories: res.calories,
      protein: res.protein,
      carbs: res.carbs,
      fat: res.fat,
      fiber: res.fiber,
      weight: res.estimatedWeight,
      timestamp: Date.now(),
      time: defaultTime,
      mealType: defaultMeal,
      visualEmoji: res.visualEmoji,
      estimatedCost: res.estimatedCost,
      currency: res.currency,
      healthRating: res.healthRating
    }));
    setTodayLogs([...todayLogs, ...newItems]);
    setAnalysisResult(null);
  };

  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    const newItem: FoodItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        calories: Number(formData.get('calories')) || 0,
        protein: Number(formData.get('protein')) || 0,
        carbs: Number(formData.get('carbs')) || 0,
        fat: Number(formData.get('fat')) || 0,
        fiber: Number(formData.get('fiber')) || 0,
        weight: "1 serving", 
        timestamp: Date.now(),
        time: formData.get('time') as string || currentTime(),
        mealType: formData.get('mealType') as MealType || determineMealType(),
        visualEmoji: "📝",
        healthRating: 'yellow' // default neutral
    };
    
    setTodayLogs([...todayLogs, newItem]);
    setShowManualAdd(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditForm(prev => {
          const newState = { ...prev, [name]: value };
          
          if (name === 'weight' && editingItem) {
              const newWeight = parseFloat(value);
              const oldWeight = parseFloat(editingItem.weight);
              
              if (!isNaN(newWeight) && !isNaN(oldWeight) && oldWeight > 0) {
                  const ratio = newWeight / oldWeight;
                  newState.calories = Math.round(editingItem.calories * ratio);
                  if (editingItem.estimatedCost) {
                      newState.cost = Math.round(editingItem.estimatedCost * ratio);
                  }
              }
          }
          return newState;
      });
  };

  const handleEditItem = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingItem) return;
      const updatedItem: FoodItem = {
          ...editingItem,
          name: editForm.name,
          weight: editForm.weight,
          calories: Number(editForm.calories),
          estimatedCost: Number(editForm.cost),
          time: editForm.time,
          mealType: editForm.mealType
      };
      setTodayLogs(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      setEditingItem(null);
  };
  
  const handleDeleteItem = () => {
      if (!editingItem) return;
      if(window.confirm(t.confirmDelete)){
          setTodayLogs(prev => prev.filter(i => i.id !== editingItem.id));
          setEditingItem(null);
      }
  };

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent, id: string) => {
      touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent, id: string) => {
      const touchEnd = e.changedTouches[0].clientX;
      if (touchStartRef.current - touchEnd > 75) {
          setSwipeId(id);
      } else {
          setSwipeId(null);
      }
  };

  const deleteSwiped = (id: string) => {
      if(window.confirm(t.confirmDelete)){
          setTodayLogs(prev => prev.filter(i => i.id !== id));
      }
      setSwipeId(null);
  };

  const handleGenerateSuggestion = async () => {
     if(!activeProfile) return;
     setIsSuggesting(true);
     setShowSuggestion(true);
     const remaining = Math.max(0, activeProfile.dailyCalorieTarget - totalCalories);
     const result = await suggestMeal(remaining, todayLogs, activeProfile.country, lang);
     setSuggestionData(result);
     setIsSuggesting(false);
  };

  const acceptSuggestion = () => {
      if(!suggestionData) return;
      const newItem: FoodItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: suggestionData.name,
          calories: suggestionData.calories,
          protein: suggestionData.protein,
          carbs: suggestionData.carbs,
          fat: suggestionData.fat,
          fiber: suggestionData.fiber,
          weight: "1 serving",
          timestamp: Date.now(),
          time: currentTime(),
          mealType: determineMealType(),
          visualEmoji: "🥗",
          estimatedCost: suggestionData.estimatedCost,
          currency: suggestionData.currency,
          healthRating: 'green'
      };
      setTodayLogs([...todayLogs, newItem]);
      setShowSuggestion(false);
      setSuggestionData(null);
  };

  const saveSuggestionRecipe = () => {
      if(!suggestionData) return;
      const newRecipe: Recipe = {
          id: Math.random().toString(36).substr(2, 9),
          name: suggestionData.name,
          description: suggestionData.description,
          calories: suggestionData.calories,
          protein: suggestionData.protein,
          carbs: suggestionData.carbs,
          fat: suggestionData.fat,
          ingredients: suggestionData.ingredients || [],
          instructions: suggestionData.instructions || [],
          prepTime: suggestionData.prepTime || "20 mins",
          estimatedCost: suggestionData.estimatedCost,
          currency: suggestionData.currency,
          savedAt: Date.now()
      };
      setRecipes([...recipes, newRecipe]);
      setShowSuggestion(false);
      setCurrentView('recipes'); // Redirect to recipes view
  };

  const deleteData = () => {
      if(window.confirm(t.confirmDataDelete)) {
          setTodayLogs([]);
          setRecipes([]);
      }
  };

  const logout = () => {
      setActiveProfile(null);
      setCurrentView('dashboard');
  }

  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      setShowReport(true);
      const report = await generateDailyReport(todayLogs, lang);
      setReportData(report);
      setIsGeneratingReport(false);
  };

  const addWater = () => {
    setWaterIntake(prev => prev + 250);
  };

  // Stats
  const totalCalories = todayLogs.reduce((a, b) => a + b.calories, 0);
  const totalProtein = todayLogs.reduce((a, b) => a + b.protein, 0);
  const totalCarbs = todayLogs.reduce((a, b) => a + b.carbs, 0);
  const totalFat = todayLogs.reduce((a, b) => a + b.fat, 0);
  const totalFiber = todayLogs.reduce((a, b) => a + (b.fiber || 0), 0);
  const target = activeProfile?.dailyCalorieTarget || 2000;
  const progress = Math.min((totalCalories / target) * 100, 100);
  
  const waterTarget = activeProfile ? Math.round(activeProfile.weight * 35) : 2500;
  const waterProgress = Math.min((waterIntake / waterTarget) * 100, 100);

  // Group logs
  const groupedLogs = {
      breakfast: todayLogs.filter(i => i.mealType === 'breakfast'),
      lunch: todayLogs.filter(i => i.mealType === 'lunch'),
      dinner: todayLogs.filter(i => i.mealType === 'dinner'),
      snack: todayLogs.filter(i => i.mealType === 'snack'),
  };

  const [profileHeight, setProfileHeight] = useState(170);

  const getHealthColor = (rating?: HealthRating) => {
      switch(rating) {
          case 'green': return 'border-l-4 border-green-500 bg-green-50/50';
          case 'yellow': return 'border-l-4 border-yellow-400 bg-yellow-50/50';
          case 'red': return 'border-l-4 border-red-500 bg-red-50/50';
          default: return 'border-l-4 border-gray-200';
      }
  };

  // --- Views ---

  const renderDashboard = () => (
      <>
        {/* Calendar Strip (Small) */}
        <div className="px-6 mb-4 flex justify-between items-center overflow-x-auto no-scrollbar gap-1">
            {[-3,-2,-1,0,1,2,3].map(offset => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const isToday = offset === 0;
                const dayName = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { weekday: 'short' }).charAt(0);
                return (
                <div key={offset} className={`flex flex-col items-center gap-1 p-1 rounded-xl min-w-[36px] transition-all ${isToday ? 'bg-accent-orange text-white shadow-md' : 'text-gray-400'}`}>
                    <span className="text-[10px] font-medium">{dayName}</span>
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-white text-accent-orange' : ''}`}>
                        {d.getDate()}
                    </span>
                </div>
                )
            })}
        </div>

        {/* Hero Section */}
        <div className="px-6 mb-4 flex gap-4 h-[160px]">
            <div className="flex-1 bg-primary-yellow rounded-4xl p-4 relative shadow-soft flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
                <div>
                    <h2 className="text-xs font-bold opacity-80 uppercase tracking-wide">{t.dailySummary}</h2>
                    <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-text-dark">{Math.max(0, target - totalCalories)}</span>
                    <span className="text-[10px] font-bold opacity-60">kcal</span>
                    </div>
                </div>
                <div className="w-full flex justify-center py-1">
                    <CircularProgress progress={progress} size={70} strokeWidth={8} color="#1E1E1E" />
                </div>
            </div>

            {/* Water Square */}
            <div className="flex-1 bg-white rounded-4xl p-1 relative shadow-soft overflow-hidden">
                <div className="w-full h-full bg-blue-50 rounded-[28px] relative overflow-hidden flex flex-col items-center justify-between py-3">
                    <div 
                    className="absolute bottom-0 left-0 w-full bg-blue-400 transition-all duration-700 ease-in-out opacity-80 z-0"
                    style={{ height: `${waterProgress}%` }}
                    >
                        <div className="absolute top-0 w-full h-2 bg-blue-300 opacity-50 animate-pulse"></div>
                    </div>
                    
                    <div className="relative z-10 w-full px-3 flex justify-between items-start">
                        <span className="text-xs font-bold text-gray-500 mix-blend-multiply uppercase">{t.water}</span>
                        <BeakerIcon className="w-4 h-4 text-blue-600 mix-blend-multiply" />
                    </div>

                    <div className="relative z-10 text-center mix-blend-multiply">
                        <span className="text-xl font-extrabold text-gray-800">{waterIntake}</span>
                        <span className="text-[10px] font-bold block text-gray-500">/ {waterTarget}ml</span>
                    </div>

                    <button onClick={addWater} className="relative z-10 bg-white/50 backdrop-blur-sm hover:bg-white text-blue-600 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-colors shadow-sm">
                        {t.addWater}
                    </button>
                </div>
            </div>
        </div>

        {/* Macros */}
        <div className="px-6 grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white rounded-3xl p-2 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-20">
                <div className="absolute bottom-0 w-full h-1 bg-primary-purple"></div>
                <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">{t.protein}</p>
                <p className="text-sm font-bold text-gray-800">{Math.round(totalProtein)}<span className="text-[10px] font-normal text-gray-400">{t.gram}</span></p>
            </div>
            <div className="bg-white rounded-3xl p-2 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-20">
                <div className="absolute bottom-0 w-full h-1 bg-primary-green-accent"></div>
                <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">{t.carbs}</p>
                <p className="text-sm font-bold text-gray-800">{Math.round(totalCarbs)}<span className="text-[10px] font-normal text-gray-400">{t.gram}</span></p>
            </div>
            <div className="bg-white rounded-3xl p-2 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-20">
                <div className="absolute bottom-0 w-full h-1 bg-accent-orange"></div>
                <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">{t.fat}</p>
                <p className="text-sm font-bold text-gray-800">{Math.round(totalFat)}<span className="text-[10px] font-normal text-gray-400">{t.gram}</span></p>
            </div>
            <div className="bg-white rounded-3xl p-2 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-20">
                <div className="absolute bottom-0 w-full h-1 bg-blue-400"></div>
                <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">{t.fiber}</p>
                <p className="text-sm font-bold text-gray-800">{Math.round(totalFiber)}<span className="text-[10px] font-normal text-gray-400">{t.gram}</span></p>
            </div>
        </div>

        {/* Suggestion CTA */}
        <div className="px-6 mb-6">
            <button 
                onClick={handleGenerateSuggestion} 
                className="w-full bg-gradient-to-r from-primary-purple to-indigo-300 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between hover:scale-[1.02] transition"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-sm">{t.suggestMeal}</p>
                        <p className="text-[10px] text-white/80">Based on local food & calorie limit</p>
                    </div>
                </div>
                <ChevronLeftIcon className={`w-5 h-5 text-white ${lang === 'en' ? 'rotate-180' : ''}`} />
            </button>
        </div>

        {/* Logged Items */}
        <div className="px-6 pb-24 space-y-6">
            {(Object.entries(groupedLogs) as [MealType, FoodItem[]][]).map(([type, items]) => {
                if (items.length === 0) return null;
                return (
                    <div key={type}>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 capitalize">
                            {t[type as keyof typeof t] || type}
                        </h3>
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div 
                                    key={item.id} 
                                    className={`bg-white p-4 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden transition-transform duration-300 ${getHealthColor(item.healthRating)}`}
                                    onTouchStart={(e) => onTouchStart(e, item.id)}
                                    onTouchEnd={(e) => onTouchEnd(e, item.id)}
                                >
                                    {swipeId === item.id && (
                                        <div className="absolute inset-0 bg-red-500 z-10 flex items-center justify-end px-6 animate-float-up" onClick={() => deleteSwiped(item.id)}>
                                            <TrashIcon className="w-6 h-6 text-white" />
                                            <span className="text-white font-bold ml-2">{t.delete}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                                        {item.visualEmoji || "🍽️"}
                                        </div>
                                        <div>
                                        <h4 className="font-bold text-text-dark">{lang === 'ar' && item.nameAr ? item.nameAr : item.name}</h4>
                                        <div className="flex gap-2 text-xs text-gray-400 font-medium">
                                                <span>{item.weight} • {item.time}</span>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="font-bold text-primary-purple">{item.calories}</span>
                                            <span className="text-[10px] text-gray-400 block font-bold uppercase">kcal</span>
                                        </div>
                                        <button onClick={() => setEditingItem(item)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                                            <PencilIcon className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
            
            {todayLogs.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                    {t.noMeals}
                </div>
            )}
        </div>
      </>
  );

  const renderRecipes = () => (
      <div className="px-6 pt-4 pb-24">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpenIcon className="w-6 h-6 text-accent-orange" /> {t.recipes}
          </h2>
          <div className="space-y-4">
              {recipes.length > 0 ? recipes.map(recipe => (
                  <div key={recipe.id} onClick={() => setViewingRecipe(recipe)} className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex justify-between items-center">
                      <div>
                          <h3 className="font-bold text-lg mb-1">{recipe.name}</h3>
                          <div className="flex gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><FireIcon className="w-3 h-3 text-orange-500" /> {recipe.calories} kcal</span>
                              <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-blue-500" /> {recipe.prepTime}</span>
                          </div>
                      </div>
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-accent-orange">
                          <ArrowRightOnRectangleIcon className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                      </div>
                  </div>
              )) : (
                  <div className="text-center py-10 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                      {t.noRecipes}
                  </div>
              )}
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="px-6 pt-4 pb-24">
           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Cog6ToothIcon className="w-6 h-6 text-gray-700" /> {t.settings}
          </h2>
          
          <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm">
                  <h3 className="font-bold text-lg mb-4">{t.selectProfile}</h3>
                  <div className="flex items-center gap-4 mb-6">
                       <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeProfile?.name}`} alt="avatar" />
                       </div>
                       <div>
                           <p className="font-bold text-xl">{activeProfile?.name}</p>
                           <p className="text-sm text-gray-400">{activeProfile?.goal}</p>
                       </div>
                  </div>
                  <button onClick={() => setCurrentView('plan')} className="w-full py-3 bg-gray-100 rounded-xl font-bold text-sm text-gray-700">{t.edit}</button>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
                   <div className="flex justify-between items-center">
                       <span className="font-bold">Language / اللغة</span>
                       <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="px-4 py-2 bg-gray-100 rounded-full font-bold text-sm">
                           {lang === 'en' ? 'Arabic' : 'English'}
                       </button>
                   </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm space-y-2">
                  <button onClick={deleteData} className="w-full py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-2 bg-red-50 rounded-xl">
                      <TrashIcon className="w-5 h-5" /> {t.deleteData}
                  </button>
                  <button onClick={logout} className="w-full py-3 text-gray-500 font-bold text-sm flex items-center justify-center gap-2 bg-gray-50 rounded-xl">
                      <ArrowRightOnRectangleIcon className="w-5 h-5" /> {t.logout}
                  </button>
              </div>
          </div>
      </div>
  );

  const renderPlan = () => (
     <div className="px-6 pt-4 pb-24">
         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-primary-purple" /> {t.yourPlan}
         </h2>
         <div className="bg-white rounded-3xl p-6 shadow-sm">
            {isEditingPlan ? (
                  <form onSubmit={handleUpdatePlan} className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold">{t.weightInput}</label>
                        <input name="weight" type="number" defaultValue={activeProfile?.weight} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold">{t.activity}</label>
                        <select name="activity" defaultValue={activeProfile?.activityLevel} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100" required>
                           <option value="sedentary">{t.sedentary}</option>
                           <option value="light">{t.light}</option>
                           <option value="moderate">{t.moderate}</option>
                           <option value="active">{t.active}</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold">{t.goal}</label>
                        <select name="goal" defaultValue={activeProfile?.goal} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100" required>
                           <option value="lose">{t.lose}</option>
                           <option value="maintain">{t.maintain}</option>
                           <option value="gain">{t.gain}</option>
                        </select>
                     </div>
                     <div className="flex gap-2">
                         <button type="button" onClick={() => setIsEditingPlan(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">{t.cancel}</button>
                         <button type="submit" className="flex-1 bg-accent-orange text-white py-3 rounded-xl font-bold">{t.save}</button>
                     </div>
                  </form>
               ) : (
                  <div className="space-y-6">
                     <div className="bg-primary-yellow/20 p-4 rounded-3xl flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">{t.calories}</p>
                            <p className="text-4xl font-bold">{target} <span className="text-sm font-normal">kcal</span></p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">🎯</div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-3xl">
                           <p className="text-xs font-bold text-gray-500 uppercase">{t.waterTarget}</p>
                           <p className="text-2xl font-bold text-blue-600">{waterTarget} <span className="text-sm font-normal">ml</span></p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-3xl">
                            <p className="text-xs font-bold text-gray-500 uppercase">{t.goal}</p>
                            <p className="text-lg font-bold capitalize mt-1">{activeProfile?.goal}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-3xl">
                            <p className="text-xs font-bold text-gray-500 uppercase">{t.weight}</p>
                            <p className="text-xl font-bold">{activeProfile?.weight} <span className="text-sm font-normal">kg</span></p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-3xl">
                            <p className="text-xs font-bold text-gray-500 uppercase">{t.activity}</p>
                            <p className="text-sm font-bold capitalize mt-2">{activeProfile?.activityLevel}</p>
                        </div>
                     </div>
                     <button onClick={() => setIsEditingPlan(true)} className="w-full py-3 bg-gray-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                       <PencilIcon className="w-4 h-4" /> {t.edit}
                    </button>
                  </div>
               )}
         </div>
     </div>
  );

  // --- Render ---

  if (!activeProfile && !isCreatingProfile) {
     return (
        <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6">
           <div className="bg-white p-8 rounded-4xl shadow-xl w-full max-w-md text-center">
              <div className="flex justify-end mb-4">
                 <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase">
                    {lang === 'en' ? 'AR' : 'EN'}
                 </button>
              </div>

              <h1 className="text-3xl font-bold mb-2">Welcome to {t.appTitle}</h1>
              <p className="text-gray-500 mb-8">{t.selectProfile}</p>
              
              <div className="space-y-3 mb-8">
                 {profiles.map(p => (
                    <button key={p.id} onClick={() => setActiveProfile(p)} className="w-full bg-gray-50 py-4 px-6 rounded-2xl flex justify-between items-center hover:bg-gray-100 transition">
                       <span className="font-bold text-gray-800 flex items-center gap-2">
                          <UserCircleIcon className="w-6 h-6 text-gray-400" />
                          {p.name}
                       </span>
                       <span className="text-xs text-gray-400 font-bold uppercase">{p.goal}</span>
                    </button>
                 ))}
              </div>

              <button 
                onClick={() => setIsCreatingProfile(true)}
                className="w-full bg-accent-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-accent-orange/30 hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <PlusCircleIcon className="w-6 h-6" /> {t.createNew}
              </button>
           </div>
        </div>
     )
  }

  if (isCreatingProfile) {
    return (
       <div className="min-h-screen bg-[#F8F8F8] p-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-4xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t.createProfile}</h2>
                <div className="flex gap-2">
                   <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase">
                       {lang === 'en' ? 'AR' : 'EN'}
                   </button>
                   {profiles.length > 0 && (
                      <button onClick={() => setIsCreatingProfile(false)} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold"><XMarkIcon className="w-4 h-4" /></button>
                   )}
                </div>
             </div>
             <form onSubmit={handleCreateProfile} className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <input name="name" placeholder={t.name} className="w-full p-4 bg-gray-50 rounded-2xl" required />
                
                <div className="space-y-2">
                   <label className="text-xs text-gray-500 ml-2 uppercase font-bold">{t.country}</label>
                   <select name="country" className="w-full p-4 bg-gray-50 rounded-2xl text-gray-700 appearance-none" required>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                
                <div className="flex gap-4">
                   <input name="weight" type="number" placeholder={t.weightInput} className="w-full p-4 bg-gray-50 rounded-2xl" required />
                   <input name="age" type="number" placeholder={t.ageInput} className="w-full p-4 bg-gray-50 rounded-2xl" required />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl">
                   <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">{t.heightInput}</label>
                   <div className="flex items-center gap-4">
                      <input 
                         type="range" 
                         min="100" 
                         max="220" 
                         value={profileHeight} 
                         onChange={(e) => setProfileHeight(Number(e.target.value))}
                         className="flex-1 accent-accent-orange h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input 
                         name="height" 
                         type="number" 
                         value={profileHeight}
                         onChange={(e) => setProfileHeight(Number(e.target.value))}
                         className="w-20 p-2 bg-white rounded-xl text-center font-bold"
                         required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs text-gray-500 ml-2 uppercase font-bold">{t.gender}</label>
                   <select name="gender" className="w-full p-4 bg-gray-50 rounded-2xl text-gray-700" required>
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-xs text-gray-500 ml-2 uppercase font-bold">{t.activity}</label>
                   <select name="activity" className="w-full p-4 bg-gray-50 rounded-2xl text-gray-700" required>
                      <option value="sedentary">{t.sedentary}</option>
                      <option value="light">{t.light}</option>
                      <option value="moderate">{t.moderate}</option>
                      <option value="active">{t.active}</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-xs text-gray-500 ml-2 uppercase font-bold">{t.goal}</label>
                   <select name="goal" className="w-full p-4 bg-gray-50 rounded-2xl text-gray-700" required>
                      <option value="lose">{t.lose}</option>
                      <option value="maintain">{t.maintain}</option>
                      <option value="gain">{t.gain}</option>
                   </select>
                </div>

                <button type="submit" className="w-full bg-accent-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-accent-orange/30 mt-4">{t.createPlan}</button>
             </form>
          </div>
       </div>
    )
  }

  // MAIN DASHBOARD
  return (
    <div className={`min-h-screen bg-[#F8F8F8] font-sans text-text-dark relative overflow-x-hidden`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. Header */}
      <header className="px-6 py-6 flex justify-between items-center bg-[#F8F8F8] sticky top-0 z-20">
         <div className="flex items-center gap-3" onClick={() => setActiveProfile(null)}>
             <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeProfile?.name}`} alt="avatar" />
             </div>
             <div>
                <p className="text-xs text-text-grey font-medium uppercase tracking-wider">Hello,</p>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-1">
                    {activeProfile?.name} 
                    <ChevronLeftIcon className={`w-3 h-3 text-gray-400 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </h3>
             </div>
         </div>
         <div className="flex items-center gap-3">
             <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-500 flex items-center border border-gray-100">
                {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { month: 'short', day: 'numeric' })}
             </div>
             <button className="p-2 bg-white rounded-full shadow-sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
                <span className="text-xs font-bold">{lang.toUpperCase()}</span>
             </button>
         </div>
      </header>

      {/* VIEW CONTENT */}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'plan' && renderPlan()}
      {currentView === 'recipes' && renderRecipes()}
      {currentView === 'settings' && renderSettings()}


      {/* 6. Bottom Navigation (Curved) */}
      <div className="fixed bottom-0 left-0 w-full z-40">
          <BottomNavCurve />
          
          <div className="absolute bottom-0 w-full h-[80px] flex justify-between items-center px-8 pb-2 text-gray-500">
             <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'dashboard' ? 'text-accent-orange' : 'hover:text-gray-700'}`}>
                <HomeIcon className="w-7 h-7" />
                <span className="text-[10px] font-bold">{t.home}</span>
             </button>
             <button onClick={() => setCurrentView('plan')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'plan' ? 'text-accent-orange' : 'hover:text-gray-700'}`}>
                <CalendarIcon className="w-7 h-7" />
                <span className="text-[10px] font-bold">{t.plan}</span>
             </button>
             
             <div className="w-16"></div> 
             
             <button onClick={() => setCurrentView('recipes')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'recipes' ? 'text-accent-orange' : 'hover:text-gray-700'}`}>
                <BookOpenIcon className="w-7 h-7" />
                <span className="text-[10px] font-bold">{t.recipes}</span>
             </button>
             <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'settings' ? 'text-accent-orange' : 'hover:text-gray-700'}`}>
                <Cog6ToothIcon className="w-7 h-7" />
                <span className="text-[10px] font-bold">{t.settings}</span>
             </button>
          </div>

          {/* FAB */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${isMenuOpen ? 'rotate-45 bg-gray-800' : 'bg-accent-orange shadow-accent-orange/40 hover:scale-105'}`}
             >
                <PlusCircleIcon className="w-10 h-10 text-white" />
             </button>
          </div>
      </div>

      {/* Floating Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
           <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button onClick={toggleRecording} className="flex flex-col items-center gap-2 animate-float">
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-accent-orange">
                    <MicrophoneIcon className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg">Voice</span>
              </button>
              <button onClick={startCamera} className="flex flex-col items-center gap-2 animate-float" style={{animationDelay: '0.1s'}}>
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-purple">
                    <CameraIcon className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg">Scan</span>
              </button>
              <button onClick={() => {setShowManualAdd(true); setIsMenuOpen(false);}} className="flex flex-col items-center gap-2 animate-float" style={{animationDelay: '0.2s'}}>
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-green-accent">
                    <PencilIcon className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg">Manual</span>
              </button>
           </div>
        </div>
      )}

      {/* --- MODALS & OVERLAYS --- */}
      
      {/* EDIT ITEM OVERLAY */}
      {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
             <div className="bg-white w-full sm:max-w-md rounded-t-4xl sm:rounded-4xl p-6 animate-float-up">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t.editEntry}</h2>
                    <button onClick={() => setEditingItem(null)} className="p-2 bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
                 </div>
                 <form onSubmit={handleEditItem}>
                    <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full p-4 bg-gray-50 rounded-2xl mb-4" />
                    
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400">{t.time}</label>
                            <input name="time" type="time" value={editForm.time} onChange={handleEditChange} className="w-full p-3 bg-gray-50 rounded-xl" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400">{t.mealType}</label>
                            <select name="mealType" value={editForm.mealType} onChange={handleEditChange} className="w-full p-3 bg-gray-50 rounded-xl">
                                <option value="breakfast">{t.breakfast}</option>
                                <option value="lunch">{t.lunch}</option>
                                <option value="dinner">{t.dinner}</option>
                                <option value="snack">{t.snack}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div>
                          <label className="text-xs font-bold text-gray-400">{t.weight}</label>
                          <input name="weight" value={editForm.weight} onChange={handleEditChange} className="w-full p-3 bg-gray-50 rounded-xl" />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-400">{t.calories}</label>
                          <input name="calories" type="number" value={editForm.calories} onChange={handleEditChange} className="w-full p-3 bg-gray-50 rounded-xl" />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-400">{t.cost}</label>
                          <input name="cost" type="number" value={editForm.cost} onChange={handleEditChange} className="w-full p-3 bg-gray-50 rounded-xl" />
                       </div>
                    </div>
                    
                    <div className="flex gap-4">
                         <button type="button" onClick={handleDeleteItem} className="w-1/3 bg-red-100 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center">
                            <TrashIcon className="w-5 h-5" />
                         </button>
                         <button type="submit" className="flex-1 bg-accent-orange text-white py-4 rounded-2xl font-bold">{t.save}</button>
                    </div>
                 </form>
             </div>
          </div>
      )}

      {/* SUGGESTION MODAL */}
      {showSuggestion && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
             <div className="bg-white w-full max-w-md rounded-4xl p-6 relative animate-float-up max-h-[90vh] overflow-y-auto no-scrollbar">
                <button onClick={() => {setShowSuggestion(false); setIsSuggesting(false);}} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
                <h2 className="text-2xl font-bold mb-4">{t.suggestMeal}</h2>
                
                {isSuggesting ? (
                    <div className="flex flex-col items-center py-10">
                        <SparklesIcon className="w-12 h-12 text-primary-purple animate-spin mb-4" />
                        <p className="text-gray-500 animate-pulse">{t.suggesting}</p>
                    </div>
                ) : suggestionData ? (
                    <div>
                        <div className="bg-primary-purple/10 p-4 rounded-3xl mb-4">
                            <h3 className="text-xl font-bold text-primary-purple mb-1">{suggestionData.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{suggestionData.description}</p>
                            <div className="flex gap-2 mb-2">
                                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{suggestionData.calories} kcal</span>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                    {suggestionData.estimatedCost} {suggestionData.currency}
                                </span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-bold text-sm mb-2">{t.ingredients}</h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestionData.ingredients.map((ing, i) => (
                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md">{ing}</span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button onClick={saveSuggestionRecipe} className="flex-1 bg-green-100 text-green-800 py-3 rounded-xl font-bold flex items-center justify-center gap-1">
                                <BookOpenIcon className="w-4 h-4" /> {t.saveRecipe}
                            </button>
                            <button onClick={acceptSuggestion} className="flex-1 bg-accent-orange text-white py-3 rounded-xl font-bold shadow-lg shadow-accent-orange/30">
                                {t.add}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-red-400">Could not find a suggestion.</p>
                )}
             </div>
          </div>
      )}

      {/* RECIPE DETAIL MODAL */}
      {viewingRecipe && (
           <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:max-w-md h-[90vh] rounded-t-4xl sm:rounded-4xl p-0 relative flex flex-col animate-float-up overflow-hidden">
                <div className="relative h-48 bg-primary-purple/20">
                     <button onClick={() => setViewingRecipe(null)} className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-sm z-10"><XMarkIcon className="w-5 h-5"/></button>
                     <div className="absolute inset-0 flex items-center justify-center">
                         <BookOpenIcon className="w-20 h-20 text-primary-purple opacity-20" />
                     </div>
                     <div className="absolute bottom-4 left-6">
                         <h2 className="text-2xl font-bold text-gray-800">{viewingRecipe.name}</h2>
                         <div className="flex gap-2 mt-1">
                             <span className="bg-white/80 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">{viewingRecipe.calories} kcal</span>
                             <span className="bg-white/80 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">{viewingRecipe.prepTime}</span>
                         </div>
                     </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    <div className="mb-6">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5 text-green-600"/> {t.ingredients}</h3>
                        <ul className="space-y-2">
                            {viewingRecipe.ingredients.map((ing, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full bg-accent-orange"></div>
                                    {ing}
                                </li>
                            ))}
                        </ul>
                         <p className="text-xs text-green-600 font-bold mt-3 text-right">{t.cost}: {viewingRecipe.estimatedCost} {viewingRecipe.currency}</p>
                    </div>

                    <div>
                         <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><FireIcon className="w-5 h-5 text-orange-500"/> {t.instructions}</h3>
                         <div className="space-y-4">
                             {viewingRecipe.instructions?.length > 0 ? viewingRecipe.instructions.map((step, i) => (
                                 <div key={i} className="flex gap-3">
                                     <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                         {i + 1}
                                     </div>
                                     <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                                 </div>
                             )) : (
                                 <p className="text-gray-400 italic text-sm">No specific instructions provided.</p>
                             )}
                         </div>
                    </div>
                </div>
            </div>
           </div>
      )}

      {/* MANUALLY ADD MODAL (Updated) */}
      {showManualAdd && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
             <div className="bg-[#F8F8F8] w-full sm:max-w-md h-auto rounded-t-4xl sm:rounded-4xl p-6 relative animate-float-up shadow-2xl">
                 <button onClick={() => setShowManualAdd(false)} className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
                 <form onSubmit={handleManualAdd}>
                    <h2 className="text-2xl font-bold mb-6">{t.manualAdd}</h2>
                    <input name="name" placeholder={t.foodName} className="w-full p-4 bg-white rounded-2xl mb-4 shadow-sm" required />
                    
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 bg-white p-2 rounded-2xl">
                             <label className="text-[10px] text-gray-400 uppercase font-bold pl-2">{t.time}</label>
                             <input name="time" type="time" defaultValue={currentTime()} className="w-full bg-transparent p-2 outline-none font-bold" />
                        </div>
                        <div className="flex-1 bg-white p-2 rounded-2xl">
                             <label className="text-[10px] text-gray-400 uppercase font-bold pl-2">{t.mealType}</label>
                             <select name="mealType" defaultValue={determineMealType()} className="w-full bg-transparent p-2 outline-none font-bold">
                                <option value="breakfast">{t.breakfast}</option>
                                <option value="lunch">{t.lunch}</option>
                                <option value="dinner">{t.dinner}</option>
                                <option value="snack">{t.snack}</option>
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div className="bg-primary-purple/20 p-4 rounded-2xl">
                          <label className="text-xs text-primary-purple font-bold uppercase">{t.calories}</label>
                          <input name="calories" type="number" className="w-full bg-transparent text-xl font-bold outline-none" placeholder="0" />
                       </div>
                       <div className="bg-primary-yellow/20 p-4 rounded-2xl">
                          <label className="text-xs text-primary-yellow font-bold uppercase">{t.carbs}</label>
                          <input name="carbs" type="number" className="w-full bg-transparent text-xl font-bold outline-none" placeholder="0g" />
                       </div>
                    </div>
                    {/* Hidden inputs for demo simplicity */}
                    <div className="hidden">
                       <input name="protein" defaultValue={0} /><input name="fat" defaultValue={0} /><input name="fiber" defaultValue={0} />
                    </div>
                    <button type="submit" className="w-full bg-accent-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-accent-orange/30 mt-4">{t.add}</button>
                 </form>
             </div>
          </div>
      )}

      {/* RICH REPORT MODAL */}
      {showReport && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:max-w-md h-[85vh] rounded-t-4xl sm:rounded-4xl p-6 relative flex flex-col animate-float-up">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t.dailyAnalysisTitle}</h2>
                  <button onClick={() => setShowReport(false)} className="p-2 bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto rounded-3xl pb-10 no-scrollbar">
                  {isGeneratingReport ? (
                     <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <SparklesIcon className="w-12 h-12 animate-spin mb-4 text-primary-purple"/>
                        <p className="font-bold">{t.analyzing}</p>
                     </div>
                  ) : reportData ? (
                     <div className="space-y-6">
                        {/* Summary & Score */}
                        <div className="bg-bg-dark text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green-accent opacity-20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                           <div className="flex justify-between items-start mb-4 relative z-10">
                              <div>
                                 <p className="text-gray-400 text-xs font-bold uppercase mb-1">{t.score}</p>
                                 <div className="text-4xl font-extrabold flex items-center gap-2">
                                    {reportData.score}
                                    <span className="text-lg font-normal text-gray-400">/100</span>
                                 </div>
                              </div>
                              <div className="text-4xl">{reportData.score > 80 ? '🏆' : reportData.score > 50 ? '⚖️' : '⚠️'}</div>
                           </div>
                           <p className="text-sm text-gray-300 relative z-10">{reportData.summary}</p>
                        </div>

                        {/* Good Choices */}
                        <div>
                           <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5 text-primary-green-accent" />
                              {t.goodChoices}
                           </h3>
                           <div className="space-y-3">
                              {reportData.goodChoices?.map((item, i) => (
                                 <div key={i} className="bg-primary-green/20 p-4 rounded-2xl flex gap-4 items-start">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <div>
                                       <h4 className="font-bold text-sm text-green-900">{item.title}</h4>
                                       <p className="text-xs text-green-800 opacity-80 mt-1">{item.description}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Improvements */}
                        <div>
                           <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                              <ExclamationCircleIcon className="w-5 h-5 text-accent-orange" />
                              {t.improvements}
                           </h3>
                           <div className="space-y-3">
                              {reportData.improvements?.map((item, i) => (
                                 <div key={i} className="bg-accent-orange/10 p-4 rounded-2xl flex gap-4 items-start">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <div>
                                       <h4 className="font-bold text-sm text-orange-900">{item.title}</h4>
                                       <p className="text-xs text-orange-800 opacity-80 mt-1">{item.description}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <button onClick={handleGenerateReport} className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                           <ArrowPathIcon className="w-5 h-5" /> Regenerate Analysis
                        </button>
                     </div>
                  ) : (
                     <div className="text-center py-20 text-gray-400">
                        <p>No analysis available.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* RECORDING OVERLAY */}
      {(isRecording || isLiveMode) && (
        <div className={`fixed inset-0 z-50 bg-[#F8F8F8] flex flex-col items-center justify-center transition-opacity duration-300 ${isMicClosing ? 'opacity-0' : 'opacity-100'}`}>
            <button onClick={isLiveMode ? stopLiveSession : toggleRecording} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm"><ChevronLeftIcon className="w-6 h-6"/></button>
            <button className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm"><EllipsisHorizontalIcon className="w-6 h-6"/></button>
            
            <div className="text-center mb-10">
               <h2 className="text-2xl font-bold mb-2">{isLiveMode ? "Gemini Live" : t.listening}</h2>
               <p className="text-gray-400">Try saying: "I ate a banana and coffee"</p>
            </div>

            {/* Liquid Animation Wrapper */}
            <div className="relative w-64 h-64 mb-10">
                <div className="absolute inset-0 bg-accent-orange/20 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-4 bg-accent-orange/30 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-accent-orange rounded-full flex items-center justify-center shadow-2xl shadow-accent-orange/40 transform transition-transform duration-300 scale-110">
                        <MicrophoneIcon className="w-14 h-14 text-white" />
                    </div>
                </div>
            </div>

            {/* Waveform */}
            <div className="h-16 flex items-end gap-1 mb-12">
               {waveform.map((val, i) => (
                  <div key={i} className="w-2 bg-text-dark rounded-full transition-all duration-75" style={{ height: `${val}px` }}></div>
               ))}
            </div>

            <button onClick={isLiveMode ? stopLiveSession : toggleRecording} className="bg-bg-dark text-white px-10 py-4 rounded-full font-bold flex items-center gap-2">
               <StopIcon className="w-5 h-5" /> Stop
            </button>
        </div>
      )}

      {/* CAMERA OVERLAY */}
      {showCamera && !analysisResult && (
         <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="absolute top-0 w-full p-6 flex justify-between z-10 text-white">
               <button onClick={() => setShowCamera(false)}><XMarkIcon className="w-8 h-8"/></button>
               <span className="font-bold">Scan Food</span>
               <div className="w-8"></div>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover" />
            
            {/* Scanner Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent-orange rounded-tl-xl -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent-orange rounded-tr-xl -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-orange rounded-bl-xl -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent-orange rounded-br-xl -mb-1 -mr-1"></div>
               </div>
            </div>

            <div className="bg-black p-8 flex justify-center pb-12">
               <button onClick={captureImage} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300">
                  <div className="w-16 h-16 bg-accent-orange rounded-full border-2 border-white"></div>
               </button>
            </div>
         </div>
      )}

      {/* RESULT / EDIT OVERLAY */}
      {(analysisResult || showManualAdd) && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-[#F8F8F8] w-full sm:max-w-md h-[90vh] sm:h-auto sm:rounded-4xl rounded-t-4xl overflow-hidden flex flex-col relative animate-float-up shadow-2xl">
               
               {/* Header Image Placeholder */}
               <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={analysisResult ? "https://source.unsplash.com/random/800x600/?food" : "https://source.unsplash.com/random/800x600/?cooking"} 
                    className="w-full h-full object-cover" 
                    alt="food"
                  />
                  <button onClick={() => {setAnalysisResult(null); setShowManualAdd(false); setEditingItem(null);}} className="absolute top-4 left-4 p-2 bg-white/50 backdrop-blur rounded-full">
                     <ChevronLeftIcon className="w-6 h-6 text-black"/>
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 -mt-6 bg-[#F8F8F8] rounded-t-4xl relative z-10">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
                  
                  {analysisResult ? (
                     <>
                        <h2 className="text-2xl font-bold mb-1">Scanned Result</h2>
                        <p className="text-gray-500 mb-6">Verify the detected items</p>
                        <div className="space-y-4 mb-6">
                           {analysisResult.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-3xl flex justify-between items-center shadow-sm">
                                 <div className="flex items-center gap-4">
                                    <span className="text-3xl">{item.visualEmoji}</span>
                                    <div>
                                       <h4 className="font-bold text-lg">{item.foodName}</h4>
                                       <div className="flex gap-2 text-xs text-gray-400">
                                            <span>{item.estimatedWeight} • {item.calories} kcal</span>
                                            {item.estimatedCost && <span className="text-green-600 font-bold">{item.estimatedCost} {item.currency}</span>}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </>
                  ) : (
                     /* Manual Add Form */
                     <form onSubmit={handleManualAdd}>
                        <h2 className="text-2xl font-bold mb-6">{t.manualAdd}</h2>
                        <input name="name" placeholder={t.foodName} className="w-full p-4 bg-white rounded-2xl mb-4 shadow-sm" required />
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div className="bg-primary-purple/20 p-4 rounded-2xl">
                              <label className="text-xs text-primary-purple font-bold uppercase">{t.calories}</label>
                              <input name="calories" type="number" className="w-full bg-transparent text-xl font-bold outline-none" placeholder="0" />
                           </div>
                           <div className="bg-primary-yellow/20 p-4 rounded-2xl">
                              <label className="text-xs text-primary-yellow font-bold uppercase">{t.carbs}</label>
                              <input name="carbs" type="number" className="w-full bg-transparent text-xl font-bold outline-none" placeholder="0g" />
                           </div>
                        </div>
                        {/* Hidden inputs for demo simplicity */}
                        <div className="hidden">
                           <input name="protein" defaultValue={0} /><input name="fat" defaultValue={0} /><input name="fiber" defaultValue={0} />
                        </div>
                        <button type="submit" className="w-full bg-accent-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-accent-orange/30 mt-4">{t.add}</button>
                     </form>
                  )}

                  {/* Health Score Card (Static for design match) */}
                  <div className="bg-bg-dark text-white p-5 rounded-3xl mt-6">
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                           <SparklesIcon className="w-5 h-5 text-primary-green-accent" />
                           <span className="font-bold">{t.healthScore}</span>
                        </div>
                        <span className="text-sm text-gray-400">70%</span>
                     </div>
                     <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-4">
                        <div className="w-[70%] h-full bg-primary-green-accent rounded-full"></div>
                     </div>
                     <div className="flex gap-2">
                        <div className="flex-1 bg-white/10 p-3 rounded-2xl text-center">
                           <p className="text-xs text-primary-purple font-bold">{t.calories}</p>
                           <p className="font-bold text-lg">615 <span className="text-xs font-normal text-gray-400">g</span></p>
                        </div>
                        <div className="flex-1 bg-white/10 p-3 rounded-2xl text-center">
                           <p className="text-xs text-primary-yellow font-bold">{t.carbs}</p>
                           <p className="font-bold text-lg">93 <span className="text-xs font-normal text-gray-400">g</span></p>
                        </div>
                     </div>
                     <div className="flex gap-3 mt-4">
                        <button className="flex-1 py-3 bg-white text-black font-bold rounded-xl text-sm">{t.fixResults}</button>
                        <button onClick={analysisResult ? confirmLog : undefined} className="flex-1 py-3 bg-accent-orange text-white font-bold rounded-xl text-sm">{t.addToLog}</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Analyzing Overlay */}
      {isAnalyzing && (
         <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center text-white">
            <div className="w-24 h-24 border-t-4 border-l-4 border-accent-orange rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold">{t.analyzing}</h3>
         </div>
      )}

    </div>
  );
}