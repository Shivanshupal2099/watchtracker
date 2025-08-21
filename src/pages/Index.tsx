import { useState, useEffect } from 'react';
import { X, Flame, Clock, Target, TrendingUp, Play, Code, Share2, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, Heart, MessageSquare, Share, BookmarkCheck, TrendingDown, ArrowUp, ArrowDown, Calendar, BarChart, Info, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from '@/components/StatsCard';
import { PlaylistData, Playlist, Video } from '@/types/playlist';
import { BarChart as ReBarChart, Bar as ReBar, XAxis as ReXAxis, YAxis as ReYAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer as ReResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import NewProgressTabs from '@/components/NewProgressTabs';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    payload: {
        type: 'video' | 'coding';
    }
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const type = payload[0].payload.type;
    return (
      <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-300 capitalize mb-1">{type} Playlist</p>
        {payload.map((pld, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mt-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pld.color }} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{pld.name}:</span>
            <span className="font-semibold text-slate-800 dark:text-white">{pld.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  const requiredInvites = 2;
  const [stats, setStats] = useState<PlaylistData>({
    totalWatchTime: 0,
    totalVideos: 0,
    completedVideos: 0,
    overallProgress: 0,
    estimatedCompletion: '',
    dailyAverage: 0,
    totalCodingQuestions: 0,
    solvedQuestions: 0,
    questionsThisWeek: 0,
    averageTimePerQuestion: 0,
    categoryProgress: {},
    currentStreak: 0,
    longestStreak: 0
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  // Add userStats calculation (copy from Profile)
  const [userStats, setUserStats] = useState({
    daysActive: 0,
    hoursLearning: 0,
    problemsSolved: 0,
    tasksCompleted: 0,
    joinDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        console.log('Loaded playlists from localStorage:', savedPlaylists);
        
        if (savedPlaylists) {
          const parsedPlaylists = JSON.parse(savedPlaylists) as Playlist[];
          console.log('Parsed playlists:', parsedPlaylists);
          setPlaylists(parsedPlaylists);
          calculateStats(parsedPlaylists);
        } else {
          console.log('No saved playlists found, initializing with sample data');
          // Initialize with sample data for testing
          const samplePlaylists: Playlist[] = [
            {
              id: '1',
              title: 'Sample Video Playlist',
              description: 'A sample video playlist',
              type: 'video',
              videos: [
                {
                  id: 'v1',
                  title: 'Video 1',
                  url: 'https://youtube.com/watch?v=1',
                  progress: 100,
                  watchTime: 30,
                  completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 'v2',
                  title: 'Video 2',
                  url: 'https://youtube.com/watch?v=2',
                  progress: 100,
                  watchTime: 45,
                  completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
              ],
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Sample Coding Playlist',
              description: 'A sample coding playlist',
              type: 'coding',
              videos: [], // Required empty array for coding playlist
              codingQuestions: [
                {
                  id: 'q1',
                  title: 'Question 1',
                  description: 'Sample question 1',
                  difficulty: 'easy',
                  category: 'algorithms',
                  solved: true,
                  timeSpent: 30,
                  dateSolved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                  dateAdded: new Date().toISOString(),
                  attempts: 1
                },
                {
                  id: 'q2',
                  title: 'Question 2',
                  description: 'Sample question 2',
                  difficulty: 'medium',
                  category: 'data-structures',
                  solved: true,
                  timeSpent: 45,
                  dateSolved: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                  dateAdded: new Date().toISOString(),
                  attempts: 2
                }
              ],
              createdAt: new Date().toISOString()
            }
          ];
          console.log('Setting sample playlists:', samplePlaylists);
          setPlaylists(samplePlaylists);
          calculateStats(samplePlaylists);
          localStorage.setItem('youtubePlaylists', JSON.stringify(samplePlaylists));
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
        toast.error('Failed to load playlists data');
        setPlaylists([]);
        calculateStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Check if user has completed required invites
    const savedInvites = localStorage.getItem('inviteCount');
    const currentInvites = savedInvites ? parseInt(savedInvites, 10) : 0;
    setInviteCount(currentInvites);
    
    // Show popup if not enough invites
    if (currentInvites < 2) {
      setShowWelcomePopup(true);
    }

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtubePlaylists') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Calculate userStats from playlists (copy logic from Profile)
    let joinDate = localStorage.getItem('userJoinDate');
    if (!joinDate) {
      joinDate = new Date().toISOString();
      try { localStorage.setItem('userJoinDate', joinDate); } catch (e) { /* ignore localStorage error */ }
    }
    let lastActivityDate = localStorage.getItem('lastActivityDate');
    if (!lastActivityDate) {
      lastActivityDate = new Date().toISOString().split('T')[0];
      try { localStorage.setItem('lastActivityDate', lastActivityDate); } catch (e) { /* ignore localStorage error */ }
    }
    const today = new Date().toISOString().split('T')[0];
    const isActiveToday = lastActivityDate === today;
    let currentStreak = 0;
    let longestStreak = 0;
    let hoursLearning = 0;
    let completedVideos = 0;
    let totalVideos = 0;
    if (Array.isArray(playlists) && playlists.length > 0) {
      try {
        const totalMinutes = playlists.reduce((total, playlist) => {
          if (!playlist.videos) return total;
          return total + playlist.videos.reduce((playlistTotal, video) => {
            if (!video.watchTime || !video.progress) return playlistTotal;
            return playlistTotal + (video.watchTime * (video.progress || 0) / 100);
          }, 0);
        }, 0);
        hoursLearning = Math.round(totalMinutes / 60 * 10) / 10;
        completedVideos = playlists.reduce((total, playlist) => {
          if (!playlist.videos) return total;
          return total + playlist.videos.filter(video => video.progress >= 100).length;
        }, 0);
        totalVideos = playlists.reduce((total, playlist) => {
          if (!playlist.videos) return total;
          return total + playlist.videos.length;
        }, 0);
        playlists.forEach(playlist => {
          if (playlist.streakData) {
            currentStreak = Math.max(currentStreak, playlist.streakData.currentStreak || 0);
            longestStreak = Math.max(longestStreak, playlist.streakData.longestStreak || 0);
          }
        });
      } catch (e) { /* ignore playlist stats error */ }
    }
    const daysActive = Math.max(1, Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)));
    if (isActiveToday) {
      currentStreak = Math.max(currentStreak, 1);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastActivityDate === yesterdayStr) {
        currentStreak = Math.max(currentStreak, 1);
      } else {
        currentStreak = 0;
      }
    }
    setUserStats({
      daysActive,
      hoursLearning,
      problemsSolved: completedVideos,
      tasksCompleted: completedVideos,
      joinDate,
      currentStreak,
      longestStreak,
      lastActivityDate
    });
  }, [playlists]);

  const calculateStats = (playlistsData: Playlist[]) => {
    let totalWatchTime = 0;
    let totalVideos = 0;
    let completedVideos = 0;
    let totalProgress = 0;
    let totalCodingQuestions = 0;
    let solvedQuestions = 0;
    let questionsThisWeek = 0;
    let totalTimePerQuestion = 0;
    const categoryProgress: Record<string, { solved: number; total: number }> = {};

    playlistsData.forEach(playlist => {
      if (Array.isArray(playlist.videos)) {
        playlist.videos.forEach(video => {
          totalWatchTime += video.watchTime || 0;
          totalVideos++;
          if (video.progress >= 100) {
            completedVideos++;
          }
          totalProgress += video.progress;
        });
      }

      if (playlist.type === 'coding' && Array.isArray(playlist.codingQuestions)) {
        totalCodingQuestions += playlist.codingQuestions.length;
        solvedQuestions += playlist.codingQuestions.filter(q => q.solved).length;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        questionsThisWeek += playlist.codingQuestions.filter(q => 
          q.solved && q.dateSolved && new Date(q.dateSolved) > oneWeekAgo
        ).length;

        const solvedQuestionsWithTime = playlist.codingQuestions.filter(q => q.solved && q.timeSpent);
        totalTimePerQuestion += solvedQuestionsWithTime.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

        playlist.codingQuestions.forEach(q => {
          if (q.category) {
            if (!categoryProgress[q.category]) {
              categoryProgress[q.category] = { solved: 0, total: 0 };
            }
            categoryProgress[q.category].total++;
            if (q.solved) {
              categoryProgress[q.category].solved++;
            }
          }
        });
      }
    });

    const overallProgress = totalVideos > 0 ? totalProgress / totalVideos : 0;
    const dailyAverage = 45;
    const remainingTime = totalWatchTime * (1 - overallProgress / 100);
    const estimatedDays = Math.ceil(remainingTime / dailyAverage);
    
    setStats({
      totalWatchTime,
      totalVideos,
      completedVideos,
      overallProgress,
      estimatedCompletion: `${estimatedDays} days`,
      dailyAverage,
      totalCodingQuestions,
      solvedQuestions,
      questionsThisWeek,
      averageTimePerQuestion: solvedQuestions > 0 ? totalTimePerQuestion / solvedQuestions : 0,
      categoryProgress,
      currentStreak: 0,
      longestStreak: 0
    });
  };

  const playlistChartData = playlists.map(playlist => {
    let timeSpent = 0;
    let contentWatched = 0;

    if (playlist.type === 'video' && playlist.videos) {
      timeSpent = playlist.videos.reduce((sum, v) => sum + (v.watchTime || 0), 0);
      contentWatched = playlist.videos.filter(v => v.progress >= 100).length;
    } else if (playlist.type === 'coding' && playlist.codingQuestions) {
      timeSpent = playlist.codingQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
      contentWatched = playlist.codingQuestions.filter(q => q.solved).length;
    }

    return {
      name: playlist.title,
      'Time Spent (min)': timeSpent,
      'Content Watched': contentWatched,
      type: playlist.type,
    };
  }).filter(item => item['Time Spent (min)'] > 0 || item['Content Watched'] > 0);

  const COLORS = {
  light: {
    bar1: '#8884d8',
    bar2: '#82ca9d',
    text: '#1f2937',
    grid: '#e5e7eb',
    background: '#ffffff',
    tooltipBg: 'rgba(255, 255, 255, 0.9)',
    tooltipBorder: '#e5e7eb',
  },
  dark: {
    bar1: '#a78bfa',
    bar2: '#34d399',
    text: '#f3f4f6',
    grid: '#374151',
    background: 'rgba(30, 41, 59, 0.5)',
    tooltipBg: 'rgba(15, 23, 42, 0.95)',
    tooltipBorder: '#334155',
  }
};

  const progressData = [
    { name: 'Videos', completed: stats.completedVideos, total: stats.totalVideos },
    { name: 'Coding', completed: stats.solvedQuestions, total: stats.totalCodingQuestions }
  ];

  const pieData = [
    { 
      name: 'Completed', 
      value: stats.completedVideos + stats.solvedQuestions, 
      color: document.documentElement.classList.contains('dark') ? '#34d399' : '#10b981' 
    },
    { 
      name: 'Remaining', 
      value: (stats.totalVideos - stats.completedVideos) + (stats.totalCodingQuestions - stats.solvedQuestions), 
      color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' 
    }
  ];

  // --- Most Productive Hours Data ---
  const hoursData = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  playlists.forEach(playlist => {
    if (playlist.type === 'video' && playlist.videos) {
      playlist.videos.forEach(v => {
        if (v.completedAt) {
          const d = new Date(v.completedAt);
          hoursData[d.getHours()].count++;
        }
      });
    } else if (playlist.type === 'coding' && playlist.codingQuestions) {
      playlist.codingQuestions.forEach(q => {
        if (q.dateSolved) {
          const d = new Date(q.dateSolved);
          hoursData[d.getHours()].count++;
        }
      });
    }
  });

  // --- Breaks Taken Card (Placeholder) ---
  // For now, use a static value or session-based value
  const breaksTaken = 5; // Placeholder, replace with persistent value if available
  const breakDuration = 5; // minutes, placeholder
  const totalBreakTime = breaksTaken * breakDuration;

  // --- Pomodoro Break Sessions Data ---
  type PomodoroSession = { id: string; date: string; duration: number; completedPomodoros: number; taskName: string; category: string; };
  let pomodoroSessions: PomodoroSession[] = [];
  try {
    const saved = localStorage.getItem('pomodoroSessions');
    if (saved) pomodoroSessions = JSON.parse(saved);
  } catch (e) {
    // Failed to parse pomodoroSessions from localStorage
    console.error('Failed to parse pomodoroSessions from localStorage', e);
  }

  // Only count sessions as breaks if duration is 5 or 15 (short/long break)
  const breakDurations = [5, 15];
  const breakSessions = pomodoroSessions.filter(s => breakDurations.includes(s.duration));

  // Aggregation state
  const [breakAgg, setBreakAgg] = useState<'day' | 'week' | 'month'>('day');

  // Helper to get start of week (Monday)
  function getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Aggregate break sessions
  let breakData: { label: string; count: number }[] = [];
  if (breakAgg === 'day') {
    const now = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
    breakData = days.map(date => ({
      label: date,
      count: breakSessions.filter(s => s.date.slice(0, 10) === date).length
    }));
  } else if (breakAgg === 'week') {
    // Last 12 weeks
    const now = new Date();
    const weeks: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const weekStart = getWeekStart(d).toISOString().slice(0, 10);
      weeks.push(weekStart);
    }
    breakData = weeks.map(weekStart => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return {
        label: `${weekStart} - ${weekEnd.toISOString().slice(0, 10)}`,
        count: breakSessions.filter(s => {
          const d = new Date(s.date);
          return d >= new Date(weekStart) && d <= weekEnd;
        }).length
      };
    });
  } else if (breakAgg === 'month') {
    // Last 12 months
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    breakData = months.map(month => ({
      label: month,
      count: breakSessions.filter(s => s.date.slice(0, 7) === month).length
    }));
  }

  const handleSkipWelcome = () => {
    setShowWelcomePopup(false);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

  const [copiedLinks, setCopiedLinks] = useState<number[]>([]);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState<number | null>(null);

  // Generate unique invite links for each step
  const inviteLinks = [
    `${window.location.origin}?ref=${btoa('invite1-' + (localStorage.getItem('userId') || 'user'))}`,
    `${window.location.origin}?ref=${btoa('invite2-' + (localStorage.getItem('userId') || 'user'))}`
  ];

  const handleCopyLink = async (linkIndex: number) => {
    try {
      await navigator.clipboard.writeText(inviteLinks[linkIndex]);
      
      // Mark this link as copied
      const newCopiedLinks = [...new Set([...copiedLinks, linkIndex])];
      setCopiedLinks(newCopiedLinks);
      
      // Update invite count if this is a new copy
      if (!copiedLinks.includes(linkIndex)) {
        const newCount = Math.min(inviteCount + 1, 2);
        setInviteCount(newCount);
        localStorage.setItem('inviteCount', newCount.toString());
        
        if (newCount >= 2) {
          toast.success('🎉 Dashboard unlocked! Enjoy your full access!');
          setTimeout(() => setShowWelcomePopup(false), 1500);
        } else {
          toast.success('Link copied! Now share it with a friend!');
        }
      }
      
      // Show tooltip for 2 seconds
      setShowCopiedTooltip(linkIndex);
      setTimeout(() => setShowCopiedTooltip(null), 2000);
      
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Loading dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lock the main content if not enough invites
  const isLocked = inviteCount < 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-200 relative">
      {/* Overlay and popup */}
      {isLocked && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button 
              onClick={handleSkipWelcome}
              className={`absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ${inviteCount < 2 ? 'hidden' : ''}`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative shadow-lg">
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800">
                  {inviteCount}/2
                </div>
                {inviteCount >= 2 ? (
                  <div className="text-4xl">🎉</div>
                ) : (
                  <Lock className="w-12 h-12 text-white" />
                )}
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                {inviteCount >= 2 ? '🎉 Dashboard Unlocked!' : '🔒 Unlock Your Dashboard'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 px-2">
                {inviteCount >= 2 
                  ? 'Thanks for inviting your friends! Enjoy your full dashboard access.'
                  : 'Share your invite link to unlock all features and earn rewards!'}
              </p>
              
              {/* Progress Bar with Glow Effect */}
              <div className="relative w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6 mx-auto max-w-xs">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                  style={{ width: `${(inviteCount / 2) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-300 opacity-30 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {inviteCount}/2 invites completed
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {/* Invite Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-800/30 p-5 rounded-xl border border-blue-100 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 text-lg">
                    <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    🎉 Double the Friends, Double the Fun!
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    We've made two personal invite links just for you. Share both with your friends — and we'll know it's YOU who brought them!
                  </p>
                  
                  {/* Step 1 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                        1
                      </div>
                      <h5 className="font-medium text-slate-800 dark:text-slate-200">Copy Link 1 → Send to your first friend</h5>
                    </div>
                    <div className="flex items-center gap-2 pl-9">
                      <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 truncate">
                        {inviteLinks[0]}
                      </div>
                      <Tooltip open={showCopiedTooltip === 0}>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => handleCopyLink(0)}
                            size="sm"
                            className={`shrink-0 ${copiedLinks.includes(0) ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                          >
                            {copiedLinks.includes(0) ? '✓ Copied!' : '📋 Copy Link 1'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-green-500 text-white border-0">
                          {copiedLinks.length === 0 
                            ? 'Great! Now send this to your first friend!'
                            : 'Link 1 copied! Send it to a friend!'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-medium ${
                        copiedLinks.length > 0 
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      }`}>
                        2
                      </div>
                      <h5 className={`font-medium ${
                        copiedLinks.length > 0 
                          ? 'text-slate-800 dark:text-slate-200' 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {copiedLinks.length > 0 
                          ? 'Copy Link 2 → Send to your second friend'
                          : 'Complete Step 1 to unlock Link 2'}
                      </h5>
                    </div>
                    {copiedLinks.length > 0 && (
                      <div className="flex items-center gap-2 pl-9">
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 truncate">
                          {inviteLinks[1]}
                        </div>
                        <Tooltip open={showCopiedTooltip === 1}>
                          <TooltipTrigger asChild>
                            <Button 
                              onClick={() => handleCopyLink(1)}
                              size="sm"
                              className={`shrink-0 ${copiedLinks.includes(1) ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                              disabled={copiedLinks.length === 0}
                            >
                              {copiedLinks.includes(1) ? '✓ Copied!' : '📋 Copy Link 2'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-green-500 text-white border-0">
                            {copiedLinks.length === 1 
                              ? 'One more to go! Share with another friend!'
                              : 'Link 2 copied! Thanks for sharing!'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  
                  {/* Rewards Info */}
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Info className="w-3 h-3" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">🎁 Earn Rewards!</p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Each link is unique to track your invites</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Get 100 bonus coins per friend who joins</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Unlock exclusive badges and achievements</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {inviteCount < 2 && (
                    <Button 
                      onClick={handleSkipWelcome}
                      variant="outline" 
                      className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Remind me later
                    </Button>
                  )}
                  <Button 
                    onClick={() => setShowWelcomePopup(false)}
                    className={`${inviteCount >= 2 ? 'w-full' : ''} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20`}
                  >
                    {inviteCount >= 2 ? 'Start Exploring' : 'Continue to Dashboard'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-6 py-8">
        {/* Responsive row: Heatmap (left, wider) and Active Day Card (right) at the very top */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full">
          {/* Heatmap - left, wider on desktop */}
          <div className="md:w-2/3 w-full flex justify-center items-center">
            <div className="w-full max-w-2xl">
              <ActivityHeatmap playlists={playlists} />
            </div>
          </div>
          {/* Active Day Card - right */}
          <div className="md:w-1/3 w-full flex justify-center items-center">
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl animate-fade-in w-full max-w-xs shadow-lg dark:shadow-slate-900/30 border border-white/20 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:dark:shadow-slate-800/50">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-70 -z-10" />
              
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 transition-colors">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Activity</span>
                    {userStats.currentStreak >= 3 && (
                      <span className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-pulse border border-amber-200/30 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{userStats.currentStreak}d streak</span>
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 flex flex-col items-center gap-4 pt-0">
                <div className="relative flex items-center justify-center my-2">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="block">
                    {/* Background circle */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-slate-200 dark:text-slate-700" 
                      strokeWidth="8" 
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none"
                      stroke="url(#active-gradient)"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - Math.min(1, userStats.daysActive / 30))}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="active-gradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    
                    {/* Inner glow */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="38" 
                      fill="url(#inner-glow)" 
                      className="opacity-20"
                    />
                    <defs>
                      <radialGradient id="inner-glow" cx="50%" cy="50%" r="100%" fx="30%" fy="30%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 transition-colors">
                      {userStats.daysActive}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Active Days
                    </span>
                  </div>
                </div>
                
                <div className="w-full text-center">
                  <span className="text-sm font-medium bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent px-3 py-1 rounded-full inline-flex items-center">
                    {userStats.currentStreak >= 7
                      ? '🔥 Amazing! Week-long streak!'
                      : userStats.currentStreak >= 3
                        ? '🔥 Keep your streak going!'
                        : userStats.daysActive >= 3
                          ? '✨ Great start! Stay consistent.'
                          : '🚀 Start your learning journey!'}
                  </span>
                </div>
                
                <div className="w-full flex flex-col items-center mt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-200/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                      <Flame className="w-6 h-6 text-amber-500 dark:text-amber-400 animate-pulse" />
                    </span>
                    <div className="text-left">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                          {userStats.currentStreak}
                        </span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">
                          day{userStats.currentStreak !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Current streak
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ml-1">
                          <Info className="w-4 h-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-100 text-xs p-2 border-slate-700 shadow-lg">
                        <p className="font-medium">Current Streak</p>
                        <p className="text-slate-300">Consecutive days you've been active. Keep it going for rewards!</p>
                        <div className="mt-1 pt-1 border-t border-slate-700">
                          <div className="flex items-center gap-1 text-amber-400">
                            <Flame className="w-3 h-3" />
                            <span className="text-xs font-medium">+{userStats.currentStreak}x streak bonus</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-400">Longest streak:</span>
                    <span className="text-base font-semibold text-black">{userStats.longestStreak} days</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-100 w-full">
                  {[...Array(7)].map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - index));
                    const dateStr = date.toISOString().split('T')[0];
                    const isActive = userStats.lastActivityDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    return (
                      <div 
                        key={index}
                        className="flex-1 flex flex-col items-center gap-1 group"
                      >
                        <div 
                          className={`w-full h-8 rounded-lg transition-all duration-300 flex items-center justify-center relative
                            ${isActive 
                              ? 'bg-gradient-to-b from-blue-500/30 to-indigo-500/30 border border-blue-500/40'
                              : 'bg-gray-200/50'
                            } ${isToday ? 'ring-2 ring-blue-500/40' : ''}`}
                        >
                          {isActive && <Flame className="w-4 h-4 text-orange-400 animate-pulse absolute left-1 top-1" />}
                        </div>
                        <span className={`text-[10px] text-gray-400 ${isToday ? 'font-medium text-black' : ''}`}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Video Content Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Videos"
            value={stats.totalVideos.toString()}
            icon={Play}
            color="blue"
            delay="100"
          />
          <StatsCard
            title="Completed"
            value={stats.completedVideos.toString()}
            icon={Target}
            color="green"
            delay="200"
          />
          <StatsCard
            title="Watch Time"
            value={`${Math.round(stats.totalWatchTime)} min`}
            icon={Clock}
            color="purple"
            delay="300"
          />
          <StatsCard
            title="Progress"
            value={`${Math.round(stats.overallProgress)}%`}
            icon={TrendingUp}
            color="orange"
            delay="400"
          />
          {/* New Breaks Card */}
          <StatsCard
            title="Breaks Taken"
            value={`${breaksTaken} (${totalBreakTime} min)`}
            icon={Calendar}
            color="orange"
            delay="500"
          />
        </div>

        <Card className="mb-8 bg-white/60 dark:bg-slate-800/70 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 shadow-lg dark:shadow-slate-900/30 transition-all hover:shadow-xl hover:dark:shadow-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Playlist Stats
            </CardTitle>
            <CardDescription>Breakdown of time spent and content watched for each playlist.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="hide-scrollbar"
            >
              <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
              `}</style>
              <div style={{ minWidth: Math.max(playlistChartData.length * 120, 400) }}>
                <ReResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={playlistChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                    <ReXAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      interval={0} 
                      tick={{ 
                        fontSize: 12, 
                        fill: 'currentColor',
                        className: 'text-slate-500 dark:text-slate-400 text-xs'
                      }} 
                    />
                    <ReYAxis 
                      tick={{ 
                        fill: 'currentColor',
                        className: 'text-slate-500 dark:text-slate-400 text-xs'
                      }}
                    />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReBar 
                      dataKey="Time Spent (min)" 
                      fill={document.documentElement.classList.contains('dark') ? COLORS.dark.bar1 : COLORS.light.bar1}
                      radius={[4, 4, 0, 0]}
                      className="transition-colors duration-200"
                    />
                    <ReBar 
                      dataKey="Content Watched" 
                      fill={document.documentElement.classList.contains('dark') ? COLORS.dark.bar2 : COLORS.light.bar2}
                      radius={[4, 4, 0, 0]}
                      className="transition-colors duration-200"
                    />
                  </ReBarChart>
                </ReResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white/60 dark:bg-slate-800/70 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 shadow-lg dark:shadow-slate-900/30 transition-all hover:shadow-xl hover:dark:shadow-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Most Productive Hours
            </CardTitle>
            <CardDescription>When you are most active (videos watched or problems solved).</CardDescription>
          </CardHeader>
          <CardContent>
            <ReResponsiveContainer width="100%" height={220}>
              <ReBarChart data={hoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                <ReXAxis 
                  dataKey="hour" 
                  tickFormatter={h => `${h}:00`} 
                  tick={{
                    fill: 'currentColor',
                    className: 'text-slate-500 dark:text-slate-400 text-xs'
                  }}
                />
                <ReYAxis 
                  allowDecimals={false} 
                  tick={{
                    fill: 'currentColor',
                    className: 'text-slate-500 dark:text-slate-400 text-xs'
                  }}
                />
                <ReTooltip 
                  contentStyle={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? COLORS.dark.tooltipBg : COLORS.light.tooltipBg,
                    borderColor: document.documentElement.classList.contains('dark') ? COLORS.dark.tooltipBorder : COLORS.light.tooltipBorder,
                    borderRadius: '0.5rem',
                    color: document.documentElement.classList.contains('dark') ? COLORS.dark.text : COLORS.light.text,
                  }}
                  formatter={v => [`${v} activities`, 'Count']}
                />
                <ReBar 
                  dataKey="count" 
                  fill={document.documentElement.classList.contains('dark') ? '#60a5fa' : '#3b82f6'}
                  radius={[4, 4, 0, 0]}
                  className="transition-colors duration-200"
                />
              </ReBarChart>
            </ReResponsiveContainer>
          </CardContent>
        </Card>

        {/* New Graphs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-6 h-6" />
                Break Sessions ({breakAgg === 'day' ? 'Per Day (30d)' : breakAgg === 'week' ? 'Per Week (12w)' : 'Per Month (12m)'})
              </CardTitle>
              <CardDescription>
                Number of Pomodoro break sessions per {breakAgg}.
              </CardDescription>
              <div className="mt-2">
                <Select value={breakAgg} onValueChange={v => setBreakAgg(v as 'day' | 'week' | 'month')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Per Day (30d)</SelectItem>
                    <SelectItem value="week">Per Week (12w)</SelectItem>
                    <SelectItem value="month">Per Month (12m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ReResponsiveContainer width="100%" height={220}>
                <ReBarChart data={breakData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                  <ReXAxis 
                    dataKey="label" 
                    tickFormatter={l => breakAgg === 'day' ? l.slice(5) : l} 
                    interval={breakAgg === 'day' ? 4 : 0}
                    tick={{
                      fill: 'currentColor',
                      className: 'text-slate-500 dark:text-slate-400 text-xs',
                      angle: breakAgg === 'day' ? 0 : -45,
                      textAnchor: breakAgg === 'day' ? 'middle' : 'end'
                    }}
                  />
                  <ReYAxis 
                    allowDecimals={false}
                    tick={{
                      fill: 'currentColor',
                      className: 'text-slate-500 dark:text-slate-400 text-xs'
                    }}
                  />
                  <ReTooltip 
                    contentStyle={{
                      backgroundColor: document.documentElement.classList.contains('dark') ? COLORS.dark.tooltipBg : COLORS.light.tooltipBg,
                      borderColor: document.documentElement.classList.contains('dark') ? COLORS.dark.tooltipBorder : COLORS.light.tooltipBorder,
                      borderRadius: '0.5rem',
                      color: document.documentElement.classList.contains('dark') ? COLORS.dark.text : COLORS.light.text,
                    }}
                    formatter={v => [`${v} sessions`, 'Count']}
                  />
                  <ReBar 
                    dataKey="count" 
                    fill={document.documentElement.classList.contains('dark') ? '#fb7185' : '#f43f5e'}
                    radius={[4, 4, 0, 0]}
                    className="transition-colors duration-200"
                  />
                </ReBarChart>
              </ReResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Progress Charts */}
        <div className="mb-8">
          {playlists.length > 0 ? (
            <NewProgressTabs playlists={playlists} />
          ) : (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Play className="w-12 h-12 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No Content Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Start adding videos and playlists to track your progress</p>
                  <Button variant="outline" className="mt-2">
                    Add Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
