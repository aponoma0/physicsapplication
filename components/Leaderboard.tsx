import React, { useEffect, useState } from 'react';
import { UserState } from '../types';
import { db } from '../services/db';
import { Loader2, User } from 'lucide-react';

interface LeaderboardProps {
  user: UserState;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const leaderboard = await db.getLeaderboard();
        if (mounted) {
          // Identify which row is the current user for highlighting
          const processed = leaderboard.map(entry => ({
             ...entry,
             isUser: entry.id === user.id
          }));
          setData(processed);
        }
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [user]);

  // Handle broken images for specific user indices
  const [brokenImages, setBrokenImages] = useState<{[key: number]: boolean}>({});

  const handleImgError = (index: number) => {
    setBrokenImages(prev => ({...prev, [index]: true}));
  };

  return (
    <div className="p-4 pb-32 pt-20 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6 text-purple-400">Weekly League</h1>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden animate-in fade-in duration-500">
          {data.map((entry, index) => {
            const isImage = entry.avatar && (entry.avatar.startsWith('http') || entry.avatar.startsWith('data:'));
            const showImage = isImage && !brokenImages[index];

            return (
              <div 
                key={index} 
                className={`flex items-center p-4 border-b border-gray-700 ${entry.isUser ? 'bg-purple-900/30' : ''}`}
              >
                <div className="w-8 font-bold text-gray-400 text-lg">{index + 1}</div>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 border border-gray-600 overflow-hidden ${showImage ? 'bg-gray-200' : 'bg-gray-700'}`}>
                  {showImage ? (
                    <img 
                      src={entry.avatar} 
                      alt={entry.name} 
                      className="w-full h-full object-cover" 
                      onError={() => handleImgError(index)}
                    />
                  ) : (
                     <span className="flex items-center justify-center w-full h-full">
                       {entry.avatar && entry.avatar.length > 20 ? <User size={20} className="text-white" /> : entry.avatar}
                     </span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className={`font-bold ${entry.isUser ? 'text-green-400' : 'text-white'}`}>
                    {entry.name}
                    {entry.isUser && <span className="ml-2 text-xs bg-purple-600 text-white px-1.5 rounded">YOU</span>}
                  </h3>
                </div>
                <div className="font-bold text-yellow-400">
                  {entry.xp} XP
                </div>
              </div>
            );
          })}
          
          {data.length === 0 && (
             <div className="p-8 text-center text-gray-500">
                No active players yet. Be the first!
             </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-6 bg-blue-900/30 rounded-2xl border border-blue-500/30 text-center">
        <h3 className="text-lg font-bold text-blue-300 mb-2">Promotion Zone</h3>
        <p className="text-gray-400 text-sm">Finish in the top 3 to advance to the Quantum Realm League next week!</p>
      </div>
    </div>
  );
};

export default Leaderboard;