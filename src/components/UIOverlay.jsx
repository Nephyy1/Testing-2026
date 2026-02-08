import React from 'react';
import { Camera, Heart } from 'lucide-react';

const UIOverlay = ({ activeGesture, hasPermission }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <h1 className="text-white/50 text-xs tracking-[0.4em] font-mono">NEURAL PARTICLES</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasPermission ? 'bg-green-500 shadow-[0_0_10px_#0f0]' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono text-white/60">
            {hasPermission ? 'SENSOR ACTIVE' : 'NO SIGNAL'}
          </span>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {activeGesture === 'HEART' && (
          <div className="flex flex-col items-center animate-pulse duration-700">
            <Heart size={48} className="text-pink-500 fill-pink-500 blur-sm" />
            <span className="text-pink-300 font-mono text-xs mt-2 tracking-widest">TRUE LOVE DETECTED</span>
          </div>
        )}
      </div>

      <div className="text-center">
        {!hasPermission && (
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded border border-white/20">
            <Camera size={16} />
            <span className="text-xs font-mono">ALLOW CAMERA ACCESS</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIOverlay;
