import React, { useState, useEffect, useRef } from 'react';
import { Home, FitnessCenter, Restaurant, History, PlayCircleOutline, Timer, EmojiEvents, Save, CheckCircle, ListAlt, Star, Person, Close, Menu, LocalFireDepartment, ShowChart, TrendingUp, TrendingDown, Fastfood, LocalDrink, Info, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
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

const COLORS = { bg: '#000000', card: '#111111', text: '#ffffff', textDim: '#888888', primary: '#00e676', border: '#222222', inputBg: '#1a1a1a', danger: '#ff4444' };

export default function App() {
  const [view, setView] = useState('auth');
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [gymMode, setGymMode] = useState('gym');
  // --- ADDED: AI TRACKER STATES ---
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeAiExercise, setActiveAiExercise] = useState(null);
  const [aiReps, setAiReps] = useState(0);
  const [aiFeedback, setAiFeedback] = useState("Align your body in the camera...");
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
  
  const [userData, setUserData] = useState({ name: "", weight: 75, lastWeight: 77, height: "", injuries: [], level: "beginner", streak: 5 });
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

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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

  // UPGRADED: Save Workout now stores raw data for the Progress Hub analysis
  const saveWorkout = () => {
    let totalBurnt = 0;
    const doneWorkoutsStrings = [];
    const doneWorkoutsData = []; // NEW: Stores objects for Analytics
    
    Object.entries(currentSessionDetails)
      .filter(([name, data]) => data.weight || data.sets || data.reps)
      .forEach(([name, data]) => {
        const baseEx = [...EXERCISE_DATA.gym, ...EXERCISE_DATA.home, ...EXERCISE_DATA.travel].find(e => e.name === name) || { burn: 5 };
        totalBurnt += (baseEx.burn * (data.sets || 1)); 
        
        // Push string for old History tab compatibility
        doneWorkoutsStrings.push(`${name} (${data.sets || 0}s × ${data.reps || 0}r @ ${data.weight || 0}kg)`);
        // Push object for Progress Hub Analytics
        doneWorkoutsData.push({ name, sets: Number(data.sets)||0, reps: Number(data.reps)||0, weight: Number(data.weight)||0 });
      });
      
    if (doneWorkoutsStrings.length === 0) return alert("Enter session details to save.");
    
    setHistory([{ date: today, mode: gymMode.toUpperCase(), details: doneWorkoutsStrings, exercises: doneWorkoutsData, exercisesData: doneWorkoutsData, burnt: Math.round(totalBurnt) }, ...history]);
    setChecklist(prev => ({ ...prev, workout: true })); // Check off daily workout
    awardPoints('Completing a Workout', 5);
    setCurrentSessionDetails({});
    setActiveTab('home');
    setSeconds(0);
    setIsTimerRunning(false);
    
  };

  const weightDiff = (((userData.weight - userData.lastWeight) / userData.lastWeight) * 100).toFixed(1);
  const goalProgressPercent = Math.max(0, Math.min(100, (targetWeight / userData.weight) * 100));
  
  return (
    <div style={{background: COLORS.bg, color: COLORS.text, minHeight: '100vh', maxWidth: '480px', margin: 'auto', paddingBottom: '90px', fontFamily: 'Roboto, sans-serif', position: 'relative'}}>

      
      
      {/* SIDEBAR CIRCLE MENU */}
      <div style={{position: 'fixed', top: 0, left: menuOpen ? 0 : '-100%', width: '80%', height: '100%', background: COLORS.card, zIndex: 2000, transition: '0.3s', padding: '40px 20px', borderRight: `1px solid ${COLORS.border}`}}>
        <Close onClick={() => setMenuOpen(false)} style={{position: 'absolute', right: 20, top: 20, color: COLORS.primary, cursor: 'pointer'}} />
        <h2 style={{color: COLORS.primary}}>Menu</h2>
        
        {/* ADDED: GOAL PROGRESS IN MENU */}
        <div style={{margin: '20px 0', background: '#000', padding: '15px', borderRadius: '12px', border: `1px solid ${COLORS.border}`}}>
            <p style={{fontSize: '12px', color: COLORS.textDim}}>Weight Goal: {targetWeight} kg</p>
            <div style={{width: '100%', height: '8px', background: '#222', borderRadius: '4px', marginTop: '5px'}}>
                <div style={{width: `${goalProgressPercent}%`, height: '100%', background: COLORS.primary, borderRadius: '4px'}}></div>
            </div>
            <p style={{fontSize: '10px', marginTop: '5px', color: COLORS.primary}}>Journey to Target</p>
        </div>

        <div style={{marginTop: '40px'}}>
            <p onClick={() => {setActiveTab('progress'); setMenuOpen(false)}} style={{padding: '15px 0', borderBottom: '1px solid #222', cursor: 'pointer'}}><ShowChart style={{verticalAlign:'middle'}}/> Progress Tracking</p>
            <p onClick={() => {setActiveTab('planner'); setMenuOpen(false)}} style={{padding: '15px 0', borderBottom: '1px solid #222', cursor: 'pointer'}}><ListAlt style={{verticalAlign:'middle', color: COLORS.primary, marginRight: '8px'}}/> Weekly Planner</p>
            <p onClick={() => {setActiveTab('goals'); setMenuOpen(false)}} style={{padding: '15px 0', borderBottom: '1px solid #222', cursor: 'pointer'}}><EmojiEvents style={{verticalAlign:'middle'}}/> Set My Goals</p>
            <p onClick={() => {setActiveTab('home'); setMenuOpen(false)}} style={{padding: '15px 0', borderBottom: '1px solid #222', cursor: 'pointer'}}><Home style={{verticalAlign:'middle'}}/> Dashboard</p>
            <p onClick={() => {setActiveTab('profile'); setMenuOpen(false)}} style={{padding: '15px 0', borderBottom: '1px solid #222', cursor: 'pointer'}}><Person style={{verticalAlign:'middle'}}/> Profile Settings</p>
        </div>
      </div>

      {/* HEADER WITH STREAK */}
      {view === 'app' && (
        <header style={{padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Menu onClick={() => setMenuOpen(true)} style={{color: COLORS.primary, cursor: 'pointer'}} />
          <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: COLORS.primary}}>
            <LocalFireDepartment /> <span style={{fontWeight: 'bold'}}>{userData.streak} Day Streak</span>
          </div>
        </header>
      )}

      {/* 1. AUTH SCREEN */}
      {view === 'auth' && (
        <div style={{padding: '40px 20px', textAlign: 'center'}}>
          <h1 style={{color: COLORS.primary, fontSize: '32px', textShadow: `0 0 10px ${COLORS.primary}`}}>FitAI</h1>
          <p style={{color: COLORS.textDim, marginBottom: '40px'}}>The Smart Trainer for Poor Gymers</p>
          <div style={{background: COLORS.card, padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
            <input type="email" placeholder="Email" style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            <input type="password" placeholder="Password" style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            <button onClick={() => setView('onboarding')} style={{width: '100%', padding: '14px', background: COLORS.primary, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>Login</button>
          </div>
        </div>
      )}

      {/* 2. ONBOARDING SCREEN */}
      {view === 'onboarding' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary}}>Profile Setup</h2>
          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', marginTop: '20px', border: `1px solid ${COLORS.border}`}}>
            <input placeholder="Name" onChange={(e) => setUserData({...userData, name: e.target.value})} style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            <div style={{display: 'flex', gap: '10px'}}>
               <input placeholder="Weight (kg)" type="number" onChange={(e) => setUserData({...userData, weight: parseFloat(e.target.value)})} style={{background: COLORS.inputBg, color: '#fff', flex: 1, padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
               <input placeholder="Height (cm)" type="number" onChange={(e) => setUserData({...userData, height: e.target.value})} style={{background: COLORS.inputBg, color: '#fff', flex: 1, padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            </div>
            <select onChange={(e) => setUserData({...userData, level: e.target.value})} style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="pro">Pro</option>
            </select>
            <p style={{fontSize: '14px', fontWeight: 'bold', color: COLORS.textDim}}>Injuries:</p>
            <div style={{display: 'flex', gap: '8px', margin: '15px 0'}}>
              {['Knee', 'Back', 'Shoulder'].map(part => (
                <button key={part} onClick={() => toggleInjury(part)} style={{padding: '8px 16px', borderRadius: '20px', border: '1px solid #333', background: userData.injuries.includes(part) ? COLORS.danger : COLORS.inputBg, color: '#fff'}}>{part}</button>
              ))}
            </div>
            <button onClick={() => setView('app')} style={{width: '100%', padding: '15px', background: COLORS.primary, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold'}}>Start Training</button>
          </div>
        </div>
      )}

      {/* 3. HOME DASHBOARD */}
      {view === 'app' && activeTab === 'home' && (
        <div style={{padding: '0 20px'}}>
          <h1>Welcome, <span style={{color: COLORS.primary}}>{userData.name}</span>!</h1>

           <div style={{background: 'linear-gradient(135deg, #111 0%, #003311 100%)', padding: '20px', borderRadius: '25px', marginBottom: '25px', border: `1px solid ${COLORS.primary}`}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <div>
                     <span style={{fontSize: '12px', color: COLORS.textDim}}>CURRENT RANK</span>
                     <h3 style={{margin: '0', color: '#fff', textTransform: 'uppercase'}}>{userData.level}</h3>
                 </div>
                 <div style={{textAlign: 'right'}}>
                     <span style={{fontSize: '12px', color: COLORS.textDim}}>FITNESS SCORE</span>
                     <h3 style={{margin: '0', color: COLORS.primary, fontSize: '24px'}}>{fitnessScore} <span style={{fontSize: '12px'}}>pts</span></h3>
                 </div>
             </div>
             <p style={{fontSize: '11px', color: '#ffd700', marginTop: '15px', fontStyle: 'italic'}}>
                 {WEEKLY_PLAN[userData.level].nextLevel}
             </p>
          </div>
          
          {/* --- ADDED: DAILY CHECKLIST --- */}
          <div style={{background: COLORS.card, padding: '15px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginBottom: '15px'}}>
            <h4 style={{margin: '0 0 10px 0', fontSize: '12px', color: COLORS.primary}}>DAILY TARGETS</h4>
            <div onClick={() => setChecklist({...checklist, water: !checklist.water})} style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer'}}>
              {checklist.water ? <CheckBox style={{color: COLORS.primary, fontSize: '18px'}}/> : <CheckBoxOutlineBlank style={{color: COLORS.textDim, fontSize: '18px'}}/>}
              <span style={{color: checklist.water ? COLORS.text : COLORS.textDim, fontSize: '13px', textDecoration: checklist.water ? 'line-through' : 'none'}}>Drink 8 Glasses of Water</span>
            </div>
            <div onClick={() => setChecklist({...checklist, stretch: !checklist.stretch})} style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer'}}>
              {checklist.stretch ? <CheckBox style={{color: COLORS.primary, fontSize: '18px'}}/> : <CheckBoxOutlineBlank style={{color: COLORS.textDim, fontSize: '18px'}}/>}
              <span style={{color: checklist.stretch ? COLORS.text : COLORS.textDim, fontSize: '13px', textDecoration: checklist.stretch ? 'line-through' : 'none'}}>10 Min Warm-up</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              {checklist.workout ? <CheckBox style={{color: COLORS.primary, fontSize: '18px'}}/> : <CheckBoxOutlineBlank style={{color: COLORS.textDim, fontSize: '18px'}}/>}
              <span style={{color: checklist.workout ? COLORS.text : COLORS.textDim, fontSize: '13px', textDecoration: checklist.workout ? 'line-through' : 'none'}}>Complete Gym Session</span>
            </div>
          </div>

          {/* --- ADDED: WATER TRACKER --- */}
          <div style={{background: COLORS.card, padding: '15px', borderRadius: '20px', marginBottom: '15px', border: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
                <span style={{fontSize: '11px', fontWeight: 'bold', color: COLORS.textDim}}>HYDRATION STATUS</span>
                <h3 style={{margin: '5px 0', color: '#00d2ff'}}>{waterGlasses} / 8 Glasses</h3>
            </div>
            <button onClick={() => {
                                    const newWater = waterGlasses + 1;
                                    setWaterGlasses(newWater); 
                                        if(newWater === 8) {
                                                            setChecklist({...checklist, water: true});
                                                            awardPoints('Daily Hydration Goal', 2);
                                                          }
                                    }}style={{background: '#00BFFF', color: '#fff', border: 'none', borderRadius: '50%', padding: '10px'}}><LocalDrink /></button>
          </div>
          
          <div style={{background: COLORS.card, padding: '25px', borderRadius: '25px', textAlign: 'center', margin: '15px 0', border: `1px solid ${COLORS.border}`}}>
            <h2 style={{fontSize: '32px', margin: 0, color: COLORS.primary}}>{userData.weight} kg</h2>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', color: weightDiff > 0 ? COLORS.danger : COLORS.primary}}>
              {weightDiff > 0 ? <TrendingUp /> : <TrendingDown />}
              <span style={{fontSize: '14px'}}>{Math.abs(weightDiff)}% from last month</span>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
            <div style={{background: COLORS.card, padding: '15px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
              <span style={{fontSize: '11px', fontWeight: 'bold', color: COLORS.primary}}>INTAKE</span>
              <h3 style={{margin: '5px 0'}}>{todaysCalsIntake} kcal</h3>
            </div>
            <div style={{background: COLORS.card, padding: '15px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
              <span style={{fontSize: '11px', fontWeight: 'bold', color: COLORS.danger}}>BURNT</span>
              <h3 style={{margin: '5px 0'}}>{todaysCalsBurnt} kcal</h3>
            </div>
          </div>

          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginBottom: '20px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                <ListAlt style={{color: COLORS.primary}}/>
                <h3 style={{fontSize: '16px', margin:0}}>Previous Session Card</h3>
            </div>
            {history.length > 0 ? (
                <div>
                    <p style={{fontSize: '14px', fontWeight: 'bold', color: COLORS.primary}}>{history[0].date} • {history[0].mode}</p>
                    <ul style={{fontSize: '13px', color: COLORS.textDim, paddingLeft: '15px', marginTop: '5px'}}>
                        {history[0].details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                </div>
            ) : <p style={{fontSize: '13px', color: COLORS.textDim}}>No session found.</p>}
          </div>
        </div>
      )}

      {/* --- ADDED: NEW SMART GOALS TAB (FIXED) --- */}
      {view === 'app' && activeTab === 'goals' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary, fontWeight: '900'}}>SET SMART GOALS</h2>
          <div style={{background: COLORS.card, padding: '30px', borderRadius: '25px', marginTop: '20px', border: `1px solid ${COLORS.border}`}}>
             <label style={{color: COLORS.textDim, fontSize: '12px'}}>TARGET BODY WEIGHT (KG)</label>
             <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)} style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '15px', margin: '10px 0 25px 0', border: `1px solid ${COLORS.border}`, borderRadius: '10px'}} />
             
             <label style={{color: COLORS.textDim, fontSize: '12px'}}>DAILY CALORIE TARGET</label>
             <input type="number" value={dailyCalsGoal} onChange={(e) => setDailyCalsGoal(parseFloat(e.target.value) || 0)} style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '15px', margin: '10px 0 25px 0', border: `1px solid ${COLORS.border}`, borderRadius: '10px'}} />
             
             <button onClick={() => {alert("Goals Updated Successfully!"); setActiveTab('home')}} style={{width: '100%', padding: '18px', background: COLORS.primary, color: '#000', fontWeight: '900', borderRadius: '12px', border: 'none'}}>SAVE GOALS</button>
          </div>
        </div>
      )}

      {/* PROGRESS TRACKING TAB */}
      {view === 'app' && activeTab === 'progress' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary}}>7-Day Progress</h2>
          
          {/* --- ADDED: WEIGHT LIFTED ANALYSIS & AI SUGGESTION --- */}
          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginTop: '20px'}}>
             <h4 style={{margin: '0 0 15px 0', fontSize: '14px', color: COLORS.primary}}>WEIGHT LIFTED ANALYSIS</h4>
             {history.filter(h => h.exercisesData).length > 0 ? history.filter(h => h.exercisesData).slice(0, 3).map((h, i) => (
               <div key={i} style={{marginBottom: '15px', borderBottom: '1px solid #222', paddingBottom: '10px'}}>
                 <p style={{fontSize: '12px', color: COLORS.textDim}}>{h.date} - Total Vol: {h.exercisesData.reduce((sum, e) => sum + (e.weight * e.reps * e.sets), 0)} kg</p>
                 {h.exercisesData.map((ex, idx) => {
                   // Dynamic AI Logic based on sets, reps, and weight
                // Dynamic AI Logic based on sets, reps, and weight
                   let aiTip = `AI: Focus on slow, controlled eccentric movements for ${ex.name}.`;
                   
                   // 1. Check sets first (Volume priority)
                   if (ex.sets > 0 && ex.sets < 3) {
                     aiTip = `AI: Good start on ${ex.name}. Try doing 3-4 sets next time for optimal volume.`;
                   } 
                   // 2. Check bodyweight high reps
                   else if (ex.weight == 0 && ex.reps >= 15) {
                     aiTip = `AI: Great endurance! Consider adding resistance to ${ex.name} for more muscle growth.`;
                   } 
                   // 3. Check weighted high reps
                   else if (ex.weight > 0 && ex.reps >= 8) {
                     aiTip = `AI: You hit ${ex.reps} reps! Try increasing ${ex.name} to ${Number(ex.weight) + 2.5}kg next session.`;
                   }

                   return (
                     <div key={idx} style={{marginBottom: '15px'}}>
                       <div style={{display:'flex', justifyContent:'space-between', fontSize: '13px', paddingBottom: '4px'}}>
                         <span style={{color: '#fff', fontWeight: 'bold'}}>{ex.name}</span>
                         <span style={{color: COLORS.primary}}>{ex.weight}kg x {ex.reps}r x {ex.sets}s</span>
                       </div>
                       <div style={{marginTop: '4px', fontSize: '11px', color: '#ffd700', display: 'flex', alignItems: 'center', background: 'rgba(255, 215, 0, 0.1)', padding: '8px', borderRadius: '5px'}}>
                          <Info style={{fontSize: '15px', marginRight: '6px'}}/> 
                          {aiTip}
                       </div>
                     </div>
                   );
                 })}
               </div>
             )) : <p style={{color: COLORS.textDim, fontSize: '13px'}}>Complete a session to see weight analytics.</p>}
          </div>

          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginTop: '20px'}}>
            <p><strong>Total Burnt Today:</strong> {todaysCalsBurnt} kcal</p>
            <p><strong>Total Intake Today:</strong> {todaysCalsIntake} kcal</p>
            <div style={{display:'flex', gap:'8px', alignItems:'flex-end', height:'100px', marginTop:'20px'}}>
               {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                 <div key={i} style={{flex:1, background: COLORS.primary, height:`${h}%`, borderRadius:'4px'}}></div>
               ))}
            </div>
            <p style={{fontSize: '10px', textAlign: 'center', marginTop: '10px', color: COLORS.textDim}}>Exercise Intensity across last 7 sessions</p>
          </div>
        </div>
      )}

      {/* RESTAURANT (TRIPLE PHASE NUTRITION) */}
      {view === 'app' && activeTab === 'restaurant' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary}}>Nutrition Journal</h2>
          {['Breakfast', 'Lunch', 'Dinner'].map(mealType => (
            <div key={mealType} style={{background: COLORS.card, padding: '15px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${COLORS.border}`}}>
              <div style={{display:'flex', alignItems:'center', gap: '8px', marginBottom:'10px'}}>
                <Fastfood style={{color: COLORS.primary}}/>
                <h4 style={{margin:0}}>{mealType}</h4>
              </div>
              <select onChange={(e) => {
                const foodName = e.target.value;
                const kcalVal = FOOD_DB[mealType.toLowerCase()][foodName];
                if(kcalVal) setFoodJournal([{date: today, name: foodName, kcal: kcalVal, meal: mealType}, ...foodJournal]);
              }} style={{width: '100%', background: COLORS.inputBg, color: '#fff', padding: '10px', border: `1px solid ${COLORS.border}`}}>
                <option>Select from 100+ items...</option>
                {Object.keys(FOOD_DB[mealType.toLowerCase()]).map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          ))}
          <h3 style={{fontSize: '14px', color: COLORS.textDim, marginTop: '20px'}}>Logged Today ({today})</h3>
          {foodJournal.filter(f => f.date === today).map((f, i) => (
            <div key={i} style={{background: COLORS.card, padding: '10px', borderRadius: '8px', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
              <span>{f.meal}: {f.name}</span>
              <strong style={{color: COLORS.primary}}>{f.kcal} kcal</strong>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE TAB */}
      {view === 'app' && activeTab === 'profile' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary}}>Edit Profile</h2>
          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
             <label style={{fontSize:'12px', color:COLORS.textDim}}>Weight (kg)</label>
             <input type="number" value={userData.weight} onChange={(e) => setUserData({...userData, weight: parseFloat(e.target.value)})} style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '12px', marginBottom: '15px'}} />
             
             <label style={{fontSize:'12px', color:COLORS.textDim}}>Injuries</label>
             <div style={{display: 'flex', gap: '8px', margin: '10px 0'}}>
              {['Knee', 'Back', 'Shoulder'].map(part => (
                <button key={part} onClick={() => toggleInjury(part)} style={{padding: '8px 16px', borderRadius: '20px', border: 'none', background: userData.injuries.includes(part) ? COLORS.danger : COLORS.inputBg, color: '#fff'}}>{part}</button>
              ))}
            </div>
            
            <label style={{fontSize:'12px', color:COLORS.textDim}}>Level</label>
            <select value={userData.level} onChange={(e) => setUserData({...userData, level: e.target.value})} style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '12px', marginTop: '10px', border: 'none'}}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>
      )}

      {/* GYM TAB (KEEPING YOUR EXACT EXISTING LOGIC) */}
      {view === 'app' && activeTab === 'gym' && (
        <div style={{padding: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>Training Center</h2>
            <div onClick={() => setIsTimerRunning(!isTimerRunning)} style={{display: 'flex', alignItems: 'center', background: '#1a1a1a', padding: '8px 15px', borderRadius: '20px', color: COLORS.primary, cursor: 'pointer', border: `1px solid ${COLORS.primary}`}}>
              <Timer style={{fontSize: '18px', marginRight: '5px'}} />
              <span>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
            </div>
          </div>
          <div style={{display: 'flex', gap: '8px', margin: '15px 0'}}>
            {['Home', 'Travel', 'Gym'].map(m => (
              <button key={m} onClick={() => setGymMode(m.toLowerCase())} style={{padding: '8px 16px', borderRadius: '20px', border: 'none', background: gymMode === m.toLowerCase() ? COLORS.primary : COLORS.card, color: gymMode === m.toLowerCase() ? '#000' : COLORS.textDim, fontWeight: 'bold'}}>{m}</button>
            ))}
          </div>
          {filteredEx.map((ex, i) => (
            <div key={i} style={{background: COLORS.card, padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: `5px solid ${COLORS.primary}`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <strong style={{fontSize: '16px', display: 'block'}}>{ex.name}</strong>
                  <span style={{fontSize: '12px', color: COLORS.primary, fontWeight: 'bold', background: 'rgba(0, 230, 118, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px'}}>
                    Suggested: {getVolumeSuggestion(userData.level)}
                  </span>
                  {/* --- ADDED: EXERCISE TIP --- */}
                  <div style={{fontSize: '11px', color: COLORS.textDim, marginTop: '6px', fontStyle: 'italic'}}>
                    💡 Tip: {ex.tip}
                  </div>
                </div>
                <span style={{fontSize: '12px', color: '#ffd700', display: 'flex', alignItems: 'center'}}><EmojiEvents style={{fontSize: '14px', marginRight: '2px'}}/> {pbs[ex.name] || 0}kg</span>
              </div>
              <div style={{margin: '12px 0 8px 0', display: 'flex', gap: '5px'}}>
                <input type="number" placeholder="Sets" style={{background: COLORS.inputBg, color: '#fff', border: `1px solid ${COLORS.border}`, width: '50px', padding: '6px', borderRadius: '4px'}} 
                  onChange={(e) => handleSessionUpdate(ex.name, 'sets', e.target.value)} />
                <input type="number" placeholder="Reps" style={{background: COLORS.inputBg, color: '#fff', border: `1px solid ${COLORS.border}`, width: '50px', padding: '6px', borderRadius: '4px'}} 
                  onChange={(e) => handleSessionUpdate(ex.name, 'reps', e.target.value)} />
                <input id={`pb-${i}`} type="number" placeholder="kg" style={{background: COLORS.inputBg, color: '#fff', border: `1px solid ${COLORS.border}`, width: '60px', padding: '6px', borderRadius: '4px'}} 
                  onChange={(e) => handleSessionUpdate(ex.name, 'weight', e.target.value)} />
                <button onClick={() => setPbs({...pbs, [ex.name]: document.getElementById(`pb-${i}`).value})} style={{background: COLORS.primary, color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold'}}><Save/></button>
              </div>
              {/* --- UPDATED: VIDEO & AI TRACKER BUTTONS --- */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                <div onClick={() => setActiveVideo(activeVideo === i ? null : i)} style={{fontSize: '12px', color: COLORS.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold'}}>
                  {activeVideo === i ? <Close style={{fontSize: '16px', marginRight: '4px'}}/> : <PlayCircleOutline style={{fontSize: '16px', marginRight: '4px'}}/>} 
                  {activeVideo === i ? 'Close Video' : 'Watch Form Guide'}
                </div>
                
                <div onClick={() => {setActiveAiExercise(ex); setAiReps(0); setAiModalOpen(true); speakFeedback(`Starting AI Tracker for ${ex.name}. Please step back.`);}} style={{fontSize: '12px', color: '#00d2ff', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', background: 'rgba(0, 210, 255, 0.1)', padding: '5px 10px', borderRadius: '20px', border: '1px solid #00d2ff'}}>
                  <PlayCircleOutline style={{fontSize: '16px', marginRight: '4px'}}/> START AI TRACKER
                </div>
              </div>

              {/* --- RESTORED: YOUTUBE VIDEO PLAYER --- */}
              {activeVideo === i && (
                <div style={{marginTop: '15px', borderRadius: '15px', overflow: 'hidden', background: '#000', height: '240px', border: `1px solid ${COLORS.border}`}}>
                   <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ex.embedId}`} title="Tutorial" frameBorder="0" allowFullScreen></iframe>
                </div>
              )}
            </div>
          ))}
          <button onClick={saveWorkout} style={{width: '100%', padding: '14px', background: COLORS.primary, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px'}}><CheckCircle style={{verticalAlign: 'middle', marginRight: '5px'}}/> Finish & Save Log</button>
        </div>
      )}

     {/* --- HISTORY TAB (GOOGLE FIT STYLE - CRASH FIXED) --- */}
      {view === 'app' && activeTab === 'history' && (() => {
        const historyMatchDate = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedSelectedDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const todaysHistory = history.filter(h => h.date === historyMatchDate);
        const totalBurnt = todaysHistory.reduce((sum, h) => sum + (h.burnt || 0), 0);

        return (
          <div style={{padding: '0', minHeight: '100vh', background: COLORS.bg}}>
            <div style={{padding: '20px 20px 0 20px'}}>
              <h2 style={{color: COLORS.text, fontSize: '22px', margin: 0, fontWeight: '500'}}>My activity</h2>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-around', borderBottom: `1px solid ${COLORS.border}`, marginTop: '20px'}}>
               {['Day', 'Week', 'Month'].map(tab => (
                 <div key={tab} onClick={() => setHistoryActiveTab(tab)} style={{padding: '12px 0', borderBottom: historyActiveTab === tab ? `3px solid ${COLORS.primary}` : 'none', color: historyActiveTab === tab ? COLORS.primary : COLORS.textDim, fontWeight: historyActiveTab === tab ? 'bold' : 'normal', cursor: 'pointer', flex: 1, textAlign: 'center'}}>
                   {tab}
                 </div>
               ))}
            </div>

            <div style={{padding: '20px'}}>
              {historyActiveTab === 'Day' && (
                <>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                    <span onClick={() => {const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d);}} style={{color: COLORS.textDim, fontSize: '24px', cursor: 'pointer', padding: '10px'}}>{"<"}</span>
                    <div style={{textAlign: 'center'}}>
                      <h3 style={{margin: 0, fontSize: '18px', color: COLORS.text, fontWeight: '500'}}>{formattedSelectedDate}</h3>
                      <span style={{fontSize: '13px', color: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '5px'}}>
                         <LocalFireDepartment style={{fontSize: '16px'}} /> {totalBurnt} kcal burnt
                      </span>
                    </div>
                    <span onClick={() => {const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d);}} style={{color: COLORS.textDim, fontSize: '24px', cursor: 'pointer', padding: '10px'}}>{">"}</span>
                  </div>

                  {todaysHistory.length === 0 ? (
                    <div style={{textAlign: 'center', marginTop: '40px', color: COLORS.textDim, fontSize: '14px', lineHeight: '1.6'}}>
                      <History style={{fontSize: '50px', color: '#222', marginBottom: '10px'}}/>
                      <p>No activity logged for this date.</p>
                      <p style={{color: COLORS.primary, cursor: 'pointer', marginTop: '20px', fontWeight: 'bold'}} onClick={() => setActiveTab('gym')}>Log Workout</p>
                    </div>
                  ) : todaysHistory.map((h, i) => (
                    <div key={i} style={{background: COLORS.card, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${COLORS.border}`}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: `1px solid #222`, paddingBottom: '10px'}}>
                        <strong style={{color: COLORS.text, fontSize: '16px'}}>{h.mode} Workout</strong>
                        <span style={{color: COLORS.textDim, fontSize: '12px'}}>{h.exercises ? h.exercises.length : 0} Exercises</span>
                      </div>
                      <ul style={{fontSize: '14px', color: COLORS.textDim, paddingLeft: '0', listStyle: 'none', margin: 0}}>
                        {/* SAFE MAP: Uses || [] to prevent crashes */}
                        {(h.exercises || []).map((ex, idx) => (
                          <li key={idx} style={{marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                              <span style={{color: '#fff', fontWeight: 'bold'}}>{ex.name}</span><br/>
                              <span style={{fontSize: '12px'}}>{ex.sets} Sets x {ex.reps} Reps</span>
                            </div>
                            <div style={{color: COLORS.primary, fontWeight: '900', fontSize: '18px'}}>
                              {ex.weight} <span style={{fontSize: '12px', color: COLORS.textDim}}>kg</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}

              {historyActiveTab !== 'Day' && (
                <div style={{textAlign: 'center', marginTop: '50px', color: COLORS.textDim}}>
                  <ShowChart style={{fontSize: '50px', color: '#222', marginBottom: '10px'}} />
                  <p>Graphical overview for {historyActiveTab} coming soon.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {/* --- ADDED: WEEKLY PLANNER TAB --- */}
      {view === 'app' && activeTab === 'planner' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary, fontWeight: '900', textTransform: 'uppercase'}}>Weekly Protocol</h2>
          
          {/* FITNESS SCORE & LEVEL CARD */}
          <div style={{background: 'linear-gradient(135deg, #111 0%, #003311 100%)', padding: '20px', borderRadius: '25px', marginBottom: '25px', border: `1px solid ${COLORS.primary}`}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <div>
                     <span style={{fontSize: '12px', color: COLORS.textDim}}>CURRENT RANK</span>
                     <h3 style={{margin: '0', color: '#fff', textTransform: 'uppercase'}}>{userData.level}</h3>
                 </div>
                 <div style={{textAlign: 'right'}}>
                     <span style={{fontSize: '12px', color: COLORS.textDim}}>FITNESS SCORE</span>
                     <h3 style={{margin: '0', color: COLORS.primary, fontSize: '24px'}}>{fitnessScore} <span style={{fontSize: '12px'}}>pts</span></h3>
                 </div>
             </div>
             <p style={{fontSize: '11px', color: '#ffd700', marginTop: '15px', fontStyle: 'italic'}}>
                 {WEEKLY_PLAN[userData.level].nextLevel}
             </p>
          </div>

          <h3 style={{fontSize: '15px', color: COLORS.textDim, marginBottom: '15px'}}>MONDAY - FRIDAY SPLIT</h3>
          
          {/* RENDER DAYS */}
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
              const dayData = WEEKLY_PLAN[userData.level][day];
              return (
                <div key={day} style={{background: COLORS.card, padding: '20px', borderRadius: '20px', marginBottom: '15px', borderLeft: `5px solid ${day === 'Wednesday' ? '#444' : COLORS.primary}`, borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <strong style={{color: day === 'Wednesday' ? COLORS.textDim : COLORS.primary, fontSize: '16px'}}>{day}</strong>
                      <span style={{fontSize: '11px', background: '#222', padding: '4px 10px', borderRadius: '10px', color: '#fff'}}>{dayData.muscle}</span>
                  </div>
                  
                  <div style={{marginBottom: '10px'}}>
                      <span style={{fontSize: '11px', color: COLORS.textDim, display: 'block'}}>EXERCISES TO DO:</span>
                      <span style={{fontSize: '14px', color: '#fff'}}>{dayData.exercises}</span>
                  </div>
                  
                  <div>
                      <span style={{fontSize: '11px', color: COLORS.textDim, display: 'block'}}>DIET FOCUS:</span>
                      <span style={{fontSize: '13px', color: '#00d2ff'}}>{dayData.diet}</span>
                  </div>
                </div>
              )
          })}
        </div>
      )}

      {/* NAVIGATION */}
      {view === 'app' && (
        <nav style={{position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'space-around', background: '#000', padding: '15px 0', borderTop: `1px solid ${COLORS.border}`}}>
          <button onClick={() => setActiveTab('home')} style={{background: 'none', border: 'none', color: activeTab === 'home' ? COLORS.primary : COLORS.textDim}}><Home /></button>
          <button onClick={() => setActiveTab('gym')} style={{background: 'none', border: 'none', color: activeTab === 'gym' ? COLORS.primary : COLORS.textDim}}><FitnessCenter /></button>
          <button onClick={() => setActiveTab('restaurant')} style={{background: 'none', border: 'none', color: activeTab === 'restaurant' ? COLORS.primary : COLORS.textDim}}><Restaurant /></button>
          <button onClick={() => setActiveTab('history')} style={{background: 'none', border: 'none', color: activeTab === 'history' ? COLORS.primary : COLORS.textDim}}><History /></button>
        </nav>
      )}

      {/* --- ADDED: AI FORM TRACKER CAMERA MODAL --- */}
      {aiModalOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.98)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px'}}>
          
          {/* UPDATED CLOSE BUTTON triggers Auto-Save */}
          <Close onClick={handleStopAiTracker} style={{position: 'absolute', right: 20, top: 20, color: COLORS.danger, cursor: 'pointer', fontSize: '32px'}} />
          
          <h2 style={{color: COLORS.primary, marginTop: '10px', fontWeight: '900', textTransform: 'uppercase'}}>{activeAiExercise?.name}</h2>
          {/* CAMERA FEED & CANVAS OVERLAY CONTAINER */}
          <div style={{position: 'relative', width: '100%', maxWidth: '400px', height: '400px', background: '#111', borderRadius: '20px', overflow: 'hidden', border: `3px solid ${COLORS.primary}`, boxShadow: `0 0 20px ${COLORS.primary}40`}}>
            
            {/* Real Video Feed */}
            <video ref={videoRef} playsInline muted style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)'}}></video>
            
            {/* AI Drawing Layer */}
            <canvas ref={canvasRef} width="400" height="400" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)'}}></canvas>
            
            {/* LIVE OVERLAY METRICS */}
            <div style={{position: 'absolute', bottom: 15, left: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
              <div style={{background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '15px', border: `1px solid ${COLORS.primary}`}}>
                <span style={{color: COLORS.textDim, fontSize: '10px', fontWeight: 'bold', display: 'block', letterSpacing: '1px'}}>AUTO REPS</span>
                <span style={{color: '#fff', fontSize: '38px', fontWeight: '900'}}>{aiReps}</span>
              </div>
            </div>
          </div>
          
          {/* NEW: END & SAVE BUTTON */}
          <button onClick={handleStopAiTracker} style={{background: COLORS.primary, color: '#000', border: 'none', padding: '10px 30px', borderRadius: '30px', fontWeight: '900', fontSize: '16px', marginBottom: '20px', boxShadow: `0 0 15px ${COLORS.primary}80`}}>
            <Save style={{verticalAlign: 'middle', marginRight: '5px'}}/> END & AUTO-SAVE
          </button>

          {/* NEW: INSTRUCTIONS */}
          <p style={{color: COLORS.textDim, fontSize: '12px', margin: '0 0 10px 0', textAlign: 'center'}}>Click the button above to end tracking and auto-save your workout.</p>
          
          {/* AI VOICE FEEDBACK BOX */}
          <div style={{background: COLORS.card, width: '100%', maxWidth: '400px', padding: '20px', borderRadius: '20px', marginTop: '20px', border: `1px solid ${COLORS.border}`, textAlign: 'center'}}>
            <h4 style={{color: COLORS.textDim, margin: '0 0 10px 0', fontSize: '12px', letterSpacing: '1px'}}>AI AUDIO FEEDBACK</h4>
            <p style={{color: aiFeedback.includes('Arch') ? COLORS.danger : '#ffd700', fontSize: '18px', fontWeight: 'bold', margin: 0}}>
              {aiFeedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}