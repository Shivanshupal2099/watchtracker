import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PlaylistDetail from "./pages/PlaylistDetail";
import PlaylistDetailCoding from "./pages/PlaylistDetailCoding";
import VideoPlayer from "./pages/VideoPlayer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Library from "./pages/Library";
import { SettingsPage } from "./pages/SettingsPage";
import Todo from "./pages/Todo";
import Pomodoro from "./pages/Pomodoro";
import Premium from "./pages/Premium";
import Classroom from "./pages/Classroom";
import Clubs from "./pages/Clubs";
import BridgeLab from "./pages/BridgeLab";
import Launch from "./pages/Launch";
import LandingPage from "./pages/LandingPage";
import AcceleratorLibrary from "./pages/AcceleratorLibrary";
import ViewCreate from './pages/viewCreate';
import FindCoFounder from './pages/FindCoFounder';
import { useState, useEffect } from "react";
import { Playlist } from '@/types/playlist';
import { loadQuestionsFromFile } from './utils/loadQuestions';
import { PlaylistProvider } from '@/context/PlaylistContext';
import { Button } from "@/components/ui/button";
import Shorts from "./pages/Shorts";


import { ArrowLeft } from "lucide-react";

const queryClient = new QueryClient();



const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/create-account', '/landing'].includes(location.pathname);
  const isBridgeLabPage = location.pathname === '/bridgelab';



  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load questions when the app starts
    loadQuestionsFromFile().catch(error => {
      console.error('Failed to load questions:', error);
    });
  }, []);



  return (
    <div className="min-h-screen flex w-full">

      
      {/* Only render sidebar if not auth page and not BridgeLab page */}
      {!isAuthPage && !isBridgeLabPage && <AppSidebar />}
      <main
        className={`flex-1 transition-all duration-300 ${
          !isAuthPage
            ? isBridgeLabPage
              ? 'ml-0 pb-16' // No left margin on BridgeLab, add bottom padding for footer nav
              : !isMobile
              ? 'ml-24' // Sidebar is visible on desktop
              : 'ml-0 pb-16' // No left margin on mobile, add bottom padding for footer nav
            : 'w-full'
        }`}
      >
        <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/library" element={<Library />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/bridgelab" element={<BridgeLab />} />
            <Route path="/launch" element={<Launch />} />
            <Route path="/acceleratorlibrary" element={<AcceleratorLibrary />} />
            <Route path="/view-create" element={<ViewCreate />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/find-cofounder" element={<FindCoFounder />} />
            <Route 
              path="/playlist/:playlistId" 
              element={<PlaylistDetailWrapper />} 
            />
            <Route path="/playlist/:playlistId/play" element={<VideoPlayer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <PlaylistProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <SidebarProvider>
              <AppContent />
            </SidebarProvider>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </PlaylistProvider>
  </ThemeProvider>
);

export default App;

// New component to handle playlist type routing
const PlaylistDetailWrapper = () => {
  const { playlistId } = useParams();
  const [playlistType, setPlaylistType] = useState<'video' | 'coding' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('PlaylistDetailWrapper: Starting playlist lookup for ID:', playlistId);
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    
    if (!savedPlaylists) {
      const errorMsg = 'No playlists found in localStorage';
      console.error('PlaylistDetailWrapper:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      console.log('PlaylistDetailWrapper: Successfully parsed playlists from localStorage:', playlists);
      
      if (!Array.isArray(playlists)) {
        throw new Error('Playlists data is not an array');
      }

      const playlist = playlists.find(p => p.id === playlistId);
      console.log('PlaylistDetailWrapper: Found playlist:', playlist);
      
      if (!playlist) {
        const errorMsg = `No playlist found with ID: ${playlistId}`;
        console.error('PlaylistDetailWrapper:', errorMsg);
        console.log('PlaylistDetailWrapper: Available playlist IDs:', playlists.map(p => p.id));
        setError(errorMsg);
        return;
      }

      if (!playlist.type) {
        const errorMsg = `Playlist ${playlistId} has no type specified`;
        console.error('PlaylistDetailWrapper:', errorMsg);
        setError(errorMsg);
        return;
      }

      console.log('PlaylistDetailWrapper: Setting playlist type to:', playlist.type);
      setPlaylistType(playlist.type);
      setError(null);
    } catch (error) {
      const errorMsg = `Error parsing playlists from localStorage: ${error}`;
      console.error('PlaylistDetailWrapper:', errorMsg);
      setError(errorMsg);
    }
  }, [playlistId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/library')} className="mt-10 px-6 py-2 rounded-full bg-white text-black border border-black shadow-lg flex items-center gap-2 text-lg font-semibold hover:bg-black hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black">
            <ArrowLeft className="w-6 h-6 mr-2 text-black group-hover:text-white transition-colors" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  if (!playlistType) {
    console.log('PlaylistDetailWrapper: Still loading playlist type...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading playlist...</p>
        </div>
      </div>
    );
  }

  console.log('PlaylistDetailWrapper: Rendering component for playlist type:', playlistType);
  return playlistType === 'coding' ? <PlaylistDetailCoding /> : <PlaylistDetail />;
};
