import React, { useState } from 'react';
import { PERSONALIZATION_OPTIONS } from '../constants';
import { UserPreferences } from '../types';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface OnboardingQuizProps {
  initialPrefs?: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onCancel: () => void;
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ initialPrefs, onSave, onCancel }) => {
  const [step, setStep] = useState(0);
  
  const [interests, setInterests] = useState<string[]>(initialPrefs?.interests || []);
  const [confidence, setConfidence] = useState<string>(initialPrefs?.confidence || '');
  const [goal, setGoal] = useState<string>(initialPrefs?.goal || '');

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter(i => i !== id));
    } else {
      if (interests.length < 3) {
        setInterests([...interests, id]);
      }
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onSave({
        interests,
        confidence: confidence as any,
        goal: goal as any
      });
    }
  };

  const isStepValid = () => {
    if (step === 0) return interests.length > 0;
    if (step === 1) return !!confidence;
    if (step === 2) return !!goal;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <button onClick={onCancel} className="text-gray-400 font-bold uppercase text-sm">Cancel</button>
        <div className="flex space-x-2">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blue-500' : 'bg-gray-700'}`} />
          ))}
        </div>
        <button 
            onClick={handleNext} 
            disabled={!isStepValid()}
            className={`font-bold uppercase text-sm flex items-center ${isStepValid() ? 'text-green-500' : 'text-gray-600'}`}
        >
          {step === 2 ? 'Save' : 'Next'} <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        
        {/* Step 0: Interests */}
        {step === 0 && (
          <div className="w-full max-w-md animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">What interests you?</h2>
            <p className="text-gray-400 text-center mb-8">Choose up to 3 topics. We'll use these for lesson examples.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {PERSONALIZATION_OPTIONS.interests.map(opt => {
                const selected = interests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleInterest(opt.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center h-32 ${selected ? 'bg-blue-600/20 border-blue-500 shadow-lg scale-[1.02]' : 'bg-gray-800 border-gray-700 hover:bg-gray-750'}`}
                  >
                    <span className="text-3xl mb-2">{opt.icon}</span>
                    <span className={`font-bold ${selected ? 'text-white' : 'text-gray-400'}`}>{opt.label}</span>
                    {selected && <div className="absolute top-2 right-2 text-blue-500"><Check size={16} /></div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1: Confidence */}
        {step === 1 && (
          <div className="w-full max-w-md animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">How confident are you?</h2>
            <p className="text-gray-400 text-center mb-8">This helps us adjust the difficulty curve.</p>
            
            <div className="space-y-4">
              {PERSONALIZATION_OPTIONS.confidence.map(opt => {
                const selected = confidence === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setConfidence(opt.id)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center transition-all ${selected ? 'bg-purple-600/20 border-purple-500' : 'bg-gray-800 border-gray-700'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl mr-4">
                      {opt.icon}
                    </div>
                    <span className={`text-lg font-bold ${selected ? 'text-white' : 'text-gray-300'}`}>{opt.label}</span>
                    {selected && <Check className="ml-auto text-purple-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="w-full max-w-md animate-in slide-in-from-right duration-300">
             <div className="flex justify-center mb-4">
                <Sparkles className="text-yellow-400 w-12 h-12 animate-pulse" />
             </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">What is your main goal?</h2>
            <p className="text-gray-400 text-center mb-8">We'll help you focus on what matters.</p>
            
            <div className="space-y-4">
              {PERSONALIZATION_OPTIONS.goals.map(opt => {
                const selected = goal === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setGoal(opt.id)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center transition-all ${selected ? 'bg-yellow-600/20 border-yellow-500' : 'bg-gray-800 border-gray-700'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl mr-4">
                      {opt.icon}
                    </div>
                    <span className={`text-lg font-bold ${selected ? 'text-white' : 'text-gray-300'}`}>{opt.label}</span>
                    {selected && <Check className="ml-auto text-yellow-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingQuiz;