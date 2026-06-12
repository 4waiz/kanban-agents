import { motion } from 'framer-motion';

type Dir = 'up' | 'down' | 'left' | 'right';

interface SketchArrowProps {
  direction?: Dir;
  size?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}

const ROT: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 };

/** Hand-drawn arrow SVG; wobbles on hover when `animate`. */
export function SketchArrow({
  direction = 'right',
  size = 20,
  color = 'var(--stroke)',
  animate = false,
  className,
}: SketchArrowProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ rotate: `${ROT[direction]}deg` }}
      whileHover={animate ? { x: 3 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      aria-hidden
    >
      <path
        d="M3 12 C 8 11.5, 15 12.5, 21 12"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 6 C 18 8.5, 20 10.5, 21 12 C 20 13.5, 18 15.5, 15 18"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.svg>
  );
}
