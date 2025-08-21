import { useState, useEffect } from 'react';
import { Plus, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/PlaylistCard';
import AddPlaylistModal from '@/components/AddPlaylistModal';
import { useTheme } from 'next-themes';
import { usePlaylists } from '@/context/PlaylistContext';
import { Playlist } from '@/types/playlist';
import Head from 'next/head';

interface WatchTimeData {
  totalWatchTime: number;  // Total accumulated watch time in milliseconds
  lastPosition: number;    // Last video position in seconds
  lastUpdate: number;      // Timestamp of last update
  sessions: {              // Track individual watch sessions
    startTime: number;     // Session start timestamp
    endTime?: number;      // Session end timestamp
    duration: number;      // Session duration in milliseconds
  }[];
}

const Library = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // Example count
  const { playlists, addPlaylist, deletePlaylist } = usePlaylists();
  const { theme } = useTheme();

  // Add CSS to ensure proper scrolling
  useEffect(() => {
    // Ensure body and html can scroll
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Force scrolling to work
    document.body.style.position = 'relative';
    document.body.style.minHeight = '100vh';
    
    return () => {
      // Reset styles when component unmounts
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.position = '';
      document.body.style.minHeight = '';
    };
  }, []);

  // Add refresh functionality
  const refreshPlaylists = () => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists) as Playlist[];
        // Validate and update playlists in context
        parsedPlaylists.forEach(playlist => {
          // Only add if playlist doesn't exist and is valid
          if (!playlists.find(p => p.id === playlist.id)) {
            // Validate playlist before adding
            if (!playlist.id || !playlist.title || !playlist.type) {
              console.error('Invalid playlist data:', playlist);
              return;
            }

            // Additional validation for coding playlists
            if (playlist.type === 'coding') {
              if (!Array.isArray(playlist.codingQuestions) || playlist.codingQuestions.length === 0) {
                console.error('Coding playlist must have at least one question');
                return;
              }
              // Validate each coding question
              const invalidQuestions = playlist.codingQuestions.filter(q => 
                !q.id || !q.title || !q.difficulty || !q.category
              );
              if (invalidQuestions.length > 0) {
                console.error('Invalid coding questions found:', invalidQuestions);
                return;
              }
            }

            // Additional validation for video playlists
            if (playlist.type === 'video') {
              if (!Array.isArray(playlist.videos) || playlist.videos.length === 0) {
                console.error('Video playlist must have at least one video');
                return;
              }
            }

            addPlaylist(playlist);
          }
        });
      } catch (error) {
        console.error('Error refreshing playlists:', error);
      }
    }
  };

  // Add polling effect
  useEffect(() => {
    // Initial refresh
    refreshPlaylists();

    // Set up polling interval
    const pollInterval = setInterval(refreshPlaylists, 1000);

    // Set up storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtubePlaylists' || e.key === 'completedVideos') {
        refreshPlaylists();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [playlists, addPlaylist]);

  // Add visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshPlaylists();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [playlists, addPlaylist]);

  // Add focus handler
  useEffect(() => {
    const handleFocus = () => {
      refreshPlaylists();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [playlists, addPlaylist]);

  // Filter playlists by type and search query (title only)
  const filteredPlaylists = playlists
    .filter(playlist => !playlist.title.toLowerCase().includes('y combinator'))
    .filter(playlist => 
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  const videoPlaylists = filteredPlaylists.filter(playlist => playlist.type === 'video');
  const codingPlaylists = filteredPlaylists.filter(playlist => playlist.type === 'coding');
  const audiobookPlaylists = filteredPlaylists.filter(playlist => playlist.type === 'audiobook');

  // 1. Add a new filtered list for completed playlists
  const completedPlaylists = filteredPlaylists.filter(playlist => {
    if (playlist.type === 'video') {
      return playlist.videos && playlist.videos.length > 0 && playlist.videos.every(v => v.progress >= 100);
    }
    if (playlist.type === 'coding') {
      return playlist.codingQuestions && playlist.codingQuestions.length > 0 && playlist.codingQuestions.every(q => q.solved);
    }
    if (playlist.type === 'audiobook') {
      return playlist.audiobooks && playlist.audiobooks.length > 0 && playlist.audiobooks.every(a => a.progress >= 100);
    }
    return false;
  });

  return (
    <>
<<<<<<< HEAD
      <style jsx>{`
        html, body {
          overflow: auto !important;
          height: auto !important;
          min-height: 100vh !important;
        }
        .library-page {
          overflow-y: auto !important;
          min-height: 100vh !important;
          height: auto !important;
        }
      `}</style>
      <div className={`library-page min-h-screen transition-colors duration-300 relative overflow-x-hidden overflow-y-auto ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`} style={{ minHeight: '100vh', height: 'auto' }}>
      {/* Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/20 to-purple-400/10 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-300/20 to-pink-300/10 rounded-full blur-2xl z-0" />
      
      <div className="container mx-auto px-4 relative z-10 pt-12 pb-8" style={{ minHeight: '100vh', height: 'auto' }}>
        <div className="flex flex-col" style={{ minHeight: '100vh' }}>
=======
      <style jsx global>{`
        @keyframes perspective {
          0% { perspective: 100px; }
          50% { perspective: 500px; }
          100% { perspective: 100px; }
        }
        .container-loader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transform-style: preserve-3d;
          overflow: hidden;
          transform: translateX(0%);
          animation: perspective 10s ease-in-out infinite;
          z-index: -1;
          pointer-events: none;
        }
        .container-loader,
        .loader {
          height: 100%;
          width: 100%;
        }
        .loader {
          --color-light: rgba(99, 102, 241, 0.4);
          --color-dark: rgba(99, 102, 241, 0.2);
          --color: ${theme === 'dark' ? 'var(--color-dark)' : 'var(--color-light)'};
          --bg-light: rgba(255, 255, 255, 0.9);
          --bg-dark: rgba(15, 23, 42, 0.9);
          position: absolute;
          background-color: ${theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg-light)'};
          background-image: 
            repeating-linear-gradient(transparent 0 40px, var(--color) 41px 42px),
            repeating-linear-gradient(90deg, transparent 0 40px, var(--color) 41px 42px);
          transform: rotateX(60deg) rotateZ(45deg) scale(1.2);
          top: 0;
          left: 0;
          opacity: ${theme === 'dark' ? '0.9' : '0.7'};
          width: 200%;
          height: 200%;
          background-size: 80px 80px;
        }
        @media (max-width: 768px) {
          .loader {
            background-size: 60px 60px;
          }
        }
      `}</style>
      <div className="min-h-screen relative overflow-hidden">
        {/* 3D Grid Loader Background */}
        <div className="fixed inset-0 z-0">
          <div className="container-loader">
            <div className="loader"></div>
          </div>
          <div className={`absolute inset-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-950/95' 
              : 'bg-gradient-to-br from-slate-50/95 via-blue-50/95 to-indigo-100/95'
          }`}></div>
        </div>
      <div className="container mx-auto px-4 relative z-10 pt-16 pb-12">
        <div className="flex flex-col">
>>>>>>> 6d8b3b158afab72ad3e68843d1c0f38eae80cd67
          {playlists.length > 0 && (
            <div className="flex flex-col flex-1">
              <div className="flex flex-col flex-1">
                <div className="flex flex-col items-center w-full mb-8">
                  <div className="w-full max-w-4xl mx-auto flex items-center justify-center gap-3 transition-all duration-300">
                    <div className="relative group flex-1">
                      <input
                        type="text"
                        placeholder="Search by playlist name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-10 pr-4 py-3 rounded-xl border-2 w-[32rem] ${
                          theme === 'dark' 
                            ? 'bg-slate-800/70 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' 
                            : 'bg-white/90 border-slate-200 text-gray-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                        } transition-all duration-300 shadow-lg text-base focus:w-full hover:w-full`}
                      />
                      <svg 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    </div>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Notifications"
                    >
                      <svg 
                        className="h-6 w-6 text-gray-500 dark:text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                  {showNotifications && (
                    <div className="absolute top-24 right-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Notifications</h3>
                          <button 
                            onClick={() => setUnreadCount(0)}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm">New playlist added: <span className="font-medium">React Tutorials</span></p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                        </div>
                        <div className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm">Your playlist <span className="font-medium">JavaScript Basics</span> has been updated</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                        </div>
                        <div className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">
                          <p className="text-sm">Weekly progress report is ready</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
                        </div>
                      </div>
                      <div className="p-3 text-center border-t border-slate-200 dark:border-slate-700">
                        <button className="text-sm text-blue-500 hover:underline">View all notifications</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mb-6">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="relative overflow-hidden group transition-all duration-300 shadow-xl rounded-full px-6 py-2 text-base font-semibold bg-white text-black hover:bg-black hover:text-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <Plus className="w-4 h-4 mr-2 text-black group-hover:text-white transition-colors" />
                    Add Content
                  </Button>
                </div>
                <div className="flex justify-center w-full px-4">
                  <Tabs defaultValue="all" className="w-full max-w-5xl animate-fade-in-up">
                    <TabsList className="w-full flex justify-between gap-1 p-1.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-lg border border-slate-200 dark:border-slate-700">
                      <TabsTrigger 
                        value="all"
                        className="relative flex-1 px-6 py-3 text-base font-medium transition-all duration-300 ease-out rounded-lg group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 group-data-[state=active]:opacity-100 opacity-0 transition-opacity"></span>
                          <span>All Content</span>
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg opacity-0 group-data-[state=active]:opacity-100 transition-all duration-300 -z-10 scale-95 group-hover:opacity-10 group-data-[state=active]:scale-100" />
                      </TabsTrigger>
                      <TabsTrigger 
                        value="videos"
                        className="relative flex-1 px-6 py-3 text-base font-medium transition-all duration-300 ease-out rounded-lg group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 group-data-[state=active]:opacity-100 opacity-0 transition-opacity"></span>
                          <span>Video Playlists</span>
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg opacity-0 group-data-[state=active]:opacity-100 transition-all duration-300 -z-10 scale-95 group-hover:opacity-10 group-data-[state=active]:scale-100" />
                      </TabsTrigger>
                      <TabsTrigger 
                        value="coding"
                        className="relative flex-1 px-6 py-3 text-base font-medium transition-all duration-300 ease-out rounded-lg group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500 group-data-[state=active]:opacity-100 opacity-0 transition-opacity"></span>
                          <span>Coding Practice</span>
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-lg opacity-0 group-data-[state=active]:opacity-100 transition-all duration-300 -z-10 scale-95 group-hover:opacity-10 group-data-[state=active]:scale-100" />
                      </TabsTrigger>
                      <TabsTrigger 
                        value="audiobooks"
                        className="relative flex-1 px-6 py-3 text-base font-medium transition-all duration-300 ease-out rounded-lg group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 group-data-[state=active]:opacity-100 opacity-0 transition-opacity"></span>
                          <span>Audiobooks</span>
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg opacity-0 group-data-[state=active]:opacity-100 transition-all duration-300 -z-10 scale-95 group-hover:opacity-10 group-data-[state=active]:scale-100" />
                      </TabsTrigger>
                      <TabsTrigger 
                        value="complete"
                        className="relative flex-1 px-6 py-3 text-base font-medium transition-all duration-300 ease-out rounded-lg group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 group-data-[state=active]:opacity-100 opacity-0 transition-opacity"></span>
                          <span>Complete</span>
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg opacity-0 group-data-[state=active]:opacity-100 transition-all duration-300 -z-10 scale-95 group-hover:opacity-10 group-data-[state=active]:scale-100" />
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
                        {filteredPlaylists.map((playlist, index) => (
                          <div key={playlist.id} className="w-full transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 30}ms`}}>
                            <PlaylistCard
                              playlist={playlist}
                              onDelete={deletePlaylist}
                              delay={index * 30}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="videos" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
                        {videoPlaylists.map((playlist, index) => (
                          <div key={playlist.id} className="w-full transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 30}ms`}}>
                            <PlaylistCard
                              playlist={playlist}
                              onDelete={deletePlaylist}
                              delay={index * 30}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="coding" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
                        {codingPlaylists.map((playlist, index) => (
                          <div key={playlist.id} className="w-full transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 30}ms`}}>
                            <PlaylistCard
                              playlist={playlist}
                              onDelete={deletePlaylist}
                              delay={index * 30}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="audiobooks" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
                        {audiobookPlaylists.length > 0 ? (
                          audiobookPlaylists.map((playlist, index) => (
                            <div key={playlist.id} className="w-full transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 30}ms`}}>
                              <PlaylistCard
                                playlist={playlist}
                                onDelete={deletePlaylist}
                                delay={index * 30}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-12 col-span-3">No audiobook playlists found. Create one to get started!</div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="complete" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
                        {completedPlaylists.length > 0 ? (
                          completedPlaylists.map((playlist, index) => (
                            <div key={playlist.id} className="w-full transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 30}ms`}}>
                              <PlaylistCard
                                playlist={playlist}
                                onDelete={deletePlaylist}
                                delay={index * 30}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-12 col-span-3">No completed playlists yet.</div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
        {playlists.length === 0 && (
          <Card className={`mt-12 max-w-2xl mx-auto animate-fade-in-up ${
            theme === 'dark'
              ? 'bg-slate-800/60 backdrop-blur-md border-slate-700'
              : 'bg-white/80 backdrop-blur-md border-0'
          } shadow-xl transition-all duration-300`}>
            <CardContent className="py-20 text-center flex flex-col items-center">
              {/* Placeholder for engaging illustration */}
              <div className="mb-6">
                <svg width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#6366F1" fillOpacity="0.08"/><rect x="30" y="50" width="60" height="30" rx="8" fill="#6366F1" fillOpacity="0.15"/><rect x="45" y="40" width="30" height="10" rx="4" fill="#6366F1" fillOpacity="0.25"/></svg>
              </div>
              <h3 className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Start Your Learning Journey</h3>
              <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Create your first playlist to track videos and coding problems</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="relative overflow-hidden group transition-all duration-300 shadow-lg rounded-full px-4 py-1 text-base font-semibold bg-white text-black hover:bg-black hover:text-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <Plus className="w-4 h-4 mr-2 text-black group-hover:text-white transition-colors" />
                Create Content
              </Button>
            </CardContent>
          </Card>
        )}
        <AddPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addPlaylist}
        />
      </div>
<<<<<<< HEAD
    </div>
=======
      </div>
>>>>>>> 6d8b3b158afab72ad3e68843d1c0f38eae80cd67
    </>
  );
};

export default Library;