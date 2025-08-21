export interface Playlist {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'coding' | 'audiobook';
  thumbnail?: string;
  videos: any[];
  codingQuestions: Question[];
  audiobooks?: any[];
  createdAt: string;
  source?: string;
  targetQuestionsPerDay?: number;
  isPublic?: boolean;
  ownerId?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  companies?: string[];
  acceptanceRate?: number;
  totalAccepted?: number;
  totalSubmissions?: number;
}

export interface QuestionMetadata {
  exampleCases: ExampleCase[];
  constraints: string[];
  solutionMethods: {
    [key: string]: {
      name: string;
      timeComplexity: string;
      spaceComplexity: string;
      steps: (example: ExampleCase) => Array<{
        description: string;
        code?: string;
        explanation?: string;
      }>;
    };
  };
}

export interface ExampleCase {
  input: string | number[] | number[][];
  output: string | number[];
  explanation?: string;
  description?: string;
  target?: number;
} 