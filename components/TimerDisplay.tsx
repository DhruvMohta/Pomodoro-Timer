import React from 'react';
import { TimerMode } from '../types';
import { Play, Pause, SkipForward, RotateCcw, Settings as SettingsIcon } from 'lucide-react';

interface TimerDisplayProps {
  timeLeft: number;
  mode: TimerMode;
  isRunning: boolean;
  setsCompleted: number;
  setsUntilLongBreak: number;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onOpenSettings: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeLeft,
  mode,
  isRunning,
  setsCompleted,
  setsUntilLongBreak,
  onToggle,
  onReset,
  onSkip,
  onOpenSettings
}) => {
  
  const getModeLabel = () => {
    switch(mode) {
      case TimerMode.FOCUS: return 'STUDY_MODE';
      case TimerMode.SHORT_BREAK: return 'SHORT_BREAK';
      case TimerMode.LONG_BREAK: return 'LONG_BREAK';
    }
  };

  // Determine text color classes based on mode for the large timer only
  const timerColorClass = mode === TimerMode.FOCUS 
    ? 'text-[var(--color-primary)]' // Cyan for focus
    : mode === TimerMode.SHORT_BREAK 
      ? 'text-[#4ade80]' // Green
      : 'text-[#f472b6]'; // Pink

  const modeBadgeClass = mode === TimerMode.FOCUS
    ? 'border-[var(--color-primary)] text-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]'
    : mode === TimerMode.SHORT_BREAK
      ? 'border-[#4ade80] text-[#4ade80] shadow-[0_0_10px_#4ade80]'
      : 'border-[#f472b6] text-[#f472b6] shadow-[0_0_10px_#f472b6]';

  // The polygon shape definition for consistency
  // Top-Left corner cut, Bottom-Right corner cut
  const clipPathStyle = 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)';
  const clipPathStyleInner = 'polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)';

  return (
    // Reduced background opacity from 60 to 40 for a brighter look
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-12 relative z-10 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
      
      {/* Decorative Corner Lines */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--color-primary)] rounded-tl-xl opacity-50"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--color-secondary)] rounded-tr-xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--color-secondary)] rounded-bl-xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--color-primary)] rounded-br-xl opacity-50"></div>

      {/* Mode Indicator */}
      <div className={`mb-8 px-6 py-2 border rounded-full uppercase tracking-[0.3em] text-sm font-bold bg-black/50 ${modeBadgeClass} animate-pulse`}>
        {getModeLabel()}
      </div>

      {/* Main Clock */}
      <div className={`text-[7rem] md:text-[9rem] leading-none font-bold tracking-wider tabular-nums mb-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] select-none transition-colors duration-500 font-[VT323] ${timerColorClass}`} style={{ textShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
        {formatTime(timeLeft)}
      </div>

      {/* Set Counter */}
      <div className="flex gap-4 mb-12 items-center">
        <span className="text-xs uppercase tracking-widest text-slate-500">Cycle Progress</span>
        <div className="flex gap-2">
            {Array.from({ length: setsUntilLongBreak }).map((_, i) => {
                const completedSetsInCycle = setsCompleted % setsUntilLongBreak;
                const isCompleted = i < completedSetsInCycle;
                return (
                    <div 
                        key={i} 
                        className={`w-12 h-2 skew-x-[-20deg] transition-all duration-300 ${
                            isCompleted 
                            ? 'bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]' 
                            : 'bg-slate-800'
                        }`}
                    />
                );
            })}
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col items-center gap-8 w-full">
        
        {/* BIG START BUTTON CONSTRUCT */}
        <div className="relative group w-72 h-20 cursor-pointer" onClick={onToggle}>
            
            {/* 1. Glow Layer - Uses drop-shadow to follow the clip-path shape exactly */}
            <div 
                className={`absolute inset-0 transition-all duration-500 ${
                    isRunning 
                        ? 'opacity-40' 
                        : 'opacity-60 group-hover:opacity-100'
                }`}
                style={{
                    filter: isRunning 
                        ? 'drop-shadow(0 0 8px var(--color-secondary))' 
                        : 'drop-shadow(0 0 15px var(--color-primary))'
                }}
            >
                <div 
                    className="w-full h-full"
                    style={{ 
                        clipPath: clipPathStyle,
                        backgroundColor: isRunning ? 'var(--color-secondary)' : 'var(--color-primary)'
                    }}
                ></div>
            </div>

            {/* 2. Physical Button Layer */}
            <button className="relative w-full h-full block focus:outline-none active:scale-95 transition-transform duration-100">
                
                {/* Background (Solid for Start, Border-simulation for Pause) */}
                {isRunning ? (
                    // PAUSE STATE: Border Look
                    <>
                        {/* Outer Border Color */}
                        <div className="absolute inset-0 bg-[var(--color-secondary)] transition-colors duration-300" style={{ clipPath: clipPathStyle }}></div>
                        {/* Inner Black Cutout */}
                        <div className="absolute inset-[3px] bg-black/90 transition-colors duration-300" style={{ clipPath: clipPathStyleInner }}></div>
                    </>
                ) : (
                    // START STATE: Solid Fill
                    <div className="absolute inset-0 bg-[var(--color-primary)] transition-colors duration-300" style={{ clipPath: clipPathStyle }}>
                         <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300"></div>
                    </div>
                )}

                {/* Text Content */}
                <span className={`relative z-10 flex items-center justify-center gap-3 h-full uppercase font-bold tracking-[0.25em] text-2xl transition-colors duration-300 ${
                    isRunning ? 'text-[var(--color-secondary)] group-hover:text-white' : 'text-black'
                }`}>
                    {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                    {isRunning ? 'PAUSE' : 'START'}
                </span>
            </button>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex gap-6">
            <SecondaryButton onClick={onReset} icon={<RotateCcw className="w-5 h-5"/>} label="RESET" />
            <SecondaryButton onClick={onSkip} icon={<SkipForward className="w-5 h-5"/>} label="SKIP" />
            <SecondaryButton onClick={onOpenSettings} icon={<SettingsIcon className="w-5 h-5"/>} label="CONFIG" />
        </div>
      </div>

    </div>
  );
};

const SecondaryButton = ({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className="group flex flex-col items-center gap-2 text-slate-500 hover:text-[var(--color-primary)] transition-colors focus:outline-none"
    >
        <div className="relative p-4 overflow-hidden">
             {/* Hex or Skewed Shape */}
             <div className="absolute inset-0 border border-slate-700 bg-black/40 skew-x-[-12deg] group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/10 transition-all duration-300"></div>
             <div className="relative z-10 group-active:scale-90 transition-transform">
                 {icon}
             </div>
        </div>
        <span className="text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">{label}</span>
    </button>
);
