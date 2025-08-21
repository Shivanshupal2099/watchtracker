import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Code, CheckCircle, User, Trophy, Target, Zap, Moon, Sun, TrendingUp, TrendingDown, Star, Crown, Medal, Flame, Rocket, Brain, BookOpen, Award, AlertCircle, Info, Instagram, Facebook, Twitter, MessageCircle, Share2, Globe, Download, Share, Bell, Settings, Users, BarChart3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StreakTracker from '@/components/StreakTracker';
import { Playlist, Video } from '@/types/playlist';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { usePlaylists } from '@/context/PlaylistContext';
import html2canvas from 'html2canvas';

// CSS styles
const styles = `
  .glass-effect {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid #e5e7eb;
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  .blink-red {
    animation: blinkRed 1s steps(2, start) infinite;
  }
  @keyframes blinkRed {
    0%, 100% { color: #ef4444; filter: drop-shadow(0 0 6px #ef4444); }
    50% { color: #b91c1c; filter: drop-shadow(0 0 12px #b91c1c); }
  }
`;

// Types
interface UserStats {
  daysActive: number;
  hoursLearning: number;
  problemsSolved: number;
  tasksCompleted: number;
  joinDate: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

interface Ranking {
  branch: number;
  section: number;
  college: number;
  global: number;
  metrics: {
    learningTime: number;
    activeDays: number;
    completionRate: number;
  };
  trends: {
    branch: number;
    section: number;
    college: number;
    global: number;
  };
  achievements: {
    isTopPerformer: boolean;
    isConsistent: boolean;
    isFastLearner: boolean;
    isStreakMaster: boolean;
    isKnowledgeSeeker: boolean;
    isRisingStar: boolean;
    isWeekendWarrior: boolean;
  };
  progress: {
    weekly: {
      learningTime: number;
      activeDays: number;
      completionRate: number;
    };
    monthly: {
      learningTime: number;
      activeDays: number;
      completionRate: number;
    };
  };
}

// Update ProgressCard interface
interface ProgressCard {
  platformName: string;
  totalProgress: {
    todos: number;
    watchTime: number;
    videosCompleted: number;
    problemsSolved: number;
    streak: number;
    coins: number;
  };
  monthlyProgress: {
    todos: number;
    watchTime: number;
    videosCompleted: number;
    problemsSolved: number;
    streak: number;
    coins: number;
  };
  achievements: {
    level: string;
    badges: string[];
  };
  theme?: 'light' | 'dark';
}

const Profile = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { playlists } = usePlaylists();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityHeatmap, setShowActivityHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState<'badge' | 'rank' | 'progress'>('badge');
  const [userStats, setUserStats] = useState<UserStats>({
    daysActive: 0,
    hoursLearning: 0,
    problemsSolved: 0,
    tasksCompleted: 0,
    joinDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: new Date().toISOString().split('T')[0]
  });
  
  const [showProgressCard, setShowProgressCard] = useState(false);
  const [progressCard, setProgressCard] = useState<ProgressCard | null>(null);

  // Mock data for other users - In a real app, this would come from an API
  const mockUsers = [
    { learningTime: 120, activeDays: 45, completionRate: 85 },
    { learningTime: 95, activeDays: 38, completionRate: 78 },
    { learningTime: 150, activeDays: 50, completionRate: 92 },
    { learningTime: 80, activeDays: 30, completionRate: 75 },
    { learningTime: 200, activeDays: 60, completionRate: 95 },
  ];

  const calculateRank = (userMetrics: { learningTime: number; activeDays: number; completionRate: number }, allUsers: typeof mockUsers) => {
    // Calculate a weighted score based on learning time (50%), active days (30%), and completion rate (20%)
    const calculateScore = (metrics: typeof userMetrics) => {
      const maxLearningTime = Math.max(...allUsers.map(u => u.learningTime), userMetrics.learningTime);
      const maxActiveDays = Math.max(...allUsers.map(u => u.activeDays), userMetrics.activeDays);
      const maxCompletionRate = Math.max(...allUsers.map(u => u.completionRate), userMetrics.completionRate);

      const learningTimeScore = (metrics.learningTime / maxLearningTime) * 50;
      const activeDaysScore = (metrics.activeDays / maxActiveDays) * 30;
      const completionRateScore = (metrics.completionRate / maxCompletionRate) * 20;

      return learningTimeScore + activeDaysScore + completionRateScore;
    };

    const userScore = calculateScore(userMetrics);
    const allScores = [...allUsers.map(u => calculateScore(u)), userScore].sort((a, b) => b - a);
    return allScores.indexOf(userScore) + 1;
  };

  const calculateTrend = (currentRank: number, previousRank: number) => {
    if (previousRank === 0) return 0;
    return previousRank - currentRank; // Positive means improvement, negative means decline
  };

  const getAchievementBadges = (metrics: Ranking['metrics'], rank: number, trends: Ranking['trends']) => {
    return {
      isTopPerformer: rank <= 3,
      isConsistent: metrics.activeDays >= 30 && metrics.completionRate >= 80,
      isFastLearner: metrics.learningTime >= 100 && metrics.completionRate >= 90,
      isStreakMaster: metrics.activeDays >= 7 && metrics.completionRate >= 95,
      isKnowledgeSeeker: metrics.learningTime >= 50 && metrics.completionRate >= 85,
      isRisingStar: trends.global > 5, // Improved by more than 5 places
      isWeekendWarrior: metrics.activeDays >= 5 && metrics.completionRate >= 75
    };
  };

