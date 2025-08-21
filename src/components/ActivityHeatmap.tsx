import React, { useEffect, useState } from 'react';
import { Playlist } from '@/types/playlist';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isBefore, 
  addMonths, 
  isSameMonth, 
  getDay, 
  subMonths, 
  startOfDay, 
  endOfDay, 
  isAfter, 
  startOfYear, 
  endOfYear, 
  addYears, 
  subYears, 
  getWeek, 
  getMonth,
  startOfMonth,
  endOfMonth 
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';

interface ActivityHeatmapProps {
  playlists: Playlist[];
}

interface ActivityData {
  learningTime: number;
  problemSolved: boolean;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ playlists }) => {
  const { theme } = useTheme();
  const [activityData, setActivityData] = useState<Record<string, ActivityData>>({});
  const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'week'>('year');

  useEffect(() => {
    const calculateDailyActivity = () => {
      const data: Record<string, ActivityData> = {};
      const yearStart = startOfYear(new Date(displayYear, 0, 1));
      const yearEnd = endOfYear(new Date(displayYear, 11, 31));

      playlists.forEach(playlist => {
        if (playlist.type === 'video' && Array.isArray(playlist.videos)) {
          playlist.videos.forEach(video => {
            if (video.progress >= 100 && video.dateCompleted) {
              const completionDate = new Date(video.dateCompleted);
              if (isAfter(completionDate, yearStart) && isBefore(completionDate, yearEnd) || isSameDay(completionDate, yearStart) || isSameDay(completionDate, yearEnd)) {
                const date = format(completionDate, 'yyyy-MM-dd');
                const durationInMinutes = typeof video.watchTime === 'number' 
                  ? video.watchTime 
                  : 0;
                
                if (!data[date]) {
                  data[date] = { learningTime: 0, problemSolved: false };
                }
                data[date].learningTime += durationInMinutes;
              }
            }
          });
        }
        if (playlist.type === 'coding' && Array.isArray(playlist.codingQuestions)) {
          playlist.codingQuestions.forEach(question => {
            if (question.solved && question.dateSolved) {
              const solvedDate = new Date(question.dateSolved);
              if (isAfter(solvedDate, yearStart) && isBefore(solvedDate, yearEnd) || isSameDay(solvedDate, yearStart) || isSameDay(solvedDate, yearEnd)) {
                const date = format(solvedDate, 'yyyy-MM-dd');
                if (!data[date]) {
                  data[date] = { learningTime: 0, problemSolved: false };
                }
                data[date].problemSolved = true;
              }
            }
          });
        }
      });

      setActivityData(data);
    };

    calculateDailyActivity();
  }, [playlists, displayYear]);

  const getColor = (date: string): string => {
    const isDark = theme === 'dark';
    const activity = activityData[date];
    
    if (!activity) {
      return isDark ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200';
    }

    // If both learning and problem solving occurred
    if (activity.learningTime > 0 && activity.problemSolved) {
      return isDark 
        ? 'bg-gradient-to-br from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 border border-emerald-500/50' 
        : 'bg-gradient-to-br from-emerald-400 to-blue-400 hover:from-emerald-300 hover:to-blue-300 border border-emerald-300/50';
    }
    
    // If only learning occurred
    if (activity.learningTime > 0) {
      const level = activity.learningTime < 15 ? 1 : 
                   activity.learningTime < 30 ? 2 : 
                   activity.learningTime < 60 ? 3 : 4;
      
      return isDark 
        ? `bg-emerald-${700 + level * 100}/70 hover:bg-emerald-${600 + level * 100} border border-emerald-${500 + level * 100}/50`
        : `bg-emerald-${100 + level * 100} hover:bg-emerald-${200 + level * 100} border border-emerald-${200 + level * 100}`;
    }
    
    // If only problem solving occurred
    if (activity.problemSolved) {
      return isDark 
        ? 'bg-blue-600/70 hover:bg-blue-500 border border-blue-500/50' 
        : 'bg-blue-400 hover:bg-blue-300 border border-blue-300/50';
    }

    return isDark ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200';
  };

  const renderMonthLabels = () => {
    const months = [];
    let currentDate = startOfYear(new Date(displayYear, 0, 1));
    
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const lastWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      
      const startWeek = getWeek(firstWeekStart, { weekStartsOn: 0 });
      const endWeek = getWeek(lastWeekEnd, { weekStartsOn: 0 });
      const weekSpan = endWeek - startWeek + 1;
      
      months.push({
        name: format(currentDate, 'MMM'),
        startWeek,
        weekSpan
      });
      
      currentDate = addMonths(currentDate, 1);
    }

    const isDark = theme === 'dark';
    const textColor = isDark ? 'text-gray-300' : 'text-gray-600';
    const hoverColor = isDark ? 'hover:text-gray-100' : 'hover:text-gray-900';
    const selectedColor = isDark ? 'text-emerald-400' : 'text-emerald-700';
    const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

    return (
      <div className="flex justify-between text-xs bg-aware-text-muted mt-2 px-8">
        {months.map((month, index) => (
          <div 
            key={index} 
            className={`flex-1 text-center cursor-pointer transition-colors duration-200 
              hover:bg-aware-text hover:bg-aware-card-muted rounded px-1 py-0.5
              ${selectedMonth === index && viewMode === 'month' ? 'font-bold text-primary' : ''}`}
            onClick={() => {
              setSelectedMonth(index);
              setViewMode('month');
            }}
          >
            {month.name}
          </div>
        ))}
      </div>
    );
  };

  const renderControls = () => {
    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-gray-800/50' : 'bg-gray-50';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const textColor = isDark ? 'text-gray-200' : 'text-gray-700';

    return (
      <div className={`flex items-center gap-4 mb-4 p-2 ${bgColor} rounded-lg border ${borderColor}`}>
        <Select
          value={viewMode}
          onValueChange={(value: 'year' | 'month' | 'week') => {
            setViewMode(value);
            if (value === 'year') {
              setSelectedMonth(null);
              setSelectedWeek(null);
            }
          }}
        >
          <SelectTrigger className={`w-[120px] ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}>
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="year">Year View</SelectItem>
            <SelectItem value="month">Month View</SelectItem>
            <SelectItem value="week">Week View</SelectItem>
          </SelectContent>
        </Select>

        {viewMode === 'month' && (
          <Select
            value={selectedMonth?.toString() ?? ''}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className={`w-[120px] ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(new Date(displayYear, i, 1), 'MMMM')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {viewMode === 'week' && (
          <Select
            value={selectedWeek?.toString() ?? ''}
            onValueChange={(value) => setSelectedWeek(parseInt(value))}
          >
            <SelectTrigger className={`w-[120px] ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}>
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(53)].map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  const getFilteredDays = () => {
    let startDate: Date;
    let endDate: Date;

    if (viewMode === 'year') {
      startDate = startOfYear(new Date(displayYear, 0, 1));
      endDate = endOfYear(new Date(displayYear, 11, 31));
    } else if (viewMode === 'month' && selectedMonth !== null) {
      startDate = startOfMonth(new Date(displayYear, selectedMonth, 1));
      endDate = endOfMonth(new Date(displayYear, selectedMonth, 1));
    } else if (viewMode === 'week' && selectedWeek !== null) {
      startDate = startOfWeek(new Date(displayYear, 0, 1 + (selectedWeek - 1) * 7), { weekStartsOn: 0 });
      endDate = endOfWeek(new Date(displayYear, 0, 1 + (selectedWeek - 1) * 7), { weekStartsOn: 0 });
    } else {
      startDate = startOfYear(new Date(displayYear, 0, 1));
      endDate = endOfYear(new Date(displayYear, 11, 31));
    }

    const days = [];
    let day = startOfWeek(startDate, { weekStartsOn: 0 });
    const endWeekDate = endOfWeek(endDate, { weekStartsOn: 0 });

    while (isBefore(day, endWeekDate) || isSameDay(day, endWeekDate)) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const renderHeatmap = () => {
    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-gray-800/50' : 'bg-white';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const textColor = isDark ? 'text-gray-200' : 'text-gray-700';
    const tooltipBg = isDark ? 'bg-gray-800' : 'bg-white';
    const tooltipBorder = isDark ? 'border-gray-700' : 'border-gray-200';
    const tooltipText = isDark ? 'text-gray-200' : 'text-gray-700';
    const tooltipMuted = isDark ? 'text-gray-400' : 'text-gray-600';

    const days = getFilteredDays();
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    let currentMonth = -1;

    days.forEach((currentDay) => {
      const dayMonth = getMonth(currentDay);
      
      // If we're starting a new month and we have weeks, add a spacer week
      if (dayMonth !== currentMonth && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
        // Add a spacer week for month separation
        weeks.push([]);
      }
      
      currentMonth = dayMonth;
      currentWeek.push(currentDay);
      
      if (getDay(currentDay) === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return (
      <TooltipProvider>
        <div className="space-y-2">
          {renderControls()}
          <div
            className={`flex items-start p-4 ${bgColor} rounded-lg border ${borderColor} shadow-sm`}
            style={{
              width: "100%",
              maxWidth: "100vw",
              overflowX: "auto",
              minWidth: "320px",
            }}
          >
            <div className="flex space-x-2 overflow-x-auto pb-2 w-full">
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className={`flex flex-col space-y-2 ${week.length === 0 ? 'w-5' : ''}`}
                >
                  {week.map((day, dayIndex) => {
                    const dateString = format(day, 'yyyy-MM-dd');
                    const activity = activityData[dateString];
                    const isToday = isSameDay(day, new Date());
                    const isOutsideRange = viewMode === 'month' && selectedMonth !== null && !isSameMonth(day, new Date(displayYear, selectedMonth, 1)) ||
                      viewMode === 'week' && selectedWeek !== null && getWeek(day, { weekStartsOn: 0 }) !== selectedWeek;

                    if (isOutsideRange) {
                      return (
                        <div
                          key={dayIndex}
                          className={`w-6 h-6 sm:w-5 sm:h-5 rounded-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} border`}
                        />
                      );
                    }

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger>
                          <div
                            className={`w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center rounded-sm transition-colors duration-200 ${getColor(dateString)} 
                              ${isToday ? `ring-2 ${isDark ? 'ring-emerald-500' : 'ring-blue-500'} ring-offset-2 ${isDark ? 'ring-offset-gray-800' : 'ring-offset-white'}` : ''}`}
                          >
                            {activity && (
                              <>
                                {activity.learningTime > 0 && (
                                  <span className="text-[10px] font-bold text-white drop-shadow">
                                    {activity.learningTime}
                                  </span>
                                )}
                                {activity.problemSolved && (
                                  <Icons.CheckCircle className="w-3 h-3 text-white absolute bottom-0 right-0" />
                                )}
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className={`${tooltipBg} border ${tooltipBorder} shadow-lg`}>
                          <p className={`font-medium ${tooltipText}`}>{format(new Date(dateString), 'MMMM d, yyyy')}</p>
                          {activity && (
                            <>
                              {activity.learningTime > 0 && (
                                <p className={`text-sm ${tooltipMuted}`}>
                                  {activity.learningTime} minutes of learning
                                </p>
                              )}
                              {activity.problemSolved && (
                                <p className={`text-sm ${tooltipMuted}`}>
                                  Solved problems
                                </p>
                              )}
                            </>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {viewMode === 'year' && renderMonthLabels()}
        </div>
      </TooltipProvider>
    );
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800/70' : 'bg-white/70';
  const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
  const cardText = isDark ? 'text-gray-200' : 'text-gray-700';
  const headerBorder = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <Card className={`${cardBg} backdrop-blur-sm border ${cardBorder} shadow-lg`}>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 border-b ${headerBorder}`}>
        <CardTitle className={`text-lg font-medium ${cardText}`}>
          Activity Heatmap {viewMode === 'month' && selectedMonth !== null ? `- ${format(new Date(displayYear, selectedMonth, 1), 'MMMM yyyy')}` : 
                           viewMode === 'week' && selectedWeek !== null ? `- Week ${selectedWeek}, ${displayYear}` : 
                           `(${displayYear})`}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDisplayYear(displayYear - 1)}
            className={isDark ? 'hover:bg-gray-700 text-gray-200 border-gray-700' : 'hover:bg-gray-100'}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDisplayYear(displayYear + 1)}
            className={isDark ? 'hover:bg-gray-700 text-gray-200 border-gray-700' : 'hover:bg-gray-100'}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {renderHeatmap()}
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;