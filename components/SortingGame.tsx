
import React, { useState, useEffect } from 'react';
import { SortingGame, SortingItem } from '../types';
import { Check, AlertCircle } from 'lucide-react';

interface SortingGameProps {
  game: SortingGame;
  onComplete: () => void;
}

const SortingGame: React.FC<SortingGameProps> = ({ game, onComplete }) => {
  // Items that are still in the pool to be sorted
  const [pool, setPool] = useState<SortingItem[]>(game.items);
  
  // Items placed in columns
  const [placed, setPlaced] = useState<{ [itemId: string]: string }>({}); // itemId -> categoryId
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Check completion
  useEffect(() => {
    if (pool.length === 0) {
      onComplete();
    }
  }, [pool, onComplete]);

  const handleItemClick = (item: SortingItem) => {
    if (feedback === 'wrong') return;
    setSelectedId(item.id);
    setShakeId(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!selectedId) return;
    
    const item = pool.find(i => i.id === selectedId);
    if (!item) return;

    if (item.categoryId === categoryId) {
      // Correct!
      setFeedback('correct');
      const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      // Move item logic
      setTimeout(() => {
        setPlaced(prev => ({ ...prev, [item.id]: categoryId }));
        setPool(prev => prev.filter(i => i.id !== item.id));
        setSelectedId(null);
        setFeedback(null);
      }, 300); // Small delay for visual feedback
      
    } else {
      // Wrong!
      setFeedback('wrong');
      setShakeId(item.id);
      const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/assets/soundboard/explode.wav');
      audio.volume = 0.3;
      audio.play().catch(() => {});

      setTimeout(() => {
        setFeedback(null);
        setShakeId(null);
      }, 500);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700 p-4 my-8 animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-200">{game.title}</h3>
        <span className="text-xs font-bold uppercase tracking-wide bg-blue-900/50 text-blue-300 px-2 py-1 rounded">Interactive</span>
      </div>
      
      {/* Drop Zones */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {game.categories.map(cat => {
          const isTarget = selectedId !== null;
          const bgClass = cat.color === 'blue' ? 'bg-blue-900/20 border-blue-500/30' : 
                         cat.color === 'purple' ? 'bg-purple-900/20 border-purple-500/30' : 
                         'bg-gray-700/50 border-gray-600';
          
          const activeClass = isTarget ? 'ring-2 ring-white ring-opacity-50 cursor-pointer animate-pulse' : '';
          
          return (
            <div 
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`rounded-xl border-2 p-3 min-h-[160px] transition-all flex flex-col ${bgClass} ${activeClass}`}
            >
              <div className="text-center text-sm font-bold uppercase mb-2 tracking-wide text-gray-300 pointer-events-none">
                {cat.label}
              </div>
              
              <div className="flex-1 space-y-2 pointer-events-none">
                {game.items.filter(item => placed[item.id] === cat.id).map(item => (
                  <div key={item.id} className="bg-gray-800 text-white text-xs font-bold p-2 rounded-lg flex items-center justify-center shadow-sm animate-in zoom-in duration-300">
                    <span className="mr-2 text-lg">{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>
              
              {/* Drop Target Hint */}
              {isTarget && (
                <div className="mt-2 text-center text-gray-500 text-xs animate-bounce">
                  Tap to place
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Item Pool */}
      {pool.length > 0 ? (
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
          <p className="text-center text-gray-400 text-sm mb-3 font-medium">
             Select an item to categorize it:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {pool.map(item => {
              const isSelected = selectedId === item.id;
              const isShaking = shakeId === item.id;
              
              let btnClass = 'bg-gray-800 hover:bg-gray-700 border-gray-600';
              if (isSelected) {
                if (feedback === 'correct') btnClass = 'bg-green-500 border-green-600 text-white scale-110';
                else if (feedback === 'wrong') btnClass = 'bg-red-500 border-red-600 text-white';
                else btnClass = 'bg-blue-500 border-blue-600 text-white ring-4 ring-blue-500/30 scale-105';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    relative px-4 py-3 rounded-xl border-b-4 font-bold text-sm flex items-center shadow-lg transition-all
                    active:border-b-0 active:translate-y-1
                    ${btnClass}
                    ${isShaking ? 'animate-bounce text-red-200 bg-red-900' : ''}
                  `}
                >
                  <span className="text-2xl mr-2">{item.icon}</span>
                  {item.label}
                  {isShaking && <AlertCircle className="absolute -top-2 -right-2 text-red-500 bg-gray-900 rounded-full" size={20} />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-green-500/10 rounded-xl border border-green-500/30">
          <Check className="mx-auto text-green-500 w-10 h-10 mb-2" />
          <h4 className="text-green-400 font-bold">All sorted! Great job!</h4>
        </div>
      )}
    </div>
  );
};

export default SortingGame;
