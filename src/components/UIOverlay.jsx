import React from 'react';
import { Camera, Heart, Play, Loader2 } from 'lucide-react';

const UIOverlay = ({ activeGesture, hasPermission, onStart, isRunning }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h1 className="text-white/40 text-[10px] tracking-[0.4em] font-mono uppercase">
          Quantum Particles
        </h1>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${hasPermission ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
          <span className="text-[9px] font-mono text-white/40 uppercase">
            {hasPermission ? 'Cam Ready' : 'Init Cam...'}
          </span>
        </div>
      </div>

      {/* Center Action */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
        {!isRunning && (
          <button 
            onClick={hasPermission ? onStart : null}
            disabled={!hasPermission}
            className={`
              group relative px-8 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full
              transition-all duration-500 hover:bg-white/10 hover:border-white/30 hover:scale-105
              ${!hasPermission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3">
              {!hasPermission ? (
                <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
              ) : (
                <Play className="w-4 h-4 text-white fill-white" />
              )}
              <span className="text-xs font-mono text-white tracking-widest">
                {hasPermission ? 'ENTER EXPERIENCE' : 'LOADING...'}
              </span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full blur-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        {/* Gesture Feedback saat Running */}
        {isRunning && activeGesture === 'HEART' && (
          <div className="flex flex-col items-center animate-pulse duration-1000">
            <Heart size={64} className="text-rose-500 fill-rose-500/20 blur-[1px] drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
            <span className="mt-4 text-rose-200 font-mono text-[10px] tracking-[0.5em] uppercase opacity-80">
              Pattern Match
            </span>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="text-center w-full">
        {!isRunning && hasPermission && (
          <p className="text-white/30 text-[10px] font-mono animate-pulse">
            Press enter to ignite particles
          </p>
        )}
        {isRunning && (
           <p className="text-white/20 text-[9px] font-mono">
             Use index finger to attract • Open palm to repel • Finger Heart for love
           </p>
        )}
      </div>
    </div>
  );
};

export default UIOverlay;
  
