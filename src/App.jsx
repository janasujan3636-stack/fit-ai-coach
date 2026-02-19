import React, { useState, useEffect } from 'react';
import { Home, FitnessCenter, Restaurant, History, PlayCircleOutline, Timer, EmojiEvents, Save, CheckCircle, ListAlt, Star, Person, Close } from '@mui/icons-material';

const EXERCISE_DATA = {
  home: [
    { name: "Pushups", avoid: ["Shoulder"], tip: "Keep elbows at 45 degrees", embedId: "IODxDxX7oi4" },
    { name: "Bodyweight Squats", avoid: ["Knee"], tip: "Keep chest up, weight on heels", embedId: "aclHkVaku9U" },
    { name: "Plank", avoid: ["Back"], tip: "Straight line from head to heels", embedId: "pvIjsGZXp_w" },
    { name: "Glute Bridges", avoid: ["Back"], tip: "Squeeze glutes at the top", embedId: "wPM8icPu6H8" },
    { name: "Mountain Climbers", avoid: ["Shoulder", "Back"], tip: "Drive knees toward chest", embedId: "nmwgirgXLYM" },
    { name: "Crunches", avoid: ["Back"], tip: "Lift shoulders, not neck", embedId: "Xyd_fa5zoEU" },
    { name: "Diamond Pushups", avoid: ["Shoulder"], tip: "Form a diamond with hands", embedId: "J0DnG1_S92I" }
  ],
  travel: [
    { name: "Burpees", avoid: ["Knee", "Shoulder"], tip: "Explosive movement", embedId: "dZfeV7UAqS4" },
    { name: "Lunges", avoid: ["Knee"], tip: "Back knee almost touches floor", embedId: "QOVaHwm-Q6U" },
    { name: "Shadow Boxing", avoid: ["Shoulder"], tip: "Hands up, light feet", embedId: "7O_L9n2841M" },
    { name: "Wall Sit", avoid: ["Knee"], tip: "90-degree angle at knees", embedId: "y-wV4Venusw" },
    { name: "Superman", avoid: ["Back"], tip: "Lift chest and legs simultaneously", embedId: "z6PJMT2y8GQ" },
    { name: "Jumping Jacks", avoid: ["Knee"], tip: "Land softly on balls of feet", embedId: "nGaXj3kkmrU" }
  ],
  gym: [
    { name: "Bench Press", avoid: ["Shoulder"], tip: "Bar to mid-chest level", embedId: "rT7DgCr-3pg" },
    { name: "Deadlifts", avoid: ["Back"], tip: "Drive through heels, neutral spine", embedId: "op9kVnSso6Q" },
    { name: "Lat Pulldowns", avoid: ["Shoulder"], tip: "Pull to upper chest", embedId: "CAwf7n6Luuc" },
    { name: "Leg Press", avoid: ["Knee"], tip: "Don't lock your knees at the top", embedId: "IZxyjW7MPJQ" },
    { name: "Shoulder Press", avoid: ["Shoulder"], tip: "Don't arch your back", embedId: "2yjwxtZ_kNo" },
    { name: "Bicep Curls", avoid: [], tip: "Keep elbows pinned to sides", embedId: "ykJmrZ5v0Oo" },
    { name: "Tricep Extensions", avoid: ["Shoulder"], tip: "Full extension at the top", embedId: "nRiJVZDpdL0" },
    { name: "Incline Bench", avoid: ["Shoulder"], tip: "Focus on upper chest", embedId: "SrqOu55lr6A" },
    { name: "Seated Rows", avoid: ["Back"], tip: "Squeeze shoulder blades", embedId: "GZbfZ033f74" }
  ]
};

const FOOD_DB = { "banana": 89, "apple": 95, "egg": 78, "chicken breast": 165, "rice": 130, "roti": 104, "paneer": 265, "milk": 120 };

// THEME CONSTANTS
const COLORS = {
  bg: '#000000',
  card: '#111111',
  text: '#ffffff',
  textDim: '#888888',
  primary: '#00e676', // Neon Green
  border: '#222222',
  inputBg: '#1a1a1a',
  danger: '#ff4444'
};

