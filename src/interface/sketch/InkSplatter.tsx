interface InkSplatterProps {
  variant?: 1 | 2 | 3;
  size?: number;
  color?: string;
  className?: string;
}

const PATHS: Record<number, string> = {
  1: 'M30 8c6 2 9 8 7 14s2 10-4 13-14 1-17-5-4-15 2-20 9-9 12-2z',
  2: 'M20 5c8-3 18 1 19 10s-3 16-12 18-19-2-21-11 6-14 14-17z',
  3: 'M25 6c7 0 14 5 14 13s-3 17-12 18-16-6-15-15 6-16 13-16z',
};

/** Decorative ink splatter SVG flourish. */
export function InkSplatter({
  variant = 1,
  size = 48,
  color = 'var(--stroke)',
  className,
}: InkSplatterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      className={className}
      aria-hidden
    >
      <path d={PATHS[variant]} fill={color} opacity={0.9} />
      <circle cx={42} cy={12} r={2.4} fill={color} />
      <circle cx={8} cy={40} r={1.8} fill={color} />
      <circle cx={44} cy={36} r={1.4} fill={color} />
    </svg>
  );
}
