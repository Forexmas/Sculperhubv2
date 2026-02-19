import React, { useEffect, useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'blue' | 'green' | 'yellow' | 'dark' | 'emerald';
  rightElement?: React.ReactNode;
  footer?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subValue,
  icon: Icon,
  variant = 'blue',
  rightElement,
  footer
}) => {
  const [animate, setAnimate] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    // Check if value has changed to trigger animation
    if (prevValue.current !== value) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500); // 500ms animation duration
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  // Color mappings based on screenshot
  const getStyles = () => {
    switch(variant) {
      case 'blue':
        return 'bg-[#0284c7] text-white border-none'; // Solid Blue
      case 'green':
        return 'bg-[#10b981] text-white border-none'; // Solid Green (Accumulating)
      case 'yellow':
        return 'bg-[#eab308] text-white border-none'; // Solid Yellow (Plan)
      case 'emerald':
        return 'bg-[#34d399] text-white border-none'; // Bright Green (Profit)
      case 'dark':
      default:
        return 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-[#334155] text-white';
    }
  };

  return (
    <div className={`rounded-lg p-5 relative overflow-hidden shadow-lg transition-transform duration-200 ${getStyles()}`}>
      {/* Update Flash Effect */}
      <div 
        className={`absolute inset-0 bg-white/20 pointer-events-none transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${variant === 'dark' ? 'text-gray-400' : 'text-white/90'}`}>
            {title}
          </p>
          <h3 className={`text-2xl font-bold tracking-tight transition-all duration-300 origin-left ${animate ? 'scale-110 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`}>
            {value}
          </h3>
          {subValue && (
            <p className={`text-xs mt-1 font-mono ${variant === 'dark' ? 'text-gray-500' : 'text-white/80'}`}>
              {subValue}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={`p-2 rounded-lg transition-transform duration-300 ${animate ? 'scale-125 rotate-12' : ''} ${variant === 'dark' ? 'bg-[#334155]/50' : 'bg-white/20'}`}>
            <Icon size={20} className="text-white" />
          </div>
        )}

        {rightElement && (
            <div className="text-right">
                {rightElement}
            </div>
        )}
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
            {footer}
        </div>
      )}
    </div>
  );
};

export default StatCard;