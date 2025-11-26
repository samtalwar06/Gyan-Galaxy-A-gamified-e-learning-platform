
import React, { useState, useEffect, useRef } from 'react';
import { Screen, Profile, Subject, ShopItem, AgeGroup, ParentAccount, Achievement } from './types';
import { MOCK_PROFILES, SHOP_ITEMS, SUBJECTS_CONFIG, INITIAL_ACHIEVEMENTS, MOCK_PARENTS } from './constants';
import { Button } from './components/Button';
import { GeminiService } from './services/gemini';
import { Home, BookOpen, Star, ShoppingBag, Award, Mic, Settings, User, LogOut, ArrowLeft, Play, Lock, CheckCircle, Volume2, Coins, RotateCw, ArrowUp, RefreshCw, X, ChevronRight, Clock, UserPlus, Users, AlertTriangle, Minus, Plus } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- SUB-COMPONENTS ---

// 0. Notification Banner
const NotificationBanner: React.FC<{ title: string; message: string; onClose: () => void }> = ({ title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-4 right-4 z-[100] bg-white border-l-4 border-yellow-400 rounded-xl shadow-2xl p-4 animate-bounce-slight flex items-center gap-4">
      <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
        <Award size={28} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
    </div>
  );
};

// 1. Splash Screen
const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white p-6">
      <div className="text-8xl mb-6 animate-bounce-slight">🚀</div>
      <h1 className="text-5xl font-bold tracking-tight mb-2">Gyan Galaxy</h1>
      <p className="text-indigo-200 text-xl font-bold">Learn. Play. Grow.</p>
    </div>
  );
};

// 1.5 Parent Select (Family Login)
const ParentSelect: React.FC<{ 
  parents: ParentAccount[]; 
  onSelect: (p: ParentAccount) => void;
  onCreate: () => void;
}> = ({ parents, onSelect, onCreate }) => {
  return (
    <div className="h-full w-full bg-background p-6 flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-center mb-2 text-primary">Welcome Back!</h2>
      <p className="text-center text-gray-500 mb-10">Choose your family account</p>
      
      <div className="grid grid-cols-1 gap-4 mb-8">
        {parents.map((parent) => (
          <button 
            key={parent.id}
            onClick={() => onSelect(parent)}
            className="bg-white rounded-2xl p-6 shadow-md shadow-indigo-100 flex items-center gap-4 transition-transform hover:scale-105 active:scale-95 border border-transparent hover:border-indigo-100"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
               <Users size={32} />
            </div>
            <div className="text-left">
              <span className="font-bold text-xl text-gray-800 block">{parent.name}</span>
              <span className="text-sm text-gray-400 font-medium">Tap to login</span>
            </div>
            <ChevronRight className="ml-auto text-gray-300" />
          </button>
        ))}
      </div>

      <Button variant="outline" fullWidth onClick={onCreate}>
        <UserPlus size={20} /> Create New Family
      </Button>
    </div>
  );
};

