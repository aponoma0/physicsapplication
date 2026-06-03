import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, MapPin, Footprints, ArrowUpRight } from 'lucide-react';

const DistanceDisplacementSim: React.FC = () => {
  // Grid size in logical meters
  const GRID_SIZE = 10; 
  
  // State
  // Positions are in percentage (0-100) relative to container
  const [history, setHistory] = useState<{x: number, y: number}[]>([{x: 50, y: 50}]);
  const [currentPos, setCurrentPos] = useState({x: 50, y: 50});
  
  // Metrics
  const [totalDistance, setTotalDistance] = useState(0);
  const [displacement, setDisplacement] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to calculate distance between two percentage points scaled to "meters"
  const calcDist = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    // Convert percentage diff to logical meters (assuming 100% = 10m)
    const dx = (p2.x - p1.x) / 100 * GRID_SIZE;
    const dy = (p2.y - p1.y) / 100 * GRID_SIZE; 
    return Math.sqrt(dx*dx + dy*dy);
  };

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newPos = { x, y };
    
    // Calculate added distance
    const addedDist = calcDist(currentPos, newPos);
    setTotalDistance(prev => prev + addedDist);
    
    // Calculate new displacement (from origin 50,50)
    const newDisp = calcDist({x: 50, y: 50}, newPos);
    setDisplacement(newDisp);

    // Update state
    setHistory(prev => [...prev, newPos]);
    setCurrentPos(newPos);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([{x: 50, y: 50}]);
    setCurrentPos({x: 50, y: 50});
    setTotalDistance(0);
    setDisplacement(0);
  };

  return (
    <div className="bg-gray-900 rounded-xl border-2 border-blue-500/30 overflow-hidden shadow-2xl my-6 select-none">
      
      {/* Header / HUD */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex space-x-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Footprints size={12} /> Distance
            </span>
            <span className="text-2xl font-mono text-yellow-400 font-bold">
              {totalDistance.toFixed(1)}m
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight size={12} /> Displacement
            </span>
            <span className="text-2xl font-mono text-blue-400 font-bold">
              {displacement.toFixed(1)}m
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleReset}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
          title="Reset Simulation"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Interactive Area */}
      <div className="relative w-full aspect-square bg-gray-950 cursor-pointer overflow-hidden group"
           ref={containerRef}
           onClick={handleAreaClick}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#4b5563 1px, transparent 1px), linear-gradient(90deg, #4b5563 1px, transparent 1px)', 
               backgroundSize: '10% 10%' 
             }} 
        />
        
        {/* Origin Marker */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-600 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* SVG Layer for Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Path (Distance) */}
          <polyline 
            points={history.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#facc15" // Yellow
            strokeWidth="0.8"
            strokeDasharray="2 2"
            className="opacity-80"
          />
          
          {/* Displacement Vector (Start to Current) */}
          <line 
            x1="50" y1="50"
            x2={currentPos.x} y2={currentPos.y}
            stroke="#60a5fa" // Blue
            strokeWidth="1"
            markerEnd="url(#arrowhead)"
          />
          
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#60a5fa" />
            </marker>
          </defs>
        </svg>

        {/* Character / Marker */}
        <div 
          className="absolute w-8 h-8 -ml-4 -mt-8 text-2xl transition-all duration-500 ease-out z-10 pointer-events-none flex flex-col items-center"
          style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
        >
           <span>🚶</span>
           <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
        </div>

        {/* Instructions Overlay (fades out on interaction) */}
        {history.length === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-bold border border-white/10 animate-pulse">
              Tap anywhere to move!
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-3 text-xs text-gray-500 text-center border-t border-gray-800">
        <span className="text-yellow-500 font-bold">Yellow Dashed</span> = Path (Distance) • 
        <span className="text-blue-400 font-bold ml-2">Blue Arrow</span> = Vector (Displacement)
      </div>
    </div>
  );
};

export default DistanceDisplacementSim;