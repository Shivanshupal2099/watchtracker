import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Zap, Clock, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  unlocked: boolean;
  date?: string;
}

interface AchievementsProps {
  completedPomodoros: number;
  totalFocusTime: number;
  currentStreak: number;
  bestStreak: number;
}

const Achievements = ({
  completedPomodoros,
  totalFocusTime,
  currentStreak,
  bestStreak
}: AchievementsProps) => {
  const achievements: Achievement[] = [
    {
      id: 'first-pomodoro',
      title: 'First Step',
      description: 'Complete your first Pomodoro',
      icon: <Trophy className="h-5 w-5" />,
      progress: completedPomodoros,
      total: 1,
      unlocked: completedPomodoros >= 1
    },
    {
      id: 'focus-master',
      title: 'Focus Master',
      description: 'Complete 10 Pomodoros',
      icon: <Star className="h-5 w-5" />,
      progress: completedPomodoros,
      total: 10,
      unlocked: completedPomodoros >= 10
    },
    {
      id: 'time-warrior',
      title: 'Time Warrior',
      description: 'Complete 50 Pomodoros',
      icon: <Target className="h-5 w-5" />,
      progress: completedPomodoros,
      total: 50,
      unlocked: completedPomodoros >= 50
    },
    {
      id: 'focus-champion',
      title: 'Focus Champion',
      description: 'Complete 100 Pomodoros',
      icon: <Zap className="h-5 w-5" />,
      progress: completedPomodoros,
      total: 100,
      unlocked: completedPomodoros >= 100
    },
    {
      id: 'time-master',
      title: 'Time Master',
      description: 'Accumulate 24 hours of focus time',
      icon: <Clock className="h-5 w-5" />,
      progress: Math.floor(totalFocusTime / 60),
      total: 24 * 60,
      unlocked: totalFocusTime >= 24 * 60
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: <Flame className="h-5 w-5" />,
      progress: currentStreak,
      total: 7,
      unlocked: currentStreak >= 7
    }
  ];

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col gap-4 p-4 rounded-lg transition-colors duration-300 ${
                achievement.unlocked
                  ? 'bg-primary/10 hover:bg-primary/20'
                  : 'bg-accent/50 hover:bg-accent/70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.unlocked ? 'bg-primary/20' : 'bg-accent'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
                {achievement.unlocked && (
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Unlocked
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{achievement.progress} / {achievement.total}</span>
                </div>
                <div className="h-2 rounded-full bg-accent overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    className={`h-full ${
                      achievement.unlocked ? 'bg-primary' : 'bg-accent-foreground'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Achievements;