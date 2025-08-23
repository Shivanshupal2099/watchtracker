import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { 
  Plus, 
  Search, 
  FileText, 
  Bookmark, 
  FileText as FileTextIcon, 
  Link as Link2,
  Mic,
  CheckSquare,
  PenTool,
  Star,
  Pin,
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Note, NoteType, NoteContent } from '@/types/note';

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Default note content
const defaultNoteContent: NoteContent = {
  text: '',
  html: '',
  attachments: [],
  todos: [],};

// Default new note
const defaultNewNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  type: 'text',
  content: { ...defaultNoteContent },
  tags: [],
  isPinned: false,
  isArchived: false,
  isFavorite: false,
  isDeleted: false,
  userId: 'current-user', // This would come from auth in a real app
  version: 1,
};

// EmptyState component props
interface EmptyStateProps {
  type: NoteType | 'all' | 'favorites';
  onAddClick: () => void;
}

// EmptyState component implementation
const EmptyState = ({ type, onAddClick }: EmptyStateProps) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'text':
        return {
          icon: <FileText className="h-12 w-12 text-muted-foreground" />,
          title: 'No notes yet',
          description: 'Create your first note to get started.',
          buttonText: 'New Note',
        };
      case 'pdf':
        return {
          icon: <FileTextIcon className="h-12 w-12 text-muted-foreground" />,
          title: 'No PDFs yet',
          description: 'Upload or create your first PDF note.',
          buttonText: 'Add PDF',
        };
      case 'link':
        return {
          icon: <Link2 className="h-12 w-12 text-muted-foreground" />,
          title: 'No links yet',
          description: 'Save your first link to get started.',
          buttonText: 'Add Link',
        };
      case 'bookmark':
        return {
          icon: <Bookmark className="h-12 w-12 text-muted-foreground" />,
          title: 'No bookmarks yet',
          description: 'Save your first bookmark to get started.',
          buttonText: 'Add Bookmark',
        };
      case 'favorites':
        return {
          icon: <Star className="h-12 w-12 text-muted-foreground" />,
          title: 'No favorites yet',
          description: 'Mark notes as favorites to see them here.',
          buttonText: 'View All Notes',
        };
      default:
        return {
          icon: <FileText className="h-12 w-12 text-muted-foreground" />,
          title: 'No notes found',
          description: 'Try changing your search or filter criteria.',
          buttonText: 'Clear Filters',
        };
    }
  };

  const { icon, title, description, buttonText } = getEmptyStateConfig();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      <Button onClick={onAddClick}>
        {buttonText}
      </Button>
    </div>
  );
};

