import { Playlist, Track } from '../types';

// --- REMOTE TRACKS (Pixabay) ---
const REMOTE_TRACK_SOURCES = [
  // --- Core Verified Tracks (User Provided + CyberDream) ---
  { title: "Neon Rain", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" }, 
  { title: "Cozy Chill Protocol", url: "https://cdn.pixabay.com/download/audio/2023/07/30/audio_e0908e8569.mp3?filename=good-night-lofi-cozy-chill-music-160166.mp3" },
  { title: "Analog Drift", url: "https://cdn.pixabay.com/download/audio/2025/06/09/audio_8e50942f45.mp3?filename=lo-fi-357425.mp3" },
  { title: "Background Protocol", url: "https://cdn.pixabay.com/download/audio/2025/12/21/audio_7296ca4175.mp3?filename=lo-fi-background-music-455021.mp3" },
  { title: "Subterranean Network", url: "https://cdn.pixabay.com/download/audio/2025/02/17/audio_60cc242172.mp3?filename=chilling-caves-lo-fi-beats-music-302313.mp3" },
  { title: "Sector 4 Ambient", url: "https://cdn.pixabay.com/download/audio/2025/12/26/audio_a668cf74d4.mp3?filename=chill-lofi-ambient-lofi-music-457259.mp3" },
  { title: "Hologram Memory", url: "https://cdn.pixabay.com/download/audio/2023/07/24/audio_65d744b9d0.mp3?filename=lofi-chill-smooth-chill-lofi-for-vlogs-and-background-music-159456.mp3" },
  // --- More User Provided ---
  { title: "Data Packet", url: "https://cdn.pixabay.com/download/audio/2025/06/26/audio_fb4e44be17.mp3?filename=lofi-chill-beat-lo-fi-postcard-366049.mp3" },
  { title: "Corrupted File", url: "https://cdn.pixabay.com/download/audio/2024/01/15/audio_9914e58808.mp3?filename=coverless-book-lofi-186307.mp3" },
  { title: "Deep Focus Algorithm", url: "https://cdn.pixabay.com/download/audio/2025/12/26/audio_3906c72d1f.mp3?filename=cozy-lofi-background-music-for-study-457198.mp3" },
  { title: "Safe House", url: "https://cdn.pixabay.com/download/audio/2025/12/26/audio_9d2e315e0a.mp3?filename=cozy-lofi-background-music-457199.mp3" },
  { title: "Neural Sync", url: "https://cdn.pixabay.com/download/audio/2025/12/24/audio_011ccd8929.mp3?filename=lofi-chill-456258.mp3" },
  { title: "Synthwave Study", url: "https://cdn.pixabay.com/download/audio/2025/12/24/audio_f328b14e4b.mp3?filename=lofi-lofi-chill-lofi-girl-456265.mp3" },
];

const generateTracks = (): Track[] => {
    const tracks: Track[] = [];

    // Add Remote Tracks
    REMOTE_TRACK_SOURCES.forEach((source, index) => {
        tracks.push({
            id: `remote-track-${index}`,
            title: source.title,
            artist: 'Lofi Network',
            url: source.url,
            duration: '--:--'
        });
    });

    return tracks;
};

export const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'default-lofi-1',
    name: 'LOFI_ESSENTIALS',
    description: 'Network Frequencies',
    isDefault: true,
    tracks: generateTracks()
  }
];