  const getAchievementIcon = (achievement: keyof Ranking['achievements']) => {
    switch (achievement) {
      case 'isTopPerformer':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'isConsistent':
        return <Medal className="w-4 h-4 text-blue-500" />;
      case 'isFastLearner':
        return <Star className="w-4 h-4 text-purple-500" />;
      case 'isStreakMaster':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'isKnowledgeSeeker':
        return <Brain className="w-4 h-4 text-indigo-500" />;
      case 'isRisingStar':
        return <Rocket className="w-4 h-4 text-pink-500" />;
      case 'isWeekendWarrior':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getAchievementTitle = (achievement: keyof Ranking['achievements']) => {
    switch (achievement) {
      case 'isTopPerformer': return '🏆 Top Performer';
      case 'isConsistent': return '🎯 Consistent Learner';
      case 'isFastLearner': return '⚡ Fast Learner';
      case 'isStreakMaster': return '🔥 Streak Master';
      case 'isKnowledgeSeeker': return '🧠 Knowledge Seeker';
      case 'isRisingStar': return '🚀 Rising Star';
      case 'isWeekendWarrior': return '📚 Weekend Warrior';
      default: return '';
    }
  };

  // Helper function for trend icon
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  // Add style element to inject CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle theme mounting and initialization
  useEffect(() => {
    try {
      // Set initial theme if not set
      const currentTheme = localStorage.getItem('theme') || 'light';
      if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
        setTheme(currentTheme);
      }
      setMounted(true);
    } catch (err) {
      console.error('Error initializing theme:', err);
      setError('Failed to initialize theme');
    }
  }, [setTheme]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get or initialize join date
        let joinDate = localStorage.getItem('userJoinDate');
        if (!joinDate) {
          joinDate = new Date().toISOString();
          try {
            localStorage.setItem('userJoinDate', joinDate);
          } catch (storageError) {
            console.error('Error saving join date:', storageError);
          }
        }

        // Get or initialize last activity date
        let lastActivityDate = localStorage.getItem('lastActivityDate');
        if (!lastActivityDate) {
          lastActivityDate = new Date().toISOString().split('T')[0];
          try {
            localStorage.setItem('lastActivityDate', lastActivityDate);
          } catch (storageError) {
            console.error('Error saving last activity date:', storageError);
          }
        }

        // Calculate streaks
        const today = new Date().toISOString().split('T')[0];
        const isActiveToday = lastActivityDate === today;
        let currentStreak = 0;
        let longestStreak = 0;

        // Calculate stats from playlists
        let hoursLearning = 0;
        let completedVideos = 0;
        let totalVideos = 0;

        // Ensure playlists is an array and has valid data
        if (Array.isArray(playlists) && playlists.length > 0) {
          try {
            // Calculate total hours from video progress
            const totalMinutes = playlists.reduce((total: number, playlist: Playlist) => {
              if (!playlist.videos) return total;
              return total + playlist.videos.reduce((playlistTotal: number, video: Video) => {
                if (!video.watchTime || !video.progress) return playlistTotal;
                return playlistTotal + (video.watchTime * (video.progress || 0) / 100);
              }, 0);
            }, 0);

            hoursLearning = Math.round(totalMinutes / 60 * 10) / 10;
            completedVideos = playlists.reduce((total: number, playlist: Playlist) => {
              if (!playlist.videos) return total;
              return total + playlist.videos.filter((video: Video) => video.progress >= 100).length;
            }, 0);
            totalVideos = playlists.reduce((total: number, playlist: Playlist) => {
              if (!playlist.videos) return total;
              return total + playlist.videos.length;
            }, 0);

            // Calculate streaks from playlists
            playlists.forEach((playlist: Playlist) => {
              if (playlist.streakData) {
                currentStreak = Math.max(currentStreak, playlist.streakData.currentStreak || 0);
                longestStreak = Math.max(longestStreak, playlist.streakData.longestStreak || 0);
              }
            });
          } catch (error) {
            console.error('Error processing playlist data:', error);
            // Continue with default values if there's an error processing playlists
          }
        }

        // Calculate days active
        const daysActive = Math.max(1, Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)));

