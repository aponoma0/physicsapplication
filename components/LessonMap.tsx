import React from 'react';
import { Unit, Lesson } from '../types';
import { Lock, Star, Check } from 'lucide-react';

interface LessonMapProps {
  units: Unit[];
  activeUnitId: string;
  onLessonClick: (lesson: Lesson) => void;
}

const LessonMap: React.FC<LessonMapProps> = ({ units, activeUnitId, onLessonClick }) => {
  const isImage = (icon: string) => icon.startsWith('http') || icon.startsWith('data:image');

  return (
    <div className="pb-32 pt-20 px-4 flex flex-col items-center space-y-8">
      {units.map((unit) => (
        <div key={unit.id} className="w-full max-w-md">
          <div className={`mb-6 p-4 rounded-2xl border-2 ${unit.id === activeUnitId ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-800 border-gray-700'}`}>
            <h2 className={`text-xl font-bold ${unit.color === 'green' ? 'text-green-400' : unit.color === 'pink' ? 'text-pink-400' : 'text-yellow-400'}`}>
              {unit.title}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{unit.description}</p>
          </div>

          <div className="flex flex-col items-center space-y-6 relative">
             {/* Snake Layout Logic */}
            {unit.lessons.map((lesson, index) => {
              // Calculate offset for snake path
              const xOffset = Math.sin((index / 2) * Math.PI) * 60; // -60 to 60px
              const colorClass = 
                lesson.color === 'green' ? 'bg-green-500 border-green-700' : 
                lesson.color === 'pink' ? 'bg-pink-500 border-pink-700' : 
                'bg-yellow-500 border-yellow-700';
              
              const lockedClass = 'bg-gray-700 border-gray-600 grayscale opacity-70';
              const activeClass = lesson.locked ? lockedClass : colorClass;
              
              return (
                <div 
                  key={lesson.id} 
                  className="relative z-10"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  {/* Floating Stars for completed lessons */}
                  {lesson.completed && (
                     <div className="absolute -top-2 -right-2 z-20 flex bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-600 shadow-sm animate-bounce-short">
                        <Star size={10} className="fill-black mr-1" /> CLR
                     </div>
                  )}

                  <button
                    onClick={() => !lesson.locked && onLessonClick(lesson)}
                    disabled={lesson.locked}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl 
                      border-b-8 transition-all active:border-b-0 active:translate-y-2
                      ${activeClass} overflow-hidden
                    `}
                  >
                    {lesson.locked ? (
                      <Lock className="text-gray-400 w-8 h-8" />
                    ) : lesson.completed ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span className="opacity-50 flex items-center justify-center w-full h-full">
                           {isImage(lesson.icon) ? (
                              <img src={lesson.icon} alt={lesson.title} className="w-10 h-10 object-contain" />
                           ) : (
                              lesson.icon
                           )}
                        </span>
                        <Check className="absolute inset-0 m-auto text-white w-10 h-10 drop-shadow-md stroke-[3]" />
                      </div>
                    ) : (
                      <span className="flex items-center justify-center w-full h-full">
                          {isImage(lesson.icon) ? (
                              <img src={lesson.icon} alt={lesson.title} className="w-10 h-10 object-contain drop-shadow-md" />
                           ) : (
                              lesson.icon
                           )}
                      </span>
                    )}
                  </button>
                  
                  {/* Lesson Title Label */}
                  <div className="absolute top-24 left-1/2 -translate-x-1/2 w-32 text-center">
                    <span className={`text-sm font-bold px-2 py-1 rounded-md border 
                      ${lesson.locked 
                        ? 'text-gray-500 bg-gray-900/50 border-gray-800' 
                        : 'text-gray-300 bg-gray-900/80 border-gray-700'
                      }`}
                    >
                       {lesson.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonMap;