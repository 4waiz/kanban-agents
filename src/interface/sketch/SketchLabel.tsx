import type { ReactNode } from 'react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
import { pickAccentHex, seedFromChildren } from '../../lib/sketch';
import { SketchArrow } from './SketchArrow';

interface SketchLabelProps {
  children: ReactNode;
  prefix?: boolean;
  arrow?: boolean;
  className?: string;
  seed?: string;
}

/** Small uppercase technical label — the "mono micro-copy" of the system. */
export function SketchLabel({
  children,
  prefix = false,
  arrow = false,
  className,
  seed,
}: SketchLabelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textSeed = seed ?? seedFromChildren(children);
  const asteriskColor = isDark ? pickAccentHex(textSeed) : 'var(--fg-base)';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-sketch uppercase text-[12px] tracking-[1.5px] leading-none',
        className,
      )}
      style={{ color: 'var(--fg-base)' }}
    >
      {prefix && (
        <span
          aria-hidden
          className="text-[14px] leading-none"
          style={{ color: asteriskColor }}
        >
          ✳
        </span>
      )}
      {children}
      {arrow && <SketchArrow direction="right" size={16} animate />}
    </span>
  );
}