// Render note icon based on type
const renderNoteIcon = (type: NoteType) => {
  switch (type) {
    case 'text':
      return <FileText className="h-4 w-4" />;
    case 'pdf':
      return <FileTextIcon className="h-4 w-4" />;
    case 'link':
      return <Link2 className="h-4 w-4" />;
    case 'bookmark':
      return <Bookmark className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Get note type label
const getNoteTypeLabel = (type: NoteType) => {
  switch (type) {
    case 'text':
      return 'Note';
    case 'pdf':
      return 'PDF';
    case 'link':
      return 'Link';
    case 'bookmark':
      return 'Bookmark';
    default:
      return 'Note';
  }
};

// NoteCard component props
interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
}

// NoteCard component implementation
const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
}: NoteCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className="relative overflow-hidden transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-medium line-clamp-1">
              {note.title || 'Untitled Note'}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {format(new Date(note.updatedAt || note.createdAt), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleFavorite(note.id)}
            >
              <Star
                className={`h-4 w-4 ${note.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onTogglePin(note.id)}
            >
              <Pin
                className={`h-4 w-4 ${note.isPinned ? 'text-blue-500' : 'text-muted-foreground'}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.content?.text || 'No content'}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {getNoteTypeLabel(note.type)}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => onEdit(note)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(note.id)}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function Notes() {
  const router = useRouter();
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<NoteType | 'all' | 'favorites'>('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        // Ensure all notes have required fields
        const notesWithDefaults = parsedNotes.map((note: any) => ({
          ...defaultNewNote,
          ...note,
          content: {
            ...defaultNoteContent,
            ...(note.content || {})
          }
        }));
        setNotes(notesWithDefaults);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError('Failed to load notes. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      try {
        localStorage.setItem('notes', JSON.stringify(notes));
      } catch (err) {
        console.error('Failed to save notes:', err);
        setError('Failed to save notes. Your changes may not be persisted.');
      }
    }
  }, [notes]);

  // Filter notes based on search query and active tab
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Skip deleted notes unless we're in the trash
      if (note.isDeleted && activeTab !== 'trash') return false;
      
      // Filter by tab
      if (activeTab === 'all') {
        // Show all non-archived, non-deleted notes
        if (note.isArchived || note.isDeleted) return false;
      } else if (activeTab === 'favorites') {
        // Show only favorited notes
        if (!note.isFavorite || note.isArchived || note.isDeleted) return false;
      } else if (activeTab === 'archived') {
        // Show only archived notes
        if (!note.isArchived || note.isDeleted) return false;
      } else if (activeTab === 'trash') {
        // Show only deleted notes
        if (!note.isDeleted) return false;
      } else {
        // Filter by note type
        if (note.type !== activeTab || note.isArchived || note.isDeleted) return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(query) ||
          (note.content?.text?.toLowerCase().includes(query) || false)
        );
      }

      return true;
    });
  }, [notes, activeTab, searchQuery]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as NoteType | 'all' | 'favorites');
  };

  // Handle adding a new note
  const handleAddNote = (type: NoteType = 'text') => {
    const newNote: Note = {
      ...defaultNewNote,
      id: generateId(),
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    setCurrentNote(newNote);
    setIsEditorOpen(true);
  };

  // Handle editing a note
  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsEditorOpen(true);
  };

  // Handle saving a note
  const handleSaveNote = () => {
    if (!currentNote) return;
    
    setIsSaving(true);
    
    try {
      const updatedNotes = [...notes];
      const now = new Date().toISOString();
      
      if (currentNote.id) {
        // Update existing note
        const index = updatedNotes.findIndex(n => n.id === currentNote.id);
        if (index !== -1) {
          updatedNotes[index] = {
            ...currentNote,
            updatedAt: now,
            version: (currentNote.version || 0) + 1
          };
        }
      } else {
        // Add new note
        const newNote: Note = {
          ...currentNote,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        updatedNotes.unshift(newNote);
      }
      
      setNotes(updatedNotes);
      setIsEditorOpen(false);
      setCurrentNote(null);
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting a note
  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  // Toggle favorite status of a note
  const toggleFavoriteNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  // Toggle pin status of a note
  const togglePinNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  // Handle input changes in the editor
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentNote) return;
    
    const { name, value } = e.target;
    setCurrentNote({
      ...currentNote,
      [name]: value
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p>Error: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Button onClick={() => handleAddNote('text')}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs 
        defaultValue="all" 
        className="flex-1 flex flex-col"
        onValueChange={handleTabChange}
      >
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="text">Notes</TabsTrigger>
          <TabsTrigger value="pdf">PDFs</TabsTrigger>
          <TabsTrigger value="link">Links</TabsTrigger>
          <TabsTrigger value="bookmark">Bookmarks</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="trash">Trash</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1">
          {filteredNotes.length === 0 ? (
            <EmptyState 
              type={activeTab} 
              onAddClick={() => handleAddNote(activeTab === 'all' ? 'text' : activeTab as NoteType)} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onToggleFavorite={toggleFavoriteNote}
                  onTogglePin={togglePinNote}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Editor Dialog */}
      {isEditorOpen && currentNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {currentNote.id ? 'Edit Note' : 'New Note'}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePinNote(currentNote.id)}
                >
                  <Pin
                    className={`h-4 w-4 ${currentNote.isPinned ? 'text-blue-500' : 'text-muted-foreground'}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavoriteNote(currentNote.id)}
                >
                  <Star
                    className={`h-4 w-4 ${currentNote.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditorOpen(false);
                    setCurrentNote(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={currentNote.title}
                    onChange={handleInputChange}
                    placeholder="Note title"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content.text"
                    value={currentNote.content?.text || ''}
                    onChange={(e) => {
                      if (!currentNote) return;
                      setCurrentNote({
                        ...currentNote,
                        content: {
                          ...currentNote.content,
                          text: e.target.value
                        }
                      });
                    }}
                    placeholder="Start writing your note here..."
                    className="w-full min-h-[200px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-1">
                    Tags (comma-separated)
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    value={currentNote.tags?.join(', ') || ''}
                    onChange={(e) => {
                      if (!currentNote) return;
                      setCurrentNote({
                        ...currentNote,
                        tags: e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0)
                      });
                    }}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditorOpen(false);
                  setCurrentNote(null);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={isSaving || !currentNote.title.trim()}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
