import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, CheckCircle, Clock, Play, List, PlayCircle, RotateCcw, Timer, ChevronLeft, Send, Mic, Smile, Search, ThumbsUp, Heart, Star, Flag, MoreVertical, Pin, Trash2, MessageSquare, StickyNote, Save, Edit2, X, Image, Download, FileText, Tag, Volume2, Sun, Moon, Maximize2, Minimize2, Code, Video as VideoIcon, Snowflake, MicOff, Eye, Phone, PhoneOff, User, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Playlist, Video as PlaylistVideo } from '@/types/playlist';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import celebrationLogo from '@/assets/bridgelab_logo.png';

// Update the YouTube API types at the top of the file
interface YouTubePlayer {
  destroy: () => void;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { title: string };
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  getPlaybackQuality?: () => string;
}

interface YouTubePlayerEvent {
  data: number;
  target: YouTubePlayer;
}

interface YouTubePlayerVars {
  autoplay?: number;
  controls?: number;
  modestbranding?: number;
  rel?: number;
  origin?: string;
  enablejsapi?: number;
  widget_referrer?: string;
  showinfo?: number;
  fs?: number;
  iv_load_policy?: number;
  disablekb?: number;
  playsinline?: number;
}

interface YouTubePlayerEvents {
  onStateChange?: (event: YouTubePlayerEvent) => void;
  onReady?: (event: YouTubePlayerEvent) => void;
  onError?: (event: YouTubePlayerEvent) => void;
}

interface YouTubeAPI {
  Player: new (
    elementId: HTMLElement,
    options: {
      videoId: string;
      playerVars?: YouTubePlayerVars;
      events?: YouTubePlayerEvents;
    }
  ) => YouTubePlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
    CUED: number;
    UNSTARTED: number;
  };
}

// Add SpeechRecognition type
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    adsbygoogle?: unknown[];
  }
}

interface WatchTimeData {
  totalWatchTime: number;  // Total accumulated watch time in milliseconds
  lastPosition: number;    // Last video position in seconds
  lastUpdate: number;      // Timestamp of last update
  playCount: number;       // Number of times video was played
  stopCount: number;       // Number of times video was stopped
  cumulativeTime: number;  // Total time spent watching the video
}

interface CompletedVideo {
  id: string;
  title: string;
  playlistId: string;
  playlistTitle: string;
  completedAt: string;
  watchTime: number;
}

// Update ChatMessage interface
interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'text' | 'audio' | 'emoji' | 'timestamp' | 'system';
  audioUrl?: string;
  videoId?: string;
  videoTimestamp?: number;
  reactions: {
    [key: string]: string[]; // emoji: userIds
  };
  isPinned?: boolean;
}

interface Note {
  id: string;
  content: string;
  timestamp: number;
  videoId: string;
  videoTitle: string;
  isEditing?: boolean;
  images?: string[];
  tags?: string[];
  color?: string;
  flashcards?: Flashcard[];
  isFloating?: boolean;
  position?: { x: number; y: number };
  audioUrl?: string; // <-- add this
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  noteId: string;
  lastReviewed: number;
  reviewCount: number;
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

// Add these styles at the top of the file, after the imports
const styles = `
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Disable YouTube hover effects */
/* iframe[src*="youtube.com"] {
  pointer-events: none !important;
} */

.youtube-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.youtube-player-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none !important; /* Prevents all YouTube overlays and context menu */
}

/* Hide YouTube's default controls and hover effects */
/* .youtube-player-container iframe {
  pointer-events: none !important;
} */

/* Ensure our custom controls still work */
.video-controls {
  pointer-events: auto !important; /* Allow your custom controls to work */
}

/* Custom Scrollbar Styles */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

.dark .youtube-player-container {
  background: #0f172a;
}
`;

// Add this after the styles declaration
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add SpeechRecognition event types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Add this constant at the top of the file after imports
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

// Add confetti animation helper (simple SVG or emoji-based)
const Confetti = () => (
  <div className="flex flex-wrap justify-center items-center gap-2 animate-bounce-slow">
    <span className="text-5xl">🎉</span>
    <span className="text-5xl">✨</span>
    <span className="text-5xl">🎊</span>
    <span className="text-5xl">✅</span>
    <span className="text-5xl">🥳</span>
  </div>
);

// Enhanced Confetti animation using framer-motion
const ConfettiBurst = () => {
  // Generate 32 confetti pieces with random positions/colors
  const confetti = Array.from({ length: 32 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.7;
    const duration = 1.2 + Math.random() * 0.8;
    const size = 10 + Math.random() * 16;
    const colors = [
      'bg-blue-500', 'bg-pink-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-500', 'bg-red-400', 'bg-indigo-400', 'bg-orange-400', 'bg-teal-400', 'bg-fuchsia-400'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotate = Math.random() * 360;
    return (
      <motion.div
        key={i}
        initial={{ y: -40, opacity: 0, rotate }}
        animate={{ y: 320 + Math.random() * 80, opacity: 1, rotate: rotate + 180 }}
        transition={{ delay, duration, ease: 'easeOut' }}
        className={`absolute top-0 left-0 ${color}`}
        style={{
          left: `${left}%`,
          width: size,
          height: size * (0.5 + Math.random()),
          borderRadius: 4,
          zIndex: 1,
          boxShadow: '0 2px 8px #0002',
        }}
      />
    );
  });
  return <div className="pointer-events-none absolute inset-0 overflow-visible z-10">{confetti}</div>;
};

// Animated checkmark SVG
const AnimatedCheckmark = () => (
  <motion.svg
    width="96" height="96" viewBox="0 0 96 96" fill="none"
    className="mx-auto mb-4 drop-shadow-glow"
    aria-hidden="true"
  >
    <motion.circle
      cx="48" cy="48" r="44"
      stroke="#22c55e" strokeWidth="8" fill="#e0fbe6"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
    />
    <motion.path
      d="M32 52l12 12 20-24"
      stroke="#22c55e"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: 'easeInOut' }}
    />
  </motion.svg>
);

