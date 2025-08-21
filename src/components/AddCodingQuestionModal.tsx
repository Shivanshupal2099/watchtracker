import { useState } from 'react';
import { Plus, X, Loader2, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Playlist, CodingQuestion } from '@/types/playlist';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddCodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded' | 'attempts'>) => void;
}

const AddCodingQuestionModal = ({ isOpen, onClose, onAdd }: AddCodingQuestionModalProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [category, setCategory] = useState<'algorithms' | 'data-structures' | 'system-design' | 'dynamic-programming' | 'graphs' | 'arrays' | 'strings' | 'trees' | 'other'>('algorithms');
  const [isLoading, setIsLoading] = useState(false);

  const extractTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // Handle different coding platforms
      if (urlObj.hostname.includes('leetcode.com')) {
        return pathParts[pathParts.length - 1].split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      } else if (urlObj.hostname.includes('geeksforgeeks.org')) {
        return pathParts[pathParts.length - 1].split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      } else if (urlObj.hostname.includes('hackerrank.com')) {
        return pathParts[pathParts.length - 1].split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      
      return '';
    } catch (error) {
      return '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const extractedTitle = extractTitleFromUrl(newUrl);
    if (extractedTitle) {
      setTitle(extractedTitle);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a question title or URL');
      return;
    }

    if (!url.trim()) {
      toast.error('Please enter a question URL');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const question: Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded' | 'attempts'> = {
      title: title.trim(),
      description: '',
      difficulty,
      category,
      topics: [],
      originalLink: url.trim()
    };

    onAdd(question);
    
    // Reset form
    setTitle('');
    setUrl('');
    setDifficulty('easy');
    setCategory('algorithms');
    setIsLoading(false);
    
    toast.success('Question added successfully!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Code className="w-5 h-5 sm:w-6 sm:h-6" />
            Add Coding Question
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Question URL *</Label>
              <Input
                id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Enter question URL from LeetCode, GeeksForGeeks, or HackerRank..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="title">Question Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Question title will be auto-filled from URL"
                className="mt-1"
              />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value: 'algorithms' | 'data-structures' | 'system-design' | 'dynamic-programming' | 'graphs' | 'arrays' | 'strings' | 'trees' | 'other') => setCategory(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algorithms">Algorithms</SelectItem>
                    <SelectItem value="data-structures">Data Structures</SelectItem>
                    <SelectItem value="system-design">System Design</SelectItem>
                    <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
                    <SelectItem value="graphs">Graphs</SelectItem>
                    <SelectItem value="arrays">Arrays</SelectItem>
                    <SelectItem value="strings">Strings</SelectItem>
                    <SelectItem value="trees">Trees</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !title.trim() || !url.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCodingQuestionModal;
