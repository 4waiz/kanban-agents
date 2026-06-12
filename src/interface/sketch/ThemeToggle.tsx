import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../lib/theme';

/** Day/night switch — square sketch track, round knob (the one round thing). */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="relative inline-flex h-9 w-16 shrink-0 items-center px-1 focus-visible:[outline:3px_solid_var(--stroke)] focus-visible:outline-offset-4"
      style={{
        background: 'var(--bg-base)',
        border: '3px solid var(--stroke)',
        borderRadius: 0,
        boxShadow: '3px 3px 0 0 var(--stroke)',
      }}
    >
      <Sun
        size={14}
        className="absolute left-2"
        style={{ color: 'var(--fg-base)', opacity: isDark ? 0.3 : 1 }}
        strokeWidth={2.5}
      />
      <Moon
        size={13}
        className="absolute right-2"
        style={{ color: 'var(--fg-base)', opacity: isDark ? 1 : 0.3 }}
        strokeWidth={2.5}
      />
      <motion.span
        className="relative z-[1] block h-5 w-5 rounded-full"
        style={{ background: 'var(--fg-base)' }}
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      />
    </button>
  );
}