// 2. Parent Auth (Secure Login)
const ParentAuth: React.FC<{ 
  parent: ParentAccount;
  onSuccess: () => void; 
  onBack: () => void;
  mode?: 'dashboard' | 'select_profile'; 
}> = ({ parent, onSuccess, onBack, mode = 'select_profile' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === parent.pin) { 
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="h-full bg-slate-900 text-white p-6 flex flex-col">
      <button onClick={onBack} className="self-start text-slate-400 mb-8"><ArrowLeft /></button>
      
      <div className="flex-1 flex flex-col items-center justify-center max-w-xs mx-auto w-full">
        <div className="bg-slate-800 p-4 rounded-full mb-6">
          <Lock className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{parent.name}</h2>
        <p className="text-slate-400 mb-8 text-center">
          {mode === 'dashboard' ? 'Enter PIN for Settings' : 'Enter PIN to unlock profiles'}
        </p>

        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? (error ? 'bg-red-500' : 'bg-indigo-500') : 'bg-slate-700'}`}></div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onClick={() => handlePress(num.toString())} className="h-16 rounded-2xl bg-slate-800 text-2xl font-bold active:bg-slate-700 transition-colors shadow-lg shadow-slate-950/50">
              {num}
            </button>
          ))}
          <div className="h-16"></div>
          <button onClick={() => handlePress('0')} className="h-16 rounded-2xl bg-slate-800 text-2xl font-bold active:bg-slate-700 transition-colors shadow-lg shadow-slate-950/50">0</button>
          <button onClick={handleDelete} className="h-16 rounded-2xl bg-slate-800 flex items-center justify-center active:bg-slate-700 transition-colors shadow-lg shadow-slate-950/50"><X /></button>
        </div>
      </div>
    </div>
  );
};

// 3. Profile Selection
const ProfileSelect: React.FC<{ 
  profiles: Profile[];
  onSelectProfile: (p: Profile) => void;
  onParentLogin: () => void;
  onCreateProfile: () => void;
  onBack: () => void;
}> = ({ profiles, onSelectProfile, onParentLogin, onCreateProfile, onBack }) => {
  return (
    <div className="h-full w-full bg-background p-6 flex flex-col justify-center relative">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm"><ArrowLeft className="text-gray-600" /></button>
      
      <h2 className="text-3xl font-bold text-center mb-10 text-primary">Who is playing?</h2>
      <div className="grid grid-cols-2 gap-6 mb-12">
        {profiles.map((profile) => (
          <button 
            key={profile.id}
            onClick={() => onSelectProfile(profile)}
            className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100 flex flex-col items-center gap-4 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full border-4 border-indigo-100" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                Lvl {Math.floor(profile.xp / 100)}
              </div>
            </div>
            <div className="text-center">
              <span className="font-bold text-xl text-gray-800 block">{profile.name}</span>
              <span className="text-xs text-gray-500 font-medium">{profile.ageGroup} years</span>
            </div>
          </button>
        ))}
        {/* Add Child Placeholder */}
        <button 
          onClick={onCreateProfile}
          className="bg-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 opacity-60 border-2 border-dashed border-gray-300 hover:opacity-100 transition-opacity"
        >
           <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">+</div>
           <span className="font-semibold text-gray-500">New Profile</span>
        </button>
      </div>
      
      <div className="mt-auto">
        <Button variant="ghost" fullWidth onClick={onParentLogin}>
          <div className="flex items-center gap-2 text-gray-400">
             <Settings className="w-4 h-4" /> Parent Dashboard
          </div>
        </Button>
      </div>
    </div>
  );
};

// 3.5 Create Profile
const CreateProfile: React.FC<{ onBack: () => void; onCreate: (p: Profile) => void }> = ({ onBack, onCreate }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(Math.floor(Math.random() * 1000).toString());
  const [favSubject, setFavSubject] = useState<Subject>(Subject.MATH);

  const handleNext = () => {
    if (step === 1 && name && age) setStep(2);
  };

  const handleCreate = () => {
    const ageNum = parseInt(age);
    const newProfile: Profile = {
      id: Date.now().toString(),
      // parentId will be injected by App
      name,
      age: ageNum,
      ageGroup: ageNum < 9 ? AgeGroup.JUNIOR : AgeGroup.SENIOR,
      avatar: `https://picsum.photos/seed/${avatarSeed}/150/150`,
      coins: 0,
      xp: 0,
      streak: 1,
      completedLessons: [],
      achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
      inventory: [],
      favoriteSubject: favSubject,
      dailyTimeLimit: 60,
      usageToday: 0,
      lastUsageDate: new Date().toISOString().split('T')[0]
    };
    onCreate(newProfile);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-6 flex items-center gap-2 border-b border-gray-100">
        <button onClick={step === 1 ? onBack : () => setStep(1)}><ArrowLeft className="text-gray-600" /></button>
        <h2 className="text-xl font-bold text-gray-800">New Explorer</h2>
        <div className="ml-auto text-sm font-bold text-indigo-500">Step {step}/2</div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {step === 1 ? (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-primary mb-2">What's your name?</h3>
               <p className="text-gray-500">We'll create a special galaxy ID for you!</p>
             </div>
             <div>
              <label className="block text-gray-700 font-bold mb-2">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Type your name..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Age</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="How old are you?"
              />
            </div>
            <div className="pt-4">
              <Button onClick={handleNext} disabled={!name || !age} size="lg" fullWidth className="group">
                Next Step <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20}/>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-primary mb-2">Pick your Look & Love</h3>
               <p className="text-gray-500">Choose an avatar and favorite subject!</p>
             </div>

             <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="relative">
                   <img src={`https://picsum.photos/seed/${avatarSeed}/150/150`} className="w-32 h-32 rounded-full border-4 border-indigo-100 shadow-md bg-white" alt="Avatar" />
                   <button 
                    onClick={() => setAvatarSeed(Math.random().toString())} 
                    className="absolute bottom-0 right-0 bg-indigo-500 text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
                   >
                     <RefreshCw size={18}/>
                   </button>
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase">Tap icon to randomize</span>
             </div>

             <div>
               <label className="block text-gray-700 font-bold mb-3">Favorite Subject</label>
               <div className="grid grid-cols-2 gap-3">
                 {SUBJECTS_CONFIG.map(sub => (
                   <button 
                    key={sub.id}
                    onClick={() => setFavSubject(sub.id)}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${favSubject === sub.id ? 'border-primary bg-indigo-50 text-primary shadow-sm' : 'border-gray-100 text-gray-600'}`}
                   >
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${sub.color} text-white`}>{sub.icon}</div>
                     <span className="font-bold text-sm">{sub.id.split(' ')[0]}</span>
                   </button>
                 ))}
               </div>
             </div>

             <Button onClick={handleCreate} size="lg" fullWidth variant="secondary">Launch Gyan Galaxy 🚀</Button>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Child Dashboard
const ChildDashboard: React.FC<{ 
  profile: Profile; 
  onNavigate: (s: Screen, params?: any) => void; 
}> = ({ profile, onNavigate }) => {
  return (
    <div className="pb-32 pt-6 px-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hi, {profile.name}! 👋</h2>
          <p className="text-gray-500">Ready to learn {profile.favoriteSubject}?</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 pl-3 pr-4 py-1.5 rounded-full border border-yellow-200 shadow-sm">
          <div className="bg-yellow-400 rounded-full p-1"><Coins className="w-4 h-4 text-yellow-900" /></div>
          <span className="font-bold text-yellow-800">{profile.coins}</span>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl p-5 text-white mb-8 shadow-lg shadow-orange-200/50 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <p className="font-bold text-orange-100 text-sm uppercase tracking-wider mb-1">Daily Streak</p>
          <div className="text-4xl font-bold flex items-center gap-2">
            {profile.streak} Days <span className="text-2xl">🔥</span>
          </div>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl relative z-10 backdrop-blur-sm">
          <Award className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div onClick={() => onNavigate(Screen.SPEAKING_COACH)} className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition shadow-sm">
          <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-200"><Mic className="w-6 h-6" /></div>
          <span className="font-bold text-blue-900 text-xs text-center leading-tight">Speaking<br/>Coach</span>
        </div>
        <div onClick={() => onNavigate(Screen.MINI_SHOP)} className="bg-purple-50 border border-purple-100 p-3 rounded-2xl flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition shadow-sm">
          <div className="bg-purple-500 text-white p-3 rounded-xl shadow-lg shadow-purple-200"><ShoppingBag className="w-6 h-6" /></div>
          <span className="font-bold text-purple-900 text-xs text-center leading-tight">Mini<br/>Shop</span>
        </div>
        <div onClick={() => onNavigate(Screen.CODING_PUZZLE)} className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition shadow-sm">
          <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-200"><RotateCw className="w-6 h-6" /></div>
          <span className="font-bold text-emerald-900 text-xs text-center leading-tight">Logic<br/>Lab</span>
        </div>
      </div>

      {/* Recommended for You */}
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" /> Start Learning
      </h3>
      <div className="space-y-3">
        {SUBJECTS_CONFIG.slice(0, 3).map((sub) => (
          <div 
            key={sub.id} 
            onClick={() => onNavigate(Screen.LESSON_PLAYER, { subject: sub.id })}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div className={`w-14 h-14 ${sub.color} rounded-2xl flex items-center justify-center text-2xl shadow-md text-white`}>
              {sub.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-lg">{sub.id}</h4>
              <p className="text-xs text-gray-400">Recommended for you</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
               <Play className="w-5 h-5 ml-1" />
            </div>
          </div>
        ))}
        <Button variant="ghost" fullWidth onClick={() => onNavigate(Screen.SUBJECT_SELECT)}>View All Subjects</Button>
      </div>
    </div>
  );
};

// 4.1 Subject Select Screen
const SubjectSelectScreen: React.FC<{ onNavigate: (s: Screen, params?: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="pb-32 pt-6 px-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Subjects</h2>
      <div className="grid grid-cols-1 gap-4">
        {SUBJECTS_CONFIG.map((sub) => (
          <div 
            key={sub.id} 
            onClick={() => onNavigate(Screen.LESSON_PLAYER, { subject: sub.id })}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className={`w-16 h-16 ${sub.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg text-white`}>
              {sub.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-xl">{sub.id}</h4>
              <p className="text-sm text-gray-500">Tap to start lesson</p>
            </div>
            <ChevronRight className="text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 4.2 Achievements Screen
const AchievementsScreen: React.FC<{ profile: Profile }> = ({ profile }) => {
  return (
    <div className="pb-32 pt-6 px-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Trophies</h2>
        <div className="text-right">
           <span className="block text-3xl font-bold text-primary">{profile.achievements.filter(a => a.unlocked).length}</span>
           <span className="text-xs text-gray-400 font-bold uppercase">Unlocked</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {profile.achievements.map((ach) => (
          <div key={ach.id} className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 ${ach.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
            <div className="text-4xl mb-1">{ach.icon}</div>
            <h4 className="font-bold text-gray-800 text-sm">{ach.title}</h4>
            <p className="text-xs text-gray-500 leading-tight">{ach.description}</p>
            {ach.unlocked && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1">UNLOCKED</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 4.3 Profile Settings Screen
const ProfileSettingsScreen: React.FC<{ profile: Profile; onLogout: () => void }> = ({ profile, onLogout }) => {
  return (
    <div className="pb-32 pt-6 px-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
      
      <div className="bg-white p-6 rounded-3xl shadow-lg shadow-indigo-100 mb-8 flex flex-col items-center border border-indigo-50">
        <img src={profile.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-md mb-4" />
        <h3 className="text-2xl font-bold text-gray-800">{profile.name}</h3>
        <p className="text-gray-500 font-medium mb-6">{profile.age} Years Old • Level {Math.floor(profile.xp / 100)}</p>
        
        <div className="grid grid-cols-3 gap-8 w-full border-t pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{profile.xp}</div>
            <div className="text-xs text-gray-400 font-bold uppercase">XP</div>
          </div>
          <div className="text-center border-l border-r border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{profile.coins}</div>
            <div className="text-xs text-gray-400 font-bold uppercase">Coins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{profile.streak}</div>
            <div className="text-xs text-gray-400 font-bold uppercase">Streak</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
           <span className="font-bold text-gray-600">Favorite Subject</span>
           <span className="font-bold text-primary">{profile.favoriteSubject}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
           <span className="font-bold text-gray-600">Age Group</span>
           <span className="font-bold text-primary">{profile.ageGroup}</span>
        </div>
        
        <Button variant="outline" fullWidth onClick={onLogout} className="mt-8">
          Switch Profile / Logout
        </Button>
      </div>
    </div>
  );
};

// 5. Lesson Player
const LessonPlayer: React.FC<{
  subject: Subject;
  profile: Profile;
  onComplete: (xp: number, coins: number, score: number) => void;
  onBack: () => void;
}> = ({ subject, profile, onComplete, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [step, setStep] = useState<'reading' | 'quiz' | 'success'>('reading');
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const fetchLesson = () => {
    setLoading(true);
    setSlowLoading(false);
    setStep('reading');
    setQuizIndex(0);
    setCorrectCount(0);
    setLesson(null);
    
    // Safety timer to show manual override if it takes too long
    const timer = setTimeout(() => {
        setSlowLoading(true);
    }, 3000);

    GeminiService.generateLesson(subject, profile.ageGroup)
      .then(data => {
        clearTimeout(timer);
        setLesson(data);
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timer);
        console.error("Failed to load lesson", err);
        // Correctly pass the age group to get the right difficulty
        setLesson(GeminiService.getFallbackLesson(subject, profile.ageGroup));
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchLesson();
  }, [subject, profile.ageGroup]);

  const loadFallbackNow = () => {
      // Pass ageGroup here as well
      setLesson(GeminiService.getFallbackLesson(subject, profile.ageGroup));
      setLoading(false);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null || !lesson || !lesson.quizQuestions) return;
    const currentQ = lesson.quizQuestions[quizIndex];
    if (!currentQ) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    if (isCorrect) setCorrectCount(prev => prev + 1);
    
    setQuizFeedback(isCorrect ? "Correct! 🎉 " + currentQ.explanation : "Oops! " + currentQ.explanation);
    
    if (isCorrect) {
      if (navigator.vibrate) navigator.vibrate(50);
    }

    setTimeout(() => {
      setQuizFeedback(null);
      setSelectedOption(null);
      if (quizIndex < lesson.quizQuestions.length - 1) {
        setQuizIndex(curr => curr + 1);
      } else {
        setStep('success');
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Asking the AI Tutor...</h3>
        <p className="text-gray-500">Creating a unique lesson just for you!</p>
        
        {slowLoading && (
            <div className="mt-8 animate-fade-in">
                <Button variant="ghost" size="sm" onClick={loadFallbackNow} className="text-xs text-gray-400">
                    Taking too long? Load Offline Lesson
                </Button>
            </div>
        )}
      </div>
    );
  }

  if (step === 'success') {
    const score = Math.round((correctCount / (lesson?.quizQuestions?.length || 1)) * 100);

    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="text-8xl mb-6 animate-bounce">🏆</div>
        <h2 className="text-3xl font-bold text-primary mb-2">Lesson Complete!</h2>
        <p className="text-gray-600 mb-8 text-lg">You Scored {score}%!</p>
        <div className="flex gap-4 mb-12">
           <div className="bg-yellow-50 border border-yellow-200 px-6 py-4 rounded-2xl flex flex-col items-center gap-1 min-w-[100px]">
             <Coins className="text-yellow-600 w-8 h-8 mb-1" /> 
             <span className="font-bold text-2xl text-yellow-800">+{lesson?.coinReward || 0}</span>
             <span className="text-xs text-yellow-600 uppercase font-bold">Coins</span>
           </div>
           <div className="bg-blue-50 border border-blue-200 px-6 py-4 rounded-2xl flex flex-col items-center gap-1 min-w-[100px]">
             <Star className="text-blue-600 w-8 h-8 mb-1" /> 
             <span className="font-bold text-2xl text-blue-800">+{lesson?.xpReward || 0}</span>
             <span className="text-xs text-blue-600 uppercase font-bold">XP</span>
           </div>
        </div>
        <Button onClick={() => onComplete(lesson?.xpReward || 0, lesson?.coinReward || 0, score)} size="lg" fullWidth>Continue Journey</Button>
      </div>
    );
  }

  // Safe checks for content
  const contentText = (lesson && typeof lesson.content === 'string') ? lesson.content || "" : "";
  const questions = (lesson?.quizQuestions && Array.isArray(lesson.quizQuestions)) ? lesson.quizQuestions : [];
  const currentQuestion = questions[quizIndex];

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b flex items-center gap-2 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="text-gray-600" /></button>
        <h2 className="font-bold flex-1 text-center text-lg">{subject}</h2>
        <button onClick={fetchLesson} className="p-2 hover:bg-gray-100 rounded-full"><RefreshCw size={18} className="text-gray-400" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-20">
        {/* Difficulty Badge */}
        <div className="flex justify-between items-center mb-4">
             <h1 className="text-3xl font-bold text-primary leading-tight">{lesson?.title || 'Lesson'}</h1>
             <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${lesson?.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {lesson?.difficulty || 'Standard'}
             </span>
        </div>
        
        {step === 'reading' && (
          <div className="animate-fade-in">
            {contentText ? (
              <div className="bg-indigo-50 p-6 rounded-3xl mb-6 text-lg leading-relaxed text-gray-700 border border-indigo-100">
                {contentText.split('\n').map((para: string, i: number) => (
                  <p key={i} className="mb-4 last:mb-0 min-h-[1em]">{para}</p>
                ))}
              </div>
            ) : (
              <div className="bg-red-50 p-6 rounded-3xl mb-6 text-center text-red-500 border border-red-100">
                <p>Sorry, we couldn't load the text for this lesson.</p>
                <Button variant="ghost" size="sm" onClick={fetchLesson} className="mt-2">Try Again</Button>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button variant="secondary" size="md" onClick={() => handleSpeak(contentText)} className="flex-1" disabled={!contentText}>
                <Volume2 className="w-5 h-5" /> Read
              </Button>
              <Button onClick={() => setStep('quiz')} className="flex-[2]" disabled={questions.length === 0}>
                Start Quiz <ArrowLeft className="rotate-180 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 'quiz' && (
          <div className="animate-fade-in">
            <div className="flex justify-between text-sm font-bold text-gray-400 mb-2">
              <span>Question {quizIndex + 1}</span>
              <span>{questions.length} Total</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full mb-8 overflow-hidden">
               <div className="bg-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${((quizIndex + 1) / (questions.length || 1)) * 100}%` }}></div>
            </div>

            {currentQuestion ? (
              <>
                <h3 className="text-2xl font-bold mb-8 text-gray-800">{currentQuestion.question}</h3>

                <div className="space-y-4 mb-8">
                  {currentQuestion.options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => !quizFeedback && setSelectedOption(idx)}
                      disabled={!!quizFeedback}
                      className={`w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                        selectedOption === idx 
                          ? 'border-primary bg-indigo-50 text-primary font-bold shadow-md' 
                          : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                      }`}
                    >
                      {opt}
                      {selectedOption === idx && <div className="w-4 h-4 bg-primary rounded-full"></div>}
                    </button>
                  ))}
                </div>
              </>
            ) : (
               <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <p className="mb-4">No questions available for this lesson.</p>
                  <Button onClick={fetchLesson} variant="outline">Try Reloading Lesson</Button>
               </div>
            )}

            {quizFeedback && (
              <div className={`p-4 rounded-xl mb-6 text-center font-bold animate-bounce-slight ${quizFeedback.includes('Correct') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                {quizFeedback}
              </div>
            )}

            {!quizFeedback && currentQuestion && (
              <Button disabled={selectedOption === null} onClick={handleQuizSubmit} fullWidth size="lg">Check Answer</Button>
            )}
            {!currentQuestion && (
               <Button onClick={() => setStep('success')} fullWidth size="lg" className="mt-4">Finish Lesson</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 6. Speaking Coach
const SpeakingCoach: React.FC<{ onBack: () => void; onComplete: () => void }> = ({ onBack, onComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<{score: number, feedback: string} | null>(null);
  const targetPhrase = "Learning is an adventure in the galaxy"; 

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Mock result as fallback
      if (!transcript) handleAnalyze("Learning is an adventure");
    } else {
      setIsListening(true);
      setFeedback(null);
      setTranscript("Listening...");
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setIsListening(false);
          handleAnalyze(text);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
          setTranscript("Try again!");
        };
        
        recognition.start();
      } else {
        // Fallback for demo if API not available
        setTimeout(() => {
            const mockHeard = "Learning is an adventure in the galaxy";
            setTranscript(mockHeard);
            setIsListening(false);
            handleAnalyze(mockHeard);
        }, 2000);
      }
    }
  };

  const handleAnalyze = async (text: string) => {
    const result = await GeminiService.evaluatePronunciation(targetPhrase, text);
    setFeedback(result);
    if(result.score > 70) {
      onComplete(); // Award achievement
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b">
        <button onClick={onBack}><ArrowLeft className="text-gray-600" /></button>
        <h2 className="text-lg font-bold">Speaking Coach</h2>
      </div>
      
      <div className="flex-1 flex flex-col p-6 items-center">
        <div className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl mb-10 text-center shadow-lg text-white">
          <p className="text-indigo-100 text-sm mb-4 uppercase tracking-widest font-bold">Your Challenge</p>
          <h3 className="text-3xl font-bold leading-normal">"{targetPhrase}"</h3>
        </div>

        <div className="relative mb-8">
           {isListening && <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>}
           <button 
             onClick={toggleListening}
             className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 ${isListening ? 'bg-red-500' : 'bg-primary'}`}
           >
             <Mic className="w-10 h-10 text-white" />
           </button>
        </div>
        
        <p className="text-gray-500 font-medium">{isListening ? "Listening..." : "Tap mic to speak"}</p>
        
        {transcript && !isListening && transcript !== 'Listening...' && (
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl w-full text-center border-2 border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase mb-2">You said</p>
            <p className="font-medium text-gray-800 text-lg">"{transcript}"</p>
          </div>
        )}

        {feedback && (
          <div className="mt-6 w-full animate-bounce-slight">
            <div className={`p-6 rounded-2xl text-center border-b-4 ${feedback.score > 70 ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-500'} shadow-sm`}>
              <div className="text-5xl font-bold mb-2 text-gray-800">{feedback.score}</div>
              <p className="text-gray-600 font-medium">{feedback.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. Coding Puzzle
const CodingPuzzle: React.FC<{ onBack: () => void; onComplete: () => void }> = ({ onBack, onComplete }) => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({x: 0, y: 0});
  const [targetPos, setTargetPos] = useState({x: 3, y: 3});
  const [rotation, setRotation] = useState(0); 
  const [queue, setQueue] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState<string>("Help the robot find the battery!");
  const [level, setLevel] = useState(1);
  
  const GRID_SIZE = 5;

  useEffect(() => {
    initLevel();
    GeminiService.generateCodingPuzzle(AgeGroup.JUNIOR).then(res => {
      if(res.goal) setMessage(res.goal);
    });
  }, [level]);

  const initLevel = () => {
    const newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    // Simple random obstacles
    newGrid[1][1] = 1;
    newGrid[2][3] = 1;
    newGrid[3][1] = 1;
    
    setGrid(newGrid);
    setPlayerPos({x: 0, y: 0});
    setTargetPos({x: 4, y: 4});
    setRotation(0);
    setQueue([]);
    setIsPlaying(false);
  };

  const addToQueue = (cmd: 'MOVE' | 'LEFT' | 'RIGHT') => {
    if (queue.length < 10 && !isPlaying) {
      setQueue([...queue, cmd]);
    }
  };

  const runQueue = async () => {
    setIsPlaying(true);
    let currentX = playerPos.x;
    let currentY = playerPos.y;
    let currentRot = rotation;

    for (const cmd of queue) {
      await new Promise(r => setTimeout(r, 500));
      
      if (cmd === 'LEFT') {
        currentRot = (currentRot - 90 + 360) % 360;
      } else if (cmd === 'RIGHT') {
        currentRot = (currentRot + 90) % 360;
      } else if (cmd === 'MOVE') {
        let nextX = currentX;
        let nextY = currentY;
        if (currentRot === 0) nextX++;
        if (currentRot === 90) nextY++;
        if (currentRot === 180) nextX--;
        if (currentRot === 270) nextY--;

        if (nextX >= 0 && nextX < GRID_SIZE && nextY >= 0 && nextY < GRID_SIZE && grid[nextY][nextX] !== 1) {
          currentX = nextX;
          currentY = nextY;
        }
      }
      
      setPlayerPos({x: currentX, y: currentY});
      setRotation(currentRot);
    }

    if (currentX === targetPos.x && currentY === targetPos.y) {
      setMessage("Success! Loading next level...");
      onComplete(); // Award achievement
      setTimeout(() => setLevel(l => l + 1), 2000);
    } else {
      setIsPlaying(false);
      setMessage("Try again!");
      setTimeout(() => {
        setPlayerPos({x: 0, y: 0});
        setRotation(0);
        setIsPlaying(false);
      }, 1000);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="p-4 bg-white shadow-sm flex items-center justify-between z-10">
         <button onClick={onBack}><ArrowLeft /></button>
         <span className="font-bold text-lg">Level {level}</span>
         <button onClick={initLevel}><RefreshCw size={20} /></button>
      </div>
      
      <div className="p-4 text-center bg-indigo-100 text-indigo-900 font-medium text-sm">
        {message}
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="grid gap-1 bg-slate-300 p-1 rounded-lg" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isPlayer = x === playerPos.x && y === playerPos.y;
            const isTarget = x === targetPos.x && y === targetPos.y;
            const isObstacle = grid[y] && grid[y][x] === 1;

            return (
              <div key={i} className="w-12 h-12 bg-white rounded-md flex items-center justify-center relative overflow-hidden">
                {isObstacle && <div className="w-full h-full bg-slate-600"></div>}
                {isTarget && <div className="text-2xl animate-pulse">🔋</div>}
                {isPlayer && (
                  <div 
                    className="text-3xl transition-all duration-500" 
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >🤖</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex gap-2 overflow-x-auto mb-4 p-2 bg-slate-50 rounded-xl min-h-[60px] items-center">
          {queue.length === 0 && <span className="text-gray-400 text-sm italic w-full text-center">Tap blocks to add...</span>}
          {queue.map((cmd, i) => (
            <div key={i} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              {cmd === 'MOVE' ? '⬆️' : cmd === 'LEFT' ? '↺' : '↻'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
           <button 
             disabled={isPlaying} 
             onClick={() => addToQueue('LEFT')}
             className="bg-orange-100 p-4 rounded-xl flex items-center justify-center active:scale-95 disabled:opacity-50"
           >
             <RotateCw className="-scale-x-100 text-orange-600" />
           </button>
           <button 
             disabled={isPlaying} 
             onClick={() => addToQueue('MOVE')}
             className="bg-blue-100 p-4 rounded-xl flex items-center justify-center active:scale-95 disabled:opacity-50 col-span-2"
           >
             <ArrowUp className="text-blue-600 w-8 h-8" />
           </button>
           <button 
             disabled={isPlaying} 
             onClick={() => addToQueue('RIGHT')}
             className="bg-orange-100 p-4 rounded-xl flex items-center justify-center active:scale-95 disabled:opacity-50"
           >
             <RotateCw className="text-orange-600" />
           </button>
        </div>
        <div className="flex gap-2 mt-4">
           <Button variant="ghost" onClick={() => setQueue([])} disabled={isPlaying} className="flex-1">Clear</Button>
           <Button onClick={runQueue} disabled={isPlaying || queue.length === 0} className="flex-[2] bg-green-500 hover:bg-green-600">Run Code ▶</Button>
        </div>
      </div>
    </div>
  );
};

// 8. Mini Shop
const MiniShop: React.FC<{ 
  profile: Profile; 
  onBuy: (item: ShopItem) => void; 
  onBack: () => void;
}> = ({ profile, onBuy, onBack }) => {
  return (
    <div className="h-full bg-white flex flex-col">
       <div className="p-4 shadow-sm z-10 bg-white flex items-center justify-between sticky top-0">
         <div className="flex items-center gap-2">
           <button onClick={onBack}><ArrowLeft className="text-gray-600" /></button>
           <h2 className="font-bold text-xl">Galaxy Shop</h2>
         </div>
         <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-1">
           <Coins className="w-4 h-4 text-yellow-600" />
           <span className="font-bold text-yellow-800">{profile.coins}</span>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
          {SHOP_ITEMS.map((item) => {
            const owned = profile.inventory.includes(item.id);
            const canAfford = profile.coins >= item.cost;
            return (
              <div key={item.id} className="border border-gray-100 rounded-3xl p-4 flex flex-col items-center gap-3 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {owned && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Owned</div>}
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-2">
                  {item.icon}
                </div>
                <div className="text-center w-full">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                  {!owned && (
                    <p className="text-yellow-600 font-bold flex items-center justify-center gap-1 text-sm mt-1">
                      {item.cost} <Coins size={12} />
                    </p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant={owned ? 'ghost' : (canAfford ? 'primary' : 'outline')} 
                  disabled={owned || !canAfford}
                  onClick={() => onBuy(item)}
                  fullWidth
                  className="mt-auto"
                >
                  {owned ? 'Equip' : 'Buy'}
                </Button>
              </div>
            );
          })}
       </div>
    </div>
  );
};

// 9. Parent Dashboard
const ParentDashboard: React.FC<{ 
  profiles: Profile[]; 
  onLogout: () => void;
  onUpdateProfile: (p: Profile) => void;
}> = ({ profiles, onLogout, onUpdateProfile }) => {
  
  const handleLimitChange = (profile: Profile, change: number) => {
    const newLimit = Math.max(15, profile.dailyTimeLimit + change); // Min 15 mins
    onUpdateProfile({...profile, dailyTimeLimit: newLimit});
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      <div className="bg-slate-900 text-white p-6 rounded-b-[40px] mb-8 shadow-2xl shadow-indigo-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Parent Dashboard</h2>
          <button onClick={onLogout} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors"><LogOut size={20} /></button>
        </div>
        <p className="text-slate-400">Overview of your children's learning journey.</p>
        
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {profiles.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-slate-800 p-2 pr-4 rounded-full">
              <img src={p.avatar} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-sm">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6 pb-20">
        {/* Time Controls */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
             <div className="w-2 h-6 bg-secondary rounded-full"></div>
             Screen Time Limits
          </h3>
          {profiles.map(p => (
             <div key={p.id} className="mb-6 last:mb-0">
               <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-2">
                   <img src={p.avatar} className="w-8 h-8 rounded-full" />
                   <span className="font-bold text-gray-700">{p.name}</span>
                 </div>
                 <span className="text-xs font-bold text-gray-400">{p.usageToday} mins used</span>
               </div>
               
               <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                 <button onClick={() => handleLimitChange(p, -15)} className="p-2 bg-white rounded-lg shadow-sm active:scale-95"><Minus size={16}/></button>
                 <div className="flex-1 text-center">
                    <span className="font-bold text-lg text-primary">{p.dailyTimeLimit}</span>
                    <span className="text-xs text-gray-500 ml-1">mins</span>
                 </div>
                 <button onClick={() => handleLimitChange(p, 15)} className="p-2 bg-white rounded-lg shadow-sm active:scale-95"><Plus size={16}/></button>
               </div>
               <div className="mt-2 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full ${p.usageToday > p.dailyTimeLimit ? 'bg-red-500' : 'bg-green-500'}`} 
                   style={{width: `${Math.min(100, (p.usageToday / p.dailyTimeLimit) * 100)}%`}}
                 ></div>
               </div>
             </div>
          ))}
        </div>

        {/* Analytics (Static for now) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            Weekly Activity (Minutes)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Mon', mins: 20 }, { name: 'Tue', mins: 45 }, { name: 'Wed', mins: 30 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                <Bar dataKey="mins" fill="#4F46E5" radius={[6, 6, 6, 6]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// 10. Time Limit Reached Screen
const TimeLimitReached: React.FC<{ onLogout: () => void; onParentUnlock: () => void }> = ({ onLogout, onParentUnlock }) => {
  return (
     <div className="h-full bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-slate-800 p-6 rounded-full mb-8 animate-bounce-slight">
           <Clock size={64} className="text-red-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Time's Up!</h2>
        <p className="text-slate-400 mb-12 text-lg">You've reached your daily limit. Great job learning today! Time to take a break.</p>
        
        <div className="w-full space-y-4">
           <Button variant="primary" fullWidth onClick={onLogout}>See You Tomorrow!</Button>
           <Button variant="ghost" fullWidth onClick={onParentUnlock}>Parent Unlock</Button>
        </div>
     </div>
  );
};

// 11. Main App
const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [parents, setParents] = useState<ParentAccount[]>(MOCK_PARENTS);
  const [currentParent, setCurrentParent] = useState<ParentAccount | null>(null);
  
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [screenParams, setScreenParams] = useState<any>({});
  
  // Notification State
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);

  // Time Tracking Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Only track if on child dashboard-related screens
    const isChildActive = currentProfile && 
       [Screen.CHILD_DASHBOARD, Screen.LESSON_PLAYER, Screen.SPEAKING_COACH, Screen.MINI_SHOP, Screen.CODING_PUZZLE, Screen.SUBJECT_SELECT, Screen.ACHIEVEMENTS, Screen.PROFILE_SETTINGS].includes(screen);

    if (isChildActive) {
      interval = setInterval(() => {
        setCurrentProfile(prev => {
          if (!prev) return null;
          
          // Check Date Reset
          const today = new Date().toISOString().split('T')[0];
          let updated = { ...prev };
          
          if (prev.lastUsageDate !== today) {
             updated = { ...prev, usageToday: 0, lastUsageDate: today };
          } else {
             // Increment usage (1 minute for every real minute)
             // For demo purposes, we can update this faster if needed, but 60000 is realistic.
             updated = { ...prev, usageToday: prev.usageToday + 1 };
          }

          // Persist to global state
          setProfiles(all => all.map(p => p.id === updated.id ? updated : p));
          
          // Check Limit
          if (updated.usageToday >= updated.dailyTimeLimit) {
            setScreen(Screen.TIME_LIMIT_REACHED);
          } else if (updated.dailyTimeLimit - updated.usageToday === 5) {
             // Could trigger a warning toast here if UI supported it
             console.log("5 minutes remaining!");
          }

          return updated;
        });
      }, 60000); // 1 minute interval
    }
    return () => clearInterval(interval);
  }, [screen, currentProfile]); // Re-run when screen changes

  const navigate = (to: Screen, params?: any) => {
    setScreenParams(params || {});
    setScreen(to);
  };

  const handleParentSelect = (p: ParentAccount) => {
    setCurrentParent(p);
    navigate(Screen.PARENT_AUTH, { mode: 'select_profile' });
  };

  const handleParentAuthSuccess = () => {
     if (screenParams.mode === 'dashboard') {
        navigate(Screen.PARENT_DASHBOARD);
     } else {
        navigate(Screen.PROFILE_SELECT);
     }
  };

  const handleProfileSelect = (p: Profile) => {
    // Check limit immediately on login
    const today = new Date().toISOString().split('T')[0];
    let profileToUse = p;
    
    if (p.lastUsageDate !== today) {
       profileToUse = { ...p, usageToday: 0, lastUsageDate: today };
       // Update global state too
       setProfiles(prev => prev.map(prof => prof.id === p.id ? profileToUse : prof));
    }

    setCurrentProfile(profileToUse);
    
    if (profileToUse.usageToday >= profileToUse.dailyTimeLimit) {
       setScreen(Screen.TIME_LIMIT_REACHED);
    } else {
       navigate(Screen.CHILD_DASHBOARD);
    }
  };

  const handleCreateProfile = (newProfile: Profile) => {
    if (!currentParent) return;
    const finalProfile = { ...newProfile, parentId: currentParent.id };
    setProfiles([...profiles, finalProfile]);
    setCurrentProfile(finalProfile);
    navigate(Screen.CHILD_DASHBOARD);
  };

  // Helper to check for new achievements
  const checkAchievements = (profile: Profile, context: {type: 'lesson' | 'shop' | 'coding' | 'speaking', score?: number, subject?: Subject}) => {
     let updatedAchievements = [...profile.achievements];
     const unlockedNow: Achievement[] = [];

     updatedAchievements = updatedAchievements.map(ach => {
       if (ach.unlocked) return ach; // Already unlocked

       let shouldUnlock = false;

       if (ach.id === '1' && profile.completedLessons.length >= 1) shouldUnlock = true; // First Steps
       if (ach.id === '2' && context.type === 'lesson' && context.subject === Subject.MATH && (context.score || 0) === 100) shouldUnlock = true; // Math Whiz
       if (ach.id === '3' && profile.coins >= 100) shouldUnlock = true; // Big Saver
       if (ach.id === '4' && context.type === 'speaking') shouldUnlock = true; // Word Smith
       if (ach.id === '5' && context.type === 'coding') shouldUnlock = true; // Code Breaker

       if (shouldUnlock) {
         unlockedNow.push(ach);
         return { ...ach, unlocked: true, dateUnlocked: new Date().toISOString() };
       }
       return ach;
     });

     if (unlockedNow.length > 0) {
       setNotification({
         title: "Achievement Unlocked! 🏆",
         message: unlockedNow.map(a => a.title).join(", ")
       });
     }

     return { ...profile, achievements: updatedAchievements };
  };

  const handleLessonComplete = (xp: number, coins: number, score: number) => {
    if (!currentProfile) return;
    
    let updated = {
      ...currentProfile,
      xp: currentProfile.xp + xp,
      coins: currentProfile.coins + coins,
      streak: currentProfile.streak, // In real app, check date
      completedLessons: [...currentProfile.completedLessons, screenParams.subject]
    };

    // Check Achievements
    updated = checkAchievements(updated, { type: 'lesson', score, subject: screenParams.subject });
    
    // Update both local state and profiles array
    setCurrentProfile(updated);
    setProfiles(prevProfiles => prevProfiles.map(p => p.id === updated.id ? updated : p));
    
    navigate(Screen.CHILD_DASHBOARD);
  };

  const handleActivityComplete = (type: 'coding' | 'speaking', rewardXP: number) => {
    if (!currentProfile) return;
    let updated = { ...currentProfile, xp: currentProfile.xp + rewardXP };
    updated = checkAchievements(updated, { type });
    
    setCurrentProfile(updated);
    setProfiles(prevProfiles => prevProfiles.map(p => p.id === updated.id ? updated : p));
    
    if (type === 'coding') navigate(Screen.CHILD_DASHBOARD); 
    // speaking stays on screen
  };

  const handleShopBuy = (item: ShopItem) => {
    if(!currentProfile) return;
    let updated = {
      ...currentProfile,
      coins: currentProfile.coins - item.cost,
      inventory: [...currentProfile.inventory, item.id]
    };

    // Buying doesn't usually unlock achievements in this set, but keeping it consistent
    updated = checkAchievements(updated, { type: 'shop' });
    
    // Update both local state and profiles array
    setCurrentProfile(updated);
    setProfiles(prevProfiles => prevProfiles.map(p => p.id === updated.id ? updated : p));
  };
  
  const handleUpdateProfile = (updated: Profile) => {
     setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
     // If currently selected, update it too
     if (currentProfile?.id === updated.id) {
        setCurrentProfile(updated);
     }
  };

  const renderScreen = () => {
    switch (screen) {
      case Screen.SPLASH:
        return <SplashScreen onComplete={() => setScreen(Screen.PARENT_SELECT)} />;
      case Screen.PARENT_SELECT:
        return <ParentSelect parents={parents} onSelect={handleParentSelect} onCreate={() => alert("Create Family Flow")} />;
      case Screen.PARENT_AUTH:
        return currentParent ? <ParentAuth parent={currentParent} onSuccess={handleParentAuthSuccess} onBack={() => navigate(Screen.PARENT_SELECT)} mode={screenParams.mode} /> : null;
      case Screen.PROFILE_SELECT:
        return currentParent ? (
          <ProfileSelect 
            profiles={profiles.filter(p => p.parentId === currentParent.id)} 
            onSelectProfile={handleProfileSelect} 
            onParentLogin={() => navigate(Screen.PARENT_AUTH, { mode: 'dashboard' })} 
            onCreateProfile={() => navigate(Screen.CREATE_PROFILE)} 
            onBack={() => navigate(Screen.PARENT_SELECT)}
          /> 
        ) : null;
      case Screen.CREATE_PROFILE:
        return <CreateProfile onBack={() => navigate(Screen.PROFILE_SELECT)} onCreate={handleCreateProfile} />;
      case Screen.CHILD_DASHBOARD:
        return currentProfile ? <ChildDashboard profile={currentProfile} onNavigate={navigate} /> : null;
      case Screen.SUBJECT_SELECT:
        return <SubjectSelectScreen onNavigate={navigate} />;
      case Screen.ACHIEVEMENTS:
        return currentProfile ? <AchievementsScreen profile={currentProfile} /> : null;
      case Screen.PROFILE_SETTINGS:
        return currentProfile ? <ProfileSettingsScreen profile={currentProfile} onLogout={() => setScreen(Screen.PROFILE_SELECT)} /> : null;
      case Screen.LESSON_PLAYER:
        return currentProfile ? <LessonPlayer subject={screenParams.subject} profile={currentProfile} onBack={() => navigate(Screen.CHILD_DASHBOARD)} onComplete={handleLessonComplete} /> : null;
      case Screen.SPEAKING_COACH:
        return <SpeakingCoach onBack={() => navigate(Screen.CHILD_DASHBOARD)} onComplete={() => handleActivityComplete('speaking', 20)} />;
      case Screen.MINI_SHOP:
        return currentProfile ? <MiniShop profile={currentProfile} onBack={() => navigate(Screen.CHILD_DASHBOARD)} onBuy={handleShopBuy} /> : null;
      case Screen.PARENT_DASHBOARD:
        return currentParent ? (
           <ParentDashboard 
             profiles={profiles.filter(p => p.parentId === currentParent.id)} 
             onLogout={() => setScreen(Screen.PROFILE_SELECT)} 
             onUpdateProfile={handleUpdateProfile}
           />
        ) : null;
      case Screen.CODING_PUZZLE:
        return <CodingPuzzle onBack={() => navigate(Screen.CHILD_DASHBOARD)} onComplete={() => handleActivityComplete('coding', 30)} />;
      case Screen.TIME_LIMIT_REACHED:
        return <TimeLimitReached onLogout={() => setScreen(Screen.PROFILE_SELECT)} onParentUnlock={() => navigate(Screen.PARENT_AUTH, { mode: 'dashboard' })} />;
      default:
        return <div>Error: Screen Not Found</div>;
    }
  };

  // Determine if we should show the bottom navigation bar
  const showFooter = [
    Screen.CHILD_DASHBOARD, 
    Screen.SUBJECT_SELECT, 
    Screen.ACHIEVEMENTS, 
    Screen.PROFILE_SETTINGS
  ].includes(screen);
  
  // Show time warning?
  const showWarning = currentProfile && (currentProfile.dailyTimeLimit - currentProfile.usageToday <= 5) && (currentProfile.dailyTimeLimit - currentProfile.usageToday > 0) && showFooter;

  return (
    <div className="max-w-md mx-auto h-full bg-background shadow-2xl relative overflow-hidden font-sans">
      {renderScreen()}
      
      {/* Notifications and Toasts */}
      {notification && (
        <NotificationBanner 
          title={notification.title} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}

      {showWarning && (
         <div className="absolute top-4 left-4 right-4 bg-orange-500 text-white p-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce-slight z-50">
            <AlertTriangle size={20} />
            <div className="text-sm font-bold">
               Time running out! {currentProfile.dailyTimeLimit - currentProfile.usageToday} mins left.
            </div>
         </div>
      )}

      {showFooter && (
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-end text-gray-300 z-50 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <button 
            onClick={() => navigate(Screen.CHILD_DASHBOARD)} 
            className={`flex flex-col items-center gap-1 transition-colors ${screen === Screen.CHILD_DASHBOARD ? 'text-primary' : 'hover:text-indigo-400'}`}
          >
            <Home size={26} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => navigate(Screen.SUBJECT_SELECT)} 
            className={`flex flex-col items-center gap-1 transition-colors ${screen === Screen.SUBJECT_SELECT ? 'text-primary' : 'hover:text-indigo-400'}`}
          >
            <BookOpen size={26} strokeWidth={2.5} />
          </button>
          
          <div className="relative -top-6">
             <div 
               className="w-16 h-16 bg-primary rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center text-white border-4 border-white cursor-pointer active:scale-95 transition-transform" 
               onClick={() => navigate(Screen.LESSON_PLAYER, {subject: Subject.MATH})}
             >
                <Play fill="currentColor" size={24} className="ml-1" />
             </div>
          </div>

          <button 
            onClick={() => navigate(Screen.ACHIEVEMENTS)} 
            className={`flex flex-col items-center gap-1 transition-colors ${screen === Screen.ACHIEVEMENTS ? 'text-primary' : 'hover:text-indigo-400'}`}
          >
            <Star size={26} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => navigate(Screen.PROFILE_SETTINGS)} 
            className={`flex flex-col items-center gap-1 transition-colors ${screen === Screen.PROFILE_SETTINGS ? 'text-primary' : 'hover:text-indigo-400'}`}
          >
            <User size={26} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
