import { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, label, icon, color = "from-green-400 via-emerald-500 to-teal-600" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <div className={`bg-gradient-to-br ${color} rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden hover-lift`}>
      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="text-6xl mb-2 animate-bounce-slow">{icon}</div>
        <div className="text-5xl font-black mb-2">
          {count.toLocaleString()}
        </div>
        <div className="text-xl opacity-90">{label}</div>
      </div>
    </div>
  );
};

export default AnimatedCounter;
