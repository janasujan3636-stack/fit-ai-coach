import React, { useState, useEffect, useRef } from 'react';
import { Home, FitnessCenter, Restaurant, History, PlayCircleOutline, Timer, EmojiEvents, Save, CheckCircle, ListAlt, Star, Person, Close, Menu, LocalFireDepartment, ShowChart, TrendingUp, TrendingDown, Fastfood, LocalDrink, Info, CheckBoxOutlineBlank, CheckBox, SmartToy, Send } from '@mui/icons-material';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
 const db = getFirestore(app);
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';

const EXERCISE_DATA = {
  home: [
    { name: "Pushups", avoid: ["Shoulder"], tip: "Keep elbows at 45 degrees", embedId: "IODxDxX7oi4", burn: 5 },
    { name: "Bodyweight Squats", avoid: ["Knee"], tip: "Keep chest up, weight on heels", embedId: "aclHkVaku9U", burn: 7 },
    { name: "Plank", avoid: ["Back"], tip: "Straight line from head to heels", embedId: "pvIjsGZXp_w", burn: 4 },
    { name: "Glute Bridges", avoid: ["Back"], tip: "Squeeze glutes at the top", embedId: "wPM8icPu6H8", burn: 5 },
    { name: "Mountain Climbers", avoid: ["Shoulder", "Back"], tip: "Drive knees toward chest", embedId: "nmwgirgXLYM", burn: 10 },
    { name: "Crunches", avoid: ["Back"], tip: "Lift shoulders, not neck", embedId: "Xyd_fa5zoEU", burn: 4 },
    { name: "Diamond Pushups", avoid: ["Shoulder"], tip: "Form a diamond with hands", embedId: "J0DnG1_S92I", burn: 6 }
  ],
  travel: [
    { name: "Burpees", avoid: ["Knee", "Shoulder"], tip: "Explosive movement", embedId: "dZfeV7UAqS4", burn: 15 },
    { name: "Lunges", avoid: ["Knee"], tip: "Back knee almost touches floor", embedId: "QOVaHwm-Q6U", burn: 9 },
    { name: "Shadow Boxing", avoid: ["Shoulder"], tip: "Hands up, light feet", embedId: "7O_L9n2841M", burn: 8 },
    { name: "Wall Sit", avoid: ["Knee"], tip: "90-degree angle at knees", embedId: "y-wV4Venusw", burn: 5 },
    { name: "Superman", avoid: ["Back"], tip: "Lift chest and legs simultaneously", embedId: "z6PJMT2y8GQ", burn: 4 },
    { name: "Jumping Jacks", avoid: ["Knee"], tip: "Land softly on balls of feet", embedId: "nGaXj3kkmrU", burn: 8 }
  ],
  gym: [
    { name: "Bench Press", avoid: ["Shoulder"], tip: "Bar to mid-chest level", embedId: "rT7DgCr-3pg", burn: 8 },
    { name: "Deadlifts", avoid: ["Back"], tip: "Drive through heels, neutral spine", embedId: "op9kVnSso6Q", burn: 12 },
    { name: "Lat Pulldowns", avoid: ["Shoulder"], tip: "Pull to upper chest", embedId: "CAwf7n6Luuc", burn: 7 },
    { name: "Leg Press", avoid: ["Knee"], tip: "Don't lock your knees at the top", embedId: "IZxyjW7MPJQ", burn: 9 },
    { name: "Shoulder Press", avoid: ["Shoulder"], tip: "Don't arch your back", embedId: "2yjwxtZ_kNo", burn: 8 },
    { name: "Bicep Curls", avoid: [], tip: "Keep elbows pinned to sides", embedId: "ykJmrZ5v0Oo", burn: 5 },
    { name: "Tricep Extensions", avoid: ["Shoulder"], tip: "Full extension at the top", embedId: "nRiJVZDpdL0", burn: 5 },
    { name: "Incline Bench", avoid: ["Shoulder"], tip: "Focus on upper chest", embedId: "SrqOu55lr6A", burn: 8 },
    { name: "Seated Rows", avoid: ["Back"], tip: "Squeeze shoulder blades", embedId: "GZbfZ033f74", burn: 7 }
  ]
};

const FOOD_DB = {
  breakfast: { "Oats": 150, "Egg Whites": 17, "Whole Egg": 78, "Banana": 89, "Peanut Butter": 190, "Milk": 120, "Poha": 180, "Apple": 95, "Almonds": 7 },
  lunch: { "Chicken Breast": 165, "Paneer": 265, "Dal": 150, "Roti": 104, "Brown Rice": 111, "Curd": 60, "Soya Chunks": 345, "Salad": 25, "Fish": 200, "Chickpeas": 164 },
  dinner: { "Boiled Eggs": 78, "Tofu": 76, "Sweet Potato": 86, "Quinoa": 120, "Mixed Veg": 100, "Chicken Soup": 150, "Broccoli": 34, "Cottage Cheese": 98, "Soy Milk": 100 }
};

const WEEKLY_PLAN = {
  beginner: {
    Monday: { muscle: "Full Body (Light)", diet: "High Protein, Moderate Carbs", exercises: "Pushups, Bodyweight Squats" },
    Tuesday: { muscle: "Core & Stability", diet: "Low Carbs, High Fiber", exercises: "Plank, Crunches" },
    Wednesday: { muscle: "Active Recovery", diet: "Maintenance Calories", exercises: "Light Stretching, Walking" },
    Thursday: { muscle: "Upper Body Focus", diet: "High Protein", exercises: "Pushups, Superman" },
    Friday: { muscle: "Lower Body Focus", diet: "High Carbs (Energy)", exercises: "Bodyweight Squats, Glute Bridges" },
    nextLevel: "Reach 500 Fitness Points to unlock Intermediate Phase."
  },
  intermediate: {
    Monday: { muscle: "Chest & Triceps", diet: "Caloric Surplus (Muscle Building)", exercises: "Bench Press, Tricep Extensions" },
    Tuesday: { muscle: "Back & Biceps", diet: "High Protein, Clean Fats", exercises: "Deadlifts, Bicep Curls" },
    Wednesday: { muscle: "Legs & Core", diet: "High Carbs", exercises: "Leg Press, Mountain Climbers" },
    Thursday: { muscle: "Shoulders", diet: "High Protein", exercises: "Shoulder Press, Lateral Raises" },
    Friday: { muscle: "Full Body HIIT", diet: "Low Carbs, High Protein", exercises: "Burpees, Jumping Jacks" },
    nextLevel: "Reach 1500 Fitness Points to unlock Pro Phase."
  },
  pro: {
    Monday: { muscle: "Push Day (Heavy)", diet: "High Carb, High Protein", exercises: "Heavy Bench, Incline Bench" },
    Tuesday: { muscle: "Pull Day (Heavy)", diet: "High Protein, Clean Fats", exercises: "Heavy Deadlifts, Seated Rows" },
    Wednesday: { muscle: "Leg Day (Heavy)", diet: "Max Carbs for Recovery", exercises: "Heavy Leg Press, Lunges" },
    Thursday: { muscle: "Push Day (Hypertrophy)", diet: "High Protein", exercises: "Diamond Pushups, Tricep Ext" },
    Friday: { muscle: "Pull Day (Hypertrophy)", diet: "Balanced Macros", exercises: "Lat Pulldowns, Bicep Curls" },
    nextLevel: "You are at the top level! Keep maintaining your Pro status."
  }
};

const MOTIVATION_QUOTES = [
  "Sweat is just fat crying. Keep it up!",
  "Consistency is key. You nailed it today.",
  "Every rep counts. Proud of you!",
  "Fuel your body, crush your goals!",
  "You're one step closer to your dream physique.",
  "Discipline bridges the gap between goals and accomplishment."
];

