import { motion } from 'framer-motion';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
import {
  isLightAccent,
  pickAccent,
  pickAccentHex,
  seedFromChildren,
  seededRotation,
} from '../../lib/sketch';

type Variant = 'default' | 'filled' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface SketchButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  rotate?: number;
  seed?: string;
}

const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

/**
 * Hand-drawn button: hatched overlay fades in on hover, stiff spring, seeded
 * rotation. font-marker uppercase tracked.
 */
export const SketchButton = forwardRef<HTMLButtonElement, SketchButtonProps>(
  function SketchButton(
    { children, variant = 'default', size = 'md', rotate, seed, className, disabled, ...rest },
    ref,
  ) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textSeed = seed ?? seedFromChildren(children);
    const tilt = rotate ?? seededRotation('btn' + textSeed, 0.5);
    const accent = pickAccent(textSeed);
    const accentHex = pickAccentHex(textSeed);

    let bg = 'transparent';
    let fg = 'var(--fg-base)';
    let border = '3px solid var(--stroke)';

    if (variant === 'filled') {
      if (isDark) {
        bg = accentHex;
        fg = isLightAccent(accent) ? '#0A0A0A' : '#F5F1E8';
        border = '3px solid #0A0A0A';
      } else {
        bg = 'var(--color-ink)';
        fg = 'var(--color-paper)';
        border = '3px solid var(--color-ink)';
      }
    } else if (variant === 'default') {
      bg = 'var(--bg-base)';
      fg = 'var(--fg-base)';
      border = isDark ? `3px solid ${accentHex}` : '3px solid var(--stroke)';
    } else {
      // ghost
      bg = 'transparent';
      fg = 'var(--fg-base)';
      border = '3px solid transparent';
    }

    const shadowColor =
      variant === 'filled' && isDark ? '#0A0A0A' : 'var(--stroke)';
    const restShadow =
      variant === 'ghost' ? 'none' : `4px 4px 0 0 ${shadowColor}`;
    const hoverShadow =
      variant === 'ghost' ? 'none' : `6px 6px 0 0 ${shadowColor}`;
    const tapShadow =
      variant === 'ghost' ? 'none' : `2px 2px 0 0 ${shadowColor}`;

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2 overflow-hidden font-marker uppercase tracking-[1px] leading-none select-none',
          'focus-visible:[outline:3px_solid_var(--stroke)] focus-visible:outline-offset-4',
          disabled && 'opacity-40 pointer-events-none',
          SIZE[size],
          className,
        )}
        style={{
          background: bg,
          color: fg,
          border,
          borderRadius: 0,
          rotate: `${tilt}deg`,
          boxShadow: restShadow,
        }}
        initial={false}
        whileHover={disabled ? undefined : { y: -2, x: -2, boxShadow: hoverShadow }}
        whileTap={disabled ? undefined : { y: 1, x: 1, boxShadow: tapShadow }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        {...(rest as object)}
      >
        {/* hatched overlay fades in on hover */}
        <span
          className="hatched pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-15"
          aria-hidden
        />
        <span className="relative z-[1] inline-flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  },
);
