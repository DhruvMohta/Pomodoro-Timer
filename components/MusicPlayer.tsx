import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Trash2, X, Disc, ListMusic, Plus, Folder, ArrowLeft, HardDrive } from 'lucide-react';
import { Track, Playlist } from '../types';
import { DEFAULT_PLAYLISTS } from '../data/defaultTracks';

interface MusicPlayerProps {
  onClose?: () => void;
  className?: string;
}

// Augment HTMLInputElement attributes to support directory selection
declare module 'react' {
  interface InputHTMLAttributes<T> extends React.HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

type ViewState = 'PLAYER' | 'LIBRARY' | 'PLAYLIST_DETAIL';

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose, className = '' }) => {
  // Data State
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  
  // Player State
  const [activePlaylistId, setActivePlaylistId] = useState<string>(DEFAULT_PLAYLISTS[0].id);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // Error state can now hold a message string
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // UI State
  const [viewState, setViewState] = useState<ViewState>('PLAYER');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Derived
  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || playlists[0];
  const currentTrack = activePlaylist.tracks[currentTrackIndex];
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  // --- Audio Control Logic ---

  const playTrack = (playlistId: string, trackIndex: number) => {
    if (playlistId !== activePlaylistId) {
      setActivePlaylistId(playlistId);
    }
    setCurrentTrackIndex(trackIndex);
    setIsPlaying(true);
    setLoadError(null);
    setViewState('PLAYER'); // Switch to player view when playing
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setLoadError(null);
    if (currentTrackIndex < activePlaylist.tracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    } else {
      setCurrentTrackIndex(0); // Loop
    }
  };

  const prevTrack = () => {
    setLoadError(null);
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
    } else {
      // If at start, go to last track
      setCurrentTrackIndex(activePlaylist.tracks.length - 1);
    }
  };

  const handleTrackError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const target = e.currentTarget;
    console.warn(`Track failed to load: ${target.src}`);
    
    setLoadError('SIGNAL LOST - SKIPPING...');

    // Auto-skip after delay
    setTimeout(() => {
        if (isPlaying) nextTrack();
    }, 4000);
  };

  // --- Effects ---

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentTrack) {
        const currentSrc = audioRef.current.src;
        let shouldUpdateSrc = false;
        
        try {
            // Check if src actually changed to avoid reloading same track
            const trackUrlAbsolute = new URL(currentTrack.url, window.location.href).href;
            if (currentSrc !== trackUrlAbsolute) {
                shouldUpdateSrc = true;
            }
        } catch (e) {
            if (currentSrc !== currentTrack.url) {
                shouldUpdateSrc = true;
            }
        }

        if (shouldUpdateSrc) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.play().catch(e => {
                console.error("Autoplay prevented:", e.message);
                setIsPlaying(false);
            });
        } else if (audioRef.current.paused) {
            audioRef.current.play().catch(e => setIsPlaying(false));
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, activePlaylistId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // --- File Upload Logic ---

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files).filter(f => f.type.startsWith('audio/'));
      if (files.length > 0) {
        setPendingFiles(files);
        setShowUploadModal(true);
      }
    }
  };

  const confirmUploadToPlaylist = (playlistId: string) => {
    const newTracks: Track[] = pendingFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
      artist: 'Local Upload',
      file: file,
      url: URL.createObjectURL(file),
      duration: '--:--'
    }));

    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: [...p.tracks, ...newTracks] };
      }
      return p;
    }));

    setPendingFiles([]);
    setShowUploadModal(false);
    
    // Auto switch view to that playlist
    setSelectedPlaylistId(playlistId);
    setViewState('PLAYLIST_DETAIL');
  };

  const createPlaylistAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    
    const newId = `custom-${Date.now()}`;
    const newPlaylist: Playlist = {
      id: newId,
      name: newPlaylistName.toUpperCase(),
      description: 'Custom Frequency Collection',
      tracks: []
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    setNewPlaylistName('');
    confirmUploadToPlaylist(newId);
  };

  const deleteTrack = (playlistId: string, trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    }));
    
    // If we deleted the currently playing track, handle it
    if (playlistId === activePlaylistId && currentTrack?.id === trackId) {
       setIsPlaying(false);
    }
  };

  // --- Visuals ---
  const visualizerBars = Array.from({ length: 16 }).map((_, i) => (
    <div 
      key={i} 
      className={`w-1 rounded-t-sm transition-all duration-75 ${isPlaying && !loadError ? 'viz-bar bg-[var(--color-primary)]' : 'h-1 bg-slate-700'}`}
      style={{ 
        animationDuration: `${0.3 + Math.random() * 0.5}s`,
        animationDelay: `${Math.random() * 0.2}s`,
        height: isPlaying && !loadError ? undefined : '4px'
      }}
    ></div>
  ));

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 border-r border-[var(--color-secondary)] backdrop-blur-xl relative overflow-hidden group ${className}`}>
      
      {/* Mobile Close Button */}
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-secondary)] hover:text-white z-20">
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Main Header */}
      <div className="p-6 border-b border-white/10 bg-black/20 relative shrink-0">
        <h2 className="text-xl text-[var(--color-secondary)] font-bold flex items-center gap-3 tracking-widest">
          <Disc className={`w-6 h-6 ${isPlaying && !loadError ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          CYBER_DECK
        </h2>
        <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-slate-500 font-mono">AUDIO_INTERFACE_V2.0</div>
            
            {/* Nav Tabs */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setViewState('PLAYER')}
                    className={`p-1 rounded ${viewState === 'PLAYER' ? 'text-[var(--color-primary)] bg-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Current Player"
                >
                    <Music className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewState('LIBRARY')}
                    className={`p-1 rounded ${viewState === 'LIBRARY' || viewState === 'PLAYLIST_DETAIL' ? 'text-[var(--color-primary)] bg-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Database Library"
                >
                    <Folder className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      {/* Visualizer (Always Visible) */}
      <div className="h-16 bg-black/40 flex items-end justify-center gap-1 p-2 border-b border-white/10 shrink-0">
        {currentTrack ? visualizerBars : <div className="text-xs text-slate-600 self-center">OFFLINE</div>}
      </div>

      {/* --- VIEW: PLAYER --- */}
      {viewState === 'PLAYER' && (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Player Controls */}
            <div className="p-4 bg-slate-900/50 border-b border-white/10 space-y-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <div className={`text-xs uppercase tracking-wider font-bold truncate max-w-[150px] ${loadError ? 'text-red-500 animate-pulse' : 'text-[var(--color-primary)]'}`}>
                            {loadError ? loadError : (currentTrack ? currentTrack.title : 'NO_DATA')}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMuted(!isMuted)}>
                                {isMuted ? <VolumeX className="w-4 h-4 text-red-400"/> : <Volume2 className="w-4 h-4 text-[var(--color-secondary)]"/>}
                            </button>
                            <input 
                                type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-6">
                    <button onClick={prevTrack} className="text-slate-400 hover:text-[var(--color-primary)] transition-colors active:scale-90 transform"><SkipBack className="w-6 h-6" /></button>
                    <button onClick={togglePlay} className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black transition-all hover:scale-105 active:scale-95">
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    <button onClick={nextTrack} className="text-slate-400 hover:text-[var(--color-primary)] transition-colors active:scale-90 transform"><SkipForward className="w-6 h-6" /></button>
                </div>
            </div>

            {/* Current Queue List */}
            <div className="px-4 py-2 bg-white/5 text-xs text-[var(--color-secondary)] font-bold uppercase tracking-wider flex items-center gap-2 shrink-0">
                <ListMusic className="w-3 h-3" /> 
                Current Queue: {activePlaylist.name}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {activePlaylist.tracks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 opacity-50">
                        <Music className="w-8 h-8" />
                        <span className="text-sm">Empty Queue</span>
                    </div>
                ) : (
                    activePlaylist.tracks.map((track, index) => (
                        <div
                            key={track.id}
                            onClick={() => playTrack(activePlaylistId, index)}
                            className={`p-3 mb-2 rounded border border-transparent cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden ${
                                index === currentTrackIndex && activePlaylistId === activePlaylist.id
                                ? 'bg-white/10 border-[var(--color-secondary)] text-[var(--color-primary)]'
                                : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {index === currentTrackIndex && activePlaylistId === activePlaylist.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"></div>
                            )}
                            <div className="flex flex-col overflow-hidden pr-2">
                                <span className={`truncate text-sm font-medium ${loadError && index === currentTrackIndex ? 'text-red-400' : ''}`}>{track.title}</span>
                                <span className="truncate text-xs text-slate-500">{track.artist || 'Unknown'}</span>
                            </div>
                            <span className="text-xs font-mono opacity-50">{track.duration || '--:--'}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}

      {/* --- VIEW: LIBRARY (PLAYLISTS) --- */}
      {viewState === 'LIBRARY' && (
        <div className="flex flex-col flex-1 min-h-0 animate-in fade-in duration-300">
             <div className="px-4 py-3 bg-white/5 text-xs text-[var(--color-secondary)] font-bold uppercase tracking-wider flex items-center gap-2 shrink-0">
                <Folder className="w-3 h-3" /> 
                System Databases
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                {playlists.map(playlist => (
                    <div 
                        key={playlist.id}
                        onClick={() => {
                            setSelectedPlaylistId(playlist.id);
                            setViewState('PLAYLIST_DETAIL');
                        }}
                        className="group relative p-4 bg-slate-800/50 border border-slate-700 hover:border-[var(--color-primary)] hover:bg-slate-800 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-1">
                            {playlist.id === activePlaylistId && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_5px_var(--color-primary)] animate-pulse" />}
                        </div>
                        <h3 className="text-[var(--color-primary)] font-bold tracking-widest text-lg group-hover:text-white transition-colors">{playlist.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{playlist.description || 'Custom Collection'}</p>
                        <div className="mt-3 flex justify-between items-end">
                            <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-slate-500">{playlist.tracks.length} Files</span>
                            <ArrowLeft className="w-4 h-4 text-slate-500 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                        </div>
                    </div>
                ))}

                {/* Create New Placeholder */}
                <button 
                    onClick={() => {
                        setPendingFiles([]); 
                        setShowUploadModal(true); 
                    }}
                    className="w-full p-4 border border-dashed border-slate-700 hover:border-[var(--color-secondary)] text-slate-500 hover:text-[var(--color-secondary)] flex items-center justify-center gap-2 transition-all group"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="uppercase tracking-widest text-sm">Initialize New Database</span>
                </button>
            </div>
        </div>
      )}

      {/* --- VIEW: PLAYLIST DETAIL --- */}
      {viewState === 'PLAYLIST_DETAIL' && selectedPlaylist && (
        <div className="flex flex-col flex-1 min-h-0 animate-in slide-in-from-right-10 duration-300">
            <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
                <button onClick={() => setViewState('LIBRARY')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[var(--color-secondary)] truncate tracking-widest">{selectedPlaylist.name}</h3>
                    <div className="text-xs text-slate-500">{selectedPlaylist.tracks.length} Tracks</div>
                </div>
                {/* Play All Button */}
                {selectedPlaylist.tracks.length > 0 && (
                     <button 
                        onClick={() => playTrack(selectedPlaylist.id, 0)}
                        className="p-2 bg-[var(--color-primary)] text-black rounded-full hover:shadow-[0_0_10px_var(--color-primary)] transition-shadow"
                    >
                        <Play className="w-4 h-4 fill-current" />
                     </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {selectedPlaylist.tracks.map((track, i) => (
                    <div 
                        key={track.id}
                        className="group flex items-center justify-between p-3 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all"
                    >
                        <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => playTrack(selectedPlaylist.id, i)}
                        >
                            <div className={`font-medium text-sm truncate ${activePlaylistId === selectedPlaylist.id && currentTrackIndex === i ? 'text-[var(--color-primary)]' : 'text-slate-300'}`}>
                                {track.title}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{track.artist || 'Unknown'}</div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                             <span className="text-xs font-mono text-slate-600">{track.duration || '--:--'}</span>
                             {!selectedPlaylist.isDefault && (
                                <button onClick={(e) => deleteTrack(selectedPlaylist.id, track.id, e)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             )}
                        </div>
                    </div>
                ))}
                {selectedPlaylist.tracks.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        Database Empty. <br/>Upload frequency data.
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- UPLOAD SECTION --- */}
      <div className="p-4 border-t border-white/10 bg-black/40 shrink-0 grid grid-cols-2 gap-2">
        {/* File Upload */}
        <label className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-600 rounded hover:border-[var(--color-primary)] hover:bg-white/5 text-slate-400 hover:text-[var(--color-primary)] transition-all cursor-pointer group">
           <Upload className="w-4 h-4 group-hover:animate-bounce" />
           <span className="text-xs font-bold uppercase tracking-widest">Add Files</span>
           <input
             type="file"
             accept="audio/*"
             multiple
             onChange={handleFileSelect}
             className="hidden"
           />
        </label>
        
        {/* Folder Upload */}
        <label className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-600 rounded hover:border-[var(--color-secondary)] hover:bg-white/5 text-slate-400 hover:text-[var(--color-secondary)] transition-all cursor-pointer group">
           <HardDrive className="w-4 h-4 group-hover:animate-bounce" />
           <span className="text-xs font-bold uppercase tracking-widest">Load Folder</span>
           <input
             type="file"
             accept="audio/*"
             webkitdirectory=""
             directory=""
             multiple
             onChange={handleFileSelect}
             className="hidden"
           />
        </label>
      </div>

      {/* --- MODAL: SELECT PLAYLIST FOR UPLOAD --- */}
      {showUploadModal && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[var(--color-primary)] font-bold text-lg tracking-widest uppercase">Target Database</h3>
                <button onClick={() => { setShowUploadModal(false); setPendingFiles([]); }} className="text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
            </div>

            <div className="text-sm text-slate-400 mb-4">
                Found {pendingFiles.length} audio file(s). Select destination:
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {playlists.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => confirmUploadToPlaylist(p.id)}
                        className="w-full text-left p-3 border border-slate-700 hover:border-[var(--color-primary)] bg-slate-800/50 hover:bg-slate-800 transition-all flex justify-between items-center group"
                    >
                        <span className="font-mono text-slate-300 group-hover:text-white">{p.name}</span>
                        <Folder className="w-4 h-4 text-slate-500 group-hover:text-[var(--color-primary)]" />
                    </button>
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Or Create New</div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="DATABASE_NAME"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className="flex-1 bg-black border border-slate-600 px-3 py-2 text-white focus:border-[var(--color-secondary)] outline-none text-sm font-mono"
                    />
                    <button 
                        onClick={createPlaylistAndAdd}
                        disabled={!newPlaylistName}
                        className="bg-[var(--color-secondary)] text-black px-4 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      )}

      <audio 
        ref={audioRef} 
        onEnded={nextTrack}
        onError={handleTrackError}
        className="hidden" 
      />
    </div>
  );
};
