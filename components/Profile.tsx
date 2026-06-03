import React, { useState } from 'react';
import { UserState, UserPreferences } from '../types';
import { BADGES, PERSONALIZATION_OPTIONS } from '../constants';
import { Flame, Award, Zap, LogOut, ShieldCheck, Trash2, Sliders, User } from 'lucide-react';
import OnboardingQuiz from './OnboardingQuiz';

interface ProfileProps {
  user: UserState;
  onLogout: () => void;
  onReset: () => void;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onReset, onUpdatePreferences }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Helper to get labels from IDs
  const getInterestLabel = (id: string) => PERSONALIZATION_OPTIONS.interests.find(i => i.id === id)?.label || id;
  const getGoalLabel = (id: string) => PERSONALIZATION_OPTIONS.goals.find(g => g.id === id)?.label || id;

  const isImageAvatar = (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) && !imgError;

  if (showQuiz) {
    return (
      <OnboardingQuiz 
        initialPrefs={user.preferences}
        onSave={(prefs) => {
          onUpdatePreferences(prefs);
          setShowQuiz(false);
        }}
        onCancel={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <div className="p-6 pb-32 pt-20 bg-gray-900 min-h-screen">
      <div className="flex flex-col items-center mb-10 animate-in slide-in-from-top duration-500">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg mb-4 overflow-hidden border-4 ${isImageAvatar ? 'bg-gray-200 border-gray-400' : 'bg-blue-500 border-blue-700'}`}>
          {isImageAvatar ? (
             <img 
               src={user.avatar} 
               alt="Profile" 
               className="w-full h-full object-cover" 
               onError={() => setImgError(true)}
             />
          ) : (
             <span className="flex items-center justify-center w-full h-full">
                {user.avatar.length > 20 ? <User size={40} className="text-white" /> : user.avatar}
             </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
        {user.email && <p className="text-gray-500 text-sm mb-1">{user.email}</p>}
        <div className="flex items-center space-x-2 mt-2">
           <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700">
             {user.role === 'admin' ? 'Administrator' : 'Student'}
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
          <Flame className="text-orange-500 w-8 h-8 mb-2" />
          <span className="text-2xl font-bold">{user.streak}</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Day Streak</span>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
          <Zap className="text-yellow-400 w-8 h-8 mb-2" />
          <span className="text-2xl font-bold">{user.xp}</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Total XP</span>
        </div>
      </div>

      {/* Personalization Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold flex items-center">
             <Sliders className="mr-2 text-blue-400" /> Preferences
           </h2>
           <button 
             onClick={() => setShowQuiz(true)} 
             className="text-xs font-bold text-blue-400 uppercase border border-blue-500/50 px-3 py-1 rounded-full hover:bg-blue-500/10"
            >
             {user.preferences ? 'Edit' : 'Start Quiz'}
           </button>
        </div>

        {user.preferences ? (
           <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
             <div>
                <span className="text-xs text-gray-500 uppercase font-bold">Interests</span>
                <div className="flex flex-wrap gap-2 mt-1">
                   {user.preferences.interests.map(i => (
                     <span key={i} className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/30">
                       {getInterestLabel(i)}
                     </span>
                   ))}
                </div>
             </div>
             <div className="flex justify-between">
                <div>
                   <span className="text-xs text-gray-500 uppercase font-bold">Goal</span>
                   <div className="text-sm text-gray-300">{getGoalLabel(user.preferences.goal)}</div>
                </div>
                <div className="text-right">
                   <span className="text-xs text-gray-500 uppercase font-bold">Confidence</span>
                   <div className="text-sm text-gray-300 capitalize">{user.preferences.confidence}</div>
                </div>
             </div>
           </div>
        ) : (
          <div onClick={() => setShowQuiz(true)} className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-xl border border-blue-500/30 text-center cursor-pointer hover:border-blue-400 transition-colors">
             <h3 className="font-bold text-white mb-1">Personalize your learning</h3>
             <p className="text-sm text-gray-400">Answer 3 quick questions to get content tailored to your interests!</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Award className="mr-2 text-purple-400" /> Achievements
      </h2>

      <div className="space-y-4 mb-8">
        {BADGES.map((badge) => {
          const isUnlocked = user.badges.includes(badge.id);
          
          return (
            <div 
              key={badge.id}
              className={`p-4 rounded-xl border-2 flex items-center transition-all ${isUnlocked ? 'bg-gray-800 border-yellow-600/50' : 'bg-gray-800/50 border-gray-700 opacity-60'}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mr-4 border-b-4 ${isUnlocked ? 'bg-yellow-500 border-yellow-700' : 'bg-gray-700 border-gray-800 grayscale'}`}>
                {badge.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-500">{badge.description}</p>
                {isUnlocked && (
                  <div className="mt-2 text-xs font-bold text-yellow-500 uppercase flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Unlocked
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 mb-8">
        <button 
          onClick={onLogout}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl text-gray-300 font-bold uppercase tracking-wide border-2 border-gray-700 flex items-center justify-center transition-colors"
        >
          <LogOut className="mr-2 w-5 h-5" />
          Log Out
        </button>

        <div className="pt-4 border-t border-gray-800">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Danger Zone</h3>
           <button 
            onClick={onReset}
            className="w-full py-3 bg-red-900/20 hover:bg-red-900/30 rounded-xl text-red-500 font-bold uppercase tracking-wide border border-red-900/50 flex items-center justify-center transition-colors text-sm"
          >
            <Trash2 className="mr-2 w-4 h-4" />
            Reset Progress
          </button>
        </div>
      </div>
      
      <div className="text-center text-gray-600 text-xs">
        Physics Learner App v1.4 • User ID: {user.id.slice(0,8)}...
      </div>
    </div>
  );
};

export default Profile;