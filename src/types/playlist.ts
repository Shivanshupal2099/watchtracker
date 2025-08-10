export interface Video {
  id: string;
  title: string;
  url: string;
  scheduledTime?: string; // ISO date string for scheduled time
  progress: number; // percentage 0-100
  watchTime: number; // Duration in minutes
  thumbnail?: string;
  dateCompleted?: string; // ISO date string when video was completed
  contentType?: 'course' | 'tutorial' | 'lecture' | 'workshop' | 'interview' | 'documentary' | 'conference' | 'webinar' | 'podcast' | 'coding-tutorial' | 'project-walkthrough' | 'tech-talk' | 'live-stream' | 'masterclass' | 'bootcamp' | 'seminar' | 'q&a' | 'review' | 'movie' | 'tv-show' | 'anime' | 'gaming' | 'music' | 'comedy' | 'vlog' | 'reaction' | 'other'; // Type of video content
  completedAt?: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'algorithms' | 'data-structures' | 'system-design' | 'dynamic-programming' | 'graphs' | 'arrays' | 'strings' | 'trees' | 'other';
  solved: boolean;
  timeSpent?: number; // in minutes
  notes?: string;
  tags?: string[];
  topics?: string[];
  dateAdded: string;
  dateSolved?: string;
  attempts: number;
  lastAttemptDate?: string;
  solutionUrl?: string; // Link to solution code
  difficulty_rating?: number; // User's personal difficulty rating 1-5
  // New fields for parsed question data
  constraints?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  metadata?: {
    title: string;
    difficulty: string;
    topics: string[];
    description: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    constraints: string[];
    stats?: {
      totalAccepted: number;
      totalSubmissions: number;
      acceptanceRate: number;
      companies: Array<{
        name: string;
        frequency: number;
      }>;
    };
  };
  originalLink?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  duration: number; // in minutes
  progress: number; // percentage 0-100
  coverImage?: string;
  currentChapter?: number;
  totalChapters?: number;
  lastListened?: string; // ISO date string
  notes?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'coding' | 'audiobook';
  thumbnail?: string; // Optional thumbnail URL
  contentType?: 'course' | 'tutorial' | 'lecture' | 'workshop' | 'interview' | 'documentary' | 'conference' | 'webinar' | 'podcast' | 'coding-tutorial' | 'project-walkthrough' | 'tech-talk' | 'live-stream' | 'masterclass' | 'bootcamp' | 'seminar' | 'q&a' | 'review' | 'movie' | 'tv-show' | 'anime' | 'gaming' | 'music' | 'comedy' | 'vlog' | 'reaction' | 'other'; // Type of content in the playlist
  videos: Video[];
  codingQuestions?: CodingQuestion[];
  audiobooks?: Audiobook[];
  createdAt: string;
  source?: 'all-questions' | 'manual';
  targetQuestionsPerDay?: number; // For accountability
  streakData?: StreakData;
  // Invitation related fields
  invitedUsers?: {
    email: string;
    username: string;
    status: 'pending' | 'accepted' | 'rejected';
    invitedAt: string;
  }[];
  isPublic?: boolean;
  ownerId?: string;
  timeLock?: {
    enabled: boolean;
    startTime: string; // Format: "HH:mm" (24-hour)
    endTime: string;   // Format: "HH:mm" (24-hour)
    days: number[];    // Array of days (0-6, where 0 is Sunday)
  };
}

export interface PlaylistData {
  totalWatchTime: number;
  totalVideos: number;
  completedVideos: number;
  overallProgress: number;
  estimatedCompletion: string;
  dailyAverage: number;
  totalCodingQuestions: number;
  solvedQuestions: number;
  questionsThisWeek: number;
  averageTimePerQuestion: number;
  categoryProgress: { [key: string]: { solved: number; total: number } };
  currentStreak: number;
  longestStreak: number;
}
export type ContentType = 
  | 'course'
  | 'tutorial'
  | 'lecture'
  | 'workshop'
  | 'interview'
  | 'documentary'
  | 'conference'
  | 'webinar'
  | 'podcast'
  | 'coding-tutorial'
  | 'project-walkthrough'
  | 'tech-talk'
  | 'live-stream'
  | 'masterclass'
  | 'bootcamp'
  | 'seminar'
  | 'q&a'
  | 'review'
  | 'movie'
  | 'tv-show'
  | 'anime'
  | 'gaming'
  | 'music'
  | 'comedy'
  | 'vlog'
  | 'reaction'
  | 'other';

