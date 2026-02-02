
import React from 'react';
import { Play, Square, Map as MapIcon, RotateCcw, CloudOff } from 'lucide-react';
import { formatDistance, formatSpeed } from '../utils';
import { GeoPoint } from '../types';

interface NavigationOverlayProps {
  isTracking: boolean;
  distance: number;
  currentLocation: GeoPoint | null;
  onToggleTracking: () => void;
  onReset: () => void;
  onToggleOffline: () => void;
  offlineMode: boolean;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  isTracking,
  distance,
  currentLocation,
  onToggleTracking,
  onReset,
  onToggleOffline,
  offlineMode
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 z-[1001]">
      {/* Top Stats - Pushed down for round screens */}
      <div className="w-full flex justify-between items-start px-10 pt-8 stats-container">
        <div className="flex flex-col items-center bg-black/60 backdrop-blur-md rounded-2xl p-2 min-w-[65px] border border-white/10">
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter">Dist</span>
          <span className="text-xs font-black text-white">{formatDistance(distance)}</span>
        </div>
        <div className="flex flex-col items-center bg-black/60 backdrop-blur-md rounded-2xl p-2 min-w-[65px] border border-white/10">
          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter">Speed</span>
          <span className="text-xs font-black text-white">{formatSpeed(currentLocation?.speed)}</span>
        </div>
      </div>

      {/* Center UI */}
      <div className="relative">
        {offlineMode && (
          <div className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <CloudOff size={10} /> OFFLINE
          </div>
        )}
      </div>

      {/* Bottom Controls - Pushed up for round screens */}
      <div className="w-full flex justify-around items-end pb-10 controls-container pointer-events-auto">
        <button 
          onClick={onReset}
          className="w-10 h-10 rounded-full bg-gray-900/90 flex items-center justify-center border border-white/20 active:bg-gray-700"
        >
          <RotateCcw size={18} className="text-white" />
        </button>

        <button 
          onClick={onToggleTracking}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 ${
            isTracking ? 'bg-red-600 border-red-400' : 'bg-emerald-600 border-emerald-400'
          }`}
        >
          {isTracking ? (
            <Square size={24} className="text-white fill-white" />
          ) : (
            <Play size={24} className="text-white fill-white ml-1" />
          )}
        </button>

        <button 
          onClick={onToggleOffline}
          className={`w-10 h-10 rounded-full flex items-center justify-center border active:bg-amber-700 transition-colors ${
            offlineMode ? 'bg-amber-600 border-amber-300' : 'bg-gray-900/90 border-white/20'
          }`}
        >
          <MapIcon size={18} className="text-white" />
        </button>
      </div>

      {/* Side Altitude Bar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-70">
        <div className="h-20 w-1 bg-white/20 rounded-full relative overflow-hidden">
          <div 
            className="absolute bottom-0 w-full bg-blue-400" 
            style={{ height: `${Math.min((currentLocation?.altitude || 0) / 10, 100)}%` }}
          />
        </div>
        <span className="text-[8px] text-white/60 font-bold mt-1">{Math.round(currentLocation?.altitude || 0)}m</span>
      </div>
    </div>
  );
};

export default NavigationOverlay;
