import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, TimerConfig } from '../types';

// Default Config
const DEFAULT_CONFIG: TimerConfig = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  setsUntilLongBreak: 4,
};

export const usePomodoro = () => {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_CONFIG.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [setsCompleted, setSetsCompleted] = useState(0);
  
  // Use a ref for the interval to clear it easily
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    let duration = config.focusDuration;
    if (mode === TimerMode.SHORT_BREAK) duration = config.shortBreakDuration;
    if (mode === TimerMode.LONG_BREAK) duration = config.longBreakDuration;
    setTimeLeft(duration * 60);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [config, mode]);

  // Handle mode switching logic
  const switchMode = useCallback(() => {
    if (mode === TimerMode.FOCUS) {
      const newSets = setsCompleted + 1;
      setSetsCompleted(newSets);
      
      if (newSets % config.setsUntilLongBreak === 0) {
        setMode(TimerMode.LONG_BREAK);
        setTimeLeft(config.longBreakDuration * 60);
      } else {
        setMode(TimerMode.SHORT_BREAK);
        setTimeLeft(config.shortBreakDuration * 60);
      }
    } else {
      // Coming from a break, back to focus
      setMode(TimerMode.FOCUS);
      setTimeLeft(config.focusDuration * 60);
    }
    setIsRunning(false); // Pause on switch to let user breathe
  }, [mode, setsCompleted, config]);

  // Ticking logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      
      // Play a beep or notification sound here if we had one, 
      // for now we just switch modes.
      switchMode();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, switchMode]);

  // Update timer if config changes while not running
  useEffect(() => {
    if (!isRunning) {
        // If we change config, we might want to update the current timeLeft 
        // ONLY if we are at the start of a session (which is hard to track perfectly without more state)
        // ideally, we just let the next reset handle it or force a reset if the user saves settings.
    }
  }, [config, isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const updateConfig = (newConfig: TimerConfig) => {
    setConfig(newConfig);
    // If we update config, we usually reset the current session to avoid inconsistencies
    // But we'll leave that to the UI to trigger a reset if desired.
  };

  return {
    timeLeft,
    mode,
    isRunning,
    setsCompleted,
    config,
    toggleTimer,
    resetTimer,
    updateConfig,
    setConfig, 
    skipStage: switchMode
  };
};
