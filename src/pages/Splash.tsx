import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { BookOpen, Lightbulb, TrendingUp, Zap, Sparkles } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    const navTimer = setTimeout(() => {
      navigate('/profile');
    }, 5000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearTimeout(navTimer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)]
              } 0%, transparent 70%)`,
              animationDuration: `${Math.random() * 20 + 20}s`,
              animationDelay: `${Math.random() * 10}s`,
              filter: 'blur(40px)'
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-4xl px-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          <div className="relative inline-block mb-10">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
            <div className="relative bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20">
              <img 
                src={logo}
                alt="WatchTracker"
                className="w-36 h-36 object-contain mx-auto"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-1.5 bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-pink-400/30 rounded-full"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 leading-tight">
            Transform Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Learning Journey</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { 
                text: 'Learn', 
                icon: <BookOpen className="w-6 h-6" />, 
                color: 'from-blue-500 to-blue-600',
                delay: '0.2s'
              },
              { 
                text: 'Discover', 
                icon: <Lightbulb className="w-6 h-6" />, 
                color: 'from-purple-500 to-pink-600',
                delay: '0.4s'
              },
              { 
                text: 'Build', 
                icon: <Zap className="w-6 h-6" />, 
                color: 'from-amber-500 to-orange-600',
                delay: '0.6s'
              },
              { 
                text: 'Grow', 
                icon: <TrendingUp className="w-6 h-6" />, 
                color: 'from-emerald-500 to-teal-600',
                delay: '0.8s'
              },
            ].map((item, index) => (
              <div 
                key={index}
                className="relative group"
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out forwards ${item.delay}`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative p-4 h-full">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{item.text}</h3>
                  <div className="h-1 w-8 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 mx-auto my-2 group-hover:w-12 transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Your journey starts here</span>
                </div>
                <p className="text-gray-700 mb-6">
                  Unlock your potential with our powerful learning platform designed to help you achieve your goals faster and more effectively.
                </p>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'gradientShift 2s ease infinite'
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Loading your experience... {progress}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, 20px) rotate(5deg); }
          50% { transform: translate(0, 40px) rotate(0deg); }
          75% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        /* Smooth scrolling and selection */
        * {
          -webkit-tap-highlight-color: transparent;
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Splash;