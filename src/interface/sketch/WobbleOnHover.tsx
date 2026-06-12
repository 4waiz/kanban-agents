import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Intensity = 'subtle' | 'normal' | 'strong';

const SEQ: Record<Intensity, number[]> = {
  subtle: [0, -1.5, 1.5, -1, 1, 0],
  normal: [0, -3, 3, -2, 2, 0],
  strong: [0, -5, 5, -3, 3, 0],
};

export function WobbleOnHover({
  children,
  intensity = 'normal',
  className,
}: {
  children: ReactNode;
  intensity?: Intensity;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ rotate: SEQ[intensity] }}
      transition={{ duration: 0.5 }}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.div>
  );
}
