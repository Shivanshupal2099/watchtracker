import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as Icons from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PrivacySection } from "@/components/PrivacySection";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// Add interfaces for data management
interface ParsedTodo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface ParsedCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

const DATA_VERSION = '1.0';

const INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Maithili', 'Santali', 'Kashmiri', 'Nepali', 'Konkani', 'Sindhi', 'Dogri', 'Manipuri', 'Bodo', 'Santhali', 'Sanskrit', 'English'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'UAE', 'Germany', 'France', 'Nepal', 'Bangladesh', 'Sri Lanka', 'Pakistan', 'Other'
];

export function SettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
  });
  const [feedback, setFeedback] = useState({
    currentStep: 1,
    challenges: {
      dontFinishGoals: false,
      lackConsistency: false,
      easilyDistracted: false,
      dontKnowFocus: false,
      dontTrackProgress: false,
      feelOverwhelmed: false
    },
    features: {
      smartPlanner: '',
      streakTracker: '',
      focusMode: '',
      todoReminders: '',
      progressCharts: '',
      goalTracker: '',
      aiSuggestions: '',
      focusTimer: '',
      crossDeviceSync: '',
      teamAccountability: '',
      calendarView: '',
      privacyLock: ''
    },
    aiCoachInterest: '',
    planningPreference: '',
    motivation: ''
  });
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCountry, setSelectedCountry] = useState('India');

  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  const resetAllData = () => {
    localStorage.removeItem('youtubePlaylists');
    toast.success('All data has been reset!');
    navigate('/');
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "EST", label: "Eastern Time (EST)" },
    { value: "CST", label: "Central Time (CST)" },
    { value: "PST", label: "Pacific Time (PST)" },
    { value: "GMT", label: "Greenwich Mean Time (GMT)" },
  ];

  const handleNextStep = () => {
    setFeedback(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4)
    }));
  };

  const handlePrevStep = () => {
    setFeedback(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  };

  const handleFeatureChange = (feature: string, value: string) => {
    setFeedback(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  const handleChallengeChange = (challengeId: string) => {
    setFeedback(prev => ({
      ...prev,
      challenges: {
        ...prev.challenges,
        [challengeId]: !prev.challenges[challengeId as keyof typeof prev.challenges]
      }
    }));
  };

  const handleFeedbackSubmit = () => {
    // Validate required fields
    if (feedback.currentStep === 1 && Object.values(feedback.challenges).every(v => !v)) {
      toast.error('Please select at least one challenge');
      return;
    }
    if (feedback.currentStep === 2 && Object.values(feedback.features).some(v => !v)) {
      toast.error('Please rate all features');
      return;
    }
    if (feedback.currentStep === 3 && !feedback.aiCoachInterest) {
      toast.error('Please select your preference for AI coach');
      return;
    }
    if (feedback.currentStep === 4 && (!feedback.planningPreference || !feedback.motivation)) {
      toast.error('Please complete all preference questions');
      return;
    }

    // Submit feedback
    console.log('Feedback submitted:', feedback);
    toast.success('Thank you for your feedback!');
    
    // Reset form
    setFeedback({
      currentStep: 1,
      challenges: {
        dontFinishGoals: false,
        lackConsistency: false,
        easilyDistracted: false,
        dontKnowFocus: false,
        dontTrackProgress: false,
        feelOverwhelmed: false
      },
      features: {
        smartPlanner: '',
        streakTracker: '',
        focusMode: '',
        todoReminders: '',
        progressCharts: '',
        goalTracker: '',
        aiSuggestions: '',
        focusTimer: '',
        crossDeviceSync: '',
        teamAccountability: '',
        calendarView: '',
        privacyLock: ''
      },
      aiCoachInterest: '',
      planningPreference: '',
      motivation: ''
    });
  };

  // Add data management functions
  const clearAllData = () => {
    // Clear all relevant localStorage items
    localStorage.removeItem('todos');
    localStorage.removeItem('categories');
    localStorage.removeItem('youtubePlaylists');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('notifications');
    localStorage.removeItem('focusSettings');
    localStorage.removeItem('shortcuts');
    localStorage.removeItem('backupSettings');
    localStorage.removeItem('privacySettings');
    
    // Clear any other app-specific data
    localStorage.removeItem('appState');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('language');
    localStorage.removeItem('timezone');
    
    // Show success message
    toast.success('All data has been cleared successfully!');
    
    // Optionally refresh the page to ensure clean state
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="focus">Focus Mode</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your general application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.Globe className="w-4 h-4" />
                  Language
                </Label>
                <select
                  className="border rounded px-3 py-2 w-[200px] max-h-40 overflow-y-auto"
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                >
                  {INDIAN_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.Globe className="w-4 h-4" />
                  Country
                </Label>
                <select
                  className="border rounded px-3 py-2 w-[200px] max-h-40 overflow-y-auto"
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                >
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.Clock className="w-4 h-4" />
                  Timezone
                </Label>
                <Select defaultValue="UTC">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Section */}
              <Separator className="my-6" />
              <section>
                <h2 className="text-lg font-semibold mb-4">Theme</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      !darkMode
                        ? "bg-blue-100 text-blue-900 border-blue-400"
                        : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      darkMode
                        ? "bg-zinc-800 text-white border-zinc-600"
                        : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    Dark
                  </button>
                </div>
              </section>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-2xl font-bold">Feedback</Label>
                  <p className="text-sm text-muted-foreground">Help us improve your experience by sharing your thoughts</p>
                </div>

                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Step {feedback.currentStep} of 4</span>
                      <span>{Math.round((feedback.currentStep / 4) * 100)}% Complete</span>
                    </div>
                    <Progress value={(feedback.currentStep / 4) * 100} className="h-2" />
                  </div>

                  {/* Form Content */}
                  <div className="rounded-lg border bg-card p-6 shadow-sm">
                    {feedback.currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🎯</span>
                            Your Current Challenges
                          </h3>
                          <p className="text-sm text-muted-foreground">What's your biggest struggle with online learning or self-growth? (Choose all that apply)</p>
                        </div>
                        <div className="grid gap-4">
                          {[
                            { id: 'dontFinishGoals', label: 'I start but don\'t finish goals' },
                            { id: 'lackConsistency', label: 'I lack consistency or discipline' },
                            { id: 'easilyDistracted', label: 'I get easily distracted' },
                            { id: 'dontKnowFocus', label: 'I don\'t know what to focus on' },
                            { id: 'dontTrackProgress', label: 'I don\'t track my progress' },
                            { id: 'feelOverwhelmed', label: 'I feel overwhelmed or burned out' }
                          ].map((challenge) => (
                            <div
                              key={challenge.id}
                              className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                feedback.challenges[challenge.id as keyof typeof feedback.challenges]
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <Checkbox
                                id={challenge.id}
                                checked={feedback.challenges[challenge.id as keyof typeof feedback.challenges]}
                                onCheckedChange={(checked) => {
                                  setFeedback(prev => ({
                                    ...prev,
                                    challenges: {
                                      ...prev.challenges,
                                      [challenge.id]: checked
                                    }
                                  }));
                                }}
                                className="h-5 w-5"
                              />
                              <Label
                                htmlFor={challenge.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {challenge.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🧩</span>
                            Helpful Features
                          </h3>
                          <p className="text-sm text-muted-foreground">Would the following help you be more successful?</p>
                        </div>
                        <div className="grid gap-6">
                          {Object.entries(feedback.features).map(([feature, value]) => (
                            <div
                              key={feature}
                              className="rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                              <div className="space-y-4">
                                <Label className="text-base font-medium flex items-center gap-2">
                                  {feature === 'smartPlanner' && '📅 Smart Daily Planner'}
                                  {feature === 'streakTracker' && '🔥 Streak Tracker'}
                                  {feature === 'focusMode' && '⏰ Focus Mode'}
                                  {feature === 'todoReminders' && '✅ To-Do + Reminders'}
                                  {feature === 'progressCharts' && '📊 Progress Charts'}
                                  {feature === 'goalTracker' && '🎯 Goal Tracker'}
                                  {feature === 'aiSuggestions' && '🧠 AI Suggestions'}
                                  {feature === 'focusTimer' && '🧘 Focus Timer (Pomodoro)'}
                                  {feature === 'crossDeviceSync' && '🌐 Cross-device Sync'}
                                  {feature === 'teamAccountability' && '🤝 Team Accountability'}
                                  {feature === 'calendarView' && '📅 Calendar View'}
                                  {feature === 'privacyLock' && '🔐 Privacy Lock'}
                                </Label>
                                <RadioGroup
                                  value={value}
                                  onValueChange={(val) => {
                                    setFeedback(prev => ({
                                      ...prev,
                                      features: {
                                        ...prev.features,
                                        [feature]: val
                                      }
                                    }));
                                  }}
                                  className="grid grid-cols-3 gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="must-have"
                                      id={`${feature}-must`}
                                      className="peer"
                                    />
                                    <Label
                                      htmlFor={`${feature}-must`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Must Have
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="nice-to-have"
                                      id={`${feature}-nice`}
                                      className="peer"
                                    />
                                    <Label
                                      htmlFor={`${feature}-nice`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Nice to Have
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="not-needed"
                                      id={`${feature}-not`}
                                      className="peer"
                                    />
                                    <Label
                                      htmlFor={`${feature}-not`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Not Needed
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🤖</span>
                            AI Coach Interest
                          </h3>
                          <p className="text-sm text-muted-foreground">Would you use a personal AI that tracks your patterns and gives you feedback?</p>
                        </div>
                        <RadioGroup
                          value={feedback.aiCoachInterest}
                          onValueChange={(value) => setFeedback(prev => ({ ...prev, aiCoachInterest: value }))}
                          className="grid gap-4"
                        >
                          {[
                            { value: 'yes', label: 'Yes! That sounds awesome' },
                            { value: 'maybe', label: 'Maybe — depends on how private it is' },
                            { value: 'no', label: 'No — I don\'t want AI tracking me' }
                          ].map((option) => (
                            <div
                              key={option.value}
                              className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                feedback.aiCoachInterest === option.value
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={`ai-${option.value}`}
                                className="peer"
                              />
                              <Label
                                htmlFor={`ai-${option.value}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {feedback.currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🧭</span>
                            Your Preferences
                          </h3>
                        </div>
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-base font-medium">How do you prefer to plan your day?</Label>
                            <RadioGroup
                              value={feedback.planningPreference}
                              onValueChange={(value) => setFeedback(prev => ({ ...prev, planningPreference: value }))}
                              className="grid gap-4"
                            >
                              {[
                                { value: 'hourly', label: 'Hour-by-hour timeline' },
                                { value: 'flexible', label: 'Flexible task list' },
                                { value: 'priorities', label: 'Just focus on 1–2 priorities' },
                                { value: 'no-plan', label: 'I don\'t plan my day' }
                              ].map((option) => (
                                <div
                                  key={option.value}
                                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                    feedback.planningPreference === option.value
                                      ? 'border-primary bg-primary/5'
                                      : 'hover:bg-accent'
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`plan-${option.value}`}
                                    className="peer"
                                  />
                                  <Label
                                    htmlFor={`plan-${option.value}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-base font-medium">What motivates you the most?</Label>
                            <RadioGroup
                              value={feedback.motivation}
                              onValueChange={(value) => setFeedback(prev => ({ ...prev, motivation: value }))}
                              className="grid gap-4"
                            >
                              {[
                                { value: 'visual', label: 'Visual progress (charts, streaks)' },
                                { value: 'deadlines', label: 'Deadlines and reminders' },
                                { value: 'competition', label: 'Friendly competition or teams' },
                                { value: 'coach', label: 'A coach telling me what to do' },
                                { value: 'rewards', label: 'Rewards and gamification' }
                              ].map((option) => (
                                <div
                                  key={option.value}
                                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                    feedback.motivation === option.value
                                      ? 'border-primary bg-primary/5'
                                      : 'hover:bg-accent'
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`mot-${option.value}`}
                                    className="peer"
                                  />
                                  <Label
                                    htmlFor={`mot-${option.value}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-6 mt-6 border-t">
                      {feedback.currentStep > 1 && (
                        <Button
                          variant="outline"
                          onClick={handlePrevStep}
                          className="gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                          Previous
                        </Button>
                      )}
                      {feedback.currentStep < 4 ? (
                        <Button
                          onClick={handleNextStep}
                          className="ml-auto gap-2"
                        >
                          Next
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          onClick={handleFeedbackSubmit}
                          className="ml-auto gap-2"
                        >
                          Submit Feedback
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, push: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Product Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new features and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, updates: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card>
            <CardHeader>
              <CardTitle>Focus Mode Settings</CardTitle>
              <CardDescription>
                Customize your focus mode experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Clock className="w-4 h-4" />
                      Default Focus Duration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Set your preferred focus session length
                    </p>
                  </div>
                  <Select defaultValue="25">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Break Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when it's time to take a break
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                View and customize keyboard shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { action: 'Start Focus Session', shortcut: 'Ctrl + F' },
                  { action: 'Pause Session', shortcut: 'Space' },
                  { action: 'End Session', shortcut: 'Esc' },
                  { action: 'Toggle Fullscreen', shortcut: 'F11' },
                  { action: 'Open Settings', shortcut: 'Ctrl + ,' },
                ].map((item) => (
                  <div key={item.action} className="flex items-center justify-between">
                    <Label>{item.action}</Label>
                    <Badge variant="outline" className="font-mono">
                      {item.shortcut}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Sync</CardTitle>
              <CardDescription>
                Manage your data backup and synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Cloud className="w-4 h-4" />
                      Cloud Backup
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Download className="w-4 h-4" />
                      Export Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Download your data as a backup
                    </p>
                  </div>
                  <Button variant="outline">Export</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Database className="w-4 h-4" />
                      Data Usage
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      View your data storage usage
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((localStorage.getItem('todos')?.length || 0) / 1024)} KB
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Trash2 className="w-4 h-4" />
                      Clear Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remove all stored data from all pages
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Icons.Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete all your data from all pages including:
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>All todos and categories</li>
                            <li>User preferences and settings</li>
                            <li>Focus mode settings</li>
                            <li>Notification preferences</li>
                            <li>All other app data</li>
                          </ul>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={clearAllData}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Clear All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}