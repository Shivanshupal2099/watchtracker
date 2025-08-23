import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Link as LinkIcon, Bookmark, X, File, FileType, BookOpen, FileArchive, FileEdit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type NoteType = 'note' | 'pdf' | 'link' | 'bookmark';

type Note = {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
};

const noteTypeConfig = {
  note: {
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Text Note',
  },
  pdf: {
    icon: FileType,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'PDF',
  },
  link: {
    icon: LinkIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Website',
  },
  bookmark: {
    icon: Bookmark,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Bookmark',
  },
};

export default function Notes() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<NoteType | 'all'>('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    content: '',
    type: 'note',
    tags: [],
  });

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    return note.type === activeTab && matchesSearch;
  });

  const notesByType = (type: NoteType) => 
    notes.filter(note => note.type === type);

  const handleAddNote = () => {
    if (!newNote.title.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes([...notes, note]);
    setNewNote({ title: '', content: '', type: 'note' });
    setIsAdding(false);
  };

  const NoteIcon = ({ type }: { type: NoteType }) => {
    const { icon: Icon, color } = noteTypeConfig[type];
    return <Icon className={`w-5 h-5 ${color}`} />;
  };

  const NoteTypeBadge = ({ type }: { type: NoteType }) => {
    const { label, bgColor } = noteTypeConfig[type];
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${bgColor} text-foreground/80`}>
        {label}
      </span>
    );
  };

  const EmptyState = ({ type = 'all' }: { type?: NoteType | 'all' }) => {
    const { icon: Icon, color, label } = 
      type === 'all' ? { icon: FileText, color: 'text-muted-foreground', label: 'notes' } 
      : noteTypeConfig[type as NoteType];
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className={`w-16 h-16 rounded-full ${type === 'all' ? 'bg-muted' : `${color.replace('text', 'bg')} bg-opacity-10`} flex items-center justify-center mb-4`}>
          <Icon className={`w-8 h-8 ${type === 'all' ? 'text-muted-foreground' : color}`} />
        </div>
        <h3 className="text-lg font-medium mb-1">No {type === 'all' ? '' : label + ' '}notes yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {type === 'all' 
            ? 'Get started by creating your first note.'
            : `You haven't created any ${label.toLowerCase()} notes yet.`}
        </p>
        <Button onClick={() => {
          setNewNote(prev => ({ ...prev, type: type === 'all' ? 'note' : type as NoteType }));
          setIsAdding(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> 
          Add {type === 'all' ? 'Note' : label}
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your thoughts, resources, and bookmarks in one place
          </p>
        </div>
        <Button onClick={() => {
          setNewNote({ title: '', content: '', type: 'note', tags: [] });
          setIsAdding(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="relative mb-6 max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search notes, tags, or content..."
          className="w-full pl-10 h-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs 
        defaultValue="all" 
        className="w-full"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as NoteType | 'all')}
      >
        <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          <TabsList className="bg-transparent p-0 h-auto w-full justify-start rounded-none border-b">
            <TabsTrigger 
              value="all" 
              className="relative py-2 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>All Notes</span>
                {notes.length > 0 && (
                  <span className="ml-1 text-xs bg-muted rounded-full px-2 py-0.5">
                    {notes.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
            {Object.entries(noteTypeConfig).map(([type, { icon: Icon, label }]) => (
              <TabsTrigger 
                key={type} 
                value={type}
                className="relative py-2 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {notesByType(type as NoteType).length > 0 && (
                    <span className="ml-1 text-xs bg-muted rounded-full px-2 py-0.5">
                      {notesByType(type as NoteType).length}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Add New Note</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newNote.type}
                  onChange={(e) => setNewNote({...newNote, type: e.target.value as any})}
                >
                  <option value="note">Note</option>
                  <option value="pdf">PDF</option>
                  <option value="link">Link</option>
                  <option value="bookmark">Bookmark</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleAddNote}>Save Note</Button>
          </CardFooter>
        </Card>
      )}

        <TabsContent value="all" className="mt-0">
          {filteredNotes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        {Object.keys(noteTypeConfig).map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            {notesByType(type as NoteType).length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredNotes
                  .filter(note => note.type === type)
                  .map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
              </div>
            ) : (
              <EmptyState type={type as NoteType} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const NoteCard = ({ note }: { note: Note }) => {
  const { icon: Icon, color } = noteTypeConfig[note.type];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="h-full flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${color.replace('text', 'bg')} bg-opacity-10`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <CardTitle className="text-base font-medium line-clamp-1">
                {note.title || 'Untitled Note'}
              </CardTitle>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(note.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit
            }}
          >
            <FileEdit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.content || 'No content'}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex flex-wrap gap-1">
          {note.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full">
              {tag}
            </span>
          ))}
          {note.tags && note.tags.length > 2 && (
            <span className="text-xs px-2 py-0.5 text-muted-foreground">
              +{note.tags.length - 2} more
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
