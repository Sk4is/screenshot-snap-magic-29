import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface NavbarProps {
  theme: Theme;
  cartCount: number;
  onLogoClick: () => void;
}

const links = ['FLAVORS', 'ABOUT', 'SHOP'] as const;

export default function Navbar({ theme, cartCount, onLogoClick }: NavbarProps) {
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y > lastY && y > 120) setHidden(true);
      else setHidden(false);
      setLastY(y);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  const color = theme === 'light' ? 'text-ink' : 'text-white';
  const muted = theme === 'light' ? 'text-ink/55' : 'text-white/55';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${color} ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <nav className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <button
          onClick={onLogoClick}
          className="font-display text-sm font-bold tracking-[0.28em] sm:text-base"
        >
          SKYY FIZZ
        </button>
        <ul className="flex items-center gap-5 text-[10px] font-semibold tracking-[0.2em] sm:gap-8 sm:text-xs">
          {links.map((l) => (
            <li key={l}>
              <a href="#" className={`nav-underline ${muted} hover:${color} transition-colors`}>
                {l}
              </a>
            </li>
          ))}
          <li className={`pl-2 ${color}`}>
            <a href="#" className="nav-underline">
              CART ({cartCount})
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
