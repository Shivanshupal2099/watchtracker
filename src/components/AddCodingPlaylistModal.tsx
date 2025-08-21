import { useState } from 'react';
import { Code, X, Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Playlist, CodingQuestion } from '@/types/playlist';
import { toast } from 'sonner';
import AddCodingQuestionModal from './AddCodingQuestionModal';

interface AddCodingPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (playlist: Playlist) => void;
}

const AddCodingPlaylistModal = ({ isOpen, onClose, onAdd }: AddCodingPlaylistModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetQuestionsPerDay, setTargetQuestionsPerDay] = useState(2);
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [questions, setQuestions] = useState<Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded' | 'attempts'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const addQuestion = (questionData: Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded'>) => {
    const newQuestion = {
      ...questionData,
      attempts: 0
    };
    setQuestions([...questions, newQuestion]);
    toast.success('Coding question added to playlist');
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a playlist title');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one coding question');
      return;
    }

    // Validate each question has required fields
    const invalidQuestions = questions.filter(q => !q.title || !q.difficulty || !q.category);
    if (invalidQuestions.length > 0) {
      toast.error('All questions must have a title, difficulty, and category');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const playlist: Playlist = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        type: 'coding',
        createdAt: new Date().toISOString(),
        videos: [],
        targetQuestionsPerDay,
        streakData: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: '',
          weeklyGoal,
          completedThisWeek: 0
        },
        codingQuestions: questions.map((question, index) => ({
          ...question,
          id: `${Date.now()}-${index}`,
          solved: false,
          dateAdded: new Date().toISOString(),
          attempts: 0
        }))
      };

      onAdd(playlist);
      
      // Reset form
      setTitle('');
      setDescription('');
      setTargetQuestionsPerDay(2);
      setWeeklyGoal(10);
      setQuestions([]);
      
      toast.success('Coding playlist created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 sm:w-6 sm:h-6" />
              Create Coding Practice Playlist
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Playlist Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., LeetCode Daily Practice"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your coding practice goals..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="daily-target">Questions per Day</Label>
                  <Input
                    id="daily-target"
                    type="number"
                    min="1"
                    max="20"
                    value={targetQuestionsPerDay}
                    onChange={(e) => setTargetQuestionsPerDay(parseInt(e.target.value) || 2)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="weekly-goal">Weekly Goal</Label>
                  <Input
                    id="weekly-goal"
                    type="number"
                    min="1"
                    max="50"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 10)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Add Questions Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="font-semibold">Coding Questions</h3>
                <Button
                  onClick={() => setIsQuestionModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              {questions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Questions ({questions.length})</p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {questions.map((question, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{question.title}</h4>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded ${
                                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {question.difficulty}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                {question.category}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Coding Playlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddCodingQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onAdd={addQuestion}
      />
    </>
  );
};

export default AddCodingPlaylistModal;
