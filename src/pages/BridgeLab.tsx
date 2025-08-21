import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Upload, Users, Lightbulb, BookOpen, Trophy, ShieldCheck, UserCheck, MessageCircle, FileText, UserCircle, ArrowLeft, User, Globe, Code, Award, Settings, Clock, Filter, Search, ChevronDown, Plus, X, Check, RotateCcw, BarChart3, Smile, Play, Video, Tag, Rocket, Home, Library, School, CheckSquare, Sparkles } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import BridgeLabLogo from '../assets/bridgelab_logo.png';
import ImageEditor from '../components/ImageEditor';
import { toast } from '../hooks/use-toast';
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogTrigger as ConfirmDialogTrigger } from '../components/ui/dialog';
import { Dialog as ConferenceDialog, DialogContent as ConferenceDialogContent, DialogHeader as ConferenceDialogHeader, DialogTitle as ConferenceDialogTitle } from '../components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';

// Add this at the top of the file (after imports) to declare the YT namespace and Player type for TypeScript
interface YouTubePlayer {
  setVolume(volume: number): void;
  destroy(): void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

// 1. BlogPost and Comment types
interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface PollOption {
  id: number;
  text: string;
  votes: number;
  votedBy: string[];
  image?: { file: File; url: string }; // Optional image for poll option
}

// Add coin earning interface
interface CoinEarning {
  id: number;
  type: 'post_created' | 'comment_received' | 'like_received' | 'share_received' | 'save_received' | 'poll_vote_received' | 'daily_login' | 'achievement_unlocked';
  amount: number;
  description: string;
  postId?: number;
  postTitle?: string;
  timestamp: string;
}

interface BlogPost {
  id: number;
  title: string;
  content: string; // HTML string for rich text
  author: string;
  avatar: string;
  tags: string[];
  createdAt: string;
  reactions: Record<string, string[]>;
  bookmarked: boolean;
  comments: Comment[];
  media?: { type: 'image' | 'video', file: File, url: string }[];
  poll?: {
    question: string;
    options: PollOption[];
    votedByUser?: number; // index of option user voted for, or null
  };
}

// 2. Dummy posts data
const dummyPosts: BlogPost[] = [
  {
    id: 1,
    title: 'How to Build a Smart Campus App',
    content: '<p>This is a <b>rich text</b> post about building a smart campus app. <a href="#">Read more...</a></p>',
    author: 'Alice',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    tags: ['Tech', 'Campus', 'React'],
    createdAt: '2024-06-01T10:00:00Z',
    reactions: {
      '😊': ['Bob'],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: false,
    comments: [
      {
        id: 1,
        author: 'Bob',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        content: 'Great idea! Would love to join.',
        createdAt: '2024-06-01T11:00:00Z',
        replies: [
          {
            id: 2,
            author: 'Alice',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            content: 'Thanks Bob! Let\'s connect.',
            createdAt: '2024-06-01T11:10:00Z',
          },
        ],
      },
    ],
    poll: {
      question: 'Which feature would you like to see first in the Smart Campus App?',
      options: [
        { id: 1, text: 'Real-time Bus Tracking', votes: 8, votedBy: ['Bob', 'Carol', 'David'] },
        { id: 2, text: 'Campus Food Ordering', votes: 12, votedBy: ['Alice', 'Emma', 'Frank'] },
        { id: 3, text: 'Study Room Booking', votes: 5, votedBy: ['Grace'] },
        { id: 4, text: 'Event Notifications', votes: 3, votedBy: ['Henry'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 2,
    title: 'Why Eco Startups Matter',
    content: '<p>Let\'s talk about <i>sustainability</i> and eco-friendly startups. 🌱</p>',
    author: 'Bob',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    tags: ['Eco', 'Startup'],
    createdAt: '2024-06-02T09:00:00Z',
    reactions: {
      '😊': ['Alice'],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: true,
    comments: [],
    poll: {
      question: 'What\'s the biggest challenge for eco startups?',
      options: [
        { id: 1, text: 'Funding & Investment', votes: 4, votedBy: ['Alice', 'David'] },
        { id: 2, text: 'Consumer Awareness', votes: 2, votedBy: ['Carol'] },
        { id: 3, text: 'Regulatory Hurdles', votes: 1, votedBy: ['Emma'] }
      ],
      votedByUser: 0 // Bob voted for the first option
    }
  },
  {
    id: 3,
    title: 'Best Programming Language for Beginners',
    content: '<p>Let\'s discuss the best programming language for students starting their coding journey.</p>',
    author: 'Carol',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    tags: ['Programming', 'Education', 'Python'],
    createdAt: '2024-06-03T14:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob'],
      '😢': [],
      '😡': [],
      '😮': ['David'],
      '❤️': [],
      '🤔': ['Emma']
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'Which programming language should beginners learn first?',
      options: [
        { id: 1, text: 'Python', votes: 15, votedBy: ['Alice', 'Bob', 'David', 'Emma', 'Frank'] },
        { id: 2, text: 'JavaScript', votes: 8, votedBy: ['Carol', 'Grace'] },
        { id: 3, text: 'Java', votes: 3, votedBy: ['Henry'] },
        { id: 4, text: 'C++', votes: 2, votedBy: ['Ivy'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 4,
    title: 'Future of Remote Work',
    content: '<p>How will remote work evolve in the next 5 years? Share your thoughts!</p>',
    author: 'David',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    tags: ['Remote Work', 'Future', 'Technology'],
    createdAt: '2024-06-04T11:00:00Z',
    reactions: {
      '😊': ['Alice', 'Carol'],
      '😢': [],
      '😡': [],
      '😮': ['Bob'],
      '❤️': ['Emma'],
      '🤔': ['Frank']
    },
    bookmarked: true,
    comments: [],
    poll: {
      question: 'What will be the dominant work model in 2029?',
      options: [
        { id: 1, text: 'Hybrid (2-3 days office)', votes: 18, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma'] },
        { id: 2, text: 'Fully Remote', votes: 7, votedBy: ['Frank', 'Grace'] },
        { id: 3, text: 'Fully Office-based', votes: 2, votedBy: ['Henry'] },
        { id: 4, text: 'Flexible (employee choice)', votes: 12, votedBy: ['Ivy', 'Jack'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 5,
    title: 'AI in Education',
    content: '<p>How can artificial intelligence transform the way we learn?</p>',
    author: 'Emma',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    tags: ['AI', 'Education', 'Innovation'],
    createdAt: '2024-06-05T16:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob', 'David'],
      '😢': [],
      '😡': [],
      '😮': ['Carol', 'Frank'],
      '❤️': ['Grace'],
      '🤔': ['Henry']
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'Which AI application will have the biggest impact on education?',
      options: [
        { id: 1, text: 'Personalized Learning', votes: 22, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma'] },
        { id: 2, text: 'Automated Grading', votes: 5, votedBy: ['Frank', 'Grace'] },
        { id: 3, text: 'Virtual Tutors', votes: 8, votedBy: ['Henry', 'Ivy'] },
        { id: 4, text: 'Content Generation', votes: 3, votedBy: ['Jack'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 6,
    title: 'Test User Poll',
    content: '<p>This is a test poll created by the user to verify the polls section functionality.</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Test', 'User Poll'],
    createdAt: '2024-06-06T12:00:00Z',
    reactions: {
      '😊': [],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'What is your favorite programming language?',
      options: [
        { id: 1, text: 'JavaScript', votes: 3, votedBy: ['Alice', 'Bob', 'Carol'] },
        { id: 2, text: 'Python', votes: 5, votedBy: ['David', 'Emma', 'Frank', 'Grace', 'Henry'] },
        { id: 3, text: 'TypeScript', votes: 2, votedBy: ['Ivy', 'Jack'] },
        { id: 4, text: 'Java', votes: 1, votedBy: ['Kate'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 7,
    title: 'Another User Poll',
    content: '<p>This is another test poll that has been voted on to show different states.</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Test', 'Voted Poll'],
    createdAt: '2024-06-07T10:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob'],
      '😢': [],
      '😡': [],
      '😮': ['Carol'],
      '❤️': ['David'],
      '🤔': []
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'Which programming language do you prefer for web development?',
      options: [
        { id: 1, text: 'JavaScript', votes: 8, votedBy: ['Alice', 'Bob', 'Carol', 'David'], image: { file: new File([''], 'js.png'), url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=400&fit=crop' } },
        { id: 2, text: 'TypeScript', votes: 12, votedBy: ['Emma', 'Frank', 'Grace', 'Henry'], image: { file: new File([''], 'ts.png'), url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400&fit=crop' } },
        { id: 3, text: 'Python', votes: 6, votedBy: ['Ivy', 'Jack'], image: { file: new File([''], 'python.png'), url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=400&fit=crop' } },
        { id: 4, text: 'Java', votes: 4, votedBy: ['Kate'], image: { file: new File([''], 'java.png'), url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop' } }
      ],
      votedByUser: 1 // You voted for TypeScript
    }
  },
  {
    id: 8,
    title: 'Test Poll with Images',
    content: '<p>This is a test poll with images to verify the grid layout functionality.</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Test', 'Poll Images'],
    createdAt: '2024-06-08T15:00:00Z',
    reactions: {
      '😊': [],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'Which technology stack would you choose for a new project?',
      options: [
        { id: 1, text: 'React + Node.js', votes: 0, votedBy: [], image: { file: new File([''], 'react.png'), url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop' } },
        { id: 2, text: 'Vue + Express', votes: 0, votedBy: [], image: { file: new File([''], 'vue.png'), url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop' } },
        { id: 3, text: 'Angular + Python', votes: 0, votedBy: [], image: { file: new File([''], 'angular.png'), url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400&fit=crop' } },
        { id: 4, text: 'Svelte + Go', votes: 0, votedBy: [], image: { file: new File([''], 'svelte.png'), url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=400&fit=crop' } }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 7,
    title: 'Another User Poll',
    content: '<p>This is another test poll that has been voted on to show different states.</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Test', 'Voted Poll'],
    createdAt: '2024-06-07T10:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob'],
      '😢': [],
      '😡': [],
      '😮': ['Carol'],
      '❤️': ['David'],
      '🤔': []
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'What is your preferred development environment?',
      options: [
        { id: 1, text: 'VS Code', votes: 8, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry'] },
        { id: 2, text: 'IntelliJ IDEA', votes: 3, votedBy: ['Ivy', 'Jack', 'Kate'] },
        { id: 3, text: 'Sublime Text', votes: 2, votedBy: ['Liam', 'Mia'] },
        { id: 4, text: 'Vim/Neovim', votes: 1, votedBy: ['Noah'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 8,
    title: 'My First Text Post',
    content: '<p>This is my first regular text post without any poll. I can edit and delete this post!</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Text Post', 'Personal'],
    createdAt: '2024-06-08T14:00:00Z',
    reactions: {
      '😊': ['Alice'],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: false,
    comments: [
      {
        id: 3,
        author: 'Alice',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        content: 'Great post! Looking forward to more content.',
        createdAt: '2024-06-08T15:00:00Z',
        replies: []
      }
    ]
  },
  {
    id: 9,
    title: 'Learning React and TypeScript',
    content: '<p>Just finished building my first React app with TypeScript. The type safety is amazing! Here are some key things I learned:</p><ul><li>TypeScript interfaces are super helpful</li><li>React hooks with proper typing</li><li>Component props validation</li></ul><p>What\'s your experience with React + TypeScript?</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['React', 'TypeScript', 'Learning', 'Programming'],
    createdAt: '2024-06-09T09:00:00Z',
    reactions: {
      '😊': ['Bob', 'Carol'],
      '😢': [],
      '😡': [],
      '😮': ['David'],
      '❤️': ['Emma'],
      '🤔': ['Frank']
    },
    bookmarked: true,
    comments: [
      {
        id: 4,
        author: 'Bob',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        content: 'TypeScript is a game changer! Once you get used to it, you can\'t go back to plain JavaScript.',
        createdAt: '2024-06-09T10:00:00Z',
        replies: [
          {
            id: 5,
            author: 'You',
            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
            content: 'Exactly! The IntelliSense is incredible.',
            createdAt: '2024-06-09T10:15:00Z',
          }
        ]
      }
    ]
  },
  {
    id: 10,
    title: 'Project Idea: Smart Study Planner',
    content: '<p>I have an idea for a smart study planner app that uses AI to optimize study schedules based on:</p><ul><li>Course difficulty</li><li>Exam dates</li><li>Personal learning patterns</li><li>Available study time</li></ul><p>Would anyone be interested in collaborating on this project?</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Project', 'AI', 'Education', 'Collaboration'],
    createdAt: '2024-06-10T16:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob', 'Carol', 'David'],
      '😢': [],
      '😡': [],
      '😮': ['Emma', 'Frank'],
      '❤️': ['Grace'],
      '🤔': ['Henry']
    },
    bookmarked: false,
    comments: []
  }
];

const branchOptions = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'Other'];

const tabItems = [
  { value: 'discover', label: 'Discover', icon: <Lightbulb className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'my-polls', label: 'My Polls', icon: <Trophy className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'teammatch', label: 'TeamMatch', icon: <Users className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'circles', label: 'Circles', icon: <MessageCircle className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'pitch', label: 'Pitch', icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'mentor', label: 'Mentor', icon: <UserCheck className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'profile', label: 'Profile', icon: <User className="w-6 h-6" strokeWidth={1.5} /> },
];

// Utility function to extract all YouTube video IDs from a string
  function extractAllYouTubeVideoIds(text: string): string[] {
    // Regex for various YouTube URL formats
    const regex = /(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)[\w-]{11})/g;
    const ids: string[] = [];
    let match;
  while ((match = regex.exec(text)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

// Add at the top, after imports
const maleAvatars = Array.from({ length: 50 }, (_, i) => `https://randomuser.me/api/portraits/men/${i}.jpg`);
const femaleAvatars = Array.from({ length: 50 }, (_, i) => `https://randomuser.me/api/portraits/women/${i}.jpg`);

// 1. Add a constant for the anonymous avatar URL at the top (after imports):
const ANONYMOUS_AVATAR = "https://ui-avatars.com/api/?name=Anonymous&background=8b5cf6&color=fff&rounded=true&size=128";

const BridgeLab: React.FC = () => {
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [tab, setTab] = useState('discover');
  const prevTabRef = useRef('discover');
  // Only update prevTabRef if not on 'new-post'
  useEffect(() => {
    if (tab !== 'new-post') {
      prevTabRef.current = tab;
    }
  }, [tab]);

  // Open dialog when 'new-post' tab is selected
  useEffect(() => {
    if (tab === 'new-post' && !showNewPostDialog) {
      setShowNewPostDialog(true);
    }
  }, [tab, showNewPostDialog]);

  // Restore previous tab after dialog closes
  useEffect(() => {
    if (!showNewPostDialog && tab === 'new-post') {
      setTab(prevTabRef.current);
    }
  }, [showNewPostDialog, tab]);

  const [posts, setPosts] = useState<BlogPost[]>(dummyPosts);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newMedia, setNewMedia] = useState<{ type: 'image' | 'video', file: File, url: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Profile state
  const [profileTab, setProfileTab] = useState('activity');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Your Name',
    department: 'Computer Science',
    year: 'Year 3',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    email: 'your.email@college.edu',
    linkedin: 'linkedin.com/in/yourprofile',
    github: 'github.com/yourusername',
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX', 'Python', 'Machine Learning'],
    stats: {
      postsCreated: 12,
      commentsMade: 47,
      likesReceived: 156,
      projectsJoined: 8
    },
    // Add coin-related stats
    coins: {
      total: 2847,
      thisWeek: 342,
      thisMonth: 1247,
      level: 8,
      nextLevelCoins: 500,
      streak: 12
    },
    preferences: {
      emailNotifications: true,
      publicProfile: true,
      mentorRequests: false
    },
    achievements: [
      { title: 'Top Contributor', description: 'Most active this month', icon: 'Trophy', color: 'yellow' },
      { title: 'Team Player', description: 'Joined 5+ projects', icon: 'Users', color: 'blue' },
      { title: 'Innovator', description: 'Created 10+ ideas', icon: 'Lightbulb', color: 'green' }
    ],
    recentActivity: [
      { action: 'Posted "Smart Campus App Ideas"', time: '2 hours ago', type: 'post' },
      { action: 'Joined Eco Startup Project', time: '1 day ago', type: 'join' },
      { action: 'Commented on "AR Navigation"', time: '3 days ago', type: 'comment' }
    ]
  });

  // Add coin earnings state
  const [coinEarnings, setCoinEarnings] = useState<CoinEarning[]>([
    { id: 1, type: 'post_created', amount: 50, description: 'Created post "Smart Campus App Ideas"', postId: 1, postTitle: 'Smart Campus App Ideas', timestamp: '2024-06-07T10:00:00Z' },
    { id: 2, type: 'like_received', amount: 15, description: 'Received 3 likes on your poll', postId: 6, postTitle: 'Test User Poll', timestamp: '2024-06-07T09:30:00Z' },
    { id: 3, type: 'comment_received', amount: 25, description: 'Received 2 comments on your post', postId: 7, postTitle: 'Another User Poll', timestamp: '2024-06-07T08:45:00Z' },
    { id: 4, type: 'share_received', amount: 30, description: 'Your post was shared by 2 users', postId: 1, postTitle: 'Smart Campus App Ideas', timestamp: '2024-06-07T08:00:00Z' },
    { id: 5, type: 'save_received', amount: 20, description: 'Your post was saved by 1 user', postId: 7, postTitle: 'Another User Poll', timestamp: '2024-06-07T07:30:00Z' },
    { id: 6, type: 'poll_vote_received', amount: 10, description: 'Received 5 votes on your poll', postId: 6, postTitle: 'Test User Poll', timestamp: '2024-06-07T07:00:00Z' },
    { id: 7, type: 'daily_login', amount: 5, description: 'Daily login bonus', timestamp: '2024-06-07T06:00:00Z' },
    { id: 8, type: 'achievement_unlocked', amount: 100, description: 'Unlocked "Top Contributor" achievement', timestamp: '2024-06-06T15:00:00Z' },
    { id: 9, type: 'post_created', amount: 50, description: 'Created post "Another User Poll"', postId: 7, postTitle: 'Another User Poll', timestamp: '2024-06-06T14:00:00Z' },
    { id: 10, type: 'like_received', amount: 20, description: 'Received 4 likes on your post', postId: 1, postTitle: 'Smart Campus App Ideas', timestamp: '2024-06-06T13:30:00Z' },
  ]);

  const [editProfile, setEditProfile] = useState({
    ...profile,
    role: 'Student',
    agreeToMentor: false,
    gender: 'Male', // Add gender
    avatar: maleAvatars[0], // Default avatar
  });

  // Profile tab items
  const profileTabItems = [
    { value: 'activity', label: 'Activity Stats', icon: <Trophy className="w-5 h-5" /> },
    { value: 'coins', label: 'Coins & Rewards', icon: <Award className="w-5 h-5" /> },
    { value: 'skills', label: 'Skills & Expertise', icon: <Code className="w-5 h-5" /> },
    { value: 'contact', label: 'Contact Info', icon: <MessageCircle className="w-5 h-5" /> },
    { value: 'achievements', label: 'Achievements', icon: <Award className="w-5 h-5" /> },
    { value: 'posts', label: 'Posts', icon: <FileText className="w-5 h-5" /> },
  ];

  // Save profile function
  const saveProfile = () => {
    setProfile({
      ...editProfile,
      avatar: uploadedAvatar || editProfile.avatar,
    });
    setShowEditProfile(false);
  };

  // Add/remove skill
  const addSkill = (skill: string) => {
    if (skill && !editProfile.skills.includes(skill)) {
      setEditProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkill = (skill: string) => {
    setEditProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // TeamMatch state
  const [teamSearch, setTeamSearch] = useState('');
  const [teamSkillFilter, setTeamSkillFilter] = useState<string[]>([]);
  const [teamDeptFilter, setTeamDeptFilter] = useState<string[]>([]);
  const [teamYearFilter, setTeamYearFilter] = useState<string>('');
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  // Advanced Filters toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Emoji dropdown state
  const [openEmojiDropdown, setOpenEmojiDropdown] = useState<number | null>(null);
  
  // More options dropdown state
  const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null);
  
  // Edit post/poll state
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editPostData, setEditPostData] = useState<{
    title: string;
    content: string;
    tags: string;
    media: { type: 'image' | 'video', file: File, url: string }[];
    poll?: {
      question: string;
      options: string[];
    };
  } | null>(null);
  const [editedPosts, setEditedPosts] = useState<Set<number>>(new Set());
  const [editTimestamps, setEditTimestamps] = useState<Record<number, string>>({});
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  // Image modal state
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageAlt: string;
    optionText: string;
  }>({
    isOpen: false,
    imageUrl: '',
    imageAlt: '',
    optionText: ''
  });

  // Double-click tracking
  const [clickCount, setClickCount] = useState<{ [key: string]: number }>({});
  const [clickTimer, setClickTimer] = useState<{ [key: string]: NodeJS.Timeout | null }>({});
  
  // Close emoji picker and tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close skill dropdown if clicking outside
      if (!target.closest('.skill-dropdown-container')) {
        setShowSkillDropdown(false);
      }
      
      // Close department dropdown if clicking outside
      if (!target.closest('.dept-dropdown-container')) {
        setShowDeptDropdown(false);
      }
      
      // Close emoji dropdown if clicking outside
      if (!target.closest('.emoji-dropdown-container')) {
        setOpenEmojiDropdown(null);
      }
      
      // Close more options dropdown if clicking outside
      if (!target.closest('.more-options-container')) {
        setOpenMoreOptions(null);
      }
      
      // Close tag dropdown if clicking outside
      if (!target.closest('.tag-dropdown-container')) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEditEmojiPicker, showTagDropdown]);

  // Close image modal with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && imageModal.isOpen) {
        setImageModal(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [imageModal.isOpen]);

  // Helper function to handle poll option clicks with double-click detection
  const handlePollOptionClick = (postId: number, optionIdx: number, imageUrl?: string, optionText?: string) => {
    console.log('Poll option clicked:', { postId, optionIdx, imageUrl, optionText });
    
    const clickKey = `${postId}-${optionIdx}`;
    
    // Increment click count
    const currentCount = clickCount[clickKey] || 0;
    const newCount = currentCount + 1;
    setClickCount(prev => ({ ...prev, [clickKey]: newCount }));
    
    // Clear existing timer
    if (clickTimer[clickKey]) {
      clearTimeout(clickTimer[clickKey]!);
    }
    
    if (newCount === 2) {
      // Double-click detected
      console.log('Double-click detected, opening image modal');
      if (imageUrl) {
        setImageModal({
          isOpen: true,
          imageUrl,
          imageAlt: `Option ${optionIdx + 1}`,
          optionText: optionText || ''
        });
      }
      // Reset click count
      setClickCount(prev => ({ ...prev, [clickKey]: 0 }));
      setClickTimer(prev => ({ ...prev, [clickKey]: null }));
      return;
    }
    
    // Set timer for single click
    const timeout = setTimeout(() => {
      // Single click - handle vote
      if (posts.find(p => p.id === postId)?.poll?.votedByUser === undefined) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId && p.poll) {
            const updatedOptions = [...p.poll.options];
            updatedOptions[optionIdx] = {
              ...updatedOptions[optionIdx],
              votes: updatedOptions[optionIdx].votes + 1,
              votedBy: [...updatedOptions[optionIdx].votedBy, 'You']
            };
            return {
              ...p,
              poll: {
                ...p.poll,
                options: updatedOptions,
                votedByUser: optionIdx
              }
            };
          }
          return p;
        }));
        toast({ title: 'Vote recorded!', description: 'Your vote has been counted.' });
      }
      // Reset click count and timer
      setClickCount(prev => ({ ...prev, [clickKey]: 0 }));
      setClickTimer(prev => ({ ...prev, [clickKey]: null }));
    }, 300); // 300ms delay to detect double-click
    
    setClickTimer(prev => ({ ...prev, [clickKey]: timeout }));
  };
  
  // Dummy team members data
  const teamMembers = [
    { id: 1, name: 'Alice Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', skills: ['React', 'TypeScript', 'UI/UX'], department: 'CSE', year: '3rd Year', bio: 'Passionate about frontend development and user experience design.' },
    { id: 2, name: 'Bob Smith', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', skills: ['Python', 'Machine Learning', 'Data Science'], department: 'CSE', year: '4th Year', bio: 'ML enthusiast with experience in computer vision projects.' },
    { id: 3, name: 'Carol Davis', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', skills: ['Node.js', 'MongoDB', 'Backend'], department: 'ECE', year: '3rd Year', bio: 'Backend developer interested in scalable architecture.' },
    { id: 4, name: 'David Wilson', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', skills: ['Flutter', 'Mobile Dev', 'Firebase'], department: 'CSE', year: '2nd Year', bio: 'Mobile app developer with 3 published apps.' },
    { id: 5, name: 'Emma Brown', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', skills: ['Java', 'Spring Boot', 'Microservices'], department: 'IT', year: '4th Year', bio: 'Backend specialist with expertise in enterprise applications.' },
    { id: 6, name: 'Frank Miller', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', skills: ['C++', 'Game Development', 'Unity'], department: 'CSE', year: '3rd Year', bio: 'Game developer passionate about creating immersive experiences.' },
    { id: 7, name: 'Grace Lee', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', skills: ['DevOps', 'Docker', 'Kubernetes'], department: 'ECE', year: '4th Year', bio: 'DevOps engineer focused on automation and cloud infrastructure.' },
    { id: 8, name: 'Henry Chen', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', skills: ['Blockchain', 'Solidity', 'Web3'], department: 'CSE', year: '2nd Year', bio: 'Blockchain developer building decentralized applications.' },
  ];

  // All available skills
  const allSkills = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'Node.js', 'Express', 'Spring Boot', 'Django', 'Flask', 'FastAPI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'Machine Learning', 'Data Science', 'Computer Vision', 'NLP', 'Deep Learning',
    'UI/UX', 'Figma', 'Adobe XD', 'Sketch',
    'Flutter', 'React Native', 'Mobile Dev', 'iOS', 'Android',
    'DevOps', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Blockchain', 'Solidity', 'Web3', 'Ethereum',
    'Game Development', 'Unity', 'Unreal Engine',
    'Microservices', 'REST API', 'GraphQL', 'WebSocket',
    'Git', 'GitHub', 'GitLab', 'CI/CD',
    'Agile', 'Scrum', 'Project Management'
  ];

  // All departments
  const allDepartments = [
    'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'AI/ML', 'Data Science', 
    'Biotechnology', 'Chemical Engineering', 'Civil Engineering',
    'Mechanical Engineering', 'Electrical Engineering', 'Computer Engineering',
    'Information Technology', 'Software Engineering', 'Cybersecurity',
    'Robotics', 'Automation', 'IoT', 'Embedded Systems'
  ];

  // Filter skills based on search
  const filteredSkills = allSkills.filter(skill => 
    skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !teamSkillFilter.includes(skill)
  );

  // Add skill to filter
  const addSkillToFilter = (skill: string) => {
    if (!teamSkillFilter.includes(skill)) {
      setTeamSkillFilter(prev => [...prev, skill]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  // Remove skill from filter
  const removeSkillFromFilter = (skill: string) => {
    setTeamSkillFilter(prev => prev.filter(s => s !== skill));
  };

  // Toggle department in filter
  const toggleDepartment = (dept: string) => {
    setTeamDeptFilter(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  useEffect(() => {
    if (sidebar) sidebar.setOpen(false);
  }, [sidebar]);

  // Debug tab changes
  useEffect(() => {
    console.log('Current tab:', tab);
    if (tab === 'polls') {
      console.log('🎯 POLLS TAB SELECTED!');
      console.log('Posts state:', posts);
      console.log('Posts with polls:', posts.filter(post => post.poll));
    }
  }, [tab, posts]);

  // Focus search input when tag dropdown opens
  useEffect(() => {
    if (showTagDropdown) {
      const searchInput = document.querySelector('input[placeholder*="Search existing tags"]') as HTMLInputElement;
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  }, [showTagDropdown]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close skill dropdown if clicking outside
      if (!target.closest('.skill-dropdown-container')) {
        setShowSkillDropdown(false);
      }
      
      // Close department dropdown if clicking outside
      if (!target.closest('.dept-dropdown-container')) {
        setShowDeptDropdown(false);
      }
      
      // Close emoji dropdown if clicking outside
      if (!target.closest('.emoji-dropdown-container')) {
        setOpenEmojiDropdown(null);
      }
      
      // Close more options dropdown if clicking outside
      if (!target.closest('.more-options-container')) {
        setOpenMoreOptions(null);
      }
      
      // Close tag dropdown if clicking outside
      if (!target.closest('.tag-dropdown-container')) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close other dropdown when one is opened
  const openSkillDropdown = () => {
    setShowSkillDropdown(true);
    setShowDeptDropdown(false);
  };

  const openDeptDropdown = () => {
    setShowDeptDropdown(true);
    setShowSkillDropdown(false);
  };

  // Get all unique tags from posts with usage count
  const allTagsWithCount = useMemo(() => {
    const tagCount: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a) // Sort by usage count descending
      .map(([tag]) => tag);
  }, [posts]);

  // Get all unique tags from posts (sorted alphabetically for dropdown)
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]); // ← Updates when posts change

  // Filtered tags based on search
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Filtering
  const filtered = posts.filter(post => {
    const matchesSearch = search === '' || post.author.toLowerCase().includes(search.toLowerCase());
    const matchesTags = tagFilter.length === 0 || tagFilter.some(tag => post.tags.includes(tag));
    return matchesSearch && matchesTags;
  });
  // No pagination: show all filtered posts

  // Tag filter helper functions
  const addTagToFilter = (tag: string) => {
    if (!tagFilter.includes(tag)) {
      setTagFilter(prev => [...prev, tag]);
    }
    setTagSearch('');
    setShowTagDropdown(false); // ← This closes the filter section
  };

  const removeTagFromFilter = (tag: string) => {
    setTagFilter(prev => prev.filter(t => t !== tag));
  };

  const createNewTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !allTags.includes(trimmedTag)) {
      // Add the new tag to all posts to ensure it appears in available tags
      setPosts(prev => prev.map(post => ({
        ...post,
        tags: [...post.tags, trimmedTag]
      })));
      
      // Add to filter but DON'T close dropdown
      if (!tagFilter.includes(trimmedTag)) {
        setTagFilter(prev => [...prev, trimmedTag]);
      }
      setNewTagInput('');
      setShowNewTagInput(false);
      
      toast({
        title: 'New tag created!',
        description: `Tag "${trimmedTag}" has been created and added to your filter.`,
      });
    }
  };

  // Enhanced tag creation function that works with search input
  const createTagFromSearch = () => {
    const trimmedTag = tagSearch.trim();
    if (trimmedTag && !allTags.includes(trimmedTag)) {
      // Add the new tag to all posts to ensure it appears in available tags
      setPosts(prev => prev.map(post => ({
        ...post,
        tags: [...post.tags, trimmedTag]
      })));
      
      // Add to filter but DON'T close dropdown - let user see the new tag in available tags
      if (!tagFilter.includes(trimmedTag)) {
        setTagFilter(prev => [...prev, trimmedTag]);
      }
      setTagSearch('');
      
      toast({
        title: 'New tag created!',
        description: `Tag "${trimmedTag}" has been created and added to your filter.`,
      });
    } else if (trimmedTag && allTags.includes(trimmedTag)) {
      // If tag already exists, just add it to filter
      if (!tagFilter.includes(trimmedTag)) {
        setTagFilter(prev => [...prev, trimmedTag]);
      }
      setTagSearch('');
    }
  };

  const openTagDropdown = () => {
    setShowTagDropdown(true);
    setShowNewTagInput(false);
  };

  // TeamMatch filtering logic
  const filteredTeamMembers = teamMembers.filter(member => 
    (teamSearch === '' || 
     member.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
     member.bio.toLowerCase().includes(teamSearch.toLowerCase())) &&
    (teamSkillFilter.length === 0 || 
     teamSkillFilter.some(skill => member.skills.includes(skill))) &&
    (teamDeptFilter.length === 0 || 
     teamDeptFilter.includes(member.department)) &&
    (teamYearFilter === '' || member.year === teamYearFilter)
  );

  // Like/bookmark handlers
  const toggleBookmark = (id: number) => {
    setPosts(ps => ps.map(p => {
      if (p.id === id) {
        const wasBookmarked = p.bookmarked;
        const newBookmarked = !wasBookmarked;
        
        // Add coin earning if someone bookmarks your post
        if (!wasBookmarked && p.author === 'You') {
          addCoinEarning('save_received', getCoinAmount('save_received'), `Your post "${p.title}" was saved by a user`, p.id, p.title);
        }
        
        return { ...p, bookmarked: newBookmarked };
      }
      return p;
    }));
  };

  // Edit post/poll handlers
  const startEditPost = (post: BlogPost) => {
    if (!canModifyPost(post)) {
      showUnauthorizedError();
      return;
    }
    
    setEditingPostId(post.id);
    setEditPostData({
      title: post.title,
      content: post.content,
      tags: post.tags.join(', '),
      media: post.media || [],
      poll: post.poll ? {
        question: post.poll.question,
        options: post.poll.options.map(opt => opt.text)
      } : undefined
    });
  };

  const saveEditPost = () => {
    if (!editingPostId || !editPostData) return;

    const post = posts.find(p => p.id === editingPostId);
    if (!post || !canModifyPost(post)) {
      showUnauthorizedError();
      cancelEditPost();
      return;
    }

    setPosts(ps => ps.map(p => {
      if (p.id !== editingPostId) return p;
      
      const updatedPost = {
        ...p,
        title: editPostData.title,
        content: editPostData.content,
        tags: editPostData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        media: editPostData.media
      };

      // Update poll if it exists
      if (editPostData.poll && p.poll) {
        const hasVotes = p.poll.options.some(opt => opt.votes > 0);
        if (!hasVotes) {
          // Only allow editing poll options if no votes have been cast
          updatedPost.poll = {
            ...p.poll,
            question: editPostData.poll.question,
            options: editPostData.poll.options.map((text, index) => ({
              id: p.poll!.options[index]?.id || index + 1,
              text,
              votes: p.poll!.options[index]?.votes || 0,
              votedBy: p.poll!.options[index]?.votedBy || []
            }))
          };
        } else {
          // If votes exist, only allow editing the question
          updatedPost.poll = {
            ...p.poll,
            question: editPostData.poll.question
          };
        }
      }

      return updatedPost;
    }));

    // Mark as edited and set timestamp
    setEditedPosts(prev => new Set([...prev, editingPostId]));
    setEditTimestamps(prev => ({
      ...prev,
      [editingPostId]: new Date().toISOString()
    }));

    // Reset edit state
    setEditingPostId(null);
    setEditPostData(null);

    toast({
      title: 'Post updated!',
      description: 'Your post has been successfully updated.'
    });
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditPostData(null);
  };

  const canEditPoll = (post: BlogPost) => {
    if (!post.poll) return false;
    return post.poll.options.every(opt => opt.votes === 0);
  };

  // Delete post function
  const deletePost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !canModifyPost(post)) {
      showUnauthorizedError();
      setShowDeleteConfirm(null);
      return;
    }
    
    setPosts(ps => ps.filter(p => p.id !== postId));
    setShowDeleteConfirm(null);
    setOpenMoreOptions(null);
    
    toast({
      title: 'Post deleted successfully',
      description: 'Your post has been permanently removed.',
    });
  };

  // Check if user can modify a post
  const canModifyPost = (post: BlogPost) => {
    return post.author === 'You';
  };

  // Show unauthorized modification error
  const showUnauthorizedError = () => {
    toast({
      title: 'Unauthorized Action',
      description: 'You can only modify your own content. For issues, report this post.',
      variant: 'destructive',
    });
  };

  // Report post function
  const reportPost = (postId: number) => {
    toast({
      title: 'Post Reported',
      description: 'Thank you for your report. We will review this content.',
    });
    setOpenMoreOptions(null);
  };

  // Comment add (dummy)
  const addComment = (postId: number, text: string, anonymous = false) => {
    setPosts(ps => ps.map(p => {
      if (p.id === postId) {
        // Add coin earning if someone comments on your post
        if (p.author === 'You') {
          addCoinEarning('comment_received', getCoinAmount('comment_received'), `Your post "${p.title}" received a comment`, p.id, p.title);
        }
        
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            author: anonymous ? 'Anonymous' : 'You',
            avatar: anonymous ? ANONYMOUS_AVATAR : profile.avatar,
            content: text,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return p;
    }));
  };

  // Media upload handlers
  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setNewMedia(prev => [...prev, { type: 'image', file, url }]);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setNewMedia(prev => [...prev, { type: 'video', file, url }]);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // --- Chat mock data and logic ---
  const chatRooms = [
    { id: '1', name: 'Team Alpha', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', type: 'group', unread: 2 },
    { id: '2', name: 'Mentor: Dr. Smith', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', type: 'mentor', unread: 0 },
    { id: '3', name: 'Alice Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', type: 'direct', unread: 0 },
    { id: '4', name: 'Circle: Eco Innovators', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', type: 'group', unread: 1 },
  ];
  
  const chatMessages = {
    '1': [
      { id: 1, sender: 'Bob', text: 'Hey team, ready for the hackathon?', time: '2024-06-07T10:00:00Z' },
      { id: 2, sender: 'You', text: 'Absolutely! Let\'s sync up at 5pm.', time: '2024-06-07T10:01:00Z' },
      { id: 3, sender: 'Carol', text: 'I\'ll bring the snacks!', time: '2024-06-07T10:02:00Z' },
    ],
    '2': [
      { id: 1, sender: 'Dr. Smith', text: 'Let me know if you need help with your project proposal.', time: '2024-06-07T09:00:00Z' },
      { id: 2, sender: 'You', text: 'Thank you! I\'ll send a draft soon.', time: '2024-06-07T09:05:00Z' },
    ],
    '3': [
      { id: 1, sender: 'Alice Johnson', text: 'Can you review my code?', time: '2024-06-07T08:00:00Z' },
      { id: 2, sender: 'You', text: 'Sure, send it over!', time: '2024-06-07T08:01:00Z' },
    ],
    '4': [
      { id: 1, sender: 'Emma', text: 'Let\'s brainstorm eco-friendly ideas!', time: '2024-06-07T07:00:00Z' },
      { id: 2, sender: 'You', text: 'I have a few concepts to share.', time: '2024-06-07T07:05:00Z' },
    ],
  };
  
  const [activeRoom, setActiveRoom] = useState<string | null>(chatRooms[0].id);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const activeRoomObj = chatRooms.find(r => r.id === activeRoom);
  const activeRoomMessages = activeRoom ? messages[activeRoom] || [] : [];
  
  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeRoom) return;
    setMessages(prev => ({
      ...prev,
      [activeRoom]: [
        ...prev[activeRoom],
        { id: Date.now(), sender: 'You', text: messageText, time: new Date().toISOString() },
      ],
    }));
    setMessageText('');
  };

  // Add state to track the active comment input post
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);

  // @ mention functionality
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  // Get all unique usernames from posts for suggestions
  const allUsernames = useMemo(() => {
    const usernames = new Set<string>();
    posts.forEach(post => {
      usernames.add(post.author);
      post.comments.forEach(comment => {
        usernames.add(comment.author);
        comment.replies?.forEach(reply => usernames.add(reply.author));
      });
    });
    return Array.from(usernames).filter(username => username !== 'You' && username !== 'Anonymous');
  }, [posts]);

  // Filter usernames based on mention query
  const filteredUsernames = useMemo(() => {
    if (!mentionQuery) return allUsernames.slice(0, 5);
    return allUsernames
      .filter(username => username.toLowerCase().includes(mentionQuery.toLowerCase()))
      .slice(0, 5);
  }, [mentionQuery, allUsernames]);

  // Handle @ mention in textarea
  const handleMentionInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Check if we're typing an @ mention
    const beforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionPosition({
        start: cursorPosition - query.length - 1, // -1 for @ symbol
        end: cursorPosition
      });
      setShowMentionSuggestions(true);
      setSelectedMentionIndex(0);
    } else {
      setShowMentionSuggestions(false);
    }
    
    setNewPostText(value);
  };

  // Handle mention selection
  const selectMention = (username: string) => {
    const beforeMention = newPostText.slice(0, mentionPosition.start);
    const afterMention = newPostText.slice(mentionPosition.end);
    const newText = beforeMention + `@${username} ` + afterMention;
    
    setNewPostText(newText);
    setShowMentionSuggestions(false);
    setMentionedUsers(prev => [...prev, username]);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = mentionPosition.start + username.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // Handle keyboard navigation in mention suggestions
  const handleMentionKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentionSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredUsernames.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsernames.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredUsernames[selectedMentionIndex]) {
          selectMention(filteredUsernames[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        setShowMentionSuggestions(false);
        break;
    }
  };

  // Process mentions in post content
  const processMentions = (content: string) => {
    return content.replace(/@(\w+)/g, '<span class="text-blue-500 font-semibold">@$1</span>');
  };

  const processContentForDisplay = (content: string) => {
    // First process mentions
    let processedContent = processMentions(content);
    
    // Extract YouTube video IDs from the content
    const videoIds = extractAllYouTubeVideoIds(content);
    
    // If there are YouTube videos, hide the YouTube links
    if (videoIds.length > 0) {
      // Regex to match various YouTube URL formats and hide them completely
      const youtubeUrlRegex = /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)[\w-]{11}(?:\?[^\s]*)?/g;
      processedContent = processedContent.replace(youtubeUrlRegex, '');
      
      // Clean up any extra whitespace or line breaks that might be left
      processedContent = processedContent.replace(/\n\s*\n/g, '\n').trim();
    }
    
    return processedContent;
  };

  // 3. DiscoverBlogFeed component
  const DiscoverBlogFeed = () => (
    <div className="w-full max-w-6xl mx-auto mt-6">
      {/* Tag Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-3 mb-4 max-w-[700px] w-full mx-auto" style={{ minHeight: 'unset' }} onDoubleClick={() => setShowTagDropdown(!showTagDropdown)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          {/* Removed tag logo for a cleaner, more compact look */}
          {tagFilter.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                {tagFilter.length} active filter{tagFilter.length > 1 ? 's' : ''}
              </span>
              <Button
                onClick={() => setTagFilter([])}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
          
        {/* Selected Tags - Enhanced Design */}
        {tagFilter.length > 0 && (
          <div className="mb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {tagFilter.map(tag => (
                <div
                  key={tag}
                  className="group relative bg-gradient-to-r from-gray-900 to-black text-white px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                >
                  <span className="text-sm font-semibold">{tag}</span>
                  <button
                    onClick={() => removeTagFromFilter(tag)}
                    className="ml-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 group-hover:bg-white/25"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Tags - Only show custom tags */}
        {allTags.length > 0 && (
          <div className="mb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => addTagToFilter(tag)}
                  className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer flex-shrink-0"
                  title="Click to add filter"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Filter Section */}
        <div className={`transition-all duration-300 overflow-hidden ${showTagDropdown ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-gray-100 pt-4">
            {/* Search Section */}
            <div className="mb-4 tag-dropdown-container">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search existing tags or type to create new..."
                    value={tagSearch}
                    onChange={(e) => {
                      setTagSearch(e.target.value);
                      if (!showTagDropdown) setShowTagDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagSearch.trim()) {
                        if (filteredTags.includes(tagSearch.trim())) {
                          addTagToFilter(tagSearch.trim());
                        } else {
                          createTagFromSearch();
                        }
                      }
                    }}
                    className="w-full pl-12 pr-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent rounded-2xl py-3 text-sm transition-all duration-200"
                    autoFocus={showTagDropdown}
                  />
                </div>
                <Button
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 px-6"
                >
                  {showTagDropdown ? 'Hide' : 'Show'} Advanced
                </Button>
              </div>
            </div>

            {/* Filter Results - Enhanced Design */}
            {showTagDropdown && (
              <div className="bg-gray-50 rounded-2xl p-3 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Available Tags</span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                    {filteredTags.length} found
                  </span>
                </div>
                
                {filteredTags.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {filteredTags.slice(0, 40).map(tag => (
                      <button
                        key={tag}
                        onClick={() => addTagToFilter(tag)}
                        className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg flex-shrink-0"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-3">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No tags found matching "{tagSearch}"
                  </div>
                )}
                
                {/* Create New Tag Option */}
                {tagSearch && !filteredTags.includes(tagSearch) && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={createTagFromSearch}
                      className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-xl hover:bg-white w-full"
                    >
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      Create new tag: "{tagSearch}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced New Tag Input */}
        {showNewTagInput && (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative pl-20 md:pl-64">
            <div className="flex items-center gap-2 mb-2">
              <div>
                <span className="text-sm font-semibold text-gray-900">Create New Tag</span>
                <p className="text-xs text-gray-600">Add a custom tag to your collection</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Enter tag name..."
                className="flex-1 bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent rounded-2xl text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createNewTag();
                  } else if (e.key === 'Escape') {
                    setShowNewTagInput(false);
                    setNewTagInput('');
                  }
                }}
              />
              <Button
                onClick={createNewTag}
                className="bg-gray-900 hover:bg-black text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6"
                size="sm"
              >
                Create
              </Button>
              <Button
                onClick={() => {
                  setShowNewTagInput(false);
                  setNewTagInput('');
                }}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Blog Feed - Full page scroll, no inner scroll container */}
      <div className={`flex flex-col gap-16 ${filtered.filter(post => !post.poll).length > 10 ? 'max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50' : ''}`}>
        {filtered.filter(post => !post.poll).map(post => (
          <div 
            key={post.id} 
            className="bg-white rounded-2xl shadow-lg border-2 border-black overflow-hidden group relative transition-all duration-300 transform hover:scale-[1.02] hover:border-0 hover:shadow-2xl hover:bg-gray-50 hover:z-10 max-w-3xl w-full mx-auto p-4 min-h-[120px]"
            style={{ minWidth: '400px', maxWidth: '700px' }}
            onMouseEnter={() => {
              setPostViews(prev => {
                // Only count a view once per hover per session (optional: can be improved for real users)
                if (prev[post.id]) return prev;
                return { ...prev, [post.id]: (prev[post.id] || 0) + 1 };
              });
            }}
            onMouseLeave={() => {
              // Auto close comment section when unhovering
              if (activeCommentPostId === post.id) {
                setActiveCommentPostId(null);
              }
            }}
            onDoubleClick={e => {
              // Toggle comment section on double-click, except on input/textarea/button
              if (
                !(e.target instanceof HTMLInputElement) &&
                !(e.target instanceof HTMLTextAreaElement) &&
                !(e.target instanceof HTMLButtonElement)
              ) {
                if (activeCommentPostId === post.id) {
                  setActiveCommentPostId(null);
                } else {
                  setActiveCommentPostId(post.id);
                }
              }
            }}
          >
            {/* Enhanced Post Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={post.avatar} 
                    alt={post.author} 
                    className="w-12 h-12 rounded-full border-4 border-white shadow-xl hover:scale-110 transition-transform duration-300 ring-2 ring-gray-200" 
                  />
                {post.author === 'Anonymous' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white flex items-center">
                          <UserCircle className="w-3 h-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">Anonymous</TooltipContent>
                  </Tooltip>
                )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-gray-900 hover:text-gray-700 transition-colors duration-200 cursor-pointer flex items-center gap-2">
                    {post.author}
                    {post.author === 'You' && (
                      <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                        You
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                      })}
                    </span>
                    {/* Edited indicator */}
                    {editedPosts.has(post.id) && editTimestamps[post.id] && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Edited
                      </span>
                    )}
                  </div>
                  {/* Follow button logic */}
                  {post.author !== 'You' && post.author !== 'Anonymous' && !followedUsers.includes(post.author) && (
                    <Button
                      size="sm"
                      className="mt-2 bg-gray-900 text-white rounded-full px-4 py-1.5 text-xs font-semibold shadow-md hover:bg-gray-800 transition-all duration-200"
                      onClick={() => setFollowedUsers(prev => [...prev, post.author])}
                    >
                      + Follow
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Enhanced Views Counter */}
                <div className="flex items-center gap-2 text-gray-600 text-sm bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full border border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl group">
                  <div className="relative">
                    <svg className="w-4 h-4 text-yellow-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                    {/* Animated pulse when view count increases */}
                    {postViews[post.id] > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{postViews[post.id] || 0}</span>
                    <span className="text-xs text-gray-500 font-medium">views</span>
              </div>
            </div>

                {/* Enhanced More Options Menu */}
                <div className="relative more-options-container">
                  <button
                    onClick={() => setOpenMoreOptions(openMoreOptions === post.id ? null : post.id)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200 group shadow-lg hover:shadow-xl"
                    title="More options"
                  >
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                  </button>

                  {/* More Options Dropdown */}
                  {openMoreOptions === post.id && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[180px] py-2">
                      {canModifyPost(post) ? (
                        // Options for post owner
                        <>
                          <button
                            onClick={() => {
                              startEditPost(post);
                              setOpenMoreOptions(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Post
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(post.id);
                              setOpenMoreOptions(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Post
                          </button>
                          {post.poll && (
                            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                              {canEditPoll(post) 
                                ? "Poll options can be edited (no votes yet)"
                                : "Only poll question can be edited (votes exist)"
                              }
                            </div>
                          )}
                        </>
                      ) : (
                        // Options for non-owner
                        <button
                          onClick={() => {
                            reportPost(post.id);
                            setOpenMoreOptions(null);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-3 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Report Post
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Content Area */}
            <div className="p-3 space-y-3">
              {/* Enhanced Title */}
              <h2 className="text-xl font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors duration-200 cursor-pointer tracking-tight">
                {post.title}
              </h2>

              {/* Enhanced Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium px-3 py-1.5 text-xs rounded-full border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      #{tag}
                    </Badge>
              ))}
            </div>
              )}

              {/* Enhanced Media */}
            {post.media && post.media.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.media.map((media, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                    {media.type === 'image' ? (
                      <img src={media.url} alt="Post Media" className="w-full h-64 object-cover rounded-xl" />
                    ) : (
                      <video src={media.url} className="w-full h-64 object-cover rounded-xl" controls />
                    )}
                  </div>
                ))}
              </div>
            )}

              {/* Enhanced Post Content */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" style={{ overflow: 'visible', maxHeight: 'none' }}>
                <div dangerouslySetInnerHTML={{ __html: processContentForDisplay(post.content) }} />
              </div>

            {/* YouTube video preview in Discover (multiple videos, with play/stop button below) */}
            {(() => {
              const videoIds = extractAllYouTubeVideoIds(post.content);
              if (!videoIds.length) return null;
              const previews = videoIds.map(videoId => {
                const isPlaying = currentlyPlaying && currentlyPlaying.postId === post.id && currentlyPlaying.videoId === videoId;
                return (
                  <div key={videoId} className="w-full max-w-md flex flex-col items-center">
                      <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-lg relative group mb-2">
                      {isPlaying ? (
                        <div style={{ width: '100%', height: '100%' }}>
                          <div id={`ytplayer_${post.id}_${videoId}`} style={{ width: '100%', height: '100%' }} />
                        </div>
                      ) : (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt="YouTube thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        className={`mb-2 px-8 py-3 rounded-full font-bold text-lg transition-all duration-200 flex items-center gap-2 shadow-lg border-2
                          ${isPlaying
                            ? 'bg-white text-black border-black hover:bg-black hover:text-white'
                            : 'bg-black text-white border-black hover:bg-white hover:text-black'}
                        `}
                        style={{ minWidth: 180 }}
                        onClick={() => {
                          if (isPlaying) {
                            setCurrentlyPlaying(null);
                          } else {
                            setCurrentlyPlaying({ postId: post.id, videoId });
                          }
                        }}
                      >
                        {isPlaying ? (
                          <>
                            <span className="inline-block w-5 h-5 mr-2 flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="4" y="4" width="10" height="10" rx="2" fill="black" stroke="black" strokeWidth="2"/></svg>
                            </span>
                            Stop Video
                          </>
                        ) : (
                          <>
                            <span className="inline-block w-5 h-5 mr-2 flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polygon points="6,4 14,9 6,14" fill="white"/></svg>
                            </span>
                            Play Video
                          </>
                        )}
                      </Button>
                      {/* Volume slider, only enabled when video is playing */}
                      {isPlaying && (
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={videoVolumes[`${post.id}_${videoId}`] ?? 100}
                          onChange={e => {
                            const newVolume = Number(e.target.value);
                            setVideoVolumes(v => ({ ...v, [`${post.id}_${videoId}`]: newVolume }));
                            const player = playerRefs.current[`${post.id}_${videoId}`];
                            if (player && typeof (player as { setVolume: (v: number) => void }).setVolume === 'function') {
                              (player as { setVolume: (v: number) => void }).setVolume(newVolume);
                            }
                          }}
                          className="w-32 h-2 accent-black cursor-pointer"
                          title="Volume"
                        />
                      )}
                    </div>
                  </div>
                );
              });
              return (
                <div className="my-4 flex flex-col items-center gap-6">
                  {previews}
                </div>
              );
            })()}
            </div>
            
            {/* Enhanced Reactions Display */}
            <div className="px-6 pb-0 group-hover:pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-3 flex-wrap">
                {Object.entries(post.reactions).map(([emoji, users]) => {
                  if (users.length > 0) {
                    const userReacted = users.includes('You');
                    return (
                      <div key={emoji} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 cursor-pointer ${
                        userReacted 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 shadow-md' 
                          : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                      }`}>
                        <span className="text-lg">{emoji}</span>
                        <span className={`font-semibold ${
                          userReacted ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {users.length}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full border-t border-gray-100 mx-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Enhanced Actions */}
            <div className="flex items-center justify-between px-8 py-0 group-hover:py-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-4">
              {/* Enhanced Emoji Reactions */}
              <div className="relative group emoji-dropdown-container">
                {/* Get the most popular reaction to show as main button */}
                {(() => {
                  const reactions = post.reactions;
                  const totalReactions = Object.values(reactions).reduce((sum, users) => sum + users.length, 0);
                  const mostPopularEmoji = Object.entries(reactions)
                    .sort(([,a], [,b]) => b.length - a.length)[0];
                  const userHasReacted = Object.values(reactions).some(users => users.includes('You'));
                  const userReactions = Object.entries(reactions).filter(([, users]) => users.includes('You'));
                  
                  return (
                    <button 
                      className={`flex items-center gap-2 text-lg font-bold transition-all px-4 py-2.5 rounded-full border-2 ${
                        userHasReacted 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-400 text-blue-800 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                      } hover:shadow-xl hover:scale-105 duration-200 relative overflow-hidden`}
                      onClick={() => setOpenEmojiDropdown(openEmojiDropdown === post.id ? null : post.id)}
                      title={`${totalReactions} reactions • Click to choose your reaction`}
                    >
                      {/* User reaction indicator */}
                      {userHasReacted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                      
                      <span style={{fontSize: '1.4rem'}}>
                        {userReactions.length > 0 ? userReactions[0][0] : (totalReactions > 0 ? mostPopularEmoji[0] : '😊')}
                      </span>
                      <span className="text-sm font-semibold">
                        {totalReactions}
                      </span>
                      
                    </button>
                  );
                })()}
                
                {/* Enhanced Emoji Dropdown */}
                  <div className={`absolute bottom-full left-0 mb-3 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-4 transition-all duration-300 z-50 min-w-[320px] transform ${
                  openEmojiDropdown === post.id 
                    ? 'opacity-100 visible scale-100' 
                    : 'opacity-0 invisible scale-95'
                }`}>
                  
                  {/* Emoji Grid */}
                  <div className="flex gap-3 mb-2 justify-center">
                    {([
                      { emoji: '😊'},
                      { emoji: '😢'},
                      { emoji: '😡'},
                      { emoji: '😮'},
                      { emoji: '❤️'},
                      { emoji: '🤔' }
                    ] as const).map(({ emoji}) => {
                      const reactionCount = post.reactions[emoji].length;
                      const userReacted = post.reactions[emoji].includes('You');
                      const isMostPopular = reactionCount > 0 && reactionCount === Math.max(...Object.values(post.reactions).map(users => users.length));
                      
                      return (
                        <button
                          key={emoji}
                          onClick={() => {
                            const user = 'You';
                            const hasReacted = post.reactions[emoji].includes(user);
                            
                            setPosts(ps => ps.map(p => {
                              if (p.id !== post.id) return p;
                              
                              // Remove user from all other reactions first
                              const updatedReactions = Object.keys(p.reactions).reduce((acc: Record<string, string[]>, key) => {
                                acc[key] = p.reactions[key].filter(u => u !== user);
                                return acc;
                              }, {} as Record<string, string[]>);
                              
                              // Add user to the clicked emoji (toggle behavior)
                              if (!hasReacted) {
                                updatedReactions[emoji] = [...updatedReactions[emoji], user];
                              }
                              
                              return {
                                ...p,
                                reactions: updatedReactions
                              };
                            }));
                            
                            // Close the dropdown after selection
                            setOpenEmojiDropdown(null);
                            
                            // Show toast notification
                            toast({ 
                              title: hasReacted ? 'Reaction removed' : 'Reaction added!', 
                              description: `You ${hasReacted ? 'removed' : 'added'} ${emoji} reaction.` 
                            });
                          }}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md relative group ${
                            userReacted 
                              ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-400 shadow-lg ring-2 ring-blue-200' 
                                : 'border-2 border-transparent hover:border-gray-200 hover:bg-gray-50'
                          }`}
                          aria-label={`React with ${emoji}`}
                        >
                          {/* Selected indicator */}
                          {userReacted && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white shadow-lg animate-bounce">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                          
                          {/* Popular indicator */}
                          {isMostPopular && reactionCount > 0 && !userReacted && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xs font-bold text-white">🔥</span>
                            </div>
                          )}
                          
                          <span style={{fontSize: '1.8rem'}} className={`transition-all duration-200 ${
                            userReacted ? 'scale-110' : 'group-hover:scale-110'
                          }`}>{emoji}</span>
                          
                          <div className="flex flex-col items-center">
                            <span className={`text-xs font-bold ${
                                userReacted ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {reactionCount}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Comments Count */}
              <button 
                onClick={() => setActiveCommentPostId(post.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-gray-50"
                title="View comments"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{post.comments.length} comments</span>
              </button>

              {/* Share Button */}
              <button 
                onClick={() => {
                  toast({ 
                    title: 'Shared!', 
                    description: 'Post link copied to clipboard.' 
                  });
                }}
                  className="flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-green-50"
                title="Share post"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm font-medium">Share</span>
              </button>

              {/* Bookmark Button */}
              <button 
                onClick={() => toggleBookmark(post.id)}
                className={`flex items-center gap-2 transition-colors duration-200 px-3 py-2 rounded-full ${
                  post.bookmarked 
                    ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                      : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
                title={post.bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
              >
                <svg className="w-4 h-4" fill={post.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="text-sm font-medium">{post.bookmarked ? 'Saved' : 'Save'}</span>
              </button>

              {/* Repost Button */}
              <button 
                onClick={() => {
                  toast({ 
                    title: 'Reposted!', 
                    description: 'Your repost has been published.' 
                  });
                }}
                  className="flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-green-50"
                title="Repost"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm font-medium">Repost</span>
              </button>
              </div>
            </div>
            
            {/* Enhanced Comments */}
            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-b-3xl px-8 pb-8 pt-6 border-t border-gray-200/50">
              {activeCommentPostId === post.id && (
                <CommentSection post={post} addComment={addComment} activeCommentPostId={activeCommentPostId} setActiveCommentPostId={setActiveCommentPostId} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. CommentSection component
  const CommentSection = ({ post, addComment, activeCommentPostId, setActiveCommentPostId }: { post: BlogPost, addComment: (postId: number, text: string, anonymous?: boolean) => void, activeCommentPostId: number | null, setActiveCommentPostId: (id: number | null) => void }) => {
    const [text, setText] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [commentAnonymous, setCommentAnonymous] = useState(false);
    const [replyAnonymous, setReplyAnonymous] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
    const scrollClass = post.comments.length > 1 ? 'max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50' : '';
    const inputRef = useRef<HTMLInputElement>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);

    // Focus input if this post is active
    useEffect(() => {
      if (activeCommentPostId === post.id && inputRef.current) {
        inputRef.current.focus();
      }
    }, [activeCommentPostId, post.id]);

    // Focus reply input when replyTo changes
    useEffect(() => {
      if (replyTo && replyInputRef.current) {
        replyInputRef.current.focus();
      }
    }, [replyTo]);

    const addReply = (commentId: number, replyText: string, anonymous = false) => {
      setPosts(ps => ps.map(p => {
        if (p.id !== post.id) return p;
        
        return {
          ...p,
          comments: p.comments.map(comment => {
            if (comment.id !== commentId) return comment;
            
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  id: Date.now(),
                  author: anonymous ? 'Anonymous' : 'You',
                  avatar: anonymous ? ANONYMOUS_AVATAR : profile.avatar,
                  content: replyText,
                  createdAt: new Date().toISOString()
                }
              ]
            };
          })
        };
      }));
      
      setReplyText('');
      setReplyTo(null);
      setReplyAnonymous(false);
      
      toast({ 
        title: 'Reply posted!', 
        description: 'Your reply has been added.' 
      });
    };

    const toggleLike = (commentId: number) => {
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
          toast({ 
            title: 'Unliked!', 
            description: 'Comment unliked.' 
          });
        } else {
          newSet.add(commentId);
          toast({ 
            title: 'Liked!', 
            description: 'Comment liked.' 
          });
        }
        return newSet;
      });
    };

    const CommentThread = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
      const maxDepth = 3; // Maximum nesting depth
      const canReply = depth < maxDepth;
      const isLiked = likedComments.has(comment.id);
      
      return (
        <div className={`${depth > 0 ? 'ml-6 border-l-2 border-neutral-200 pl-4' : ''}`}>
          <div className="flex items-start gap-3 mb-3 group">
            <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full border-2 border-neutral-200 relative" />
            {comment.author === 'Anonymous' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-0.5 shadow border-2 border-white flex items-center">
                    <UserCircle className="w-3 h-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Anonymous</TooltipContent>
              </Tooltip>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-black">{comment.author}</span>
                <span className="text-xs text-neutral-400">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-neutral-700 text-sm leading-relaxed bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                {comment.content}
              </div>
              
              {/* Comment Actions */}
              <div className="flex items-center gap-4 mt-2">
                {canReply && (
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    Reply
                  </button>
                )}
                <button 
                  onClick={() => toggleLike(comment.id)}
                  className={`text-xs transition-colors duration-200 font-medium flex items-center gap-1 ${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-neutral-500 hover:text-red-500'
                  }`}
                >
                  <svg className="w-3 h-3" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isLiked ? 'Liked' : 'Like'}
                </button>
              </div>
              
              {/* Reply Input */}
              {replyTo === comment.id && canReply && (
                <div className="mt-3 bg-white rounded-lg border border-neutral-200 p-3 shadow-sm">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (replyText.trim()) {
                        addReply(comment.id, replyText, replyAnonymous);
                        setReplyText('');
                        setReplyAnonymous(false);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      ref={replyInputRef}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author}...`}
                      className="flex-1 text-sm"
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex rounded-full bg-neutral-100 border-2 border-neutral-200 overflow-hidden shadow-sm">
                        <button
                          type="button"
                          className={`flex items-center gap-1 px-3 py-1.5 font-semibold text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10
                            ${!replyAnonymous ? 'bg-blue-500 text-white shadow scale-105' : 'bg-transparent text-neutral-500 hover:bg-neutral-200'}`}
                          aria-pressed={!replyAnonymous}
                          tabIndex={0}
                          onClick={() => setReplyAnonymous(false)}
                          title="Reply as yourself"
                        >
                          <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="avatar" className="w-4 h-4 rounded-full border-2 border-white mr-1" />
                          You
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-1 px-3 py-1.5 font-semibold text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:z-10
                            ${replyAnonymous ? 'bg-purple-500 text-white shadow scale-105' : 'bg-transparent text-neutral-500 hover:bg-neutral-200'}`}
                          aria-pressed={replyAnonymous}
                          tabIndex={0}
                          onClick={() => setReplyAnonymous(true)}
                          title="Reply as Anonymous"
                        >
                          <UserCircle className="w-4 h-4 mr-1 text-white" />
                          Anonymous
                        </button>
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="bg-black text-white hover:bg-white hover:text-black border border-black">
                      Reply
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText('');
                        setReplyAnonymous(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2">
              {comment.replies.map(reply => (
                <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-6 mt-4 border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-neutral-600" />
            <h3 className="font-bold text-lg text-black">Comments ({post.comments.length})</h3>
          </div>
          <button
            onClick={() => setActiveCommentPostId(null)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200 p-1 rounded-full hover:bg-neutral-100"
            title="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`space-y-4 mb-4 ${scrollClass}`}>
          {post.comments.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            post.comments.map(comment => (
              <CommentThread key={comment.id} comment={comment} />
            ))
          )}
        </div>
        
        {/* Main Comment Input */}
        <div className="mt-8 mb-2 flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Add a comment to this post</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (text.trim()) {
                addComment(post.id, text, commentAnonymous);
                setText('');
                setCommentAnonymous(false);
              }
            }}
            className="flex flex-col gap-2"
          >
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write your comment..."
              className="w-full min-h-[48px] max-h-32 resize-y border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
            />
            <div className="flex items-center gap-3">
              <div className="flex rounded-full bg-neutral-100 border-2 border-neutral-200 overflow-hidden shadow-sm">
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-1.5 font-semibold text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10
                    ${!commentAnonymous ? 'bg-blue-500 text-white shadow scale-105' : 'bg-transparent text-neutral-500 hover:bg-neutral-200'}`}
                  aria-pressed={!commentAnonymous}
                  tabIndex={0}
                  onClick={() => setCommentAnonymous(false)}
                  title="Comment as yourself"
                >
                  <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="avatar" className="w-4 h-4 rounded-full border-2 border-white mr-1" />
                  You
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-1.5 font-semibold text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:z-10
                    ${commentAnonymous ? 'bg-purple-500 text-white shadow scale-105' : 'bg-transparent text-neutral-500 hover:bg-neutral-200'}`}
                  aria-pressed={commentAnonymous}
                  tabIndex={0}
                  onClick={() => setCommentAnonymous(true)}
                  title="Comment as Anonymous"
                >
                  <UserCircle className="w-4 h-4 mr-1 text-white" />
                  Anonymous
                </button>
              </div>
              <Button type="submit" className="bg-black text-white rounded-full px-6 hover:bg-white hover:text-black border border-black">
                Post
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Placeholder Components for Other Features ---
  const Placeholder = ({ icon, title, prompt }: { icon: React.ReactNode, title: string, prompt: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center animate-fade-in">
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2 text-black tracking-widest uppercase font-brand">{title}</h2>
      <p className="text-neutral-600 max-w-xl mx-auto text-lg font-brand">{prompt}</p>
      <div className="mt-6 text-neutral-400">(Feature coming soon)</div>
    </div>
  );

  // Profile content components
  const ActivityStatsTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Activity Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Posts Created</span>
          <span className="text-2xl font-bold text-black">{profile.stats.postsCreated}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Comments Made</span>
          <span className="text-2xl font-bold text-black">{profile.stats.commentsMade}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Likes Received</span>
          <span className="text-2xl font-bold text-black">{profile.stats.likesReceived}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Projects Joined</span>
          <span className="text-2xl font-bold text-black">{profile.stats.projectsJoined}</span>
        </div>
      </CardContent>
    </Card>
  );

  const SkillsTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Skills & Expertise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map(skill => (
            <Badge key={skill} className="bg-neutral-100 text-neutral-700 font-semibold uppercase tracking-widest">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ContactTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Contact Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="text-sm text-neutral-700">{profile.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <Globe className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="text-sm text-neutral-700">{profile.linkedin}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <Code className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="text-sm text-neutral-700">{profile.github}</span>
        </div>
      </CardContent>
    </Card>
  );

  const AchievementsTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.achievements.map((achievement, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${achievement.color}-100 rounded-full flex items-center justify-center`}>
              {achievement.icon === 'Trophy' && <Trophy className="w-5 h-5 text-yellow-600" />}
              {achievement.icon === 'Users' && <Users className="w-5 h-5 text-blue-600" />}
              {achievement.icon === 'Lightbulb' && <Lightbulb className="w-5 h-5 text-green-600" />}
            </div>
            <div>
              <p className="text-sm font-bold text-black">{achievement.title}</p>
              <p className="text-xs text-neutral-500">{achievement.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // PostsTab: shows all posts authored by 'You'
  const PostsTab = () => {
    const userPosts = posts.filter(post => post.author === 'You');
    return (
      <div className="w-full max-w-3xl mx-auto mt-10">
        {userPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-xl font-bold text-neutral-600 mb-2">You haven't created any posts yet</h3>
            <p className="text-neutral-500">Create a post to see it here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {userPosts.map(post => (
              post.poll ? (
                <div key={post.id}>
                  {/* ...poll post JSX... */}
                </div>
              ) : (
                <div key={post.id}>
                  {/* ...non-poll post JSX... */}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- X-like New Post dialog state and logic ---
  const [newPostText, setNewPostText] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{ type: 'image' | 'video', file: File, url: string }[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<Array<{ text: string; image?: { file: File; url: string } }>>([{ text: '' }, { text: '' }]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postAnonymous, setPostAnonymous] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiList = ['😀','😂','😍','😎','😢','😡','👍','🎉','🔥','🙏','🥳','🤔','😇','😅','😜','😱','😏','👏','💯','🚀'];

  // Insert emoji at cursor
  const insertEmoji = (emoji: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = newPostText.slice(0, start);
    const after = newPostText.slice(end);
    setNewPostText(before + emoji + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 0);
    setShowEmojiPicker(false);
  };

  // Handle image/video upload
  const handleMediaUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setNewPostMedia(prev => [...prev, { type: 'image', file, url }]);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setNewPostMedia(prev => [...prev, { type: 'video', file, url }]);
      }
    });
  };
  const handlePollOptionChange = (idx: number, value: string) => {
    setPollOptions(opts => opts.map((opt, i) => (i === idx ? { ...opt, text: value } : opt)));
  };
  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions(opts => [...opts, { text: '' }]);
  };
  const removePollOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions(opts => opts.filter((_, i) => i !== idx));
  };

  const handlePollOptionImageUpload = (idx: number, files: FileList) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPollOptions(opts => opts.map((opt, i) => (i === idx ? { ...opt, image: { file, url } } : opt)));
    }
  };

  const removePollOptionImage = (idx: number) => {
    setPollOptions(opts => opts.map((opt, i) => (i === idx ? { ...opt, image: undefined } : opt)));
  };
  const handleNewPost = () => {
    if (!newPostText.trim() && newPostMedia.length === 0 && (!showPoll || pollOptions.every(opt => !opt.text.trim()))) return;
    const newPost: BlogPost = {
      id: Date.now(),
      title: '',
      content: newPostText,
      author: postAnonymous ? 'Anonymous' : 'You',
      avatar: postAnonymous ? ANONYMOUS_AVATAR : profile.avatar,
      tags: [],
      createdAt: new Date().toISOString(),
      reactions: { '😊': [], '😢': [], '😡': [], '😮': [], '❤️': [], '🤔': [] },
      bookmarked: false,
      comments: [],
      media: newPostMedia.length > 0 ? newPostMedia : undefined,
      poll: showPoll ? {
        question: newPostText,
        options: pollOptions.filter(opt => opt.text.trim()).map((opt, i) => ({ 
          id: i + 1, 
          text: opt.text, 
          votes: 0, 
          votedBy: [],
          image: opt.image
        })),
        votedByUser: undefined
      } : undefined
    };
    setPosts(prev => [newPost, ...prev]);
    setShowNewPostDialog(false);
    setNewPostText('');
    setNewPostMedia([]);
    setShowPoll(false);
    setPollOptions([{ text: '' }, { text: '' }]);
    setPostAnonymous(false);
    toast({ title: 'Posted!', description: 'Your post has been published.' });
  };

  // --- X-like New Post dialog UI ---
  const newPostDialog = (
    <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
      <DialogContent className="max-w-lg min-w-[380px] min-h-[320px] w-full rounded-2xl shadow-2xl border border-neutral-800 bg-black text-white p-0 overflow-visible animate-fade-in" style={{ padding: 0 }}>
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <span className="font-bold text-xl">Create Post</span>
          </div>
          {/* Main */}
          <div className="flex px-6 pb-6 gap-4">
            <img src={profile.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-neutral-700 mt-1" />
            <div className="flex-1">
              <div className="relative">
              <textarea
                ref={textareaRef}
                  className="w-full min-h-[70px] max-h-48 resize-none bg-black text-white text-lg placeholder-neutral-400 focus:outline-none border-b border-neutral-700 mb-3"
                  placeholder="What's happening? Use @ to mention users..."
                value={newPostText}
                  onChange={handleMentionInput}
                  onKeyDown={handleMentionKeyDown}
                rows={3}
                style={{ fontFamily: 'inherit' }}
              />
                {/* Mention Suggestions */}
                {showMentionSuggestions && filteredUsernames.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100">
                        Mention a user:
                      </div>
                      {filteredUsernames.map((username, index) => (
                        <button
                          key={username}
                          onClick={() => selectMention(username)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors ${
                            index === selectedMentionIndex ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">@{username}</div>
                            <div className="text-xs text-gray-500">Click to mention</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex rounded-full bg-neutral-900 border-2 border-neutral-700 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10
                      ${!postAnonymous ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-transparent text-neutral-300 hover:bg-neutral-800'}`}
                    aria-pressed={!postAnonymous}
                    tabIndex={0}
                    onClick={() => setPostAnonymous(false)}
                    title="Post as yourself"
                  >
                    <img src={profile.avatar} alt="avatar" className="w-5 h-5 rounded-full border-2 border-white mr-1" />
                    You
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:z-10
                      ${postAnonymous ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-transparent text-neutral-300 hover:bg-neutral-800'}`}
                    aria-pressed={postAnonymous}
                    tabIndex={0}
                    onClick={() => setPostAnonymous(true)}
                    title="Post as Anonymous"
                  >
                    <UserCircle className="w-5 h-5 mr-1 text-white" />
                    Anonymous
                  </button>
                </div>
                <span className="text-xs text-neutral-400">Choose your identity</span>
              </div>
              {/* YouTube video preview */}
              {(() => {
                const videoId = extractYouTubeVideoId(newPostText);
                if (videoId) {
                  return (
                    <div className="my-3 flex flex-col items-center">
                      <div className="w-full max-w-sm aspect-video rounded-xl overflow-hidden border-2 border-neutral-700 shadow-lg">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="YouTube video preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              {/* Media preview (images/videos) */}
              {newPostMedia.length > 0 && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {newPostMedia.map((media, idx) => (
                    <div key={idx} className="relative group">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="preview" className="w-24 h-24 object-cover rounded-xl border-2 border-neutral-700" />
                      ) : (
                        <video src={media.url} className="w-24 h-24 object-cover rounded-xl border-2 border-neutral-700" controls />
                      )}
                      <button onClick={() => setNewPostMedia(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white text-black rounded-full p-1 shadow hover:bg-red-600 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              {/* Poll options */}
              {showPoll && (
                <div className="mt-4 space-y-3">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={opt.text}
                          onChange={e => handlePollOptionChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 text-black bg-white border border-neutral-700 text-sm px-3 py-2 rounded-lg"
                          maxLength={60}
                        />
                        <button
                          type="button"
                          className={`p-2 rounded-lg hover:bg-neutral-800 transition-colors ${
                            opt.image ? 'text-green-500 bg-green-100' : 'text-neutral-400 hover:text-white'
                          }`}
                          onClick={() => document.getElementById(`poll-image-${idx}`)?.click()}
                          title={opt.image ? "Change image" : "Add image to option"}
                        >
                          {opt.image ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        </button>
                        {pollOptions.length > 2 && (
                          <button onClick={() => removePollOption(idx)} className="text-neutral-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                        )}
                        <input
                          id={`poll-image-${idx}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files && handlePollOptionImageUpload(idx, e.target.files)}
                        />
                      </div>
                      {opt.image && (
                        <div className="relative inline-block group">
                          <img 
                            src={opt.image.url} 
                            alt={`Option ${idx + 1} image`} 
                            className="w-20 h-20 object-cover rounded-lg border border-neutral-700 transition-transform group-hover:scale-110"
                          />
                          <button
                            onClick={() => removePollOptionImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* Hover preview */}
                          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <img 
                              src={opt.image.url} 
                              alt={`Option ${idx + 1} image preview`} 
                              className="w-32 h-32 object-cover rounded-lg border-2 border-white shadow-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button onClick={addPollOption} className="text-sm text-blue-400 hover:underline mt-1">Add option</button>
                  )}
                </div>
              )}
              {/* Actions row */}
              <div className="flex items-center gap-4 mt-5 relative">
                <button
                  type="button"
                  className="p-2.5 rounded-full hover:bg-neutral-900"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add image or video"
                >
                  <Upload className="w-5 h-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && handleMediaUpload(e.target.files)}
                />
                <button
                  type="button"
                  className={`p-2.5 rounded-full hover:bg-neutral-900 ${showPoll ? 'bg-neutral-800' : ''}`}
                  onClick={() => setShowPoll(v => !v)}
                  title="Add poll"
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </button>
                {/* Emoji picker functional */}
                <div className="relative">
                  <button type="button" className="p-3 rounded-full hover:bg-neutral-900" title="Add emoji" onClick={() => setShowEmojiPicker(v => !v)}>
                    <Smile className="w-6 h-6 text-yellow-400" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute left-0 top-12 z-50 bg-white text-black rounded-xl shadow-xl p-2 flex flex-wrap gap-1 w-64">
                      {emojiList.map(emoji => (
                        <button key={emoji} className="text-2xl p-1 hover:bg-neutral-200 rounded" onClick={() => insertEmoji(emoji)}>{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1" />
                <Button
                  className="rounded-full px-10 py-3 font-bold text-black bg-white hover:bg-neutral-200 text-lg disabled:opacity-60"
                  disabled={(!newPostText.trim() && newPostMedia.length === 0 && (!showPoll || pollOptions.every(opt => !opt.text.trim())))}
                  onClick={handleNewPost}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Utility function to extract YouTube video ID from a string
  function extractYouTubeVideoId(text: string): string | null {
    // Regex for various YouTube URL formats
    const regex = /(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)[\w-]{11})/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  // Only one video can play at a time across all posts
  // Store { postId, videoId } of the currently playing video
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{ postId: number; videoId: string } | null>(null);

  // Add at the top of the BridgeLab component:
  const playerRefs = useRef<{ [key: string]: unknown }>({});
  const [videoVolumes, setVideoVolumes] = useState<{ [key: string]: number }>({});

  // Add useEffect to load the YouTube IFrame API and manage player refs:
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {};
  }, []);

  useEffect(() => {
    if (!currentlyPlaying) return;
    const { postId, videoId } = currentlyPlaying;
    const playerId = `ytplayer_${postId}_${videoId}`;
    const winYT = (window as unknown as { YT?: { Player: unknown } }).YT;
    if (!winYT || !winYT.Player) return;
    const playerElem = document.getElementById(playerId);
    if (!playerElem) return;
    playerRefs.current[`${postId}_${videoId}`] = new (winYT.Player as new (...args: unknown[]) => unknown)(playerElem, {
      videoId,
      events: {
        onReady: event => {
          event.target.setVolume(videoVolumes[`${postId}_${videoId}`] ?? 100);
        }
      },
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0
      }
    });
    return () => {
      if (playerRefs.current[`${postId}_${videoId}`]) {
        const player = playerRefs.current[`${postId}_${videoId}`];
        if (player && typeof (player as { destroy?: () => void }).destroy === 'function') {
          (player as { destroy?: () => void }).destroy?.();
        }
        playerRefs.current[`${postId}_${videoId}`] = null;
      }
    };
  }, [currentlyPlaying, videoVolumes]);

  // Conference Chat state
  const [showConference, setShowConference] = useState(false);
  const [inConference, setInConference] = useState(false);

  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);

  // 1. Add state to track followed users
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  // Add coin earning functions
  const addCoinEarning = (type: CoinEarning['type'], amount: number, description: string, postId?: number, postTitle?: string) => {
    const newEarning: CoinEarning = {
      id: Date.now(),
      type,
      amount,
      description,
      postId,
      postTitle,
      timestamp: new Date().toISOString()
    };
    
    setCoinEarnings(prev => [newEarning, ...prev]);
    
    // Update total coins
    setProfile(prev => ({
      ...prev,
      coins: {
        ...prev.coins,
        total: prev.coins.total + amount,
        thisWeek: prev.coins.thisWeek + amount,
        thisMonth: prev.coins.thisMonth + amount
      }
    }));
  };

  // Function to get coin amount for different activities
  const getCoinAmount = (type: CoinEarning['type']): number => {
    const coinValues = {
      post_created: 50,
      comment_received: 10,
      like_received: 5,
      share_received: 15,
      save_received: 10,
      poll_vote_received: 2,
      daily_login: 5,
      achievement_unlocked: 100
    };
    return coinValues[type] || 0;
  };

  // Function to get icon for coin earning type
  const getCoinEarningIcon = (type: CoinEarning['type']) => {
    switch (type) {
      case 'post_created': return <FileText className="w-5 h-5" />;
      case 'comment_received': return <MessageCircle className="w-5 h-5" />;
      case 'like_received': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
      case 'share_received': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
      case 'save_received': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>;
      case 'poll_vote_received': return <BarChart3 className="w-5 h-5" />;
      case 'daily_login': return <Clock className="w-5 h-5" />;
      case 'achievement_unlocked': return <Trophy className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  // Function to get color for coin earning type
  const getCoinEarningColor = (type: CoinEarning['type']): string => {
    switch (type) {
      case 'post_created': return 'text-blue-600 bg-blue-100';
      case 'comment_received': return 'text-green-600 bg-green-100';
      case 'like_received': return 'text-red-600 bg-red-100';
      case 'share_received': return 'text-purple-600 bg-purple-100';
      case 'save_received': return 'text-yellow-600 bg-yellow-100';
      case 'poll_vote_received': return 'text-indigo-600 bg-indigo-100';
      case 'daily_login': return 'text-orange-600 bg-orange-100';
      case 'achievement_unlocked': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Add CoinsTab component
  const CoinsTab = () => {
    const totalEarnings = coinEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const thisWeekEarnings = coinEarnings
      .filter(earning => {
        const earningDate = new Date(earning.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return earningDate >= weekAgo;
      })
      .reduce((sum, earning) => sum + earning.amount, 0);

    const earningsByType = coinEarnings.reduce((acc, earning) => {
      acc[earning.type] = (acc[earning.type] || 0) + earning.amount;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-6">
        {/* Coin Overview Card */}
        <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 font-bold text-lg">🪙</span>
              </div>
              Coin Balance & Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Balance */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-black">Total Coins</h3>
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                  <span className="text-yellow-800 font-bold">Level {profile.coins.level}</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">{profile.coins.total.toLocaleString()}</div>
              <div className="text-sm text-neutral-600">Next level in {profile.coins.nextLevelCoins} coins</div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-neutral-600 mb-1">
                  <span>Level {profile.coins.level}</span>
                  <span>Level {profile.coins.level + 1}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((profile.coins.total % 1000) / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Weekly and Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">📈</span>
                  </div>
                  <h4 className="font-bold text-black">This Week</h4>
                </div>
                <div className="text-2xl font-bold text-green-600">{profile.coins.thisWeek}</div>
                <div className="text-sm text-neutral-600">coins earned</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📅</span>
                  </div>
                  <h4 className="font-bold text-black">This Month</h4>
                </div>
                <div className="text-2xl font-bold text-blue-600">{profile.coins.thisMonth}</div>
                <div className="text-sm text-neutral-600">coins earned</div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🔥</span>
                </div>
                <h4 className="font-bold text-black">Login Streak</h4>
              </div>
              <div className="text-2xl font-bold text-purple-600">{profile.coins.streak} days</div>
              <div className="text-sm text-neutral-600">Keep it up!</div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Breakdown */}
        <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(earningsByType).map(([type, amount]) => (
                <div key={type} className="bg-neutral-50 rounded-lg p-4 text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${getCoinEarningColor(type as CoinEarning['type'])}`}>
                    {getCoinEarningIcon(type as CoinEarning['type'])}
                  </div>
                  <div className="text-lg font-bold text-black">{amount}</div>
                  <div className="text-xs text-neutral-600 capitalize">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {coinEarnings.slice(0, 10).map(earning => (
                <div key={earning.id} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCoinEarningColor(earning.type)}`}>
                    {getCoinEarningIcon(earning.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-black truncate">{earning.description}</div>
                    <div className="text-sm text-neutral-500">
                      {new Date(earning.timestamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 font-bold">
                    <span className="text-lg">+{earning.amount}</span>
                    <span className="text-sm">🪙</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coin Earning Guide */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">How to Earn Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-black">Create Post</div>
                    <div className="text-sm text-neutral-600">+50 coins</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-black">Receive Comment</div>
                    <div className="text-sm text-neutral-600">+10 coins</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-black">Receive Like</div>
                    <div className="text-sm text-neutral-600">+5 coins</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-black">Post Shared</div>
                    <div className="text-sm text-neutral-600">+15 coins</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-black">Post Saved</div>
                    <div className="text-sm text-neutral-600">+10 coins</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-black">Daily Login</div>
                    <div className="text-sm text-neutral-600">+5 coins</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Add MyPollsSection component
  const MyPollsSection = () => {
    const userPolls = posts.filter(post => post.poll && (post.author === 'You' || post.author === 'Anonymous'));
    
    return (
      <div className="w-full max-w-7xl mx-auto mt-8">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-black tracking-tight uppercase font-brand">
            My Polls
          </h1>
          </div>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Track engagement on your polls and see how the community responds to your questions
          </p>
          
          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={() => setTab('new-post')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Poll
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-neutral-300 text-neutral-700 px-6 py-3 rounded-full font-bold hover:bg-neutral-50 transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Analytics
            </Button>
          </div>
          
          {/* Poll Statistics */}
          {userPolls.length > 0 && (
            <div className="flex justify-center gap-6 mt-8">
              <div className="bg-white rounded-xl p-4 border-2 border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-blue-600">{userPolls.length}</div>
                <div className="text-sm text-neutral-600">Total Polls</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-green-600">
                  {userPolls.reduce((sum, post) => sum + (post.poll?.options.reduce((s, opt) => s + opt.votes, 0) || 0), 0)}
                </div>
                <div className="text-sm text-neutral-600">Total Votes</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-purple-600">
                  {userPolls.reduce((sum, post) => sum + post.comments.length, 0)}
                </div>
                <div className="text-sm text-neutral-600">Total Comments</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(userPolls.reduce((sum, post) => {
                    const votes = post.poll?.options.reduce((s, opt) => s + opt.votes, 0) || 0;
                    const comments = post.comments.length;
                    return sum + (votes > 0 ? (comments / votes) * 100 : 0);
                  }, 0) / Math.max(userPolls.length, 1))}%
                </div>
                <div className="text-sm text-neutral-600">Avg Engagement</div>
              </div>
            </div>
          )}
        </div>

        {userPolls.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <BarChart3 className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-neutral-700 mb-4">No polls created yet</h3>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto text-lg">
              Create your first poll to start engaging with the community and earning insights
            </p>
            <Button 
              onClick={() => setTab('new-post')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-lg"
            >
              <Plus className="w-6 h-6 mr-3" />
              Create Your First Poll
            </Button>
          </div>
        ) : (
          <div className={`space-y-6 ${userPolls.length > 8 ? 'max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50' : ''}`}>
            {userPolls.map(post => (
              <div
                key={post.id}
                className="w-full max-w-4xl mx-auto bg-white rounded-2xl border-2 border-neutral-200 shadow-md hover:shadow-lg hover:scale-[1.002] transition-all duration-300 group relative overflow-hidden"
                onDoubleClick={e => {
                  if (
                    !(e.target instanceof HTMLInputElement) &&
                    !(e.target instanceof HTMLTextAreaElement) &&
                    !(e.target instanceof HTMLButtonElement)
                  ) {
                    if (activeCommentPostId === post.id) {
                      setActiveCommentPostId(null);
                    } else {
                      setActiveCommentPostId(post.id);
                    }
                  }
                }}
              >
                {/* Compact Header Row */}
                <div className="flex items-center gap-3 px-6 pt-4 pb-3 bg-gradient-to-r from-neutral-50 to-white rounded-t-2xl border-b border-neutral-200">
                  <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full border-2 border-neutral-300 shadow-sm flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xl text-black truncate max-w-[200px]">{post.author}</span>
                    <span className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                      <Clock className="w-4 h-4" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        year: '2-digit', 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-4">
                    {/* Poll Stats */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-blue-600">
                        <BarChart3 className="w-4 h-4" />
                        <span className="font-semibold">{post.poll?.options.reduce((sum, o) => sum + o.votes, 0) || 0} votes</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-semibold">{post.comments.length} comments</span>
                      </div>
                    </div>
                    
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold px-4 py-2 text-sm rounded-full border-2 border-blue-200 shadow-sm">
                      Poll
                    </Badge>
                    
                    {/* Edit and Delete buttons for poll owner */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!canModifyPost(post)) {
                            showUnauthorizedError();
                            return;
                          }
                          startEditPost(post);
                        }}
                        className="p-2.5 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-2 border-blue-200 shadow-sm hover:border-blue-300 transition-all duration-200 hover:scale-110"
                        title="Edit poll"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (!canModifyPost(post)) {
                            showUnauthorizedError();
                            return;
                          }
                          setShowDeleteConfirm(post.id);
                        }}
                        className="p-2.5 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 shadow-sm hover:border-red-300 transition-all duration-200 hover:scale-110"
                        title="Delete poll"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compact Title/Question */}
                <div className="px-6 pt-4 pb-3">
                  <h2 className="font-bold text-xl text-black leading-tight block mb-2" style={{ lineHeight: '1.3' }}>
                    {post.title || post.poll?.question}
                  </h2>
                  {post.content && (
                    <div className="text-neutral-700 text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: processContentForDisplay(post.content) }} />
                  )}
                </div>

                {/* Compact Poll Display */}
                <div className="px-6 pb-4">
                  {(() => {
                    const hasPollImages = post.poll?.options.some(option => 
                      option.image && option.image.url && option.image.url.trim() !== ''
                    );
                    console.log('Poll debug:', {
                      postId: post.id,
                      hasPoll: !!post.poll,
                      optionsCount: post.poll?.options.length,
                      hasImages: hasPollImages,
                      options: post.poll?.options.map(opt => ({
                        text: opt.text,
                        hasImage: !!opt.image,
                        imageUrl: opt.image?.url
                      }))
                    });
                    return hasPollImages;
                  })() ? (
                    // Image Grid Layout
                    <div className={`grid grid-cols-2 gap-2 max-w-2xl mx-auto ${post.poll?.options.length > 6 ? 'max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50' : ''}`}>
                      {post.poll?.options.map((option, idx) => {
                        const totalVotes = post.poll!.options.reduce((sum, o) => sum + o.votes, 0) || 0;
                        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                        const isVoted = post.poll?.votedByUser === idx;
                        const isMostVoted = option.votes === Math.max(...post.poll!.options.map(o => o.votes));
                        const hasImage = option.image && option.image.url && option.image.url.trim() !== '';
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => handlePollOptionClick(post.id, idx, hasImage ? option.image!.url : undefined, option.text)}
                            disabled={post.poll?.votedByUser !== undefined}
                            className={`relative group overflow-hidden rounded-2xl border-3 transition-all duration-300 shadow-lg hover:shadow-xl
                              ${isVoted 
                                ? 'border-blue-500 scale-[1.02] ring-4 ring-blue-200' 
                                : 'border-neutral-300 hover:border-blue-400 hover:scale-[1.01]'
                              }
                              ${post.poll?.votedByUser === undefined ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {/* Image */}
                            <div className="aspect-[4/3] relative max-h-48 group/image">
                              {hasImage ? (
                                <img 
                                  src={option.image!.url} 
                                  alt={`Option ${idx + 1}`} 
                                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover/image:scale-105"
                                  onError={(e) => {
                                    console.log('Image failed to load:', option.image!.url);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully:', option.image!.url);
                                  }}

                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                                  <span className="text-neutral-400 text-sm font-medium">No Image</span>
                                </div>
                              )}
                              
                              {/* Double-click indicator */}
                              {hasImage && (
                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                              {/* Overlay with text */}
                              <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3`}>
                                <div className="text-white">
                                  <div className="font-bold text-base mb-1">{option.text}</div>
                                  {post.poll?.votedByUser !== undefined && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-bold">{percentage}%</span>
                                      <span className="text-gray-300">({option.votes} votes)</span>
                                      {isMostVoted && option.votes > 0 && (
                                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                          <span className="text-xs font-bold text-white">🔥</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Selection indicator */}
                              {isVoted && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                              
                              {/* Option number */}
                              <div className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                isVoted 
                                  ? 'bg-blue-500 text-white border-blue-500' 
                                  : 'bg-white/90 text-black border-white'
                              }`}>
                                {idx + 1}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Traditional Text Layout
                    <div className={`flex flex-col gap-2 ${post.poll?.options.length > 4 ? 'max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50' : ''}`}>
                      {post.poll?.options.map((option, idx) => {
                        const totalVotes = post.poll!.options.reduce((sum, o) => sum + o.votes, 0) || 0;
                        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                        const isVoted = post.poll?.votedByUser === idx;
                        const isMostVoted = option.votes === Math.max(...post.poll!.options.map(o => o.votes));
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => handlePollOptionClick(post.id, idx)}
                            disabled={post.poll?.votedByUser !== undefined}
                            className={`flex items-center gap-4 w-full px-6 py-5 rounded-2xl border-3 text-lg font-semibold transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md
                              ${isVoted 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 scale-[1.02] shadow-lg' 
                                : 'bg-white border-neutral-300 text-black hover:bg-neutral-50 hover:border-neutral-400'
                              }
                              ${post.poll?.votedByUser === undefined ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{ minWidth: 0 }}
                            title={option.text.length > 40 ? option.text : undefined}
                          >
                            {/* Option number */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 ${
                              isVoted 
                                ? 'bg-white text-blue-600 border-white' 
                                : 'bg-neutral-100 text-neutral-600 border-neutral-200 group-hover:bg-blue-50 group-hover:border-blue-300'
                            }`}>
                              {idx + 1}
                            </div>
                            
                            <span className="truncate text-lg font-semibold z-10 flex-1">{option.text}</span>
                            
                            <span className="ml-auto flex items-center gap-3 z-10">
                              {post.poll?.votedByUser !== undefined && (
                                <>
                                  <span className={`text-lg font-bold ${isVoted ? 'text-white' : 'text-black'}`}>
                                    {percentage}%
                                  </span>
                                  <span className={`text-base ${isVoted ? 'text-blue-100' : 'text-neutral-400'}`}>
                                    ({option.votes})
                                  </span>
                                  {isMostVoted && option.votes > 0 && (
                                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">🔥</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </span>
                            
                            {/* Enhanced Progress bar */}
                            {post.poll?.votedByUser !== undefined && (
                              <span 
                                className="absolute left-0 top-0 h-full rounded-2xl z-0 animate-progress-bar transition-all duration-700" 
                                style={{ 
                                  width: `${percentage}%`, 
                                  background: isVoted 
                                    ? 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)' 
                                    : 'linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
                                  transition: 'width 0.8s cubic-bezier(.4,2,.6,1)' 
                                }} 
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Add at the top of the BridgeLab component (after useState for posts):
  // Views state: { [postId: number]: number }
  const [postViews, setPostViews] = useState<{ [key: number]: number }>({});

  return (
    <div className="min-h-screen bg-white flex flex-col items-center animate-fade-in font-sans relative" style={{ fontFamily: 'Space Grotesk, Inter, Helvetica Neue, Arial, sans-serif' }}>
      {/* Faint background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1.5px)', backgroundSize: '32px 32px', opacity: 0.18 }} />

      <div className="w-full max-w-7xl z-10" style={{ marginLeft: '9rem' }}>
        {/* Top left: Heading, Back Button and Top right: Search */}
        <div className="flex items-center justify-between gap-4 pt-8 pb-4 pl-4 pr-4">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="rounded-full p-2 mr-2" aria-label="Back to Classroom" onClick={() => navigate('/classroom')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            {/* Accelerator Button Only */}
            {!(tab === 'profile' || tab === 'circles' || tab === 'pitch' || tab === 'post') ? (
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-purple-700 border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all duration-200 shadow-sm"
                onClick={() => navigate('/acceleratorlibrary')}
                aria-label="Go to Accelerator of Ideas"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Accelerator
              </Button>
            ) : null}
          </div>
          {!(tab === 'profile' || tab === 'circles' || tab === 'pitch' || tab === 'post') && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setTab('new-post')}
                className="bg-black text-white px-4 py-2 rounded-full font-semibold shadow-md border-2 border-black transition-all duration-200 hover:bg-white hover:text-black hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
              <Button
                onClick={() => navigate('/launch')}
                className="bg-black text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-gray-900 transition-all duration-200 border border-black"
              >
                <Rocket className="w-4 h-4 mr-2 text-red-600" />
                Launch
              </Button>
              <Button
                onClick={() => navigate('/find-cofounder')}
                className="bg-black text-white px-4 py-2 rounded-full font-semibold shadow-md border-2 border-black transition-all duration-200 hover:bg-white hover:text-black hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <Users className="w-4 h-4 mr-2" />
                Find Co-founder
              </Button>
              <Input placeholder="Search by username..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                aria-label="Open Shorts"
                onClick={() => navigate('/shorts')}
              >
                <Video className="w-7 h-7" />
              </Button>
            </div>
          )}
        </div>
        
       
        
        {/* Divider */}
        <div className="w-full border-t border-neutral-200 mb-8" />
        
        {/* Content Areas */}
        <div className="w-full">
          {tab === 'discover' && <div className="pb-20"><DiscoverBlogFeed /></div>}
          {tab === 'my-polls' && (
            <div className="pb-20">
              <MyPollsSection />
            </div>
          )}
          {tab === 'teammatch' && (
            <div className="pb-20">
              <div className="w-full max-w-6xl mx-auto mt-10">
                {/* TeamMatch Section Heading */}
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Find a Teammate</h1>
                {/* Toggle Advanced Filters Button */}
                <div className="mb-4 flex justify-end">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-purple-700 border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all duration-200 shadow-sm"
                    onClick={() => setShowAdvancedFilters(v => !v)}
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                  </Button>
                </div>
                {/* Filters */}
                {showAdvancedFilters && (
                  <div className="bg-white rounded-2xl shadow-xl p-8 border-0 animate-fade-in mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Filter className="w-5 h-5 text-black" />
                      <h2 className="text-xl font-bold text-black uppercase tracking-wide font-brand">Advanced Filters</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Search */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <Input 
                            placeholder="Search by name or bio..."
                            value={teamSearch}
                            onChange={(e) => setTeamSearch(e.target.value)}
                            className="w-full pl-10 bg-neutral-50 border-neutral-200 focus:border-black focus:ring-black"
                          />
                        </div>
                      </div>

                      {/* Year Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Year</label>
                        <select 
                          value={teamYearFilter}
                          onChange={(e) => setTeamYearFilter(e.target.value)}
                          className="w-full border-neutral-200 focus:border-black focus:ring-black rounded-lg bg-neutral-50 px-4 py-3 text-sm"
                        >
                          <option value="">All Years</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>

                    {/* Skills Filter */}
                    <div className="mt-6 space-y-3">
                      <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Skills</label>
                      
                      {/* Selected Skills */}
                      {teamSkillFilter.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {teamSkillFilter.map(skill => (
                            <Badge key={skill} className="bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-2">
                              {skill}
                              <button
                                onClick={() => removeSkillFromFilter(skill)}
                                className="hover:text-red-200 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Skills Dropdown */}
                      <div className="skill-dropdown-container relative">
                        <div className="relative">
                          <Input
                            placeholder="Search and select skills..."
                            value={skillSearch}
                            onChange={(e) => {
                              setSkillSearch(e.target.value);
                              openSkillDropdown();
                            }}
                            onFocus={openSkillDropdown}
                            className="w-full bg-neutral-50 border-neutral-200 focus:border-black focus:ring-black pr-10"
                          />
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                        
                        {showSkillDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                            <div className="p-3 border-b border-neutral-100">
                              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                Available Skills ({filteredSkills.length})
                              </p>
                            </div>
                            {filteredSkills.length > 0 ? (
                              <div className="py-1">
                                {filteredSkills.slice(0, 15).map(skill => (
                                  <button
                                    key={skill}
                                    onClick={() => addSkillToFilter(skill)}
                                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm font-medium transition-colors flex items-center gap-3"
                                  >
                                    <Plus className="w-4 h-4 text-neutral-400" />
                                    {skill}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-neutral-500 text-sm">
                                No skills found matching "{skillSearch}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Department Filter */}
                    <div className="mt-6 space-y-3">
                      <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Departments</label>
                      
                      {/* Selected Departments */}
                      {teamDeptFilter.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {teamDeptFilter.map(dept => (
                            <Badge key={dept} className="bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-2">
                              {dept}
                              <button
                                onClick={() => toggleDepartment(dept)}
                                className="hover:text-red-200 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Department Dropdown */}
                      <div className="dept-dropdown-container relative">
                        <button
                          onClick={openDeptDropdown}
                          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg hover:border-black hover:bg-neutral-100 transition-all duration-200 text-left cursor-pointer"
                        >
                          <span className={teamDeptFilter.length > 0 ? "text-black font-medium" : "text-neutral-500"}>
                            {teamDeptFilter.length > 0 
                              ? `${teamDeptFilter.length} department${teamDeptFilter.length > 1 ? 's' : ''} selected`
                              : "Select departments..."
                            }
                          </span>
                          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showDeptDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showDeptDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                            <div className="p-3 border-b border-neutral-100">
                              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                All Departments ({allDepartments.length})
                              </p>
                            </div>
                            <div className="py-1">
                              {allDepartments.map(dept => (
                                <button
                                  key={dept}
                                  onClick={() => toggleDepartment(dept)}
                                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm font-medium transition-colors flex items-center gap-3"
                                >
                                  {teamDeptFilter.includes(dept) ? (
                                    <Check className="w-4 h-4 text-black" />
                                  ) : (
                                    <div className="w-4 h-4 border border-neutral-300 rounded" />
                                  )}
                                  {dept}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(teamSkillFilter.length > 0 || teamDeptFilter.length > 0 || teamYearFilter !== '') && (
                      <div className="mt-6 pt-4 border-t border-neutral-100">
                        <button
                          onClick={() => {
                            setTeamSkillFilter([]);
                            setTeamDeptFilter([]);
                            setTeamYearFilter('');
                          }}
                          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors font-medium"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeamMembers.map(member => (
                    <Card key={member.id} className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full" />
                          <div>
                            <CardTitle className="text-xl font-bold text-black font-brand">{member.name}</CardTitle>
                            <p className="text-neutral-600 text-sm">{member.department} • {member.year}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700 text-sm mb-4">{member.bio}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {member.skills.map(skill => (
                            <Badge key={skill} className="bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-widest">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button className="bg-black text-white rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest flex-1">Connect</Button>
                          <Button variant="outline" className="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest">View Profile</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTeamMembers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-600 mb-2">No matches found</h3>
                    <p className="text-neutral-500">Try adjusting your filters to find more team members.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === 'circles' && (
            <div className="pb-20">
              {/* --- Circles Chat UI --- */}
              <div className="w-full max-w-6xl mx-auto mt-10 flex gap-8 animate-fade-in">
                {/* Sidebar: Chat Rooms */}
                <div className="w-80 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-2xl border-0 p-6 flex flex-col gap-4 h-[600px] min-h-[400px] max-h-[80vh] overflow-y-auto relative">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-black uppercase tracking-wide font-brand">Warroom</h2>
                    <Button size="icon" variant="ghost" className="rounded-full p-2" title="New Room (coming soon)"><Plus className="w-5 h-5 text-purple-500" /></Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {chatRooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoom(room.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-semibold text-base border-2 ${activeRoom === room.id ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-400 shadow-lg scale-105' : 'bg-white text-neutral-700 border-transparent hover:border-purple-200 hover:bg-purple-50 hover:scale-105'}`}
                        style={{ boxShadow: activeRoom === room.id ? '0 4px 24px 0 rgba(80, 80, 200, 0.10)' : undefined }}
                      >
                        <img src={room.avatar} alt={room.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{room.name}</div>
                          <div className="text-xs text-neutral-400 truncate">{room.type === 'group' ? 'Group' : room.type === 'mentor' ? 'Mentor' : 'Direct'}</div>
                        </div>
                        {room.unread > 0 && (
                          <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{room.unread}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Chat Window */}
                <div className="flex-1 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl border-0 p-0 flex flex-col h-[600px] min-h-[400px] max-h-[80vh] overflow-hidden">
                  {activeRoomObj ? (
                    <>
                      {/* Chat Header */}
                      <div className="flex items-center gap-4 px-8 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-2xl shadow-sm">
                        <img src={activeRoomObj.avatar} alt={activeRoomObj.name} className="w-12 h-12 rounded-full border-2 border-white shadow" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg text-black truncate">{activeRoomObj.name}</div>
                          <div className="text-xs text-purple-600 font-semibold">{activeRoomObj.type === 'group' ? 'Group Discussion' : activeRoomObj.type === 'mentor' ? 'Mentorship' : 'Direct Message'}</div>
                        </div>
                        <span className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg" title="Online"></span>
                        <Button size="sm" variant="outline" className="ml-4 bg-gradient-to-r from-blue-200 to-purple-200 text-purple-800 font-bold shadow" onClick={() => setShowConference(true)}>
                          <Users className="w-4 h-4 mr-2" /> Start Conference
                        </Button>
                      </div>
                      {/* Conference Modal */}
                      <ConferenceDialog open={showConference} onOpenChange={setShowConference}>
                        <ConferenceDialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
                          <ConferenceDialogHeader className="bg-gradient-to-r from-blue-100 to-purple-100 px-8 py-4 border-b border-blue-200">
                            <ConferenceDialogTitle className="text-xl font-bold text-black flex items-center gap-2">
                              <Users className="w-6 h-6 text-purple-600" /> Conference Chat
                            </ConferenceDialogTitle>
                          </ConferenceDialogHeader>
                          <div className="p-8 flex flex-col gap-6">
                            <div className="flex gap-4 items-center mb-4">
                              <img src={activeRoomObj.avatar} alt="Host" className="w-14 h-14 rounded-full border-2 border-purple-400 shadow" />
                              <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="You" className="w-14 h-14 rounded-full border-2 border-blue-400 shadow" />
                              <span className="text-lg font-semibold text-purple-700">{activeRoomObj.name} & You</span>
                            </div>
                            <div className="flex gap-4">
                              <Button onClick={() => setInConference(v => !v)} className={inConference ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}>
                                {inConference ? 'Leave Conference' : 'Join Conference'}
                              </Button>
                              <Button variant="outline" onClick={() => setShowConference(false)}>Close</Button>
                            </div>
                            <div className="bg-white rounded-xl border border-blue-100 shadow-inner p-6 mt-4 min-h-[120px] flex flex-col gap-2">
                              <div className="text-sm text-neutral-500 mb-2">Conference chat area (simulated)</div>
                              <div className="flex-1 text-neutral-700">{inConference ? 'You are in the conference. (Voice/Video not implemented)' : 'Join to participate in the conference.'}</div>
                            </div>
                          </div>
                        </ConferenceDialogContent>
                      </ConferenceDialog>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-3" style={{ maxHeight: '380px' }}>
                        {activeRoomMessages.map(msg => (
                          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}> 
                            {msg.sender !== 'You' && (
                              <img src={activeRoomObj.avatar} alt={msg.sender} className="w-8 h-8 rounded-full border-2 border-white shadow" />
                            )}
                            <div className={`max-w-xs px-5 py-3 rounded-2xl shadow-md text-base ${msg.sender === 'You' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-sm' : 'bg-white text-black border border-blue-100 rounded-bl-sm'}`} style={{ wordBreak: 'break-word' }}>
                              <div className="text-xs font-bold mb-1 opacity-70">{msg.sender}</div>
                              <div className="text-sm">{msg.text}</div>
                              <div className="text-[10px] text-neutral-400 mt-1 text-right">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            {msg.sender === 'You' && (
                              <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="You" className="w-8 h-8 rounded-full border-2 border-white shadow" />
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 px-8 py-5 bg-white/80 backdrop-blur-md border-t border-blue-100 rounded-b-2xl shadow-inner sticky bottom-0 z-10">
                        <Button type="button" size="icon" variant="ghost" className="rounded-full"><Smile className="w-6 h-6 text-purple-400" /></Button>
                        <Button type="button" size="icon" variant="ghost" className="rounded-full"><Upload className="w-6 h-6 text-blue-400" /></Button>
                        <Input
                          value={messageText}
                          onChange={e => setMessageText(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 rounded-full bg-white border border-blue-100 px-5 py-3 text-base shadow-sm focus:border-purple-400 focus:ring-purple-400"
                        />
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">Send</Button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-neutral-400 text-lg">Select a chat to start messaging.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === 'pitch' && (
            <div className="pb-20">
              <Placeholder icon={<BookOpen className="w-16 h-16 text-neutral-300" strokeWidth={1.5} />} title="Pitch & Demo Board" prompt="Show what you're building. Post updates, get feedback, and prepare for Demo Day." />
            </div>
          )}
          {tab === 'mentor' && (
            <div className="pb-20">
              <Placeholder icon={<UserCheck className="w-16 h-16 text-neutral-300" strokeWidth={1.5} />} title="MentorConnect" prompt="Get guidance from alumni, professors, or startup founders. Request quick advice or long-term mentorship." />
            </div>
          )}
          {tab === 'profile' && (
            <div className="pb-20">
              <div className="w-full max-w-6xl mx-auto mt-10">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-0 animate-fade-in mb-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-xl" />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-extrabold text-black tracking-tight uppercase font-brand">{profile.name}</h1>
                      <p className="text-neutral-600 text-lg font-brand">{profile.department} • {profile.year}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-black text-white font-bold">Active</Badge>
                        <span className="text-sm text-neutral-500">Member since 2022</span>
                      </div>
                    </div>
                    <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
                      <DialogTrigger asChild>
                        <Button className="bg-black text-white rounded-full px-6 py-2 font-bold uppercase tracking-widest">Edit Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl border-0 p-0">
                        <div className="p-8">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-extrabold text-black uppercase tracking-wide font-brand flex items-center gap-3 mb-4">
                              <User className="w-7 h-7 text-blue-500" /> Edit Profile
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-8">
                            {/* Profile Photo Upload */}
                            <div>
                              <div className="flex items-center gap-4 mb-2">
                                <span className="text-lg font-bold text-black flex items-center gap-2">
                                  <UserCircle className="w-6 h-6 text-purple-500" /> Profile Photo
                                </span>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="relative">
                                  <img
                                    src={uploadedAvatar || editProfile.avatar}
                                    alt="Profile Preview"
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                                  />
                                  {uploadedAvatar && (
                                    <button
                                      type="button"
                                      className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow hover:bg-red-500 hover:text-white border border-red-200"
                                      title="Remove uploaded photo"
                                      onClick={() => setUploadedAvatar(null)}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="profile-photo-upload"
                                  className="hidden"
                                  ref={fileInputRef}
                                  onChange={e => {
                                    const file = e.target.files && e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = ev => {
                                        setUploadedAvatar(ev.target?.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="px-6 py-2 font-semibold rounded-full shadow bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-2 border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all duration-200"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  Upload Photo
                                </Button>
                              </div>
                              <p className="text-xs text-neutral-400 mt-2">JPG, PNG, or GIF. Max 2MB.</p>
                            </div>
                            <div className="border-t border-neutral-200 my-4" />
                            {/* Role Selector */}
                            <div>
                              <span className="text-lg font-bold text-black flex items-center gap-2 mb-2">
                                <User className="w-6 h-6 text-blue-500" /> Role
                              </span>
                              <select
                                value={editProfile.role}
                                onChange={e => setEditProfile(prev => ({ ...prev, role: e.target.value }))}
                                className="mt-1 w-full border border-neutral-300 rounded-lg px-4 py-3 text-base bg-white focus:ring-2 focus:ring-blue-400"
                              >
                                <option value="Student">Student</option>
                                <option value="Professor">Professor</option>
                              </select>
                            </div>
                            <div className="border-t border-neutral-200 my-4" />
                            {/* Basic Info */}
                            <div>
                              <span className="text-lg font-bold text-black flex items-center gap-2 mb-2">
                                <FileText className="w-6 h-6 text-purple-500" /> Basic Information
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="text-sm font-medium text-neutral-700">Name</label>
                                  <Input 
                                    value={editProfile.name} 
                                    onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-neutral-700">Department</label>
                                  <Input 
                                    value={editProfile.department} 
                                    onChange={(e) => setEditProfile(prev => ({ ...prev, department: e.target.value }))}
                                    className="mt-1"
                                  />
                                </div>
                                {/* Year only for Student */}
                                {editProfile.role === 'Student' && (
                                  <div>
                                    <label className="text-sm font-medium text-neutral-700">Year</label>
                                    <Input 
                                      value={editProfile.year} 
                                      onChange={(e) => setEditProfile(prev => ({ ...prev, year: e.target.value }))}
                                      className="mt-1"
                                    />
                                  </div>
                                )}
                                {/* Gender Selector */}
                                <div>
                                  <label className="text-sm font-medium text-neutral-700">Gender</label>
                                  <select
                                    value={editProfile.gender}
                                    onChange={e => {
                                      const gender = e.target.value;
                                      setEditProfile(prev => ({
                                        ...prev,
                                        gender,
                                        avatar: gender === 'Male' ? maleAvatars[0] : femaleAvatars[0],
                                      }));
                                    }}
                                    className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-400"
                                  >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="border-t border-neutral-200 my-4" />
                            {/* Avatar Picker */}
                            <div>
                              <span className="text-lg font-bold text-black flex items-center gap-2 mb-2">
                                <UserCircle className="w-6 h-6 text-purple-500" /> Select Avatar
                              </span>
                              <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto mt-2 p-2 bg-white rounded-xl border border-neutral-200 shadow-inner">
                                {(editProfile.gender === 'Male' ? maleAvatars : femaleAvatars).map((avatarUrl, idx) => (
                                  <button
                                    key={avatarUrl}
                                    type="button"
                                    className={`rounded-full border-4 p-0.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm hover:scale-110 ${editProfile.avatar === avatarUrl ? 'border-blue-500 ring-2 ring-blue-300 scale-110' : 'border-transparent hover:border-blue-300'}`}
                                    onClick={() => setEditProfile(prev => ({ ...prev, avatar: avatarUrl }))}
                                  >
                                    <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Contact Info - Only for Student */}
                            {editProfile.role === 'Student' && (
                              <>
                                <div className="border-t border-neutral-200 my-4" />
                                <div>
                                  <span className="text-lg font-bold text-black flex items-center gap-2 mb-2">
                                    <Globe className="w-6 h-6 text-blue-500" /> Contact Information
                                  </span>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-neutral-700">Email</label>
                                      <Input 
                                        value={editProfile.email} 
                                        onChange={(e) => setEditProfile(prev => ({ ...prev, email: e.target.value }))}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-neutral-700">LinkedIn</label>
                                      <Input 
                                        value={editProfile.linkedin} 
                                        onChange={(e) => setEditProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-neutral-700">GitHub</label>
                                      <Input 
                                        value={editProfile.github} 
                                        onChange={(e) => setEditProfile(prev => ({ ...prev, github: e.target.value }))}
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            {/* Mentor Option - Only for Professor */}
                            {editProfile.role === 'Professor' && (
                              <>
                                <div className="border-t border-neutral-200 my-4" />
                                <div>
                                  <span className="text-lg font-bold text-black flex items-center gap-2 mb-2">
                                    <UserCheck className="w-6 h-6 text-green-500" /> Mentor Option
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      id="agreeToMentor"
                                      checked={editProfile.agreeToMentor}
                                      onChange={e => setEditProfile(prev => ({ ...prev, agreeToMentor: e.target.checked }))}
                                      className="w-5 h-5 border border-neutral-300 rounded"
                                    />
                                    <label htmlFor="agreeToMentor" className="text-sm text-neutral-700">Agree to mentor any idea</label>
                                  </div>
                                </div>
                              </>
                            )}
                            {/* Skills */}
                            <div className="border-t border-neutral-200 my-4" />
                            <div>
                              <span className="text-lg font-bold text-black flex items-center gap-2 mb-2">
                                <Code className="w-6 h-6 text-blue-500" /> Skills & Expertise
                              </span>
                              <div className="space-y-4">
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="Add a skill..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addSkill((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }}
                                    className="rounded-full border-2 border-blue-200 px-4 py-2"
                                  />
                                  <Button onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add a skill..."]') as HTMLInputElement;
                                    if (input) {
                                      addSkill(input.value);
                                      input.value = '';
                                    }
                                  }} className="bg-blue-500 text-white rounded-full px-6 py-2 font-bold shadow hover:bg-blue-600">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {editProfile.skills.map(skill => (
                                    <Badge key={skill} className="bg-blue-100 text-blue-700 font-semibold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                                      {skill}
                                      <button 
                                        onClick={() => removeSkill(skill)}
                                        className="ml-2 text-blue-400 hover:text-blue-700"
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {/* Save/Cancel Buttons */}
                            <div className="flex justify-end gap-4 mt-8">
                              <Button variant="outline" onClick={() => setShowEditProfile(false)} className="rounded-full px-6 py-2 font-bold border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700">Cancel</Button>
                              <Button onClick={saveProfile} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">Save Changes</Button>
                            </div>
                            {/* In the Edit Profile dialog content, after Skills & Expertise section, add Achievements editing UI */}
                            <div className="border-t border-neutral-200 my-4" />
                            <div>
                              <span className="text-lg font-bold text-black flex items-center gap-2 mb-4">
                                <Award className="w-6 h-6 text-yellow-500" /> Achievements
                              </span>
                              <div className="space-y-6">
                                {editProfile.achievements.map((ach, idx) => (
                                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-4 bg-gradient-to-br from-yellow-50 via-white to-blue-50 rounded-2xl border border-yellow-200 shadow-lg p-4 relative group transition-all duration-200 hover:shadow-2xl">
                                    {/* Icon Preview & Picker */}
                                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow border-2 border-yellow-300 bg-white mb-1">
                                        {ach.icon === 'Trophy' && <Trophy className="w-7 h-7 text-yellow-500" />}
                                        {ach.icon === 'Users' && <Users className="w-7 h-7 text-blue-500" />}
                                        {ach.icon === 'Lightbulb' && <Lightbulb className="w-7 h-7 text-green-500" />}
                                      </div>
                                      <select
                                        value={ach.icon}
                                        onChange={e => {
                                          const icon = e.target.value;
                                          setEditProfile(prev => ({
                                            ...prev,
                                            achievements: prev.achievements.map((a, i) => i === idx ? { ...a, icon } : a)
                                          }));
                                        }}
                                        className="border border-neutral-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-yellow-400"
                                      >
                                        <option value="Trophy">🏆 Trophy</option>
                                        <option value="Users">👥 Users</option>
                                        <option value="Lightbulb">💡 Lightbulb</option>
                                      </select>
                                    </div>
                                    {/* Color Picker */}
                                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                      <div className="w-8 h-8 rounded-full border-2 border-yellow-300 shadow" style={{ background: ach.color && ach.color.startsWith('#') ? ach.color : `#${ach.color || 'FFD700'}` }} />
                                      <input
                                        type="color"
                                        value={ach.color && ach.color.startsWith('#') ? ach.color : `#${ach.color || 'FFD700'}`}
                                        onChange={e => {
                                          const color = e.target.value.replace('#', '');
                                          setEditProfile(prev => ({
                                            ...prev,
                                            achievements: prev.achievements.map((a, i) => i === idx ? { ...a, color } : a)
                                          }));
                                        }}
                                        className="w-8 h-8 border-0 bg-transparent cursor-pointer"
                                        title="Pick color"
                                      />
                                    </div>
                                    {/* Fields Grid */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        value={ach.title}
                                        onChange={e => {
                                          const title = e.target.value;
                                          setEditProfile(prev => ({
                                            ...prev,
                                            achievements: prev.achievements.map((a, i) => i === idx ? { ...a, title } : a)
                                          }));
                                        }}
                                        placeholder="Title"
                                        className="border border-neutral-300 rounded px-3 py-2 text-base font-semibold bg-white focus:ring-2 focus:ring-yellow-400"
                                      />
                                      <input
                                        type="text"
                                        value={ach.description}
                                        onChange={e => {
                                          const description = e.target.value;
                                          setEditProfile(prev => ({
                                            ...prev,
                                            achievements: prev.achievements.map((a, i) => i === idx ? { ...a, description } : a)
                                          }));
                                        }}
                                        placeholder="Description"
                                        className="border border-neutral-300 rounded px-3 py-2 text-base bg-white focus:ring-2 focus:ring-yellow-400"
                                      />
                                    </div>
                                    {/* Remove Button */}
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="absolute top-2 right-2 text-red-500 hover:bg-red-100 opacity-70 group-hover:opacity-100 transition-opacity"
                                      onClick={() => setEditProfile(prev => ({
                                        ...prev,
                                        achievements: prev.achievements.filter((_, i) => i !== idx)
                                      }))}
                                      title="Remove achievement"
                                    >
                                      <X className="w-5 h-5" />
                                    </Button>
                                  </div>
                                ))}
                                {/* Add Achievement Button - new design, above Save/Cancel */}
                                <div className="flex justify-center mt-6 mb-8">
                                  <button
                                    type="button"
                                    className="w-full max-w-md flex flex-col items-center justify-center gap-2 border-2 border-dashed border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-blue-50 rounded-2xl px-8 py-8 shadow-md hover:shadow-xl hover:border-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200 cursor-pointer"
                                    onClick={() => setEditProfile(prev => ({
                                      ...prev,
                                      achievements: [
                                        ...prev.achievements,
                                        { title: '', description: '', icon: 'Trophy', color: 'FFD700' }
                                      ]
                                    }))}
                                    tabIndex={0}
                                    aria-label="Add Achievement"
                                  >
                                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-200 text-yellow-700 border-2 border-yellow-400 mb-2 shadow">
                                      <Plus className="w-7 h-7" />
                                    </span>
                                    <span className="text-lg font-bold text-yellow-700">Add Achievement</span>
                                    <span className="text-xs text-yellow-600">Highlight a new milestone or award</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Profile Tabs */}
                <Tabs value={profileTab} onValueChange={setProfileTab} className="w-full">
                  <TabsList
                    className="flex flex-row gap-0 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl shadow-2xl w-full justify-between px-2 py-2 mb-0 mt-0 transition-all duration-300"
                    style={{ minHeight: '3.5rem' }}
                  >
                    {profileTabItems.map(({ value, label, icon }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className={`mx-1 group relative flex flex-col items-center justify-center px-4 py-2 rounded-lg font-brand text-sm font-semibold transition-all duration-200 flex-1 max-w-[90px] cursor-pointer
                          hover:scale-105 hover:bg-neutral-200 hover:shadow
                          ${profileTab === value
                            ? 'text-blue-700 bg-gradient-to-r from-blue-100 via-pink-100 to-blue-50 shadow-xl border-2 border-blue-400 scale-105 z-10 font-bold'
                            : 'text-neutral-500 hover:text-blue-600'
                          }
                        `}
                        style={{ minWidth: 0 }}
                      >
                        <span className="flex items-center justify-center w-full mb-1">
                          {React.cloneElement(icon, {
                            className: `w-6 h-6 transition-all duration-200 ${profileTab === value ? 'text-blue-600 drop-shadow-tabicon' : 'text-neutral-400 group-hover:text-blue-500'}`
                          })}
                        </span>
                        <span className="text-center transition-all duration-200 leading-tight">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="w-full">
                    <TabsContent value="activity">{ActivityStatsTab()}</TabsContent>
                    <TabsContent value="coins">{CoinsTab()}</TabsContent>
                    <TabsContent value="skills">{SkillsTab()}</TabsContent>
                    <TabsContent value="contact">{ContactTab()}</TabsContent>
                    <TabsContent value="achievements">{AchievementsTab()}</TabsContent>
                    <TabsContent value="posts">{PostsTab()}</TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Vertical Sidebar */}
        <div className="fixed left-0 top-0 bottom-0 z-40 w-20 md:w-64 transition-all duration-300 bg-gradient-to-b from-white via-blue-50/50 to-white/90 backdrop-blur-sm border-r border-blue-100/50 shadow-2xl hover:shadow-2xl">
          <div className="flex flex-col h-full">
            {/* Navigation Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col h-full py-4 px-1.5">
              <TabsList className="flex flex-col gap-1.5 bg-transparent h-full justify-start">
                {/* BridgeLab Logo above Discover */}
                {tabItems[0].value === 'discover' && (
                  <div className="flex items-center justify-center mb-6 px-2">
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <img 
                        src={BridgeLabLogo} 
                        alt="BridgeLab" 
                        className="relative h-12 w-auto transform transition-transform duration-300 group-hover:scale-110" 
                      />
                    </div>
                  </div>
                )}
                
                {tabItems.map(({ value, label, icon }, index) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={`group relative flex items-center justify-start px-4 py-3 rounded-xl font-brand text-sm font-medium transition-all duration-300 w-full cursor-pointer
                      hover:bg-blue-50/80 hover:shadow-sm hover:translate-x-1
                      ${tab === value
                        ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100/70 shadow-sm border border-blue-200/80 font-semibold translate-x-1'
                        : 'text-neutral-600 hover:text-blue-600 hover:bg-blue-50/50'
                      }
                    `}
                  >
                    <span className={`flex items-center justify-center w-6 h-6 mr-3 rounded-full transition-all duration-300 ${
                      tab === value ? 'bg-blue-100 text-blue-600' : 'group-hover:bg-blue-100/50 text-neutral-500 group-hover:text-blue-500'
                    }`}>
                      {React.cloneElement(icon, {
                        className: `w-4 h-4 transition-all duration-300 ${tab === value ? 'scale-110' : 'group-hover:scale-110'}`
                      })}
                    </span>
                    <span className="hidden md:inline transition-all duration-300 font-medium">{label}</span>
                    {tab === value && (
                      <span className="absolute right-3 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            {/* Enhanced User Profile */}
            <div className="p-4 border-t border-blue-100/50 bg-gradient-to-b from-white/80 to-blue-50/30">
              <div className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="relative w-9 h-9 rounded-full border-2 border-white shadow-md transform transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="hidden md:block truncate">
                  <div className="text-sm font-semibold text-neutral-800 truncate group-hover:text-blue-700 transition-colors duration-300">
                    {profile.name}
                  </div>
                  <div className="text-xs text-neutral-500 group-hover:text-blue-500 transition-colors duration-300">
                    @{profile.name.toLowerCase().replace(/\s+/g, '')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {newPostDialog}

      {/* Edit Post Dialog */}
      <Dialog open={editingPostId !== null} onOpenChange={(open) => !open && cancelEditPost()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          
          {editPostData && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Title <span className="text-neutral-400">(optional)</span></label>
                <Input
                  value={editPostData.title}
                  onChange={(e) => setEditPostData(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Enter post title (optional)"
                  className="w-full"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Content</label>
                <div className="relative">
                  <Textarea
                    value={editPostData.content}
                    onChange={(e) => setEditPostData(prev => prev ? { ...prev, content: e.target.value } : null)}
                    placeholder="Write your post content..."
                    rows={6}
                    className="w-full pr-10"
                  />
                  {/* Emoji Picker Button */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-2 rounded-full hover:bg-neutral-100"
                    title="Add emoji"
                    onClick={() => setShowEditEmojiPicker(v => !v)}
                  >
                    <Smile className="w-6 h-6 text-yellow-400" />
                  </button>
                  {/* Emoji Picker Dropdown */}
                  {showEditEmojiPicker && (
                    <div className="absolute right-0 top-12 z-50 bg-white text-black rounded-xl shadow-xl p-2 flex flex-wrap gap-1 w-64 emoji-picker-container">
                      {emojiList.map(emoji => (
                        <button
                          key={emoji}
                          className="text-2xl p-1 hover:bg-neutral-200 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditPostData(prev => {
                              if (!prev) return null;
                              return { ...prev, content: prev.content + emoji };
                            });
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Tags (comma separated) <span className="text-neutral-400">(optional)</span></label>
                <Input
                  value={editPostData.tags}
                  onChange={(e) => setEditPostData(prev => prev ? { ...prev, tags: e.target.value } : null)}
                  placeholder="Enter tags separated by commas (optional)"
                  className="w-full"
                />
              </div>

              {/* Media */}
              {editPostData.media.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Media</label>
                  <div className="grid grid-cols-2 gap-4">
                    {editPostData.media.map((media, idx) => (
                      <div key={idx} className="relative">
                        {media.type === 'image' ? (
                          <img src={media.url} alt="Media" className="w-full h-32 object-cover rounded-lg" />
                        ) : (
                          <video src={media.url} className="w-full h-32 object-cover rounded-lg" controls />
                        )}
                        <button
                          onClick={() => setEditPostData(prev => prev ? { ...prev, media: prev.media.filter((_, i) => i !== idx) } : null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Poll Section */}
              {editPostData.poll && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-neutral-700">Poll Question</label>
                  <Input
                    value={editPostData.poll.question}
                    onChange={(e) => setEditPostData(prev => prev && prev.poll ? { ...prev, poll: { ...prev.poll, question: e.target.value } } : null)}
                    placeholder="Enter poll question"
                    className="w-full"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Poll Options</label>
                    {!canEditPoll(posts.find(p => p.id === editingPostId)!) && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                          ⚠️ Poll options cannot be edited because votes have been cast. Only the question can be modified.
                        </p>
                      </div>
                    )}
                    
                    {editPostData.poll.options.map((option, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            if (canEditPoll(posts.find(p => p.id === editingPostId)!)) {
                              setEditPostData(prev => prev && prev.poll ? {
                                ...prev,
                                poll: {
                                  ...prev.poll,
                                  options: prev.poll.options.map((opt, i) => i === idx ? e.target.value : opt)
                                }
                              } : null);
                            }
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1"
                          disabled={!canEditPoll(posts.find(p => p.id === editingPostId)!)}
                        />
                        {canEditPoll(posts.find(p => p.id === editingPostId)!) && editPostData.poll.options.length > 2 && (
                          <button
                            onClick={() => setEditPostData(prev => prev && prev.poll ? {
                              ...prev,
                              poll: {
                                ...prev.poll,
                                options: prev.poll.options.filter((_, i) => i !== idx)
                              }
                            } : null)}
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {canEditPoll(posts.find(p => p.id === editingPostId)!) && editPostData.poll.options.length < 6 && (
                      <button
                        onClick={() => setEditPostData(prev => prev && prev.poll ? {
                          ...prev,
                          poll: {
                            ...prev.poll,
                            options: [...prev.poll.options, '']
                          }
                        } : null)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add Option
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={cancelEditPost}>
                  Cancel
                </Button>
                <Button onClick={saveEditPost} disabled={false}>
                  Update Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm !== null} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-neutral-700">
              Are you sure you want to delete this post? This action is permanent.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteConfirm && deletePost(showDeleteConfirm)}
            >
              Delete Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={imageModal.isOpen} onOpenChange={(open) => !open && setImageModal(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black/95 backdrop-blur-sm border-0">
          <div className="relative w-full h-full">
            {/* Close button */}
            <button
              onClick={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Image */}
            <div className="flex items-center justify-center w-full h-full p-8">
              <img
                src={imageModal.imageUrl}
                alt={imageModal.imageAlt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer"
                style={{ maxHeight: 'calc(90vh - 4rem)' }}
                onDoubleClick={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
              />
            </div>
            
            {/* Option text overlay */}
            {imageModal.optionText && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold mb-2">{imageModal.optionText}</h3>
                  <p className="text-sm text-gray-300">Double-click to close</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer Navigation for BridgeLab */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center py-2 z-50 shadow-lg">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center justify-center px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        
        <button
          onClick={() => navigate('/library')}
          className="flex flex-col items-center justify-center px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Library className="w-6 h-6" />
          <span className="text-xs mt-1">Library</span>
        </button>
        
        <button
          onClick={() => navigate('/classroom')}
          className="flex flex-col items-center justify-center px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <School className="w-6 h-6" />
          <span className="text-xs mt-1">Classroom</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center px-2 py-1 text-blue-600 dark:text-blue-400"
        >
          <img src={BridgeLabLogo} alt="BridgeLab" className="w-6 h-6" />
          <span className="text-xs mt-1">BridgeLab</span>
        </button>
        
        <button
          onClick={() => navigate('/todo')}
          className="flex flex-col items-center justify-center px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <CheckSquare className="w-6 h-6" />
          <span className="text-xs mt-1">To-Do</span>
        </button>
        
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center justify-center px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default BridgeLab; 