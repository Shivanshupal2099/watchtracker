export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type RawDifficulty = 'easy' | 'medium' | 'hard';
export type Category = 'algorithms' | 'data-structures' | 'system-design' | 'database' | 'shell' | 'concurrency';
export type SolutionMethodType = 'brute-force' | 'hash-map' | 'two-pointer' | 'binary-search';

export interface ExampleCase {
  input: string | number[] | number[][];
  output: string | number[];
  explanation?: string;
  description?: string;
  target?: number;
  expectedOutput?: number[];
}

export interface VisualizationData {
  type: 'array' | 'linked-list' | 'tree' | 'graph';
  currentStep: string;
  explanation: string;
}

export interface ArrayVisualizationData extends VisualizationData {
  type: 'array';
  values: number[];
  currentIndex: number;
  complementIndex?: number;
}

export interface LinkedListVisualizationData extends VisualizationData {
  type: 'linked-list';
  values: number[];
  target?: number;
  method: string;
}

export interface VisualStep {
  title: string;
  description: string;
  visualization?: VisualizationData;
}

export interface SolutionMethod {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  steps: (example: ExampleCase) => Array<{
    description: string;
    code?: string;
    explanation?: string;
    visualization?: VisualizationData;
  }>;
}

export interface QuestionStats {
  totalAccepted: number;
  totalSubmissions: number;
  acceptanceRate: number;
  companies: Array<{
    name: string;
    frequency: number;
  }>;
}

export interface QuestionMetadata {
  title?: string;
  difficulty?: Difficulty;
  topics?: string[];
  description: string;
  examples: ExampleCase[];
  constraints: string[];
  visualSteps?: VisualStep[];
  solutionMethods: Record<SolutionMethodType, SolutionMethod>;
  stats?: QuestionStats;
  exampleCases?: ExampleCase[];
  videoExplanation?: {
    videoUrl: string;
    videoThumbnail?: string;
    audioUrl: string;
    visualRepresentation?: {
      flowChart?: string;
      timeComplexity?: string;
      spaceComplexity?: string;
    };
  };
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: RawDifficulty;
  category: Category;
  topics: string[];
  companies?: string[];
  acceptanceRate?: number;
  totalAccepted?: number;
  totalSubmissions?: number;
  solved: boolean;
  timeSpent: number;
  attempts: number;
  // Code-related properties
  code?: string;
  language?: string;
  lastSaved?: number;
  output?: string;
  dateSolved?: string;
  lastAttemptDate?: string;
  solutionUrl?: string;
  difficulty_rating?: number;
  metadata?: QuestionMetadata;
}

export interface QuestionState extends Omit<Question, 'difficulty' | 'category'> {
  difficulty: Difficulty;
  category?: Category;
  code: string;
  output: string;
  lastSavedCode: string;
  lastSavedTime: number;
  isDirty: boolean;
  language: string;
  metadata: QuestionMetadata | null;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'coding' | 'audiobook';
  thumbnail?: string;
  videos: any[];
  codingQuestions: Question[];
  audiobooks?: any[];
  lastUpdated?: string;
  progress?: number;
  completedVideos?: string[];
  completedQuestions: string[];
  streakData?: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    weeklyGoal: number;
    completedThisWeek: number;
  };
  createdAt: string;
} 