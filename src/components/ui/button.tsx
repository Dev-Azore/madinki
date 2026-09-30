import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2e7d32] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          // Variant styling
          variant === 'default' &&
            'bg-[#2e7d32] text-white hover:bg-[#1b5e20] shadow-sm shadow-[#2e7d32]/20 font-bold',
          variant === 'glow' &&
            'bg-gradient-to-r from-[#2e7d32] to-[#1b5e20] text-white font-bold shadow-md shadow-[#2e7d32]/25 hover:shadow-lg hover:shadow-[#2e7d32]/35 hover:scale-[1.01]',
          variant === 'outline' &&
            'border border-slate-300 bg-white text-[#0B2545] hover:bg-slate-50 hover:border-slate-400 shadow-xs font-semibold',
          variant === 'secondary' &&
            'bg-slate-100 text-[#0B2545] hover:bg-slate-200 border border-slate-200/80 font-semibold',
          variant === 'ghost' &&
            'text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 font-medium',
          // Size styling
          size === 'default' && 'h-11 px-5 py-2.5',
          size === 'sm' && 'h-9 px-3 text-xs',
          size === 'lg' && 'h-13 px-8 text-base rounded-2xl',
          size === 'icon' && 'h-10 w-10 p-0',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
