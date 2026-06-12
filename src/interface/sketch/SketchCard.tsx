import { motion } from 'framer-motion';
import rough from 'roughjs/bin/rough';
import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
import {
  pickAccentHex,
  seedFromChildren,
  seededInt,
  seededRotation,
  isLightAccent,
  pickAccent,
} from '../../lib/sketch';

type Variant = 'paper' | 'paper-shadow' | 'inverted';

interface SketchCardProps {
  children: ReactNode;
  variant?: Variant;
  as?: 'div' | 'article' | 'section' | 'li' | 'a';
  rotate?: number;
  seed?: string;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  href?: string;
  style?: React.CSSProperties;
}

/**
 * The workhorse surface: a wavy roughjs rectangle outline over a flat
 * offset-shadow box that lifts on hover and presses on tap.
 */
export function SketchCard({
  children,
  variant = 'paper',
  as = 'div',
  rotate,
  seed,
  className,
  interactive = false,
  onClick,
  href,
  style,
}: SketchCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const textSeed = seed ?? seedFromChildren(children);
  const tilt = rotate ?? seededRotation(textSeed, 0.4);
  const roughSeed = seededInt(textSeed, 9999) + 1;

  // Resolve colors per theme + variant
  const accent = pickAccent(textSeed);
  const accentHex = pickAccentHex(textSeed);

  let bg: string;
  let fg: string;
  let strokeColor: string;
  if (variant === 'inverted') {
    if (isDark) {
      bg = accentHex;
      fg = isLightAccent(accent) ? '#0A0A0A' : '#F5F1E8';
      strokeColor = '#0A0A0A';
    } else {
      bg = 'var(--color-ink)';
      fg = 'var(--color-paper)';
      strokeColor = 'var(--color-ink)';
    }
  } else {
    bg = variant === 'paper-shadow' ? 'var(--bg-surface)' : 'var(--bg-base)';
    fg = 'var(--fg-base)';
    strokeColor = 'var(--stroke)';
  }

  // Track size for the roughjs redraw
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () =>
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw the wavy border
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || size.w < 4 || size.h < 4) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    // Resolve the CSS var stroke to a concrete color for roughjs
    const probe = svg.parentElement;
    let resolved = strokeColor;
    if (resolved.startsWith('var') && probe) {
      resolved =
        getComputedStyle(probe).getPropertyValue('--stroke').trim() ||
        (isDark ? '#F5F1E8' : '#0A0A0A');
    }
    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, size.w - 4, size.h - 4, {
      stroke: resolved,
      strokeWidth: 2.2,
      roughness: 1.6,
      bowing: 1.5,
      seed: roughSeed,
    });
    svg.appendChild(node);
  }, [size, strokeColor, roughSeed, isDark]);

  const Comp = motion[as as keyof typeof motion] as ElementType;
  const restShadow = '6px 6px 0 0 ' + (variant === 'inverted' && isDark ? '#0A0A0A' : strokeColor);
  const hoverShadow = '8px 8px 0 0 ' + (variant === 'inverted' && isDark ? '#0A0A0A' : strokeColor);
  const tapShadow = '2px 2px 0 0 ' + (variant === 'inverted' && isDark ? '#0A0A0A' : strokeColor);

  return (
    <Comp
      ref={wrapRef}
      href={href}
      onClick={onClick}
      className={cn('relative', (interactive || onClick) && 'cursor-pointer', className)}
      style={{
        background: bg,
        color: fg,
        borderRadius: 0,
        rotate: `${tilt}deg`,
        boxShadow: restShadow,
        ...style,
      }}
      initial={false}
      whileHover={
        interactive || onClick
          ? { y: -2, x: -2, boxShadow: hoverShadow }
          : undefined
      }
      whileTap={
        interactive || onClick
          ? { y: 1, x: 1, boxShadow: tapShadow }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
    >
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        width={size.w}
        height={size.h}
        aria-hidden
      />
      <div className="relative z-[1] h-full">{children}</div>
    </Comp>
  );
}