export default function App() {
  const [view, setView] = useState('auth');
  const [activeTab, setActiveTab] = useState('home');
  const [gymMode, setGymMode] = useState('gym');
  
  // ADDED LEVEL TO USER DATA
  const [userData, setUserData] = useState({ name: "", weight: "", height: "", injuries: [], level: "beginner" });
  
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pbs, setPbs] = useState({});
  const [currentSessionDetails, setCurrentSessionDetails] = useState({}); // Updated to hold Sets, Reps & Weight
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
    setUserData(prev => ({
      ...prev,
      injuries: prev.injuries.includes(part) ? prev.injuries.filter(i => i !== part) : [...prev.injuries, part]
    }));
  };

  const handleSessionUpdate = (exName, field, value) => {
    setCurrentSessionDetails(prev => ({
      ...prev,
      [exName]: { ...prev[exName], [field]: value }
    }));
  };

  // SMART SUGGESTION BASED ON LEVEL
  const getVolumeSuggestion = (level) => {
    if (level === 'pro') return "4 Sets × 12-15 Reps";
    if (level === 'intermediate') return "3 Sets × 10-12 Reps";
    return "2 Sets × 8-10 Reps";
  };

  const filteredEx = EXERCISE_DATA[gymMode].filter(ex => !ex.avoid.some(i => userData.injuries.includes(i)));
  const todaysCals = foodJournal.filter(f => f.date === today).reduce((sum, f) => sum + f.kcal, 0);

  const saveWorkout = () => {
    const doneWorkouts = Object.entries(currentSessionDetails)
      .filter(([name, data]) => data.weight || data.sets || data.reps)
      .map(([name, data]) => `${name} (${data.sets || 0}s × ${data.reps || 0}r @ ${data.weight || 0}kg)`);
      
    if (doneWorkouts.length === 0) return alert("Enter sets, reps, or weights to save history.");
    
    setHistory([{ date: today, mode: gymMode.toUpperCase(), details: doneWorkouts }, ...history]);
    setCurrentSessionDetails({});
    setActiveTab('home');
    setSeconds(0);
    setIsTimerRunning(false);
  };

  return (
    <div style={{background: COLORS.bg, color: COLORS.text, minHeight: '100vh', maxWidth: '480px', margin: 'auto', paddingBottom: '90px', fontFamily: 'Roboto, sans-serif'}}>
      
      {/* 1. AUTH SCREEN */}
      {view === 'auth' && (
        <div style={{padding: '40px 20px', textAlign: 'center'}}>
          <h1 style={{color: COLORS.primary, fontSize: '32px', textShadow: `0 0 10px ${COLORS.primary}`}}>FitAI</h1>
          <p style={{color: COLORS.textDim, marginBottom: '40px'}}>The Smart Trainer for Poor Gymers</p>
          <div style={{background: COLORS.card, padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
            <input type="email" placeholder="Email" style={{background: COLORS.inputBg, color: COLORS.text, width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            <input type="password" placeholder="Password" style={{background: COLORS.inputBg, color: COLORS.text, width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            <button onClick={() => setView('onboarding')} style={{width: '100%', padding: '14px', background: COLORS.primary, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>Login</button>
          </div>
        </div>
      )}

      {/* 2. ONBOARDING SCREEN */}
      {view === 'onboarding' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary}}>Profile Setup</h2>
          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', marginTop: '20px', border: `1px solid ${COLORS.border}`}}>
            <input placeholder="Name" onChange={(e) => setUserData({...userData, name: e.target.value})} style={{background: COLORS.inputBg, color: COLORS.text, width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            
            <div style={{display: 'flex', gap: '10px'}}>
               <input placeholder="Weight (kg)" type="number" onChange={(e) => setUserData({...userData, weight: e.target.value})} style={{background: COLORS.inputBg, color: COLORS.text, flex: 1, padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
               <input placeholder="Height (cm)" type="number" onChange={(e) => setUserData({...userData, height: e.target.value})} style={{background: COLORS.inputBg, color: COLORS.text, flex: 1, padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            </div>

            <select onChange={(e) => setUserData({...userData, level: e.target.value})} style={{background: COLORS.inputBg, color: COLORS.text, width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}}>
              <option value="beginner">Beginner Level</option>
              <option value="intermediate">Intermediate Level</option>
              <option value="pro">Pro Level</option>
            </select>

            <p style={{fontSize: '14px', fontWeight: 'bold', color: COLORS.textDim}}>Injuries (Auto-Filter):</p>
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
        <div style={{padding: '20px'}}>
          <h1>Welcome, <span style={{color: COLORS.primary}}>{userData.name}</span>!</h1>
          
          <div style={{background: COLORS.card, padding: '25px', borderRadius: '25px', textAlign: 'center', margin: '15px 0', border: `1px solid ${COLORS.border}`, boxShadow: `0 0 15px rgba(0, 230, 118, 0.1)`}}>
            <h2 style={{fontSize: '42px', margin: 0, color: COLORS.primary, textShadow: `0 0 5px ${COLORS.primary}`}}>4,230</h2>
            <p style={{color: COLORS.textDim}}>Steps Today</p>
          </div>

          <div style={{background: COLORS.card, padding: '15px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginBottom: '20px'}}>
            <span style={{fontSize: '11px', fontWeight: 'bold', color: COLORS.primary}}>CALORIES TODAY</span>
            <h3 style={{margin: '5px 0'}}>{todaysCals} kcal</h3>
          </div>

          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginBottom: '20px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                <ListAlt style={{color: COLORS.primary}}/>
                <h3 style={{fontSize: '16px', margin:0}}>Last Session</h3>
            </div>
            {history.length > 0 ? (
                <div>
                    <p style={{fontSize: '14px', fontWeight: 'bold', color: COLORS.text}}>{history[0].date} • <span style={{color: COLORS.primary}}>{history[0].mode}</span></p>
                    <ul style={{fontSize: '13px', color: COLORS.textDim, paddingLeft: '15px', marginTop: '5px'}}>
                        {history[0].details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                </div>
            ) : <p style={{fontSize: '13px', color: COLORS.textDim}}>Record a session to see it here.</p>}
          </div>

          <h3 style={{fontSize: '16px', marginBottom: '10px', color: COLORS.textDim}}>Pro Access</h3>
          <div style={{background: `linear-gradient(135deg, ${COLORS.card}, #003300)`, color: '#fff', padding: '15px', borderRadius: '15px', border: `1px solid ${COLORS.primary}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}><Star style={{fontSize: '16px', color: COLORS.primary}}/> FitAI Pro</div>
              <p style={{fontSize: '12px', margin: '10px 0', color: '#ccc'}}>AI Posture Analysis & Advanced Injury Logic.</p>
              <button style={{width: '100%', padding: '8px', background: COLORS.primary, color: '#000', borderRadius: '8px', border: 'none', fontWeight: 'bold'}}>Upgrade ₹199</button>
          </div>
        </div>
      )}

      {/* --- PROFILE TAB --- */}
      {view === 'app' && activeTab === 'profile' && (
        <div style={{padding: '20px'}}>
          <h2 style={{color: COLORS.primary}}>Your Profile</h2>
          <div style={{background: COLORS.card, padding: '20px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Weight:</strong> {userData.weight} kg</p>
            <p><strong>Height:</strong> {userData.height} cm</p>
            <p><strong>Filtered Injuries:</strong> {userData.injuries.length > 0 ? userData.injuries.join(', ') : 'None'}</p>
            
            <label style={{display: 'block', marginTop: '20px', color: COLORS.primary, fontWeight: 'bold'}}>Current Fitness Level:</label>
            <p style={{fontSize: '12px', color: COLORS.textDim}}>This changes the AI Set/Rep suggestions in the Training tab.</p>
            <select 
              value={userData.level}
              onChange={(e) => setUserData({...userData, level: e.target.value})} 
              style={{background: COLORS.inputBg, color: COLORS.text, width: '100%', padding: '12px', marginTop: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>
      )}

      {/* --- GYM TAB --- */}
      {view === 'app' && activeTab === 'gym' && (
        <div style={{padding: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>Training</h2>
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
            <div key={i} style={{background: COLORS.card, padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: `5px solid ${COLORS.primary}`, borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`}}>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <strong style={{fontSize: '16px', display: 'block'}}>{ex.name}</strong>
                  {/* DYNAMIC SUGGESTION BASED ON PROFILE LEVEL */}
                  <span style={{fontSize: '12px', color: COLORS.primary, fontWeight: 'bold', background: 'rgba(0, 230, 118, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px'}}>
                    Suggested: {getVolumeSuggestion(userData.level)}
                  </span>
                </div>
                <span style={{fontSize: '12px', color: '#ffd700', display: 'flex', alignItems: 'center'}}><EmojiEvents style={{fontSize: '14px', marginRight: '2px'}}/> {pbs[ex.name] || 0}kg</span>
              </div>
              
              {/* CUSTOM INPUTS FOR SETS, REPS, WEIGHT */}
              <div style={{margin: '12px 0 8px 0', display: 'flex', gap: '5px'}}>
                <input type="number" placeholder="Sets" style={{background: COLORS.inputBg, color: '#fff', border: `1px solid ${COLORS.border}`, width: '50px', padding: '6px', borderRadius: '4px'}} 
                  onChange={(e) => handleSessionUpdate(ex.name, 'sets', e.target.value)} />
                <input type="number" placeholder="Reps" style={{background: COLORS.inputBg, color: '#fff', border: `1px solid ${COLORS.border}`, width: '50px', padding: '6px', borderRadius: '4px'}} 
                  onChange={(e) => handleSessionUpdate(ex.name, 'reps', e.target.value)} />
                <input id={`pb-${i}`} type="number" placeholder="kg" style={{background: COLORS.inputBg, color: '#fff', border: `1px solid ${COLORS.border}`, width: '60px', padding: '6px', borderRadius: '4px'}} 
                  onChange={(e) => handleSessionUpdate(ex.name, 'weight', e.target.value)} />
                <button onClick={() => setPbs({...pbs, [ex.name]: document.getElementById(`pb-${i}`).value})} style={{background: COLORS.primary, color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold'}}><Save/></button>
              </div>
              
              {/* VIDEO TOGGLE */}
              <div onClick={() => setActiveVideo(activeVideo === i ? null : i)} style={{fontSize: '12px', color: COLORS.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', marginTop: '8px'}}>
                {activeVideo === i ? <Close style={{fontSize: '16px', marginRight: '4px'}}/> : <PlayCircleOutline style={{fontSize: '16px', marginRight: '4px'}}/>} 
                {activeVideo === i ? 'Close Video' : 'Watch Form Guide'}
              </div>
              
              {/* IFRAME */}
              {activeVideo === i && (
                <div style={{marginTop: '10px', borderRadius: '8px', overflow: 'hidden', background: '#000', height: '200px', border: `1px solid ${COLORS.border}`}}>
                   <iframe 
                     width="100%" height="100%" 
                     src={`https://www.youtube.com/embed/${ex.embedId}`} 
                     title="YouTube video player" frameBorder="0" 
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                     allowFullScreen>
                   </iframe>
                </div>
              )}
            </div>
          ))}
          <button onClick={saveWorkout} style={{width: '100%', padding: '14px', background: COLORS.primary, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px'}}><CheckCircle style={{verticalAlign: 'middle', marginRight: '5px'}} /> Finish & Save Log</button>
        </div>
      )}

      {/* --- RESTAURANT TAB --- */}
      {view === 'app' && activeTab === 'restaurant' && (
        <div style={{padding: '20px'}}>
          <h2>Nutrition Log</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const n = e.target.food.value.toLowerCase();
            const q = parseInt(e.target.qty.value) || 1;
            if(FOOD_DB[n]) setFoodJournal([{date: today, name: n, kcal: FOOD_DB[n]*q, qty: q}, ...foodJournal]);
            e.target.reset();
          }} style={{background: COLORS.card, padding: '20px', borderRadius: '20px', marginBottom: '20px', border: `1px solid ${COLORS.border}`}}>
            <input name="food" placeholder="Food item (Banana, Roti...)" style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            <input name="qty" type="number" placeholder="Quantity" style={{background: COLORS.inputBg, color: '#fff', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} />
            <button type="submit" style={{width: '100%', padding: '12px', background: COLORS.primary, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold'}}>Log Meal</button>
          </form>
          <h3 style={{color: COLORS.textDim}}>Today's Meals ({today})</h3>
          {foodJournal.filter(f => f.date === today).map((f, i) => (
            <div key={i} style={{background: COLORS.card, padding: '12px', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${COLORS.border}`}}>{f.qty}x {f.name} <strong style={{color: COLORS.primary}}>{f.kcal} kcal</strong></div>
          ))}
        </div>
      )}

      {/* --- HISTORY TAB --- */}
      {view === 'app' && activeTab === 'history' && (
        <div style={{padding: '20px'}}>
          <h2>Workout History</h2>
          {history.length === 0 ? <p style={{color: COLORS.textDim}}>No records found.</p> : history.map((h, i) => (
            <div key={i} style={{background: COLORS.card, padding: '15px', borderRadius: '15px', marginBottom: '10px', border: `1px solid ${COLORS.border}`}}>
              <strong style={{color: COLORS.primary}}>{h.date} • {h.mode}</strong>
              <ul style={{fontSize: '13px', color: COLORS.textDim, marginTop: '5px', paddingLeft:'15px'}}>
                {h.details.map((detail, idx) => <li key={idx}>{detail}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* --- NAVIGATION (UPDATED WITH PROFILE) --- */}
      {view === 'app' && (
        <nav style={{position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'space-around', background: '#000', padding: '15px 0', borderTop: `1px solid ${COLORS.border}`}}>
          <button onClick={() => setActiveTab('home')} style={{background: 'none', border: 'none', color: activeTab === 'home' ? COLORS.primary : COLORS.textDim}}><Home /></button>
          <button onClick={() => setActiveTab('gym')} style={{background: 'none', border: 'none', color: activeTab === 'gym' ? COLORS.primary : COLORS.textDim}}><FitnessCenter /></button>
          <button onClick={() => setActiveTab('restaurant')} style={{background: 'none', border: 'none', color: activeTab === 'restaurant' ? COLORS.primary : COLORS.textDim}}><Restaurant /></button>
          <button onClick={() => setActiveTab('history')} style={{background: 'none', border: 'none', color: activeTab === 'history' ? COLORS.primary : COLORS.textDim}}><History /></button>
          <button onClick={() => setActiveTab('profile')} style={{background: 'none', border: 'none', color: activeTab === 'profile' ? COLORS.primary : COLORS.textDim}}><Person /></button>
        </nav>
      )}
    </div>
  );
}