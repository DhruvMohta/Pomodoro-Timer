import React, { useState } from 'react';
import { TimerConfig } from '../types';
import { RetroButton } from './RetroButton';
import { X, Upload } from 'lucide-react';

interface SettingsProps {
  config: TimerConfig;
  onUpdate: (config: TimerConfig) => void;
  onClose: () => void;
  onBackgroundUpload?: (file: File) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  config, 
  onUpdate, 
  onClose, 
  onBackgroundUpload
}) => {
  const [localConfig, setLocalConfig] = useState<TimerConfig>(config);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onBackgroundUpload) {
      onBackgroundUpload(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-[var(--color-secondary)] w-full max-w-lg relative shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="bg-white/5 p-4 border-b border-[var(--color-secondary)] flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl text-[var(--color-secondary)] tracking-widest font-bold">SYSTEM_CONFIG</h2>
          <button onClick={onClose} className="text-[var(--color-secondary)] hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
            
          {/* --- MANUAL UPLOAD SECTION --- */}
          <div className="space-y-4">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Manual Override</h3>
            
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 text-xs uppercase mb-1">Local Video File</label>
              <label className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-slate-600 rounded hover:border-slate-400 hover:bg-slate-800 cursor-pointer text-slate-500 hover:text-slate-300 transition-all">
                  <Upload className="w-4 h-4" />
                  <span className="text-xs uppercase">Select .MP4 / .WebM</span>
                  <input type="file" accept="video/*" onChange={handleManualFileChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* --- TIMER CONFIG SECTION --- */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Chronometer Config</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                <label className="text-[var(--color-secondary)] text-xs uppercase">Focus (min)</label>
                <input 
                    type="number" 
                    name="focusDuration"
                    value={localConfig.focusDuration}
                    onChange={handleChange}
                    className="bg-black border border-slate-700 text-white p-2 focus:border-[var(--color-secondary)] focus:outline-none focus:shadow-[0_0_10px_var(--color-secondary)] font-mono"
                />
                </div>

                <div className="flex flex-col space-y-1">
                <label className="text-[var(--color-secondary)] text-xs uppercase">Short Break (min)</label>
                <input 
                    type="number" 
                    name="shortBreakDuration"
                    value={localConfig.shortBreakDuration}
                    onChange={handleChange}
                    className="bg-black border border-slate-700 text-white p-2 focus:border-[var(--color-secondary)] focus:outline-none focus:shadow-[0_0_10px_var(--color-secondary)] font-mono"
                />
                </div>

                <div className="flex flex-col space-y-1">
                <label className="text-[var(--color-secondary)] text-xs uppercase">Long Break (min)</label>
                <input 
                    type="number" 
                    name="longBreakDuration"
                    value={localConfig.longBreakDuration}
                    onChange={handleChange}
                    className="bg-black border border-slate-700 text-white p-2 focus:border-[var(--color-secondary)] focus:outline-none focus:shadow-[0_0_10px_var(--color-secondary)] font-mono"
                />
                </div>

                <div className="flex flex-col space-y-1">
                <label className="text-[var(--color-secondary)] text-xs uppercase">Sets / Cycle</label>
                <input 
                    type="number" 
                    name="setsUntilLongBreak"
                    value={localConfig.setsUntilLongBreak}
                    onChange={handleChange}
                    className="bg-black border border-slate-700 text-white p-2 focus:border-[var(--color-secondary)] focus:outline-none focus:shadow-[0_0_10px_var(--color-secondary)] font-mono"
                />
                </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-slate-900 pb-2 border-t border-slate-800">
             <RetroButton type="button" variant="danger" onClick={onClose}>Cancel</RetroButton>
             <RetroButton type="button" variant="secondary" onClick={handleSubmit}>Save Config</RetroButton>
          </div>
        </div>

        {/* Decor */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--color-secondary)]"></div>
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-[var(--color-secondary)]"></div>
      </div>
    </div>
  );
};