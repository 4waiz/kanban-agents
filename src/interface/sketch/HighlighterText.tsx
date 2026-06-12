import type { ReactNode } from 'react';
import { useTheme } from '../../lib/theme';
import { seedFromChildren, seededFloat } from '../../lib/sketch';

type Color = 'yellow' | 'mint' | 'pink';

interface HighlighterTextProps {
  children: ReactNode;
  color?: Color;
}

const LIGHT: Record<Color, string> = {
  yellow: '#FFE34D',
  mint: '#C8F0D8',
  pink: '#FFC2DD',
};
const DARK: Record<Color, string> = {
  yellow: '#00E0FF',
  mint: '#FF4D9E',
  pink: '#FF4D9E',
};

/** Wraps a word in a skewed, imperfect marker swipe blob behind the text. */
export function HighlighterText({ children, color = 'yellow' }: HighlighterTextProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const swipe = isDark ? DARK[color] : LIGHT[color];
  const seed = seedFromChildren(children);
  const skew = -3 + seededFloat(seed) * 4; // -3..1deg
  const top = 8 + seededFloat(seed, 't') * 14; // % from top

  return (
    <span className="relative inline-block">
      <span
        aria-hidden
        className="absolute left-[-4px] right-[-4px] z-0"
        style={{
          top: `${top}%`,
          bottom: '6%',
          background: swipe,
          transform: `skewX(${skew}deg) rotate(${skew * 0.2}deg)`,
          borderRadius: '40% 60% 55% 45% / 50%',
        }}
      />
      <span className="relative z-[1]" style={{ color: '#0A0A0A' }}>
        {children}
      </span>
    </span>
  );
}
