import { Home, User, Library, Settings, CheckSquare, School, Sparkles, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import univoraLogo from '../assets/univora.png';
import univoralabLogo from '../assets/univoralab.png';
// Logos are now available as univoraLogo and univoralabLogo
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
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
    title: 'UnivoraLab',
    url: '/bridgelab',
    icon: Sparkles,
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-400/5 to-orange-500/5',
    hoverGradient: 'from-amber-400/10 to-orange-500/10',
    glow: 'shadow-amber-400/20',
    customIcon: univoralabLogo,
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
  const [isHovered, setIsHovered] = useState(false);

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
        {/* Minimalist Logo Header */}
        <SidebarHeader 
          className="relative flex items-center justify-center h-28 px-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div 
            className="group/logo relative"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            {/* Logo with subtle hover effects */}
            <motion.div
              className="relative z-10 p-3"
              whileHover={{
                y: -2,
                transition: { duration: 0.2 }
              }}
            >
              <img 
                src={univoraLogo} 
                alt="UnivoraLab Logo" 
                className={cn(
                  "w-16 h-16 object-contain transition-all duration-300",
                  "group-hover/logo:scale-110 group-hover/logo:rotate-6",
                  "drop-shadow-lg"
                )}
              />
              
              {/* Glow effect on hover */}
              <motion.div 
                className="absolute inset-0 rounded-full opacity-0 group-hover/logo:opacity-100 -z-10"
                style={{
                  background: 'radial-gradient(circle at center, rgba(96, 165, 250, 0.2) 0%, rgba(96, 165, 250, 0) 70%)',
                }}
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.5 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
            
            {/* Subtle dot indicator for active state */}
            <motion.div 
              className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover/logo:opacity-100"
              initial={{ x: '-50%', scale: 0 }}
              whileHover={{ 
                scale: 1,
                y: -2,
                transition: { 
                  type: 'spring',
                  stiffness: 500,
                  damping: 20
                }
              }}
            />
          </motion.div>
          
          {/* App Name Tooltip */}
          {isHovered && (
            <motion.div 
              className="absolute left-24 ml-2 bg-foreground/90 text-background px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap shadow-lg"
              initial={{ opacity: 0, x: -5 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { 
                  type: 'spring',
                  stiffness: 500,
                  damping: 25
                }
              }}
              exit={{ opacity: 0, x: -5 }}
            >
              <div className="absolute left-0 top-1/2 -ml-1 w-2 h-2 bg-foreground/90 rotate-45 -translate-y-1/2"></div>
              <span className="relative z-10">EduBridge</span>
            </motion.div>
          )}
        </SidebarHeader>

        <SidebarContent className="flex-1 flex flex-col items-center py-4 space-y-2 px-2">
          {menuItems.map((item) => (
            <SidebarMenu key={item.title} className="w-full">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate(item.url)}
                  className={cn(
                    "group relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto",
                    "transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95",
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
                          "w-6 h-6 transition-all duration-300",
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
                        "w-6 h-6 transition-all duration-300",
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