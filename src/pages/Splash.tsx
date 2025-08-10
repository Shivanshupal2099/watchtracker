import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importing the univora.png logo from assets
import logo from '../assets/univora.png';

const Splash = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger load animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Navigate after delay
    const navTimer = setTimeout(() => {
      navigate('/profile');
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-white transition-colors duration-1000 ${isLoaded ? 'bg-white' : 'bg-gray-50'}`}>
      {/* Main Content */}
      <div className="relative z-10 text-center px-6 w-full max-w-sm">
        {/* Logo */}
        <div className={`mb-8 transform transition-all duration-1000 ${isLoaded ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}`}>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white shadow-lg flex items-center justify-center">
            <img 
              src={logo}
              alt="WatchTracker"
              className="w-24 h-24 object-contain"
            />
          </div>
          
      
          <div className="flex items-center justify-center space-x-1 mb-8 h-8">
            {['learn', 'Discover', 'Build', 'Grow'].map((word, index) => (
              <span 
                key={index}
                className="inline-block text-blue-600 font-medium"
                style={{
                  opacity: 0,
                  transform: 'translateY(10px)',
                  animation: `fadeInUp 0.5s ease-out forwards ${index * 0.2 + 0.3}s`
                }}
              >
                {index > 0 && <span className="text-gray-400 mx-1">•</span>}
                {word}
              </span>
            ))}
          </div>
          <style jsx>{`
            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>

        {/* Loading Indicator */}
        <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
          <div 
            className={`absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300 ease-out ${isLoaded ? 'w-full' : 'w-0'}`}
            style={{
              transitionDuration: '2800ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        {[...Array(16)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-50"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4,
              filter: 'blur(40px)',
              transform: `scale(${isLoaded ? 1 : 0.5})`,
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>

      {/* Subtle Grid */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
};

export default Splash;