
import React, { useState, useEffect } from 'react';
import { generateLessonContent } from '../services/gemini';
import { Lesson, Question, TheorySection, UserPreferences } from '../types';
import { XP_PER_LESSON } from '../constants';
import { Loader2, CheckCircle, XCircle, Heart, Lightbulb, Trophy, ArrowRight, Lock, ExternalLink, Monitor } from 'lucide-react';
import SortingGame from './SortingGame';
import DistanceDisplacementSim from './DistanceDisplacementSim';

interface QuizViewProps {
  lesson: Lesson;
  userPreferences?: UserPreferences;
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
  onRestart: () => void;
  onWrongAnswer: () => void;
  hearts: number;
}

const QuizView: React.FC<QuizViewProps> = ({ lesson, userPreferences, onComplete, onExit, onRestart, onWrongAnswer, hearts }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [theory, setTheory] = useState<TheorySection | null>(null);
  
  const [loading, setLoading] = useState(true);
  // viewState controls the flow: 'loading' -> 'theory' -> 'quiz' -> 'completed'
  const [viewState, setViewState] = useState<'loading' | 'theory' | 'quiz' | 'completed'>('loading');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [streak, setStreak] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  
  // Interactive Theory State
  const [activeTerm, setActiveTerm] = useState<{term: string, def: string} | null>(null);
  
  // Sorting Game State
  const [isSortingGameComplete, setIsSortingGameComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadContent = async () => {
      setLoading(true);
      try {
        const interests = userPreferences?.interests;
        const data = await generateLessonContent(lesson.topic, interests);
        if (mounted) {
          setTheory(data.theory);
          setQuestions(data.questions);
          // If there is no sorting game, mark it as complete by default
          if (!data.theory.sortingGame) {
             setIsSortingGameComplete(true);
          } else {
             setIsSortingGameComplete(false);
          }
          setLoading(false);
          
          // If it's a revision lesson, skip theory
          const isRevision = lesson.title.toLowerCase().includes('revision') || lesson.topic.toLowerCase().includes('review');
          setViewState(isRevision ? 'quiz' : 'theory');
        }
      } catch (e) {
        console.error(e);
        if (mounted) setLoading(false);
      }
    };
    loadContent();
    return () => { mounted = false; };
  }, [lesson, userPreferences]);

  const handleStartQuiz = () => {
    setViewState('quiz');
  };

  const handleCheck = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    
    let isCorrect = false;

    if (currentQ.type === 'text') {
       if (!textAnswer.trim()) return;
       const answer = textAnswer.trim().toLowerCase();
       // Check if the answer contains any of the required keywords
       if (currentQ.acceptedKeywords && currentQ.acceptedKeywords.length > 0) {
         isCorrect = currentQ.acceptedKeywords.some(keyword => answer.includes(keyword.toLowerCase()));
       } else {
         isCorrect = true; // Fallback if no keywords defined, accept any non-empty answer
       }
    } else {
       if (selectedOption === null) return;
       isCorrect = selectedOption === currentQ.correctAnswerIndex;
    }

    if (isCorrect) {
      setStatus('correct');
      setStreak(s => s + 1);
      const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else {
      setStatus('wrong');
      setStreak(0);
      onWrongAnswer();
      const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/assets/soundboard/explode.wav');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  const handleNext = () => {
    if (hearts === 0) {
      setStatus('idle');
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTextAnswer('');
      setStatus('idle');
    } else {
      // Quiz Finished
      const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/assets/soundboard/win.mp3'); 
      audio.volume = 0.4;
      audio.play().catch(() => {});
      setViewState('completed');
    }
  };

  // --- PARSER FOR INTERACTIVE TEXT ---
  // Parses strings like "The **force** is strong with [gravity||the force that attracts mass]."
  const renderInteractiveText = (text: string) => {
    // Regex matches: [term||def] OR **bold**
    const regex = /(\[.*?\|\|.*?\]|\*\*.*?\*\*)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      // Handle Bold: **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-extrabold">{part.slice(2, -2)}</strong>;
      }
      
      // Handle Interactive: [term||def]
      if (part.startsWith('[') && part.endsWith(']')) {
        const content = part.slice(1, -1);
        const separatorIdx = content.indexOf('||');
        if (separatorIdx !== -1) {
          const term = content.substring(0, separatorIdx);
          const def = content.substring(separatorIdx + 2);
          return (
            <button 
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTerm({ term, def });
              }}
              className="mx-0.5 px-1.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border-b-2 border-blue-500 font-bold hover:bg-blue-500/40 transition-colors inline-block cursor-pointer active:scale-95"
            >
              {term}
            </button>
          );
        }
      }
      
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };

  // --- LOADING STATE ---
  if (viewState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
        <p className="text-lg font-medium animate-pulse">Preparing lesson...</p>
        <p className="text-sm text-gray-400 mt-2">Generating personalized theory & questions</p>
        <button onClick={onExit} className="mt-12 text-gray-500 hover:text-gray-300 text-sm font-bold uppercase tracking-wide py-2 px-6 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
          Cancel
        </button>
      </div>
    );
  }

  // --- GAME OVER STATE ---
  if (hearts === 0 && status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 px-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 border-4 border-gray-700">
          <Heart className="w-12 h-12 text-gray-500 fill-gray-500" /> 
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Out of lives!</h2>
        <p className="text-gray-400 mb-8 text-lg">You made 3 mistakes. Review the topic and try again to earn your XP.</p>
        
        <button 
          onClick={onRestart}
          className="w-full py-4 bg-blue-500 hover:bg-blue-400 rounded-2xl text-xl font-bold uppercase tracking-wide shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 mb-4"
        >
          Try Again
        </button>
        
        <button 
          onClick={onExit}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl text-xl font-bold uppercase tracking-wide text-gray-400 border-2 border-gray-700"
        >
          Quit
        </button>
      </div>
    );
  }

  // --- SUCCESS / COMPLETED STATE ---
  if (viewState === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-6 text-center animate-in zoom-in-95 duration-500">
        
        {/* Success Animation Area */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(250,204,21,0.6)] border-4 border-yellow-200 animate-bounce-short">
            <Trophy className="w-16 h-16 text-yellow-900 fill-yellow-900" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2">
          Lesson Complete!
        </h1>
        <p className="text-gray-400 text-lg mb-8">You're one step closer to mastering physics.</p>

        {/* Stats Card */}
        <div className="flex w-full max-w-xs bg-gray-800 rounded-2xl border-2 border-gray-700 p-4 mb-8 justify-around">
           <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">XP Earned</span>
              <div className="flex items-center text-yellow-400 font-bold text-2xl">
                 <span className="mr-1">+</span>{XP_PER_LESSON}
              </div>
           </div>
           <div className="w-px bg-gray-700"></div>
           <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Hearts</span>
               <div className="flex items-center text-red-500 font-bold text-2xl">
                 <Heart className="w-6 h-6 mr-1 fill-current" />
                 {hearts}
              </div>
           </div>
        </div>

        <button 
          onClick={() => onComplete(XP_PER_LESSON)}
          className="w-full py-4 bg-green-500 hover:bg-green-400 rounded-2xl text-xl font-bold uppercase tracking-wide shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
        >
          Continue
          <ArrowRight className="ml-2 w-6 h-6" />
        </button>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (!theory || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900">
        <p className="text-red-400">Failed to load lesson content.</p>
        <button onClick={onExit} className="mt-4 px-6 py-2 bg-gray-700 rounded-lg">Go Back</button>
      </div>
    );
  }

  // --- THEORY VIEW ---
  if (viewState === 'theory') {
    return (
      <div className="flex flex-col h-full bg-gray-900 relative animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-4 py-6 flex items-center justify-between">
          <button onClick={() => setShowQuitModal(true)} className="text-gray-400 hover:text-white transition-colors">
            <XCircle size={28} />
          </button>
          <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Theory Guide</span>
          <div className="w-7" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-32">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-900/30 rounded-2xl flex items-center justify-center text-4xl border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              {lesson.icon.startsWith('data:') || lesson.icon.startsWith('http') ? (
                  <img src={lesson.icon} alt="" className="w-12 h-12 object-contain" />
              ) : (
                  lesson.icon
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-white mb-8">
            {theory.title}
          </h1>

          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            {theory.paragraphs.map((para, idx) => (
              <p key={idx} className="leading-8">
                {renderInteractiveText(para)}
              </p>
            ))}
          </div>

          {/* External Simulation Module (Legacy support) */}
          {theory.simulationUrl && !theory.simulationType && (
            <div className="my-8 rounded-xl overflow-hidden border-2 border-blue-500/50 bg-black shadow-lg animate-in fade-in duration-500">
              <div className="bg-blue-900/30 px-4 py-2 flex justify-between items-center border-b border-blue-500/30">
                <span className="font-bold text-blue-300 flex items-center gap-2 text-sm uppercase tracking-wide">
                   <Monitor className="w-4 h-4"/> Interactive Lab
                </span>
                <a 
                  href={theory.simulationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-blue-400 hover:text-white flex items-center bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
                >
                   Open Fullscreen <ExternalLink className="w-3 h-3 ml-1"/>
                </a>
              </div>
              <div className="aspect-[16/9] w-full relative bg-white">
                 <iframe 
                    src={theory.simulationUrl}
                    className="w-full h-full border-0"
                    title="Physics Simulation"
                    allowFullScreen
                    scrolling="no"
                 />
              </div>
              <div className="p-3 bg-gray-800 text-xs text-gray-400 text-center border-t border-gray-700">
                 Tap or click inside the simulation to experiment!
              </div>
            </div>
          )}

          {/* NEW Internal Simulation Module */}
          {theory.simulationType === 'distance-displacement' && (
             <DistanceDisplacementSim />
          )}

          <div className="mt-8 bg-gray-800/80 border-l-4 border-yellow-500 p-5 rounded-r-xl mb-8">
            <div className="flex items-center mb-2 text-yellow-400 font-bold uppercase text-sm tracking-wide">
              <Lightbulb className="w-4 h-4 mr-2" />
              Key Concept
            </div>
            <p className="text-white font-medium italic">
              "{theory.keyPoint}"
            </p>
          </div>

          {/* Sorting Game Module */}
          {theory.sortingGame && (
             <SortingGame 
                game={theory.sortingGame}
                onComplete={() => setIsSortingGameComplete(true)}
             />
          )}

        </div>

        {/* Footer Action */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800 z-10">
          <button 
            onClick={handleStartQuiz}
            disabled={!isSortingGameComplete}
            className={`w-full py-4 rounded-2xl text-xl font-bold uppercase tracking-wide shadow-lg border-b-4 active:border-b-0 active:translate-y-1 text-white transition-all 
               ${isSortingGameComplete 
                  ? 'bg-green-500 hover:bg-green-400 border-green-700' 
                  : 'bg-gray-700 border-gray-800 cursor-not-allowed text-gray-400'
               }`}
          >
            {isSortingGameComplete ? 'Start Practice' : (
                <span className="flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2" /> Complete Game First
                </span>
            )}
          </button>
        </div>

        {/* Term Definition Sheet (Bottom Sheet) */}
        {activeTerm && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 flex items-end justify-center" onClick={() => setActiveTerm(null)}>
            <div 
              className="bg-gray-800 w-full max-w-md rounded-t-3xl border-t-2 border-gray-700 p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-1 bg-gray-600 rounded-full mb-6"></div>
                 <div className="inline-block px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
                   Definition
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-4">{activeTerm.term}</h3>
                 <p className="text-gray-300 text-lg leading-relaxed mb-8">
                   {activeTerm.def}
                 </p>
                 <button 
                   onClick={() => setActiveTerm(null)}
                   className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold uppercase tracking-wide text-white transition-colors"
                 >
                   Got it
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Quit Modal (Shared) */}
        {showQuitModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border-2 border-gray-700 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Leave lesson?</h3>
              <p className="text-gray-400 mb-6">You'll lose your current progress.</p>
              <div className="space-y-3">
                <button onClick={() => setShowQuitModal(false)} className="w-full py-3 bg-blue-500 rounded-xl font-bold uppercase shadow-lg border-b-4 border-blue-700">Keep Learning</button>
                <button onClick={onExit} className="w-full py-3 text-red-400 font-bold uppercase">Quit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- QUIZ VIEW (Existing logic) ---
  const currentQ = questions[currentIndex];
  // Guard against undefined currentQ
  if (!currentQ) {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <p className="text-red-400">Error: Question data missing.</p>
            <button onClick={onExit} className="mt-4 px-6 py-2 bg-gray-700 rounded-lg">Go Back</button>
          </div>
      );
  }
  
  const progressPercent = ((currentIndex) / questions.length) * 100;
  
  // Is this a text input question?
  const isTextQuestion = currentQ.type === 'text';

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <button onClick={() => setShowQuitModal(true)} className="text-gray-400 hover:text-white transition-colors">
          <XCircle size={28} />
        </button>
        <div className="flex-1 mx-4 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center text-red-500 font-bold">
          <Heart className="fill-current w-6 h-6 mr-1" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <h2 className="text-2xl font-bold text-white mb-6 mt-4">
          {currentQ.text}
        </h2>

        {isTextQuestion ? (
          <div className="space-y-4">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none min-h-[120px] transition-all resize-none"
              disabled={status !== 'idle'}
            />
            {status !== 'idle' && (
               <div className="text-xs text-gray-500">
                  Tip: Look for keywords like <span className="text-blue-400">"{currentQ.acceptedKeywords?.[0]}"</span>
               </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentQ.options?.map((option, idx) => {
              let borderClass = 'border-gray-700 border-b-4';
              let bgClass = 'bg-gray-800 text-white';

              if (status !== 'idle') {
                if (idx === currentQ.correctAnswerIndex) {
                  bgClass = 'bg-green-500/20 text-green-400 border-green-500';
                  borderClass = 'border-green-600 border-b-4';
                } else if (idx === selectedOption && status === 'wrong') {
                  bgClass = 'bg-red-500/20 text-red-400 border-red-500';
                  borderClass = 'border-red-600 border-b-4';
                } else {
                  bgClass = 'opacity-50 border-transparent';
                  borderClass = 'border-transparent border-b-4';
                }
              } else if (selectedOption === idx) {
                bgClass = 'bg-blue-500/20 text-blue-400 border-blue-500';
                borderClass = 'border-blue-500 border-b-4';
              }

              return (
                <button
                  key={idx}
                  disabled={status !== 'idle'}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full p-4 rounded-xl text-left text-lg font-medium transition-all ${bgClass} border-2 ${borderClass} active:scale-[0.98]`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 mr-3 ${selectedOption === idx ? 'border-current' : 'border-gray-600'}`}>
                      {idx + 1}
                    </div>
                    {option}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Area */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t-2 ${status === 'correct' ? 'bg-gray-900 border-green-500' : status === 'wrong' ? 'bg-gray-900 border-red-500' : 'bg-gray-900 border-gray-800'}`}>
        {status === 'idle' ? (
          <button 
            onClick={handleCheck}
            disabled={isTextQuestion ? !textAnswer.trim() : selectedOption === null}
            className={`w-full py-4 rounded-2xl text-xl font-bold uppercase tracking-wide shadow-lg transition-transform ${(isTextQuestion ? textAnswer.trim() : selectedOption !== null) ? 'bg-green-500 text-white border-b-4 border-green-700 active:translate-y-1 active:border-b-0' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
          >
            Check
          </button>
        ) : (
          <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="mb-4">
              <div className={`flex items-center text-xl font-bold mb-2 ${status === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                {status === 'correct' ? <CheckCircle className="w-8 h-8 mr-2" /> : <XCircle className="w-8 h-8 mr-2" />}
                {status === 'correct' ? 'Excellent!' : 'Correct Answer:'}
              </div>
              {status === 'wrong' && (
                <div className="text-white text-lg">
                   {isTextQuestion ? (
                     <span>Keywords: {currentQ.acceptedKeywords?.join(', ')}</span>
                   ) : (
                     currentQ.options && currentQ.correctAnswerIndex !== undefined && currentQ.options[currentQ.correctAnswerIndex]
                   )}
                </div>
              )}
              <div className="text-gray-400 text-sm mt-2 p-3 bg-gray-800 rounded-lg">
                <span className="font-bold text-gray-300">Explanation:</span> {currentQ.explanation}
              </div>
            </div>
            <button 
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl text-xl font-bold uppercase tracking-wide shadow-lg transition-transform text-white border-b-4 active:translate-y-1 active:border-b-0 ${status === 'correct' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'}`}
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border-2 border-gray-700 shadow-2xl text-center transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-4">😮</div>
            <h3 className="text-xl font-bold text-white mb-2">Wait, don't go!</h3>
            <p className="text-gray-400 mb-6">You're making great progress. If you quit now, you'll lose your progress for this lesson.</p>
            
            <button 
              onClick={() => setShowQuitModal(false)}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 rounded-xl text-lg font-bold uppercase tracking-wide mb-3 shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1"
            >
              Keep Learning
            </button>
            
            <button 
              onClick={onExit}
              className="w-full py-3 bg-transparent hover:bg-red-900/20 text-red-400 rounded-xl text-lg font-bold uppercase tracking-wide border-2 border-transparent hover:border-red-500/50"
            >
              Quit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
