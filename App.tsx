import React, { useState, useEffect } from 'react';
import { COURSES, INITIAL_HEARTS, BADGES, APP_LOGO } from './constants';
import { UserState, Lesson, Tab, UserPreferences } from './types';
import { db } from './services/db';
import LessonMap from './components/LessonMap';
import QuizView from './components/QuizView';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AuthScreen from './components/AuthScreen';
import { Home, Trophy, User, Heart, Zap, ChevronDown, Check, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizKey, setQuizKey] = useState(0); 
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionUser = await db.getSession();
        if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (e) {
        console.error("Session load failed", e);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, []);

  // --- SYNC WITH DB ---
  const updateUserState = async (newState: UserState) => {
    setUser(newState);
    try {
      await db.updateUser(newState);
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  // Derive current course data safely
  const currentCourse = user 
    ? (COURSES.find(c => c.id === user.currentCourseId) || COURSES[0])
    : COURSES[0];

  // Unlock logic - UNLOCKED ALL FOR TESTING
  const unitsWithStatus = user && currentCourse.units ? currentCourse.units.map(unit => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      const isCompleted = user.completedLessons.includes(lesson.id);
      
      // Always unlocked per user request
      return {
        ...lesson,
        completed: isCompleted,
        locked: false 
      };
    })
  })) : [];

  const activeUnitId = unitsWithStatus.length > 0 
    ? (unitsWithStatus.find(u => !u.lessons.every(l => l.completed))?.id || unitsWithStatus[0].id)
    : '';

  // --- HANDLERS ---

  const handleLoginSuccess = (loggedInUser: UserState) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
    setActiveTab('learn');
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (!user) return;
    if (user.hearts <= 0) {
      setShowNoHeartsModal(true);
      return;
    }
    setActiveLesson(lesson);
  };

  const handleLessonComplete = (xpEarned: number) => {
    if (!activeLesson || !user) return;

    const newCompleted = user.completedLessons.includes(activeLesson.id) 
      ? user.completedLessons 
      : [...user.completedLessons, activeLesson.id];
    
    // Create new state without mutating
    const newUserState: UserState = {
      ...user,
      xp: user.xp + xpEarned,
      completedLessons: newCompleted
    };

    // --- CHECK FOR NEW BADGES ---
    const newBadges = [...newUserState.badges];
    let badgeEarned = false;

    BADGES.forEach(badge => {
      if (!newBadges.includes(badge.id) && badge.condition(newUserState)) {
        newBadges.push(badge.id);
        badgeEarned = true;
        // Could show a toast notification here
        alert(`🏆 Badge Unlocked: ${badge.name}!`);
      }
    });

    if (badgeEarned) {
      newUserState.badges = newBadges;
    }

    updateUserState(newUserState);
    setActiveLesson(null);
  };

  const handleLessonExit = () => {
    setActiveLesson(null);
  };

  const handleWrongAnswer = () => {
    if (!user) return;
    const newState = {
      ...user,
      hearts: Math.max(0, user.hearts - 1)
    };
    updateUserState(newState);
  };

  const handleRestartLesson = () => {
    if (!user) return;
    const newState = {
      ...user,
      hearts: INITIAL_HEARTS
    };
    updateUserState(newState);
    setQuizKey(prev => prev + 1);
  };

  const handleResetProgress = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to reset all progress? This action cannot be undone.")) {
       try {
         const updatedUser = await db.resetProgress(user.email);
         setUser(updatedUser);
         alert("Progress has been reset.");
       } catch (e) {
         console.error("Reset failed", e);
       }
    }
  };

  const handleUpdatePreferences = (prefs: UserPreferences) => {
    if (!user) return;
    const newState = { ...user, preferences: prefs };
    updateUserState(newState);
  };

  const switchCourse = (courseId: string) => {
    if (!user) return;
    const newState = { ...user, currentCourseId: courseId };
    updateUserState(newState);
    setShowCourseMenu(false);
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="w-32 h-32 mb-8 animate-pulse">
           <img src={APP_LOGO} alt="Loading..." className="w-full h-full object-contain" />
        </div>
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // If not logged in, show Auth Screen
  if (!user || !user.isLoggedIn) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (activeLesson) {
    return (
      <QuizView 
        key={quizKey}
        lesson={activeLesson}
        userPreferences={user.preferences}
        onComplete={handleLessonComplete}
        onExit={handleLessonExit}
        onRestart={handleRestartLesson}
        onWrongAnswer={handleWrongAnswer}
        hearts={user.hearts}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans max-w-lg mx-auto border-x border-gray-800 shadow-2xl relative overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-16 bg-gray-900/95 backdrop-blur border-b border-gray-800 flex items-center justify-between px-4 fixed top-0 w-full max-w-lg z-40">
        
        {/* Course Picker Button */}
        <button 
          onClick={() => setShowCourseMenu(true)}
          className="flex items-center space-x-2 hover:bg-gray-800 p-1.5 rounded-lg transition-colors"
        >
          <span className="text-2xl">{currentCourse.icon}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-red-500 font-bold">
            <Heart className="fill-current w-5 h-5" />
            <span>{user.hearts}</span>
          </div>
          <div className="flex items-center space-x-1 text-yellow-400 font-bold">
            <Zap className="fill-current w-5 h-5" />
            <span>{user.xp}</span>
          </div>
          <div className="flex items-center space-x-1 text-orange-500 font-bold">
            <span className="text-xl">🔥</span>
            <span>{user.streak}</span>
          </div>
        </div>
      </div>

      {/* No Hearts Modal */}
      {showNoHeartsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border-2 border-red-500 shadow-2xl text-center animate-in zoom-in-95">
                 <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-800 shadow-inner">
                     <Heart className="w-10 h-10 text-red-500 fill-red-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Out of Lives</h3>
                 <p className="text-gray-400 mb-6 text-lg">Sorry, you don't have lives. Please come back later.</p>
                 <button 
                   onClick={() => setShowNoHeartsModal(false)}
                   className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold uppercase tracking-wide transition-colors border-b-4 border-gray-800 active:border-b-0 active:translate-y-1"
                 >
                   Okay
                 </button>
            </div>
        </div>
      )}

      {/* Course Selection Modal Overlay */}
      {showCourseMenu && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col pt-16">
          <div className="bg-gray-900 p-4 border-b border-gray-700 shadow-2xl animate-in slide-in-from-top-10 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-200">My Courses</h2>
              <button onClick={() => setShowCourseMenu(false)} className="text-gray-400 hover:text-white">Close</button>
            </div>
            
            <div className="space-y-3">
              {COURSES.map(course => {
                const isActive = course.id === user.currentCourseId;
                return (
                  <button
                    key={course.id}
                    onClick={() => switchCourse(course.id)}
                    className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all active:scale-[0.98] ${isActive ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-3xl mr-4 border border-gray-600">
                        {course.icon}
                      </div>
                      <div className="text-left">
                        <h3 className={`font-bold text-lg ${isActive ? 'text-blue-400' : 'text-gray-200'}`}>
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400">{course.description}</p>
                      </div>
                    </div>
                    {isActive && <Check className="text-blue-500 w-6 h-6" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowCourseMenu(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'learn' && (
          <LessonMap 
            units={unitsWithStatus} 
            activeUnitId={activeUnitId}
            onLessonClick={handleStartLesson}
          />
        )}
        {activeTab === 'leaderboard' && <Leaderboard user={user} />}
        {activeTab === 'profile' && (
          <Profile 
            user={user} 
            onLogout={handleLogout} 
            onReset={handleResetProgress}
            onUpdatePreferences={handleUpdatePreferences}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-around px-4 pb-4 fixed bottom-0 w-full max-w-lg z-40">
        <button 
          onClick={() => setActiveTab('learn')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'learn' ? 'text-blue-400 bg-blue-900/20 border-2 border-blue-900' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Home className="w-7 h-7 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wide">Learn</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'leaderboard' ? 'text-purple-400 bg-purple-900/20 border-2 border-purple-900' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Trophy className="w-7 h-7 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wide">Rank</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'profile' ? 'text-yellow-400 bg-yellow-900/20 border-2 border-yellow-900' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <User className="w-7 h-7 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wide">Me</span>
        </button>
      </div>

    </div>
  );
};

export default App;