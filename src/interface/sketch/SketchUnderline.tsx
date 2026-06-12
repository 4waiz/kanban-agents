import { motion } from 'framer-motion';

interface SketchUnderlineProps {
  color?: string;
  animate?: boolean;
  width?: number | string;
  className?: string;
}

/** Inline wavy underline that overshoots both ends; draws on mount if animate. */
export function SketchUnderline({
  color = 'var(--stroke)',
  animate = true,
  width = '100%',
  className,
}: SketchUnderlineProps) {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      width={width}
      height={12}
      fill="none"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M2 7 C 40 3, 70 10, 110 6 C 150 2, 180 9, 198 6"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        initial={animate ? { pathLength: 0 } : false}
        whileInView={animate ? { pathLength: 1 } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
