import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { ThumbsUp, MessageCircle, Trash2, AlertCircle, Sparkles, Bell, FileText, Link, Upload, Search, FolderOpen, Download, Calendar, Clock, MapPin, Users, Plus, Star, Video, BookOpen, Lightbulb, Trophy, CheckCircle, UserCheck, BarChart3, MessageSquare, Library, CalendarDays, Send, Image, Paperclip, Calendar as CalendarIcon, X, File, FileImage, FileVideo, FileAudio, FileArchive, FileCode, Clock as ClockIcon, Phone, Pin, Settings, Play, Mic, Grid, List, Filter, Bookmark, Eye, Share2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from 'next-themes';
// 1. Import the logo at the top
import BridgeLabLogo from '../assets/bridgelab_logo.png';

interface AttachedFile {
  id: number;
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string | null;
}

interface MaterialRating {
  rating: number;
  timestamp: string;
  materialId?: number;
}

const dummyAssignments = [
  {
    id: 1,
    title: 'Math Assignment 1',
    description: 'Solve the problems in Chapter 2, pages 34-36.',
    due: '2024-06-10',
    status: 'Assigned',
  },
  {
    id: 2,
    title: 'Science Project',
    description: 'Prepare a model of the solar system.',
    due: '2024-06-15',
    status: 'Assigned',
  },
];

const dummyPeople = [
  { name: 'Mr. Smith', role: 'Teacher', avatar: '' },
  { name: 'Alice', role: 'Student', avatar: '' },
  { name: 'Bob', role: 'Student', avatar: '' },
];

const dummyGrades = [
  { 
    name: 'Alice', 
    assignment: 'Math Assignment 1', 
    status: 'checked',
    grade: 'A',
    marks: '18/20',
    submittedAt: '2024-06-05',
    feedback: 'Excellent work! Great problem-solving approach.'
  },
  { 
    name: 'Bob', 
    assignment: 'Math Assignment 1', 
    status: 'pending',
    grade: null,
    marks: null,
    submittedAt: null,
    feedback: null
  },
  { 
    name: 'Alice', 
    assignment: 'Science Project', 
    status: 'checked',
    grade: 'A-',
    marks: '17/20',
    submittedAt: '2024-06-08',
    feedback: 'Very creative project! Minor improvements in methodology.'
  },
  { 
    name: 'Bob', 
    assignment: 'Science Project', 
    status: 'checked',
    grade: 'B+',
    marks: '15/20',
    submittedAt: '2024-06-07',
    feedback: 'Good effort. Consider more detailed analysis next time.'
  },
];

const dummyCommunications = [
  {
    id: 1,
    title: 'Math Assignment Clarification',
    prompt: 'I need help understanding the quadratic formula problem in Chapter 3.',
    tags: ['math', 'homework', 'clarification'],
    author: { name: 'Alice', role: 'Student', avatar: '' },
    teacher: { name: 'Mr. Smith', role: 'Teacher', avatar: '' },
    createdAt: '2024-06-01',
    scheduledFor: null,
    upvotes: 2,
    status: 'active',
    priority: 'medium',
    replies: [
      {
        id: 11,
        author: { name: 'Mr. Smith', role: 'Teacher', avatar: '' },
        content: 'Great question! The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. Let me know if you need more examples.',
        upvotes: 3,
        createdAt: '2024-06-01',
        isTeacherReply: true,
        replies: [
          {
            id: 111,
            author: { name: 'Alice', role: 'Student', avatar: '' },
            content: 'Thank you! That helps a lot. Can you show me how to apply it to problem #15?',
            upvotes: 1,
            createdAt: '2024-06-01',
            replies: [],
          },
        ],
        attachments: [],
      },
    ],
    isPrivate: false,
    attachments: [],
  },
  {
    id: 2,
    title: 'Science Project Extension Request',
    prompt: 'Due to technical difficulties, I would like to request a 2-day extension for the science project.',
    tags: ['science', 'extension', 'request'],
    author: { name: 'Bob', role: 'Student', avatar: '' },
    teacher: { name: 'Mrs. Johnson', role: 'Teacher', avatar: '' },
    createdAt: '2024-06-02',
    scheduledFor: null,
    upvotes: 1,
    status: 'pending',
    priority: 'high',
    replies: [
      {
        id: 21,
        author: { name: 'Mrs. Johnson', role: 'Teacher', avatar: '' },
        content: 'I understand. Please submit your request through the official extension form and provide documentation of the technical issues.',
        upvotes: 2,
        createdAt: '2024-06-02',
        isTeacherReply: true,
        attachments: [],
    replies: [],
      },
    ],
    isPrivate: true,
    attachments: [],
  },
  {
    id: 3,
    title: 'Study Group Formation',
    prompt: 'Looking for classmates interested in forming a study group for the upcoming history exam.',
    tags: ['study-group', 'history', 'collaboration'],
    author: { name: 'Charlie', role: 'Student', avatar: '' },
    teacher: { name: 'Ms. Davis', role: 'Teacher', avatar: '' },
    createdAt: '2024-06-03',
    scheduledFor: null,
    upvotes: 4,
    status: 'active',
    priority: 'low',
    replies: [
      {
        id: 31,
        author: { name: 'Ms. Davis', role: 'Teacher', avatar: '' },
        content: 'Great initiative! I can help facilitate the study group. Let me know when you have enough participants.',
        upvotes: 3,
        createdAt: '2024-06-03',
        isTeacherReply: true,
        attachments: [],
        replies: [],
      },
      {
        id: 32,
        author: { name: 'Diana', role: 'Student', avatar: '' },
        content: 'I\'m interested! What time works best for everyone?',
        upvotes: 2,
        createdAt: '2024-06-03',
        attachments: [],
        replies: [],
      },
    ],
    isPrivate: false,
    attachments: [],
  },
];

const dummyNotifications = [
  {
    id: 1,
    type: 'teacher',
    message: 'Mr. Smith posted a new announcement: "Project due date extended!"',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'request',
    message: 'You have a new join request from Alice.',
    time: '10 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'system',
    message: 'System maintenance scheduled for this weekend.',
    time: '1 hour ago',
    read: true,
  },
];

const dummyStudyMaterials = [
  {
    id: 1,
    title: 'Math Chapter 2 Notes',
    type: 'document',
    category: 'Mathematics',
    description: 'Comprehensive notes covering algebra fundamentals',
    uploadedBy: 'Mr. Smith',
    uploadedAt: '2024-06-01',
    fileSize: '2.3 MB',
    downloads: 15,
    tags: ['algebra', 'notes', 'chapter2'],
    url: undefined,
    visits: undefined
  },
  {
    id: 2,
    title: 'Science Lab Safety Guidelines',
    type: 'document',
    category: 'Science',
    description: 'Important safety procedures for laboratory work',
    uploadedBy: 'Mrs. Johnson',
    uploadedAt: '2024-05-30',
    fileSize: '1.8 MB',
    downloads: 23,
    tags: ['safety', 'lab', 'guidelines'],
    url: undefined,
    visits: undefined
  },
  {
    id: 3,
    title: 'Khan Academy Algebra Course',
    type: 'link',
    category: 'Mathematics',
    description: 'Online course covering algebra concepts',
    uploadedBy: 'Mr. Smith',
    uploadedAt: '2024-05-29',
    url: 'https://www.khanacademy.org/math/algebra',
    visits: 8,
    tags: ['online', 'course', 'algebra'],
    fileSize: undefined,
    downloads: undefined
  },
  {
    id: 4,
    title: 'History Timeline Reference',
    type: 'document',
    category: 'History',
    description: 'Timeline of major historical events',
    uploadedBy: 'Ms. Davis',
    uploadedAt: '2024-05-28',
    fileSize: '3.1 MB',
    downloads: 12,
    tags: ['timeline', 'history', 'reference'],
    url: undefined,
    visits: undefined
  }
];

const dummyEvents = [
  {
    id: 1,
    title: 'Math Workshop: Advanced Algebra',
    type: 'workshop',
    category: 'Mathematics',
    description: 'Deep dive into advanced algebraic concepts and problem-solving techniques.',
    date: '2024-06-15',
    time: '10:00 AM - 12:00 PM',
    location: 'Room 201',
    organizer: 'Mr. Smith',
    capacity: 25,
    registered: 18,
    status: 'upcoming',
    tags: ['algebra', 'advanced', 'problem-solving'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop&crop=center'
  },
  {
    id: 2,
    title: 'Science Fair 2024',
    type: 'event',
    category: 'Science',
    description: 'Annual science fair showcasing student projects and innovations.',
    date: '2024-06-20',
    time: '2:00 PM - 5:00 PM',
    location: 'Gymnasium',
    organizer: 'Mrs. Johnson',
    capacity: 100,
    registered: 45,
    status: 'upcoming',
    tags: ['science', 'projects', 'innovation'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop&crop=center'
  },
  {
    id: 3,
    title: 'Study Skills Seminar',
    type: 'seminar',
    category: 'Academic Support',
    description: 'Learn effective study techniques and time management strategies.',
    date: '2024-06-12',
    time: '3:30 PM - 4:30 PM',
    location: 'Library',
    organizer: 'Ms. Davis',
    capacity: 30,
    registered: 22,
    status: 'upcoming',
    tags: ['study-skills', 'time-management'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center'
  },
  {
    id: 4,
    title: 'Coding Bootcamp',
    type: 'workshop',
    category: 'Technology',
    description: 'Introduction to programming with Python for beginners.',
    date: '2024-06-18',
    time: '1:00 PM - 3:00 PM',
    location: 'Computer Lab',
    organizer: 'Mr. Wilson',
    capacity: 20,
    registered: 20,
    status: 'full',
    tags: ['coding', 'python', 'beginner'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop&crop=center'
  },
  {
    id: 5,
    title: 'Art Exhibition Opening',
    type: 'event',
    category: 'Arts',
    description: 'Opening night of the student art exhibition featuring various mediums.',
    date: '2024-06-25',
    time: '6:00 PM - 8:00 PM',
    location: 'Art Gallery',
    organizer: 'Ms. Rodriguez',
    capacity: 50,
    registered: 35,
    status: 'upcoming',
    tags: ['art', 'exhibition', 'creative'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center'
  },
  {
    id: 6,
    title: 'Career Day',
    type: 'event',
    category: 'Career Development',
    description: 'Meet professionals from various fields and learn about career opportunities.',
    date: '2024-06-30',
    time: '9:00 AM - 2:00 PM',
    location: 'Auditorium',
    organizer: 'Mr. Brown',
    capacity: 80,
    registered: 60,
    status: 'upcoming',
    tags: ['career', 'networking', 'professionals'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop&crop=center'
  }
];

// Teacher data for messenger interface
const teachers = [
  {
    id: 1,
    name: 'Mr. Smith',
    subject: 'Mathematics',
    avatar: '',
    status: 'online',
    lastSeen: '2 min ago',
    unreadCount: 3,
    color: 'from-blue-400 to-indigo-500',
    emoji: '📐'
  },
  {
    id: 2,
    name: 'Mrs. Johnson',
    subject: 'Science',
    avatar: '',
    status: 'online',
    lastSeen: '5 min ago',
    unreadCount: 0,
    color: 'from-green-400 to-emerald-500',
    emoji: '🔬'
  },
  {
    id: 3,
    name: 'Ms. Davis',
    subject: 'History',
    avatar: '',
    status: 'offline',
    lastSeen: '1 hour ago',
    unreadCount: 1,
    color: 'from-purple-400 to-pink-500',
    emoji: '📚'
  },
  {
    id: 4,
    name: 'Mr. Wilson',
    subject: 'English',
    avatar: '',
    status: 'online',
    lastSeen: '1 min ago',
    unreadCount: 0,
    color: 'from-orange-400 to-red-500',
    emoji: '📖'
  }
];

// Sample chat messages for each teacher
const sampleChatMessages = {
  1: [ // Mr. Smith
    {
      id: 1,
      sender: 'teacher',
      content: 'Hi! I noticed you had a question about the quadratic formula. How can I help?',
      timestamp: '2024-06-01T10:30:00Z',
      attachments: [],
      isRead: true
    },
    {
      id: 2,
      sender: 'student',
      content: 'Yes, I\'m struggling with problem #15 in Chapter 3. Can you explain the steps?',
      timestamp: '2024-06-01T10:32:00Z',
      attachments: [],
      isRead: true
    },
    {
      id: 3,
      sender: 'teacher',
      content: 'Of course! Let me break it down step by step...',
      timestamp: '2024-06-01T10:35:00Z',
      attachments: [],
      isRead: true
    },
    {
      id: 4,
      sender: 'student',
      content: 'Thank you! That makes much more sense now.',
      timestamp: '2024-06-01T10:40:00Z',
      attachments: [],
      isRead: false
    }
  ],
  2: [ // Mrs. Johnson
    {
      id: 1,
      sender: 'teacher',
      content: 'Great work on your lab report! I especially liked your methodology section.',
      timestamp: '2024-06-01T14:20:00Z',
      attachments: [],
      isRead: true
    },
    {
      id: 2,
      sender: 'student',
      content: 'Thank you! I worked really hard on it. Do you have any suggestions for improvement?',
      timestamp: '2024-06-01T14:25:00Z',
      attachments: [],
      isRead: true
    }
  ],
  3: [ // Ms. Davis
    {
      id: 1,
      sender: 'student',
      content: 'Hi Ms. Davis, I\'m having trouble understanding the timeline of events in Chapter 5.',
      timestamp: '2024-06-01T16:15:00Z',
      attachments: [],
      isRead: true
    },
    {
      id: 2,
      sender: 'teacher',
      content: 'I\'d be happy to help! Let\'s schedule a quick meeting during office hours.',
      timestamp: '2024-06-01T16:20:00Z',
      attachments: [],
      isRead: false
    }
  ],
  4: [ // Mr. Wilson
    {
      id: 1,
      sender: 'teacher',
      content: 'Your essay on Shakespeare was excellent! I particularly enjoyed your analysis of the themes.',
      timestamp: '2024-06-01T11:45:00Z',
      attachments: [],
      isRead: true
    },
    {
      id: 2,
      sender: 'student',
      content: 'Thank you so much! I really enjoyed writing it.',
      timestamp: '2024-06-01T11:50:00Z',
      attachments: [],
      isRead: true
    }
  ]
};

const Classroom: React.FC = () => {
  const { theme } = useTheme();
  
  // Theme-aware styling variables
  const bgGradient = theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-white';
  const cardBg = theme === 'dark' ? 'bg-gray-800/95 border-gray-700/60 shadow-lg' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const textMuted = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const headerGradient = theme === 'dark' ? 'bg-gray-900/95' : 'bg-white';
  const statCardGradient = theme === 'dark' ? 'bg-gray-800/95' : 'bg-white';
  const rankCardGradient = theme === 'dark' ? 'bg-gray-800/95' : 'bg-white';
  const rankCardHover = theme === 'dark'
    ? 'relative transition-all duration-300 border border-gray-700/60 shadow-lg rounded-lg bg-gray-800/95'
    : 'relative transition-all duration-300 border border-gray-200 shadow-sm rounded-lg bg-white';
  
  const [communications, setCommunications] = useState(dummyCommunications);
  const [newCommunication, setNewCommunication] = useState({ 
    title: '', 
    prompt: '', 
    tags: '', 
    teacher: '',
    priority: 'medium',
    isPrivate: false
  });
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [studyMaterials, setStudyMaterials] = useState(dummyStudyMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'document',
    category: '',
    description: '',
    url: '',
    tags: [] as string[]
  });
  const [events, setEvents] = useState(dummyEvents);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'event',
    category: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop&crop=center'
  });
  const [selectedCourse, setSelectedCourse] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState({});

  // New state variables for enhanced features
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Messenger interface state variables
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messengerView, setMessengerView] = useState('list'); // 'list' or 'chat'
  const [chatAttachedFiles, setChatAttachedFiles] = useState<AttachedFile[]>([]);
  const [chatIsDragOver, setChatIsDragOver] = useState(false);
  const chatFileInputRef = useRef(null);
  const chatTextareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Enhanced messenger features
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceMessageDuration, setVoiceMessageDuration] = useState(0);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [chatTheme, setChatTheme] = useState('default'); // 'default', 'dark', 'colorful'
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [messageFontSize, setMessageFontSize] = useState('medium');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState({});
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [chatBackground, setChatBackground] = useState('default');
  const [showChatBackgrounds, setShowChatBackgrounds] = useState(false);

  // Enhanced study materials features
  const [studyMaterialCategories, setStudyMaterialCategories] = useState(['all', 'Mathematics', 'Science', 'History', 'English', 'Technology', 'Arts', 'Other']);
  const [selectedStudyCategory, setSelectedStudyCategory] = useState('all');
  const [studyMaterialView, setStudyMaterialView] = useState('grid'); // 'grid' or 'list'
  const [studyMaterialSortBy, setStudyMaterialSortBy] = useState('recent'); // 'recent', 'popular', 'name', 'size'
  const [showStudyMaterialDetails, setShowStudyMaterialDetails] = useState(false);
  const [selectedStudyMaterial, setSelectedStudyMaterial] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [studyMaterialRatings, setStudyMaterialRatings] = useState<Record<number, MaterialRating>>({});
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [materialToRate, setMaterialToRate] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [showMaterialPreview, setShowMaterialPreview] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [studyMaterialBookmarks, setStudyMaterialBookmarks] = useState<number[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [studyMaterialTags, setStudyMaterialTags] = useState<string[]>([]);
  const [selectedStudyTags, setSelectedStudyTags] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  // Add this state at the top level of the Classroom component, with other useState hooks:
  const [showFullDesc, setShowFullDesc] = useState({});

  // Add at the top of the Classroom component:
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalData, setProfileModalData] = useState(null);

  // Add at the top of the Classroom component:
  const [communicationTab, setCommunicationTab] = useState('teacher');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendMessages, setFriendMessages] = useState({});

  // State for user statuses (simulate dynamic add)
  // Type for status
  interface Status {
    id: number;
    user: string;
    status: string;
    time: string;
    media?: string;
    mediaType?: 'image' | 'video';
    thoughts?: string;
  }
  const [statuses, setStatuses] = useState<Status[]>([
    {
      id: 1,
      user: 'Alice',
      status: 'Completed the Science Project! 🎉',
      time: '2 hours ago',
    },
    {
      id: 2,
      user: 'Bob',
      status: 'Joined the Math Club.',
      time: '5 hours ago',
    },
    {
      id: 3,
      user: 'Mr. Smith',
      status: 'Uploaded new Algebra notes.',
      time: '1 day ago',
    },
  ]);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusImage, setNewStatusImage] = useState('');
  const [viewStatusUser, setViewStatusUser] = useState(null);

  // Add to status: support for video, photo, and thoughts
  const [newStatusMedia, setNewStatusMedia] = useState<{ url: string; type: 'image' | 'video' | null }>({ url: '', type: null });
  const [newStatusThoughts, setNewStatusThoughts] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleJoin = () => {
    setJoinOpen(false);
    setClassCode('');
  };

  // Communication handlers
  const handleCommunicationUpvote = (threadId, replyId = null) => {
    if (replyId) {
      setCommunications(communications.map(comm => 
        comm.id === threadId 
          ? {
              ...comm,
              replies: comm.replies.map(reply => 
                reply.id === replyId 
                  ? { ...reply, upvotes: reply.upvotes + 1 }
                  : reply
              )
            }
          : comm
      ));
    } else {
      setCommunications(communications.map(comm => 
        comm.id === threadId 
          ? { ...comm, upvotes: comm.upvotes + 1 }
          : comm
      ));
    }
  };

  const handleCommunicationReply = (threadId, replyId = null) => {
    // This would open a reply form in a real implementation
    console.log('Reply to communication:', threadId, replyId);
  };

  const handleCommunicationDelete = (threadId, replyId = null) => {
    if (replyId) {
      setCommunications(communications.map(comm => 
        comm.id === threadId 
          ? {
              ...comm,
              replies: comm.replies.filter(reply => reply.id !== replyId)
            }
          : comm
      ));
    } else {
      setCommunications(communications.filter(comm => comm.id !== threadId));
    }
  };

  const handleCommunicationReport = (threadId, replyId = null) => {
    console.log('Report communication:', threadId, replyId);
  };

  const handleCreateCommunication = () => {
    if (newCommunication.title && newCommunication.prompt && newCommunication.teacher) {
      const communication = {
        id: communications.length + 1,
        title: newCommunication.title,
        prompt: newCommunication.prompt,
        tags: newCommunication.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        priority: newCommunication.priority,
        author: { name: 'You', role: 'Student', avatar: '' },
        teacher: { name: newCommunication.teacher, role: 'Teacher', avatar: '' },
        createdAt: new Date().toISOString().split('T')[0],
        scheduledFor: null,
        upvotes: 0,
        status: 'pending',
        replies: [],
        isPrivate: newCommunication.isPrivate,
        attachments: []
      };
      setCommunications([communication, ...communications]);
      setNewCommunication({ title: '', prompt: '', tags: '', teacher: '', priority: 'medium', isPrivate: false });
      setShowCommunicationForm(false);
    }
  };

  const handleAISuggestCommunication = () => {
    console.log('AI suggest communication starter');
  };

  const handleAISummarizeCommunication = () => {
    console.log('AI summarize communications');
  };

  const handlePostComment = () => {
    if (commentText.trim() && selectedCourse) {
      const courseTeacherMap = {
        'mathematics': 'Mr. Smith',
        'science': 'Mrs. Johnson', 
        'history': 'Ms. Davis',
        'english': 'Mr. Wilson'
      };
      
      const currentTime = new Date().toISOString();
      const scheduledDateTime = scheduleMessage && scheduledDate && scheduledTime 
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() 
        : null;
      
      const newComment = {
        id: communications.length + 1,
        title: `Comment on ${selectedCourse}`,
        prompt: commentText,
        tags: selectedTags,
        author: { name: 'You', role: 'Student', avatar: '' },
        teacher: { name: courseTeacherMap[selectedCourse], role: 'Teacher', avatar: '' },
        createdAt: currentTime,
        scheduledFor: scheduledDateTime,
        upvotes: 0,
        status: scheduledDateTime ? 'scheduled' : 'pending',
        priority: 'medium',
        replies: [],
        isPrivate: isPrivate,
        attachments: attachedFiles.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.preview || URL.createObjectURL(file.file)
        }))
      };
      
      setCommunications([newComment, ...communications]);
      setCommentText('');
      setSelectedTags([]);
      setSelectedCourse('');
      setIsPrivate(false);
      setAttachedFiles([]);
      setScheduleMessage(false);
      setScheduledDate('');
      setScheduledTime('');
    }
  };

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleReplyClick = (threadId, replyId = null) => {
    const key = replyId ? `${threadId}-${replyId}` : threadId;
    setShowReplyInput(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setReplyingTo({ threadId, replyId });
    setReplyText('');
  };

  const handlePostReply = () => {
    if (replyText.trim() && replyingTo) {
      const { threadId, replyId } = replyingTo;
      
      const newReply = {
        id: Date.now(),
        author: { name: 'You', role: 'Student', avatar: '' },
        content: replyText,
        upvotes: 0,
        createdAt: new Date().toISOString(),
        isTeacherReply: false,
        replies: [],
        attachments: attachedFiles.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.preview || URL.createObjectURL(file.file)
        }))
      };

      setCommunications(communications.map(comm => {
        if (comm.id === threadId) {
          if (replyId) {
            // Reply to a specific reply
            const updateReplies = (replies) => {
              return replies.map(reply => {
                if (reply.id === replyId) {
                  return { ...reply, replies: [...reply.replies, newReply] };
                }
                return { ...reply, replies: updateReplies(reply.replies) };
              });
            };
            return { ...comm, replies: updateReplies(comm.replies) };
          } else {
            // Reply to main thread
            return { ...comm, replies: [...comm.replies, newReply] };
          }
        }
        return comm;
      }));

      setReplyText('');
      setReplyingTo(null);
      setShowReplyInput(prev => {
        const key = replyId ? `${threadId}-${replyId}` : threadId;
        return { ...prev, [key]: false };
      });
      setAttachedFiles([]);
    }
  };

  const handleCancelReply = () => {
    setReplyText('');
    setReplyingTo(null);
    setShowReplyInput({});
  };

  // File handling functions
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="w-4 h-4" />;
    if (fileType.includes('code') || fileType.includes('text')) return <FileCode className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | File[]) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect([file]);
          }
        }
      }
    }
  };

  const removeFile = (fileId: number) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const previewFile = (file: AttachedFile) => {
    if (file.type.startsWith('image/')) {
      setFilePreviewUrl(file.preview || URL.createObjectURL(file.file));
      setShowFilePreview(true);
    } else {
      // For non-image files, trigger download or open in new tab
      const url = URL.createObjectURL(file.file);
      window.open(url, '_blank');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getScheduledTimeText = () => {
    if (!scheduledDate || !scheduledTime) return '';
    const scheduled = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();
    const diffInMinutes = Math.floor((scheduled.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) return 'Past time';
    if (diffInMinutes < 60) return `In ${diffInMinutes} minutes`;
    if (diffInMinutes < 1440) return `In ${Math.floor(diffInMinutes / 60)} hours`;
    return `In ${Math.floor(diffInMinutes / 1440)} days`;
  };

  const categories = ['all', 'Mathematics', 'Science', 'History', 'English', 'Other'];

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadMaterial = () => {
    if (newMaterial.title && newMaterial.category) {
      const material = {
        id: studyMaterials.length + 1,
        ...newMaterial,
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: newMaterial.type === 'document' ? '1.5 MB' : undefined,
        downloads: newMaterial.type === 'document' ? 0 : undefined,
        visits: newMaterial.type === 'link' ? 0 : undefined,
        tags: []
      };
      setStudyMaterials([material, ...studyMaterials]);
      setNewMaterial({ title: '', type: 'document', category: '', description: '', url: '', tags: [] });
      setShowUploadForm(false);
    }
  };

  const handleDownload = (materialId) => {
    console.log(`Downloading material ${materialId}`);
  };

  const handleVisit = (materialId) => {
    console.log(`Visiting material ${materialId}`);
  };

  const eventTypes = ['all', 'event', 'workshop', 'seminar'];
  const eventCategories = ['all', 'Mathematics', 'Science', 'Technology', 'Arts', 'Academic Support', 'Career Development'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(eventSearchQuery.toLowerCase()));
    const matchesType = selectedEventType === 'all' || event.type === selectedEventType;
    return matchesSearch && matchesType;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'workshop': return <Lightbulb className="w-5 h-5" />;
      case 'seminar': return <BookOpen className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'workshop': return 'bg-orange-100 text-orange-600';
      case 'seminar': return 'bg-purple-100 text-purple-600';
      case 'event': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-700 border-green-200';
      case 'full': return 'bg-red-100 text-red-700 border-red-200';
      case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.category && newEvent.date) {
      const event = {
        id: events.length + 1,
        ...newEvent,
        organizer: 'You',
        registered: 0,
        status: 'upcoming',
        tags: [],
        featured: false
      };
      setEvents([event, ...events]);
      setNewEvent({ title: '', type: 'event', category: '', description: '', date: '', time: '', location: '', capacity: 0, image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop&crop=center' });
      setShowEventForm(false);
    }
  };

  const handleRegisterEvent = (eventId) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, registered: Math.min(event.registered + 1, event.capacity) }
        : event
    ));
  };

  // Messenger helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTeacher) {
      const newMsg = {
        id: Date.now(),
        sender: 'student',
        content: newMessage,
        timestamp: new Date().toISOString(),
        attachments: chatAttachedFiles.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.preview || URL.createObjectURL(file.file)
        })),
        isRead: false
      };

      setChatMessages(prev => ({
        ...prev,
        [selectedTeacher.id]: [...(prev[selectedTeacher.id] || []), newMsg]
      }));

      setNewMessage('');
      setChatAttachedFiles([]);
      
      // Simulate teacher typing and response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const teacherResponse = {
            id: Date.now() + 1,
            sender: 'teacher',
            content: 'Thanks for your message! I\'ll get back to you soon.',
            timestamp: new Date().toISOString(),
            attachments: [],
            isRead: true
          };
          
          setChatMessages(prev => ({
            ...prev,
            [selectedTeacher.id]: [...(prev[selectedTeacher.id] || []), teacherResponse]
          }));
          setIsTyping(false);
        }, 2000);
      }, 1000);
    }
  };

  const handleChatFileSelect = (files: FileList | File[]) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setChatAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleChatFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setChatIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleChatFileSelect(files);
    }
  };

  const removeChatFile = (fileId: number) => {
    setChatAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const openChat = (teacher) => {
    setSelectedTeacher(teacher);
    setMessengerView('chat');
    setChatMessages(prev => {
      if (!prev[teacher.id]) {
        return { ...prev, [teacher.id]: sampleChatMessages[teacher.id] || [] };
      }
      return prev;
    });
    setTimeout(scrollToBottom, 100);
  };

  const closeChat = () => {
    setMessengerView('list');
    setSelectedTeacher(null);
    setNewMessage('');
    setChatAttachedFiles([]);
  };

  // Enhanced messenger helper functions
  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setVoiceMessageDuration(0);
    // Simulate voice recording
    const interval = setInterval(() => {
      setVoiceMessageDuration(prev => prev + 1);
    }, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsRecordingVoice(false);
      setShowVoiceRecorder(false);
      // Add voice message to chat
      const voiceMessage = {
        id: Date.now(),
        sender: 'student',
        content: `Voice message (${voiceMessageDuration}s)`,
        timestamp: new Date().toISOString(),
        attachments: [],
        isRead: false,
        type: 'voice',
        duration: voiceMessageDuration
      };
      
      setChatMessages(prev => ({
        ...prev,
        [selectedTeacher.id]: [...(prev[selectedTeacher.id] || []), voiceMessage]
      }));
    }, 5000); // Stop after 5 seconds
  };

  const stopVoiceRecording = () => {
    setIsRecordingVoice(false);
    setShowVoiceRecorder(false);
  };

  const addReaction = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), { emoji: reaction, user: 'You', timestamp: new Date().toISOString() }]
    }));
    setShowReactionPicker(false);
    setSelectedMessageForReaction(null);
  };

  const pinMessage = (messageId) => {
    setPinnedMessages(prev => ({
      ...prev,
      [selectedTeacher.id]: [...(prev[selectedTeacher.id] || []), messageId]
    }));
  };

  const unpinMessage = (messageId) => {
    setPinnedMessages(prev => ({
      ...prev,
      [selectedTeacher.id]: (prev[selectedTeacher.id] || []).filter(id => id !== messageId)
    }));
  };

  const getFilteredTeachers = () => {
    return teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                           teacher.subject.toLowerCase().includes(teacherSearchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || teacher.subject.toLowerCase() === selectedSubject.toLowerCase();
      return matchesSearch && matchesSubject;
    });
  };

  const getFilteredMessages = () => {
    if (!messageSearchQuery.trim() || !selectedTeacher) return chatMessages[selectedTeacher.id] || [];
    
    return (chatMessages[selectedTeacher.id] || []).filter(message =>
      message.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
    );
  };

  const getChatBackgroundStyle = () => {
    switch (chatBackground) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'colorful':
        return 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100';
      case 'nature':
        return 'bg-gradient-to-br from-green-100 via-blue-100 to-teal-100';
      case 'sunset':
        return 'bg-gradient-to-br from-orange-100 via-red-100 to-pink-100';
      default:
        return 'bg-gray-50';
    }
  };

  const getMessageFontSize = () => {
    switch (messageFontSize) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  const emojis = ['😊', '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏', '🔥', '💯', '✨', '🤔', '👀', '💪', '🙏'];

  const chatBackgrounds = [
    { id: 'default', name: 'Default', preview: 'bg-gray-50' },
    { id: 'dark', name: 'Dark Mode', preview: 'bg-gray-900' },
    { id: 'colorful', name: 'Colorful', preview: 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100' },
    { id: 'nature', name: 'Nature', preview: 'bg-gradient-to-br from-green-100 via-blue-100 to-teal-100' },
    { id: 'sunset', name: 'Sunset', preview: 'bg-gradient-to-br from-orange-100 via-red-100 to-pink-100' }
  ];

  // Enhanced study materials helper functions
  const getFilteredStudyMaterials = () => {
    const filtered = studyMaterials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedStudyCategory === 'all' || material.category === selectedStudyCategory;
      const matchesBookmark = !showBookmarkedOnly || studyMaterialBookmarks.includes(material.id);
      const matchesTags = selectedStudyTags.length === 0 || 
                         selectedStudyTags.some(tag => material.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesBookmark && matchesTags;
    });

    // Sort materials
    switch (studyMaterialSortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'size':
        filtered.sort((a, b) => {
          const sizeA = parseFloat(a.fileSize?.replace(' MB', '') || '0');
          const sizeB = parseFloat(b.fileSize?.replace(' MB', '') || '0');
          return sizeB - sizeA;
        });
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }

    return filtered;
  };

  const handleRateMaterial = (materialId, rating) => {
    setStudyMaterialRatings(prev => ({
      ...prev,
      [materialId]: { rating, timestamp: new Date().toISOString() }
    }));
    setShowRatingDialog(false);
    setMaterialToRate(null);
    setUserRating(0);
  };

  const toggleBookmark = (materialId) => {
    setStudyMaterialBookmarks(prev => 
      prev.includes(materialId) 
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const getAverageRating = (materialId: number) => {
    const ratings = Object.values(studyMaterialRatings).filter((r: MaterialRating) => r.materialId === materialId);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r: MaterialRating) => sum + r.rating, 0) / ratings.length;
  };

  const getUserRating = (materialId: number) => {
    return studyMaterialRatings[materialId]?.rating || 0;
  };

  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(0);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'document': return <FileText className="w-6 h-6" />;
      case 'link': return <Link className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'audio': return <FileAudio className="w-6 h-6" />;
      case 'image': return <Image className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const getMaterialColor = (category) => {
    switch (category) {
      case 'Mathematics': return 'from-blue-400 to-indigo-500';
      case 'Science': return 'from-green-400 to-emerald-500';
      case 'History': return 'from-purple-400 to-pink-500';
      case 'English': return 'from-orange-400 to-red-500';
      case 'Technology': return 'from-cyan-400 to-blue-500';
      case 'Arts': return 'from-pink-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const formatStudyMaterialSize = (size) => {
    if (!size) return 'Unknown';
    return size;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Initialize chat messages
  useEffect(() => {
    setChatMessages(sampleChatMessages);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedTeacher]);

  function renderCommunicationReplies(replies, onUpvote, onReply, onDelete, onReport, depth = 0, threadId, showReplyInput, replyText, setReplyText, handlePostReply, handleCancelReply) {
    return replies.map(reply => (
      <div key={reply.id} className={`relative mt-3 ml-${depth * 6}`}> 
        {/* Connecting line for nested replies */}
        {depth > 0 && (
          <div className="absolute -left-4 top-6 h-full border-l-2 border-indigo-100" style={{height: '100%'}} />
        )}
        <Card className={`border-0 shadow-sm rounded-xl ${reply.isTeacherReply ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400' : 'bg-white'} transition-all duration-200`}> 
          <CardHeader className="flex flex-row items-center gap-2 pb-1">
            <Avatar className="shadow border border-gray-200 h-8 w-8">
              <AvatarFallback className={reply.isTeacherReply ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}>
                {reply.author.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900">{reply.author.name}</span>
            <Badge variant="outline" className={`ml-2 text-xs ${reply.isTeacherReply ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white/70 border-blue-200 text-blue-700'}`}>
              {reply.isTeacherReply ? '👨‍🏫 Teacher' : reply.author.role}
            </Badge>
            {reply.isTeacherReply && (
              <Badge variant="outline" className="ml-1 text-xs bg-green-100 border-green-200 text-green-700">
                ✓ Official Response
              </Badge>
            )}
            <span className="text-xs text-gray-500 ml-2">{reply.createdAt}</span>
          </CardHeader>
          <CardContent className="pt-0 pb-2 text-gray-800 text-base">
            {reply.content}
            <div className="flex gap-2 mt-2 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => onUpvote(reply.id)} className="bg-black text-white hover:bg-white hover:text-black border border-black">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upvote</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => onReply(reply.id)} className="bg-black text-white hover:bg-white hover:text-black border border-black">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reply</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => onReport(reply.id)} className="bg-black text-white hover:bg-white hover:text-black border border-black">
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Report</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(reply.id)} className="bg-black text-white hover:bg-white hover:text-black border border-black">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs text-gray-500">{reply.upvotes} upvotes</span>
              <Button size="sm" variant="ghost" className="bg-white text-black border border-black hover:bg-black hover:text-white px-2 py-1 text-xs font-semibold ml-2" onClick={() => onReply(reply.id)}>
                <Send className="w-3 h-3 mr-1" />
                Reply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reply Input for this specific reply */}
        {showReplyInput[`${threadId}-${reply.id}`] && (
          <div className="ml-6 mt-3 border-l-2 border-indigo-200 pl-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-indigo-500 text-white text-xs">Y</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-gray-700">Replying to {reply.author.name}</span>
              </div>
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] border-2 border-indigo-200 focus:border-indigo-400 rounded-lg text-sm"
                rows={2}
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelReply}
                  className="bg-white text-black border border-black hover:bg-black hover:text-white text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handlePostReply}
                  disabled={!replyText.trim()}
                  className="bg-black text-white hover:bg-white hover:text-black border border-black"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        )}

        {reply.replies && reply.replies.length > 0 && renderCommunicationReplies(reply.replies, onUpvote, onReply, onDelete, onReport, depth + 1, threadId, showReplyInput, replyText, setReplyText, handlePostReply, handleCancelReply)}
      </div>
    ));
  }

  // Dummy data for Activity section
  const dummyMovements = [
    {
      id: 1,
      media: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=250&fit=crop',
      caption: 'Math Club Movement',
      date: '2024-06-10',
    },
    {
      id: 2,
      media: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=250&fit=crop',
      caption: 'Science Lab Activity',
      date: '2024-06-09',
    },
    {
      id: 3,
      media: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=250&fit=crop',
      caption: 'Art Exhibition',
      date: '2024-06-08',
    },
  ];

  const dummyStatuses = [
    {
      id: 1,
      user: 'Alice',
      status: 'Completed the Science Project! 🎉',
      time: '2 hours ago',
    },
    {
      id: 2,
      user: 'Bob',
      status: 'Joined the Math Club.',
      time: '5 hours ago',
    },
    {
      id: 3,
      user: 'Mr. Smith',
      status: 'Uploaded new Algebra notes.',
      time: '1 day ago',
    },
  ];

  // State for status viewer (user and index)
  const [statusViewer, setStatusViewer] = useState<{ user: string; idx: number } | null>(null);

  // Function to get user statuses
  const getUserStatuses = (user: string) => statuses.filter(s => s.user === user);
  // Function to get current status
  const getCurrentStatus = () => statusViewer ? getUserStatuses(statusViewer.user)[statusViewer.idx] : null;

  const navigate = useNavigate();

  // --- STATUS FEATURE REWRITE START ---
  // Add at the top of the Classroom component:
  const [seenStatuses, setSeenStatuses] = useState<number[]>([]);
  const [statusTimer, setStatusTimer] = useState<NodeJS.Timeout | null>(null);

  // Helper: get all users with statuses (unique, your own first)
  const statusUsers = [
    { user: 'You', avatar: '', isSelf: true },
    ...statuses
      .filter(s => s.user !== 'You')
      .map(s => ({ user: s.user, avatar: '', isSelf: false }))
      .filter((v, i, arr) => arr.findIndex(u => u.user === v.user) === i)
  ];

  // Helper: get statuses for a user
 
  // Helper: is status seen
  const isStatusSeen = (status: Status) => seenStatuses.includes(status.id);

  // Helper: mark all statuses for a user as seen
  const markUserStatusesSeen = (user: string) => {
    const ids = getUserStatuses(user).map(s => s.id);
    setSeenStatuses(prev => Array.from(new Set([...prev, ...ids])));
  };

  // Status Carousel Bar
  const StatusCarousel = () => (
    <div className="flex gap-4 overflow-x-auto pb-2 px-1 scrollbar-hide scroll-snap-x">
      {/* Add Status (You) */}
      <div
        className="flex flex-col items-center min-w-[70px] cursor-pointer group scroll-snap-align-start"
        onClick={() => setShowAddStatus(true)}
        tabIndex={0}
        aria-label="Add your status"
      >
        <div className="relative transition-transform duration-200 group-hover:scale-105">
          <div className="w-16 h-16 rounded-full border-4 border-dashed border-blue-400 bg-gradient-to-tr from-blue-100 to-blue-200 flex items-center justify-center transition-all duration-200 group-hover:bg-gradient-to-tr group-hover:from-blue-200 group-hover:to-blue-100">
            <span className="text-4xl text-blue-600 font-bold select-none">+</span>
          </div>
          <span className="absolute bottom-0 right-0 bg-blue-400 rounded-full p-1 text-white font-bold text-lg border border-blue-500 transition-all duration-200 group-hover:scale-110">+</span>
        </div>
        <span className="text-xs font-semibold text-blue-700 mt-2 tracking-wide group-hover:underline">Add Status</span>
      </div>
      {/* Other Users' Statuses */}
      {statusUsers.filter(u => !u.isSelf).map(({ user }) => {
        const userStatuses = getUserStatuses(user);
        const allSeen = userStatuses.every(isStatusSeen);
        return (
          <div
            key={user}
            className="flex flex-col items-center min-w-[70px] cursor-pointer group scroll-snap-align-start"
            onClick={() => {
              setStatusViewer({ user, idx: 0 });
              markUserStatusesSeen(user);
            }}
            tabIndex={0}
            aria-label={`View ${user}'s status`}
          >
            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 group-hover:scale-105 ${
                allSeen
                  ? 'border-green-400 bg-gradient-to-tr from-green-100 to-green-50'
                  : 'border-blue-400 bg-gradient-to-tr from-blue-200 via-blue-100 to-blue-400 animate-spin-slow ring-4 ring-blue-200/40'
              }`}
              style={{
                background: allSeen
                  ? undefined
                  : 'conic-gradient(from 0deg, #3b82f6, #22d3ee, #3b82f6 100%)',
                boxShadow: undefined,
              }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 group-hover:bg-blue-50 ${allSeen ? 'bg-green-50 border-green-200' : 'bg-white border-blue-200'}`}>
                <span className={`text-xl font-bold select-none tracking-wide ${allSeen ? 'text-green-700' : 'text-blue-700'}`}>{user[0]}</span>
              </div>
              {!allSeen && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              )}
              {allSeen && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full"></span>
              )}
            </div>
            <span className={`text-xs font-semibold mt-2 truncate w-16 text-center tracking-wide group-hover:underline ${allSeen ? 'text-green-700' : 'text-blue-700'}`}>{user}</span>
          </div>
        );
      })}
    </div>
  );

  // Status Viewer (Fullscreen)
  useEffect(() => {
    if (!statusViewer) return;
    // Auto-advance timer
    if (statusTimer) clearTimeout(statusTimer);
    const userStatuses = getUserStatuses(statusViewer.user);
    if (statusViewer.idx < userStatuses.length) {
      const timer = setTimeout(() => {
        if (statusViewer.idx < userStatuses.length - 1) {
          setStatusViewer(v => v && { ...v, idx: v.idx + 1 });
        } else {
          setStatusViewer(null);
        }
      }, 3500);
      setStatusTimer(timer);
      // Mark as seen
      setSeenStatuses(prev => Array.from(new Set([...prev, userStatuses[statusViewer.idx].id])));
    }
    return () => { if (statusTimer) clearTimeout(statusTimer); };
  }, [statusViewer]);

  const StatusViewer = () => {
    if (!statusViewer) return null;
    const userStatuses = getUserStatuses(statusViewer.user);
    const status = userStatuses[statusViewer.idx];
    if (!status) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-blue-50 animate-fade-in">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 px-8 pt-6 z-30">
          {userStatuses.map((s, i) => (
            <div key={s.id} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < statusViewer.idx ? 'bg-green-400/80' : i === statusViewer.idx ? 'bg-blue-400 animate-progress-bar' : 'bg-green-200/60'}`}></div>
          ))}
        </div>
        {/* Top left: avatar, name, time */}
        <div className="absolute top-6 left-8 z-30 flex items-center gap-3 bg-blue-400/80 rounded-full px-4 py-2 backdrop-blur-md border border-blue-300">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg border border-blue-200 select-none">{status.user[0]}</div>
          <div>
            <div className="font-semibold text-blue-900 text-base tracking-wide">{status.user}</div>
            <div className="text-xs text-blue-800 font-mono">{status.time}</div>
          </div>
        </div>
        {/* Close button */}
        <button className="absolute top-6 right-8 z-30 bg-blue-400/80 hover:bg-blue-500 text-white rounded-full p-2 backdrop-blur-md border border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => setStatusViewer(null)}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
        {/* Left arrow */}
        <button className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-green-200/80 hover:bg-green-400 text-green-900 rounded-full p-3 border border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400" onClick={() => setStatusViewer(v => v && v.idx > 0 ? { ...v, idx: v.idx - 1 } : v)} disabled={statusViewer.idx === 0} style={{ opacity: statusViewer.idx === 0 ? 0.2 : 1 }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        {/* Right arrow */}
        <button className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-blue-200/80 hover:bg-blue-400 text-blue-900 rounded-full p-3 border border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => setStatusViewer(v => v && v.idx < userStatuses.length - 1 ? { ...v, idx: v.idx + 1 } : v)} disabled={statusViewer.idx === userStatuses.length - 1} style={{ opacity: statusViewer.idx === userStatuses.length - 1 ? 0.2 : 1 }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </button>
        {/* Media display */}
        <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in">
          {status.mediaType === 'image' && status.media && (
            <img src={status.media} alt="status" className="max-h-[70vh] max-w-[90vw] rounded-2xl object-contain border-4 border-blue-200 bg-white/10 transition-all duration-300" />
          )}
          {status.mediaType === 'video' && status.media && (
            <video src={status.media} controls autoPlay className="max-h-[70vh] max-w-[90vw] rounded-2xl bg-blue-50 border-4 border-blue-200 transition-all duration-300" />
          )}
          {/* Bottom overlay: status text and thoughts */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400/95 via-green-200/60 to-blue-200/80 p-8 pb-12 text-blue-900 flex flex-col items-center">
            <div className="text-3xl font-extrabold mb-3 text-center animate-fade-in tracking-tight leading-tight" style={{ textShadow: '0 2px 16px #60a5fa, 0 0 8px #fff3', letterSpacing: '-0.02em' }}>{status.status}</div>
            {status.thoughts && <div className="text-green-800/80 italic mb-2 text-lg text-center animate-fade-in font-light tracking-wide" style={{ textShadow: '0 2px 8px #34d399, 0 0 4px #fff2' }}>{status.thoughts}</div>}
          </div>
        </div>
      </div>
    );
  };
  // --- STATUS FEATURE REWRITE END ---

  // --- Add at the top of the Classroom component, after useState hooks ---
  const [assignmentUploads, setAssignmentUploads] = useState({}); // { [assignmentId]: { file: File | null, name: string } }
const [showCreateProgressCard, setShowCreateProgressCard] = useState(false);

  // Helper to handle file selection for assignments
  const handleAssignmentFileChange = (assignmentId, file) => {
    setAssignmentUploads(prev => ({
      ...prev,
      [assignmentId]: { file, name: file.name }
    }));
  };

  const removeAssignmentFile = (assignmentId) => {
    setAssignmentUploads(prev => ({
      ...prev,
      [assignmentId]: undefined
    }));
  };

  // Helper to calculate countdown
  const getCountdown = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  return (
    <div className={`min-h-screen py-12 px-4 md:px-8 flex flex-col items-center transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950' 
        : 'bg-white'
    }`}>
      <div className="w-full max-w-6xl relative">
        {/* Status Feature (moved above top-right controls) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
              <BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-black'}`} /> Status
            </h2>
          </div>
          <StatusCarousel />
        </div>
        {StatusViewer()}
        {/* Top-right controls: Join Classroom button, Club button, and Notification Bell */}
        <div className="flex justify-end gap-3 mb-6">
          <Button
            className="rounded-full px-8 py-3 text-xl font-extrabold tracking-wider bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white shadow-2xl border border-white/30 backdrop-blur-md bg-opacity-80 flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
            style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
            onClick={() => setJoinOpen(true)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M12 3L2 8.5L12 14L22 8.5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M6 10.5V16.5C6 17.3284 8.68629 18 12 18C15.3137 18 18 17.3284 18 16.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
            <span>Classroom</span>
          </Button>
          <Button
            className="rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-xl hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
            onClick={() => navigate('/clubs')}
          >
            Clubs
          </Button>
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-6 h-6 text-blue-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-lg">{unreadCount}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="font-bold text-lg text-blue-900">Notifications</span>
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0} className="text-xs">
                  Mark all read
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 flex items-start gap-3 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                      <div className="pt-1">
                        {n.type === 'teacher' && <Avatar className="h-6 w-6"><AvatarFallback>T</AvatarFallback></Avatar>}
                        {n.type === 'request' && <Avatar className="h-6 w-6"><AvatarFallback>R</AvatarFallback></Avatar>}
                        {n.type === 'system' && <Avatar className="h-6 w-6"><AvatarFallback>S</AvatarFallback></Avatar>}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 mb-1">{n.message}</div>
                        <div className="text-xs text-gray-500">{n.time}</div>
                      </div>
                      {!n.read && <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Join Classroom Dialog */}
        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Join a Classroom</DialogTitle>
              <DialogDescription>Enter your classroom code to join.</DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Classroom code"
              value={classCode}
              onChange={e => setClassCode(e.target.value)}
              className="mb-4 mt-2"
            />
            <Button className="w-full rounded-full" onClick={handleJoin} disabled={!classCode.trim()}>
              Join
            </Button>
          </DialogContent>
        </Dialog>
        <Card className={`w-full shadow-2xl border-0 rounded-3xl ${
          theme === 'dark' 
            ? 'bg-gray-800/95 border-gray-700/60' 
            : 'bg-white/95'
        }`}>
          <CardHeader className="flex flex-col items-center gap-3 pb-4">
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            <Tabs defaultValue="classwork" className="w-full">
              <TabsList className={`mb-6 flex justify-center gap-2 rounded-2xl p-2 shadow-lg border max-w-5xl mx-auto ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600'
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200'
              }`}>
                <TabsTrigger value="classwork" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>Classwork</span>
                </TabsTrigger>
                <TabsTrigger value="people" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <Users className="w-4 h-4" />
                  <span>People</span>
                </TabsTrigger>
                <TabsTrigger value="grades" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Status</span>
                </TabsTrigger>
                <TabsTrigger value="communication" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                  <span>Communication</span>
                </TabsTrigger>
                <TabsTrigger value="study-materials" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <Library className="w-4 h-4" />
                  <span>Study Materials</span>
                </TabsTrigger>
                <TabsTrigger value="events" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <CalendarDays className="w-4 h-4" />
                  <span>Events</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  <span>Activity</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Progress</span>
                </TabsTrigger>
                <TabsTrigger value="rank" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                    : 'data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                }`}>
                  <Trophy className="w-4 h-4" />
                  <span>Rank</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Classwork Tab */}
              <TabsContent value="classwork">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className={`text-2xl font-bold mb-1 ${textColor}`}>Classwork & Assignments</CardTitle>
                      <p className={`text-base ${textMuted}`}>Track your assignments and upcoming deadlines</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {dummyAssignments.map(assn => {
                    const countdown = getCountdown(assn.due);
                    const upload = assignmentUploads[assn.id];
                    return (
                      <Card key={assn.id} className={`border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-gray-700/60'
                          : 'bg-gradient-to-r from-green-50 to-blue-50'
                      }`}>
                        <CardHeader className="flex flex-row items-center gap-3 pb-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 shadow-md">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className={`text-lg font-bold transition-colors ${
                              theme === 'dark'
                                ? 'text-white group-hover:text-blue-400'
                                : 'text-gray-900 group-hover:text-blue-700'
                            }`}>{assn.title}</CardTitle>
                            <p className={`text-sm mt-1 ${textMuted}`}>{assn.description}</p>
                          </div>
                          <Badge className={`font-semibold px-3 py-1 shadow-md ${
                            theme === 'dark'
                              ? 'bg-gray-700/80 border-gray-600 text-green-400'
                              : 'bg-white/80 border-green-200 text-green-700'
                          }`} variant="outline">
                            {assn.status}
                          </Badge>
                          <Button size="sm" className="ml-2 bg-blue-500 text-white" onClick={() => navigate('/view-create')}>
                            View/Submit
                          </Button>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className={`flex items-center gap-2 ${textMuted}`}>
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium text-sm">Due: {assn.due}</span>
                              {/* Countdown Timer */}
                              {countdown ? (
                                <span className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                                  theme === 'dark'
                                    ? 'bg-blue-900/50 text-blue-300'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {countdown.days > 0 && `${countdown.days}d `}
                                  {countdown.hours}h {countdown.minutes}m {countdown.seconds}s left
                                </span>
                              ) : (
                                <span className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                                  theme === 'dark'
                                    ? 'bg-red-900/50 text-red-300'
                                    : 'bg-red-100 text-red-700'
                                }`}>Overdue</span>
                              )}
                            </div>
                            {/* Upload Work Feature */}
                            <div className="flex items-center gap-2">
                              <input
                                id={`upload-assignment-${assn.id}`}
                                type="file"
                                className="hidden"
                                onChange={e => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleAssignmentFileChange(assn.id, e.target.files[0]);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                className="rounded-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                                onClick={() => document.getElementById(`upload-assignment-${assn.id}`).click()}
                              >
                                {upload ? 'Change File' : 'Upload Work'}
                              </Button>
                              {upload && (
                                <span className={`text-xs rounded px-2 py-1 flex items-center gap-2 ${
                                  theme === 'dark'
                                    ? 'text-gray-300 bg-gray-700 border border-gray-600'
                                    : 'text-gray-700 bg-white border border-gray-200'
                                }`}>
                                  {upload.name}
                                  <Button size="icon" variant="ghost" className="h-5 w-5 p-0 text-red-500" onClick={() => removeAssignmentFile(assn.id)}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              {/* People Tab */}
              <TabsContent value="people">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className={`text-2xl font-bold mb-1 ${textColor}`}>Class Members</CardTitle>
                      <p className={`text-base ${textMuted}`}>Connect with your classmates and teachers</p>
                    </div>
                  </div>
                </div>

                {/* New Tabs for Teachers/Students */}
                <Tabs defaultValue="teachers" className="w-full">
                  <TabsList className={`mb-8 flex gap-4 rounded-2xl p-2 shadow-lg border max-w-lg mx-auto relative ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-gray-200'
                  }`}>
                    <TabsTrigger value="teachers" className={`flex items-center gap-2 px-6 py-2.5 rounded-xl relative transition-all duration-200 text-base font-medium ${
                      theme === 'dark'
                        ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                        : 'data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-700 data-[state=active]:font-semibold hover:bg-white/50'
                    }`}>
                      <UserCheck className="w-5 h-5" />
                      Teachers
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                        theme === 'dark'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-blue-100 text-blue-700'
                      }`}>{dummyPeople.filter(p => p.role === 'Teacher').length}</span>
                      <span className={`absolute left-0 right-0 -bottom-2 mx-auto w-2/3 h-1 rounded-full ${
                        theme === 'dark' ? 'bg-blue-600' : 'bg-blue-200'
                      } data-[state=active]:block hidden`}></span>
                    </TabsTrigger>
                    <TabsTrigger value="students" className={`flex items-center gap-2 px-6 py-2.5 rounded-xl relative transition-all duration-200 text-base font-medium ${
                      theme === 'dark'
                        ? 'data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-green-400 data-[state=active]:font-semibold hover:bg-gray-700/50 text-gray-300'
                        : 'data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-green-700 data-[state=active]:font-semibold hover:bg-white/50'
                    }`}>
                      <Users className="w-5 h-5" />
                      Students
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                        theme === 'dark'
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-green-100 text-green-700'
                      }`}>{dummyPeople.filter(p => p.role === 'Student').length}</span>
                      <span className={`absolute left-0 right-0 -bottom-2 mx-auto w-2/3 h-1 rounded-full ${
                        theme === 'dark' ? 'bg-green-600' : 'bg-green-200'
                      } data-[state=active]:block hidden`}></span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Teachers Tab */}
                  <TabsContent value="teachers">
                    <div className="mb-6 text-center">
                      <h2 className={`text-xl font-bold mb-1 ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                      }`}>Meet Your Teachers</h2>
                      <p className={`text-base ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                      }`}>Get to know your instructors and reach out for help anytime.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {dummyPeople.filter(person => person.role === 'Teacher').map((teacher, index) => (
                        <Card key={teacher.name} className="bg-white border-0 shadow-2xl rounded-3xl hover:shadow-blue-300 hover:scale-[1.03] transition-all duration-300 group overflow-hidden relative cursor-pointer">
                          <div className="absolute top-4 right-4 z-10">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10 flex flex-col items-center">
                              <Avatar className="h-20 w-20 shadow-lg border-4 border-white/20 group-hover:scale-110 transition-transform duration-300 mb-3">
                                <AvatarFallback className="bg-white/20 text-white font-bold text-2xl border-2 border-white/30">
                                  {teacher.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                              </Avatar>
                              <h3 className="text-lg font-bold text-white group-hover:text-blue-100 transition-colors mb-1">
                                {teacher.name}
                              </h3>
                              <p className="text-blue-100 text-sm font-medium mb-1">👨‍🏫 Lead Teacher</p>
                              <p className="text-blue-200 text-xs mb-1">Mathematics</p>
                              <p className="text-blue-200 text-xs mb-2">Email: <span className="underline">{teacher.name.toLowerCase().replace(/ /g, '.')}@school.edu</span></p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-blue-100">Online now</span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" className="bg-white/20 text-white hover:bg-white/30 rounded-full px-4">
                                  <MessageSquare className="w-4 h-4 mr-1" /> Message
                                </Button>
                                <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20 rounded-full">
                                  <Video className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20 rounded-full">
                                  <Phone className="w-4 h-4" />
                                </Button>
                              </div>
                              <Button size="sm" variant="secondary" className="mt-4 bg-white/30 text-white hover:bg-white/40 rounded-full px-4 py-1 text-xs font-semibold shadow" onClick={() => { setProfileModalData({ ...teacher, type: 'teacher' }); setProfileModalOpen(true); }}>
                                View Profile
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-blue-700 font-semibold text-sm">Office Hours</span>
                              <span className="text-xs text-blue-500">Mon, Wed, Fri • 2-4 PM</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-blue-700 font-semibold text-sm">Location</span>
                              <span className="text-xs text-blue-500">Room 201</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Students Tab */}
                  <TabsContent value="students">
                    <div className="mb-6 text-center">
                      <h2 className={`text-xl font-bold mb-1 ${
                        theme === 'dark' ? 'text-green-300' : 'text-green-900'
                      }`}>Meet Your Classmates</h2>
                      <p className={`text-base ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-700'
                      }`}>See who's in your class and connect for group work or study sessions.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {dummyPeople.filter(person => person.role === 'Student').map((student, index) => (
                        <Card key={student.name} className="bg-white border-0 shadow-2xl rounded-3xl hover:shadow-green-300 hover:scale-[1.03] transition-all duration-300 group overflow-hidden relative cursor-pointer">
                          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full shadow-lg ${index === 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            {index === 0 && (
                              <Badge className="bg-yellow-400 text-white text-xs font-bold ml-2 shadow">Top Performer</Badge>
                            )}
                          </div>
                          <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10 flex flex-col items-center">
                              <Avatar className="h-20 w-20 shadow-lg border-4 border-white/20 group-hover:scale-110 transition-transform duration-300 mb-3">
                                <AvatarFallback className="bg-white/20 text-white font-bold text-2xl border-2 border-white/30">
                                  {student.name[0]}
                                </AvatarFallback>
                            </Avatar>
                              <h3 className="text-lg font-bold text-white group-hover:text-green-100 transition-colors mb-1">
                                {student.name}
                              </h3>
                              <p className="text-green-100 text-sm font-medium mb-1">👨‍🎓 Classmate</p>
                              <p className="text-green-200 text-xs mb-2">Email: <span className="underline">{student.name.toLowerCase().replace(/ /g, '.')}@school.edu</span></p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                <span className="text-xs text-green-100">
                                  {index === 0 ? 'Online now' : 'Last seen 2h ago'}
                                </span>
                          </div>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" className="bg-white/20 text-white hover:bg-white/30 rounded-full px-4">
                                  <MessageSquare className="w-4 h-4 mr-1" /> Message
                                </Button>
                                <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20 rounded-full">
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              </div>
                              <Button size="sm" variant="secondary" className="mt-4 bg-white/30 text-white hover:bg-white/40 rounded-full px-4 py-1 text-xs font-semibold shadow" onClick={() => { setProfileModalData({ ...student, type: 'student' }); setProfileModalOpen(true); }}>
                                View Profile
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-green-700 font-semibold text-sm">Grade</span>
                              <span className="text-xs text-green-500">A+</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-green-700 font-semibold text-sm">Attendance</span>
                              <span className="text-xs text-green-500">95%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-semibold text-sm">Assignments</span>
                              <span className="text-xs text-green-500">12</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Class Statistics and Quick Actions (unchanged) */}
                <div className="mt-12 space-y-8">
                  {/* Class Statistics */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                      <CardTitle className="text-xl font-bold">Class Overview</CardTitle>
                      <p className="text-purple-100">Quick statistics about your class</p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">1</div>
                          <div className="text-sm text-gray-600 font-medium">Teacher</div>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">2</div>
                          <div className="text-sm text-gray-600 font-medium">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">2</div>
                          <div className="text-sm text-gray-600 font-medium">Assignments</div>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">85%</div>
                          <div className="text-sm text-gray-600 font-medium">Avg Grade</div>
                        </div>
                      </div>
                  </CardContent>
                </Card>

                  {/* Quick Actions */}
                  <Card className="bg-white border-0 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
                      <p className="text-gray-600">Connect and collaborate with your class</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 rounded-xl p-4 h-auto">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">Start Group Chat</div>
                              <div className="text-sm opacity-90">Create a study group</div>
                            </div>
                          </div>
                        </Button>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-xl p-4 h-auto">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">Schedule Meeting</div>
                              <div className="text-sm opacity-90">Book office hours</div>
                            </div>
                          </div>
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl p-4 h-auto">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Share2 className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">Share Resources</div>
                              <div className="text-sm opacity-90">Upload study materials</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Status Tab */}
              <TabsContent value="grades">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className={`text-2xl font-bold mb-1 ${textColor}`}>Assignment Status</CardTitle>
                      <p className={`text-base ${textMuted}`}>Track student progress and assignment submissions</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {dummyAssignments.map(assignment => (
                    <Card key={assignment.id} className={`border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                    }`}>
                      <CardHeader className={`border-b ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-gray-700'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 shadow-md">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                          <div>
                              <CardTitle className={`text-xl font-bold ${textColor}`}>{assignment.title}</CardTitle>
                            <p className={`text-sm mt-1 ${textMuted}`}>{assignment.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Calendar className={`w-4 h-4 ${textMuted}`} />
                                <span className={`text-xs font-medium ${textMuted}`}>Due: {assignment.due}</span>
                          </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`font-semibold px-4 py-2 text-sm shadow-md ${
                            theme === 'dark'
                              ? 'bg-gray-700/80 border-gray-600 text-blue-400'
                              : 'bg-white/80 border-blue-200 text-blue-700'
                          }`}>
                            {assignment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}>
                              <TableHead className={`font-bold text-sm ${textColor}`}>Student</TableHead>
                              <TableHead className={`font-bold text-sm ${textColor}`}>Status</TableHead>
                              <TableHead className={`font-bold text-sm ${textColor}`}>Submitted</TableHead>
                              <TableHead className={`font-bold text-sm ${textColor}`}>Grade</TableHead>
                              <TableHead className={`font-bold text-sm ${textColor}`}>Marks</TableHead>
                              <TableHead className={`font-bold text-sm ${textColor}`}>Feedback</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dummyGrades.filter(grade => grade.assignment === assignment.title).map((grade, index) => (
                              <TableRow key={index} className={`hover:bg-blue-50/30 border-b transition-colors ${
                                theme === 'dark' 
                                  ? 'hover:bg-blue-900/30 border-gray-700' 
                                  : 'hover:bg-blue-50/30 border-gray-100'
                              }`}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="shadow-lg border-2 border-white h-10 w-10">
                                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-bold text-base">
                                        {grade.name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className={`font-semibold text-sm ${textColor}`}>{grade.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={grade.status === 'checked' ? 'default' : 'secondary'}
                                    className={`${
                                      grade.status === 'checked' 
                                        ? theme === 'dark'
                                          ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-300 border-green-600'
                                          : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                                        : theme === 'dark'
                                          ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 text-yellow-300 border-yellow-600'
                                          : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200'
                                    } font-semibold px-3 py-1 text-xs shadow-md`}
                                  >
                                    {grade.status === 'checked' ? '✅ Checked' : '⏳ Pending'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className={`font-medium text-sm ${textMuted}`}>
                                    {grade.submittedAt ? grade.submittedAt : 'Not submitted'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {grade.grade ? (
                                    <Badge variant="outline" className={`font-bold text-lg px-3 py-1 shadow-md ${
                                      theme === 'dark'
                                        ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-600 text-blue-300'
                                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700'
                                    }`}>
                                      {grade.grade}
                                    </Badge>
                                  ) : (
                                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {grade.marks ? (
                                    <span className={`font-bold text-sm ${textColor}`}>{grade.marks}</span>
                                  ) : (
                                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {grade.feedback ? (
                                    <div className="max-w-xs">
                                      <p className={`text-xs line-clamp-2 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                      }`}>{grade.feedback}</p>
                                      <Button variant="ghost" size="sm" className={`p-0 h-auto mt-1 font-semibold text-xs ${
                                        theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                      }`}>
                                        View full feedback
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredMaterials.length === 0 && (
                  <div className="text-center py-16">
                    <div className={`rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <FolderOpen className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                    <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>No study materials found</h3>
                    <p className={`mb-6 ${textMuted}`}>Try adjusting your search or upload the first material!</p>
                    <Button onClick={() => setShowUploadForm(true)} className="bg-blue-600 text-white rounded-full px-8 py-3">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload First Material
                      </Button>
                    </div>
                )}
              </TabsContent>
              
              {/* Communication Tab */}
              <TabsContent value="communication">
                {messengerView === 'list' ? (
                  // Teacher List View
                  <div className="space-y-6">
                    {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 shadow-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                    <div>
                          <CardTitle className={`text-2xl font-bold mb-1 ${textColor}`}>Teacher Messenger</CardTitle>
                          <p className={`text-base ${textMuted}`}>Chat with your teachers for questions, clarifications, and support</p>
                </div>
                      </div>
                      </div>

                    {/* Search and Filter Bar */}
                    <Card className={`border rounded-2xl shadow-lg ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-700'
                        : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                    }`}>
                  <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Search */}
                          <div className="flex-1 relative">
                            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-500'
                            }`} />
                            <Input
                              placeholder="Search teachers by name or subject..."
                              value={teacherSearchQuery}
                              onChange={(e) => setTeacherSearchQuery(e.target.value)}
                              className={`pl-12 py-3 text-lg border-2 shadow-sm rounded-xl ${
                                theme === 'dark'
                                  ? 'border-indigo-600 focus:border-indigo-400 bg-gray-800/90 text-white'
                                  : 'border-indigo-200 focus:border-indigo-400 bg-white/90'
                              }`}
                            />
                          </div>
                          
                          {/* Subject Filter */}
                          <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className={`px-6 py-3 border-2 rounded-xl shadow-sm text-lg font-medium ${
                              theme === 'dark'
                                ? 'border-indigo-600 focus:border-indigo-400 bg-gray-800/90 text-white'
                                : 'border-indigo-200 focus:border-indigo-400 bg-white/90'
                            }`}
                          >
                            <option value="all">📚 All Subjects</option>
                            <option value="mathematics">📐 Mathematics</option>
                            <option value="science">🔬 Science</option>
                            <option value="history">📚 History</option>
                            <option value="english">📖 English</option>
                          </select>
                          
                          {/* Quick Stats */}
                          <div className={`flex items-center gap-4 px-4 py-2 rounded-xl border ${
                            theme === 'dark'
                              ? 'bg-gray-800/80 border-indigo-700'
                              : 'bg-white/80 border-indigo-200'
                          }`}>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${
                                theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                              }`}>{teachers.length}</div>
                              <div className={`text-xs ${textMuted}`}>Teachers</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${
                                theme === 'dark' ? 'text-green-400' : 'text-green-600'
                              }`}>
                                {teachers.filter(t => t.status === 'online').length}
                              </div>
                              <div className={`text-xs ${textMuted}`}>Online</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${
                                theme === 'dark' ? 'text-red-400' : 'text-red-600'
                              }`}>
                                {teachers.reduce((sum, t) => sum + t.unreadCount, 0)}
                              </div>
                              <div className={`text-xs ${textMuted}`}>Unread</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Teachers List */}
                    <div className="grid gap-4">
                      {getFilteredTeachers().map(teacher => (
                        <Card 
                          key={teacher.id} 
                          className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative overflow-hidden"
                          onClick={() => openChat(teacher)}
                        >
                          {/* Gradient Border Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl" />
                          
                          <CardContent className="p-6 relative">
                            <div className="flex items-center gap-4">
                              {/* Teacher Avatar */}
                              <div className="relative">
                                <Avatar className="h-16 w-16 shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300">
                                  <AvatarFallback className={`bg-gradient-to-r ${teacher.color} text-white font-bold text-xl`}>
                                    {teacher.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                                {/* Online Status */}
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                                  teacher.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`} />
                                
                                {/* Subject Badge */}
                                <div className="absolute -top-2 -left-2 bg-white rounded-full p-1 shadow-md">
                                  <span className="text-lg">{teacher.emoji}</span>
                                </div>
                              </div>
                              
                              {/* Teacher Info */}
                        <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {teacher.name}
                                  </h3>
                                  <Badge variant="outline" className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 font-semibold">
                                    {teacher.emoji} {teacher.subject}
                                  </Badge>
                                  {teacher.unreadCount > 0 && (
                                    <Badge className="bg-red-500 text-white font-bold animate-bounce">
                                      {teacher.unreadCount}
                                    </Badge>
                                  )}
                        </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <span className={`flex items-center gap-1 ${
                                    teacher.status === 'online' ? 'text-green-600' : 'text-gray-500'
                                  }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                      teacher.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                    }`} />
                                    {teacher.status === 'online' ? 'Online' : 'Offline'}
                                  </span>
                                  <span>•</span>
                                  <span>Last seen {teacher.lastSeen}</span>
                                </div>
                                
                                {/* Last Message Preview */}
                                {chatMessages[teacher.id] && chatMessages[teacher.id].length > 0 && (
                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-gray-500">
                                        {chatMessages[teacher.id][chatMessages[teacher.id].length - 1].sender === 'teacher' ? teacher.name : 'You'}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {formatTime(chatMessages[teacher.id][chatMessages[teacher.id].length - 1].timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 line-clamp-2">
                                      {chatMessages[teacher.id][chatMessages[teacher.id].length - 1].content}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col items-end gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-4 py-2 shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 group-hover:scale-105"
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Chat
                                </Button>
                                
                                {/* Quick Actions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-indigo-100">
                                    <Video className="w-4 h-4 text-indigo-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-indigo-100">
                                    <Phone className="w-4 h-4 text-indigo-600" />
                                  </Button>
                                </div>
                                
                                {teacher.unreadCount > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs animate-pulse">
                                    {teacher.unreadCount} new
                              </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* No Results */}
                      {getFilteredTeachers().length === 0 && (
                        <Card className="bg-white border-0 shadow-lg rounded-2xl p-8 text-center">
                          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">No teachers found</h3>
                          <p className="text-gray-500">Try adjusting your search or filters</p>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : (
                  // Chat View
                  <div className="h-[600px] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                      <div className="flex items-center gap-4">
                          <Button
                          variant="ghost" 
                            size="sm"
                          onClick={closeChat}
                          className="text-white hover:bg-white/20"
                          >
                          <X className="w-5 h-5" />
                          </Button>
                        
                        <Avatar className="h-12 w-12 border-2 border-white">
                          <AvatarFallback className={`bg-gradient-to-r ${selectedTeacher.color} text-white font-bold`}>
                            {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{selectedTeacher.name}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              selectedTeacher.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                            <span>{selectedTeacher.status === 'online' ? 'Online' : 'Offline'}</span>
                            <span>•</span>
                            <span>{selectedTeacher.subject}</span>
                        </div>
                        </div>
                      
                        <div className="flex gap-2">
                          {/* Message Search */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowMessageSearch(!showMessageSearch)}
                            className="text-white hover:bg-white/20"
                          >
                            <Search className="w-5 h-5" />
                          </Button>
                          
                          {/* Pinned Messages */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                            className="text-white hover:bg-white/20 relative"
                          >
                            <Pin className="w-5 h-5" />
                            {pinnedMessages[selectedTeacher.id]?.length > 0 && (
                              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1">
                                {pinnedMessages[selectedTeacher.id].length}
                            </Badge>
                            )}
                          </Button>
                          
                          {/* Chat Settings */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowChatSettings(!showChatSettings)}
                            className="text-white hover:bg-white/20"
                          >
                            <Settings className="w-5 h-5" />
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Video className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Phone className="w-5 h-5" />
                          </Button>
                  </div>
                </div>

                      {/* Message Search Bar */}
                      {showMessageSearch && (
                        <div className="mt-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                            <Input
                              placeholder="Search messages..."
                              value={messageSearchQuery}
                              onChange={(e) => setMessageSearchQuery(e.target.value)}
                              className="pl-10 pr-4 py-2 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Pinned Messages */}
                      {showPinnedMessages && pinnedMessages[selectedTeacher.id]?.length > 0 && (
                        <div className="mt-4 p-3 bg-white/20 rounded-lg">
                          <div className="text-sm font-medium mb-2">📌 Pinned Messages</div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {pinnedMessages[selectedTeacher.id].map(messageId => {
                              const message = chatMessages[selectedTeacher.id]?.find(m => m.id === messageId);
                              return message ? (
                                <div key={messageId} className="text-xs bg-white/10 rounded p-2">
                                  <div className="font-medium">{message.sender === 'teacher' ? selectedTeacher.name : 'You'}</div>
                                  <div className="truncate">{message.content}</div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Messages Area */}
                    <div className={`flex-1 overflow-y-auto p-4 ${getChatBackgroundStyle()}`}>
                      <div className="space-y-4">
                        {(messageSearchQuery ? getFilteredMessages() : chatMessages[selectedTeacher.id])?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'} group`}
                          >
                            <div className={`max-w-[70%] ${message.sender === 'student' ? 'order-2' : 'order-1'} relative`}>
                              <div className={`rounded-2xl px-4 py-3 ${
                                message.sender === 'student' 
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                                  : 'bg-white text-gray-900 shadow-md'
                              } ${messageSearchQuery && message.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) ? 'ring-2 ring-yellow-400' : ''}`}>
                                
                                {/* Voice Message */}
                                {message.type === 'voice' ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                      <Play className="w-4 h-4" />
                                </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{message.content}</div>
                                      <div className="text-xs opacity-75">{message.duration}s</div>
                              </div>
                                  </div>
                                ) : (
                                  <p className={`leading-relaxed ${getMessageFontSize()}`}>{message.content}</p>
                                )}
                                
                                {/* Message Attachments */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {message.attachments.map((attachment) => (
                                      <div
                                        key={attachment.id}
                                        className="flex items-center gap-2 bg-white/20 rounded-lg p-2 cursor-pointer hover:bg-white/30 transition-colors"
                                        onClick={() => window.open(attachment.url, '_blank')}
                                      >
                                        {getFileIcon(attachment.type)}
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-xs font-medium truncate max-w-32">
                                            {attachment.name}
                                          </span>
                                          <span className="text-xs opacity-75">
                                            {formatFileSize(attachment.size)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Message Reactions */}
                                {messageReactions[message.id] && messageReactions[message.id].length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {messageReactions[message.id].map((reaction, index) => (
                                      <Badge key={index} variant="outline" className="text-xs bg-white/20 border-white/30 text-white">
                                        {reaction.emoji}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                <div className={`text-xs mt-2 ${
                                  message.sender === 'student' ? 'text-white/70' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.timestamp)}
                                  {message.sender === 'student' && (
                                    <span className="ml-2">
                                      {message.isRead ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Message Actions (Hover) */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                    onClick={() => {
                                      setSelectedMessageForReaction(message.id);
                                      setShowReactionPicker(true);
                                    }}
                                    className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                                  >
                                    😊
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => pinMessage(message.id)}
                                    className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                                  >
                                    <Pin className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                            {/* Avatar */}
                            <div className={`flex-shrink-0 ${message.sender === 'student' ? 'order-1 ml-2' : 'order-2 mr-2'}`}>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-xs ${
                                  message.sender === 'student' 
                                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white' 
                                    : `bg-gradient-to-r ${selectedTeacher.color} text-white`
                                }`}>
                                  {message.sender === 'student' ? 'Y' : selectedTeacher.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="flex-shrink-0 mr-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-xs bg-gradient-to-r ${selectedTeacher.color} text-white`}>
                                  {selectedTeacher.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    
                    {/* Message Input */}
                    <div className="border-t border-gray-200 p-4 bg-white">
                        {/* Attached Files Preview */}
                      {chatAttachedFiles.length > 0 && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-2">Attached Files ({chatAttachedFiles.length})</div>
                            <div className="flex flex-wrap gap-2">
                            {chatAttachedFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                                  onClick={() => previewFile(file)}
                                >
                                  {getFileIcon(file.type)}
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                                      {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatFileSize(file.size)}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    removeChatFile(file.id);
                                    }}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="flex items-end gap-3">
                        {/* Emoji Picker */}
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-10 w-10 p-0 hover:bg-gray-100"
                            >
                              😊
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4" align="start">
                            <div className="grid grid-cols-8 gap-2">
                              {emojis.map((emoji, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setNewMessage(prev => prev + emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                  className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                                >
                                  {emoji}
                                </Button>
                              ))}
                          </div>
                          </PopoverContent>
                        </Popover>
                        
                        {/* Voice Recording */}
                        <div className="relative">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                            className={`h-10 w-10 p-0 hover:bg-gray-100 ${isRecordingVoice ? 'text-red-500 animate-pulse' : ''}`}
                          >
                            <Mic className="w-5 h-5" />
                          </Button>
                          
                          {/* Voice Recorder */}
                          {showVoiceRecorder && (
                            <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg p-4 shadow-lg w-64">
                              <div className="text-center">
                                <div className="text-sm font-medium mb-2">Voice Message</div>
                                {isRecordingVoice ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                      <span className="text-sm text-red-500">Recording... {voiceMessageDuration}s</span>
                                    </div>
                                    <Button
                                      onClick={stopVoiceRecording}
                                      className="bg-red-500 text-white hover:bg-red-600"
                                    >
                                      Stop Recording
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={startVoiceRecording}
                                    className="bg-indigo-500 text-white hover:bg-indigo-600"
                                  >
                                    Start Recording
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                    </div>
                        
                        {/* File Upload */}
                        <div className="relative">
                          <input
                            ref={chatFileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                            onChange={(e) => e.target.files && handleChatFileSelect(e.target.files)}
                            className="hidden"
                          />
                          <Button 
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => chatFileInputRef.current?.click()}
                            className="h-10 w-10 p-0 hover:bg-gray-100"
                          >
                            <Paperclip className="w-5 h-5 text-gray-600" />
                          </Button>
                        </div>
                        
                        {/* Message Input */}
                        <div className="flex-1 relative">
                          <div 
                            className={`border-2 border-gray-200 focus-within:border-indigo-400 rounded-xl transition-colors ${chatIsDragOver ? 'border-indigo-400 bg-indigo-50' : ''}`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setChatIsDragOver(true);
                            }}
                            onDragLeave={() => setChatIsDragOver(false)}
                            onDrop={handleChatFileDrop}
                          >
                            <Textarea
                              ref={chatTextareaRef}
                              placeholder="Type your message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="min-h-[44px] max-h-32 border-0 focus:ring-0 resize-none py-3 px-4"
                              rows={1}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            
                            {/* Drag & Drop Overlay */}
                            {chatIsDragOver && (
                              <div className="absolute inset-0 bg-indigo-100/80 flex items-center justify-center rounded-xl border-2 border-dashed border-indigo-400">
                                <div className="text-center">
                                  <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                                  <p className="text-indigo-700 font-medium text-sm">Drop files here</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Send Button */}
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() && chatAttachedFiles.length === 0}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl px-6 py-3 shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                          </Button>
                  </div>
                </div>
                    </div>
                )}
              </TabsContent>
              
              {/* Study Materials Tab */}
              <TabsContent value="study-materials">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 shadow-lg">
                          <Library className="w-6 h-6 text-white" />
                        </div>
                      <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 mb-1">Study Materials</CardTitle>
                          <p className="text-gray-600 text-base">Explore and organize your learning resources</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setShowUploadForm(true)} 
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full px-6 py-3 shadow-lg hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 font-semibold"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Material
                      </Button>
                    </div>
                  </div>

                  {/* Search and Filter Bar */}
                  <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                        <Input
                            placeholder="Search materials by title, description, or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 py-3 text-lg border-2 border-teal-200 focus:border-teal-400 bg-white/90 shadow-sm rounded-xl"
                        />
                      </div>
                        
                        {/* Category Filter */}
                          <select
                          value={selectedStudyCategory}
                          onChange={(e) => setSelectedStudyCategory(e.target.value)}
                          className="px-6 py-3 border-2 border-teal-200 focus:border-teal-400 rounded-xl bg-white/90 shadow-sm text-lg font-medium"
                        >
                          {studyMaterialCategories.map(category => (
                            <option key={category} value={category}>
                              {category === 'all' ? '📚 All Categories' : 
                               category === 'Mathematics' ? '📐 Mathematics' :
                               category === 'Science' ? '🔬 Science' :
                               category === 'History' ? '📚 History' :
                               category === 'English' ? '📖 English' :
                               category === 'Technology' ? '💻 Technology' :
                               category === 'Arts' ? '🎨 Arts' : '📁 Other'}
                            </option>
                          ))}
                          </select>
                        
                        {/* Sort By */}
                          <select
                          value={studyMaterialSortBy}
                          onChange={(e) => setStudyMaterialSortBy(e.target.value)}
                          className="px-6 py-3 border-2 border-teal-200 focus:border-teal-400 rounded-xl bg-white/90 shadow-sm text-lg font-medium"
                        >
                          <option value="recent">🕒 Most Recent</option>
                          <option value="popular">⭐ Most Popular</option>
                          <option value="name">📝 Alphabetical</option>
                          <option value="size">📦 File Size</option>
                          </select>
                        </div>
                      
                      {/* Advanced Controls */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-teal-200">
                        <div className="flex items-center gap-4">
                          {/* View Toggle */}
                          <div className="flex items-center gap-2 bg-white/80 rounded-lg p-1 border border-teal-200">
                            <Button
                              variant={studyMaterialView === 'grid' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setStudyMaterialView('grid')}
                              className={`${studyMaterialView === 'grid' ? 'bg-teal-500 text-white' : 'text-teal-600'} px-3 py-1`}
                            >
                              <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={studyMaterialView === 'list' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setStudyMaterialView('list')}
                              className={`${studyMaterialView === 'list' ? 'bg-teal-500 text-white' : 'text-teal-600'} px-3 py-1`}
                            >
                              <List className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Bookmark Filter */}
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showBookmarkedOnly}
                              onCheckedChange={setShowBookmarkedOnly}
                              className="data-[state=checked]:bg-teal-600"
                            />
                            <Label className="text-sm font-medium text-teal-700">Bookmarked Only</Label>
                          </div>
                        </div>
                        
                        {/* Advanced Filters Toggle */}
                          <Button
                            variant="outline"
                            size="sm"
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="border-teal-200 text-teal-600 hover:bg-teal-50"
                          >
                          <Filter className="w-4 h-4 mr-2" />
                          Advanced Filters
                          </Button>
                        </div>
                      
                      {/* Advanced Filters */}
                      {showAdvancedFilters && (
                        <div className="mt-4 pt-4 border-t border-teal-200 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-teal-700 mb-2 block">File Type</Label>
                              <select
                                value={fileTypeFilter}
                                onChange={(e) => setFileTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-teal-200 rounded-lg bg-white"
                              >
                                <option value="all">All Types</option>
                                <option value="document">Documents</option>
                                <option value="link">Links</option>
                                <option value="video">Videos</option>
                                <option value="audio">Audio</option>
                                <option value="image">Images</option>
                              </select>
                      </div>
                      <div>
                              <Label className="text-sm font-medium text-teal-700 mb-2 block">File Size</Label>
                              <select
                                value={sizeFilter}
                                onChange={(e) => setSizeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-teal-200 rounded-lg bg-white"
                              >
                                <option value="all">All Sizes</option>
                                <option value="small">Small (&lt; 1MB)</option>
                                <option value="medium">Medium (1-5MB)</option>
                                <option value="large">Large (&gt; 5MB)</option>
                              </select>
                      </div>
                        <div>
                              <Label className="text-sm font-medium text-teal-700 mb-2 block">Date Range</Label>
                              <div className="flex gap-2">
                          <Input
                                  type="date"
                                  value={dateRange.start}
                                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                  className="px-3 py-2 border border-teal-200 rounded-lg bg-white"
                                />
                                <Input
                                  type="date"
                                  value={dateRange.end}
                                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                  className="px-3 py-2 border border-teal-200 rounded-lg bg-white"
                          />
                        </div>
                    </div>
                    </div>
                            </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Materials Grid/List */}
                  {studyMaterialView === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredStudyMaterials().map(material => (
                        <Card key={material.id} className="bg-white border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
                          {/* Material Header */}
                          <div className="relative h-48 bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${getMaterialColor(material.category)} shadow-lg`}>
                                {getMaterialIcon(material.type)}
                            </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleBookmark(material.id)}
                                  className={`h-8 w-8 p-0 ${studyMaterialBookmarks.includes(material.id) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                                >
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setMaterialToRate(material);
                                    setShowRatingDialog(true);
                                  }}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-500"
                                >
                                  <Star className="w-4 h-4" />
                                </Button>
                          </div>
                        </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                {material.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {material.description}
                              </p>
                          </div>
                            
                            {/* Category Badge */}
                            <div className="absolute bottom-4 left-6">
                              <Badge variant="outline" className="bg-white/90 border-teal-200 text-teal-700 font-semibold">
                                {material.category}
                              </Badge>
                        </div>
                          </div>
                          
                          {/* Material Content */}
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Stats */}
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Download className="w-4 h-4" />
                                    {material.downloads || 0}
                                      </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {material.visits || 0}
                                      </span>
                                    </div>
                                <span className="text-xs">
                                  {getTimeAgo(material.uploadedAt)}
                                </span>
                                  </div>
                              
                              {/* Rating */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= getUserRating(material.id) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                ))}
                              </div>
                                <span className="text-sm text-gray-600">
                                  ({getUserRating(material.id) || 0}/5)
                                </span>
                            </div>
                              
                              {/* Tags */}
                              {material.tags && material.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {material.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                                {tag}
                              </Badge>
                            ))}
                                  {material.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                                      +{material.tags.length - 3}
                                    </Badge>
                                  )}
                            </div>
                              )}
                              
                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
                                  onClick={() => handleDownload(material.id)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                              </Button>
                          <Button 
                            size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedStudyMaterial(material);
                                    setShowStudyMaterialDetails(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                          </Button>
                          </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredStudyMaterials().map(material => (
                        <Card key={material.id} className="bg-white border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 group">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${getMaterialColor(material.category)} shadow-md`}>
                                {getMaterialIcon(material.type)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                    {material.title}
                                  </h3>
                                  <Badge variant="outline" className="bg-teal-50 border-teal-200 text-teal-700">
                                    {material.category}
                                  </Badge>
                                  {studyMaterialBookmarks.includes(material.id) && (
                                    <Bookmark className="w-4 h-4 text-yellow-500" />
                                  )}
                          </div>
                                
                                <p className="text-gray-600 mb-3 line-clamp-2">
                                  {material.description}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>By {material.uploadedBy}</span>
                                  <span>•</span>
                                  <span>{getTimeAgo(material.uploadedAt)}</span>
                                  <span>•</span>
                                  <span>{material.downloads || 0} downloads</span>
                                  <span>•</span>
                                  <span>{formatStudyMaterialSize(material.fileSize)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
                                  onClick={() => handleDownload(material.id)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                                <Button 
                                  variant="ghost"
                                  size="sm" 
                                  onClick={() => toggleBookmark(material.id)}
                                  className={studyMaterialBookmarks.includes(material.id) ? 'text-yellow-500' : 'text-gray-400'}
                                >
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                        </div>
                            </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                  )}

                  {/* Empty State */}
                  {getFilteredStudyMaterials().length === 0 && (
                    <Card className="bg-white border-0 shadow-lg rounded-2xl p-12 text-center">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Library className="w-12 h-12 text-gray-400" />
                    </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No study materials found</h3>
                      <p className="text-gray-500 mb-6">Try adjusting your search or upload the first material!</p>
                      <Button 
                        onClick={() => setShowUploadForm(true)} 
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full px-8 py-3 shadow-lg hover:from-teal-600 hover:to-emerald-600 transition-all duration-200"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload First Material
                    </Button>
                    </Card>
                )}
                </div>
              </TabsContent>
              
              {/* Events Tab */}
              <TabsContent value="events">
                <div className="mb-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 shadow-lg">
                        <CalendarDays className="w-8 h-8 text-white" />
                      </div>
                  <div>
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Events & Activities</CardTitle>
                        <p className="text-gray-600 text-lg">Discover workshops, seminars, and special events</p>
                  </div>
                    </div>
                    <Button onClick={() => setShowEventForm(true)} className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full px-8 py-3 shadow-lg hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 font-semibold">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Event
                  </Button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 mb-8 shadow-lg border border-teal-100">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                      <Input
                        placeholder="Search events by title, description, or tags..."
                        value={eventSearchQuery}
                        onChange={(e) => setEventSearchQuery(e.target.value)}
                        className="pl-12 py-3 text-lg border-2 border-teal-200 focus:border-teal-400 bg-white/90 shadow-sm rounded-xl"
                      />
                    </div>
                    <select
                      value={selectedEventType}
                      onChange={(e) => setSelectedEventType(e.target.value)}
                      className="px-6 py-3 border-2 border-teal-200 focus:border-teal-400 rounded-xl bg-white/90 shadow-sm text-lg font-medium"
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? '🎯 All Types' : 
                           type === 'workshop' ? '💡 Workshops' :
                           type === 'seminar' ? '📚 Seminars' : '📅 Events'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Create Event Dialog */}
                <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
                      <DialogTitle className="text-2xl font-bold text-blue-900">Create New Event</DialogTitle>
                      <DialogDescription className="text-gray-600">Organize a workshop, seminar, or special event for your class.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {/* Image Upload Section */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Event Image</label>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors cursor-pointer"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setNewEvent({ ...newEvent, image: e.target?.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          {newEvent.image ? (
                            <div className="relative">
                              <img 
                                src={newEvent.image} 
                                alt="Event preview" 
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewEvent({ ...newEvent, image: '' });
                                }}
                                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-xs"
                              >
                                Change
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-600 mb-2 text-sm font-medium">Click to upload or drag and drop</p>
                              <p className="text-gray-500 text-xs mb-3">PNG, JPG, GIF up to 10MB</p>
                              <div className="mt-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 10 * 1024 * 1024) {
                                        alert('File size must be less than 10MB');
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        setNewEvent({ ...newEvent, image: e.target?.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                  id="image-upload"
                                />
                                <Button variant="outline" size="sm" className="cursor-pointer text-xs">
                                  <Upload className="w-3 h-3 mr-1" />
                                  Choose Image
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Event Title</label>
                        <Input
                          placeholder="e.g., Math Workshop: Advanced Algebra"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          className="py-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                          <select
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                          >
                            <option value="event">📅 Event</option>
                            <option value="workshop">💡 Workshop</option>
                            <option value="seminar">📚 Seminar</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                          <select
                            value={newEvent.category}
                            onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                          >
                            <option value="">Select Category</option>
                            {eventCategories.filter(c => c !== 'all').map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                        <Textarea
                          placeholder="Brief description of the event..."
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="py-2"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                          <Input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            className="py-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Time</label>
                          <Input
                            placeholder="e.g., 10:00 AM - 12:00 PM"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className="py-2"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                          <Input
                            placeholder="e.g., Room 201"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="py-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Capacity</label>
                          <Input
                            type="number"
                            placeholder="25"
                            value={newEvent.capacity}
                            onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) || 0 })}
                            className="py-2"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                      <Button variant="outline" onClick={() => setShowEventForm(false)} className="px-6">Cancel</Button>
                      <Button onClick={handleCreateEvent} className="bg-green-600 text-white px-8 py-2 rounded-full">Create Event</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map(event => {
                    const registrationPercent = Math.min(100, Math.round((event.registered / event.capacity) * 100));
                    return (
                      <Card
                        key={event.id}
                        className={`relative bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden ${event.featured ? 'ring-2 ring-yellow-400 shadow-yellow-200' : ''}`}
                        style={{ minHeight: 420 }}
                      >
                        {/* Event Image */}
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          
                          {/* Featured Badge */}
                          {event.featured && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1.5 font-bold shadow-lg text-xs backdrop-blur-sm">
                                <Star className="w-3 h-3 mr-1" /> Featured
                              </Badge>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge variant="outline" className={`${getStatusColor(event.status)} font-bold shadow-lg backdrop-blur-sm bg-white/95 px-3 py-1.5 text-xs border-2`}>
                              {event.status === 'upcoming' ? '📅 Upcoming' : event.status === 'full' ? '🚫 Full' : '🔄 Ongoing'}
                            </Badge>
                          </div>
                          
                          {/* Quick Bookmark */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-3 right-3 z-10 bg-white/90 hover:bg-yellow-100 rounded-full p-2 text-gray-500 hover:text-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          
                          {/* Event Type Icon */}
                          <div className="absolute bottom-3 left-3">
                            <div className={`p-2.5 rounded-xl ${getEventTypeColor(event.type)} shadow-lg backdrop-blur-sm bg-white/90 border-2 border-white/50`}>
                              {getEventIcon(event.type)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <CardContent className="p-5 flex flex-col gap-3">
                          {/* Title & Organizer */}
                          <div className="flex items-start gap-3 mb-2">
                            <Avatar className="h-8 w-8 shadow-md border-2 border-white">
                              <AvatarFallback className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                                {event.organizer.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                {event.title}
                              </CardTitle>
                              <div className="text-sm text-gray-600 font-medium">by {event.organizer}</div>
                            </div>
                          </div>
                          
                          {/* Compact Details Row */}
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2 bg-gray-50/50 rounded-lg p-3">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-4 h-4 text-blue-500" /> {event.date}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-4 h-4 text-green-500" /> {event.time}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin className="w-4 h-4 text-red-500" /> {event.location}
                            </span>
                          </div>
                          
                          {/* Tags */}
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {event.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 px-2.5 py-1 font-medium hover:bg-blue-100 transition-colors">
                                  #{tag}
                                </Badge>
                              ))}
                              {event.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 text-gray-600 px-2.5 py-1 font-medium">
                                  +{event.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Registration Progress */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">Registration Progress</span>
                              <span className="text-sm text-gray-500 font-semibold">{event.registered}/{event.capacity}</span>
                            </div>
                            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  registrationPercent >= 80 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                  registrationPercent >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                                  'bg-gradient-to-r from-green-400 to-blue-500'
                                }`} 
                                style={{ width: `${registrationPercent}%` }} 
                              />
                            </div>
                          </div>
                          
                          {/* Description (expandable) */}
                          <div className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {event.description.length > 80 && !showFullDesc[event.id] ? (
                              <>
                                {event.description.slice(0, 80)}...{' '}
                                <button 
                                  className="text-blue-600 hover:text-blue-800 underline text-sm font-medium transition-colors" 
                                  onClick={() => setShowFullDesc(prev => ({...prev, [event.id]: true}))}
                                >
                                  Read more
                                </button>
                              </>
                            ) : (
                              <>
                                {event.description}{' '}
                                {event.description.length > 80 && (
                                  <button 
                                    className="text-blue-600 hover:text-blue-800 underline text-sm font-medium transition-colors" 
                                    onClick={() => setShowFullDesc(prev => ({...prev, [event.id]: false}))}
                                  >
                                    Show less
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                              disabled={event.status === 'full'}
                              onClick={() => handleRegisterEvent(event.id)}
                            >
                              {event.status === 'full' ? 'Event Full' : 'Register Now'}
                            </Button>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl p-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                title="Share Event"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl p-2 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                                title="Add to Calendar"
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl p-2 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                                title="Set Reminder"
                              >
                                <Bell className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                        
                {filteredEvents.length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-12 h-12 text-gray-400" />
                          </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or create the first event!</p>
                    <Button onClick={() => setShowEventForm(true)} className="bg-green-600 text-white rounded-full px-8 py-3">
                      <Plus className="w-5 h-5 mr-2" />
                      Create First Event
                    </Button>
                        </div>
                )}
              </TabsContent>
              
              {/* Activity Tab */}
              <TabsContent value="activity">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Activity</CardTitle>
                        <p className="text-gray-600 text-lg">Class movements and status updates</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Movements Section */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
                      <Image className="w-5 h-5 text-yellow-400" /> Movements
                    </h2>
                  </div>
                  <Card className="bg-white border-0 shadow-lg rounded-2xl p-8">
                    {dummyMovements.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {dummyMovements.map(movement => (
                          <div key={movement.id} className="rounded-xl overflow-hidden shadow group relative">
                            <img src={movement.media} alt={movement.caption} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <div className="text-white font-semibold text-base">{movement.caption}</div>
                              <div className="text-xs text-gray-200">{movement.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">No movement photos yet.</div>
                    )}
                  </Card>
                </div>
                {/* Add Status Dialog */}
                <Dialog open={showAddStatus} onOpenChange={setShowAddStatus}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add a Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Large Preview Area */}
                      {(newStatusMedia.url || newStatusText) && (
                        <div className="rounded-xl border-2 border-blue-400 bg-gradient-to-tr from-blue-50 to-blue-100 p-4 flex flex-col items-center justify-center min-h-[120px] mb-2 transition-all duration-200">
                          {newStatusMedia.url && newStatusMedia.type === 'image' && (
                            <img src={newStatusMedia.url} alt="preview" className="rounded-lg max-h-40 mb-2 border border-blue-200" />
                          )}
                          {newStatusMedia.url && newStatusMedia.type === 'video' && (
                            <video src={newStatusMedia.url} controls className="rounded-lg max-h-40 w-full mb-2 border border-blue-200" />
                          )}
                          {newStatusText && (
                            <div className="text-lg font-semibold text-blue-900 text-center whitespace-pre-line tracking-tight leading-tight">{newStatusText}</div>
                          )}
                        </div>
                      )}
                      {/* Drag and Drop Area */}
                      <div
                        className="border-2 border-dashed border-blue-400 rounded-xl p-4 text-center bg-gradient-to-tr from-blue-50 to-blue-100 hover:bg-gradient-to-tr hover:from-blue-100 hover:to-blue-50 transition-colors cursor-pointer"
                        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-100'); }}
                        onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('bg-blue-100'); }}
                        onDrop={e => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-blue-100');
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
                            setNewStatusMedia({ url, type });
                          }
                        }}
                        onClick={() => document.getElementById('status-file-upload')?.click()}
                      >
                        <span className="block text-blue-500 text-2xl mb-1">📷</span>
                        <span className="text-blue-700 font-medium">Click or drag & drop to add photo/video</span>
                        <input
                          id="status-file-upload"
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
                              setNewStatusMedia({ url, type });
                            }
                          }}
                        />
                      </div>
                      {/* Emoji Picker */}
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500 text-xl">😊</span>
                        <Button variant="ghost" size="sm" onClick={() => setNewStatusText(newStatusText + '😊')} className="text-blue-700">Add Emoji</Button>
                        <Button variant="ghost" size="sm" onClick={() => setNewStatusText(newStatusText + '🎉')} className="text-green-700">🎉</Button>
                        <Button variant="ghost" size="sm" onClick={() => setNewStatusText(newStatusText + '🔥')} className="text-green-700">🔥</Button>
                        <Button variant="ghost" size="sm" onClick={() => setNewStatusText(newStatusText + '💡')} className="text-blue-700">💡</Button>
                      </div>
                      {/* Status Text Input */}
                      <Textarea
                        placeholder="What's on your mind? (Status text)"
                        value={newStatusText}
                        onChange={e => setNewStatusText(e.target.value)}
                        rows={3}
                        className="rounded-lg border-blue-400 focus:border-blue-500 bg-gradient-to-tr from-blue-50 to-blue-100 text-blue-900 tracking-tight leading-tight"
                      />
                      {/* Thoughts Input */}
                      <Input
                        placeholder="Thoughts (optional)"
                        value={newStatusThoughts}
                        onChange={e => setNewStatusThoughts(e.target.value)}
                        className="mt-1 border-green-400 focus:border-green-500 bg-gradient-to-tr from-green-50 to-green-100 text-green-900"
                      />
                      {/* Progress Indicator (simulate upload) */}
                      {isUploading && (
                        <div className="w-full bg-green-100 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => {
                          setShowAddStatus(false);
                          setNewStatusText('');
                          setNewStatusMedia({ url: '', type: null });
                          setNewStatusThoughts('');
                        }} className="border-blue-400 text-blue-700 hover:bg-blue-100 transition-all duration-200">Cancel</Button>
                        <Button onClick={() => {
                          if (newStatusText.trim() || newStatusMedia.url) {
                            setStatuses([{ id: Date.now(), user: 'You', status: newStatusText, time: 'Just now', media: newStatusMedia.url || undefined, mediaType: newStatusMedia.type, thoughts: newStatusThoughts || undefined }, ...statuses]);
                            setShowAddStatus(false);
                            setNewStatusText('');
                            setNewStatusMedia({ url: '', type: null });
                            setNewStatusThoughts('');
                          }
                        }} disabled={!newStatusText.trim() && !newStatusMedia.url} className="bg-blue-400 text-white hover:bg-blue-500 transition-all duration-200">Add Status</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {/* View Status Dialog */}
                <Dialog open={!!viewStatusUser} onOpenChange={() => setViewStatusUser(null)}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{viewStatusUser}'s Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {statuses.filter(s => s.user === viewStatusUser).map((status, idx) => (
                        <Card key={status.id} className="p-4 bg-gradient-to-br from-pink-50 to-yellow-50">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-pink-400 text-white font-bold">{status.user[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-900">{status.user}</div>
                              <div className="text-xs text-gray-500">{status.time}</div>
                            </div>
                          </div>
                          <div className="text-gray-800 mb-2">{status.status}</div>
                          {status.thoughts && <div className="text-xs text-pink-700 italic mb-2">{status.thoughts}</div>}
                          {status.media && status.mediaType === 'image' && <img src={status.media} alt="status" className="rounded-lg max-h-40" />}
                          {status.media && status.mediaType === 'video' && <video src={status.media} controls className="rounded-lg max-h-52 w-full" />}
                          <div className="text-xs text-gray-400 mt-2">{status.time}</div>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                {/* Fullscreen Status Viewer */}
                <Dialog open={!!statusViewer} onOpenChange={() => setStatusViewer(null)}>
                  <DialogContent className="max-w-full max-h-full bg-black/95 flex items-center justify-center p-0 overflow-hidden animate-fade-in">
                    {statusViewer && (
                      <div className="relative w-full h-[92vh] flex items-center justify-center">
                        {/* Blurred background */}
                        {getCurrentStatus()?.media && (
                          <div className="absolute inset-0 z-0">
                            {getCurrentStatus()?.mediaType === 'image' ? (
                              <img src={getCurrentStatus()?.media} alt="bg" className="w-full h-full object-cover blur-2xl scale-110 opacity-60" />
                            ) : (
                              <video src={getCurrentStatus()?.media} className="w-full h-full object-cover blur-2xl scale-110 opacity-60" autoPlay loop muted />
                            )}
                            <div className="absolute inset-0 bg-black/80" />
                          </div>
                        )}
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-8 pt-6">
                          {getUserStatuses(statusViewer.user).map((_, i) => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < statusViewer.idx ? 'bg-white/70' : i === statusViewer.idx ? 'bg-white animate-progress-bar' : 'bg-white/30'}`}></div>
                          ))}
                        </div>
                        {/* Top left: avatar, name, time */}
                        <div className="absolute top-6 left-8 z-30 flex items-center gap-3 bg-black/40 rounded-full px-4 py-2 shadow-2xl backdrop-blur-md">
                          <Avatar className="h-10 w-10 shadow-lg">
                            <AvatarFallback className="bg-pink-400 text-white font-bold text-lg">{getCurrentStatus()?.user[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-white text-base drop-shadow-lg">{getCurrentStatus()?.user}</div>
                            <div className="text-xs text-gray-200 drop-shadow">{getCurrentStatus()?.time}</div>
                          </div>
                        </div>
                        {/* Close button */}
                        <button
                          className="absolute top-6 right-8 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-2xl backdrop-blur-md"
                          onClick={() => setStatusViewer(null)}
                          style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.4)' }}
                        >
                          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
                        </button>
                        {/* Left arrow */}
                        <button
                          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-3 shadow-lg ${statusViewer.idx > 0 ? 'animate-pulse-arrow' : ''}`}
                          onClick={() => setStatusViewer(v => v && v.idx > 0 ? { ...v, idx: v.idx - 1 } : v)}
                          disabled={statusViewer.idx === 0}
                          style={{ opacity: statusViewer.idx === 0 ? 0.2 : 1 }}
                        >
                          <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        {/* Right arrow */}
                        <button
                          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-3 shadow-lg ${statusViewer.idx < getUserStatuses(statusViewer.user).length - 1 ? 'animate-pulse-arrow' : ''}`}
                          onClick={() => setStatusViewer(v => v && v.idx < getUserStatuses(v.user).length - 1 ? { ...v, idx: v.idx + 1 } : v)}
                          disabled={statusViewer.idx === getUserStatuses(statusViewer.user).length - 1}
                          style={{ opacity: statusViewer.idx === getUserStatuses(statusViewer.user).length - 1 ? 0.2 : 1 }}
                        >
                          <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                        {/* Media display */}
                        <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in">
                          {getCurrentStatus()?.mediaType === 'image' && (
                            <img src={getCurrentStatus()?.media} alt="status" className="max-h-[70vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain border-4 border-white/10" />
                          )}
                          {getCurrentStatus()?.mediaType === 'video' && (
                            <video src={getCurrentStatus()?.media} controls autoPlay className="max-h-[70vh] max-w-[90vw] rounded-2xl shadow-2xl bg-black border-4 border-white/10" />
                          )}
                          {/* Bottom overlay: status text and thoughts */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 pb-12 text-white flex flex-col items-center">
                            <div className="text-3xl font-extrabold mb-3 text-center animate-fade-in" style={{ textShadow: '0 2px 16px #000, 0 0 8px #fff3' }}>{getCurrentStatus()?.status}</div>
                            {getCurrentStatus()?.thoughts && <div className="text-white italic mb-2 text-lg text-center animate-fade-in" style={{ textShadow: '0 2px 8px #000, 0 0 4px #fff2' }}>{getCurrentStatus()?.thoughts}</div>}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TabsContent>
              
              {/* Progress Tab */}
              <TabsContent value="progress">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</CardTitle>
                        <p className="text-gray-600 text-lg">Create and manage your learning progress</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Create Progress Card Section */}
                <div className="text-center py-16">
                  <div className={`rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Plus className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>No Progress Cards Yet</h3>
                  <p className={`mb-6 ${textMuted}`}>Start tracking your learning journey by creating your first progress card!</p>
                  <Button 
                    onClick={() => setShowCreateProgressCard(true)} 
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full px-8 py-3 hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Progress Card
                  </Button>
                </div>
              </TabsContent>
              
              {/* Rank Tab */}
              <TabsContent value="rank">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Achievements & Rankings</CardTitle>
                        <p className="text-gray-600 text-lg">Your learning milestones and achievements</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Minimal Achievement Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Top Achiever Badge */}
                  <Card className={`border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                  }`}>
                    <CardHeader className={`border-b ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-gray-700'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className={`text-lg font-bold ${textColor}`}>Top Achiever</CardTitle>
                          <p className={`text-sm mt-1 ${textMuted}`}>Consistent performance</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">🥇</div>
                        <p className={`text-sm ${textMuted}`}>Maintained A+ grade for 3 consecutive months</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Active Learner Badge */}
                  <Card className={`border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                  }`}>
                    <CardHeader className={`border-b ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-gray-700'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 shadow-md">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className={`text-lg font-bold ${textColor}`}>Active Learner</CardTitle>
                          <p className={`text-sm mt-1 ${textMuted}`}>Regular participation</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">📚</div>
                        <p className={`text-sm ${textMuted}`}>Completed 15+ assignments on time</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Team Player Badge */}
                  <Card className={`border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                  }`}>
                    <CardHeader className={`border-b ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-gray-700'
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 border-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 shadow-md">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className={`text-lg font-bold ${textColor}`}>Team Player</CardTitle>
                          <p className={`text-sm mt-1 ${textMuted}`}>Collaboration skills</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">🤝</div>
                        <p className={`text-sm ${textMuted}`}>Helped 5+ classmates with assignments</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Current Rank Display */}
                <Card className={`border-0 shadow-xl rounded-2xl overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                }`}>
                  <CardHeader className={`border-b ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-gray-700'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-gray-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 shadow-md">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className={`text-lg font-bold ${textColor}`}>Current Rank</CardTitle>
                        <p className={`text-sm mt-1 ${textMuted}`}>Your position in the class</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-purple-600 mb-4">#3</div>
                      <p className={`text-lg ${textColor} mb-2`}>Excellent Performance!</p>
                      <p className={`text-sm ${textMuted}`}>You're in the top 10% of your class</p>
                      <div className="mt-4 flex justify-center">
                        <Badge variant="outline" className={`font-semibold px-4 py-2 text-sm shadow-md ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-600 text-purple-300'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700'
                        }`}>
                          🎯 Elite Student
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Enhanced Upload Form Dialog */}
              <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
                    <DialogTitle className="text-2xl font-bold text-teal-900">Upload Study Material</DialogTitle>
                    <DialogDescription className="text-gray-600">Share your learning resources with the class</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 pt-4">
                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-teal-700">Uploading...</span>
                          <span className="text-sm text-teal-600">{uploadProgress}%</span>
                          </div>
                        <div className="w-full bg-teal-200 rounded-full h-2">
                          <div 
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                      
                    {/* File Upload Area */}
                          <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Material File</Label>
                      <div 
                        className="border-2 border-dashed border-teal-300 rounded-xl p-8 hover:border-teal-400 transition-colors cursor-pointer bg-teal-50/50"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-teal-400', 'bg-teal-100');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-teal-400', 'bg-teal-100');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-teal-400', 'bg-teal-100');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            handleFileSelect(files);
                          }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-teal-700 mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-teal-600 mb-4">PDF, DOC, PPT, Images, Videos, or Links</p>
                          <Button variant="outline" className="border-teal-300 text-teal-600 hover:bg-teal-50">
                            Choose Files
                          </Button>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                          </div>
                          
                    {/* Material Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Title</Label>
                        <Input
                          placeholder="e.g., Advanced Algebra Notes"
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          className="py-2"
                        />
                          </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
                        <select
                          value={newMaterial.category}
                          onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                        >
                          <option value="">Select Category</option>
                          {studyMaterialCategories.filter(c => c !== 'all').map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
                      <Textarea
                        placeholder="Brief description of the material..."
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                        className="py-2"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Tags (comma separated)</Label>
                      <Input
                        placeholder="e.g., algebra, notes, chapter-2"
                        value={newMaterial.tags?.join(', ') || ''}
                        onChange={(e) => setNewMaterial({ 
                          ...newMaterial, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                        })}
                        className="py-2"
                      />
                              </div>
                    
                    {/* Attached Files Preview */}
                    {attachedFiles.length > 0 && (
                              <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Attached Files ({attachedFiles.length})</Label>
                        <div className="space-y-2">
                          {attachedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                            >
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                              </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                            </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFile(file.id)}
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              </div>
                          ))}
                            </div>
                          </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                    <Button variant="outline" onClick={() => setShowUploadForm(false)} className="px-6">
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        simulateUpload(attachedFiles[0]);
                        handleUploadMaterial();
                      }} 
                      disabled={!newMaterial.title || !newMaterial.category || attachedFiles.length === 0}
                      className="bg-teal-600 text-white px-8 py-2 rounded-full hover:bg-teal-700"
                    >
                      Upload Material
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Material Details Dialog */}
              <Dialog open={showStudyMaterialDetails} onOpenChange={setShowStudyMaterialDetails}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Material Details</DialogTitle>
                  </DialogHeader>
                  {selectedStudyMaterial && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-r ${getMaterialColor(selectedStudyMaterial.category)}`}>
                          {getMaterialIcon(selectedStudyMaterial.type)}
                              </div>
                              <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedStudyMaterial.title}</h3>
                          <p className="text-gray-600">{selectedStudyMaterial.description}</p>
                              </div>
                            </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Category:</span>
                          <span className="ml-2 text-gray-600">{selectedStudyMaterial.category}</span>
                              </div>
                              <div>
                          <span className="font-medium text-gray-700">Uploaded by:</span>
                          <span className="ml-2 text-gray-600">{selectedStudyMaterial.uploadedBy}</span>
                              </div>
                        <div>
                          <span className="font-medium text-gray-700">Upload date:</span>
                          <span className="ml-2 text-gray-600">{selectedStudyMaterial.uploadedAt}</span>
                            </div>
                        <div>
                          <span className="font-medium text-gray-700">Downloads:</span>
                          <span className="ml-2 text-gray-600">{selectedStudyMaterial.downloads || 0}</span>
                          </div>
                        </div>
                        
                      {selectedStudyMaterial.tags.length > 0 && (
                            <div>
                          <span className="font-medium text-gray-700">Tags:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedStudyMaterial.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
                                {tag}
                              </Badge>
                            ))}
                            </div>
                          </div>
                      )}
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
                          onClick={() => handleDownload(selectedStudyMaterial.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                              </Button>
                              <Button 
                                variant="outline" 
                          onClick={() => toggleBookmark(selectedStudyMaterial.id)}
                              >
                          <Bookmark className="w-4 h-4 mr-2" />
                          {studyMaterialBookmarks.includes(selectedStudyMaterial.id) ? 'Remove Bookmark' : 'Add Bookmark'}
                              </Button>
                          </div>
                        </div>
                  )}
                </DialogContent>
              </Dialog>
              
              {/* Rating Dialog */}
              <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Rate Material</DialogTitle>
                    <DialogDescription>How would you rate this study material?</DialogDescription>
                  </DialogHeader>
                  {materialToRate && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{materialToRate.title}</h3>
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Button
                              key={star}
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserRating(star)}
                              className={`h-8 w-8 p-0 ${
                                star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                              } hover:text-yellow-400`}
                            >
                              <Star className={`w-5 h-5 ${star <= userRating ? 'fill-current' : ''}`} />
                            </Button>
                  ))}
                </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {userRating > 0 ? `You rated this ${userRating} star${userRating > 1 ? 's' : ''}` : 'Click to rate'}
                        </p>
                    </div>
                      
                      <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => handleRateMaterial(materialToRate.id, userRating)}
                          disabled={userRating === 0}
                          className="bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                          Submit Rating
                    </Button>
                      </div>
                  </div>
                )}
                </DialogContent>
              </Dialog>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* File Preview Dialog */}
      <Dialog open={showFilePreview} onOpenChange={setShowFilePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={filePreviewUrl} 
              alt="File preview" 
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Settings Dialog */}
      <Dialog open={showChatSettings} onOpenChange={setShowChatSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
            <DialogDescription>Customize your chat experience</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Theme Selection */}
            <div>
              <Label className="text-sm font-medium">Chat Theme</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {chatBackgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    onClick={() => setChatBackground(bg.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      chatBackground === bg.id ? 'border-indigo-500' : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-full h-8 rounded ${bg.preview} mb-2`}></div>
                    <div className="text-xs font-medium">{bg.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Font Size */}
            <div>
              <Label className="text-sm font-medium">Message Font Size</Label>
              <select
                value={messageFontSize}
                onChange={(e) => setMessageFontSize(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Chat Notifications</Label>
              <Switch
                checked={chatNotifications}
                onCheckedChange={setChatNotifications}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            
            {/* Auto Scroll */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Auto Scroll to New Messages</Label>
              <Switch
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Reaction Picker */}
      <Dialog open={showReactionPicker} onOpenChange={setShowReactionPicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Reaction</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-8 gap-2">
            {emojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => addReaction(selectedMessageForReaction, emoji)}
                className="h-10 w-10 p-0 text-lg hover:bg-gray-100"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          {profileModalData && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-3">
                  <AvatarFallback className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white text-3xl font-bold">
                    {profileModalData.name[0]}
                  </AvatarFallback>
                          </Avatar>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{profileModalData.name}</h3>
                <Badge variant="outline" className="mb-2">
                  {profileModalData.type === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                </Badge>
                <p className="text-gray-600 text-sm mb-2">{profileModalData.type === 'teacher' ? 'Mathematics Department' : 'Classmate'}</p>
                <p className="text-blue-700 text-sm">Email: <span className="underline">{profileModalData.name.toLowerCase().replace(/ /g, '.')}@school.edu</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                          <div>
                  <span className="font-semibold text-gray-700">Role:</span>
                  <span className="ml-2 text-gray-600">{profileModalData.role}</span>
                          </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-600">Online</span>
                        </div>
                {profileModalData.type === 'teacher' && (
                  <div className="col-span-2">
                    <span className="font-semibold text-gray-700">Office Hours:</span>
                    <span className="ml-2 text-gray-600">Mon, Wed, Fri • 2-4 PM</span>
                  </div>
                )}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Bio:</span>
                <p className="text-gray-600 mt-1 text-sm">
                  {profileModalData.type === 'teacher'
                    ? 'Passionate about teaching and helping students succeed. Reach out anytime for help with assignments or concepts!'
                    : 'Eager to collaborate and learn together. Loves group projects and study sessions!'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Progress Card Dialog */}
      <Dialog open={showCreateProgressCard} onOpenChange={setShowCreateProgressCard}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Create Progress Card</DialogTitle>
            <DialogDescription className="text-gray-600">Track your learning progress and achievements</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Progress Type Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Progress Type</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select progress type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Assignment Completion</SelectItem>
                  <SelectItem value="quiz">Quiz Performance</SelectItem>
                  <SelectItem value="project">Project Milestone</SelectItem>
                  <SelectItem value="participation">Class Participation</SelectItem>
                  <SelectItem value="improvement">Skill Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Progress Title */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Progress Title</Label>
              <Input
                placeholder="e.g., Completed Advanced Algebra Chapter 3"
                className="py-2"
              />
            </div>
            
            {/* Progress Description */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
              <Textarea
                placeholder="Describe your progress and what you've learned..."
                className="py-2"
                rows={3}
              />
            </div>
            
            {/* Progress Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Score (Optional)</Label>
                <Input
                  placeholder="e.g., 85% or 17/20"
                  className="py-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Date Achieved</Label>
                <Input
                  type="date"
                  className="py-2"
                />
              </div>
            </div>
            
            {/* Difficulty Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty Level</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Easy</Button>
                <Button variant="outline" size="sm" className="flex-1">Medium</Button>
                <Button variant="outline" size="sm" className="flex-1">Hard</Button>
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Tags (Optional)</Label>
              <Input
                placeholder="e.g., algebra, math, problem-solving"
                className="py-2"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateProgressCard(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Handle progress card creation
                  setShowCreateProgressCard(false);
                  toast.success('Progress card created successfully!');
                }}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700"
              >
                Create Progress Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ToastContainer />
    </div>
  );
};

// Animations and extra styles for status popup
const GlobalStatusStyles = () => (
  <style>{`
    .animate-fade-in {
      animation: fadeIn 0.5s cubic-bezier(.4,0,.2,1);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-progress-bar {
      animation: progressBar 2.5s linear forwards;
    }
    @keyframes progressBar {
      from { width: 0; }
      to { width: 100%; }
    }
    .drop-shadow-glow {
      filter: drop-shadow(0 0 8px #fff8) drop-shadow(0 2px 16px #000a);
    }
    .animate-pulse-arrow {
      animation: pulseArrow 1.2s infinite alternate;
    }
    @keyframes pulseArrow {
      from { box-shadow: 0 0 0 0 #fff2; }
      to { box-shadow: 0 0 16px 4px #fff4; }
    }
    .scroll-snap-x {
      scroll-snap-type: x mandatory;
    }
    .scroll-snap-align-start {
      scroll-snap-align: start;
    }
    @keyframes spin-slow {
      0% { transform: rotate(0deg);}
      100% { transform: rotate(360deg);}
    }
    .animate-spin-slow {
      animation: spin-slow 2.5s linear infinite;
    }
  `}</style>
);

// Add this just before export default Classroom;
GlobalStatusStyles();

export default Classroom; 
