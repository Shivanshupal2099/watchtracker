import { Home, User, Library, Settings, CheckSquare, School, Sparkles, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import bridgelabLogo from '../assets/bridgelab_logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/5 to-cyan-500/5',
    hoverGradient: 'from-blue-500/10 to-cyan-500/10',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Library',
    url: '/library',
    icon: Library,
    gradient: 'from-purple-500 to-fuchsia-500',
    bgGradient: 'from-purple-500/5 to-fuchsia-500/5',
    hoverGradient: 'from-purple-500/10 to-fuchsia-500/10',
    glow: 'shadow-purple-500/20',
  },
  {
    title: 'Classroom',
    url: '/classroom',
    icon: School,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/5 to-teal-500/5',
    hoverGradient: 'from-emerald-500/10 to-teal-500/10',
    glow: 'shadow-emerald-500/20',
  },
  {
    title: 'BridgeLab',
    url: '/bridgelab',
    icon: Sparkles,
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-400/5 to-orange-500/5',
    hoverGradient: 'from-amber-400/10 to-orange-500/10',
    glow: 'shadow-amber-400/20',
    customIcon: bridgelabLogo,
  },
  {
    title: 'To-Do',
    url: '/todo',
    icon: CheckSquare,
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/5 to-pink-500/5',
    hoverGradient: 'from-rose-500/10 to-pink-500/10',
    glow: 'shadow-rose-500/20',
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
    gradient: 'from-violet-500 to-indigo-500',
    bgGradient: 'from-violet-500/5 to-indigo-500/5',
    hoverGradient: 'from-violet-500/10 to-indigo-500/10',
    glow: 'shadow-violet-500/20',
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile Footer Navigation (always visible on small screens)
  const MobileFooter = () => (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center py-2 z-50 md:hidden">
      {menuItems.map((item) => (
        <button
          key={item.title}
          onClick={() => navigate(item.url)}
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1",
            location.pathname === item.url
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-500 dark:text-zinc-400"
          )}
        >
          {item.customIcon ? (
            <img src={item.customIcon} alt={item.title} className="w-6 h-6" />
          ) : (
            <item.icon className="w-6 h-6" />
          )}
          <span className="text-xs mt-1">{item.title}</span>
        </button>
      ))}
    </nav>
  );

  // Only show sidebar on desktop/tablet
  if (isMobile) {
    return <MobileFooter />;
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-sidebar to-sidebar/80 backdrop-blur-md text-sidebar-foreground border-r border-sidebar-border/20 shadow-2xl",
          "overflow-y-auto overflow-x-hidden scrollbar-hide",
          "md:flex",
          "w-24"
        )}
      >


        <SidebarContent className="flex-1 flex flex-col items-center justify-between py-6 px-2">
          {menuItems.map((item) => (
            <SidebarMenu key={item.title} className="w-full">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate(item.url)}
                  className={cn(
                    "group relative w-14 h-14 rounded-2xl flex items-center justify-center mx-auto",
                    "transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    location.pathname === item.url 
                      ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg ${item.glow}`
                      : `hover:bg-foreground/5 text-foreground/70`,
                    "border border-transparent hover:border-foreground/10"
                  )}
                  onMouseEnter={() => setActiveHover(item.title)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  {item.customIcon ? (
                    <div className="relative">
                      <img 
                        src={item.customIcon} 
                        alt={item.title} 
                        className={cn(
                          "w-5 h-5 transition-all duration-300",
                          location.pathname === item.url 
                            ? 'brightness-0 invert opacity-100' 
                            : 'opacity-80 group-hover:opacity-100',
                          activeHover === item.title && 'scale-110'
                        )}
                      />
                    </div>
                  ) : (
                    <item.icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        location.pathname === item.url 
                          ? 'text-white' 
                          : 'text-foreground/80 group-hover:text-foreground',
                        activeHover === item.title && 'scale-110'
                      )} 
                    />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ))}
        </SidebarContent>

        <SidebarFooter className="flex flex-col items-center p-4">
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "group/settings relative w-12 h-12 rounded-xl flex items-center justify-center",
              "text-foreground/70 hover:text-foreground transition-all duration-200",
              location.pathname === '/settings' 
                ? 'bg-foreground/10 text-foreground' 
                : 'hover:bg-foreground/5'
            )}
            onMouseEnter={() => setActiveHover('settings')}
            onMouseLeave={() => setActiveHover(null)}
          >
            <Settings className="w-5 h-5" />
          </button>
        </SidebarFooter>
      </div>
    </>
  );
}