        // Update streaks based on today's activity
        if (isActiveToday) {
          currentStreak = Math.max(currentStreak, 1);
        } else {
          // Check if last activity was yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (lastActivityDate === yesterdayStr) {
            currentStreak = Math.max(currentStreak, 1);
          } else {
            currentStreak = 0;
          }
        }

        // Update user stats
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

        // Calculate and update rankings
        const userMetrics = {
          learningTime: userStats.hoursLearning,
          activeDays: userStats.daysActive,
          completionRate: userStats.problemsSolved > 0 ? Math.round((userStats.tasksCompleted / userStats.problemsSolved) * 100) : 0
        };

        // Calculate rankings and update state
        const branchRank = calculateRank(userMetrics, mockUsers);
        const sectionRank = calculateRank(userMetrics, mockUsers);
        const collegeRank = calculateRank(userMetrics, mockUsers);
        const globalRank = calculateRank(userMetrics, mockUsers);

        const trends = {
          branch: calculateTrend(branchRank, branchRank + 1),
          section: calculateTrend(sectionRank, sectionRank + 1),
          college: calculateTrend(collegeRank, collegeRank + 1),
          global: calculateTrend(globalRank, globalRank + 1)
        };

        const achievements = getAchievementBadges(userMetrics, globalRank, trends);

      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [playlists]);

  // Mock rank history data for the trend graph
  const rankHistory = [
    { day: 'Mon', rank: 24 },
    { day: 'Tue', rank: 20 },
    { day: 'Wed', rank: 18 },
    { day: 'Thu', rank: 15 },
    { day: 'Fri', rank: 12 },
    { day: 'Sat', rank: 10 },
    { day: 'Sun', rank: 8 },
  ];

  // Calculate rank improvement
  const rankImprovement = rankHistory[0].rank - rankHistory[rankHistory.length - 1].rank;

  // Calculate achievement level based on user stats
  const achievementLevel = userStats.hoursLearning >= 100 ? 'Grand Master' :
                         userStats.hoursLearning >= 50 ? 'Master' :
                         userStats.hoursLearning >= 10 ? 'Advanced' :
                         userStats.hoursLearning >= 5 ? 'Intermediate' : 'Beginner';

  const achievementColor = achievementLevel === 'Grand Master' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                          achievementLevel === 'Master' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                          achievementLevel === 'Advanced' ? 'bg-gradient-to-r from-green-600 to-blue-600' :
                          achievementLevel === 'Intermediate' ? 'bg-gradient-to-r from-yellow-500 to-green-600' :
                          'bg-gradient-to-r from-gray-600 to-blue-400';

  // Theme-specific styles
  const bgGradient = theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-white';
  const cardBg = theme === 'dark' ? 'bg-gray-800/95 border-gray-700/60 shadow-lg' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const textMuted = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const headerGradient = theme === 'dark' ? 'bg-gray-900/95' : 'bg-white';
  const cardHoverEffect = 'transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg';
  const statCardGradient = theme === 'dark' ? 'bg-gray-800/95' : 'bg-white';
  const rankCardGradient = theme === 'dark' ? 'bg-gray-800/95' : 'bg-white';
  const rankCardHover = theme === 'dark' 
    ? 'relative transition-all duration-300 border border-gray-700/60 shadow-lg rounded-lg bg-gray-800/95' 
    : 'relative transition-all duration-300 border border-gray-200 shadow-sm rounded-lg bg-white';

  // Remove the allAwards array and keep only the basic achievements
  const basicAchievements = [
    {
      condition: userStats.hoursLearning >= 10,
      icon: Trophy,
      title: 'Dedicated Learner',
      description: 'Completed 10+ hours of learning'
    },
    {
      condition: userStats.problemsSolved >= 5,
      icon: CheckCircle,
      title: 'Goal Crusher',
      description: 'Completed 5+ learning goals'
    },
    {
      condition: userStats.daysActive >= 7,
      icon: Calendar,
      title: 'Consistency Master',
      description: '7+ days of active learning'
    }
  ];

  // Update generateProgressCard function with enhanced dark theme support
  const generateProgressCard = () => {
    const cardData: ProgressCard = {
      platformName: "Learning Platform",
      totalProgress: {
        todos: userStats.tasksCompleted,
        watchTime: userStats.hoursLearning,
        videosCompleted: userStats.problemsSolved,
        problemsSolved: userStats.problemsSolved,
        streak: userStats.currentStreak,
        coins: Math.round(userStats.hoursLearning * 100)
      },
      monthlyProgress: {
        todos: Math.round(userStats.tasksCompleted * 0.3),
        watchTime: Math.round(userStats.hoursLearning * 0.3),
        videosCompleted: Math.round(userStats.problemsSolved * 0.3),
        problemsSolved: Math.round(userStats.problemsSolved * 0.3),
        streak: Math.min(userStats.currentStreak, 30),
        coins: Math.round(userStats.hoursLearning * 20)
      },
      achievements: {
        level: achievementLevel,
        badges: basicAchievements
          .filter(achievement => achievement.condition)
          .map(achievement => achievement.title)
      },
      theme: theme === 'dark' ? 'dark' : 'light'
    };
    setProgressCard(cardData);
    shareProgressCard(cardData);
  };

  // Update shareProgressCard function
  const shareProgressCard = async (cardData?: ProgressCard) => {
    if (cardData) {
      setProgressCard(cardData);
    }
    
    try {
      const cardElement = document.getElementById('progress-card');
      if (!cardElement) return;

      const canvas = await html2canvas(cardElement, {
        scale: 2, // Higher quality
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL('image/png');
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.download = `learning-progress-${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();

      // Share on social media
      if (navigator.share && progressCard) {
        await navigator.share({
          title: 'My Learning Progress',
          text: `Check out my learning progress on ${cardData?.platformName || 'Learning Platform'}! I'm at ${cardData?.achievements.level || 'Beginner'} level with ${cardData?.totalProgress.coins || 0} coins!`,
          files: [new File([await (await fetch(image)).blob()], 'learning-progress.png', { type: 'image/png' })]
        });
      }
    } catch (error) {
      console.error('Error sharing progress card:', error);
    }
  };

  // Add Google Fonts link for DM Serif Display
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital,wght@0,400;1,400&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-foreground">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgGradient}`} style={{ fontFamily: 'DM Serif Display, serif' }}>
      {/* Enhanced Header Section */}
      <div className={`relative border-b ${theme === 'dark' ? 'border-gray-700/60' : 'border-gray-200/50'} shadow-2xl mt-8 md:mt-12 ${headerGradient} backdrop-blur-sm transition-all duration-500`}>
        <div className="container mx-auto px-4 py-0">
          <div className={`${cardBg} rounded-xl p-4 transition-all duration-300 ${cardHoverEffect} relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-6 md:gap-8">
                {/* Enhanced Profile Section */}
                <div className="relative group flex-1 w-full">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl transition-all duration-300 group-hover:scale-105 relative z-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                          <User className="w-10 h-10" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-20">
                        <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                        <span>Pro</span>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="text-center md:text-left mt-2">
                      <div className="flex flex-col items-center md:items-start gap-1">
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-900 dark:from-white dark:to-gray-200">
                          Your Profile
                        </h1>
                        <p className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Active Now
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                          Joined {new Date(userStats.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Flame className="w-4 h-4 mr-1.5 text-orange-400" />
                          {userStats.currentStreak} day streak
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
                          <Code className="w-3.5 h-3.5 mr-1.5" />
                          Developer
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors">
                          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                          Learner
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                

                {/* Animated Coin Jar */}
                <div className="w-[280px]">
                  <div className="flex flex-col gap-4">
                    <div className="relative group">
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-all duration-500 blur-xl"></div>
                      
                      <Card className="relative overflow-hidden border border-gray-100 dark:border-gray-700/60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-300 mb-1">Learning Coins</p>
                              <div className="flex items-end gap-1.5">
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-500">
                                  {Math.round(userStats.hoursLearning * 100).toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">coins</span>
                              </div>
                            </div>
                            <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center border border-blue-100 dark:border-blue-800/50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {Math.round((userStats.hoursLearning * 20) / (userStats.hoursLearning * 100) * 100) || 0}% this month
                            </div>
                          </div>
                          
                          {/* Premium Animated Jar */}
                          <div className="relative h-56 w-full mt-6 mb-2 flex items-center justify-center">
                            {/* Jar glass container with 3D effect */}
                            <div className="relative w-40 h-full">
                              {/* Jar glass reflection - Enhanced for dark mode */}
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/15 dark:to-transparent backdrop-blur-[1px] z-10 opacity-80 dark:opacity-60" 
                                   style={{
                                     clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 30% 100%, 0% 80%)',
                                     borderRadius: '50% 50% 1rem 1rem / 60% 60% 40% 40%',
                                     transition: 'all 0.3s ease'
                                   }}>
                              </div>
                              
                              {/* Jar outer glass - Enhanced for dark mode */}
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/50 to-transparent dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-[2px] border-2 border-white/40 dark:border-gray-600/40 shadow-[inset_0_8px_32px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 group-hover:shadow-[inset_0_12px_40px_0_rgba(255,255,255,0.5)] dark:group-hover:shadow-[inset_0_12px_40px_0_rgba(0,0,0,0.5)]">
                                {/* Coins fill with 3D effect - Enhanced for dark mode */}
                                <div 
                                  className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out overflow-hidden"
                                  style={{
                                    height: `${Math.min(100, Math.max(10, (userStats.hoursLearning * 100) / 2000 * 100))}%`,
                                    background: theme === 'dark' 
                                      ? 'linear-gradient(145deg, #f59e0b 0%, #d97706 30%, #b45309 70%, #7c2d12 100%)' 
                                      : 'linear-gradient(145deg, #f59e0b 0%, #d97706 30%, #b45309 70%, #92400e 100%)',
                                    borderRadius: '0 0 1rem 1rem',
                                    boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.15)'
                                  }}
                                >
                                  {/* Individual coins with enhanced dark mode visibility */}
                                  {[...Array(30)].map((_, i) => {
                                    const coinSize = Math.random() * 10 + 10;
                                    const coinColor = theme === 'dark' 
                                      ? `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 20}%)` 
                                      : `hsl(${40 + Math.random() * 10}, 100%, ${50 + Math.random() * 10}%)`;
                                    
                                    return (
                                    <div 
                                      key={i}
                                      className="absolute rounded-full shadow-md transition-all duration-500"
                                      style={{
                                        width: `${coinSize}px`,
                                        height: '4px',
                                        left: `${10 + Math.random() * 80}%`,
                                        bottom: `${Math.random() * 100}%`,
                                        transform: `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`,
                                        opacity: theme === 'dark' ? 0.9 : 0.8,
                                        background: coinColor,
                                        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`,
                                        boxShadow: theme === 'dark' 
                                          ? '0 0 8px rgba(255, 215, 0, 0.6)' 
                                          : '0 0 5px rgba(0, 0, 0, 0.2)',
                                        animation: `coinFloat ${3 + Math.random() * 4}s infinite ease-in-out`
                                      }}
                                    />
                                  );})}
                                  
                                  {/* Coin shine effect */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/30 to-transparent opacity-70"></div>
                                </div>
                                
                                {/* Water surface effect */}
                                <div 
                                  className="absolute left-0 right-0 w-full h-4 bg-gradient-to-b from-yellow-300/40 to-transparent"
                                  style={{
                                    top: `${Math.min(100, Math.max(10, (userStats.hoursLearning * 100) / 2000 * 100)) - 5}%`,
                                    transition: 'top 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                  }}
                                ></div>
                              </div>
                              
                              {/* Jar neck */}
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-t-2xl border-2 border-b-0 border-white/40 dark:border-gray-600/30 z-10">
                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 dark:from-amber-900 dark:via-amber-800 dark:to-amber-900 rounded-full"></div>
                              </div>
                              
                              {/* Jar rim */}
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-2 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 dark:from-amber-700 dark:via-amber-600 dark:to-amber-700 rounded-full shadow-md z-20">
                                <div className="absolute inset-0.5 bg-gradient-to-r from-amber-200 to-amber-100 dark:from-amber-600 dark:to-amber-500 rounded-full"></div>
                              </div>
                              
                              {/* Coin count label */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/80 rounded-full blur-md opacity-70"></div>
                                  <span className="relative text-xs font-bold text-amber-800 dark:text-amber-200 bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-900/80 dark:to-amber-800/80 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700/50 shadow-sm">
                                    {Math.round(userStats.hoursLearning * 100).toLocaleString()} coins
                                  </span>
                                </div>
                              </div>
                              
                              {/* Floating coins animation */}
                              {[...Array(3)].map((_, i) => (
                                <div 
                                  key={i}
                                  className="absolute rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-lg z-0"
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    left: `${10 + i * 30}%`,
                                    top: '10%',
                                    opacity: 0,
                                    animation: `coinFall ${3 + i}s ${i * 0.5}s infinite`,
                                    transform: 'translateY(-20px)'
                                  }}
                                >
                                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 border border-yellow-300"></div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Jar shadow */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-3 bg-black/10 dark:bg-black/30 rounded-full blur-md"></div>
                            
                            {/* CSS for coin animations */}
                            <style jsx>{`
                              @keyframes coinFloat {
                                0%, 100% { transform: translateY(0) rotate(0deg); }
                                50% { transform: translateY(-3px) rotate(5deg); }
                              }
                              
                              @keyframes coinFall {
                                0% { 
                                  opacity: 0;
                                  transform: translateY(-20px) scale(0.5);
                                }
                                10% { 
                                  opacity: 1;
                                  transform: translateY(0) scale(1);
                                }
                                90% { 
                                  opacity: 1;
                                  transform: translateY(0) scale(1);
                                }
                                100% { 
                                  opacity: 0;
                                  transform: translateY(20px) scale(0.5);
                                }
                              }
                            `}</style>
                          </div>
                          
                          {/* Progress info */}
                          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></div>
                              <span>Current</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-600 mr-1.5"></div>
                              <span>Next: {Math.ceil((userStats.hoursLearning * 100 + 1000) / 1000) * 1000}</span>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${(userStats.hoursLearning * 100) % 1000 / 10}%` }}
                            ></div>
                          </div>
                          
                          <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Complete more videos to earn coins!
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        


          

        <div className="container mx-auto px-4 py-8">
          {/* Profile Tabs Section */}
          <div className="mb-8">
            <div className={`flex space-x-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} p-1 rounded-xl w-fit mx-auto`}>
              {[
                { id: 'badge', label: 'Badges', icon: Award },
                { id: 'rank', label: 'Rankings', icon: Trophy },
                { id: 'progress', label: 'Progress', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'badge' | 'rank' | 'progress')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? `${theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                        : `${theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'badge' && (
                <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Your Badges & Achievements
                    </CardTitle>
                    <p className={`text-sm ${textMuted}`}>Collect badges by completing learning milestones</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                      {/* Learning Badges */}
                      <div className={`p-4 border rounded-xl ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-700' : 'border-gray-200 bg-gradient-to-br from-blue-50 to-white'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                            <BookOpen className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${textColor}`}>Learning Badges</h4>
                            <p className={`text-xs ${textMuted}`}>Based on study time</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { name: 'Beginner', condition: userStats.hoursLearning >= 1, icon: '🌱' },
                            { name: 'Intermediate', condition: userStats.hoursLearning >= 10, icon: '📚' },
                            { name: 'Advanced', condition: userStats.hoursLearning >= 50, icon: '🎯' },
                            { name: 'Master', condition: userStats.hoursLearning >= 100, icon: '👑' }
                          ].map((badge) => (
                            <div key={badge.name} className={`flex items-center justify-between p-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{badge.icon}</span>
                                <span className={`text-sm font-medium ${textColor}`}>{badge.name}</span>
                              </div>
                              <Badge variant={badge.condition ? "default" : "secondary"} className={badge.condition ? 'bg-green-100 text-green-800' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'}>
                                {badge.condition ? 'Earned' : 'Locked'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Streak Badges */}
                      <div className={`p-4 border rounded-xl ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-700' : 'border-gray-200 bg-gradient-to-br from-orange-50 to-white'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
                            <Flame className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${textColor}`}>Streak Badges</h4>
                            <p className={`text-xs ${textMuted}`}>Based on consistency</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { name: '3-Day Streak', condition: userStats.currentStreak >= 3, icon: '🔥' },
                            { name: '7-Day Streak', condition: userStats.currentStreak >= 7, icon: '⚡' },
                            { name: '30-Day Streak', condition: userStats.currentStreak >= 30, icon: '🚀' },
                            { name: '100-Day Streak', condition: userStats.currentStreak >= 100, icon: '💎' }
                          ].map((badge) => (
                            <div key={badge.name} className={`flex items-center justify-between p-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{badge.icon}</span>
                                <span className={`text-sm font-medium ${textColor}`}>{badge.name}</span>
                              </div>
                              <Badge variant={badge.condition ? "default" : "secondary"} className={badge.condition ? 'bg-orange-100 text-orange-800' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'}>
                                {badge.condition ? 'Earned' : 'Locked'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Goal Badges */}
                      <div className={`p-4 border rounded-xl ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-700' : 'border-gray-200 bg-gradient-to-br from-green-50 to-white'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
                            <Target className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${textColor}`}>Goal Badges</h4>
                            <p className={`text-xs ${textMuted}`}>Based on completion</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { name: 'Goal Setter', condition: userStats.problemsSolved >= 1, icon: '🎯' },
                            { name: 'Goal Achiever', condition: userStats.problemsSolved >= 5, icon: '✅' },
                            { name: 'Goal Master', condition: userStats.problemsSolved >= 20, icon: '🏆' },
                            { name: 'Goal Legend', condition: userStats.problemsSolved >= 50, icon: '💫' }
                          ].map((badge) => (
                            <div key={badge.name} className={`flex items-center justify-between p-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{badge.icon}</span>
                                <span className={`text-sm font-medium ${textColor}`}>{badge.name}</span>
                              </div>
                              <Badge variant={badge.condition ? "default" : "secondary"} className={badge.condition ? 'bg-green-100 text-green-800' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'}>
                                {badge.condition ? 'Earned' : 'Locked'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'rank' && (
                <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Your Rankings & Performance
                    </CardTitle>
                    <p className={`text-sm ${textMuted}`}>Track your position across different leaderboards</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Current Rankings */}
                      <div className="space-y-4">
                        <h4 className={`font-semibold ${textColor}`}>Current Rankings</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Branch Rank', rank: 5, total: 45, trend: '+2', color: 'blue' },
                            { label: 'Section Rank', rank: 12, total: 120, trend: '+5', color: 'green' },
                            { label: 'College Rank', rank: 28, total: 500, trend: '+8', color: 'purple' },
                            { label: 'Global Rank', rank: 156, total: 10000, trend: '+15', color: 'amber' }
                          ].map((item) => (
                            <div key={item.label} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                                <div>
                                  <p className={`font-medium ${textColor}`}>{item.label}</p>
                                  <p className={`text-sm ${textMuted}`}>#{item.rank} of {item.total}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${textMuted}`}>{item.trend}</span>
                                {item.trend.startsWith('+') ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="space-y-4">
                        <h4 className={`font-semibold ${textColor}`}>Performance Metrics</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Learning Time', value: `${userStats.hoursLearning}h`, target: '20h', progress: Math.min(100, (userStats.hoursLearning / 20) * 100), color: 'blue' },
                            { label: 'Active Days', value: userStats.daysActive, target: 30, progress: Math.min(100, (userStats.daysActive / 30) * 100), color: 'green' },
                            { label: 'Completion Rate', value: `${Math.round((userStats.tasksCompleted / Math.max(1, userStats.problemsSolved)) * 100)}%`, target: '90%', progress: Math.min(100, (userStats.tasksCompleted / Math.max(1, userStats.problemsSolved)) * 100), color: 'purple' }
                          ].map((metric) => (
                            <div key={metric.label} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-900">{metric.label}</span>
                                <span className="text-gray-500">{metric.value} / {metric.target}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`bg-${metric.color}-500 h-2 rounded-full transition-all duration-500`}
                                  style={{ width: `${metric.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'progress' && (
                <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Progress Tracking & Analytics
                    </CardTitle>
                    <p className={`text-sm ${textMuted}`}>Monitor your learning journey with detailed analytics</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Weekly Progress */}
                      <div className="space-y-4">
                        <h4 className={`font-semibold ${textColor}`}>Weekly Progress</h4>
                        <div className="space-y-3">
                          {[
                            { day: 'Mon', hours: 2.5, color: 'blue' },
                            { day: 'Tue', hours: 3.2, color: 'green' },
                            { day: 'Wed', hours: 1.8, color: 'purple' },
                            { day: 'Thu', hours: 4.1, color: 'amber' },
                            { day: 'Fri', hours: 2.9, color: 'pink' },
                            { day: 'Sat', hours: 3.5, color: 'indigo' },
                            { day: 'Sun', hours: 2.2, color: 'red' }
                          ].map((item) => (
                            <div key={item.day} className="flex items-center gap-3">
                              <span className={`w-12 text-sm font-medium ${textMuted}`}>{item.day}</span>
                              <div className={`flex-1 rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div 
                                  className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-500`}
                                  style={{ width: `${Math.min(100, (item.hours / 5) * 100)}%` }}
                                ></div>
                              </div>
                              <span className={`w-12 text-sm text-right ${textMuted}`}>{item.hours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Monthly Overview */}
                      <div className="space-y-4">
                        <h4 className={`font-semibold ${textColor}`}>Monthly Overview</h4>
                        <div className="space-y-3">
                          {[
                            { metric: 'Total Hours', value: userStats.hoursLearning, target: 80, unit: 'h' },
                            { metric: 'Videos Completed', value: userStats.problemsSolved, target: 50, unit: '' },
                            { metric: 'Goals Achieved', value: userStats.tasksCompleted, target: 30, unit: '' },
                            { metric: 'Active Days', value: userStats.daysActive, target: 25, unit: 'days' }
                          ].map((item) => (
                            <div key={item.metric} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <span className={`font-medium ${textColor}`}>{item.metric}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-blue-600">{item.value}{item.unit}</span>
                                <span className={`text-sm ${textMuted}`}>/ {item.target}{item.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Progress Summary */}
                    <div className={`mt-6 p-4 rounded-xl border ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${textColor}`}>Overall Progress</h4>
                          <p className={`text-sm ${textMuted}`}>You're making great progress in your learning journey!</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round((userStats.hoursLearning / 100) * 100)}%
                          </div>
                          <p className="text-sm text-gray-500">Complete</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Statistics Grid */}
          {activeTab !== 'badge' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {/* Learning Rank Card */}
            <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '150ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Learning Rank
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700">
                    <TrendingUp className="w-3.5 h-3.5" />
                    #{rankHistory[rankHistory.length - 1].rank} Global
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[120px] relative">
                  {/* Rank Trend Graph */}
                  <div className="absolute inset-0">
                    <svg width="100%" height="100%" viewBox="0 0 300 120" className="overflow-visible">
                      {/* Grid lines */}
                      {[20, 60, 100].map((y, i) => (
                        <line 
                          key={i}
                          x1="0" 
                          y1={y} 
                          x2="300" 
                          y2={y} 
                          stroke="#e5e7eb" 
                          strokeWidth="1" 
                          strokeDasharray="2 2"
                        />
                      ))}
                      
                      {/* Trend line */}
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={rankHistory.map((item, i) => {
                          const x = 30 + (i * 40);
                          const y = (item.rank / 25) * 100;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      
                      {/* Data points */}
                      {rankHistory.map((item, i) => {
                        const x = 30 + (i * 40);
                        const y = (item.rank / 25) * 100;
                        return (
                          <g key={i}>
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="4" 
                              fill="#f59e0b" 
                              stroke="white" 
                              strokeWidth="2"
                              className="transition-all duration-300 hover:r-5"
                            />
                            <text 
                              x={x} 
                              y={y - 8} 
                              textAnchor="middle" 
                              className="text-[10px] font-medium fill-gray-700"
                            >
                              {item.rank}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* X-axis labels */}
                      {rankHistory.map((item, i) => {
                        const x = 30 + (i * 40);
                        return (
                          <text 
                            key={i} 
                            x={x} 
                            y="115" 
                            textAnchor="middle" 
                              className={`text-[9px] ${theme === 'dark' ? 'fill-gray-300' : 'fill-gray-500'}`}
                          >
                            {item.day}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className={textMuted}>Your Rank Trend</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Improved by {rankImprovement} rank{rankImprovement !== 1 ? 's' : ''} this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Learning Stats Card */}
            <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textMuted}>Learning Time</span>
                      <span className={`font-medium ${textColor}`}>{Math.round(userStats.hoursLearning * 10) / 10}h</span>
                    </div>
                    <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2 overflow-hidden`}>
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, (userStats.hoursLearning / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textMuted}>Problems Solved</span>
                      <span className={`font-medium ${textColor}`}>{userStats.problemsSolved}</span>
                    </div>
                    <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2 overflow-hidden`}>
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, (userStats.problemsSolved / 15) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textMuted}>Active Days</span>
                      <span className={`font-medium ${textColor}`}>{userStats.daysActive} days</span>
                    </div>
                    <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2 overflow-hidden`}>
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, (userStats.daysActive / 7) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Achievements Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Achievements */}
            <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '450ms' }}>
              <CardHeader className={`flex flex-row items-center justify-between border-b ${theme === 'dark' ? 'border-gray-700/60' : 'border-gray-100'} pb-4`}>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Recent Achievements
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Your learning milestones and accomplishments</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-gray-700 hover:bg-gray-100 border-gray-200 transition-all duration-300 hover:shadow-sm">
                      <Award className="w-4 h-4 text-yellow-500" />
                      View All Awards
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="flex-shrink-0 p-6 bg-gray-100 border-b border-gray-200">
                      <DialogTitle className="text-2xl font-bold text-black">
                        Your Awards & Rewards
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto pr-2 custom-scrollbar">
                      <div className="p-6 space-y-6">
                        {/* Learning Milestones */}
                        <div>
                          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${textColor}`}>
                            <Trophy className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                            Learning Milestones
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.hoursLearning >= 10,
                                title: 'Dedicated Learner',
                                description: 'Completed 10+ hours of learning'
                              },
                              {
                                condition: userStats.hoursLearning >= 50,
                                title: 'Master Learner',
                                description: 'Completed 50+ hours of learning'
                              },
                              {
                                condition: userStats.hoursLearning >= 100,
                                title: 'Grand Master',
                                description: 'Completed 100+ hours of learning'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100' : theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`font-medium ${textColor}`}>{award.title}</p>
                                    <p className={`text-sm ${textMuted}`}>{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Goal Achievements */}
                        <div>
                          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${textColor}`}>
                            <CheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                            Goal Achievements
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.problemsSolved >= 5,
                                title: 'Goal Crusher',
                                description: 'Completed 5+ learning goals'
                              },
                              {
                                condition: userStats.problemsSolved >= 20,
                                title: 'Goal Master',
                                description: 'Completed 20+ learning goals'
                              },
                              {
                                condition: userStats.problemsSolved >= 50,
                                title: 'Goal Legend',
                                description: 'Completed 50+ learning goals'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100' : theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`font-medium ${textColor}`}>{award.title}</p>
                                    <p className={`text-sm ${textMuted}`}>{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Consistency Awards */}
                        <div>
                          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${textColor}`}>
                            <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                            Consistency Awards
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.daysActive >= 7,
                                title: 'Consistency Master',
                                description: '7+ days of active learning'
                              },
                              {
                                condition: userStats.daysActive >= 30,
                                title: 'Monthly Warrior',
                                description: '30+ days of active learning'
                              },
                              {
                                condition: userStats.daysActive >= 100,
                                title: 'Century Club',
                                description: '100+ days of active learning'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100' : theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`font-medium ${textColor}`}>{award.title}</p>
                                    <p className={`text-sm ${textMuted}`}>{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Streak Achievements */}
                        <div>
                          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${textColor}`}>
                            <Flame className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                            Streak Achievements
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.currentStreak >= 3,
                                title: 'Streak Starter',
                                description: 'Maintained a 3-day streak'
                              },
                              {
                                condition: userStats.currentStreak >= 7,
                                title: 'Week Warrior',
                                description: 'Maintained a 7-day streak'
                              },
                              {
                                condition: userStats.currentStreak >= 30,
                                title: 'Streak Legend',
                                description: 'Maintained a 30-day streak'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100' : theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`font-medium ${textColor}`}>{award.title}</p>
                                    <p className={`text-sm ${textMuted}`}>{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Learning Time Achievements */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                    userStats.hoursLearning >= 10 
                      ? theme === 'dark' ? 'bg-gradient-to-br from-green-900/20 to-gray-800 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-white border-green-100'
                      : theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          userStats.hoursLearning >= 10 
                            ? theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${textColor}`}>Dedicated Learner</h4>
                          <p className={`text-sm ${textMuted}`}>Complete 10+ hours</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userStats.hoursLearning >= 10 
                          ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {userStats.hoursLearning >= 10 ? 'Achieved' : 'In Progress'}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${Math.min(100, (userStats.hoursLearning / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs text-right mt-1 ${textMuted}`}>
                        {Math.min(10, Math.round(userStats.hoursLearning * 10) / 10)}/10 hours
                      </p>
                    </div>
                  </div>

                  {/* Goals Achieved */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                    userStats.problemsSolved >= 5 
                      ? theme === 'dark' ? 'bg-gradient-to-br from-blue-900/20 to-gray-800 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'
                      : theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          userStats.problemsSolved >= 5 
                            ? theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${textColor}`}>Goal Crusher</h4>
                          <p className={`text-sm ${textMuted}`}>Complete 5+ goals</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userStats.problemsSolved >= 5 
                          ? theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {userStats.problemsSolved >= 5 ? 'Achieved' : 'In Progress'}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-sky-500 h-2 rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${Math.min(100, (userStats.problemsSolved / 5) * 100)}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs text-right mt-1 ${textMuted}`}>
                        {userStats.problemsSolved}/5 goals
                      </p>
                    </div>
                  </div>

                  {/* Streak Achievement */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                    userStats.currentStreak >= 7 
                      ? theme === 'dark' ? 'bg-gradient-to-br from-orange-900/20 to-gray-800 border-orange-700/50' : 'bg-gradient-to-br from-orange-50 to-white border-orange-100'
                      : theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          userStats.currentStreak >= 7 
                            ? theme === 'dark' ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-600'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${textColor}`}>Streak Master</h4>
                          <p className={`text-sm ${textMuted}`}>7+ day streak</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userStats.currentStreak >= 7 
                          ? theme === 'dark' ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {userStats.currentStreak >= 7 ? 'Achieved' : 'In Progress'}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${Math.min(100, (userStats.currentStreak / 7) * 100)}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs text-right mt-1 ${textMuted}`}>
                        {userStats.currentStreak}/7 days
                      </p>
                    </div>
                  </div>

                  {/* Consistency Achievement */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                    userStats.daysActive >= 7 
                      ? theme === 'dark' ? 'bg-gradient-to-br from-purple-900/20 to-gray-800 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'
                      : theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          userStats.daysActive >= 7 
                            ? theme === 'dark' ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${textColor}`}>Consistent Learner</h4>
                          <p className={`text-sm ${textMuted}`}>7+ active days</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userStats.daysActive >= 7 
                          ? theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {userStats.daysActive >= 7 ? 'Achieved' : 'In Progress'}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div 
                          className="bg-gradient-to-br from-purple-400 to-violet-500 h-2 rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${Math.min(100, (userStats.daysActive / 7) * 100)}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs text-right mt-1 ${textMuted}`}>
                        {userStats.daysActive}/7 days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Achievement Categories */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-lg border text-center ${
                    theme === 'dark' ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-100'
                  }`}>
                    <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}>
                      <Trophy className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <p className={`text-sm font-medium ${textColor}`}>Learning</p>
                    <p className={`text-xs ${textMuted}`}>Milestones</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${
                    theme === 'dark' ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-100'
                  }`}>
                    <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'
                    }`}>
                      <CheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <p className={`text-sm font-medium ${textColor}`}>Goals</p>
                    <p className={`text-xs ${textMuted}`}>Achieved</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${
                    theme === 'dark' ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-100'
                    }`}>
                      <Flame className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <p className={`text-sm font-medium ${textColor}`}>Streaks</p>
                    <p className={`text-xs ${textMuted}`}>Maintained</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${
                    theme === 'dark' ? 'bg-purple-900/20 border-purple-700/50' : 'bg-purple-50 border-purple-100'
                  }`}>
                    <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'
                    }`}>
                      <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-400'}`} />
                    </div>
                    <p className={`text-sm font-medium ${textColor}`}>Consistency</p>
                    <p className={`text-xs ${textMuted}`}>Tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

