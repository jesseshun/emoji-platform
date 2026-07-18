'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const positionStyles = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-4px)', marginBottom: '6px' },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(4px)', marginTop: '6px' },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-4px)', marginRight: '6px' },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(4px)', marginLeft: '6px' },
};

export function Tooltip({ content, children, side = 'top', delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`
            absolute z-dropdown pointer-events-none whitespace-nowrap
            px-2.5 py-1.5 text-xs font-medium rounded-lg
            bg-text-primary text-inverse animate-fade-in
            shadow-md
          `}
          style={positionStyles[side]}
        >
          {content}
        </span>
      )}
    </span>
  );
}
