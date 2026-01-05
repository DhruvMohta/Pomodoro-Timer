import React, { useState, useRef, useEffect } from 'react';
import { usePomodoro } from './hooks/usePomodoro';
import { MusicPlayer } from './components/MusicPlayer';
import { TimerDisplay } from './components/TimerDisplay';
import { Settings } from './components/Settings';
import { Music, AlertTriangle } from 'lucide-react';

function App() {
  const { 
    timeLeft, 
    mode, 
    isRunning, 
    setsCompleted, 
    config, 
    toggleTimer, 
    resetTimer, 
    skipStage, 
    updateConfig 
  } = usePomodoro();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  
  // Video State
  const [backgroundSrc, setBackgroundSrc] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Background Handlers ---

  const handleBackgroundUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoError(false); 
    setIsVideoLoaded(false);
    setBackgroundSrc(url);
  };

  // --- Theme Extraction (Vibrancy Algorithm) ---
  const extractThemeColors = () => {
    const video = videoRef.current;
    if (!video || videoError || !backgroundSrc) return;

    try {
        const canvas = document.createElement('canvas');
        canvas.width = 50; 
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, 50, 50);
        const frameData = ctx.getImageData(0, 0, 50, 50).data;
        
        const hueBuckets: number[] = new Array(36).fill(0); 
        
        for (let i = 0; i < frameData.length; i += 4) {
            const r = frameData[i] / 255;
            const g = frameData[i+1] / 255;
            const b = frameData[i+2] / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            if (s > 0.15 && l > 0.1 && l < 0.9) {
                const hueIndex = Math.floor(h * 36) % 36;
                hueBuckets[hueIndex] += s; 
            }
        }

        let bestHueBucket = -1;
        let maxScore = -1;

        for (let i = 0; i < 36; i++) {
            if (hueBuckets[i] > maxScore) {
                maxScore = hueBuckets[i];
                bestHueBucket = i;
            }
        }

        let primaryH = 188; // Default Cyan
        let secondaryH = 270; // Default Purple

        if (bestHueBucket !== -1) {
            primaryH = (bestHueBucket * 10) + 5; 
            secondaryH = (primaryH + 180) % 360; 
        }

        const primaryColor = `hsl(${primaryH}, 100%, 65%)`;
        const secondaryColor = `hsl(${secondaryH}, 100%, 75%)`;

        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--color-secondary', secondaryColor);

    } catch (e) {
        console.warn("Could not extract theme colors", e);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && backgroundSrc && !videoError) {
        video.muted = true;
        
        const attemptPlay = async () => {
            try {
                await video.play();
                // Extract colors once playing
                setTimeout(extractThemeColors, 500); 
            } catch (error) {
                console.log("Auto-play prevented", error);
            }
        };
        attemptPlay();
    } else if (!backgroundSrc) {
        // Reset to default colors if no video
        document.documentElement.style.removeProperty('--color-primary');
        document.documentElement.style.removeProperty('--color-secondary');
    }
  }, [backgroundSrc, videoError]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const onVideoLoaded = () => {
    setIsVideoLoaded(true);
    setTimeout(extractThemeColors, 200);
  };

  const showVideo = backgroundSrc && !videoError;
  const showFallback = !backgroundSrc || videoError || (backgroundSrc && !isVideoLoaded);

  return (
    <div className="min-h-screen w-full flex text-slate-200 overflow-hidden relative transition-colors duration-1000 bg-[#050505]">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 bg-black overflow-hidden">
        {/* Fallback / Default Background (Gradient + Grid) */}
        {showFallback && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-cyan-900/40 animate-pulse transition-opacity duration-1000">
                <div className="absolute inset-0 opacity-20" 
                     style={{ 
                         backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 211, 238, .3) 25%, rgba(34, 211, 238, .3) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .3) 75%, rgba(34, 211, 238, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 211, 238, .3) 25%, rgba(34, 211, 238, .3) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .3) 75%, rgba(34, 211, 238, .3) 76%, transparent 77%, transparent)',
                         backgroundSize: '50px 50px'
                     }}
                ></div>
            </div>
        )}

        {/* Video Background */}
        {backgroundSrc && !videoError && (
            <video 
                ref={videoRef}
                loop 
                muted 
                playsInline
                crossOrigin="anonymous" 
                onError={handleVideoError}
                onLoadedData={onVideoLoaded}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-90' : 'opacity-0'}`}
                src={backgroundSrc}
            />
        )}
        
        {/* Overlay to dim slightly */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      </div>

      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden opacity-5">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>
      
      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.3)_100%)]"></div>

      {/* Main Layout */}
      <div className="flex w-full h-screen relative z-10">
        
        {/* Music Player */}
        <div className={`
            fixed inset-y-0 left-0 z-50 w-80 shadow-2xl transform transition-transform duration-300 ease-in-out bg-black/80 backdrop-blur-md border-r border-white/10
            ${isMusicOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
           <MusicPlayer onClose={() => setIsMusicOpen(false)} className="h-full bg-transparent" />
        </div>
        
        {!isMusicOpen && (
            <button 
            className="fixed bottom-8 left-8 z-50 p-4 bg-black/60 border border-slate-500 rounded-full text-[var(--color-primary)] shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm active:scale-95 transition-all hover:text-white hover:border-[var(--color-primary)] hover:bg-white/10 group"
            onClick={() => setIsMusicOpen(true)}
            title="Open Music Player"
            >
            <Music className="w-6 h-6 group-hover:animate-pulse" />
            </button>
        )}

        {/* Video Error Warning */}
        {videoError && backgroundSrc && !isSettingsOpen && (
             <div className="fixed bottom-8 right-8 z-40">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-xs uppercase hover:bg-red-900/40 transition-colors"
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Signal Lost</span>
                </button>
             </div>
        )}

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
             <div className="mt-[-5vh]"> 
                <TimerDisplay 
                    timeLeft={timeLeft}
                    mode={mode}
                    isRunning={isRunning}
                    setsCompleted={setsCompleted}
                    setsUntilLongBreak={config.setsUntilLongBreak}
                    onToggle={toggleTimer}
                    onReset={resetTimer}
                    onSkip={skipStage}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                />
             </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <Settings 
          config={config} 
          onUpdate={(newConfig) => {
            updateConfig(newConfig);
          }} 
          onBackgroundUpload={handleBackgroundUpload}
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;