const COLORS = { bg: '#000000', card: '#0d0d0d', text: '#ffffff', textDim: '#666666', primary: '#00e676', border: '#1e1e1e', inputBg: '#111111', danger: '#ff4444', accent: '#00e676', muted: '#333333' };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #000;
    --card: #0d0d0d;
    --border: #1e1e1e;
    --text: #fff;
    --dim: #666;
    --input: #111;
  }
  body { background: #000; }
  .fitai-app {
    background: #000;
    color: #fff;
    min-height: 100vh;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    padding-bottom: 90px;
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }
  @media (min-width: 768px) {
    .fitai-app { max-width: 720px; padding-bottom: 100px; }
    .grid-2 { grid-template-columns: 1fr 1fr !important; }
    .grid-3 { grid-template-columns: 1fr 1fr 1fr !important; }
  }
  @media (min-width: 1024px) {
    .fitai-app { max-width: 900px; }
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

  /* TYPOGRAPHY */
  .display-font { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
  .mono-font { font-family: 'Space Mono', monospace; }

  /* INPUTS */
  input, select {
    background: var(--input) !important;
    color: #fff !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    padding: 14px 16px !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 14px !important;
    width: 100%;
    outline: none !important;
    transition: border-color 0.2s;
  }
  input:focus, select:focus { border-color: #00e676 !important; }
  input::placeholder { color: #444 !important; }
  select option { background: #111; color: #fff; }

  /* BUTTONS */
  .btn-primary {
    background: #00e676;
    color: #000;
    border: none;
    border-radius: 8px;
    padding: 16px 24px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: all 0.2s ease;
    width: 100%;
  }
  .btn-primary:hover { background: #00c853; transform: translateY(-1px); }
  .btn-outline {
    background: transparent;
    color: #aaa;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 10px 20px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-outline:hover, .btn-outline.active { background: #00e676; color: #000; border-color: #00e676; }
  .btn-ghost {
    background: transparent;
    color: #666;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  .btn-ghost.active { color: #00e676; }

  /* CARDS */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: #1a3a2a; }
  .card-featured {
    background: linear-gradient(135deg, #001a0d 0%, #003320 100%);
    border: 1px solid #00e67633;
    color: #fff;
    border-radius: 16px;
    padding: 24px;
  }

  /* LABEL */
  .label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #555;
  }
  .label-white { color: rgba(0,230,118,0.5); }

  /* NAV */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 560px;
    background: rgba(0,0,0,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid #1a1a1a;
    display: flex;
    justify-content: space-around;
    padding: 12px 0 16px;
    z-index: 1000;
  }
  @media (min-width: 768px) {
    .bottom-nav { max-width: 720px; padding: 14px 0 18px; }
  }
  @media (min-width: 1024px) {
    .bottom-nav { max-width: 900px; }
  }
  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 16px;
    color: #444;
    font-size: 10px;
    font-family: 'Space Mono', monospace;
    letter-spacing: 1px;
    transition: color 0.2s;
  }
  .nav-btn.active { color: #00e676; }
  .nav-btn svg { font-size: 22px !important; }

  /* SIDEBAR */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: min(320px, 85vw);
    height: 100%;
    background: #000;
    border-right: 1px solid #1e1e1e;
    z-index: 2000;
    padding: 40px 28px;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  }
  .sidebar.closed { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 0;
    border-bottom: 1px solid #111;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    transition: color 0.2s;
    color: #aaa;
  }
  .sidebar-item:hover { color: #00e676; }

  /* HEADER */
  .app-header {
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #111;
    position: sticky;
    top: 0;
    background: rgba(0,0,0,0.95);
    backdrop-filter: blur(20px);
    z-index: 100;
  }
  .streak-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #001a0d;
    border: 1px solid #00e67633;
    border-radius: 100px;
    padding: 8px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #00e676;
  }

  /* AUTH */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 24px;
  }
  .auth-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(72px, 15vw, 120px);
    letter-spacing: 8px;
    line-height: 1;
    color: #00e676;
  }

  /* EXERCISE CARD */
  .ex-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .ex-card:hover { border-color: #1a3a2a; }

  /* PROGRESS BAR */
  .progress-track {
    width: 100%;
    height: 3px;
    background: #1e1e1e;
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #00e676;
    border-radius: 2px;
    transition: width 0.8s ease;
  }

  /* STATS GRID */
  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (min-width: 600px) {
    .stat-grid { grid-template-columns: 1fr 1fr 1fr 1fr; }
  }

  /* CHECKLIST */
  .check-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid #111;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .check-item:last-child { border-bottom: none; }

  /* WATER DOTS */
  .water-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid #333;
    transition: all 0.3s ease;
  }
  .water-dot.filled {
    background: #00e676;
    border-color: #00e676;
  }

  /* TAGS */
  .tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 11px;
    font-family: 'Space Mono', monospace;
    letter-spacing: 1px;
    border: 1px solid #2a2a2a;
    color: #888;
    background: #111;
  }
  .tag.active { background: #00e676; color: #000; border-color: #00e676; }

  /* INJURY TOGGLE */
  .injury-btn {
    padding: 10px 20px;
    border-radius: 100px;
    border: 1px solid #2a2a2a;
    background: #111;
    color: #888;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .injury-btn.active { background: #00e676; color: #000; border-color: #00e676; }
  .injury-btn.danger { background: #1a0000; color: #ff4444; border-color: #ff2222; }

  /* CHART BAR */
  .chart-bar {
    flex: 1;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #1a2a1a;
    min-height: 4px;
  }
  .chart-bar:hover { background: #2a4a2a; }
  .chart-bar.selected { background: #00e676; box-shadow: 0 0 12px rgba(0,230,118,0.4); }

  /* CHAT */
  .chat-bubble {
    padding: 14px 18px;
    border-radius: 20px;
    font-size: 14px;
    line-height: 1.6;
    max-width: 82%;
  }
  .chat-bubble.user { background: #00e676; color: #000; border-radius: 20px 20px 4px 20px; align-self: flex-end; }
  .chat-bubble.ai { background: #0d1a11; color: #fff; border: 1px solid #1a3a22; border-radius: 20px 20px 20px 4px; align-self: flex-start; }

  /* TIER BADGE */
  .tier-badge {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    padding: 4px 10px;
    border-radius: 4px;
    text-transform: uppercase;
    background: #00e676;
    color: #000;
  }

  /* DIVIDER */
  .divider { height: 1px; background: #111; margin: 20px 0; }

  /* FADE IN */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.4s ease forwards; }

  /* PULSE */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .typing-dot { animation: pulse 1.2s ease infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
`;

export default function App() {
  const [view, setView] = useState('auth');
  const [activeTab, setActiveTab] = useState('home');
 // --- ADDED: AI CHATBOT STATES ---
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hi! I'm FitAI. Ask me about your workouts, form, or nutrition!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom whenever a new message appears
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);
  const [selectedGraphDay, setSelectedGraphDay] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gymMode, setGymMode] = useState('gym');
  // --- ADDED: AI TRACKER STATES ---
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeAiExercise, setActiveAiExercise] = useState(null);
  const [aiReps, setAiReps] = useState(0);
  const [aiFeedback, setAiFeedback] = useState("Align your body in the camera...");

  // --- ADDED: FIREBASE STATES ---
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Signup
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  // --- ADDED: LISTEN FOR AUTH CHANGES & FETCH DATA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch User Data
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(prev => ({
            ...(data.profile || prev),
            streak: data.streak || 0,
            lastWorkoutDate: data.lastWorkoutDate || null
          }));
          setFitnessScore(data.fitnessScore || 0);
          setPbs(data.pbs || {});
          setTargetWeight(data.targetWeight || 75);
          setDailyCalsGoal(data.dailyCalsGoal || 2500);
          
          // Reset daily trackers if it's a new day
          if (data.lastLoginDate !== today) {
            setWaterGlasses(0);
            setChecklist({ water: false, stretch: false, workout: false });
            await updateDoc(doc(db, 'users', currentUser.uid), { lastLoginDate: today });
          } else {
            setWaterGlasses(data.waterGlasses || 0);
            setChecklist(data.checklist || { water: false, stretch: false, workout: false });
          }
          
          // Fetch History & Food (Simplified for brevity)
          const historySnap = await getDocs(query(collection(db, 'users', currentUser.uid, 'history'), orderBy('timestamp', 'desc')));
          setHistory(historySnap.docs.map(d => d.data()));
          
          const foodSnap = await getDocs(query(collection(db, 'users', currentUser.uid, 'foodJournal'), orderBy('timestamp', 'desc')));
          setFoodJournal(foodSnap.docs.map(d => d.data()));
          
          setView('app');
        } else {
          setView('onboarding'); // New user needs setup
        }
      } else {
        setUser(null);
        setView('auth');
      }
    });
    return () => unsubscribe();
  }, [today]);
  

// --- REAL AI TRACKING REPS ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const repData = useRef({ isDown: false, count: 0 });

// --- ADDED: VOICE FEEDBACK LOGIC ---
  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- ADDED: AUTO-SAVE AI TRACKER LOGIC ---
  const handleStopAiTracker = () => {
    if (activeAiExercise && aiReps > 0) {
      // Automatically fill the input boxes in the Gym Tab
      handleSessionUpdate(activeAiExercise.name, 'reps', aiReps);
      
      // If Sets or Weight are empty, give them a default starting value
      if (!currentSessionDetails[activeAiExercise.name]?.sets) {
        handleSessionUpdate(activeAiExercise.name, 'sets', 1);
      }
      
      speakFeedback(`Workout saved. You completed ${aiReps} reps.`);
      alert(`✅ Auto-filled ${aiReps} reps for ${activeAiExercise.name}!`);
    } else {
      window.speechSynthesis.cancel();
    }
    setAiModalOpen(false);
  };

// --- ADDED: REAL AI POSE DETECTION & AUTO REP COUNTING ---
  useEffect(() => {
    let detector;
    let animationFrameId;

    // 1. ADD THIS MATH FUNCTION TO CALCULATE JOINT ANGLES
    const calculateAngle = (pointA, pointB, pointC) => {
      if (!pointA || !pointB || !pointC) return 0;
      const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) - Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
      let angle = Math.abs((radians * 180.0) / Math.PI);
      if (angle > 180.0){ 
        angle = 360.0 - angle;
      }
      return angle;
    };

    const runPoseDetection = async () => {
      try {
        setAiFeedback("Loading AI Engine...");
        await tf.ready(); // WAIT FOR TENSORFLOW TO WAKE UP
        
        detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        });
        
        setAiFeedback("AI Ready! Step back into frame.");

        const detect = async () => {
          if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
            const video = videoRef.current;
            const ctx = canvasRef.current.getContext('2d');
            
            const poses = await detector.estimatePoses(video);
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (poses.length > 0) {
              const keypoints = poses[0].keypoints;

              // 1. DRAW SKELETON & LIVE ANGLE DEBUGGER
              const connections = [[5,7], [7,9], [6,8], [8,10], [5,6], [5,11], [6,12], [11,12], [11,13], [13,15], [12,14], [14,16]];
              ctx.strokeStyle = '#00e676'; // Neon Green lines
              ctx.lineWidth = 4;
              connections.forEach(([i, j]) => {
                if (keypoints[i].score > 0.3 && keypoints[j].score > 0.3) {
                  ctx.beginPath(); ctx.moveTo(keypoints[i].x, keypoints[i].y); ctx.lineTo(keypoints[j].x, keypoints[j].y); ctx.stroke();
                }
              });

              ctx.fillStyle = '#ffd700'; // Yellow Dots
              keypoints.forEach(kp => {
                if (kp.score > 0.3) {
                  ctx.beginPath(); ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI); ctx.fill();
                }
              });

              // --- NEW: PRINT LIVE ANGLES ON SCREEN ---
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 18px Arial';
              
              // Print Left Elbow Angle
              if (keypoints[5]?.score > 0.3 && keypoints[7]?.score > 0.3 && keypoints[9]?.score > 0.3) {
                const elbowAng = calculateAngle(keypoints[5], keypoints[7], keypoints[9]);
                ctx.fillText(`${Math.round(elbowAng)}°`, keypoints[7].x + 15, keypoints[7].y);
              }
              // Print Left Knee Angle
              if (keypoints[11]?.score > 0.3 && keypoints[13]?.score > 0.3 && keypoints[15]?.score > 0.3) {
                const kneeAng = calculateAngle(keypoints[11], keypoints[13], keypoints[15]);
                ctx.fillText(`${Math.round(kneeAng)}°`, keypoints[13].x + 15, keypoints[13].y);
              }

              // 2. COMPREHENSIVE AI EXERCISE TRACKER (Covers all DB Exercises)
              const exName = activeAiExercise?.name?.toLowerCase() || "";

              // Grab the Left-side joints (standard for mirrored webcams)
              const nose = keypoints[0];
              const shoulder = keypoints[5];
              const elbow = keypoints[7];
              const wrist = keypoints[9];
              const hip = keypoints[11];
              const knee = keypoints[13];
              const ankle = keypoints[15];

              // ==========================================
              // GROUP 1: SQUATTING (Squats, Lunges, Leg Press)
              // Tracks: Hip -> Knee -> Ankle
              // ==========================================
              if (exName.includes('squat') || (exName.includes('leg') && exName.includes('press')) || exName.includes('lunge')) {
                if (hip?.score > 0.3 && knee?.score > 0.3 && ankle?.score > 0.3) {
                  const kneeAngle = calculateAngle(hip, knee, ankle);
                  if (kneeAngle < 100) { // Deep bend
                    if (!repData.current.isDown) { repData.current.isDown = true; setAiFeedback("Good depth, drive up!"); }
                  } else if (kneeAngle > 160) { // Standing up fully
                    if (repData.current.isDown) {
                      repData.current.isDown = false; repData.current.count += 1;
                      setAiReps(repData.current.count); speakFeedback(repData.current.count.toString());
                      setAiFeedback("Perfect lower body rep!");
                    }
                  } else if (repData.current.isDown && kneeAngle > 110 && kneeAngle < 140) {
                     setAiFeedback("Don't stop halfway, push up!");
                  }
                } else setAiFeedback("Step back! I need to see your hips and knees.");
              }

              // ==========================================
              // GROUP 2: PUSHING (Pushups, Bench, Shoulder Press, Triceps, Diamond)
              // Tracks: Shoulder -> Elbow -> Wrist
              // ==========================================
              else if (exName.includes('push') || exName.includes('bench') || exName.includes('shoulder') || exName.includes('tricep')) {
                if (shoulder?.score > 0.3 && elbow?.score > 0.3 && wrist?.score > 0.3) {
                  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
                  if (elbowAngle < 90) { // Arms fully bent
                    if (!repData.current.isDown) { repData.current.isDown = true; setAiFeedback("Good stretch, push away!"); }
                  } else if (elbowAngle > 150) { // Arms locked out
                    if (repData.current.isDown) {
                      repData.current.isDown = false; repData.current.count += 1;
                      setAiReps(repData.current.count); speakFeedback(repData.current.count.toString());
                      setAiFeedback("Perfect press!");
                    }
                  } else if (repData.current.isDown && elbowAngle > 100 && elbowAngle < 140) {
                     setAiFeedback("Lock out your elbows!");
                  }
                } else setAiFeedback("Adjust camera! I need to see your arms fully.");
              }

              // ==========================================
              // GROUP 3: PULLING (Bicep Curls, Lat Pulldowns)
              // Tracks: Shoulder -> Elbow -> Wrist (Reverse Logic)
              // ==========================================
              else if (exName.includes('curl') || exName.includes('pulldown')) {
                if (shoulder?.score > 0.3 && elbow?.score > 0.3 && wrist?.score > 0.3) {
                  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
                  if (elbowAngle < 60) { // Arms fully curled up
                    if (!repData.current.isDown) { repData.current.isDown = true; setAiFeedback("Max contraction, return slowly."); }
                  } else if (elbowAngle > 150) { // Arms extended back down
                    if (repData.current.isDown) {
                      repData.current.isDown = false; repData.current.count += 1;
                      setAiReps(repData.current.count); speakFeedback(repData.current.count.toString());
                      setAiFeedback("Perfect pull!");
                    }
                  }
                } else setAiFeedback("I need to see your elbows and wrists.");
              }

              // ==========================================
              // GROUP 4: HINGING (Deadlifts, Glute Bridges)
              // Tracks: Shoulder -> Hip -> Knee
              // ==========================================
              else if (exName.includes('deadlift') || exName.includes('bridge')) {
                if (shoulder?.score > 0.3 && hip?.score > 0.3 && knee?.score > 0.3) {
                  const hipAngle = calculateAngle(shoulder, hip, knee);
                  if (hipAngle < 110) { // Bent over / hips down
                    if (!repData.current.isDown) { repData.current.isDown = true; setAiFeedback("Keep back straight, drive hips!"); }
                  } else if (hipAngle > 165) { // Standing tall / hips extended
                    if (repData.current.isDown) {
                      repData.current.isDown = false; repData.current.count += 1;
                      setAiReps(repData.current.count); speakFeedback(repData.current.count.toString());
                      setAiFeedback("Great hip extension!");
                    }
                  }
                } else setAiFeedback("Step back! I need to see your shoulders to knees.");
              }

              // ==========================================
              // GROUP 5: FULL BODY / CARDIO (Jumping Jacks, Burpees, Crunches, Climbers)
              // Tracks: Wrist position relative to head/hips
              // ==========================================
              else if (exName.includes('crunch') || exName.includes('burpee') || exName.includes('jack') || exName.includes('climber')) {
                if (wrist?.score > 0.3 && hip?.score > 0.3 && nose?.score > 0.3) {
                   if (wrist.y < nose.y) { // Hands go up (Peak of jumping jack/burpee)
                      if (!repData.current.isDown) { repData.current.isDown = true; setAiFeedback("Good reach!"); }
                   } else if (wrist.y > hip.y) { // Hands go down
                      if (repData.current.isDown) {
                        repData.current.isDown = false; repData.current.count += 1;
                        setAiReps(repData.current.count); speakFeedback(repData.current.count.toString());
                        setAiFeedback("Keep the rhythm!");
                      }
                   }
                } else setAiFeedback("Make sure your full body is in the frame!");
              }

              // ==========================================
              // GROUP 6: TIMED ISOMETRICS (Plank, Wall Sit, Superman, Boxing)
              // No reps required, just form checks.
              // ==========================================
              else if (exName.includes('plank') || exName.includes('sit') || exName.includes('superman') || exName.includes('boxing')) {
                 setAiFeedback("Hold steady! This is a timed exercise. Keep breathing.");
              }

              // ==========================================
              // FALLBACK (Just in case)
              // ==========================================
              else {
                  setAiFeedback(`Auto-tracker not optimized for ${exName}. Use manual input.`);
              }
            }
          }
          animationFrameId = requestAnimationFrame(detect);
        };
        detect();
      } catch (error) {
        console.error("AI Load Error:", error);
        setAiFeedback("AI Error! Check Console (F12).");
      }
    };

    if (aiModalOpen) {
      repData.current = { isDown: false, count: 0 }; 
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            runPoseDetection(); 
          };
        }
      }).catch(err => {
        console.error(err);
        setAiFeedback("Camera permission denied.");
      });
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    };
  }, [aiModalOpen]);

  // --- ADDED: FITNESS SCORE STATE ---
  const [fitnessScore, setFitnessScore] = useState(0);

  // --- ADDED: REWARD & LEVEL UP SYSTEM ---
  const awardPoints = (taskName, points) => {
    const newScore = fitnessScore + points;
    setFitnessScore(newScore);
    
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    let levelMsg = "";
    let newLevel = userData.level;
    
    if (userData.level === 'beginner' && newScore >= 500) {
      newLevel = 'intermediate';
      levelMsg = "\n\n🎉 LEVEL UP! You are now an INTERMEDIATE athlete!";
    } else if (userData.level === 'intermediate' && newScore >= 1500) {
      newLevel = 'pro';
      levelMsg = "\n\n🏆 LEVEL UP! You are now a PRO athlete!";
    }
    
    if (newLevel !== userData.level) setUserData({...userData, level: newLevel});
    alert(`+${points} Points for ${taskName}!\n\n"${randomQuote}"${levelMsg}`);
  };
  
  const [historyActiveTab, setHistoryActiveTab] = useState('Day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [userData, setUserData] = useState({ name: "", weight: "", height: "", injuries: [], level: "beginner", streak: 0 });
  const [targetWeight, setTargetWeight] = useState(75);
  const [dailyCalsGoal, setDailyCalsGoal] = useState(2500); // ADDED: For Smart Goals
  
  const [waterGlasses, setWaterGlasses] = useState(0); // ADDED: Water tracker
  const [checklist, setChecklist] = useState({ water: false, stretch: false, workout: false }); // ADDED: Checklist
  
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pbs, setPbs] = useState({});
  const [currentSessionDetails, setCurrentSessionDetails] = useState({});
  const [history, setHistory] = useState([]);
  const [foodJournal, setFoodJournal] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  

  useEffect(() => {
    let interval;
    if (isTimerRunning) interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleInjury = (part) => {
    setUserData(prev => ({ ...prev, injuries: prev.injuries.includes(part) ? prev.injuries.filter(i => i !== part) : [...prev.injuries, part] }));
  };

  const handleSessionUpdate = (exName, field, value) => {
    setCurrentSessionDetails(prev => ({ ...prev, [exName]: { ...prev[exName], [field]: value } }));
  };

  const getVolumeSuggestion = (level) => {
    if (level === 'pro') return "4 Sets × 12-15 Reps";
    if (level === 'intermediate') return "3 Sets × 10-12 Reps";
    return "2 Sets × 8-10 Reps";
  };

  const filteredEx = EXERCISE_DATA[gymMode].filter(ex => !ex.avoid.some(i => userData.injuries.includes(i)));
  const todaysCalsIntake = foodJournal.filter(f => f.date === today).reduce((sum, f) => sum + f.kcal, 0);
  const todaysCalsBurnt = history.filter(h => h.date === today).reduce((sum, h) => sum + (h.burnt || 0), 0);

const saveWorkout = async () => {
    let totalBurnt = 0;
    const doneWorkoutsStrings = [];
    const doneWorkoutsData = [];
    
    Object.entries(currentSessionDetails)
      .filter(([name, data]) => data.weight || data.sets || data.reps)
      .forEach(([name, data]) => {
        const baseEx = [...EXERCISE_DATA.gym, ...EXERCISE_DATA.home, ...EXERCISE_DATA.travel].find(e => e.name === name) || { burn: 5 };
        totalBurnt += (baseEx.burn * (data.sets || 1)); 
        doneWorkoutsStrings.push(`${name} (${data.sets || 0}s × ${data.reps || 0}r @ ${data.weight || 0}kg)`);
        doneWorkoutsData.push({ name, sets: Number(data.sets)||0, reps: Number(data.reps)||0, weight: Number(data.weight)||0 });
      });
      
    if (doneWorkoutsStrings.length === 0) return alert("Enter session details to save.");
    
    // --- NEW: STREAK CALCULATION LOGIC ---
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterdayStr = y.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let newStreak = userData.streak || 0;
    if (userData.lastWorkoutDate === yesterdayStr) {
      newStreak += 1; // Worked out yesterday, increase streak!
    } else if (userData.lastWorkoutDate !== today) {
      newStreak = 1; // Missed a day, reset streak to 1
    }

    // --- NEW: ADD DURATION TO WORKOUT DATA ---
    const workoutData = { 
      date: today, 
      timestamp: new Date().getTime(),
      mode: gymMode.toUpperCase(), 
      details: doneWorkoutsStrings, 
      exercises: doneWorkoutsData,      
      exercisesData: doneWorkoutsData, 
      burnt: Math.round(totalBurnt),
      duration: seconds // Saves the timer seconds
    };

    // Save to Firestore
    if (user) {
      await addDoc(collection(db, 'users', user.uid, 'history'), workoutData);
      
      await updateDoc(doc(db, 'users', user.uid), {
        'checklist.workout': true,
        fitnessScore: fitnessScore + 5,
        streak: newStreak,
        lastWorkoutDate: today
      });
    }

    // Update Local State
    setHistory([workoutData, ...history]);
    setChecklist(prev => ({ ...prev, workout: true }));
    setUserData(prev => ({ ...prev, streak: newStreak, lastWorkoutDate: today }));
    awardPoints('Completing a Workout', 5);
    setCurrentSessionDetails({});
    setActiveTab('home');
    
    // Reset Timer
    setSeconds(0);
    setIsTimerRunning(false);
  };
  // --- ADDED: SAVE WATER TO FIREBASE ---
  const handleAddWater = async () => {
    const newWater = waterGlasses + 1;
    setWaterGlasses(newWater); // Instantly update screen
    
    let updatedChecklist = { ...checklist };
    
    // Check if they hit the 8 glass goal for the first time today
    if (newWater === 8 && !checklist.water) {
        updatedChecklist.water = true;
        setChecklist(updatedChecklist);
        awardPoints('Daily Hydration Goal', 2);
    }

    // Save to Firebase
    if (user) {
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                waterGlasses: newWater,
                checklist: updatedChecklist
            });
        } catch (error) {
            console.error("Error saving water to DB", error);
        }
    }
  };
  // --- ADDED: SAVE SMART GOALS TO FIREBASE ---
  const saveGoalsToDatabase = async () => {
    if (!user) return;
    try {
      // Update the targetWeight and dailyCalsGoal in the user's document
      await updateDoc(doc(db, 'users', user.uid), {
        targetWeight: targetWeight,
        dailyCalsGoal: dailyCalsGoal
      });
      alert("Goals Updated Successfully!");
      setActiveTab('home');
    } catch (error) {
      console.error("Error saving goals:", error);
      alert("Failed to save goals.");
    }
  };
  // --- UPGRADED: REAL PERSONALIZED AI LOGIC ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // 1. Put user's message on the screen
    const userText = chatInput;
    const newMessages = [...chatMessages, { role: 'user', text: userText }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsAiTyping(true);

    try {
      // 2. Initialize the AI (You will paste your free key here)
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); 
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 3. THE MAGIC: Feed the user's live database stats into the AI's brain!
      const contextPrompt = `
        You are FitAI, an elite, highly motivating personal trainer. 
        Keep your answers concise, friendly, and under 3 sentences. 
        
        Here is your client's live data from the app database right now:
        - Name: ${userData.name || 'My friend'}
        - Current Weight: ${userData.weight || 0} kg
        - Goal Weight: ${targetWeight} kg
        - Experience Level: ${userData.level}
        - Current Streak: ${userData.streak} days
        - Injuries to strictly avoid: ${userData.injuries.length > 0 ? userData.injuries.join(', ') : 'None'}
        - Calories Eaten Today: ${todaysCalsIntake} kcal (Target: ${dailyCalsGoal})
        - Calories Burnt Today: ${todaysCalsBurnt} kcal
        
        Using ONLY this context to personalize your advice, respond to the client's message: "${userText}"
      `;

      // 4. Send the prompt to the AI and wait for the custom response
      const result = await model.generateContent(contextPrompt);
      const aiResponse = result.response.text();

      // 5. Put the AI's response on the screen
      setChatMessages([...newMessages, { role: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages([...newMessages, { role: 'ai', text: "Whoops! My AI brain lost connection. Did you add your API key?" }]);
    }
    
    setIsAiTyping(false);
  };

  // --- ADDED: SAVE FOOD LOG TO FIREBASE ---
  const logFoodToDatabase = async (mealType, foodName, kcalVal) => {
    if (!user) return;

    const foodEntry = {
      date: today,
      timestamp: new Date().getTime(),
      name: foodName,
      kcal: kcalVal,
      meal: mealType
    };

    // 1. Instantly update the screen
    setFoodJournal([foodEntry, ...foodJournal]);

    // 2. Save it permanently to Firestore
    try {
      await addDoc(collection(db, 'users', user.uid, 'foodJournal'), foodEntry);
    } catch (error) {
      console.error("Error saving food:", error);
      alert("Failed to save food log to database.");
    }
  };

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Auth Error: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };
  const saveProfile = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        profile: userData,
        fitnessScore,
        targetWeight,
        dailyCalsGoal,
        lastLoginDate: today,
      }, { merge: true });
      setView('app');
    } catch (error) {
      console.error("Error saving profile", error);
    }
  };
  // --- ADDED: SAVE PROFILE & TRACK WEIGHT CHANGES ---
  const saveProfileChanges = async () => {
    if (!user) return;
    
    // Fetch the database to see what your weight WAS before you just typed the new one
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    let pastWeight = userData.lastWeight || userData.weight; 
    
    if (docSnap.exists() && docSnap.data().profile?.weight) {
        const dbWeight = docSnap.data().profile.weight;
        // If the weight in the database is different from what is in the input box right now
        if (dbWeight !== userData.weight) {
            pastWeight = dbWeight; // Shift the old database weight into the 'lastWeight' slot
        }
    }

    const updatedProfile = { ...userData, lastWeight: pastWeight };

    await updateDoc(docRef, { profile: updatedProfile });
    setUserData(updatedProfile);
    alert("Profile and Weight Updated!");
  };
 // --- UPGRADED: INTERACTIVE 7-DAY GRAPH DATA ---
  const getDynamicChartData = () => {
    const chartData = [];
    let maxBurnt = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // Gets Mon, Tue, etc.

      // Calculate burnt for this specific day
      const burntThatDay = history
        .filter(h => h.date === dateString)
        .reduce((sum, h) => sum + (h.burnt || 0), 0);
        
      // Calculate food intake for this specific day
      const intakeThatDay = foodJournal
        .filter(f => f.date === dateString)
        .reduce((sum, f) => sum + (f.kcal || 0), 0);

      if (burntThatDay > maxBurnt) maxBurnt = burntThatDay;
      
      chartData.push({
        date: dateString,
        dayName: dayName,
        burnt: burntThatDay,
        intake: intakeThatDay
      });
    }

    const safeMax = maxBurnt > 0 ? maxBurnt : 100; 
    
    // Add the height percentage to each day's data object
    return chartData.map(day => ({
      ...day,
      heightPercent: Math.max((day.burnt / safeMax) * 100, 2)
    }));
  };
  
  // --- DYNAMIC WEIGHT & GOAL MATH ---
  const currentW = Number(userData.weight) || 0;
  const previousW = Number(userData.lastWeight) || currentW; // Defaults to current if no past weight exists
  const targetW = Number(targetWeight) || 1;

  // 1. Calculate Trending Up/Down Percentage
  const weightDiff = previousW > 0 ? (((currentW - previousW) / previousW) * 100).toFixed(1) : 0;

  // 2. Calculate Goal Progress Bar (Works for both Weight Loss AND Weight Gain)
  let goalProgressPercent = 0;
  if (currentW > 0) {
    if (targetW < currentW) {
      // Weight Loss Goal (e.g., Current 80, Target 75 -> 93% to goal)
      goalProgressPercent = (targetW / currentW) * 100;
    } else {
      // Weight Gain Goal (e.g., Current 70, Target 75 -> 93% to goal)
      goalProgressPercent = (currentW / targetW) * 100;
    }
  }
  // Make sure the bar never visually breaks past 100% or goes below 0%
  goalProgressPercent = Math.min(100, Math.max(0, goalProgressPercent));

  return (
    <div className="fitai-app">
      <style>{css}</style>
      {/* SIDEBAR */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1999,backdropFilter:'blur(4px)'}}/>}
      <div className={`sidebar ${menuOpen ? 'open' : 'closed'}`}>
        <button onClick={() => setMenuOpen(false)} style={{position:'absolute',right:20,top:20,background:'none',border:'none',cursor:'pointer',color:'#666',display:'flex',alignItems:'center'}}>
          <Close style={{fontSize:'24px'}}/>
        </button>
        <div style={{marginBottom:'32px',marginTop:'8px'}}>
          <div className="display-font" style={{fontSize:'28px',letterSpacing:'4px',color:'#fff'}}>FITAI</div>
          <div className="label" style={{marginTop:'6px'}}>{userData.name || 'Athlete'}</div>
        </div>

        <div style={{background:'#0a0a0a',border:'1px solid #1a1a1a',borderRadius:'12px',padding:'16px',marginBottom:'28px'}}>
          <div className="label" style={{marginBottom:'8px'}}>Weight Goal Progress</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
            <span style={{fontSize:'13px',color:'#888'}}>{userData.weight || '--'} kg</span>
            <span style={{fontSize:'13px',color:'#fff',fontFamily:"'Space Mono',monospace"}}>{targetWeight} kg</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{width:`${goalProgressPercent}%`}}/>
          </div>
          <div style={{fontSize:'11px',color:'#555',marginTop:'8px',fontFamily:"'Space Mono',monospace"}}>{Math.round(goalProgressPercent)}% to target</div>
        </div>

        {[
          {icon:<Home/>, label:'Dashboard', tab:'home'},
          {icon:<ShowChart/>, label:'Progress', tab:'progress'},
          {icon:<ListAlt/>, label:'Weekly Planner', tab:'planner'},
          {icon:<EmojiEvents/>, label:'Set Goals', tab:'goals'},
          {icon:<SmartToy/>, label:'AI Coach', tab:'chat'},
          {icon:<Person/>, label:'Profile', tab:'profile'},
        ].map(item => (
          <div key={item.tab} className="sidebar-item" onClick={() => {setActiveTab(item.tab);setMenuOpen(false);}}>
            <span style={{color:'#555',display:'flex'}}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
        <div className="sidebar-item" onClick={handleLogout} style={{color:'#ff4444',borderBottom:'none',marginTop:'8px'}}>
          <span style={{color:'#ff4444',display:'flex'}}><Close/></span>
          <span>Sign Out</span>
        </div>
      </div>

      {/* HEADER */}
      {view === 'app' && (
        <header className="app-header">
          <button onClick={() => setMenuOpen(true)} style={{background:'none',border:'none',cursor:'pointer',color:'#fff',display:'flex',padding:'4px'}}>
            <Menu style={{fontSize:'22px'}}/>
          </button>
          <div className="display-font" style={{fontSize:'20px',letterSpacing:'4px',color:'#fff'}}>FITAI</div>
          <div className="streak-badge">
            <LocalFireDepartment style={{fontSize:'14px',color:'#ff6b35'}}/>
            <span>{userData.streak}</span>
          </div>
        </header>
      )}

      {/* 1. AUTH SCREEN */}
      {view === 'auth' && (
        <div className="auth-screen fade-up">
          <div style={{marginBottom:'48px'}}>
            <div className="auth-logo">FITAI</div>
            <div className="label" style={{marginTop:'12px',fontSize:'11px'}}>Your intelligent training companion</div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'24px'}}>
            <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
          </div>

          <button className="btn-primary" onClick={handleAuth}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{marginTop:'24px',textAlign:'center'}}>
            <span style={{color:'#444',fontSize:'13px'}}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <span onClick={()=>setIsLogin(!isLogin)} style={{color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'600',textDecoration:'underline',textUnderlineOffset:'3px'}}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </div>

          <div style={{position:'absolute',bottom:'40px',left:'24px',right:'24px',textAlign:'center'}}>
            <div className="label" style={{fontSize:'9px',color:'#2a2a2a'}}>TRAIN SMART · EAT RIGHT · TRACK EVERYTHING</div>
          </div>
        </div>
      )}

      {/* 2. ONBOARDING SCREEN */}
      {view === 'onboarding' && (
        <div style={{padding:'32px 24px',minHeight:'100vh'}} className="fade-up">
          <div style={{marginBottom:'32px'}}>
            <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px',color:'#fff'}}>SETUP</div>
            <div className="label" style={{marginTop:'8px'}}>Tell us about yourself</div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <input placeholder="Your name" onChange={(e)=>setUserData({...userData,name:e.target.value})}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <input placeholder="Weight (kg)" type="number" onChange={(e)=>setUserData({...userData,weight:parseFloat(e.target.value)})}/>
              <input placeholder="Height (cm)" type="number" onChange={(e)=>setUserData({...userData,height:e.target.value})}/>
            </div>
            <select onChange={(e)=>setUserData({...userData,level:e.target.value})}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="pro">Pro</option>
            </select>

            <div style={{marginTop:'8px'}}>
              <div className="label" style={{marginBottom:'12px'}}>Any injuries? (optional)</div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {['Knee','Back','Shoulder'].map(part=>(
                  <button key={part} className={`injury-btn ${userData.injuries.includes(part)?'danger':''}`} onClick={()=>toggleInjury(part)}>
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={saveProfile} style={{marginTop:'16px'}}>
              Begin Training →
            </button>
          </div>
        </div>
      )}

      {/* 3. HOME DASHBOARD */}
      {view === 'app' && activeTab === 'home' && (
        <div style={{padding:'24px'}} className="fade-up">
          {/* GREETING */}
          <div style={{marginBottom:'28px'}}>
            <div className="label" style={{marginBottom:'6px'}}>Good day</div>
            <div className="display-font" style={{fontSize:'clamp(36px,8vw,52px)',lineHeight:'1',letterSpacing:'2px'}}>{userData.name || 'ATHLETE'}</div>
          </div>

          {/* RANK CARD */}
          <div className="card-featured" style={{marginBottom:'16px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-20px',right:'-20px',fontSize:'120px',opacity:'0.04',fontFamily:"'Bebas Neue',sans-serif",letterSpacing:'0',lineHeight:'1'}}>
              {userData.level?.toUpperCase()}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
              <div>
                <div className="label label-white" style={{marginBottom:'4px'}}>Current Rank</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'28px',letterSpacing:'3px',color:'#000',textTransform:'uppercase'}}>{userData.level}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="label label-white" style={{marginBottom:'4px'}}>Fitness Score</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'28px',fontWeight:'700',color:'#000'}}>{fitnessScore}</div>
              </div>
            </div>
            <div style={{marginTop:'16px',height:'2px',background:'rgba(0,0,0,0.1)',borderRadius:'1px',overflow:'hidden'}}>
              <div style={{height:'100%',background:'#000',width:`${Math.min(100,userData.level==='beginner'?(fitnessScore/500)*100:userData.level==='intermediate'?((fitnessScore-500)/1000)*100:100)}%`,transition:'width 1s ease'}}/>
            </div>
            <div style={{fontSize:'11px',color:'rgba(0,0,0,0.5)',marginTop:'10px',fontFamily:"'Space Mono',monospace"}}>
              {WEEKLY_PLAN[userData.level].nextLevel}
            </div>
          </div>

          {/* STATS ROW */}
          <div className="stat-grid" style={{marginBottom:'16px'}}>
            <div className="card" style={{textAlign:'center'}}>
              <div className="label" style={{marginBottom:'8px'}}>Intake</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'20px',fontWeight:'700',color:'#fff'}}>{todaysCalsIntake}</div>
              <div style={{fontSize:'10px',color:'#555',marginTop:'2px'}}>kcal</div>
            </div>
            <div className="card" style={{textAlign:'center'}}>
              <div className="label" style={{marginBottom:'8px'}}>Burnt</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'20px',fontWeight:'700',color:'#ff6b6b'}}>{todaysCalsBurnt}</div>
              <div style={{fontSize:'10px',color:'#555',marginTop:'2px'}}>kcal</div>
            </div>
          </div>

          {/* WEIGHT */}
          <div className="card" style={{marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div className="label" style={{marginBottom:'6px'}}>Body Weight</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'28px',fontWeight:'700',color:'#fff'}}>
                {userData.weight || '--'} <span style={{fontSize:'14px',color:'#555'}}>kg</span>
              </div>
            </div>
            {userData.lastWeight && userData.lastWeight !== userData.weight && (
              <div style={{display:'flex',alignItems:'center',gap:'6px',color:weightDiff>0?'#ff6b6b':'#6bff9e',fontSize:'13px',fontFamily:"'Space Mono',monospace"}}>
                {weightDiff>0?<TrendingUp style={{fontSize:'18px'}}/>:<TrendingDown style={{fontSize:'18px'}}/>}
                {Math.abs(weightDiff)}%
              </div>
            )}
          </div>

          {/* DAILY CHECKLIST */}
          <div className="card" style={{marginBottom:'16px'}}>
            <div className="label" style={{marginBottom:'4px'}}>Daily Targets</div>
            {[
              {key:'water',label:'Drink 8 glasses of water'},
              {key:'stretch',label:'10 min warm-up'},
              {key:'workout',label:'Complete gym session',readonly:true},
            ].map(item=>(
              <div key={item.key} className="check-item" onClick={()=>!item.readonly&&setChecklist({...checklist,[item.key]:!checklist[item.key]})}>
                <div style={{width:'18px',height:'18px',border:`1.5px solid ${checklist[item.key]?'#00e676':'#333'}`,borderRadius:'4px',background:checklist[item.key]?'#00e676':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s'}}>
                  {checklist[item.key] && <span style={{color:'#000',fontSize:'11px',fontWeight:'bold'}}>✓</span>}
                </div>
                <span style={{fontSize:'14px',color:checklist[item.key]?'#555':'#aaa',textDecoration:checklist[item.key]?'line-through':'none',transition:'all 0.2s'}}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* WATER TRACKER */}
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div>
                <div className="label" style={{marginBottom:'4px'}}>Hydration</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'18px',color:waterGlasses>=8?'#00e676':'#888'}}>
                  {waterGlasses}<span style={{color:'#333'}}>/8</span>
                </div>
              </div>
              <button onClick={handleAddWater} style={{background:'#00e676',border:'none',borderRadius:'100px',padding:'10px 20px',cursor:'pointer',fontSize:'12px',fontFamily:"'DM Sans',sans-serif",fontWeight:'600',display:'flex',alignItems:'center',gap:'6px'}}>
                <LocalDrink style={{fontSize:'16px',color:'#000'}}/> Add Glass
              </button>
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {Array.from({length:8},(_,i)=>(
                <div key={i} className={`water-dot ${i<waterGlasses?'filled':''}`}/>
              ))}
            </div>
          </div>

          {/* LAST SESSION */}
          {history.length>0 && (
            <div className="card">
              <div className="label" style={{marginBottom:'12px'}}>Last Session</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'12px',color:'#fff',marginBottom:'8px'}}>{history[0].date} · {history[0].mode}</div>
              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                {history[0].details.slice(0,3).map((d,i)=>(
                  <div key={i} style={{fontSize:'13px',color:'#555',paddingLeft:'0'}}>{d}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SMART GOALS TAB --- */}
      {view === 'app' && activeTab === 'goals' && (
        <div style={{padding:'24px'}} className="fade-up">
          <div style={{marginBottom:'28px'}}>
            <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px'}}>GOALS</div>
            <div className="label" style={{marginTop:'6px'}}>Define your targets</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div className="card">
              <div className="label" style={{marginBottom:'10px'}}>Target Body Weight (kg)</div>
              <input type="number" value={targetWeight} onChange={(e)=>setTargetWeight(parseFloat(e.target.value)||0)}/>
            </div>
            <div className="card">
              <div className="label" style={{marginBottom:'10px'}}>Daily Calorie Target</div>
              <input type="number" value={dailyCalsGoal} onChange={(e)=>setDailyCalsGoal(parseFloat(e.target.value)||0)}/>
            </div>
            <button className="btn-primary" onClick={saveGoalsToDatabase}>Save Goals</button>
          </div>
        </div>
      )}

      {/* PROGRESS TRACKING TAB */}
      {view === 'app' && activeTab === 'progress' && (
        <div style={{padding:'24px'}} className="fade-up">
          <div style={{marginBottom:'28px'}}>
            <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px'}}>PROGRESS</div>
            <div className="label" style={{marginTop:'6px'}}>7-day overview</div>
          </div>
          
          {/* CALORIE CHART */}
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'20px'}}>
              <div>
                <div className="label" style={{marginBottom:'4px'}}>Today Burnt</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'20px',color:'#ff6b6b'}}>{todaysCalsBurnt} <span style={{fontSize:'11px',color:'#555'}}>kcal</span></div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="label" style={{marginBottom:'4px'}}>Today Intake</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'20px',color:'#fff'}}>{todaysCalsIntake} <span style={{fontSize:'11px',color:'#555'}}>kcal</span></div>
              </div>
            </div>
            
            <div style={{display:'flex',gap:'6px',alignItems:'flex-end',height:'80px'}}>
              {getDynamicChartData().map((data,i)=>(
                <div key={i} className={`chart-bar ${selectedGraphDay?.date===data.date?'selected':''}`}
                  style={{height:`${data.heightPercent}%`}}
                  onClick={()=>setSelectedGraphDay(data)}/>
              ))}
            </div>
            <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
              {getDynamicChartData().map((data,i)=>(
                <div key={i} style={{flex:1,textAlign:'center',fontSize:'10px',color:'#444',fontFamily:"'Space Mono',monospace"}}>
                  {data.dayName.charAt(0)}
                </div>
              ))}
            </div>
            {selectedGraphDay && (
              <div style={{marginTop:'16px',padding:'16px',background:'#111',borderRadius:'12px',border:'1px solid #1e1e1e',display:'flex',justifyContent:'space-around'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'20px',color:'#ff6b6b'}}>{selectedGraphDay.burnt}</div>
                  <div className="label" style={{marginTop:'4px'}}>kcal burnt</div>
                </div>
                <div style={{width:'1px',background:'#1e1e1e'}}/>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'20px',color:'#fff'}}>{selectedGraphDay.intake}</div>
                  <div className="label" style={{marginTop:'4px'}}>kcal intake</div>
                </div>
              </div>
            )}
            {!selectedGraphDay && <div style={{textAlign:'center',fontSize:'11px',color:'#333',marginTop:'12px',fontFamily:"'Space Mono',monospace"}}>tap a bar to see details</div>}
          </div>

          {/* WEIGHT LIFTED ANALYSIS */}
          <div className="card">
            <div className="label" style={{marginBottom:'16px'}}>Weight Analysis</div>
            {history.filter(h=>h.exercisesData).length>0 ? history.filter(h=>h.exercisesData).slice(0,3).map((h,i)=>(
              <div key={i} style={{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid #111'}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'11px',color:'#555',marginBottom:'12px'}}>
                  {h.date} · {h.exercisesData.reduce((s,e)=>s+(e.weight*e.reps*e.sets),0)} kg total vol
                </div>
                {h.exercisesData.map((ex,idx)=>{
                  let aiTip=`Focus on slow, controlled eccentric movements for ${ex.name}.`;
                  if(ex.sets>0&&ex.sets<3)aiTip=`Try 3-4 sets next time for optimal volume on ${ex.name}.`;
                  else if(ex.weight==0&&ex.reps>=15)aiTip=`Consider adding resistance to ${ex.name} for muscle growth.`;
                  else if(ex.weight>0&&ex.reps>=8)aiTip=`Try increasing ${ex.name} to ${Number(ex.weight)+2.5}kg next session.`;
                  return(
                    <div key={idx} style={{marginBottom:'12px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{fontSize:'14px',fontWeight:'600'}}>{ex.name}</span>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'12px',color:'#888'}}>{ex.weight}kg×{ex.reps}×{ex.sets}</span>
                      </div>
                      <div style={{fontSize:'12px',color:'#666',background:'#111',padding:'8px 12px',borderRadius:'8px',border:'1px solid #1a1a1a'}}>
                        💡 {aiTip}
                      </div>
                    </div>
                  );
                })}
              </div>
            )):<div style={{fontSize:'13px',color:'#444',textAlign:'center',padding:'24px 0'}}>Complete a session to see analytics</div>}
          </div>
        </div>
      )}

      {/* NUTRITION TAB */}
      {view === 'app' && activeTab === 'restaurant' && (
        <div style={{padding:'24px'}} className="fade-up">
          <div style={{marginBottom:'28px'}}>
            <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px'}}>NUTRITION</div>
            <div className="label" style={{marginTop:'6px'}}>Track your meals</div>
          </div>

          {['Breakfast','Lunch','Dinner'].map(mealType=>(
            <div key={mealType} className="card" style={{marginBottom:'12px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                <Fastfood style={{fontSize:'16px',color:'#555'}}/>
                <div className="label">{mealType}</div>
              </div>
              <select onChange={(e)=>{
                const foodName=e.target.value;
                const kcalVal=FOOD_DB[mealType.toLowerCase()][foodName];
                if(kcalVal){logFoodToDatabase(mealType,foodName,kcalVal);e.target.value="Select food...";}
              }}>
                <option>Select food...</option>
                {Object.keys(FOOD_DB[mealType.toLowerCase()]).map(item=><option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          ))}

          {foodJournal.filter(f=>f.date===today).length>0 && (
            <div style={{marginTop:'24px'}}>
              <div className="label" style={{marginBottom:'12px'}}>Logged Today</div>
              {foodJournal.filter(f=>f.date===today).map((f,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #111'}}>
                  <div>
                    <div style={{fontSize:'14px',color:'#fff'}}>{f.name}</div>
                    <div className="label" style={{marginTop:'2px'}}>{f.meal}</div>
                  </div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'14px',color:'#888'}}>{f.kcal} kcal</div>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'14px 0',borderTop:'1px solid #333',marginTop:'4px'}}>
                <span style={{fontSize:'13px',color:'#666'}}>Total</span>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:'14px',color:'#fff'}}>{todaysCalsIntake} kcal</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {view === 'app' && activeTab === 'profile' && (
        <div style={{padding:'24px'}} className="fade-up">
          <div style={{marginBottom:'28px'}}>
            <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px'}}>PROFILE</div>
            <div className="label" style={{marginTop:'6px'}}>Update your stats</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div className="card">
              <div className="label" style={{marginBottom:'10px'}}>Weight (kg)</div>
              <input type="number" value={userData.weight} onChange={(e)=>setUserData({...userData,weight:parseFloat(e.target.value)})}/>
            </div>
            <div className="card">
              <div className="label" style={{marginBottom:'12px'}}>Injuries</div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {['Knee','Back','Shoulder'].map(part=>(
                  <button key={part} className={`injury-btn ${userData.injuries.includes(part)?'danger':''}`} onClick={()=>toggleInjury(part)}>{part}</button>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="label" style={{marginBottom:'10px'}}>Training Level</div>
              <select value={userData.level} onChange={(e)=>setUserData({...userData,level:e.target.value})}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <button className="btn-primary" onClick={saveProfileChanges}>Save Changes</button>
          </div>
        </div>
      )}
     

      {/* GYM TAB */}
      {view === 'app' && activeTab === 'gym' && (
        <div style={{padding:'24px'}} className="fade-up">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px'}}>
            <div>
              <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px'}}>TRAIN</div>
              <div className="label" style={{marginTop:'6px'}}>Log your session</div>
            </div>
            <div onClick={()=>setIsTimerRunning(!isTimerRunning)} style={{display:'flex',flexDirection:'column',alignItems:'center',background:isTimerRunning?'#00e676':'#111',border:'1px solid #222',borderRadius:'12px',padding:'10px 16px',cursor:'pointer',transition:'all 0.2s'}}>
              <Timer style={{fontSize:'16px',color:isTimerRunning?'#000':'#666'}}/>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'14px',fontWeight:'700',color:isTimerRunning?'#000':'#fff',marginTop:'4px'}}>
                {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}
              </span>
            </div>
          </div>

          <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
            {['Home','Travel','Gym'].map(m=>(
              <button key={m} className={`btn-outline ${gymMode===m.toLowerCase()?'active':''}`} onClick={()=>setGymMode(m.toLowerCase())}>
                {m}
              </button>
            ))}
          </div>

          {filteredEx.map((ex,i)=>(
            <div key={i} className="ex-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'16px',fontWeight:'600',marginBottom:'4px'}}>{ex.name}</div>
                  <div className="label" style={{marginBottom:'6px'}}>{getVolumeSuggestion(userData.level)}</div>
                  <div style={{fontSize:'12px',color:'#555',fontStyle:'italic'}}>💡 {ex.tip}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px',marginLeft:'12px'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'11px',color:'#555'}}>{pbs[ex.name]||0} kg PB</div>
                  <div style={{fontSize:'10px',color:'#555',fontFamily:"'Space Mono',monospace"}}>{ex.burn} cal/set</div>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'8px',marginBottom:'12px'}}>
                <input type="number" placeholder="Sets" style={{padding:'10px !important'}} onChange={(e)=>handleSessionUpdate(ex.name,'sets',e.target.value)}/>
                <input type="number" placeholder="Reps" style={{padding:'10px !important'}} onChange={(e)=>handleSessionUpdate(ex.name,'reps',e.target.value)}/>
                <input id={`pb-${i}`} type="number" placeholder="kg" style={{padding:'10px !important'}} onChange={(e)=>handleSessionUpdate(ex.name,'weight',e.target.value)}/>
                <button onClick={()=>setPbs({...pbs,[ex.name]:document.getElementById(`pb-${i}`).value})} style={{background:'#00e676',border:'none',borderRadius:'8px',padding:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Save style={{fontSize:'16px',color:'#000'}}/>
                </button>
              </div>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <button className="btn-ghost" style={{fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',color:activeVideo===i?'#fff':'#555'}} onClick={()=>setActiveVideo(activeVideo===i?null:i)}>
                  {activeVideo===i?<Close style={{fontSize:'15px'}}/>:<PlayCircleOutline style={{fontSize:'15px'}}/>}
                  {activeVideo===i?'Close':'Form Guide'}
                </button>
                <button onClick={()=>{setActiveAiExercise(ex);setAiReps(0);setAiModalOpen(true);speakFeedback(`Starting AI Tracker for ${ex.name}. Please step back.`);}}
                  style={{background:'transparent',border:'1px solid #333',borderRadius:'100px',padding:'6px 14px',cursor:'pointer',fontSize:'12px',color:'#aaa',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:'6px',transition:'all 0.2s'}}
                  onMouseOver={e=>e.currentTarget.style.borderColor='#00e676'}
                  onMouseOut={e=>e.currentTarget.style.borderColor='#333'}
                >
                  <PlayCircleOutline style={{fontSize:'14px'}}/> AI Tracker
                </button>
              </div>

              {activeVideo===i && (
                <div style={{marginTop:'12px',borderRadius:'12px',overflow:'hidden',height:'220px',border:'1px solid #1e1e1e'}}>
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ex.embedId}`} title="Tutorial" frameBorder="0" allowFullScreen/>
                </div>
              )}
            </div>
          ))}

          <button className="btn-primary" onClick={saveWorkout} style={{marginTop:'8px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            <CheckCircle style={{fontSize:'18px'}}/> Finish & Save Log
          </button>
        </div>
      )}

     {/* --- HISTORY TAB --- */}
      {view === 'app' && activeTab === 'history' && (() => {
        const historyMatchDate = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedSelectedDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const todaysHistory = history.filter(h => h.date === historyMatchDate);
        const totalBurnt = todaysHistory.reduce((sum, h) => sum + (h.burnt || 0), 0);

        return (
          <div style={{padding:'24px'}} className="fade-up">
            <div style={{marginBottom:'24px'}}>
              <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px'}}>HISTORY</div>
            </div>

            <div style={{display:'flex',gap:'0',marginBottom:'24px',border:'1px solid #1e1e1e',borderRadius:'10px',overflow:'hidden'}}>
              {['Day','Week','Month'].map(tab=>(
                <div key={tab} onClick={()=>setHistoryActiveTab(tab)} style={{flex:1,padding:'12px',textAlign:'center',cursor:'pointer',fontSize:'12px',fontFamily:"'Space Mono',monospace",letterSpacing:'1px',background:historyActiveTab===tab?'#00e676':'transparent',color:historyActiveTab===tab?'#000':'#555',transition:'all 0.2s'}}>
                  {tab}
                </div>
              ))}
            </div>

            {historyActiveTab==='Day' && (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                  <button className="btn-ghost" style={{fontSize:'20px',padding:'8px',color:'#555'}} onClick={()=>{const d=new Date(selectedDate);d.setDate(d.getDate()-1);setSelectedDate(d);}}>←</button>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'15px',fontWeight:'500'}}>{formattedSelectedDate}</div>
                    {totalBurnt>0 && <div className="label" style={{marginTop:'4px',color:'#ff6b6b'}}>{totalBurnt} kcal burnt</div>}
                  </div>
                  <button className="btn-ghost" style={{fontSize:'20px',padding:'8px',color:'#555'}} onClick={()=>{const d=new Date(selectedDate);d.setDate(d.getDate()+1);setSelectedDate(d);}}>→</button>
                </div>

                {todaysHistory.length===0?(
                  <div style={{textAlign:'center',padding:'60px 0',color:'#333'}}>
                    <History style={{fontSize:'48px',color:'#1a1a1a',marginBottom:'16px'}}/>
                    <div style={{fontSize:'14px',color:'#444',marginBottom:'16px'}}>No activity logged</div>
                    <span onClick={()=>setActiveTab('gym')} style={{fontSize:'13px',color:'#fff',cursor:'pointer',textDecoration:'underline',textUnderlineOffset:'3px'}}>Log a workout</span>
                  </div>
                ):todaysHistory.map((h,i)=>(
                  <div key={i} className="card" style={{marginBottom:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',paddingBottom:'14px',borderBottom:'1px solid #111'}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'20px',letterSpacing:'2px'}}>{h.mode} Workout</div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'11px',color:'#555'}}>
                          {Math.floor((h.duration||0)/60)}:{String((h.duration||0)%60).padStart(2,'0')}
                        </div>
                        <div className="label" style={{marginTop:'2px'}}>{h.exercises?h.exercises.length:0} exercises</div>
                      </div>
                    </div>
                    {(h.exercises||[]).map((ex,idx)=>(
                      <div key={idx} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #0d0d0d'}}>
                        <div>
                          <div style={{fontSize:'14px',fontWeight:'500'}}>{ex.name}</div>
                          <div className="label" style={{marginTop:'2px'}}>{ex.sets} sets × {ex.reps} reps</div>
                        </div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'16px',fontWeight:'700'}}>{ex.weight}<span style={{fontSize:'11px',color:'#555',fontWeight:'400'}}> kg</span></div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {historyActiveTab!=='Day' && (
              <div style={{textAlign:'center',padding:'60px 0',color:'#333'}}>
                <ShowChart style={{fontSize:'48px',color:'#1a1a1a',marginBottom:'16px'}}/>
                <div style={{fontSize:'14px',color:'#444'}}>{historyActiveTab} view coming soon</div>
              </div>
            )}
          </div>
        );
      })()}
      {/* --- WEEKLY PLANNER TAB --- */}
      {view === 'app' && activeTab === 'planner' && (
        <div style={{padding:'24px'}} className="fade-up">
          <div style={{marginBottom:'24px'}}>
            <div className="display-font" style={{fontSize:'40px',letterSpacing:'3px'}}>PROTOCOL</div>
            <div className="label" style={{marginTop:'6px'}}>Weekly training plan</div>
          </div>

          <div className="card-featured" style={{marginBottom:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div className="label label-white" style={{marginBottom:'4px'}}>Rank</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'24px',letterSpacing:'2px'}}>{userData.level?.toUpperCase()}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="label label-white" style={{marginBottom:'4px'}}>Score</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'24px',fontWeight:'700'}}>{fitnessScore}</div>
              </div>
            </div>
            <div style={{marginTop:'12px',fontSize:'11px',color:'rgba(0,0,0,0.5)',fontStyle:'italic'}}>{WEEKLY_PLAN[userData.level].nextLevel}</div>
          </div>

          {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day=>{
            const dayData=WEEKLY_PLAN[userData.level][day];
            const isRest=day==='Wednesday';
            return(
              <div key={day} className="card" style={{marginBottom:'10px',borderLeft:`3px solid ${isRest?'#222':'#00e676'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'18px',letterSpacing:'2px',color:isRest?'#555':'#00e676'}}>{day}</div>
                  <div className="tag" style={{background:isRest?'transparent':'#111'}}>{dayData.muscle}</div>
                </div>
                <div style={{fontSize:'13px',color:'#888',marginBottom:'6px'}}>{dayData.exercises}</div>
                <div style={{fontSize:'11px',color:'#555',fontFamily:"'Space Mono',monospace"}}>{dayData.diet}</div>
              </div>
            );
          })}
        </div>
      )}
      {/* --- AI CHATBOT TAB --- */}
      {view === 'app' && activeTab === 'chat' && (
        <div style={{display:'flex',flexDirection:'column',position:'absolute',top:'61px',bottom:'80px',left:0,right:0,padding:'0 24px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'20px 0 16px',borderBottom:'1px solid #111',flexShrink:0}}>
            <SmartToy style={{fontSize:'20px',color:'#00e676'}}/>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'20px',letterSpacing:'3px'}}>FITAI COACH</div>
              <div className="label" style={{marginTop:'2px'}}>Powered by Gemini</div>
            </div>
          </div>

          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px',padding:'16px 0',scrollbarWidth:'none'}}>
            {chatMessages.map((msg,i)=>(
              <div key={i} className={`chat-bubble ${msg.role==='user'?'user':'ai'}`}>{msg.text}</div>
            ))}
            {isAiTyping && (
              <div className="chat-bubble ai" style={{display:'flex',gap:'6px',alignItems:'center',padding:'16px 20px'}}>
                <span className="typing-dot" style={{width:'6px',height:'6px',borderRadius:'50%',background:'#555'}}/>
                <span className="typing-dot" style={{width:'6px',height:'6px',borderRadius:'50%',background:'#555'}}/>
                <span className="typing-dot" style={{width:'6px',height:'6px',borderRadius:'50%',background:'#555'}}/>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          <div style={{display:'flex',gap:'10px',padding:'12px 0',flexShrink:0,borderTop:'1px solid #111'}}>
            <input type="text" value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSendMessage()} placeholder="Ask about diet, workouts..." style={{flex:1,borderRadius:'100px !important'}}/>
            <button onClick={handleSendMessage} style={{background:'#00e676',border:'none',borderRadius:'50%',width:'48px',height:'48px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
              <Send style={{color:'#000',fontSize:'18px',marginLeft:'2px'}}/>
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      {view === 'app' && (
        <nav className="bottom-nav">
          {[
            {tab:'home',icon:<Home/>,label:'Home'},
            {tab:'gym',icon:<FitnessCenter/>,label:'Train'},
            {tab:'restaurant',icon:<Restaurant/>,label:'Nutrition'},
            {tab:'history',icon:<History/>,label:'Log'},
          ].map(item=>(
            <button key={item.tab} className={`nav-btn ${activeTab===item.tab?'active':''}`} onClick={()=>setActiveTab(item.tab)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* --- AI FORM TRACKER MODAL --- */}
      {aiModalOpen && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'#000',zIndex:3000,display:'flex',flexDirection:'column',alignItems:'center',padding:'20px',overflowY:'auto'}}>
          <button onClick={handleStopAiTracker} style={{position:'absolute',right:20,top:20,background:'none',border:'none',cursor:'pointer',color:'#ff4444',display:'flex'}}>
            <Close style={{fontSize:'28px'}}/>
          </button>
          
          <div className="display-font" style={{fontSize:'28px',letterSpacing:'4px',marginTop:'12px',marginBottom:'20px',color:'#fff'}}>{activeAiExercise?.name}</div>
          
          <div style={{position:'relative',width:'100%',maxWidth:'380px',aspectRatio:'1',background:'#0a0a0a',borderRadius:'16px',overflow:'hidden',border:'1px solid #1e1e1e'}}>
            <video ref={videoRef} playsInline muted style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}/>
            <canvas ref={canvasRef} width="400" height="400" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}/>
            <div style={{position:'absolute',bottom:16,left:16,background:'rgba(0,0,0,0.9)',border:'1px solid #222',borderRadius:'12px',padding:'12px 20px'}}>
              <div className="label" style={{marginBottom:'4px'}}>Auto Reps</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'48px',lineHeight:'1',color:'#fff'}}>{aiReps}</div>
            </div>
          </div>

          <button onClick={handleStopAiTracker} className="btn-primary" style={{marginTop:'20px',maxWidth:'380px',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            <Save style={{fontSize:'18px'}}/> End & Save Session
          </button>

          <div style={{background:'#0d0d0d',border:'1px solid #1a1a1a',borderRadius:'12px',padding:'16px',marginTop:'16px',width:'100%',maxWidth:'380px',textAlign:'center'}}>
            <div className="label" style={{marginBottom:'8px'}}>AI Form Feedback</div>
            <div style={{fontSize:'16px',fontWeight:'600',color:aiFeedback.includes('Arch')?'#ff4444':'#fff'}}>{aiFeedback}</div>
          </div>
        </div>
      )}
    </div>
  );
}