// Sparkle background
const SparkleBG = () => (
  <div className="pointer-events-none absolute inset-0 z-0">
    {Array.from({ length: 18 }).map((_, i) => (
      <span
        key={i}
        className={`absolute sparkle animate-sparkle${(i % 3) + 1}`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          background: 'radial-gradient(circle, #fff 60%, #aaa 100%)',
          width: 8 + Math.random() * 8,
          height: 8 + Math.random() * 8,
          borderRadius: '50%',
          opacity: 0.7,
        }}
      />
    ))}
  </div>
);

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const videoIndex = parseInt(searchParams.get('video') || '0');
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(videoIndex);
  const [showAllVideos, setShowAllVideos] = useState(true);
  const [watchTimeData, setWatchTimeData] = useState<WatchTimeData>({
    totalWatchTime: 0,
    lastPosition: 0,
    lastUpdate: Date.now(),
    playCount: 0,
    stopCount: 0,
    cumulativeTime: 0
  });
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const updateInterval = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messageTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [deletingMessages, setDeletingMessages] = useState<Set<string>>(new Set());
  const [shakingMessages, setShakingMessages] = useState<Set<string>>(new Set());

  const [showChat, setShowChat] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(`notes_${id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteColor, setNoteColor] = useState<string>('#ffffff');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add state for note popup
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingInPopup, setIsEditingInPopup] = useState(false);
  const [popupNoteContent, setPopupNoteContent] = useState('');
  const [popupNoteImages, setPopupNoteImages] = useState<string[]>([]);
  const [popupNoteTags, setPopupNoteTags] = useState<string[]>([]);
  const [popupNoteColor, setPopupNoteColor] = useState('#ffffff');

  // New state variables for enhanced features
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [floatingNotes, setFloatingNotes] = useState<Note[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Add new state variables for code IDE
  // Remove Code IDE interfaces and state
  // Remove: const [showFloatingCode, setShowFloatingCode] = useState(false);
  // Remove any JSX that renders the floating Code IDE window
  // Remove any interfaces, types, or comments specifically for the Code IDE

  // Add these state variables after the existing state declarations
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [showFloatingNotes, setShowFloatingNotes] = useState(false);
  const [chatWindowPosition, setChatWindowPosition] = useState({ x: 50, y: 50 });
  const [notesWindowPosition, setNotesWindowPosition] = useState({ x: 150, y: 50 });

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchInterval = useRef<NodeJS.Timeout | null>(null);

  const [volume, setVolume] = useState(100);

  // Extract video progress list for useMemo/useEffect dependencies
  const videoProgressList = useMemo(() => playlist?.videos.map(v => v.progress) || [], [playlist?.videos]);

  // Get current video from playlist
  const currentVideo = playlist?.videos[currentVideoIndex];

  // Wrap selectVideo in useCallback (move this above all useEffect hooks)
  const selectVideo = useCallback((index: number) => {
    if (index === currentVideoIndex) {
      // If clicking the same video, toggle play/pause
      if (playerRef.current) {
        const state = playerRef.current.getPlayerState();
        if (state === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      }
      return;
    }
    
    // Reset stopwatch when changing videos
    stopStopwatch();
    setStopwatchTime(0);
    
    // Get the target video
    const targetVideo = playlist?.videos[index];
    if (!targetVideo) return;
    // Check if the target video is completed
    if (targetVideo.progress >= 100) {
      toast.info('This video is already completed');
      return;
    }
    // Stop current video playback
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      playerRef.current.destroy();
      playerRef.current = null;
    }
    // Update URL without triggering a full navigation
    const newUrl = `/playlist/${id}/play?video=${index}`;
    window.history.pushState({}, '', newUrl);
    // Update state
    setCurrentVideoIndex(index);
    // Force player reinitialization
    setIsPlayerReady(false);
    setTimeout(() => {
      setIsPlayerReady(true);
    }, 100);
    toast.success(`Now playing: ${targetVideo.title}`);
  }, [currentVideoIndex, id, playlist, playerRef, setCurrentVideoIndex, setIsPlayerReady, toast]);

  // Move these useMemo declarations after selectVideo
  const uncompletedVideos = useMemo(() => 
    playlist?.videos.filter(video => video.progress < 100) || [],
    [playlist?.videos, videoProgressList]
  );

  const completedVideosList = useMemo(() => 
    playlist?.videos.filter(video => video.progress >= 100) || [],
    [playlist?.videos, videoProgressList]
  );

  // Wrap startWatchTimeTracking in useCallback
  const startWatchTimeTracking = useCallback(() => {
    if (!playerRef.current || !currentVideo) return;
    const now = Date.now();
    lastUpdateTime.current = now;
    // Load existing watch time data
    const savedData = localStorage.getItem(`watchTime_${currentVideo.id}`);
    let existingData: WatchTimeData | null = null;
    if (savedData) {
      try {
        existingData = JSON.parse(savedData);
      } catch (e) {
        console.error('Error loading watch time data:', e);
      }
    }
    // Start the update interval
    updateInterval.current = window.setInterval(() => {
      if (!playerRef.current || !currentVideo) return;
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - lastUpdateTime.current) / 1000) * 1000; // Round to nearest second
      lastUpdateTime.current = currentTime;
      // Update watch time data
      setWatchTimeData(prev => {
        const updatedData = {
          ...prev,
          totalWatchTime: prev.totalWatchTime + elapsed,
          lastUpdate: currentTime,
          cumulativeTime: prev.cumulativeTime + elapsed
        };
        localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(updatedData));
        return updatedData;
      });
    }, 1000);
    // Increment play count and initialize cumulative time if needed
    setWatchTimeData(prev => {
      const updatedData = {
        ...prev,
        playCount: prev.playCount + 1,
        cumulativeTime: existingData?.cumulativeTime || prev.cumulativeTime
      };
      localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(updatedData));
      return updatedData;
    });
  }, [currentVideo]);

  // Wrap stopWatchTimeTracking in useCallback
  const stopWatchTimeTracking = useCallback(() => {
    if (!currentVideo) return;
    const now = Date.now();
    // Clear the update interval
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
    // Update and save to localStorage
    setWatchTimeData(prev => {
      const finalData = {
        ...prev,
        lastUpdate: now,
        stopCount: prev.stopCount + 1
      };
      localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(finalData));
      return finalData;
    });
  }, [currentVideo]);

  // Save chat messages to localStorage
  useEffect(() => {
    localStorage.setItem(`chat_${id}`, JSON.stringify(chatMessages));
  }, [chatMessages, id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Add this effect to handle playlist updates
  useEffect(() => {
    const handlePlaylistUpdate = (event: CustomEvent) => {
      const { playlistId: updatedPlaylistId, updatedPlaylist } = event.detail;
      if (updatedPlaylistId === id) {
        setPlaylist(updatedPlaylist);
        if (currentVideoIndex === playlist?.videos.length - 1) {
          setCurrentVideoIndex(updatedPlaylist.videos.length - 1);
        }
        const currentVideo = updatedPlaylist.videos[currentVideoIndex];
        if (currentVideo?.progress >= 100) {
          const nextUncompletedIndex = updatedPlaylist.videos.findIndex(v => v.progress < 100);
          if (nextUncompletedIndex !== -1) {
            selectVideo(nextUncompletedIndex);
          }
        }
      }
    };
    window.addEventListener('playlistUpdated', handlePlaylistUpdate as EventListener);
    return () => {
      window.removeEventListener('playlistUpdated', handlePlaylistUpdate as EventListener);
    };
  }, [id, currentVideoIndex, playlist?.videos.length, selectVideo]);

  // Add polling to ensure real-time updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const found = playlists.find(p => p.id === id);
        if (found && JSON.stringify(found) !== JSON.stringify(playlist)) {
          // Check completed videos in localStorage to ensure progress is maintained
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = found.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...found, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
        }
      }
    }, 1000); // Poll every second

    return () => {
      clearInterval(pollInterval);
    };
  }, [id, playlist]);

  // Update the loadPlaylistData function in the first useEffect
  useEffect(() => {
    const loadPlaylistData = async () => {
      setIsLoading(true);
      try {
        // First try to get playlist from navigation state
        const statePlaylist = location.state?.playlist as Playlist | undefined;
        if (statePlaylist) {
          // Check completed videos in localStorage to ensure progress is maintained
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = statePlaylist.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...statePlaylist, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
          
          // Update localStorage to maintain consistency
          const savedPlaylists = localStorage.getItem('youtubePlaylists');
          if (savedPlaylists) {
            const playlists: Playlist[] = JSON.parse(savedPlaylists);
            const index = playlists.findIndex(p => p.id === id);
            if (index !== -1) {
              playlists[index] = updatedPlaylist;
              localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
            }
          }
          
          setIsLoading(false);
          return;
        }

        // Fall back to localStorage if no state data
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const found = playlists.find(p => p.id === id);
          if (found) {
            // Check completed videos in localStorage to ensure progress is maintained
            const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
            const updatedVideos = found.videos.map(video => {
              const completedVideo = completedVideos.find(cv => cv.id === video.id);
              if (completedVideo) {
                return { ...video, progress: 100 };
              }
              return video;
            });
            const updatedPlaylist = { ...found, videos: updatedVideos };
            setPlaylist(updatedPlaylist);
            // Save to state to prevent loss on refresh
            window.history.replaceState(
              { playlist: updatedPlaylist },
              '',
              window.location.href
            );
          } else {
            navigate('/');
            toast.error('Playlist not found');
          }
        } else {
          navigate('/');
          toast.error('No playlists found');
        }
      } catch (error) {
        console.error('Error loading playlist:', error);
        toast.error('Error loading playlist');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      loadPlaylistData();
      setIsInitialized(true);
    }
  }, [id, location.state, navigate, isInitialized]);

  // Add a new effect to sync with completed videos
  useEffect(() => {
    if (!playlist) return;

    const syncCompletedVideos = () => {
      const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
      const updatedVideos = playlist.videos.map(video => {
        const completedVideo = completedVideos.find(cv => cv.id === video.id);
        if (completedVideo) {
          return { ...video, progress: 100 };
        }
        return video;
      });

      // Only update if there are changes
      if (JSON.stringify(updatedVideos) !== JSON.stringify(playlist.videos)) {
        const updatedPlaylist = { ...playlist, videos: updatedVideos };
        setPlaylist(updatedPlaylist);
        
        // Update localStorage
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const index = playlists.findIndex(p => p.id === id);
          if (index !== -1) {
            playlists[index] = updatedPlaylist;
            localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
          }
        }
      }
    };

    // Initial sync
    syncCompletedVideos();

    // Listen for changes to completedVideos
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'completedVideos') {
        syncCompletedVideos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [playlist, id]);

  // Add this effect to handle localStorage sync and auto-refresh
  useEffect(() => {
    if (!currentVideo) return;

    // Load initial data from localStorage
    const loadWatchData = () => {
      const savedData = localStorage.getItem(`watchTime_${currentVideo.id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as WatchTimeData;
          setWatchTimeData(parsedData);
        } catch (e) {
          console.error('Error loading watch time data:', e);
        }
      }
    };

    // Initial load
    loadWatchData();

    // Set up polling interval for auto-refresh
    const pollInterval = setInterval(loadWatchData, 1000);

    // Set up storage event listener for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `watchTime_${currentVideo.id}`) {
        loadWatchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentVideo?.id]);

  const updateVideoProgress = (videoId: string, progress: number) => {
    if (!playlist) return;

    const updatedVideos = playlist.videos.map(video =>
      video.id === videoId ? { ...video, progress } : video
    );

    const updatedPlaylist = { ...playlist, videos: updatedVideos };

    // Update localStorage
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const index = playlists.findIndex(p => p.id === id);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
      }
    }

    // Remove from completedVideos if resetting
    if (progress < 100) {
      const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
      const newCompletedVideos = completedVideos.filter(v => v.id !== videoId);
      localStorage.setItem('completedVideos', JSON.stringify(newCompletedVideos));
    }

    // **Always update local state for instant UI update**
    setPlaylist(updatedPlaylist);

    toast.success('Progress updated!');
  };

  // Function to go to next video
  const goToNextVideo = () => {
    if (playlist && currentVideoIndex < playlist.videos.length - 1) {
      // Find the next uncompleted video
      const nextUncompletedIndex = playlist.videos.findIndex((v, i) => i > currentVideoIndex && v.progress < 100);
      if (nextUncompletedIndex !== -1) {
        selectVideo(nextUncompletedIndex);
      } else {
        toast.info('No more uncompleted videos available');
      }
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      // Find the previous uncompleted video
      const prevUncompletedIndex = [...playlist?.videos || []]
        .reverse()
        .findIndex((v, i) => playlist.videos.length - 1 - i < currentVideoIndex && v.progress < 100);
      
      if (prevUncompletedIndex !== -1) {
        const actualIndex = playlist.videos.length - 1 - prevUncompletedIndex;
        selectVideo(actualIndex);
      } else {
        toast.info('No previous uncompleted videos available');
      }
    }
  };

  // Update the markAsComplete function
  const markAsComplete = () => {
    if (playlist && currentVideo) {
      stopStopwatch(); // Stop the stopwatch when marking as complete
      // Create a new array of videos with the updated progress
      const updatedVideos = playlist.videos.map(video => {
        if (video.id === currentVideo.id) {
          return { ...video, progress: 100 };
        }
        return video;
      });
      const updatedPlaylist = {
        ...playlist,
        videos: updatedVideos
      };
      // Update localStorage for playlists
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        try {
          const playlists = JSON.parse(savedPlaylists);
          const index = playlists.findIndex(p => p.id === id);
          if (index !== -1) {
            playlists[index] = updatedPlaylist;
            localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
      // Store completed video in localStorage
      const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]');
      const videoToStore = {
        id: currentVideo.id,
        title: currentVideo.title,
        playlistId: playlist.id,
        playlistTitle: playlist.title,
        completedAt: new Date().toISOString(),
        watchTime: watchTimeData.cumulativeTime
      };
      // Check if video is already in completed list
      const existingIndex = completedVideos.findIndex(v => v.id === currentVideo.id);
      if (existingIndex === -1) {
        completedVideos.push(videoToStore);
        localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
      }
      // Reset watch time data for the completed video
      localStorage.removeItem(`watchTime_${currentVideo.id}`);
      setWatchTimeData({
        totalWatchTime: 0,
        lastPosition: 0,
        lastUpdate: Date.now(),
        playCount: 0,
        stopCount: 0,
        cumulativeTime: 0
      });
      setPlaylist(updatedPlaylist);
        setShowCompletionDialog(true);
      // Wait 5 seconds, then close modal and go to next video if any
      setTimeout(() => {
        setShowCompletionDialog(false);
        const nextUncompletedIndex = updatedPlaylist.videos.findIndex(v => v.progress < 100);
        if (nextUncompletedIndex !== -1) {
          selectVideo(nextUncompletedIndex);
        }
      }, 5000);
      // Dispatch playlist update event
      window.dispatchEvent(new CustomEvent('playlistUpdated', {
        detail: {
          playlistId: id,
          updatedPlaylist
        }
      }));
      toast.success('Video marked as complete!');
    }
  };

  const resetAllData = () => {
    localStorage.removeItem('youtubePlaylists');
    toast.success('All data has been reset!');
    navigate('/');
  };

  // Add this function near the top of the component
  const extractVideoIdFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Update the player initialization to handle play/stop counts
  useEffect(() => {
    let playerInstance: YouTubePlayer | null = null;
    let lastState: number | null = null;
    // REMOVED: setQualityLoading(true);
    // REMOVED: setAvailableQualities([]);
    const initializePlayer = () => {
      if (!isPlayerReady || !iframeRef.current || !playlist) {
        return;
      }
      const currentVideo = playlist.videos[currentVideoIndex];
      if (!currentVideo) {
        return;
      }
      if (currentVideo.progress >= 100) {
        toast.info('This video is already completed');
        const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
        if (firstUncompletedIndex !== -1) {
          selectVideo(firstUncompletedIndex);
        } else {
          setShowCompletionDialog(true);
        }
        return;
      }
      const videoId = extractVideoIdFromUrl(currentVideo.url);
      if (!videoId) {
        console.error('Could not extract video ID from URL:', currentVideo.url);
        toast.error('Invalid YouTube URL format');
        return;
      }
      try {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        const playerOptions = {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,           // Hide YouTube controls
            modestbranding: 1,     // Minimal YouTube branding
            rel: 0,                // No related videos at end
            showinfo: 0,           // Hide video info
            fs: 0,                 // Hide fullscreen button (you handle fullscreen)
            iv_load_policy: 3,     // Hide video annotations
            disablekb: 1,          // Disable keyboard controls
            playsinline: 1,
            origin: window.location.origin,
            enablejsapi: 1,
            widget_referrer: window.location.href
          } as YouTubePlayerVars,
          events: {
            onStateChange: (event: YouTubePlayerEvent) => {
              if (currentVideo.progress >= 100) {
                if (playerRef.current) {
                  playerRef.current.pauseVideo();
                }
                return;
              }
              if (event.data !== lastState) {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  startWatchTimeTracking();
                  // Set hasPlayed to true on first play
                  setHasPlayed(true);
                  // REMOVED: quality logic
                } else if (event.data === window.YT.PlayerState.PAUSED || 
                           event.data === window.YT.PlayerState.ENDED) {
                  stopWatchTimeTracking();
                }
                lastState = event.data;
              }
            },
            onReady: (event: YouTubePlayerEvent) => {
              playerRef.current = playerInstance;
              const videoData = event.target.getVideoData();
              setVideoTitle(videoData.title);
              if (currentVideo.progress < 100) {
                const savedData = localStorage.getItem(`watchTime_${currentVideo.id}`);
                if (savedData) {
                  try {
                    const watchData = JSON.parse(savedData) as WatchTimeData;
                    if (watchData.lastPosition > 0) {
                      playerRef.current?.seekTo(watchData.lastPosition);
                    }
                  } catch (e) {
                    console.error('Error loading watch time data:', e);
                  }
                }
              } else {
                const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
                if (firstUncompletedIndex !== -1) {
                  selectVideo(firstUncompletedIndex);
                } else {
                  setShowCompletionDialog(true);
                }
              }
              // REMOVED: setTimeout for quality logic
            },
            onError: (event: YouTubePlayerEvent) => {
              console.error('YouTube player error:', event.data);
              let errorMessage = 'An error occurred while playing the video.';
              switch (event.data) {
                case 2:
                  errorMessage = 'Invalid video ID. Please check the video URL.';
                  break;
                case 5:
                  errorMessage = 'HTML5 player error. Please try a different browser.';
                  break;
                case 100:
                  errorMessage = 'Video not found or has been removed.';
                  break;
                case 101:
                case 150:
                  errorMessage = 'Video embedding is not allowed.';
                  break;
              }
              toast.error(errorMessage);
              const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
              if (firstUncompletedIndex !== -1 && firstUncompletedIndex !== currentVideoIndex) {
                selectVideo(firstUncompletedIndex);
              }
            }
          } as YouTubePlayerEvents
        };
        playerInstance = new window.YT.Player(iframeRef.current, playerOptions);
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        toast.error('Failed to initialize video player. Please try again.');
        const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
        if (firstUncompletedIndex !== -1 && firstUncompletedIndex !== currentVideoIndex) {
          selectVideo(firstUncompletedIndex);
        }
      }
    };
    initializePlayer();
    return () => {
      stopWatchTimeTracking();
      if (playerInstance) {
        playerInstance.destroy();
        playerInstance = null;
      }
    };
  }, [isPlayerReady, playlist, currentVideoIndex]);

  // Add an effect to handle completion state changes
  useEffect(() => {
    if (uncompletedVideos.length === 0 && playerRef.current) {
      playerRef.current.pauseVideo();
      setShowCompletionDialog(true);
    }
  }, [uncompletedVideos.length]);

  // Handle browser refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current state to sessionStorage
      if (playlist) {
        sessionStorage.setItem('currentPlaylist', JSON.stringify({
          playlist,
          videoIndex: currentVideoIndex,
          timestamp: Date.now()
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check for saved state on mount
    const savedState = sessionStorage.getItem('currentPlaylist');
    if (savedState && !playlist) {
      try {
        const { playlist: savedPlaylist, videoIndex: savedIndex, timestamp } = JSON.parse(savedState);
        // Only restore if the saved state is less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setPlaylist(savedPlaylist);
          setCurrentVideoIndex(savedIndex);
          window.history.replaceState(
            { playlist: savedPlaylist },
            '',
            `/playlist/${id}/play?video=${savedIndex}`
          );
        }
      } catch (e) {
        console.error('Error restoring saved state:', e);
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [playlist, currentVideoIndex, id]);

  // Update the YouTube API loading effect
  useEffect(() => {
    console.log('Loading YouTube API...');
    
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      console.log('YouTube API already loaded');
      setIsPlayerReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready!');
      setIsPlayerReady(true);
    };

    return () => {
      console.log('Cleaning up YouTube player...');
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Reset watch time tracking when video changes
  useEffect(() => {
    stopWatchTimeTracking();
  }, [currentVideoIndex]);

  // Add an effect to handle video completion transitions
  useEffect(() => {
    if (playlist) {
      const currentVideo = playlist.videos[currentVideoIndex];
      if (currentVideo?.progress >= 100) {
        // Find the next uncompleted video
        const nextUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
        if (nextUncompletedIndex !== -1) {
          selectVideo(nextUncompletedIndex);
        }
      }
    }
  }, [playlist?.videos.map(v => v.progress)]); // Watch for progress changes

  // Add this effect to handle page changes
  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (currentVideo) {
        // Save watch time data
        localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(watchTimeData));
        
        // If video is completed, ensure it's in the completed list
        if (currentVideo.progress >= 100) {
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const existingIndex = completedVideos.findIndex((v: CompletedVideo) => v.id === currentVideo.id);
          
          if (existingIndex === -1) {
            const videoToStore: CompletedVideo = {
              id: currentVideo.id,
              title: currentVideo.title,
              playlistId: playlist?.id || '',
              playlistTitle: playlist?.title || '',
              completedAt: new Date().toISOString(),
              watchTime: watchTimeData.cumulativeTime
            };
            completedVideos.push(videoToStore);
            localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
          }
        }
      }
    };
  }, [currentVideo, watchTimeData, playlist]);

  // Add a comprehensive refresh effect
  useEffect(() => {
    const refreshAllData = () => {
      // Refresh playlist data
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const found = playlists.find(p => p.id === id);
        if (found) {
          // Check completed videos
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = found.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...found, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
        }
      }

      // Refresh watch time data for current video
      if (currentVideo) {
        const savedWatchTime = localStorage.getItem(`watchTime_${currentVideo.id}`);
        if (savedWatchTime) {
          try {
            const watchData = JSON.parse(savedWatchTime) as WatchTimeData;
            setWatchTimeData(watchData);
          } catch (e) {
            console.error('Error loading watch time data:', e);
          }
        }
      }
    };

    // Initial refresh
    refreshAllData();

    // Set up polling interval
    const pollInterval = setInterval(refreshAllData, 1000);

    // Set up storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtubePlaylists' || e.key === 'completedVideos' || e.key?.startsWith('watchTime_')) {
        refreshAllData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [id, currentVideo?.id]);

  // Add a visibility change handler to refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh all data when tab becomes visible
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const found = playlists.find(p => p.id === id);
          if (found) {
            const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
            const updatedVideos = found.videos.map(video => {
              const completedVideo = completedVideos.find(cv => cv.id === video.id);
              if (completedVideo) {
                return { ...video, progress: 100 };
              }
              return video;
            });
            const updatedPlaylist = { ...found, videos: updatedVideos };
            setPlaylist(updatedPlaylist);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);

  // Add a focus handler to refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      // Refresh all data when window regains focus
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const found = playlists.find(p => p.id === id);
        if (found) {
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = found.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...found, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  // Function to add message with auto-delete
  const addMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
    
    // Set timeout to delete message after 6 seconds
    const timeout = setTimeout(() => {
      // Start shake animation
      setShakingMessages(prev => new Set([...prev, message.id]));
      
      // After shake, start fade out
      setTimeout(() => {
        setShakingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(message.id);
          return newSet;
        });
        setDeletingMessages(prev => new Set([...prev, message.id]));
        
        // Remove message after fade out
        setTimeout(() => {
          setChatMessages(prev => prev.filter(msg => msg.id !== message.id));
          setDeletingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.id);
            return newSet;
          });
          delete messageTimeouts.current[message.id];
        }, 600); // Wait for fade-out animation to complete
      }, 300); // Wait for shake animation to complete
    }, 6000); // Changed from 15000 to 6000 (6 seconds)

    messageTimeouts.current[message.id] = timeout;
  };

  // Function to manually delete message
  const deleteMessage = (messageId: string) => {
    // Start shake animation
    setShakingMessages(prev => new Set([...prev, messageId]));
    
    if (messageTimeouts.current[messageId]) {
      clearTimeout(messageTimeouts.current[messageId]);
      delete messageTimeouts.current[messageId];
    }

    // After shake, start fade out
    setTimeout(() => {
      setShakingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
      setDeletingMessages(prev => new Set([...prev, messageId]));
      
      // Remove message after fade out
      setTimeout(() => {
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
        setDeletingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          return newSet;
        });
      }, 600); // Wait for fade-out animation to complete
    }, 300); // Wait for shake animation to complete
    
    setShowMessageMenu(null);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'user1',
      username: 'You',
      content: newMessage,
      timestamp: Date.now(),
      type: 'text',
      reactions: {}
    };

    addMessage(message);
    setNewMessage('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const message: ChatMessage = {
          id: Date.now().toString(),
          userId: 'user1',
          username: 'User',
          content: 'Audio message',
          timestamp: Date.now(),
          type: 'audio',
          audioUrl,
          reactions: {}
        };

        addMessage(message);
        
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check your permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        if (!reactions[emoji].includes('user1')) {
          reactions[emoji].push('user1');
        }
        return { ...msg, reactions };
      }
      return msg;
    }));
    setShowReactions(null);
  };

  const togglePinMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, isPinned: !msg.isPinned };
      }
      return msg;
    }));
    setShowMessageMenu(null);
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return chatMessages.filter(msg => msg.type !== 'timestamp');
    return chatMessages.filter(msg => 
      msg.type !== 'timestamp' && (
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [chatMessages, searchQuery]);

  const pinnedMessages = useMemo(() => 
    chatMessages.filter(msg => msg.isPinned && msg.type !== 'timestamp'),
    [chatMessages]
  );

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(`notes_${id}`, JSON.stringify(notes));
  }, [notes, id]);

  // Function to compress image
  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to base64 with reduced quality
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve('');
          }
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Enhanced image upload handler with compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedImage = await compressImage(file);
        uploadedUrls.push(compressedImage);
      }
      setNoteImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const compressedImage = await compressImage(file);
        uploadedUrls.push(compressedImage);
      }
      setNoteImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    setNoteImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update addNote function
  const addNote = () => {
    if (!currentNote.trim() && noteImages.length === 0 || !currentVideo) return;

    let audioUrl: string | undefined = undefined;
    if (audioChunksRef.current.length > 0) {
      audioUrl = URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
      audioChunksRef.current = [];
    }

    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote,
      timestamp: Date.now(),
      videoId: currentVideo.id,
      videoTitle: currentVideo.title,
      images: noteImages,
      tags: noteTags,
      color: noteColor,
      audioUrl,
    };

    setNotes(prev => [...prev, newNote]);
    setCurrentNote('');
    setNoteImages([]);
    setNoteTags([]);
    setNoteColor('#ffffff');
    toast.success('Note saved!');
  };

  // Update editNote function
  const editNote = (noteId: string) => {
    setEditingNoteId(noteId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setCurrentNote(note.content);
      setNoteImages(note.images || []);
      setNoteTags(note.tags || []);
      setNoteColor(note.color || '#ffffff');
    }
  };

  // Update saveEditedNote function
  const saveEditedNote = () => {
    if (!editingNoteId || (!currentNote.trim() && noteImages.length === 0)) return;

    let audioUrl: string | undefined = undefined;
    if (audioChunksRef.current.length > 0) {
      audioUrl = URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
      audioChunksRef.current = [];
    }

    setNotes(prev => prev.map(note => 
      note.id === editingNoteId 
        ? { 
            ...note, 
            content: currentNote,
            images: noteImages,
            tags: noteTags,
            color: noteColor,
            audioUrl: audioUrl || note.audioUrl,
          }
        : note
    ));
    setEditingNoteId(null);
    setCurrentNote('');
    setNoteImages([]);
    setNoteTags([]);
    setNoteColor('#ffffff');
    toast.success('Note updated!');
  };

  // Delete note
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Note deleted!');
  };

  // Toggle between chat and notes
  const toggleSection = (section: 'chat' | 'notes') => {
    if (section === 'chat') {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
  };

  // Add paste image handler
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setIsUploading(true);
          try {
            const compressedImage = await compressImage(file);
            setNoteImages(prev => [...prev, compressedImage]);
            toast.success('Image pasted successfully!');
          } catch (error) {
            toast.error('Failed to paste image');
            console.error('Image paste error:', error);
          } finally {
            setIsUploading(false);
          }
        }
      }
    }
  };

  // Function to open note popup
  const openNotePopup = (note: Note) => {
    setSelectedNote(note);
    setPopupNoteContent(note.content);
    setPopupNoteImages(note.images || []);
    setPopupNoteTags(note.tags || []);
    setPopupNoteColor(note.color || '#ffffff');
    setShowNotePopup(true);
    setIsEditingInPopup(false);
  };

  // Function to start editing in popup
  const startEditingInPopup = (note: Note) => {
    setSelectedNote(note);
    setPopupNoteContent(note.content);
    setPopupNoteImages(note.images || []);
    setPopupNoteTags(note.tags || []);
    setPopupNoteColor(note.color || '#ffffff');
    setIsEditingInPopup(true);
    setShowNotePopup(true);
  };

  // Function to save edited note from popup
  const saveEditedNoteFromPopup = () => {
    if (!selectedNote || (!popupNoteContent.trim() && popupNoteImages.length === 0)) return;

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id 
        ? { 
            ...note, 
            content: popupNoteContent,
            images: popupNoteImages,
            tags: popupNoteTags,
            color: popupNoteColor
          }
        : note
    ));
    
    setIsEditingInPopup(false);
    setPopupNoteContent('');
    setPopupNoteImages([]);
    setPopupNoteTags([]);
    setPopupNoteColor('#ffffff');
    toast.success('Note updated!');
  };

  // Function to handle image upload in popup
  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedImage = await compressImage(file);
        uploadedUrls.push(compressedImage);
      }
      setPopupNoteImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to remove image in popup
  const removePopupImage = (index: number) => {
    setPopupNoteImages(prev => prev.filter((_, i) => i !== index));
  };

  // Function to add tag in popup
  const addPopupTag = (tag: string) => {
    if (!tag.trim()) return;
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    if (!popupNoteTags.includes(tag)) {
      setPopupNoteTags(prev => [...prev, tag]);
    }
  };

  // Function to remove tag in popup
  const removePopupTag = (tag: string) => {
    setPopupNoteTags(prev => prev.filter(t => t !== tag));
  };

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Function to start voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          // Here you would typically send the audio to a speech-to-text service
          // For now, we'll simulate it with a timeout
          toast.info('Converting speech to text...');
          setTimeout(() => {
            setCurrentNote(prev => prev + ' [Voice note transcribed] ');
            toast.success('Voice note converted to text!');
          }, 2000);
        } catch (error) {
          toast.error('Failed to convert voice note');
        }
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      toast.success('Voice recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  // Function to stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      toast.success('Voice recording stopped');
    }
  };

  // Function to add a tag
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Function to remove a tag
  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Function to toggle floating note
  const toggleFloatingNote = (note: Note) => {
    setNotes(prev => prev.map(n => 
      n.id === note.id 
        ? { ...n, isFloating: !n.isFloating, position: n.isFloating ? undefined : { x: 100, y: 100 } }
        : n
    ));
  };

  // Function to move floating note
  const moveFloatingNote = (noteId: string, x: number, y: number) => {
    setNotes(prev => prev.map(n => 
      n.id === noteId 
        ? { ...n, position: { x, y } }
        : n
    ));
  };

  // Function to generate flashcards from note
  const generateFlashcards = (note: Note) => {
    const sentences = note.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const flashcards: Flashcard[] = sentences.map((sentence, index) => ({
      id: `${note.id}_flashcard_${index}`,
      front: sentence.trim(),
      back: 'Your answer here',
      noteId: note.id,
      lastReviewed: Date.now(),
      reviewCount: 0
    }));

    setNotes(prev => prev.map(n => 
      n.id === note.id 
        ? { ...n, flashcards }
        : n
    ));
  };

  // Function to export note as PDF
  const exportNoteAsPDF = async (note: Note) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export notes');
        return;
      }

      // Write the content to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>${note.videoTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 20px; }
              p { font-size: 16px; margin-bottom: 20px; }
              img { max-width: 100%; margin: 10px 0; }
              .tag { background: #eee; padding: 5px 10px; margin: 5px; border-radius: 15px; display: inline-block; }
              .timestamp { font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${note.videoTitle}</h1>
            <p>${note.content}</p>
            ${note.images?.map(img => `<img src="${img}" />`).join('') || ''}
            ${note.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
            <p class="timestamp">Created: ${new Date(note.timestamp).toLocaleString()}</p>
          </body>
        </html>
      `);

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Print the window
      printWindow.print();
      printWindow.close();
      
      toast.success('Note exported successfully!');
    } catch (error) {
      toast.error('Failed to export note');
      console.error('Export error:', error);
    }
  };

  // Add these functions after the existing functions
  const startStopwatch = () => {
    if (!isStopwatchRunning) {
      setIsStopwatchRunning(true);
      stopwatchInterval.current = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopStopwatch = () => {
    if (isStopwatchRunning) {
      setIsStopwatchRunning(false);
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
    }
  };

  // Add this effect to handle stopwatch cleanup
  useEffect(() => {
    return () => {
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
    };
  }, []);

  // --- Advertisement Popup State and Logic ---
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [adPopupTimer, setAdPopupTimer] = useState(0); // seconds since popup appeared
  const [adPopupCanClose, setAdPopupCanClose] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const adTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to show the ad popup
  const showAd = useCallback(() => {
    setShowAdPopup(true);
    setAdPopupTimer(0);
    setAdPopupCanClose(false);
    setAdBlockDetected(false);
    // Auto-pause the video when the ad appears
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    // Start timer for the popup (for the counter display)
    if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    adTimerIntervalRef.current = setInterval(() => {
      setAdPopupTimer(prev => prev + 1);
    }, 1000);
    // After 20 seconds, allow closing
    if (adCloseTimeoutRef.current) clearTimeout(adCloseTimeoutRef.current);
    adCloseTimeoutRef.current = setTimeout(() => {
      setAdPopupCanClose(true);
      if (adTimerIntervalRef.current) {
        clearInterval(adTimerIntervalRef.current);
      }
    }, 20000);
  }, []);

  // Effect to start the first ad after 10 seconds when player is ready
  useEffect(() => {
    if (!isPlayerReady) return;
    if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    adTimeoutRef.current = setTimeout(() => {
      showAd();
    }, 3600000);
    return () => {
      if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
      if (adCloseTimeoutRef.current) clearTimeout(adCloseTimeoutRef.current);
      if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    };
  }, [isPlayerReady, showAd]);

  // When popup closes, start timer for next ad
  const handleCloseAdPopup = () => {
    setShowAdPopup(false);
    setAdPopupTimer(0);
    setAdPopupCanClose(false);
    if (adCloseTimeoutRef.current) clearTimeout(adCloseTimeoutRef.current);
    if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    // Start next ad after 10 seconds
    if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    adTimeoutRef.current = setTimeout(() => {
      showAd();
    }, 3600000);
  };

  useEffect(() => {
    if (showAdPopup) {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      if (!win.adsbygoogle && !document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        document.body.appendChild(script);
      }
      setTimeout(() => {
        try {
          (win.adsbygoogle = win.adsbygoogle || []).push({});
        } catch (e) {
          /* AdSense push failed, likely not loaded yet. */
        }
      }, 500);
    }
  }, [showAdPopup]);

  // Auto-close sidebar on mount
  const { setOpen, setOpenMobile } = useSidebar();
  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, [setOpen, setOpenMobile]);

  // Set initial volume on player ready
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [isPlayerReady]);

  const [isPlayerHovered, setIsPlayerHovered] = useState(false);

  // Add state for selected quality
  const [selectedQuality, setSelectedQuality] = useState('auto');

  // In the player initialization effect, after player is ready, set selectedQuality to current quality
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;
    try {
      const currentQuality = playerRef.current.getPlaybackQuality?.() || 'auto';
      setSelectedQuality(currentQuality);
    } catch (e) { /* ignore */ }
  }, [isPlayerReady]);

  // Add at the top with other useState imports
  const [isFormalizing, setIsFormalizing] = useState(false);

  // Add after other useState/useRef declarations in VideoPlayer
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen handlers
  const handleToggleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (container as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen!();
      } else if ((container as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
        (container as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen!();
      }
    } else {
      const doc = document as Document & {
        webkitExitFullscreen?: () => void;
        msExitFullscreen?: () => void;
      };
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        msFullscreenElement?: Element;
      };
      const fullscreenElement = document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const [isFrozen, setIsFrozen] = useState(false);

  // Place these at the top of VideoPlayer component, after other useState/useRef
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatPos, setChatPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 432, y: window.innerHeight - 532 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setChatPos({
        x: Math.min(Math.max(e.clientX - dragOffset.x, 0), window.innerWidth - 400),
        y: Math.min(Math.max(e.clientY - dragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  // Add state for floating notes window position and dragging
  const notesRef = useRef<HTMLDivElement>(null);
  const [notesPos, setNotesPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 900, y: window.innerHeight - 532 });
  const [notesDragging, setNotesDragging] = useState(false);
  const [notesDragOffset, setNotesDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!notesDragging) return;
      setNotesPos({
        x: Math.min(Math.max(e.clientX - notesDragOffset.x, 0), window.innerWidth - 400),
        y: Math.min(Math.max(e.clientY - notesDragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setNotesDragging(false);
    if (notesDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [notesDragging, notesDragOffset]);

  // Add state for Pomodoro
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroPos, setPomodoroPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 1350, y: window.innerHeight - 532 });
  const [pomodoroDragging, setPomodoroDragging] = useState(false);
  const [pomodoroDragOffset, setPomodoroDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isWork, setIsWork] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const pomodoroRef = useRef<HTMLDivElement>(null);
  const pomodoroInterval = useRef<NodeJS.Timeout | null>(null);

  // Add state for Pomodoro stats
  const [breaksTaken, setBreaksTaken] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Update Pomodoro timer effect to increment stats
  useEffect(() => {
    if (pomodoroRunning) {
      pomodoroInterval.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev > 0) return prev - 1;
          setIsWork(w => {
            // If just finished a work session, increment sessionsCompleted
            if (w) setSessionsCompleted(s => s + 1);
            // If just finished a break, increment breaksTaken
            else setBreaksTaken(b => b + 1);
            return !w;
          });
          return isWork ? breakDuration * 60 : workDuration * 60;
        });
      }, 1000);
    } else if (pomodoroInterval.current) {
      clearInterval(pomodoroInterval.current);
    }
    return () => {
      if (pomodoroInterval.current) clearInterval(pomodoroInterval.current);
    };
  }, [pomodoroRunning, isWork, workDuration, breakDuration]);

  useEffect(() => {
    if (isWork) setPomodoroTime(workDuration * 60);
    else setPomodoroTime(breakDuration * 60);
  }, [workDuration, breakDuration, isWork, showPomodoro]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pomodoroDragging) return;
      setPomodoroPos({
        x: Math.min(Math.max(e.clientX - pomodoroDragOffset.x, 0), window.innerWidth - 320),
        y: Math.min(Math.max(e.clientY - pomodoroDragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setPomodoroDragging(false);
    if (pomodoroDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pomodoroDragging, pomodoroDragOffset]);

  function formatPomodoroTime(t: number) {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Add state for Ask AI popup
  const [showAskAI, setShowAskAI] = useState(false);
  const [askAIPos, setAskAIPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 900, y: window.innerHeight - 600 });
  const [askAIDragging, setAskAIDragging] = useState(false);
  const [askAIDragOffset, setAskAIDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aiQuestion, setAIQuestion] = useState('');
  const [aiAnswer, setAIAnswer] = useState('');
  const [aiLoading, setAILoading] = useState(false);
  const askAIRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!askAIDragging) return;
      setAskAIPos({
        x: Math.min(Math.max(e.clientX - askAIDragOffset.x, 0), window.innerWidth - 400),
        y: Math.min(Math.max(e.clientY - askAIDragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setAskAIDragging(false);
    if (askAIDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [askAIDragging, askAIDragOffset]);

  // Fix Gemini API answer extraction
  async function handleAskAI() {
    if (!aiQuestion.trim()) return;
    setAILoading(true);
    setAIAnswer('');
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBwZB2vM8bFAY8sQ6nok5YoRlz2_zalQwo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: aiQuestion }] }]
        })
      });
      const data = await res.json();
      // Try to extract the answer from multiple possible locations
      let answer = '';
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        answer = data.candidates[0].content.parts[0].text;
      } else if (data?.candidates?.[0]?.content?.text) {
        answer = data.candidates[0].content.text;
      } else if (data?.candidates?.[0]?.output) {
        answer = data.candidates[0].output;
      } else if (data?.candidates?.[0]?.content) {
        answer = typeof data.candidates[0].content === 'string' ? data.candidates[0].content : JSON.stringify(data.candidates[0].content);
      } else if (data?.candidates?.[0]) {
        answer = JSON.stringify(data.candidates[0]);
      } else {
        answer = 'No answer received.';
      }
      setAIAnswer(answer);
    } catch (e) {
      setAIAnswer('Error contacting AI.');
    }
    setAILoading(false);
  }

  // Move this to the top of the VideoPlayer component, after other useRef/useState
  const videoListsRef = useRef<HTMLDivElement>(null);

  // Add a ref to track if the video was paused by the break
  const wasPausedByBreak = useRef(false);

  // Place this after all useState/useRef and before any return
  useEffect(() => {
    if (!isWork && playerRef.current) {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT?.PlayerState?.PLAYING) {
        playerRef.current.pauseVideo();
        wasPausedByBreak.current = true;
        toast.info('Break time! Video paused automatically.');
      }
    }
    if (isWork && playerRef.current && wasPausedByBreak.current) {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT?.PlayerState?.PAUSED) {
        playerRef.current.playVideo();
        toast.success('Work resumed! Video auto-resumed.');
        wasPausedByBreak.current = false;
      }
    }
  }, [isWork]);

  // Move these to the top with other useState declarations, before any early return
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [isNotesMaximized, setIsNotesMaximized] = useState(false);
  const [isPomodoroMaximized, setIsPomodoroMaximized] = useState(false);

  // Add state for note preview modal
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const emojiList = ['😀','😂','😍','👍','🙏','🎉','😢','😮','😡','❤️','🔥','👏','��','🤔','🙌','🥳'];

  // Add state for chat call feature
  const [inChatCall, setInChatCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [callTimer, setCallTimer] = useState('00:00');
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (inChatCall && callStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        setCallTimer(`${m}:${s}`);
      }, 1000);
    } else {
      setCallTimer('00:00');
    }
    return () => { if (interval) clearInterval(interval); };
  }, [inChatCall, callStartTime]);

  // Add state for live text chat session messages
  const [liveTextChatMessages, setLiveTextChatMessages] = useState<ChatMessage[]>([]);
  const [liveTextInput, setLiveTextInput] = useState('');

  // Add this state near other useState declarations
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  // Add this variable near the top of the component
  const showFreezeButton = false;

  // Add after other useState declarations
  const [hasPlayed, setHasPlayed] = useState(false);

  // 1. Add handleDeleteVideo function near updateVideoProgress
  const handleDeleteVideo = (videoId: string) => {
    if (!playlist) return;
    const videoIndex = playlist.videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return;

    // Remove from playlist
    const updatedVideos = playlist.videos.filter(v => v.id !== videoId);
    const updatedPlaylist = { ...playlist, videos: updatedVideos };

    // Update localStorage
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const index = playlists.findIndex(p => p.id === id);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
      }
    }

    // Remove from completedVideos if present
    const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
    const newCompletedVideos = completedVideos.filter(v => v.id !== videoId);
    localStorage.setItem('completedVideos', JSON.stringify(newCompletedVideos));

    // Remove watch time data
    localStorage.removeItem(`watchTime_${videoId}`);

    // Update state
    setPlaylist(updatedPlaylist);

    // If the deleted video is currently playing
    if (currentVideo && currentVideo.id === videoId) {
      // Find next uncompleted video
      const nextUncompletedIndex = updatedVideos.findIndex(v => v.progress < 100);
      if (nextUncompletedIndex !== -1) {
        setCurrentVideoIndex(nextUncompletedIndex);
        setIsPlayerReady(false);
        setTimeout(() => setIsPlayerReady(true), 100);
        toast.success('Video deleted. Playing next uncompleted video.');
      } else if (updatedVideos.length > 0) {
        // If no uncompleted, but videos remain, play first
        setCurrentVideoIndex(0);
        setIsPlayerReady(false);
        setTimeout(() => setIsPlayerReady(true), 100);
        toast.success('Video deleted. Playing first video.');
      } else {
        // No videos left
        setShowCompletionDialog(true);
        toast.success('Video deleted. No videos left in playlist.');
      }
    } else {
      toast.success('Video deleted from playlist.');
    }

    // Fire playlist update event
    window.dispatchEvent(new CustomEvent('playlistUpdated', {
      detail: {
        playlistId: id,
        updatedPlaylist
      }
    }));
  };

  useEffect(() => {
    setShowAskAI(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Loading playlist...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Playlist not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to WatchMap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Video not found</p>
            <Button onClick={() => navigate(`/playlist/${id}`)} className="mt-4">
              Back to Playlist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedVideos = playlist.videos.filter(v => v.progress >= 100).length;
  const totalProgress = playlist.videos.reduce((sum, video) => sum + video.progress, 0) / playlist.videos.length;

  // Update the formatTimeWithPrecision function to show only seconds
  const formatTimeWithPrecision = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Reset stats when Pomodoro is reset
  const handlePomodoroReset = () => {
    setPomodoroRunning(false);
    setPomodoroTime(isWork ? workDuration * 60 : breakDuration * 60);
    setBreaksTaken(0);
    setSessionsCompleted(0);
  };

  return (
    <div className={`container mx-auto px-4 py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}` }>
      {/* Advertisement Popup Overlay */}
      {showAdPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
              borderRadius: '32px',
              boxShadow: '0 16px 64px rgba(0,0,0,0.30)',
              padding: '80px 64px',
              minWidth: '900px',
              minHeight: '600px',
              width: '70vw',
              height: '70vh',
              textAlign: 'center',
              position: 'relative',
              maxWidth: '98vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #2563eb',
            }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />
            </div>

            {/* Flying rocket animation (centered at bottom, flies up with fire) */}
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: -220, opacity: 1 }}
              transition={{ duration: 2.2, type: 'spring', stiffness: 60, damping: 18 }}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 z-30 flex flex-col items-center"
              style={{ pointerEvents: 'none' }}
              aria-hidden="true"
            >
              {/* Fire/Flame behind rocket */}
              <motion.span
                initial={{ scale: 0.7, opacity: 0.7 }}
                animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                className="text-4xl md:text-5xl mb-[-12px]"
                style={{ filter: 'blur(1px)', color: '#fff', textShadow: '0 0 8px #000' }}
              >🔥</motion.span>
              {/* Rocket emoji */}
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 10, delay: 0.2 }}
                className="text-6xl md:text-7xl drop-shadow-[0_2px_16px_black]"
                style={{ color: '#fff', textShadow: '0 0 12px #000' }}
              >🚀</motion.span>
            </motion.div>

            {/* Logo with white/black glow */}
            <motion.img
              src={celebrationLogo}
              alt="Celebration Logo"
              className="w-36 h-36 mx-auto mb-4 drop-shadow-[0_0_32px_white] dark:drop-shadow-[0_0_32px_black] border-4 border-white dark:border-black rounded-full bg-white/80 dark:bg-black/80 z-10"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
            />

            {/* Congratulatory text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 16 }}
              className="mt-2 text-5xl font-extrabold text-white dark:text-black text-center drop-shadow-[0_2px_16px_black] dark:drop-shadow-[0_2px_16px_white] z-10"
            >
              Congratulations!
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 180, damping: 18 }}
              className="mt-2 text-2xl font-semibold text-white dark:text-black text-center drop-shadow-[0_2px_8px_black] dark:drop-shadow-[0_2px_8px_white] z-10"
            >
              You completed this video
            </motion.div>

            {/* Shimmer animation keyframes */}
            <style>{`
              @keyframes shimmer {
                0% { background-position: -400px 0; }
                100% { background-position: 400px 0; }
              }
              .animate-shimmer {
                background-size: 800px 100%;
                animation: shimmer 2.5s linear infinite;
              }
            `}</style>

            {/* Timer/Close Button Area */}
            <div style={{ marginTop: 24 }}>
              {adPopupCanClose ? (
                <button
                  onClick={handleCloseAdPopup}
                  style={{
                    padding: '16px 48px',
                    background: 'linear-gradient(90deg, #2563eb 60%, #1e40af 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 16,
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 16px rgba(37,99,235,0.15)',
                    transition: 'background 0.2s',
                    letterSpacing: '1px',
                  }}
                >
                  Close Advertisement
                </button>
              ) : (
                <div
                  style={{
                    fontSize: '1.3rem',
                    color: '#2563eb',
                    fontWeight: 600,
                    background: '#e0e7ef',
                    borderRadius: 12,
                    padding: '12px 32px',
                    display: 'inline-block',
                    boxShadow: '0 1px 8px #2563eb11',
                  }}
                >
                  Please wait... <b>{20 - adPopupTimer}</b> seconds
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {playlist && (
            <Button
              variant="outline"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="bg-black text-white rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 hover:bg-white hover:text-black hover:border-black flex items-center gap-2"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
            >
              <ArrowLeft className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
              Back to Playlist
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAskAI(true)}
              className={`rounded-full font-bold px-6 py-2 shadow-md border transition-all duration-200 flex items-center gap-2 ${isDarkMode ? 'bg-white text-black border-black hover:bg-black hover:text-white' : 'bg-black text-white border-black hover:bg-white hover:text-black'}`}
              style={{ boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.10)' : '0 2px 8px rgba(59,130,246,0.10)' }}
            >
              Ask AI
            </Button>
            <Button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="rounded-full font-bold px-4 py-2 shadow-md border border-blue-600 transition-all duration-200 bg-white text-blue-600 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              style={{ boxShadow: '0 2px 8px rgba(59,130,246,0.10)' }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Enhanced Video Player Section */}
          <div className="xl:col-span-3 space-y-6">
            <Card
              className="
                relative
                bg-white/90
                dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900
                shadow-2xl
                rounded-3xl
                border-0
                overflow-visible
                animate-fade-in
                border border-white/20 dark:border-blue-900/50
                transition-all
                duration-300
              "
            >
              <CardContent className="p-0 relative">
                <div
                  ref={videoContainerRef}
                  className={`
                    relative
                    aspect-video
                    w-full
                    rounded-3xl
                    overflow-hidden
                    shadow-2xl
                    transition-transform
                    duration-300
                    group
                    border-4
                    border-blue-400/30
                    hover:scale-[1.01]
                    hover:shadow-[0_8px_40px_0_rgba(37,99,235,0.25)]
                    ${isFullscreen ? 'z-[9999] bg-black' : ''}
                    ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-blue-700/60' : 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'}
                  `}
                  style={{
                    boxShadow: isDarkMode
                      ? '0 8px 40px 0 rgba(37,99,235,0.25), 0 0 0 2px #2563eb44'
                      : '0 8px 40px 0 rgba(37,99,235,0.18)',
                    border: isDarkMode ? '2px solid #2563eb88' : '2px solid #2563eb',
                  }}
                  onMouseEnter={() => setIsPlayerHovered(true)}
                  onMouseLeave={() => setIsPlayerHovered(false)}
                  onClick={() => {
                    if (isFullscreen && isStopwatchRunning && playerRef.current) {
                      if (!isFrozen) {
                        playerRef.current.pauseVideo();
                        setIsFrozen(true);
                      } else {
                        setIsFrozen(false);
                        playerRef.current.playVideo();
                        startStopwatch();
                      }
                    }
                  }}
                  onContextMenu={e => e.preventDefault()}
                >
                  {/* Video Iframe */}
                  <div ref={iframeRef} className="w-full h-full z-10" />
                  {/* Gradient overlay for controls */}
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none" />
                  {/* Central Play/Stop Button Overlay */}
                  {!isStopwatchRunning && currentVideo && (
                    <div
                      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 cursor-pointer group animate-fade-in"
                      style={{
                        background: isDarkMode ? 'rgba(15,23,42,0.85)' : '#000',
                        transition: 'background 0.3s',
                      }}
                      onClick={() => {
                        if (isFrozen) return;
                        if (playerRef.current) {
                          playerRef.current.playVideo();
                          startStopwatch();
                        }
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(currentVideo.url)}/maxresdefault.jpg`}
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${extractVideoIdFromUrl(currentVideo.url)}/mqdefault.jpg`;
                        }}
                        alt="Video thumbnail"
                        className="object-cover w-full h-full rounded-3xl scale-105 blur-[2px] brightness-75"
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          filter: 'blur(2px) brightness(0.75)',
                          transition: 'filter 0.3s',
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white/90 hover:bg-white/95 rounded-full p-8 shadow-2xl border-4 border-blue-500/40 transition-all group-hover:scale-110 animate-bounce-slow">
                          <PlayCircle className="w-20 h-20 text-blue-600 drop-shadow-xl animate-pulse" />
                        </span>
                      </span>
                    </div>
                  )}
                  {/* Stop Button Overlay - always visible in fullscreen when playing, on hover in small screen */}
                  {((isFullscreen && isStopwatchRunning) || (!isFullscreen && isPlayerHovered && isStopwatchRunning)) && (
                    <button
                      className="absolute inset-0 flex items-center justify-center z-40 group focus:outline-none"
                      onClick={() => {
                        if (playerRef.current) {
                          if (!isFrozen) {
                            playerRef.current.pauseVideo();
                            setIsFrozen(true);
                          } else {
                            setIsFrozen(false);
                            playerRef.current.playVideo();
                            startStopwatch();
                          }
                        }
                      }}
                      aria-label="Stop video"
                    >
                      <span className={`bg-white/80 hover:bg-white/90 rounded-full ${isFullscreen ? 'p-1' : 'p-3'} shadow-2xl border-4 border-red-500/30 transition-all group-hover:scale-110 animate-fade-in`}>
                        {/* Hide icon in fullscreen when playing by hover */}
                        {!(isFullscreen && isStopwatchRunning && isPlayerHovered) && (
                          <Timer className={`${isFullscreen ? 'w-6 h-6' : 'w-10 h-10'} text-red-600 drop-shadow-xl`} />
                        )}
                      </span>
                    </button>
                  )}
                  {/* Floating 10s skip buttons and timeline - skip buttons only in fullscreen, and add exit fullscreen button next to timeline in fullscreen */}
                  {playerRef.current && (
                    <>
                      {/* Exit fullscreen button - only in fullscreen, always visible at bottom right */}
                      {isFullscreen && (
                        <div
                          style={{
                            position: 'absolute', right: 16, bottom: 16, zIndex: 40,
                            pointerEvents: 'auto',
                          }}
                        >
                          <button
                            onClick={handleToggleFullscreen}
                            style={{
                              background: 'rgba(0,0,0,0.6)',
                              borderRadius: '50%',
                              padding: 16,
                              border: 'none',
                              cursor: 'pointer',
                              width: 56,
                              height: 56,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                            className="hover:scale-110 transition-transform"
                            title="Exit Fullscreen"
                          >
                            <Minimize2 className="w-9 h-9 text-white" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Video Info */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {/* Show video title only when not frozen */}
                    {!isFrozen && (
                      <CardTitle className="text-xl dark:text-white">{videoTitle || currentVideo.title}</CardTitle>
                    )}
                    {hasPlayed && (
                      <>
                        {/* Removed Share and Watch Later buttons */}
                      </>
                    )}
                    {showFreezeButton && (
                      <Button
                        variant={isFrozen ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={() => {
                          if (!isFrozen) {
                            if (playerRef.current) playerRef.current.pauseVideo();
                            setIsFrozen(true);
                          } else {
                            setIsFrozen(false);
                            if (playerRef.current) {
                              playerRef.current.playVideo();
                              startStopwatch();
                            }
                          }
                        }}
                        title={isFrozen ? 'Unfreeze video' : 'Freeze video'}
                        className="ml-2"
                      >
                        {isFrozen ? <Play className="w-5 h-5" /> : <Snowflake className="w-5 h-5" />}
                      </Button>
                    )}
                  </div>
                  {currentVideo.progress >= 100 && (
                    <Badge className="bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700">
                      Complete
                    </Badge>
                  )}
                </div>

              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Video Player Controls */}
                  <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-slate-700">
                    <div className="space-y-4">
                      {/* Main Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={markAsComplete}
                            className={`relative overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-white text-black border-2 border-black rounded-full font-bold px-6 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
                            disabled={currentVideo.progress >= 100}
                          >
                            <CheckCircle className="w-4 h-4 mr-2 text-black" />
                            {currentVideo.progress >= 100 ? 'Completed' : 'Complete'}
                          </Button>
                          <div className="h-6 w-px bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700" />
                          
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quality, Volume and Speed Controls - Improved Design */}
                          <div className="flex items-center gap-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-blue-200 dark:border-blue-900/40 ring-1 ring-blue-100 dark:ring-blue-900/30" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.15)'}}> 
                            
                            {/* Volume */}
                            <div className="relative group">
                              <button
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-md hover:bg-neutral-800 focus:ring-2 focus:ring-white focus:outline-none transition-all duration-150"
                                style={{ minWidth: 0, minHeight: 0, boxShadow: '0 2px 8px #0002', position: 'relative', overflow: 'hidden' }}
                                tabIndex={0}
                                title="Volume"
                              >
                                <Volume2 className="w-7 h-7 text-white" />
                              </button>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={volume}
                                onChange={e => {
                                  const newVolume = Number(e.target.value);
                                  setVolume(newVolume);
                                  if (playerRef.current) {
                                    playerRef.current.setVolume(newVolume);
                                  }
                                }}
                                className="w-28 accent-blue-500 cursor-pointer rounded-full bg-gray-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all absolute left-1/2 -translate-x-1/2 bottom-14 opacity-0 group-hover:opacity-100 z-30"
                                title="Volume"
                                style={{ pointerEvents: 'auto' }}
                              />
                            </div>
                            {/* Speed */}
                            <div className="relative group">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-md hover:bg-neutral-800 focus:ring-2 focus:ring-white focus:outline-none transition-all duration-150"
                                    style={{ minWidth: 0, minHeight: 0, boxShadow: '0 2px 8px #0002', position: 'relative', overflow: 'hidden' }}
                                    title="Playback Speed"
                                  >
                                    <Code className="w-7 h-7 text-white" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-32 p-2 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col items-center z-50">
                                  {[0.5, 1, 1.5, 2].map(speed => (
                                    <button
                                      key={speed}
                                      onClick={() => {
                                        if (playerRef.current) playerRef.current.setPlaybackRate(speed);
                                        setSelectedSpeed(speed);
                                      }}
                                      className={`w-full py-2 rounded-lg text-center font-bold text-sm transition-colors duration-150 ${selectedSpeed === speed ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                                    >
                                      {speed}x
                                    </button>
                                  ))}
                                </PopoverContent>
                              </Popover>
                            </div>
                            {/* Fullscreen */}
                            <div className="relative group">
                              <button
                                onClick={handleToggleFullscreen}
                                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-md hover:bg-neutral-800 focus:ring-2 focus:ring-white focus:outline-none transition-all duration-150"
                                style={{ minWidth: 0, minHeight: 0, boxShadow: '0 2px 8px #0002', position: 'relative', overflow: 'hidden' }}
                              >
                                <span className="transition-transform duration-200">
                                  {isFullscreen ? <Minimize2 className="w-7 h-7 text-white" /> : <Maximize2 className="w-7 h-7 text-white" />}
                                </span>
                              </button>
                            </div>
                            <Button
                variant="outline"
                onClick={() => {
                  setShowAllVideos(!showAllVideos);
                  if (!showAllVideos) {
                    setTimeout(() => {
                      videoListsRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
            className="bg-black text-white dark:bg-blue-700 dark:text-white rounded-full font-bold px-6 py-2 shadow-md border border-black dark:border-blue-500 transition-all duration-200 hover:bg-white hover:text-black hover:border-black dark:hover:bg-blue-800 dark:hover:text-blue-200 flex items-center gap-2"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
          >
            <List className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
            {showAllVideos ? 'Hide' : 'Show'}
          </Button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline/Progress Bar Below Complete Button */}
                      <div className="flex flex-col items-center mt-4">
                        <VideoTimeline
                          playerRef={playerRef}
                          isPlayerReady={isPlayerReady}
                          currentVideo={currentVideo}
                        />
                      </div>

                      {/* Progress and Time Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          {/* Progress bar removed for clear view */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="space-y-4">
                    {/* Feature Toggles */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => setShowFloatingChat(!showFloatingChat)}
                        className={`rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:border-black`}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      >
                        <MessageSquare className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
                        Chat Room
                      </Button>
                      <Button
                        onClick={() => setShowFloatingNotes(!showFloatingNotes)}
                        className={`rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:border-black`}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      >
                        <StickyNote className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
                        Notes
                      </Button>
                      <Button
                        onClick={() => setShowPomodoro(!showPomodoro)}
                        className="rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:border-black"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      >
                        <Timer className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
                        Pomodoro
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Remove the sidebar video lists here */}
              </div>
        {/* Move the video lists to the bottom, horizontally */}
          <div ref={videoListsRef} />
          {showAllVideos && (
          <div className="mt-12">
            <div className="flex flex-col gap-8">
              {/* Uncompleted Videos Horizontal List */}
              {uncompletedVideos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Uncompleted Videos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {uncompletedVideos.map((video, index) => (
                      <div 
                        key={video.id} 
                        className="relative group cursor-pointer min-w-[220px] max-w-[220px]"
                        onClick={() => selectVideo(playlist.videos.indexOf(video))}
                      >
                        {/* Delete button (top left) - only show if not the current video */}
                        {currentVideo?.id !== video.id && (
                          <button
                            className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10 hover:bg-red-700 transition-colors opacity-80 hover:opacity-100"
                            style={{ pointerEvents: 'auto' }}
                            title="Delete video from playlist"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteVideo(video.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                          </button>
                        )}
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(video.url)}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                              <PlayCircle className="w-6 h-6 text-gray-900" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-blue-500" />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                            {playlist.videos.indexOf(video) + 1}/{playlist.videos.length}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-700 dark:text-gray-200 font-medium truncate text-center">
                          {video.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Completed Videos Horizontal List */}
              {completedVideosList.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Completed Videos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {completedVideosList.map((video, index) => (
                      <div
                        key={video.id}
                        className="relative group cursor-pointer min-w-[220px] max-w-[220px]"
                        onClick={() => selectVideo(playlist.videos.indexOf(video))}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <img 
                            src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(video.url)}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                              <PlayCircle className="w-6 h-6 text-gray-900" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-green-500" />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                            {playlist.videos.indexOf(video) + 1}/{playlist.videos.length}
                          </div>
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
                            Completed
                          </div>
                          <button
                            className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10 hover:bg-red-700 transition-colors"
                            onClick={e => {
                              e.stopPropagation();
                              updateVideoProgress(video.id, 0);
                              toast.success('Video reset to uncompleted status.');
                            }}
                          >
                            Reset
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-700 dark:text-gray-200 font-medium truncate text-center">
                          {video.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      {/* Floating Chat Window */}
      {showFloatingChat && (
        <div
          ref={chatRef}
          style={{
            position: 'fixed',
            left: isChatMaximized ? '5vw' : chatPos.x,
            top: isChatMaximized ? '5vh' : chatPos.y,
            width: isChatMaximized ? '90vw' : 400,
            maxWidth: '98vw',
            height: isChatMaximized ? '90vh' : 500,
            maxHeight: '98vh',
            background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(59,130,246,0.18)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: dragging ? 'none' : 'auto',
            cursor: dragging ? 'grabbing' : 'default',
            transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
            border: '2px solid #2563eb',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-2xl cursor-move select-none shadow"
            onMouseDown={e => {
              setDragging(true);
              const rect = chatRef.current?.getBoundingClientRect();
              setDragOffset({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              });
            }}
          >
            <span className="font-bold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 mr-1" /> Chat Room
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setInChatCall(true);
                  setCallStartTime(Date.now());
                }}
                className="text-white hover:text-green-300 text-xl font-bold focus:outline-none"
                title="Start Chat Call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsChatMaximized(m => !m)}
                className="text-white hover:text-blue-300 text-xl font-bold focus:outline-none"
                title={isChatMaximized ? 'Restore' : 'Maximize'}
              >
                {isChatMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowFloatingChat(false)}
                className="text-white hover:text-red-400 text-xl font-bold focus:outline-none"
                title="Close Chat"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-gradient-to-b from-blue-50 via-white to-blue-100">
            {/* Chat messages go here */}
            {chatMessages.length === 0 ? (
              <div className="text-gray-400 text-center mt-16">No messages yet. Start the conversation!</div>
            ) : (
              chatMessages.map(msg =>
                msg.type === 'system' ? (
                  <div key={msg.id} className="mb-3 flex items-center justify-center">
                    <div className="bg-gray-200 text-gray-700 italic rounded-xl px-4 py-2 shadow border border-gray-300 flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
                      <span style={{ whiteSpace: 'pre-line' }}>{msg.content}</span>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="mb-3 flex items-start gap-2 relative">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-700 font-bold text-lg">
                        <User className="w-5 h-5" />
                      </span>
                    </div>
                    <div>
                      <div className="bg-white rounded-2xl px-4 py-2 shadow border border-blue-100 text-gray-800 max-w-xs break-words relative">
                        <span className="block font-semibold text-blue-700 text-xs mb-1">{msg.username}</span>
                        <span>{msg.content}</span>
                        {msg.type === 'audio' && msg.audioUrl && (
                          <audio controls src={msg.audioUrl} className="mt-2 w-full" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                      {/* Emoji reactions and button (existing code) */}
                      <div className="flex gap-1 items-center mt-1">
                        <button
                          className="text-yellow-500 hover:bg-yellow-100 rounded-full p-1"
                          style={{ width: 28, height: 28 }}
                          title="React with Emoji"
                          onClick={() => setShowReactions(msg.id)}
                          type="button"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        {showReactions === msg.id && (
                          <div
                            style={{ position: 'absolute', zIndex: 1000, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}
                            onMouseLeave={() => setShowReactions(null)}
                          >
                            {emojiList.map(emoji => (
                              <button
                                key={emoji}
                                className="text-2xl p-1 hover:bg-gray-100 rounded"
                                onClick={() => {
                                  addReaction(msg.id, emoji);
                                  setShowReactions(null);
                                }}
                                type="button"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Show emoji reactions with counts */}
                        {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span key={emoji} className="text-xl px-1 select-none">
                            {emoji} <span className="text-xs align-top">{users.length}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
          <form
            className="flex items-center border-t border-blue-200 px-3 py-2 bg-white"
            style={{ boxShadow: '0 -2px 8px rgba(59,130,246,0.05)' }}
            onSubmit={e => {
              e.preventDefault();
              if (!newMessage.trim()) return;
              addMessage({
                id: Date.now().toString(),
                userId: 'user1',
                username: 'You',
                content: newMessage,
                timestamp: Date.now(),
                type: 'text',
                reactions: {}
              });
              setNewMessage('');
            }}
          >
            <input
              type="text"
              className="flex-1 rounded-full border border-blue-200 px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className={`rounded-full p-2 font-bold text-white ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600'} hover:bg-blue-700 transition flex items-center justify-center mr-2`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Stop Recording' : 'Record Audio'}
              style={{ width: 40, height: 40 }}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-yellow-500 hover:bg-yellow-100 transition flex items-center justify-center mr-2"
              onClick={() => setShowEmojiPicker(v => !v)}
              title="Add Emoji"
              style={{ width: 40, height: 40 }}
            >
              <Smile className="w-6 h-6" />
            </button>
            {showEmojiPicker && (
              <div
                style={{ position: 'absolute', bottom: 56, left: 16, zIndex: 1000, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}
                onMouseLeave={() => setShowEmojiPicker(false)}
              >
                {emojiList.map(emoji => (
                  <button
                    key={emoji}
                    className="text-2xl p-1 hover:bg-gray-100 rounded"
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-full px-4 py-2 font-bold hover:bg-blue-700 transition"
            >
              Send
            </button>
          </form>
          {/* Chat Call Modal */}
          {inChatCall && (
            <div
              style={{
                position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 100000,
                background: 'rgba(37,99,235,0.25)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'fade-in 0.3s',
              }}
              onClick={() => { setInChatCall(false); setCallStartTime(null); setLiveTextChatMessages([]); setLiveTextInput(''); }}
            >
              <div
                className="bg-white/80 dark:bg-slate-900/90 rounded-3xl shadow-2xl p-0 max-w-md w-full relative flex flex-col items-center gap-0 animate-fade-in"
                style={{ minHeight: 480, maxHeight: '95vh', width: 420, overflow: 'hidden', border: '2px solid #2563eb', boxShadow: '0 16px 64px rgba(37,99,235,0.10)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="w-full flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-3xl shadow">
                  <span className="flex items-center gap-2 text-xl font-bold">
                    <MessageSquare className="w-6 h-6 mr-1" /> Live Text Chat
                  </span>
                  <span className="bg-white/20 text-white font-mono text-base px-4 py-1 rounded-full shadow border border-white/30">{callTimer}</span>
                  <button
                    className="ml-4 text-white hover:text-red-200 text-2xl font-bold focus:outline-none"
                    onClick={() => { setInChatCall(false); setCallStartTime(null); setLiveTextChatMessages([]); setLiveTextInput(''); }}
                    title="End Session"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                </div>
                {/* Messages */}
                <div className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-blue-50 via-white to-blue-100 px-4 py-6" style={{ minHeight: 180, maxHeight: 260 }}>
                  {liveTextChatMessages.length === 0 ? (
                    <div className="text-gray-400 text-center mt-12">No messages yet. Start chatting!</div>
                  ) : (
                    liveTextChatMessages.map(msg => {
                      const isYou = msg.username === 'You';
                      return (
                        <div key={msg.id} className={`mb-3 flex ${isYou ? 'justify-end' : 'justify-start'} items-end w-full`}>
                          <div className={`max-w-[70%] ${isYou ? 'bg-blue-600 text-white ml-auto' : 'bg-white text-blue-900 mr-auto'} rounded-2xl px-4 py-2 shadow border ${isYou ? 'border-blue-400' : 'border-blue-100'} relative`} style={{ wordBreak: 'break-word' }}>
                            <span className={`block font-semibold text-xs mb-1 ${isYou ? 'text-white/80' : 'text-blue-700/80'}`}>{msg.username}</span>
                            <span>{msg.content}</span>
                            <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* Input area */}
                <form
                  className="w-full flex items-center gap-2 px-6 py-4 bg-white/80 dark:bg-slate-900/80 border-t border-blue-100 rounded-b-3xl shadow-lg"
                  style={{ position: 'sticky', bottom: 0 }}
                  onSubmit={e => {
                    e.preventDefault();
                    if (!liveTextInput.trim()) return;
                    setLiveTextChatMessages(prev => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        userId: 'user1',
                        username: 'You',
                        content: liveTextInput,
                        timestamp: Date.now(),
                        type: 'text',
                        reactions: {},
                      },
                    ]);
                    setLiveTextInput('');
                  }}
                >
                  <input
                    type="text"
                    className="flex-1 rounded-full border border-blue-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-base shadow"
                    placeholder="Type a message..."
                    value={liveTextInput}
                    onChange={e => setLiveTextInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-full px-5 py-2 font-bold hover:bg-blue-700 transition shadow"
                  >
                    Send
                  </button>
                </form>
                {/* End Session button (floating) */}
                <button
                  className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-red-600 text-white rounded-full px-8 py-3 font-bold text-lg hover:bg-red-700 transition shadow-lg"
                  style={{ zIndex: 10 }}
                  onClick={() => {
                    const sessionStart = liveTextChatMessages[0]?.timestamp;
                    const sessionEnd = liveTextChatMessages[liveTextChatMessages.length - 1]?.timestamp;
                    const messageCount = liveTextChatMessages.length;
                    if (messageCount > 0) {
                      setChatMessages(prev => [
                        ...prev,
                        {
                          id: `system_${Date.now()}`,
                          userId: 'system',
                          username: 'System',
                          content: `Live Text Chat session\nStart: ${sessionStart ? new Date(sessionStart).toLocaleTimeString() : ''}\nEnd: ${sessionEnd ? new Date(sessionEnd).toLocaleTimeString() : ''}\nMessages: ${messageCount}`,
                          timestamp: Date.now(),
                          type: 'system',
                          reactions: {},
                        },
                        ...liveTextChatMessages,
                      ]);
                    }
                    setInChatCall(false);
                    setCallStartTime(null);
                    setLiveTextChatMessages([]);
                    setLiveTextInput('');
                  }}
                >
                  End Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Floating Notes Window */}
      {showFloatingNotes && (
        <div
          ref={notesRef}
          style={{
            position: 'fixed',
            left: isNotesMaximized ? '5vw' : notesPos.x,
            top: isNotesMaximized ? '5vh' : notesPos.y,
            width: isNotesMaximized ? '90vw' : 400,
            maxWidth: '98vw',
            height: isNotesMaximized ? '90vh' : 500,
            maxHeight: '98vh',
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: notesDragging ? 'none' : 'auto',
            cursor: notesDragging ? 'grabbing' : 'default',
            transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-black text-white rounded-t-2xl cursor-move select-none"
            onMouseDown={e => {
              setNotesDragging(true);
              const rect = notesRef.current?.getBoundingClientRect();
              setNotesDragOffset({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              });
            }}
          >
            <span className="font-bold text-lg">Notes</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNotesMaximized(m => !m)}
                className="text-white hover:text-blue-300 text-xl font-bold focus:outline-none"
                title={isNotesMaximized ? 'Restore' : 'Maximize'}
              >
                {isNotesMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowFloatingNotes(false)}
                className="text-white hover:text-red-400 text-xl font-bold focus:outline-none"
                title="Close Notes"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
            {notes.filter(n => n.videoId === currentVideo?.id).length === 0 ? (
              <div className="text-gray-400 text-center mt-16">No notes yet. Add your first note!</div>
            ) : (
              notes.filter(n => n.videoId === currentVideo?.id).map(note => (
                <div key={note.id} className="mb-4 p-3 bg-white rounded-lg shadow border border-gray-200 flex justify-between items-start">
                  <div>
                    {editingNoteId === note.id ? (
                      <>
                        <textarea
                          className="w-full rounded border border-gray-300 px-2 py-1 mb-2"
                          value={currentNote}
                          onChange={e => setCurrentNote(e.target.value)}
                          rows={2}
                          onPaste={handlePaste}
                        />
                        {/* Show images if any */}
                        {noteImages.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {noteImages.map((img, idx) => (
                              <img key={idx} src={img} alt="Note" className="w-12 h-12 object-cover rounded" />
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 text-white rounded px-3 py-1 font-bold hover:bg-green-700"
                            onClick={saveEditedNote}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-300 text-gray-700 rounded px-3 py-1 font-bold hover:bg-gray-400"
                            onClick={() => setEditingNoteId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-gray-700 mb-1">{note.content}</div>
                        {/* Show images if any */}
                        {note.images && note.images.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {note.images.map((img, idx) => (
                              <img key={idx} src={img} alt="Note" className="w-12 h-12 object-cover rounded" />
                            ))}
                          </div>
                        )}
                        {/* Show audio if any */}
                        {note.audioUrl && (
                          <audio controls src={note.audioUrl} className="mt-2" />
                        )}
                        <div className="text-xs text-gray-400 mt-1">{new Date(note.timestamp).toLocaleTimeString()}</div>
                        <div className="flex gap-2 mt-1">
                          <button
                            className="text-blue-600 hover:underline text-xs font-bold"
                            onClick={() => editNote(note.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                            title="Delete Note"
                            onClick={() => setNotes(prev => prev.filter(n => n.id !== note.id))}
                          >
                            ×
                          </button>
                          <button
                            className="ml-2 text-blue-500 hover:text-blue-700 text-lg font-bold"
                            title="Preview Note"
                            onClick={() => setPreviewNote(note)}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <form
            className="flex flex-col gap-2 border-t border-gray-200 px-3 py-2 bg-white"
            onSubmit={e => {
              e.preventDefault();
              if (!noteInput.trim() && noteImages.length === 0 || !currentVideo) return;
              setNotes(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  content: noteInput,
                  timestamp: Date.now(),
                  videoId: currentVideo.id,
                  videoTitle: currentVideo.title,
                  images: noteImages,
                },
              ]);
              setNoteInput('');
              setNoteImages([]);
            }}
          >
            <textarea
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Add a note... (You can paste images/screenshots here)"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              rows={1}
              style={{ minHeight: 36, maxHeight: 80 }}
              onPaste={handlePaste}
            />
            {/* Image upload/paste area */}
            <div
              className="flex items-center gap-2 mt-1"
              style={{ minHeight: 48 }}
            >
              <label
                htmlFor="note-image-upload"
                className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                title="Paste or click to upload image"
                style={{ position: 'relative' }}
              >
                <Image className="w-6 h-6 text-gray-400" />
                <input
                  id="note-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </label>
              {/* Show image previews */}
              {noteImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {noteImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="Note" className="w-12 h-12 object-cover rounded border border-gray-300" />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow hover:bg-red-700"
                        onClick={() => removeImage(idx)}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Audio recording button and preview */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                className={`rounded-full p-2 font-bold text-white ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-600'} hover:bg-green-700 transition flex items-center justify-center`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? 'Stop Recording' : 'Record Audio'}
                style={{ width: 40, height: 40 }}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              {audioChunksRef.current.length > 0 && (
                <audio controls src={URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/webm' }))} className="ml-2" />
              )}
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white rounded-full px-4 py-2 font-bold hover:bg-green-700 transition mt-2"
            >
              Add Note
            </button>
          </form>
        </div>
      )}
      {/* Floating Pomodoro Window */}
      {showPomodoro && (
        <div
          ref={pomodoroRef}
          style={{
            position: 'fixed',
            left: isPomodoroMaximized ? '5vw' : pomodoroPos.x,
            top: isPomodoroMaximized ? '5vh' : pomodoroPos.y,
            width: isPomodoroMaximized ? '90vw' : 320,
            maxWidth: '98vw',
            height: isPomodoroMaximized ? '90vh' : 400,
            background: 'linear-gradient(135deg, #fff 60%, #f3f4f6 100%)',
            borderRadius: 28,
            boxShadow: '0 8px 32px rgba(220,38,38,0.18)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: pomodoroDragging ? 'none' : 'auto',
            cursor: pomodoroDragging ? 'grabbing' : 'default',
            border: '2px solid #ef4444',
            transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-t-2xl cursor-move select-none shadow"
            onMouseDown={e => {
              setPomodoroDragging(true);
              const rect = pomodoroRef.current?.getBoundingClientRect();
              setPomodoroDragOffset({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              });
            }}
          >
            <span className="font-bold text-lg flex items-center gap-2">
              <Timer className="w-5 h-5 mr-1" /> Pomodoro
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPomodoroMaximized(m => !m)}
                className="text-white hover:text-blue-200 text-xl font-bold focus:outline-none"
                title={isPomodoroMaximized ? 'Restore' : 'Maximize'}
              >
                {isPomodoroMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowPomodoro(false)}
                className="text-white hover:text-yellow-200 text-xl font-bold focus:outline-none"
                title="Close Pomodoro"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white via-gray-50 to-red-50 px-4 pb-4">
            {/* Pomodoro stats - improved look */}
            <div className="flex gap-3 justify-center mb-2 mt-2">
              <div className="flex flex-col items-center bg-green-50 text-green-700 rounded-xl px-3 py-1 text-xs font-bold shadow-sm border border-green-200">
                <span className="text-lg font-extrabold">{sessionsCompleted}</span>
                <span className="uppercase tracking-wider">Sessions</span>
              </div>
              <div className="flex flex-col items-center bg-blue-50 text-blue-700 rounded-xl px-3 py-1 text-xs font-bold shadow-sm border border-blue-200">
                <span className="text-lg font-extrabold">{breaksTaken}</span>
                <span className="uppercase tracking-wider">Breaks</span>
              </div>
            </div>
            {/* Progress ring for timer */}
            <div className="relative flex items-center justify-center my-2" style={{ width: 120, height: 120 }}>
              <svg width="120" height="120">
                <circle
                  cx="60" cy="60" r="54"
                  stroke="#e5e7eb" strokeWidth="10" fill="none"
                />
                <circle
                  cx="60" cy="60" r="54"
                  stroke={isWork ? '#22c55e' : '#3b82f6'}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={339.292}
                  strokeDashoffset={339.292 - (pomodoroTime / (isWork ? workDuration * 60 : breakDuration * 60)) * 339.292}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold ${isWork ? 'text-green-600' : 'text-blue-600'}`}>{formatPomodoroTime(pomodoroTime)}</span>
                <span className={`mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${isWork ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{isWork ? 'Work' : 'Break'}</span>
              </div>
            </div>
            {/* Controls - improved look */}
            <div className="flex gap-2 mb-4 mt-2">
              <button
                onClick={() => setPomodoroRunning(r => !r)}
                className={`px-5 py-2 rounded-full font-bold shadow transition text-white ${pomodoroRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {pomodoroRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={handlePomodoroReset}
                className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>
            {/* Duration inputs - improved look */}
            <div className="flex gap-3 items-center mt-2">
              <label className="text-xs font-semibold text-gray-600">Work</label>
              <input
                type="number"
                min={1}
                max={120}
                value={workDuration}
                onChange={e => setWorkDuration(Number(e.target.value))}
                className="w-12 rounded border border-green-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50"
              />
              <label className="text-xs font-semibold text-gray-600 ml-2">Break</label>
              <input
                type="number"
                min={1}
                max={60}
                value={breakDuration}
                onChange={e => setBreakDuration(Number(e.target.value))}
                className="w-12 rounded border border-blue-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
              />
            </div>
          </div>
        </div>
      )}
      {/* Floating Ask AI Window */}
      <Dialog open={showAskAI} onOpenChange={setShowAskAI}>
        <DialogContent
          className={`max-w-lg w-full p-8 rounded-2xl shadow-2xl border transition-all duration-200
            ${isDarkMode ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}
          `}
          style={{
            boxShadow: isDarkMode
              ? '0 8px 40px 0 rgba(0,0,0,0.25)'
              : '0 8px 40px 0 rgba(0,0,0,0.10)'
          }}
        >
          {/* ...Ask AI content... */}
        </DialogContent>
      </Dialog>
      {/* Note Preview Modal */}
      {previewNote && (
        <div
          style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 99999,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setPreviewNote(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative flex flex-col gap-4"
            style={{ minHeight: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
              onClick={() => setPreviewNote(null)}
              title="Close Preview"
            >
              <X className="w-7 h-7" />
            </button>
            <div className="text-lg font-bold mb-2">{previewNote.videoTitle}</div>
            <div className="text-gray-800 whitespace-pre-line mb-2">{previewNote.content}</div>
            {/* Images with click-to-maximize */}
            {previewNote.images && previewNote.images.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {previewNote.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="Note"
                    className="w-32 h-32 object-cover rounded cursor-pointer border border-gray-300 hover:shadow-lg"
                    onClick={() => setFullscreenImage(img)}
                    title="Click to maximize"
                  />
                ))}
              </div>
            )}
            {/* Audio if present */}
            {previewNote.audioUrl && (
              <audio controls src={previewNote.audioUrl} className="mt-2" />
            )}
            <div className="text-xs text-gray-400 mt-2">{new Date(previewNote.timestamp).toLocaleString()}</div>
          </div>
        </div>
      )}
      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div
          style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 100000,
            background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setFullscreenImage(null)}
        >
          <img src={fullscreenImage} alt="Fullscreen" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
          <button
            style={{ position: 'fixed', top: 32, right: 32, background: 'rgba(0,0,0,0.7)', borderRadius: 24, padding: 8, border: 'none', cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setFullscreenImage(null); }}
            title="Close Image"
          >
            <X className="w-8 h-8 text-white" />
          </button>
        </div>
      )}
      {isFullscreen && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 30,
            pointerEvents: 'auto',
            background: 'transparent'
          }}
          onContextMenu={e => e.preventDefault()}
        />
      )}
      {/* Celebratory Completion Modal */}
      <AnimatePresence>
        {showCompletionDialog && (
          <>
            {/* Confetti effect: many small colored paper pieces falling from top */}
            <div className="fixed inset-0 z-[10002] pointer-events-none">
              {Array.from({ length: 36 }).map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 0.7;
                const duration = 1.6 + Math.random() * 0.8;
                const size = 8 + Math.random() * 10;
                const colors = [
                  'bg-red-500', 'bg-yellow-400', 'bg-green-400', 'bg-blue-500', 'bg-pink-400', 'bg-purple-500', 'bg-orange-400', 'bg-fuchsia-400', 'bg-indigo-400', 'bg-teal-400'
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const rotate = Math.random() * 360;
                return (
                  <motion.div
                    key={`confetti-${i}-${Date.now()}`}
                    initial={{ y: -40, opacity: 0, rotate }}
                    animate={{ y: '110vh', opacity: 1, rotate: rotate + 180 }}
                    transition={{ delay, duration, ease: 'easeOut' }}
                    className={`absolute top-0 left-0 ${color}`}
                    style={{
                      left: `${left}%`,
                      width: size,
                      height: size * (0.5 + Math.random()),
                      borderRadius: 2,
                      zIndex: 1,
                      boxShadow: '0 2px 8px #0002',
                    }}
                  />
                );
              })}
            </div>
            {/* Modal overlay and content below */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70"
              aria-modal="true"
              role="dialog"
              tabIndex={-1}
            >
              {/* Confetti effect: only above/behind the modal box */}
              <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => {
                  const left = Math.random() * 100;
                  const delay = Math.random() * 0.7;
                  const duration = 1.6 + Math.random() * 0.8;
                  const size = 8 + Math.random() * 10;
                  const colors = [
                    'bg-red-500', 'bg-yellow-400', 'bg-green-400', 'bg-blue-500', 'bg-pink-400', 'bg-purple-500', 'bg-orange-400', 'bg-fuchsia-400', 'bg-indigo-400', 'bg-teal-400'
                  ];
                  const color = colors[Math.floor(Math.random() * colors.length)];
                  const rotate = Math.random() * 360;
                  return (
                    <motion.div
                      key={`confetti-${i}-${Date.now()}`}
                      initial={{ y: -40, opacity: 0, rotate }}
                      animate={{ y: '420px', opacity: 1, rotate: rotate + 180 }}
                      transition={{ delay, duration, ease: 'easeOut' }}
                      className={`absolute top-0 left-0 ${color}`}
                      style={{
                        left: `${left}%`,
                        width: size,
                        height: size * (0.5 + Math.random()),
                        borderRadius: 2,
                        zIndex: 0,
                        boxShadow: '0 2px 8px #0002',
                      }}
                    />
                  );
                })}
              </div>
              {/* Modal content (z-10+) */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center border-2 border-black/20 backdrop-blur-2xl overflow-hidden z-10"
                style={{ boxShadow: '0 8px 64px 0 #0008, 0 2px 16px #fff2' }}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-40" />
                </div>
                {/* Logo in grayscale or inverted for pure black/white */}
                <motion.img
                  src={celebrationLogo}
                  alt="Celebration Logo"
                  className="w-36 h-36 mx-auto mb-4 border-4 border-black rounded-full bg-white z-10"
                  style={{ filter: 'grayscale(1) contrast(1.2)' }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1.15, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
                />
                {/* Congratulatory text */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 16 }}
                  className="mt-2 text-5xl font-extrabold text-black text-center drop-shadow-[0_2px_16px_white] z-10"
                >
                  Congratulations!
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 180, damping: 18 }}
                  className="mt-2 text-2xl font-semibold text-black text-center drop-shadow-[0_2px_8px_white] z-10"
                >
                  You completed this video
                </motion.div>
                {/* Shimmer animation keyframes */}
                <style>{`
                  @keyframes shimmer {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                  }
                  .animate-shimmer {
                    background-size: 800px 100%;
                    animation: shimmer 2.5s linear infinite;
                  }
                `}</style>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;

// VideoTimeline component
const VideoTimeline = ({ playerRef, isPlayerReady, currentVideo }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const timelineRef = useRef(null);
  const rafRef = useRef(null);

  // Animation frame update
  const updateTimeline = useCallback(() => {
    if (isPlayerReady && playerRef.current && !isDragging) {
      const newTime = playerRef.current.getCurrentTime?.() || 0;
      const newDuration = playerRef.current.getDuration?.() || 0;
      setDuration(d => (d !== newDuration ? newDuration : d));
      setCurrentTime(t => (Math.abs(t - newTime) > 0.1 ? newTime : t));
    }
    rafRef.current = requestAnimationFrame(updateTimeline);
  }, [isPlayerReady, playerRef, isDragging]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updateTimeline);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [updateTimeline]);

  // Buffering feedback (if possible)
  useEffect(() => {
    if (!playerRef.current) return;
    const checkBuffering = () => {
      try {
        const state = playerRef.current.getPlayerState?.();
        setIsBuffering(state === window.YT?.PlayerState?.BUFFERING);
      } catch (err) {
        // Ignore errors (e.g., player not ready)
      }
    };
    const interval = setInterval(checkBuffering, 200);
    return () => clearInterval(interval);
  }, [playerRef]);

  // Mouse/touch drag handlers
  const getTimeFromEvent = useCallback((e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    let x;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
    } else {
      x = e.clientX - rect.left;
    }
    const percent = Math.max(0, Math.min(1, x / rect.width));
    return percent * duration;
  }, [duration]);

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    const time = getTimeFromEvent(e);
    setDragTime(time);
    document.body.style.userSelect = 'none';
  }, [getTimeFromEvent]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const time = getTimeFromEvent(e);
    setDragTime(time);
  }, [isDragging, getTimeFromEvent]);

  const handlePointerUp = useCallback(() => {
    if (isDragging && playerRef.current) {
      playerRef.current.seekTo(dragTime, true);
      setCurrentTime(dragTime);
    }
    setIsDragging(false);
    document.body.style.userSelect = '';
  }, [isDragging, dragTime, playerRef]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchend', handlePointerUp);
    } else {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Hover time for tooltip
  const handleMouseMove = useCallback((e) => {
    const time = getTimeFromEvent(e);
    setHoverTime(time);
  }, [getTimeFromEvent]);
  const handleMouseLeave = useCallback(() => setHoverTime(null), []);

  // Keyboard support
  const handleKeyDown = useCallback((e) => {
    if (!playerRef.current) return;
    if (e.key === 'ArrowLeft') {
      playerRef.current.seekTo(Math.max((playerRef.current.getCurrentTime?.() || 0) - 5, 0), true);
    } else if (e.key === 'ArrowRight') {
      playerRef.current.seekTo(Math.min((playerRef.current.getCurrentTime?.() || 0) + 5, duration), true);
    }
  }, [playerRef, duration]);

  // Render
  const percent = duration ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0;
  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={timelineRef}
        className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full relative cursor-pointer group"
        style={{ maxWidth: 600 }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Video timeline"
        role="slider"
        aria-valuenow={Math.floor(isDragging ? dragTime : currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
      >
        <div
          className="h-3 bg-blue-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 left-0 transform -translate-y-1/2"
          style={{ left: `${percent}%` }}
        >
          <div className="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow -ml-2 -mt-1 group-hover:scale-110 transition-transform cursor-pointer" />
        </div>
        {/* Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-8 left-0 px-2 py-1 bg-black text-white text-xs rounded shadow"
            style={{ left: `${((hoverTime / duration) * 100).toFixed(2)}%`, transform: 'translateX(-50%)' }}
          >
            {formatTime(Math.floor(hoverTime))}
          </div>
        )}
        {/* Drag tooltip */}
        {isDragging && (
          <div
            className="absolute -top-8 left-0 px-2 py-1 bg-blue-700 text-white text-xs rounded shadow"
            style={{ left: `${((dragTime / duration) * 100).toFixed(2)}%`, transform: 'translateX(-50%)' }}
          >
            {formatTime(Math.floor(dragTime))}
          </div>
        )}
        {/* Buffering spinner */}
        {isBuffering && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
        )}
      </div>
      <div className="flex justify-between w-full mt-1 text-xs text-gray-600 dark:text-gray-300" style={{ maxWidth: 600 }}>
        <span>{formatTime(Math.floor(isDragging ? dragTime : currentTime))}</span>
        <span>{formatTime(Math.floor(duration))}</span>
      </div>
    </div>
  );
};
